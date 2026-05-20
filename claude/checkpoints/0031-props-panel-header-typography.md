# Checkpoint 0031 — Properties-Panel Header, Typography & Alignment Icons

**Date:** 2026-05-20
**Commit:** add a divider under the Design/Prototype tabs, swap the header icon
and label, retune the panel typography, and replace the alignment icons with the
filled segmented-control art

## Context

Continues the properties-panel polish from 0030. A series of small visual
adjustments to the panel that opens in the demo-7 layout step.

## Human Directions

- "Add a divider below the Design/Prototype tabs at the same position/length as
  the Insert panel's, then space Shape and everything below to match" → a
  `<div className="divider" />` after the header; `shape-header` gets
  `marginTop: 6` so divider→content is 22px (matches Insert, verified).
- "This is the icon next to Image" (`icon-park-solid_figma-component.svg`) → the
  single-diamond `Diamond` icon replaced with the four-diamond Figma component
  glyph, renamed `ComponentBadge`.
- "Change the Image text to Shape" → header label is now "Shape".
- "Keep Shape semi-bold, make the other panel text medium weight" → `.props-row`
  and `.props-section-title` dropped 600 → 500; `.shape-header__title` stays 600.
- "Make the labels (Positioning, Alignment, Layout, etc.) 12px — not the tabs" →
  `.props-row` / `.props-section-title` font-size 13px → 12px; `.tab` untouched.
- "Make the alignment icons look like this with a fill" (`Frame 21186 (2).svg`) →
  alignment row replaced with the supplied SVG (two `#E9E9E9` pills, filled
  `#737373` icons, guide lines at 50% opacity), served from `public/`.
- "Move Positioning and everything below it down 2px" → `marginTop: 2` on the
  first `.props-section`.

## Records of Resistance

1. **Header label changed mid-edit.** First asked to rename "Image" → "Stack";
   the edit was interrupted and redirected to "Shape" instead.
2. **Label weight walked back.** 0030 set the section labels to 600 to match the
   left sidebar's "Pages"; this checkpoint dials them back to 500 (medium), with
   only "Shape" kept at 600 — the bold-everything look was too heavy.

## Successes

- Divider + spacing under the tabs matches the Insert panel exactly (16px / 22px).
- Alignment row matches the supplied SVG — filled segmented controls with pills.
- Removed the now-dead `Bar` helper and six `Align*` icon components from
  `icons.tsx` (the SVG replaces them).
- Build clean — 259.7 KB JS / 37.2 KB CSS (79.6 / 6.9 KB gzipped).

## What's Next

- Alignment row is a static `<img>` (display-only, non-interactive) — fine for the
  demo; would need real controls if the panel ever becomes interactive.
