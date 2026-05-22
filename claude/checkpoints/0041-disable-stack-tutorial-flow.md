# Checkpoint 0041 — Disable-Stack-Tutorial Flow + Selection-Driven Right Panel

**Date:** 2026-05-22
**Commit:** let users disable the stack tutorial and still drag-create stacks,
make the right panel selection-driven, and polish the Tutorial Overlays popup

## Context

This session finished the "disable stack tutorial" feature: with the tutorial
off, the user still draws their own stack, just without the guided chrome. It
also made the right panel switch to the Shape panel only while a stack is
selected, and tidied the Tutorial Overlays popup.

## Human Directions

- "Right side panel: Shape panel only when the stack is clicked; otherwise the
  Insert panel." → `RightSidebar` is selection-driven (`stackSelected`).
- "If users disable the stack tutorial, it shouldn't show and they can create
  stacks without going through it again." → `stackTutorialDisabled`.
- "Without the tutorial it auto-places the stack — let me drag-create it." →
  clicking Stack now routes to `demo-2-cursor` (the draw step), not the
  pre-made `demo-4-stack-created`.
- "It still has the callout and spotlight." → `demoChrome` gates the tint,
  callout, and pulsing spotlight off when the tutorial is disabled.
- "Still a 'Click the stack to change its layout' callout." → demo-6 is now
  non-guided when disabled — no callout, clicking the stack just selects it.
- "I can't click the stack and expand the layout options." → the Layout row
  is a plain accordion for a hand-selected stack.
- "I can't make a stack" → traced to the "Disabled Stacks Tutorial" popup
  appearing without actually disabling the tutorial (see below).
- Tutorial Overlays popup: narrower, "Start Demo" smaller then heavier, the
  enable/disable-all became a Select All / Deselect All outline dropdown, the
  filter icon removed, checkbox corners tightened, spacing adjusted.

## Records of Resistance

1. **The disabled drag-create flow took several passes.** First the stack
   auto-placed; then the tutorial tint/callout/spotlight lingered; then the
   demo-6 layout callout came back when adding elements. Each is now gated
   behind `stackTutorialDisabled`.
2. **"Can't make a stack" was misdiagnosed first.** Initial read: the Shape
   panel hides the Insert panel while a stack is selected (added Escape to
   deselect). The real cause: the "Disabled Stacks Tutorial" popup fired on
   the "Don't ask again" checkbox, which never set `stackTutorialDisabled` —
   so the popup claimed the tutorial was off while clicking Stack still
   opened "Using Stacks". Asked the user; they chose to tie the popup AND the
   real disable to the "Disable stack tutorial" checkbox. A render-time
   invariant now disables the tutorial whenever that popup is shown, so the
   "Using Stacks" popup's "Don't Show Again" path is covered too.

## Successes

- Disabled-tutorial flow verified end-to-end with Playwright: drag-create with
  no tutorial chrome, demo-6 non-guided, Layout accordion expand/collapse,
  Escape-to-deselect, and making repeat stacks after a delete.
- The "Disabled Stacks Tutorial" popup is now truthful — whenever it shows the
  tutorial is genuinely off.
- The guided demo is unchanged — re-verified the full demo-1→completion path.
- tsc clean; build clean — 279.18 KB JS / 43.65 KB CSS (84.33 / 7.98 gzipped).

## What's Next

- Selecting a stack swaps the whole right panel to Shape, so inserting a new
  stack needs a deselect first (Escape, or click empty canvas).
- The "Don't ask again" checkbox is now a no-op toggle (kept by request).
