# Checkpoint 0027 — Image Tile Uploads a User's Own File

**Date:** 2026-05-20
**Commit:** demo-6 — the Element popout's "Image" tile opens the OS file picker so users insert their own .png / .jpeg

## Context

Continues demo-6 (place elements into the stack). Tina wanted the "Image" tile in
the Element popout to behave differently from the bundled elements: clicking it
should open the file picker, let the user choose a .png or .jpeg, and drop that
photo onto the canvas as a draggable element.

## Human Directions

- "When users click Image in the Element popup, direct them to their files to
  select their own .png/.jpeg to insert" → the first Image-section tile (id
  `image`) now opens a hidden `<input type="file">`; the picked file is read as a
  data URL and becomes a free element. `DemoEl` gained an optional `src` field;
  Canvas renders `el.src ?? elemSrc(el.id)` for both free and in-stack elements.
- "It opens my files, but selecting a file doesn't appear in the workspace" →
  the file input had been placed inside `ElementPopout`, which unmounts while the
  OS dialog is open (the mouse leaves, the 120ms hide timer fires), so the
  `change` event landed on a detached node and was lost. Moved the input — and the
  FileReader logic — up to `App`, which never unmounts.

## Records of Resistance

1. **First attempt put the file input in ElementPopout.** It passed a Playwright
   test because `fileChooser.setFiles()` resolves almost instantly — faster than
   the popout's 120ms unmount timer. A real user spends seconds in the OS dialog,
   so the popout (and its input) was always gone by the time they picked a file.
   Lesson: a passing automated file-upload test doesn't prove the real flow works
   when the triggering element is short-lived. Fix: the `<input type="file">` must
   live in a component that stays mounted for the whole dialog lifetime.
2. **Verified the fix the right way** — the second test moves the mouse away and
   waits past the hide timer (popout count confirmed 0) *before* setting the file,
   reproducing the real interaction. The upload still landed on the canvas.

## Successes

- Image tile opens the OS file picker, filtered to .png / .jpg / .jpeg.
- Picked file → data URL → appears as a draggable free element, same flow as the
  bundled elements; works even after the popout has unmounted.
- The GIF tile still picks the bundled GIF; only the Image tile uploads.
- Build clean — 256 KB JS / 34.6 KB CSS (78.2 / 6.5 KB gzipped).

## What's Next

- Uploaded images use a fallback height (90px) for the vertical-column stagger
  since real photos have unknown dimensions.
- Demo step after the stack is filled (demo-7 layout panel) still not built.
