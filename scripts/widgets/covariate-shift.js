window.W_covariate_shift = function init(root) {
  const canvas = root.querySelector('[data-shift="canvas"]');
  const mode = root.querySelector('[data-shift="mode"]');
  const stepBtn = root.querySelector('[data-shift="step"]');
  const runBtn = root.querySelector('[data-shift="run"]');
  const resetBtn = root.querySelector('[data-shift="reset"]');
  const score = root.querySelector('[data-shift="score"]');
  const T = CV.tokens();
  let state, trail, tick, timer = 0;

  function expertY(x) {
    return 0.52 + 0.20 * Math.sin(x * Math.PI * 1.35);
  }

  function reset() {
    state = { x: 0.06, y: expertY(0.06), v: 0 };
    trail = [{ ...state }];
    tick = 0;
    score.textContent = 'on track';
  }

  function policyStep() {
    const m = mode.value;
    const targetX = Math.min(0.98, state.x + 0.035);
    const desired = expertY(targetX);
    const off = state.y - expertY(state.x);
    const noise = m === 'clean' ? 0.003 : m === 'recover' ? 0.012 : 0.022;
    const recovery = m === 'recover' ? -off * 0.34 : off * 0.12;
    const drift = (Math.sin(tick * 1.8) + Math.sin(tick * 0.73)) * noise;
    state = {
      x: targetX,
      y: M.clamp(state.y + (desired - state.y) * 0.34 + recovery + drift, 0.08, 0.92),
      v: off
    };
    trail.push({ ...state });
    tick += 1;
    const err = Math.abs(state.y - expertY(state.x));
    score.textContent = err < 0.055 ? 'on track' : err < 0.12 ? 'drifting' : 'off demos';
  }

  function draw(ctx, W, H) {
    CV.clear(ctx, W, H, T['bg-soft']);
    const m = { l: 34, r: 24, t: 20, b: 34 };
    const px = x => m.l + x * (W - m.l - m.r);
    const py = y => H - m.b - y * (H - m.t - m.b);

    const path = Array.from({ length: 120 }, (_, i) => {
      const x = i / 119;
      return { x, y: expertY(x) };
    });

    ctx.fillStyle = 'rgba(251,212,91,.22)';
    ctx.beginPath();
    path.forEach((p, i) => {
      const y = p.y + 0.075;
      if (i === 0) ctx.moveTo(px(p.x), py(y));
      else ctx.lineTo(px(p.x), py(y));
    });
    for (let i = path.length - 1; i >= 0; i--) {
      const p = path[i];
      ctx.lineTo(px(p.x), py(p.y - 0.075));
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = T['olive'];
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    path.forEach((p, i) => {
      if (i === 0) ctx.moveTo(px(p.x), py(p.y));
      else ctx.lineTo(px(p.x), py(p.y));
    });
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = T['ink'];
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    trail.forEach((p, i) => {
      if (i === 0) ctx.moveTo(px(p.x), py(p.y));
      else ctx.lineTo(px(p.x), py(p.y));
    });
    ctx.stroke();

    const cur = trail[trail.length - 1];
    CV.dot(ctx, px(cur.x), py(cur.y), 8, T['accent']);
    CV.ring(ctx, px(cur.x), py(cur.y), 8, T['ink'], 1.5);

    CV.label(ctx, 'demonstration corridor', m.l + 6, m.t + 4, T['olive'], 11);
    CV.label(ctx, 'robot rollout', px(cur.x) + 10, py(cur.y) - 8, T['ink'], 11);
    CV.label(ctx, 'time →', W - m.r - 54, H - m.b + 12, T['text-mute'], 11);
  }

  reset();
  const cv = CV.setup(canvas, draw, { aspect: 16 / 10 });
  function refresh() { cv.redraw(); }
  function step() {
    if (state.x < 0.97) policyStep();
    else if (timer) {
      clearInterval(timer);
      timer = 0;
      runBtn.textContent = 'Run';
    }
    refresh();
  }

  stepBtn.addEventListener('click', step);
  runBtn.addEventListener('click', () => {
    if (timer) {
      clearInterval(timer);
      timer = 0;
      runBtn.textContent = 'Run';
      return;
    }
    runBtn.textContent = 'Pause';
    step();
    timer = setInterval(step, 120);
  });
  resetBtn.addEventListener('click', () => {
    if (timer) clearInterval(timer);
    timer = 0;
    runBtn.textContent = 'Run';
    reset();
    refresh();
  });
  mode.addEventListener('change', () => { reset(); refresh(); });
};
