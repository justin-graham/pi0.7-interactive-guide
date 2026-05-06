// §2 — averaging-fails-on-multimodal-data demo. Same observation x produces
// two correct actions y1, y2 from two demonstrators. Toggle adds a robot label
// so the model can fit both.
window.W_conflict = function init(root) {
  const canvas = root.querySelector('[data-conflict="canvas"]');
  const toggle = root.querySelector('[data-conflict="label"]');
  const T = CV.tokens();

  // Two scatter clouds: dataset A and dataset B share xs but differ in ys.
  function genData() {
    const rng = M.rng(13);
    const A = [], B = [];
    for (let i = 0; i < 50; i++) {
      const x = 0.10 + rng() * 0.8;
      A.push({ x, y: 0.30 + 0.18 * Math.sin(x * 5.1) + (rng() - 0.5) * 0.04 });
      B.push({ x, y: 0.70 - 0.22 * Math.sin(x * 5.1) + (rng() - 0.5) * 0.04 });
    }
    return { A, B };
  }
  const data = genData();

  function nw(pts, x, h) {
    let n = 0, d = 0;
    for (const p of pts) { const k = Math.exp(-((p.x - x) ** 2) / (2 * h * h)); n += k * p.y; d += k; }
    return d > 0 ? n / d : 0;
  }

  function draw(ctx, W, H) {
    CV.clear(ctx, W, H, T['bg-soft']);
    const m = { l: 36, r: 16, t: 16, b: 36 };
    const px = (x) => m.l + x * (W - m.l - m.r);
    const py = (y) => H - m.b - y * (H - m.t - m.b);

    ctx.strokeStyle = T['line']; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, H - m.b); ctx.lineTo(W - m.r, H - m.b); ctx.stroke();
    CV.label(ctx, 'observation x', W - m.r - 96, H - m.b + 12, T['olive'], 11);
    CV.label(ctx, 'action y', 12, m.t + 4, T['olive'], 11);

    const labeled = toggle.checked;
    const colA = T['teal-deep'], colB = T['rose'];

    // scatter both datasets
    [['A', data.A, colA], ['B', data.B, colB]].forEach(([name, pts, col]) => {
      pts.forEach((p) => {
        ctx.fillStyle = labeled ? col : T['olive'];
        ctx.globalAlpha = labeled ? 0.95 : 0.6;
        ctx.beginPath(); ctx.arc(px(p.x), py(p.y), 3.5, 0, Math.PI * 2); ctx.fill();
      });
    });
    ctx.globalAlpha = 1;

    const N = 120; const h = 0.04;
    if (!labeled) {
      const merged = data.A.concat(data.B);
      // single-mode regressor → averages
      ctx.strokeStyle = T['ink']; ctx.lineWidth = 2.5; ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        const y = nw(merged, x, h);
        if (i === 0) ctx.moveTo(px(x), py(y));
        else ctx.lineTo(px(x), py(y));
      }
      ctx.stroke(); ctx.setLineDash([]);
      CV.label(ctx, 'naive average — passes through neither', m.l + 8, m.t + 4, T['ink'], 12);
    } else {
      // two conditional regressors
      [[data.A, colA, 'robot A'], [data.B, colB, 'robot B']].forEach(([pts, col, name]) => {
        ctx.strokeStyle = col; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const x = i / (N - 1);
          const y = nw(pts, x, h);
          if (i === 0) ctx.moveTo(px(x), py(y));
          else ctx.lineTo(px(x), py(y));
        }
        ctx.stroke();
      });
      // legend
      let lx = m.l + 8, ly = m.t + 4;
      ctx.fillStyle = colA; ctx.fillRect(lx, ly + 2, 10, 10); CV.label(ctx, 'robot A', lx + 16, ly, T['text-mute']);
      lx += 78; ctx.fillStyle = colB; ctx.fillRect(lx, ly + 2, 10, 10); CV.label(ctx, 'robot B', lx + 16, ly, T['text-mute']);
    }
  }

  const cv = CV.setup(canvas, draw, { aspect: 16 / 10 });
  toggle.addEventListener('change', () => cv.redraw());
};
