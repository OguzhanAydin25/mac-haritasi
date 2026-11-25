// 2026/27 örnek sezonu: fikstür, skorlar, golcüler. Tamamen deterministik (aynı veri her açılışta).
// Oyuncu adları KURGUSALDIR; skorlar ve istatistikler simülasyondur.
import { TEAMS, STADIUMS } from './data.js';

export const SEASON = '2026/27';
export const LEAGUE_TEAMS = {
  SL: ['GS', 'FB', 'BJK', 'TS', 'IBFK', 'SAM', 'GB', 'GFK', 'AMD', 'RIZ', 'KOC', 'KON', 'GOZ', 'KAS', 'EYP', 'ALN', 'COR', 'ERZ'],
  PL: ['CHE', 'ARS', 'LIV', 'MCI', 'MUN', 'TOT', 'NEW', 'AVL', 'EVE', 'WHU'],
  LL: ['RMA', 'ATM', 'BAR', 'SEV', 'BET', 'VAL', 'ATH', 'RSO', 'VIL', 'CEL'],
  BL: ['FCB', 'BVB', 'B04', 'RBL', 'VFB', 'SGE', 'SVW', 'BMG', 'HSV', 'KOE'],
  SA: ['INT', 'MIL', 'JUV', 'ROM', 'LAZ', 'NAP', 'ATA', 'FIO', 'BOL', 'TOR'],
  L1: ['PSG', 'OM', 'OL', 'LOSC', 'RCL', 'NIC', 'REN', 'NAN', 'STR', 'TFC'],
};
export const CL_TEAMS = ['BVB', 'CHE', 'BAR', 'PSG', 'NAP', 'B04', 'GS', 'FCB', 'RMA', 'MIL', 'LOSC', 'ATA', 'MCI', 'ARS', 'OM', 'ATM', 'LIV', 'INT', 'FB', 'JUV'];

// Güç puanları (simülasyon için, 0–100)
const STR = {
  GS: 80, FB: 79, BJK: 72, TS: 68, IBFK: 64, SAM: 62, GOZ: 60, KOC: 56, RIZ: 57, KON: 57, KAS: 56, EYP: 55, ALN: 55, GB: 53, GFK: 54, AMD: 54, COR: 51, ERZ: 52,
  MCI: 88, ARS: 89, LIV: 87, CHE: 83, NEW: 80, TOT: 77, AVL: 78, MUN: 76, WHU: 70, EVE: 69,
  RMA: 90, BAR: 89, ATM: 83, ATH: 78, VIL: 77, BET: 75, RSO: 74, SEV: 70, VAL: 69, CEL: 70,
  FCB: 90, B04: 82, BVB: 82, RBL: 80, VFB: 78, SGE: 77, SVW: 70, BMG: 70, HSV: 66, KOE: 67,
  INT: 86, NAP: 85, MIL: 81, JUV: 82, ATA: 80, ROM: 79, LAZ: 76, FIO: 74, BOL: 75, TOR: 69,
  PSG: 90, OM: 79, OL: 76, LOSC: 77, RCL: 75, NIC: 73, REN: 72, STR: 71, TFC: 68, NAN: 67,
};

// ---- yardımcılar
const D = (s) => new Date(s + 'T12:00:00Z');
const addDays = (s, n) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function strSeed(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function poisson(l, r) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= r(); } while (p > L && k < 9); return k - 1; }
const homeSt = (t) => TEAMS[t].home;

// Çember yöntemi: n takım (çift), n-1 tur. Her tur [ev, deplasman] çiftleri.
function circle(order) {
  const n = order.length, rounds = [];
  const fixed = order[0]; let rest = order.slice(1);
  for (let r = 0; r < n - 1; r++) {
    const rot = [fixed, ...rest], pairs = [];
    for (let i = 0; i < n / 2; i++) {
      const a = rot[i], b = rot[n - 1 - i];
      const homeA = i === 0 ? r % 2 === 0 : (i + r) % 2 === 1;
      pairs.push(homeA ? [a, b] : [b, a]);
    }
    rounds.push(pairs);
    rest = [rest[rest.length - 1], ...rest.slice(0, -1)];
  }
  return rounds;
}
// Aynı stadı paylaşan iki takım aynı turda evde oynamasın
function fixShared(pairs, locked = new Set(), homes = null) {
  const used = new Map();
  for (const p of pairs) {
    const s = homeSt(p[0]);
    if (used.has(s)) {
      const o = used.get(s);
      let q = homes && (homes[o[0]] || 0) > (homes[p[0]] || 0) ? o : p;
      if (locked.has(q.join('-'))) q = q === p ? o : p;
      q.reverse(); used.set(homeSt(o[0]), o);
    }
    used.set(homeSt(p[0]), p);
  }
  if (homes) for (const p of pairs) homes[p[0]] = (homes[p[0]] || 0) + 1;
  return pairs;
}

// ---- lig başlama tarihleri: 13. hafta = 9–15 Kasım 2026
const R13_MONDAY = '2026-11-09';
const weekMonday = (r) => addDays(R13_MONDAY, 7 * (r - 13));
// Saat dilimleri öncelik sırasıyla (en iyi saat en güçlü maça)
const SLOTS = {
  SL: [[6, '20:00'], [5, '20:00'], [4, '20:00'], [6, '17:00'], [5, '17:00'], [7, '20:00'], [6, '14:30'], [5, '14:30'], [4, '17:00']],
  PL: [[6, '19:30'], [5, '20:30'], [6, '17:00'], [5, '18:00'], [5, '15:30']],
  LL: [[5, '23:00'], [6, '23:00'], [6, '20:30'], [5, '18:15'], [4, '23:00']],
  BL: [[5, '20:30'], [4, '22:30'], [6, '19:30'], [5, '17:30'], [6, '17:30']],
  SA: [[6, '22:45'], [5, '22:45'], [5, '20:00'], [6, '17:00'], [6, '14:30']],
  L1: [[6, '22:45'], [4, '22:45'], [5, '23:05'], [5, '19:00'], [6, '17:00']],
};
// Kullanıcının örnek cuma maçları (13. hafta)
const SL_FORCED = [['AMD', 'RIZ', '14:30'], ['GB', 'GFK', '17:00'], ['GS', 'SAM', '20:00'], ['KOC', 'FB', '20:00']];

function leagueSchedule(lg) {
  let teams = LEAGUE_TEAMS[lg].slice();
  const forced = lg === 'SL' ? SL_FORCED : [];
  if (forced.length) {
    // zorunlu çiftleri 0. turda karşı karşıya gelecek şekilde diz
    const n = teams.length, order = new Array(n).fill(null);
    forced.forEach(([h, a], i) => { order[i] = h; order[n - 1 - i] = a; });
    const rest = teams.filter((t) => !order.includes(t)); let k = 0;
    for (let i = 0; i < n; i++) if (!order[i]) order[i] = rest[k++];
    teams = order;
  }
  // paylaşılan stadyumlu takımlar her turda zıt (biri evde, biri deplasmanda) olsun diye en iyi diziyi ara
  const shared = []; const byS = {};
  for (const t of teams) (byS[homeSt(t)] = byS[homeSt(t)] || []).push(t);
  for (const g of Object.values(byS)) if (g.length === 2) shared.push(g);
  const clash = (order) => { let c = 0; for (const pairs of circle(order)) { const h = new Set(pairs.map((p) => p[0])); for (const [a, b] of shared) if (h.has(a) === h.has(b)) c++; } return c; };
  const r = rng(strSeed(lg)); let best = teams.slice(), bc = shared.length ? clash(best) : 0;
  for (let k = 0; k < 3000 && bc > 0; k++) {
    const cand = teams.slice(), free = forced.length ? cand.map((_, i) => i).filter((i) => i >= forced.length && i < cand.length - forced.length) : cand.map((_, i) => i);
    for (let i = free.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cand[free[i]], cand[free[j]]] = [cand[free[j]], cand[free[i]]]; }
    const c = clash(cand); if (c < bc) { bc = c; best = cand; }
  }
  teams = best;
  const half = circle(teams);
  const lockedKeys = new Set(forced.map(([h, a]) => h + '-' + a));
  if (forced.length) for (const p of half[0]) { const f = forced.find(([h, a]) => (p[0] === a && p[1] === h)); if (f) p.reverse(); }
  const nR = half.length; // n-1
  const totalRounds = lg === 'SL' ? 2 * nR : 4 * nR; // 10'lu ligler dört devreli
  const out = [], homes = {};
  for (let r = 1; r <= totalRounds; r++) {
    const ci = (((r - 13) % nR) + nR) % nR;          // 13. hafta = çember turu 0
    const leg = Math.floor((r - 1) / nR);
    const pairs = half[ci].map((p) => (leg % 2 ? [p[1], p[0]] : [p[0], p[1]]));
    fixShared(pairs, r === 13 ? lockedKeys : new Set(), homes);
    const mon = weekMonday(r);
    if (lg === 'SL' && r === 13) {
      const fr = pairs.filter((p) => forced.some(([h, a]) => h === p[0] && a === p[1]));
      const others = pairs.filter((p) => !fr.includes(p)).sort((a, b) => STR[b[0]] + STR[b[1]] - STR[a[0]] - STR[a[1]]);
      fr.forEach((p) => out.push({ date: addDays(mon, 4), time: forced.find((f) => f[0] === p[0])[2], lg, home: p[0], away: p[1], round: r }));
      const sl = [[6, '20:00'], [5, '20:00'], [6, '17:00'], [5, '17:00'], [6, '14:30']];
      others.forEach((p, i) => out.push({ date: addDays(mon, sl[i][0]), time: sl[i][1], lg, home: p[0], away: p[1], round: r }));
      continue;
    }
    const ranked = pairs.slice().sort((a, b) => STR[b[0]] + STR[b[1]] - STR[a[0]] - STR[a[1]]);
    ranked.forEach((p, i) => { const [dd, t] = SLOTS[lg][i]; out.push({ date: addDays(mon, dd), time: t, lg, home: p[0], away: p[1], round: r }); });
  }
  return out;
}

// Şampiyonlar Ligi lig aşaması: 8 maç günü, 5. maç günü kullanıcının seçtiği eşleşmeler
const CL_DAYS = ['2026-09-15', '2026-09-29', '2026-10-20', '2026-11-03', '2026-11-24', '2026-12-08', '2027-01-19', '2027-01-27'];
const CL_MD5 = [['BVB', 'JUV'], ['CHE', 'FB'], ['BAR', 'INT'], ['PSG', 'LIV'], ['NAP', 'ATM'], ['B04', 'OM'], ['GS', 'ARS'], ['FCB', 'MCI'], ['RMA', 'ATA'], ['MIL', 'LOSC']];
function clSchedule() {
  const n = 20, order = new Array(n);
  CL_MD5.forEach(([h, a], i) => { order[i] = h; order[n - 1 - i] = a; });
  const rounds = circle(order);
  for (const p of rounds[0]) if (CL_MD5.some(([h, a]) => h === p[1] && a === p[0])) p.reverse();
  const pick = [3, 7, 11, 15, 0, 5, 9, 13]; // maç günü → çember turu
  const out = [];
  pick.forEach((ci, md) => {
    const pairs = rounds[ci].map((p) => p.slice());
    if (md !== 4) fixShared(pairs);
    const ranked = pairs.slice().sort((a, b) => STR[b[0]] + STR[b[1]] - STR[a[0]] - STR[a[1]]);
    ranked.forEach((p, i) => {
      let date = CL_DAYS[md], time = i % 5 < 2 ? '20:45' : '23:00';
      if (md === 4) { // kullanıcının seçtiği günler
        const tue = ['BVB', 'CHE', 'BAR', 'PSG', 'NAP'].includes(p[0]);
        date = tue ? '2026-11-24' : '2026-11-25'; time = ['BVB', 'B04'].includes(p[0]) ? '20:45' : '23:00';
      } else if (md === 7) time = '23:00';
      else if (i % 2) date = addDays(date, 1);
      out.push({ date, time, lg: 'CL', home: p[0], away: p[1], round: md + 1 });
    });
  });
  return out;
}

// ---- kurgusal oyuncular
const NAMES = {
  TR: [['Emre', 'Burak', 'Kerem', 'Arda', 'Barış', 'Mert', 'Oğuz', 'Yusuf', 'Efe', 'Kaan', 'Onur', 'Umut', 'Tolga', 'Batuhan', 'Ozan', 'Furkan', 'Semih', 'Alper'],
    ['Yılmaz', 'Aydın', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Öztürk', 'Arslan', 'Doğan', 'Kılıç', 'Koç', 'Kurt', 'Aksoy', 'Polat', 'Erdem', 'Tekin', 'Uysal', 'Bulut', 'Karaca', 'Güneş']],
  GB: [['Jack', 'Harry', 'Callum', 'Oliver', 'Mason', 'Reece', 'Tom', 'Ben', 'Lewis', 'Ryan', 'Josh', 'Archie', 'Liam', 'Ethan'],
    ['Walker', 'Hughes', 'Bennett', 'Clarke', 'Turner', 'Ward', 'Price', 'Carter', 'Morgan', 'Fletcher', 'Holmes', 'Barker', 'Lloyd', 'Shaw', 'Dixon']],
  ES: [['Pablo', 'Javier', 'Álvaro', 'Sergio', 'Iker', 'Marcos', 'Rubén', 'Adrián', 'Hugo', 'Raúl', 'Unai', 'Diego', 'Asier', 'Nacho'],
    ['García', 'Romero', 'Navarro', 'Moreno', 'Ortega', 'Serrano', 'Molina', 'Castillo', 'Rubio', 'Delgado', 'Iglesias', 'Vidal', 'Herrera', 'Prieto', 'Campos']],
  DE: [['Lukas', 'Jonas', 'Felix', 'Leon', 'Niklas', 'Tim', 'Jannik', 'Moritz', 'Paul', 'Kai', 'Finn', 'Luca', 'Max', 'Ben'],
    ['Becker', 'Wagner', 'Hoffmann', 'Schäfer', 'Koch', 'Richter', 'Wolf', 'Krüger', 'Brandt', 'Vogel', 'Lange', 'Hartmann', 'Keller', 'Franke', 'Seidel']],
  IT: [['Lorenzo', 'Matteo', 'Andrea', 'Davide', 'Federico', 'Simone', 'Riccardo', 'Alessio', 'Nicolò', 'Gianluca', 'Tommaso', 'Pietro', 'Edoardo', 'Samuele'],
    ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Greco', 'Conti', 'Marino', 'Gallo', 'Lombardi', 'Fontana', 'Moretti', 'Caruso']],
  FR: [['Lucas', 'Hugo', 'Théo', 'Mathis', 'Enzo', 'Maxime', 'Antoine', 'Clément', 'Yanis', 'Rayan', 'Nolan', 'Bastien', 'Quentin', 'Kylian'],
    ['Martin', 'Bernard', 'Dubois', 'Moreau', 'Laurent', 'Lefèvre', 'Girard', 'Roux', 'Fontaine', 'Mercier', 'Garnier', 'Chevalier', 'Perrin', 'Morel', 'Leclerc']],
  X: [['Moussa', 'Lucas', 'Mateo', 'Ivan', 'Kofi', 'Diego', 'Tomás', 'Nikola', 'Samuel', 'André', 'Viktor', 'Youssef', 'Joel', 'Aleksandar', 'Bruno', 'Ismaël', 'Rafael', 'Darko'],
    ['Diallo', 'Ferreira', 'Marić', 'Osei', 'Novak', 'Costa', 'Mendes', 'Petrović', 'Traoré', 'Silva', 'Kovač', 'Mensah', 'Lindqvist', 'Haddad', 'Okafor', 'Jansen', 'Andersen', 'Sørensen']],
};
const ROLE_W = [0.28, 0.17, 0.13, 0.1, 0.08, 0.06, 0.05, 0.04, 0.035, 0.025, 0.02];
const POS = ['Forvet', 'Kanat', 'Ofansif orta saha', 'Kanat', 'Forvet', 'Orta saha', 'Orta saha', 'Bek', 'Stoper', 'Bek', 'Stoper'];
export const PLAYERS = {}; // takım → [{name, pos, w}]
const usedNames = new Set();
function makeRoster(t) {
  const c = STADIUMS[TEAMS[t].home].country, r = rng(strSeed('roster' + t)), out = [];
  for (let i = 0; i < 11; i++) {
    const pool = r() < (c === 'TR' ? 0.45 : 0.4) ? NAMES.X : NAMES[c];
    let name, tries = 0;
    do { name = pool[0][Math.floor(r() * pool[0].length)] + ' ' + pool[1][Math.floor(r() * pool[1].length)]; tries++; } while ((usedNames.has(name) || out.some((o) => o.name.split(' ')[0] === name.split(' ')[0] || o.name.split(' ')[1] === name.split(' ')[1])) && tries < 80);
    usedNames.add(name);
    out.push({ name, pos: POS[i], w: ROLE_W[i] * (0.75 + r() * 0.5), team: t });
  }
  return out;
}
for (const t of new Set([...Object.values(LEAGUE_TEAMS).flat(), ...CL_TEAMS])) PLAYERS[t] = makeRoster(t);

// ---- skor simülasyonu
function simulate(m) {
  const r = rng(strSeed(m.lg + m.date + m.home + m.away));
  const d = (STR[m.home] - STR[m.away]) / 22;
  const lh = Math.max(0.25, 1.38 * Math.exp(d * 0.55)) * 1.08, la = Math.max(0.2, 1.12 * Math.exp(-d * 0.55));
  m.hs = poisson(lh, r); m.as = poisson(la, r);
  const goals = [];
  const pick = (t) => { const ps = PLAYERS[t], tot = ps.reduce((a, p) => a + p.w, 0); let x = r() * tot; for (const p of ps) { x -= p.w; if (x <= 0) return p; } return ps[0]; };
  for (const [t, n] of [[m.home, m.hs], [m.away, m.as]]) for (let i = 0; i < n; i++) {
    const p = pick(t), own = r() < 0.03, pen = !own && r() < 0.12;
    let min = 1 + Math.floor(r() * 90); const extra = min === 90 || (min === 45 && r() < 0.5) ? 1 + Math.floor(r() * 5) : 0;
    goals.push({ team: t, pl: own ? null : p.name, min, extra, own, pen });
  }
  goals.sort((a, b) => a.min - b.min || a.extra - b.extra);
  m.goals = goals;
  m.att = Math.round(STADIUMS[TEAMS[m.home].home].cap * (0.82 + r() * 0.17));
}

export const MATCHES = [...Object.keys(LEAGUE_TEAMS).flatMap(leagueSchedule), ...clSchedule()]
  .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
MATCHES.forEach((m, i) => { m.id = i; simulate(m); });
export const ROUNDS = Object.fromEntries([...Object.keys(LEAGUE_TEAMS), 'CL'].map((lg) => [lg, Math.max(...MATCHES.filter((m) => m.lg === lg).map((m) => m.round))]));
export { STR };
