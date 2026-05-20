# Checkpoint 0029 — Pull Items Out of the Stack + Drag Drop-Zone Outline

**Date:** 2026-05-20
**Commit:** drag elements/text out of the demo stack, a directional drop-zone
outline during drags, and a fix for the demo-5 highlight size shift

## Context

Continues the demo-6 stack work. Tina wanted to be able to pull elements/text
back out of the stack, drop-zone feedback while dragging, and noticed the demo-5
Insert highlight resized the tiles.

## Human Directions

- "Click and move elements/text out of the stack; the stack should re-center" →
  pressing an in-stack item and dragging pulls it out; the flex column re-centers
  the rest automatically. A plain click just selects (no pop-out).
- "It feels weird — drag out should be smooth like dragging in" → the pop-out used
  to remount the element mid-drag (in-stack `<img>` → free `<div>`). Now a free
  dragging copy renders from mousedown over a hidden placeholder that holds the
  stack slot, so there's no remount.
- "It shrinks the element" → free elements were a fixed 150px; pulled-out items now
  keep the size they had in the stack (`DemoEl.width`). In-stack text font matched
  to the free text size (16px).
- "Don't re-center on a click, only on a real drag" → the item leaves the stack
  (`inStack:false`) only once the drag threshold is crossed.
- "Show a hover effect on the canvas while dragging" → a blue drop-zone outline.
  After a couple of rounds: it's on the whole frame-card (not the workspace), and
  the white canvas too. Final form: a directional sweep — frame → white canvas
  when dragging in, white canvas → frame when dragging out, one at a time.
- "The demo-5 highlight shifts the tile size" → `.insert-section--demo` had
  `padding:14px` that shrank the tiles 28px; clicking to demo-6 snapped them back.

## Records of Resistance

1. **Pop-out timing churned three times.** Mid-drag pop-out → jump. Mousedown
   pop-out → smooth but a click re-centered the stack. Final: a free copy renders
   from mousedown over a hidden placeholder, and `inStack` flips only at the drag
   threshold — smooth drag, click leaves the stack untouched.
2. **"Hover effect" was ambiguous** — asked twice (surfaces, then sweep vs.
   staggered). Landed on a one-at-a-time directional sweep.
3. **Demo-5 size shift** — `.insert-section--demo`'s `padding:14px` resized the
   content. Fixed with `margin:-14px` so the highlight card grows outward instead
   of pushing the tiles inward. Verified pixel-identical (dx/dy/dw = 0).

## Successes

- In-stack elements/text drag out smoothly; the stack re-centers; click ≠ pull-out.
- Pulled-out items keep their size — no shrink.
- Directional drop-zone outline sweeps frame↔white-canvas by drag direction.
- demo-5 Insert highlight no longer resizes the tiles.
- Build clean — 261 KB JS / 36 KB CSS (79.6 / 6.8 KB gzipped).

## What's Next

- The "Drag this into the stack" callout still reappears on a pulled-out element.
