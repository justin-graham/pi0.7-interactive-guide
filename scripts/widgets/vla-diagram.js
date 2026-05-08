// §0.4 — animated VLA architecture diagram (SVG). Image and language enter,
// flow through transformer blocks, action tokens emerge. Hover reveals a tooltip.
window.W_vla = function init(root) {
  const svg = root.querySelector('[data-vla="svg"]');
  const tip = document.getElementById('tip');
  const T = CV.tokens();
  const ns = 'http://www.w3.org/2000/svg';

  // Layout: left column = inputs, middle = transformer stack, right = action expert / output
  const blocks = [
    { id: 'img', x: 18, y: 30, w: 110, h: 70, label: 'Image', kind: 'in', desc: 'A camera frame from the robot. Patched into tokens by a vision encoder shared with the VLM backbone.' },
    { id: 'lang', x: 18, y: 130, w: 110, h: 70, label: '"fold the t‑shirt"', kind: 'in', desc: 'Natural-language instruction. Tokenized the same way an LLM would.' },
    { id: 'state', x: 18, y: 230, w: 110, h: 32, label: 'Joint state', kind: 'in', desc: 'Current joint angles and gripper state. A handful of numbers concatenated to the token stream.' },

    { id: 'fuse', x: 160, y: 80, w: 90, h: 70, label: 'Fuse', kind: 'mid', desc: 'Image, language, and state tokens are concatenated and fed into the transformer.' },
    { id: 'tr', x: 270, y: 60, w: 130, h: 110, label: 'Transformer\n(VLM backbone)', kind: 'mid', desc: 'A pretrained vision-language model. Already understands "t-shirt", "fold", "drawer", "press". π0.7 finetunes through it.' },

    { id: 'act', x: 420, y: 70, w: 80, h: 90, label: 'Action expert', kind: 'out', desc: 'A small head specialised for actions. In π-family models it predicts a velocity field via flow matching, not text tokens.' },

    { id: 'a1', x: 420, y: 195, w: 80, h: 18, label: 'a₁', kind: 'a' },
    { id: 'a2', x: 420, y: 215, w: 80, h: 18, label: 'a₂', kind: 'a' },
    { id: 'a3', x: 420, y: 235, w: 80, h: 18, label: 'a₃', kind: 'a' },
  ];

  function rect(b) {
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'vla-block');
    g.setAttribute('data-id', b.id);
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', b.x); r.setAttribute('y', b.y);
    r.setAttribute('width', b.w); r.setAttribute('height', b.h);
    r.setAttribute('rx', 8);
    let fill = T['bg-card'], stroke = T['line'], textColor = T['text'];
    if (b.kind === 'mid') { fill = T['bg-mute']; stroke = T['line']; }
    if (b.kind === 'out') { fill = T['accent']; stroke = T['accent-2']; }
    if (b.kind === 'a') { fill = T['ink']; stroke = T['ink']; textColor = T['bg']; }
    r.setAttribute('fill', fill); r.setAttribute('stroke', stroke); r.setAttribute('stroke-width', 1);
    g.appendChild(r);
    const lines = b.label.split('\n');
    lines.forEach((ln, i) => {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', b.x + b.w / 2);
      t.setAttribute('y', b.y + b.h / 2 + (i - (lines.length - 1) / 2) * 14 + 4);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-family', 'Source Sans 3, system-ui, sans-serif');
      t.setAttribute('font-size', b.kind === 'a' ? 11 : 12);
      t.setAttribute('font-weight', b.kind === 'mid' ? 600 : 500);
      t.setAttribute('fill', textColor);
      t.textContent = ln;
      g.appendChild(t);
    });
    if (b.desc) {
      g.style.cursor = 'help';
      g.addEventListener('mouseenter', (e) => showTip(b.desc, e));
      g.addEventListener('mousemove', moveTip);
      g.addEventListener('mouseleave', hideTip);
    }
    return g;
  }
  function arrow(from, to, color = T['olive']) {
    const path = document.createElementNS(ns, 'path');
    const x1 = from.x + from.w, y1 = from.y + from.h / 2;
    const x2 = to.x, y2 = to.y + to.h / 2;
    const cx = (x1 + x2) / 2;
    path.setAttribute('d', `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', 1.5);
    path.setAttribute('marker-end', 'url(#vla-arrow)');
    return path;
  }
  function showTip(text, e) {
    tip.textContent = text;
    tip.dataset.show = 'true';
    moveTip(e);
  }
  function moveTip(e) {
    tip.style.left = (e.clientX + 12) + 'px';
    tip.style.top = (e.clientY + 14) + 'px';
  }
  function hideTip() { tip.dataset.show = 'false'; }

  // Defs (arrowhead)
  const defs = document.createElementNS(ns, 'defs');
  defs.innerHTML =
    `<marker id="vla-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
       <path d="M 0 0 L 10 5 L 0 10 z" fill="${T['olive']}"></path>
     </marker>`;
  svg.appendChild(defs);

  // Connectors first so they go under blocks
  const byId = Object.fromEntries(blocks.map(b => [b.id, b]));
  const routePaths = {};
  const connectorPairs = [
    ['img', 'fuse'], ['lang', 'fuse'], ['state', 'fuse'],
    ['fuse', 'tr'], ['tr', 'act']
  ];
  connectorPairs.forEach(([a, b]) => {
    const path = arrow(byId[a], byId[b]);
    const key = `${a}-${b}`;
    path.dataset.route = key;
    routePaths[key] = path;
    svg.appendChild(path);
  });
  // Action expert → action tokens (vertical drop)
  const drop = document.createElementNS(ns, 'path');
  drop.setAttribute('d', `M 460 160 L 460 195`);
  drop.setAttribute('fill', 'none');
  drop.setAttribute('stroke', T['olive']);
  drop.setAttribute('stroke-width', 1.5);
  drop.setAttribute('marker-end', 'url(#vla-arrow)');
  svg.appendChild(drop);

  // Animated tokens flowing along img→fuse→tr→act path
  const tokenG = document.createElementNS(ns, 'g');
  svg.appendChild(tokenG);

  // Blocks sit above the flow dots, so tokens visually enter and exit modules.
  blocks.forEach(b => svg.appendChild(rect(b)));

  // Follow the same SVG paths drawn above. This keeps dots on curved connectors
  // if the layout is adjusted later.
  const flowSpecs = [
    { route: ['img-fuse', 'fuse-tr', 'tr-act'], hue: T['teal-deep'] },
    { route: ['lang-fuse', 'fuse-tr', 'tr-act'], hue: T['rose'] },
    { route: ['state-fuse', 'fuse-tr', 'tr-act'], hue: T['olive'] }
  ];
  function spawnPulse(spec, delay) {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('r', 3);
    c.setAttribute('fill', spec.hue);
    c.setAttribute('opacity', '0.85');
    tokenG.appendChild(c);
    const start = performance.now() + delay;
    function frame(now) {
      const t = (now - start) / 2400;
      if (t < 0) { requestAnimationFrame(frame); return; }
      if (t > 1) { c.remove(); return; }
      const p = pulsePos(spec.route, t);
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function pulsePos(route, t) {
    const segments = route.map(key => routePaths[key]).filter(Boolean);
    const lengths = segments.map(path => path.getTotalLength());
    const total = lengths.reduce((sum, length) => sum + length, 0);
    let distance = M.clamp(t, 0, 1) * total;

    for (let i = 0; i < segments.length; i += 1) {
      if (distance <= lengths[i]) {
        const point = segments[i].getPointAtLength(distance);
        return { x: point.x, y: point.y };
      }
      distance -= lengths[i];
    }

    const last = segments[segments.length - 1];
    const point = last.getPointAtLength(last.getTotalLength());
    return { x: point.x, y: point.y };
  }
  let stopped = false;
  function tickPulses() {
    if (stopped) return;
    flowSpecs.forEach((s, i) => spawnPulse(s, i * 220));
    setTimeout(tickPulses, 1300);
  }
  // Only animate when the section is visible
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && stopped) { stopped = false; tickPulses(); }
      if (!e.isIntersecting) stopped = true;
    });
  }, { threshold: 0.2 });
  io.observe(svg);
  stopped = false; tickPulses();
};
