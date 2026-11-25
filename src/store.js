// Çalışma anında doldurulan veri deposu. boot.js, data/season.json dosyasını okuyup burayı doldurur.
import { KNOWN_STADIUMS } from './known.js';
import { autoModel } from './automodel.js';

export const TEAMS = {};
export const STADIUMS = {};
export const MATCHES = [];
export const LEAGUE_TEAMS = {};
export const CL_TEAMS = [];
export const ROUNDS = {};
export const ROUND_LABELS = {};
export const TABLES = {};
export const SCORERS = {};
export const META = {};
export let SEASON = '';

const STATUS = (s) => (['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(s) ? 'ft' : ['NS', 'TBD'].includes(s) ? 'pre' : ['PST', 'CANC', 'ABD'].includes(s) ? 'pst' : 'live');

export function fill(d, events = {}) {
  Object.assign(META, d.meta || {});
  SEASON = d.meta.label;
  for (const [id, t] of Object.entries(d.teams)) {
    TEAMS[id] = { id, name: t.name, short: t.short, c: t.c, logo: t.logo || null, home: t.venue != null ? 'v' + t.venue : null };
  }
  for (const [id, v] of Object.entries(d.venues)) {
    if (v.lat == null || v.lon == null) continue;
    const known = v.known && KNOWN_STADIUMS[v.known];
    const colors = v.colors || ['#888888', '#ffffff'];
    STADIUMS['v' + id] = {
      name: v.name, country: v.country || 'XX', city: v.city || '', lon: v.lon, lat: v.lat, cap: v.cap || (known && known.cap) || 0,
      area: known && known.area, model: known ? known.model : autoModel(String(id), v.cap || 20000, colors),
    };
  }
  for (const [lg, L] of Object.entries(d.leagues)) {
    if (lg === 'CL') CL_TEAMS.push(...L.teams); else LEAGUE_TEAMS[lg] = L.teams;
    ROUNDS[lg] = L.maxRound; ROUND_LABELS[lg] = L.roundLabels || {};
    TABLES[lg] = L.table || [];
    (TABLES.__zones = TABLES.__zones || {})[lg] = L.zones || [];
    SCORERS[lg] = L.scorers || [];
  }
  let i = 0;
  for (const m of d.matches) {
    const venue = 'v' + m.venue;
    const st = STADIUMS[venue] || (TEAMS[m.home] && STADIUMS[TEAMS[m.home].home]);
    if (!st || !TEAMS[m.home] || !TEAMS[m.away]) continue;
    const ev = events[m.id];
    MATCHES.push({
      id: i++, fid: m.id, date: m.date, time: m.time, lg: m.lg, round: m.round, home: m.home, away: m.away, venue: STADIUMS[venue] ? venue : TEAMS[m.home].home,
      status: STATUS(m.s), elapsed: m.el ?? null, hs: m.hs ?? null, as: m.as ?? null,
      goals: ev ? ev.map(([team, pl, min, extra, type]) => ({ team: String(team), pl: type === 'O' ? null : pl, min, extra: extra || 0, own: type === 'O', pen: type === 'P' })) : null,
    });
  }
  MATCHES.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  MATCHES.forEach((m, k) => { m.id = k; });
}
