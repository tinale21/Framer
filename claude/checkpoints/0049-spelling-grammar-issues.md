# Checkpoint 0049 — Spelling + Grammar Issues in the Editor Panel

**Date:** 2026-05-23
**Commit:** add real spelling check (197K-word dictionary +
Levenshtein-distance suggestions) and a rule-based grammar pass to the
Editor's issue list, wash the failing word with the same red overlay
contrast issues use, fix a contentEditable-vs-keyboard-handler bug
that was deleting whole text boxes on backspace

## Context

The Editor's "accessibility" panel now surfaces three issue kinds in
one flow: fill-contrast (as before), **spelling**, and **grammar**.
Each one shares the same pager, Ignore Once / All / Add to Exceptions
buttons, suggested-fix preview, Apply prompt, and the canvas red wash
that highlights only the failing portion of the text.

Spelling. `src/data/words.json` ships ~197K lowercase 3-12-char
English words (filtered from `/usr/share/dict/words`) loaded once into
a Set + length-indexed Map. Any word that isn't in the dictionary and
isn't an acronym / short token becomes a spelling issue with up to
three suggested corrections — Optimal-String-Alignment edit distance
(insert / delete / substitute / adjacent-transpose), bucketed by ±2
length, sorted by distance → same-length → alphabetical. A small
override table (`teh`, `recieve`, etc.) wins so canonical typos
always suggest the conventional fix. Bundle goes from 96 KB → 743 KB
gzipped — the user accepted the trade-off for full coverage.

Grammar. A rule-based scanner — no parser, no API — emits one issue
per match:

  - Duplicate adjacent word (`the the`).
  - "could / should / would / might / must of" → "... have".
  - "a" before vowel-sounding word; "an" before obvious consonant.
  - Double (or more) spaces.
  - Standalone lowercase `i` → `I`.
  - Capitalize the first non-space character of the text.
  - Capitalize the letter after sentence-ending punctuation + space.
  - Space before `, . ! ? ; :` → drop the space.
  - Letter directly after `, . ! ? : ;` → add a space.
  - Repeated `!!`, `??`, `..` (not the `…` ellipsis) → single mark.

Per-segment canvas highlight now also handles ranges. `renderRuns`
gained a `RunHighlight` union — `{kind:'color', color, textColor}`
for fill-contrast and `{kind:'range', start, end}` for spelling /
grammar. The renderer splits each run at the highlight boundary so
the wash sits exactly behind the matched chars while every other
character keeps its existing color.

Bonus fix on the side: when typing into the rich-text contentEditable,
pressing Backspace was deleting the entire text box. App's global
keydown handler only bailed on `INPUT` / `TEXTAREA` tags, not on
contentEditable divs, so the Delete branch fired. Added
`target?.isContentEditable` to the bail.

## Human Directions

- "Add it for when there is a spelling or grammar error and they have
  the suggested fixes too." → built the spelling issue kind first with
  a tiny built-in typo list.
- "Is there no way to catch all spelling errors?" → explained the
  limit of in-browser checkers, offered four options; user picked
  "Bundle a real wordlist".
- "Can it do grammar errors?" → laid out what's possible with rules
  vs what needs a parser; user picked "Yes, add the rule list".
- "Make sure it also red highlights the spelling / grammar like
  fill-contrast." → extended `RunHighlight` to a range-based variant
  and split runs at the highlight boundary.
- "Can it do grammar for capitalization and punctuation?" → added the
  capitalization + punctuation rules to the scanner.
- "When typing in a text box, backspace is deleting the whole text." →
  global keydown handler missed contentEditable; fixed with
  `isContentEditable` check.

## Records of Resistance

1. **Backspace-deletes-whole-text.** Rich-text editor went from
   textarea to contentEditable div. The global Delete/Backspace
   branch was tag-only; contentEditable is a `<div>`. Added the
   `isContentEditable` check. (Easy fix once spotted, the symptom was
   alarming.)
2. **Spelling suggestion ranking.** Plain Levenshtein returned `wold`
   before `world` for `wrold`. Switched to OSA distance (transposition
   counts as one edit) and added a same-length preference. `world`
   doesn't always win the top slot but it shows up in the top three.
3. **Bundle size.** 197K words = ~2.3 MB JSON → ~650 KB gzipped on
   top of the existing 96 KB. Vite warns about chunk size; the user
   chose the trade-off explicitly.

## Successes

- Typed `Hello wrold this is mispeled sentance` → 3 spelling issues
  surfaced with their respective top-3 suggestions.
- Typed `hello world . i am here !! end` → 7 grammar issues firing
  across all five new rule classes (capitalize start, space before
  punctuation, capitalize sentence, `i` → `I`, repeated punctuation).
- Per-segment canvas wash: only the offending word lights up red,
  the rest of the text and its existing per-run colors are untouched.
- Apply uses `spliceTextAndRuns` so a spelling fix in a colored
  segment keeps that segment's color.
- tsc + build clean — bundle 743 KB gzipped (wordlist is the bulk).

## What's Next

- Bundle is heavy; could lazy-load `words.json` only when the Editor
  opens, or split into a separate chunk via dynamic import.
- Grammar coverage is rule-only — no context awareness, no
  subject-verb agreement, no real-word swap detection. An LLM /
  LanguageTool route would unlock all of those at the cost of a
  network call.
- Editor Settings (the cog at the bottom of the panel) is still
  decorative — no actual settings yet.
