// §5 — drag skill cards into the target slot. Different combinations unlock
// different "tier" videos (zero-shot / language-coached / autonomous).
window.W_compose = function init(root) {
  const board = root.querySelector('[data-compose="board"]');
  const drop = root.querySelector('[data-compose="drop"]');
  const filled = root.querySelector('[data-compose="filled"]');
  const tier = root.querySelector('[data-compose="tier"]');
  const wrap = root.querySelector('[data-compose="video-wrap"]');
  const vid = root.querySelector('[data-compose="video"]');
  const lbl = root.querySelector('[data-compose="vidlabel"]');

  // Real air-fryer tier videos straight from PI's CDN.
  const tiers = [
    { min: 0, label: 'drop skills here', src: '' },
    { min: 1, label: 'one skill — partial reach; nothing useful happens', src: '' },
    { min: 2, label: 'zero‑shot: π0.7 attempts the air fryer cold', src: 'https://website.pi-asset.com/pi07/zeroshot_air_fryer_attempt_compressed.mp4' },
    { min: 3, label: 'language‑coached (coarse): a few high‑level prompts get it through', src: 'https://website.pi-asset.com/pi07/coarse_coaching_air_fryer_compressed.mp4' },
    { min: 4, label: 'language‑coached (detailed): step‑by‑step instructions complete the task', src: 'https://website.pi-asset.com/pi07/detailed_coaching_air_fryer_compressed.mp4' }
  ];

  const slot = []; // ids in slot
  const skillNames = {
    hinge: 'open hinged lid',
    press: 'press button',
    grasp: 'grasp small handle',
    place: 'place object inside'
  };

  function renderFilled() {
    filled.innerHTML = '';
    if (slot.length === 0) {
      const e = document.createElement('span');
      e.className = 'slot-empty'; e.textContent = 'drop skills here…';
      filled.appendChild(e); return;
    }
    slot.forEach((id, ix) => {
      const e = document.createElement('span');
      e.className = 'filled';
      e.innerHTML = `${skillNames[id]} <button aria-label="remove" data-rem="${ix}">×</button>`;
      filled.appendChild(e);
    });
    filled.querySelectorAll('[data-rem]').forEach(b => {
      b.addEventListener('click', () => {
        slot.splice(parseInt(b.dataset.rem, 10), 1);
        renderFilled(); updateTier();
      });
    });
  }

  function updateTier() {
    const k = Math.min(slot.length, tiers.length - 1);
    const t = tiers[k];
    tier.textContent = k === 0 ? 'Drag at least 2 skills to see π0.7 attempt the task.' : t.label;
    if (t.src) {
      wrap.style.display = 'block';
      lbl.textContent = ['', '', 'zero‑shot', 'coarse coaching', 'detailed coaching'][k];
      const cur = vid.dataset.lazySrc || vid.src;
      if (cur !== t.src) {
        vid.dataset.lazySrc = t.src;
        vid.src = t.src;
        vid.load();
        vid.play().catch(() => {});
      }
    } else {
      wrap.style.display = 'none';
    }
  }

  // dragging
  board.querySelectorAll('.skill').forEach(el => {
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/skill', el.dataset.id);
      el.dataset.dragging = 'true';
    });
    el.addEventListener('dragend', () => { el.dataset.dragging = 'false'; });
    // tap-to-add fallback for touch
    el.addEventListener('click', () => {
      if (slot.length >= 4 || slot.includes(el.dataset.id)) return;
      slot.push(el.dataset.id); renderFilled(); updateTier();
    });
  });
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('over');
    const id = e.dataTransfer.getData('text/skill');
    if (!id || slot.includes(id) || slot.length >= 4) return;
    slot.push(id); renderFilled(); updateTier();
  });

  renderFilled();
  updateTier();
};
