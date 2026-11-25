// API'den gelen takım adlarını bizim elle hazırladığımız takım/stadyum tablosuyla eşleştirir.
// Hem tarayıcı hem de veri betiği (Node) bu dosyayı kullanır.
import { TEAMS as KNOWN_TEAMS, STADIUMS as KNOWN_STADIUMS } from './data.js';

export { KNOWN_TEAMS, KNOWN_STADIUMS };

const TR_MAP = { ı: 'i', İ: 'i', ş: 's', Ş: 's', ğ: 'g', Ğ: 'g', ç: 'c', Ç: 'c', ö: 'o', Ö: 'o', ü: 'u', Ü: 'u', ß: 'ss' };
const DROP = new Set(['fc', 'cf', 'ac', 'as', 'sk', 'afc', 'fk', 'ssc', 'ss', 'sc', 'cd', 'rc', 'ogc', 'losc', 'calcio', 'club', 'de', 'cfc', 'bk', 'spor', 'kulubu', 'jk', 'as', 'a.s.', '1']);
export function norm(s) {
  return String(s || '')
    .replace(/[ıİşŞğĞçÇöÖüÜß]/g, (c) => TR_MAP[c])
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/).filter((w) => w && !DROP.has(w)).join(' ');
}

// API-Football'da sık görülen yazımlar → bizim kodlarımız
const ALIASES = {
  'bayern munich': 'FCB', 'bayern munchen': 'FCB', 'paris saint germain': 'PSG', 'psg': 'PSG', 'milan': 'MIL', 'inter': 'INT', 'internazionale': 'INT',
  'roma': 'ROM', 'atletico madrid': 'ATM', 'istanbul basaksehir': 'IBFK', 'basaksehir': 'IBFK', 'amed': 'AMD', 'amedspor': 'AMD', 'gaziantep': 'GFK',
  'gaziantep bb': 'GFK', 'corum': 'COR', 'erzurumspor': 'ERZ', 'erzurum bb': 'ERZ', 'borussia monchengladbach': 'BMG', 'monchengladbach': 'BMG',
  'koln': 'KOE', 'tottenham': 'TOT', 'tottenham hotspur': 'TOT', 'newcastle': 'NEW', 'newcastle united': 'NEW', 'west ham': 'WHU', 'west ham united': 'WHU',
  'manchester united': 'MUN', 'manchester city': 'MCI', 'athletic': 'ATH', 'athletic bilbao': 'ATH', 'betis': 'BET', 'real betis': 'BET', 'celta vigo': 'CEL',
  'celta': 'CEL', 'lille': 'LOSC', 'marseille': 'OM', 'olympique marseille': 'OM', 'lyon': 'OL', 'olympique lyonnais': 'OL', 'nice': 'NIC', 'rennes': 'REN',
  'stade rennais': 'REN', 'strasbourg': 'STR', 'nantes': 'NAN', 'toulouse': 'TFC', 'lens': 'RCL', 'rizespor': 'RIZ', 'caykur rizespor': 'RIZ',
  'genclerbirligi': 'GB', 'kasimpasa': 'KAS', 'eyupspor': 'EYP', 'alanyaspor': 'ALN', 'goztepe': 'GOZ', 'konyaspor': 'KON', 'kocaelispor': 'KOC',
  'samsunspor': 'SAM', 'trabzonspor': 'TS', 'besiktas': 'BJK', 'fenerbahce': 'FB', 'galatasaray': 'GS', 'eintracht frankfurt': 'SGE', 'werder bremen': 'SVW',
  'hamburger': 'HSV', 'hamburger sv': 'HSV', 'stuttgart': 'VFB', 'vfb stuttgart': 'VFB', 'bayer leverkusen': 'B04', 'rb leipzig': 'RBL', 'borussia dortmund': 'BVB',
};
const BY_NORM = new Map(Object.entries(KNOWN_TEAMS).map(([k, t]) => [norm(t.name), k]));

export function matchTeam(apiName) {
  const n = norm(apiName);
  if (!n) return null;
  if (ALIASES[n]) return ALIASES[n];
  if (BY_NORM.has(n)) return BY_NORM.get(n);
  const hits = [...BY_NORM.entries()].filter(([k]) => k.length >= 4 && (k === n || (n.includes(k) && k.length >= 5) || (k.includes(n) && n.length >= 5)));
  return hits.length === 1 ? hits[0][1] : null;
}

// Ülke adı (API) → kısa kod
export const COUNTRY_CODES = {
  Turkey: 'TR', 'Türkiye': 'TR', England: 'GB', Spain: 'ES', Germany: 'DE', Italy: 'IT', France: 'FR', Portugal: 'PT', Netherlands: 'NL', Belgium: 'BE',
  Scotland: 'SC', Austria: 'AT', Switzerland: 'CH', 'Czech-Republic': 'CZ', Czechia: 'CZ', Croatia: 'HR', Serbia: 'RS', Ukraine: 'UA', Slovakia: 'SK',
  Greece: 'GR', Denmark: 'DK', Norway: 'NO', Sweden: 'SE', Poland: 'PL', Cyprus: 'CY', Azerbaijan: 'AZ', Kazakhstan: 'KZ', Hungary: 'HU', Romania: 'RO',
  Bulgaria: 'BG', Israel: 'IL', Slovenia: 'SI', Ireland: 'IE', Wales: 'GB', 'Northern-Ireland': 'GB', Moldova: 'MD', Belarus: 'BY',
};
