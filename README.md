# π0.7 Interactive Guide

A static, first-principles interactive guide to robot foundation models, using Physical Intelligence's [π0.7](https://www.pi.website/blog/pi07) as the capstone case study.

The page now teaches the foundations before summarizing the release: observations, actions, policies, demonstrations, covariate shift, multimodality, action chunks, flow matching, VLA grounding, context, visual subgoals, and then π0.7's system diagram and demo evidence.

This is a third-party explainer. PI's paper, blog post, figures, models, and demo media remain the source of truth. See [CREDITS.md](./CREDITS.md).

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Stack

Plain HTML, CSS, and JavaScript. No build step. Static-deploys to GitHub Pages from `main`. MathJax handles the small amount of notation, and the interactive widgets use vanilla DOM, SVG, and `<canvas>`.
