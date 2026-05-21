# Checkpoint 0034 — Layout Controls Drive the Stack + Elements Pan/Zoom

**Date:** 2026-05-21
**Commit:** wire the demo-7 Layout panel so Type/Direction/Distribute/Align
reflow the real demo stack, give the panel controls their interdependencies,
and make placed elements pan and zoom with the workspace

## Context

Builds on the demo-7 Layout panel (0033). Three threads of work, all in the
demo-6 / demo-7 flow.

## Human Directions

- "Wire up the panel's interdependencies" → Type=Grid hides the stack-only
  controls; Direction flips the Align icon set (top/center/bottom ↔
  left/center/right); Wrap toggles single vs X/Y gap; Padding uniform = 1 field,
  individual = 4 (T/R/B/L).
- "Why don't placed elements pan/zoom with the workspace?" → the free elements
  rendered outside the frame's transform. Moved them into the frame's coordinate
  space (like text already was) so they pan and zoom with it.
- "Drop elements outside in the workspace, not on the canvas" → new elements drop
  at a negative x (in the gray, left of the frame); the user drags them in.
- "Make the layout options actually adjust the stack" → reference recording
  supplied (`Screen Recording … 1.20.16 PM.mov`). Type/Direction/Distribute/Align
  lifted to App and mapped to the demo stack's element column via flex/grid CSS;
  Wrap/Gap/Padding stay panel-only, per instruction.

## Records of Resistance

1. **Panning churned through four states, then fully reverted.** "Users can't
   move the canvas" → pan-from-workspace-only; "still movable" → panning removed
   entirely; "no, it can move" → restored + re-guarded; "revert this whole
   change" → reverted to the 0033 behavior. Net change to panning: none. Lesson
   recorded in `feedback` memory candidate: confirm canvas/workspace terminology
   before changing core interactions.
2. **"Distribute disables the Gap" was dropped.** It was in the stated logic and
   coded, but the reference screenshot shows Space-Evenly with the Gap editable —
   so it was removed to match the reference (gap is a minimum, not disabled).
3. **`border-width` pulse silently failed** (earlier) and **`flex: 1` broke
   Distribute** — row elements grew to fill the row, leaving no space for
   `justify-content`; fixed with a fixed-width slice.

## Successes

- The Layout panel reflows the real stack — verified by measuring element
  positions: Direction, Distribute (Center/Between/Evenly/Start), Align (cross-
  axis, icons flip with Direction), and Type=Grid (2-column tiling).
- Placed elements pan and zoom with the workspace and still drag in/out of the
  stack.
- Build clean — 266.9 KB JS / 39.8 KB CSS (81.1 / 7.3 KB gzipped).

## What's Next

- Grid uses a fixed 2 columns (no Columns/Rows controls in the panel).
- Wrap/Gap/Padding are panel-only — not wired to the stack.
