# 0071 — Text-effect purple outline only when selected

## Context

Milk text dropped from the Advanced Text Effects recommendation had
an always-on purple outline (1.5px / outline-offset 4px). The user
wants the outline to act like a normal selection indicator — gone
when nothing's selected, back when the user clicks the text.

## What changed

`global.css`: moved the `outline` declaration from `.text-effect`
to `.text-effect.text-el--selected, .text-effect.demo-stack__text--
selected`. Free-text + stack-text wrappers both pick it up via
their respective selected-state classes. The blue-border suppression
(`border-color: transparent`) moves into the same selector so the
free text's normal selection border stays hidden when the purple
outline is showing.

## Human directions

- "for the Advanced Text Effect, make the purple outline disappear
  when i click out of the text box and then it can reappear when i
  click back on the text"

## Resistance / rebuilds

- One-CSS-rule change, no rebuilds.

## Successes

- Milk text-effect element reads as unselected when no selection,
  selected with purple outline + handles when clicked.
- Works in both free and in-stack contexts.
- `npm run build` green.
