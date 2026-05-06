// §0.1 — two-link planar arm. User drives joint angles directly with sliders;
// click anywhere to set a target dot. Distance metric updates live.
window.W_arm = function init(root) {
  const canvas = root.querySelector('[data-arm="canvas"]');
  const t1 = root.querySelector('[data-arm="theta1"]');
  const t2 = root.querySelector('[data-arm="theta2"]');
  const t1v = root.querySelector('[data-arm="theta1-val"]');
  const t2v = root.querySelector('[data-arm="theta2-val"]');
  const dv = root.querySelector('[data-arm="dist"]');
  const newBtn = root.querySelector('[data-arm="newtarget"]');
  const T = CV.tokens();

  const L1 = 0.45, L2 = 0.40; // link lengths in normalized units (relative to canvas height)
  let target = { x: 0.55, y: -0.25 };

  function fk(th1, th2) {
    const a = M.rad(th1);
    const b = a + M.rad(th2);
    const j2 = { x: L1 * Math.cos(a), y: L1 * Math.sin(a) };
    const ee = { x: j2.x + L2 * Math.cos(b), y: j2.y + L2 * Math.sin(b) };
    return { j1: { x: 0, y: 0 }, j2, ee };
  }

  function toScreen(p, W, H) {
    const cx = W * 0.42, cy = H * 0.62;
    const k = H * 0.78; // scale so total reach ~ 0.85 of canvas height
    return { x: cx + p.x * k, y: cy - p.y * k };
  }
  function fromScreen(p, W, H) {
    const cx = W * 0.42, cy = H * 0.62;
    const k = H * 0.78;
    return { x: (p.x - cx) / k, y: -(p.y - cy) / k };
  }

  function draw(ctx, W, H) {
    CV.clear(ctx, W, H, T['bg-soft']);

    // grid
    ctx.strokeStyle = T['line-soft']; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (W / 10) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let i = 0; i <= 7; i++) {
      const y = (H / 7) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // workspace circle (max reach)
    const o = toScreen({ x: 0, y: 0 }, W, H);
    const reachR = (L1 + L2) * H * 0.78;
    ctx.strokeStyle = T['line']; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(o.x, o.y, reachR, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);

    const th1 = parseFloat(t1.value);
    const th2 = parseFloat(t2.value);
    const k = fk(th1, th2);
    const j1 = toScreen(k.j1, W, H);
    const j2 = toScreen(k.j2, W, H);
    const ee = toScreen(k.ee, W, H);
    const tg = toScreen(target, W, H);

    // target
    ctx.fillStyle = T['accent'];
    ctx.beginPath(); ctx.arc(tg.x, tg.y, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = T['ink']; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(tg.x, tg.y, 9, 0, Math.PI * 2); ctx.stroke();

    // links
    ctx.strokeStyle = T['ink']; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(j1.x, j1.y); ctx.lineTo(j2.x, j2.y); ctx.stroke();
    ctx.strokeStyle = T['olive']; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(j2.x, j2.y); ctx.lineTo(ee.x, ee.y); ctx.stroke();

    // joints
    CV.dot(ctx, j1.x, j1.y, 8, T['ink']);
    CV.dot(ctx, j2.x, j2.y, 6, T['ink']);
    CV.ring(ctx, ee.x, ee.y, 7, T['ink'], 2);
    CV.dot(ctx, ee.x, ee.y, 4, T['warn']);

    // labels
    CV.label(ctx, 'θ₁', j1.x + 12, j1.y - 22, T['text-mute'], 11);
    CV.label(ctx, 'θ₂', j2.x + 10, j2.y - 22, T['text-mute'], 11);
    CV.label(ctx, 'end‑effector', ee.x + 10, ee.y - 6, T['text-mute'], 11);
    CV.label(ctx, 'target', tg.x + 12, tg.y - 16, T['olive'], 11);

    // distance update
    const dx = ee.x - tg.x, dy = ee.y - tg.y;
    const dCss = Math.hypot(dx, dy);
    dv.textContent = `d = ${dCss.toFixed(0)}px`;
    t1v.textContent = `${Math.round(th1)}°`;
    t2v.textContent = `${Math.round(th2)}°`;
  }

  const cv = CV.setup(canvas, draw, { aspect: 16 / 10 });

  function refresh() { cv.redraw(); }
  t1.addEventListener('input', refresh);
  t2.addEventListener('input', refresh);

  canvas.addEventListener('click', (e) => {
    const p = CV.pt(canvas, e);
    target = fromScreen(p, cv.W, cv.H);
    // clamp to reach
    const r = Math.hypot(target.x, target.y);
    if (r > L1 + L2 - 0.02) {
      const k = (L1 + L2 - 0.02) / r;
      target.x *= k; target.y *= k;
    }
    refresh();
  });

  newBtn.addEventListener('click', () => {
    const a = Math.random() * Math.PI - Math.PI / 6;
    const r = (L1 + L2) * (0.4 + Math.random() * 0.5);
    target = { x: r * Math.cos(a), y: r * Math.sin(a) };
    refresh();
  });
};
