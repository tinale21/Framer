# Checkpoint 0020 — Base Hover Popout

**Date:** 2026-05-19
**Commit:** New BaseHoverPopout: 5 template tiles stacked full-width, vertically scrollable

## Context

After CP19 wired up Vector + Component popouts, the Base tile in the right sidebar still had no hover popup (it only opened the existing scene-based `BasePopout` on click for the tutorial flow). Tina sent `Frame 21195.svg` — a 233×181 vector with 5 template-preview cards in a 2-column asymmetric layout (large "Meet Framer Internet canvas" tile + FAQ + stats + testimonial + logos). Wanted same hover/scroll rules as Element popup, but layout sized so the items don't feel cramped.

## Human Directions

- "Use Frame 21195.svg as the Base hover popout, same rules as Element popout" → built first as image-with-overlay-zones at popup-width fit (233 → 238 inner, scale ~1.02×); 5 zones, blue hover ring
- "Items feel too small. Don't squish it. Keep the size and just make the frame scrollable" → switched to **1-column stacked** layout: each tile rendered at full popup width (238) by cropping the source SVG, so a large tile like Meet Framer ends up ~242 tall; total stacked height ~760 vs 280 max-height → scrolls
- "Try 2-column like the SVG, scrollable instead of scaling it down" → bumped to 1.7× render with `overflow: auto` both axes
- "Only vertical scroll, keep horizontal padding" → SVG back to fit popup width
- "Nevermind let's just revert back to one column" → restored 1-column stacked
- "Hover state is a bit off" → swapped `outline` (inset, getting clipped by `overflow: hidden`) for `box-shadow` (outset, respects border-radius cleanly)
- "Redo the text on the base options — they appear weird" + "keep text the same, just redo it so it looks neater" → tried full HTML rebuild (lost visuals), then HTML overlays with masking boxes (looked messy)
- Tina sent `Frame 21195 (1).svg` with vector text removed → wired up HTML text overlays at native-coord positions to render Meet Framer title / FAQ / labels / quote / Logos as crisp HTML
- "It's still a bit off" → iterated on overlay positions twice using Playwright screenshots for ground-truth positioning
- Tina re-did the text within Figma and sent `Frame 21195 (2).svg` → reverted to plain SVG image rendering, no overlays

## Records of Resistance

1. **Full HTML rebuild attempt was a misfire.** Replaced all 5 tiles with HTML/CSS reproductions of the visuals (shapes, FAQ pills, stats, quote, logos). Tina caught it immediately: "Some stuff disappeared." Lesson: when she says "redo the text," she means *just* the text, not redraw the whole tile from scratch.
2. **Tried to strip text-colored paths from the SVG with `awk`.** Filtered by fill color (`#020202`, `#010101`, `#010000`) — successfully removed most text but the shape icons in tile 1 used the same fills, so they vanished too. Different fill set killed shapes but missed the quote/logo text. **Color-based text detection doesn't work when text and visuals share fills.** Reverted and asked Tina for a clean SVG.
3. **HTML overlays needed precise positioning** and pixel math kept being off by 4–10 native units. Set up Playwright + qlmanage rendering pipeline (installed Playwright Chromium) so I could screenshot rendered tiles and measure pill positions instead of guessing. Got closer but the user opted to fix it in Figma instead — the right call (Figma is where the SVG design lives; trying to overlay HTML on a baked-in vector is fragile).
4. **Box-shadow vs outline for hover ring**: outline-offset: -2px was being clipped by the button's own `overflow: hidden` in some browsers, so corners weren't rendering. Switched to `box-shadow: 0 0 0 2px #0099ff` — sits outside the element box, respects border-radius, no clipping.
5. **Suppressed hover popup during tutorial scenes** (`base-hover`, `stack-tutorial-modal`, `disabled-tutorial-modal`) so the new hover popup doesn't overlap the existing scene-based `BasePopout` that's part of the demo flow. They share the same screen real estate; can't show both.

## Successes

- BaseHoverPopout: 5 tiles cropped from the source SVG, each stacked at full popup width (238) so nothing is squished
- Total stacked height ~760 px > 280 max-height → vertical scroll engages naturally; horizontal stays clipped
- Same popup chrome as Element/Vector/Component popouts: 270 wide, 16 padding, scale 0.9×, light + dark mode
- Hover ring: 2px Framer-blue `box-shadow` outset, clean rounded corners
- Tutorial flow preserved — clicking Base still triggers the existing scene transition; hover popup is suppressed during tutorial scenes
- Build clean — 250 KB JS / 30.5 KB CSS (76.2 / 5.8 KB gzipped)
- New tooling: Playwright Chromium installed locally + `/tmp/measure-base.js` for screenshot-based position verification of popouts

## What's Next

- `public/vector-popup.svg` still unreferenced (from CP19) — could prune
- Wire tile `onClick` to scene transitions if Tina wants Base options to advance the demo
- Element popup could use the same per-tile-full-width treatment if its 2-column grid ever feels too small
