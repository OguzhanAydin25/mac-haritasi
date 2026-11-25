import { EU_TEAMS, EU_STADIUMS } from './data_eu.js';
// Örnek veri. Gerçek sürümde bu dosyanın yerini bir API / veritabanı alacak.
// Saatler Türkiye saatidir. Koordinatlar ve kapasiteler yaklaşıktır.

export const LEAGUES = {
  SL: { name: 'Süper Lig', short: 'SL' },
  PL: { name: 'Premier League', short: 'PL' },
  LL: { name: 'LaLiga', short: 'LL' },
  BL: { name: 'Bundesliga', short: 'BL' },
  SA: { name: 'Serie A', short: 'SA' },
  L1: { name: 'Ligue 1', short: 'L1' },
  CL: { name: 'Şampiyonlar Ligi', short: 'ŞL' },
};

export const COUNTRIES = {
  TR: { name: 'Türkiye' },
  GB: { name: 'İngiltere' },
  ES: { name: 'İspanya' },
  FR: { name: 'Fransa' },
  DE: { name: 'Almanya' },
  IT: { name: 'İtalya' },
};

export const TEAMS = {
  GS:  { name: 'Galatasaray', c: ['#A90432', '#FDB912'], home: 'rams' },
  FB:  { name: 'Fenerbahçe', c: ['#13235B', '#FFE500'], home: 'ulker' },
  BJK: { name: 'Beşiktaş', c: ['#111111', '#FFFFFF'], home: 'tupras' },
  TS:  { name: 'Trabzonspor', c: ['#6C1D45', '#79C3EA'], home: 'papara' },
  IBFK:{ name: 'Başakşehir', c: ['#F26A21', '#1B2A4A'], home: 'basak', short: 'İBFK' },
  SAM: { name: 'Samsunspor', c: ['#D71920', '#FFFFFF'], home: 'samsun' },
  GB:  { name: 'Gençlerbirliği', c: ['#E30613', '#111111'], home: 'eryaman' },
  GFK: { name: 'Gaziantep', c: ['#C8102E', '#111111'], home: 'gaziantep' },
  AMD: { name: 'Amedspor', c: ['#C8102E', '#00843D'], home: 'diyarbakir' },
  RIZ: { name: 'Rizespor', c: ['#00843D', '#0057B8'], home: 'rize', short: 'RİZ' },
  KOC: { name: 'Kocaelispor', c: ['#00873E', '#111111'], home: 'kocaeli' },
  KON: { name: 'Konyaspor', c: ['#00843D', '#FFFFFF'], home: 'konya' },
  GOZ: { name: 'Göztepe', c: ['#FFD200', '#E31E24'], home: 'gursel', short: 'GÖZ' },
  KAS: { name: 'Kasımpaşa', c: ['#0B2D6B', '#FFFFFF'], home: 'rte', short: 'KSP' },
  EYP: { name: 'Eyüpspor', c: ['#5B2A86', '#FFD200'], home: 'rte', short: 'EYÜ' },
  ALN: { name: 'Alanyaspor', c: ['#F58220', '#00843D'], home: 'alanya' },
  COR: { name: 'Çorum', c: ['#D6001C', '#111111'], home: 'corum', short: 'ÇOR' },
  ERZ: { name: 'Erzurumspor', c: ['#1E5AA8', '#FFFFFF'], home: 'kazimkarabekir' },
  CHE: { name: 'Chelsea', c: ['#034694', '#FFFFFF'], home: 'stamford' },
  ARS: { name: 'Arsenal', c: ['#EF0107', '#FFFFFF'], home: 'emirates' },
  LIV: { name: 'Liverpool', c: ['#C8102E', '#F6EB61'], home: 'anfield' },
  MCI: { name: 'Manchester City', c: ['#6CABDD', '#1C2C5B'], home: 'etihad' },
  MUN: { name: 'Manchester United', c: ['#DA291C', '#111111'], home: 'oldtrafford' },
  TOT: { name: 'Tottenham', c: ['#132257', '#FFFFFF'], home: 'tottenham' },
};

// model: 3D üretici parametreleri (stadium3d.js). Modeller temsilidir.
export const STADIUMS = {
  rams: {
    name: 'RAMS Park', country: 'TR', city: 'İstanbul', lon: 28.9906, lat: 41.1034, cap: 52000,
    model: {
      a: 58, b: 39, R: 9, round: false,
      tiers: [{ rows: 22 }, { rows: 18, box: 4, overhang: 4 }],
      mul: [[1.08, 1], [0.95, 1], [1.08, 1], [0.95, 1]],
      seats: { type: 'sides', colors: ['#B1122F', '#F2B705', '#B1122F', '#F2B705'] },
      facade: { tex: 'louvers', colors: ['#F2F2EE', '#C9CDD2', '#B1122F'], lean: 0.08 },
      roof: { type: 'membrane', inner: -2 },
      lights: 'roof', setting: { kind: 'suburban', road: true },
    },
  },
  ulker: {
    name: 'Ülker Stadyumu', country: 'TR', city: 'İstanbul', lon: 29.0368, lat: 40.9877, cap: 47000,
    model: {
      a: 56, b: 37, R: 3, round: false,
      tiers: [{ rows: 20, rise: 0.5 }, { rows: 20, box: 5, overhang: 5, rise: 0.62 }],
      mul: [[1.15, 1.05], [1, 1], [1.15, 1.05], [1, 1]],
      seats: { type: 'stripes', colors: ['#FFE500', '#13235B'], band: 9 },
      facade: { tex: 'glassgrid', colors: ['#13235B', '#2B3F86', '#FFE500'] },
      roof: { type: 'metal', inner: -1, color: '#5E6670' },
      lights: 'roof', setting: { kind: 'urban' },
    },
  },
  tupras: {
    name: 'Tüpraş Stadyumu', country: 'TR', city: 'İstanbul', lon: 29.0072, lat: 41.0393, cap: 42000,
    model: {
      a: 57, b: 38, R: 6, round: false,
      tiers: [{ rows: 20 }, { rows: 16, box: 4, overhang: 3 }],
      mul: [[1.1, 1], [0.92, 0.95], [1.1, 1], [1, 1]],
      seats: { type: 'blocks', colors: ['#141414', '#F4F4F4'], band: 14 },
      facade: { tex: 'arches', colors: ['#E9E3D6', '#CFC6B4', '#8F8676'] },
      roof: { type: 'membrane', inner: 0 },
      lights: 'roof', setting: { kind: 'urban', water: { axis: 'x', sign: 1, from: 150 } },
    },
  },
  basak: {
    name: 'Başakşehir Fatih Terim Stadyumu', country: 'TR', city: 'İstanbul', lon: 28.8078, lat: 41.0875, cap: 17000,
    model: {
      a: 56, b: 37, R: 5, round: false,
      tiers: [{ rows: 24 }],
      mul: [[1.15, 1.2], [0.85, 0.85], [1, 1], [0.85, 0.85]],
      seats: { type: 'stripes', colors: ['#F26A21', '#1B2A4A'], band: 6 },
      facade: { tex: 'panels', colors: ['#1B2A4A', '#F26A21', '#2D3E60'] },
      roof: { type: 'metal', inner: 2, color: '#8C949C' },
      lights: 'roof', setting: { kind: 'suburban' },
    },
  },
  eryaman: {
    name: 'Eryaman Stadyumu', country: 'TR', city: 'Ankara', lon: 32.6230, lat: 39.9711, cap: 20000,
    model: {
      a: 57, b: 38, R: 14, round: true,
      tiers: [{ rows: 26 }],
      mul: [[1.1, 1.1], [0.95, 0.9], [1.1, 1.1], [0.95, 0.9]],
      seats: { type: 'mosaic', colors: ['#E30613', '#1A1A1A', '#E30613', '#9AA0A6', '#FFFFFF'] },
      facade: { tex: 'panels', colors: ['#B9BEC4', '#E30613', '#8A9097'] },
      roof: { type: 'metal', inner: 1, color: '#A6ADB4' },
      lights: 'roof', setting: { kind: 'suburban' },
    },
  },
  diyarbakir: {
    name: 'Diyarbakır Stadyumu', country: 'TR', city: 'Diyarbakır', lon: 40.1700, lat: 37.9600, cap: 33000,
    model: {
      a: 58, b: 39, R: 22, round: true,
      tiers: [{ rows: 26 }, { rows: 10, box: 3, overhang: 2 }],
      mul: [[1.15, 1.1], [0.9, 0.85], [1.15, 1.1], [0.9, 0.85]],
      seats: { type: 'sides', colors: ['#C8102E', '#00843D', '#C8102E', '#00843D'] },
      facade: { tex: 'basalt', colors: ['#2E2E30', '#4A4A4E', '#C8102E'] },
      roof: { type: 'metal', inner: 3, color: '#D7DADF' },
      lights: 'roof', setting: { kind: 'open' },
    },
  },
  kocaeli: {
    name: 'Kocaeli Stadyumu', country: 'TR', city: 'Kocaeli', lon: 29.9820, lat: 40.7720, cap: 34000,
    model: {
      a: 57, b: 38, R: 7, round: false,
      tiers: [{ rows: 20 }, { rows: 14, box: 4, overhang: 3 }],
      mul: [[1.1, 1.05], [0.95, 0.95], [1.1, 1.05], [0.95, 0.95]],
      seats: { type: 'stripes', colors: ['#00873E', '#121212'], band: 7 },
      facade: { tex: 'glassgrid', colors: ['#1F5B3A', '#2F7A50', '#D9E3DC'] },
      roof: { type: 'metal', inner: 0, color: '#C8CDD2', arches: 2 },
      lights: 'roof', setting: { kind: 'suburban', hills: true },
    },
  },
  konya: {
    name: 'Konya Büyükşehir Stadyumu', country: 'TR', city: 'Konya', lon: 32.4897, lat: 37.9497, cap: 42000,
    model: {
      a: 58, b: 40, R: 34, round: true,
      tiers: [{ rows: 22 }, { rows: 14, box: 4, overhang: 3 }],
      mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
      seats: { type: 'tiers', colors: ['#00843D', '#F2F2F2'] },
      facade: { tex: 'hex', colors: ['#F5F5F2', '#1E6B3F', '#D8DCD6'], lean: -0.05 },
      roof: { type: 'glass', inner: 2 },
      lights: 'roof', setting: { kind: 'open' },
    },
  },
  gursel: {
    name: 'Gürsel Aksel Stadyumu', country: 'TR', city: 'İzmir', lon: 27.0838, lat: 38.3957, cap: 20000,
    model: {
      a: 56, b: 37, R: 2, round: false, sep: true,
      tiers: [{ rows: 22 }],
      mul: [[1.15, 1.15], [0.9, 0.85], [1, 1], [0.9, 0.85]],
      seats: { type: 'sides', colors: ['#FFD200', '#E31E24', '#FFD200', '#E31E24'] },
      facade: { tex: 'panels', colors: ['#FFD200', '#E31E24', '#F3E9C6'] },
      roof: { type: 'membrane', inner: 3 },
      lights: 'towers', setting: { kind: 'urban', water: { axis: 'z', sign: -1, from: 230 } },
    },
  },
  gaziantep: {
    name: 'Gaziantep Stadyumu', country: 'TR', city: 'Gaziantep', lon: 37.3120, lat: 37.0476, cap: 33000,
    model: {
      a: 58, b: 39, R: 18, round: true,
      tiers: [{ rows: 22 }, { rows: 12, box: 3, overhang: 2 }],
      mul: [[1.1, 1.1], [0.95, 0.95], [1.1, 1.1], [0.95, 0.95]],
      seats: { type: 'mosaic', colors: ['#C8102E', '#C8102E', '#1A1A1A', '#C8102E'] },
      facade: { tex: 'ribbons', colors: ['#E2DCCF', '#C8102E', '#B9B1A0'] },
      roof: { type: 'metal', inner: 1, color: '#B4BAC0' },
      lights: 'roof', setting: { kind: 'open' },
    },
  },
  samsun: {
    name: 'Samsun Yeni 19 Mayıs Stadyumu', country: 'TR', city: 'Samsun', lon: 36.4566, lat: 41.2346, cap: 33000,
    model: {
      a: 57, b: 38, R: 16, round: true,
      tiers: [{ rows: 28 }],
      mul: [[1.15, 1.2], [0.95, 0.9], [1.15, 1.2], [0.95, 0.9]],
      seats: { type: 'sides', colors: ['#D71920', '#F4F4F4', '#D71920', '#F4F4F4'] },
      facade: { tex: 'ribbons', colors: ['#F4F4F4', '#D71920', '#DADADA'], lean: 0.1 },
      roof: { type: 'membrane', inner: 1, wave: 2 },
      lights: 'roof', setting: { kind: 'suburban', water: { axis: 'z', sign: 1, from: 260 } },
    },
  },
  papara: {
    name: 'Papara Park', country: 'TR', city: 'Trabzon', lon: 39.6550, lat: 40.9900, cap: 40000,
    model: {
      a: 57, b: 38, R: 10, round: false,
      tiers: [{ rows: 20 }, { rows: 16, box: 4, overhang: 3 }],
      mul: [[1.1, 1.05], [0.95, 0.95], [1.1, 1.05], [0.95, 0.95]],
      seats: { type: 'stripes', colors: ['#6C1D45', '#79C3EA'], band: 11 },
      facade: { tex: 'louvers', colors: ['#EDEFF1', '#6C1D45', '#79C3EA'] },
      roof: { type: 'membrane', inner: -1, wave: 2.6 },
      lights: 'roof', setting: { kind: 'suburban', water: { axis: 'z', sign: 1, from: 170 }, hills: true },
    },
  },
  rize: {
    name: 'Çaykur Didi Stadyumu', country: 'TR', city: 'Rize', lon: 40.5140, lat: 41.0330, cap: 15000,
    model: {
      a: 56, b: 37, R: 2, round: false, sep: true, cornerFill: true,
      tiers: [{ rows: 18 }],
      mul: [[1.2, 1.25], [0.85, 0.8], [1, 1], [0.85, 0.8]],
      seats: { type: 'sides', colors: ['#00843D', '#0057B8', '#00843D', '#0057B8'] },
      facade: { tex: 'panels', colors: ['#00843D', '#0057B8', '#E8EEF0'] },
      roof: { type: 'metal', inner: 4, color: '#8E989F' },
      lights: 'towers', setting: { kind: 'suburban', water: { axis: 'z', sign: 1, from: 150 }, hills: true },
    },
  },
  stamford: {
    name: 'Stamford Bridge', country: 'GB', city: 'Londra', area: 'London', lon: -0.1910, lat: 51.4817, cap: 40000,
    model: {
      a: 55, b: 36, R: 2, round: false, sep: true, cornerFill: true,
      tiers: [{ rows: 18 }, { rows: 14, box: 4, overhang: 3 }],
      mul: [[1.0, 1.0], [0.95, 0.95], [1.12, 1.15], [0.95, 0.95]],
      seats: { type: 'solid', colors: ['#034694'] },
      facade: { tex: 'brick', colors: ['#8B4A3A', '#6E3A2E', '#D9D2C4'] },
      roof: { type: 'metal', inner: 1, color: '#6F7A84' },
      lights: 'roof', setting: { kind: 'terraced', rail: true },
    },
  },
  emirates: {
    name: 'Emirates Stadium', country: 'GB', city: 'Londra', area: 'London', lon: -0.1084, lat: 51.5549, cap: 60000,
    model: {
      a: 58, b: 40, R: 32, round: true,
      tiers: [{ rows: 26 }, { rows: 6, box: 5, overhang: 2 }, { rows: 20, box: 3, overhang: 3, rise: 0.6 }],
      mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
      seats: { type: 'tiers', colors: ['#D6111E', '#E8E8E8', '#D6111E'] },
      facade: { tex: 'glassgrid', colors: ['#3E4A55', '#7E8A96', '#D6111E'] },
      roof: { type: 'glass', inner: 0 },
      lights: 'roof', setting: { kind: 'terraced', rail: true },
    },
  },
  tottenham: {
    name: 'Tottenham Hotspur Stadium', country: 'GB', city: 'Londra', area: 'London', lon: -0.0664, lat: 51.6043, cap: 62000,
    model: {
      a: 57, b: 38, R: 8, round: false,
      tiers: [{ rows: 24 }, { rows: 18, box: 5, overhang: 4, rise: 0.6 }],
      mul: [[1.1, 1.05], [0.95, 0.95], [1.1, 1.05], [1.35, 1.35]],
      seats: { type: 'solid', colors: ['#132257'] },
      facade: { tex: 'glassgrid', colors: ['#2E3540', '#A7B0BA', '#132257'] },
      roof: { type: 'glass', inner: -1 },
      lights: 'roof', setting: { kind: 'urban' },
    },
  },
  anfield: {
    name: 'Anfield', country: 'GB', city: 'Liverpool', area: 'Liverpool', lon: -2.9608, lat: 53.4308, cap: 61000,
    model: {
      a: 55, b: 36, R: 3, round: false,
      tiers: [{ rows: 22 }, { rows: 18, box: 4, overhang: 3 }],
      mul: [[1.4, 1.45], [1.05, 1.1], [1, 1], [1.05, 1.05]],
      seats: { type: 'solid', colors: ['#C8102E'] },
      facade: { tex: 'brick', colors: ['#9A3B33', '#7A2E28', '#DADADA'] },
      roof: { type: 'metal', inner: 1, color: '#D4D7DA' },
      lights: 'roof', setting: { kind: 'terraced', park: true },
    },
  },
  etihad: {
    name: 'Etihad Stadium', country: 'GB', city: 'Manchester', area: 'Manchester', lon: -2.2004, lat: 53.4831, cap: 53000,
    model: {
      a: 58, b: 39, R: 20, round: true,
      tiers: [{ rows: 22 }, { rows: 18, box: 4, overhang: 3 }],
      mul: [[1.05, 1], [1.05, 1.05], [1.05, 1], [1.05, 1.05]],
      seats: { type: 'mosaic', colors: ['#6CABDD', '#6CABDD', '#1C2C5B'] },
      facade: { tex: 'glassgrid', colors: ['#9FB2C2', '#DCE6EE', '#6CABDD'] },
      roof: { type: 'metal', inner: 0, color: '#C9D0D6', masts: 12 },
      cornerTowers: true,
      lights: 'roof', setting: { kind: 'open' },
    },
  },
  oldtrafford: {
    name: 'Old Trafford', country: 'GB', city: 'Manchester', area: 'Manchester', lon: -2.2913, lat: 53.4631, cap: 74000,
    model: {
      a: 56, b: 37, R: 4, round: false,
      tiers: [{ rows: 22 }, { rows: 22, box: 4, overhang: 4, rise: 0.6 }],
      mul: [[1.15, 1.1], [1.1, 1.1], [1.0, 0.8], [1.1, 1.1]],
      seats: { type: 'solid', colors: ['#C1121F'] },
      facade: { tex: 'brick', colors: ['#7C3A30', '#5D2C25', '#C8C8C8'] },
      roof: { type: 'metal', inner: -1, color: '#9AA3AB', ribs: true },
      lights: 'roof', setting: { kind: 'urban', rail: true, water: { axis: 'z', sign: -1, from: 210 } },
    },
  },
  rte: {
    name: 'Recep Tayyip Erdoğan Stadyumu', country: 'TR', city: 'İstanbul', lon: 28.9700, lat: 41.0420, cap: 14000,
    model: {
      a: 55, b: 36, R: 2, round: false, sep: true, tiers: [{ rows: 18 }],
      mul: [[1.15, 1.2], [0.85, 0.85], [1, 1], [0.85, 0.85]],
      seats: { type: 'sides', colors: ['#0B2D6B', '#FFFFFF', '#0B2D6B', '#FFFFFF'] },
      facade: { tex: 'panels', colors: ['#0B2D6B', '#FFFFFF', '#D5DAE3'] },
      roof: { type: 'metal', open: 0.3, color: '#9AA3AB' }, lights: 'towers', setting: { kind: 'urban', hills: true },
    },
  },
  alanya: {
    name: 'Alanya Oba Stadyumu', country: 'TR', city: 'Alanya', lon: 31.9930, lat: 36.5530, cap: 10000,
    model: {
      a: 55, b: 36, R: 2, round: false, sep: true, tiers: [{ rows: 16 }],
      mul: [[1.2, 1.2], [0.8, 0.75], [1, 1], [0.8, 0.75]],
      seats: { type: 'sides', colors: ['#F58220', '#00843D', '#F58220', '#00843D'] },
      facade: { tex: 'panels', colors: ['#F58220', '#00843D', '#F2EDE3'] },
      roof: { type: 'membrane', open: 0.3 }, lights: 'towers', setting: { kind: 'suburban', hills: true, water: { axis: 'z', sign: 1, from: 220 } },
    },
  },
  corum: {
    name: 'Çorum Şehir Stadyumu', country: 'TR', city: 'Çorum', lon: 34.9560, lat: 40.5560, cap: 15000,
    model: {
      a: 55, b: 36, R: 10, round: false, tiers: [{ rows: 20 }],
      mul: [[1.15, 1.2], [0.9, 0.85], [1.05, 1.05], [0.9, 0.85]],
      seats: { type: 'stripes', colors: ['#D6001C', '#111111'], band: 7 },
      facade: { tex: 'glassgrid', colors: ['#3A3F45', '#8A9097', '#D6001C'] },
      roof: { type: 'metal', open: 0.35, color: '#B4BAC0' }, lights: 'roof', setting: { kind: 'suburban', hills: true },
    },
  },
  kazimkarabekir: {
    name: 'Kazım Karabekir Stadyumu', country: 'TR', city: 'Erzurum', lon: 41.2620, lat: 39.9040, cap: 21000,
    model: {
      a: 56, b: 37, R: 2, round: false, sep: true, tiers: [{ rows: 22 }],
      mul: [[1.15, 1.15], [0.9, 0.85], [1.05, 1.05], [0.9, 0.85]],
      seats: { type: 'sides', colors: ['#1E5AA8', '#FFFFFF', '#1E5AA8', '#FFFFFF'] },
      facade: { tex: 'basalt', colors: ['#6B6E72', '#878A8E', '#1E5AA8'] },
      roof: { type: 'membrane', open: 0.3 }, lights: 'towers', setting: { kind: 'open', hills: true },
    },
  },
};

// [tarih, saat, lig, ev sahibi, deplasman]  (stadyum = ev sahibinin stadı)

// İngiltere şehir alanları: harita yakınlaşırken kullanılan idari birimler
export const GB_CITIES = {
  Newcastle: { name: 'Newcastle', region: 'North East', subs: ['Newcastle upon Tyne', 'Gateshead'] },
  Birmingham: { name: 'Birmingham', region: 'West Midlands', subs: ['Birmingham'] },
  London: { name: 'Londra', region: 'Greater London' },
  Manchester: { name: 'Manchester', region: 'North West', subs: ['Manchester', 'Trafford', 'Salford'] },
  Liverpool: { name: 'Liverpool', region: 'North West', subs: ['Liverpool', 'Knowsley', 'Sefton'] },
};

export const GB_REGION_NAMES = {
  'Greater London': 'Londra', 'North West': 'Kuzeybatı', 'North East': 'Kuzeydoğu',
  'Yorkshire and the Humber': 'Yorkshire', 'East Midlands': 'Doğu Midlands', 'West Midlands': 'Batı Midlands',
  'East': 'Doğu İngiltere', 'South East': 'Güneydoğu', 'South West': 'Güneybatı',
  'Wales': 'Galler', 'Scotland': 'İskoçya', 'Northern Ireland': 'Kuzey İrlanda',
};

export const PLACE_LABELS = [
  // Fransa ve Almanya şehirleri (il/eyalet adları şehir adı olmadığı için)
  ['Paris', 2.35, 48.86, 10], ['Marseille', 5.37, 43.3, 9], ['Lyon', 4.84, 45.76, 9], ['Toulouse', 1.44, 43.6, 8], ['Nice', 7.26, 43.7, 7],
  ['Nantes', -1.55, 47.22, 7], ['Strasbourg', 7.75, 48.58, 7], ['Bordeaux', -0.58, 44.84, 7], ['Lille', 3.06, 50.63, 8], ['Rennes', -1.68, 48.11, 6],
  ['Montpellier', 3.88, 43.61, 5], ['Lens', 2.83, 50.43, 4],
  ['Berlin', 13.4, 52.52, 10], ['Hamburg', 9.99, 53.55, 9], ['München', 11.58, 48.14, 9], ['Köln', 6.96, 50.94, 8], ['Frankfurt', 8.68, 50.11, 8],
  ['Stuttgart', 9.18, 48.78, 7], ['Dortmund', 7.47, 51.51, 7], ['Leipzig', 12.37, 51.34, 7], ['Bremen', 8.8, 53.08, 7], ['Düsseldorf', 6.78, 51.23, 6],
  ['Hannover', 9.73, 52.37, 6], ['Nürnberg', 11.08, 49.45, 6], ['Dresden', 13.74, 51.05, 6], ['Leverkusen', 6.98, 51.03, 4], ['Mönchengladbach', 6.44, 51.19, 4],
  // İngiltere şehirleri [ad, lon, lat, öncelik]
  ['Londra', -0.12, 51.51, 10], ['Manchester', -2.24, 53.48, 9], ['Liverpool', -2.98, 53.41, 9],
  ['Birmingham', -1.89, 52.48, 8], ['Leeds', -1.55, 53.8, 7], ['Newcastle', -1.61, 54.97, 7],
  ['Sheffield', -1.47, 53.38, 6], ['Bristol', -2.59, 51.45, 7], ['Nottingham', -1.15, 52.95, 6],
  ['Southampton', -1.4, 50.9, 6], ['Brighton', -0.14, 50.82, 5], ['Leicester', -1.13, 52.64, 5],
  ['Norwich', 1.3, 52.63, 5], ['Plymouth', -4.14, 50.37, 5], ['Cardiff', -3.18, 51.48, 6],
  ['Edinburgh', -3.19, 55.95, 6], ['Glasgow', -4.25, 55.86, 6], ['Belfast', -5.93, 54.6, 5],
];

export const SEA_LABELS = [
  ['Biskay Körfezi', -4.5, 45.6, 1.4], ['Tiren Denizi', 11.8, 40.1, 2], ['Adriyatik Denizi', 15.6, 42.9, 2], ['Ligurya Denizi', 8.9, 43.8, 4],
  ['Akdeniz', 5.5, 38.6, 1.2], ['Balear Denizi', 2.4, 40.4, 3.5], ['İyon Denizi', 18.5, 37.8, 2], ['Baltık Denizi', 16.8, 55.6, 1.2],
  ['Karadeniz', 34.5, 43.0, 1.5], ['Akdeniz', 31.5, 34.6, 1.5], ['Ege Denizi', 25.0, 38.6, 2.2],
  ['Marmara', 28.1, 40.72, 6], ['Kuzey Denizi', 3.2, 55.5, 1.2], ['Manş', -1.6, 50.15, 3], ['İrlanda Denizi', -5.0, 53.9, 3],
];

Object.assign(TEAMS, EU_TEAMS);
Object.assign(STADIUMS, EU_STADIUMS);
