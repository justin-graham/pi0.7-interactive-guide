window.PI07_MEDIA = {
  base: 'https://website.pi-asset.com/pi07/',
  hero: {
    title: 'PI π0.7 release reel',
    src: 'https://website.pi-asset.com/pi07/Pi07VFINAL.mp4'
  },
  airFryer: [
    {
      id: 'zero-shot',
      label: 'Zero-shot prompt',
      eyebrow: 'Cold start',
      title: '“load a sweet potato into the air fryer”',
      src: 'https://website.pi-asset.com/pi07/zeroshot_air_fryer_attempt_compressed.mp4',
      note: 'The robot makes a partial attempt from a plain instruction, but PI reports it does not finish reliably.'
    },
    {
      id: 'coarse',
      label: 'Coarse coaching',
      eyebrow: 'Language coaching',
      title: 'A few high-level steps',
      src: 'https://website.pi-asset.com/pi07/coarse_coaching_air_fryer_compressed.mp4',
      note: 'Breaking the task into sub-steps makes the same policy much easier to steer.'
    },
    {
      id: 'detailed',
      label: 'Detailed coaching',
      eyebrow: 'Language coaching',
      title: 'Fine-grained verbal steps',
      src: 'https://website.pi-asset.com/pi07/detailed_coaching_air_fryer_compressed.mp4',
      note: 'Detailed subtask language gives the model a more precise behavior mode to execute.'
    },
    {
      id: 'autonomous',
      label: 'Autonomous planner',
      eyebrow: 'High-level policy + world model',
      title: 'Language subgoals and generated visual subgoals',
      src: 'https://website.pi-asset.com/pi07/vis_HL_policy_GG_air_fryer.mp4',
      note: 'A high-level policy emits language subtasks; a world model supplies visual subgoals for π0.7.'
    },
    {
      id: 'nearest-data',
      label: 'Closest data',
      eyebrow: 'Training echoes',
      title: 'Related air-fryer episodes PI found after the fact',
      videos: [
        {
          title: 'Home robot episode',
          src: 'https://website.pi-asset.com/pi07/Clippi_air_fry_compressed.mp4'
        },
        {
          title: 'Galaxea episode',
          src: 'https://website.pi-asset.com/pi07/Galaxea_air_fry_compressed.mp4'
        },
        {
          title: 'DROID / Franka episode',
          src: 'https://website.pi-asset.com/pi07/DROID_air_fry_compressed.mp4'
        }
      ],
      note: 'The related episodes look different from the evaluation setup, which is why PI frames the result as recombining skills rather than replaying one demo.'
    }
  ],
  embodiment: {
    source: {
      title: 'Source robot data',
      label: 'Static bimanual robot',
      src: 'https://website.pi-asset.com/pi07/ARX_shirt_fold_teleop_compressed.mp4'
    },
    target: {
      title: 'Target robot evaluation',
      label: 'Bimanual UR5e, no laundry-folding data on this body',
      src: 'https://website.pi-asset.com/pi07/ur5_shirt_folding_with_goal_overlay_labeled_compressed.mp4'
    }
  },
  subgoals: Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return {
      current: `https://www.pi.website/images/pi07/current_${n}.png`,
      goal: `https://www.pi.website/images/pi07/subgoal_${n}.png`
    };
  }),
  dexterity: [
    {
      title: 'Make espresso',
      src: 'https://website.pi-asset.com/pi07/coffee_compressed.mp4'
    },
    {
      title: 'Peel cucumber',
      src: 'https://website.pi-asset.com/pi07/cucumber_peeling_compressed.mp4'
    },
    {
      title: 'Make a peanut butter sandwich',
      src: 'https://website.pi-asset.com/pi07/PBsandwich_compressed.mp4'
    },
    {
      title: 'Clean a glass door with Windex',
      src: 'https://website.pi-asset.com/pi07/windex_compressed.mp4'
    }
  ]
};
