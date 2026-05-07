window.W_conditioning_lab = function init(root) {
  const target = root.querySelector('[data-conditioning="root"]');
  const media = window.PI07_MEDIA || {};
  const parts = [
    {
      id: 'language',
      label: 'Language',
      token: 'subtask: “grasp the air-fryer handle”',
      resolves: 'Which semantic step should be executed right now?',
      detail: 'A broad task becomes a smaller action target.'
    },
    {
      id: 'metadata',
      label: 'Metadata',
      token: 'quality: high · speed: fast · strategy: specialist',
      resolves: 'Which mode of behavior should be copied?',
      detail: 'Suboptimal or slower data can be retained without becoming the default behavior.'
    },
    {
      id: 'control',
      label: 'Control modality',
      token: 'action space: joint targets',
      resolves: 'Which robot-control interface should the action expert emit?',
      detail: 'Data from different control schemes can share one prompting framework.'
    },
    {
      id: 'subgoal',
      label: 'Visual subgoal',
      token: 'goal image: predicted next state',
      resolves: 'Where should objects and grippers end up spatially?',
      detail: 'The policy gets a pixel-level target, not just a sentence.'
    }
  ];

  const active = new Set(['language', 'metadata']);

  function render() {
    target.innerHTML = '';

    const chips = document.createElement('div');
    chips.className = 'lab-chips';
    parts.forEach(part => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lab-chip';
      button.textContent = part.label;
      button.setAttribute('aria-pressed', active.has(part.id) ? 'true' : 'false');
      button.addEventListener('click', () => {
        if (active.has(part.id)) active.delete(part.id);
        else active.add(part.id);
        render();
      });
      chips.appendChild(button);
    });
    target.appendChild(chips);

    const grid = document.createElement('div');
    grid.className = 'conditioning-grid';

    const prompt = document.createElement('div');
    prompt.className = 'prompt-card';
    prompt.innerHTML = '<h4>Context passed to π0.7</h4>';
    const tokenList = document.createElement('div');
    tokenList.className = 'token-stack';
    if (!active.size) {
      const empty = document.createElement('div');
      empty.className = 'token-empty';
      empty.textContent = 'No explicit context. The model must infer task, style, and target from pixels alone.';
      tokenList.appendChild(empty);
    } else {
      parts.filter(part => active.has(part.id)).forEach(part => {
        const row = document.createElement('div');
        row.className = 'token-row';
        row.innerHTML = `<span>${part.label}</span><code>${part.token}</code>`;
        tokenList.appendChild(row);
      });
    }
    prompt.appendChild(tokenList);

    if (active.has('subgoal') && media.subgoals && media.subgoals.length) {
      const pair = media.subgoals[(Date.now() / 2000 | 0) % media.subgoals.length];
      const images = document.createElement('div');
      images.className = 'mini-subgoals';
      images.innerHTML = `
        <figure>
          <img src="${pair.current}" alt="Current observation frame" loading="lazy">
          <figcaption>current</figcaption>
        </figure>
        <figure>
          <img src="${pair.goal}" alt="Predicted visual subgoal frame" loading="lazy">
          <figcaption>subgoal</figcaption>
        </figure>
      `;
      prompt.appendChild(images);
    }

    const resolved = document.createElement('div');
    resolved.className = 'prompt-card';
    resolved.innerHTML = '<h4>Ambiguity resolved</h4>';
    const list = document.createElement('div');
    list.className = 'resolution-list';
    parts.forEach(part => {
      const item = document.createElement('div');
      item.className = active.has(part.id) ? 'resolution active' : 'resolution';
      item.innerHTML = `
        <strong>${part.resolves}</strong>
        <span>${active.has(part.id) ? part.detail : 'Still ambiguous.'}</span>
      `;
      list.appendChild(item);
    });
    resolved.appendChild(list);

    grid.appendChild(prompt);
    grid.appendChild(resolved);
    target.appendChild(grid);
  }

  render();
};
