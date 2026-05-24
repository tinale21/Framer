# 0073 — Practice text: placeholder cleanup, no-wrap default, callout teardown

## Context

Three related issues with the practice-demo text flow:

1. Typing more than ~4 chars into the demo's "Text" placeholder
   wrapped to a second line (contentEditable inherited the
   placeholder's width). User: "i don't know what you did but i
   just didn't want the text to go to a second line."
2. User typing "hi there" auto-wrapped at the space. User wanted
   Return key to be the only way to break to a new line.
3. After backspacing all chars and clicking out, the text box
   visually disappeared but the "Drag this into the stack."
   callout kept floating. Required an extra backspace.

## What changed

### Placeholder cleanup
- `TextEl.placeholder?: boolean` added in types.
- `placeText` (App): demo branch seeds `placeholder: true` alongside
  the `'Text'` string.
- `editText` (App): on entering edit mode, if the text is a
  placeholder, set `text: ''` and unset the flag so the contentEditable
  opens empty (and the parent wrapper is no longer pinned to the
  4-char placeholder width).

### No-wrap default
- `.text-el__input, .text-el__static`: `white-space: pre-wrap`
  → `white-space: pre`. Free text grows on one line; typing spaces
  doesn't break. Return key still produces a line break (browser
  inserts `<br>`; `parseEditableToRuns` already converts `<br>` →
  `'\n'`; `pre` preserves it).
- New `.text-el--wrapped` opt-in selector restores `pre-wrap` +
  `word-break: break-word` when the user has explicitly resized the
  box (`t.width != null`). Canvas adds that class on the wrapper.

### Callout teardown
- `endTextEdit(isEmpty=true)`: also clears `calloutText` if it
  matched the removed key.
- Global delete keydown handler: clears `calloutEl` /
  `calloutText` / `calloutShape` if the deleted key matches.
- `deselectText` (frame/surround click path): if the currently
  editing text is empty (`text.trim() === ''`, catching the stray
  `<br>` browsers leave after backspacing all chars), filter the
  text out AND clear its callout. Otherwise the invisible empty
  wrapper kept rendering the callout.
- `EditableText` keyDown: Backspace/Delete on an empty editor
  now `preventDefault` + `blur` so the user isn't trapped in
  edit mode with nothing left to delete.

## Human directions

- "ok when i am trying to add a text during the stack practice
  demo, can you make it so the text box fixes what i am typing and
  doesn't create it as a second line if it more than 4 characters."
- "i don't know what you did but i just didn't want the text to go
  to a second line: [screenshot of 'hi / there' wrapping]"
- "ok great. now for this when i chose to place a text but i
  change my mind and want to delate it, right now the callout
  still shows even when i delete the text, it shouldn't show
  anymore if i delate. also for text to go to a second line, users
  should press the return key on their keyboard"
- "ok it works if i click and delete the text box but when i go in
  and backspace until there's no letters and click out and the
  text box disappears, the call is still there"
- "ok it sort of works but it requiring me to do an extra
  backspace to delete the callout even though it empty and when
  i click out, the textbox disappears"

## Resistance / rebuilds

- First fix (clearing the placeholder on edit entry) addressed the
  trapped-width issue but didn't stop spaces auto-wrapping —
  needed the CSS `pre` change too.
- First callout teardown only ran on `endTextEdit(isEmpty)` and the
  global delete handler. Missed the deselect path (frame/surround
  click) where empty editing text would persist invisibly. Added
  the deselect branch.
- `t.text === ''` check was too strict because the browser
  inserts a trailing `<br>` after backspacing all chars, giving
  `t.text === '\n'`. Switched to `trim() === ''`.

## Successes

- Demo "Text" placeholder clears on first edit; box grows
  per-char from empty.
- Free text stays on one line as you type; Return creates a new
  line; resizing re-enables wrap inside the chosen width.
- Backspace all chars + click out (or Backspace on empty) drops
  both the text box and its callout in one step.
- `npm run build` green.
