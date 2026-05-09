window.W_action_chunks = function init(root) {
  const canvas = root.querySelector('[data-chunks="canvas"]');
  const len = root.querySelector('[data-chunks="len"]');
  const lenVal = root.querySelector('[data-chunks="len-val"]');
  const play = root.querySelector('[data-chunks="play"]');
  const reset = root.querySelector('[data-chunks="reset"]');
  const T = CV.tokens();
  let phase = 0;
  let timer = 0;

  function targetPath(t) {
    return {
      x: 0.08 + 0.84 * t,
      y: 0.55 + 0.18 * Math.sin(t * Math.PI * 1.55) + 0.045 * Math.sin(t * Math.PI * 4.2)
    };
  }

  function rollout(chunk) {
    const steps = 56;
    const reactive = [];
    const chunked = [];
    const plans = [];
    const replanIndices = [];
    let r = { x: 0.08, y: 0.56 };
    let c = { x: 0.08, y: 0.56 };
    let plan = [];

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const goal = targetPath(Math.min(1, t + 0.055));
      const disturbance = 0.025 * Math.sin(i * 1.45 + phase) +
        0.018 * Math.sin(i * 0.37 - phase * 0.55);

      r.x += (goal.x - r.x) * 0.28;
      r.y += (goal.y - r.y) * 0.28 + disturbance;
      reactive.push({ ...r });

      if (i % chunk === 0 || plan.length === 0) {
        const start = { ...c };
        const horizon = Math.min(1, (i + chunk) / (steps - 1));
        const endpoint = targetPath(horizon);
        const blendToChord = M.clamp((chunk - 1) / 9, 0, 1) * 0.72;
        const bow = (0.018 + chunk * 0.003) * Math.sin(i * 0.31 + phase);
        plan = [];
        for (let j = 1; j <= chunk; j++) {
          const k = j / chunk;
          const futureT = Math.min(1, (i + j) / (steps - 1));
          const future = targetPath(futureT);
          const chord = {
            x: M.lerp(start.x, endpoint.x, M.smooth(k)),
            y: M.lerp(start.y, endpoint.y, M.smooth(k)) + Math.sin(Math.PI * k) * bow
          };
          plan.push({
            x: M.lerp(future.x, chord.x, blendToChord),
            y: M.lerp(future.y, chord.y, blendToChord)
          });
        }
        plans.push([{ ...start }, ...plan.map(p => ({ ...p }))]);
        replanIndices.push(i);
      }

      const next = plan.shift() || goal;
      c.x += (next.x - c.x) * 0.78;
      c.y += (next.y - c.y) * 0.78 + disturbance * (0.025 + chunk * 0.006);
      chunked.push({ ...c });
    }
    return { reactive, chunked, plans, replanIndices };
  }

  function draw(ctx, W, H) {
    CV.clear(ctx, W, H, T['bg-soft']);
    const m = { l: 34, r: 24, t: 24, b: 34 };
    const px = x => m.l + x * (W - m.l - m.r);
    const py = y => H - m.b - y * (H - m.t - m.b);
    const chunk = parseInt(len.value, 10);
    const data = rollout(chunk);

    ctx.strokeStyle = T['line-soft'];
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const x = m.l + (W - m.l - m.r) * i / 6;
      CV.line(ctx, x, m.t, x, H - m.b, T['line-soft']);
    }
    for (let i = 0; i <= 4; i++) {
      const y = m.t + (H - m.t - m.b) * i / 4;
      CV.line(ctx, m.l, y, W - m.r, y, T['line-soft']);
    }

    function path(points, color, width, dash, alpha = 1) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = alpha;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(px(p.x), py(p.y));
        else ctx.lineTo(px(p.x), py(p.y));
      });
      ctx.stroke();
      ctx.restore();
    }

    const ideal = Array.from({ length: 80 }, (_, i) => targetPath(i / 79));
    path(ideal, T['olive-soft'], 2, [5, 5]);
    data.plans.forEach(plan => path(plan, T['accent'], 2, [2, 5], 0.5));
    path(data.reactive, T['text-soft'], 2, [3, 4]);
    path(data.chunked, T['accent-2'], 4);

    data.replanIndices.forEach(i => {
      const p = data.chunked[Math.min(i, data.chunked.length - 1)];
      CV.dot(ctx, px(p.x), py(p.y), 3.5, T['ink']);
      CV.ring(ctx, px(p.x), py(p.y), 5.5, T['accent'], 1.2);
    });

    const lastR = data.reactive[data.reactive.length - 1];
    const lastC = data.chunked[data.chunked.length - 1];
    CV.dot(ctx, px(lastR.x), py(lastR.y), 5, T['text-soft']);
    CV.dot(ctx, px(lastC.x), py(lastC.y), 7, T['accent']);
    CV.ring(ctx, px(lastC.x), py(lastC.y), 7, T['ink'], 1.5);

    CV.label(ctx, 'desired local behavior', m.l + 4, m.t + 2, T['olive'], 11);
    CV.label(ctx, 'one-step reactive', W - 148, H - m.b + 12, T['text-soft'], 11);
    CV.label(ctx, 'chunked plan', W - 148, H - m.b - 8, T['ink'], 11);
    CV.label(ctx, `${data.replanIndices.length} replans x ${chunk} commands`, m.l + 4, H - m.b + 12, T['ink'], 11);
    lenVal.textContent = String(chunk);
  }

  const cv = CV.setup(canvas, draw, { aspect: 16 / 10 });
  function refresh() { cv.redraw(); }
  len.addEventListener('input', refresh);
  reset.addEventListener('click', () => { phase = 0; refresh(); });
  play.addEventListener('click', () => {
    if (timer) {
      cancelAnimationFrame(timer);
      timer = 0;
      play.textContent = 'Animate';
      return;
    }
    play.textContent = 'Pause';
    const tick = () => {
      phase += 0.08;
      refresh();
      timer = requestAnimationFrame(tick);
    };
    tick();
  });
  refresh();
};
