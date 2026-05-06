# π0.7 for Dummies

An interactive walkthrough of Physical Intelligence's [π0.7](https://www.pi.website/blog/pi07) model — built from the ground up so a curious reader without a robotics background can follow along.

The page starts at "what is a robot policy?" and walks all the way to "why does diverse contextual prompting unlock compositional generalization?" with a live, hands-on widget for every concept.

This is a third-party explainer. All credit for the work belongs to Physical Intelligence; this site links to and quotes their materials with attribution. See [CREDITS.md](./CREDITS.md).

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Stack

Plain HTML, CSS, and JavaScript. No build step. Static-deploys to GitHub Pages from `main`. MathJax for LaTeX, D3 for one chart, vanilla `<canvas>` everywhere else.
