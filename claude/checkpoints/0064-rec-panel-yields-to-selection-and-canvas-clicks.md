# 0064 — Recommendation panel yields to selection + canvas clicks

## Context

After the recommendation panel + Disabled Recommendations flow
landed (0063), two interactions still felt sticky:

1. Selecting something on the canvas (shape / text / stack / free
   element) while the recommendation panel was showing didn't
   surface the matching properties panel — the recommendation
   panel kept holding the slot, so the user couldn't tweak what
   they'd just picked without first closing the editor.
2. Tapping on the empty canvas or the gray workspace surround
   while on the recommendation panel kept the recommendation
   panel showing instead of falling back to Insert.

## What changed

- **RightSidebar yields to selection**: in the `editorOpen &&
  issues === 0` branch, derive `somethingSelected` from
  `selectedShapeEl || selectedTextEl || stackSelected ||
  selectedEl !== null`. If true, fall through to the normal
  selection panels (PropsPanel for stack/shape/text; Insert for
  free elements). If false, render the recommendation panel as
  before. `selectedEl` is a new prop on RightSidebar — wired in
  from App.
- **EditorPanel branch wrapped in `else`** so issue > 0 cases
  still short-circuit and keep precedence.
- **`closeRecPanelIfShowing` in App**: fires from `selectFrame`,
  `selectCanvas`, `deselect`. When the editor is open with no
  remaining issues (i.e., the recommendation panel is the active
  view), tapping the white frame, the canvas-content area, or
  the gray surround now closes the editor too. EditorPanel (with
  active issues) is untouched.

## Human directions

- "ok now when i am on the recommendation panel, when i go to
  click on anything like the stack, vector, text, or element,
  the panel stays on the recommendation rather than changing it
  to the desinated panel"
- "ok yes it getting there. just now if they click on the canvas
  or workspace, it should just go back to the insert panel"

## Resistance / rebuilds

- None — both changes are small and localized.

## Successes

- Clicking a canvas item while the recommendation panel is up
  immediately surfaces the right-side panel for that item.
- Clicking off everything sends the right sidebar back to Insert.
- The fix-issues workflow (EditorPanel with issues > 0) stays
  unchanged.
- `npm run build` green.
