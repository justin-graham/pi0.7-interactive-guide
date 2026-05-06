// §0.3 — behavior cloning. User clicks to add (observation, action) demos.
// A Nadaraya–Watson smoother fits a curve. A coverage band shades regions
// with enough nearby demos.
window.W_bc = function init(root) {
  const canvas = root.querySelector('[data-bc="canvas"]');
  const bw = root.querySelector('[data-bc="bw"]');
  const bwVal = root.querySelector('[data-bc="bw-val"]');
  const reset = root.querySelector('[data-bc="reset"]');
  const seed = root.querySelector('[data-bc="seed"]');
  const T = CV.tokens();

  // demos in canvas px coords initially seeded
  let demos = [];
  function seedDemos() {
    demos = [];
    const rng = M.rng(7);
    for (let i = 0; i < 18; i++) {
      const x = 0.18 + rng() * 0.55;
      const trueY = 0.55 + 0.22 * Math.sin(x * 6.0) - 0.18 * x;
      const y = trueY + (rng() - 0.5) * 0.05;
      demos.push({ x, y });
    }
  }
  seedDemos();

  function nw(x, h) {
    // Nadaraya–Watson, returns {y, weight}
    let num = 0, den = 0;
    for (const p of demos) {
      const k = Math.exp(-((p.x - x) * (p.x - x)) / (2 * h * h));
      num += k * p.y;
      den += k;
    }
    return { y: den > 0 ? num / den : 0, w: den };
  }

  function draw(ctx, W, H) {
    CV.clear(ctx, W, H, T['bg-soft']);
    // axes margin
    const m = { l: 36, r: 16, t: 16, b: 36 };
    const px = (x) => m.l + x * (W - m.l - m.r);
    const py = (y) => H - m.b - y * (H - m.t - m.b);

    // axes
    ctx.strokeStyle = T['line']; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, H - m.b); ctx.lineTo(W - m.r, H - m.b); ctx.stroke();
    CV.label(ctx, 'observation x', W - m.r - 96, H - m.b + 12, T['olive'], 11);
    ctx.save();
    ctx.translate(12, m.t + 6); ctx.rotate(0);
    CV.label(ctx, 'action y', 0, 0, T['olive'], 11);
    ctx.restore();

    // sweep x for smoother + coverage band
    const N = 160;
    const h = parseFloat(bw.value) / 600; // bandwidth in normalized x
    const ys = []; const ws = [];
    let wMax = 1e-9;
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const r = nw(x, h);
      ys.push(r.y); ws.push(r.w);
      if (r.w > wMax) wMax = r.w;
    }

    // coverage band (shade where weight > threshold)
    ctx.fillStyle = 'rgba(255,210,60,.18)';
    ctx.beginPath();
    let inBand = false;
    for (let i = 0; i < N; i++) {
      const conf = ws[i] / wMax;
      const x = i / (N - 1);
      if (conf > 0.18) {
        if (!inBand) { ctx.moveTo(px(x), m.t); inBand = true; }
        ctx.lineTo(px(x), H - m.b);
      } else if (inBand) {
        // close band segment
        const xPrev = (i - 1) / (N - 1);
        ctx.lineTo(px(xPrev), m.t);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        inBand = false;
      }
    }
    if (inBand) {
      ctx.lineTo(px(1), H - m.b);
      ctx.lineTo(px(1), m.t);
      ctx.closePath(); ctx.fill();
    }

    // smoother curve, alpha by confidence
    ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    for (let i = 1; i < N; i++) {
      const x0 = (i - 1) / (N - 1), x1 = i / (N - 1);
      const conf = (ws[i] + ws[i - 1]) / 2 / wMax;
      const alpha = M.clamp(conf * 1.4, 0.18, 1);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = conf > 0.18 ? T['ink'] : T['olive-soft'];
      ctx.beginPath();
      ctx.moveTo(px(x0), py(M.clamp(ys[i - 1], 0, 1)));
      ctx.lineTo(px(x1), py(M.clamp(ys[i], 0, 1)));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // demos
    demos.forEach((p) => {
      ctx.fillStyle = T['olive']; ctx.strokeStyle = T['ink'];
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px(p.x), py(p.y), 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });

    // legend
    CV.label(ctx, `${demos.length} demos · h = ${parseFloat(bw.value).toFixed(0)}`, m.l, m.t - 2, T['text-mute'], 11);
    CV.label(ctx, 'covered region', W - m.r - 110, m.t - 2, T['olive'], 11);
    ctx.fillStyle = 'rgba(255,210,60,.5)'; ctx.fillRect(W - m.r - 130, m.t, 12, 12);
  }

  const cv = CV.setup(canvas, draw, { aspect: 16 / 10 });

  function refresh() { bwVal.textContent = bw.value; cv.redraw(); }
  bw.addEventListener('input', refresh);

  canvas.addEventListener('click', (e) => {
    const m = { l: 36, r: 16, t: 16, b: 36 };
    const W = cv.W, H = cv.H;
    const p = CV.pt(canvas, e);
    const x = (p.x - m.l) / (W - m.l - m.r);
    const y = 1 - (p.y - m.t) / (H - m.t - m.b);
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      demos.push({ x, y });
      refresh();
    }
  });

  reset.addEventListener('click', () => { demos = []; refresh(); });
  seed.addEventListener('click', () => { seedDemos(); refresh(); });

  refresh();
};
