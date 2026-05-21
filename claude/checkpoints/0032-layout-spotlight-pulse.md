# Checkpoint 0032 — Layout Demo Spotlight, Pulse & "+" Buttons

**Date:** 2026-05-20
**Commit:** focus the demo-7 highlight on just the Layout control — a localized
spotlight plus a pulsing blue ring — and polish the Fill/Stroke/Effects "+" buttons

## Context

Continues the demo-7 properties-panel work from 0031. A long round of fine visual
tuning on the Layout highlight and the Appearance section's "+" buttons.

## Human Directions

- "Make the + next to Fill/Stroke/Effects the same color as the text" → dropped the
  `color` override on `.props-row--plus::after` so it inherits the label color.
- "Is the + the same height as the text?" → no; the "+" glyph renders ~5.8px vs a
  capital's ~8.7px. Bumped the `::after` to `18px` / `line-height: 0` (matches cap
  height, rows stay 15px), then thinned it to `font-weight: 300`.
- "Make the highlight only highlight Layout" → first moved the blue outline onto the
  title; the user clarified they meant the whole *spotlight*. Reworked it: the demo
  tint now covers the whole panel, and only the Layout block is lifted above it.
- "Increase / reduce the spotlight" → spotlight is a `::before` on `.props-layout--demo`
  (`inset` controls its size, `border-radius` its corners — box-shadow couldn't go
  below ~16px corners). Settled at `inset: -19px -16px`, `border-radius: 6px`.
- "Reduce the blue highlight's corner rounding" → an offset `outline` rounds its
  corners by the offset amount, so it was switched to a pseudo-element ring.
- "Is the pulse still there?" → it was animating `border-width`, which did **not**
  take effect (verified by scrubbing the animation — trough and peak rendered
  identical). Switched to an animated `box-shadow`, the mechanism the other demo
  pulses use; it now visibly pulses `1.1px ↔ 1.5px`.
- "Semi-bold 'Layout' in the callout and remove the quotes" → done.

## Records of Resistance

1. **"Highlight only Layout" was misread once.** First interpreted as the blue
   outline; the user meant the whole spotlight/dimming. Reworked so the tint dims
   the entire panel and only the Layout block is spotlit.
2. **`border-width` animation silently failed.** After switching the blue ring from
   `outline` to a bordered pseudo-element, the pulse stopped working — `border-width`
   keyframes had no visible effect. Confirmed by scrubbing the animation and
   screenshotting trough vs. peak (identical). Fixed by animating `box-shadow`.
3. **Spotlight overshoot.** "Increase the spotlight" → enlarged it; "that's too
   much" → pulled it back down 10px across two steps.

## Successes

- The demo-7 highlight now focuses tightly on Layout: a localized bright spotlight
  over a fully-dimmed panel, plus a pulsing blue ring on the title.
- Pulse verified working via animation scrubbing (not just assumed).
- "+" buttons match the label color and cap height without changing row height.
- Build clean — 259.8 KB JS / 37.6 KB CSS (79.6 / 7.0 KB gzipped).

## What's Next

- `border-width` is not reliably animatable here — prefer `box-shadow`/`outline-width`
  for any future stroke pulses.
