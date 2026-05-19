# Checkpoint 0010 — Canvas Hover, Selection States, and Polish

**Date:** 2026-05-18
**Commit:** Canvas frame/canvas hover + sticky selection states (frame vs white canvas); padding/scale/typography polish

## Context

After CP09 wired up drag + zoom for the canvas, Tina turned to the hover/selection visual states. The goal was to match Figma/Framer's selection model: hovering shows a preview outline, clicking makes the selection sticky, and clicking outside clears it. Crucially, there are TWO independent selection targets — the frame card as a whole (the gray area + title row), and the white canvas content inside. Hovering or clicking each one applies different visual treatment (Home/plus turn blue when the frame is the target; Desktop bar turns blue when the white canvas is the target).

The visual specs converged over several rounds: outline `#0099FF` (1px hover, 2px selected); Desktop bar fill `#D3E5F1`; "Desktop" and "1200" text `#0099FF`; play button `#0099FF` with white icon; Home text + plus button `#0099FF`. The behaviors split: frame hover/selection shows Home+plus blue, canvas hover/selection shows Desktop bar blue.

Then Tina polished the spacing: canvas padding +2px and +4px in two rounds, scale shrunk from 0.85 to 0.765 (0.9× existing), Desktop bar +4px taller with text/play scaled up 1.1× proportionally, "1200" pulled 2px left. Removed the "Breakpoint +" UI I'd added too eagerly. Finally split the click behavior so the white canvas and the frame are independent sticky selections that override each other.

## Human Directions

- "Increase the padding by 2px" → `20px 22px 18px → 22px 24px 20px`
- "Add a hover state and when the canvas is clicked, like Framer's reference" + Image 27 → first pass with selected state tied to `homeExpanded`, blue outline, Breakpoint UI
- Color spec iterations: "stroke `#0099FF`, desktop box `#D3E5F1`, text `#0099FF`, play button `#0099FF` with white icon" → applied to both hover and selected states
- "Remove the breakpoint feature" → ripped the Breakpoint UI back out
- Sizing: "scale everything by 0.9×" → `INITIAL_SCALE 0.85 → 0.765`
- "Reduce white canvas vertically by 4px, increase desktop frame by 4px" → bar padding `10px → 12px` (auto-shrinks canvas via flex)
- "Scale them up proportionally" (play button + text) → play `22→24px`, Play SVG `11→12`, font `13→14px`
- "Move 1200 text left by 2px" → `margin-left: -2px` on `.frame-card__bar-size`
- "Hover on canvas shows stroke; hover on white canvas moves stroke to white canvas" → introduced `:has(.canvas-content:hover)` to swap which element holds the outline
- "Home/plus blue on frame hover; Desktop bar blue on canvas hover; mutually exclusive" → split the hover treatment into two zones
- "Selected state follows the same rule" → applied the same conditional logic to the sticky state
- "Make selection sticky (click to stay selected until clicked outside)" → lifted state to App as `selection: 'none' | 'frame' | 'canvas'`, separate click handlers for frame and canvas-content, `:not()` chains to keep hover overrides working with the sticky state
- "When canvas is selected, don't let frame hover work" → added `:not(.frame-card--canvas-selected)` to the frame-hover rules
- "Increase canvas padding by 4px more" → `22px 24px 20px → 26px 28px 24px`

## Records of Resistance

1. **Used `:has(.canvas-content:hover)` instead of JS for the swap-on-hover behavior.** Modern CSS handles "if a descendant matches, style the ancestor" via `:has()`, which is supported in all current browsers (Chrome/Edge 105+, Safari 15.4+, Firefox 121+). Avoids adding a mouseenter/leave hook just to manage a hover class. Flagged for older browser support — easy to swap to JS if needed.
2. **Lifted selection state to App rather than keeping it inside Canvas.** Selection state needs to coordinate with the sidebar's home dropdown (sidebar toggle should select/deselect the canvas; canvas selection should open the home dropdown). Lifting to App makes the two-way binding clean: `homeExpanded = selection !== 'none'` is a derived value, `toggleHome` flips between `'none'` and `'frame'`, and Canvas just calls `selectFrame()`, `selectCanvas()`, `deselect()`. No useEffect-sync hacks needed.
3. **Used `:not(...)` chains for the suppress-hover-when-canvas-selected rule.** When `frame-card--canvas-selected` is active and the user hovers the gray frame area, the frame-hover rule would normally apply (1px outline + Home/plus blue). User wanted that suppressed. Added `:not(.frame-card--canvas-selected)` to the three frame-hover selectors. Cost: three extra `:not()`s in the selectors. Cleaner than overriding with !important or duplicating rules per selection state.
4. **CSS rule ordering matters for specificity ties.** Selection rules and hover rules often have equal specificity. Wrote selection rules first, then hover rules, so hover overrides selection where both apply (the hover preview wins as expected). Specifically, `.frame-card--selected:hover { outline: 2px... }` ensures the 2px width holds even when `.frame-card:hover` would set 1px.
5. **Kept the demo flow's click-to-advance behavior independent.** Demo hint buttons inside `canvas-content` bubble clicks up to canvas-content's onClick (which would now call `selectCanvas`). The demo hint's own onClick fires first to advance the scene, then the bubble triggers canvas selection too — a minor side effect. Not addressed since the demo flow still works; could add `e.stopPropagation` to demo hints later if it becomes annoying.

## Successes

- Two independent sticky selection states (frame vs canvas) that mirror Figma's behavior — click to select, clicks outside deselect
- Hover preview works on top of selection state — hovering the frame area when nothing selected previews the frame-hover styling; hovering the canvas previews the canvas-hover styling; both states transition cleanly
- Color spec applied consistently — outline `#0099FF` (1/2px), Desktop bar `#D3E5F1`, Home/plus + Desktop text `#0099FF`, play button `#0099FF`
- Canvas padded and scaled to fit the new content area without breaking the drag/zoom transforms (inline `translate(x, y) scale(s)` still works on top of the static layout)
- Proportional resize of play button + text when the bar grew (visual rhythm maintained)
- Lifted selection state to App without coupling Canvas to the sidebar — both observe the same source of truth (`selection` value via derived `homeExpanded`)
- Build still clean (242 KB JS / 21.4 KB CSS, 74.4 / 4.7 KB gzipped)

## What's Next

- Demo hint clicks inside canvas-content trigger canvas selection as a side effect; could `stopPropagation` on them
- Properties panel (right sidebar, when stack selected during demo) still uses CP01 styling
- The hover-preview-overrides-selection logic depends on CSS source-order specificity — fragile to refactoring. Could extract into a `useSelectionState` hook with class-toggle logic if it grows.
- Canvas Y position (`INITIAL_Y = 84`) and initial scale (`0.765`) are hardcoded constants — could turn into props if the canvas should size based on viewport.
