window.W_air_fryer_lab = function init(root) {
  const tabs = root.querySelector('[data-airfryer="tabs"]');
  const stage = root.querySelector('[data-airfryer="stage"]');
  const items = (window.PI07_MEDIA && window.PI07_MEDIA.airFryer) || [];
  let active = items[0] ? items[0].id : null;

  function video(src, title) {
    const el = document.createElement('video');
    const shouldAutoplay = !window.PI07_PREFERS_REDUCED_MOTION;
    el.className = 'w-video';
    el.src = src;
    el.title = title;
    el.muted = true;
    el.loop = true;
    el.autoplay = shouldAutoplay;
    el.playsInline = true;
    el.controls = true;
    el.preload = 'metadata';
    if (shouldAutoplay) {
      el.addEventListener('canplay', () => el.play().catch(() => {}), { once: true });
    }
    return el;
  }

  function renderTabs() {
    tabs.innerHTML = '';
    items.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lab-tab';
      button.textContent = item.label;
      button.setAttribute('aria-pressed', item.id === active ? 'true' : 'false');
      button.addEventListener('click', () => {
        active = item.id;
        render();
      });
      tabs.appendChild(button);
    });
  }

  function renderStage() {
    const item = items.find(x => x.id === active) || items[0];
    stage.innerHTML = '';
    if (!item) return;

    const head = document.createElement('div');
    head.className = 'media-head';
    head.innerHTML = `
      <span>${item.eyebrow}</span>
      <h4>${item.title}</h4>
      <p>${item.note}</p>
    `;
    stage.appendChild(head);

    if (item.videos) {
      const grid = document.createElement('div');
      grid.className = 'video-grid';
      item.videos.forEach(v => {
        const tile = document.createElement('figure');
        tile.className = 'video-tile';
        tile.appendChild(video(v.src, v.title));
        const cap = document.createElement('figcaption');
        cap.textContent = v.title;
        tile.appendChild(cap);
        grid.appendChild(tile);
      });
      stage.appendChild(grid);
    } else {
      const wrap = document.createElement('div');
      wrap.className = 'w-video-wrap';
      const label = document.createElement('span');
      label.className = 'lbl';
      label.textContent = item.label;
      wrap.appendChild(label);
      wrap.appendChild(video(item.src, item.title));
      stage.appendChild(wrap);
    }
  }

  function render() {
    renderTabs();
    renderStage();
  }

  render();
};
