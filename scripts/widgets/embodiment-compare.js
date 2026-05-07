window.W_embodiment_compare = function init(root) {
  const videos = root.querySelector('[data-embodiment="videos"]');
  const callouts = root.querySelector('[data-embodiment="callouts"]');
  const media = window.PI07_MEDIA && window.PI07_MEDIA.embodiment;
  const notes = [
    {
      id: 'body',
      label: 'Different body',
      text: 'The UR5e setup is larger, heavier, and harder to teleoperate than the source bimanual system.'
    },
    {
      id: 'data',
      label: 'No task data',
      text: 'PI reports no laundry-folding data was collected for this task on the bimanual UR5e system.'
    },
    {
      id: 'strategy',
      label: 'Adapted strategy',
      text: 'The policy uses grasps and motions better suited to the target robot instead of copying source motion exactly.'
    },
    {
      id: 'goal',
      label: 'Subgoal hint',
      text: 'Generated visual subgoals help the model construct an analogy between the source and target robots.'
    }
  ];
  let selected = notes[0].id;

  function makeVideo(item) {
    const figure = document.createElement('figure');
    figure.className = 'comparison-video';
    const wrap = document.createElement('div');
    wrap.className = 'w-video-wrap';
    const badge = document.createElement('span');
    badge.className = 'lbl';
    badge.textContent = item.label;
    const vid = document.createElement('video');
    const shouldAutoplay = !window.PI07_PREFERS_REDUCED_MOTION;
    vid.className = 'w-video';
    vid.src = item.src;
    vid.muted = true;
    vid.loop = true;
    vid.autoplay = shouldAutoplay;
    vid.playsInline = true;
    vid.controls = true;
    vid.preload = 'metadata';
    if (shouldAutoplay) {
      vid.addEventListener('canplay', () => vid.play().catch(() => {}), { once: true });
    }
    wrap.appendChild(badge);
    wrap.appendChild(vid);
    figure.appendChild(wrap);
    const cap = document.createElement('figcaption');
    cap.textContent = item.title;
    figure.appendChild(cap);
    return figure;
  }

  function renderVideos() {
    if (!media) return;
    videos.innerHTML = '';
    videos.appendChild(makeVideo(media.source));
    videos.appendChild(makeVideo(media.target));
  }

  function renderCallouts() {
    callouts.innerHTML = '';
    const buttons = document.createElement('div');
    buttons.className = 'lab-tabs compact';
    notes.forEach(note => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lab-tab';
      button.textContent = note.label;
      button.setAttribute('aria-pressed', note.id === selected ? 'true' : 'false');
      button.addEventListener('click', () => {
        selected = note.id;
        renderCallouts();
      });
      buttons.appendChild(button);
    });
    const active = notes.find(note => note.id === selected) || notes[0];
    const panel = document.createElement('div');
    panel.className = 'callout-panel';
    panel.innerHTML = `<strong>${active.label}</strong><span>${active.text}</span>`;
    callouts.appendChild(buttons);
    callouts.appendChild(panel);
  }

  renderVideos();
  renderCallouts();
};
