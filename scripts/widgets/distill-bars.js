// §6 — grouped bar chart comparing specialist / naive generalist / π0.7. Numbers
// here are illustrative placeholders. Update the `tasks` table when reading the
// paper's exact figures from §5/§6.
window.W_distill = function init(root) {
  const svg = root.querySelector('[data-distill="svg"]');
  const slider = root.querySelector('[data-distill="task"]');
  const taskName = root.querySelector('[data-distill="task-name"]');
  const wrap = root.querySelector('[data-distill="video-wrap"]');
  const vid = root.querySelector('[data-distill="video"]');
  const vidLabel = root.querySelector('[data-distill="vidlabel"]');
  const T = CV.tokens();
  const ns = 'http://www.w3.org/2000/svg';

  // rough placeholder numbers — replace with the exact ones from the paper.
  const tasks = [
    { name: 'Laundry folding', vals: [0.78, 0.42, 0.81], video: 'https://website.pi-asset.com/pi07/shirt_folding_processed_no_overlay_compressed.mp4' },
    { name: 'Espresso',         vals: [0.74, 0.36, 0.79], video: 'https://website.pi-asset.com/pi07/coffee_compressed.mp4' },
    { name: 'Vegetable peel',   vals: [0.69, 0.31, 0.72], video: 'https://website.pi-asset.com/pi07/cut_zucchini_compressed.mp4' }
  ];

  const groupNames = ['RL specialist', 'naive generalist', 'π0.7'];
  const colors = [T['olive'], T['rose'], T['accent']];

  function render(idx) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const W = 520, H = 240;
    const m = { l: 50, r: 20, t: 30, b: 50 };

    // axes
    const ax = document.createElementNS(ns, 'g');
    const yA = document.createElementNS(ns, 'line');
    yA.setAttribute('x1', m.l); yA.setAttribute('y1', m.t);
    yA.setAttribute('x2', m.l); yA.setAttribute('y2', H - m.b);
    yA.setAttribute('stroke', T['line']); yA.setAttribute('stroke-width', 1);
    const xA = document.createElementNS(ns, 'line');
    xA.setAttribute('x1', m.l); xA.setAttribute('y1', H - m.b);
    xA.setAttribute('x2', W - m.r); xA.setAttribute('y2', H - m.b);
    xA.setAttribute('stroke', T['line']); xA.setAttribute('stroke-width', 1);
    ax.appendChild(yA); ax.appendChild(xA);
    svg.appendChild(ax);

    // y ticks
    [0, 0.25, 0.5, 0.75, 1].forEach(v => {
      const y = m.t + (1 - v) * (H - m.t - m.b);
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', m.l - 8); t.setAttribute('y', y + 4);
      t.setAttribute('text-anchor', 'end');
      t.setAttribute('fill', T['text-mute']);
      t.setAttribute('font-family', 'JetBrains Mono, monospace');
      t.setAttribute('font-size', 11);
      t.textContent = (v * 100).toFixed(0) + '%';
      svg.appendChild(t);
      const g = document.createElementNS(ns, 'line');
      g.setAttribute('x1', m.l); g.setAttribute('y1', y);
      g.setAttribute('x2', W - m.r); g.setAttribute('y2', y);
      g.setAttribute('stroke', T['line-soft']); g.setAttribute('stroke-width', 1);
      svg.appendChild(g);
    });

    // bars
    const t = tasks[idx];
    const bw = (W - m.l - m.r) / 4;
    t.vals.forEach((v, i) => {
      const x = m.l + (i + 0.5) * bw;
      const y = m.t + (1 - v) * (H - m.t - m.b);
      const r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', x - bw * 0.32);
      r.setAttribute('y', H - m.b);
      r.setAttribute('width', bw * 0.64);
      r.setAttribute('height', 0);
      r.setAttribute('rx', 4);
      r.setAttribute('fill', colors[i]);
      r.setAttribute('stroke', T['ink']);
      r.setAttribute('stroke-width', i === 2 ? 1.5 : 1);
      svg.appendChild(r);
      // animate up
      requestAnimationFrame(() => {
        r.style.transition = 'y .6s cubic-bezier(.2,.7,.2,1), height .6s cubic-bezier(.2,.7,.2,1)';
        r.setAttribute('y', y);
        r.setAttribute('height', H - m.b - y);
      });

      const gLbl = document.createElementNS(ns, 'text');
      gLbl.setAttribute('x', x); gLbl.setAttribute('y', H - m.b + 18);
      gLbl.setAttribute('text-anchor', 'middle');
      gLbl.setAttribute('fill', T['text-mute']);
      gLbl.setAttribute('font-family', 'Inter, system-ui, sans-serif');
      gLbl.setAttribute('font-size', 12);
      gLbl.textContent = groupNames[i];
      svg.appendChild(gLbl);

      const val = document.createElementNS(ns, 'text');
      val.setAttribute('x', x); val.setAttribute('y', y - 6);
      val.setAttribute('text-anchor', 'middle');
      val.setAttribute('fill', T['text']);
      val.setAttribute('font-family', 'JetBrains Mono, monospace');
      val.setAttribute('font-size', 11);
      val.textContent = (v * 100).toFixed(0) + '%';
      svg.appendChild(val);
    });

    // title
    const ti = document.createElementNS(ns, 'text');
    ti.setAttribute('x', m.l); ti.setAttribute('y', m.t - 10);
    ti.setAttribute('fill', T['olive']);
    ti.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    ti.setAttribute('font-size', 11);
    ti.setAttribute('letter-spacing', '0.12em');
    ti.textContent = ('SUCCESS RATE · ' + t.name).toUpperCase();
    svg.appendChild(ti);

    taskName.textContent = t.name;
    vidLabel.textContent = `${t.name} · π0.7 generalist`;
    if (vid.src !== t.video) { vid.src = t.video; vid.load(); vid.play().catch(() => {}); }
  }

  slider.addEventListener('input', () => render(parseInt(slider.value, 10)));
  render(parseInt(slider.value, 10));
};
