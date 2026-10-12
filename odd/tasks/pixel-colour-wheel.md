# Pixel colour wheel

## Outcome and authorization
Click or keyboard-activate the pixel to open a circular colour selector. Live selections update the pixel, binary switches and bulbs, RGB, HEX, and smallest exact supported depth (1, 3, 8, 24). The user explicitly requested implementation. Preserve the existing editors, bilingual UI, 1-bit default and wiring geometry.

## Scope and decisions
- Dependency-free circular hue control with native saturation and brightness sliders in a modal dialog; support pointer/touch and keyboard interaction, visible focus, accessible labels and English/Spanish instructions.
- Opening does not change the colour; selections apply live; closing/Escape retains selections and restores focus to the pixel. Reuse exact inverse colour conversion; do not approximate to a smaller palette.
- Preserve dirty title changes in `index.html` and `src/translations.js` (Pixel Colour) without including them in feature commits. Leave untracked `.atl/` untouched.
- Branch: `feat/pixel-colour-wheel`. Initial review boundary: `522674175e059d1ff9f0ed2ddde5573a09cf663e`. No push, PR, merge, dependencies or remote operations authorized.
- Forecast approximately 380 authored changed lines (advisory, not a cap). Delivery strategy: `ask-on-risk`; ask once for chain strategy if actual work exceeds approximately 400 before the next commit. Keep tests/readability, never compress for the budget.
- Test-first: deterministic picker maths and translation requirements use observed RED/GREEN/refactor with `node --test`; source is existing ODD test-first policy, no separate strict-TDD configuration found. Browser behavior uses focused Chrome checks because no persistent UI runner exists.

## Tasks
- [ ] **P1 — Picker model.** Implement HSV/RGB conversion and circular pointer-to-hue mapping, cover primaries, hue wrap, achromatic values, round trips and exact-depth composition. Route: delegated direct; trigger: preparation and non-trivial model/test files. Surfaces: `src/colour-picker-model.js`, `tests/colour-picker-model.test.js`, `package.json`. Checks: RED/GREEN, `node --test tests/colour-picker-model.test.js`, `npm test`, `node --check src/colour-picker-model.js`, `git diff --check`. Commit model, tests and runner as one unit.
- [ ] **P2 — Pixel-triggered accessible wheel.** Integrate pixel button, dialog, circular pointer/keyboard hue slider, saturation/brightness controls, shared exact-state application, localization, server allowlist and concise README. Route: delegated direct; trigger: preparation and multiple non-trivial UI files. Surfaces: `index.html`, `src/app.js`, `src/styles.css`, `src/translations.js`, `tests/translations.test.js`, `scripts/dev-server.js`, `README.md`. Checks: translation RED/GREEN; `npm test`; syntax/diff checks; Chrome pointer/keyboard, modal focus/Escape, opening unchanged, exact colour/depth outputs, draft/error cleanup, EN/ES, mobile reflow, module serving. Preserve title hunks when staging.

## Acceptance and recovery
- Pixel is clickable and keyboard accessible; circular selector works with pointer, touch and keyboard.
- Colour changes propagate to every existing representation via the existing inverse/forward model.
- Default colour/depth, reset and language preference remain unchanged; open/close does not introduce rounding drift.
- Each task records checks, commit identity, authored count and native assessment. RDD is on (global); run native committed-only assessment after work units and follow exact native continuations when due.
- Rollback boundary: remove picker modules/tests and UI hooks/server entry, retain existing RGB/HEX editors and pre-existing title edits.

## Progress
- Planning complete; no source implementation yet. Engram mirror pending initial synchronization.
- Next: P1 model and tests, then P2 integration. Screen-reader and actual browser zoom proof are not available yet.
