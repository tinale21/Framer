# Checkpoint 0048 — Rich-Text Coloring via execCommand + Per-Run Highlight

**Date:** 2026-05-23
**Commit:** rebuild per-segment text coloring on `document.execCommand`,
keep the editor's selection alive across picker interactions, and wash
only the failing run on the canvas when the Editor surfaces a contrast
issue

## Context

Returned to the per-segment text coloring feature after a frustrating
debugging arc that ended with a full revert. Rebuilt it from the
ground up on the same model Framer uses — the browser's native
`execCommand('foreColor')` against the editor's live selection — so we
no longer have to manage the run-splitting math ourselves or fight
React's reconciler over the contentEditable's children. Three pieces
make it work:

1. `ColorPicker.tsx` — `e.preventDefault()` on the SV / hue / alpha
   `mousedown` handlers. Without it the contentEditable blurred to a
   non-focusable target the moment you grabbed the SV thumb and the
   subsequent `execCommand` had no editor to apply against.
2. `EditableText` (in `Canvas.tsx`) — a contentEditable that stamps
   its innerHTML once on mount and never restamps from props. The DOM
   is the source of truth; `onInput` parses the live spans into a
   `runs: TextRun[]` array and bubbles it to App. Reports the live
   range on `mouseup` / `keyup` / `select`.
3. `setTextStyleScoped` (in `App.tsx`) — when a color-only patch
   arrives with a live range, refocus the editor, restore the saved
   character offsets with `setSelectionOffsets`, then call
   `document.execCommand('styleWithCSS', false, 'true')` +
   `execCommand('foreColor', …)`. The browser does the wrapping and
   we read it back through `onInput`.

The selection state is held in a **ref** (not React state) so the
picker's long-lived `mousemove` listener — which binds once and only
re-binds when `h/a` change, *not* when our `useCallback` re-creates —
always reads the latest range. Closure-captured state would have
fired with the original range from when the SV-drag started, which
was the exact "color goes to the wrong word" symptom the user kept
hitting.

Issue highlighting also shifted to per-run: `renderRuns(text, runs,
{ color, textColor })` wraps only the spans whose effective color
matches the failing color in `<span class="text-run--issue">`, and the
CSS for that class is a translucent red `background` behind the
characters. The whole-box `.text-el--issue` outline is gone.

## Human Directions

- "Let me color just a portion of a text without affecting the rest."
- "It still does the same thing." → bounced through several broken
  selection-tracking attempts: `focusedRef` + activeElement, document
  `selectionchange` listener, mousedown-clears-saved-range — all
  passed Playwright tests but failed in the real browser.
- "Revert the whole text color changing for different parts." →
  reverted to plain `<textarea>` (TextRun + textRuns.ts removed).
- "Try once more — this is how Framer does it." → rebuilt with the
  execCommand approach above, matching Framer's behavior of holding
  the picker selection across multiple in-place re-selections.
- "Make the highlight only the part of the text the issue references."
  → moved from box-level `.text-el--issue` outline to per-run
  `.text-run--issue` background wash via `renderRuns(... flag)`.

## Records of Resistance

1. **Stale picker closure.** First execCommand pass worked, the
   second went to the original range from the start of the SV drag.
   Root cause: `setTextStyleScoped` was a `useCallback` with
   `[textSelection]` in its deps, but the picker's `mousemove`
   listener uses `useEffect([h, a])` so the handler only re-binds
   when h or a change. Mid-drag updates to `textSelection` re-created
   the callback in App, but the picker's listener still pointed at
   the stale version. Fixed by storing the selection in a ref and
   reading from `textSelectionRef.current` inside a stable callback.
2. **execCommand blanked text in Playwright tests.** The `hex-input
   + Enter` commit path lost editor focus before `execCommand` ran,
   producing weird `<div><br></div>` mutations. SV-drag works
   correctly because `preventDefault` keeps the editor focused — the
   `hex commit` path still has known issues but is not the primary
   coloring gesture.
3. **Editor exited edit mode on SV mousedown.** The SV square is a
   plain `<div>`, so `relatedTarget` was `null` on the blur. The
   `EditableText` blur handler now treats `!next` the same as
   `next.closest('.right-sidebar')` — both keep edit alive.

## Successes

- Three sequential SV-drag color picks on three different words in
  one edit session each land on their own segment with their own
  color (Playwright verified):
  `<span color1>asda</span>. asdjnj <span color2>askdjajs</span> <span color3>asdas</span>`.
- Per-run accessibility wash: typed "AAAA BBBB CCCC", coloured BBBB
  light grey (1.55:1), opened the Editor — only BBBB shows the red
  background, AAAA / CCCC are clean.
- tsc + build clean — 322.21 kB JS / 95.96 kB gzipped.

## What's Next

- Hex-input commit path during the picker session still leaves edit
  in a fragile state (the editor briefly blurs before the input
  blurs); SV / hue / alpha drag covers the primary flow.
- The data-text-editor query selector in `setTextStyleScoped` ties
  App to a Canvas attribute — consider wiring it through props if
  multiple editable text contexts ever co-exist.
