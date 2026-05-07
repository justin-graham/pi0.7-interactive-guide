// Lazy-mount each widget the first time its section becomes visible. Also wires
// up the page-wide scroll-progress bar and lazy <video> loading so opening the
// page is cheap.
(function () {
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.PI07_PREFERS_REDUCED_MOTION = !!reduceMotion;

  const widgets = {
    'arm':           window.W_arm,
    'arm-multi':     window.W_arm_multi,
    'bc':            window.W_bc,
    'vla':           window.W_vla,
    'flow':          window.W_flow,
    'conflict':      window.W_conflict,
    'conditioning-lab': window.W_conditioning_lab,
    'system-map':    window.W_system_map,
    'subgoal':       window.W_subgoal,
    'air-fryer-lab': window.W_air_fryer_lab,
    'embodiment-compare': window.W_embodiment_compare,
    'results-explorer': window.W_results_explorer
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

  if (reduceMotion) {
    document.querySelectorAll('video').forEach(v => {
      v.autoplay = false;
      v.removeAttribute('autoplay');
      v.pause();
    });
  }

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
        if (!reduceMotion) {
          const tryPlay = () => v.play().catch(() => {});
          v.addEventListener('canplay', tryPlay, { once: true });
        }
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
