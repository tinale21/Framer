# Checkpoint 0028 — Text Tool

**Date:** 2026-05-20
**Commit:** a working Text tool — place, edit, select, move, delete text; drop it into the demo stack

## Context

Tina asked for a working Text feature: selecting Text lets the user type on the
canvas. This grew over several rounds into a full text tool, plus fixes to how it
interacts with the canvas, the demo stack, and demo-6 panning.

## Human Directions

- "Make the text feature work" → clicking the Text tile arms the tool; the canvas
  shows the I-beam cursor; clicking drops a focused text box with a blinking caret.
  Multi-line, auto-sizing (`field-sizing: content`), one-shot like Figma.
- "Pulsing bar gray/black, and a text box (gray typing / blue selected)" → caret
  `#1a1a1a`; box border light gray while editing, blue when selected. Added a
  `selectedText` state separate from `editingText`.
- "Smaller text, lighter gray box, more pad" → 16px; iterated padding to `2px 4px`
  and the editing border to `#b8b8b8`.
- "Text is stuck, not deletable" → text now lives inside the frame-card so it pans
  and zooms with the canvas; Delete/Backspace removes the selected text.
- "Make it a text box with 4 corner handles" → white/blue corner handles on a
  selected text box.
- "Can't move the text" → text boxes are now drag-to-move (screen delta ÷ zoom).
- "Text should drop into the stack like elements" → dragging text over the demo
  stack drops it in, center-aligned with the elements.
- "Delete only the text, not an element too" → element vs text selection is now
  mutually exclusive.
- "Press T to insert text" → `T` arms the tool (ignored while typing in a field).
- "Can't drag/zoom after" → text mode had no off-switch; `Escape` and re-clicking
  the Text tile now disarm it. Panning was also blocked at demo-6 — now enabled.
- "Elements move with the canvas" → `handleElementMouseDown` lacked
  `stopPropagation`, so pressing an element started a drag *and* a pan once demo-6
  panning was on. Fixed.

## Records of Resistance

1. **File-upload bug, repeated as a pattern.** A text feature's hidden input must
   live in a component that outlives the interaction — same lesson as 0027. Here:
   the text file input wasn't the issue, but the `<input type="file">` lesson
   informed keeping shared state in App.
2. **"Doesn't match" was about size, not color.** I first re-colored the gray box;
   Tina meant the editing box was ~3px taller than the selected box. Cause: the
   `<textarea>` defaults to `inline-block` (baseline descender space) vs the static
   `<div>` being `block`. Fixed with `display: block` on the textarea.
3. **Misdiagnosed "can't drag the workspace."** First blamed stuck text mode; the
   real block was demo-6 disabling pan in `handleMouseDown`. Verified base-scene
   panning worked before concluding. Lesson: reproduce before fixing.
4. **Enabling demo-6 pan exposed a latent bug** — elements panned the canvas while
   being dragged because their mousedown handler never stopped propagation.

## Successes

- Full text tool: arm (tile or `T`), place, type, edit, select, move, delete.
- Text moves/zooms with the canvas; drops into the stack center-aligned.
- Element vs text selection mutually exclusive; clean disarm via `Escape`.
- Panning works at demo-6; element/text drags no longer pan the canvas.
- Build clean — 260 KB JS / 35.9 KB CSS (79.2 / 6.7 KB gzipped).

## What's Next

- In-stack text isn't editable once dropped (consistent with in-stack elements).
- Text doesn't survive a demo scene reset; it persists in App state across scenes.
