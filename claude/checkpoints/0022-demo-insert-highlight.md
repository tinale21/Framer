# Checkpoint 0022 — Demo Step: Insert Section Highlight

**Date:** 2026-05-19
**Commit:** After the stack is drawn, advance to a spotlit Insert section with Text/Vector/Element pulsing

## Context

CP21 built the click-drag-to-draw-a-stack interaction (`demo-2`). The flow stopped after the stack was placed. Tina supplied a reference (Demo 5) for the next step: once the user makes the stack, the focus shifts to the right-sidebar Insert panel — it lifts above the workspace tint as a white card, and the Text / Vector / Element tiles pulse a blue ring to direct the user to add those *inside* the stack. (Content SVGs for text/vector/element to come later.)

## Human Directions

- "Once users make the stack, the next highlight should be the Insert section with Text/Vector/Element pulsing" + Demo 5 reference → on `demo-2` placement, advance to `demo-5-insert-highlighted`; tint the workspace; spotlight the Insert section; pulse-ring the three tiles
- "When it moves to that section, don't move the stack — keep it where the user made it" → `demo-5` now renders the user's drawn stack at its drawn rect instead of the fixed `.stack-frame`
- "Make the Text/Vector/Element pulse the same as the stacks and canvas" → matched the Stack button's ring
- "Decrease pulse by 0.5" ×2 → ring now `0.5px ↔ 1px`
- "Decrease corner rounding by 1px for the insert highlight" → `.insert-section--demo` radius `12 → 11px`

## Records of Resistance

1. **`demo-5` was already a scene** with old behavior — it dimmed the insert-list via `opacity: 0.55` and gave Text/Vector/Element a plain blue border (`highlightTriple`). Repurposed it: removed the opacity dim, removed `demo-5` from `CHROME_DIMMED`/`CANVAS_DIMMED` (the workspace tint handles dimming now, and double-dimming would wash everything out), and turned the tile highlight into a pulsing ring.
2. **The Insert section needed to poke through the tint** as one unit. Wrapped the "Insert" label + tile list in `.insert-section`, which is `display: contents` normally (zero layout impact) and switches to a `display: flex` white card with `z-index: 50` when `--demo`. Same trick as the grid popout veil — `display: contents` means the wrapper is invisible until the demo needs it.
3. **The stack jumped position on the demo-2 → demo-5 transition.** `demo-2` draws `.demo-stack` at the user's `demoRect`; `demo-5`'s `CanvasContent` rendered a *fixed* `.stack-frame`. Tina caught it. Fix: `demoRect` lives in Canvas state and survives the scene change (Canvas never unmounts; only `demoPhase` is reset by the adjust-on-render guard, not `demoRect`). `demo-5` now renders the same `.demo-stack` at `demoRect`, so the stack holds exactly where it was drawn. The fixed `.stack-frame` stays as a fallback when `demoRect.w === 0`.
4. **Pulse-value drift.** The Stack ring (1.5↔2px) and canvas ring (1.5↔2.5px) had quietly diverged from earlier −0.5 tweaks. Flagged this to Tina rather than silently picking one; matched the insert tiles to the Stack (closest analog — a tile/button), then took two more −0.5 passes down to 0.5↔1px.

## Successes

- Full demo chain now: Grid → Stack → Using Stacks modal → Practice Demo → spotlit Stack → click → spotlit canvas → draw the stack → **spotlit Insert section** with Text/Vector/Element pulsing
- `demo-2` placement auto-advances to `demo-5` after a 650ms beat (timer cleaned up on unmount/scene change)
- The drawn stack stays put across the transition — no snap
- Insert section lifts above the tint as a white card (radius 11px); Text/Vector/Element pulse a 0.5↔1px blue ring on a 2s loop; Base/Grid/Component sit normal in the card
- Build clean — 252 KB JS / 33 KB CSS (76.8 / 6.3 KB gzipped)

## What's Next

- Tina will supply SVGs for the text/vector/element content that gets added inside the stack — the next demo step
- The stack-position-preservation currently only applies to `demo-5`; `demo-6`/`demo-7`/`demo-8` still use the fixed `.stack-frame` (would jump again if the flow continues there)
- `demo-3-drawing-frame` scene still orphaned; `public/vector-popup.svg` still unreferenced
