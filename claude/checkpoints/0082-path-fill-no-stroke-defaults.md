# 0082 — Path Tool: Fill on Create, No Default Stroke

## Context
In `src/App.tsx`, the `createPath` function (line ~506) initializes new path shapes. Previously paths were created with `fill: null` and `stroke: { color: '#aaaaaa', width: 1 }`, meaning a freshly drawn path showed only a gray stroke and no fill. This was inconsistent with rectangles, ovals, polygons, and stars, which all default to `fill: '#cccccc', stroke: null`.

Changed to `fill: '#cccccc', stroke: null` — paths now match the fill-first default of all other vector shapes. Users can add a stroke via the right panel after creation.

## Human Directions
1. Open `src/App.tsx`, find `createPath` (~line 506)
2. Change the new shape object from `fill: null, stroke: { color: '#aaaaaa', width: 1 }` to `fill: '#cccccc', stroke: null`

## Records of Resistance
- None — direct one-line fix, accepted immediately.

## Successes
- Change accepted without revision on first attempt.
