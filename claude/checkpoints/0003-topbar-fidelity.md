# Checkpoint 0003 — TopBar Visual Fidelity

**Date:** 2026-05-18
**Commit:** real Framer logo + 5 actual icon assets, real Invite/Publish styling, drop shadows, blue TL pill, "Tina Le · Viewing now" hover tooltip

## Context

After CP02 set up the project plumbing, the prototype itself still used my placeholder inline-SVG icons in the topbar — a black-rounded-square stand-in for the Framer mark, generic stroke icons for globe/gear/signal/play, and a plain gray "TL" rectangle. Tina started providing the real Figma-exported assets and asked for several targeted visual tweaks to bring the topbar to pixel fidelity.

## Human Directions

- "Use this for the Framer logo top left" → `~/Downloads/Framer File.svg`
- "These are all the icons used in the top right" → 5 numbered Group SVGs (1461 globe, 1462 hexagon, 1463 signal, 1464 play, 1465 TL avatar) — each pre-baked with its own pill background
- "Add a box around the Invite and Publish buttons like these" → 2 Button SVGs (light gray Invite, darker gray Publish)
- "Make the spacing between the icon boxes 12px"
- "Make the TL pill and Publish button #0099FF with #FFFFFF text"
- "Add a slight drop shadow on the right buttons like Framer has it" + Image 18 reference
- "Add a 'Viewing now' tooltip when hovering the TL icon" + Image 19 reference (Tina Le + Viewing now in a blue bubble with a notch)
- Iterative tooltip refinement: "decrease the 'Viewing now' font slightly, name in #FFFFFF regular, sub in #A0D1FF light, more vertical padding" → "lower padding by 5px each side" → "increase by 2px instead" — converged on `padding: 15px 21px`

## Records of Resistance

No real product-level resistance — Tina drove this entire checkpoint with specific design corrections. Some small judgment calls I made instead of asking:

1. **Used `<img>` for the icon SVGs rather than inlining them as React components.** The exported SVGs already have their own backgrounds and exact dimensions baked in, so inlining wouldn't give meaningful control (no need to color-tint via `currentColor`, no need to swap stroke widths). Two paths to the same render: `<img>` is one line per icon, inline is 30+ lines per icon. Inlined would only win if she later wanted to recolor them programmatically — and at that point we can swap to `?react` Vite imports.
2. **Used `box-shadow` on Invite/Publish but `filter: drop-shadow` on the pill SVGs.** Different mechanisms because `box-shadow` follows the element's rectangular bounding box (fine for the `<button>` pills) but the SVG `<img>` tags are technically rectangular containers wrapping a rounded shape — `box-shadow` would draw a square shadow around the transparent corners. `filter: drop-shadow` follows the actual painted pixels.
3. **Edited the avatar SVG's source `<rect fill>` directly to `#0099FF`** rather than reskinning it via CSS filters. Filters can only desaturate/hue-rotate, not arbitrary recolor, and the SVG is only one place. Trade-off: the file is now Framer-blue at rest, so any future re-skin needs another edit. Acceptable for a prototype.
4. **TL pill in Framer blue:** Tina is the only "user" in this prototype — she explicitly asked for the blue. Matches the Publish button so they read as a pair (her identity + her primary action). Noted in case future direction wants the avatar more neutral so Publish stands alone.

## Successes

- Topbar now matches the Figma reference at a glance — real Framer mark on the left, all 5 actual icon pills in the right order (TL · globe · hexagon · signal · play), Invite + Publish buttons with correct gray vs. blue treatment
- Hover tooltip on TL is built as a single CSS-driven overlay (no JS state, no portal) — appears in 150ms with a tiny upward translate, has a 12px rotated-square notch pointing at the avatar, and disappears cleanly when the cursor leaves the wrap
- Drop shadows on all topbar elements are consistent (`0 1px 2px rgba(0,0,0,0.08) + 0 1px 1px rgba(0,0,0,0.04)`) and read as the same visual weight whether on the SVG pills (via filter) or the rectangular buttons (via box-shadow)
- Padding/typography tooltip iterations converged in 3 messages to `15px 21px` with name in 14px regular `#FFFFFF` and sub in 12px light `#A0D1FF` — the user's incremental "-5px / +2px" adjustments suggest the next checkpoint may need a tiny in-app value picker for this kind of tuning
- Assets organized under `public/icons/` with self-descriptive filenames (`topbar-globe.svg`, `topbar-avatar.svg`, etc.) — easy for Tina to swap or extend
- Build still passes (220 KB JS / 15.5 KB CSS — net +0.6 KB CSS for the tooltip and drop shadow rules)

## What's Next

- Continue the topbar work if she wants further polish (alignment, sizes, hover states for non-TL pills)
- Move on to the left sidebar / canvas frame / right sidebar Insert panel fidelity (each still uses my inline icon placeholders and approximate spacing)
- The dev-nav strip in the bottom-right is still showing — Tina hasn't asked to hide it yet
