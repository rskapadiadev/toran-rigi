// The walk kit: what every illustrated walk film shares. One camera moving through painted cards
// placed in depth (2.5D), and the lamps, arches and garlands they are made of. A scene loads it,
// then paints its own world. Units: z forward, y down (negative is up), the ground at y = 0.
const W = 1080, H = 1920;
const HZ = 1080;     // the horizon on screen (eye level)
const F = 1000;      // a card 1000 units away is drawn at its own size
const c = document.getElementById('c');
const ctx = c.getContext('2d');

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const mix = (a, b, k) => a + (b - a) * k;

// The camera's walk: seconds → depth through the given points, eased with no overshoot, so its
// speed changes smoothly.
function walkPath(keys) {
  const slopes = (() => {
    const n = keys.length, d = [], m = [];
    for (let k = 0; k < n - 1; k++) d.push((keys[k + 1][1] - keys[k][1]) / (keys[k + 1][0] - keys[k][0]));
    m.push(d[0]);
    for (let k = 1; k < n - 1; k++) m.push(d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2);
    m.push(d[n - 2]);
    for (let k = 0; k < n - 1; k++) {
      if (d[k] === 0) { m[k] = m[k + 1] = 0; continue; }
      const a = m[k] / d[k], b = m[k + 1] / d[k], q = a * a + b * b;
      if (q > 9) { const tau = 3 / Math.sqrt(q); m[k] = tau * a * d[k]; m[k + 1] = tau * b * d[k]; }
    }
    return m;
  })();
  return (t) => {
    t = clamp(t, 0, keys[keys.length - 1][0]);
    let k = 0; while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
    const [t0, z0] = keys[k], [t1, z1] = keys[k + 1], h = t1 - t0, u = (t - t0) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    return h00 * z0 + h10 * h * slopes[k] + h01 * z1 + h11 * h * slopes[k + 1];
  };
}
const cam = { x: 0, y: -150, z: -760 };
function P(x, y, z) { const d = z - cam.z, s = F / d; return { x: W / 2 + (x - cam.x) * s, y: HZ + (y - cam.y) * s, s, d }; }

// ---------- drawing helpers ----------
function glow(g, x, y, r, color, a) {
  if (r <= 0 || a <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color.replace('A', a)); gr.addColorStop(1, color.replace('A', 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}
function flame(g, x, y, s, t, ph, lit) {
  if (lit <= 0 || s < 0.05) return;
  const f = 1 + Math.sin(t * 9 + ph) * 0.08 + Math.sin(t * 23 + ph * 2) * 0.05;
  g.save(); g.globalCompositeOperation = 'lighter';
  // Capped: a lamp passing right by the camera must not wash the whole frame.
  glow(g, x, y - 7 * s, Math.min(22 * s * f, 150), 'rgba(255,165,70,A)', 0.34 * lit);
  g.restore();
  g.save(); g.globalAlpha = lit;
  const h = 15 * s * f, w = 5 * s;
  const gr = g.createLinearGradient(x, y, x, y - h);
  gr.addColorStop(0, '#ff9a2e'); gr.addColorStop(0.6, '#ffd27a'); gr.addColorStop(1, '#fff6dc');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(x, y - h);
  g.quadraticCurveTo(x + w, y - h * 0.35, x, y); g.quadraticCurveTo(x - w, y - h * 0.35, x, y - h); g.fill();
  g.restore();
}
function diya(g, x, y, s, t, ph, lit) {
  if (s < 0.05) return;
  g.fillStyle = '#8a4a24';
  g.beginPath(); g.ellipse(x, y, 11 * s, 4.5 * s, 0, 0, Math.PI); g.fill();
  g.fillStyle = lit > 0 ? '#e09a52' : '#6a3a20';
  g.beginPath(); g.ellipse(x, y, 11 * s, 2.2 * s, 0, 0, Math.PI * 2); g.fill();
  flame(g, x, y - 1 * s, s, t, ph, lit);
}
function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }

// A cusped (multifoil) pointed arch, base at y = 0: its outline as points, so the same shape cuts
// a card and clips the view through the gate.
function cuspedArch(w, h, lobes = 7) {
  const r = w / 2, spring = -(h - r * 1.2), pts = [[-r, 0], [-r, spring]];
  const N = 140, depth = r * 0.085;
  for (let i = 0; i <= N; i++) {
    const u = i / N, th = Math.PI * u;
    const peak = 0.2 * r * Math.max(0, 1 - Math.abs(u - 0.5) * 2) ** 3;
    const x = -r * Math.cos(th), y = spring - r * 1.05 * Math.sin(th) - peak;
    const nx = -x, ny = spring - r * 0.3 - y, len = Math.hypot(nx, ny) || 1;
    const k = depth * (1 - Math.abs(Math.sin(Math.PI * lobes * u)));
    pts.push([x + (nx / len) * k, y + (ny / len) * k]);
  }
  pts.push([r, spring], [r, 0]);
  return pts;
}
function onion(g, cx, base, r, tip) {
  g.beginPath(); g.moveTo(cx - r, base);
  g.bezierCurveTo(cx - r * 1.25, base - (base - tip) * 0.55, cx - r * 0.2, tip + (base - tip) * 0.3, cx, tip);
  g.bezierCurveTo(cx + r * 0.2, tip + (base - tip) * 0.3, cx + r * 1.25, base - (base - tip) * 0.55, cx + r, base);
  g.closePath();
}
function rosette(g, x, y, r, col) {
  g.fillStyle = col;
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.45, r * 0.2, a, 0, Math.PI * 2); g.fill(); }
  g.beginPath(); g.arc(x, y, r * 0.25, 0, Math.PI * 2); g.fill();
}
function garland(g, x0, y0, x1, y1, sag, n, seed, size = 7) {
  const r = rng(seed);
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = mix(x0, x1, u), y = mix(y0, y1, u) + Math.sin(u * Math.PI) * sag;
    g.fillStyle = r() < 0.5 ? '#f29a2e' : r() < 0.6 ? '#f6c23e' : '#e0562a';
    g.beginPath(); g.arc(x, y, size + r() * 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(110,40,10,0.35)'; g.beginPath(); g.arc(x + 1.5, y + 2, size * 0.45, 0, Math.PI * 2); g.fill();
  }
}
function strand(g, x, y0, y1, seed, size = 6) {
  const r = rng(seed);
  for (let y = y0; y < y1; y += size * 1.6) {
    g.fillStyle = r() < 0.55 ? '#f29a2e' : '#f6c23e';
    g.beginPath(); g.arc(x + (r() - 0.5) * 2, y, size, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#e0562a'; g.beginPath(); g.arc(x, y1, size * 1.3, 0, Math.PI * 2); g.fill();
}
// Mango leaves along a toran.
function leaves(g, x0, x1, y, n) {
  for (let i = 0; i < n; i++) {
    const x = mix(x0, x1, (i + 0.5) / n);
    g.fillStyle = i % 2 ? '#2f6b2f' : '#3f7f35';
    g.beginPath(); g.moveTo(x - 9, y); g.quadraticCurveTo(x, y + 34, x, y + 40); g.quadraticCurveTo(x, y + 34, x + 9, y); g.fill();
  }
}
function lattice(g, x0, y0, x1, y1, step, col) {
  g.save(); g.strokeStyle = col; g.lineWidth = 2;
  for (let k = -40; k < 80; k++) {
    g.beginPath(); g.moveTo(x0 + k * step, y0); g.lineTo(x0 + k * step + (y1 - y0), y1); g.stroke();
    g.beginPath(); g.moveTo(x0 + k * step, y0); g.lineTo(x0 + k * step - (y1 - y0), y1); g.stroke();
  }
  g.restore();
}

// A card: painted once (local units, origin at its bottom centre), then drawn at any depth.
function card(w, h, res, draw) {
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(w * res); cv.height = Math.ceil(h * res);
  const g = cv.getContext('2d');
  g.setTransform(res, 0, 0, res, (w * res) / 2, h * res);
  draw(g, w, h);
  return { cv, w, h };
}
function put(cd, x, base, z, alpha = 1) {
  const d = z - cam.z; if (d < 25) return;
  const s = F / d, w = cd.w * s, h = cd.h * s;
  const sx = W / 2 + (x - cam.x) * s - w / 2, sy = HZ + (base - cam.y) * s - h;
  if (sx > W || sy > H || sx + w < 0 || sy + h < 0 || alpha <= 0) return;
  ctx.globalAlpha = alpha; ctx.drawImage(cd.cv, sx, sy, w, h); ctx.globalAlpha = 1;
}

// Grain, made once.
const grain = document.createElement('canvas'); grain.width = 540; grain.height = 960;
{ const g = grain.getContext('2d'); const img = g.createImageData(540, 960); const r = rng(5);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (r() - 0.5) * 70; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0); }

// A strip of floor between two depths, cut at the camera.
function floorStrip(x0, x1, y, z0, z1, fill) {
  z0 = Math.max(z0, cam.z + 20); if (z1 <= z0) return;
  const a = P(x0, y, z0), b = P(x1, y, z0), cc = P(x1, y, z1), d = P(x0, y, z1);
  poly(ctx, [[a.x, a.y], [b.x, b.y], [cc.x, cc.y], [d.x, d.y]]); ctx.fillStyle = fill; ctx.fill();
}
function floorGlow(x, y, z, r, a) {
  // Only when the whole pool of light is ahead: one reaching behind the camera would smear.
  if (z - r < cam.z + 60) return;
  const p = P(x, y, z);
  const near = P(x, y, z - r), far = P(x, y, z + r);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.translate(p.x, (near.y + far.y) / 2); ctx.scale(1, Math.max(0.02, (near.y - far.y) / 2 / (r * p.s)));
  glow(ctx, 0, 0, Math.min(r * p.s, 700), 'rgba(255,170,80,A)', a); ctx.restore();
}
// A side wall standing at x, from depth z0 to z1 and height y0 (top) to y1 (bottom), cut at the camera.
function wallPlane(x, y0, y1, z0, z1, fill) {
  z0 = Math.max(z0, cam.z + 20); if (z1 <= z0) return;
  const a = P(x, y0, z0), b = P(x, y0, z1), cc = P(x, y1, z1), d = P(x, y1, z0);
  poly(ctx, [[a.x, a.y], [b.x, b.y], [cc.x, cc.y], [d.x, d.y]]); ctx.fillStyle = fill; ctx.fill();
}
// A flat shape (points [along, up], as from cuspedArch) laid on a side wall at x, centred at depth zc:
// screen points, or null when part of it is behind the camera.
function onWall(x, zc, base, pts) {
  const out = [];
  for (const [u, v] of pts) { const p = P(x, base + v, zc + u); if (p.d < 20) return null; out.push([p.x, p.y]); }
  return out;
}
// An open outline (an arch's sides and top without the line across its foot).
function polyline(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); }
