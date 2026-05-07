# π0.7 Interactive Guide

A static, interactive guide to Physical Intelligence's [π0.7](https://www.pi.website/blog/pi07) model. It starts from robot-policy foundations and builds toward diverse contextual prompting, visual subgoals, air-fryer composition, cross-embodiment transfer, and the paper's main result claims.

This is a third-party explainer. PI's paper, blog post, figures, models, and demo media remain the source of truth. See [CREDITS.md](./CREDITS.md).

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Stack

Plain HTML, CSS, and JavaScript. No build step. Static-deploys to GitHub Pages from `main`. MathJax handles the small amount of notation, and the interactive widgets use vanilla DOM, SVG, and `<canvas>`.
