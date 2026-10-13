# Always-visible colour picker close control

## Outcome and scope
Make the colour selector's close button visible without scrolling at the short Spanish viewport shown by the user. Keep the circular hue control, saturation/brightness sliders, preview, native Escape, live colour application, localization and focus return unchanged. Prefer a dedicated scrollable body with a persistent footer rather than an oversized dialog that clips on shorter screens.

## Constraints
- User authorized a visual fix, not a new picker. Branch `feat/visible-colour-picker-close` from `b7e8f0966bfa1ec78a3ae60c7cbb13bfd4be21af`.
- Preserve uncommitted `index.html` document-title change and `src/translations.js` English-title change; do not stage either. Leave untracked `.atl/` untouched. No dependencies, remote actions, push or PR.
- Estimated under 100 authored changed lines (advisory). Delivery strategy `ask-on-risk`; no slice choice expected. No meaningful runnable RED for visual-only layout; compare browser before/after positions and run full regression tests.

## Task
- [x] **C1 — Keep Close visible at every dialog height.** Route: delegated direct (HTML/CSS preparation and two nontrivial surfaces). Allowed surfaces: `index.html`, `src/styles.css`. Scrollable `.picker-body` holds title/instructions/wheel/ranges/preview while `.picker-footer` keeps the Close control reachable. Chrome tested EN/ES at 497×722 (Close before y737.5–782.3, after y610–654.8), 320×568 (before y784–828.8, after y467.6–512.4), 375×667 (before y805.4–850.2, after y559.2–604), 1280×800 (before y759.4–804.2, after y682.2–727). Footer stays fixed while body scrolls; dialog itself does not scroll. Real ring clicks update HEX/RGB/depth/preview; Close and Escape return focus to pixel. Temporary screenshot inspected/deleted; no errors. Writer and parent `npm.cmd test` 47/47, `git diff --check` clean. No meaningful RED for visual-only work. Physical touch/screen-reader not verified. Commit evidence follows in progress.

## Progress
- Task created before source edits. Initial Engram mirror saved and read back. Existing user title edits and `.atl/` remain outside feature scope.
- Next: commit work unit, assess native candidate against `b7e8f09`, and record commit identity and review outcome. No push/PR authorized.
