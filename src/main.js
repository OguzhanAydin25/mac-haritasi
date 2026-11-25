import { geoMercator, geoPath, geoContains, geoCentroid, geoArea } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import { interpolateZoom } from 'd3-interpolate';
import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';
import { feature } from 'topojson-client';
import TRT from '../geo/tr.topo.json';
import GBT from '../geo/gb.topo.json';
import WT from '../geo/world.topo.json';
import LT from '../geo/lakes.topo.json';
import RT from '../geo/rivers.topo.json';
import EST from '../geo/es.topo.json';
import ESD from '../geo/es_det.topo.json';
import ITT from '../geo/it.topo.json';
import ITD from '../geo/it_det.topo.json';
import FRT from '../geo/fr.topo.json';
import FRD from '../geo/fr_det.topo.json';
import DET from '../geo/de.topo.json';
import { LEAGUES, COUNTRIES, GB_CITIES, GB_REGION_NAMES, PLACE_LABELS, SEA_LABELS } from './data.js';
import { TEAMS, STADIUMS, MATCHES, LEAGUE_TEAMS, CL_TEAMS, ROUNDS, ROUND_LABELS, TABLES, SCORERS, META, SEASON } from './store.js';
import { THEMES, emblem, backdrop } from './theme.js';
import { createViewer } from './stadium3d.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lc = (s) => s.toLocaleLowerCase('tr');

// ---------- coğrafya
const W0 = 1000, H0 = 760;
const proj = geoMercator().fitExtent([[0, 0], [W0, H0]], { type: 'MultiPoint', coordinates: [[-11, 35], [46, 60]] });
const path = geoPath(proj);
const F = {
  world: feature(WT, WT.objects.world).features,
  il: feature(TRT, TRT.objects.il).features,
  ilce: feature(TRT, TRT.objects.ilce).features,
  reg: feature(GBT, GBT.objects.reg).features,
  sub: feature(GBT, GBT.objects.sub).features,
  lakes: feature(LT, LT.objects.lakes).features,
  rivers: feature(RT, RT.objects.rivers).features,
};
const NAME_FIX = { 'Prince Islands': 'Adalar', 'Giresun District': 'Giresun Merkez' };
for (const f of F.ilce) f.properties.d = NAME_FIX[f.properties.d] || f.properties.d.replace(/ merkezi?$/i, ' Merkez');
function largestPoly(f) {
  const g = f.geometry; if (g.type !== 'MultiPolygon') return f;
  let best = null, ba = -1;
  for (const c of g.coordinates) { const p = { type: 'Polygon', coordinates: c }, a = geoArea(p); if (a > ba) { ba = a; best = p; } }
  return { type: 'Feature', geometry: best };
}
const labelPt = (f) => proj(geoCentroid(largestPoly(f)));

// İspanya, İtalya, Fransa, Almanya: ana birim (il/eyalet bölgesi) + üst bölge çizgileri + ilçe ayrıntısı
const ES_FIX = { Alava: 'Álava', Almeria: 'Almería', Avila: 'Ávila', 'Balears, Illes': 'Balear Adaları', Caceres: 'Cáceres', Cadiz: 'Cádiz', Castellon: 'Castellón', Cordoba: 'Córdoba', Coruna: 'A Coruña', Jaen: 'Jaén', Leon: 'León', Malaga: 'Málaga', 'Rioja, La': 'La Rioja' };
const cleanName = (c, n) => {
  if (c === 'ES') return ES_FIX[n] || n;
  if (c === 'DE') return n.replace(/, (Kreisfreie Stadt|Stadtkreis|Stadt)$/, '').replace(/, Landkreis$/, ' (Landkreis)');
  return n;
};
const EXTRA = { ES: { t: EST, d: ESD, lab: 'name' }, FR: { t: FRT, d: FRD, lab: 'city' }, DE: { t: DET, lab: 'city' }, IT: { t: ITT, d: ITD, lab: 'name' } };
for (const [c, cfg] of Object.entries(EXTRA)) {
  cfg.main = feature(cfg.t, cfg.t.objects.main).features;
  cfg.grp = feature(cfg.t, cfg.t.objects.grp).features;
  cfg.det = cfg.d ? feature(cfg.d, cfg.d.objects.det).features : [];
  for (const f of [...cfg.main, ...cfg.det]) f.properties.disp = cleanName(c, f.properties.n);
}
const fc = (fs) => ({ type: 'FeatureCollection', features: fs });

// alanlar
const AREAS = new Map();
for (const f of F.il) {
  const p = f.properties.p;
  AREAS.set('TR:' + p, { id: 'TR:' + p, country: 'TR', name: p, feats: [f], detail: F.ilce.filter((d) => d.properties.p === p) });
}
for (const f of F.reg) {
  const r = f.properties.reg;
  AREAS.set('GB:r:' + r, { id: 'GB:r:' + r, country: 'GB', name: GB_REGION_NAMES[r] || r, feats: [f], detail: F.sub.filter((d) => d.properties.reg === r) });
}
for (const [k, c] of Object.entries(GB_CITIES)) {
  const feats = c.subs ? F.sub.filter((d) => c.subs.includes(d.properties.name)) : F.reg.filter((d) => d.properties.reg === c.region);
  AREAS.set('GB:c:' + k, { id: 'GB:c:' + k, country: 'GB', name: c.name, feats, detail: F.sub.filter((d) => d.properties.reg === c.region), parentRegion: c.region });
}
for (const [c, cfg] of Object.entries(EXTRA)) for (const f of cfg.main) {
  const id = c + ':' + f.properties.n;
  AREAS.set(id, { id, country: c, name: f.properties.disp, group: f.properties.g, feats: [f], detail: cfg.det.filter((d) => d.properties.p === f.properties.n) });
}
for (const a of AREAS.values()) a.bounds = path.bounds(fc(a.feats));
const COUNTRY_BOUNDS = {
  TR: path.bounds(fc(F.il)),
  GB: path.bounds(fc(F.reg.filter((f) => f.properties.nation === 'England' || f.properties.nation === 'Wales'))),
};
for (const [c, cfg] of Object.entries(EXTRA)) COUNTRY_BOUNDS[c] = path.bounds(fc(cfg.main));
const EUROPE_BOUNDS = (() => { const bs = Object.values(COUNTRY_BOUNDS); return [[Math.min(...bs.map((b) => b[0][0])), Math.min(...bs.map((b) => b[0][1]))], [Math.max(...bs.map((b) => b[1][0])), Math.max(...bs.map((b) => b[1][1]))]]; })();

// stadyum konumları → il/ilçe (bilinmeyen yerler için küçük yapay alan)
const ckey = (c) => (COUNTRIES[c] ? c : 'EU');
for (const [id, s] of Object.entries(STADIUMS)) {
  s.id = id; s.xy = proj([s.lon, s.lat]);
  const pt = [s.lon, s.lat];
  let area = null;
  if (s.country === 'TR') {
    const il = F.il.find((f) => geoContains(f, pt)), ilce = F.ilce.find((f) => geoContains(f, pt));
    if (il) area = 'TR:' + il.properties.p;
    s.district = ilce ? ilce.properties.d : '';
  } else if (EXTRA[s.country]) {
    const cfg = EXTRA[s.country], f = cfg.main.find((x) => geoContains(x, pt)), d = cfg.det.find((x) => geoContains(x, pt));
    if (f) area = s.country + ':' + f.properties.n;
    s.district = d ? d.properties.disp : (f ? f.properties.g : '');
  } else if (s.country === 'GB') {
    const sub = F.sub.find((f) => geoContains(f, pt));
    if (sub) {
      s.district = sub.properties.name;
      const city = Object.entries(GB_CITIES).find(([, c]) => c.subs ? c.subs.includes(sub.properties.name) : c.region === sub.properties.reg);
      if (city) area = 'GB:c:' + city[0];
      else {
        area = 'GB:s:' + sub.properties.name;
        if (!AREAS.has(area)) AREAS.set(area, { id: area, country: 'GB', name: sub.properties.name, feats: [sub], detail: F.sub.filter((d) => d.properties.reg === sub.properties.reg), parentRegion: sub.properties.reg, bounds: path.bounds(sub) });
      }
    }
  }
  if (!area) {
    area = 'X:' + id;
    const [x, y] = s.xy;
    AREAS.set(area, { id: area, country: ckey(s.country), name: s.city || s.name, feats: [], detail: [], bounds: [[x - 3, y - 2], [x + 3, y + 2]] });
    if (!s.district) s.district = '';
  }
  s.areaId = area;
}

// ---------- maçlar, tarih ve "şimdi"
for (const [k, t] of Object.entries(TEAMS)) { t.id = k; t.short = t.short || k; }
const M = MATCHES.map((m) => ({ ...m, st: STADIUMS[m.venue] }));
const D = (s) => new Date(s + 'T12:00:00Z');
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const weekStart = (s) => addDays(s, -((D(s).getUTCDay() + 6) % 7));
const fmt = (s, o) => D(s).toLocaleDateString('tr-TR', { timeZone: 'UTC', ...o });
const fmtDay = (s) => fmt(s, { day: 'numeric', month: 'long', weekday: 'long' });
const fmtWeek = (ws) => { const we = addDays(ws, 6), a = D(ws), b = D(we); return a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()}–${fmt(we, { day: 'numeric', month: 'long' })}` : `${fmt(ws, { day: 'numeric', month: 'short' })} – ${fmt(we, { day: 'numeric', month: 'short' })}`; };
const NOW = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 16); // İstanbul saati
const TODAY = NOW.slice(0, 10);
const kick = (m) => m.date + 'T' + m.time;
function status(m) { return m.status === 'pst' ? 'pst' : m.status; }
function liveMin(m) { const e = m.elapsed; return e == null ? '' : e === 45 && m.status === 'live' ? 'İY' : e; }
function score(m) { return m.hs == null || m.status === 'pre' || m.status === 'pst' ? null : [m.hs, m.as]; }
const played = (m) => status(m) === 'ft';

// ---------- istatistik
const TBL_CACHE = new Map();
function standings(lg) {
  if (TBL_CACHE.has(lg)) return TBL_CACHE.get(lg);
  const form = {};
  for (const m of M) {
    if (m.lg !== lg || !played(m) || (lg === 'CL' && m.round > 8)) continue;
    const r = m.hs > m.as ? ['G', 'M'] : m.hs < m.as ? ['M', 'G'] : ['B', 'B'];
    (form[m.home] = form[m.home] || []).push(r[0]); (form[m.away] = form[m.away] || []).push(r[1]);
  }
  const rows = (TABLES[lg] || []).filter((r) => TEAMS[r.t]).map((r) => ({ ...r, form: (form[r.t] || []).slice(-5) }));
  TBL_CACHE.set(lg, rows); return rows;
}
function scorers(lg) { return (SCORERS[lg] || []).filter((p) => TEAMS[p.team]); }
function leagueOf(t) { for (const [lg, ts] of Object.entries(LEAGUE_TEAMS)) if (ts.includes(t)) return lg; return CL_TEAMS.includes(t) ? 'CL' : null; }
function posOf(t, lg = leagueOf(t)) { return lg ? standings(lg).find((r) => r.t === t) : null; }
function currentRound(lg, date = S.date) {
  const ms = M.filter((m) => m.lg === lg && m.round < 100);
  if (!ms.length) return 1;
  const next = ms.find((m) => m.date >= weekStart(date)) || ms[ms.length - 1];
  return next.round;
}
const ZONE_TEXT = (lg) => (TABLES.__zones && TABLES.__zones[lg]) || [];

// ---------- durum
const firstDay = (() => {
  if (!M.length) return TODAY;
  const first = M[0].date, last = M[M.length - 1].date;
  let target = TODAY;
  if (TODAY > last || TODAY < first) { // sezon dışındaysak: geçen sezonun bugüne denk gelen günü
    const y = +META.season + (+TODAY.slice(5, 7) < 7 ? 1 : 0); target = y + TODAY.slice(4);
  }
  const f = M.find((m) => m.date >= target); return f ? f.date : last;
})();
const S = { date: firstDay, mode: 'day', team: null, lg: 'ALL', tab: 'matches', round: null, country: 'TR', area: null, match: null, route: false, hl: null };
const passFilters = (m) => (S.lg === 'ALL' || m.lg === S.lg) && (!S.team || m.home === S.team || m.away === S.team);
function inRange(m) { if (S.mode === 'day') return m.date === S.date; const ws = weekStart(S.date); return m.date >= ws && m.date <= addDays(ws, 6); }
const visible = () => M.filter((m) => passFilters(m) && inRange(m));
const teamMatches = () => {
  const ws = addDays(weekStart(S.date), -14), we = addDays(weekStart(S.date), 34);
  return M.filter((m) => (m.home === S.team || m.away === S.team) && m.date >= ws && m.date <= we && (S.lg === 'ALL' || m.lg === S.lg));
};
// ---------- harita DOM
const svg = select('#map');
const zg = svg.append('g').attr('class', 'zg');
const L = {};
for (const n of ['world', 'gb', 'tr', 'es', 'fr', 'de', 'it', 'grp', 'detail', 'rivers', 'lakes', 'route']) L[n] = zg.append('g').attr('class', 'l-' + n);
const ovl = svg.append('g').attr('class', 'ovl');
const lblG = ovl.append('g').attr('class', 'lbl');
const routeG = ovl.append('g').attr('class', 'rpins');
const pinG = ovl.append('g').attr('class', 'pins');

L.world.selectAll('path').data(F.world).join('path').attr('class', 'cty').attr('d', path);
L.gb.selectAll('path').data(F.reg).join('path').attr('class', 'land').attr('d', path)
  .attr('data-area', (f) => 'GB:r:' + f.properties.reg);
L.tr.selectAll('path').data(F.il).join('path').attr('class', 'land').attr('d', path)
  .attr('data-area', (f) => 'TR:' + f.properties.p);
for (const [c, cfg] of Object.entries(EXTRA)) {
  L[c.toLowerCase()].selectAll('path').data(cfg.main).join('path').attr('class', 'land').attr('d', path).attr('data-area', (f) => c + ':' + f.properties.n);
}
L.grp.selectAll('path').data(Object.values(EXTRA).flatMap((c) => c.grp)).join('path').attr('class', 'grpl').attr('d', path);
L.rivers.selectAll('path').data(F.rivers).join('path').attr('class', (f) => 'riv' + ((f.properties.scalerank ?? 9) > 7 ? ' minor' : '')).attr('d', path);
L.lakes.selectAll('path').data(F.lakes).join('path').attr('class', 'lake').attr('d', path);

// etiket adayları
const LBL = [];
for (const f of F.world) { const n = f.properties.NAME_TR; if (!n) continue; const a = geoArea(f); if (a < 2e-4) continue; LBL.push({ t: n, xy: labelPt(f), cls: 'l-cty', minK: 0, maxK: 2.6, pr: 2 + a * 300 }); }
LBL.push({ t: 'Türkiye', ck: 'TR', xy: proj([35, 39.2]), cls: 'l-country', minK: 0, maxK: 1.8, pr: 50 });
for (const [c, t, lon, lat] of [['ES', 'İspanya', -3.6, 39.9], ['FR', 'Fransa', 2.4, 46.9], ['DE', 'Almanya', 10.2, 51.1], ['IT', 'İtalya', 12.2, 42.9]]) LBL.push({ t, ck: c, xy: proj([lon, lat]), cls: 'l-country', minK: 0, maxK: 1.8, pr: 50 });
for (const [c, cfg] of Object.entries(EXTRA)) {
  for (const f of cfg.main) { const a = geoArea(f); LBL.push({ t: f.properties.disp, area: c + ':' + f.properties.n, xy: labelPt(f), cls: 'l-il', minK: cfg.lab === 'city' ? (c === 'DE' ? 7 : 4.5) : (a > 1.2e-3 ? 1.6 : a > 4e-4 ? 2.2 : 3), maxK: 40, pr: 10 + a * 2000 }); }
  for (const f of cfg.det) LBL.push({ t: f.properties.disp, parent: c + ':' + f.properties.p, xy: labelPt(f), cls: 'l-sub', minK: 14, maxK: 2000, pr: 5 + geoArea(f) * 3e4, sub: true });
}
LBL.push({ t: 'Birleşik Krallık', ck: 'GB', xy: proj([-2, 53.2]), cls: 'l-country', minK: 0, maxK: 1.8, pr: 50 });
for (const f of F.il) { const a = geoArea(f); LBL.push({ t: f.properties.p, area: 'TR:' + f.properties.p, xy: labelPt(f), cls: 'l-il', minK: a > 2.4e-3 ? 1.6 : a > 1.2e-3 ? 2.2 : 3.1, maxK: 40, pr: 10 + a * 2000 }); }
for (const [t, lon, lat, pr] of PLACE_LABELS) LBL.push({ t, xy: proj([lon, lat]), cls: 'l-city', dot: true, minK: pr >= 9 ? 1.7 : pr >= 7 ? 2.6 : 4, maxK: 30, pr: 10 + pr * 3 });
for (const [t, lon, lat, mk] of SEA_LABELS) LBL.push({ t, xy: proj([lon, lat]), cls: 'l-sea', minK: mk, maxK: mk * 9, pr: 1 });
for (const f of F.ilce) LBL.push({ t: f.properties.d, parent: 'TR:' + f.properties.p, xy: labelPt(f), cls: 'l-sub', minK: 12, maxK: 2000, pr: 5 + geoArea(f) * 3e4, sub: true });
for (const f of F.sub) LBL.push({ t: f.properties.name, xy: labelPt(f), cls: 'l-sub', minK: 26, maxK: 2000, pr: 5 + geoArea(f) * 3e4, sub: true });

// ---------- zoom
let T = zoomIdentity, Wpx = 800, Hpx = 600, flying = false;
const KN = () => T.k * 1000 / Wpx; // normalize yakınlık: ekran genişliğinden bağımsız
const zb = d3zoom().scaleExtent([0.6, 1200]).on('zoom', (e) => { T = e.transform; zg.attr('transform', T); svg.classed('zhi', KN() > 5); schedule(); })
  .on('end', () => { updateDetail(); schedule(); });
svg.call(zb).on('dblclick.zoom', null);
function size() { const r = $('#mapwrap').getBoundingClientRect(); Wpx = r.width; Hpx = r.height; svg.attr('viewBox', `0 0 ${Wpx} ${Hpx}`); }
function fitT(b, pad = 0.86, maxK = 400) {
  const dx = b[1][0] - b[0][0], dy = b[1][1] - b[0][1], cx = (b[0][0] + b[1][0]) / 2, cy = (b[0][1] + b[1][1]) / 2;
  const k = Math.min(maxK, pad / Math.max(dx / Wpx, dy / Hpx));
  return zoomIdentity.translate(Wpx / 2 - k * cx, Hpx / 2 - k * cy).scale(k);
}
function fly(t, instant) {
  const v0 = [(Wpx / 2 - T.x) / T.k, (Hpx / 2 - T.y) / T.k, Wpx / T.k], v1 = [(Wpx / 2 - t.x) / t.k, (Hpx / 2 - t.y) / t.k, Wpx / t.k];
  const dur = instant || reduced ? 0 : Math.max(550, Math.min(2600, interpolateZoom(v0, v1).duration * 0.75));
  if (!dur) { svg.interrupt(); svg.call(zb.transform, t); updateDetail(); return; }
  flying = true;
  svg.transition().duration(dur).ease(easeCubicInOut).call(zb.transform, t).on('end interrupt', () => { flying = false; });
}
function flyToState(instant) {
  if (S.route && S.team) { const pts = teamMatches().map((m) => m.st.xy); if (pts.length) { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); return fly(fitT([[Math.min(...xs) - 20, Math.min(...ys) - 20], [Math.max(...xs) + 20, Math.max(...ys) + 20]], 0.8), instant); } }
  if (S.match != null) { const m = M[S.match], a = AREAS.get(m.st.areaId); return fly(fitT(a.bounds, 0.8, 260), instant); }
  if (S.area) return fly(fitT(AREAS.get(S.area).bounds, 0.86, 260), instant);
  if (S.country === 'EU') return fly(fitT(EUROPE_BOUNDS, 0.9), instant);
  fly(fitT(COUNTRY_BOUNDS[S.country], S.country === 'GB' ? 0.9 : 0.94), instant);
}

// ayrıntı sınırları (ilçe)
function updateDetail() {
  let feats = [];
  if (KN() >= 9) {
    const x0 = -T.x / T.k, y0 = -T.y / T.k, x1 = x0 + Wpx / T.k, y1 = y0 + Hpx / T.k;
    for (const a of AREAS.values()) {
      if (a.id.startsWith('GB:c:')) continue;
      const b = a.bounds; if (b[1][0] < x0 || b[0][0] > x1 || b[1][1] < y0 || b[0][1] > y1) continue;
      feats.push(...a.detail);
    }
  }
  L.detail.selectAll('path').data(feats, (f) => (f.properties.d || f.properties.name || f.properties.n) + (f.properties.p || f.properties.reg))
    .join((en) => en.append('path').attr('class', 'sub').attr('d', path));
}

// ---------- katman: etiketler + iğneler
let raf = 0;
function schedule() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; drawOverlay(); }); }
const pinsData = () => {
  const vis = visible(), k = KN(), groups = new Map();
  const level = k < 1.55 ? 'country' : k < 9 ? 'area' : 'stadium';
  for (const m of vis) {
    const key = level === 'country' ? ckey(m.st.country) : level === 'area' ? m.st.areaId : m.st.id;
    if (!groups.has(key)) groups.set(key, { key, level, ms: [] });
    groups.get(key).ms.push(m);
  }
  for (const g of groups.values()) {
    const xs = [...new Set(g.ms.map((m) => m.st))].map((s) => s.xy);
    g.xy = [xs.reduce((a, p) => a + p[0], 0) / xs.length, xs.reduce((a, p) => a + p[1], 0) / xs.length];
    g.name = level === 'country' ? (g.key === 'EU' ? 'Avrupa' : COUNTRIES[g.key].name) : level === 'area' ? [...new Set(g.ms.map((m) => m.st.city))].join(', ') : g.ms[0].st.name;
  }
  return [...groups.values()];
};
const _mc = document.createElement('canvas').getContext('2d');
function textW(t, fs, font) { _mc.font = font || `500 ${fs}px Archivo, system-ui, sans-serif`; return _mc.measureText(t).width + 4; }
function drawOverlay() {
  const k = T.k, kn = KN(), boxes = [], hit = (b) => boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
  const scr = (xy) => [xy[0] * k + T.x, xy[1] * k + T.y];
  // iğneler
  const raw = pinsData().sort((a, b) => b.ms.length - a.ms.length), pins = [];
  for (const p of raw) {
    p.s = scr(p.xy); p.members = [p]; p.k0 = p.key;
    const near = pins.find((o) => Math.abs(o.s[0] - p.s[0]) < (p.level === 'stadium' ? 70 : 30) && Math.abs(o.s[1] - p.s[1]) < (p.level === 'stadium' ? 46 : 26));
    if (near) { near.members.push(p); near.ms = near.ms.concat(p.ms); near.key += '+' + p.key; near.name = near.members.map((m) => m.name).join(', '); }
    else pins.push(p);
  }
  for (const p of pins) {
    if (p.level === 'stadium') {
      const m = p.ms[0], sc = score(m), stt = status(m);
      const lab = p.ms.length > 1 ? `${p.ms.length} maç` : sc ? `${TEAMS[m.home].short} ${sc[0]}–${sc[1]} ${TEAMS[m.away].short}` : `${TEAMS[m.home].short} – ${TEAMS[m.away].short}`;
      p.lab = lab; p.sub = p.ms.length > 1 ? (p.members.length > 1 ? `${p.members.length} stadyum` : p.name) : (S.mode === 'week' ? fmt(m.date, { weekday: 'short' }) + ' ' : '') + (stt === 'ft' ? 'Maç sonu' : stt === 'live' ? 'Canlı' : m.time);
      p.w = Math.max(textW(lab, 15, '800 15px "Big Shoulders Display", "Arial Narrow", sans-serif'), textW(p.sub, 11)) + 34;
      p.box = [p.s[0] - p.w / 2, p.s[1] - 52, p.s[0] + p.w / 2, p.s[1] + 4];
    } else {
      p.box = [p.s[0] - 15, p.s[1] - 15, p.s[0] + 15 + textW(p.name, 16, '800 16px "Big Shoulders Display", "Arial Narrow", sans-serif') + 6, p.s[1] + 15];
    }
    p.sel = p.ms.some((m) => m.id === S.match) || (S.hl && p.ms.some((m) => m.st.id === S.hl || m.id === S.hl));
    boxes.push(p.box);
  }
  const pinAreas = new Set(pins.filter((p) => p.level !== 'stadium').map((p) => p.key));
  pinG.selectAll('g.pin').data(pins, (p) => p.level + p.key).join((en) => {
    const g = en.append('g').attr('class', 'pin').attr('tabindex', 0).attr('role', 'button');
    return g;
  }).each(function (p) {
    const g = select(this);
    g.attr('class', 'pin pin-' + p.level + (p.sel ? ' sel' : '')).attr('transform', `translate(${p.s[0].toFixed(1)},${p.s[1].toFixed(1)})`)
      .attr('aria-label', `${p.name}: ${p.ms.length} maç`);
    const sig = p.level + '|' + (p.lab || p.ms.length) + '|' + p.name + '|' + (p.sub || '');
    if (g.attr('data-sig') === sig) return;
    g.attr('data-sig', sig).selectAll('*').remove();
    if (p.level === 'stadium') {
      const m = p.ms[0], w = p.w;
      g.append('path').attr('class', 'pill').style('--lgc', THEMES[m.lg].brand).attr('d', `M${-w / 2 + 8},-48h${w - 16}a8,8 0 0 1 8,8v24a8,8 0 0 1 -8,8h${-(w / 2 - 14)}l-6,7l-6,-7h${-(w / 2 - 14)}a8,8 0 0 1 -8,-8v-24a8,8 0 0 1 8,-8z`);
      if (p.ms.length === 1) {
        g.append('circle').attr('cx', -w / 2 + 14).attr('cy', -36).attr('r', 4.5).attr('fill', TEAMS[m.home].c[0]).attr('class', 'tdot');
        g.append('circle').attr('cx', -w / 2 + 14).attr('cy', -22).attr('r', 4.5).attr('fill', TEAMS[m.away].c[0]).attr('class', 'tdot');
      }
      g.append('text').attr('class', 'pt1').attr('x', -w / 2 + 25).attr('y', -27).text(p.lab);
      g.append('text').attr('class', 'pt2').attr('x', -w / 2 + 25).attr('y', -13).text(p.sub);
      g.append('circle').attr('class', 'pdot').attr('r', 3.5);
    } else {
      g.append('circle').attr('class', 'pc').attr('r', 14);
      g.append('text').attr('class', 'pn').attr('dy', '0.35em').text(p.ms.length);
      g.append('text').attr('class', 'pl').attr('x', 21).attr('dy', '0.35em').text(p.name);
    }
  });
  // takım rotası numaraları
  const rp = [];
  if (S.route && S.team) {
    const tm = teamMatches();
    tm.forEach((m, i) => { const s = scr(m.st.xy); rp.push({ m, i, s }); });
  }
  routeG.selectAll('g.rp').data(rp, (d) => d.m.id).join((en) => { const g = en.append('g').attr('class', 'rp').attr('role', 'button').attr('tabindex', 0); g.append('circle').attr('r', 10); g.append('text').attr('dy', '0.35em'); return g; })
    .attr('transform', (d) => `translate(${d.s[0] + 16},${d.s[1] + 14})`).classed('cur', (d) => inRange(d.m))
    .attr('aria-label', (d) => `${d.i + 1}. maç: ${TEAMS[d.m.home].name} – ${TEAMS[d.m.away].name}`)
    .select('text').text((d) => d.i + 1);
  // etiketler
  const out = [];
  const activeArea = S.area || (S.match != null ? M[S.match].st.areaId : null);
  const cand = LBL.filter((l) => kn >= l.minK && kn < l.maxK).map((l) => {
    let pr = l.pr; if ((l.area && pinAreas.has(l.area)) || (l.ck && pinAreas.has(l.ck))) return null;
    if (l.parent && activeArea && l.parent === activeArea) pr += 200;
    if (l.area && activeArea === l.area) pr += 100;
    return { l, pr };
  }).filter(Boolean).sort((a, b) => b.pr - a.pr);
  for (const { l } of cand) {
    const s = scr(l.xy);
    if (s[0] < -40 || s[1] < -20 || s[0] > Wpx + 40 || s[1] > Hpx + 20) continue;
    const fs = l.cls === 'l-country' ? 15 : l.cls === 'l-sub' ? 11.5 : l.cls === 'l-sea' ? 12 : 12.5;
    const w = textW(l.t, fs), x = l.dot ? s[0] + 6 : s[0] - w / 2, y = l.dot ? s[1] - fs / 2 : s[1] - fs / 2;
    const b = [x - 2, y - 2, x + w + 2, y + fs + 2];
    if (hit(b)) continue;
    boxes.push(b); out.push({ l, s, x, y: y + fs * 0.8 });
    if (out.length > 140) break;
  }
  lblG.selectAll('g').data(out, (d) => d.l.t + d.l.cls + d.l.xy[0]).join((en) => {
    const g = en.append('g');
    g.append('circle').attr('r', 2.6).attr('class', 'cdot');
    g.append('text');
    return g;
  }).attr('class', (d) => d.l.cls).each(function (d) {
    const g = select(this);
    g.select('circle').attr('display', d.l.dot ? null : 'none').attr('cx', d.s[0]).attr('cy', d.s[1]);
    g.select('text').attr('x', d.x).attr('y', d.y).text(d.l.t);
  });
  // il durumları
  const visAreas = new Set(visible().map((m) => m.st.country === 'GB' ? 'GB:r:' + AREAS.get(m.st.areaId).parentRegion : m.st.areaId));
  for (const c of ['tr', 'es', 'fr', 'de', 'it']) L[c].selectAll('path').classed('has', function () { return visAreas.has(this.dataset.area); }).classed('on', function () { return this.dataset.area === activeArea; });
  L.gb.selectAll('path').classed('has', function () { return visAreas.has(this.dataset.area); }).classed('on', function () { const a = activeArea && AREAS.get(activeArea); return !!a && (this.dataset.area === activeArea || ('GB:r:' + a.parentRegion) === this.dataset.area); });
  drawRoute();
}
function drawRoute() {
  const pts = S.route && S.team ? teamMatches() : [];
  const segs = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1].st.xy, b = pts[i].st.xy; if (a === b) continue;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    const c = [mx - dy * 0.22, my + dx * 0.22 - len * 0.05];
    segs.push({ id: pts[i].id, d: `M${a[0]},${a[1]}Q${c[0]},${c[1]} ${b[0]},${b[1]}` });
  }
  L.route.selectAll('path').data(segs, (d) => d.id).join('path').attr('class', 'rt').attr('d', (d) => d.d);
}

// ---------- harita etkileşimi
const tip = $('#tip');
svg.on('pointermove', (e) => {
  const t = e.target.closest && e.target.closest('path.land, path.sub');
  if (!t || e.pointerType === 'touch') { tip.hidden = true; return; }
  const f = select(t).datum(); let name, count = 0;
  if (t.classList.contains('sub')) name = f.properties.disp || f.properties.d || f.properties.name;
  else { const a = AREAS.get(t.dataset.area); name = a.name; count = visible().filter((m) => m.st.areaId === a.id || (a.id.startsWith('GB:r:') && AREAS.get(m.st.areaId).parentRegion === f.properties.reg)).length; }
  tip.textContent = count ? `${name} · ${count} maç` : name;
  const r = $('#mapwrap').getBoundingClientRect();
  tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 12}px)`; tip.hidden = false;
}).on('pointerleave', () => { tip.hidden = true; });
svg.on('click', (e) => {
  const pin = e.target.closest('g.pin'), rp = e.target.closest('g.rp'), land = e.target.closest('path.land');
  if (rp) return selectMatch(select(rp).datum().m.id, true);
  if (pin) return pinClick(select(pin).datum());
  if (land) {
    const id = land.dataset.area, a = AREAS.get(id);
    const vis = visible().filter((m) => m.st.areaId === id || (id.startsWith('GB:r:') && AREAS.get(m.st.areaId).parentRegion === a.feats[0].properties.reg));
    if (id.startsWith('GB:r:') && vis.length) { const cities = [...new Set(vis.map((m) => m.st.areaId))]; if (cities.length === 1) return selectArea(cities[0]); }
    return selectArea(id);
  }
});
svg.on('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const pin = e.target.closest('g.pin'), rp = e.target.closest('g.rp'); if (pin) { e.preventDefault(); pinClick(select(pin).datum()); } else if (rp) { e.preventDefault(); selectMatch(select(rp).datum().m.id, true); } } });
function pinClick(p) {
  if (p.members && p.members.length > 1) {
    const bs = p.level === 'area' ? p.members.map((m) => AREAS.get(m.k0).bounds) : p.members.map((m) => [m.xy, m.xy]);
    const b = [[Math.min(...bs.map((x) => x[0][0])), Math.min(...bs.map((x) => x[0][1]))], [Math.max(...bs.map((x) => x[1][0])), Math.max(...bs.map((x) => x[1][1]))]];
    const pad = p.level === 'area' ? 0 : 1.5;
    return fly(fitT([[b[0][0] - pad, b[0][1] - pad], [b[1][0] + pad, b[1][1] + pad]], 0.8, 400));
  }
  if (p.level === 'country') { S.country = p.k0; S.area = null; S.match = null; render(); return flyToState(); }
  if (p.level === 'area') { p = { ...p, key: p.k0 }; if (p.ms.length === 1) return selectMatch(p.ms[0].id); return selectArea(p.key); }
  selectMatch(p.ms[0].id);
}
$('#zin').onclick = () => svg.transition().duration(reduced ? 0 : 300).call(zb.scaleBy, 1.8);
$('#zout').onclick = () => svg.transition().duration(reduced ? 0 : 300).call(zb.scaleBy, 1 / 1.8);
$('#zreset').onclick = () => flyToState();


// ---------- eylemler
function autoCountry() {
  if (S.lg !== 'ALL' && !S.team) { const c = THEMES[S.lg].country; if (c === 'EU') { const cs = new Set(visible().map((m) => ckey(m.st.country))); S.country = cs.size === 1 ? [...cs][0] : 'EU'; } else S.country = c; return; }
  const counts = {}; for (const m of visible()) counts[ckey(m.st.country)] = (counts[ckey(m.st.country)] || 0) + 1;
  const ks = Object.keys(counts);
  if (S.team && ks.length > 1) { S.country = 'EU'; return; }
  if (S.country === 'EU') { if (ks.length === 1) S.country = ks[0]; return; }
  if (!counts[S.country] && ks.length) S.country = ks.sort((a, b) => counts[b] - counts[a])[0];
}
function setDate(d, keepSel) {
  S.date = d; if (!keepSel) { S.match = null; S.area = null; }
  S.round = null; autoCountry(); render(); flyToState();
}
function selectArea(id) { S.area = id; S.match = null; S.country = ckey(AREAS.get(id).country); render(); flyToState(); }
function selectMatch(id, jumpDate) {
  const m = M[id]; S.match = id; S.country = ckey(m.st.country); S.area = m.st.areaId;
  if (jumpDate || !inRange(m)) S.date = m.date;
  if (S.route) S.route = false;
  render(); flyToState();
  if (matchMedia('(max-width: 900px)').matches) $('#mapwrap').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}
function back() {
  if (document.body.classList.contains('big')) return toggleBig(false);
  if (S.match != null) { S.match = null; render(); return flyToState(); }
  if (S.area) { S.area = null; render(); return flyToState(); }
  if (S.route) { S.route = false; render(); return flyToState(); }
}
function setTeam(id) {
  S.team = id; S.area = null; S.match = null; S.route = false; S.tab = 'matches';
  if (id) {
    S.mode = 'week';
    if (S.lg !== 'ALL' && S.lg !== 'CL' && !LEAGUE_TEAMS[S.lg].includes(id)) S.lg = 'ALL';
    const tm = M.filter((m) => (m.home === id || m.away === id) && (S.lg === 'ALL' || m.lg === S.lg));
    const next = tm.find((m) => m.date >= weekStart(S.date)) || tm[tm.length - 1];
    if (next) { S.date = next.date; S.country = ckey(next.st.country); }
  } else if (S.country === 'EU') S.country = 'TR';
  autoCountry(); applyTheme(); render(); flyToState();
}
function setLeague(lg) {
  S.lg = lg; S.match = null; S.area = null; S.route = false; S.round = null;
  if (lg !== 'ALL' && S.team && lg !== 'CL' && !LEAGUE_TEAMS[lg].includes(S.team)) { S.team = null; ti.value = ''; tclear.hidden = true; }
  if (lg === 'ALL') S.tab = 'matches';
  // seçilen ligin bu haftada maçı yoksa en yakın maç gününe git
  if (lg !== 'ALL' && !M.some((m) => m.lg === lg && inRange(m))) {
    const n = M.find((m) => m.lg === lg && m.date >= S.date) || M.filter((m) => m.lg === lg).pop();
    S.date = n.date;
  }
  autoCountry(); applyTheme(); render(); flyToState();
}

// ---------- tema
const bgEl = $('#bg');
function applyTheme() {
  const t = THEMES[S.lg], r = document.documentElement.style;
  document.body.dataset.lg = S.lg;
  r.setProperty('--f1', t.f1); r.setProperty('--f2', t.f2); r.setProperty('--acc', t.acc); r.setProperty('--on', t.on); r.setProperty('--brand', t.brand);
  bgEl.innerHTML = backdrop(S.lg, 1600, 1000);
  const meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.content = t.f1;
}

// ---------- 3D sahne
const stage = $('#stage');
let viewer = null, viewerFor = null;
function ensureViewer() { if (!viewer) { viewer = createViewer($('#stage-gl')); if (viewer) viewer.onChange(() => syncStageUi()); } return viewer; }
function syncStageUi() {
  if (!viewer) return;
  stage.querySelectorAll('[data-night]').forEach((b) => b.setAttribute('aria-pressed', String(String(b.dataset.night === '1') === stage.dataset.night)));
  $('#st-rot').setAttribute('aria-pressed', String(viewer.auto));
  $('#st-crowd').setAttribute('aria-pressed', String(viewer.crowd));
}
stage.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b || !viewer) return;
  if (b.dataset.night) { stage.dataset.night = b.dataset.night === '1' ? 'true' : 'false'; viewer.setNight(b.dataset.night === '1'); syncStageUi(); }
  if (b.id === 'st-rot') { viewer.setAuto(!viewer.auto); syncStageUi(); }
  if (b.id === 'st-crowd') { viewer.setCrowd(!viewer.crowd); syncStageUi(); }
  if (b.id === 'st-big') toggleBig();
  if (b.id === 'st-zin') viewer.zoom(0.8);
  if (b.id === 'st-zout') viewer.zoom(1.25);
});
function toggleBig(v) {
  const on = v ?? !document.body.classList.contains('big');
  document.body.classList.toggle('big', on);
  $('#st-big').setAttribute('aria-label', on ? 'Küçült' : 'Büyüt'); $('#st-big').textContent = on ? '✕' : '⤢';
  requestAnimationFrame(() => viewer && viewer.resize());
}

// ---------- bileşenler
const panel = $('#panel');
const dot = (t) => TEAMS[t].logo ? `<img class="kit logo" src="${TEAMS[t].logo}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : `<span class="kit" style="--a:${TEAMS[t].c[0]};--b:${TEAMS[t].c[1]}" aria-hidden="true"></span>`;
const lgTag = (lg) => `<span class="lgt" style="--b:${THEMES[lg].brand}">${LEAGUES[lg].short}</span>`;
function row(m, opt = {}) {
  const sc = score(m), st = status(m), hw = sc && sc[0] > sc[1], aw = sc && sc[1] > sc[0];
  const left = st === 'live' ? `<span class="live">${liveMin(m)}${typeof liveMin(m) === 'number' ? "'" : ''}</span>` : st === 'ft' ? `<span class="ft">MS</span>` : st === 'pst' ? `<span class="ft">ERT.</span>` : m.time;
  const date = opt.date ? `<b>${fmt(m.date, { day: 'numeric', month: 'short' })}</b>` : '';
  return `<button class="mr${m.id === S.match ? ' on' : ''}${st !== 'pre' ? ' done' : ''}" data-m="${m.id}"${opt.jump ? ' data-jump="1"' : ''}>
    <span class="mr-k">${date}${left}</span>
    <span class="mr-tm${hw ? ' w' : ''}">${dot(m.home)}<span>${esc(TEAMS[m.home].name)}</span></span><span class="mr-s">${sc ? sc[0] : ''}</span>
    <span class="mr-tm${aw ? ' w' : ''}">${dot(m.away)}<span>${esc(TEAMS[m.away].name)}</span></span><span class="mr-s">${sc ? sc[1] : ''}</span>
    <span class="mr-meta">${opt.lg ? lgTag(m.lg) : ''}${esc(m.st.name)}, ${esc(m.st.city)}</span>
  </button>`;
}
const formDots = (f) => `<span class="form">${f.map((x) => `<i class="f-${x}" title="${{ G: 'Galibiyet', B: 'Beraberlik', M: 'Mağlubiyet' }[x]}">${x}</i>`).join('')}</span>`;
function nextMatchDay() { const fut = M.filter((m) => passFilters(m) && m.date > S.date); return fut[0] && fut[0].date; }
function roundLabel(lg, r) { return (ROUND_LABELS[lg] && ROUND_LABELS[lg][r]) || (lg === 'CL' ? `${r}. maç günü` : `${r}. hafta`); }

// ---------- band (lig başlığı)
function renderBand() {
  const t = THEMES[S.lg];
  $('#band-emb').innerHTML = emblem(S.lg, 'emb');
  $('#band-name').textContent = S.lg === 'ALL' ? 'Avrupa maç haritası' : t.name;
  let facts = [];
  if (S.lg === 'ALL') {
    const wk = M.filter((m) => m.date >= weekStart(S.date) && m.date <= addDays(weekStart(S.date), 6));
    facts = [[`${wk.length}`, 'maç bu hafta'], [`${new Set(wk.map((m) => m.st.city)).size}`, 'şehir'], ['7', 'lig'], [SEASON, 'sezon']];
  } else {
    const tb = standings(S.lg).length ? standings(S.lg) : [{ t: Object.keys(TEAMS)[0], p: 0 }], sc = scorers(S.lg)[0], ms = M.filter((m) => m.lg === S.lg && played(m)), g = ms.reduce((a, m) => a + m.hs + m.as, 0);
    facts = [[roundLabel(S.lg, currentRound(S.lg)), SEASON],
      [esc(TEAMS[tb[0].t].name), `lider · ${tb[0].p} puan`],
      sc ? [esc(sc.name), `gol kralı · ${sc.n} gol`] : ['—', 'gol kralı'],
      [ms.length ? (g / ms.length).toFixed(2).replace('.', ',') : '—', 'maç başına gol']];
  }
  $('#band-facts').innerHTML = facts.map(([a, b]) => `<div><b>${a}</b><span>${b}</span></div>`).join('');
}

// ---------- panel
function tabsHtml() {
  if (S.lg === 'ALL' || S.match != null) return '';
  const tabs = [['matches', 'Maçlar'], ['table', S.lg === 'CL' ? 'Lig aşaması' : 'Puan durumu'], ['scorers', 'Gol krallığı'], ['fixtures', 'Fikstür']];
  return `<div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-tab="${k}" aria-selected="${S.tab === k}">${l}</button>`).join('')}</div>`;
}
const NOTE = () => META.source === 'demo' ? 'Örnek veri: API anahtarı eklenene kadar fikstür, skorlar ve oyuncu adları kurgusaldır.' : `Veri: API-Football, ${SEASON} sezonu. Son güncelleme: ${new Date(META.updated).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}.${META.eventsMissing ? ` ${META.eventsMissing} maçın gol ayrıntıları henüz yüklenmedi.` : ''}`;
function renderPanel() {
  if (S.match != null) return renderDetail();
  if (viewer) viewer.stop();
  stage.hidden = true; document.body.append(stage);
  let h = tabsHtml();
  if (S.lg !== 'ALL' && S.tab === 'table') h += tableHtml(S.lg);
  else if (S.lg !== 'ALL' && S.tab === 'scorers') h += scorersHtml(S.lg);
  else if (S.lg !== 'ALL' && S.tab === 'fixtures') h += fixturesHtml(S.lg);
  else h += matchesHtml();
  h += `<p class="note">${esc(NOTE())} Stadyum modelleri temsilidir.</p>`;
  panel.innerHTML = h;
}
function matchesHtml() {
  let vis = visible();
  const area = S.area && AREAS.get(S.area);
  if (area) vis = vis.filter((m) => m.st.areaId === area.id || (area.id.startsWith('GB:r:') && AREAS.get(m.st.areaId).parentRegion === area.feats[0].properties.reg));
  let h = '';
  if (S.team) {
    const t = TEAMS[S.team], lg = leagueOf(S.team), p = posOf(S.team, lg);
    h += `<div class="team-head" style="--a:${t.c[0]};--b:${t.c[1]}">${t.logo ? dot(S.team) : '<span class="crest" aria-hidden="true"></span>'}<div><h2>${esc(t.name)}</h2>
      <p>${lg ? LEAGUES[lg].name : ''}${p ? `, ${p.pos}. sıra · ${p.p} puan` : ''}</p>${p ? formDots(p.form) : ''}</div>
      <button class="btn-s" id="route-btn" aria-pressed="${S.route}">${S.route ? 'Rotayı gizle' : 'Rotayı göster'}</button></div>`;
  }
  const title = S.mode === 'day' ? fmtDay(S.date) : fmtWeek(weekStart(S.date));
  h += `<div class="p-head"><h2>${esc(title)}</h2><p>${vis.length ? `${vis.length} maç` : 'Maç yok'}</p></div>`;
  if (area) h += `<div class="chips"><button class="chip-x" data-act="clear-area">${esc(area.name)} <span aria-hidden="true">✕</span><span class="sr">filtresini kaldır</span></button></div>`;
  if (!vis.length) {
    const nd = nextMatchDay();
    h += `<div class="empty"><p>${area ? `${esc(area.name)} için bu ${S.mode === 'day' ? 'gün' : 'hafta'} maç yok.` : `Bu ${S.mode === 'day' ? 'gün' : 'hafta'} seçili filtrelerde maç yok.`}</p>${nd ? `<button class="btn" data-go="${nd}">Sonraki maç günü: ${esc(fmtDay(nd))}</button>` : ''}</div>`;
  } else if (S.team) {
    const byD = {}; for (const m of vis) (byD[m.date] = byD[m.date] || []).push(m);
    for (const [d, ms] of Object.entries(byD)) h += `<h4 class="dgrp">${esc(fmtDay(d))}</h4>` + ms.map((m) => row(m, { lg: true })).join('');
  } else {
    const byL = {}; for (const m of vis) (byL[m.lg] = byL[m.lg] || []).push(m);
    const order = Object.keys(byL).sort((a, b) => (THEMES[b].country === S.country) - (THEMES[a].country === S.country) || Object.keys(LEAGUES).indexOf(a) - Object.keys(LEAGUES).indexOf(b));
    for (const lg of order) {
      const ms = byL[lg];
      h += `<h3 class="lgh" style="--b:${THEMES[lg].brand};--e2:#fff">${emblem(lg, 'emb-s')}<span>${LEAGUES[lg].name}</span><em>${roundLabel(lg, ms[0].round)}</em>${S.lg === 'ALL' ? `<button class="more" data-lgo="${lg}">Lige git</button>` : ''}</h3>`;
      if (S.mode === 'week') {
        const byD = {}; for (const m of ms) (byD[m.date] = byD[m.date] || []).push(m);
        for (const [d, xs] of Object.entries(byD)) h += `<h4 class="dgrp">${esc(fmtDay(d))}</h4>` + xs.map((m) => row(m)).join('');
      } else h += ms.map((m) => row(m)).join('');
    }
  }
  if (S.team) h += teamFixtures();
  else if (S.lg === 'ALL') h += leadersHtml();
  else h += miniTable(S.lg);
  return h;
}
function leadersHtml() {
  return `<h3 class="sec">Liderler</h3><div class="leaders">${Object.keys(LEAGUES).map((lg) => {
    const r = standings(lg)[0], s = scorers(lg)[0];
    if (!r) return '';
    return `<button class="ld" data-lgo="${lg}" style="--b:${THEMES[lg].brand};--e2:#fff">${emblem(lg, 'emb-s')}<span class="ld-n">${LEAGUES[lg].name}</span>
      <span class="ld-t">${dot(r.t)}${esc(TEAMS[r.t].name)}<b>${r.p}</b></span><span class="ld-s">${s ? `${esc(s.name)} · ${s.n} gol` : ''}</span></button>`;
  }).join('')}</div>`;
}
function miniTable(lg) {
  const tb = standings(lg).slice(0, 5);
  return `<h3 class="sec">Zirve<button class="more" data-tab="table">Tüm tablo</button></h3>` + tableRows(lg, tb, true);
}
function tableRows(lg, rows, mini) {
  const z = (pos) => (rows.find((r) => r.pos === pos) || {}).z || '';
  return `<table class="tbl${mini ? ' mini' : ''}"><thead><tr><th class="c-p">#</th><th class="c-t">Takım</th><th>O</th>${mini ? '' : '<th>G</th><th>B</th><th>M</th>'}<th>AV</th><th>P</th>${mini ? '' : '<th class="c-f">Form</th>'}</tr></thead><tbody>${rows.map((r) => {
    const av = r.a - r.y;
    return `<tr class="z-${r.z || ''}${r.t === S.team ? ' me' : ''}" data-team="${r.t}" tabindex="0"><td class="c-p">${r.pos}</td><td class="c-t">${dot(r.t)}<span>${esc(TEAMS[r.t].name)}</span></td><td>${r.o}</td>${mini ? '' : `<td>${r.g}</td><td>${r.b}</td><td>${r.m}</td>`}<td>${av > 0 ? '+' : ''}${av}</td><td class="c-pt">${r.p}</td>${mini ? '' : `<td class="c-f">${formDots(r.form)}</td>`}</tr>`;
  }).join('')}</tbody></table>`;
}
function tableHtml(lg) {
  const zl = ZONE_TEXT(lg);
  return `<div class="p-head"><h2>${lg === 'CL' ? 'Lig aşaması' : 'Puan durumu'}</h2><p>${roundLabel(lg, Math.max(0, ...M.filter((m) => m.lg === lg && played(m)).map((m) => m.round)))} sonrası</p></div>`
    + tableRows(lg, standings(lg)) + `<ul class="legend">${zl.map(([k, l]) => `<li class="z-${k}"><i></i>${l}</li>`).join('')}</ul><p class="hint">Takıma dokun: maçlarını haritada gör.</p>`;
}
function scorersHtml(lg) {
  const sc = scorers(lg), top = sc.slice(0, 15), max = top[0] ? top[0].n : 1;
  const ms = M.filter((m) => m.lg === lg && played(m)), g = ms.reduce((a, m) => a + m.hs + m.as, 0);
  const hw = ms.filter((m) => m.hs > m.as).length, dr = ms.filter((m) => m.hs === m.as).length;
  const tg = {}; for (const m of ms) { tg[m.home] = (tg[m.home] || 0) + m.hs; tg[m.away] = (tg[m.away] || 0) + m.as; }
  const bestA = Object.entries(tg).sort((a, b) => b[1] - a[1])[0];
  const pct = (x) => ms.length ? Math.round(100 * x / ms.length) + '%' : '—';
  return `<div class="p-head"><h2>Gol krallığı</h2><p>${ms.length} maç oynandı</p></div>
    <div class="stats"><div><b>${g}</b><span>toplam gol</span></div><div><b>${ms.length ? (g / ms.length).toFixed(2).replace('.', ',') : '—'}</b><span>maç başına</span></div><div><b>${pct(hw)}</b><span>ev sahibi galibiyeti</span></div><div><b>${pct(dr)}</b><span>beraberlik</span></div></div>
    ${bestA ? `<p class="hint">En golcü takım: <b>${esc(TEAMS[bestA[0]].name)}</b>, ${bestA[1]} gol</p>` : ''}
    <ol class="scor">${top.map((p, i) => `<li><span class="sc-r">${i && top[i - 1].n === p.n ? '' : i + 1}</span><span class="sc-n"><b>${esc(p.name)}</b><button class="sc-t" data-team="${p.team}">${dot(p.team)}${esc(TEAMS[p.team].name)}</button></span>
      <span class="sc-bar"><i style="width:${(100 * p.n / max).toFixed(0)}%"></i></span><span class="sc-g">${p.n}${p.pen ? `<small>${p.pen} pen.</small>` : ''}</span></li>`).join('')}</ol>`;
}
function fixturesHtml(lg) {
  const list = [...new Set(M.filter((m) => m.lg === lg).map((m) => m.round))].sort((a, b) => a - b);
  if (!list.length) return `<div class="empty"><p>Bu lig için fikstür yok.</p></div>`;
  let r = S.round || currentRound(lg); if (!list.includes(r)) r = list.find((x) => x >= r) || list[list.length - 1];
  const k = list.indexOf(r), prev = list[k - 1], next = list[k + 1];
  const ms = M.filter((m) => m.lg === lg && m.round === r);
  const byD = {}; for (const m of ms) (byD[m.date] = byD[m.date] || []).push(m);
  return `<div class="rnav"><button class="icon" data-round="${prev ?? ''}" ${prev != null ? '' : 'disabled'} aria-label="Önceki tur">‹</button>
    <div><b>${esc(roundLabel(lg, r))}</b><span>${fmt(ms[0].date, { day: 'numeric', month: 'short' })} – ${fmt(ms[ms.length - 1].date, { day: 'numeric', month: 'short' })}</span></div>
    <button class="icon" data-round="${next ?? ''}" ${next != null ? '' : 'disabled'} aria-label="Sonraki tur">›</button></div>
    <div class="rbar">${list.map((x) => `<button data-round="${x}" class="${x === r ? 'on' : ''}${M.some((m) => m.lg === lg && m.round === x && played(m)) ? ' pl' : ''}" aria-label="${esc(roundLabel(lg, x))}"></button>`).join('')}</div>
    <button class="btn-s wide" data-act="round-map" data-d="${ms[0].date}">Bu turu haritada göster</button>`
    + Object.entries(byD).map(([d, xs]) => `<h4 class="dgrp">${esc(fmtDay(d))}</h4>` + xs.map((m) => row(m, { jump: true })).join('')).join('');
}
function teamFixtures() {
  const tm = teamMatches(), ws = weekStart(S.date);
  return `<h3 class="sec">${esc(TEAMS[S.team].name)} takvimi</h3><ol class="fx">${tm.map((m) => {
    const home = m.home === S.team, opp = home ? m.away : m.home, cur = weekStart(m.date) === ws, sc = score(m);
    let res = '';
    if (sc && status(m) === 'ft') { const [f, a] = home ? sc : [sc[1], sc[0]]; res = `<span class="res r-${f > a ? 'G' : f < a ? 'M' : 'B'}">${f}–${a}</span>`; }
    return `<li><button data-m="${m.id}" data-jump="1" class="${cur ? 'cur' : ''}${m.id === S.match ? ' on' : ''}"><span class="fx-d">${fmt(m.date, { day: 'numeric', month: 'short' })}</span><span class="fx-o">${home ? '' : '<i>dep.</i> '}${esc(TEAMS[opp].name)}</span>${res || `<span class="fx-c">${m.time}</span>`}${lgTag(m.lg)}</button></li>`;
  }).join('')}</ol>`;
}
function renderDetail() {
  const m = M[S.match], st = m.st, list = visible(), idx = list.findIndex((x) => x.id === m.id);
  const prev = idx > 0 ? list[idx - 1] : null, next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  const loc = [st.district, st.city].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');
  const sc = score(m), s = status(m);
  const side = (t) => {
    const lg = m.lg === 'CL' ? 'CL' : m.lg, p = posOf(t, lg);
    return `<div class="side">${dot(t)}<b>${esc(TEAMS[t].name)}</b>${p ? `<span>${p.pos}. sıra · ${p.p} p</span>${formDots(p.form)}` : ''}</div>`;
  };
  const goals = sc && m.goals ? m.goals : [];
  const gl = (t) => goals.filter((g) => g.team === t).map((g) => `<li>${g.own ? 'Kendi kalesine' : esc(g.pl)}${g.pen ? ' (pen.)' : ''} <b>${g.min}${g.extra ? '+' + g.extra : ''}'</b></li>`).join('');
  let h = `<div class="d-top"><button class="back" data-act="back">‹ ${S.area && list.filter((x) => x.st.areaId === st.areaId).length > 1 ? esc(AREAS.get(st.areaId).name) + ' maçları' : 'Geri'}</button>
    <span class="d-nav"><button class="icon" data-m="${prev ? prev.id : ''}" ${prev ? '' : 'disabled'} aria-label="Önceki maç">‹</button><button class="icon" data-m="${next ? next.id : ''}" ${next ? '' : 'disabled'} aria-label="Sonraki maç">›</button></span></div>
  <div id="stage-slot"></div>
  <div class="score-card" style="--b:${THEMES[m.lg].brand}">
    <div class="sc-top">${lgTag(m.lg)}<span>${roundLabel(m.lg, m.round)} · ${esc(fmtDay(m.date))}</span></div>
    <div class="sc-main">${side(m.home)}<div class="sc-mid">${sc ? `<b>${sc[0]}<i>–</i>${sc[1]}</b><span class="${s}">${s === 'live' ? 'Canlı ' + liveMin(m) + (typeof liveMin(m) === 'number' ? "'" : '') : 'Maç sonu'}</span>` : `<b class="tm">${m.time}</b><span>başlama</span>`}</div>${side(m.away)}</div>
    ${goals.length ? `<div class="goals"><ul>${gl(m.home)}</ul><ul>${gl(m.away)}</ul></div>` : sc && (sc[0] + sc[1]) > 0 && !m.goals ? `<p class="nogoals">Gol ayrıntıları bir sonraki veri güncellemesinde gelecek.</p>` : ''}
  </div>
  <dl class="facts"><div><dt>Stadyum</dt><dd>${esc(st.name)}</dd></div><div><dt>Konum</dt><dd>${esc(loc)}</dd></div><div><dt>Kapasite</dt><dd>${st.cap ? st.cap.toLocaleString('tr-TR') : 'bilinmiyor'}</dd></div><div><dt>Ülke</dt><dd>${COUNTRIES[st.country] ? COUNTRIES[st.country].name : esc(st.country)}</dd></div></dl>`;
  const h2h = M.filter((x) => x.id !== m.id && x.lg === m.lg && ((x.home === m.home && x.away === m.away) || (x.home === m.away && x.away === m.home)) && played(x));
  if (h2h.length) h += `<h3 class="sec">Bu sezon aralarında</h3>` + h2h.map((x) => row(x, { date: true, jump: true })).join('');
  const others = M.filter((x) => x.st === st && x.id !== m.id && x.date >= addDays(m.date, -10) && x.date <= addDays(m.date, 24));
  if (others.length) h += `<h3 class="sec">Bu stadyumda yakın tarihte</h3>` + others.map((x) => row(x, { date: true, jump: true, lg: true })).join('');
  h += `<p class="note">${esc(NOTE())} Stadyum modeli temsilidir, gerçek mimariyi birebir yansıtmaz.</p>`;
  panel.innerHTML = h;
  $('#stage-slot').replaceWith(stage); stage.hidden = false;
  const v = ensureViewer();
  if (v) {
    const key = st.id + m.id;
    if (viewerFor !== key) {
      const night = m.time >= '18:00'; stage.dataset.night = String(night);
      v.show(st.id, st.model, { night, auto: !reduced, home: TEAMS[m.home].c, away: TEAMS[m.away].c, board: sc ? `${TEAMS[m.home].short} ${sc[0]}-${sc[1]} ${TEAMS[m.away].short}` : `${TEAMS[m.home].short} - ${TEAMS[m.away].short}`, boardSub: sc ? (s === 'ft' ? 'MAÇ SONU' : 'CANLI') : m.time });
      viewerFor = key;
    }
    v.start(); syncStageUi();
  }
  $('#stage-title').textContent = st.name;
}
panel.addEventListener('click', (e) => {
  const b = e.target.closest('button, tr[data-team]'); if (!b) return;
  if (b.dataset.team) return pickTeam(b.dataset.team);
  if (b.dataset.m !== undefined && b.dataset.m !== '') return selectMatch(+b.dataset.m, !!b.dataset.jump);
  if (b.dataset.go) return setDate(b.dataset.go);
  if (b.dataset.lgo) return setLeague(b.dataset.lgo);
  if (b.dataset.tab) { S.tab = b.dataset.tab; render(); return; }
  if (b.dataset.round) { S.round = +b.dataset.round; renderPanel(); return; }
  if (b.dataset.act === 'round-map') { const r = S.round; S.mode = 'week'; setDate(b.dataset.d); S.round = r; S.tab = 'matches'; render(); return; }
  if (b.dataset.act === 'back') return back();
  if (b.dataset.act === 'clear-area') { S.area = null; render(); return flyToState(); }
  if (b.id === 'route-btn') { S.route = !S.route; S.match = null; render(); return flyToState(); }
});
panel.addEventListener('keydown', (e) => { const tr = e.target.closest('tr[data-team]'); if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pickTeam(tr.dataset.team); } });
panel.addEventListener('pointerover', (e) => { const c = e.target.closest('.mr'); const v = c ? +c.dataset.m : null; if (v !== S.hl) { S.hl = v; schedule(); } });
panel.addEventListener('pointerleave', () => { S.hl = null; schedule(); });
pinG.on('pointerover', (e) => { const g = e.target.closest('g.pin'); if (!g) return; const ids = new Set(select(g).datum().ms.map((m) => String(m.id))); panel.querySelectorAll('.mr').forEach((c) => c.classList.toggle('hl', ids.has(c.dataset.m))); })
  .on('pointerout', () => panel.querySelectorAll('.mr.hl').forEach((c) => c.classList.remove('hl')));

// ---------- üst kısım: lig şeridi, tarih şeridi, ülke sekmeleri
let railDone = false;
function renderRail() {
  if (railDone) { $('#rail').querySelectorAll('[data-lg]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lg === S.lg))); const on = $('#rail [aria-pressed=true]'); on && on.scrollIntoView({ block: 'nearest', inline: 'nearest' }); return; }
  railDone = true;
  $('#rail').innerHTML = Object.keys(THEMES).map((k) => `<button data-lg="${k}" aria-label="${THEMES[k].name}" aria-pressed="${S.lg === k}" style="--b:${THEMES[k].f1};--e2:${k === 'ALL' ? THEMES.ALL.f1 : '#fff'}">${emblem(k, 'emb-r')}<span>${THEMES[k].short}</span></button>`).join('');
}
$('#rail').addEventListener('click', (e) => { const b = e.target.closest('[data-lg]'); if (b) setLeague(b.dataset.lg); });
function renderStrip() {
  const ws = weekStart(S.date);
  $('#wk').innerHTML = esc(fmtWeek(ws)) + '<span class="yr"> ' + D(ws).getUTCFullYear() + '</span>';
  let h = '';
  for (let i = 0; i < 7; i++) {
    const d = addDays(ws, i), n = M.filter((m) => m.date === d && passFilters(m)).length;
    h += `<button class="day${S.mode === 'day' && d === S.date ? ' on' : ''}${n ? '' : ' none'}${d === TODAY ? ' today' : ''}" data-d="${d}" aria-pressed="${S.mode === 'day' && d === S.date}" aria-label="${esc(fmtDay(d))}, ${n} maç"><span class="dn">${d === TODAY ? 'Bugün' : fmt(d, { weekday: 'short' })}</span><span class="dd">${D(d).getUTCDate()}</span><span class="dc">${n || ''}</span></button>`;
  }
  $('#days').innerHTML = h;
  $('#days').classList.toggle('wk', S.mode === 'week');
  document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === S.mode)));
  $('#date').value = S.date;
}
$('#days').addEventListener('click', (e) => { const b = e.target.closest('.day'); if (!b) return; S.mode = 'day'; setDate(b.dataset.d); });
document.querySelectorAll('[data-mode]').forEach((b) => b.onclick = () => { S.mode = b.dataset.mode; S.match = null; autoCountry(); render(); flyToState(); });
$('#wprev').onclick = () => step(-1); $('#wnext').onclick = () => step(1);
function step(dir) { setDate(addDays(S.date, (S.mode === 'week' ? 7 : 1) * dir)); }
$('#date').onchange = (e) => { if (e.target.value) setDate(e.target.value); };
$('#date').min = M[0].date; $('#date').max = M[M.length - 1].date;

function renderTabs() {
  const vis = visible(), c = {}; for (const m of vis) c[ckey(m.st.country)] = (c[ckey(m.st.country)] || 0) + 1;
  $('#ctabs').innerHTML = Object.entries(COUNTRIES).map(([k, v]) => `<button data-c="${k}" aria-pressed="${S.country === k}"${c[k] ? '' : ' class="zero"'}>${v.name}<span>${c[k] || 0}</span></button>`).join('');
  const cr = [`<button data-cr="EU">Avrupa</button>`];
  if (S.country !== 'EU') cr.push(`<button data-cr="${S.country}">${COUNTRIES[S.country].name}</button>`);
  const area = S.area && AREAS.get(S.area); if (area) cr.push(`<button data-cr="area">${esc(area.name)}</button>`);
  if (S.match != null) cr.push(`<span>${esc(M[S.match].st.name)}</span>`);
  $('#crumbs').innerHTML = cr.join('<i aria-hidden="true">›</i>');
}
$('#ctabs').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; S.country = b.dataset.c; S.area = null; S.match = null; S.route = false; render(); flyToState(); });
$('#crumbs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cr]'); if (!b) return; const v = b.dataset.cr;
  if (v === 'EU') { S.country = 'EU'; S.area = null; S.match = null; }
  else if (v === 'area') { S.match = null; }
  else { S.area = null; S.match = null; }
  S.route = false; render(); flyToState();
});

// takım arama
const ti = $('#team'), tl = $('#teamlist'), tclear = $('#tclear');
let tIdx = -1;
function teamOptions() { const q = lc(ti.value.trim()); return Object.values(TEAMS).filter((t) => leagueOf(t.id) && (!q || lc(t.name).includes(q) || lc(t.short).includes(q))).sort((a, b) => a.name.localeCompare(b.name, 'tr')); }
function openList() {
  const opts = teamOptions();
  tl.innerHTML = opts.length ? opts.map((t, i) => `<li role="option" id="to-${t.id}" data-t="${t.id}" aria-selected="${i === tIdx}">${dot(t.id)}<span>${esc(t.name)}</span>${lgTag(leagueOf(t.id))}</li>`).join('') : '<li class="none">Takım bulunamadı</li>';
  tl.hidden = false; ti.setAttribute('aria-expanded', 'true');
  ti.setAttribute('aria-activedescendant', tIdx >= 0 && opts[tIdx] ? 'to-' + opts[tIdx].id : '');
}
function closeList() { tl.hidden = true; ti.setAttribute('aria-expanded', 'false'); tIdx = -1; }
function pickTeam(id) { ti.value = id ? TEAMS[id].name : ''; tclear.hidden = !id; closeList(); setTeam(id); }
ti.addEventListener('focus', () => { ti.select(); openList(); });
ti.addEventListener('input', () => { tIdx = 0; openList(); });
ti.addEventListener('keydown', (e) => {
  const opts = teamOptions();
  if (e.key === 'ArrowDown') { e.preventDefault(); tIdx = Math.min(opts.length - 1, tIdx + 1); openList(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); tIdx = Math.max(0, tIdx - 1); openList(); }
  else if (e.key === 'Enter') { e.preventDefault(); const t = opts[Math.max(0, tIdx)]; if (t) { pickTeam(t.id); ti.blur(); } }
  else if (e.key === 'Escape') { closeList(); ti.value = S.team ? TEAMS[S.team].name : ''; ti.blur(); }
});
ti.addEventListener('blur', () => setTimeout(() => { closeList(); ti.value = S.team ? TEAMS[S.team].name : ''; }, 150));
tl.addEventListener('mousedown', (e) => { const li = e.target.closest('[data-t]'); if (li) { e.preventDefault(); pickTeam(li.dataset.t); ti.blur(); } });
tclear.onclick = () => { pickTeam(null); };

document.addEventListener('keydown', (e) => {
  if (e.target.closest('input,textarea,select')) return;
  if (e.key === 'Escape') back();
  else if (e.key === 'ArrowLeft' && !e.target.closest('#map, #panel')) step(-1);
  else if (e.key === 'ArrowRight' && !e.target.closest('#map, #panel')) step(1);
});

function render() { renderRail(); renderBand(); renderStrip(); renderTabs(); renderPanel(); schedule(); }

// ---------- başlat
size();
let lastWH = '';
new ResizeObserver(() => {
  const r = $('#mapwrap').getBoundingClientRect(), wh = Math.round(r.width) + 'x' + Math.round(r.height); if (wh === lastWH) return; lastWH = wh;
  if (flying) { size(); flyToState(true); return; }
  const c = [(Wpx / 2 - T.x) / T.k, (Hpx / 2 - T.y) / T.k]; size(); svg.call(zb.transform, zoomIdentity.translate(Wpx / 2 - T.k * c[0], Hpx / 2 - T.k * c[1]).scale(T.k));
}).observe($('#mapwrap'));
autoCountry(); applyTheme(); render();
flyToState(true);
if (document.fonts) document.fonts.ready.then(() => { pinG.selectAll('g.pin').attr('data-sig', null); schedule(); });
window.__app = { S, selectMatch, setTeam, setDate, selectArea, setLeague, M, flyToState, standings, get T() { return T; } };
