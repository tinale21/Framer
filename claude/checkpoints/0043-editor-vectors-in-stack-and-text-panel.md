# Checkpoint 0043 — Editor Panel, Vectors-in-Stack, Text Panel + Typography

**Date:** 2026-05-23
**Commit:** add an accessibility Editor panel with live preview and apply,
let vectors join stacks, and route text selection to a "Text" panel with a
Figma-style Typography editor + working Fill color

## Context

Three threads landed in one push. First, an accessibility checker: a new
bottom-toolbar icon with a live issue count opens a right-panel Editor that
lists failing fill-contrast checks, previews each suggested fix on the
canvas, and applies the chosen color from a transformed toolbar prompt.
Second, vectors became stack-aware — they can be dragged into the stack,
flow with its layout, drag back out, and get cleared with the stack on
delete. Third, clicking a text now opens the same right-panel as Shape (now
titled per-kind: "Text" / "Vector" / "Stack") with a full Typography
editor — font, weight, size with preset dropdown, line height + letter
spacing with icons, alignment buttons — plus an interactive Fill row that
edits the text color through the same color picker.

## Human Directions

- "Have a bottom icon that shows when there are color-contrast / font-size
  issues with a notification badge → opens a right panel listing them with
  suggested fixes; clicking a fix previews on the canvas and the toolbar
  flips to an Apply prompt." → built the Editor panel, the bottom-toolbar
  badge, preview / apply flow, and the Viewing-Suggested-Changes toolbar.
- "Use this magnifying-glass icon (Group 1460.svg), not the megaphone." →
  swapped in the supplied SVG, kept the dynamic blue badge.
- "Make vectors work within stacks." → added `inStack` to `VectorEl`,
  drag-into-stack + drag-out-of-stack mirror element/text behavior, in-stack
  shapes render as SVG inside the column, and the delete-stack flow
  filters out in-stack shapes.
- "Clicking a text shows the same panel as Shape, retitled 'Text', with a
  Typography section." → routed text selection through PropsPanel, added a
  full Typography editor.
- "Title should be 'Vector' / 'Text' / 'Stack' per selection." → done.
- "Fill row should also work for text color." → reused the picker, with
  `text.color` as the value.
- "Can't type into font size." → was clamping on every keystroke; switched
  to a local string committed on blur or Enter.
- "Font drop-downs need a chevron indicator." → painted a custom chevron
  background since `appearance: none` strips the native one.
- "Replace size stepper with a Figma-style dropdown of presets." → built a
  preset menu (8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 48 / 64 / 72 / 96).
- "Lighter / more transparent input fills + line height and letter spacing
  icons + boxes a bit taller and not full-width." → `rgba(0,0,0,0.03)`
  fills, 30px tall fields, `padding-right: 28px` on the typo container, A
  with horizontal bars (line height) + |A| (letter spacing) icons.

## Records of Resistance

1. **Typography wasn't actually changing the text.** The inline style was
   on the outer `.text-el` but `.text-el__static` had an explicit
   `font-size: 16px` rule that beat inheritance. Fix: apply `textStyle`
   directly to the inner static / textarea element.
2. **vForContrast returned white at threshold 21.** Worked fine for the
   picker's AA-fix (4.5) but reversed at the extreme. Surfaced by the
   Editor's "21:1" suggestion snapping to white instead of black.
3. **Picker reported contrast for opaque color while the path's fill was
   translucent.** Switched all contrast math — ratio display, iso-curve,
   AA solver — to composite the color over white using alpha first, so the
   panel matches what the eye sees.
4. **Letter spacing column overflowed the panel.** The flex children
   needed `min-width: 0` to actually shrink; without it the icon-input
   forced its content-based min-width and the second column was clipped.

## Successes

- Editor flow verified: drew two grey shapes → badge "2" → opened the
  panel → picked 21:1 fix → rect previewed black → Apply → badge "1" →
  fixed second → panel auto-closes, badge gone.
- Vectors in stack: drop in (counts swap correctly), drag back out (free
  copy at the released position), delete stack removes in-stack shape but
  leaves free shapes / texts / elements alone.
- Text panel: title flips Text / Vector / Stack per selection; Typography
  edits the actual rendered text (font, weight, size, line height, letter
  spacing, alignment); Fill row swaps in text color through the same
  picker with the iso-contrast curve.
- Size preset dropdown opens on chevron click, current size highlighted,
  closes on outside click, still type-and-Enter for arbitrary values.
- Build clean — 312 KB JS / 92.58 KB gzipped.

## What's Next

- Issue detection is fill-contrast only — text color contrast and font-size
  checks aren't wired yet (texts now have an optional `color`, so it's a
  natural extension).
- The Ignore Once / Ignore All / Add to Exceptions / Editor Settings rows
  are still decorative.
- Position / Size in the Shape panel are still decorative numbers from the
  stack context — they don't reflect the selected vector/text bbox yet.
