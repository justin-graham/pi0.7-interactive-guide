window.W_jargon_decoder = function init(root) {
  const mount = root.querySelector('[data-jargon="root"]');
  const terms = [
    {
      id: 'observation',
      label: 'Observation',
      short: 'What the robot can sense.',
      detail: 'Camera frames, proprioception, gripper state, and sometimes recent memory. It is the robot\'s input view of the world.',
      example: 'image + joint angles + gripper open/closed'
    },
    {
      id: 'action',
      label: 'Action',
      short: 'What the robot commands next.',
      detail: 'An action might be joint targets, end-effector deltas, gripper commands, or a short chunk of future commands.',
      example: 'move wrist left, close gripper'
    },
    {
      id: 'policy',
      label: 'Policy',
      short: 'The rule that maps sensing to acting.',
      detail: 'A policy is often written as pi(a | o, c): choose an action from observation and context.',
      example: 'if handle is visible, reach toward it'
    },
    {
      id: 'trajectory',
      label: 'Trajectory',
      short: 'A sequence through time.',
      detail: 'Robot learning data is not just still images. It is observation, action, observation, action, repeated.',
      example: 'reach -> grasp -> lift -> place'
    },
    {
      id: 'demo',
      label: 'Demonstration',
      short: 'A recorded example of good behavior.',
      detail: 'A human or another controller performs the task while the system records observations and actions.',
      example: 'teleoperated drawer opening'
    },
    {
      id: 'clone',
      label: 'Behavior cloning',
      short: 'Train the policy to imitate demos.',
      detail: 'The model sees an observation from a demo and learns to predict the action that was taken there.',
      example: 'supervised learning for actions'
    },
    {
      id: 'context',
      label: 'Context',
      short: 'Extra information that disambiguates behavior.',
      detail: 'Language, robot type, metadata, and visual subgoals tell the same policy which mode it should execute.',
      example: 'task: fold shirt, robot: UR5e'
    },
    {
      id: 'embodiment',
      label: 'Embodiment',
      short: 'The robot body doing the task.',
      detail: 'Different arms and grippers can need different motions for the same goal. Body is part of the problem.',
      example: 'mobile bimanual robot vs UR5e'
    }
  ];

  let active = 'policy';

  function render() {
    const term = terms.find(item => item.id === active) || terms[0];
    mount.innerHTML = `
      <div class="primer-grid">
        <div class="primer-terms">
          ${terms.map(item => `
            <button type="button" class="primer-term" data-term="${item.id}" aria-pressed="${item.id === active ? 'true' : 'false'}">
              <strong>${item.label}</strong>
              <span>${item.short}</span>
            </button>
          `).join('')}
        </div>
        <div class="primer-diagram" aria-live="polite">
          <div class="loop-diagram" data-active="${term.id}">
            <span class="loop-node obs">Observation</span>
            <span class="loop-node ctx">Context</span>
            <span class="loop-node pol">Policy</span>
            <span class="loop-node act">Action</span>
            <span class="loop-node world">World changes</span>
            <span class="loop-line l1"></span>
            <span class="loop-line l2"></span>
            <span class="loop-line l3"></span>
            <span class="loop-line l4"></span>
          </div>
          <div class="primer-readout">
            <strong>${term.label}</strong>
            <span>${term.detail}</span>
            <code>${term.example}</code>
          </div>
        </div>
      </div>
    `;

    mount.querySelectorAll('[data-term]').forEach(button => {
      button.addEventListener('click', () => {
        active = button.dataset.term;
        render();
      });
    });
  }

  render();
};
