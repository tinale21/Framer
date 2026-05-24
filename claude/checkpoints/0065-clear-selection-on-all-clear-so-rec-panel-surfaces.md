# 0065 — Clear selection on all-clear so rec panel surfaces

## Context

After 0064 made the rec panel yield to selection, applying the last
fix left the just-edited text/shape selected — so when issues hit 0
RightSidebar saw `somethingSelected === true` and routed to PropsPanel,
which suppressed the recommendation panel entirely.

## What changed

Extended the `prevIssueCountRef` useEffect to also clear `selectedShape
/ selectedText / selectedEl / stackSelected` on the `>0 → 0`
transition while the editor is open. After that initial surfacing
the panel still yields to any subsequent selection (per 0064).

## Human directions

- "ok but why does now the recommendation panel doesn't show after
  the suggestions at all even though it is on in editor settings"

## Resistance / rebuilds

- One-line addition to existing effect, no rebuilds.

## Successes

- Recommendation panel appears as soon as issues hit zero.
- Clicking off recommendation panel still yields to selection.
- `npm run build` green.
