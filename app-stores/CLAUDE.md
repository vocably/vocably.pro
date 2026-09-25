# CLAUDE.md

Guidance for Claude Code when working in `app-stores/`.

## What this is

An internal, local-only tool for making Vocably's store assets: App Store and Google Play screenshots, the Play feature graphic, and app icons. You pick a format in the sidebar, its device component renders every screenshot at the format's exact pixel size, grouped by language, and **Download ZIP** downloads `<id>.zip` with one folder per language (`en/01.png`, `en/02.png`, …).

It is a standalone Vite + React 19 + TypeScript app. It is **not** an npm workspace of the monorepo (the root `workspaces` only covers `packages/*`), so:

- it has its own `package-lock.json` and `node_modules`; run `npm install` inside `app-stores/`
- it does not depend on any `@vocably/*` package and is not built by `scripts/build-packages.mjs`
- CI does not build, test or deploy it

## Commands

Run from `app-stores/`:

```bash
npm install
npm run app-stores   # Vite dev server (http://localhost:5173 by default)
npm run build        # tsc -b type-check + vite build into dist/
npm run lint         # oxlint (config in .oxlintrc.json)
npm run preview      # serve the dist/ build
```

There is no `dev` script; the dev server script is named `app-stores`. There are no tests.

## Structure

- `src/formats/index.ts`: `AssetFormat` list (id, store, name, width, height, optional `gap`), `getFormat(id)` and `panoramaSize(format, count)`. `gap` is the space the store shows between two screenshots, in the format's pixels. Neither store publishes it, so the values are estimates. The pixel sizes follow Apple's and Google's specs, which are linked in the file. `id` becomes the exported ZIP name (`<id>.zip`).
- `src/languages.ts`: the interface languages. The code becomes the folder name in the ZIP.
- `src/flags.ts`: per interface language, the study-language flags the first screenshot shows (`languages`). Device components spread `flags[language]` into `<Languages>`.
- `src/devices/`: one component per format (`IPhone65`, `IPad13`, `PlayPhone`, …), mapped by format id in `devices/index.ts`. Each renders `<Device format={format}>{(language) => <Screenshot>…</Screenshot>}</Device>`.
- `src/Device.tsx`: `Device` renders one `data-language` group per language (all of them by default, or pass `languages`). `Screenshot` is one exported PNG; screenshots are numbered in render order within their group. `Panorama count={n}` spreads one design over `n` consecutive `Screenshot`s and leaves out the store `gap` at each seam. The preview spaces screenshots by the scaled `gap`, so it looks the way the store will show them.
- `src/templates/`: the asset designs. Right now there is only `Placeholder.tsx`. A template receives `format` and fills 100% of the canvas.
- `src/Canvas.tsx`: renders its children at the format's full size in a `data-canvas` node, then uses a CSS `transform: scale()` to shrink them for the preview. Screenshots are previewed at `PREVIEW_HEIGHT` (480px, in `Device.tsx`), and formats smaller than that are never scaled up.
- `src/App.tsx`: the sidebar, the toolbar and the download button.
- `src/exportZip.ts`: captures every `[data-canvas]` inside each `[data-language]` group, one at a time, with `html-to-image`'s `toBlob` (`pixelRatio: 1`, style overridden to `transform: none`), zips them with `fflate` (stored, not recompressed) and downloads through a temporary `<a download>`.

## Conventions for templates

- Size things relative to the format, not in fixed px. `Placeholder` uses `minSide = Math.min(width, height)` and multiplies from it, so one design works across every aspect ratio.
- Use inline styles or `index.css`. What you see is what html-to-image captures.
- Put the screenshots of a format in its device component. The `language` argument decides the per-language content; the order of `<Screenshot>`s is the order in the store.
- To add a format, add an entry to `formats`, create a component in `src/devices/` and register it in `devices/index.ts`. The sidebar groups entries by `store` automatically.

## Debugging

**Start here:** run `npm run app-stores` and open the page in a browser. Chrome can be driven with the claude-in-chrome tools to take screenshots and read console output. The preview is the same DOM that gets exported, only scaled.

**The exported PNG differs from the preview.** html-to-image clones the DOM and draws it through an SVG `foreignObject`, so the usual suspects are:

- **Fonts:** web fonts that aren't fully loaded, or aren't embeddable (cross-origin with no CORS headers), fall back to a different font. Wait on `document.fonts.ready` before exporting, or self-host fonts under `public/`.
- **Images:** cross-origin images without CORS headers break the export or come out blank. Put the images in `public/` or import them through Vite.
- **Scaling artifacts:** the export relies on overriding `transform` to `none`. If a template puts its own `transform` on the root node, the override will clobber it, so wrap the content in an inner element instead.
- **Clipping:** the canvas has `overflow: hidden`, so anything outside `width × height` gets cut off in both the preview and the export.

**Checking the output:** the exported file should match the format's size exactly. Check it with `unzip ~/Downloads/<id>.zip -d /tmp/<id> && sips -g pixelWidth -g pixelHeight /tmp/<id>/en/01.png` (macOS). A wrong size usually means someone changed `pixelRatio` or the width/height options in `exportZip.ts`.

**Export hangs at 0/N:** html-to-image stalls in a hidden tab (e.g. a Chrome window driven in the background). Keep the tab visible, or run it in headless Chrome.

**Export does nothing or throws:** look at the browser console. `toBlob` rejects on resource loading errors. The button's `finally` resets the state, but the error is not shown in the UI.

**Type and lint errors:** `npm run build` runs `tsc -b` against `tsconfig.app.json` (strict unused locals/params, `verbatimModuleSyntax`, which means type-only imports must use `import type`). `npm run lint` runs oxlint.
