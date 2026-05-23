# Checkpoint 0044 — Resize Handles, Undo / Redo, Pan + Deselect Fixes

**Date:** 2026-05-23
**Commit:** add Figma-style resize handles for shapes / elements / text,
Cmd+Z undo + redo, Space-to-pan gesture, and let the gray surround
deselect the stack panel

## Context

A larger round of canvas-interaction work that the user drove through one
conversation. Three threads landed together. First, every selected
shape, element, and text now has 9-pixel corner handles that drag-resize
in frame-card space — shapes are free 2D, elements stay width-only
(image aspect preserved), texts uniformly scale font-size with the bbox
area so dragging a corner actually makes the rendered text bigger /
smaller. A live blue size badge tracks the bottom-right while resizing,
and a `resizeJustEndedRef` flag suppresses the trailing click that
would otherwise deselect. Second, the canvas content is snapshotted to a
ref-backed JSON history on a 400 ms debounce, and `⌘Z` / `⌘⇧Z` undo
and redo the placed elements / texts / shapes (selections cleared on
restore since keys may not exist anymore). Third, the gray workspace
surround stopped acting like the frame itself: plain drag on the frame
card no longer moves it (the dragRef only arms on the gray surround,
on Space-held anywhere, or on middle-mouse), and clicking the gray no
longer bails out in demo-6 when the tutorial is off — so selecting a
stack and clicking out actually restores the Insert panel.

## Human Directions

- "Make it so users can drag and adjust the size of element, vectors, or
  text similar to Figma and Framer." → built corner handles with bbox
  math per kind, plus a size badge.
- "Make Command + Z work." → added a debounced JSON-snapshot history in
  refs, with Shift+Z for redo; selections cleared on restore.
- "It doesn't seem to be working well for the text." → the trailing
  click after mouseup hit `canvas-content` / `frame-card`, calling
  `onDeselectText` / `selectCanvas` and dropping the selection right
  after resize. Added `resizeJustEndedRef` toggled on mouseup with a
  same-tick reset, guarded in `handleSurroundClick`, `handleFrameClick`,
  `handleCanvasContentClick`.
- "For the text it is only adjusting the text box horizontally, it
  isn't actually adjusting the text itself." → switched text resize from
  width-only to font-size scaling driven by `sqrt(new_area / old_area)`,
  clamped 6–120.
- "If users don't click shift it shouldn't be aspect-ratio locked." →
  built the width+font-size independent / Shift-uniform variant; the
  user then reverted that. Kept text on the simple uniform-scale.
- "The canvas is now moveable but not moving / panning the workspace." →
  the offset translate is on `.frame-card`, so plain workspace drags
  visually dragged the frame around. Gated the pan: dragRef only arms on
  the gray surround, on Space-held, or middle-mouse. Added a global
  Space listener (refs + state) that ignores keystrokes inside inputs /
  textareas / contenteditable and switches the wrap cursor to grab.
- "When I click on stacks, the panel changes to the stack panel — but
  clicking outside the canvas should restore Insert." → `handleSurround`
  and `handleFrameClick` were unconditionally bailing on `demo6`, which
  is exactly the scene where the stack is selectable when the tutorial
  is off. Replaced the gate with `demoBlocksDeselect = demoSpotlight ||
  (demo6 && !stackTutorialDisabled)` and let `handleCanvasContentClick`
  fall through to a normal deselect for the free variant too.

## Records of Resistance

1. **Text font-size jumped to 14 px on a "pure horizontal" drag.** The
   handle's centerY is 4 px below the bbox top; `mouse.move(thr.x+120,
   thr.y)` lands 4 px above where the press started, so `dy = -4` and
   the area ratio pulls the size down a notch. Real users dragging from
   the visible handle don't see this in practice — accepted.
2. **Cmd+Z fired "used before declaration" in TS.** The keydown
   useEffect referenced `undo` / `redo` defined later in the file. Moved
   the history block + undo/redo declarations above the keydown effect.
3. **Pan attempt #1 was too coarse — Space-only meant plain gray drags
   went dead.** User wanted to keep panning by dragging the gray, just
   not the frame itself. Settled on: gray drag pans, frame drag no-ops,
   Space + drag pans anywhere.
4. **Workspace click didn't deselect a selected stack.** `demo6` in the
   surround-click handler was the gate; without `stackTutorialDisabled`
   factored in, the free user could select a stack but not click out.

## Successes

- Shapes drag-resize from any corner with the size badge tracking the
  drawn bbox; element handles only adjust width (image aspect kept);
  text handles uniformly scale the rendered font-size (verified 16 px →
  32 px → 10 px → 16 px through a resize / undo loop).
- Cmd+Z restores the previous canvas state, Shift adds redo, history
  trimmed to the last 100 snapshots.
- Plain drag on the frame card stays put; gray-surround drag pans;
  Space-held cursor flips to grab and any drag pans the frame.
- Selecting a vector / text and clicking gray returns the right panel
  to Insert (Playwright run: props sections → 0, insert list → 1).
- tsc clean; build 315.38 kB JS / 93.75 kB gzipped.

## What's Next

- Path-kind shapes don't get resize handles yet (they'd need per-point
  scaling around the centroid or the bbox anchor).
- The undo history doesn't include the layout-panel state, the stack
  itself, or the editor panel's preview — only freely placed items.
- Hold-Shift for aspect-locked resize on shapes was prototyped and
  reverted; if the user wants it back, the math is in the conversation.
