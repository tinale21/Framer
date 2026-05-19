# Checkpoint 0012 — Pill Tab Text Centering Fix

**Date:** 2026-05-18
**Commit:** Pill-tab text centering with sub-pixel measurement to fix Code-tab alignment

## Context

After CP11 added dark mode, Tina noticed the Pages/Assets/Code segmented control had a centering issue — when "Code" was selected, the text appeared with more right-side padding inside the active pill compared to Pages or Assets. The pill indicator was sized correctly to the button's bounding box, but the active state's bolder font-weight (600 vs 400) introduced fractional pixel widths that `offsetWidth` was rounding away, leaving the indicator a half-pixel-or-so wider than the actual text bounds.

## Human Directions

- "Make sure the text is adjusted to be center-aligned to the active box when selected" → first pass added `display: inline-flex; align-items: center; justify-content: center; text-align: center`
- "The Code one looks off" → reverted the inline-flex change (likely caused layout shift) and kept just `text-align: center`
- "It looks like there's more right side padding of the text between the active box when Code is selected" → switched measurement from `offsetLeft`/`offsetWidth` to `getBoundingClientRect()` for sub-pixel accuracy, and added `display: inline-block; white-space: nowrap; box-sizing: border-box` to lock the button's intrinsic sizing

## Records of Resistance

1. **Reverted the inline-flex change after the first try.** Adding `display: inline-flex` on a button child of a flex container can subtly change how the intrinsic width is computed (flex items inside a flex parent have their own min-content sizing rules). Tina immediately spotted the Code tab looking off, so I reverted to inline-block which behaves more like the button default.
2. **Used `getBoundingClientRect()` instead of `offsetWidth`.** `offsetWidth` returns an integer (rounded), while `getBoundingClientRect()` returns sub-pixel floats. When the active tab's bold-weight text has a fractional pixel width, integer rounding makes the indicator end up a fractional pixel too wide — visible as extra padding on the side where the rounding lands. Sub-pixel measurement fixes this.
3. **Added `white-space: nowrap` and `box-sizing: border-box` defensively.** Both are safe additions that prevent edge-case width drift across browsers — `nowrap` ensures the single-word text doesn't try to wrap (which would change its width calculation), and `border-box` ensures the padding is included in the measured width consistently.

## Successes

- Code tab now centers correctly within its indicator pill — text padding visually matches Pages and Assets
- Sub-pixel-accurate indicator positioning eliminates the half-pixel drift caused by integer rounding
- Indicator measurement re-runs cleanly whenever the active tab changes (the active button's bolder font width is captured correctly on each transition)
- Both the left sidebar's Pages/Assets/Code and the right sidebar's Design/Prototype use the same pill-tab CSS now, so both benefit from the fix
- Build clean (242 KB JS / 25.5 KB CSS, 74.6 / 5.3 KB gzipped)

## What's Next

- Could lift the `useLayoutEffect` measurement into a shared `usePillIndicator` hook so the left and right sidebars don't duplicate the logic
- Dark variants of the topbar pill SVGs (still using the CSS filter trick from CP11)
- Modal dialogs not yet dark-mode-styled
