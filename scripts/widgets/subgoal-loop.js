// §4 — visual subgoal loop. Step through (current → subgoal) image pairs
// hot-linked from PI's CDN.
window.W_subgoal = function init(root) {
  const cur = root.querySelector('[data-sub="cur"]');
  const goal = root.querySelector('[data-sub="goal"]');
  const stepBtn = root.querySelector('[data-sub="step"]');
  const resetBtn = root.querySelector('[data-sub="reset"]');
  const idxLabel = root.querySelector('[data-sub="idx"]');

  const N = 5;
  let i = 1;

  function paint() {
    cur.src = `https://www.pi.website/images/pi07/current_${i}.png`;
    goal.src = `https://www.pi.website/images/pi07/subgoal_${i}.png`;
    idxLabel.textContent = `step ${i} / ${N}`;
  }
  paint();

  stepBtn.addEventListener('click', () => { i = (i % N) + 1; paint(); });
  resetBtn.addEventListener('click', () => { i = 1; paint(); });
};
