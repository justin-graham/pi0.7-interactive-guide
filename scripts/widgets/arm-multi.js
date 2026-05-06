// §0.2 — three valid trajectories to the same target. Demonstrates multimodality
// of action distributions: averaging the three blue paths gives the dashed path,
// which is worse than any of them.
window.W_arm_multi = function init(root) {
  const canvas = root.querySelector('[data-armmulti="canvas"]');
  const tSlider = root.querySelector('[data-armmulti="t"]');
  const playBtn = root.querySelector('[data-armmulti="play"]');
  const newBtn = root.querySelector('[data-armmulti="newtarget"]');
  const T = CV.tokens();
  const L1 = 0.45, L2 = 0.40;

  let target = { x: 0.55, y: 0.10 };
  let plays = computeTrajectories(target);
  let playing = false;
  let raf = 0;
  let tStart = 0;

  function fk(a, b) {
    const j2 = { x: L1 * Math.cos(a), y: L1 * Math.sin(a) };
    const ee = { x: j2.x + L2 * Math.cos(a + b), y: j2.y + L2 * Math.sin(a + b) };
    return { j2, ee };
  }
  // analytic IK for two-link reaching (x,y); pick elbow up/down via sign
  function ik(x, y, elbow = 1) {
    const r2 = x * x + y * y;
    const c2 = (r2 - L1 * L1 - L2 * L2) / (2 * L1 * L2);
    const cc = M.clamp(c2, -1, 1);
    const s2 = elbow * Math.sqrt(1 - cc * cc);
    const th2 = Math.atan2(s2, cc);
    const k1 = L1 + L2 * cc, k2 = L2 * s2;
    const th1 = Math.atan2(y, x) - Math.atan2(k2, k1);
    return { th1, th2 };
  }

  function computeTrajectories(tg) {
    // Three paths with same target. Each parameterized by t∈[0,1].
    // P0: straight line in joint-space from rest to IK solution (elbow-up)
    // P1: straight line to IK (elbow-down)
    // P2: arc through a high waypoint above the target
    const start = { th1: M.rad(-30), th2: M.rad(80) };
    const upSol = ik(tg.x, tg.y, +1);
    const dnSol = ik(tg.x, tg.y, -1);
    const wp = { x: tg.x * 0.55, y: Math.max(tg.y, 0.10) + 0.35 };
    const wpSol = ik(wp.x, wp.y, +1);

    function lerpA(a, b, t) {
      // shortest-arc lerp for angles
      let d = b - a;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      return a + d * t;
    }
    function lin(s, e) { return (t) => ({ th1: lerpA(s.th1, e.th1, t), th2: lerpA(s.th2, e.th2, t) }); }
    function viaWp(s, m, e) {
      return (t) => {
        if (t < 0.5) {
          const u = M.smooth(t / 0.5);
          return { th1: lerpA(s.th1, m.th1, u), th2: lerpA(s.th2, m.th2, u) };
        } else {
          const u = M.smooth((t - 0.5) / 0.5);
          return { th1: lerpA(m.th1, e.th1, u), th2: lerpA(m.th2, e.th2, u) };
        }
      };
    }
    return [
      { name: 'over the top', color: T['teal-deep'], dash: false, q: viaWp(start, wpSol, upSol) },
      { name: 'elbow up',    color: T['olive'],     dash: false, q: lin(start, upSol) },
      { name: 'elbow down',  color: T['rose'],      dash: false, q: lin(start, dnSol) }
    ];
  }

  function toScreen(p, W, H) {
    const cx = W * 0.42, cy = H * 0.62, k = H * 0.78;
    return { x: cx + p.x * k, y: cy - p.y * k };
  }

  function trajPath(plan, W, H, samples = 80) {
    const pts = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const q = plan.q(t);
      const f = fk(q.th1, q.th2);
      pts.push(toScreen(f.ee, W, H));
    }
    return pts;
  }

  function avgEE(t) {
    let sx = 0, sy = 0;
    plays.forEach(p => {
      const q = p.q(t);
      const f = fk(q.th1, q.th2);
      sx += f.ee.x; sy += f.ee.y;
    });
    return { x: sx / plays.length, y: sy / plays.length };
  }

  function draw(ctx, W, H) {
    CV.clear(ctx, W, H, T['bg-soft']);
    ctx.strokeStyle = T['line-soft']; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (W / 10) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let i = 0; i <= 7; i++) {
      const y = (H / 7) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const t = parseFloat(tSlider.value) / 100;
    const tg = toScreen(target, W, H);

    // draw all three trajectories ghosted, with colored end-effector trace
    plays.forEach((plan) => {
      const pts = trajPath(plan, W, H);
      ctx.strokeStyle = plan.color + ''; ctx.lineWidth = 2.5; ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // average path (the "what naive regression learns" line)
    const avgPts = [];
    for (let i = 0; i <= 80; i++) avgPts.push(toScreen(avgEE(i / 80), W, H));
    ctx.strokeStyle = T['ink']; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.globalAlpha = .65;
    ctx.beginPath(); ctx.moveTo(avgPts[0].x, avgPts[0].y);
    for (let i = 1; i < avgPts.length; i++) ctx.lineTo(avgPts[i].x, avgPts[i].y);
    ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;

    // target
    ctx.fillStyle = T['accent'];
    ctx.beginPath(); ctx.arc(tg.x, tg.y, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = T['ink']; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(tg.x, tg.y, 9, 0, Math.PI * 2); ctx.stroke();

    // arms at current t
    plays.forEach((plan) => {
      const q = plan.q(t);
      const f = fk(q.th1, q.th2);
      const j1 = toScreen({ x: 0, y: 0 }, W, H);
      const j2 = toScreen(f.j2, W, H);
      const ee = toScreen(f.ee, W, H);
      ctx.strokeStyle = plan.color; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.globalAlpha = .9;
      ctx.beginPath(); ctx.moveTo(j1.x, j1.y); ctx.lineTo(j2.x, j2.y); ctx.lineTo(ee.x, ee.y); ctx.stroke();
      ctx.globalAlpha = 1;
      CV.dot(ctx, ee.x, ee.y, 4, plan.color);
    });

    // average end-effector marker
    const avg = toScreen(avgEE(t), W, H);
    ctx.strokeStyle = T['ink']; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(avg.x, avg.y, 6, 0, Math.PI * 2); ctx.stroke();
    CV.label(ctx, 'avg of the three', avg.x + 9, avg.y - 18, T['text-mute'], 11);

    // legend
    let lx = 14, ly = 14;
    plays.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.fillRect(lx, ly, 10, 10);
      CV.label(ctx, p.name, lx + 16, ly - 1, T['text-mute'], 11);
      ly += 18;
    });
    ctx.strokeStyle = T['ink']; ctx.setLineDash([4, 4]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, ly + 5); ctx.lineTo(lx + 10, ly + 5); ctx.stroke();
    ctx.setLineDash([]);
    CV.label(ctx, 'naive average (regression)', lx + 16, ly - 1, T['text-mute'], 11);
  }

  const cv = CV.setup(canvas, draw, { aspect: 16 / 10 });

  function refresh() { cv.redraw(); }
  tSlider.addEventListener('input', refresh);
  newBtn.addEventListener('click', () => {
    // sample target inside reachable workspace, mid-height
    const a = (Math.random() * 0.8 - 0.1) * Math.PI;
    const r = (L1 + L2) * (0.55 + Math.random() * 0.35);
    target = { x: r * Math.cos(a), y: Math.max(-0.05, r * Math.sin(a)) };
    plays = computeTrajectories(target);
    refresh();
  });

  function loop(now) {
    if (!playing) return;
    if (!tStart) tStart = now;
    const dt = (now - tStart) / 2400; // 2.4s loop
    const t = (dt % 1);
    tSlider.value = String(Math.round(t * 100));
    refresh();
    raf = requestAnimationFrame(loop);
  }
  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.textContent = playing ? '⏸ pause' : '▶ play';
    tStart = 0;
    cancelAnimationFrame(raf);
    if (playing) raf = requestAnimationFrame(loop);
  });
};
