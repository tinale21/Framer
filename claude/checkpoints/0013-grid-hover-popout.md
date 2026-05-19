# Checkpoint 0013 — Grid Hover Popout

**Date:** 2026-05-18
**Commit:** Grid-tile hover popout (Frame/Stack/Grid/Masonry) with stay-while-hovered behavior; insert-tile icons shrunk inside their dark squares; Base hover trigger removed

## Context

After CP12 fixed the Code tab centering issue, Tina moved to building out the Grid tile's hover popout — a 4-item picker (Frame, Stack, Grid, Masonry) that appears to the left of the Grid tile when hovered. She provided a Grid.svg reference showing the design: white card with 4 stacked options each with their own little layout-icon SVG (single square, two bars, 2x2 grid, mixed masonry). After several rounds of polish on sizing, spacing, padding, and corner-rounding, the popout now matches the reference visually and has the right interaction behavior — including a small grace timer so the mouse can traverse the 12px gap between the Grid tile and the popout without the popout disappearing.

She also removed the Base tile's hover-trigger (it was opening the BasePopout tutorial flow on hover, which was annoying; clicks still trigger it) and shrunk the icons inside the insert tile's dark squares so they feel more contained rather than filling the entire 22x22 box.

## Human Directions

- "This should appear when you hover over Grid, not Base" + Grid.svg → built `GridPopout.tsx` with 4 layout-picker items (Frame, Stack, Grid, Masonry), wired hover state on the Grid tile only
- "Make sure it disappears when not hovering" → wrapper handles mouseenter/leave, conditional rendering
- "Remove the hover on Base" → stripped `onMouseEnter` from the Base tile (clicks still trigger the tutorial)
- "Scale it down by 0.9×" → `transform: scale(0.9); transform-origin: top right`
- "Make Stack default white like the others; only show selected on hover" → removed `--selected` class from Stack; hover styles take over
- "Make hover persist when moving from Grid tile to the popup" → introduced `hideTimerRef` with a 120ms grace period; mouseenter on either tile or popup cancels the pending hide
- "Frame, not Free" (label fix) → "Free" → "Frame"
- "Decrease item gap by 2px" then "2px more closer" → 16px → 14px → 12px
- "Padding 8px around items" then "16px" → 16px (kept final)
- "Corner rounding the same as the toolbox" → matched 8px (bumped to 9px to compensate for the 0.9× scale → ~8.1px visual radius)
- Width nudges: 290 → 286 → 282 → 274 → 270px (~20px narrower than initial)
- "Icons #A6A6A6 by default; hover bg #0099FF, text and icon #FFFFFF" → applied to popout-grid items, with matching dark-mode overrides
- "Make insert-tile icons a bit smaller in the dark box" then "a bit smaller again" → 22 → 18 → 16px inside the still-22px container

## Records of Resistance

1. **Used a 120ms timer for the show/hide hover bridge.** When the popup is positioned 12px to the left of the Grid tile, the mouse leaves the tile's bounding box during the gap traversal and enters empty space before reaching the popup. Without a delay, the popup would unmount mid-traversal and the user would never reach it. Considered CSS-only solutions (transparent ::before bridge, larger hit area) but those add visual layout complexity. The timer is one ref + two helper functions, fires correctly on every hover transition, and is cleaned up on unmount.
2. **Wrapped the popup in a second mouseenter/leave handler.** Both the wrapper (containing the Grid tile) and the popup itself listen for mouseenter/leave. The popup conditional render means it only exists when hovered, but during that window, hovering the popup itself must keep `gridHovered = true`. Without the inner mouseenter, moving the mouse onto the popup would still trigger the wrapper's mouseleave (because the popup's absolute position takes it outside the wrapper's bounding box), the timer would fire, and the popup would close.
3. **Compensated radius for the 0.9× transform scale.** When the popup is scaled, all values shrink proportionally including the border-radius (8px CSS × 0.9 = 7.2px visual). To make the visual radius match the toolbox's unscaled 8px, bumped the popup's CSS radius to 9px (9 × 0.9 = 8.1px visual). Same principle could apply to other scaled-down properties (font, padding) but the user didn't ask, and they read fine at the smaller size.
4. **Did not use a React portal for the popup.** A portal to `document.body` would let the popup escape any clipping ancestor (e.g., the right sidebar's `overflow: hidden`). Instead, I changed the right sidebar to `overflow: visible` — simpler, no portal plumbing, no need to manage absolute positioning relative to the document. The right sidebar's content already fits naturally without scrolling, so visible overflow doesn't cause issues.
5. **Constrained inner SVG with CSS instead of changing the icon component default size.** The icons.tsx defaults stay at `size = 22`, but `.insert-tile__icon svg { width: 16px; height: 16px; }` shrinks them only inside the insert tile context. Other usages (canvas content, modals) keep their original sizing. This is the right scope for the change.

## Successes

- Grid hover popout matches the Grid.svg reference: white card with 4 stacked items, each with a layout-pattern icon, blue hover state, and a smooth show/hide
- Mouse can traverse the gap between Grid tile and popup without losing hover (120ms grace timer)
- Stack item behaves like the others by default (white) and shows the selected look only on hover
- Insert tile icons now feel proportional inside their 22x22 dark containers (16x16 icon → 3px padding on each side)
- Base tile no longer triggers the tutorial popup on hover — only clicks do
- Right sidebar changed to `overflow: visible` cleanly to allow the popup to render outside its container
- Dark-mode adaptations for the popup (item bg #2A2A2A, hover stays #0099FF for accent consistency)
- Build stays clean — 244.8 KB JS / 27 KB CSS (74.9 / 5.5 KB gzipped — +2 KB JS for GridPopout, +1.5 KB CSS for popup styling)

## What's Next

- Could lift the hover-bridge timer logic into a reusable `useHoverDelay` hook if more tiles get hover popouts
- Other insert tiles (Text, Vector, Element, Component) could get similar hover popouts if Tina wants
- The popout's `right: calc(100% + 12px)` position assumes the right sidebar is wide enough that 270px doesn't push the popup off the visible canvas area; could need adjustment on narrow viewports
