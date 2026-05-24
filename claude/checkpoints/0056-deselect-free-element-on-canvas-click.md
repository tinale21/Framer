# 0056 — Deselect free elements on canvas/frame click

## Context

Torn-off shapes from the 3D Shapes recommendation component carry the
same free-element selection state as any other free DemoEl — including
the four corner resize handles that appear when `selectedEl === el.key`.

After torn a shape, clicking out on the white frame card or the gray
surround left the resize handles still drawn on the torn shape. The
deselect helpers `selectFrame` and `selectCanvas` cleared `selectedShape`
(vectors) but never `selectedEl` (free elements / texts on the canvas),
so the handles stuck around until something else cleared the selection.

## What changed

Added `setSelectedEl(null)` to both `selectFrame` and `selectCanvas` in
App. Now any click-out path that goes through either of those helpers
(white-card click, gray-surround click) collapses the free-element
selection too, hiding the resize handles.

## Human directions

- "can you make sure that when i click out, the circle size adjuster on
  it goes away: [screenshot of torn shape with handles still showing]"

## Resistance / rebuilds

- One-line fix, no rebuilds.

## Successes

- Free elements (torn 3D shapes and any other DemoEl) now lose handles
  on any click-out, matching the existing shape/text deselect behavior.
- tsc clean.
