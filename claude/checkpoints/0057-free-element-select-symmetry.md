# 0057 — Free-element select/deselect symmetry

## Context

0056 added `setSelectedEl(null)` to `selectFrame` and `selectCanvas` so
clicking on the white frame card would drop the resize handles on a torn
3D shape. That fixed click-out on the frame card but introduced two
new problems:

1. Clicking the shape itself no longer re-selected it. The shape's
   mouseup correctly called `onSelectEl(key)`, but the click event then
   bubbled from `.demo-element` to `canvas-content`, which called
   `selectCanvas` and immediately set `selectedEl` back to null.
2. Clicking on the gray surround outside the frame card didn't drop
   the handles. That path runs through `handleSurroundClick →
   onDeselect → App.deselect`, which still wasn't clearing `selectedEl`.

## What changed

- **Canvas.tsx**: added `onClick={e => e.stopPropagation()}` to the
  `.demo-element` div. Mousedown was already stopping propagation but
  click events are a separate phase. Now the canvas-content click
  handler never sees a click that originated on a free element, so the
  mouseup's `onSelectEl(key)` isn't overridden.
- **App.tsx**: added `setSelectedEl(null)` to `deselect` so the
  gray-surround click path also clears the free-element selection,
  matching the frame-card behavior.

## Human directions

- "ok wait the circle size adjuster should reappear once i click on
  that shape still though"
- "ok the circle size adjust should also disappear when i click outside
  anywhere on the workshape. and then reappear when i click on the shape"

## Resistance / rebuilds

- 0056 deselected on frame-card click but broke shape-click re-select
  (click bubbling). One-line stopPropagation fixed it.
- Gray-surround deselect needed the matching `setSelectedEl(null)`
  added to `deselect`; the three helpers (`selectFrame`, `selectCanvas`,
  `deselect`) now have parallel behavior for free elements.

## Successes

- Click on the shape → handles appear.
- Click on the frame card or the gray surround → handles disappear.
- tsc clean.
