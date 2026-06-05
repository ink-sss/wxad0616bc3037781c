# fix: uniapp wxss invalid selectors

## Goal

Fix the `uniapp-src` Mini Program component WXSS warnings caused by project-owned invalid selectors so `pages/broadcast/entry` no longer emits ID-selector errors for live stage components.

## What I already know

* The pasted WeChat DevTools log reports invalid selectors in:
  * `pages/broadcast/components/LivePortraitStage.wxss:3196:61`
  * `pages/broadcast/components/LiveLandscapeStage.wxss:3052:37`
  * `node-modules/wot-design-uni/components/wd-tabs/wd-tabs.wxss:220:44`
* The two project-owned errors come from compiled `#goodsPic` selectors generated from broadcast source styles.
* Both stage templates also set `id="goodsPic"` on the same product image while already providing `class="goodsPic"`.
* The wot-design warning comes from dependency CSS using `::-webkit-scrollbar`; this is dependency-owned and not the primary source bug.
* The project has no existing dependency patch mechanism, so the fix needs a reproducible local script rather than a one-off `node_modules` edit.

## Requirements

* Remove ID selectors from project-owned broadcast stage styles.
* Remove the unnecessary `id="goodsPic"` from the matching templates.
* Preserve the existing image styling through the `goodsPic` class.
* Patch the `wot-design-uni` `wd-tabs` Mini Program style before dev/build to remove the unsupported `::-webkit-scrollbar` selector.
* Do not edit compiled `dist/build` output directly.

## Acceptance Criteria

* [x] Source scan finds no `#goodsPic` selector in `uniapp-src/src`.
* [x] Source scan finds no `id="goodsPic"` in broadcast stage templates.
* [x] Built mp-weixin output finds no `#goodsPic` selector in broadcast component WXSS.
* [x] Built mp-weixin output finds no `::-webkit-scrollbar` selector in `wd-tabs.wxss`.
* [x] `npm run build:mp-weixin` is attempted from `uniapp-src/`.

## Definition of Done

* Tests/build checked or any blocker documented.
* Remaining dependency-owned warning is called out separately if it remains.
