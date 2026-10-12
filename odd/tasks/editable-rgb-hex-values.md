# Editable RGB and HEX values

## Objective and problem
Allow learners to enter RGB channel values or a HEX colour and watch the switches, bulbs, pixel and selected depth update to the smallest supported depth that reproduces the entered colour exactly. The current result is read-only.

## Why and authorized scope
The user explicitly approved this inverse interaction and chose exact minimal-depth selection over nearest-colour approximation. The previous working checkpoint, including the 1-bit default, is `4acdbbbbd1a5f45ee97e3d7b76082bf09e39c945` on `feat/binary-pixel-colour-explorer`. Work on the clean branch `feat/edit-rgb-hex-values`. Preserve existing switch-first controls, bilingual UI, accessibility, depth-reset policy for manual depth selection, and no external dependencies. The separate copyright notice remains blocked pending the user's exact rights-holder name; do not add one or assume Git identity owns rights.

## Constraints and decisions
- Supported depths in order: 1-bit monochrome, 3-bit RGB111, 8-bit RGB332 with rounded channel scaling, 24-bit RGB888. Select the first depth whose forward model exactly equals the requested colour, then derive the bits. Never silently approximate.
- Expose accessible, labelled numeric RGB inputs (integers 0–255) and a HEX input for six-digit `#RRGGBB` values; a valid committed edit updates all inputs and diagram. Invalid/incomplete input must not change state; show an accessible validation message. Commit edits on Enter or blur/change rather than changing depth on every keystroke. Preserve focus and avoid overwriting the actively edited value mid-entry.
- No new backend, dependency, PRD rewrite, remote operation, or arbitrary new colour mode. Technical artifacts in English; Spanish UI copy neutral/professional.
- Test-first policy: deterministic pure inverse and parsing cases observe RED, then GREEN and refactor; browser UI behavior uses a proportional functional check when no persistent browser runner exists.
- Forecast approximately 350–450 authored additions plus deletions across two work units, advisory not a cap. Delivery strategy `ask-on-risk` as default; if forecast/running budget requires a chain choice before the next commit, confirm it rather than guessing. No push/PR authorization. Previous branch checkpoint is the initial native review boundary.

## Tasks
- [ ] **E1 — Exact inverse colour model.** Parse valid RGB/HEX inputs and derive minimal exact depth and bits using the existing forward model. Cover black/white (1), 3-bit primary/mixed colours, RGB332-only rounded levels (8), arbitrary 24-bit values, round trips and invalid input. Route: delegated direct; trigger: write preparation and two non-trivial model/test files. Allowed source surfaces: `src/colour-model.js`, `tests/colour-model.test.js`. Checks: `node --test tests/colour-model.test.js`; RED/GREEN, syntax and spot check. Commit and native assessment pending.
- [ ] **E2 — Accessible two-way editor.** Add labelled RGB numeric and HEX inputs beside the result, bilingual validation/description and synchronization on switch/depth/language changes; update README usage. Route: delegated direct; trigger: write preparation and multiple non-trivial UI/test files. Candidate source surfaces: `index.html`, `src/app.js`, `src/styles.css`, `src/translations.js`, `tests/translations.test.js`, `README.md` (narrow further if mapping allows). Checks: all Node tests, syntax, browser keyboard/validation/bit-depth sync/reflow in both languages. Commit and native assessment pending.

## Progress and evidence
- Requirements: user confirmed the smallest exact supported depth rule. No new source code written for this feature yet.
- E1–E2 pending. Running changed-line count 0; PR slices, commit identities, native tier/outcome pending.
- Next: implement E1 test-first, then E2 and independent browser verification. Leave prior feature branch untouched.
