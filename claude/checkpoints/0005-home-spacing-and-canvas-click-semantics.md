# Checkpoint 0005 — Home Dropdown Spacing & Canvas Click Semantics

**Date:** 2026-05-18
**Commit:** home dropdown gap/radius matched to search box; canvas click behavior split into open-on-frame / close-on-surround

## Context

After CP04 brought the left sidebar to fidelity, two follow-up issues surfaced:

1. **Visual rhythm in the sidebar**: the home dropdown sat too close to the search box compared to how the search box sat below the "Pages" section header, and its corner rounding (5px outer / 5px inner from CP04) didn't quite read as consistent with the search box once the corners were adjacent in the layout. Tina iterated on the gap (+6px → -4px = +2px net) and asked to make the rounding match the search exactly.
2. **Canvas click semantics**: in CP04 the entire `.frame-card` was made clickable to toggle the home dropdown. That worked as a toggle, but didn't match the mental model Tina had — clicking the canvas should "select" the home page (open the dropdown), and clicking outside should "deselect" (close it). Toggling on every canvas click felt wrong because re-clicking the canvas closed the dropdown immediately after opening it.

## Human Directions

- "Push the home section so that it has the same spacing from the search box as the search box has from the pages section" → added `margin-top: 6px` to `.home-dropdown` to match the visual whitespace of the section-header-to-search gap
- "Push it up by 4px" → reduced to `margin-top: 2px`
- "Make the corner rounding also the same as the search box" → all three home dropdown radii (outer, collapsed home row, expanded top, sub-row bottom) dropped from 8px to 5px
- "When users click on the middle canvas, the drop down stays there even if they click on the canvas again. The drop down only closes when they click somewhere in the middle that is outside of the canvas or directly on the drop down on the left side panel" → split `toggleHome` into three callbacks: `openHome` (on canvas frame), `closeHome` (on canvas surround), `toggleHome` (on sidebar home row)

## Records of Resistance

1. **Did not implement a global `document.click` outside-detection.** A common pattern for "close-on-click-outside" is to attach a document-level click listener and check if the click target is inside the open element. Resisted that here because Tina's spec was more constrained — she only wants clicks on the surrounding gray canvas area (`.canvas-wrap`) to close, not any-click-anywhere. Doing the explicit handler on `.canvas-wrap` keeps the behavior predictable and limited to the visible "outside" area she defined. Clicks on the topbar, dev nav, or modals don't accidentally collapse the dropdown.
2. **Used `e.stopPropagation()` on the frame-card click instead of restructuring the DOM.** The cleaner architecture might be to put the close handler on a sibling element next to the frame-card so events naturally don't overlap. But the existing `.canvas-wrap > .frame-card` nesting is structurally correct for the visual hierarchy (gray frame around white canvas). Stopping propagation at the frame-card boundary keeps the visual structure intact and the behavior explicit in one line.
3. **Kept the `closeHome` callback `void` rather than returning a value.** No callback chain needed; the state update is fire-and-forget from the click handler. Matches the existing `openHome`/`toggleHome` signatures.

## Successes

- The home dropdown now has visually consistent vertical rhythm with the search box (margin-top 2px + 14px flex gap ≈ matches the visual gap from search to the section header above it) and identical 5px corner rounding to match the search/dropdown design language
- Canvas click semantics behave intuitively: clicking the canvas "selects" the page (open), clicking outside the canvas "deselects" (close), and the sidebar row still toggles like a normal dropdown
- All three behaviors are coordinated through a single source of truth (`homeExpanded` in App.tsx) so the dropdown state is always consistent regardless of which surface the user clicks
- Build remains clean — no size impact (224 KB JS, same)

## What's Next

- Same caveat as CP04: clicking demo hint zones during the Stack tutorial bubbles to the frame-card click handler and opens the home dropdown as a side effect. Not raised again by Tina but worth noting.
- Right sidebar fidelity still pending.
- Bottom toolbar still using placeholder icons.
