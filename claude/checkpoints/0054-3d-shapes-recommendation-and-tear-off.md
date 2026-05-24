# 0054 — 3D Shapes recommendation drop + Figma-style tear-off

## Context

The Editor Recommendation panel (0053) showed three cards but only one —
"3D Shapes" — has actual demo behavior wired up. This pass makes that card
functional end-to-end: clicking it drops the 3D Shapes component onto the
canvas as a single Figma-style "component" element, and individual shapes
inside the component can be torn off and dragged onto the canvas as their
own free copies.

The asset is `public/recs/3d-shapes.svg`, a 14MB SVG built from a Figma
export. Each cell renders as a `<rect>` with `fill="url(#patternN)"` whose
pattern resolves to a base64-encoded PNG via a `<use xlink:href="#imageN">`
indirection inside `<pattern>`. The previous gray background `#222326`
rect was stripped so it sits cleanly on white canvas.

## What changed

- **`ComponentSvg`** (Canvas.tsx): new inline-SVG renderer that fetches
  the asset, walks `pattern → use → image` to build a pattern-id → base64
  href map (module-cached), then mounts the SVG via
  `dangerouslySetInnerHTML`. Listens for mousedown on `rect[fill^="url"]`.
- **Tear-off**: a mousedown on a pattern-filled rect calls
  `handleComponentShapeMouseDown`, which spawns a new free DemoEl at the
  cursor (centered, sized to the rect's measured on-canvas width) and
  primes `elementGrabRef` + `setDraggingKey` so the existing drag effect
  takes over — one motion, no extra click. Mousedowns on whitespace fall
  through so the whole component is still draggable.
- **Removal from source**: `extractedPatterns: Set<string>` in App tracks
  every torn pattern id; ComponentSvg runs a post-render `useEffect` that
  hides matching rects with `visibility: hidden` (keeps the grid spacing
  intact). A torn shape can't be torn again.
- **White-PNG fix**: torn copies get `mix-blend-mode: multiply` via a new
  `.demo-element--component-shape` class — the PNGs have white
  backgrounds; multiplying against the white canvas erases them visually
  without compositing artifacts.
- **Recommendation card**: `RECS.Vectors[1]` gets `asset: 'recs/3d-shapes.svg'`,
  the card becomes `.rec-card--clickable`, and a click calls
  `applyRecommendation(asset)` which creates the
  `{ id: 'recommendation', src: BASE_URL + asset, x: 240, y: 220, width: 360 }`
  DemoEl on the canvas.
- **Component styling**: `.demo-element--component` adds a 1.5px purple
  outline + `outline-offset: 1px` and removes the shadow/radius so the
  component instance reads as a distinct Figma-style element.

## Human directions

- "ok now if users click on the 3D Shapes this should pop up on their canvas: /Users/tinale/Downloads/Canvas.svg"
- "it shouldn't fill the whole frame. it suppose to work like a component as used on Figma."
- "can you give it a purple outline to indicate it a components"
- "what did you remove? i meant the gray fill on the 3D Shapes svg. i think it the canvas fill"
- "can you remove the drop shadow though. it looks a look odd with it"
- "ok great. can you give it a purple outline to indicate that is a component. also is it possible to make it function as the svg where users can individual on in and click on one of the shapes within the svg and drag it out"
- "there is a white fill on them"
- "ok but it is suppose to work that i click on it and am able to drag it out. this is how it works on Figma: [video]"
- "the size seems to get bigger when i drag it out"
- "ok it works. but when i drag a shape out. it should be removed from the whole since i took it out"

## Resistance / rebuilds

- **Pattern → image extraction first returned empty**: initial pass looked
  for `<image>` directly under `<pattern>`. The export instead nests
  `<pattern><use xlink:href="#imageN"/></pattern>` with the image declared
  separately. Fixed by walking the `use` → `image` chain and using
  `getAttributeNS('http://www.w3.org/1999/xlink', 'href')` for the
  namespaced attribute.
- **Click-spawn vs drag-tear**: first cut spawned the copy at a stepped
  fan-out position next to the component on click. User pointed out
  Figma's actual gesture is mousedown → drag-out in one motion. Refactored
  to spawn at the cursor and immediately set `draggingKey` to the new
  element's key so the existing element-drag effect picks it up.
- **Torn copies looked oversized**: initial spawn hardcoded `width: 100`.
  Switched to the source rect's measured on-canvas `getBoundingClientRect()
  .width / scale` so the torn copy is 1:1 with the cell.
- **Torn copies sat on a white card**: PNG backgrounds were white. Tried
  removing the demo-element box-shadow/border-radius first; the white
  square remained because it was baked into the PNG. Added
  `mix-blend-mode: multiply` on `.demo-element--component-shape
  .demo-element__img` — white × white canvas = white, anything else stays.
- **Source slot stayed visible after tear**: needed to track torn pattern
  ids. Used `visibility: hidden` (not `display: none`) so the grid layout
  doesn't collapse.

## Successes

- One-motion mousedown-to-drag exactly mirrors Figma's instance tear-off.
- Torn copies render at the original cell size and read cleanly on the
  white canvas (no visible PNG background).
- Source component visually loses the cell that was torn, can't double-tear.
- Whitespace mousedowns inside the component still bubble to the parent so
  the whole component remains draggable.
- Module-scope `svgTextCache` / `patternImgCache` so the 14MB asset and
  its parsed pattern map are paid for once across all mounts.
- tsc clean throughout.
