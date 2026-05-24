# 0074 — Dark mode audit & cleanup

## Context

Audit pass on dark mode legibility/contrast. A lot of recently-added
UI never got dark-mode rules and was reading badly on a dark
sidebar/canvas: community popup, recommendation cards, demo
highlight on Insert, the error-checker (Editor) panel, the
component/element/base hover popouts, plus the logo button itself.

## What changed

### Modal + community popup
- `.modal` base now has dark surface + lifted shadow, with themed
  title, body, close, and primary/secondary buttons.
- Community popup specifics: dark search field, dark filter chips
  (active state inverts to white), dark titles + subtitles, dark
  preview backgrounds.

### Recommendation cards (sidebar + community)
- `.rec-card` body, title, meta, bookmark all themed.
- Tag chip palette retinted — every variant kept its hue but moved
  to a darker base + lighter text so the chips still color-code at
  a glance without glaring on the dark card body.
- Bookmarked-on stays gold (#f5b400).

### Insert section demo highlight (sidebar)
- `.insert-section--demo` and `.insert-demo-callout` switched from
  white-on-dark (blinding) to a soft #2a2a2a surface so the
  "Add several elements into the stack." cue still reads as focus
  without being a flashlight.

### Logo button
- `.topbar__logo-btn` darkened to `#2a2a2a` in dark mode so the
  already-inverted (now white) logo has a dark surface to read
  against — was invisible before because the button bg stayed
  white. Chevron muted to `#999`.

### Hover popouts (Vector / Component / Element / Base)
- Vector popout: items adopt the grid popout's dark treatment —
  `#2a2a2a` pill, white label, `#a6a6a6` icon, blue hover.
- Component popout: container matches grid. The SVG asset
  (`public/components-popup.svg`) had its outer white card
  rect set to `fill="none"` + `stroke="none"` so the dark
  container reads as the surface; only the inner "Create new"
  pill floats inside. The pill itself gets
  `filter: invert(1) hue-rotate(180deg) brightness(1.1)` to flip
  to dark-pill-with-light-text matching the vector pill.
- Element popout: container matches grid. Section labels lifted
  to `#cccccc`. Strip image gets `brightness(0.82)` to tone the
  baked white element cards to a light gray (cards' colored
  previews intact — user explicitly asked not to invert).
- Base-hover popout (the bottom row of Insert tile previews):
  same `brightness(0.82)` filter so the white tile images
  match the element popup's light-gray tone.

### Editor (error checker) panel
- Title, section titles, check rows, info text, swatches.
- Issue cards: `#2a2a2a` surface, blue active state
  (`#14304a` background + blue border) for the currently-selected
  issue.
- Pager arrows + disabled state.
- Action buttons (Ignore once / Ignore all / Add to exceptions).
- Empty + no-errors states.
- "Editor Settings" link lifted to `#4db5ff`.

## Human directions

- "ok can you now check the dark mode and make sure everything is
  legible and in contrast"
- "the logo isn't visible and the component hover popup is odd in
  dark mode"
- "have the vector hover popup look the same as the way the grid
  one is in terms of color for dark mode. also use the colors for
  the component hover popup"
- "there is this weird white box fill for the dark mode component
  hover popup"
- "there shouldn't be a fill box at all?"
- "i don't think the text for component and element are legible.
  can you use the create new button color the same color button
  like the vector buttons in dark mode. also for the error
  checker, the 'Editor' text is not legible on dark mode"
- "don't change the cards within the element hover popup though"
- "can you make them a bit darker though like a light gray for
  dark mode"
- "can you do the same for the base ones in dark mode"

## Resistance / rebuilds

- Component popout: first pass made the container white in dark
  mode (so the baked white SVG card blended in). User wanted dark
  container instead — but then the baked SVG showed a white "fill
  box". Tried `filter: invert(1) hue-rotate(180deg)` next — still
  had a dark-on-dark box for the outer card. Final fix: zero out
  the SVG's outer rect fill+stroke so only the inner pill remains,
  then invert just the pill.
- Element popout: started with the same invert + brightness as
  component popout. User said "don't change the cards" — the
  colored element previews matter. Backed off to a plain
  `brightness(0.82)` tone on the strip-img so the white card
  surfaces drop to light gray without changing the element art.

## Successes

- All four Insert hover popups now share the same dark surface
  treatment: `#1f1f1f` container, `#2a2a2a` items, `#a6a6a6`
  icons, white labels, blue accent.
- Editor panel reads end-to-end on dark — title, issue cards,
  actions, settings link.
- Community modal + rec cards no longer look like white
  islands on a dark sidebar/canvas; tag chips still color-code.
- Logo visible in dark mode.
- `npm run build` green throughout.
