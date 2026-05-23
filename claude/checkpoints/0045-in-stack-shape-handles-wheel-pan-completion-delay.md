# Checkpoint 0045 — In-Stack Shape Handles, Wheel Pan, Completion Delay

**Date:** 2026-05-23
**Commit:** show the selection ring + resize handles on in-stack vectors,
pan the workspace with a two-finger trackpad scroll (or mouse wheel),
and shorten the stack-demo completion delay from 3s to 2s

## Context

Small follow-up batch after the larger resize / undo / pan landing.
First, an in-stack vector that the user clicked wasn't showing its
selection box because the stack render only set a class but never
mounted the `.vec-shape__select` overlay — fixed by mirroring the free
render (ring + four corner handles for non-path kinds) and giving
`.demo-stack__shape` an explicit `position: relative` so the absolute
overlay anchors to the shape's box rather than escaping to the column.
Second, two-finger trackpad scroll (and a plain mouse wheel) now pans
the workspace via `wheel` event with `passive: false`; Cmd / Ctrl +
wheel still zooms. Third, the demo's auto-advance from the layout
panel to the completed modal was shortened from 3s to 2s so the demo
doesn't drag.

## Human Directions

- "When I click on a vector within the stack, why is the selection box
  not showing?" → in-stack shapes weren't rendering the
  `vec-shape__select` overlay; added it (plus handles) and gave
  `.demo-stack__shape` a positioning context.
- "For the pan can it also work if users were just to scroll on their
  trackpad?" → added a wheel listener that pans on plain scroll and
  zooms on Cmd / Ctrl + wheel.
- "No let's revert that. It should work like Figma and Framer." →
  reverted the wheel pan momentarily.
- "I want a two-finger scroll as well." → re-added the wheel pan with
  the same direction as drag-pan (`offset -= delta`); HMR needs a hard
  refresh to swap the listener bound by the empty-deps useEffect.
- "Make the delay for the stack demo completion 2s." → changed the
  setTimeout in App from 3000 → 2000.

## Records of Resistance

1. **In-stack shape resize anchoring x/y.** The handle's `startResize`
   passes the shape's `s.x, s.y` for the initial bbox. While the shape
   is in-stack, `x`/`y` aren't used for layout (flex positions it), so
   modifying them only matters when the shape is later popped back out
   — accepted.
2. **HMR doesn't rebind the wheel handler.** The `useEffect` deps are
   `[]`, so an HMR swap keeps the old listener attached. Cmd+Shift+R
   solves it; called this out in the chat so the next person doesn't
   chase a phantom dead-handler.

## Successes

- In-stack vector click now draws the same blue selection ring and the
  four interactive corner handles as the free render; clicking off
  restores the Insert panel through the deselect path.
- Wheel pan verified by Playwright: `wheel(0, 100)` → frame moved
  (0, -100); `wheel(80, 0)` → frame moved (-80, 0). Cmd + wheel still
  zooms; Space + drag and middle-mouse pan still work.
- Demo completion modal now fires 2s after the first layout edit.
- tsc + build clean — 315.71 kB JS / 93.76 kB gzipped.

## What's Next

- The in-stack resize doesn't re-anchor the popped position when the
  user later drags the shape out of the stack; consider centering on
  the original drop spot if this surfaces.
- Wheel pan could use a small momentum / inertia pass to better match
  Figma's feel, plus a clamp so users can't fling the canvas off-screen.
