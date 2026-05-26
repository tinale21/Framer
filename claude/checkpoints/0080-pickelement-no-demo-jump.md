# 0080 — pickElement no longer drags user back into the practice demo

## Context

With the stack tutorial disabled (Don't Show Again from the
Using-Stacks popup), drawing a stack routes scene to `demo-final`,
where no callouts should fire. But picking any element from the
Insert popout dragged the user back into `demo-6-place-element`
and re-triggered "Drag this into the stack." callouts on every
new item — `pickElement` was setting the scene unconditionally.

## What changed

`pickElement` in App.tsx now only advances to `demo-6-place-element`
when the scene is `demo-5-insert-highlighted` (i.e. mid-guided-demo).
Matches the same pattern that `placeText`, `createShape`, and
`createPath` already used for their scene transitions.

The `inPractice`-gated callout pin (`setCalloutEl`) still works —
it's a no-op when the user isn't in a demo scene because `inPractice`
naturally evaluates false outside demo-5/demo-6.

## Human directions

- "when i click 'Don't Show Again' for the practice demo, some of
  the callouts still appear"

## Resistance / rebuilds

- One-line conditional change.

## Successes

- After Don't Show Again, picking elements from the Insert popout
  leaves scene on `demo-final`; no Insert-section or Drag-into-the-
  stack callouts surface.
- Guided demo flow (`stackTutorialDisabled = false`) still
  transitions normally from demo-5 → demo-6 on first pick.
- `npm run build` green.
