# Checkpoint 0015 — Stack Modal Wiring (from Grid Popout)

**Date:** 2026-05-18
**Commit:** Click "Stack" in the Grid popout to open the Using Stacks modal; popout stays mounted behind the modal backdrop

## Context

After CP14 dialed in the color spec, Tina wired up the Grid popout's Stack option to actually do something — opening the existing `StackTutorialModal` ("Using Stacks" with the Before/After comparison). This connects the new Grid hover flow to the existing tutorial path. The popout itself stays visible alongside the modal so the user sees the context of where they clicked from.

A few iterations:
- First pass: hovering Base used to also pop up the BasePopout when scene became `stack-tutorial-modal` or `disabled-tutorial-modal` (legacy tutorial behavior). With the new Grid flow, that was now duplicate and confusing — a stray Frame/Stack/Grid/Masonry popup floating off-screen next to the modal. Pruned `stack-tutorial-modal` and `disabled-tutorial-modal` from `SHOW_POPOUT`.
- Second pass: the Grid popout was unmounting when the modal opened because the modal backdrop overlaid the popout's hover area, firing mouseleave on the wrapper. Kept the popup mounted by deriving `showGridPopup = gridHovered || scene === 'stack-tutorial-modal'`, and gated the hide-timer with a `sceneRef` check so the timer's deferred callback bails out if the modal is still open.
- Third pass: bumped popup z-index to 50 (above the modal backdrop) so it would appear in front of the tint. Tina wanted it BEHIND the tint instead — reverted to z-index 30 so the popup sits behind the semi-transparent gray, visible-but-dimmed.

## Human Directions

- "Make this popup when users select Stacks" + Frame 21197.svg (huge ~297KB SVG that's likely the existing Using Stacks dialog) → wired the existing `StackTutorialModal` to fire from `onSelectStack` on the Grid popout
- "There's a weird popup of Frame/Stack/Grid/Masonry that appears (the old way). Remove that, make sure the new popup stays in place" → removed `stack-tutorial-modal` and `disabled-tutorial-modal` from the BasePopout's `SHOW_POPOUT` list in App.tsx
- "Make sure the hover popup for Grid still stays there when the Using Stacks popup appears" → derived `showGridPopup = gridHovered || scene === 'stack-tutorial-modal'`, gated hide-timer with `sceneRef`
- "It is not there" → discovered the popout was being hidden because mouseleave fired when the modal backdrop covered the wrapper; fixed by also reading `sceneRef.current` inside the setTimeout callback (so the deferred hide bails out even if scheduled before the scene change)
- "It should be behind the background tint" → z-index 50 → 30 (below the modal-backdrop's 40)

## Records of Resistance

1. **Reused the existing `StackTutorialModal` instead of building a new one from Frame 21197.svg.** The reference SVG is ~297KB (likely contains embedded image data — too large to extract via Read). The existing tutorial modal is already styled to match the Framer "Using Stacks" design with Before/After comparison and the Practice/Demo / Don't Show Again buttons. Reused it directly. If the new SVG has specific differences (copy, layout, embedded screenshots), can adjust as a follow-up.
2. **Used a `sceneRef` for fresh access inside setTimeout closures.** When the hide-timer was scheduled in render N, its setTimeout callback closed over the value of `scene` at render N. If scene changed (e.g., user clicks Stack → 'stack-tutorial-modal') before the timer fires, the closure still thought scene was the old value and would have hidden the popout. Synced `sceneRef.current` via a `useEffect` (after the linter caught that updating refs during render is anti-pattern in React 19's react-hooks plugin).
3. **Did not change the modal's z-index structure.** Could have moved the modal out of the backdrop into a sibling element to control z-index independently, but that's a bigger refactor. The current modal-backdrop + modal nesting works fine for the simple case where popup z=30 sits below backdrop z=40, with the modal itself visible above the backdrop via its child-of-backdrop position.
4. **Pruned both `stack-tutorial-modal` and `disabled-tutorial-modal` from SHOW_POPOUT in one go.** They were both showing the BasePopout layered behind their respective modals — useful in the original tutorial flow but now redundant with the GridPopout taking that role. The `base-hover` and `demo-1-stack-highlighted` scenes still trigger BasePopout for the tutorial walkthrough.
5. **`useEffect` cleanup resets `gridHovered` when transitioning AWAY from the stack tutorial.** If the modal closes while the user's mouse is somewhere else (which is typical after dismissing a modal), without this cleanup the popout would stay mounted forever. The cleanup runs when scene was `'stack-tutorial-modal'` and changes to anything else.

## Successes

- Click Stack in the Grid hover popout → existing `StackTutorialModal` opens, walking the user into the same Practice/Demo flow as the original tutorial path
- Grid popout stays mounted alongside the modal as visual context — behind the dimmed backdrop, where the user can see "this is where you clicked from"
- No stray BasePopout floating off in the corner during the modal — both relevant scenes pruned from its trigger list
- Hover timer correctly bails out when the modal is open, both at scheduling time and at firing time (handles both the synchronous and async race conditions)
- Build stays clean — 245 KB JS / 27.1 KB CSS (74.9 / 5.5 KB gzipped)

## What's Next

- If Frame 21197.svg has specific UI differences from the existing StackTutorialModal, those need to be applied
- The popout being behind the backdrop tint reads dimly — visible but not interactive. If the user wants it interactive too (e.g., click a different option to switch modals), the modal backdrop would need to be restructured to let pointer events through to the popout
- Other insert tiles (Text, Vector, Element, Component) could get similar hover popouts following the same pattern
