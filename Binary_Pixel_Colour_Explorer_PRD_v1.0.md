# Binary Pixel Colour Explorer
## Product Requirements Document (PRD) v1.0

**Status:** Approved product definition for initial architecture/planning
**Target:** Web application
**Primary audience:** Secondary-school students
**Languages:** English and Spanish, switchable at runtime
**Visual reference:** `Binary_Pixel_Colour_Explorer_Visual_Reference_v1.png`

---

## 1. Product summary

Binary Pixel Colour Explorer is a bilingual educational web application that helps learners understand the relationship between binary digits, colour depth and the final colour of a pixel.

The learner selects a colour depth, changes physical-style binary switches between 0 and 1, and immediately sees how those bits affect red, green and blue light and therefore the resulting pixel colour.

The application deliberately favours clear classroom understanding over modelling every historical colour representation.

---

## 2. Educational goal

The product should make this relationship visually obvious:

`binary bits -> RGB channel values -> RGB light mixture -> resulting pixel colour`

A learner should be able to discover that increasing colour depth increases the number of possible colour combinations and that groups of binary digits can encode RGB channel intensity.

---

## 3. Users

### Primary
- Secondary-school computing students.

### Secondary
- Computing teachers.
- General learners who want a visual introduction to binary colour representation.

---

## 4. V1 scope

### Included
- Single-page web application.
- Runtime language toggle between English and Spanish.
- Colour-depth selector with exactly these options:
  - 1 bit
  - 3 bits
  - 8 bits
  - 24 bits
- One physical-style up/down wall switch per binary bit.
- Each switch changes between `0` and `1`.
- Three RGB light bulbs: red, green and blue.
- Thin visual wires from the binary switches to the relevant RGB bulb(s).
- A large resulting pixel above the bulbs.
- Immediate visual update after every switch change.
- Display of resulting RGB and hexadecimal colour values where meaningful.
- Context-sensitive help opened from a `?` icon.
- Responsive layout that keeps the active switch group visually centred regardless of selected bit depth.

### Not included in V1
- Accounts or authentication.
- Database or server-side persistence.
- Saved progress.
- Teacher dashboard.
- Quizzes or scoring.
- Analytics.
- Multi-pixel image editing.
- Uploading or editing images.

---

## 5. Approved colour-depth model

For this application, **colour depth means total bits per pixel**.

### 5.1 1-bit mode

**Model:** monochrome

- 1 total bit.
- 2 possible pixel colours.
- `0 -> black`
- `1 -> white`
- The single bit changes all three RGB channels together.

Equivalent output:
- `0 -> RGB(0, 0, 0)`
- `1 -> RGB(255, 255, 255)`

### 5.2 3-bit mode

**Model:** RGB111

Distribution:
- 1 red bit
- 1 green bit
- 1 blue bit

Each channel is either fully off or fully on:
- `0 -> 0`
- `1 -> 255`

Total possible colours: `2^3 = 8`.

### 5.3 8-bit mode

**Model:** RGB332 direct colour

Distribution:
- 3 red bits
- 3 green bits
- 2 blue bits

Total: `3 + 3 + 2 = 8 bits`.

Channel ranges before scaling:
- Red: `0..7`
- Green: `0..7`
- Blue: `0..3`

These are scaled to normal RGB `0..255` values for the displayed pixel.

Example scaling:
- `red = round(red3bit / 7 * 255)`
- `green = round(green3bit / 7 * 255)`
- `blue = round(blue2bit / 3 * 255)`

Educational note shown through help:
- RGB332 is a common historical convention for 8-bit direct colour, not the only possible representation of 8-bit colour.
- Blue receives two bits while red and green receive three because reduced blue precision is generally less perceptually noticeable than losing comparable precision in more visually sensitive channels.
- The product must not imply that all historical 8-bit colour used RGB332. Indexed 8-bit colour also existed and is outside the V1 demonstration.

Total possible direct colours: `2^8 = 256`.

### 5.4 24-bit mode

**Model:** RGB888

Distribution:
- 8 red bits
- 8 green bits
- 8 blue bits

Total: `8 + 8 + 8 = 24 bits`.

Each channel directly represents a value from `0..255`.

Example:

`11001000 01100100 10010110`

becomes:
- Red: 200
- Green: 100
- Blue: 150

Result:
- `RGB(200, 100, 150)`
- `#C86496`

Total possible colours: `2^24 = 16,777,216`.

---

## 6. Binary ordering

Use conventional binary ordering internally, with the most significant bit on the left and least significant bit on the right.

This is an implementation/calculation rule only.

**Do not add MSB/LSB labels or positional weights such as 128, 64, 32, etc. to the normal interface.** They are intentionally excluded from the approved visual design.

---

## 7. Interaction behaviour

### 7.1 Colour-depth selector

The selector contains only:

`1 | 3 | 8 | 24`

Changing the selected depth must:
1. Reconfigure the number of visible switches.
2. Reconfigure which RGB channel each switch controls.
3. Re-centre the complete switch group horizontally.
4. Recalculate the current result from a defined state rather than leaving invalid hidden bits active.

The implementation must define and document whether a mode change resets bits to zero or maps/preserves state where possible. Prefer the behaviour that is easiest for a student to understand consistently.

### 7.2 Binary switches

- Exactly one switch per bit.
- Visual style: old-fashioned physical wall switch with vertical/up-down movement.
- `0 = off`.
- `1 = on`.
- Switching should feel physical but remain visually clean and responsive.
- Binary value must also be available programmatically to assistive technologies.
- Keyboard operation is required.

### 7.3 Wiring

Wires are explanatory, not decorative.

Rules:
- Wires leaving individual binary switches are thin.
- Every red-channel bit connects to the red bulb.
- Every green-channel bit connects to the green bulb.
- Every blue-channel bit connects to the blue bulb.
- In 1-bit mode, the one bit controls all RGB channels together to produce black or white.
- Wiring must remain readable without dominating the interface.
- The wiring layout must adapt when the number of switches changes.

### 7.4 RGB bulbs

Three bulbs remain in a stable central row:
- Red (R)
- Green (G)
- Blue (B)

Their visual brightness/intensity should correspond to their calculated channel value, not merely binary on/off when the mode supports multiple levels.

The channel's numeric `0..255` value may be displayed near each bulb.

### 7.5 Resulting pixel

- Large square pixel/colour sample above the bulbs.
- Updates immediately after any switch change.
- It is the visual focus of the learning result.

Associated output can show:
- RGB value
- Hex value

A decimal representation of the complete 24-bit colour integer is not an educational requirement and should not be prioritised in V1 unless later justified.

---

## 8. Approved visual hierarchy

The normal vertical hierarchy is:

1. Product title / compact controls.
2. Language switch and `?` help control.
3. Colour-depth selector.
4. Resulting pixel.
5. RGB bulbs.
6. Thin wires.
7. Binary switches at the bottom.

### Layout requirements

- Remove numbered instructional steps from the main canvas.
- Do not reserve a left-hand column for instructions.
- Explanations belong in the `?` help interaction.
- Main interactive content must remain horizontally centred.
- The switch group must stay centred for 1, 3, 8 and 24-bit modes.
- The design should scale/reflow rather than simply anchor switches from the left edge.
- 24-bit mode must remain legible on typical laptop/desktop widths.
- Smaller viewports may recompose the presentation, but must preserve the same conceptual sequence and relationships.

The supplied PNG is an approved **conceptual visual reference**, not a pixel-perfect production specification. Functional correctness, centring, responsive behaviour and accessibility take precedence over reproducing every visual detail literally.

---

## 9. Channel labels by mode

The interface should make grouping understandable without unnecessary notation.

Recommended grouping:

### 3-bit
- R
- G
- B

### 8-bit
- RRR
- GGG
- BB

### 24-bit
- RR
- GG
- BB may be used as compact hexadecimal-style group headings if visually useful, provided this does not imply that the switches themselves are hexadecimal digits.

For 24-bit internal structure, each of R, G and B still contains eight binary switches.

---

## 10. Bilingual interface

The application must switch at runtime between:
- English (`EN`)
- Spanish (`ES`)

Requirements:
- All human-readable UI text changes language.
- Help content changes language.
- The selected language persists during the current browser session at minimum. Long-term persistence can be evaluated during architecture planning.
- Binary digits, numeric values, RGB identifiers and hexadecimal codes do not require translation.
- Language switching must not reload or reset the current colour unnecessarily.

Example terminology:

| English | Spanish |
|---|---|
| Colour depth (bits per pixel) | Profundidad de color (bits por píxel) |
| Red | Rojo |
| Green | Verde |
| Blue | Azul |
| Resulting pixel | Píxel resultante |
| On | Encendido |
| Off | Apagado |

---

## 11. Help system

A visible `?` control replaces permanent explanatory panels.

Help should be concise and contextual.

General explanation:
- Every switch represents one binary bit.
- `0 = off`, `1 = on`.
- The bit combination determines RGB channel values and therefore the final pixel colour.
- More bits allow more possible colour combinations.

Mode-specific help:
- 1-bit: black/white explanation.
- 3-bit: RGB111 and eight possible colours.
- 8-bit: RGB332 explanation, including why blue receives two bits and that this is one common direct-colour convention rather than the only historical 8-bit representation.
- 24-bit: RGB888, eight bits per channel, 0-255 per channel and 16,777,216 possible colours.

---

## 12. Accessibility and classroom usability

V1 must:
- support keyboard operation for switches and controls;
- expose meaningful accessible labels/state for each switch;
- not communicate state using colour alone;
- provide visible focus states;
- maintain readable contrast;
- support zoom/reflow reasonably;
- avoid unnecessary animation;
- respect reduced-motion preferences for physical switch animation and other transitions.

The app should be usable on a classroom projector and normal student laptop without requiring fine pointer precision.

---

## 13. Functional acceptance criteria

V1 is functionally acceptable when all of the following are demonstrated:

1. User can select exactly 1, 3, 8 or 24 bits per pixel.
2. Exactly the corresponding number of switches is shown.
3. Switches remain centred as a group after every depth change.
4. Each visible switch toggles reliably between 0 and 1.
5. 1-bit mode produces exactly black or white.
6. 3-bit mode implements RGB111 and produces eight possible colours.
7. 8-bit mode implements RGB332 and produces 256 possible combinations.
8. 24-bit mode implements RGB888 and maps each channel directly to 0-255.
9. Each channel's wires terminate only at the appropriate RGB bulb, except the shared 1-bit black/white behaviour.
10. Wires from individual switches are visually thin.
11. Bulb intensity responds to the calculated channel value.
12. Resulting pixel updates immediately and correctly.
13. RGB and hexadecimal output match the calculated result.
14. Entire UI can switch between English and Spanish without losing the current colour state unnecessarily.
15. `?` help presents the correct language and mode-specific explanation.
16. Keyboard-only interaction works for core controls.
17. Layout remains usable and visually centred at all four depth settings.

---

## 14. Non-goals and implementation restraint

Do not add functionality merely because it is easy to implement.

Specifically avoid in V1 unless a later decision approves it:
- authentication;
- backend/database;
- cloud services;
- user tracking;
- gamification;
- quizzes;
- lessons/course management;
- image uploads;
- export/sharing systems;
- complex animation frameworks;
- 3D/WebGL;
- additional colour-depth modes.

Use the smallest maintainable technical architecture that satisfies the approved behaviour, responsive UI, accessibility and testing needs.

---

## 15. Open questions for architecture planning

These are intentionally not product decisions yet:

1. Minimum technical stack required for a small interactive web app.
2. Whether a framework provides enough benefit over a simpler implementation.
3. Testing strategy for the conversion logic and UI interaction.
4. Best implementation method for adaptive wiring, e.g. semantic DOM/CSS/SVG, while preserving accessibility and responsive centring.
5. Exact responsive strategy for presenting 24 switches on narrow screens.
6. Whether session-only or persistent language preference is preferable.

Architecture planning must answer these before implementation begins. Do not introduce dependencies before demonstrating a concrete need.

---

## 16. First OpenCode task

The PRD is approved. The first OpenCode unit is **architecture and implementation planning only**.

Before proposing architecture, OpenCode should inspect the actual new-project environment and report:
- current working directory;
- whether this folder is already a Git repository;
- any applicable `AGENTS.md`, project constitution, configuration, skills or other local harness instructions;
- relevant existing files if the project directory is not empty;
- currently available runtime/package-manager versions that materially affect the recommendation.

Because this is a new project, do **not** assume the ManuelDev portfolio repository harness applies to it. Local/global OpenCode and Gentle configuration may apply, but exact project-specific policy must be discovered rather than invented.

Then propose the smallest appropriate architecture and a staged implementation plan that satisfies this PRD.

### Hard stop for this first unit

Do not create application files, install dependencies, initialise frameworks, modify repository state, commit, push or otherwise implement the application during this first unit.

Return only:
1. environment/harness findings;
2. recommended architecture with alternatives considered;
3. reasons for the recommendation;
4. proposed file/project structure;
5. staged implementation plan;
6. validation/testing approach;
7. risks or unresolved decisions requiring human approval.

Stop after the planning report and wait for approval.
