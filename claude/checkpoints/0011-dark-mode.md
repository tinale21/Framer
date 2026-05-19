# Checkpoint 0011 — Dark Mode

**Date:** 2026-05-18
**Commit:** Click-the-moon-icon dark mode toggle with a Framer-style palette applied across every surface

## Context

After CP10 nailed down the canvas hover/selection model, Tina wanted dark mode — toggled by clicking the moon icon in the bottom toolbar, with the visual based on Framer's actual dark mode (not a redesign, just the palette applied to the existing structure). The Framer reference image showed a dark `#1A1A1A`-ish app background, slightly lighter `#2A2A2A` pill/button surfaces, white primary text, gray secondary text, the white canvas area unchanged (since that represents the user's design), and the Framer blue accent (`#0099FF`) preserved for selections, the avatar, and the Publish button.

## Human Directions

- "Create a dark mode. Click on the moon icon on the toolbar to toggle it. Take Framer's color palette and apply it" + reference image of Framer's dark mode → wired up a `darkMode` state in App, added `onToggleDarkMode` to BottomToolbar's moon button, applied `.app--dark` class to the root, and wrote comprehensive `.app--dark` CSS overrides for every surface
- "Make the desktop frame fill in the middle a dark gray" → first try `#1F1F1F` (darker than the surrounding frame card)
- "Try a lighter shade" → bumped to `#353535` (now lighter than the frame card, gives the bar more visual separation)

## Records of Resistance

1. **Used `filter: invert(1) hue-rotate(180deg)` for the 4 non-avatar topbar SVG pills.** Those SVGs have their pill background and icon color baked in (`<rect fill="#F3F3F3"/>` + dark icon paths). In dark mode they'd look white-on-black which is jarring. The cleanest options were (a) create dark `-dark.svg` variants, (b) inline the SVGs as React components and use CSS vars, or (c) CSS filter. Filter is one line per affected pill — much faster than 4 new SVG files or inlining 4 SVG components. The result isn't pixel-perfect to Framer's dark mode but reads correctly as "dark pill with light icon." If precise colors become important, swapping to dark SVG variants is a clean upgrade path.
2. **Excluded the TL avatar from the invert filter.** The avatar pill is already `#0099FF` (Framer blue) which Tina explicitly wants to keep in both modes. Wrote the filter as attribute-scoped selectors (`.topbar__pill[alt="globe"]`, etc.) rather than a blanket `.topbar__pill` rule, so the avatar's blue stays untouched.
3. **Kept all blue selection/hover states in dark mode.** Frame-hover Home/plus turning blue, canvas-hover Desktop bar turning blue, selection 2px blue outline — all preserved as-is. The dark mode overrides only swap the resting colors; the interactive states retain their Framer blue accent.
4. **Canvas content (white) stays white in dark mode.** This represents the user's actual design surface (a webpage being designed) — in Framer's real dark mode it stays the user's design color too. Only the chrome around it goes dark.
5. **Toggled the moon icon to a sun icon in dark mode.** Matches Framer's behavior — moon icon in light mode (click to go dark), sun icon in dark mode (click to go light). Inlined the sun SVG (circle + 8 ray strokes) rather than adding another asset.
6. **Didn't extract colors into CSS custom properties for theming.** Could have introduced `--bg-app`, `--text-primary`, etc. as theming variables that both light and dark modes set. Stuck with explicit `.app--dark .selector { ... }` overrides because:
   - Most existing components already use hardcoded hex values (extracting all of them would be a refactor)
   - The override list is contained in one block at the end of the CSS file — easy to scan and modify
   - For a prototype, theme-via-overrides is fine; theme-via-variables would be needed for a 3rd theme (e.g., high contrast) or per-component theming

## Successes

- One-click dark mode that swaps the entire UI: topbar, sidebars, canvas surround, frame card, Desktop bar, bottom toolbar, all pills/buttons/dropdowns, tab indicators
- Framer blue (`#0099FF`) preserved everywhere it matters — TL avatar, Publish button, selection outlines, hover states
- White canvas stays white (the user's design surface is not affected by editor chrome)
- Moon → sun icon swap on toggle, matching Framer's UX
- All hover/selection states still work correctly in dark mode (frame-hover Home+plus blue, canvas-hover Desktop bar blue with appropriate dark-blue tint `#14304A` instead of `#D3E5F1`)
- Build stays clean — 242 KB JS / 25.5 KB CSS (74.6 / 5.3 KB gzipped, +4 KB CSS for the dark overrides)

## What's Next

- Dark variants of the topbar pill SVGs (would replace the filter trick for pixel-perfect color fidelity)
- Modal dialogs (Stack tutorial, Demo Completed, etc.) — currently styled for light mode only; would need dark mode overrides
- Demo flow scene content — the demo's mocked stack/cursor visuals could use dark-mode-appropriate variants
- Persist `darkMode` to localStorage so the toggle survives page reloads
- Respect `prefers-color-scheme` for initial state
