// API anahtarı eklenmeden önce sitenin boş kalmaması için örnek (kurgusal) veri üretir: data/demo.json
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MATCHES, LEAGUE_TEAMS, CL_TEAMS, ROUNDS, PLAYERS } from '../src/season.js';
import { TEAMS, STADIUMS } from '../src/data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const today = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 16);
const played = (m) => m.date + 'T' + m.time < today;
const used = new Set([...Object.values(LEAGUE_TEAMS).flat(), ...CL_TEAMS]);

const teams = {}, venues = {};
for (const t of used) {
  const T = TEAMS[t], S = STADIUMS[T.home];
  teams[t] = { name: T.name, short: T.short || t, logo: null, c: T.c, venue: T.home, known: t };
  venues[T.home] = { name: S.name, city: S.city, cap: S.cap, country: S.country, lat: S.lat, lon: S.lon, known: T.home, colors: T.c };
}
const matches = MATCHES.map((m, i) => ({ id: 1000 + i, date: m.date, time: m.time, lg: m.lg, round: m.round, home: m.home, away: m.away, venue: TEAMS[m.home].home,
  s: played(m) ? 'FT' : 'NS', el: null, hs: played(m) ? m.hs : null, as: played(m) ? m.as : null }));
const events = {};
MATCHES.forEach((m, i) => { if (played(m)) events[1000 + i] = m.goals.map((g) => [g.team, g.pl, g.min, g.extra, g.own ? 'O' : g.pen ? 'P' : 'G']); });

const ZR = { SL: (p, n) => p === 1 ? 'cl' : p === 2 ? 'clq' : p === 3 ? 'el' : p === 4 ? 'ecl' : p > n - 3 ? 'rel' : '', CL: (p) => p <= 8 ? 'cl' : p <= 16 ? 'clq' : 'rel', _: (p, n) => p <= 3 ? 'cl' : p === 4 ? 'el' : p === 5 ? 'ecl' : p === n ? 'rel' : '' };
const leagues = {};
for (const lg of [...Object.keys(LEAGUE_TEAMS), 'CL']) {
  const ts = lg === 'CL' ? CL_TEAMS : LEAGUE_TEAMS[lg], R = {};
  for (const t of ts) R[t] = { t, p: 0, o: 0, g: 0, b: 0, m: 0, a: 0, y: 0 };
  const sc = new Map();
  MATCHES.forEach((m) => {
    if (m.lg !== lg || !played(m)) return;
    const h = R[m.home], w = R[m.away]; h.o++; w.o++; h.a += m.hs; h.y += m.as; w.a += m.as; w.y += m.hs;
    if (m.hs > m.as) { h.g++; w.m++; h.p += 3; } else if (m.hs < m.as) { w.g++; h.m++; w.p += 3; } else { h.b++; w.b++; h.p++; w.p++; }
    for (const g of m.goals) if (g.pl) { const o = sc.get(g.pl) || { name: g.pl, team: g.team, n: 0, pen: 0, apps: 0, ast: 0 }; o.n++; if (g.pen) o.pen++; sc.set(g.pl, o); }
  });
  const table = Object.values(R).sort((x, y) => y.p - x.p || (y.a - y.y) - (x.a - x.y) || y.a - x.a);
  table.forEach((r, i) => { r.pos = i + 1; r.z = (ZR[lg] || ZR._)(i + 1, table.length); });
  const zt = { cl: lg === 'CL' ? 'Son 16 (doğrudan)' : 'Şampiyonlar Ligi', clq: lg === 'CL' ? 'Play-off' : 'Şampiyonlar Ligi eleme', el: 'Avrupa Ligi', ecl: 'Konferans Ligi', rel: lg === 'CL' ? 'Elendi' : 'Küme düşme' };
  const labels = {}; for (let r = 1; r <= ROUNDS[lg]; r++) labels[r] = lg === 'CL' ? `${r}. maç günü` : `${r}. hafta`;
  leagues[lg] = { teams: ts, maxRound: ROUNDS[lg], roundLabels: labels, table, zones: [...new Set(table.map((r) => r.z).filter(Boolean))].map((z) => [z, zt[z]]),
    scorers: [...sc.values()].sort((a, b) => b.n - a.n || a.pen - b.pen).slice(0, 20) };
}
void PLAYERS;
await fs.mkdir(path.join(ROOT, 'data'), { recursive: true });
await fs.writeFile(path.join(ROOT, 'data', 'demo.json'), JSON.stringify({ meta: { season: 2026, label: '2026/27', updated: new Date().toISOString(), source: 'demo' }, leagues, teams, venues, matches, events }));
console.log('data/demo.json:', matches.length, 'maç');
