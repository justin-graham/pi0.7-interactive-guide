window.M = (function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const TAU = Math.PI * 2;
  const deg = (r) => r * 180 / Math.PI;
  const rad = (d) => d * Math.PI / 180;

  function vec(x, y) { return { x, y }; }
  const vAdd = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const vSub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const vMul = (a, k) => ({ x: a.x * k, y: a.y * k });
  const vLen = (a) => Math.hypot(a.x, a.y);
  const vNorm = (a) => { const l = vLen(a) || 1; return { x: a.x / l, y: a.y / l }; };
  const vDot = (a, b) => a.x * b.x + a.y * b.y;

  // Box–Muller standard normal
  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
  }
  function gauss2(sigma = 1) { return { x: gauss() * sigma, y: gauss() * sigma }; }

  // tiny seedable RNG (mulberry32) for repeatable layouts
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  return { clamp, lerp, smooth, TAU, deg, rad, vec, vAdd, vSub, vMul, vLen, vNorm, vDot, gauss, gauss2, rng };
})();
