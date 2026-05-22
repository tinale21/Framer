# Checkpoint 0038 — Disabled Stacks Tutorial Popup + Demo-Flow Fixes

**Date:** 2026-05-21
**Commit:** trigger the Disabled Stacks Tutorial popup after Save/Discard,
keep the canvas through the completion flow, and fix the demo's tint
doubling and canvas-height jump

## Context

Continues the completion-screen work from 0037. The Practice Demo's final
flow — completion modal → optional disabled-tutorial popup → end — plus a
batch of visual fixes the user caught while testing it.

## Human Directions

- "If users tick 'Don't ask again', show the Disabled Stacks Tutorial popup —
  but only after they click Save or Discard." → the checkbox is a plain
  toggle; `finishDemo` detours through the popup when it's ticked.
- "Style that popup with the completion modal's padding/spacing/button rules."
  → it reuses `modal--completed`; Manage outline, Dismiss primary.
- "Make the completion checkboxes unchecked by default."
- "Dismiss shows a weird old popup." → it navigated to `base-hover`, which
  auto-opens `BasePopout`; routed to the demo's end scene instead.
- "Save with the box ticked doesn't save my canvas." → the popup's Dismiss
  always returned to `base`; added `demoEndScene` so Save ends at `demo-final`.
- "Show the saved stack behind the disabled popup, not just after Dismiss."
- "I can't select/delete the stack after the demo." → stack select extended
  from `demo-7-layout-panel` to `demo-final`.
- "Keep the blue outline on the stack when selected, not on the white canvas;
  and don't show the canvas hover outline." → select ring is now an inset
  box-shadow; the canvas `:hover` outline is suppressed where the stack is
  selectable.
- "The tint looks doubled going into the expanded Layout panel."
- "Why does the canvas grow taller in the expanded Layout panel?"

## Records of Resistance

1. **"The blue outline" was misidentified twice.** First read removed the
   stack's select outline (`demo-stack--selected`); the user actually meant
   the editor's `.canvas-content` hover outline. After fixing that, the user
   clarified they *did* want a select outline — on the stack, not the white
   canvas — so it came back as an inset ring. Lesson: when a user says "the
   outline," confirm which of several blue outlines before deleting one.
2. **Doubled tint.** `demo-7-layout-panel` had both the `.demo-tint` overlay
   and a separate `opacity: 0.55` chrome/canvas dimming — removed the latter.
3. **Canvas height jump.** `.main` is a grid with an `auto` row, so the
   over-tall expanded sidebar stretched the row (and the canvas). Pinned the
   row with `minmax(0, 1fr)`.

## Successes

- The completion flow is coherent: Save keeps the canvas, Discard clears it,
  and a ticked "Don't ask again" detours through the Disabled Stacks Tutorial
  popup, which then lands on the correct end scene.
- The saved stack shows frozen behind the disabled popup.
- Stack select/delete works in `demo-final`; the selection ring sits inside
  the stack, no stray outline on the white canvas.
- The demo tint is even, and the canvas holds a constant height across the
  layout-prompt → layout-panel transition.
- Build clean — 270.85 KB JS / 41.18 KB CSS (82.24 / 7.58 KB gzipped).

## What's Next

- In `demo-7-layout-panel` the right sidebar's content is ~43px taller than
  the viewport; its dimmed bottom is clipped rather than scrolled.
- The disabled popup's Manage button still routes to `tutorial-overlays-settings`.
