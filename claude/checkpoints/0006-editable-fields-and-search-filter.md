# Checkpoint 0006 — Editable Fields & Search Filter

**Date:** 2026-05-18
**Commit:** project name editable; search becomes a real input with focus ring, clear button, and live filtering of the home/desktop tree

## Context

After CP05 wrapped up the sidebar's visual rhythm and canvas click semantics, Tina pushed the prototype from static visual fidelity toward interactive fidelity in two places: the Project Name in the sidebar header, and the Search field below the Pages tabs. Both were inert text/placeholder elements pre-CP06. She wanted them to feel like Framer's real inputs — editable in place, with a focus indicator, a clear button, and live tree filtering when the user types.

## Human Directions

- "Make it so when users click on Project Name, they can actually edit the text. Also make the search this file textable" → introduced `contentEditable` on the Project Name span and replaced the search placeholder span with a real `<input>`
- "Make the highlighted area when users click to change the project name slightly bigger" → bumped padding from `0 2px` to `3px 6px` with matching negative margins, radius 3px → 4px so the focused background sits comfortably around the text
- "Make it so when users search something (like home), it highlights where it is in the file like this" + Image #24 → controlled search input, blue focus ring (`box-shadow: 0 0 0 1.5px #0099ff`), `×` clear button when query is non-empty, and a `.search-results` list that replaces the Home dropdown when filtering. Matching rows render with a `#F3F3F3` pill background.

## Records of Resistance

1. **Used `contentEditable` for Project Name instead of a state-controlled `<input>` toggle.** A controlled input/span toggle would mean managing edit mode state, autoFocus, blur-saves, Enter-saves, and width-fitting (since inputs don't auto-size with content). `contentEditable` gives all of that natively — the span sizes to its content, the cursor lands where the user clicked, blur/Enter both end editing. Cost: React's `suppressContentEditableWarning` is needed and the controlled-value pattern doesn't apply (the DOM is the source of truth). Acceptable for a prototype that doesn't need to read the value back.
2. **Did not lift `searchQuery` state to App.** The search query only affects what renders in the sidebar's home dropdown area — no other surface cares. Keeping state local in `LeftSidebar` keeps `App.tsx` clean and avoids prop-drilling. If a future need arises (e.g., highlighting matches in the canvas), the state can be lifted then.
3. **Substring match against fixed labels ("home", "desktop") instead of a real filter engine.** The prototype has exactly two tree entries — building a generic filter abstraction for two strings would be overkill. The check is one line per row: `'home'.includes(query)`. If the tree grows, this becomes a map+filter; for now it's intentional concrete code.
4. **Replaced the entire home dropdown with `.search-results` during filter mode instead of in-place highlighting.** The reference image shows the Desktop sub-row hidden when "home" is searched — implying a flat filtered list rather than the structural parent/child dropdown. Building a per-row visibility toggle inside the existing dropdown's animation logic would have been brittle (clashes with `max-height` and expanded-state styles). A cleaner conditional swap matches the reference behavior and is simpler to reason about.
5. **Used `box-shadow` for the focus ring rather than `outline` or `border`.** `border` shifts layout (1.5px added to each side), `outline` doesn't follow `border-radius` consistently across browsers, and `box-shadow` does both right (no layout shift, follows the border-radius). Standard pattern for custom focus rings.

## Successes

- Project Name is editable in place — click anywhere on the text to place the cursor and type. Focus background is a subtle `#F3F3F3` rounded rect that grows to 3px×6px padding so the highlight reads as deliberate rather than tight to the glyphs.
- Search is a fully working input with three coordinated states: empty (placeholder, no clear button), focused (blue ring, still no clear if empty), typing (clear button visible, results list active). Clearing via the `×` button or backspacing both restore the original Home dropdown including its expanded/collapsed memory.
- Filter visualization matches the reference: matching rows render with the same `#F3F3F3` pill background and icon, hiding non-matching rows entirely. The chevron and the parent/child structural relationship are dropped during filter mode (flat list).
- All three editable surfaces (Project Name, Search input, and the prior canvas-click handlers) coexist without state collisions.
- Build clean: +0.7 KB CSS, +0.7 KB JS for the new interactivity (still 67 KB gzipped total).

## What's Next

- Editable canvas content (the demo's "sample text" labels) could be next if Tina wants full edit affordances throughout the prototype.
- Right sidebar still using the CP01 styling/icons.
- Bottom toolbar still placeholder.
- Currently the search filter only knows about "Home" and "Desktop" — if Tina adds more pages, the substring match in `LeftSidebar.tsx` will need extending.
