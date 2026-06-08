# CSS Main Package Slimming

## Goal

Reduce the WeChat Mini Program main package CSS size for `uniapp-src` by removing duplicated broadcast WXSS and moving high-frequency utility styles into the already-global `uniapp-src/src/static/style/common.scss`.

## What I Already Know

- Only `uniapp-src` should be changed. Root legacy Mini Program sources are reference-only for this task.
- `uniapp-src/src/App.vue` already imports `./static/style/common.scss`.
- The user has verified `common.scss` is emitted once globally and is appropriate for shared utility CSS.
- Current build baseline from `uniapp-src/dist/build/mp-weixin/**/*.wxss` is about `830458` bytes.
- The largest WXSS files are:
  - `pages/broadcast/components/LivePortraitStage.wxss`: `88270` bytes
  - `pages/broadcast/components/LiveLandscapeStage.wxss`: `84206` bytes
  - `pages/broadcast/entry.wxss`: `78516` bytes
- `entry.scss` is imported by:
  - `uniapp-src/src/pages/broadcast/entry.vue`
  - `uniapp-src/src/pages/broadcast/styles/live-portrait-stage.scss`
  - `uniapp-src/src/pages/broadcast/styles/live-landscape-stage.scss`
- The three generated broadcast WXSS files share roughly 411 identical rules, about 60KB per pair after normalizing scoped hashes.

## Requirements

- Add stable utility classes to `uniapp-src/src/static/style/common.scss`, including:
  - flex helpers: `d-f`, `d-c-c`, `d-b-c`, `d-s-c`, `d-s-s`, `d-e-c`, `d-c`, `d-r`, `f-w`, `flex-1`
  - text/layout helpers: `o-h`, `w-s-n`, `text-ellipsis`, `text-ellipsis-2`
  - reusable public animations only when safe and not component-state-specific.
- Remove duplicate broadcast style emission by avoiding full `entry.scss` import from both stage-specific component styles.
- Keep only portrait/landscape component-specific or scope-sensitive CSS in `live-portrait-stage.scss` and `live-landscape-stage.scss`.
- Preserve JS APIs, routes, backend contracts, and business logic.
- Do not manually edit `uniapp-src/dist/`; use it only for measurement.
- Avoid touching unrelated existing WIP.

## Acceptance Criteria

- [x] `cd uniapp-src && npm run build:mp-weixin` succeeds.
- [x] `cd uniapp-src && npm run test:live-entry-bootstrap` succeeds.
- [x] Broadcast generated WXSS files shrink materially, with total build WXSS reduced by at least about `50KB`.
- [x] Generated WXSS does not contain invalid deep selectors such as `:deep`, `>>>`, or `::v-deep`.
- [ ] Existing broadcast portrait, landscape, replay, product popup, chat bar, floating notices, product detail, and category page styling remain visually intact in manual checks.

## Verification Results

- WXSS total changed from the recorded baseline `830458` bytes to `690102` bytes, a reduction of `140356` bytes.
- Broadcast output after build:
  - `pages/broadcast/components/LivePortraitStage.wxss`: `49604` bytes
  - `pages/broadcast/components/LiveLandscapeStage.wxss`: `60740` bytes
  - `pages/broadcast/entry.wxss`: `1020` bytes

## Out of Scope

- No root legacy Mini Program source changes.
- No full style-system rewrite.
- No JS runtime or API behavior changes.
- No Wot Design component package modifications.

## Technical Notes

- Uni-app mp-weixin runtime defaults components to `addGlobalClass: true`, which supports global utility classes.
- `entry.scss` currently imports multiple broadcast partials. Some partials use `:deep()`, so moving all broadcast CSS blindly into global CSS is unsafe. The implementation should move only safe shared rules or remove duplicate imports while retaining required component-local deep selectors.
- Existing dirty files predate this task. Read diffs before editing any target file that is already modified.
