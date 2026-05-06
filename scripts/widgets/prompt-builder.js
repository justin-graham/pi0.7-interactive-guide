// §3 — diverse contextual prompting. Toggle chips across four categories.
// The preview shows what the model "sees" as conditioning when those chips
// are on, plus a short caption explaining what changes.
window.W_prompt = function init(root) {
  const chipsEl = root.querySelector('[data-prompt="chips"]');
  const previewEl = root.querySelector('[data-prompt="preview"]');
  const T = CV.tokens();

  const groups = [
    {
      key: 'lang', label: 'Language',
      options: [
        { id: 'task', label: 'task: "make espresso"' },
        { id: 'sub',  label: 'sub‑step: "press the brew button"' }
      ]
    },
    {
      key: 'meta', label: 'Metadata',
      options: [
        { id: 'fast', label: 'speed: fast' },
        { id: 'quality', label: 'quality: high' },
        { id: 'strategy', label: 'strategy: from RL specialist' }
      ]
    },
    {
      key: 'modality', label: 'Control modality',
      options: [
        { id: 'joint', label: 'joint‑space' },
        { id: 'ee', label: 'end‑effector' }
      ]
    },
    {
      key: 'subgoal', label: 'Visual subgoal',
      options: [
        { id: 'sg', label: 'image of next state' }
      ]
    }
  ];

  const state = {};
  groups.forEach(g => state[g.key] = new Set());

  function renderChips() {
    chipsEl.innerHTML = '';
    groups.forEach(g => {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-right:14px;';
      const h = document.createElement('div');
      h.textContent = g.label;
      h.style.cssText = 'font-family:var(--sans);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--olive);margin-bottom:2px';
      wrap.appendChild(h);
      g.options.forEach(opt => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'w-chip';
        b.textContent = opt.label;
        b.setAttribute('aria-pressed', state[g.key].has(opt.id) ? 'true' : 'false');
        b.addEventListener('click', () => {
          if (state[g.key].has(opt.id)) state[g.key].delete(opt.id);
          else state[g.key].add(opt.id);
          renderChips();
          renderPreview();
        });
        wrap.appendChild(b);
      });
      chipsEl.appendChild(wrap);
    });
  }

  function renderPreview() {
    const has = (g, id) => state[g].has(id);
    const lines = [];
    if (has('lang', 'task')) lines.push(['task', 'make espresso']);
    if (has('lang', 'sub')) lines.push(['sub‑step', 'press the brew button']);
    if (has('meta', 'fast')) lines.push(['speed', 'fast']);
    if (has('meta', 'quality')) lines.push(['quality', 'high']);
    if (has('meta', 'strategy')) lines.push(['strategy', 'from RL specialist (Recap)']);
    if (has('modality', 'joint')) lines.push(['modality', 'joint‑space targets']);
    if (has('modality', 'ee')) lines.push(['modality', 'end‑effector targets']);

    const showSubgoal = has('subgoal', 'sg');
    const conditionEmpty = lines.length === 0 && !showSubgoal;

    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg-soft);border:1px solid var(--line-soft);border-radius:10px;padding:14px;font-family:var(--mono);font-size:12px;color:var(--text)';

    if (conditionEmpty) {
      card.innerHTML = `<div style="font-family:var(--sans);font-size:12px;color:var(--text-mute);font-style:italic">No conditioning. The model has to disambiguate the task from raw pixels alone — exactly the case from §2 that fails.</div>`;
      previewEl.replaceChildren(card);
      return;
    }

    const head = document.createElement('div');
    head.style.cssText = 'font-family:var(--sans);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--olive);margin-bottom:8px';
    head.textContent = 'context tokens fed to π0.7';
    card.appendChild(head);

    if (lines.length) {
      const tbl = document.createElement('div');
      tbl.style.cssText = 'display:grid;grid-template-columns:max-content 1fr;column-gap:14px;row-gap:4px';
      lines.forEach(([k, v]) => {
        const ke = document.createElement('div'); ke.textContent = k; ke.style.color = 'var(--olive)';
        const ve = document.createElement('div'); ve.textContent = v;
        tbl.appendChild(ke); tbl.appendChild(ve);
      });
      card.appendChild(tbl);
    }

    if (showSubgoal) {
      const sub = document.createElement('div');
      sub.style.cssText = 'margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px';
      const idx = (Math.floor(Date.now() / 1500) % 5) + 1;
      const cur = `https://www.pi.website/images/pi07/current_${idx}.png`;
      const goal = `https://www.pi.website/images/pi07/subgoal_${idx}.png`;
      sub.innerHTML = `
        <figure style="margin:0">
          <img src="${cur}" alt="current frame"
               style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid var(--line-soft);background:var(--bg-mute)" loading="lazy">
          <figcaption style="font-family:var(--sans);font-size:11px;color:var(--text-mute);margin-top:4px">current</figcaption>
        </figure>
        <figure style="margin:0">
          <img src="${goal}" alt="subgoal frame"
               style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:2px solid var(--accent);background:var(--bg-mute)" loading="lazy">
          <figcaption style="font-family:var(--sans);font-size:11px;color:var(--text-mute);margin-top:4px">subgoal (image)</figcaption>
        </figure>
      `;
      card.appendChild(sub);
    }

    // a one-line take based on selection
    const take = document.createElement('div');
    take.style.cssText = 'font-family:var(--sans);font-size:12px;color:var(--text-mute);margin-top:12px;line-height:1.5';
    take.textContent = describe();
    card.appendChild(take);

    previewEl.replaceChildren(card);
  }

  function describe() {
    const n = Object.values(state).reduce((s, x) => s + x.size, 0);
    if (n === 0) return '';
    if (n === 1) return 'A single conditioning channel narrows what the policy is being asked to do.';
    const parts = [];
    if (state.lang.size) parts.push('language tells the policy which sub‑goal to pursue');
    if (state.meta.size) parts.push('metadata picks the speed/quality/strategy mode');
    if (state.modality.size) parts.push('the modality flag says which control space to emit');
    if (state.subgoal.size) parts.push('the subgoal image gives the policy a concrete pixel target');
    return parts.join('; ') + '.';
  }

  renderChips();
  renderPreview();
};
