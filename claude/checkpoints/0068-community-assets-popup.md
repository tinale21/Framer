# 0068 — Community Assets popup

## Context

New feature: a "Community Assets" popup reachable from two places —
the people-community icon in the bottom toolbar (the existing
Collaborators button, re-purposed since it already used the same
glyph) and the "See All" link in the Recommendation panel. The popup
shows a grid of community-shared assets with filter tabs, search,
and the same card chrome the Recommendation panel uses.

## What changed

### Triggers
- `BottomToolbar`: existing Collaborators button now wires to a new
  `onOpenCommunity` prop and re-labels to "Community assets".
- `RecommendationPanel`: "See All" anchor now calls a new `onSeeAll`
  prop.
- Both are threaded through to `App.communityOpen` state via
  RightSidebar; the App owns the modal.

### Modal
- `CommunityModal` (new) — hand-built HTML grid (no SVG asset),
  since the modal needs functional filter tabs, search, and per-card
  tags. Started as an SVG render but pivoted after a few rounds of
  "no this needs to actually work."
- Header: title "Community Assets", subtitle, search input, filter
  tab row (`All / Components / Animations / Code snippets /
  Transitions / Template / Free`).
- Body: 3-column grid (2-col below 720px) of 12 hard-coded
  CommunityCards.
- Cards reuse the EXACT `.rec-card` markup + classes from
  RecommendationPanel — preview block, avatar (using the existing
  `/recs/pfps/*.svg` images), title row + bookmark, meta (hearts +
  comments), tag chips. Only the preview-background variants are
  new (`rec-card__preview--comm-*`), and the bottom padding is
  bumped via a `.modal--community .rec-card__body` override so the
  community cards get more breathing room.
- Tag chips reuse `.rec-card__tag--*` color classes from the
  Recommendation panel; new community-only color variants added
  for `code-snippet`, `animation`, `transition`, `template`.
- Tag counts vary per card (1, 2, or 3 chips) so the cards look
  natural — every card still carries its primary type tag so the
  filter mapping works.
- Title row is constrained to a single line via
  `text-overflow: ellipsis` so long titles don't push the body
  taller than its neighbors.
- Esc key + backdrop click + X button all close.

### Filters + search
- `FILTER_TAG` maps each tab label to the tag string a card must
  contain (e.g. "Components" -> "Component", "Code snippets" ->
  "Code snippet"). "All" passes through.
- Search input is controlled by `query` state; combined filter
  applies both the tab and a case-insensitive substring match on
  the title OR any tag.
- Empty result shows a "No assets in this category" cell.

## Human directions

- "ok now let's work on the community assets feature... [icon +
  popup + frames SVGs provided]"
- "oh you duplicated the icon. just use the one that was already
  there. i was only giving it to you so you knew what icon i was
  referring to"
- "the scroll should work vertical. it should resemble something
  like this but with a scrollbar"
- "remove the gray 'x'. also there's still no scrollbar to see the
  bottom cards fully. do i need to individual give you those cards"
- "would this help: /Users/tinale/Downloads/Community board (2).svg"
- "ok can you make the frame vertically a bit shorter and just make
  it scrollable to see all the cards"
- "make the background the same white. there seems to be two with
  the top one having a dropshadow"
- "ok can you add in labels similar to how the cards look like for
  the text and vector recommendation components. and make the filter
  categories on top work with those labels"
- "it not aligning right. can you copy the format of the cards used
  for the Text/Vector recommendation."
- "not all of the cards have to have 3 labels. some can or some can
  have 2 or 1 depending on the space available. can you also give
  more room to the bottom of card and increase the bottom padding"
- "can you add space to the bottom of each card to give it more
  padding"
- "can you make the search feature work too"
- "can you adjust cards to not have two lines for the title"

## Resistance / rebuilds

- Significant zig-zag on the implementation: tried rendering the
  Community board SVG as the popup (couldn't add filters), tried
  composing community-board.svg + a separate frames SVG below
  (cards repeated awkwardly), tried expanding the SVG's viewBox
  (only revealed empty space), tried inlining HTML labels on top
  of the SVG cards (couldn't filter individual cards). Final
  rebuild as HTML cards is what was needed all along — should
  have started there once filters were on the requirement list.
- Two distinct "X" close buttons were a non-issue once we dropped
  the SVG (no drawn close glyph in the HTML version).
- Two stacked white backgrounds was likewise an artifact of the
  SVG-as-img approach (modal white + the SVG's own white rounded
  rect with drop shadow), gone after the rebuild.

## Successes

- Community popup opens from both entry points (bottom toolbar
  icon + "See All").
- Filter tabs + search both work, combined.
- Cards visually match the Recommendation panel pixel-for-pixel.
- Search debounce / case-insensitive / matches title OR tag.
- `npm run build` green.
