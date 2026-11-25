// Parametrik 3D stadyum üretici + görüntüleyici (Three.js)
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const PL = 105, PW = 68;
const col = (h) => new THREE.Color(h);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

function hash2(i, j, seed) {
  let h = Math.imul(i | 0, 374761393) ^ Math.imul(j | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
function strSeed(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

// ---- profil (tribün kesiti): [d, h, tür, kat]
function profile(tiers) {
  const P = []; let d = 0, h = 0;
  P.push([d, h, 'wall', 0]); h = 1.3; P.push([d, h, 'wall', 0]);
  tiers.forEach((t, ti) => {
    const tread = t.tread || 0.85, rise = t.rise || (ti ? 0.56 : 0.45);
    if (ti > 0) {
      h += t.box || 4; P.push([d, h, 'box', ti]);
      if (t.overhang) { d -= t.overhang; P.push([d, h, 'soffit', ti]); }
      h += 1.1; P.push([d, h, 'wall', ti]);
    }
    for (let r = 0; r < t.rows; r++) {
      d += tread; P.push([d, h, 'tread', ti, r]);
      h += rise; P.push([d, h, 'riser', ti, r]);
    }
  });
  h += 1.2; P.push([d, h, 'back', tiers.length - 1]);
  return P;
}

// ---- dokular
function canvasTex(w, h, draw, repeat = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; }
  t.anisotropy = 4;
  return t;
}
function facadeTexture(kind, [c0, c1, c2], seed) {
  const r = rng(seed);
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = c0; g.fillRect(0, 0, w, h);
    if (kind === 'louvers') {
      for (let x = 0; x < w; x += 12) { g.fillStyle = c1; g.fillRect(x, 0, 4, h); }
      g.fillStyle = c2; g.fillRect(0, h * 0.12, w, h * 0.06);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, h * 0.86, w, h * 0.14);
    } else if (kind === 'glassgrid') {
      const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, c1); grd.addColorStop(1, c0);
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2;
      for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      for (let y = 0; y < h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.fillStyle = c2; g.fillRect(0, h * 0.18, w, h * 0.05);
    } else if (kind === 'arches') {
      g.fillStyle = c1; g.fillRect(0, h * 0.08, w, h * 0.04); g.fillRect(0, h * 0.3, w, h * 0.03);
      g.fillStyle = c2;
      for (let x = 0; x < w; x += 64) {
        g.beginPath(); g.moveTo(x + 10, h); g.lineTo(x + 10, h * 0.62);
        g.arc(x + 32, h * 0.62, 22, Math.PI, 0); g.lineTo(x + 54, h); g.closePath(); g.fill();
      }
      g.fillStyle = 'rgba(0,0,0,.18)';
      for (let x = 0; x < w; x += 32) g.fillRect(x + 12, h * 0.16, 8, h * 0.1);
    } else if (kind === 'hex') {
      g.strokeStyle = c1; g.lineWidth = 7;
      const s = 26, hx = s * Math.sqrt(3);
      for (let row = -1; row < h / (s * 1.5) + 1; row++) for (let colI = -1; colI < w / hx + 1; colI++) {
        const cx = colI * hx + (row % 2 ? hx / 2 : 0), cy = row * s * 1.5;
        g.beginPath();
        for (let k = 0; k < 6; k++) { const an = Math.PI / 6 + k * Math.PI / 3; g.lineTo(cx + s * Math.cos(an), cy + s * Math.sin(an)); }
        g.closePath(); g.stroke();
      }
      g.fillStyle = c2; g.globalAlpha = .5; g.fillRect(0, h * 0.9, w, h * 0.1); g.globalAlpha = 1;
    } else if (kind === 'basalt') {
      for (let y = 0; y < h; y += 18) for (let x = (y / 18) % 2 ? -14 : 0; x < w; x += 28) {
        g.fillStyle = r() < 0.5 ? c0 : c1; g.fillRect(x + 1, y + 1, 26, 16);
      }
      g.fillStyle = c2; g.fillRect(0, h * 0.06, w, h * 0.035);
      g.fillStyle = '#d8cfc0'; g.fillRect(0, h * 0.12, w, h * 0.02);
    } else if (kind === 'ribbons') {
      g.fillStyle = c1;
      for (let x = -w; x < w * 2; x += 128) {
        g.beginPath(); g.moveTo(x, h); g.bezierCurveTo(x + 60, h * 0.6, x + 120, h * 0.4, x + 200, 0);
        g.lineTo(x + 236, 0); g.bezierCurveTo(x + 156, h * 0.4, x + 96, h * 0.6, x + 36, h); g.closePath(); g.fill();
      }
      g.fillStyle = c2; g.fillRect(0, h * 0.9, w, h * 0.1);
    } else if (kind === 'brick') {
      for (let y = 0; y < h; y += 8) for (let x = (y / 8) % 2 ? -8 : 0; x < w; x += 16) {
        g.fillStyle = r() < 0.6 ? c0 : c1; g.fillRect(x, y, 15, 7);
      }
      g.fillStyle = c2; g.fillRect(0, h * 0.1, w, h * 0.12);
      g.fillStyle = '#4a5560'; for (let x = 4; x < w; x += 20) g.fillRect(x, h * 0.12, 12, h * 0.08);
    } else if (kind === 'cushions') {
      for (let y = -32; y < h + 32; y += 32) for (let x = -32; x < w + 32; x += 32) {
        g.fillStyle = r() < 0.15 ? c1 : c0; g.beginPath(); g.moveTo(x, y + 16); g.lineTo(x + 16, y); g.lineTo(x + 32, y + 16); g.lineTo(x + 16, y + 32); g.closePath(); g.fill();
        g.strokeStyle = c2; g.lineWidth = 2; g.stroke();
      }
    } else if (kind === 'lattice') {
      g.strokeStyle = c1; g.lineWidth = 6;
      for (let x = -h; x < w + h; x += 28) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke(); g.beginPath(); g.moveTo(x + h, 0); g.lineTo(x, h); g.stroke(); }
      g.fillStyle = c2; g.fillRect(0, h * 0.9, w, h * 0.1);
    } else if (kind === 'fins') {
      for (let x = 0; x < w; x += 24) { g.fillStyle = c1; g.fillRect(x + 8, 0, 16, h); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 20, 0, 4, h); }
      g.fillStyle = c2; g.fillRect(0, h * 0.08, w, h * 0.05);
    } else if (kind === 'mural') {
      const pal = ['#d64545', '#2b6cb0', '#e8b923', '#2f855a', '#f2eee6', '#c05621'];
      for (let y = h * 0.25; y < h; y += 12) for (let x = 0; x < w; x += 12) { g.fillStyle = r() < 0.55 ? c0 : pal[Math.floor(r() * pal.length)]; g.fillRect(x, y, 11, 11); }
      g.fillStyle = c1; g.fillRect(0, h * 0.12, w, h * 0.08);
    } else if (kind === 'ceramic') {
      const pal = [c0, c1, c2, '#ffffff', '#f2c94c'];
      for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x + 1, y + 1, 14, 14); }
    } else if (kind === 'lamellas') {
      for (let y = 0; y < h; y += 10) { const gr = g.createLinearGradient(0, y, 0, y + 10); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fillRect(0, y, w, 8); }
      g.fillStyle = c2; for (let x = 0; x < w; x += 128) g.fillRect(x, 0, 3, h);
    } else if (kind === 'solarfacade') {
      g.fillStyle = c1; g.fillRect(0, 0, w, h);
      g.fillStyle = c0; for (let x = 0; x < w; x += 20) for (let y = 0; y < h * 0.85; y += 14) g.fillRect(x + 1, y + 1, 18, 12);
      g.fillStyle = c2; g.fillRect(0, h * 0.86, w, h * 0.14);
    } else { // panels
      for (let x = 0; x < w; x += 40) { g.fillStyle = (x / 40) % 3 === 0 ? c1 : c0; g.fillRect(x, 0, 36, h); }
      g.fillStyle = c2; for (let x = 0; x < w; x += 40) g.fillRect(x + 36, 0, 4, h);
    }
  });
}
function pitchTexture(v = 0) {
  return canvasTex(1050, 680, (g, w, h) => {
    const n = [14, 18, 12][v % 3], A = '#3f8f48', B = '#4b9c53';
    for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? A : B; g.fillRect(i * w / n, 0, w / n + 1, h); }
    if (v % 4 === 3) { g.globalAlpha = 0.35; for (let j = 0; j < 8; j++) { g.fillStyle = j % 2 ? '#2f7a3a' : '#5aa862'; g.fillRect(0, j * h / 8, w, h / 8 + 1); } g.globalAlpha = 1; }
    const gr = g.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.7); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(20,40,10,.18)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 3;
    const m = (v) => v * 10;
    g.strokeRect(2, 2, w - 4, h - 4);
    g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
    g.beginPath(); g.arc(w / 2, h / 2, m(9.15), 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, h / 2, 4, 0, Math.PI * 2); g.fill();
    for (const s of [0, 1]) {
      const x = s ? w : 0, dir = s ? -1 : 1;
      g.strokeRect(s ? w - m(16.5) : 0, h / 2 - m(20.16), m(16.5), m(40.32));
      g.strokeRect(s ? w - m(5.5) : 0, h / 2 - m(9.16), m(5.5), m(18.32));
      g.beginPath(); g.arc(x + dir * m(11), h / 2, 4, 0, Math.PI * 2); g.fill();
      const ang = Math.acos(5.5 / 9.15);
      g.beginPath(); s ? g.arc(x - m(11), h / 2, m(9.15), Math.PI - ang, Math.PI + ang) : g.arc(m(11), h / 2, m(9.15), -ang, ang); g.stroke();
    }
    for (const [x, y, a0] of [[0, 0, 0], [w, 0, Math.PI / 2], [w, h, Math.PI], [0, h, -Math.PI / 2]]) {
      g.beginPath(); g.arc(x, y, m(1), a0, a0 + Math.PI / 2); g.stroke();
    }
  }, false);
}

// ---- stadyum geometrisi
export function buildStadium(id, m, opts = {}) {
  const seed = strSeed(id);
  const G = new THREE.Group();
  const night = []; // gece açılan şeyler
  const a = m.a, b = m.b, R = m.R, round = !!m.round, sep = !!m.sep;
  const prof = profile(m.tiers);
  const dTop = prof[prof.length - 1][0], hTop = prof[prof.length - 1][1];
  const mul = (m.mul || [[1, 1], [1, 1], [1, 1], [1, 1]]);
  const nL = 32, nS = 22, nC = sep ? 0 : 12;
  const cnt = { 0: nL, 1: nS, 2: nL, 3: nS, 4: nC, 5: nC, 6: nC, 7: nC };
  const cornerSides = { 4: [0, 1], 5: [1, 2], 6: [2, 3], 7: [3, 0] };

  function P(seg, u, d) {
    const rc = round ? R + d : R;
    const X = sep ? a : a + d - rc, Z = sep ? b : b + d - rc;
    switch (seg) {
      case 0: return [lerp(-X, X, u), b + d, 0, 1];
      case 1: return [a + d, lerp(Z, -Z, u), 1, 0];
      case 2: return [lerp(X, -X, u), -(b + d), 0, -1];
      case 3: return [-(a + d), lerp(-Z, Z, u), -1, 0];
      default: {
        const [t0, cx, cz] = { 4: [Math.PI / 2, X, Z], 5: [0, X, -Z], 6: [-Math.PI / 2, -X, -Z], 7: [Math.PI, -X, Z] }[seg];
        const th = t0 - u * Math.PI / 2, c = Math.cos(th), s = Math.sin(th);
        return [cx + rc * c, cz + rc * s, c, s];
      }
    }
  }
  function mk(seg, u) {
    let md, mh, side;
    if (seg < 4) { [md, mh] = mul[seg]; side = seg; }
    else {
      const [p, n] = cornerSides[seg], t = smooth(u);
      md = lerp(mul[p][0], mul[n][0], t); mh = lerp(mul[p][1], mul[n][1], t); side = u < 0.5 ? p : n;
    }
    return { seg, u, md, mh, side };
  }
  const runs = [];
  if (sep) for (const seg of [0, 1, 2, 3]) {
    const s = []; for (let i = 0; i <= cnt[seg]; i++) s.push(mk(seg, i / cnt[seg])); runs.push({ closed: false, s });
  } else {
    const s = []; for (const seg of [0, 4, 1, 5, 2, 6, 3, 7]) for (let i = 0; i < cnt[seg]; i++) s.push(mk(seg, i / cnt[seg]));
    runs.push({ closed: true, s });
  }
  // çevre konumu (metre)
  for (const run of runs) {
    let acc = 0, prev = null;
    for (const s of run.s) { const p = P(s.seg, s.u, 0); if (prev) acc += Math.hypot(p[0] - prev[0], p[1] - prev[1]); s.pos = acc; prev = p; }
    run.len = acc;
    if (run.closed) { const f = P(run.s[0].seg, run.s[0].u, 0), l = P(run.s[run.s.length - 1].seg, run.s[run.s.length - 1].u, 0); run.total = acc + Math.hypot(f[0] - l[0], f[1] - l[1]); }
  }
  function splitRuns(rs, pred) {
    const out = [];
    for (const run of rs) {
      const N = run.s.length, ok = run.s.map(pred);
      if (ok.every(Boolean)) { out.push(run); continue; }
      if (!ok.some(Boolean)) continue;
      const start = run.closed ? ok.indexOf(false) : 0; let cur = [];
      for (let k = 0; k < N; k++) { const i = (start + k) % N; if (ok[i]) cur.push(run.s[i]); else { if (cur.length > 1) out.push({ closed: false, s: cur }); cur = []; } }
      if (cur.length > 1) out.push({ closed: false, s: cur });
    }
    return out;
  }
  const wave = (s) => (m.roof && m.roof.wave ? m.roof.wave * Math.sin(s.pos / 34 * Math.PI * 2) : 0);
  const Htop = (s) => hTop * s.mh + 5 + wave(s);
  const lean = (m.facade && m.facade.lean) || 0;
  const dFac = (s) => dTop * s.md + 1.2;

  // koltuk renkleri
  const seats = m.seats, sc = seats.colors.map(col);
  const C = { wall: col('#2a3038'), box: col('#22303c'), soffit: col('#575e66'), back: col('#6c737a'), cap: col('#8c9298') };
  function seatColor(s, j, tier, row) {
    let c;
    switch (seats.type) {
      case 'sides': c = sc[s.side % sc.length]; break;
      case 'stripes': c = sc[Math.floor(s.pos / (seats.band || 8)) % sc.length]; break;
      case 'blocks': c = sc[(Math.floor(s.pos / (seats.band || 14)) + tier) % sc.length]; break;
      case 'tiers': c = sc[tier % sc.length]; break;
      case 'mosaic': c = sc[Math.floor(hash2(Math.round(s.pos * 2), j, seed) * sc.length) % sc.length]; break;
      default: c = sc[0];
    }
    return c;
  }

  // --- tribün kaseleri (düz gölgeli hücreler)
  const pos = [], cols = [], crowd = [];
  const home = (opts.home || seats.colors).map(col), away = (opts.away || ['#888888']).map(col);
  const PEOPLE = ['#1d2430', '#2b2f36', '#e9e6df', '#5b6470', '#3a4a66', '#8b2b2b', '#c9b79c', '#14171c'].map(col);
  const AISLE = col('#9ea3a8'), VOM = col('#15181c');
  function crowdColor(s, i, j, base) {
    const h = hash2(i * 7 + 3, j * 13 + 1, seed + 99);
    if (h > 0.9) return base; // boş koltuk
    const awayEnd = (s.seg === 3 || s.seg === 7) && s.u > 0.25 && s.u < 0.75;
    const k = hash2(i, j, seed + 5);
    if (awayEnd) return k < 0.65 ? away[k < 0.5 ? 0 : 1 % away.length] : PEOPLE[Math.floor(k * 80) % PEOPLE.length];
    return k < 0.5 ? home[k < 0.36 ? 0 : 1 % home.length] : PEOPLE[Math.floor(k * 97) % PEOPLE.length];
  }
  const tmp = new THREE.Color();
  const V = (s, d, h) => { const p = P(s.seg, s.u, d * s.md); return [p[0], h * s.mh, p[1]]; };
  function quad(A, B, Cc, D, c, c2 = c) {
    pos.push(...A, ...B, ...Cc, ...A, ...Cc, ...D);
    for (let k = 0; k < 6; k++) { cols.push(c.r, c.g, c.b); crowd.push(c2.r, c2.g, c2.b); }
  }
  for (const run of runs) {
    const N = run.s.length, segs = run.closed ? N : N - 1;
    for (let i = 0; i < segs; i++) {
      const s0 = run.s[i], s1 = run.s[(i + 1) % N];
      for (let j = 0; j < prof.length - 1; j++) {
        const p0 = prof[j], p1 = prof[j + 1], kind = p1[2];
        let c, c2;
        if (kind === 'tread' || kind === 'riser') {
          const aisle = i % 4 === 0, row = p1[4], tier = p1[3];
          if (aisle && tier === 0 && row >= 8 && row <= 10) { c = c2 = VOM; }
          else if (aisle) { c = c2 = AISLE.clone().multiplyScalar(kind === 'riser' ? 0.7 : 1); }
          else {
            const v = 0.93 + 0.1 * hash2(i, j, seed + 7), base = seatColor(s0, j, tier, row);
            c = base.clone().multiplyScalar(kind === 'riser' ? 0.62 * v : v);
            c2 = crowdColor(s0, i, j, base).clone().multiplyScalar(kind === 'riser' ? 0.55 * v : v);
          }
        } else c = c2 = C[kind];
        quad(V(s0, p0[0], p0[1]), V(s1, p0[0], p0[1]), V(s1, p1[0], p1[1]), V(s0, p1[0], p1[1]), c, c2);
      }
    }
    if (!run.closed) { // uç kapakları
      const poly = prof.map((p) => new THREE.Vector2(p[0], p[1]));
      poly.push(new THREE.Vector2(dTop, 0));
      const tris = THREE.ShapeUtils.triangulateShape(poly, []);
      for (const s of [run.s[0], run.s[N - 1]]) for (const t of tris) {
        const [A, B, Cc] = t.map((k) => V(s, poly[k].x, poly[k].y));
        pos.push(...A, ...B, ...Cc); for (let k = 0; k < 3; k++) { cols.push(C.cap.r, C.cap.g, C.cap.b); crowd.push(C.cap.r, C.cap.g, C.cap.b); }
      }
    }
  }
  const bowlGeo = new THREE.BufferGeometry();
  bowlGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const seatAttr = new THREE.Float32BufferAttribute(cols, 3), crowdAttr = new THREE.Float32BufferAttribute(crowd, 3);
  bowlGeo.setAttribute('color', opts.crowd === false ? seatAttr : crowdAttr);
  bowlGeo.computeVertexNormals();
  const bowl = new THREE.Mesh(bowlGeo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, side: THREE.DoubleSide }));
  bowl.castShadow = bowl.receiveShadow = true; G.add(bowl);

  // --- şerit (strip) yardımcı: her örnek için alt/üst nokta
  function strip(run, fn, material, uvFn, shadow = true) {
    const N = run.s.length, P2 = [], UV = [], I = [];
    run.s.forEach((s) => { const [lo, hi] = fn(s); P2.push(...lo, ...hi); const [u0, v0, u1, v1] = uvFn(s); UV.push(u0, v0, u1, v1); });
    if (run.closed) { const s = run.s[0], [lo, hi] = fn(s); P2.push(...lo, ...hi); const [u0, v0, u1, v1] = uvFn({ ...s, pos: run.total }); UV.push(u0, v0, u1, v1); }
    const M = P2.length / 6;
    for (let i = 0; i < M - 1; i++) { const k = i * 2; I.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P2, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
    g.setIndex(I); g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, material); mesh.castShadow = shadow; mesh.receiveShadow = true; G.add(mesh); return mesh;
  }
  const pt = (s, d, y) => { const p = P(s.seg, s.u, d); return [p[0], y, p[1]]; };

  // --- cephe
  const facTex = facadeTexture(m.facade.tex, m.facade.colors, seed);
  const facMat = new THREE.MeshStandardMaterial({ map: facTex, roughness: 0.75, metalness: 0.05, side: THREE.DoubleSide });
  if (m.facade.glow) { facMat.emissive = col(m.facade.glow); facMat.emissiveMap = facTex; facMat.emissiveIntensity = 0; night.push({ mat: facMat, day: 0, night: 1.1 }); }
  for (const run of runs) strip(run, (s) => [pt(s, dFac(s), 0), pt(s, dFac(s) + lean * Htop(s), Htop(s))], facMat, (s) => [s.pos / 32, 0, s.pos / 32, 1]);

  // --- reklam panoları
  const adMat = new THREE.MeshStandardMaterial({ color: col(seats.colors[0]).lerp(col('#ffffff'), 0.25), emissive: col(seats.colors[0]), emissiveIntensity: 0.25, roughness: 0.5 });
  night.push({ mat: adMat, day: 0.25, night: 1.4 });
  for (const run of runs) strip(run, (s) => [pt(s, -1.2, 0.1), pt(s, -1.2, 1.0)], adMat, () => [0, 0, 1, 1], false);

  // --- çatı
  const roof = m.roof || { type: 'none' };
  const roofMats = {
    membrane: new THREE.MeshStandardMaterial({ color: '#f3f3ee', roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.94 }),
    metal: new THREE.MeshStandardMaterial({ color: roof.color || '#a1a9b0', roughness: 0.45, metalness: 0.35, side: THREE.DoubleSide }),
    glass: new THREE.MeshStandardMaterial({ color: '#cfe3ee', roughness: 0.15, metalness: 0.1, side: THREE.DoubleSide, transparent: true, opacity: 0.42, depthWrite: false }),
    solar: new THREE.MeshStandardMaterial({ map: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#c8ccd0'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d3552'; for (let x = 0; x < w; x += 32) for (let y = 0; y < h; y += 32) g.fillRect(x + 2, y + 2, 28, 28); g.strokeStyle = 'rgba(255,255,255,.15)'; for (let x = 0; x < w; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } }), roughness: 0.3, metalness: 0.3, side: THREE.DoubleSide }),
  };
  const roofInnerD = (s) => dTop * s.md * (roof.open ?? 0.4);
  const roofY = (s, t) => Htop(s) + 2.6 * t + 1.6 * Math.sin(Math.PI * t);
  const roofD = (s, t) => lerp(dFac(s) + lean * Htop(s), roofInnerD(s), t);
  const roofRuns = roof.sides ? splitRuns(runs, (s) => roof.sides.includes(s.side)) : runs;
  if (roof.type && roof.type !== 'none') {
    const mat = roofMats[roof.type] || roofMats.metal;
    if (roof.type === 'solar') { mat.map.wrapT = THREE.RepeatWrapping; }
    const K = 6;
    for (const run of roofRuns) {
      for (let k = 0; k < K; k++) {
        const t0 = k / K, t1 = (k + 1) / K;
        strip(run, (s) => [pt(s, roofD(s, t0), roofY(s, t0)), pt(s, roofD(s, t1), roofY(s, t1))], mat,
          (s) => [s.pos / 10, roofD(s, t0) / 10, s.pos / 10, roofD(s, t1) / 10]);
      }
      // iç kenar bandı (makas/kiriş)
      strip(run, (s) => [pt(s, roofD(s, 1), roofY(s, 1) - 2.2), pt(s, roofD(s, 1), roofY(s, 1))],
        new THREE.MeshStandardMaterial({ color: '#3b4148', roughness: 0.6, side: THREE.DoubleSide }), () => [0, 0, 1, 1]);
      // alt yüz
      strip(run, (s) => [pt(s, roofD(s, 0), roofY(s, 0) - 1.2), pt(s, roofD(s, 1), roofY(s, 1) - 2.2)],
        new THREE.MeshStandardMaterial({ color: '#5d646b', roughness: 0.8, side: THREE.DoubleSide }), () => [0, 0, 1, 1], false);
    }
  }

  // --- ışıklar
  const lampMat = new THREE.MeshStandardMaterial({ color: '#f5f1e2', emissive: '#fff4d6', emissiveIntensity: 0.15 });
  night.push({ mat: lampMat, day: 0.15, night: 4 });
  const lampPts = [];
  if (m.lights === 'roof' && roof.type !== 'none') {
    for (const run of roofRuns) run.s.forEach((s, i) => { if (i % 2 === 0) lampPts.push(pt(s, roofD(s, 1) + 0.3, roofY(s, 1) - 2.6)); });
    const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 0.8, 0.8), lampMat, lampPts.length);
    const o = new THREE.Object3D();
    lampPts.forEach((p, i) => { o.position.set(...p); o.lookAt(0, 0, 0); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); });
    G.add(inst);
  }
  const maxMd = Math.max(...mul.map((x) => x[0])), maxMh = Math.max(...mul.map((x) => x[1]));
  const outA = a + dTop * maxMd + 4, outB = b + dTop * maxMd + 4, Hmax = hTop * maxMh + 8;
  if (m.lights === 'towers') {
    const steel = new THREE.MeshStandardMaterial({ color: '#8d959c', roughness: 0.5, metalness: 0.4 });
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const x = sx * (a + dTop * 0.6 + 10), z = sz * (b + dTop * 0.6 + 10), H = Hmax + 20;
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.4, H, 8), steel);
      mast.position.set(x, H / 2, z); mast.castShadow = true; G.add(mast);
      const head = new THREE.Mesh(new THREE.BoxGeometry(9, 5, 0.8), lampMat);
      head.position.set(x, H, z); head.lookAt(0, 0, 0); G.add(head);
      lampPts.push([x, H, z]);
    }
  }

  // --- özel parçalar
  const steelMat = new THREE.MeshStandardMaterial({ color: '#c3c9ce', roughness: 0.4, metalness: 0.5 });
  if (roof.arches) {
    for (const sz of roof.arches === 1 ? [1] : [1, -1]) {
      const z = sz * (b + dTop * 0.55), x0 = a + dTop + 14, y0 = Hmax * 0.55;
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-x0, y0, z), new THREE.Vector3(0, Hmax + 46, z), new THREE.Vector3(x0, y0, z));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 1.3, 10), steelMat); tube.castShadow = true; G.add(tube);
      const segs = [];
      for (let x = -a; x <= a; x += 12) { const t = (x + x0) / (2 * x0); const p = curve.getPoint(t); segs.push(p.x, p.y, p.z, p.x, Hmax - 2, p.z); }
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
      G.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#7d868d' })));
    }
  }
  if (roof.masts && !sep) {
    const run = runs[0], n = roof.masts, segs = [];
    for (let k = 0; k < n; k++) {
      const s = run.s[Math.floor(k * run.s.length / n)];
      const base = pt(s, dFac(s) + 12, 0), H = Hmax + 26;
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(roof.mastColor ? 1.1 : 0.5, roof.mastColor ? 1.6 : 0.9, H, 8), roof.mastColor ? new THREE.MeshStandardMaterial({ color: roof.mastColor, roughness: 0.5 }) : steelMat);
      mast.position.set(base[0], H / 2, base[2]); mast.castShadow = true; G.add(mast);
      const inner = pt(s, roofD(s, 0.7), roofY(s, 0.7)), anchor = pt(s, dFac(s) + 34, 0);
      segs.push(base[0], H, base[2], ...inner, base[0], H, base[2], ...anchor);
    }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    G.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#59626a' })));
  }
  if (roof.ribs) {
    const pts = []; for (const run of roofRuns) run.s.forEach((s, i) => { if (i % 3 === 0) pts.push(s); });
    const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1.6, 0.7), new THREE.MeshStandardMaterial({ color: roof.ribsColor || '#e8e8e4', roughness: 0.5 }), pts.length);
    const o = new THREE.Object3D();
    pts.forEach((s, i) => {
      const p0 = pt(s, roofD(s, 0), roofY(s, 0)), p1 = pt(s, roofD(s, 1), roofY(s, 1));
      o.position.set((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 1.2, (p0[2] + p1[2]) / 2);
      o.rotation.set(0, -Math.atan2(p1[2] - p0[2], p1[0] - p0[0]), 0);
      o.scale.set(Math.hypot(p1[0] - p0[0], p1[2] - p0[2]), 1, 1); o.updateMatrix(); inst.setMatrixAt(i, o.matrix);
    });
    inst.castShadow = true; G.add(inst);
  }
  if (m.cornerTowers && typeof m.cornerTowers === 'object') {
    const ct = m.cornerTowers, tm = new THREE.MeshStandardMaterial({ color: ct.color || '#d9d9d9', roughness: 0.5, emissive: ct.glow || '#000000', emissiveIntensity: 0 });
    if (ct.glow) night.push({ mat: tm, day: 0, night: 1.2 });
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const H = Hmax + (ct.h || 18), tw = new THREE.Mesh(new THREE.BoxGeometry(ct.r || 4, H, ct.r || 4), tm);
      tw.position.set(sx * (outA - 6), H / 2, sz * (outB - 6)); tw.castShadow = true; G.add(tw);
    }
  } else if (m.cornerTowers && !sep) {
    const tex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#dfe6ec'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a9aa8'; for (let y = -h; y < h * 2; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y - 60); g.lineTo(w, y - 48); g.lineTo(0, y + 12); g.fill(); } });
    tex.wrapT = THREE.RepeatWrapping;
    for (const seg of [4, 5, 6, 7]) {
      const s = mk(seg, 0.5), p = pt(s, dFac(s) + 8, 0), H = Htop(s) - 2;
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 8.5, H, 28, 1), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }));
      tower.position.set(p[0], H / 2, p[2]); tower.castShadow = true; G.add(tower);
    }
  }
  if (m.cornerFill && sep) {
    const fm = new THREE.MeshStandardMaterial({ map: facadeTexture(m.facade.tex, m.facade.colors, seed + 3), roughness: 0.75 });
    for (const [sx, sz, si, sj] of [[1, 1, 1, 0], [1, -1, 1, 2], [-1, -1, 3, 2], [-1, 1, 3, 0]]) {
      const w = dTop * mul[si][0], d = dTop * mul[sj][0], h = hTop * Math.min(mul[si][1], mul[sj][1]) * 0.85;
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fm);
      box.position.set(sx * (a + w / 2), h / 2, sz * (b + d / 2)); box.castShadow = box.receiveShadow = true; G.add(box);
    }
  }

  if (m.helix && !sep) {
    const tex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#bfc0bb'; g.fillRect(0, 0, w, h); g.fillStyle = '#7d7f7a'; for (let y = -h; y < h * 2; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y - 70); g.lineTo(w, y - 58); g.lineTo(0, y + 12); g.fill(); } });
    tex.wrapT = THREE.RepeatWrapping;
    const hm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }), run = runs[0];
    for (let k = 0; k < m.helix; k++) {
      const s = run.s[Math.floor((k + 0.5) * run.s.length / m.helix)], p = pt(s, dFac(s) + 7, 0), H = Htop(s) - 1;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, H, 24), hm); c.position.set(p[0], H / 2, p[2]); c.castShadow = true; G.add(c);
    }
  }
  if (m.tower) {
    const s = mk(m.tower.side ?? 3, 0.5), p = pt(s, dFac(s) + 5, 0), H = Hmax + (m.tower.h || 40);
    const tm = new THREE.MeshStandardMaterial({ map: facadeTexture(m.tower.tex || 'brick', m.tower.colors || ['#b0644a', '#8c4b37', '#d9d2c4'], seed + 5), roughness: 0.8 });
    const tw = new THREE.Mesh(new THREE.BoxGeometry(8, H, 8), tm); tw.position.set(p[0], H / 2, p[2]); tw.castShadow = true; G.add(tw);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(6.2, 8, 4), new THREE.MeshStandardMaterial({ color: '#6b4a3a' })); cap.position.set(p[0], H + 4, p[2]); cap.rotation.y = Math.PI / 4; G.add(cap);
  }
  if (m.cube) {
    const cm = new THREE.MeshStandardMaterial({ color: '#1f2933', emissive: '#7dd3fc', emissiveIntensity: 0.2 });
    night.push({ mat: cm, day: 0.2, night: 1.2 });
    const cy = hTop * 0.9 + 6, cube = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 14), cm); cube.position.set(0, cy, 0); cube.castShadow = true; G.add(cube);
    const segs = []; for (const [x, z] of [[7, 7], [7, -7], [-7, 7], [-7, -7]]) segs.push(x, cy + 4, z, x * 9, Hmax, z * 6);
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3)); G.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#59626a' })));
  }
  if (m.berm) {
    const lathe = new THREE.LatheGeometry([new THREE.Vector2(0.98, 0), new THREE.Vector2(1.02, 9), new THREE.Vector2(1.12, 12), new THREE.Vector2(1.22, 10), new THREE.Vector2(1.34, 0)], 64);
    const berm = new THREE.Mesh(lathe, new THREE.MeshStandardMaterial({ color: '#7fa66a', roughness: 1, flatShading: true }));
    berm.scale.set(outA + 6, 1, outB + 6); berm.receiveShadow = berm.castShadow = true; G.add(berm);
  }

  // --- saha
  if (m.track) {
    const tr = new THREE.Mesh(new THREE.PlaneGeometry(2 * a + 2, 2 * b + 2), new THREE.MeshStandardMaterial({ map: canvasTex(512, 360, (g, w, h) => { g.fillStyle = '#b5482e'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5; for (let i = 1; i < 7; i++) { const ins = i * 6; g.strokeRect(ins, ins, w - 2 * ins, h - 2 * ins); } }, false), roughness: 1 }));
    tr.rotation.x = -Math.PI / 2; tr.position.y = 0.045; tr.receiveShadow = true; G.add(tr);
  }
  const run0 = new THREE.Mesh(m.track ? new THREE.PlaneGeometry(PL + 14, PW + 10) : new THREE.PlaneGeometry(2 * a + 2, 2 * b + 2), new THREE.MeshStandardMaterial({ color: '#3c8a46', roughness: 1 }));
  run0.rotation.x = -Math.PI / 2; run0.position.y = 0.06; run0.receiveShadow = true; G.add(run0);
  const pitchMat = new THREE.MeshStandardMaterial({ map: pitchTexture(seed % 7), roughness: 0.95, emissive: '#2f6f37', emissiveIntensity: 0 });
  night.push({ mat: pitchMat, day: 0, night: 0.18 });
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(PL, PW), pitchMat);
  pitch.rotation.x = -Math.PI / 2; pitch.position.y = 0.08; pitch.receiveShadow = true; G.add(pitch);
  const goalMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });
  for (const sx of [1, -1]) {
    const g = new THREE.Group();
    const post = (x, y, z, w, h, d) => { const mm = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), goalMat); mm.position.set(x, y, z); mm.castShadow = true; g.add(mm); };
    post(0, 1.22, -3.66, 0.12, 2.44, 0.12); post(0, 1.22, 3.66, 0.12, 2.44, 0.12); post(0, 2.44, 0, 0.12, 0.12, 7.44);
    g.position.x = sx * PL / 2; G.add(g);
  }

  // oyuncular (4-4-2), hakemler
  const shirt = (cs) => col(cs[0]);
  const XI = [[-50, 0], [-36, -22], [-38, -7], [-38, 7], [-36, 22], [-20, -24], [-22, -8], [-22, 8], [-20, 24], [-6, -7], [-8, 9]];
  const capG = new THREE.CapsuleGeometry(0.55, 1.5, 3, 8);
  const addTeam = (cs, sign, gk) => {
    const inst = new THREE.InstancedMesh(capG, new THREE.MeshStandardMaterial({ roughness: 0.6 }), 11), o = new THREE.Object3D(), cc = new THREE.Color();
    XI.forEach(([x, z], i) => { o.position.set(sign * -x * 1 + (hash2(i, sign, seed) - 0.5) * 3, 1.3, z * sign + (hash2(sign, i, seed) - 0.5) * 3); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); inst.setColorAt(i, i === 0 ? cc.set(gk) : cc.copy(shirt(cs))); });
    inst.castShadow = true; G.add(inst);
  };
  if (opts.home) { addTeam(opts.home, -1, '#1f1f1f'); addTeam(opts.away, 1, '#d8e04a');
    const ref = new THREE.InstancedMesh(capG, new THREE.MeshStandardMaterial({ color: '#f2d43a' }), 3), o = new THREE.Object3D();
    [[2, 4], [-26, -PW / 2 - 1], [26, PW / 2 + 1]].forEach(([x, z], i) => { o.position.set(x, 1.3, z); o.updateMatrix(); ref.setMatrixAt(i, o.matrix); }); G.add(ref); }
  const dugMat = new THREE.MeshStandardMaterial({ color: '#c9d3dc', transparent: true, opacity: 0.75, roughness: 0.2 });
  for (const sx of [-1, 1]) { const d = new THREE.Mesh(new THREE.BoxGeometry(12, 2.4, 2.6), dugMat); d.position.set(sx * 9, 1.2, -(PW / 2 + 4.2)); d.castShadow = true; G.add(d); }
  const flagMat = new THREE.MeshStandardMaterial({ color: '#f5c518', side: THREE.DoubleSide });
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), flagMat); f.position.set(sx * PL / 2, 2.2, sz * PW / 2); G.add(f);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 5), goalMat); pole.position.set(sx * PL / 2, 1.3, sz * PW / 2); G.add(pole); }
  // skorbord
  const boardTex = canvasTex(512, 220, (g, w, h) => {
    g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.font = 'bold 74px "Big Shoulders Display", Impact, sans-serif'; g.fillText(opts.board || '', w / 2, 112);
    g.fillStyle = '#ffd34d'; g.font = 'bold 40px "Archivo", Arial, sans-serif'; g.fillText(opts.boardSub || '', w / 2, 178);
    g.strokeStyle = '#333'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
  }, false);
  const boardMat = new THREE.MeshStandardMaterial({ map: boardTex, emissive: '#ffffff', emissiveMap: boardTex, emissiveIntensity: 0.55, side: THREE.DoubleSide });
  night.push({ mat: boardMat, day: 0.55, night: 1.4 });
  const hang = !roof.sides || roof.sides.includes(1);
  for (const seg of [1, 3]) {
    const s = mk(seg, 0.5);
    const p = hang && roof.type !== 'none' ? pt(s, roofD(s, 1) + 3, roofY(s, 1) - 7.5) : pt(s, dFac(s) - 2, Htop(s) + 6);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(22, 9.5), boardMat); scr.position.set(...p); scr.lookAt(0, p[1] - 4, 0); G.add(scr);
    const back = new THREE.Mesh(new THREE.BoxGeometry(23, 10.5, 0.8), new THREE.MeshStandardMaterial({ color: '#2a2f35' })); back.position.copy(scr.position); back.quaternion.copy(scr.quaternion); back.translateZ(-0.5); G.add(back);
  }

  // --- çevre
  const env = buildSurroundings(m.setting || {}, seed, outA, outB, night, runs, P, dFac);
  G.add(env);

  return { group: G, night, lampPts, radius: Math.max(outA, outB), height: Hmax, setCrowd(v) { bowlGeo.setAttribute('color', v ? crowdAttr : seatAttr); } };
}

function buildSurroundings(st, seed, outA, outB, night, runs, P, dFac) {
  const g = new THREE.Group(), r = rng(seed + 11);
  const kind = st.kind || 'suburban';
  const groundCol = { urban: '#cbcbc6', terraced: '#c6c3bc', suburban: '#c3cdb0', open: '#d6cfb9', forest: '#a9bf93' }[kind];
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ color: groundCol, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  // meydan
  const plaza = new THREE.Shape();
  const pr = 22;
  plaza.moveTo(-outA - pr, -outB - pr); plaza.lineTo(outA + pr, -outB - pr); plaza.lineTo(outA + pr, outB + pr); plaza.lineTo(-outA - pr, outB + pr);
  const pm = new THREE.Mesh(new THREE.ShapeGeometry(plaza), new THREE.MeshStandardMaterial({ color: '#e3e1db', roughness: 1 }));
  pm.rotation.x = -Math.PI / 2; pm.position.y = 0.03; pm.receiveShadow = true; g.add(pm);
  // yollar
  const road = new THREE.MeshStandardMaterial({ color: '#6d7175', roughness: 1 });
  const addRoad = (x, z, w, d) => { const rm = new THREE.Mesh(new THREE.PlaneGeometry(w, d), road); rm.rotation.x = -Math.PI / 2; rm.position.set(x, 0.04, z); rm.receiveShadow = true; g.add(rm); };
  addRoad(0, outB + pr + 7, 2 * (outA + pr) + 28, 14); addRoad(0, -(outB + pr + 7), 2 * (outA + pr) + 28, 14);
  addRoad(outA + pr + 7, 0, 14, 2 * (outB + pr)); addRoad(-(outA + pr + 7), 0, 14, 2 * (outB + pr));
  if (st.road) addRoad(-(outA + 150), 0, 46, 3000);
  { const cars = [], CC = ['#e9e9e6', '#1d2127', '#8c939b', '#b3261e', '#2c4f7c', '#d8d3c4', '#3c3f44'];
    for (let k = 0; k < 140; k++) {
      const side = k % 4, t = r() * 2 - 1, lane = r() < 0.5 ? -3 : 3;
      const [x, z, rot] = side === 0 ? [t * (outA + pr + 10), outB + pr + 7 + lane, 0] : side === 1 ? [t * (outA + pr + 10), -(outB + pr + 7) + lane, 0] : side === 2 ? [outA + pr + 7 + lane, t * (outB + pr), Math.PI / 2] : [-(outA + pr + 7) + lane, t * (outB + pr), Math.PI / 2];
      if (r() < 0.55) cars.push([x, z, rot, CC[Math.floor(r() * CC.length)]]);
    }
    // otopark
    const pkX = outA + pr + 40, pkZ = -(outB * 0.5);
    const lot = new THREE.Mesh(new THREE.PlaneGeometry(60, outB * 1.2), new THREE.MeshStandardMaterial({ color: '#8a8e92', roughness: 1 })); lot.rotation.x = -Math.PI / 2; lot.position.set(pkX, 0.035, pkZ); lot.receiveShadow = true; g.add(lot);
    for (let cx = -24; cx <= 24; cx += 12) for (let cz = -outB * 0.55; cz < outB * 0.55; cz += 3) if (r() < 0.7) cars.push([pkX + cx + (r() - 0.5), pkZ + cz, Math.PI / 2, CC[Math.floor(r() * CC.length)]]);
    const ci = new THREE.InstancedMesh(new THREE.BoxGeometry(4.4, 1.5, 1.9), new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.3 }), cars.length), o = new THREE.Object3D(), cc = new THREE.Color();
    cars.forEach(([x, z, rot, c], i) => { o.position.set(x, 0.8, z); o.rotation.set(0, rot, 0); o.updateMatrix(); ci.setMatrixAt(i, o.matrix); ci.setColorAt(i, cc.set(c)); });
    ci.castShadow = true; g.add(ci); }
  const rail = st.rail ? -(outA + 70) : null;
  if (rail) { const rm = new THREE.Mesh(new THREE.PlaneGeometry(16, 3000), new THREE.MeshStandardMaterial({ color: '#7a7066', roughness: 1 })); rm.rotation.x = -Math.PI / 2; rm.position.set(rail, 0.05, 0); g.add(rm);
    const rl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3000), new THREE.MeshStandardMaterial({ color: '#3f3a36' })); rl.rotation.x = -Math.PI / 2; rl.position.set(rail - 3, 0.07, 0); g.add(rl); const rl2 = rl.clone(); rl2.position.x = rail + 3; g.add(rl2); }
  const water = st.water;
  if (water) {
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ color: '#7eaecb', roughness: 0.25, metalness: 0.1 }));
    wm.rotation.x = -Math.PI / 2; wm.position.y = 0.08;
    if (water.axis === 'x') wm.position.x = water.sign * (water.from + 1500); else wm.position.z = water.sign * (water.from + 1500);
    g.add(wm);
  }
  const inWater = (x, z) => water && (water.axis === 'x' ? water.sign * x > water.from - 15 : water.sign * z > water.from - 15);
  const inPark = (x, z) => !!st.park && x > outA + 60 && z < -10 && x < outA + 340 && z > -400;
  const inLot = (x, z) => x > outA + pr + 4 && x < outA + pr + 80 && Math.abs(z + outB * 0.5) < outB * 0.7;
  const blocked = (x, z, hw, hd) => inLot(x, z) || (Math.abs(x) - hw < outA + pr + 16 && Math.abs(z) - hd < outB + pr + 16)
    || inWater(x + hw * Math.sign(x), z + hd * Math.sign(z)) || inWater(x, z)
    || (rail != null && Math.abs(x - rail) < hw + 12) || (st.road && Math.abs(x + outA + 150) < hw + 28)
    || inPark(x, z);
  // binalar
  const palettes = {
    urban: ['#c9c9c4', '#d9d4c9', '#b8bec4', '#e3ddd1', '#aab1b8'],
    terraced: ['#a35d47', '#9a5442', '#b06d55', '#8c4c3b', '#c4b9a6'],
    suburban: ['#efe8da', '#e8dac6', '#dfe2e3', '#f1e3d1', '#d8cbb8'],
    open: ['#e8dfcc', '#ddd2bd', '#efe6d4'],
    forest: ['#e8dfcc', '#d9dde0'],
  }[kind];
  const cell = kind === 'terraced' ? 26 : kind === 'urban' ? 34 : 44;
  const prob = { urban: 0.82, terraced: 0.85, suburban: 0.45, open: 0.12, forest: 0.04 }[kind];
  const ext = 640, boxes = [], trees = [];
  for (let x = -ext; x <= ext; x += cell) for (let z = -ext; z <= ext; z += cell) {
    const jx = x + (r() - 0.5) * cell * 0.15, jz = z + (r() - 0.5) * cell * 0.15;
    const dist = Math.hypot(jx, jz);
    let w, d, h;
    if (kind === 'terraced') { w = cell * 0.9; d = 9 + r() * 3; h = 8 + r() * 4; }
    else if (kind === 'urban') { w = 16 + r() * 14; d = 16 + r() * 14; h = 10 + r() * (dist < 300 ? 28 : 40); }
    else if (kind === 'suburban') { w = 16 + r() * 12; d = 16 + r() * 12; h = r() < 0.7 ? 15 + r() * 30 : 6 + r() * 6; }
    else { w = 12 + r() * 20; d = 12 + r() * 16; h = 5 + r() * 8; }
    if (blocked(jx, jz, w / 2, d / 2)) { if (inPark(jx, jz) && r() < 0.7) trees.push([jx, jz, 4 + r() * 3]); continue; }
    if (r() > prob) { if (kind === 'forest') { for (let q = 0; q < 3; q++) trees.push([jx + (r() - 0.5) * cell, jz + (r() - 0.5) * cell, 4 + r() * 4]); } else if (kind !== 'urban' && r() < 0.5) trees.push([jx, jz, 3 + r() * 3]); continue; }
    boxes.push([jx, jz, w, d, h, palettes[Math.floor(r() * palettes.length)]]);
    if (kind === 'terraced' && r() < 0.8) boxes.push([jx, jz + 13, w, d, h, palettes[Math.floor(r() * palettes.length)]]);
  }
  const bMat = new THREE.MeshStandardMaterial({ roughness: 0.9, emissive: '#ffcf8a', emissiveIntensity: 0 });
  night.push({ mat: bMat, day: 0, night: 0.07 });
  const bi = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bMat, boxes.length);
  const o = new THREE.Object3D(), cc = new THREE.Color();
  boxes.forEach(([x, z, w, d, h, c], i) => { o.position.set(x, h / 2, z); o.scale.set(w, h, d); o.updateMatrix(); bi.setMatrixAt(i, o.matrix); bi.setColorAt(i, cc.set(c)); });
  bi.castShadow = bi.receiveShadow = true; g.add(bi);
  // ağaçlar (meydan kenarı + boşluklar)
  for (let k = 0; k < 40; k++) {
    const t = k / 40 * Math.PI * 2, x = Math.cos(t) * (outA + pr - 4), z = Math.sin(t) * (outB + pr - 4);
    trees.push([Math.max(-outA - pr + 3, Math.min(outA + pr - 3, x * 1.15)), Math.max(-outB - pr + 3, Math.min(outB + pr - 3, z * 1.15)), 2.6 + r()]);
  }
  const ti = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }), trees.length);
  trees.forEach(([x, z, s], i) => { o.position.set(x, s * 1.1, z); o.scale.set(s, s * 1.2, s); o.rotation.set(0, r() * 3, 0); o.updateMatrix(); ti.setMatrixAt(i, o.matrix); ti.setColorAt(i, cc.set(['#6f9a5a', '#5f8a4e', '#7ca664'][i % 3])); });
  ti.castShadow = true; g.add(ti);
  if (st.hills) {
    const hm = new THREE.MeshStandardMaterial({ color: '#94ab84', roughness: 1, flatShading: true });
    for (let k = 0; k < 9; k++) {
      const t = -Math.PI * 0.9 + k * 0.32 + r() * 0.2, dd = 900 + r() * 300;
      const hill = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), hm);
      hill.position.set(Math.cos(t) * dd, 0, Math.sin(t) * dd); hill.scale.set(260 + r() * 160, 90 + r() * 90, 220 + r() * 120); g.add(hill);
    }
  }
  return g;
}

// ---- görüntüleyici
export function createViewer(host) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false }); }
  catch (e) { host.insertAdjacentHTML('beforeend', '<p class="noweb">3D görünüm bu cihazda açılamadı.</p>'); return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  const sky = (top, mid, bot) => { const t = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, false); return t; };
  const SKY = { day: sky('#7fb2e0', '#cfe2ef', '#eef2f2'), night: sky('#04070f', '#0d1830', '#1b2440') };
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 1, 6000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = 1.42; controls.minDistance = 60; controls.maxDistance = 1100;
  controls.autoRotate = true; controls.autoRotateSpeed = 0.55;
  const hemi = new THREE.HemisphereLight('#eef4fb', '#8d8a7c', 1.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff6e8', 2.4);
  sun.position.set(220, 320, 140); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -330, right: 330, top: 330, bottom: -330, near: 10, far: 1200 });
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.6;
  scene.add(sun);
  const spots = [];
  for (let k = 0; k < 4; k++) { const s = new THREE.SpotLight('#fff3dc', 0, 0, 0.85, 0.7, 0); s.target.position.set(0, 0, 0); scene.add(s, s.target); spots.push(s); }
  let cur = null, isNight = false, active = false, onChange = null, crowdOn = true;
  controls.addEventListener('start', () => { controls.autoRotate = false; onChange && onChange({ auto: false }); });

  function applyNight() {
    scene.background = isNight ? SKY.night : SKY.day;
    scene.fog = new THREE.Fog(isNight ? '#141d33' : '#e6edf0', 800, 2300);
    renderer.toneMappingExposure = isNight ? 1.25 : 1.05;
    hemi.intensity = isNight ? 0.32 : 1.6; hemi.color.set(isNight ? '#6c7fa8' : '#eef4fb');
    sun.intensity = isNight ? 0.18 : 2.4; sun.color.set(isNight ? '#9fb3d9' : '#fff6e8');
    if (cur) {
      for (const n of cur.night) n.mat.emissiveIntensity = isNight ? n.night : n.day;
      const H = cur.height, R = cur.radius;
      const corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      spots.forEach((s, i) => { s.intensity = isNight ? 2.6 : 0; s.position.set(corners[i][0] * R * 0.75, H + 18, corners[i][1] * R * 0.75); });
    }
  }
  function show(id, model, opts = {}) {
    if (cur) { scene.remove(cur.group); cur.group.traverse((o) => { o.geometry && o.geometry.dispose(); if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((mm) => { mm.map && mm.map.dispose(); mm.dispose(); }); } }); }
    cur = buildStadium(id, model, { ...opts, crowd: crowdOn });
    scene.add(cur.group);
    const R = cur.radius, dist = R * 2.85;
    const az = opts.az ?? 0.78, el = 0.6;
    camera.position.set(Math.cos(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.sin(az) * Math.cos(el) * dist);
    controls.target.set(0, cur.height * 0.18, 0);
    controls.autoRotate = opts.auto ?? true;
    controls.update();
    isNight = !!opts.night; applyNight();
  }
  function resize() {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px';
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  const loop = () => { controls.update(); renderer.render(scene, camera); };
  return {
    show,
    setNight(v) { isNight = v; applyNight(); },
    setAuto(v) { controls.autoRotate = v; },
    setCrowd(v) { crowdOn = v; cur && cur.setCrowd(v); },
    get crowd() { return crowdOn; },
    get auto() { return controls.autoRotate; },
    start() { if (!active) { active = true; resize(); renderer.setAnimationLoop(loop); } },
    stop() { active = false; renderer.setAnimationLoop(null); },
    resize,
    onChange(fn) { onChange = fn; },
    zoom(f) { const v = camera.position.clone().sub(controls.target).multiplyScalar(f); const len = Math.min(controls.maxDistance, Math.max(controls.minDistance, v.length())); camera.position.copy(controls.target).add(v.setLength(len)); },
  };
}
