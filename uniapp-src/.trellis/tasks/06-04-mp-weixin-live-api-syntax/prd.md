# fix: mp-weixin live api real device syntax

## Goal

Fix WeChat real-device preview failing with `invalid file: api/live.js` because mp-weixin build output preserves syntax that the device parser rejects.

## What I Already Know

* The reported failure points at `api/live.js, 1:8999` with `SyntaxError: Unexpected token ?`.
* Current `uniapp-src/dist/build/mp-weixin/api/live.js` contains `??` at offset 8998.
* A static scan of current mp-weixin output found multiple JS files containing `?.` or `??`, so fixing only `src/api/live.js` could expose the next invalid file.
* The uni-app source project uses Vite via `uniapp-src/vite.config.js`.

## Requirements

* Build mp-weixin output without optional chaining or nullish coalescing syntax.
* Keep source behavior unchanged.
* Keep the change scoped to uni-app build/source files related to the syntax failure.

## Acceptance Criteria

* [ ] `npm run build:mp-weixin` succeeds from `uniapp-src/`.
* [ ] Static scan of `uniapp-src/dist/build/mp-weixin/**/*.js` finds no `?.` or `??`.
* [ ] `api/live.js` no longer contains the reported invalid token pattern in build output.

## Technical Notes

* Relevant source: `uniapp-src/vite.config.js`.
* `@dcloudio/vite-plugin-uni` exposes `viteLegacyOptions`, which can configure Vite legacy transforms for build output.
* Frontend specs read: `.trellis/spec/frontend/index.md`, `directory-structure.md`, `component-guidelines.md`, `quality-guidelines.md`, `type-safety.md`.
