# Optimize uniapp mp-weixin package compression

## Goal

Reduce `uniapp-src` WeChat Mini Program production package size by enabling safe JavaScript, CSS, template, JSON, and removable-output compression in the existing mp-weixin build flow.

## What I Already Know

- The active project surface is `uniapp-src`; root Mini Program source is reference-only.
- `npm run build:mp-weixin` currently runs `uni build -p mp-weixin`.
- `uniapp-src/vite.config.js` sets `build.minify: false`, so production JS is not minified.
- `uniapp-src/src/manifest.json` has mp-weixin `setting.minified: false` and `uploadWithSourceMap: true`.
- A postbuild WXSS minifier script already exists and is wired through `postbuild:mp-weixin`.
- Current `dist/build/mp-weixin` byte totals before this task are approximately:
  - JS: `3546066`
  - WXSS: `482314`
  - WXML: `290995`
  - JSON: `35972`
  - SCSS: `6563`
  - PNG: `175511`

## Requirements

- Enable production JS minification for `npm run build:mp-weixin`.
- Drop production `console.*` and `debugger` output where the bundler can do it safely.
- Keep CSS/WXSS compression enabled and strengthen existing postbuild WXSS compression.
- Minify generated WXML and JSON output without changing runtime semantics.
- Remove generated-package files that are not needed at runtime, such as source maps and copied `.scss` files.
- Disable Mini Program source map upload in production-oriented project settings.
- Do not change pages, routes, API behavior, live-room logic, or root legacy Mini Program source.
- Do not manually edit `uniapp-src/dist`; any dist changes must come from the build/postbuild pipeline.

## Acceptance Criteria

- [x] `cd uniapp-src && npm run build:mp-weixin` succeeds.
- [x] Build output JS, WXSS, WXML, JSON, and removable-file totals are lower than the recorded baseline where applicable.
- [x] `common/vendor.js` is materially smaller after JS minification.
- [x] No source maps or copied `.scss` files remain in `dist/build/mp-weixin` after postbuild.

## Verification Results

- `npm run build:mp-weixin` passed.
- `node --check scripts/minify-mp-weixin-wxss.mjs` passed.
- `node --check vite.config.js` passed.
- `npm run test:live-entry-bootstrap` has an unrelated pre-existing path expectation failure: the test expects `/pages/login/login`, while current source redirects to `/pagesPlus/main/login/login`.
- Build output byte totals changed from the recorded baseline to:
  - JS: `1792257` bytes, down from `3546066`
  - WXSS: `460012` bytes, down from `482314`
  - WXML: `277674` bytes, down from `290995`
  - JSON: `29249` bytes, down from `35972`
  - SCSS: `0` bytes, down from `6563`
  - PNG: unchanged at `175511`
  - total actual file bytes: `2734703`, down from `4537421`
- `common/vendor.js` disk block size changed from about `1276K` in the previous build to `636K`.
- No `.map` or `.scss` files remain under `dist/build/mp-weixin` after postbuild.

## Out of Scope

- Route-level or dependency-level package slimming.
- Image recompression or visual asset changes.
- Moving pages between main package and subpackages.
- Root legacy Mini Program project configuration changes.

## Technical Notes

- Use Vite/esbuild for JS minification rather than post-processing generated JS.
- Keep mp-weixin compatibility target conservative; do not raise the JS target just to shave bytes.
- WXML compression should only strip comments and whitespace between tags, not rewrite expressions or text content.
