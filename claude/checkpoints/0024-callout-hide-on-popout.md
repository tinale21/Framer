# Checkpoint 0024 — Insert Callout Hides Over Hover Popups

**Date:** 2026-05-19
**Commit:** Insert-section callout also hides while hovering the Element/Vector popups

## Context

CP23 added the Insert-section callout that hides when hovering a tile. But the Element and Vector tiles open hover popups positioned to the *left* of the tile — when the user moved their mouse off the tile and into the popup to make a selection, they were no longer hovering `.insert-tile`, so the callout reappeared mid-interaction.

## Human Directions

- "The callout should also disappear when users hover over the popup for element, vector, and text and are making a selection" → extended the hide selector to also match `.popout-element:hover` and `.popout-vector:hover` (Text has no hover popup, so the tile-hover rule already covers it)

## Records of Resistance

None — single-line selector change. The popups are DOM descendants of `.insert-section--demo` (rendered inside the tile wrappers), so `:has()` matches them despite the popups being visually positioned outside the card.

## Successes

- One-line CSS: `:has(.insert-tile:hover, .popout-element:hover, .popout-vector:hover)` — callout stays hidden across the whole tile → popup → selection path
- Verified: opacity 0 confirmed while hovering inside the Element popout
- Build clean — 252.5 KB JS / 33.6 KB CSS (76.8 / 6.3 KB gzipped)

## What's Next

- Smart-animate / cross-fade between highlight steps — still deferred
- SVGs for the text/vector/element content added inside the stack — still pending
