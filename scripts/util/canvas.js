window.CV = (function () {
  // Set up an HTMLCanvasElement with proper DPR scaling and a redraw-on-resize hook.
  // Returns { ctx, W, H, dispose } and calls draw(ctx, W, H) whenever sized.
  function setup(canvas, draw, opts = {}) {
    const { aspect = 16 / 10 } = opts;
    let W = 0, H = 0, raf = 0;
    const ro = new ResizeObserver(() => { schedule(); });
    ro.observe(canvas);
    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
    }
    function layout() {
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      const cssH = Math.round(cssW / aspect);
      canvas.style.height = cssH + 'px';
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = cssW; H = cssH;
      draw(ctx, W, H);
    }
    return {
      get W() { return W; },
      get H() { return H; },
      get ctx() { return canvas.getContext('2d'); },
      redraw: () => { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, W, H); draw(ctx, W, H); },
      dispose: () => { ro.disconnect(); cancelAnimationFrame(raf); }
    };
  }

  // Convert a pointer event into canvas-pixel coords (CSS px space).
  function pt(canvas, e) {
    const r = canvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x: cx, y: cy };
  }

  // Tokens: pull the design palette via CSS custom properties.
  function tokens(el) {
    const cs = getComputedStyle(el || document.documentElement);
    const t = {};
    [
      'bg', 'bg-soft', 'bg-mute', 'bg-card', 'line', 'line-soft', 'text', 'text-mute', 'text-soft',
      'olive', 'olive-soft', 'warn', 'accent', 'accent-2', 'teal', 'teal-deep', 'rose', 'ink'
    ].forEach(k => { t[k] = cs.getPropertyValue('--' + k).trim() || '#000'; });
    return t;
  }

  // Tiny canvas helpers
  function clear(ctx, W, H, fill) { ctx.fillStyle = fill; ctx.fillRect(0, 0, W, H); }
  function line(ctx, x1, y1, x2, y2, color, w = 1) {
    ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function dot(ctx, x, y, r, color) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  function ring(ctx, x, y, r, color, w = 2) {
    ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  }
  function label(ctx, txt, x, y, color, size = 11) {
    ctx.fillStyle = color;
    ctx.font = `500 ${size}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(txt, x, y);
  }

  return { setup, pt, tokens, clear, line, dot, ring, label };
})();
