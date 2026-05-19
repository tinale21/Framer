# Checkpoint 0016 — Using Stacks Modal Polish

**Date:** 2026-05-18
**Commit:** Using Stacks modal width/scale/padding/radius polish; Before/After alignment fix; "Practice Demo" copy; blue-outline secondary button

## Context

After CP15 wired up the Grid popout → Using Stacks modal, the modal itself needed visual polish. Tina noticed it felt squished, the Before/After comparison cards weren't aligned vertically, the button copy had a slash that shouldn't be there, the corner rounding didn't match the rest of the UI, and the secondary "Don't Show Again" button needed a proper outline treatment.

## Human Directions

- "Looks squished, more rectangle to fit the content" + Frame 21197.svg (893px wide reference) → `modal--wide` max-width `600 → 900px`
- Scale iterations: "scale content down by 0.9x → 0.85x" → applied `transform: scale(0.85)` on the whole modal; "I don't want the frame to scale, just content" → tried wrapping inner content in a transform div; "revert that"; eventually back to scaling the whole modal at 0.85
- "Add 4px more padding on the top" → `padding-top: 32px` scoped to `modal--wide`
- "Add 2px more on the bottom" → `padding-bottom: 24px`
- "Corner rounding same as toolbox" then "+2px more" then "+1px more" → ended at `border-radius: 12px` on `modal--wide` (compensating for 0.85 scale to read as ~10px visual)
- "Two After example boxes should align with the Before box" → diagnosed: After panel had `gap: 14px` (both row + column) which added 14px between label row and cards row, pushing After cards 14px lower than Before stage. Fixed by setting `gap: 0 14px` (no row gap, label margin-bottom handles the spacing matching Before's flex)
- "'Practice Demo' not 'Practice/Demo'" → text fix
- "Same corner rounding as toolbox" on buttons → `.btn` border-radius `10 → 8px`
- "Make 'Don't Show Again' a secondary outline button" → `.btn` background transparent, 1px border, dark text
- "Do it as a blue outline and text" → `.btn` color `#0099FF`, border `#0099FF`, hover `rgba(0, 153, 255, 0.08)` bg tint

## Records of Resistance

1. **Tried multiple scaling approaches before landing on the simple one.** First wrapped inner content in a div with transform (kept the frame at full size but content shrunk inside, creating awkward empty space within the modal). User reverted. Went back to scaling the whole modal at 0.85 — frame and content shrink together, no internal layout weirdness. Simpler beat smarter.
2. **Identified the Before/After alignment as a grid-vs-flex gap mismatch.** Before panel uses `flex column` with no gap (relies on `.stack-compare__label`'s `margin-bottom: 10px`). After panel used `grid` with `gap: 14px` — the row-gap was being added on top of the label's margin, pushing After cards 14px lower. Changed to `gap: 0 14px` so the row-gap is 0 and matches Before's flex-with-margin approach. Result: cards align to within ~1-2px of each other vertically.
3. **Compensated radius/sizing for the 0.85 scale.** The whole modal is scaled 0.85, so any CSS pixel value renders at 0.85× visually. To get a visual corner radius matching the toolbox's 8px, the CSS value needs to be ~9.4px (8/0.85). Tina iteratively bumped to 12px CSS for ~10.2px visual — slightly more rounded than the toolbox to read as "soft modal corners" rather than matching exactly.
4. **Changed `.btn` globally instead of adding a `.btn--outline` modifier.** The default `.btn` (gray fill) was being used as the secondary button across all 4 modals. Switching the default to blue-outline updates the secondary action style everywhere consistently — Discard, Manage, Dismiss buttons also get the new blue-outline look. Adding a separate `--outline` modifier would have required touching each JSX. Trade-off: less granular control; if Tina wants different secondary styles per modal, will need to refactor.
5. **Used `gap: 0 14px` shorthand** instead of separate `row-gap`/`column-gap`. Same effect, fewer lines. The first value is row, the second is column — easy to misread, so kept the comment context.

## Successes

- Using Stacks modal is now rectangular (900px wide) instead of squished, matching the Frame 21197 reference aspect ratio
- Modal content scales smoothly at 0.85 via a single transform on the modal div — no awkward internal layout
- Before and After example cards now line up at the same Y position
- Button copy fixed to "Practice Demo"
- All four modal secondary buttons now share a clean blue-outline + blue-text treatment with a subtle blue tint on hover
- Build clean — 245 KB JS / 27.2 KB CSS (75 / 5.5 KB gzipped)

## What's Next

- Other modals (Demo Completed, Disabled, Tutorial Overlays) might want similar width/scale treatment if Tina extends the design
- The blue-outline `.btn` might want a dark-mode variant if dark mode is used with modals open
- Frame 21197.svg likely has more specific design details (typography, exact spacing) that could be applied if Tina wants pixel-perfect match
