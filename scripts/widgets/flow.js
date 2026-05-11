window.W_flow = function init(root) {
  const canvas = root.querySelector('[data-flow="canvas"]');
  const tS = root.querySelector('[data-flow="t"]');
  const tV = root.querySelector('[data-flow="t-val"]');
  const mS = root.querySelector('[data-flow="modes"]');
  const mV = root.querySelector('[data-flow="modes-val"]');
  const playBtn = root.querySelector('[data-flow="play"]');
  const reseed = root.querySelector('[data-flow="reseed"]');
  const T = CV.tokens();

  const colors = ['#FFDB00', '#7FA665', '#C57C68', '#8CB5CD'];
  const modes = [
    {
      label: 'go above',
      clean: [
        { x: 0.10, y: 0.66 }, { x: 0.22, y: 0.55 }, { x: 0.36, y: 0.38 },
        { x: 0.52, y: 0.30 }, { x: 0.70, y: 0.34 }, { x: 0.88, y: 0.42 }
      ]
    },
    {
      label: 'go below',
      clean: [
        { x: 0.10, y: 0.66 }, { x: 0.24, y: 0.74 }, { x: 0.42, y: 0.78 },
        { x: 0.60, y: 0.72 }, { x: 0.76, y: 0.61 }, { x: 0.90, y: 0.54 }
      ]
    },
    {
      label: 'lift first',
      clean: [
        { x: 0.10, y: 0.66 }, { x: 0.20, y: 0.59 }, { x: 0.34, y: 0.50 },
        { x: 0.52, y: 0.50 }, { x: 0.72, y: 0.47 }, { x: 0.90, y: 0.36 }
      ],
      lifted: true
    },
    {
      label: 'wide sweep',
      clean: [
        { x: 0.10, y: 0.66 }, { x: 0.21, y: 0.82 }, { x: 0.40, y: 0.89 },
        { x: 0.62, y: 0.86 }, { x: 0.80, y: 0.74 }, { x: 0.92, y: 0.62 }
      ]
    }
  ];

  let seed = 19;
  let noisy = makeNoisyPaths();
  let playing = false;
  let raf = 0;
  let t0 = 0;

  function makeNoisyPaths() {
    return modes.map((mode, modeIndex) => {
      const rng = M.rng(seed + modeIndex * 7919);
      return mode.clean.map((p, i) => {
        if (i === 0) return { ...p };
        const progress = i / (mode.clean.length - 1);
        const lateral = (rng() * 2 - 1) * 0.18;
        const forward = (rng() * 2 - 1) * 0.10;
        const wobble = Math.sin((i + 1) * 1.7 + seed * 0.03) * 0.10;
        const keepRight = progress * 0.10;
        return {
          x: M.clamp(p.x + forward + keepRight, 0.08, 0.94),
          y: M.clamp(p.y + lateral + wobble, 0.16, 0.90)
        };
      });
    });
  }

  function visibleCount() {
    return parseInt(mS.value, 10);
  }

  function denoisedPath(modeIndex, t) {
    const eased = M.smooth(t);
    const mode = modes[modeIndex];
    return mode.clean.map((p, i) => ({
      x: M.lerp(noisy[modeIndex][i].x, p.x, eased),
      y: M.lerp(noisy[modeIndex][i].y, p.y, eased)
    }));
  }

  function draw(ctx, W, H) {
    if (W < 40 || H < 40) return;
    CV.clear(ctx, W, H, T['bg-soft']);

    const m = { l: 36, r: 28, t: 30, b: 44 };
    const px = x => m.l + x * (W - m.l - m.r);
    const py = y => m.t + y * (H - m.t - m.b);
    const t = parseFloat(tS.value) / 100;
    const count = visibleCount();

    drawTable(ctx, W, H, m);
    drawObstacle(ctx, px, py);
    drawStart(ctx, px, py);

    for (let i = 0; i < count; i += 1) {
      const mode = modes[i];
      const color = colors[i];
      const current = denoisedPath(i, t);
      drawCleanGuide(ctx, px, py, mode.clean);
      drawCandidate(ctx, px, py, current, color, i, t);
      if (mode.lifted) drawLiftMarks(ctx, px, py, current, color, t);
    }

    drawLegend(ctx, W, m, count);
    drawReadout(ctx, W, H, m, t, count);
    tV.textContent = t.toFixed(2);
    mV.textContent = String(count);
  }

  function drawTable(ctx, W, H, m) {
    ctx.fillStyle = T['bg-mute'];
    ctx.fillRect(m.l, m.t, W - m.l - m.r, H - m.t - m.b);
    for (let i = 0; i <= 6; i += 1) {
      const x = m.l + (W - m.l - m.r) * i / 6;
      CV.line(ctx, x, m.t, x, H - m.b, T['line-soft']);
    }
    for (let i = 0; i <= 4; i += 1) {
      const y = m.t + (H - m.t - m.b) * i / 4;
      CV.line(ctx, m.l, y, W - m.r, y, T['line-soft']);
    }
    CV.label(ctx, '', m.l + 8, m.t + 7, T['olive'], 11);
  }

  function drawObstacle(ctx, px, py) {
    const x = px(0.53), y = py(0.55);
    const w = px(0.67) - px(0.41);
    const h = py(0.70) - py(0.39);
    ctx.fillStyle = '#E8E2CF';
    ctx.strokeStyle = T['line'];
    ctx.lineWidth = 1.5;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 10);
    ctx.fill();
    ctx.stroke();
    CV.label(ctx, 'obstacle', x - 25, y - 8, T['text-soft'], 11);
  }

  function drawStart(ctx, px, py) {
    const start = modes[0].clean[0];
    CV.dot(ctx, px(start.x), py(start.y), 7, T['ink']);
    CV.ring(ctx, px(start.x), py(start.y), 10, T['bg-card'], 2);
    labelText(ctx, 'start', px(start.x) - 10, py(start.y) + 13, T['ink'], 11);
  }

  function drawCleanGuide(ctx, px, py, points) {
    strokePath(ctx, points, px, py, T['line'], 2, [4, 6], 0.40);
  }

  function drawCandidate(ctx, px, py, points, color, index, t) {
    const alpha = 0.55 + t * 0.45;
    strokePath(ctx, points, px, py, color, 5, null, alpha);
    points.forEach((p, pointIndex) => {
      const r = pointIndex === points.length - 1 ? 6 : 4;
      CV.dot(ctx, px(p.x), py(p.y), r, color);
      CV.ring(ctx, px(p.x), py(p.y), r + 1, T['ink'], pointIndex === points.length - 1 ? 1.4 : 0.8);
    });
    const end = points[points.length - 1];
    drawGripper(ctx, px(end.x), py(end.y), color, index);
  }

  function drawLiftMarks(ctx, px, py, points, color, t) {
    const eased = M.smooth(t);
    const p = points[2];
    const q = points[3];
    const x = M.lerp(px(p.x), px(q.x), 0.5);
    const y = M.lerp(py(p.y), py(q.y), 0.5);
    ctx.save();
    ctx.globalAlpha = 0.45 + eased * 0.45;
    ctx.strokeStyle = color;
    ctx.fillStyle = T['bg-card'];
    ctx.lineWidth = 1.2;
    roundRect(ctx, x - 19, y - 14, 38, 22, 6);
    ctx.fill();
    ctx.stroke();
    labelText(ctx, 'z+', x - 8, y - 8, T['ink'], 10);
    ctx.restore();
  }

  function drawGripper(ctx, x, y, color, index) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((-0.55 + index * 0.28));
    ctx.fillStyle = T['bg-card'];
    ctx.strokeStyle = T['ink'];
    ctx.lineWidth = 1.2;
    roundRect(ctx, -10, -7, 20, 14, 5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, -4); ctx.lineTo(17, -9);
    ctx.moveTo(10, 4); ctx.lineTo(17, 9);
    ctx.stroke();
    ctx.restore();
  }

  function drawReadout(ctx, W, H, m, t, count) {
    const y = H - m.b + 11;
    labelText(ctx, `t = ${t.toFixed(2)} · denoising whole action chunks`, m.l + 6, y, T['ink'], 11);
    labelText(ctx, `${count} valid future${count === 1 ? '' : 's'} visible`, W - 172, y, T['text-soft'], 11);
  }

  function drawLegend(ctx, W, m, count) {
    const x = Math.max(m.l + 190, W - m.r - 132);
    const y = m.t + 14;
    for (let i = 0; i < count; i += 1) {
      const rowY = y + i * 16;
      CV.line(ctx, x, rowY + 6, x + 18, rowY + 6, colors[i], 4);
      CV.dot(ctx, x + 8, rowY + 6, 3, colors[i]);
      labelText(ctx, modes[i].label, x + 24, rowY, T['ink'], 10);
    }
  }

  function strokePath(ctx, points, px, py, color, width, dash, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(px(p.x), py(p.y));
      else ctx.lineTo(px(p.x), py(p.y));
    });
    ctx.stroke();
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function labelText(ctx, text, x, y, color, size) {
    ctx.fillStyle = color;
    ctx.font = `700 ${size}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  }

  const cv = CV.setup(canvas, draw, { aspect: 16 / 10 });

  function refresh() {
    cv.redraw();
  }

  tS.addEventListener('input', refresh);
  mS.addEventListener('input', refresh);
  reseed.addEventListener('click', () => {
    seed = (seed * 31 + 17) & 0x7fffffff;
    noisy = makeNoisyPaths();
    refresh();
  });

  function loop(now) {
    if (!playing) return;
    if (!t0) t0 = now;
    const u = ((now - t0) / 2400) % 1;
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
