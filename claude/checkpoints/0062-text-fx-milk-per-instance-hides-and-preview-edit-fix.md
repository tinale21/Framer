# 0062 — Milk text effect + per-instance hide + spelling-preview fix + per-cycle recommendations

## Context

Bundle of related cleanups + fixes layered on top of 0061. Five threads:

1. **Advanced Text Effects → Milk only.** First attempt rendered a
   3-cell stack (Wallsign / Abyss / Milk) with CSS-approximated
   effects; only Milk reads close to the source SVG, so the user
   asked to drop the other two. Since the pack is now one item,
   tear-off doesn't make sense — clicking the card just drops an
   editable styled TextEl directly.
2. **Editable "Milk" text element.** TextEl gains an optional
   `effect: 'milk'` field; the renderer applies a `text-effect
   text-effect--milk` class so the puffy white-with-black-stroke
   look survives across edits (Leckerli One + multi-shadow stack).
   Purple component-instance outline on the wrapper, with custom
   round purple corner handles when selected.
3. **Per-component-instance hide state.** `extractedPatterns` was a
   global `Set<string>`, so torn cells in one instance hid the
   matching cells in any later-dropped instance of the same
   component. Entries are now scoped as `${compKey}:${cellId}`;
   handlers thread `el.key` through to App, and each grid +
   ComponentSvg's hide CSS scope by that key (`data-comp-key` on
   the wrap div + selector prefix). Selection (`selectedCellId`)
   uses the same scoping so handles only render on the instance
   the user actually tapped.
4. **Spelling-preview not visible until click-out.** Clicking a
   suggestion card moved focus into the right sidebar; the
   contentEditable's onBlur guard bails when relatedTarget is
   inside `.right-sidebar` (originally for the color picker), so
   edit mode never ended. The contentEditable kept its own
   un-spliced text, masking the renderTexts preview until the
   user clicked off the sidebar. Fix: `selectFix` now calls
   `setEditingText(null)` whenever a non-null preview is selected
   — the static render runs and the spliced text + green wash
   appear immediately.
5. **Per-cycle recommendation categories + "Text Components" label.**
   `recommendationKinds` accumulated across cycles, so once Vectors
   had been fixed it kept appearing in the recommendation panel
   forever. Now resets on the 0 → >0 issue transition (user added
   new fixable content), so each "all-clear" only lists what was
   fixed in that round. RecommendationPanel subtitle reads "Text
   Components" for the Text category (already "Vector Components"
   for Vectors).

## What changed

- `public/recs/text-effects/milk.svg` retained; wallsign.svg /
  abyss.svg removed; `TEXT_FX_ENTRIES` deleted.
- `index.html`: imports just Leckerli One now (dropped Oswald +
  Cairo since their effects were removed).
- `App.applyRecommendation` for `'text-effects-grid'` drops a
  TextEl with `effect: 'milk'`, `size: 110`, `weight: 400`
  directly instead of a recommendation-textfx wrapper.
- `TextEffectsGrid` component + `handleTextEffectMouseDown` +
  `onTearTextEffect` prop + `App.tearTextEffect` all removed
  (dead since the wrapper is gone).
- `App.extractComponentShape` + `tearTextListItem` now take a
  `compKey` and store `${compKey}:${cellId}` in
  `extractedPatterns`.
- `Canvas.handleComponentShapeMouseDown` +
  `handleTextListItemMouseDown` take a `compKey` and pass it
  through. Each render branch in freeEls.map passes
  `compKey={el.key}` to ComponentSvg / TrianglesGrid /
  TextListDropdown.
- Each grid reads `hiddenPatterns.has(`${compKey}:${id}`)` and
  compares `selectedCellId === `${compKey}:${id}`` for its
  selection ring.
- `ComponentSvg` wrap div gets `data-comp-key={compKey}`; hide CSS
  prefixes selectors with `.demo-element__svg[data-comp-key="X"]`
  so cells only hide in the matching instance. The selection
  overlay useLayoutEffect strips the `${compKey}:` prefix and
  bails if the selected cell belongs to a different instance.
- `App.selectFix` calls `setEditingText(null)` on non-null
  selection so the contentEditable for the previewed text
  releases its hold and the static render shows the spliced text.
- `App.recommendationKinds` reset effect: when
  `visibleIssues.length` transitions 0 → >0, the kinds Set is
  reset to empty.
- `RecommendationPanel` subtitle: `Vectors → "Vector Components"`,
  `Text → "Text Components"`, fallback `"Header Components"`.
- Milk text styling: purple 1.5px outline (`outline-offset: 4px`),
  blue selection border suppressed when `.text-effect` is present,
  round purple corner handles (9px circle) at the outline corners.

## Human directions

- "since it is just one word now, users don't have to drag the text
  out. they should just be able to edit the text there"
- "great. can it still have a purple outline though"
- "you can remove the blue outline since it has a purple. be sure
  that the purple outline has the circle size adjustors on the
  corners"
- "the only one that looks milk is the only one that looks closely.
  can we just remove wallsign and abyss from the group and only
  have milk"
- "ok it seems to be working. now to address a few issues.
  Firstly, the suggestion text spell corrector seems to not be
  showing up if the canvas is selected. Next, the recommendations
  are appearing based on what is on the canvas. i wanted it to be
  if for example users placed a vector and then they applied a
  suggestion, the vector recommendation appears and then if they
  add a text after and then apply a suggestion then the text
  recommendation appears but not the vector one since that already
  appeared the first time. and then if they add both a vector and
  text and check the suggestions at the same time after they apply
  those suggestion then both the text and vector recommendation
  shows up since they check those at the same time. lastly, can
  you change the 'Header Components' text on the text
  recommendation to 'Text Components'"
- "it happens on the second time: [video] when i click out, it
  appears back normally"
- "ok now i've noticed that for the Text Editor, Unique Shapes,
  and 3D Shapes, if i drag something out and then click on the
  card to drop another component, it saves what i drag out instead
  of giving me a new set of the component"

## Resistance / rebuilds

- Spent a long time chasing the spelling-preview bug as a
  selection-state issue before noticing from the video frames
  that the canvas text only updated AFTER the user clicked off
  the right sidebar — that pointed straight at the contentEditable
  onBlur guard.
- The per-instance hide refactor touched a lot of small spots
  (every handler signature, every grid component, ComponentSvg's
  CSS scoping) but ended up clean because the lookup pattern is
  uniform.

## Successes

- Drop a fresh component → all cells present even after a previous
  instance was torn from.
- Click a spelling suggestion → canvas updates immediately with
  the spliced text + green preview wash, no click-out needed.
- Recommendation panel resets between "all-clear" cycles, so each
  cycle's categories reflect what was fixed in that round.
- Milk effect is genuinely editable styled text with a clean
  purple selection treatment.
- `npm run build` green.
