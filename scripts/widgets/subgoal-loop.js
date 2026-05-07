// §4 — visual subgoal loop. Step through (current → subgoal) image pairs
// hot-linked from PI's CDN.
window.W_subgoal = function init(root) {
  const cur = root.querySelector('[data-sub="cur"]');
  const goal = root.querySelector('[data-sub="goal"]');
  const stepBtn = root.querySelector('[data-sub="step"]');
  const resetBtn = root.querySelector('[data-sub="reset"]');
  const idxLabel = root.querySelector('[data-sub="idx"]');

  const pairs = (window.PI07_MEDIA && window.PI07_MEDIA.subgoals) || [];
  const N = pairs.length || 5;
  let i = 0;

  function paint() {
    const pair = pairs[i] || {
      current: `https://www.pi.website/images/pi07/current_${i + 1}.png`,
      goal: `https://www.pi.website/images/pi07/subgoal_${i + 1}.png`
    };
    cur.src = pair.current;
    goal.src = pair.goal;
    idxLabel.textContent = `step ${i + 1} / ${N}`;
  }
  paint();

  stepBtn.addEventListener('click', () => { i = (i + 1) % N; paint(); });
  resetBtn.addEventListener('click', () => { i = 0; paint(); });
};
