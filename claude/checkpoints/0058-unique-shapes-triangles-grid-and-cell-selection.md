# 0058 — Unique Shapes triangles pack + cell select-vs-drag gesture

## Context

Following 0054 (3D Shapes recommendation + tear-off), the Unique Shapes
card needed the same "drop component, tear off individual shapes"
behavior. The first attempt used a single composite SVG (Figma export)
much like the 3D Shapes asset, but two problems surfaced:

1. The shapes inside the SVG were a mix of `<g clip-path>` cells and
   loose top-level `<path>` elements, and many of the loose paths were
   thin / sparse so click hit-testing was unreliable — users needed
   multiple clicks to land on a shape, or the click would fall through
   and drag the whole component instead.
2. The white-on-dark Figma styling didn't translate to the white
   canvas. Stripping the dark background made shapes invisible;
   recoloring helped but the click problem persisted.

Pivoted to a CSS grid of nine individual triangle SVG files. Plain
HTML hit-testing is rock-solid: each cell is its own `<div>` with its
own `<img>`, no SVG path geometry to fight.

The second piece is a click-vs-drag gesture distinction on cells: a
tap (no movement) should select the cell within the component (handles
shown in place), and only a drag past the threshold should tear off a
free copy.

## What changed

- **`public/recs/triangles/triangle_{1..8,10}.svg`**: nine individual
  triangle assets copied from the user's Cool Shapes pack and `sed`
  recolored white→black so they're visible on the white canvas.
- **`RecommendationPanel`**: Unique Shapes card asset switched to the
  sentinel string `'triangles-grid'`.
- **`App.applyRecommendation`**: when it sees that sentinel, drops a
  DemoEl with `id: 'recommendation-triangles'` (no `src`).
- **`TrianglesGrid`** (Canvas): 3×3 CSS grid of `<img>` cells, each
  with its own `onMouseDown` that calls the existing
  `handleComponentShapeMouseDown` with the cell's measured rect.
- **Two-phase gesture in `handleComponentShapeMouseDown`**: instead of
  tearing off on mousedown, attaches one-shot `mousemove`/`mouseup`
  window listeners. First past-threshold mousemove triggers the
  existing tear-off + drag path. A mouseup with no movement instead
  fires `onSelectCell(id)` — a Figma-style click-vs-drag distinction.
- **`selectedCellId` in App**: new state, cleared by the three deselect
  helpers (`selectFrame`, `selectCanvas`, `deselect`) alongside the
  other selection states. Passed through Canvas into both
  `TrianglesGrid` and `ComponentSvg`.
- **Cell selection UI**:
  - `TrianglesGrid`: cell gets `.tri-cell--selected` class (1px purple
    outline) and four corner handles.
  - `ComponentSvg`: a `useLayoutEffect` keyed on `selectedCellId`
    finds the matching pattern rect / clip group / data-tear-id path,
    measures it via `getBoundingClientRect`, divides by the wrap's
    render-vs-CSS scale to get pre-transform CSS pixels, and renders
    an absolutely-positioned overlay div with the same outline +
    handles at those coordinates.
- **Purple handles** (`#9d4edd`): matches the component instance's
  existing outline color, signaling "this is part of a component"
  rather than the regular blue free-element handles.

## Human directions

- "ok now when users click on the Unique Shapes recommendation, this
  should pop up on their canvas: /Users/tinale/Downloads/triangle.svg"
- "can you do it without the fill: …/triangle (1).svg"
- "i am having a bit of troubling individually selecting and dragging
  them out"
- "it still not working. it is taking me multiple clicks for it to
  understand that i want to select that specific shape. here are their
  individual svg: [9 files]"
- "ok can you make it so when i click on the shape before draging it
  out, it has it with the circle size adjustor just so i know that it
  the one selected. and then follow the same rule that if i click
  anywhere outside of the shape on the canvas or workspace, the circle
  size adjustor goes away until i click on the shape again"
- "ok it works on the Unique Shapes but not the 3D Shapes now"
- "ok this is great but it should still be a purple outline not blue"

## Resistance / rebuilds

- Composite SVG approach (`public/recs/triangle.svg`) went through
  three rebuilds — full dark BG, no-fill version with white shapes,
  then path-bbox + hit-overlay-rect injection — before pivoting to
  individual files. Removed the now-unused composite asset.
- Click handler had to learn three tear-unit kinds (pattern rect,
  clip group, data-tear-id path) in the composite-SVG phase; that
  generalization still works for 3D Shapes and any future
  composite assets.
- After the click-vs-drag refactor, the user observed handles
  appearing on triangles but not 3D Shapes (different render
  surface). Added a parallel overlay path in `ComponentSvg`.

## Successes

- Hit-testing is bulletproof for triangles (each cell is a div).
- Click vs drag feels exactly like Figma — tap selects, drag tears.
- Both component types (TrianglesGrid + ComponentSvg) render the
  same purple selection treatment, so component cells visually
  read as "part of a component" while torn free copies keep the
  blue free-element handles.
- tsc clean.
