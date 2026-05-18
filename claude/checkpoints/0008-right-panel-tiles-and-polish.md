# Checkpoint 0008 — Right Panel Tiles, Dividers, and Spacing Polish

**Date:** 2026-05-18
**Commit:** Insert tiles redesigned from Frame 42-47 SVGs; topbar icons scaled down inside their pills; tab sizing unified; sidebar dividers; sidebar padding bumped 14→16px; dev-nav strip removed; marketplace note restyled; small adjustments throughout

## Context

After CP07 unified the tab pattern, Tina moved to the right sidebar's Insert tiles and provided 6 Frame SVGs (one per tile: Base, Grid, Text, Vector, Element, Component) showing the exact target design — white card with a 2px `#EAEAEA` border, an 8px radius, a subtle drop shadow, and a 22×22 dark `#616161` rounded square containing the white icon. She also provided a LeftBar SVG showing two `#E9E9E9` 1px horizontal dividers (one between the segmented control and the next section, one further down delimiting a section). Then several rounds of spacing/sizing iteration across both panels, the removal of the dev-nav strip used during early prototyping, and confirmation that the marketplace note is now visible and styled.

## Human Directions

- "These are all the icons and buttons for the right side panel" + Frame 42-47 SVGs → extracted the 6 icon paths into the existing `IconBase/Grid/Text/Vector/Element/Component` components using `viewBox="24 20 22 22"` and restyled `.insert-tile` with 8px radius, 2px `#EAEAEA` border, drop shadow, and a 22×22 dark gray icon container
- "Make the drop shadow a bit more subtler" → `0 4px 8px rgba(198,198,198,0.25)` → `0 2px 6px rgba(0,0,0,0.05)`
- "Adjust the icons within the box on the top right side very slightly smaller" → me wrongly applied to right panel first; corrected to wrap each topbar SVG's icon path in a `<g transform="translate(17.5 17) scale(0.88) translate(-17.5 -17)">` so the icon scales 12% smaller around the pill center while the background stays the same size; reverted the right-panel CSS
- "Make the TL bold... nevermind try semi-bold" → added `stroke-width="0.5"` to the TL letter paths in the avatar SVG (no real text node since SVG `<text>` doesn't get web fonts when loaded via `<img>`)
- "Make Publish and Invite text slightly smaller" → `14px → 13px`
- "Make the right side panel drop shadow more subtle — maybe like the topbar icon shadow... revert that change... make the stroke lighter... make the drop shadow a bit subtler" → converged on `border: 1px solid #ededed` + `box-shadow: 0 1px 4px rgba(0,0,0,0.035)`
- "Add in the dividers as seen here" + LeftBar.svg → added a `.divider` (color `#E9E9E9`) between the right sidebar's pill-tabs and Insert title, and another between the insert-list and the marketplace note. First tried in the left sidebar by mistake; user clarified it was for the right
- "The divider should also take into account the padding on the left and right and not go all the way across" → removed the `-14px` horizontal margin so dividers sit inside the padded content area
- "Can you 1/15 base section... remove that section with the 1/15 and such" → removed the `.dev-nav` strip from App.tsx (the bottom-right scene-jumper with prev/next/reset) and pruned the now-unused `SCENE_ORDER` constant
- Marketplace note iteration: "move it up so it's spaced the same below the divider as the Component box is to the divider, medium weight, #767676 text, Framer Marketplace #555555" → removed `margin-top: auto`, applied the new colors and `font-weight: 500`; then -4px → -2px → 0 → various 2/4px nudges via inline `marginTop` on the divider itself
- "Can we add 2px to the right and left padding for both side panels" → `padding: 24px 14px 16px → 24px 16px 16px` on both `.left-sidebar` and `.right-sidebar`
- "Make sure 'Search this file...' is the same font size as Desktop - 1200" → search `13px → 12px`
- "Make sure Insert is the same size as Pages" → verified they're both already 13px / 600

## Records of Resistance

1. **Initial misread on "icons within the box on the top right side": applied to the right Insert tiles first.** Tina corrected ("this is on the top right icons with the play, setting, etc."), I reverted the `.insert-tile__icon svg { width: 18px }` change and instead modified the 5 topbar SVG files to wrap their icon paths in a transform group. Better fix because it scales just the icon (not the pill background) and persists in the asset file rather than overriding via CSS. Cost: 5 SVG file edits instead of 1 CSS rule.
2. **Did not use `<text>` element to make TL bold.** Cleaner approach is `<text font-weight="700">TL</text>`, but SVGs loaded via `<img>` tag are sandboxed and don't have access to web fonts loaded in the host page. The text would have fallen back to a generic system font which wouldn't match Inter. Stuck with a `stroke` on the existing path — preserves the original letterforms with a small `0.5px` outline to simulate bold weight.
3. **Used `useLayoutEffect` for pill-tab indicator measurement; remembered to also re-measure when font-weight transitions.** Since active tab is semibold (600) and inactive is regular (400), the active tab's text width is slightly wider. The indicator's `useLayoutEffect` re-runs on activeTab change which automatically re-measures with the new bold width — no extra hook needed.
4. **Padding bump (14→16px) didn't require child element adjustments.** All sidebar children use `width: 100%` or natural sizing within flex, so they automatically shrunk to fit the new content area. The dividers also use `margin: 2px 0` (not negative horizontal) so they shrunk too. Confirmed there was nothing hard-coded to the old 14px content width.
5. **Removed the dev-nav strip cleanly.** Tina was navigating the prototype the natural way (clicking through the tutorial flow) and didn't need the scene-jumper. Removed the JSX, the `SCENE_ORDER` constant, and the `idx` variable — TS caught one unused declaration that I also pruned. The `.dev-nav` CSS class is left in `global.css` as dead-but-tiny CSS for now.

## Successes

- Insert tiles match the Frame SVG reference closely: white card with 1px `#ededed` border, 8px radius, subtle 4px drop shadow, 22×22 dark `#616161` icon container with the actual white icon paths from the user's exports
- All 6 Insert icons (Base, Grid, Text, Vector, Element, Component) now show the real Framer-style glyphs instead of my CP01 placeholders
- All 5 topbar pills have their icons scaled 12% smaller inside the pill while pill backgrounds stay sized — looks much closer to the Framer reference
- TL avatar's "TL" reads as semibold via a sub-pixel stroke instead of a font-weight property
- Dividers (`#E9E9E9`) added to right sidebar in two places, respecting the sidebar's horizontal padding
- Marketplace note no longer pinned to the bottom — it now flows naturally below the second divider with `medium` weight and the correct `#767676` / `#555555` colors
- Dev-nav removed — the prototype now demos the way an actual user would experience it
- Build clean throughout — 229 KB JS / 18.9 KB CSS (68.9 / 4.35 KB gzipped)

## What's Next

- The Properties panel ("Design / Interaction" tabs) hasn't been touched — still using the original CP01 styling
- Bottom toolbar still uses my inline icon placeholders
- Canvas frame label area, demo content visuals, modal styling — all untouched since CP01
