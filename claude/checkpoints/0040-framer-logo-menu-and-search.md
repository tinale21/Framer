# Checkpoint 0040 — Framer Logo Menu + Search

**Date:** 2026-05-22
**Commit:** add the Framer-logo dropdown menu with a submenu for every section,
a working command search, and Preferences → Tutorial Overlays

## Context

The user wanted the Tutorial Overlays settings reachable from a proper Framer
menu. Built the whole logo menu to match the editor recordings.

## Human Directions

- "Keep tutorial settings under Preferences — add a dropdown where the Framer
  logo is." → new `FramerMenu`; the logo is now a button that opens it.
- "Add a 'Tutorial Overlays' line below Performance Mode" → it's the last item
  in the Preferences submenu and opens the Tutorial Overlays popup.
- "Use the completion popup's checkbox / text / padding rules for that popup."
  → `TutorialOverlaysModal` now uses `modal--completed` and the blue checkbox.
- "Make the menu panels for all the sections." → File, Edit, View, Tool,
  Layout, Component, Plugins, Code, Site Settings, Help all have submenus,
  transcribed from the recording.
- "Open the submenu next to the hovered section, not all at the top." → the
  submenu is positioned at the hovered row's y-offset.
- Menu text dialed down to 13px; panels narrowed to 270px.
- "Make the search work." → typing filters the menu (prefix-of-word against
  section names and their items); first result highlighted.

## Records of Resistance

1. **Submenu position.** First pass opened every submenu at a fixed top.
   Reworked to capture the hovered row's `offsetTop` and place the submenu
   there, with an adaptive `max-height` so it never runs off-screen.
2. **Search algorithm.** Framer's exact match set was hard to reverse-engineer
   from two video frames. Settled on prefix-of-word matching over section
   names + their item labels — broader than Framer for one-letter queries but
   correct for real words, and it surfaces Tutorial Overlays for "tutorial".

## Successes

- The logo opens a faithful Framer menu; every section has a populated submenu
  with dividers and greyed items matching the recording.
- Search filters the menu live, highlights the first hit, shows "No results".
- Preferences → Tutorial Overlays opens the restyled popup.
- Build clean — 278.23 KB JS / 43.20 KB CSS (84.06 / 7.93 KB gzipped).

## What's Next

- Submenu items (other than Tutorial Overlays) are non-functional decoration.
- The search has no per-item shortcuts or a "search everything" fallback row.
