window.W_context_space = function init(root) {
  const canvas = root.querySelector('[data-context-space="canvas"]');
  const chips = root.querySelector('[data-context-space="chips"]');
  const caption = root.querySelector('[data-context-space="caption"]');
  const T = CV.tokens();
  const presets = [
    {
      id: 'plain',
      label: 'plain instruction',
      x: 0.32,
      y: 0.36,
      text: 'Language alone specifies the task, but leaves style, body, and spatial target underdetermined.'
    },
    {
      id: 'robot',
      label: 'add robot body',
      x: 0.70,
      y: 0.34,
      text: 'Embodiment context separates behaviors that look similar but require different motor commands.'
    },
    {
      id: 'quality',
      label: 'add metadata',
      x: 0.68,
      y: 0.70,
      text: 'Metadata asks for a behavior mode: faster, safer, higher quality, or closer to a specialist.'
    },
    {
      id: 'subgoal',
      label: 'add visual subgoal',
      x: 0.82,
      y: 0.78,
      text: 'A visual subgoal gives a pixel-level destination, which is often clearer than words for manipulation.'
    }
  ];
  let active = 'plain';

  function draw(ctx, W, H) {
    CV.clear(ctx, W, H, T['bg-soft']);
    const m = { l: 48, r: 22, t: 22, b: 46 };
    const px = x => m.l + x * (W - m.l - m.r);
    const py = y => H - m.b - y * (H - m.t - m.b);

    ctx.strokeStyle = T['line'];
    ctx.lineWidth = 1;
    CV.line(ctx, m.l, H - m.b, W - m.r, H - m.b, T['line']);
    CV.line(ctx, m.l, H - m.b, m.l, m.t, T['line']);
    CV.label(ctx, 'which robot / control interface →', m.l + 18, H - 27, T['olive'], 11);
    ctx.save();
    ctx.translate(12, H - m.b - 12);
    ctx.rotate(-Math.PI / 2);
    CV.label(ctx, 'how specific is the target?', 0, 0, T['olive'], 11);
    ctx.restore();

    const regions = [
      { x: 0.18, y: 0.30, r: 42, c: 'rgba(209,201,172,.34)', label: 'ambiguous' },
      { x: 0.68, y: 0.34, r: 54, c: 'rgba(140,181,205,.32)', label: 'body-specific' },
      { x: 0.68, y: 0.70, r: 48, c: 'rgba(251,212,91,.36)', label: 'style-specific' },
      { x: 0.84, y: 0.78, r: 45, c: 'rgba(127,166,101,.32)', label: 'spatially grounded' }
    ];
    regions.forEach(region => {
      ctx.fillStyle = region.c;
      ctx.beginPath();
      ctx.arc(px(region.x), py(region.y), region.r, 0, Math.PI * 2);
      ctx.fill();
      CV.label(ctx, region.label, px(region.x) - region.r * 0.7, py(region.y) - 6, T['text-soft'], 10);
    });

    presets.forEach((p, i) => {
      if (i > 0) {
        const prev = presets[i - 1];
        CV.line(ctx, px(prev.x), py(prev.y), px(p.x), py(p.y), T['olive-soft'], 2);
      }
    });

    presets.forEach(p => {
      const isActive = p.id === active;
      CV.dot(ctx, px(p.x), py(p.y), isActive ? 9 : 6, isActive ? T['accent'] : T['olive-soft']);
      CV.ring(ctx, px(p.x), py(p.y), isActive ? 10 : 6, isActive ? T['ink'] : T['line'], 1.5);
      if (isActive) CV.label(ctx, p.label, px(p.x) + 12, py(p.y) - 9, T['ink'], 12);
    });
  }

  const cv = CV.setup(canvas, draw, { aspect: 16 / 10 });

  function renderChips() {
    chips.innerHTML = '';
    presets.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lab-chip';
      b.textContent = p.label;
      b.setAttribute('aria-pressed', p.id === active ? 'true' : 'false');
      b.addEventListener('click', () => {
        active = p.id;
        update();
      });
      chips.appendChild(b);
    });
  }

  function update() {
    const p = presets.find(item => item.id === active) || presets[0];
    caption.textContent = p.text;
    renderChips();
    cv.redraw();
  }

  update();
};
