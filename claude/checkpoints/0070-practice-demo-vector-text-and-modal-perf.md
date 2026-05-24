# 0070 — Practice demo support for vector/text + community modal perf

## Context

Two threads landed together:

1. The stacks practice demo only worked with elements. Picking
   Vector or Text from the highlighted Insert section left the
   user stranded — the tint blocked input, the InsertPanel callout
   still nagged about adding things to the stack, and even after
   placing something the "Drag this into the stack" callout
   never pinned. The drag-into-stack flow / stack-ready prompt
   also didn't count vectors.

2. The community popup was sluggish because the 12 card preview
   PNGs (and the 3 rec covers) were multi-MB originals — 25MB
   smarthome, 15MB headers, 14MB cover-3d-shapes etc — being
   decoded at full resolution to render at ~200px wide. 83MB of
   community images for a 200×120 display.

## What changed

### Practice demo (vector + text)
- `showDemoTint` excludes `demo-5-insert-highlighted` when either
  `vectorTool` or `textMode` is active, so arming the tool
  immediately frees the canvas.
- `createShape` / `createPath` / `placeText` now mirror
  `pickElement`: they advance to `demo-6-place-element` and pin
  the matching callout (`calloutShape` / `calloutText`) to the
  new item.
- `placeText` during the demo skips `setEditingText` and seeds
  the text with `"Text"` so the placeholder isn't trapped in a
  contentEditable — the user can drag it immediately.
- Canvas accepts `calloutShape` + `calloutText` props and renders
  the existing `.demo-element__callout` on the matching free
  shape / text. The callouts hide while a creation tool is armed
  (`!vectorTool && !textMode`) so they don't clutter the cursor's
  way during the next creation.
- "Add several elements into the stack." callout (lives in
  InsertPanel) also gains the `!textArmed && !vectorArmed` gate.
- Stack-ready prompt counts ALL three kinds:
  `stackEls + stackTexts + stackShapes >= 2`. Vectors in the
  stack now trigger the layout callout.
- `demoBlocksDeselect` narrowed from `(demoSpotlight || demo6 &&
  !stackTutorialDisabled)` down to just `demoSpotlight`, so
  clicking the frame or gray surround during demo-6 clears the
  selection normally (vector / text were otherwise stuck-selected).
- Stack render now applies `text-effect text-effect--{effect}`
  and `text-el--bullet` classes to `.demo-stack__text` and renders
  `<ListBulletIcon />` when `t.bullet`. CSS selector list for
  `.text-effect--milk` includes `.demo-stack__text.text-effect--milk`
  so the Milk styling survives the drag into the stack.
- Callout gating widened from `scene === 'demo-5-insert-highlighted'`
  to `(demo-5 || demo-6)` so subsequent items the user creates
  during practice ALSO get the "Drag this into the stack." callout
  pinned to them — not just the first.

### Community modal performance
- Resized every preview PNG to max 1000px wide via
  `sips --resampleWidth 1000`:
  - `public/community/`: 83MB → 3.6MB total (96% reduction)
  - `public/recs/cover-*.png`: 27MB → 1.5MB combined
  - Worst card (11-smarthome): 25MB → 648KB
- Added `loading="lazy"` and `decoding="async"` on community card
  and Recommendation panel cover `<img>` tags so the browser
  decodes off the main thread + skips offscreen images.

## Human directions

- "on the practice demo for stacks, if users select to put a vector,
  it should let them and tell them to drag it in the stack just like
  how the element works"
- "Look it still not letting me for vector or text: [video]. if i
  select to add a vector or text during the practice demo, the tint
  should disappear and i should be able to create a vector or text
  like normal. once i have made my vector or text then a callout
  appears on top of it telling me to drag it into the stack (like
  the element does) and the practice demo should continue"
- "ok there's some issues. firstly, when i have at least two items
  in the stack it does prompt me to click on the stack to change
  the layout. it should prompt that when there is at least two of
  any combination of vectors, text, or elements in the stack.
  secondly when i drag a vector into the stack, i have to click on
  the white canvas to unselect it, it does not unselect when i
  click on anywhere outside the workspace. third. when i chose to
  add a text, it just doesn't let me move it at all. and lastly
  when i chose to create a vector or text and i already press on
  it, i don't need to the callout telling me to add several
  elements into the stack if my mouse turns to the plus button to
  create the vector or to type"
- "there is still this issue: [video]. when i chose to make a oval
  vector and my mouse turns into the plus indicating that i am in
  the create mode, i don't want the 'add several elements into the
  stack' callout"
- "ok that's great. can you make it also so that if i have an
  element/vector/text dragged into the stack and then i create/
  drop another element/vector/text, the callout to 'drag this
  into the stack' shows up for the new element/vector/text too"
- "ok cool. now when i am dragging the text for the Advanced Text
  Effects into the stack, it completely changes the text effect
  and font"
- "ok cool. the community assets are a bit laggy. is there a way
  to fix that"

## Resistance / rebuilds

- First fix for vector/text in the practice missed that the
  InsertPanel's own "Add several elements into the stack."
  callout was a separate thing from the Canvas callouts — had
  to track it down in RightSidebar after a second video.
- First pass on `placeText` left the text in contentEditable
  edit mode, so the user couldn't drag it. Switched to the
  placeholder approach.
- Stack-render styling drop for Milk text was a CSS scope
  miss: `.text-effect--milk` only targeted `.text-el__*`
  descendants, so the stack's `.demo-stack__text` wrapper
  didn't pick it up.

## Successes

- Vectors and texts work in the practice demo end-to-end,
  identically to elements.
- Stack-ready prompt counts every kind.
- Frame / surround deselect works during demo-6.
- Stack-styled Milk text keeps its Leckerli One + outline +
  shadow after dragging into the stack.
- Community modal opens snappy; total asset weight dropped
  from ~110MB to ~5MB across all preview images.
- `npm run build` green.
