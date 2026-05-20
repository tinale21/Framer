# Checkpoint 0030 — Demo-7 Layout Panel + Properties-Panel Polish

**Date:** 2026-05-20
**Commit:** build the demo-7 layout-panel step (stack callout → properties panel →
Layout dropdown) and align the properties panel's padding and typography with the
rest of the UI

## Context

Continues the demo after items are in the stack (post-0029). Two threads of work:

1. **Demo-7 layout step** — once 2+ items are in the stack, a callout points at
   it; clicking the stack opens the right-side *properties* panel, which highlights
   "Layout" and, on click, reveals the layout dropdown options.
2. **Properties-panel polish** — the panel had all the right parts but the
   spacing, padding, text size, and weight didn't match the reference SVGs
   (`RightBar (2)/(3).svg`) or the other panels (Insert, left sidebar).

## Human Directions

- "Once 2+ items are in the stack, a callout appears right of the stack; clicking
  it swaps the right panel to layout controls; highlight Layout, then show its
  dropdown" → new `demo-7-layout-prompt` / `demo-7-layout-panel` scenes; `PropsPanel`
  in `RightSidebar.tsx`; Layout title is clickable and outlined during the step.
- "The callout is cut off if the stack is too big — keep it above the canvas
  layer" → `--callout-room` classes flip `overflow: hidden` → `visible` when the
  stack callout is showing.
- "Match the callout text size/weight to the other callouts" → done.
- "The element popup clips the right tile because of the scrollbar" → popout made
  responsive (percentage-based) so it fits whatever width remains, scrollbar kept.
- "The right panel parts are there but spacing/size/weight are off — match the
  SVG" → row pitch ~30px (14px gap), "Image" header sizing, uniform label weight.
- "The padding is different from the other panels — re-adjust" → properties-panel
  content moved from x=21 to x=17, flush with the Insert panel.
- "The Design/Prototype tab left padding feels bigger" → removed extra 4px inset.
- "Make 'Image' match 'Project Name'; section labels match 'Pages'" → 15px/600 and
  13px/600 respectively, copied from the left sidebar.
- "Design tab should be semi-bold; the gap between the tabs is off vs Insert" →
  `.tab--active` weight 600, tab gap 4px → 8px (matches `.pill-tabs`).

## Records of Resistance

1. **Element popout scrollbar — hidden, then objected to.** First fix removed the
   scrollbar entirely (`scrollbar-width: none`). Rejected: "you've completely
   removed the scrollbar.. it should still be there." Redone: scrollbar restored,
   popout content made percentage-responsive so it no longer clips the right tile.
2. **Design/Prototype tabs churned.** First told to leave them untouched; then to
   restyle to match Insert (color + rounding); a font-weight change shifted the tab
   widths, so weight was reverted to keep size pixel-identical. This checkpoint
   finally takes the weight change deliberately ("Design should be semi-bold").
3. **Properties-panel padding off twice.** The panel inherited a stray `0 4px`
   inset on four containers, putting content at x=21 vs the Insert panel's x=17.
   Re-adjusted after the user flagged it ("padding is different from all the other
   panels").
4. **Demo-5 highlight bottom padding** tuned across three passes (+2, +2, −1px).

## Successes

- Demo-7 flow works: stack callout → click → properties panel → highlighted Layout
  → click → layout dropdown options.
- Properties panel matches `RightBar (2/3).svg` for spacing, text size, and weight.
- Panel content is now flush with the Insert panel (x=17); tabs, header, and all
  section labels align.
- "Image" and the section labels reuse the left sidebar's "Project Name"/"Pages"
  type settings, so the UI reads consistently.
- Build clean — 261.5 KB JS / 37.4 KB CSS (79.7 / 6.9 KB gzipped).

## What's Next

- The alignment-icon row sits 4px inset from the section labels (icon-toolbar
  cluster) — left as-is unless flagged.
