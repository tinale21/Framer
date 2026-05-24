# 0066 — Rec-panel yield rules, tear-end click guard, auto-select drops

## Context

A run of polish on the recommendation flow. Five threads:

1. After 0064–0065 made the rec panel yield to canvas selections,
   selecting a recommendation component (or one of its torn-off
   shapes) shouldn't take the panel away — the user is still working
   with the recommendation. The panel should yield only when stack /
   shape / text gets selected.
2. Dragging a shape out of a recommendation component was switching
   the right panel to Insert mid-drag. The mousedown started on the
   cell but the mouseup ended on canvas-content, firing a synthetic
   click → `selectCanvas` → `closeRec` → editor closed.
3. The Text Editor recommendation drops a placeholder "text" string.
   The grammar/spelling scanners flagged it immediately, which
   isn't what we want for the placeholder, but we DO want the
   scanner to engage once the user replaces it.
4. All recommendation components should land on the canvas already
   selected so the user can immediately move/resize without an
   extra click.
5. The cells inside Text Editor + Unique Shapes + 3D Shapes should
   require an explicit select-then-drag gesture, matching how
   selection works elsewhere — first click selects the row/cell
   (purple outline + corner handles), second mousedown enters the
   existing tap-or-drag handler.

## What changed

### Rec panel yield rules (RightSidebar)
- `propsClaim` is now just `selectedShapeEl || selectedTextEl ||
  stackSelected`. Free-element selections (rec components AND torn
  shapes) don't trigger the yield, so the rec panel keeps the slot
  while the user works with what they just dropped.
- Removed the per-instance `selectedElIsRecComponent` plumbing —
  no longer needed once we treat all free elements the same way.

### Tear-end click guard (Canvas)
- New `tearJustEndedRef` (mirrors `resizeJustEndedRef` /
  `vecDrewRef`). Both `handleComponentShapeMouseDown` and
  `handleTextListItemMouseDown` register a one-shot `mouseup`
  listener on drag-out start that flips the ref on, then schedules
  a `setTimeout(0)` reset.
- `handleCanvasContentClick`, `handleFrameClick`, and
  `handleSurroundClick` all early-return when the ref is set, so
  the synthetic click that follows the drag-out mouseup can't reach
  `selectCanvas` / `selectFrame` / `deselect` and close the editor.

### Placeholder scan skip (App)
- The bullet-skip in the issue scanner is now `t.bullet &&
  t.text === 'text'`. Only the untouched placeholder is exempt;
  any actual user content goes through spelling + grammar.

### Auto-select on drop (App.applyRecommendation)
- `setSelectedEl(key)` for the 3D Shapes / Triangles / Text Editor
  component DemoEls.
- `setSelectedText(tkey)` for the Milk text-effect TextEl that the
  Advanced Text Effects card drops directly.
- So every recommendation lands with its selection handles ready.

### Triangle pack scaled down
- `recommendation-triangles` width 360 → 280, matching the
  density of the other component drops.

### Select-then-drag on cells (Canvas)
- `handleComponentShapeMouseDown` (3D Shapes + Triangles) and
  `handleTextListItemMouseDown` (Text Editor) now check
  `selectedCellId !== `${compKey}:${cellId}`` first. If the cell
  isn't selected, mousedown just selects it and returns. Only a
  mousedown on the already-selected cell runs the existing
  tap-or-drag two-phase logic that tears off a copy.

## Human directions

- "ok can you not make the panel change when users are just
  clicking on the component"
- "ok but now when i click on like the canvas or workspace it
  doesn't go back to the insert panel"
- "it is occuring for the Unique Shapes when i drag one of the
  shapes out"
- "no look at what's happening when i drag a shape out of the
  Unique Shapes component. when drag it out or still having it
  selected, it should still have the recommendation panel until i
  click on something else: [video]"
- "it is still occuring when i drag a shape out of the unique
  shape componment it automatically switches to the insert panel
  rather than staying on the recommendation panel"
- "ok it works. can you scale the unique shapes a bit down"
- "ok now for the Text Editor recommendation can you not make the
  spell checker apply to that one"
- "when the text editor recommendation drops in, can you make
  sure it selected with the circle size adjustor on first so users
  can move the component around easily. also yes the spell
  checker doesn't work for the 'Text' word on the Text Editor
  component, that is correct however i want it when users then
  go in and change the text to their own text, the spell checker
  works"
- "for the Text Editor component, make it so users have to click
  one of the text groups so it is select and then can drag it out"
- "can you do the same for the Unique Shapes component where it
  has to be selected before being able to drag out"
- "can you also make sure these component drop like the Text
  Editor where it is droped with the select circle size adjustor
  so users can move it around easily when it first in their
  canvas"
- "ok looking good but make sure that the Advanced Text Effect
  component also drops with the circle size adjust selection
  first"

## Resistance / rebuilds

- The "rec panel doesn't go back to insert on canvas click" bug
  turned out to be the synthetic click from drag-end, not a
  yielding-rule bug. Wasted a round of refactors trying to scope
  yielding to rec-components vs torn shapes before realizing the
  drag-end mouseup was firing a `selectCanvas`. Reverted that
  refactor (removed `selectedEl` + `selectedElIsRecComponent`
  plumbing from RightSidebar) and added `tearJustEndedRef`
  instead, which is the actual root cause.

## Successes

- Drop any component → it lands selected and ready to drag.
- Drag a shape/row out → torn copy lands, rec panel stays. A
  real subsequent canvas/workspace click closes the editor
  cleanly.
- Cell select-then-drag matches how the rest of the canvas
  selection model works.
- Placeholder text doesn't trip the scanner; user-typed text
  does.
- `npm run build` green.
