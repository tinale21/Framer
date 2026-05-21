# Checkpoint 0036 — Select and Delete the Stack

**Date:** 2026-05-21
**Commit:** let the demo stack be selected and deleted with the keyboard, and
fix a regression where that broke selecting an element inside the stack

## Context

Follows the Grid / layout-panel work in 0035. A small interaction: the demo
stack should behave like a real design-tool object — selectable, deletable.

## Human Directions

- "If users select the stack and press Delete, it deletes it" → in the
  layout-panel step, clicking the stack background selects it (blue outline);
  Delete / Backspace removes it and returns the canvas to the empty editor.
- "When I select an element in the stack, it doesn't let me" → reported right
  after the above shipped; selecting an element had broken (see below).

## Records of Resistance

1. **The stack's click handler stole element selection.** A pressed element is
   hidden during its drag; it used `visibility: hidden`, which also drops
   pointer events — so on release the `click` event retargeted from the element
   to the stack background, and the new stack-select handler ran instead of the
   element's. Fixed by hiding with `opacity: 0`, which keeps pointer events so
   the click stays on the element and its `stopPropagation` holds.
2. **The stack is only selectable once the demo spotlight clears.** The tint
   sits above the canvas (z-index 40) and intercepts clicks. This is the
   existing spotlight design — the canvas is dim/inert until a layout control
   is used — so it was left as-is rather than punched through.

## Successes

- Clicking the stack selects it; Delete clears the canvas back to `base`.
- Selecting an element vs. the whole stack is now unambiguous — one is always
  the single delete target, and choosing one clears the other.
- Build clean — 270.31 KB JS / 40.75 KB CSS (82.02 / 7.47 KB gzipped).

## What's Next

- Stack selection is wired only in the layout-panel step (`demo-7-layout-panel`).
- Deleting the stack resets the scene to `base`; `layoutOpts` is not reset.
