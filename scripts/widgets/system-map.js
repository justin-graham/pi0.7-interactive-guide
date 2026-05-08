window.W_system_map = function init(root) {
  const mount = root.querySelector('[data-system-map="root"]');
  const media = window.PI07_MEDIA || {};
  const reduceMotion = !!window.PI07_PREFERS_REDUCED_MOTION;

  const dexterity = media.dexterity || [];
  const airFryer = media.airFryer || [];
  const videos = {
    air: (airFryer.find(item => item.id === 'autonomous') || airFryer[0] || {}).src,
    dexterity: (dexterity.find(item => /espresso/i.test(item.title)) || dexterity[0] || {}).src,
    embodiment: media.embodiment && media.embodiment.target && media.embodiment.target.src
  };

  const notes = {
    language: {
      title: 'Language instructions',
      detail: 'Training episodes can include task and subtask text, so visually similar scenes do not all collapse into the same behavior.',
      why: 'At inference time, those same text slots become steering handles.'
    },
    subgoals: {
      title: 'Subgoal images',
      detail: 'A future-looking image tells the policy where objects and the gripper should end up, not just what words describe.',
      why: 'This is the visual bridge between a world model and low-level action.'
    },
    metadata: {
      title: 'Episode metadata',
      detail: 'Quality, speed, and source tags let broad datasets keep useful variation without making every mode equally likely.',
      why: 'Metadata turns messy data mixtures into conditioned behavior modes.'
    },
    memory: {
      title: 'Observation memory',
      detail: 'Recent frames and robot state give the model history: what moved, what was grasped, and what still needs to change.',
      why: 'A policy needs more than the current pixel frame for long-horizon manipulation.'
    },
    prompt: {
      title: 'Prompt',
      detail: 'The prompt is the shared bottleneck where language, metadata, visual subgoals, and inference-time plans meet.',
      why: 'This is the core π0.7 interface: change the context, steer the same checkpoint.'
    },
    action: {
      title: 'Action expert',
      detail: 'The action expert turns the model state and prompt into continuous robot action chunks using the policy head.',
      why: 'It grounds semantic intent into joint-space motion.'
    },
    policy: {
      title: 'High-level policy',
      detail: 'At inference time, a higher-level controller can decompose a task instruction into smaller subtask instructions.',
      why: 'This is what makes unfamiliar multi-step tasks easier to guide.'
    },
    world: {
      title: 'World model',
      detail: 'The world model predicts visual subgoals: images of a plausible next scene state for π0.7 to act toward.',
      why: 'The guide image can be clearer than a sentence for spatial manipulation.'
    },
    desired: {
      title: 'Desired metadata',
      detail: 'Inference can also request a behavior mode, such as speed or quality, through the same metadata interface used in training.',
      why: 'The model is not only general; it is steerable.'
    },
    outbox: {
      title: 'Out-of-the-box performance',
      detail: 'Plain and coached task prompts can elicit useful behavior on tasks assembled from related skills.',
      why: 'The air-fryer example tests compositional use of existing primitives.'
    },
    dexterity: {
      title: 'Specialist-level dexterity',
      detail: 'PI reports that the same generalist model reaches or exceeds specialist policies on several dexterous evaluations.',
      why: 'The context recipe does not only help broad task coverage; it preserves fine motor skill.'
    },
    transfer: {
      title: 'Cross-embodiment transfer',
      detail: 'The model can map a familiar task onto a robot body with different geometry and control constraints.',
      why: 'This is the strongest visual evidence that the learned behavior is not simple replay.'
    }
  };

  let active = 'prompt';

  function render() {
    mount.innerHTML = `
      <div class="pi-system-map" aria-label="Interactive diagram of the π0.7 training and inference context loop">
        <div class="map-left">
          <div class="map-stage map-training">
            <div class="map-stage-title">Training time</div>
            <div class="map-node-row three">
              ${node('language', 'Language instructions', '<span>open drawer</span><span>grab spatula</span><span>place object</span>')}
              ${node('subgoals', 'Subgoal images', imageStrip())}
              ${node('metadata', 'Episode metadata', '<span class="metric">quality</span><span class="metric">speed</span>')}
            </div>
          </div>

          <div class="map-connector down yellow" aria-hidden="true"></div>

          <div class="map-stage map-model">
            <div class="map-model-title"><span class="pi">π</span><sub>0.7</sub> vision-language-action model</div>
            <div class="map-node-row model">
              ${node('memory', 'Observation memory', imageStrip(true))}
              ${node('prompt', 'Prompt', '<span class="prompt-token">context tokens</span><span class="prompt-token">visual goal</span>')}
              ${node('action', 'Action expert', '<span class="action-pill">continuous action chunks</span>')}
            </div>
          </div>

          <div class="map-connector up olive" aria-hidden="true"></div>

          <div class="map-stage map-inference">
            <div class="map-stage-title">Inference time</div>
            <div class="map-node-row three">
              ${node('policy', 'High-level policy', '<span class="block-step">task instruction</span><span class="arrow-mini">→</span><span class="block-step">subtask instruction</span>')}
              ${node('world', 'World model', '<span class="block-step">subtask</span><span class="arrow-mini">→</span><span class="block-step">subgoal</span>')}
              ${node('desired', 'Desired metadata', '<span class="metric">quality</span><span class="metric">speed</span>')}
            </div>
          </div>
        </div>

        <div class="map-branch" aria-hidden="true">
          <span class="branch-rail"></span>
          <span class="branch-row"></span>
          <span class="branch-row"></span>
          <span class="branch-row"></span>
        </div>

        <div class="map-outcomes">
          ${outcome('outbox', 'Out-of-the-box performance', videos.air, 'autonomous, 5x speed')}
          ${outcome('dexterity', 'Specialist-level dexterity', videos.dexterity, 'autonomous, 5x speed')}
          ${outcome('transfer', 'Cross-embodiment transfer', videos.embodiment, 'autonomous, 1x speed')}
        </div>
      </div>
      <div class="map-readout" data-system-map="readout" aria-live="polite"></div>
    `;

    mount.querySelectorAll('[data-map-node]').forEach(button => {
      button.addEventListener('click', () => setActive(button.dataset.mapNode));
      button.addEventListener('focus', () => setActive(button.dataset.mapNode));
      button.addEventListener('mouseenter', () => setActive(button.dataset.mapNode));
    });

    mount.querySelectorAll('video[data-map-video]').forEach(video => {
      if (!reduceMotion) {
        video.autoplay = true;
        video.addEventListener('canplay', () => video.play().catch(() => {}), { once: true });
      }
    });

    setActive(active);
  }

  function node(id, title, body) {
    const pressed = id === active ? 'true' : 'false';
    return `
      <button class="map-node ${id === 'prompt' ? 'prompt-node' : ''} ${id === 'action' ? 'action-node' : ''}" type="button" data-map-node="${id}" aria-pressed="${pressed}">
        <strong>${title}</strong>
        <span class="map-node-body">${body}</span>
      </button>
    `;
  }

  function imageStrip(compact) {
    const pairs = media.subgoals || [];
    const items = pairs.slice(0, compact ? 3 : 4);
    return `<span class="thumb-strip">${items.map(pair => `<img src="${pair.current}" alt="" loading="lazy">`).join('')}</span>`;
  }

  function outcome(id, title, src, badge) {
    const fallback = `<span class="map-thumb-fallback ${id}" aria-hidden="true"><span>${fallbackText(id)}</span></span>`;
    const video = src && !reduceMotion ? `
      <video data-map-video muted loop playsinline preload="metadata" tabindex="-1" aria-hidden="true" src="${src}"></video>
    ` : fallback;
    return `
      <button class="map-outcome" type="button" data-map-node="${id}" aria-pressed="${id === active ? 'true' : 'false'}">
        <span class="outcome-label">${title}</span>
        <span class="outcome-media">${video}</span>
        <span class="outcome-badge">${badge}</span>
      </button>
    `;
  }

  function fallbackText(id) {
    return {
      outbox: 'Air fryer',
      dexterity: 'Dexterity',
      transfer: 'UR5e transfer'
    }[id] || 'Demo';
  }

  function setActive(id) {
    active = notes[id] ? id : 'prompt';
    const note = notes[active];
    mount.querySelectorAll('[data-map-node]').forEach(button => {
      button.setAttribute('aria-pressed', button.dataset.mapNode === active ? 'true' : 'false');
    });
    const readout = mount.querySelector('[data-system-map="readout"]');
    if (readout) {
      readout.innerHTML = `
        <strong>${note.title}</strong>
        <span>${note.detail}</span>
        <em>${note.why}</em>
      `;
    }
  }

  render();
};
