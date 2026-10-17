# Colour Depth App

Let's paint the pixel!

Created by Manuel Giraldo Carro.

Explore how binary switches change RGB light and the resulting pixel. The single-page app supports English and Spanish, with 1-, 3-, 8- and 24-bit colour depths.

## Run locally

1. Install Node.js (no packages or `npm install` are needed).
2. From this directory, run `npm start`.
3. Open <http://127.0.0.1:4173/>. Stop the server with Ctrl+C.

The built-in development server listens only on your computer and serves only the app files. For another static host, serve this directory over HTTP with ES modules enabled; opening `index.html` directly as a `file://` URL may block module imports.
If Windows PowerShell blocks `npm.ps1`, use `npm.cmd start` (and `npm.cmd test`) instead.

## Use the explorer

Choose a colour depth, then activate switches with a pointer or the keyboard (Tab to focus, Space or Enter to toggle). The output, bulbs and pixel update immediately. Changing depth resets all bits to 0. Use **ES/EN** to switch languages without losing the active bits; the choice remains for the current browser tab session, but a fresh session starts in English. Open **?** for guidance specific to the chosen depth; Escape or **Close help** dismisses it.

To set a colour directly, edit one RGB channel (0–255) or type the six digits of a HEX colour in the HEX field, which already shows the `#` symbol (for example `920000`); values typed or pasted without the `#` are normalized to include it. Press Enter or leave the field to apply it. The explorer selects the smallest depth that reproduces the colour exactly and updates the switches; incomplete or invalid values leave the current pixel unchanged and show an error. Press Escape while editing to restore the current value. Selecting a depth manually still resets its switches.

Click the pixel (or focus it and press Enter or Space) to open the circular colour selector. Drag or tap the hue ring; arrow keys adjust hue by 1°, Shift+arrow by 10°, Home selects 0° and End selects 359°. Use the native saturation and brightness sliders for lighter, darker or less saturated colours. Changes update every representation live and select the smallest exact depth. Opening leaves the colour unchanged; choosing hue from black or gray restores zero saturation/brightness so the colour becomes visible. **Close colour selector** or Escape keeps the live colour and returns focus to the pixel.

## Check the app

Run `npm test` for the colour model, wiring and translations. For syntax checks, run `node --check src/app.js`, `node --check src/translations.js` and `node --check scripts/dev-server.js`. In a browser, check switch output at each depth, keyboard focus, language changes with bits on, help in both languages, and layout at narrow widths or zoom. No external dependencies are required.

## Copyright

Copyright © 2026 Manuel Giraldo Carro.

## License

Licensed under the [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0). Schools, teachers, students and anyone else may use, copy and adapt it free of charge for any noncommercial purpose; commercial use is not permitted. See [LICENSE](LICENSE).
