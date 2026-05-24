# 0072 — Practice demo "add another" prompt between drops

## Context

After 0070 made vector/text work in the practice demo, the user
wanted a between-drops prompt: once they've dragged ONE item into
the stack, the Insert section should highlight + the "Add several
elements into the stack." callout should reappear — without the
full-canvas dimming tint (different from the initial demo-5).
Then iterations on top:
- Stop showing the prompt once 2 items are in the stack.
- Don't pulse/pop on the second showing (callout + outline only,
  no animation).

## What changed

- App derives `promptInsertAgain`: true when
  `scene === 'demo-6-place-element'` AND exactly one item is in
  the stack AND nothing is currently free on the canvas.
- Threaded through `RightSidebar` → `InsertPanel` as a prop.
- `highlightTriple` (InsertPanel) is now
  `scene === 'demo-5-insert-highlighted' || promptInsertAgain`,
  so the blue outline on Text / Vector / Element tiles + the
  "Add several elements into the stack." callout both surface
  between drops without the demo-5 dimming tint.
- New `insert-section--demo-quiet` class applied when
  `promptInsertAgain` is true. CSS strips the drop-shadow and
  disables the `insert-tile-pulse` animation. Same blue outline
  + callout, no pop.

## Human directions

- "ok can you make it so that on the practice demo for stacks
  when users have drag one element/vector/text into the stack,
  the callout appears next to the insert panel telling users to
  add another element into the stack with the blue outline
  around text, vector, and element. this time don't have the
  spotlight"
- "ok once it has two in the stack, you don't have to keep
  showing the add several element into the stack callout. also
  for the second time it shows, can you not have it pop up
  (just have the callout and blue outlines)"

## Resistance / rebuilds

- One-pass implementation, no rebuilds.

## Successes

- Between drops the user sees a quieter version of the Insert
  highlight — callout + blue outlines, no tint, no pulse.
- Prompt stops once stack has 2+ items so the layout-prompt step
  can take over.
- `npm run build` green.
