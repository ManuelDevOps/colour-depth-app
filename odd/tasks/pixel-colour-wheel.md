# Pixel colour wheel

## Outcome and authorization
Click or keyboard-activate the pixel to open a circular colour selector. Live selections update the pixel, binary switches and bulbs, RGB, HEX, and smallest exact supported depth (1, 3, 8, 24). The user explicitly requested implementation. Preserve the existing editors, bilingual UI, 1-bit default and wiring geometry.

## Scope and decisions
- Dependency-free circular hue control with native saturation and brightness sliders in a modal dialog; support pointer/touch and keyboard interaction, visible focus, accessible labels and English/Spanish instructions. On a hue gesture from black/gray, promote zero saturation/brightness to 100 so the wheel visibly selects a colour; merely opening stays unchanged.
- Opening does not change the colour; selections apply live; closing/Escape retains selections and restores focus to the pixel. Reuse exact inverse colour conversion; do not approximate to a smaller palette.
- Preserve dirty title changes in `index.html` and `src/translations.js` (Pixel Colour) without including them in feature commits. Leave untracked `.atl/` untouched.
- Branch: `feat/pixel-colour-wheel`. Initial review boundary: `522674175e059d1ff9f0ed2ddde5573a09cf663e`. No push, PR, merge, dependencies or remote operations authorized.
- Revised forecast approximately 530 authored changed lines after P1 (273 including the task document). Delivery strategy: `ask-on-risk`; user chose `feature-branch-chain` (dependent slices) in the native question. Local slice 1 is `5226741..cc81e89` (model); slice 2 starts at `cc81e89` (UI). No PR creation is authorized. Keep tests/readability, never compress for the budget.
- Test-first: deterministic picker maths and translation requirements use observed RED/GREEN/refactor with `node --test`; source is existing ODD test-first policy, no separate strict-TDD configuration found. Browser behavior uses focused Chrome checks because no persistent UI runner exists.

## Tasks
- [x] **P1 — Picker model.** Implement HSV/RGB conversion and circular pointer-to-hue mapping, cover primaries, hue wrap, achromatic values, round trips and exact-depth composition. Route: delegated direct; trigger: preparation and non-trivial model/test files. Surfaces: `src/colour-picker-model.js`, `tests/colour-picker-model.test.js`, `package.json`. Observed RED: missing module, then hue seam 360 versus 0; GREEN: focused 15/15 and `npm.cmd test` 46/46, syntax and diff checks clean; parent repeated focused 15/15. Commit `cc81e894a4c1a0d77b6c060a9fc988e44f96a1f0`, 273 authored additions/deletions including initial document. Native committed-only assessment: medium, under_budget, review_due false; no review receipt.
- [x] **P2 — Pixel-triggered accessible wheel.** Implemented pixel button, modal circular pointer/keyboard hue slider, saturation/brightness controls, shared exact-state application, localization, server allowlist and README. Route: delegated direct; trigger: preparation and multiple non-trivial UI files. Surfaces: `index.html`, `src/app.js`, `src/styles.css`, `src/translations.js`, `tests/translations.test.js`, `scripts/dev-server.js`, `README.md`. Translation RED 7/9 then GREEN 9/9; full `npm.cmd test` 47/47; syntax and diff checks clean. Parent repeated translation 9/9 and app syntax. Chrome checks passed for click/Enter/Space, pointer capture and emulated touch, hue keyboard/Home/End, S/V keyboard, black initial opening unchanged, exact #244955 (8-bit) and #C86496 (24-bit), all representation sync, draft/error cleanup, EN/ES, modal focus/Escape, mobile reflow and module HTTP 200. Pre-existing title hunks remain outside the feature commit. Source changes: 250 authored lines; commit/native evidence follows below.

## Acceptance and recovery
- Pixel is clickable and keyboard accessible; circular selector works with pointer, touch and keyboard.
- Colour changes propagate to every existing representation via the existing inverse/forward model.
- Default colour/depth, reset and language preference remain unchanged; open/close does not introduce rounding drift.
- Each task records checks, commit identity, authored count and native assessment. RDD is on (global); run native committed-only assessment after work units and follow exact native continuations when due.
- Rollback boundary: remove picker modules/tests and UI hooks/server entry, retain existing RGB/HEX editors and pre-existing title edits.

## Progress
- P1 complete and committed. Models round trip every RGB332 colour and representative exact 1/3/8/24-bit colours. Tiny negative pointer angles normalize to 0 instead of 360; gray/black conversion has hue zero, so UI must retain its interaction hue.
- Initial native assessment required an untracked declaration. Read-only preflight returned inventory `sha256:4425697ab74255760bb7c3b87dc13642263a59d4b65cc516abaa19765c94da71`; excluded only unrelated `.atl/` files. Reassessment: medium, 273 changed lines, under_budget. No review started, consent requested, or receipt issued.
- P2 implemented and functional checks passed. Pointer and emulated touch choose visible colours from initial black; opening alone does not apply a round trip. Floating HSV is retained during gestures. Close/Escape retains colour and restores pixel focus; EN/ES labels and 320/375/1280 widths passed. Verification used owned local Chrome/server processes; existing port 4173 listener untouched. Physical touch, screen-reader and actual browser zoom remain unverified; no persistent UI runner was added.
- Engram mirror update and native committed-candidate assessment follow the UI work-unit commit. No source normalizer is configured; syntax/diff checks are check-only.
- Next: save UI slice, assess the native candidate, and follow any exact returned review continuation before final delivery. No push/PR authorization.
