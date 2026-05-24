# 0055 — Hide torn cells via declarative `<style>` block

## Context

After 0054 shipped, the torn-shape "remove from source" behavior wasn't
visibly working in the user's browser even after the cell-hide useEffect
was in place. The earlier approach mutated `rect.style.visibility`
imperatively inside a `useEffect` that ran after each render.

The risk with that approach: the SVG is mounted via
`dangerouslySetInnerHTML`. If React ever re-applies the same HTML (or
if the wrap div is unmounted+remounted for any reason during the parent
re-render chain), inline styles set imperatively on the rect would be
wiped, and the useEffect wouldn't re-fire unless its deps changed.

## What changed

Removed the imperative useEffect. ComponentSvg now builds a CSS string
from `hiddenPatterns` and renders a sibling `<style>` block:

    .demo-element__svg rect[fill="url(#patternX)"] { visibility: hidden }

React owns the style element — it can't be clobbered by innerHTML
re-application, and it updates declaratively whenever the set changes.

Wrapped the SVG div + `<style>` in a fragment.

## Human directions

- "it still not moving out. look at how when i move a shape out, it moves
  the shape out too: [Figma video]"

## Resistance / rebuilds

- One pass on this fix — switched from imperative to declarative.

## Successes

- Torn-cell hide is now resilient to any innerHTML re-application.
- tsc clean.
