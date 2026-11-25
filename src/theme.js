// Lig temaları: renkler, özgün amblemler (resmi logolar değil) ve arka plan desenleri
export const THEMES = {
  ALL: { name: 'Tüm ligler', short: 'Tümü', f1: '#123F31', f2: '#0B2B21', acc: '#F2B53A', on: '#F3F6F1', brand: '#145A43', mark: 'TÜM AVRUPA' },
  SL: { name: 'Süper Lig', short: 'Süper Lig', f1: '#B8111C', f2: '#7D0910', acc: '#FFFFFF', on: '#FFFFFF', brand: '#C8102E', mark: 'SÜPER LİG', country: 'TR' },
  PL: { name: 'Premier League', short: 'Premier League', f1: '#3D0942', f2: '#220027', acc: '#00F088', on: '#FFFFFF', brand: '#4A0A52', acc2: '#FF2D87', mark: 'PREMIER LEAGUE', country: 'GB' },
  LL: { name: 'LaLiga', short: 'LaLiga', f1: '#F2493F', f2: '#C92A22', acc: '#FFD447', on: '#FFFFFF', brand: '#D9352C', mark: 'LALIGA', country: 'ES' },
  BL: { name: 'Bundesliga', short: 'Bundesliga', f1: '#D20515', f2: '#151515', acc: '#FFFFFF', on: '#FFFFFF', brand: '#C30413', mark: 'BUNDESLIGA', country: 'DE' },
  SA: { name: 'Serie A', short: 'Serie A', f1: '#0F2C5E', f2: '#081A3B', acc: '#2BC4A9', on: '#FFFFFF', brand: '#123A7A', mark: 'SERIE A', country: 'IT' },
  L1: { name: 'Ligue 1', short: 'Ligue 1', f1: '#0C2149', f2: '#06132C', acc: '#E4F54A', on: '#FFFFFF', brand: '#163063', mark: 'LIGUE 1', country: 'FR' },
  CL: { name: 'Şampiyonlar Ligi', short: 'Şampiyonlar Ligi', f1: '#0C1C66', f2: '#040B38', acc: '#C9D4F2', on: '#FFFFFF', brand: '#14257E', mark: 'ŞAMPİYONLAR LİGİ', country: 'EU' },
};

// Özgün amblemler (100×100). currentColor + --e2 ikinci renk.
export function emblem(lg, cls = 'emb') {
  const w = (inner) => `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
  switch (lg) {
    case 'SL': return w(`<circle cx="50" cy="50" r="46" fill="currentColor"/><circle cx="44" cy="50" r="24" fill="var(--e2)"/><circle cx="51" cy="50" r="19.5" fill="currentColor"/><path d="M70 50l-13.2 4.3 8.2-11.2v13.8l-8.2-11.2z" fill="var(--e2)"/>`);
    case 'PL': return w(`<path d="M50 4l40 18v28c0 24-17 40-40 46C27 90 10 74 10 50V22z" fill="currentColor"/><path d="M28 64l22-34 22 34" fill="none" stroke="var(--e2)" stroke-width="7" stroke-linejoin="round"/><path d="M36 74h28" stroke="var(--e2)" stroke-width="7" stroke-linecap="round"/>`);
    case 'LL': return w(`<circle cx="50" cy="50" r="46" fill="currentColor"/>${Array.from({ length: 12 }, (_, i) => `<path d="M50 50L${50 + 40 * Math.cos(i * Math.PI / 6 - 0.13)} ${50 + 40 * Math.sin(i * Math.PI / 6 - 0.13)}L${50 + 40 * Math.cos(i * Math.PI / 6 + 0.13)} ${50 + 40 * Math.sin(i * Math.PI / 6 + 0.13)}z" fill="var(--e2)"/>`).join('')}<circle cx="50" cy="50" r="15" fill="currentColor"/>`);
    case 'BL': return w(`<rect x="6" y="6" width="88" height="88" rx="10" fill="currentColor"/><path d="M24 76L40 24h12L36 76zM46 76L62 24h12L58 76z" fill="var(--e2)"/>`);
    case 'SA': return w(`<path d="M50 4l40 14v30c0 26-18 42-40 48C28 90 10 74 10 48V18z" fill="currentColor"/><path d="M30 26v44M50 22v52M70 26v44" stroke="var(--e2)" stroke-width="8" stroke-linecap="round"/>`);
    case 'L1': return w(`<path d="M50 4l40 23v46L50 96 10 73V27z" fill="currentColor"/><path d="M36 28v42h28" fill="none" stroke="var(--e2)" stroke-width="9" stroke-linecap="square"/>`);
    case 'CL': return w(`<circle cx="50" cy="50" r="46" fill="currentColor"/>${star(50, 50, 22, 9, 'var(--e2)')}${[[24, 30], [76, 30], [24, 70], [76, 70], [50, 18], [50, 82]].map(([x, y]) => star(x, y, 6, 2.5, 'var(--e2)')).join('')}`);
    default: return w(`<circle cx="50" cy="50" r="46" fill="currentColor"/><path d="M50 30l17 12-6 20H39l-6-20z" fill="var(--e2)"/><path d="M50 30V8M67 42l20-7M61 62l12 18M39 62L27 80M33 42l-20-7" stroke="var(--e2)" stroke-width="5"/>`);
  }
}
function star(cx, cy, R, r, fill) {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); }
  return `<path d="${d}z" fill="${fill}"/>`;
}

// Arka plan: desen + çapraz filigran yazısı + büyük amblem
export function backdrop(lg, W, H) {
  const t = THEMES[lg];
  let pat = '';
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  switch (lg) {
    case 'SL': pat = `<pattern id="p" width="140" height="140" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)"><g transform="translate(40 40) scale(.5)" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="4"><circle cx="44" cy="50" r="24"/><circle cx="51" cy="50" r="19.5"/>${star(70, 50, 13, 5.5, 'none')}</g></pattern>`; break;
    case 'PL': pat = `<pattern id="p" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="6" height="90" fill="rgba(0,240,136,.16)"/><rect x="18" width="2" height="90" fill="rgba(255,45,135,.35)"/></pattern>`; break;
    case 'LL': pat = `<radialGradient id="g" cx="0" cy="0" r="1"><stop offset="0" stop-color="rgba(255,212,71,.35)"/><stop offset="1" stop-color="rgba(255,212,71,0)"/></radialGradient>`; break;
    case 'BL': pat = `<pattern id="p" width="160" height="120" patternUnits="userSpaceOnUse"><path d="M0 120L50 0h40L40 120z" fill="rgba(0,0,0,.22)"/><path d="M95 120L145 0h8L103 120z" fill="rgba(255,255,255,.1)"/></pattern>`; break;
    case 'SA': pat = `<pattern id="p" width="220" height="220" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)"><rect y="90" width="220" height="7" fill="rgba(0,146,70,.55)"/><rect y="97" width="220" height="7" fill="rgba(255,255,255,.5)"/><rect y="104" width="220" height="7" fill="rgba(206,43,55,.6)"/></pattern>`; break;
    case 'L1': pat = `<pattern id="p" width="60" height="104" patternUnits="userSpaceOnUse"><path d="M30 0l30 17v35L30 69 0 52V17zM30 69v35M0 104V87" fill="none" stroke="rgba(228,245,74,.13)" stroke-width="1.5"/></pattern>`; break;
    case 'CL': break;
    default: pat = `<pattern id="p" width="${W / 12}" height="10" patternUnits="userSpaceOnUse"><rect width="${W / 24}" height="10" fill="rgba(255,255,255,.035)"/></pattern>`;
  }
  let extra = '';
  if (lg === 'LL') extra = `<rect width="${W}" height="${H}" fill="url(#g)"/>` + Array.from({ length: 28 }, (_, i) => { const a = i * Math.PI / 28, R = Math.hypot(W, H); return `<path d="M0 0L${R * Math.cos(a - 0.025)} ${R * Math.sin(a - 0.025)}L${R * Math.cos(a + 0.025)} ${R * Math.sin(a + 0.025)}z" fill="rgba(255,255,255,.06)"/>`; }).join('');
  if (lg === 'CL') extra = `<radialGradient id="g" cx=".7" cy=".1" r=".9"><stop offset="0" stop-color="#2A40B8"/><stop offset="1" stop-color="rgba(4,11,56,0)"/></radialGradient><rect width="${W}" height="${H}" fill="url(#g)"/>` + Array.from({ length: 170 }, () => { const x = rnd() * W, y = rnd() * H, s = 1.5 + rnd() * rnd() * 9; return star(x, y, s, s * 0.42, `rgba(220,230,255,${(0.15 + rnd() * 0.55).toFixed(2)})`); }).join('');
  if (lg === 'ALL') { const cx = W * 0.62, cy = 120; extra = `<g fill="none" stroke="rgba(243,246,241,.10)" stroke-width="2"><circle cx="${cx}" cy="${cy}" r="210"/><path d="M${cx} -50V${H}"/><rect x="${W * 0.04}" y="-20" width="${W * 0.92}" height="${H * 0.8}"/></g>`; }
  const rows = [];
  for (let i = -2; i < 9; i++) rows.push(`<text x="${-200 + (i % 2) * 260}" y="${i * 190}" class="wm">${(t.mark + ' · ').repeat(6)}</text>`);
  return `<svg width="100%" height="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${lg === 'LL' || lg === 'CL' ? '' : pat}</defs>${lg === 'LL' || lg === 'CL' ? extra : `<rect width="${W}" height="${H}" fill="url(#p)"/>${extra}`}
    <g transform="rotate(-16 ${W / 2} ${H / 2})" opacity="${lg === 'CL' ? 0.09 : 0.07}">${rows.join('')}</g>
    <g transform="translate(${W * 0.76} ${H * 0.18}) rotate(-16) scale(${Math.min(W, 1600) / 300})" opacity="${lg === 'CL' ? 0.16 : 0.1}" style="color:#fff;--e2:${t.f2}"><g transform="translate(-50 -50)">${emblem(lg, 'bgemb').replace(/<svg[^>]*>|<\/svg>/g, '')}</g></g></svg>`;
}
