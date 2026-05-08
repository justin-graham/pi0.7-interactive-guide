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
          <svg class="loop-svg" data-active="${term.id}" viewBox="0 0 620 260" role="img" aria-label="Observation and context feed a policy; the policy emits an action; the action changes the world and creates the next observation.">
            <defs>
              <marker id="loop-arrow-olive" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
                <path d="M 0 0 L 12 6 L 0 12 z"></path>
              </marker>
              <marker id="loop-arrow-yellow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
                <path d="M 0 0 L 12 6 L 0 12 z"></path>
              </marker>
            </defs>

            <path class="loop-edge olive" d="M194 64 C226 64 226 112 256 122"></path>
            <path class="loop-edge olive" d="M194 196 C226 196 226 148 256 138"></path>
            <path class="loop-edge yellow" d="M364 130 C398 130 402 64 430 64"></path>
            <path class="loop-edge yellow" d="M497 90 L497 170"></path>
            <path class="loop-edge olive" d="M430 196 C306 244 20 244 20 64 L60 64"></path>

            <g class="loop-svg-node obs-node">
              <rect class="node-rect" x="60" y="38" width="134" height="52"></rect>
              <text x="127" y="69">Observation</text>
            </g>
            <g class="loop-svg-node context-node">
              <rect class="node-rect" x="60" y="170" width="134" height="52"></rect>
              <text x="127" y="201">Context</text>
            </g>
            <g class="loop-svg-node policy-node">
              <rect class="node-rect" x="256" y="104" width="108" height="52"></rect>
              <text x="310" y="135">Policy</text>
            </g>
            <g class="loop-svg-node action-node">
              <rect class="node-rect" x="430" y="38" width="134" height="52"></rect>
              <text x="497" y="69">Action</text>
            </g>
            <g class="loop-svg-node world-node">
              <rect class="node-rect" x="430" y="170" width="134" height="52"></rect>
              <text x="497" y="193">World</text>
              <text x="497" y="208">changes</text>
            </g>
          </svg>
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
