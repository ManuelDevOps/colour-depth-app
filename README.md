# Binary Pixel Colour Explorer

Explore how binary switches change RGB light and the resulting pixel. The single-page app supports English and Spanish, with 1-, 3-, 8- and 24-bit colour depths.

## Run locally

1. Install Node.js (no packages or `npm install` are needed).
2. From this directory, run `npm start`.
3. Open <http://127.0.0.1:4173/>. Stop the server with Ctrl+C.

The built-in development server listens only on your computer and serves only the app files. For another static host, serve this directory over HTTP with ES modules enabled; opening `index.html` directly as a `file://` URL may block module imports.
If Windows PowerShell blocks `npm.ps1`, use `npm.cmd start` (and `npm.cmd test`) instead.

## Use the explorer

Choose a colour depth, then activate switches with a pointer or the keyboard (Tab to focus, Space or Enter to toggle). The output, bulbs and pixel update immediately. Changing depth resets all bits to 0. Use **ES/EN** to switch languages without losing the active bits; the choice remains for the current browser tab session, but a fresh session starts in English. Open **?** for guidance specific to the chosen depth; Escape or **Close help** dismisses it.

## Check the app

Run `npm test` for the colour model, wiring and translations. For syntax checks, run `node --check src/app.js`, `node --check src/translations.js` and `node --check scripts/dev-server.js`. In a browser, check switch output at each depth, keyboard focus, language changes with bits on, help in both languages, and layout at narrow widths or zoom. No external dependencies are required.
