# Checkpoint 0023 — Insert Section Callout

**Date:** 2026-05-19
**Commit:** Callout for the demo-5 Insert highlight — side-positioned, hides on tile hover

## Context

CP22 spotlit the Insert section as `demo-5`. This pass adds the guiding callout for that step, with iteration on copy, placement, sizing, and a hover-to-dismiss behavior.

## Human Directions

- "Have a callout that tells users to add several elements into the stack" → added `.insert-demo-callout` — "Add several elements into the stack." to the left of the Insert card with a right-pointing arrow
- "Place it higher, aligned with the Insert label; widen to 2 lines" → moved up, width 170 → 200px
- "Put it on the bottom of the highlight" → repositioned below the card, arrow flipped to point up
- "Make the text size match the other callouts" → the three callouts render at different parent scales (grid popout 0.9×, frame-card 0.765×, Insert section unscaled). Measured: grid 13px → ~11.7px on screen, canvas 16px → ~12.2px. Set the unscaled Insert callout to 12px so it lands at ~12px on screen — matching.
- "Decrease horizontally, keep 2 lines" → width → 160px
- "Have '...the stack' on the second line; move to the side next to Vector; hide on hover of Text/Vector/Element" → back to side placement (`right: calc(100% + 14px)`, `top: 262px` ≈ Vector tile center), width 184px so the wrap is "Add several elements into / the stack."
- "Hide it when hovering any item in the Insert section" → broadened the hover selector from `.insert-tile--highlighted:hover` to `.insert-tile:hover`

## Records of Resistance

1. **Callout placement bounced around** (left → bottom → left-at-Vector). Each move flips the CSS arrow direction (`border-left-color` for a right-pointing arrow vs `border-bottom-color` for an up-pointing one) and the anchor (`right`/`top` vs `top`/`left`). Settled on left side, vertically anchored to the Vector tile via a hardcoded `top: 262px` — computed from the card's padding + label + tile stack (each `.insert-tile` ≈ 54px incl. border, gap 8px). Hardcoded because the layout is fixed during the demo; a measured anchor would need the strict-lint-unfriendly measure-then-setState.
2. **Callout text size looked off vs the other callouts** — root cause was the parent transform scale, not the font-size. The grid/canvas callouts live inside scaled containers so their CSS px ≠ on-screen px. Flagged this to Tina and set the Insert callout (unscaled) to 12px to match the others' ~12px rendered size, rather than copying a CSS value that would render larger.
3. **Hover-to-dismiss done in pure CSS** via `:has()` — `.insert-section--demo:has(.insert-tile:hover) .insert-demo-callout { opacity: 0 }`. No JS state needed; `:has()` is well-supported and Vite doesn't touch selectors. A 0.15s opacity transition keeps the dismiss smooth.
4. **Smart-animate request scoped, not built.** Tina asked about morphing the highlight between demo steps (Stack → canvas → Insert). Gave an honest assessment: a true gliding shared-element transition is a real rebuild (one floating highlight element, per-scene rect measurement, reconciling three different highlight treatments) — and flagged the cross-fade middle ground as the cheap 80%-of-the-feel option. Tina deferred the decision; nothing built for it yet.

## Successes

- `demo-5` Insert highlight now has a guiding callout: "Add several elements into the stack." — left side, arrow at the Vector tile, 184px so "the stack." lands on line 2
- Callout fades out (opacity, 0.15s) whenever any Insert tile is hovered — gets out of the way as the user acts
- Text sized to visually match the grid and canvas callouts despite the different parent scales
- Build clean — 252 KB JS / 33.5 KB CSS (76.8 / 6.3 KB gzipped)

## What's Next

- Smart-animate / cross-fade between highlight steps — deferred, Tina to decide
- Still pending: SVGs for the text/vector/element content added inside the stack
- `demo-3-drawing-frame` orphaned; `public/vector-popup.svg` unreferenced
