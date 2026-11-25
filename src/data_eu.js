// İspanya, Almanya, İtalya, Fransa + İngiltere'ye eklenen takımlar ve stadyumlar.
// Örnek veri: koordinatlar ve kapasiteler yaklaşıktır, modeller temsilidir.

export const EU_TEAMS = {
  // LaLiga
  RMA: { name: 'Real Madrid', c: ['#FFFFFF', '#1E3A8A'], home: 'bernabeu' },
  ATM: { name: 'Atlético Madrid', c: ['#CB3524', '#262F61'], home: 'metropolitano' },
  BAR: { name: 'Barcelona', c: ['#A50044', '#004D98'], home: 'campnou' },
  SEV: { name: 'Sevilla', c: ['#FFFFFF', '#D71920'], home: 'pizjuan' },
  BET: { name: 'Real Betis', c: ['#00954C', '#FFFFFF'], home: 'villamarin' },
  VAL: { name: 'Valencia', c: ['#FFFFFF', '#EE7F00'], home: 'mestalla' },
  ATH: { name: 'Athletic Club', c: ['#EE2523', '#FFFFFF'], home: 'sanmames' },
  RSO: { name: 'Real Sociedad', c: ['#0067B1', '#FFFFFF'], home: 'anoeta' },
  VIL: { name: 'Villarreal', c: ['#FFE667', '#005187'], home: 'ceramica' },
  CEL: { name: 'Celta Vigo', c: ['#8AC3EE', '#E5254E'], home: 'balaidos' },
  // Bundesliga
  FCB: { name: 'Bayern München', c: ['#DC052D', '#0066B2'], home: 'allianzarena' },
  BVB: { name: 'Borussia Dortmund', c: ['#FDE100', '#111111'], home: 'signal' },
  B04: { name: 'Bayer Leverkusen', c: ['#E32221', '#111111'], home: 'bayarena' },
  RBL: { name: 'RB Leipzig', c: ['#DD0741', '#FFFFFF'], home: 'rbarena' },
  VFB: { name: 'VfB Stuttgart', c: ['#FFFFFF', '#E32219'], home: 'mhp' },
  SGE: { name: 'Eintracht Frankfurt', c: ['#E1000F', '#111111'], home: 'deutschebank' },
  SVW: { name: 'Werder Bremen', c: ['#1D9053', '#FFFFFF'], home: 'weser' },
  BMG: { name: 'Mönchengladbach', c: ['#111111', '#00B140'], home: 'borussiapark' },
  HSV: { name: 'Hamburger SV', c: ['#0A3F86', '#FFFFFF'], home: 'volkspark' },
  KOE: { name: '1. FC Köln', c: ['#ED1C24', '#FFFFFF'], home: 'rheinenergie' },
  // Serie A
  INT: { name: 'Inter', c: ['#010E80', '#111111'], home: 'sansiro' },
  MIL: { name: 'Milan', c: ['#FB090B', '#111111'], home: 'sansiro' },
  JUV: { name: 'Juventus', c: ['#111111', '#FFFFFF'], home: 'juventus' },
  ROM: { name: 'Roma', c: ['#8E1F2F', '#F0BC42'], home: 'olimpico' },
  LAZ: { name: 'Lazio', c: ['#87D8F7', '#FFFFFF'], home: 'olimpico' },
  NAP: { name: 'Napoli', c: ['#12A0D7', '#FFFFFF'], home: 'maradona' },
  ATA: { name: 'Atalanta', c: ['#1E71B8', '#111111'], home: 'gewiss' },
  FIO: { name: 'Fiorentina', c: ['#482E92', '#FFFFFF'], home: 'franchi' },
  BOL: { name: 'Bologna', c: ['#1A2F48', '#A21C26'], home: 'dallara' },
  TOR: { name: 'Torino', c: ['#8A1538', '#FFFFFF'], home: 'grandetorino' },
  // Ligue 1
  PSG: { name: 'Paris Saint-Germain', c: ['#004170', '#DA291C'], home: 'parc' },
  OM: { name: 'Marseille', c: ['#2FAEE0', '#FFFFFF'], home: 'velodrome' },
  OL: { name: 'Lyon', c: ['#FFFFFF', '#14387F'], home: 'groupama' },
  LOSC: { name: 'Lille', c: ['#E01E13', '#20325F'], home: 'mauroy' },
  RCL: { name: 'Lens', c: ['#EC1C24', '#FFD200'], home: 'bollaert' },
  NIC: { name: 'Nice', c: ['#C8102E', '#111111'], home: 'riviera' },
  REN: { name: 'Rennes', c: ['#E13327', '#111111'], home: 'roazhon' },
  NAN: { name: 'Nantes', c: ['#FCD405', '#007A33'], home: 'beaujoire' },
  STR: { name: 'Strasbourg', c: ['#009FE3', '#FFFFFF'], home: 'meinau' },
  TFC: { name: 'Toulouse', c: ['#5B2C83', '#FFFFFF'], home: 'toulouse' },
  // Premier League ekleri
  NEW: { name: 'Newcastle United', c: ['#111111', '#FFFFFF'], home: 'stjames' },
  AVL: { name: 'Aston Villa', c: ['#670E36', '#95BFE5'], home: 'villapark' },
  EVE: { name: 'Everton', c: ['#003399', '#FFFFFF'], home: 'hilldickinson' },
  WHU: { name: 'West Ham', c: ['#7A263A', '#1BB1E7'], home: 'londonstadium' },
};

const T2 = [{ rows: 22 }, { rows: 16, box: 4, overhang: 3 }];
export const EU_STADIUMS = {
  // ---- İspanya
  bernabeu: { name: 'Santiago Bernabéu', country: 'ES', city: 'Madrid', lon: -3.6883, lat: 40.4531, cap: 83000, model: {
    a: 57, b: 38, R: 6, round: false, tiers: [{ rows: 24 }, { rows: 6, box: 5, overhang: 2 }, { rows: 22, box: 4, overhang: 3, rise: 0.62 }],
    mul: [[1.05, 1.05], [1, 1], [1.05, 1.05], [1, 1]], seats: { type: 'tiers', colors: ['#E9ECEF', '#1E3A8A', '#E9ECEF'] },
    facade: { tex: 'lamellas', colors: ['#E4E7EA', '#9AA2AA', '#C9CED3'], glow: '#ffffff' }, roof: { type: 'metal', open: 0.14, color: '#D6D9DC' }, lights: 'roof', setting: { kind: 'urban' } } },
  metropolitano: { name: 'Metropolitano', country: 'ES', city: 'Madrid', lon: -3.5995, lat: 40.4362, cap: 70000, model: {
    a: 58, b: 40, R: 26, round: true, tiers: [{ rows: 26 }, { rows: 18, box: 4, overhang: 3 }],
    mul: [[1.15, 1.15], [0.95, 0.9], [1.15, 1.15], [0.95, 0.9]], seats: { type: 'mosaic', colors: ['#CB3524', '#CB3524', '#CB3524', '#FFFFFF'] },
    facade: { tex: 'glassgrid', colors: ['#B8C0C8', '#E7EBEE', '#CB3524'] }, roof: { type: 'membrane', open: 0.35, wave: 1.6 }, lights: 'roof', setting: { kind: 'suburban', road: true } } },
  campnou: { name: 'Spotify Camp Nou', country: 'ES', city: 'Barcelona', lon: 2.1228, lat: 41.3809, cap: 99000, model: {
    a: 60, b: 42, R: 30, round: true, tiers: [{ rows: 30 }, { rows: 16, box: 3, overhang: 2 }, { rows: 22, box: 3, overhang: 2, rise: 0.62 }],
    mul: [[1, 1], [1, 1], [1, 1], [1, 1]], seats: { type: 'mosaic', colors: ['#A50044', '#004D98', '#A50044', '#004D98', '#EDBB00'] },
    facade: { tex: 'panels', colors: ['#E6E2D8', '#A50044', '#004D98'] }, roof: { type: 'membrane', sides: [0], open: 0.3 }, lights: 'roof', setting: { kind: 'urban' } } },
  pizjuan: { name: 'Ramón Sánchez-Pizjuán', country: 'ES', city: 'Sevilla', lon: -5.9705, lat: 37.3840, cap: 43000, model: {
    a: 57, b: 38, R: 20, round: true, tiers: [{ rows: 26 }, { rows: 14, box: 3, overhang: 2 }],
    mul: [[1.15, 1.15], [0.95, 0.9], [1.05, 1], [0.95, 0.9]], seats: { type: 'sides', colors: ['#FFFFFF', '#D71920', '#FFFFFF', '#D71920'] },
    facade: { tex: 'mural', colors: ['#F2EEE6', '#D71920', '#2B6CB0'] }, roof: { type: 'metal', sides: [0], open: 0.35, color: '#C8CDD2' }, lights: 'towers', setting: { kind: 'urban' } } },
  villamarin: { name: 'Benito Villamarín', country: 'ES', city: 'Sevilla', lon: -5.9817, lat: 37.3564, cap: 60000, model: {
    a: 57, b: 39, R: 18, round: true, tiers: [{ rows: 26 }, { rows: 18, box: 4, overhang: 3 }],
    mul: [[1.1, 1.1], [1, 1], [1.1, 1.1], [1, 1]], seats: { type: 'stripes', colors: ['#00954C', '#FFFFFF'], band: 6 },
    facade: { tex: 'panels', colors: ['#FFFFFF', '#00954C', '#DADFD9'] }, roof: { type: 'membrane', sides: [0, 2], open: 0.4 }, lights: 'roof', setting: { kind: 'urban', water: { axis: 'x', sign: -1, from: 260 } } } },
  mestalla: { name: 'Mestalla', country: 'ES', city: 'Valencia', lon: -0.3583, lat: 39.4746, cap: 49000, model: {
    a: 55, b: 35, R: 2, round: false, tiers: [{ rows: 20, rise: 0.55 }, { rows: 20, box: 4, overhang: 4, rise: 0.7 }],
    mul: [[1.1, 1.15], [1, 1.05], [1, 1], [1, 1.05]], seats: { type: 'mosaic', colors: ['#FFFFFF', '#1A1A1A', '#EE7F00', '#FFFFFF'] },
    facade: { tex: 'fins', colors: ['#D9D6D0', '#B9B5AE', '#EE7F00'] }, roof: { type: 'metal', sides: [0], open: 0.4, color: '#9AA3AB' }, lights: 'towers', setting: { kind: 'urban' } } },
  sanmames: { name: 'San Mamés', country: 'ES', city: 'Bilbao', lon: -2.9494, lat: 43.2641, cap: 53000, model: {
    a: 56, b: 37, R: 4, round: false, tiers: T2, mul: [[1.1, 1.05], [1, 1], [1.1, 1.05], [1, 1]], seats: { type: 'solid', colors: ['#D0021B'] },
    facade: { tex: 'cushions', colors: ['#F4F4F2', '#E6E6E3', '#C9CBCD'], glow: '#E30613', lean: 0.06 }, roof: { type: 'membrane', open: 0.3 }, lights: 'roof',
    setting: { kind: 'urban', water: { axis: 'x', sign: -1, from: 140 }, hills: true } } },
  anoeta: { name: 'Reale Arena', country: 'ES', city: 'San Sebastián', lon: -1.9736, lat: 43.3014, cap: 40000, model: {
    a: 56, b: 37, R: 12, round: true, tiers: [{ rows: 24 }, { rows: 10, box: 3, overhang: 2 }],
    mul: [[1.05, 1], [1, 1], [1.05, 1], [1, 1]], seats: { type: 'stripes', colors: ['#0067B1', '#FFFFFF'], band: 8 },
    facade: { tex: 'panels', colors: ['#FFFFFF', '#0067B1', '#D8E0E8'] }, roof: { type: 'membrane', open: 0.35 }, lights: 'roof', setting: { kind: 'suburban', hills: true } } },
  ceramica: { name: 'Estadio de la Cerámica', country: 'ES', city: 'Vila-real', lon: -0.1036, lat: 39.9441, cap: 23000, model: {
    a: 55, b: 36, R: 2, round: false, sep: true, cornerFill: true, tiers: [{ rows: 20 }],
    mul: [[1.15, 1.2], [0.9, 0.9], [1, 1], [0.9, 0.9]], seats: { type: 'solid', colors: ['#FFE667'] },
    facade: { tex: 'ceramic', colors: ['#FFE667', '#005187', '#F2A900'] }, roof: { type: 'metal', open: 0.3, color: '#A9B1B8' }, lights: 'roof', setting: { kind: 'urban' } } },
  balaidos: { name: 'Abanca Balaídos', country: 'ES', city: 'Vigo', lon: -8.7397, lat: 42.2118, cap: 25000, model: {
    a: 56, b: 37, R: 2, round: false, sep: true, tiers: [{ rows: 22 }],
    mul: [[1.1, 1.1], [0.9, 0.85], [1.1, 1.1], [0.9, 0.85]], seats: { type: 'solid', colors: ['#8AC3EE'] },
    facade: { tex: 'panels', colors: ['#8AC3EE', '#FFFFFF', '#5E9CCB'] }, roof: { type: 'membrane', open: 0.3 }, lights: 'towers', setting: { kind: 'urban', hills: true, water: { axis: 'z', sign: 1, from: 320 } } } },
  // ---- Almanya
  allianzarena: { name: 'Allianz Arena', country: 'DE', city: 'München', lon: 11.6247, lat: 48.2188, cap: 75000, model: {
    a: 56, b: 38, R: 24, round: true, tiers: [{ rows: 24 }, { rows: 14, box: 4, overhang: 3 }, { rows: 18, box: 3, overhang: 2, rise: 0.65 }],
    mul: [[1, 1], [1, 1], [1, 1], [1, 1]], seats: { type: 'solid', colors: ['#9AA0A6'] },
    facade: { tex: 'cushions', colors: ['#F7F7F5', '#ECECE8', '#CFD3D6'], glow: '#DC052D', lean: 0.14 }, roof: { type: 'membrane', open: 0.3 }, lights: 'roof', setting: { kind: 'open', road: true } } },
  signal: { name: 'Signal Iduna Park', country: 'DE', city: 'Dortmund', lon: 7.4519, lat: 51.4926, cap: 81000, model: {
    a: 56, b: 37, R: 3, round: false, tiers: [{ rows: 24 }, { rows: 22, box: 4, overhang: 4, rise: 0.6 }],
    mul: [[1.1, 1.05], [1.05, 1.05], [1.1, 1.05], [1.45, 1.25]], seats: { type: 'solid', colors: ['#FDE100'] },
    facade: { tex: 'fins', colors: ['#3A3F45', '#24282C', '#FDE100'] }, roof: { type: 'metal', open: 0.3, color: '#C9CED2', masts: 8, mastColor: '#FDE100' }, lights: 'roof', setting: { kind: 'suburban', park: true } } },
  bayarena: { name: 'BayArena', country: 'DE', city: 'Leverkusen', lon: 7.0022, lat: 51.0383, cap: 30000, model: {
    a: 55, b: 36, R: 6, round: false, tiers: [{ rows: 20 }, { rows: 10, box: 3, overhang: 2 }], mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'mosaic', colors: ['#E32221', '#E32221', '#111111'] }, facade: { tex: 'glassgrid', colors: ['#5A636C', '#AEB6BE', '#E32221'] },
    roof: { type: 'glass', open: 0.2 }, lights: 'roof', setting: { kind: 'urban' } } },
  rbarena: { name: 'Red Bull Arena', country: 'DE', city: 'Leipzig', lon: 12.3483, lat: 51.3458, cap: 47000, model: {
    a: 56, b: 37, R: 14, round: true, tiers: T2, mul: [[1.05, 1], [1, 1], [1.05, 1], [1, 1]],
    seats: { type: 'mosaic', colors: ['#DD0741', '#FFFFFF', '#0C2043'] }, facade: { tex: 'glassgrid', colors: ['#2E3A4A', '#7E8C9A', '#DD0741'] },
    roof: { type: 'metal', open: 0.35, color: '#D6DADE', ribs: true }, berm: true, lights: 'roof', setting: { kind: 'open', park: true } } },
  mhp: { name: 'MHPArena', country: 'DE', city: 'Stuttgart', lon: 9.2320, lat: 48.7922, cap: 60000, model: {
    a: 58, b: 40, R: 22, round: true, tiers: [{ rows: 24 }, { rows: 18, box: 4, overhang: 3 }],
    mul: [[1.05, 1], [1, 1], [1.05, 1], [1, 1]], seats: { type: 'solid', colors: ['#E32219'] },
    facade: { tex: 'panels', colors: ['#FFFFFF', '#E32219', '#E3E3E3'] }, roof: { type: 'membrane', open: 0.3, masts: 16 }, lights: 'roof', setting: { kind: 'suburban', water: { axis: 'x', sign: 1, from: 220 } } } },
  deutschebank: { name: 'Deutsche Bank Park', country: 'DE', city: 'Frankfurt', lon: 8.6455, lat: 50.0686, cap: 58000, model: {
    a: 57, b: 38, R: 16, round: true, tiers: T2, mul: [[1.05, 1], [1, 1], [1.05, 1], [1, 1]],
    seats: { type: 'mosaic', colors: ['#5D6168', '#E1000F', '#111111'] }, facade: { tex: 'glassgrid', colors: ['#7C8792', '#C7CFD6', '#E1000F'] },
    roof: { type: 'membrane', open: 0.06 }, cube: true, lights: 'roof', setting: { kind: 'forest' } } },
  weser: { name: 'Weserstadion', country: 'DE', city: 'Bremen', lon: 8.8376, lat: 53.0665, cap: 42000, model: {
    a: 55, b: 36, R: 6, round: false, tiers: T2, mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'solid', colors: ['#1D9053'] }, facade: { tex: 'solarfacade', colors: ['#1C3550', '#9AA4AD', '#1D9053'] },
    roof: { type: 'solar', open: 0.3 }, lights: 'roof', setting: { kind: 'urban', water: { axis: 'z', sign: 1, from: 120 } } } },
  borussiapark: { name: 'Borussia-Park', country: 'DE', city: 'Mönchengladbach', lon: 6.3855, lat: 51.1746, cap: 54000, model: {
    a: 56, b: 37, R: 4, round: false, tiers: [{ rows: 24 }, { rows: 16, box: 4, overhang: 3 }], mul: [[1.05, 1], [1, 1], [1.05, 1], [1.1, 1.05]],
    seats: { type: 'mosaic', colors: ['#111111', '#FFFFFF', '#00B140', '#111111'] }, facade: { tex: 'fins', colors: ['#E3E5E4', '#BFC4C2', '#00B140'] },
    roof: { type: 'metal', open: 0.32, color: '#AEB5BB' }, lights: 'roof', setting: { kind: 'open' } } },
  volkspark: { name: 'Volksparkstadion', country: 'DE', city: 'Hamburg', lon: 9.8986, lat: 53.5872, cap: 57000, model: {
    a: 57, b: 38, R: 20, round: true, tiers: T2, mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'solid', colors: ['#0A3F86'] }, facade: { tex: 'louvers', colors: ['#F3F4F5', '#D6DADF', '#0A3F86'] },
    roof: { type: 'membrane', open: 0.32, masts: 8 }, lights: 'roof', setting: { kind: 'forest' } } },
  rheinenergie: { name: 'RheinEnergieStadion', country: 'DE', city: 'Köln', lon: 6.8752, lat: 50.9335, cap: 50000, model: {
    a: 55, b: 36, R: 2, round: false, tiers: T2, mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'solid', colors: ['#ED1C24'] }, facade: { tex: 'glassgrid', colors: ['#4C5660', '#A3ADB6', '#ED1C24'] },
    roof: { type: 'glass', open: 0.25 }, cornerTowers: { r: 4, h: 22, color: '#E8E8E8', glow: '#FFD84D' }, lights: 'roof', setting: { kind: 'forest' } } },
  // ---- İtalya
  sansiro: { name: 'San Siro', country: 'IT', city: 'Milano', lon: 9.1240, lat: 45.4781, cap: 75000, model: {
    a: 60, b: 41, R: 18, round: true, tiers: [{ rows: 24 }, { rows: 18, box: 3, overhang: 2 }, { rows: 18, box: 3, overhang: 3, rise: 0.6 }],
    mul: [[1, 1], [1, 1], [1, 1], [1, 1]], seats: { type: 'mosaic', colors: ['#C8102E', '#C8102E', '#1E3A8A', '#F2A900'] },
    facade: { tex: 'fins', colors: ['#C9C9C4', '#A6A6A0', '#C8102E'] }, roof: { type: 'metal', open: 0.3, color: '#C9CED2', ribs: true, ribsColor: '#C8102E' },
    helix: 11, lights: 'roof', setting: { kind: 'suburban' } } },
  juventus: { name: 'Allianz Stadium', country: 'IT', city: 'Torino', lon: 7.6413, lat: 45.1096, cap: 41000, model: {
    a: 55, b: 36, R: 6, round: false, tiers: T2, mul: [[1.05, 1], [1, 1], [1.05, 1], [1, 1]],
    seats: { type: 'mosaic', colors: ['#111111', '#FFFFFF', '#111111'] }, facade: { tex: 'glassgrid', colors: ['#24282C', '#6B737B', '#FFFFFF'] },
    roof: { type: 'metal', open: 0.3, color: '#D2D6DA', masts: 4, mastColor: '#E6E6E6' }, lights: 'roof', setting: { kind: 'open', hills: true } } },
  olimpico: { name: 'Stadio Olimpico', country: 'IT', city: 'Roma', lon: 12.4547, lat: 41.9341, cap: 70000, model: {
    a: 70, b: 52, R: 32, round: true, track: true, tiers: [{ rows: 32, rise: 0.42 }],
    mul: [[1, 1], [1, 1], [1, 1], [1, 1]], seats: { type: 'mosaic', colors: ['#2B5DAA', '#7AA6D6', '#2B5DAA'] },
    facade: { tex: 'fins', colors: ['#E9E3D3', '#CFC7B3', '#8E1F2F'] }, roof: { type: 'membrane', open: 0.45 }, lights: 'roof',
    setting: { kind: 'suburban', park: true, hills: true, water: { axis: 'z', sign: -1, from: 230 } } } },
  maradona: { name: 'Stadio Diego Armando Maradona', country: 'IT', city: 'Napoli', lon: 14.1931, lat: 40.8279, cap: 55000, model: {
    a: 70, b: 52, R: 34, round: true, track: true, tiers: [{ rows: 26 }, { rows: 18, box: 3, overhang: 2 }],
    mul: [[1, 1], [1, 1], [1, 1], [1, 1]], seats: { type: 'mosaic', colors: ['#12A0D7', '#12A0D7', '#0B4F8A'] },
    facade: { tex: 'fins', colors: ['#B6B9BA', '#8E9294', '#12A0D7'] }, roof: { type: 'metal', open: 0.3, color: '#D8DCE0', ribs: true }, lights: 'roof', setting: { kind: 'urban', hills: true } } },
  gewiss: { name: 'Gewiss Stadium', country: 'IT', city: 'Bergamo', lon: 9.6808, lat: 45.7089, cap: 25000, model: {
    a: 55, b: 36, R: 2, round: false, sep: true, tiers: [{ rows: 20 }], mul: [[1.1, 1.1], [0.95, 0.95], [1.1, 1.1], [0.95, 0.95]],
    seats: { type: 'sides', colors: ['#1E71B8', '#111111', '#1E71B8', '#111111'] }, facade: { tex: 'panels', colors: ['#111111', '#1E71B8', '#2A2F35'] },
    roof: { type: 'metal', open: 0.3, color: '#9AA3AB' }, lights: 'roof', setting: { kind: 'urban', hills: true } } },
  franchi: { name: 'Artemio Franchi', country: 'IT', city: 'Firenze', lon: 11.2822, lat: 43.7808, cap: 43000, model: {
    a: 68, b: 50, R: 28, round: true, track: true, tiers: [{ rows: 24 }], mul: [[1.1, 1.1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'solid', colors: ['#5B2A86'] }, facade: { tex: 'fins', colors: ['#D8D2C4', '#B8B0A0', '#5B2A86'] },
    roof: { type: 'metal', sides: [0], open: 0.4, color: '#B9BEC3' }, tower: { side: 3, h: 46, tex: 'fins', colors: ['#D8D2C4', '#B8B0A0', '#5B2A86'] }, lights: 'towers', setting: { kind: 'urban', hills: true } } },
  dallara: { name: "Renato Dall'Ara", country: 'IT', city: 'Bologna', lon: 11.3096, lat: 44.4925, cap: 38000, model: {
    a: 66, b: 48, R: 30, round: true, track: true, tiers: [{ rows: 24 }], mul: [[1.1, 1.1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'sides', colors: ['#A21C26', '#1A2F48', '#A21C26', '#1A2F48'] }, facade: { tex: 'arches', colors: ['#B4654A', '#8C4B37', '#5D3426'] },
    roof: { type: 'metal', sides: [0], open: 0.4, color: '#9AA3AB' }, tower: { side: 1, h: 42 }, lights: 'towers', setting: { kind: 'urban', hills: true } } },
  grandetorino: { name: 'Stadio Olimpico Grande Torino', country: 'IT', city: 'Torino', lon: 7.6500, lat: 45.0418, cap: 28000, model: {
    a: 64, b: 46, R: 26, round: true, track: true, tiers: [{ rows: 22 }, { rows: 12, box: 3, overhang: 2 }], mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'solid', colors: ['#8A1538'] }, facade: { tex: 'fins', colors: ['#F0EEE9', '#D3CFC6', '#8A1538'] },
    roof: { type: 'membrane', sides: [0, 2], open: 0.35 }, lights: 'roof', setting: { kind: 'urban' } } },
  // ---- Fransa
  parc: { name: 'Parc des Princes', country: 'FR', city: 'Paris', lon: 2.2530, lat: 48.8414, cap: 48000, model: {
    a: 55, b: 36, R: 14, round: true, tiers: [{ rows: 22 }, { rows: 18, box: 4, overhang: 3, rise: 0.62 }],
    mul: [[1, 1], [1, 1], [1, 1], [1, 1]], seats: { type: 'tiers', colors: ['#DA291C', '#004170'] },
    facade: { tex: 'fins', colors: ['#CFCCC6', '#A8A49C', '#004170'] }, roof: { type: 'metal', open: 0.25, color: '#5A6168', ribs: true, ribsColor: '#CFCCC6' }, lights: 'roof', setting: { kind: 'urban', road: true } } },
  velodrome: { name: 'Orange Vélodrome', country: 'FR', city: 'Marseille', lon: 5.3959, lat: 43.2698, cap: 67000, model: {
    a: 58, b: 40, R: 22, round: true, tiers: [{ rows: 24 }, { rows: 16, box: 3, overhang: 2 }],
    mul: [[1.05, 1], [1, 1], [1.05, 1], [1, 1]], seats: { type: 'mosaic', colors: ['#2FAEE0', '#2FAEE0', '#FFFFFF'] },
    facade: { tex: 'fins', colors: ['#F3F3F1', '#D9D9D5', '#2FAEE0'] }, roof: { type: 'membrane', open: 0.3, wave: 2.4 }, lights: 'roof', setting: { kind: 'urban', hills: true } } },
  groupama: { name: 'Groupama Stadium', country: 'FR', city: 'Lyon', lon: 4.9822, lat: 45.7653, cap: 59000, model: {
    a: 56, b: 38, R: 8, round: false, tiers: T2, mul: [[1.05, 1], [1, 1], [1.05, 1], [1, 1]],
    seats: { type: 'sides', colors: ['#DA0812', '#14387F', '#DA0812', '#14387F'] }, facade: { tex: 'glassgrid', colors: ['#3A4E6E', '#8EA2BC', '#DA0812'] },
    roof: { type: 'glass', open: 0.25 }, lights: 'roof', setting: { kind: 'open', road: true } } },
  mauroy: { name: 'Decathlon Arena Pierre-Mauroy', country: 'FR', city: 'Lille', lon: 3.1305, lat: 50.6119, cap: 50000, model: {
    a: 57, b: 38, R: 6, round: false, tiers: [{ rows: 24 }, { rows: 18, box: 4, overhang: 3 }], mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'solid', colors: ['#C1121F'] }, facade: { tex: 'glassgrid', colors: ['#2E3540', '#A7B0BA', '#E01E13'], glow: '#ffffff' },
    roof: { type: 'metal', open: 0.1, color: '#C7CCD1' }, lights: 'roof', setting: { kind: 'open', road: true } } },
  bollaert: { name: 'Bollaert-Delelis', country: 'FR', city: 'Lens', lon: 2.8150, lat: 50.4329, cap: 38000, model: {
    a: 55, b: 36, R: 2, round: false, sep: true, tiers: [{ rows: 24 }], mul: [[1.1, 1.1], [1.05, 1.05], [1.1, 1.1], [1.05, 1.05]],
    seats: { type: 'sides', colors: ['#EC1C24', '#FFD200', '#EC1C24', '#FFD200'] }, facade: { tex: 'panels', colors: ['#EC1C24', '#FFD200', '#D9D9D9'] },
    roof: { type: 'membrane', open: 0.3 }, lights: 'towers', setting: { kind: 'terraced' } } },
  riviera: { name: 'Allianz Riviera', country: 'FR', city: 'Nice', lon: 7.1926, lat: 43.7051, cap: 36000, model: {
    a: 56, b: 37, R: 18, round: true, tiers: [{ rows: 22 }, { rows: 12, box: 3, overhang: 2 }], mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'solid', colors: ['#C8102E'] }, facade: { tex: 'lattice', colors: ['#EEE9DF', '#9C6B3F', '#C8102E'], lean: 0.08 },
    roof: { type: 'solar', open: 0.3 }, lights: 'roof', setting: { kind: 'open', hills: true } } },
  roazhon: { name: 'Roazhon Park', country: 'FR', city: 'Rennes', lon: -1.7128, lat: 48.1075, cap: 29000, model: {
    a: 55, b: 36, R: 4, round: false, tiers: [{ rows: 22 }, { rows: 10, box: 3, overhang: 2 }], mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'tiers', colors: ['#E13327', '#111111'] }, facade: { tex: 'panels', colors: ['#111111', '#E13327', '#2E2E2E'] },
    roof: { type: 'metal', open: 0.3, color: '#9AA3AB' }, lights: 'roof', setting: { kind: 'urban', water: { axis: 'x', sign: 1, from: 160 } } } },
  beaujoire: { name: 'Stade de la Beaujoire', country: 'FR', city: 'Nantes', lon: -1.5254, lat: 47.2560, cap: 35000, model: {
    a: 58, b: 40, R: 30, round: true, tiers: [{ rows: 26 }], mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'mosaic', colors: ['#FCD405', '#FCD405', '#007A33'] }, facade: { tex: 'fins', colors: ['#F2F2EF', '#D4D4CF', '#007A33'] },
    roof: { type: 'membrane', open: 0.45 }, lights: 'roof', setting: { kind: 'suburban', water: { axis: 'x', sign: -1, from: 200 } } } },
  meinau: { name: 'Stade de la Meinau', country: 'FR', city: 'Strasbourg', lon: 7.7550, lat: 48.5600, cap: 26000, model: {
    a: 55, b: 36, R: 2, round: false, sep: true, tiers: [{ rows: 20 }, { rows: 10, box: 3, overhang: 2 }], mul: [[1, 1], [0.9, 0.9], [1, 1], [0.9, 0.9]],
    seats: { type: 'solid', colors: ['#009FE3'] }, facade: { tex: 'glassgrid', colors: ['#3E5A6E', '#9DB4C4', '#009FE3'] },
    roof: { type: 'metal', open: 0.3, color: '#A6ADB4' }, lights: 'roof', setting: { kind: 'urban' } } },
  toulouse: { name: 'Stadium de Toulouse', country: 'FR', city: 'Toulouse', lon: 1.4342, lat: 43.5833, cap: 33000, model: {
    a: 56, b: 37, R: 4, round: false, tiers: [{ rows: 24 }], mul: [[1.1, 1.1], [1, 1], [1.1, 1.1], [1, 1]],
    seats: { type: 'solid', colors: ['#5B2C83'] }, facade: { tex: 'panels', colors: ['#EDE9F2', '#5B2C83', '#CFC8D9'] },
    roof: { type: 'metal', open: 0.32, color: '#B4BAC0' }, lights: 'roof', setting: { kind: 'suburban', water: { axis: 'x', sign: 1, from: 120 }, park: true } } },
  // ---- İngiltere ekleri
  stjames: { name: "St James' Park", country: 'GB', city: 'Newcastle', area: 'Newcastle', lon: -1.6217, lat: 54.9756, cap: 52000, model: {
    a: 55, b: 36, R: 3, round: false, tiers: [{ rows: 22 }, { rows: 20, box: 4, overhang: 4, rise: 0.6 }],
    mul: [[1.35, 1.35], [1.3, 1.3], [0.9, 0.75], [0.9, 0.75]], seats: { type: 'mosaic', colors: ['#111111', '#111111', '#FFFFFF'] },
    facade: { tex: 'glassgrid', colors: ['#3B434C', '#99A3AD', '#111111'] }, roof: { type: 'glass', open: 0.15 }, lights: 'roof', setting: { kind: 'urban' } } },
  villapark: { name: 'Villa Park', country: 'GB', city: 'Birmingham', area: 'Birmingham', lon: -1.8848, lat: 52.5092, cap: 42000, model: {
    a: 55, b: 36, R: 2, round: false, sep: true, cornerFill: true, tiers: [{ rows: 22 }, { rows: 12, box: 4, overhang: 3 }],
    mul: [[1.1, 1.1], [1.15, 1.15], [1, 1], [1, 1]], seats: { type: 'solid', colors: ['#7A003C'] },
    facade: { tex: 'brick', colors: ['#9A4A3A', '#7A3A2E', '#95BFE5'] }, roof: { type: 'metal', open: 0.25, color: '#8D969E' }, lights: 'roof', setting: { kind: 'terraced', park: true } } },
  hilldickinson: { name: 'Hill Dickinson Stadium', country: 'GB', city: 'Liverpool', area: 'Liverpool', lon: -3.0010, lat: 53.4250, cap: 53000, model: {
    a: 55, b: 36, R: 2, round: false, sep: true, cornerFill: true, tiers: [{ rows: 22 }, { rows: 16, box: 4, overhang: 3 }],
    mul: [[1.05, 1], [1.25, 1.3], [1.05, 1], [1, 1]], seats: { type: 'solid', colors: ['#003399'] },
    facade: { tex: 'brick', colors: ['#8C4635', '#6E3529', '#C9C2B5'] }, roof: { type: 'metal', open: 0.25, color: '#7E8890' }, lights: 'roof',
    setting: { kind: 'urban', water: { axis: 'x', sign: -1, from: 95 } } } },
  londonstadium: { name: 'London Stadium', country: 'GB', city: 'Londra', area: 'London', lon: -0.0166, lat: 51.5386, cap: 62000, model: {
    a: 66, b: 48, R: 32, round: true, tiers: [{ rows: 26 }, { rows: 20, box: 3, overhang: 2 }], mul: [[1, 1], [1, 1], [1, 1], [1, 1]],
    seats: { type: 'mosaic', colors: ['#7A263A', '#7A263A', '#1BB1E7'] }, facade: { tex: 'louvers', colors: ['#F2F2F0', '#D8D9DA', '#7A263A'] },
    roof: { type: 'membrane', open: 0.45, masts: 14 }, lights: 'roof', setting: { kind: 'open', water: { axis: 'x', sign: -1, from: 160 } } } },
};

// Lig başına haftalık saat dilimleri (Pazartesiye göre gün, TR saati)
const SLOTS = {
  PL: [[5, '15:30'], [5, '18:00'], [5, '20:30'], [6, '17:00'], [6, '19:30']],
  LL: [[4, '23:00'], [5, '16:00'], [5, '18:15'], [5, '23:00'], [6, '20:30']],
  BL: [[4, '22:30'], [5, '17:30'], [5, '20:30'], [6, '17:30'], [6, '19:30']],
  SA: [[5, '20:00'], [5, '22:45'], [6, '14:30'], [6, '17:00'], [6, '22:45']],
  L1: [[4, '22:45'], [5, '19:00'], [5, '23:05'], [6, '17:00'], [6, '22:45']],
};
export const LEAGUE_TEAMS = {
  PL: ['CHE', 'ARS', 'LIV', 'MCI', 'MUN', 'TOT', 'NEW', 'AVL', 'EVE', 'WHU'],
  LL: ['RMA', 'ATM', 'BAR', 'SEV', 'BET', 'VAL', 'ATH', 'RSO', 'VIL', 'CEL'],
  BL: ['FCB', 'BVB', 'B04', 'RBL', 'VFB', 'SGE', 'SVW', 'BMG', 'HSV', 'KOE'],
  SA: ['INT', 'MIL', 'JUV', 'ROM', 'LAZ', 'NAP', 'ATA', 'FIO', 'BOL', 'TOR'],
  L1: ['PSG', 'OM', 'OL', 'LOSC', 'RCL', 'NIC', 'REN', 'NAN', 'STR', 'TFC'],
};
const addDays = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

// Çember yöntemiyle örnek fikstür: aynı stadı paylaşan takımlar aynı hafta evde oynamaz.
export function generateFixtures(weekMondays, teamsHome) {
  const out = [];
  Object.entries(LEAGUE_TEAMS).forEach(([lg, teams], li) => {
    const n = teams.length;
    weekMondays.forEach((mon, w) => {
      const r = (w * 3 + li * 2) % (n - 1);
      const rot = [teams[0], ...teams.slice(1).slice(r), ...teams.slice(1).slice(0, r)];
      const pairs = [];
      for (let i = 0; i < n / 2; i++) { let h = rot[i], a = rot[n - 1 - i]; if ((i + w + li) % 2) [h, a] = [a, h]; pairs.push([h, a]); }
      const used = new Set();
      for (const p of pairs) { if (used.has(teamsHome[p[0]])) p.reverse(); used.add(teamsHome[p[0]]); }
      pairs.forEach(([h, a], i) => { const [dd, t] = SLOTS[lg][i]; out.push([addDays(mon, dd), t, lg, h, a]); });
    });
  });
  return out;
}
