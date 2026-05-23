# Checkpoint 0042 — Vector Tool, Shape Panel, and Color Picker

**Date:** 2026-05-22
**Commit:** add a working Vector tool (Rectangle / Oval / Polygon / Star / Path)
with a Figma-style color picker driving fill and stroke on the right panel

## Context

The vector tool in the Insert panel was a dead popout. This session built it
into a working drawing/editing tool that matches the Framer reference video,
including a custom color picker with a WCAG contrast curve.

## Human Directions

- "Reference Framer's video and apply it to our format." → built the 4 geometric
  shapes (Rectangle, Oval, Polygon, Star) — drag on the canvas to draw, render
  grey with a size badge, selectable with corner handles, draggable, deletable.
- "Allow making vectors outside the canvas and dragging them in." → an armed
  vector tool draws on mousedown anywhere in the workspace, not just on the
  white frame. Shapes are free-positioned so dragging in already worked.
- "What happened to Path?" → added Path: click anchor points, click first to
  close (polygon), click last to finish open (polyline), Escape to cancel.
- "Shape panel on click with Fill / Stroke editors." → reused the existing
  PropsPanel; Fill and Stroke + rows became interactive when a vector is
  selected (decorative for the stack context as before).
- "Make the color picker more like Figma's." → built a custom popover with an
  SV square, hue + alpha sliders, hex input, eyedropper / format / alpha %
  trim. Then: contrast indicator row, smaller SV, more padding, working
  transparency, smaller hex text.
- "Color contrast curve like Figma's." → iso-contrast curve overlay on the SV
  square (binary-searched v per s at the AA 4.5:1 threshold). Recomputes per
  hue and alpha.
- "Click AA to fix to meet contrast." → clicking the failing AA badge snaps the
  value to the contrast curve, preserving hue / saturation / alpha.
- "Stroke should have a dropdown to expand, with × on the Color row." →
  accordion chevron + sub-rows for Color and Width; × moved to Color.
- "Path AA-fix doesn't actually meet contrast." → contrast was ignoring alpha.
  Switched ratio, the curve, and the AA solver to composite over white using
  alpha — picker now reports the visible contrast.
- "Deleting the stack should leave free items on the canvas." → stack delete
  filters `inStack: true` items only; shapes / free texts / free elements
  remain. Removed the `demo6` gate on free element rendering.
- "Delete during a path draft should pop the last anchor." → lifted pathDraft
  from Canvas to App so the keydown handler can `prev.slice(0, -1)`.

## Records of Resistance

1. **The "Shape panel" the user wanted was the existing stack PropsPanel.** I
   first built a new VectorPropsPanel from scratch; the user clarified by
   pointing to the existing panel and said the Fill/Stroke `+` rows in that
   panel should just become interactive. Reverted and integrated.
2. **Picker contrast was a lie when alpha < 1.** Reported as a path-only bug;
   actually applied to all shapes but the user only used alpha on a path fill.
   Fix: all contrast math (ratio display, iso-curve, AA solver) composites the
   color over white using alpha first. Now the picker is honest, and AA-fix at
   low alpha gracefully picks the darkest achievable color and leaves AA armed
   if the threshold simply cannot be met at that opacity.

## Successes

- Drag-to-draw the 4 box shapes, anywhere in the workspace; drag in / out of
  the white frame. Size badge during draw, default-sized shape on a click.
- Click anchors to draw Path; click first to close, click last to finish open;
  Escape cancels; Delete pops the last anchor (Figma / Illustrator behavior).
- All shapes render as SVG so stroke follows the actual outline (hexagon,
  star, path) rather than the bounding rectangle.
- Shape panel: Fill `+` adds a default grey; Stroke `+` opens an accordion
  with Color and Width; remove with × on the Color row; × on Fill still in the
  Fill row.
- Color picker: 220px wide, ~182×182 SV square, contrast indicator row with a
  half-color swatch + ratio + AA badge + tuning icon, eyedropper, hue + alpha
  sliders, Hex + alpha % inputs. AA badge becomes a button when failing — one
  click snaps the value to the iso-contrast curve preserving HSV-a.
- Iso-contrast curve overlay on the SV square, alpha-aware, recomputed per
  hue / alpha. Hex input is 11px so `CCCCCC` and `100 %` sit comfortably.
- Delete on a selected stack now keeps free items (shapes / texts / loose
  elements). Free elements render in every scene now (was demo-6 only).
- tsc clean; build clean — 298.42 KB JS / 49.03 KB CSS (89.41 / 9.00 gzipped).

## What's Next

- Cosmetic only: eyedropper button (no EyeDropper API yet), the "Hex ▾"
  format dropdown (only Hex format supported), and the tuning icon.
- Bezier curve handles for Path (currently straight-line polyline only).
- Position / Size in the Shape panel are still decorative numbers from the
  stack context — they don't reflect the selected vector's bbox yet.
