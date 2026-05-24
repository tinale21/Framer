# 0061 — Text Editor dropdown component + spelling-preview wash

## Context

Two threads landed together in this checkpoint:

1. **Text Editor recommendation.** The third recommendation card
   ("Text Editor") had no behavior. User wanted clicking it to drop
   a dropdown widget where each row could be torn off as an editable
   bulleted text element — same Figma-instance feel as 3D Shapes
   and Unique Shapes, but the torn copies need to be _editable text_,
   not static SVG images.

2. **Spelling-preview visibility.** Clicking a spelling suggestion
   in the Editor was replacing the text on the canvas correctly, but
   the visual change was too easy to miss — the red issue wash
   disappeared the moment a preview was active, so a single-character
   fix like "wronng" → "wrong" looked nearly identical to the
   original. User reported it as "preview isn't showing the user it".

## What changed

### Text Editor dropdown
- `public/recs/list.svg` first wired through the existing
  ComponentSvg path (with a 140px width override). That worked but
  treated each path as a separate tear unit and the torn copies
  weren't editable, so the asset was deleted.
- Switched to a React widget: `RecommendationPanel` now passes
  sentinel asset `'text-list'`, `App.applyRecommendation` branches
  on it and drops a DemoEl with `id: 'recommendation-textlist'`
  (no `src`).
- `TrianglesGrid`-shaped sibling `TextListDropdown` renders four
  rows; each row is a flex `<div>` with the bullet-list icon
  (`ListBulletIcon`, paths lifted from the source list.svg) and
  the label "text".
- `App.tearTextListItem(x, y, rowId)`: creates a new `TextEl`
  with `bullet: true, text: 'text'`, registers the row id in
  `extractedPatterns` so the source row hides, returns the new
  text's key.
- `Canvas.handleTextListItemMouseDown`: mirrors the shape handler's
  two-phase gesture — tap selects (purple handles + outline), drag
  past threshold tears off via `tearTextListItem`, primes
  `textGrabRef`, and sets `setDraggingTextKey` so the existing
  text-drag system takes over without a stutter.
- `TextEl.bullet?: boolean` added to `types.ts`. Free-text render
  prefixes `ListBulletIcon` and adds `text-el--bullet` class which
  switches the wrapper to `display: inline-flex` (so it shrinks
  to fit the bullet + label instead of taking the flex container's
  default block width and leaving dead space on the right). The
  existing `EditableText` contentEditable + double-click-to-edit
  flow works unchanged on the label.

### Spelling-preview wash
- `RunHighlight` (textRuns) gains optional `preview?: boolean`;
  `renderRuns` uses class `text-run--preview` (green) instead of
  `text-run--issue` (red) when set.
- `App.highlightedIssue` no longer goes null during a spelling /
  grammar preview — instead it switches to a preview-range
  highlight covering `offset → offset + suggestion.length`, so
  the suggested word gets a green wash on the canvas. Contrast
  previews still drop the wash so the swapped color reads
  cleanly.
- `.text-run--preview` CSS — translucent green, same shape as
  the red issue wash.

## Human directions

- "ok now for the text recommendation, if users click on text editor
  this should pop up on their canvas: …/list.svg"
- "can you scale it down a bit more"
- "can you also make it so that users can drag out dropdown + text
  group out. can you also make it so users can click on text and
  edit the text"
- "that looks great. can there not be that extra spacing on the
  right of the text though"
- "for the spelling error suggestions, the suggestion preview isn't
  showing the user it"

## Resistance / rebuilds

- list.svg approach went through three iterations: first the SVG
  parsed via ComponentSvg's data-tear-id path with each `<path>`
  as a tear unit; user wanted dropdown + text together; pivoted to
  the React widget which made the editability work too.
- Spelling preview took a while to diagnose — the splice was
  actually replacing the text correctly, but visually a one-char
  swap inside a long word is nearly invisible. Asked the user to
  clarify ("canvas text doesn't change at all") then added the
  green wash so the change is obvious regardless of how subtle
  the actual character delta is.

## Successes

- Drop Text Editor → 4 bulleted rows; tap any row to see purple
  selection handles in place; drag any row to spawn a draggable,
  double-click-to-edit "• text" element.
- Click a spelling suggestion → suggested word now reads with a
  green wash so the user can immediately see what changed.
- `npm run build` green.
