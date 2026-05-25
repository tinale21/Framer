# 0079 — Canvas stays visible behind tutorial popups

## Context

Two reports, same root cause: the canvas behind certain
tutorial-related modals looked "wiped" even though the user's
items were still in state.

1. Opening Tutorial Overlays from Preferences and saving/closing
   sent the user back to `'base'`, where `keepUserStack` is false
   — the stack rect stops rendering and the in-stack items
   disappear with it. From `'demo-final'` this looked like a
   total wipe.
2. While the Tutorial Overlays popup was up (scene =
   `'tutorial-overlays-settings'`), `keepUserStack` had no entry
   for that scene at all, so the stack vanished behind the modal.
3. While the Disabled-tutorial popup was up, the
   `keepUserStack` check counted `demoElements.length` +
   `texts.length` but not `shapes.length` — a vector-only canvas
   read as empty.

## What changed

### App.tsx
- Added a `prevSceneRef` that captures the current scene on every
  change *except* when entering `'tutorial-overlays-settings'`.
  So if the user goes `demo-final` → settings, the ref still holds
  `'demo-final'`.
- Passes `returnScene={prevSceneRef.current}` to
  TutorialOverlaysModal.

### TutorialOverlaysModal.tsx
- New `returnScene: Scene` prop.
- Both the X close button and the Save button now call
  `onSceneChange(returnScene)` instead of hardcoded `'base'`.

### Canvas.tsx
- `keepUserStack` now also matches `'tutorial-overlays-settings'`
  when there's any content (same content gate as
  `'disabled-tutorial-modal'`).
- Content gate widened from `demoElements.length > 0 ||
  texts.length > 0` to also count `shapes.length > 0`. A
  vector-only canvas no longer reads as empty behind either popup.

## Human directions

- "when i go to tutorial overlays in preference, it completely
  wipe my canvas?"
- "There is also this issue where sometimes when the disable
  stacks popup shows it shows the canvas as empty in the back
  even though it isn't: [video]"
- "same thing for the tutorial overlay popup: [screenshot]"

## Resistance / rebuilds

- None — three small targeted fixes.

## Successes

- Tutorial Overlays opened from `demo-final` returns to
  `demo-final` on close/save; canvas stays put.
- Stack rect + items visible behind both the Disabled-tutorial
  and Tutorial-overlays popups.
- Shape-only canvases count as "has content" for the visibility
  gate.
- `npm run build` green.
