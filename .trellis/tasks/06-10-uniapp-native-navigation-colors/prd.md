# Use native system navigation colors

## Goal

Make native uni-app / WeChat mini program navigation bars use a system-looking light background with dark title text instead of the omitted mini program default of black background and white title text.

## What I already know

* The requested target is the `uniapp-src` project.
* `uniapp-src/src/pages.json` currently has no `globalStyle`, so native navigation pages inherit platform defaults.
* Several pages intentionally use `"navigationStyle": "custom"` and render their own headers; this task should not change those custom navigation pages.
* Existing page titles and route definitions should remain unchanged.

## Assumptions

* "真正的系统默认背景色+字颜色" means the uni-app style convention of a light native navigation bar (`#F8F8F8`) with black title/action text.
* The change should be global for native navigation pages only.

## Requirements

* Add global native navigation colors in `uniapp-src/src/pages.json`.
* Keep page-level `navigationStyle: "custom"` entries unchanged.
* Do not modify old root mini program source or generated `dist/` output.

## Acceptance Criteria

* [ ] `uniapp-src/src/pages.json` defines `globalStyle.navigationBarBackgroundColor` as `#F8F8F8`.
* [ ] `uniapp-src/src/pages.json` defines `globalStyle.navigationBarTextStyle` as `black`.
* [ ] Existing page route/title/custom navigation configuration is preserved.
* [ ] `cd uniapp-src && npm run build:mp-weixin` succeeds, or any failure is explained.

## Out of Scope

* Redesigning custom page headers.
* Changing tab bar colors.
* Editing generated `uniapp-src/dist/` files.

## Technical Notes

* Primary file: `uniapp-src/src/pages.json`.
* Relevant project rule: default source edits belong under `uniapp-src/`; generated `dist/` is not edited manually.
