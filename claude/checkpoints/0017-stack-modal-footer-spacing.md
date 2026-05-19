# Checkpoint 0017 — Stack Modal Footer Spacing

**Date:** 2026-05-18
**Commit:** +2px gap between After comparison and buttons

## Context

Quick spacing tweak. After CP16 fixed the Before/After alignment and restyled the buttons, the gap between the bottom of the comparison cards and the Don't Show Again / Practice Demo buttons felt tight. Bumped the stack-compare's margin-bottom by 2px; modal auto-grows to fit.

## Human Directions

- "Increase the spacing between the bottom of the After box and the Don't Show Again / Practice Demo buttons by 2px. Also adjust the vertical size of the popup to make up for this change" → bumped `.stack-compare margin-bottom: 18 → 20px`; modal grows automatically since no max-height is set

## Records of Resistance

None — single-line change.

## Successes

- More visible breathing room between the comparison and the buttons (~1.7px visual after the 0.85 modal scale)
- Modal auto-grows; no explicit modal height adjustment needed
- Build clean
