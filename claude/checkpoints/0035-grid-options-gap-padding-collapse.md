# Checkpoint 0035 — Grid Layout Options, Gap/Padding Wiring, Collapsible Panel

**Date:** 2026-05-21
**Commit:** wire Gap and Padding to the demo stack, remove Wrap, clear the
demo spotlight on first control use, make the Layout section collapsible, and
build the Grid layout options (Masonry / Columns / Rows / Gap X·Y / Advanced)

## Context

Continues the demo-7 Layout panel from 0034. Five threads of work, all panel
behaviour and wiring.

## Human Directions

- "Build out Gap and Padding (they change the stack), and remove Wrap" →
  reference recordings supplied. Gap and the four-side Padding now drive the
  real demo stack; the Wrap row is gone.
- "When they adjust a layout control it goes back to normal" → the first use of
  any control sets `layoutTouched`, which clears the demo tint / spotlight /
  ring / callout.
- "For padding, individual mode won't let me type it in" → fixed (see below).
- "Make the individual padding format like this" (screenshot) → the four side
  fields now drop to a row *below* the Padding row, each a centred field with a
  faint T / R / B / L label beneath it; the main field goes empty while
  individual mode is active.
- "Make it so users can collapse the layout expanded" → the Layout header has a
  chevron; clicking it toggles the expanded options.
- "This is how the grid looks like in Framer" (recording) → Type=Grid swaps the
  Stack controls for Masonry (Yes/No), Columns and Rows steppers, Gap X·Y, and
  an Advanced button. Masonry=Yes hides Rows and Advanced.

## Records of Resistance

1. **"Won't let me type" was first misdiagnosed.** Initial fix assumed the
   inputs were hard to click (wrapped them in a `<label>`, added select-on-
   focus). The real cause, found by measuring: each 36px field spent 22px on
   padding and 13px on the suffix, collapsing the `<input>` to 4px so the value
   was clipped off-screen. The user re-pointed with a screenshot ("i meant this
   part"). Lesson: measure the element before guessing at the cause.
2. **Individual padding was redesigned.** First attempt kept a 2x2 grid with
   inline T/R/B/L suffixes; per the screenshot it became a horizontal strip
   below the Padding row with labels underneath each cell.
3. **Masonry grid rows collapsed.** `grid-auto-rows: min-content` squashed the
   image rows to ~4px; switched to `auto`.

## Successes

- Gap and Padding (uniform + individual) reflow the real demo stack; Wrap
  removed.
- The demo spotlight/highlight clears the moment a control is used.
- The Layout section collapses and re-expands from its header chevron.
- The Grid panel matches Framer — Masonry, Columns/Rows steppers, Gap X·Y,
  Padding, Advanced — and the controls reflow the demo grid.
- Build clean — 269.86 KB JS / 40.64 KB CSS (81.94 / 7.45 KB gzipped).

## What's Next

- The Advanced button is a static visual element — no panel behind it.
- Grid items render at 78% of their cell (aspect kept, not stretched).
