# Checkpoint 0004 — Left Sidebar Fidelity

**Date:** 2026-05-18
**Commit:** segmented Pages/Assets/Code control with smart-animate, new Desktop-1200 dropdown, new search styling, real Home/Desktop icons, animated Home dropdown synced with canvas

## Context

After CP03 brought the topbar to fidelity, Tina moved on to the left sidebar. She wanted: the Pages/Assets/Code tab strip swapped from her temporary pill design to Framer's actual segmented control pattern (a gray rounded container with a white indicator that slides between tab positions and vertical dividers between consecutive inactive tabs); the Desktop-1200 dropdown restyled from black-pill to light-gray with a "view day" icon and a thinner stroke chevron; the search input recolored and resized to match the dropdown; the Home tree restructured as an expandable two-state dropdown with new icons that matches her Frame 21181 reference (closed = label only with a small down triangle, open = blue header + lighter blue-gray sub-row indented with monitor icon + up triangle); and finally the dropdown made to also toggle from clicking the canvas frame in the middle.

The work crossed about a dozen design tokens (colors, padding, radii, font sizes, font weights, gaps), three new icon components (`PageIcon`, `MonitorPC`, `ViewDay`, briefly `Triangle`), and a state lift from `LeftSidebar` to `App` so the canvas could share the home-expanded state.

## Human Directions

- "Page/asset/code section should have a rectangle active box, not fully rounded" + `Section.svg` → triggered first pass with simple radius bump
- "Adjust the sizing of it. It feels too big and consider how the active box has to move to all three sections evenly. Maybe look at how Framer did it here (keep only Pages, Assets, Code)" + 3 Framer screenshots → triggered the segmented-control redesign with gray container + sliding white indicator + dividers between inactive tabs
- "Make the switch between each a smart animate" → drove the absolutely-positioned `.segmented__indicator` driven by a CSS custom property `--active-index` with `transform: translateX(calc(100% * var(--active-index)))`
- "Fix the colors: box #F3F3F3, active #FFFFFF, inactive text #999999, active text #222222, divider #E5E5E5" → exact color spec
- "Push the segmented control down by 8px; then add 8px above Project Name; then push up by 2px" → spacing iteration converged on `margin-top: 6px` on `.segmented` plus `padding-top: 24px` on `.left-sidebar`
- "Desktop section should not be black, different icon, less rounded" + Frame 21185.svg + material-symbols icon → drove the dropdown redesign (background `#E9E9E9`, black text, 5px radius, view-day icon, gray `#9B9B9B` chevron)
- "Make Project Name and Page bold... wait, semi-bold actually" → reverted to 600
- "Make Desktop - 1200 medium font" → already 500
- "Make text very slightly smaller" → 13 → 12 px
- "Change search text to 'Search this file...' (lowercase t), icon slightly bigger, #F3F3F3 fill, #A5A5A5 text" → exact spec
- "Make search bar same box size + corner rounding as Desktop - 1200" → padding `7px 12px`, radius 5px
- "Change search icon to look more like [reference]... no, thicker and shorter tail... better but increase the tail just a bit... now scale to match the desktop icon box size" → multi-step convergence on a 1.8-stroke circle with a ~3.2-unit handle at size 18
- "Push desktop section + everything below to match the segmented-to-divider spacing" → divider margin made symmetric (`2px -14px 2px`)
- "Match corner rounding on segmented to dropdown/search (5px)... round the inner active box a bit (5px again)" → 5px outer + 5px indicator
- "Home dropdown should look like Frame 21181 with two states" + SVG → drove the full Home/Desktop expandable dropdown
- "Make it more of a smart animate" → max-height + opacity + translateY + cross-fade chevron transitions, all 280ms cubic-bezier(.4,0,.2,1)
- "Desktop bold, scale icons/text to match Desktop-1200, use same chevron as Desktop-1200" → padding 7px 12px, font 12px, icons 14, stroke Chevron at #9B9B9B
- "Make Desktop semi-bold actually" → reverted 600 → 500
- "Make Desktop box a bit taller, feels squished" → padding-top/bottom 7px → 10px on sub-row, max-height 50 → 60
- "When users click on the canvas labeled home, trigger that home dropdown" + clarification "I didn't mean just the home label but the whole canvas group" → lifted state to App, attached onClick to the entire `.frame-card`

## Records of Resistance

1. **Resisted recreating the segmented control as 3 toggling-bg buttons.** First-pass instinct was to swap which button had the white background on click — simple, but discrete (no morph between positions). When she asked for smart animate I rebuilt it as a single absolutely-positioned `.segmented__indicator` driven by a CSS custom property `--active-index`, with the buttons just handling text-color/weight changes. This is the cleaner architecture for sliding affordances and matches how Framer's own segmented control behaves.
2. **Resisted putting the Home click handler only on the "Home" label.** First attempt wrapped just the label in a button. She pushed back and clarified she meant the whole canvas group. Moved the onClick to `.frame-card` so the entire visual surface is clickable, and added `cursor: pointer` so the affordance is visible. Stopped propagation on the small "+" button next to the title so it doesn't double-fire the toggle.
3. **Used a CSS custom property for the segmented indicator position instead of a JS-driven inline transform.** Setting `style={{ '--active-index': TABS.indexOf(activeTab) }}` on the container and using `transform: translateX(calc(100% * var(--active-index, 0)))` in the CSS keeps the animation entirely in the CSS layer (no React re-renders needed for the transition itself, no JIT inline-style churn). Trade-off: needs a TS cast on the style object (`['--active-index' as string]`) because React types don't know about arbitrary CSS custom properties.
4. **Lifted `homeExpanded` state from `LeftSidebar` to `App` rather than wiring sibling-to-sibling communication.** When she asked for the canvas to also toggle the dropdown, the cleanest fix was to have both `LeftSidebar` and `Canvas` receive the same `toggleHome` callback as a prop. This is the standard React shape for "shared between siblings" state. Considered context briefly but ruled out as overkill for a single boolean.
5. **Used `max-height` for the Desktop sub-row expansion instead of measuring with `useRef`/`useLayoutEffect`.** A perfect smart-animate would measure the row's natural height and animate to that exact value. `max-height: 60px` is hardcoded and a tiny bit fragile (would clip if the row grows past 60px). Accepted as the simpler trade-off; if the row's content grows we'll bump the value.
6. **Chevron design: kept the stroke `Chevron` component instead of the filled `Triangle` for the Home dropdown.** Her Frame 21181 reference showed a filled triangle, but she later asked to "use the same type of drop down icon as the desktop - 1200 one" — which uses the stroke chevron. Visual consistency won over reference-matching here.

## Successes

- Pages/Assets/Code is now a real segmented control: gray `#F3F3F3` rounded container, sliding white indicator at 280ms cubic-bezier, vertical `#E5E5E5` dividers fade between consecutive inactive tabs, dividers compute correctly across all three active-tab positions
- Desktop-1200 dropdown matches Frame 21185 exactly (background, text color, 5px radius, view-day icon, gray chevron, font size/weight)
- Search row matches dropdown (5px radius, same padding) for visual rhythm down the sidebar
- Home dropdown's full open/close animation has four synchronized transitions (background, border-radius, max-height, translateY+opacity, chevron cross-fade) all on the same timing curve — feels like a single coordinated motion rather than separate effects
- Canvas → Home dropdown sync: clicking the canvas frame anywhere toggles the sidebar dropdown, demonstrating the conceptual link between the page-frame in the canvas and its entry in the page tree
- All 12 vendor/in-house design tokens converged through ~25 iterative messages, all clean lints and builds throughout (final: 224 KB JS / 17.4 KB CSS, 66.6 / 4 KB gzipped)
- Added new icon library entries (`PageIcon`, `MonitorPC`, `ViewDay`, `Triangle`) using inline SVG paths extracted from the user's exported Figma assets — no external icon library dep

## What's Next

- Heads up on canvas → home dropdown: clicking the demo hint zones during the Stack tutorial will also toggle the home dropdown as a side effect. Said I'd suppress that during demo states if she wants.
- Right sidebar (Insert panel, Design/Prototype tabs, properties panel) is still using the original CP01 styling — likely the next surface to bring to fidelity.
- Canvas frame label and Desktop-1200 sub-bar visual styling not yet touched in detail.
- Bottom toolbar still using my inline icon placeholders.
