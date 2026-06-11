# implement: reduce uniapp mp-weixin hot reload memory pressure

## Goal

Reduce WeChat Developer Tools simulator hangs and extreme memory growth during
`uniapp-src` hot reloads by shrinking the uni-app Mini Program rebuild surface
and adding repeatable diagnostics for before/after validation.

## What I already know

* The user runs `npm run dev:mp-weixin` from `uniapp-src`.
* WeChat Developer Tools opens `uniapp-src/dist/dev/mp-weixin`.
* The failure usually happens when hot reload recompiles, not on first cold
  launch.
* PageSpy is not the primary suspect because the user runs it in other Mini
  Program projects.
* `src/pages.json` declares 196 routes across the main package and 9
  subpackages.
* Every declared route currently has a matching `.vue` source file.
* `components/upload/upload` is registered as a page even though it is a shared
  component path.
* `easycom.autoscan` currently scans the full component tree.

## Requirements

* Keep changes scoped to `uniapp-src` plus this Trellis task.
* Replace broad easycom autoscan with explicit mappings for shared/global
  components while preserving `wd-*` Wot Design Uni resolution.
* Remove component-only route registration that unnecessarily expands the Mini
  Program page graph.
* Add a diagnostic command that records route count, easycom coverage, output
  file count/size, largest output files, sourcemap count, and local WeChat
  Developer Tools memory when available.
* Document the local fallback switch for disabling DevTools hot reload when
  memory still spikes.

## Acceptance Criteria

* [ ] `npm run diagnose:mp-weixin-hot-reload` runs from `uniapp-src`.
* [ ] Diagnostic output reports route count, component-route count, easycom
      mapping count, output file count/size, sourcemap count, and top files.
* [ ] `src/pages.json` no longer has `easycom.autoscan: true`.
* [ ] `src/pages.json` no longer registers `components/upload/upload` as a page.
* [ ] `npm run build:mp-weixin` passes.
* [ ] Static route check confirms every remaining route has a matching `.vue`
      source file.

## Definition of Done

* Tests or static validation pass locally.
* Docs/notes updated for the hot reload fallback.
* No business API behavior changes.
* Existing unrelated dirty files remain untouched.

## Out of Scope

* Replacing PageSpy.
* Changing `@dcloudio/*` dependency versions.
* Removing migrated business pages that still have route coverage.
* Automating WeChat Developer Tools UI operations.

## Technical Notes

* Relevant specs read:
  * `.trellis/spec/frontend/directory-structure.md`
  * `.trellis/spec/frontend/component-guidelines.md`
  * `.trellis/spec/frontend/state-management.md`
  * `.trellis/spec/frontend/quality-guidelines.md`
  * `.trellis/spec/frontend/type-safety.md`
  * `.trellis/spec/guides/index.md`
  * `.trellis/spec/guides/code-reuse-thinking-guide.md`
  * `.trellis/spec/guides/cross-layer-thinking-guide.md`
* `uniapp-src/dist/dev/mp-weixin/project.private.config.json` currently has
  `compileHotReLoad: true`; users can set it to `false` locally as a fallback.
