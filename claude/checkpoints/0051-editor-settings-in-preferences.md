# Checkpoint 0051 — Editor Settings in Framer Menu → Preferences

**Date:** 2026-05-23
**Commit:** add Editor Settings under the Framer menu's Preferences
submenu, bottom-align that submenu against its parent row
(Framer-style — no gap below), drop "Nudge Amount" so the submenu
fits, and trim both modals' widths

## Context

Two entry points to the Editor Settings modal now: the cog at the
bottom of the Editor panel (existing) and a new "Editor Settings"
item inside Framer menu → Preferences. Same modal, same state, same
gating — just two ways in.

The Preferences submenu's positioning also got a refresh to match the
reference screenshot the user shared: when the parent row sits near
the bottom of the menu list, the submenu opens *upward* so its
bottom edge lands flush with the row's bottom (no leftover gap).
Measured via `useLayoutEffect` after the submenu mounts; only
applies when `activeSection.label === 'Preferences'`, other
submenus still open at the row's level.

And a couple of tiny presentation tweaks:
- Tutorial Overlays modal trimmed from 370px → 335px max-width.
- "Nudge Amount" row removed from Preferences (let the submenu fit
  the visual budget without scroll).

## Human Directions

- "Under Preferences and below Tutorial Overlays, add Editor Settings
  and have the editor settings popup also live there." → added the
  entry to `PREF_ITEMS`, widened `Item.action` to a named string so
  multiple actions can coexist, wired a new `onOpenEditorSettings`
  prop through `TopBar` → `FramerMenu` to App.
- "Move the preference popup to display up so there's more spacing
  (like how Framer did it)." → Preferences submenu now uses
  `top: 0` then bottom-aligns via a measured offset.
- "Not aligned now — maybe remove Nudge Amount." → removed.
- "Move it so there's not a tiny gap below." → swapped to the
  measured offset (active.top + active.height - submenuHeight).
- "Make the tutorial overlays popup horizontally a bit smaller / 335px."
  → `.modal--overlays { max-width: 335px }`.

## Records of Resistance

1. **Submenu bottom alignment.** Hard-coding `top: 0` worked but left
   the gap the user noticed. Measuring submenu height with a
   `useLayoutEffect` + a `submenuRef` lets the math actually land the
   bottom edge on the row's bottom.
2. **Item.action width.** Was a `boolean`, fine for one wired action;
   widened to `'tutorialOverlays' | 'editorSettings'` so each row in
   Preferences can dispatch to its own parent callback.

## Successes

- Framer menu → Preferences → Editor Settings opens the same modal
  the panel cog opens (Playwright: `modal open? 1`).
- Preferences submenu bottom edge sits flush with the Preferences row;
  Editor Settings is the last row inside the submenu.
- Other submenus (File / Edit / View / etc.) still open at their row
  level — only Preferences uses the bottom-aligned positioning.
- tsc + build clean — 745.91 kB JS gzipped.

## What's Next

- The remaining Preferences toggles ("Auto-Draft Content", "Animate
  on Zoom", etc.) are presentational — no checks actually wired.
- "Recommendation Prompting" leaves in Editor Settings are also
  presentational right now; only Spelling / Grammar / Legibility
  actually gate the scanner.
