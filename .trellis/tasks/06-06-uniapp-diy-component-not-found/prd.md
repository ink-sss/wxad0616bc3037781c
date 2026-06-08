# fix uniapp diy component not found

## Goal

Resolve the mp-weixin runtime console errors where `components/diy/diy` reports DIY child components as missing after running `uniapp-src`.

## What I already know

* The reported console errors are all `Component is not found in path "components/diy/<name>/<name>" (using by "components/diy/diy")`.
* The current development target is `uniapp-src/`, not the legacy root mini-program source.
* `uniapp-src/src/components/diy/diy.vue` imports all reported child components from local sibling directories.
* Existing `uniapp-src/dist/dev/mp-weixin/components/diy/diy.json` uses relative child component paths like `./article/article`, and the compiled child component files exist in `dist/dev/mp-weixin/components/diy/`.
* The legacy root mini-program `components/diy/diy.json` uses unprefixed paths like `article/article`; it is reference-only for this task.

## Assumptions

* The intended runtime entry is `uniapp-src/project.config.json`, whose `miniprogramRoot` points to `dist/dev/mp-weixin/`.
* If a fresh `uniapp-src` mp-weixin build generates valid `diy.json` and child component files, the remaining cause is likely developer-tool project selection or stale cache rather than missing source code.

## Requirements

* Do not modify legacy root mini-program source unless the source-side root cause is proven to be there and the user explicitly redirects scope.
* Do not manually edit `uniapp-src/dist/` build output.
* Keep the fix narrowly scoped to DIY component registration/build behavior.
* Preserve existing DIY component behavior and rendering branches.

## Acceptance Criteria

* [ ] `cd uniapp-src && npm run build:mp-weixin` completes successfully, or any failure is explained with a concrete blocker.
* [ ] Fresh `dist/build/mp-weixin/components/diy/diy.json` contains valid relative paths for all DIY child components.
* [ ] Fresh build output contains the child component files referenced by `diy.json`.
* [ ] If no source fix is needed, provide the exact WeChat Developer Tools project directory/cache guidance needed to run the generated uni-app output.

## Definition of Done

* Relevant frontend spec guidance checked.
* Build or equivalent minimal validation run.
* Outcome reported with exact paths inspected.

## Out of Scope

* Rebuilding DIY visual parity.
* Rewriting DIY components.
* Fixing root legacy mini-program component registration.
* Editing generated files under `uniapp-src/dist/`.

## Technical Notes

* Applicable project instructions: default changes are under `uniapp-src/src`, `uniapp-src/scripts`, `uniapp-src/tests`, or `uniapp-src/docs`.
* CodeGraph is not initialized in this repo, so this investigation uses local file inspection for this specific runtime error.
