window.W_action_chunks = function init(root) {
  const canvas = root.querySelector('[data-chunks="canvas"]');
  const len = root.querySelector('[data-chunks="len"]');
  const lenVal = root.querySelector('[data-chunks="len-val"]');
  const play = root.querySelector('[data-chunks="play"]');
  const reset = root.querySelector('[data-chunks="reset"]');
  const T = CV.tokens();

  const path = [
    { x: 0.12, y: 0.72 }, { x: 0.17, y: 0.66 }, { x: 0.22, y: 0.60 },
    { x: 0.27, y: 0.54 }, { x: 0.34, y: 0.50 }, { x: 0.42, y: 0.49 },
    { x: 0.50, y: 0.52 }, { x: 0.57, y: 0.58 }, { x: 0.63, y: 0.65 },
    { x: 0.70, y: 0.70 }, { x: 0.77, y: 0.69 }, { x: 0.83, y: 0.63 },
    { x: 0.87, y: 0.55 }, { x: 0.84, y: 0.47 }, { x: 0.76, y: 0.41 },
    { x: 0.66, y: 0.37 }, { x: 0.57, y: 0.34 }, { x: 0.51, y: 0.28 },
    { x: 0.56, y: 0.21 }, { x: 0.67, y: 0.17 }, { x: 0.79, y: 0.16 },
    { x: 0.90, y: 0.19 }
  ];

  let cursor = 0;
  let raf = 0;
  let lastTime = 0;

  function chunkSize() {
    return parseInt(len.value, 10);
  }

  function chunks(size) {
    const groups = [];
    for (let start = 0; start < path.length - 1; start += size) {
      groups.push({
        start,
        end: Math.min(path.length - 1, start + size)
      });
    }
    return groups;
  }

  function pointAt(u) {
    const max = path.length - 1;
    const clamped = M.clamp(u, 0, max);
    const i = Math.min(max - 1, Math.floor(clamped));
    const k = clamped - i;
    const a = path[i], b = path[i + 1];
    return {
      x: M.lerp(a.x, b.x, M.smooth(k)),
      y: M.lerp(a.y, b.y, M.smooth(k))
    };
  }

  function draw(ctx, W, H) {
    if (W < 40 || H < 40) return;
    CV.clear(ctx, W, H, T['bg-soft']);

    const m = { l: 36, r: 28, t: 30, b: 40 };
    const px = x => m.l + x * (W - m.l - m.r);
    const py = y => m.t + y * (H - m.t - m.b);
    const size = chunkSize();
    const groups = chunks(size);
    const active = Math.min(groups.length - 1, Math.floor(cursor / size));
    const activeGroup = groups[active];
    const robot = pointAt(cursor);

    drawTable(ctx, W, H, m);
    drawObstacle(ctx, px, py);
    drawFullTrajectory(ctx, px, py);
    drawChunks(ctx, px, py, groups, active);
    drawRobot(ctx, px(robot.x), py(robot.y), cursor);
    drawReadout(ctx, W, H, m, size, groups.length, activeGroup);

    lenVal.textContent = String(size);
  }

  function drawTable(ctx, W, H, m) {
    ctx.fillStyle = T['bg-mute'];
    ctx.fillRect(m.l, m.t, W - m.l - m.r, H - m.t - m.b);
    ctx.strokeStyle = T['line-soft'];
    ctx.lineWidth = 1;
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
    const x = px(0.53), y = py(0.50);
    const w = px(0.66) - px(0.42);
    const h = py(0.64) - py(0.36);
    ctx.fillStyle = '#E8E2CF';
    ctx.strokeStyle = T['line'];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 10);
    ctx.fill();
    ctx.stroke();
    CV.label(ctx, 'obstacle', x - 25, y - 7, T['text-soft'], 11);
  }

  function drawFullTrajectory(ctx, px, py) {
    strokePath(ctx, path, px, py, T['text-soft'], 2, [4, 5], 0.55);
    path.forEach((p, i) => {
      const r = i === 0 || i === path.length - 1 ? 5 : 3;
      CV.dot(ctx, px(p.x), py(p.y), r, i === 0 || i === path.length - 1 ? T['ink'] : T['text-soft']);
      if (i > 0 && i < path.length - 1 && i % 3 === 0) {
        labelText(ctx, String(i), px(p.x) + 6, py(p.y) - 6, T['text-soft'], 10);
      }
    });
    labelText(ctx, 'start', px(path[0].x) - 14, py(path[0].y) + 14, T['ink'], 11);
    labelText(ctx, 'goal', px(path[path.length - 1].x) - 12, py(path[path.length - 1].y) + 14, T['ink'], 11);
  }

  function drawChunks(ctx, px, py, groups, active) {
    groups.forEach((group, idx) => {
      const segment = path.slice(group.start, group.end + 1);
      if (segment.length < 2) return;
      const isActive = idx === active;
      const alpha = isActive ? 1 : 0.18;
      const width = isActive ? 5 : 3;
      strokePath(ctx, segment, px, py, T['accent-2'], width, null, alpha);
      segment.forEach((p, localIndex) => {
        const firstOrLast = localIndex === 0 || localIndex === segment.length - 1;
        const radius = isActive ? (firstOrLast ? 6 : 4) : 3;
        CV.dot(ctx, px(p.x), py(p.y), radius, isActive ? T['accent'] : T['line']);
        if (isActive) CV.ring(ctx, px(p.x), py(p.y), radius, T['ink'], 1);
      });
      if (isActive) {
        const anchor = segment[Math.max(1, Math.floor(segment.length / 2))];
        labelText(ctx, `next ${segment.length - 1} poses`, px(anchor.x) + 8, py(anchor.y) - 20, T['ink'], 11);
      }
    });
  }

  function drawRobot(ctx, x, y, u) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(u * 0.35) * 0.25);
    ctx.fillStyle = T['bg-card'];
    ctx.strokeStyle = T['ink'];
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-13, -8, 26, 16, 5);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(13, -5); ctx.lineTo(21, -10);
    ctx.moveTo(13, 5); ctx.lineTo(21, 10);
    ctx.stroke();
    ctx.restore();
  }

  function drawReadout(ctx, W, H, m, size, count, activeGroup) {
    const y = H - m.b + 12;
    const text = `chunk = ${size} pose${size === 1 ? '' : 's'} · ${count} predictions`;
    labelText(ctx, text, m.l + 6, y, T['ink'], 11);
    labelText(ctx, `active: poses ${activeGroup.start}-${activeGroup.end}`, m.l + 6, y + 15, T['text-soft'], 10);
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

  function labelText(ctx, text, x, y, color, size) {
    ctx.fillStyle = color;
    ctx.font = `700 ${size}px ${getComputedStyle(document.documentElement).getPropertyValue('--mono')}`;
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  }

  const cv = CV.setup(canvas, draw, { aspect: 16 / 10 });
  function refresh() { cv.redraw(); }

  len.addEventListener('input', () => {
    const size = chunkSize();
    const active = Math.floor(cursor / size);
    cursor = Math.min(path.length - 1.001, active * size);
    refresh();
  });
  reset.addEventListener('click', () => {
    cursor = 0;
    refresh();
  });
  play.addEventListener('click', () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      lastTime = 0;
      play.textContent = 'Animate';
      return;
    }
    play.textContent = 'Pause';
    const tick = (now) => {
      if (!lastTime) lastTime = now;
      const dt = Math.min(48, now - lastTime);
      lastTime = now;
      cursor += dt * 0.0058;
      if (cursor >= path.length - 1) cursor = 0;
      refresh();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });
  refresh();
};
