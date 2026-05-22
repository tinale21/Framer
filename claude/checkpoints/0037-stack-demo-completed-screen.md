# Checkpoint 0037 — Stack Demo Completed Screen

**Date:** 2026-05-21
**Commit:** wire up the "Stack Demo Completed!" modal — auto-appears after a
layout adjustment, working checkboxes, and Save / Discard that keep or clear
the user's canvas

## Context

The final step of the Practice Demo. Builds on the completion modal that
existed only as a static component (0035 era) and the stack select/delete
work in 0036.

## Human Directions

- "The completion screen should pop up ~10s after a layout adjustment; the
  checkboxes should work; use the 'Using Stacks' modal's spacing/padding."
  → a timer on the first layout adjustment shows `demo-completed-modal`;
  checkboxes are stateful; the modal uses the same `32px 28px 24px` padding.
- "The .png only showed how the popup appears — the canvas behind it should be
  the user's real canvas, frozen." → `demo-completed-modal` (and `demo-final`)
  now keep the real `userStack` instead of the static placeholder.
- Delay tuned 10s → 5s → 3s.
- "Match the buttons — Discard is an outline." → Discard uses the plain `.btn`
  outline style, Save stays `.btn--primary`.
- Checkbox styling: same height as the label text (16px), squarer (3px radius),
  blue fill + white tick when checked, blue outline when unchecked.
- Modal sizing: wider (550px) and squarer (9px radius); buttons a touch smaller.
- "Save keeps the canvas; Discard clears it to a blank canvas." → Save goes to
  `demo-final` (which now shows the real stack); Discard runs `clearCanvas`.

## Records of Resistance

1. **The popup first copied the reference .png's canvas.** The completion scene
   rendered `CanvasContent`'s static `stack-frame` placeholder. The user
   clarified the .png was only a reference for the popup itself — the canvas
   behind must be the user's own work, frozen. Fixed by adding the scene to
   `keepUserStack`.
2. **Two spacing instructions tensioned.** "Match the SVG" vs. "match the
   'Using Stacks' modal" disagree on body text size (the SVG mock uses larger
   text). Kept the 15px `.modal__body` rule from "Using Stacks"; the body wraps
   in two lines rather than the mock's three.

## Successes

- The completion modal auto-appears ~3s after the first layout adjustment.
- Checkboxes toggle; checked = blue fill + white tick, unchecked = blue outline.
- Save preserves the user's stack (canvas + panel unchanged); Discard blanks
  the canvas and returns to the Insert panel.
- `clearCanvas` is shared by Discard and the keyboard delete-stack action.
- Build clean — 270.72 KB JS / 41.12 KB CSS (82.10 / 7.55 KB gzipped).

## What's Next

- `demo-8-restacked` is now skipped by the auto-popup; its `CanvasContent`
  case is left in place but unreachable in the normal flow.
- After Save, `demo-final` shows the stack but it is not interactive.
