# Checkpoint 0002 — Pipeline & README

**Date:** 2026-05-18
**Commit:** GH Pages deploy workflow, vite base path, CC0 LICENSE, README rewrite, package.json rename

## Context

After the initial prototype commit (CP01), the repo was just the Vite scaffold + the working 17-scene prototype. It had no deploy pipeline, no live URL, no LICENSE, and the README was still the default React+TypeScript+Vite boilerplate template. Tina asked to set things up "like how I have for all my other previous projects" — pointing back to her `PersonsRequired` and `ReactiveSandbox` repos which both ship a GitHub Pages deploy via Actions, a CC0 LICENSE, and a README following her standard SCAD project structure (Design Argument → Research → Platform Rationale → AI Direction Log → Records of Resistance → Five Questions → Post-Mortem → Mermaid Diagram → User Testing → Live URL).

## Human Directions

- "Set up my README.md, files, and pipeline like how I have for all my other previous projects."
- "Yes commit these pipeline changes"

Both terse — went off the visible siblings (`PersonsRequired`, `ReactiveSandbox`) as the source of truth for what "like my other projects" means.

## Records of Resistance

No product-level resistance this round — this checkpoint is purely plumbing and documentation, not prototype work. (Tina's convention is to exclude pipeline/README checkpoints from the README-level Records of Resistance list for that reason.)

One small decision point: her PersonsRequired uses Vite 5 + React 18 + JS (no TS), but the Framer repo was scaffolded with Vite 8 + React 19 + TypeScript at the start of CP01 (matching the AI 201 TS preference noted in user memory). Did not migrate her project back to JS just to match — kept the existing stack and noted in the new `reference-scad-project-pattern` memory that Framer is her first TS project in this family. If she ever wants alignment, that's a separate decision.

## Successes

- `.github/workflows/deploy.yml` matches PersonsRequired byte-for-byte in shape (node 20, `npm ci → npm run build → upload-pages-artifact@v3 → deploy-pages@v4`)
- `vite.config.ts` now sets `base: '/Framer/'` so the Pages subpath resolves all assets correctly — production build still passes (verified `npm run build` → 221 KB JS / 15 KB CSS)
- CC0 LICENSE copied verbatim from sibling project
- README rewritten in her standard 10-section structure with `**TBD.**` placeholders where she needs to author content (Design Argument, Research, Platform Rationale, Five Questions, Post-Mortem, User Testing). AI Direction Log seeded with two entries covering CP01 and CP02. Mermaid diagram built from the actual code (scene state machine → chrome → overlays → static sources).
- `claude/` directory now has `checkpoints/`, `docs/`, `figma-screens/` subdirs matching her standard layout (only `checkpoints/` populated so far)
- Saved a reusable `reference-scad-project-pattern` memory so future SCAD projects can be scaffolded from one place instead of re-deriving from siblings each time

## What's Next

- Push to `origin/main` to trigger the first Pages deploy. First run will likely need Pages enabled in repo settings (Source: GitHub Actions) before it succeeds.
- Tina fills in the TBD sections of the README as the project progresses (Design Argument, Platform Rationale, etc.)
- Continue iterating on the prototype's visual fidelity per CP01's "What's Next" list
