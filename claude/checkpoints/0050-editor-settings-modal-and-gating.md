# Checkpoint 0050 — Editor Settings Modal Gates the Issue Scanner

**Date:** 2026-05-23
**Commit:** add a tree-checkbox Editor Settings modal (opened from the
panel cog) that gates which issue kinds the scanner emits — turning
off Spelling, Grammar, or Accessibility removes those issues + their
badge count + their canvas highlights

## Context

Clicking "Editor Settings" at the bottom of the Editor panel now opens
a popup that mirrors the user's reference SVG: a two-section tree of
checkboxes with hierarchical select (parent toggles all descendants,
parent's checkbox shows checked / indeterminate / unchecked based on
its descendants), expand-collapse chevrons on the parents, gear icons
on the deepest Accessibility leaves, blue checkbox style shared with
the Tutorial Overlays modal, and a Save button matching that modal's
padding (`8px × 15px` / `13px` font).

App owns `editorSettings` state (default: every leaf `true`). The
modal takes `initial` + `onSave` so the panel state stays committed
across opens. The issues `useMemo` then gates each scan branch:

  - `editorSettings.legibility` — fill-contrast checks (shape fills
    and text colors) only run when this is on.
  - `editorSettings.spelling` — dictionary-based spell scan.
  - `editorSettings.grammar` — rule-based grammar scan.

So turning a checkbox off causes the matching issues to drop out of
the badge count, the pager, and the canvas wash.

## Human Directions

- "When users click Editor Settings, [reference SVG] should pop up." →
  built the modal as a new `EditorSettingsModal` mirroring the
  reference layout.
- "Those look like brightness icons not settings." → replaced the
  improvised cog with the user-supplied `settings-outline.svg` path.
- "Use the same checkbox rule as the tutorial overlays popup." →
  extended `.modal__checks .checkbox, .overlay-rows .checkbox` to also
  include `.es-tree .checkbox`.
- "Make the checkboxes work in hierarchy." → only leaves hold state;
  parents derive `checked` / `indeterminate` / `unchecked` from their
  descendants and clicking a parent toggles them all.
- "Add a dropdown for Recommendation Prompting." → wired its chevron.
- "Remove the dropdowns for the four Recommendation children" /
  "remove the chevron for Spelling & Grammar" / re-add as a parent of
  Spelling + Grammar checkboxes → walked the tree through several
  shape iterations with the user.
- "Make the popup horizontally smaller — 330px." → tuned `max-width`.
- "Save button same size as Tutorial Overlays, with more spacing." →
  scoped `.modal--editor-settings .modal__footer .btn` to `8px 15px /
  13px` and bumped `.modal__footer` `margin-top` to 22px.
- "Make the settings work — defaults all on, turning Spelling off
  removes spelling issues, Accessibility off removes contrast." →
  lifted settings state to App; gated the issue scanner; verified
  with a Playwright run.

## Records of Resistance

1. **State location.** Initial draft kept settings local to the modal,
   which meant Save couldn't actually do anything beyond closing.
   Lifted to App + `onSave` callback so the changes persist.
2. **`useMemo` hoist order.** Adding `editorSettings` as a dep made
   tsc complain that it was used before declaration — `issues` was
   defined ~130 lines before the settings state. Moved the state up
   to right before the `useMemo`.
3. **Indeterminate visual.** `CheckSquare` didn't have an
   indeterminate render. Added an `indeterminate` prop that swaps the
   check path for a horizontal dash, so partial-children parents show
   the conventional `-` mark.

## Successes

- Typed `Hello wrold could of` → badge shows **2** (1 spelling + 1
  grammar). Toggle "Spelling & Grammar" parent off → Save → badge
  **0**. Re-open settings, toggle "Error Checking" back on (cascades
  to every leaf), Save → badge 2 again.
- Cascade test: with Accessibility partially on (one child off), the
  Accessibility row + the Error Checking row both render the dash;
  clicking either one back to on re-checks everything underneath.
- tsc + build clean — 745.76 kB JS / 10.67 kB CSS gzipped.

## What's Next

- Recommendation Prompting toggles don't gate anything yet — they're
  presentational. Hook them up if / when those features land.
- The Accessibility children (Legibility / Readability / Operability)
  currently all map to the single fill-contrast check via `legibility`
  only. Once we add readability / operability heuristics, they can
  gate their own scans.
- The Editor Settings persists for the App's lifetime but isn't
  written to localStorage — refresh resets to defaults.
