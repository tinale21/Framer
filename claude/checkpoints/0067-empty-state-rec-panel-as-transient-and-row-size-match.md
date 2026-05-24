# 0067 — "No errors detected" empty state, rec panel as transient celebration, row-size match

## Context

Two cleanups:

1. The recommendation panel was acting as a persistent post-fix view —
   it'd reshow on every editor reopen as long as `recommendationKinds`
   was populated. User wants it to be a one-shot celebration that only
   appears the moment they finish fixing; reopening the editor with no
   errors should show a blank empty state.
2. Tearing a row from the Text Editor dropdown landed a noticeably
   bigger text element than the source row, because the new TextEl
   inherited the default `.text-el__static` typography (16 / 500)
   instead of the source `.demo-element__text-list` row's
   (13 / 400 / 1.2).

## What changed

### Rec panel transient gate
- New `showRecPanel` state in App.
- The existing `>0 → 0` useEffect now also calls
  `setShowRecPanel(true)` (alongside the selection-clearing).
- A small `useEffect([editorOpen])` flips it back off whenever
  `editorOpen` goes false — catches every close path (X, toggle,
  canvas-click → closeRec, Dismiss → close) in one place.
- RightSidebar gates the panel on `showRecPanel &&
  recommendationKinds.size > 0`; otherwise renders the blank
  "No errors detected" empty state (already wired in 0066).

### Empty state markup (already landed in 0066, re-anchored here)
- Custom mini-aside with the standard Editor header (title + ×) and
  a centered `.editor-panel__no-errors` body. Color `#888`, 13px.

### Torn row typography
- `tearTextListItem` now sets `size: 13`, `weight: 400`,
  `lineHeight: 1.2` on the new TextEl so it matches the source row's
  visible scale.

## Human directions

- "ok now when there is no error, the recommendation panel should
  not show up. if there is no error detect and the users clicks on
  the icon on the toolbar, make the panel that shows up blank with
  the text 'No errors detected' in gray in the middle"
- "ok it works the first time but then it doesn't after even i
  apply all suggestions: [video]"
- "for the Text Editor component, what drags out seems to be
  bigger. are they the same?"

## Resistance / rebuilds

- First attempt at the empty state gated on
  `recommendationKinds.size > 0`, which would still re-show the
  rec panel on reopen because the set persists until a new 0→>0
  transition. Switched to the explicit `showRecPanel` flag so
  the panel is truly transient.

## Successes

- Rec panel appears only as the apply celebration; reopening the
  editor afterward with no errors lands on the empty state.
- Torn dropdown rows match the source row's size.
- `npm run build` green.
