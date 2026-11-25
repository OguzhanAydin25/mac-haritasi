// Elle modellenmemiş stadyumlar için kapasiteye ve takım renklerine göre otomatik 3D model parametreleri.
function rng(seedStr) {
  let h = 2166136261; for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  let s = (h >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];

export function autoModel(seed, cap, colors) {
  const r = rng('auto' + seed), [c1, c2] = colors;
  const big = cap >= 45000, mid = cap >= 22000;
  const sep = !mid && r() < 0.7;
  const round = !sep && r() < 0.5;
  const tiers = big ? [{ rows: 24 }, { rows: 6, box: 4, overhang: 2 }, { rows: 18, box: 3, overhang: 3, rise: 0.6 }]
    : mid ? [{ rows: 22 }, { rows: 12 + Math.floor(r() * 6), box: 4, overhang: 3 }]
      : [{ rows: 14 + Math.floor(r() * 8) }];
  const main = 1 + r() * 0.2;
  return {
    a: 55 + Math.floor(r() * 3), b: 36 + Math.floor(r() * 3), R: sep ? 2 : round ? 14 + Math.floor(r() * 20) : 2 + Math.floor(r() * 8), round, sep,
    cornerFill: sep && r() < 0.5,
    tiers,
    mul: [[main, main], [0.9 + r() * 0.1, 0.9 + r() * 0.1], [1 + r() * 0.1, 1 + r() * 0.1], [0.9 + r() * 0.1, 0.9 + r() * 0.1]],
    seats: pick(r, [{ type: 'solid', colors: [c1] }, { type: 'sides', colors: [c1, c2, c1, c2] }, { type: 'stripes', colors: [c1, c2], band: 6 + Math.floor(r() * 6) }, { type: 'mosaic', colors: [c1, c1, c2] }, { type: 'tiers', colors: [c1, c2] }]),
    facade: { tex: pick(r, ['panels', 'glassgrid', 'louvers', 'fins', 'brick', 'ribbons']), colors: [pick(r, ['#E8E8E4', '#3A4048', '#C9CDD2', c1]), c2 === '#ffffff' || c2 === '#FFFFFF' ? '#D9DCE0' : c2, c1] },
    roof: { type: pick(r, ['membrane', 'metal', 'metal', 'glass']), open: 0.25 + r() * 0.15, color: pick(r, ['#A6ADB4', '#C9CED2', '#6F7A84']) },
    lights: sep && r() < 0.6 ? 'towers' : 'roof',
    setting: { kind: pick(r, ['urban', 'suburban', 'suburban', 'open', 'terraced']), hills: r() < 0.3 },
  };
}
