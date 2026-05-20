# Checkpoint 0021 — Practice Demo: Stack Highlight + Draw Interaction

**Date:** 2026-05-19
**Commit:** Practice Demo flow — tinted spotlight on the Grid popout Stack item, then real click-drag on the canvas to draw a stack

## Context

The "Using Stacks" modal's "Practice Demo" button previously jumped straight to `demo-1-stack-highlighted` showing the old scene-based `BasePopout`. Tina wanted a guided practice flow: click Practice Demo → spotlight the Stack option in the Grid popout → click Stack → spotlight the white canvas → the user genuinely click-drags to draw a 2-column stack. Three reference screenshots (Demo 2/3/4) showed the canvas interaction: idle canvas, dragging a rectangle, placed stack.

## Human Directions

- "When users click Practice Demo, tint the workspace except the Stack button in the grid popout, blue ring, notify users to click it" → added `.demo-tint` overlay; Grid popout pinned open during `demo-1-stack-highlighted`, veiled, Stack item spotlit with a blue ring + callout
- "Make it appear more like [reference]" + "blue outline subtly pulsing" → added `.popout-grid__veil` (tints the popout, Stack pokes through as a white-halo spotlight); `demo-pulse` keyframe
- Pulse iterations: "more subtle" → color shift; "more obvious" → 2↔3px width; "in-between" → 2↔2.5px; later "-0.5" → 1.5↔2px
- "Less corner rounding on the highlight" ×2 → Stack target `border-radius` 9 → 4 → 2px
- Callout: white fill / black text; "Stack" semibold; regular-weight body; period added; padding +1 then −1; corner rounding −2px
- "When users click Stack, highlight moves to the white canvas, prompt click-drag" → `demo-2-cursor` keeps the tint, frame-card lifts above it, canvas spotlit
- "White canvas should just be subtly pulsing. Users click-drag to make a stack, then the stack appears" + provided `plus-thick.svg`, `Rectangle 4297/4298.svg` → built real mouse drag-to-draw
- "Callout on the side with an arrow like the first one" → canvas callout moved beside the canvas (left, right-pointing arrow); kept narrow to avoid canvas-wrap clipping
- "Two lines, don't uppercase/embolden Stack" → widened callout to 170px, plain lowercase "stack"
- "Pulse stops on canvas hover, normal hover/click works" → `.canvas-content--demo-idle:not(:hover)`
- "Make canvas pulse more noticeable like the stack one" → solid inset blue ring instead of soft glow; then −0.5 (1.5↔2.5px)

## Records of Resistance

1. **`set-state-in-effect` lint rule** blocked the obvious "reset demo state when scene changes" effect. First tried a `useRef` for the previous scene — that hit the *other* new rule, `react-hooks/refs` ("cannot update ref during render"). Landed on the React-documented **adjust-state-on-render with `useState`** for the previous scene (`if (prevScene !== scene) { setPrevScene(scene); ... }`). This config is React-Compiler-strict — refs and effects both reject mid-render/effect setState.
2. **Canvas-wrap clips overflow.** A callout placed left of the frame-card got cut off by `.canvas-wrap { overflow: hidden }`. The frame-card is centered with only ~150px of gap to the sidebar. Fix: keep the callout narrow enough (170px, scaled 0.765 inside the frame-card ≈ 130px on screen) that it fits within the gap. A wider callout clips — there's a hard ceiling (~182px local at 1440px viewport).
3. **Stacking-context puzzle for the spotlight.** The Stack item couldn't "poke through" the workspace tint because the Grid popout's `z-index + transform` traps children. Solution: lift the whole popout above the tint (`z-index: 50`) and add an *inner* veil (`z-index: 1`) that re-tints everything except the Stack item (`z-index: 2`). The white halo is a `box-shadow` on the Stack item, which paints above the veil.
4. **Drag coordinates vs. the frame-card transform.** The canvas is rendered at `scale(0.765)`. Measuring the drag in raw client px would be wrong. Used `getBoundingClientRect()` on the canvas-content (already-scaled on-screen size) and stored the rect as 0–1 fractions, so the rectangle/stack render with percentage positions independent of scale/zoom.
5. **Set up a Playwright + qlmanage screenshot pipeline** (installed Chromium) to verify each demo state — idle/drawing/placed — since these are interaction states that can't be eyeballed from code.

## Successes

- Practice Demo is a real guided flow: Grid hover → Stack → Using Stacks modal → Practice Demo → spotlit Stack → click → spotlit canvas → genuine click-drag → 2-column stack placed
- `demo-1`: workspace tinted, Grid popout veiled, Stack item spotlit (white halo + pulsing 1.5↔2px blue ring), side callout
- `demo-2`: canvas lifts above the tint, pulses a solid blue ring (1.5↔2.5px, stops on hover so the normal hover state shows), `+` crosshair cursor, side callout
- Real drag: `mousedown` → `mousemove` draws a blue rectangle → `mouseup` places the stack (`#B6E0FF` + `#CDEEF3` columns); tiny drags snap to a default size
- Draw state self-resets — the demo layer's state is keyed to the scene via adjust-on-render
- Canvas pan/zoom and frame/canvas selection are suppressed during `demo-2` so the drag is unambiguous
- Build clean — 252 KB JS / 32.6 KB CSS (76.7 / 6.2 KB gzipped)

## What's Next

- After the stack is placed in `demo-2`, the flow currently stops — no transition onward. Tina will likely direct the next step (continue to `demo-4`+ or a new prompt)
- `demo-3-drawing-frame` scene is now orphaned (the drag preview replaced it) — could prune later
- `public/vector-popup.svg` still unreferenced (from CP19)
