# Checkpoint 0047 — Preview Bar Height + Clean Preview Render

**Date:** 2026-05-23
**Commit:** match the "Viewing Suggested Changes" bar to the default
toolbar's height and drop the red issue wash on the canvas while a
suggested fix is being previewed

## Context

Two small polish passes on the Editor flow. The Apply prompt that
swaps in for the default bottom toolbar while previewing a fix was
visibly taller than the default — a `.btn`'s `10px 18px` padding was
winning over the toolbar's intended override because of selector
specificity. Bumped the override to `.bottom-toolbar .bottom-toolbar__apply`
so `4px 12px` actually applies, shrank the cancel button, and pinned
the toolbar's `min-height: 49px` so both variants now measure exactly
49 px. Second: while previewing a suggested fix, the red wash that
flags the failing shape/text was still painted on top, making the
previewed color hard to read. App now passes `highlightedIssue = null`
whenever `previewedFixIdx !== null`, so the wash drops the moment the
user picks a fix card and returns when they cancel.

## Human Directions

- "Make the Viewing Suggested Changes bar match the default toolbar's
  height." → tightened the Apply / cancel paddings, raised the override
  selector specificity, and pinned `.bottom-toolbar { min-height: 49px }`.
- "Apply isn't working for vectors." → couldn't reproduce; verified
  with a Playwright run across Rectangle / Oval / Polygon / Star that
  badge drops 4 → 3 → 2 → 1 → 0 on successive Applies. Most likely an
  HMR-stale page; called out the Cmd+Shift+R workaround in chat.
- "Hide the red highlight while previewing the suggestion so users can
  see the previewed color." → App now zeros `highlightedIssue` whenever
  `previewedFixIdx !== null` (the same render path handles both
  shape washes and text-run highlights).

## Records of Resistance

1. **`.btn` was winning over `.bottom-toolbar__apply`.** Both had
   equal specificity, but `.btn` was defined later in the file. Bumped
   the override to `.bottom-toolbar .bottom-toolbar__apply` so the
   tighter padding is what reaches the DOM.

## Successes

- Default toolbar and preview toolbar both measure exactly 49 px in
  Playwright; no pop-in / pop-out when a fix is previewed.
- Preview-mode canvas: oval with `#cccccc` → opens Editor → red wash
  visible (`ellipse` count = 2). Click a suggested fix → wash drops
  (`ellipse` count = 1) and the previewed color is shown cleanly.
- tsc + build clean — 322.50 kB JS / 96.05 kB gzipped.

## What's Next

- Editor Settings (the cog at the bottom of the panel) is still
  decorative — no actual settings yet.
- The Apply-during-preview path is well tested for shapes; rich-text
  preview could still benefit from a Playwright Apply assertion to
  catch the cross-segment Apply if it regresses.
