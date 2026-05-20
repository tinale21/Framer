# Checkpoint 0026 — Multi-Element Placement, Delete, Vertical Stacking

**Date:** 2026-05-20
**Commit:** demo-6 — place multiple elements without replacement, select + delete anywhere, free elements stack in a vertical column

## Context

Continues demo-6 (place elements into the stack). After 0025 shipped single-element
placement, Tina wanted the flow to support placing several elements, deleting them,
and not having freshly-picked elements pile on top of each other outside the canvas.

## Human Directions

- "When I click and drop one element, then drop another, it replaces the first" →
  refactored App's element state from `pendingElement` + `placedElements[]` to a
  single keyed `demoElements: DemoEl[]` list. Each pick appends a new keyed instance,
  so nothing is ever overwritten.
- "Make Delete work — select an element, press Delete, it deletes" → window `keydown`
  listener removes the `selectedEl` on Delete/Backspace (ignores INPUT targets).
- "I want to delete it outside the stack too, anywhere on the canvas" → selection +
  delete now work for both in-stack and free elements (unified `selectedEl` key).
- "The drag callout shows when not in the practice demo" → callout gated to
  `scene === 'demo-5-insert-highlighted'` only.
- "When you drop multiple, it shouldn't pile on each other" → free elements now spawn
  in a true vertical column, each placed directly below the previous with a 12px gap.

## Records of Resistance

1. **First stagger was a 30px diagonal offset** — elements are 150px wide / 31–113px
   tall, so a 30px diagonal still overlapped almost completely. Tina pushed back: "it
   still stacks, place it below or on top of another." Fixed by measuring each
   element's rendered height (`EL_HEIGHTS` map) and spawning each new free element at
   the cumulative bottom of the existing ones — a clean, gap-free vertical column.
2. **Element popout closed when moving the mouse from it back onto the tile.** The
   `insert-tile-wrap` used `onMouseEnter`, which fires only once; moving popout → tile
   button stayed inside the wrap so it never re-fired, while the popout's `onMouseLeave`
   started the hide timer with nothing to cancel it. Switched the wrap to `onMouseOver`
   so any movement over it keeps the popout alive.

## Successes

- Multiple elements: pick any number, each is its own keyed instance — no replacement.
- Select + Delete works for elements both inside the stack and free on the canvas.
- Free elements stack in a vertical column (verified: spotify→youtube→vimeo land at
  y 364 / 419 / 515, packed by real height + 12px gap).
- Drag callout only appears during the guided practice demo.
- Build clean — 255 KB JS / 34.6 KB CSS (77.9 / 6.5 KB gzipped).

## What's Next

- Demo step after the stack is filled with elements (demo-7 layout panel) not built yet.
- Element SVGs still heavy (~16MB total); only loaded when an element is placed.
