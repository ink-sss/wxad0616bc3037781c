# uniapp-src Main Package Slimming Implementation

## Goal

Resolve the WeChat upload failure:

```text
main package source size 2415KB exceed max limit 2048KB
```

Keep `/pages/broadcast/entry` in the main package, but reduce the main package by
moving non-tab auxiliary pages to `pagesPlus/main`, enabling production
minification, and removing avoidable heavy dependencies from the main package
graph.

## Scope

- Modify only `uniapp-src` source/config/scripts as needed.
- Do not edit the root legacy Mini Program source.
- Do not hand-edit `uniapp-src/dist`; use build output only for measurement.
- Preserve existing WIP slimming changes: `pagesPlus/main`, compact
  `area-data.js`, WXSS minify script, and global `common.scss` import.

## Required Changes

- Enable production JS minification in `uniapp-src/vite.config.js`.
- Set Mini Program tool minification flags in `src/manifest.json` and
  `project.config.json`.
- Move these routes from main package to `pagesPlus/main`:
  - `/pages/report/*` -> `/pagesPlus/main/report/*`
  - `/pages/prize-record/index` -> `/pagesPlus/main/prize-record/index`
  - `/pages/invitation/index` -> `/pagesPlus/main/invitation/index`
  - `/pages/invitation-record/index` ->
    `/pagesPlus/main/invitation-record/index`
- Extract `buildBroadcastReturnPath` to `src/utils/live-route-context.js` and
  update broadcast/report imports.
- Remove global easycom entries for heavy components that already have local
  imports or are only used in migrated subpackage flows.
- Reduce `qrcode` impact on main package by avoiding eager top-level imports in
  main package code.
- Handle large local images referenced by broadcast-side pages/components when a
  remote source or non-main usage can be confirmed.

## Validation

- `cd uniapp-src && npm run build:mp-weixin`
- `cd uniapp-src && npm run test:live-entry-bootstrap`
- Static route check: every top-level and subpackage route has a matching `.vue`
  file, with no duplicate full paths.
- Main package byte count from `dist/build/mp-weixin/app.json` excluding
  subpackages, target `< 2048KB`.
- Static scan confirms old moved route paths are no longer used in navigation
  logic.
