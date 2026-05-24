# 0076 — Stack renders items in drag-in order

## Context

The stack was rendering each type in its own loop, in this order:
all elements → all texts → all shapes. So dropping a text first
and then an element put the element *above* the text inside the
stack, because the elements loop ran first. User wanted the stack
to show items in the order they were actually dragged in,
regardless of type.

## What changed

- `TextEl`, `DemoEl`, and `VectorEl`'s `InStackFlag` all gained an
  optional `stackOrder?: number`.
- `App` adds a `stackOrderRef` counter. `dropElementInStack`,
  `dropTextInStack`, `dropShapeInStack` each grab the next number
  and stamp it on the dropped item.
- `Canvas` builds a single merged list:
  ```
  [...stackEls (tagged 'el'),
   ...stackTexts (tagged 'tx'),
   ...stackShapes (tagged 'sh')]
    .sort((a, b) => a.order - b.order)
  ```
  and renders inside one `.map` with a switch on the tag. Each
  branch keeps the original element/text/shape render path
  (handlers, classes, selection ring, etc.) intact.

Pulling an item out of the stack doesn't clear `stackOrder` — if
the user drops it back in it gets a fresh, larger number and so
goes to the end of the order (matches the expected "drag-in
order" behavior).

## Human directions

- "for the stacks, can you make it so it goes in order of what i
  drag in first and such"

## Resistance / rebuilds

- None — straight implementation.

## Successes

- Mixed-type stacks (element + text + shape) render in chronological
  drag-in order.
- `npm run build` green.
