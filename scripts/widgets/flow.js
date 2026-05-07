// §0.5 — flow matching, 2D. We define a target distribution as a Gaussian
// mixture; the "true" velocity field at time t is the conditional flow that
// pushes a noisy sample toward the data. Sample particles are advected by
// integrating the field over t∈[0,1].
window.W_flow = function init(root) {
  const canvas = root.querySelector('[data-flow="canvas"]');
  const tS = root.querySelector('[data-flow="t"]');
  const tV = root.querySelector('[data-flow="t-val"]');
  const mS = root.querySelector('[data-flow="modes"]');
  const mV = root.querySelector('[data-flow="modes-val"]');
  const playBtn = root.querySelector('[data-flow="play"]');
  const reseed = root.querySelector('[data-flow="reseed"]');
  const T = CV.tokens();

  // Sample particles in normalized space [-1, 1] × [-1, 1]
  let particles = []; // {x0, y0, dx, dy} — x0,y0 = source noise, dx,dy = paired data target
  let seed = 11;
  let modes = 3;

  function makeMixture(k) {
    const rng = M.rng(seed);
    const arr = [];
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2 + rng() * 0.4;
      const r = 0.55;
      arr.push({ mx: r * Math.cos(a), my: r * Math.sin(a), s: 0.10 + rng() * 0.05 });
    }
    return arr;
  }
  let mixture = makeMixture(modes);

  function reseedAll() {
    const rng = M.rng(seed);
    particles = [];
    for (let i = 0; i < 220; i++) {
      // source = standard Gaussian-ish (clipped uniform inside disk so it looks tidy)
      let x0, y0, r;
      do { x0 = rng() * 2 - 1; y0 = rng() * 2 - 1; r = Math.hypot(x0, y0); } while (r > 0.95);
      // assign to nearest random mode (so you get clear basins)
      const mIdx = Math.floor(rng() * mixture.length);
      const m = mixture[mIdx];
      const dx = m.mx + (rng() * 2 - 1) * m.s;
      const dy = m.my + (rng() * 2 - 1) * m.s;
      particles.push({ x0, y0, dx, dy });
    }
  }
  reseedAll();

  // Conditional optimal-transport flow (linear interpolation between source and data target)
  // x(t) = (1-t)*x0 + t*dx ;  v(x,t) = dx - x0
  function pos(p, t) { return { x: (1 - t) * p.x0 + t * p.dx, y: (1 - t) * p.y0 + t * p.dy }; }
  function vel(p) { return { x: p.dx - p.x0, y: p.dy - p.y0 }; }

  // Average velocity field at a query point (x,y) at time t — the "learned" field.
  // We approximate it by a soft k-NN over particles whose pos(t) is near (x,y).
  function fieldAt(qx, qy, t) {
    let sx = 0, sy = 0, sw = 0;
    const sigma = 0.18;
    for (const p of particles) {
      const px = (1 - t) * p.x0 + t * p.dx;
      const py = (1 - t) * p.y0 + t * p.dy;
      const d2 = (px - qx) ** 2 + (py - qy) ** 2;
      const w = Math.exp(-d2 / (2 * sigma * sigma));
      sx += w * (p.dx - p.x0);
      sy += w * (p.dy - p.y0);
      sw += w;
    }
    if (sw < 1e-6) return { x: 0, y: 0 };
    return { x: sx / sw, y: sy / sw };
  }

  function draw(ctx, W, H) {
    if (W < 40 || H < 40) return;
    CV.clear(ctx, W, H, T['bg-soft']);
    const m = { l: 18, r: 18, t: 18, b: 18 };
    const cx = (W - m.l - m.r) / 2 + m.l, cy = (H - m.t - m.b) / 2 + m.t;
    const k = Math.min(W - m.l - m.r, H - m.t - m.b) / 2.2;
    const sx = (x) => cx + x * k;
    const sy = (y) => cy - y * k;

    // bg axes — subtle
    ctx.strokeStyle = T['line-soft']; ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i += 0.25) {
      ctx.beginPath(); ctx.moveTo(sx(i), sy(-1)); ctx.lineTo(sx(i), sy(1)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx(-1), sy(i)); ctx.lineTo(sx(1), sy(i)); ctx.stroke();
    }

    const t = parseFloat(tS.value) / 100;

    // velocity field (sampled grid)
    const G = 13;
    for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
      const x = -0.95 + (i / (G - 1)) * 1.9;
      const y = -0.95 + (j / (G - 1)) * 1.9;
      const v = fieldAt(x, y, t);
      const mag = Math.hypot(v.x, v.y);
      if (mag < 1e-3) continue;
      const len = 0.07; // arrow length in normalized space
      const nx = v.x / mag, ny = v.y / mag;
      const x2 = x + nx * len, y2 = y + ny * len;
      ctx.strokeStyle = T['olive-soft']; ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx(x), sy(y)); ctx.lineTo(sx(x2), sy(y2)); ctx.stroke();
      // arrowhead
      const ah = 4;
      const ax = sx(x2), ay = sy(y2);
      const hx = sx(x2) - sx(x), hy = sy(y2) - sy(y);
      const hl = Math.hypot(hx, hy) || 1;
      const ux = hx / hl, uy = hy / hl;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - ux * ah - uy * (ah * 0.6), ay - uy * ah + ux * (ah * 0.6));
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - ux * ah + uy * (ah * 0.6), ay - uy * ah - ux * (ah * 0.6));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // data targets (crosses)
    ctx.strokeStyle = T['olive']; ctx.lineWidth = 1.2;
    for (const m of mixture) {
      const px = sx(m.mx), py = sy(m.my);
      ctx.beginPath();
      ctx.moveTo(px - 5, py); ctx.lineTo(px + 5, py);
      ctx.moveTo(px, py - 5); ctx.lineTo(px, py + 5);
      ctx.stroke();
    }

    // particles
    for (const p of particles) {
      const q = pos(p, t);
      ctx.fillStyle = T['accent'];
      ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 2.2, 0, Math.PI * 2); ctx.fill();
    }

    // ring marking distribution boundaries
    ctx.strokeStyle = T['line']; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, k * 0.95, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);

    // labels
    CV.label(ctx, `t = ${t.toFixed(2)}  ·  noise → data`, m.l + 6, m.t + 6, T['text-mute'], 11);
    CV.label(ctx, `${mixture.length} mode${mixture.length > 1 ? 's' : ''}`, W - 90, m.t + 6, T['text-mute'], 11);
  }

  const cv = CV.setup(canvas, draw, { aspect: 1.4 });

  function refresh() {
    tV.textContent = (parseFloat(tS.value) / 100).toFixed(2);
    mV.textContent = mS.value;
    cv.redraw();
  }
  tS.addEventListener('input', refresh);
  mS.addEventListener('input', () => {
    modes = parseInt(mS.value, 10);
    mixture = makeMixture(modes);
    reseedAll();
    refresh();
  });
  reseed.addEventListener('click', () => { seed = (seed * 31 + 1) & 0x7fffffff; mixture = makeMixture(modes); reseedAll(); refresh(); });

  let playing = false, raf = 0, t0 = 0;
  function loop(now) {
    if (!playing) return;
    if (!t0) t0 = now;
    const u = ((now - t0) / 2200) % 1;
    tS.value = String(Math.round(u * 100));
    refresh();
    raf = requestAnimationFrame(loop);
  }
  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.textContent = playing ? 'Pause' : 'Animate';
    t0 = 0;
    cancelAnimationFrame(raf);
    if (playing) raf = requestAnimationFrame(loop);
  });
  refresh();
};
