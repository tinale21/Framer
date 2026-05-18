# Checkpoint 0001 — Initial Prototype

**Date:** 2026-05-18
**Commit:** initial scaffold + tutorial flow

## Context

This is the SCAD UXDG 380 Framer Redesign project. Goal: build a Figma-like redesign of Framer's UI focused on a guided tutorial/hover system for the right-panel Insert menu. The repo (`tinale21/Framer`) was an empty git repo before this checkpoint. Stack: Vite + React + TypeScript, planned for GitHub Pages deploy (same as the AI 201 Hero Faction Screen).

The reference design is 17 Figma screens (in ~/Downloads/) walking through:
- Base UI screen
- Hover-over-Base popout (Frame/Stack/Grid/Masonry)
- "Using Stacks" tutorial overlay with Before/After comparison
- 8-step guided demo (Stack highlighted → cursor → drawing → stack created → Insert items highlighted → rect+text → Layout panel expanded → restacked → final)
- Demo completion modal
- "Don't show again" alternate path → Disabled Stacks Tutorial modal → Tutorial Overlays settings

## Human Directions

- Stack: Vite + React + TypeScript (matching her AI 201 setup)
- Scope: clickable visual prototype (not a functional Framer canvas editor)
- Fidelity: pixel-faithful to the Figma reference screens
- Navigation: clickable flow that walks through the 17 screens (with subtle hint affordances)
- Class: SCAD UXDG 380 (UXDG-380-A01-202630)
- After-the-fact: "make sure all pipelines and files are working correctly" — verified TS, ESLint, prod build, dev server all pass before committing

## Records of Resistance

None this round — user accepted all proposed defaults (clickable flow, pixel-faithful, dev-nav strip kept) and confirmed the commit.

One minor stumble: tried to Write App.tsx before reading it (it had Vite boilerplate). Caught by the Edit/Write read-first guard, recovered by reading then writing.

## Successes

- 17-scene state machine working end-to-end with both natural click navigation and a dev-nav strip (prev/next/reset) for jumping directly to any scene
- All static UI chrome (TopBar, LeftSidebar, RightSidebar Insert panel, BottomToolbar, Canvas frame) rendered with inline SVG icons (no external icon library dependency)
- Two right-sidebar modes wired: Insert panel (default) vs. Properties panel (when stack selected, scenes 7-13)
- Dim-overlay treatment for tutorial focus states (chrome dimmed during canvas demos, canvas dimmed during right-panel demos)
- All four modals built: Using Stacks tutorial, Stack Demo Completed, Disabled Stacks Tutorial, Tutorial Overlays settings
- TS strict mode clean, ESLint clean, prod build clean (221KB JS / 15KB CSS, 65KB / 3.4KB gzipped)
- Project memory updated with new `project-uxdg380-framer` entry linking to the AI 201 entry

## What's Next

- Visual fidelity pass: user hasn't reviewed in browser yet. Likely tweaks to colors, spacing, icon weights to better match the Figma.
- The 8-step demo flow uses hint zones (pulsing blue rectangles) to advance — those are an addition for clickability, not in the Figma. User may want to remove or restyle.
- Dev-nav strip is dev-only convenience; user may want it hidden for the final class submission.
- No GitHub Pages deploy config yet — to be added when ready to publish.
