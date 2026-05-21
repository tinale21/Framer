# Checkpoint 0033 — Expanded Layout Options Panel

**Date:** 2026-05-20
**Commit:** build out the expanded Layout panel as real, interactive controls
(Type, Direction, Distribute, Align, Wrap, Gap, Padding) matching the reference

## Context

In demo-7, opening "Layout" previously revealed only plain text rows. Tina
supplied a reference screenshot of Framer's actual Layout panel and asked for it
to be built out as working, clickable controls.

## Human Directions

- "Build the expanded layout part to look like this [reference] — build them out
  yourself to make them clickable" → new `LayoutOptions.tsx` component, rendered
  in place of the text rows when `demo-7-layout-panel` is active.
- Seven controls, each with local state:
  - **Type** / **Wrap** — text segmented toggles (Stack·Grid, Yes·No)
  - **Direction** — horizontal/vertical arrow toggle
  - **Distribute** — dropdown menu (6 options, click-outside to close)
  - **Align** — 3-icon segmented control with a divider between inactive segments
  - **Gap** — two editable X / Y number fields
  - **Padding** — editable number field + uniform/individual icon toggle
- "Move the blue highlight to highlight everything within the expanded part" →
  the pulsing ring was title-only; made it a reusable `layout-demo-ring` class —
  on the title when collapsed, on the whole block when expanded.
- "Make the spotlight bigger / 8px smaller / 2px smaller" → tuned the spotlight
  `::before` `inset` (settled at `-20px -16px`) with matching block margin.

## Records of Resistance

1. **Distribute dropdown vs. cycle** — chose a real dropdown menu (the chevron
   implies one) over click-to-cycle.
2. **Spotlight size walked in three steps** — enlarged, then −8px, then −2px;
   confirmed with the user that the reduction is split evenly top/bottom (the
   `inset` vertical value applies to both edges).

## Successes

- The expanded panel closely matches the reference: gray-pill segmented controls,
  white active segments with blue text/icons, the Align divider, X/Y gap fields.
- All controls verified interactive — segments switch, the dropdown opens with all
  6 options, number fields are real inputs.
- Dead `.props-row--sub` / `.props-row--muted` CSS removed (no longer used).
- Build clean — 264.6 KB JS / 39.6 KB CSS (80.5 / 7.3 KB gzipped).

## What's Next

- The controls hold their own UI state only — they don't reshape the actual demo
  stack on the canvas. Wire them to the stack if the demo needs it.
- The reference's "−" collapse icon in the Layout header was not added (would mean
  restructuring the highlighted title element).
