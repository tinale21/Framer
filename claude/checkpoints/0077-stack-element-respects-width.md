# 0077 — Stack respects free-element width on re-drop

## Context

Component-shape demo elements were always rendering inside the stack
at `.demo-stack__element { width: 78%; }`, ignoring the user's
`el.width`. Flow that broke:
1. Drop component-shape, resize free to size X, drag into stack.
2. Drag back out (handleElementMouseDown stamps the stack-rendered
   width back into `el.width`, so el.width becomes the 78%-of-column
   value).
3. Resize free to size Y.
4. Drag into stack — still shows the old 78% size; user's new
   width Y wasn't reflected.

## What changed

In Canvas's merged stack-render loop, the element branch now sets
`width: el.width` inline when `el.width` is set, otherwise falls
through to the CSS default. With this:
- Step 4 above renders at size Y.
- Pull-out (handleElementMouseDown) measures the rendered width
  back into `el.width` — but the rendered width is now exactly
  `el.width`, so it's idempotent. The user's resize survives the
  drop/pull cycle.

## Human directions

- "i am having this issue where the component shape is changing
  size when dragged in the stack: [video]. i changed it the first
  time, dragged it into the stack, drag it out of the stack and
  try to adjust the size but when i try to redrag it back it did
  [not] change to the new size"
- (clarified via question: "Stack still shows the OLD size")

## Resistance / rebuilds

- Initial read assumed user wanted the stack locked to a uniform
  size; asked for clarification because the original phrasing was
  ambiguous. Answer made the intent clear.

## Successes

- Resizing a free element and re-dropping it shows the new size
  in the stack.
- `npm run build` green.
