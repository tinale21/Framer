# Checkpoint 0009 — Canvas Frame, New Toolbar, Pan/Zoom

**Date:** 2026-05-18
**Commit:** Bottom toolbar rebuilt from Toolbar.svg; canvas frame colors/typography polished; canvas scaled, positioned, and made pannable + zoomable like Figma

## Context

After CP08 finished the right panel work, Tina moved attention to the middle of the screen — the canvas frame and the bottom toolbar. She provided a new Toolbar.svg showing a completely different toolbar layout: cursor pill, 5 standalone middle icons, and a 3-icon view-toggle group, all in a single white pill with a `#D6D6D6` border and `#ECECEC` vertical dividers between sections.

The canvas frame itself went through several rounds of polish: color updates (Desktop bar to `#E5E5E5`, text to `#999999`/`#A1A1A1`, play+plus buttons to `#999999` background with white text), typography (Home semibold, Desktop semibold, 1200 medium), corner-rounding alignment with the toolbar (8px outer + 10px after a bump, inner Desktop bar to 8px, canvas-content to 8px), padding bump (+4 then +2 more on each side), and the scale (initially 0.9, then 0.8, then 0.85) + translateY positioning (built up in 2-24px nudges to 84px total).

Then Tina asked for true Figma-style interactivity: drag-to-pan on the canvas, and zoom in/out via Cmd/Ctrl+wheel. The toolbar stays pinned because it's `position: absolute` to the viewport, not the canvas.

## Human Directions

- "This is the toolbar that appears in the bottom" + Toolbar.svg → rewrote BottomToolbar completely with all 9 inlined icon paths from the SVG (cursor + chevron, chat, moon, grid+, people, search+, frame/monitor/layers view toggles)
- Toolbar corner-rounding iterations: "match desktop-1200 (5px)... actually match the right side panel boxes (8px)... adjust the inner boxes within the toolbox to match" → outer 8px, view-toggles container 8px, active view toggle 5px, cursor pill 5px (mirrors the .insert-tile/.insert-tile__icon nesting)
- "Move the toolbox up by 8px" → bottom: 22px → 30px
- Canvas color/type adjustments — Desktop bar fill `#E5E5E5`; Desktop text `#999999` semibold; 1200 text `#A1A1A1` medium; play+plus buttons `#999999` with `#FFFFFF`; Home text semibold
- Canvas corner rounding: matched to toolbar (`14px 14px 0 0` → `8px`, then bumped to `10px` after a "+2px more" request); inner Desktop bar `10px → 8px`; canvas-content `6px → 8px`; bottom corners added (was `8px 8px 0 0`)
- Canvas padding: bumped twice (+4 → +2 more) to `20px 22px 18px`
- Canvas scale: built up gradually (0.9 → 0.8, then back to 0.85) with transform-origin `top center`
- Canvas translateY: built up via 2-24px nudges, ended at 84px
- "Now I want to make the middle section moveable/draggable like how Framer and Figma works... the toolbox should stay fixed" → wired drag-to-pan: `mousedown` on canvas-wrap starts tracking, `mousemove` past 5px threshold triggers drag mode, `mouseup` ends drag; offset state applied to inline transform on `.frame-card`
- "Make it so that users can also zoom in and out" → added a non-passive `wheel` listener that requires `ctrlKey`/`metaKey` (matches Figma's pinch-to-zoom on trackpad and Cmd+wheel on mouse); smooth exponential zoom (`exp(-deltaY*0.01)`), clamped to [0.15, 3]

## Records of Resistance

1. **Inlined all 9 toolbar icon paths into the component instead of adding them to `icons.tsx`.** These icons are bottom-toolbar-specific (different fill colors, different stroke widths than the topbar/right-panel icons). Adding them to the shared icons file would have polluted it with one-off variants. Inlining keeps the toolbar self-contained. Cost: the BottomToolbar.tsx file is now ~140 lines instead of ~30, but the trade-off is right for a component this visually specific.
2. **Did not zoom-to-cursor on wheel.** Zooming toward the cursor position (so the point under the cursor stays put) is the Figma behavior and is a nicer UX, but it requires more transform math (especially with `transform-origin: top center` which my element uses for the existing static layout). For now, zoom happens from the top-center origin — the canvas grows/shrinks around its top edge. Acceptable for a prototype; flagged in case it becomes a sticking point in a class demo.
3. **Used a non-passive wheel listener via useEffect.** React's `onWheel` is sometimes passive (depends on React version + browser), which would silently fail to `preventDefault()` and let the browser scroll the page. Native `addEventListener('wheel', handler, { passive: false })` is the reliable path. Cost: one useEffect instead of an inline JSX handler.
4. **Drag/click disambiguation via a 5px threshold + a deferred isDragging reset.** First instinct was to flip `isDragging` true/false on mousedown/mouseup, but that breaks click events — `mouseup` fires before `click`, so clearing `isDragging` immediately means the click handler can't tell whether a drag just happened. The fix: defer the `isDragging` reset by one tick (`setTimeout(() => setIsDragging(false), 0)`) so the click handler sees `isDragging=true` and bails out. Subtle but standard pattern.
5. **Exempted buttons from triggering drag.** `handleMouseDown` checks `e.target.closest('button')` and skips drag setup if the target is inside a button. Without this, clicking a demo-hint button would also start tracking a drag, potentially interfering with the scene-change click. Buttons get clean clicks; the surrounding gray + frame card gets drag.
6. **Static transform moved from CSS to inline.** With drag/zoom now controlling the transform, the previous CSS `transform: translateY(84px) scale(0.85)` would be overridden by inline anyway. Kept `transform-origin: top center` in CSS since that's stable; the dynamic `translate(x, y) scale(s)` is inline.

## Successes

- Bottom toolbar matches the Toolbar.svg reference visually — same structure, same colors, same icons (all 9 paths extracted from the SVG and inlined as React JSX)
- Canvas frame matches the Figma reference closely after color/type/spacing/rounding polish
- Drag-to-pan works fluidly with proper click-vs-drag disambiguation — small clicks still trigger open/close-home behavior, real drags suppress click events
- Cmd/Ctrl+wheel (and trackpad pinch) zoom works smoothly — exponential factor feels natural, clamped to a sensible range
- Bottom toolbar correctly stays fixed during pan/zoom (it's positioned to the viewport, not the canvas)
- `user-select: none` on canvas-wrap prevents text selection during drag
- All TS + lint + build clean (241 KB JS / 19.5 KB CSS, 74.3 / 4.5 KB gzipped — +12 KB JS for the inlined toolbar SVG paths and drag/zoom logic)

## What's Next

- **Zoom-to-cursor** — currently zooms from top-center; nice-to-have to make it zoom toward the cursor like Figma
- **Pan with trackpad two-finger swipe** — currently only mouse-drag and wheel-with-modifier are wired; could add wheel-without-modifier as pan
- **Zoom controls in UI** — could add a zoom percentage indicator and +/- buttons in the toolbar or as a small overlay
- The Properties panel ("Design / Interaction" tabs) is still using the original CP01 styling
- The demo flow's hint zones still bubble to the frame-card click handler, opening the home dropdown as a side effect (existing caveat from CP04)
