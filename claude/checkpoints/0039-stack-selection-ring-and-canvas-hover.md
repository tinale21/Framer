# Checkpoint 0039 — Stack Selection Ring + Canvas Hover Tuning

**Date:** 2026-05-21
**Commit:** make the stack's selection ring an overlay that actually shows,
and only suppress the canvas hover outline while the stack is selected

## Context

Small follow-ups to the stack select/delete feature from 0038 — fixing the
selection ring's visibility and the canvas hover affordance.

## Human Directions

- "Make the stack's selection outline a bit bigger." → it turned out the ring
  wasn't visible at all (see below); after fixing that, the user dialed the
  width down in 0.5px steps to 1px.
- "The white-canvas hover effect isn't working — it should still work, just
  be disabled while the stack is selected." → the suppression was tied to the
  scene; retied it to the stack actually being selected.

## Records of Resistance

1. **The selection ring was invisible.** It was an `inset` `box-shadow` on
   `.demo-stack`, but the blue/teal column children paint on top of an inset
   shadow — so it only showed in the 4px gap between columns. The user said
   "I don't see a difference" after a size bump. Switched to a `::after`
   overlay (an absolutely-positioned border), which draws above the columns.
2. **Canvas hover outline over-suppressed.** It had been disabled for the
   whole `demo-7-layout-panel` / `demo-final` scenes; the user wanted the
   hover affordance back, off only while the stack is selected. Moved the
   `canvas-content--no-outline` class from `stackSelectable` to `stackSelected`.

## Successes

- The stack's selection ring is a visible 1px inset overlay — on the stack,
  never on the white canvas.
- The canvas hover outline works normally and switches off only while the
  stack is selected (verified: 1px outline when idle, 0 when selected).
- Build clean — 270.84 KB JS / 41.23 KB CSS (82.20 / 7.59 KB gzipped).

## What's Next

- Nothing outstanding on the stack-selection visuals.
