# Checkpoint 0025 — Demo Step: Place Elements Into the Stack

**Date:** 2026-05-19
**Commit:** demo-6 — pick an element, drag it from outside the canvas into the stack; multiple elements supported

## Context

After demo-5 (Insert highlight), the next step: the user picks an element from the Element popout, it appears outside the canvas, and they drag it into the stack where it center-aligns. Tina supplied 7 element SVGs (GIF, Video, YouTube, Vimeo, Spotify, Apple Music, MP3) and answered scoping questions: rebuild the popout so each element is clickable, real drag-and-drop, one element per step — later expanded to multiple.

## Human Directions

- Scoping answers → rebuild ElementPopout clickable, real free drag-and-drop, (initially) one element
- Built: ElementPopout rebuilt, `demo-6-place-element` scene, element appears outside canvas with a "Drag this into the stack." callout, real `mousedown`→drag→drop, center-aligns in the stack's left column
- "Why did you change the popup" → I'd flattened it to plain text buttons; explained the old popup was a non-clickable static SVG
- "Give it back visual character" → added colored brand thumbnails per element
- "Is there no way to use the old style" / "it's supposed to depict generic image/video/music tiles but when clicked displays the given svg" → restored the original `elements-popup.svg` (the labeled Image/GIF/Video/YouTube/Vimeo/Spotify/Apple Music/MP3 tile graphic) rendered as cropped section strips, with the 8 hover zones turned into click zones mapped to element ids
- "The element popup should still work once a user places one element — multiple in a stack" → refactored to `pendingElement` (being dragged) + `placedElements[]` (in the stack); the popout reopens on hover so elements accumulate
- "Recheck the hover state on the Create New Component popup, it seems shifted" → the ComponentPopout hover zone used the full popup width instead of the pill's rect; fixed to the actual pill bounds

## Records of Resistance

1. **Flattened the Element popout too far.** Asked to make each element "clickable," I rebuilt it as plain HTML text buttons — losing the preview visuals. Tina pushed back twice. The resolution she wanted: keep the *original* `elements-popup.svg` graphic (generic labeled tiles) and just make its 8 zones clickable instead of hover-only — i.e., the old overlay-zone technique, zones now fire `onSelect(id)`. Lesson: "make it clickable" did not mean "redesign it."
2. **Element SVGs are heavy** — 1–7MB each (embedded PNGs; Vimeo 7MB, YouTube 5MB). Rejected showing them as live thumbnails in the popout (~16MB load). They only load when an element is actually selected/placed.
3. **8 tiles vs 7 elements.** The popup SVG has an "Image" tile and a "GIF" tile, but only a GIF element SVG was provided — mapped both Image-section zones to `gif`.
4. **State refactor for multiple elements.** Single `demoElement` → `pendingElement` + `placedElements[]` in App. Canvas renders `pendingElement` outside the canvas (draggable) and all `placedElements` inside the stack. On drop, `onPlaceElement(id)` moves pending → placed. `elementPos` resets via adjust-on-render when `pendingElement` changes so each new element starts at the default outside position. The element-drag effect lists `pendingElement`/`onPlaceElement` as deps — safe because App doesn't re-render mid-drag and `placeElement` is `useCallback`-stable.
5. **ComponentPopout hover zone** was `left: 0; width: 238` (full popup width) — wider than and offset from the actual pill. Fixed by computing the zone from the pill's SVG rect (x=14, w=125, scaled).

## Successes

- ElementPopout: original generic-tile graphic restored, all 8 tiles clickable → select an element
- demo-6: selected element appears outside the canvas (left) with a drag callout; real free drag; drops into the stack on overlap, center-aligned in the left column
- Multiple elements: popout stays usable after a placement; elements accumulate, stacked vertically + centered
- ComponentPopout hover ring now wraps the pill exactly
- Build clean — 254 KB JS / 34.4 KB CSS (77.4 / 6.5 KB gzipped)

## What's Next

- Element SVGs add ~16MB to the repo/dist — consider lighter exports if load time matters on GitHub Pages
- No step after demo-6 yet; demo flow continues from here when Tina directs it
- `demo-3-drawing-frame` / `demo-6-rect-with-text` scenes orphaned; `public/vector-popup.svg` unreferenced
