# Checkpoint 0052 — Shared Padding + Heading Rules for Modals

**Date:** 2026-05-23
**Commit:** consolidate the Tutorial Overlays modal's padding /
heading / close / footer rules with the Editor Settings modal so
both share one block of styles

## Context

`.modal--overlays` was inheriting the larger `.modal--completed`
defaults (32px×28px padding, 22px title, 9px radius) while
`.modal--editor-settings` had its own tightened set. Folded both
into a shared selector list: same 22px padding, 10px radius, 18px
title with 14px bottom margin, 14px-inset close button, 22px footer
top margin, and the smaller Save button (8px×15px / 13px). One
source of truth for both.

## Human Directions

- "Use the same padding rules for the Tutorial Overlays as you did
  with the Editor Settings popup. Also fix the heading rules on the
  Tutorial Overlays popup as you did for the Editor Settings." →
  combined the two modals into one selector group in CSS.

## Successes

- Verified visually: Tutorial Overlays now shows the smaller title +
  trimmed padding, matching Editor Settings.
- tsc + build clean — 10.70 kB CSS gzipped (slightly larger than
  before only because of the combined selectors).
