# Checkpoint 0019 — Vector and Component Hover Popouts

**Date:** 2026-05-19
**Commit:** Vector tile hover popout (HTML pill rebuild), Component tile hover popout (SVG-image), Framer Marketplace link styling

## Context

After the Element popout rebuild in CP18, the Vector and Component tiles in the right-sidebar Insert list still had no hover popouts. Tina provided `Vector (2).svg` (vector card with 5 pills) and `components.svg` (single-pill card) as the visual reference. The two ended up taking different implementation paths once it became clear they had different requirements.

## Human Directions

- "Following the same color, hover state, and frame size, use this for when users hover over vector. The might be bigger than the grid one so adjust it and make it scrollable: Vector (2).svg" → built first as cropped-SVG strip with overlay hover zones at 270 wide, 280 max-height scrollable
- "It a bit cut off on the right. adjust and scale it so it fits in the padding" → reduced SCALE to 1.6, introduced VISIBLE_W=210 narrower than INNER_W=238, centered the strip with `margin: 0 auto`
- "Try again. keep the option boxes and padding the same used for the grid popup" → **abandoned the SVG-image approach entirely** and rebuilt VectorPopout as 5 HTML buttons styled identically to GridPopout (15×16 padding, 9px radius, `#eaeaea` border, blue hover bg). Used inline SVG icons inferred from the vector source: Path, Rectangle, Ellipse, Polygon, Star
- "The path icon is off" → replaced the redrawn icon with the actual path data from the source SVG (using `fillRule="evenodd"` so the two anchor squares show as hollow corner markers connected by the diagonal stripe)
- "Now this is what popup when users hover over component. Make the frame width the same as the one use for the grid: components.svg" → built ComponentPopout as SVG-image (single pill + header text) cropped to skip outer card, frame width 270 to match Grid
- "It is a bit cut off on the right. scale it again to fit the padding" → applied the same VISIBLE_W=210 + `margin: 0 auto` fix used initially on Vector
- "The padding looks too big. it should be the same padding amount use for the grid popup" → reverted VISIBLE_W back to 238, expanded CROP_X=11/CROP_W=132 to capture pill shadows on both sides without clipping; pill now spans full popup inner like Grid pills do
- "Make the 'Framer Marketplace' link a higher font weight and blue" → `.marketplace-note a` color → `#0099ff`, font-weight → 600 (both light and dark mode)

## Records of Resistance

1. **VectorPopout went through two complete rewrites before landing.** First as SVG-image-with-overlay-zones (same pattern as ElementPopout), which displayed the source SVG's own card-style pills inside the popup card → looked nested. Adjusted by cropping out the outer card, scaling down, centering — all fixes for symptoms, not root cause. Once Tina said "keep the option boxes and padding the same used for the grid popup," the cleaner answer was obvious: rebuild as HTML buttons with the Grid styling. **Should have started there.** Lesson: when the source asset is a list of UI controls that need real hover/click, prefer rebuilding as HTML over rendering and overlaying.
2. **Path icon drawn from scratch didn't match.** First attempt was two `<rect>` corners connected by a polyline — visually unclear. Reusing the actual path data from `Vector (2).svg` (with `fillRule="evenodd"` so the two anchor-point holes punch through) immediately fixed it. **Source assets that exist should be used over hand-redrawing.**
3. **ComponentPopout stayed as SVG-image** because the content is mostly the header text + a single pill, both with text labels I couldn't reliably decode from the path data alone. The label inside the pill is a vector-text path I'd have to OCR or guess to reproduce as HTML. Kept the image approach but iterated on crop/scale to make the pill fit the same 16px padding as Grid.
4. **The "cut off on the right" feedback meant different things at different times.** First time on Vector: cropping clipped the pill drop shadow → fixed with wider CROP_W. First time on Component: same fix worked. Then "padding too big" meant the centered narrower strip felt over-padded — wanted pill flush to popup edges like Grid pills. Solution: keep full-width strip but expand CROP_X/CROP_W to capture shadows on both sides without losing width. **The pattern is: ask whether "cut off" is shadow clipping vs. content overflow — different fixes.**
5. **public/vector-popup.svg is left in the repo even though VectorPopout no longer references it.** Didn't delete it without explicit confirmation. Will be packaged into dist as dead weight — flag for follow-up cleanup.

## Successes

- **VectorPopout** — 5 HTML buttons (Path / Rectangle / Ellipse / Polygon / Star), each with inline SVG icon at 22px, blue `#0099ff` hover bg with white text+icon, same 15×16 padding and shadow as GridPopout, scrollable at 280 max-height (5 items > 280 so it scrolls), 120ms grace hover timer
- **ComponentPopout** — Same 270 frame as Grid, SVG cropped so the source's card border/padding is hidden behind the popup's own card; pill spans full inner width with a blue inset hover outline; shadows captured on both sides without clipping
- **Both** — Dark-mode overrides mirrored from existing popouts
- **Framer Marketplace link** — `#0099ff` semibold, both light and dark mode
- **RightSidebar wiring** — Both new hovers use the same `useState` + grace-timer pattern; cleanup effect now clears all four (grid / element / vector / component) timers
- **Build clean** — 249 KB JS / 29.7 KB CSS (76 / 5.7 KB gzipped)

## What's Next

- Delete `public/vector-popup.svg` (unused after VectorPopout rebuild) — flag for next checkpoint
- ComponentPopout label/header are still baked-in vector paths from the source SVG. If Tina wants to change copy or enable actual click behavior, rebuild as HTML (same approach as Vector)
- Wire pill `onClick` to scene transitions if hover popouts should advance the demo
