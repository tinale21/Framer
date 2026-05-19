# Checkpoint 0018 — Element Popout Sections

**Date:** 2026-05-19
**Commit:** Element popout rebuilt as labeled sections (Image / Video / Music) over a new 8-tile vector SVG

## Context

The Element hover popout went through several iterations across the prior session — PNG-embedded SVGs that couldn't be styled, broken clip-paths, awkward overlap math, and a "squished" 4-button background-clipping attempt. Today landed on a clean architecture: HTML labels + cropped SVG strips + invisible button overlays. New vector source (`Frame 21194.svg`, 229×715, 81 KB) is a 2-column grid of 8 tiles grouped into three sections: Image (2), Video (3), Music (3).

## Human Directions

- "Let's just try this element popup over again. Instead use this: Frame 21194.svg. Still keep the frame size the same as it is currently and make it scrollable" → swapped SVG, kept popup 270×280 with `overflow-y: auto`, percentage-based hover zones over the full image
- "Looking good. Can you make the image, video, and music text #888888. Make sure the text and its group are evenly spaced. Text-to-group 8px spacing. Each group (including text) 12px spacing" → restructured into 3 sections: HTML labels (`#888888`, 14px / 500) + cropped SVG strips per section using `overflow:hidden` + negative-top img positioning; 8px section internal gap, 12px between sections
- "Make the text #767676 actually and increase the spacing between the text and the group by 4px and increase the spacing between each group (including text) by 12px" → label color → `#767676`; section gap 8 → 12px; outer gap 12 → 24px
- "Make the text a medium size font" then "i don't want the size to increase, just the weight" → bumped to 16px then reverted to 14px (weight stays 500)
- "Try semi-bold" → font-weight 500 → 600
- "Increase the spacing between each group (including text) by 4px" → outer gap 24 → 28px

## Records of Resistance

1. **First "squished" attempt used `background-image` clipping with `background-size: 100% auto` across 4 stacked buttons.** Each button was a different height and shared one bg-image. Looked compressed because the 4-tile SVG visually condensed into the popup, and the slight overlaps between SVG clip rects caused doubled-up content between adjacent buttons. Tina called it: "uhh why is everything so squished." Reverted.
2. **Then tried single-img + overlay-zone approach with the 4-tile SVG.** Cleaner visually (no clipping artifacts) and zones used CSS percentages so they auto-scaled with the image. This was the right pattern — and is what survived into the final implementation, just adapted to 8 tiles and split across 3 sections.
3. **For the section-by-section layout, picked overlay zones over splitting the SVG into 3 files.** Splitting would have meant editing the SVG by hand or building a runtime crop. Instead, each section renders the same `elements-popup.svg` at full size (228×711 px in CSS — SCALE = 238/229 ≈ 1.04× of native), positioned with negative `top` inside an `overflow: hidden` strip that's only as tall as the tile rows for that section. This hides the SVG's own baked-in labels and lets HTML labels with proper `#767676` semibold styling sit between sections.
4. **`SCALE` is hardcoded based on popup inner width (270 − 32 padding = 238) divided by SVG native width (229).** Not responsive, but the popup is fixed at 270px so it doesn't need to be. If popup width changes, every pixel value in `ElementPopout.tsx` recalculates from `SCALE` automatically — the `SCALE` constant is the single source of truth.
5. **CSS edits collided twice with `.popout-grid` having identical declarations** (`padding: 16px; gap: 12px; ...`). `Edit` failed with "Found 2 matches" until I added enough context (the `.popout-element {` selector or `max-height: 280px;` line) to disambiguate. Worth remembering: shared popout styles between Grid and Element popouts mean small-context edits are ambiguous.

## Successes

- Element popout now displays 8 tiles organized into 3 visually-labeled sections (Image / Video / Music)
- HTML labels at `#767676` semibold 14px — sit cleanly between sections, fully styleable
- Inner spacing: 12px between label and tile strip; 28px between sections — gives proper visual rhythm
- Vector SVG (81 KB) replaces the previous 2.4 MB PNG-embedded SVG — massive bundle-size win
- Each of the 8 tiles is an individual `<button>` with a blue inset hover outline (`#0099ff`, 2px, 8px radius)
- Popup frame unchanged: 270 wide, 280 max-height, scrolls vertically since 3 sections + 28px gaps exceed 280px
- Hover-stay grace timer (120ms) still works — mouse can traverse the 12px gap between Element tile and popup
- Build clean — 246.6 KB JS / 28.1 KB CSS (75.4 / 5.62 KB gzipped)

## What's Next

- Wire each tile's `onClick` to scene transitions if Tina wants Image/Video/Music selection to advance the demo
- Could mirror the same labeled-section pattern in GridPopout if more grid types get added (currently single section)
- Dark-mode override for `.popout-element__label` might need explicit color since `#767676` is mid-gray (probably fine on dark too, but worth verifying)
