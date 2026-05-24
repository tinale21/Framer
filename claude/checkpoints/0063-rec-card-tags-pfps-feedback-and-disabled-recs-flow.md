# 0063 — Rec card tags + PFPs + feedback flow + Disabled Recommendations

## Context

Polish + flow work on the Recommendation panel:

- The four recommendation cards all read identically ("Template /
  Free / Beginner") and used the same pink gradient avatar.
- The "Was this helpful? Yes / No" row had no behavior wired up.
- Needed a "Disabled Recommendations" confirmation flow when the
  user clicks **No** — mirroring the existing "Disabled Stacks
  Tutorial" modal — that lets them either jump to Editor Settings
  to manage the toggles or dismiss outright. Dismiss should also
  uncheck Recommendation Prompting so the panel doesn't reappear.

## What changed

### Tags
- "Template" labels swapped for "Component". Each card now leads
  with **Component** + one distinguishing chip: Beginner / Pro /
  Free / Advanced respectively. Two tags each leaves room (the
  three-tag versions were cutting off "Intermediate").
- New per-tag color classes: tag rendering generates
  `rec-card__tag--{lowercase}` and CSS assigns hues per axis
  (type=blue/purple/teal, price=green/gold, skill=pink/peach/red).

### PFPs
- Four new SVG avatars in `public/recs/pfps/` (Ellipse 15 variants
  4/5/6/7 from the user's downloads).
- `RecCard.pfp?` field; each card carries a filename. The render
  swaps the pink gradient `.rec-card__avatar` div for an `<img>`
  styled the same 28x28 round + 2px white border via the new
  `--img` variant.

### "Was this helpful?" feedback
- `feedback: 'yes' | null` local state in RecommendationPanel.
- **Yes** swaps the row for "Thank you for your feedback!" left-
  aligned, weight 400, green (`#1aa055`) — `.rec-helpful--thanks`.
- **No** fires a new `onUnhelpful` callback threaded through
  RightSidebar to App.

### Disabled Recommendations modal
- New `DisabledRecommendationsModal` mirroring
  `DisabledStackTutorialModal` exactly (`.modal--completed`, same
  padding/border-radius/button rules).
- Wording: "Want to remove or review other suggestion types?
  Manage which recommendation categories appear in your editor
  through settings."
- **Manage** → closes this modal, opens Editor Settings.
- **Dismiss** → closes the modal, closes the editor (so the
  right panel falls back to Insert), AND flips off every
  Recommendation Prompting leaf so the panel stays suppressed.
- **X** → just closes the modal (non-destructive in case of
  accidental click).

### Recommendation Prompting gating
- `RECOMMENDATION_LEAVES` is now exported from
  `EditorSettingsModal`.
- App derives `recommendationsEnabled = some leaf is true`.
- `useEffect` auto-closes the editor when it's open + no issues
  remain + recommendations are disabled, so the right sidebar
  collapses back to Insert instead of holding an empty editor.
- After "Manage → Save" on Editor Settings, also close the
  editor (mirrors Dismiss). Tracked via a one-shot
  `manageFromDisabledRecs` flag that's set when Manage is
  clicked and cleared on either Save or Close.

## Human directions

- "for the cards, can you change the template label to component.
  can you also make some of them different so they are not all
  component, free, and beginner. can you also color code them"
- "some of them are cut off like intermediate. they dont all have
  to have three to make room. also have all of them as component"
- "can you also add in a pfp for them so they are not all just
  pink circles: [4 SVG files]"
- "now have it where if users click 'yes' on was this helpful? it
  disappears the was this helpful? yes/no and replaces it with
  'Thank you for your feedback' in green. if they click 'no' then
  have a popup appears that is like the disabled stacks tutorial
  but for 'Disabled Recommendations' and then if users click
  manage it takes them to the Editor Settings popup. for the
  'Disabled Recommendations' popup follow the same spacing,
  padding, button, etc. rule as you did for the disabled stacks
  tutorial. also if users click dismiss and just takes them back
  and the right side panel goes back to the insert panel"
- "for thank you for your feedback can you add a '!'. can you
  also make the font weight a bit smaller and left aligned"
- "ok so after users click dismiss for the disabled recommendation,
  the right panel goes back to the insert panel and any further
  recommendation doesn't appear for them after. also it should
  check off recommendation prompting in the editor setting for
  them. when this is uncheck users will no longer receive the
  recommended resources after they apply a suggestion"
- "if users click manage and then save on the editor settings,
  let the panel go back to the insert after too."

## Resistance / rebuilds

- First pass on tags used 3 per card with full type/price/skill;
  "Intermediate" was wide enough to overflow the card. Reverted
  to 2-tag combos.
- Considered closing the editor immediately when toggling rec
  prompting off in settings, but the auto-close `useEffect`
  (`!recommendationsEnabled && no issues`) handles all paths
  uniformly without ad-hoc wiring.

## Successes

- Cards visually differentiated (avatar + tag colors).
- Yes / No flow complete: Yes → green thank-you in place; No →
  modal → Manage or Dismiss → both routes end in Insert panel.
- Recommendation Prompting is a real off-switch — toggling it off
  anywhere (Dismiss or Editor Settings) makes the panel stop
  appearing, and the editor gracefully closes when it would
  otherwise show an empty state.
- `npm run build` green.
