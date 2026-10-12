# Binary Pixel Colour Explorer

## Objective and problem
Build the approved single-page classroom explorer so learners can manipulate binary switches and see bits become RGB light and a pixel. The workspace currently contains only the approved PRD and conceptual visual reference.

## Why and authorized scope
The user approved implementation, Git initialization, and these policies: reset all bits to zero when depth changes; start in English; retain the chosen language for the browser session. Implement the four PRD depths (1, 3, 8, 24 bits), responsive bilingual UI, contextual help, accessible controls, and tests. Do not add a backend, accounts, tracking, extra modes, or an unapproved dependency or significant PRD deviation. Stop for human approval if a new architectural decision or dependency becomes necessary.

## Constraints and design
- Start with static HTML/CSS and small browser JavaScript ES modules, pure colour conversions, semantic controls, and decorative responsive SVG wiring. Do not introduce a dependency without a concrete need and approval.
- PRD: `Binary_Pixel_Colour_Explorer_PRD_v1.0.md`; visual: `Binary_Pixel_Colour_Explorer_Visual_Reference_v1.png` (conceptual, not pixel-perfect).
- One feature branch; Conventional Commit work units with behaviour, tests and relevant documentation together. Do not push or create a PR without user authorization.
- Test-first when a clear deterministic runnable case exists: observe RED, implement GREEN, then refactor. Node built-in tests for model; browser interaction/accessibility checks for UI.
- Forecast approximately 950 authored changed lines across implementation units, excluding generated files; the ~400-line task heuristic is advisory, not a code-golf target. Delivery strategy: `ask-on-risk`; the user approved `feature-branch-chain` for dependent review slices. Running count and PR slice boundaries pending; no push or PR is authorized.

## Actionable tasks
- [x] **T1 — Conversion foundation.** Implement tested 1-bit monochrome, RGB111, RGB332 rounded scaling, RGB888, channel values and hex output; establish the reset-on-depth-change policy. Acceptance: deterministic examples, boundaries, and invalid inputs covered. Route: delegated direct (multi-file model/tests); trigger: write preparation and two non-trivial files. Checks: `node --test tests/colour-model.test.js` (11 passed); RED/GREEN recorded. Commit `c21497b`; native risk medium, review deferred under budget.
- [ ] **T2 — Accessible interaction.** Implement a semantic single-page switch/depth UI with live RGB/hex and pixel; bit state resets on depth changes. Acceptance: keyboard-operable labelled controls, immediate feedback in every mode, visible focus. Route: delegated direct (multiple non-trivial files); trigger: write preparation and multi-file UI. Checks: model suite plus manual browser keyboard/mode checks. Commit and native risk assessment pending.
- [ ] **T3 — Visual system.** Implement bulbs, channel-correct decorative SVG wires, responsive centred layout with a workable 24-switch narrow-screen presentation and reduced-motion support. Acceptance: all modes render coherently at narrow/wide widths and zoom without losing controls. Route: delegated direct (multi-file CSS/diagram); trigger: write preparation and multi-file UI. Checks: model suite plus browser reflow/zoom/reduced-motion checks. Commit and native risk assessment pending.
- [ ] **T4 — Bilingual help and polish.** Add English/Spanish translations, contextual help, session-scoped language persistence without changing the active colour, accessibility and explanatory documentation. Acceptance: language changes preserve bits, help matches the chosen mode, accessibility and all functional checks pass. Route: delegated direct (multiple non-trivial files); trigger: write preparation and multi-file UI. Checks: model suite, browser interaction, keyboard, translation, and responsive checks. Commit and native risk assessment pending.

## Progress and evidence
- Planning: PRD and visual reviewed; architecture and policies approved by user. Git initialized with a repository-local author, baseline `b06c41d`, and branch `feat/binary-pixel-colour-explorer`.
- T1: tests observed RED before model implementation (`ERR_MODULE_NOT_FOUND`, exit 1), then GREEN (`node --test tests/colour-model.test.js`: 11 passed, 0 failed); parent spot check confirmed 11 passed. Browser runtime N/A for this pure model unit. Work-unit commit `c21497b44934cef6288faac78db7b08d789006c8`, 260 authored changed lines including task document. Native assessment: `medium`, `review_due: false`, `under_budget`; slice remains pending against baseline `b06c41d`.
- T2–T4: pending. Running authored-line count 260; first PR slice pending; no remote delivery authorized.
- Next: implement T2 and keep the medium-risk slice pending until native review becomes due.
