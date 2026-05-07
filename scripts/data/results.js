window.PI07_RESULTS = {
  tabs: [
    {
      id: 'dexterity',
      label: 'Dexterity',
      figure: 'Paper Fig. 6',
      title: 'Out-of-the-box dexterity',
      source: 'π0.7 paper, Fig. 6 and Sec. IX-A',
      sourceUrl: 'assets/pi07.pdf',
      summary: 'PI reports that the same π0.7 checkpoint is competitive with task-specific specialists across the π*0.6 tasks, with higher throughput in difficult laundry and box-building cases.',
      rows: [
        {
          task: 'Laundry: T-shirts and shorts',
          measure: 'Success rate + normalized throughput',
          result: 'Competitive with the π*0.6 RL specialist',
          evidence: 'Figure 6 top row'
        },
        {
          task: 'Laundry: diverse hardest item',
          measure: 'Success rate + normalized throughput',
          result: 'Higher throughput than the specialist is reported',
          evidence: 'Figure 6 caption'
        },
        {
          task: 'Make espresso',
          measure: 'Success rate + normalized throughput',
          result: 'Matches specialist-level task performance out of the box',
          evidence: 'Figure 6 top row'
        },
        {
          task: 'Box building',
          measure: 'Success rate + normalized throughput',
          result: 'Higher throughput than the specialist is reported',
          evidence: 'Figure 6 caption'
        }
      ]
    },
    {
      id: 'instruction',
      label: 'Instruction following',
      figure: 'Paper Fig. 11 + blog',
      title: 'Breaking dataset biases with language and goals',
      source: 'π0.7 paper, Fig. 11; PI blog air-fryer section',
      sourceUrl: 'assets/pi07.pdf',
      summary: 'π0.7 follows instructions that contradict common dataset patterns better than prior π-family models, and visual subgoal context is reported as critical for one reverse-fridge task.',
      rows: [
        {
          task: 'Reverse bussing',
          measure: 'Task progress',
          result: 'Improved language-following relative to prior models',
          evidence: 'Figure 11'
        },
        {
          task: 'Reverse fridge to microwave',
          measure: 'Task progress',
          result: 'World-model subgoals make the strongest reported variant',
          evidence: 'Figure 11 caption'
        },
        {
          task: 'Air fryer sweet potato',
          measure: 'Qualitative staged demos',
          result: 'Language coaching turns a partial attempt into a much stronger execution',
          evidence: 'PI blog videos'
        }
      ]
    },
    {
      id: 'embodiment',
      label: 'Cross-embodiment',
      figure: 'Paper Fig. 12-13',
      title: 'New robot body, new strategy',
      source: 'π0.7 paper, Fig. 12-13 and Sec. IX-C',
      sourceUrl: 'assets/pi07.pdf',
      summary: 'PI evaluates laundry transfer on a bimanual UR5e that had no laundry-folding data for that task. The paper reports that π0.7 adapts its strategy instead of simply copying the source robot motion.',
      rows: [
        {
          task: 'T-shirt and towel folding on UR5e',
          measure: 'Task progress / success comparison',
          result: 'Matches experienced teleoperators trying the target robot for the first time',
          evidence: 'Figure 12 caption and Sec. IX-C'
        },
        {
          task: 'UR5e cloth grasps',
          measure: 'Strategy analysis',
          result: 'Uses more vertical grasps suited to the larger robot morphology',
          evidence: 'Figure 13'
        },
        {
          task: 'Visual subgoal context',
          measure: 'Ablation comparison',
          result: 'Generated subgoals improve cross-embodiment transfer',
          evidence: 'Figure 12 caption'
        }
      ]
    }
  ],
  limitations: [
    {
      title: 'Unseen tasks are still harder',
      text: 'The paper reports lower success for zero-shot generalization than for seen tasks.'
    },
    {
      title: 'Novelty is hard to audit',
      text: 'PI notes that with broad robot data, it is difficult to know whether a behavior is truly unseen or a new combination of related data.'
    },
    {
      title: 'Planning is still mostly external',
      text: 'The discussion points toward future models that can think through plans, act, observe outcomes, and revise.'
    }
  ]
};
