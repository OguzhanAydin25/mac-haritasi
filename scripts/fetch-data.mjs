// API-Football'dan veri çeker, data/cache/ içinde saklar ve sitenin okuduğu data/season.json dosyasını üretir.
// Çalıştırma: API_FOOTBALL_KEY=... node scripts/fetch-data.mjs
// Ayarlar: config.json (sezon, günlük kota planı)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchTeam, KNOWN_TEAMS, KNOWN_STADIUMS, COUNTRY_CODES } from '../src/known.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CFG = JSON.parse(await fs.readFile(path.join(ROOT, 'config.json'), 'utf8'));
const KEY = process.env.API_FOOTBALL_KEY;
const BASE = process.env.API_FOOTBALL_BASE || 'https://v3.football.api-sports.io';
const CACHE = path.join(ROOT, 'data', 'cache');
const OUT = path.join(ROOT, 'data', 'season.json');
const UA = 'mac-haritasi (https://github.com/OguzhanAydin25/mac-haritasi)';

const LEAGUES = { SL: { id: 203, c: 'TR' }, PL: { id: 39, c: 'GB' }, LL: { id: 140, c: 'ES' }, BL: { id: 78, c: 'DE' }, SA: { id: 135, c: 'IT' }, L1: { id: 61, c: 'FR' }, CL: { id: 2, c: null } };
const COUNTRY_NAMES = { TR: 'Türkiye', GB: 'United Kingdom', ES: 'Spain', DE: 'Germany', IT: 'Italy', FR: 'France' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJSON = async (f, d) => { try { return JSON.parse(await fs.readFile(f, 'utf8')); } catch { return d; } };
const writeJSON = async (f, v) => { await fs.mkdir(path.dirname(f), { recursive: true }); await fs.writeFile(f, JSON.stringify(v)); };

// ---------- API
let remaining = Infinity, used = 0;
async function api(endpoint, params) {
  if (!KEY) throw new Error('API_FOOTBALL_KEY tanımlı değil');
  if (remaining <= CFG.reserve) throw new Error(`Günlük kota bitmek üzere (kalan ${remaining}), duruyorum`);
  const url = new URL(BASE + endpoint);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { 'x-apisports-key': KEY } });
    used++;
    const rem = res.headers.get('x-ratelimit-requests-remaining'); if (rem != null) remaining = +rem;
    if (res.status === 429) { await sleep(7000); continue; }
    if (!res.ok) throw new Error(`${endpoint} HTTP ${res.status}`);
    const j = await res.json();
    const errs = j.errors && (Array.isArray(j.errors) ? j.errors : Object.values(j.errors));
    if (errs && errs.length) {
      const msg = errs.join('; ');
      if (/rate ?limit|too many/i.test(msg)) { await sleep(7000); continue; }
      throw new Error(`${endpoint}: ${msg}`);
    }
    await sleep(+(process.env.API_DELAY_MS ?? CFG.delayMs)); // dakikalık sınır için
    return j.response;
  }
  throw new Error(`${endpoint}: tekrar denemeler başarısız`);
}

async function cached(name, maxAgeDays, fn) {
  const f = path.join(CACHE, name + '.json');
  const c = await readJSON(f, null);
  if (c && (Date.now() - c.at) / 864e5 < maxAgeDays) return c.data;
  try { const data = await fn(); await writeJSON(f, { at: Date.now(), data }); console.log('✓', name); return data; }
  catch (e) { if (c) { console.warn('! ', name, '→ eski önbellek kullanılıyor:', e.message); return c.data; } throw e; }
}

// ---------- konum ve renkler
async function geocode(q) {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q);
  await sleep(1100); // Nominatim: saniyede en fazla 1 istek
  // undefined: ağ hatası (sonra tekrar dene) · null: bulunamadı
  try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) return undefined; const j = await r.json(); return j[0] ? [+j[0].lon, +j[0].lat] : null; }
  catch { return undefined; }
}
async function logoColors(url) {
  try {
    const sharp = (await import('sharp')).default;
    const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
    const { data } = await sharp(buf).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const bins = new Map();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 200) continue;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (r > 232 && g > 232 && b > 232) continue;
      const k = (r >> 5) + ',' + (g >> 5) + ',' + (b >> 5);
      const o = bins.get(k) || { n: 0, r: 0, g: 0, b: 0 }; o.n++; o.r += r; o.g += g; o.b += b; bins.set(k, o);
    }
    const tops = [...bins.values()].sort((a, b) => b.n - a.n).map((o) => [o.r / o.n, o.g / o.n, o.b / o.n]);
    if (!tops.length) return null;
    const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
    const c1 = tops[0], c2 = tops.find((c) => Math.hypot(c[0] - c1[0], c[1] - c1[1], c[2] - c1[2]) > 90);
    return [hex(c1), c2 ? hex(c2) : '#ffffff'];
  } catch { return null; }
}

// ---------- yardımcılar
const roundNum = (lg, s, extra) => {
  const m = /(\d+)\s*$/.exec(s); if (m && /Regular Season|League Stage/i.test(s)) return +m[1];
  const KO = { 'Knockout Round Play-offs': 9, 'Round of 16': 10, 'Quarter-finals': 11, 'Semi-finals': 12, 'Final': 13 };
  if (KO[s]) return KO[s];
  if (!extra.has(s)) extra.set(s, 100 + extra.size); return extra.get(s);
};
const KO_LABEL = { 9: 'Play-off turu', 10: 'Son 16', 11: 'Çeyrek final', 12: 'Yarı final', 13: 'Final' };
function zoneOf(desc) {
  if (!desc) return '';
  const d = desc.toLowerCase();
  if (d.includes('relegation') && !d.includes('play')) return 'rel';
  if (d.includes('champions league')) return d.includes('qualif') ? 'clq' : 'cl';
  if (d.includes('europa league')) return 'el';
  if (d.includes('conference')) return 'ecl';
  if (d.includes('1/8') || d.includes('round of 16')) return 'cl';
  if (d.includes('play-off') || d.includes('playoff')) return 'clq';
  if (d.includes('relegation')) return 'rel';
  return '';
}
const ZONE_TEXT = { cl: 'Şampiyonlar Ligi', clq: 'Şampiyonlar Ligi eleme / play-off', el: 'Avrupa Ligi', ecl: 'Konferans Ligi', rel: 'Küme düşme / play-out' };

// ---------- ana akış
async function main() {
  const season = CFG.season, maxAge = CFG.refreshDays;
  console.log(`Sezon ${season}/${String(season + 1).slice(2)} · kalan kota bilinmiyor, başlıyorum`);
  const raw = {};
  for (const [lg, L] of Object.entries(LEAGUES)) {
    raw[lg] = {
      teams: await cached(`${lg}-teams-${season}`, Math.max(maxAge, 30), () => api('/teams', { league: L.id, season })),
      fixtures: await cached(`${lg}-fixtures-${season}`, maxAge, () => api('/fixtures', { league: L.id, season, timezone: 'Europe/Istanbul' })),
      standings: await cached(`${lg}-standings-${season}`, maxAge, () => api('/standings', { league: L.id, season })),
      scorers: await cached(`${lg}-scorers-${season}`, maxAge, () => api('/players/topscorers', { league: L.id, season })),
    };
  }

  // takımlar ve stadyumlar
  const teams = {}, venues = {};
  const geo = await readJSON(path.join(CACHE, 'geo.json'), {});
  const colors = await readJSON(path.join(CACHE, 'colors.json'), {});
  const teamCountry = {};
  for (const [lg, L] of Object.entries(LEAGUES)) for (const { team, venue } of raw[lg].teams) {
    const id = String(team.id);
    const k = matchTeam(team.name);
    const country = L.c || COUNTRY_CODES[team.country] || null;
    teamCountry[id] = teamCountry[id] || country;
    if (!teams[id]) {
      let c = k ? KNOWN_TEAMS[k].c : colors[id];
      if (!c && team.logo) { c = await logoColors(team.logo); if (c) colors[id] = c; }
      teams[id] = { name: team.name, short: (team.code || team.name.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, '').slice(0, 3)).toUpperCase(), logo: team.logo, c: c || ['#5a6570', '#ffffff'], venue: venue && venue.id, known: k };
    }
    if (venue && venue.id && !venues[venue.id]) venues[venue.id] = { name: venue.name, city: venue.city, cap: venue.capacity, country: teamCountry[id], colors: teams[id].c, homeKnown: k };
  }
  // maçlarda geçen ama takım listesinde olmayan stadyumlar
  for (const lg of Object.keys(LEAGUES)) for (const f of raw[lg].fixtures) {
    const v = f.fixture.venue; if (!v || !v.id || venues[v.id]) continue;
    const ht = teams[f.teams.home.id];
    venues[v.id] = { name: v.name, city: v.city, cap: null, country: teamCountry[String(f.teams.home.id)] || null, colors: ht ? ht.c : ['#5a6570', '#ffffff'], homeKnown: null };
  }
  // konumlar: bilinen stadyum → tablodan; değilse OpenStreetMap (önbellekli)
  const km = (a, b) => { const R = 6371, dLat = (b[1] - a[1]) * Math.PI / 180, dLon = (b[0] - a[0]) * Math.PI / 180, x = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * Math.PI / 180) * Math.cos(b[1] * Math.PI / 180) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  const tokens = (s) => new Set(String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !['stadium', 'stadio', 'estadio', 'stade', 'stadion', 'stadyumu', 'park', 'arena'].includes(w)));
  for (const [vid, v] of Object.entries(venues)) {
    const k = v.homeKnown && KNOWN_TEAMS[v.homeKnown].home;
    const isHome = Object.values(teams).some((t) => t.known === v.homeKnown && String(t.venue) === vid);
    if (geo[vid] === undefined) {
      const cn = COUNTRY_NAMES[v.country] || '';
      let pt = await geocode(`${v.name}, ${v.city || ''}`);
      if (pt === null) pt = await geocode(`${v.city || ''}, ${cn}`);
      if (pt !== undefined) geo[vid] = pt; // ağ hatasında önbelleğe yazma, sonra tekrar dener
      console.log('  konum', v.name, '→', pt ? pt.map((x) => x.toFixed(3)).join(',') : pt === null ? 'bulunamadı' : 'ağ hatası');
    }
    if (k && isHome) {
      const s = KNOWN_STADIUMS[k], kt = tokens(s.name), sameName = [...tokens(v.name)].some((w) => kt.has(w));
      // takım başka bir stada taşınmışsa (ör. geçici stat) bizim modeli kullanma
      if (sameName || !geo[vid] || km(geo[vid], [s.lon, s.lat]) < 1.5) { Object.assign(v, { lat: s.lat, lon: s.lon, known: k, cap: v.cap || s.cap }); continue; }
    }
    if (geo[vid]) { v.lon = geo[vid][0]; v.lat = geo[vid][1]; }
  }
  await writeJSON(path.join(CACHE, 'geo.json'), geo);
  await writeJSON(path.join(CACHE, 'colors.json'), colors);
  for (const v of Object.values(venues)) delete v.homeKnown;

  // maçlar
  const leagues = {}, matches = [];
  for (const [lg] of Object.entries(LEAGUES)) {
    const extra = new Map(), labels = {}, ids = new Set();
    for (const f of raw[lg].fixtures) {
      const r = roundNum(lg, f.league.round, extra);
      labels[r] = lg === 'CL' ? (r <= 8 ? `${r}. maç günü` : KO_LABEL[r] || f.league.round) : (r < 100 ? `${r}. hafta` : f.league.round);
      const d = f.fixture.date; // timezone=Europe/Istanbul ile yerel saat gelir
      matches.push({ id: f.fixture.id, date: d.slice(0, 10), time: d.slice(11, 16), lg, round: r, home: String(f.teams.home.id), away: String(f.teams.away.id),
        venue: f.fixture.venue && f.fixture.venue.id ? f.fixture.venue.id : (teams[f.teams.home.id] || {}).venue, s: f.fixture.status.short, el: f.fixture.status.elapsed, hs: f.goals.home, as: f.goals.away });
      ids.add(String(f.teams.home.id)); ids.add(String(f.teams.away.id));
    }
    const groups = (raw[lg].standings[0] && raw[lg].standings[0].league.standings) || [];
    const rows = groups.length > 1 && lg !== 'CL' ? groups[0] : groups.flat();
    const table = rows.map((r) => ({ t: String(r.team.id), pos: r.rank, p: r.points, o: r.all.played, g: r.all.win, b: r.all.draw, m: r.all.lose, a: r.all.goals.for, y: r.all.goals.against, z: zoneOf(r.description) }));
    const zones = [...new Set(table.map((r) => r.z).filter(Boolean))].map((z) => [z, ZONE_TEXT[z]]);
    const scorers = raw[lg].scorers.slice(0, 20).map((x) => { const s = x.statistics[0]; return { name: x.player.name, team: String(s.team.id), n: s.goals.total || 0, pen: (s.penalty && s.penalty.scored) || 0, apps: s.games.appearences || 0, ast: s.goals.assists || 0 }; });
    leagues[lg] = { id: LEAGUES[lg].id, teams: [...ids], maxRound: Math.max(...matches.filter((m) => m.lg === lg).map((m) => m.round)), roundLabels: labels, table, zones, scorers };
  }

  // gol olayları: kota yettiği kadar, her çalışmada biraz daha
  const evFile = path.join(ROOT, 'data', 'events.json');
  const events = await readJSON(evFile, {});
  const anchor = new Date(); anchor.setUTCFullYear(season + (anchor.getUTCMonth() < 6 ? 1 : 0));
  const todo = matches.filter((m) => ['FT', 'AET', 'PEN'].includes(m.s) && !events[m.id])
    .sort((a, b) => Math.abs(new Date(a.date) - anchor) - Math.abs(new Date(b.date) - anchor));
  let got = 0;
  for (const m of todo) {
    if (got >= CFG.eventsPerRun || remaining <= CFG.reserve + 1) break;
    try {
      const ev = await api('/fixtures/events', { fixture: m.id });
      events[m.id] = ev.filter((e) => e.type === 'Goal' && e.detail !== 'Missed Penalty')
        .map((e) => [e.team.id, e.player && e.player.name, e.time.elapsed, e.time.extra || 0, e.detail === 'Own Goal' ? 'O' : e.detail === 'Penalty' ? 'P' : 'G']);
      got++;
    } catch (e) { console.warn('! olay', m.id, e.message); break; }
  }
  await writeJSON(evFile, events);
  const missing = matches.filter((m) => ['FT', 'AET', 'PEN'].includes(m.s) && !events[m.id]).length;

  const label = `${season}/${String(season + 1).slice(2)}`;
  await writeJSON(OUT, { meta: { season, label, updated: new Date().toISOString(), source: 'API-Football', eventsMissing: missing }, leagues, teams, venues, matches });
  console.log(`Bitti: ${matches.length} maç, ${Object.keys(teams).length} takım, ${Object.keys(venues).length} stadyum. Bu çalışmada ${used} istek; ${got} maçın golleri eklendi, ${missing} maç kaldı. Kalan kota: ${remaining}`);
}

main().catch((e) => { console.error('HATA:', e.message); process.exit(1); });
