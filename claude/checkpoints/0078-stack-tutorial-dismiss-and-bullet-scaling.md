# 0078 — Dismiss-to-cursor + free-text bullet scales with font-size

## Context

Two small fixes:

1. **Stack tutorial dismiss flow.** When a user clicks Stack →
   Using Stacks popup → "Don't Show Again" → Disabled-tutorial
   modal → Dismiss, they were landing back on `base`. They had
   to go open the grid and click Stack again to actually draw
   their stack — they came in wanting to make a stack, and we
   threw away that intent.

2. **Bullet icon doesn't scale on free bulleted text.** The
   `ListBulletIcon` is sized in `em` so it tracks the parent's
   `font-size`. In the stack, the wrapper got `textStyle(t)`
   spread on it, so the bullet sized to `t.size`. In the free
   render, the `.text-el` wrapper had only `left/top/width` —
   no font-size — so the bullet inherited 16px from the body
   while the text inside (which had its own `textStyle` applied)
   resized normally. User noticed the bullet "doesn't adjust
   with it but when i put it in the stack it works."

## What changed

### App.tsx
- The branch that auto-sets `stackTutorialDisabled` when reaching
  `disabled-tutorial-modal` while the tutorial is still on (which
  can only happen via Don't Show Again on the Using-Stacks popup)
  now also `setDemoEndScene('demo-2-cursor')`. So Dismiss lands
  on the stack-plus cursor, ready to draw.

### Canvas.tsx
- Free text wrapper (`.text-el`) style now spreads `textStyle(t)`
  ahead of `left/top/width`. The contentEditable / static inside
  already had its own `textStyle` applied, so it doesn't change;
  the change is for the sibling `ListBulletIcon`, which now picks
  up the wrapper's `font-size` and scales with `t.size`.

## Human directions

- "ok. one thing if i for the first time click don't show again
  for the using stacks popup and then i click dismiss, have it so
  i have the stack plus mouse so i can create my stack without
  the tutorial since i was planning on making a stack. don't make
  me have to go back to grid and click on stacks again."
- "ok great. now for the Text Editor component, when i adjust
  the size, the drop down icon isn't adjusting with it but when
  i put it in the stack it works"

## Resistance / rebuilds

- For the bullet: first traced to TextListDropdown (the rec
  component's CSS-only render) but the user was actually talking
  about torn-off bulleted texts (free TextEls with `bullet: true`).
  Stack render already worked — it was the free render that
  inherited the wrong font-size for the bullet.

## Successes

- Don't Show Again → Dismiss lands on stack-plus cursor.
- Bullet icon on free bulleted text scales with the text's
  typography font-size, matching the stack behavior.
- `npm run build` green.
