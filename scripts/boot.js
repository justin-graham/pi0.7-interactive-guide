// Lazy-mount each widget the first time its section becomes visible. Also wires
// up the page-wide scroll-progress bar and lazy <video> loading so opening the
// page is cheap.
(function () {
  const widgets = {
    'arm':           window.W_arm,
    'arm-multi':     window.W_arm_multi,
    'bc':            window.W_bc,
    'vla':           window.W_vla,
    'flow':          window.W_flow,
    'conflict':      window.W_conflict,
    'prompt':        window.W_prompt,
    'subgoal':       window.W_subgoal,
    'compose':       window.W_compose,
    'distill':       window.W_distill,
    'scorecard':     window.W_scorecard
  };

  const mounted = new WeakSet();

  function mount(el) {
    if (mounted.has(el)) return;
    const name = el.dataset.widget;
    const fn = widgets[name];
    if (!fn) return;
    mounted.add(el);
    try { fn(el); }
    catch (err) { console.error(`[widget:${name}]`, err); }
  }

  const widgetIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        mount(e.target);
        widgetIO.unobserve(e.target);
      }
    });
  }, { rootMargin: '200px 0px' });

  document.querySelectorAll('[data-widget]').forEach(el => widgetIO.observe(el));

  // Lazy <video> sources. We keep the URL in data-lazy-src and only attach
  // when the section is near. Saves a lot of bandwidth on first paint.
  const videoIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const v = e.target;
      const src = v.dataset.lazySrc;
      if (src && !v.src) {
        v.src = src;
        v.load();
        const tryPlay = () => v.play().catch(() => {});
        v.addEventListener('canplay', tryPlay, { once: true });
      }
      videoIO.unobserve(v);
    });
  }, { rootMargin: '300px 0px' });

  document.querySelectorAll('video[data-lazy-src]').forEach(v => videoIO.observe(v));

  // Scroll progress bar
  const bar = document.getElementById('scroll-progress');
  function onScroll() {
    const h = document.documentElement;
    const total = h.scrollHeight - h.clientHeight;
    const p = total > 0 ? (h.scrollTop / total) * 100 : 0;
    bar.style.setProperty('--scroll', p.toFixed(2) + '%');
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
