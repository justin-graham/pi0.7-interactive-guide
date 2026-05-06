// §7 — editorial scorecard. Animates progress bars in on first scroll.
window.W_scorecard = function init(root) {
  const target = root.querySelector('[data-score="root"]');

  const rows = [
    { label: 'Cross‑embodiment transfer',     pct: 80, note: 'matches expert teleop on a never‑seen robot' },
    { label: 'Compositional generalization',  pct: 55, note: 'first signs — recombines skills across appliances' },
    { label: 'Specialist‑level performance',  pct: 85, note: 'matches per‑task RL via strategy distillation' },
    { label: 'Physical generalization (new objects, lighting)', pct: 45, note: 'lags semantic generalization' },
    { label: 'Reflective planning (think‑then‑act)', pct: 20, note: 'open problem; future work' }
  ];

  rows.forEach(r => {
    const row = document.createElement('div');
    row.className = 'score-row';
    row.innerHTML = `
      <div class="label">${r.label}</div>
      <div class="bar"><div class="fill" style="width:0%"></div></div>
      <div class="pct">${r.pct}%</div>
    `;
    target.appendChild(row);
    const cap = document.createElement('div');
    cap.style.cssText = 'grid-column:1/-1;font-family:var(--sans);font-size:12px;color:var(--text-mute);padding-left:0;margin-top:-6px;margin-bottom:6px';
    cap.textContent = r.note;
    target.appendChild(cap);
  });

  // Animate when first visible
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        target.querySelectorAll('.score-row').forEach((row, i) => {
          const fill = row.querySelector('.fill');
          setTimeout(() => fill.style.width = rows[i].pct + '%', i * 90);
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.3 });
  io.observe(target);
};
