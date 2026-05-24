# 0075 — Dark mode: panels (props, layout, typography) + token sweep

## Context

Right-sidebar panels were still hard-coded to light values after the
modal/popout audit in 0074 — props rows used `var(--text-primary)`
which was still `#1a1a1a` everywhere, layout controls used
hardcoded `#ededed`, and the Typography editor was all light. User
flagged "panels in dark mode" as the next pass; then asked
specifically for the Typography section.

## What changed

### CSS-variable sweep
- `.app--dark` overrides `--text-primary`, `--text-secondary`,
  `--text-tertiary`, `--border`, `--border-strong`,
  `--bg-pill-hover`, `--bg-pill-selected`, `--bg-search`.
- This single block re-themes every chrome class that used those
  tokens (props rows, section titles, hover backgrounds, search
  field, etc.) without enumerating each. Canvas surfaces keep
  their explicit white rules so the design surface isn't affected.

### Layout panel
- Popout container, segmented controls (Type / Direction / Align),
  segment buttons + active state, divider, dropdown trigger +
  menu + items, field inputs, padding-cell label, focus rings,
  chevron, shape-header icon.

### Typography editor
- Title color.
- All fields (font/weight selects, size num input, line-height /
  letter-spacing icon-inputs, align bar) get `#2a2a2a` surface
  with white text + light icons.
- Size preset menu themed (dark surface, light items, blue
  active).
- Alignment buttons: muted icons, active gets `#3a3a3a` pill
  with `#4db5ff` icon.
- Native `<select>` chevron repainted with a `#bbb` stroke so it
  shows on dark.
- Line-height input got `spellCheck={false}` (it's
  `<input type="text">`, browser was painting a red wavy
  underline on the "Auto" placeholder/value).

## Human directions

- "check the panels in dark mode too, most are not legible"
- "check the typography section of the panel on dark mode"
- "uhh there something zig zag happening now in dark mode"
- (clarified: zig-zag = "red wavy underline" — then screenshot
  showed it was actually the chevron tiling, not a spell-check)
- "this is what i am seeing: [screenshot of font/weight selects
  filled with tiled chevron pattern]"

## Resistance / rebuilds

- First-pass dark mode for the Typography fields used the
  `background:` shorthand, which silently wipes every other
  background-* property. The light rule on `select.typo__field`
  paints a chevron via `background-image` +
  `background-repeat: no-repeat` + `background-position`. The
  shorthand override blew away repeat/position, so the chevron
  tiled across the whole select as a "zig-zag" pattern.
- Fix: switched the field/wrapper rules to `background-color`
  so the chevron's repeat/position properties survive. Spell-check
  hypothesis (red wavy underline) was a wrong guess from the
  user's first description; the screenshot revealed the real
  cause.

## Successes

- Props rows, layout segmented controls, dropdown menus, padding
  cells, fields all themed end-to-end via the token sweep + the
  layout-specific overrides.
- Typography editor reads on dark: fields, size menu, alignment
  pills, native select chevron, line-height "Auto" placeholder.
- No more tiled chevron pattern across selects.
- `npm run build` green.
