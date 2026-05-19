# Checkpoint 0014 — Insert Tile + Popout Color Spec

**Date:** 2026-05-18
**Commit:** Insert tile text + icon-box recolored to `#767676` (default) / `#222222` (hover); popout-grid items recolored to `#767676` for both text and icon

## Context

After CP13 finished the Grid hover popout, Tina dialed in the color specs for the insert tiles and the popout items — both default and hover states. She wanted consistency: tiles read as muted at rest (`#767676`) and snap to near-black (`#222222`) on hover, with the dark icon container background going from gray to near-black to match. The popout-grid items just needed a single resting color (`#767676`) for both text and icon since the hover already inverts to white-on-blue.

## Human Directions

- "Make the frame, stack, grid, masonry text and icon `#767676`" → updated `.popout-grid__item` text color (`#616161 → #767676`) and `.popout-grid__item-icon` color (`#A6A6A6 → #767676`)
- "Make the base, grid, text, vector, element, and component text and icon box `#767676` and `#222222` when hovered" → updated `.insert-tile` text color (`#616161 → #767676`), `.insert-tile__icon` background (`#616161 → #767676`), added `:hover` rules for both to swap to `#222222`, added 150ms `transition` on color and background

## Records of Resistance

1. **Added the transition on `color`, `background` as part of the existing rule rather than a new selector.** Could have written a separate `.insert-tile { transition: ... }` block but adding to the existing `transition: border-color 0.15s ease` keeps everything in one place.
2. **Did not touch dark-mode insert-tile colors.** The user spec only mentioned light mode. Dark mode keeps its `#FFFFFF` text and `#3A3A3A` icon box from CP11. If the user wants similar hover-darken behavior in dark mode, that's a follow-up.

## Successes

- Insert tiles + popout items now share a single resting color (`#767676`) — visually consistent
- Insert tile hover treatment is more pronounced — text and icon both shift to `#222222` (much darker), making the hover state read clearly
- Smooth 150ms transition on the hover swap
- Build clean — 244.8 KB JS / 27.1 KB CSS (74.9 / 5.5 KB gzipped, +0.1 KB CSS for the new hover rules)

## What's Next

- Dark-mode insert-tile hover could be added if Tina wants the same swap-darker behavior in dark mode
- The popout-grid items could use a slight hover transition delay if the bg flash to blue feels too instant
