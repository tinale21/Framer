# Checkpoint 0007 — Pill-Tabs Unification

**Date:** 2026-05-18
**Commit:** right-sidebar Design/Prototype + left-sidebar Pages/Assets/Code both converted to the new pill-tabs pattern with ref-measured smart-animate; right sidebar top padding aligned with left

## Context

After CP06 added the editable sidebar interactivity, Tina moved focus to the right sidebar's Design/Prototype tabs. The original styling (a thin gray pill via the `.tab` class from CP01) didn't match the rest of the redesign. She first asked for them to behave like Pages/Assets/Code (segmented control), then refined the visual to a different pattern from her Image #26 reference: no outer gray container, just an active light-gray pill (`#F5F5F5`) over the active tab text with `#191919` color, and inactive text in `#7F7F7F`. The Design/Prototype tabs also have different text widths, which the segmented control's fixed-width-fraction indicator couldn't represent — needed dynamic measurement.

Then she asked the new pattern to be smart-animated, and to unify the Pages/Assets/Code tabs to use the same pill-tabs pattern.

## Human Directions

- "Make the Design/Prototype section have the same functionality as Pages/Assets/Code" → first pass with segmented control on right sidebar
- "Make sure it has the same box height" → locked `.segmented` to `height: 34px` with `box-sizing: border-box`
- "Push that and everything below it so it has the same top padding as the project name on the left side panel" → right sidebar padding `16px 14px → 24px 14px 16px`, matching left
- "Can you actually do the Design/Prototype section like this" + Image #26 → ripped out the segmented and rebuilt as pill-tabs (no container, just active-pill highlight)
- "Can it still be a smart animate" → introduced `.pill-tabs__indicator` absolutely positioned over the active tab, measured via `useRef + useLayoutEffect` for `offsetLeft + offsetWidth`, transitioning `left/width` with the same 280ms cubic-bezier curve
- "Now do that same functionality for the Pages/Assets/Code section" → ported the pill-tabs pattern from RightSidebar to LeftSidebar, removing the old segmented control markup
- "Adjust it so Code doesn't sit so far at the end. It should still be evenly spaced" → scoped a smaller variant `.left-sidebar .pill-tab { padding: 6px 10px; font-size: 13px; }`
- "Adjust it so it still fills up the space of the right and left side padding like all the other elements" → added `justify-content: space-between` to left-sidebar pill-tabs so Pages aligns with left content edge and Code aligns with right content edge
- "Wait actually let's revert that change" → reverted, back to left-aligned natural flow
- "The disabled text should also use a regular text font" → font weights split: inactive 400 (regular), active 600 (semibold)

## Records of Resistance

1. **Used `useRef + useLayoutEffect` for indicator measurement instead of fixed-fraction CSS calc.** The segmented control on the left sidebar (which I converted away from in this CP) used `width: calc((100% - 6px) / var(--tab-count))` and `transform: translateX(calc(100% * var(--active-index)))` — pure CSS, no React renders for the animation. That works when all tabs have the same width. With pill-tabs, Design and Prototype have different text widths, so a fixed-fraction approach would either misalign the indicator or require padding both tabs to the wider one (which would expand the inactive tab visually). The ref-measurement approach reads the actual `offsetLeft + offsetWidth` of the active tab after layout, then animates the indicator to that exact rectangle. Costs one re-render on tab change; gains pixel-accurate dynamic sizing.
2. **Hid the indicator until measured to avoid a flash.** First mount of `useLayoutEffect` happens after the initial render, which means there's a frame where the indicator has `left: 0, width: 0`. Added an `opacity: 0 → 1` toggle keyed off a `ready` flag so the indicator fades in once measured rather than briefly appearing in the wrong position. 150ms opacity transition is independent of the 280ms left/width transition so it's only visible on mount.
3. **Scoped pill-tab sizing per location instead of hardcoding one set of values.** Right sidebar's Design/Prototype has plenty of horizontal room for the default 14px padding / 14px font. Left sidebar's narrower 240px width plus 3 tabs makes the same sizing overflow visually. Used `.left-sidebar .pill-tab { padding: 6px 10px; font-size: 13px; }` to keep one shared `.pill-tab` base while letting each surface tune its proportions. Better than two separate classes (`.pill-tab` + `.pill-tab--compact`) which would require explicit class application everywhere.
4. **Kept the old `.segmented` CSS in place even though nothing renders it anymore.** Dead CSS that could be removed, but the diff would be 60+ lines and the bytes don't matter for a prototype. Marked it as a cleanup candidate for future when the design stabilizes.
5. **Animated `font-weight` along with color.** Switching from regular to semibold changes the tab's text width by ~2-4px, which would visibly shift the indicator's measurement target. Added `transition: font-weight 0.18s ease` so the change is smooth, and `useLayoutEffect` re-measures after the activeTab state change so the indicator stays aligned with whichever tab is currently bold.

## Successes

- Two pill-tab surfaces (right: 2 tabs, left: 3 tabs) share one CSS contract and one React pattern. Both have the same ref-measure-and-translate logic, same 280ms timing, same colors (`#F5F5F5` active background, `#7F7F7F` inactive text, `#191919` active text).
- Dynamic measurement means the indicator correctly fits "Pages" (narrow), "Assets" (wider), "Code" (narrowest) on the left, and "Design" vs "Prototype" on the right. No padding-to-largest hack needed.
- The font-weight change on active is animated, not jarring.
- Right sidebar now aligns vertically with the left sidebar (both start their content at 24px from the top).
- Build clean: +0.8 KB CSS, +0.4 KB JS — mostly from the duplicated indicator measurement code in both sidebars (could be extracted to a shared hook if it grows).

## What's Next

- Same caveat as CP04 about clicking demo hint zones triggering home dropdown (still not addressed).
- The dead `.segmented` CSS is leftover and could be pruned.
- The right sidebar's Insert panel (tiles for Base, Grid, Text, Vector, Element, Component) and the Properties panel layout are still using the original CP01 styling.
- If Tina wants to lift the ref-measurement pattern into a reusable `usePillTabs` hook, both sidebars currently duplicate the same useRef/useLayoutEffect setup.
