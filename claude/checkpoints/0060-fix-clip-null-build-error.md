# 0060 — Fix GH Pages build: clip possibly null

## Context

The GH Pages deploy step failed because `tsc -b` flagged a strict-null
error in ComponentSvg's clip-group tear-off path:

    Canvas.tsx(1670,20): error TS18047: 'clip' is possibly 'null'.

`clip = doc.getElementById(clipId)` types as `HTMLElement | null`. The
guard `if (!cr) return` only narrowed `cr` (clip's child rect), so on
the next line `clip.outerHTML` still saw clip as possibly null. Dev's
`tsc --noEmit` had been passing — likely because the cached tsbuildinfo
let an earlier well-typed version slip through.

## What changed

Widened the early-return to `if (!clip || !cr) return;` so both are
narrowed for the subsequent serialization step.

## Human directions

- "The GitHub Pages deployment is failing because your build step failed"

## Resistance / rebuilds

None — one-line guard.

## Successes

- `npm run build` is green.
