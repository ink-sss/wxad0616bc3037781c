# fix uniapp broadcast comment lottery button placement

## Goal

Move the broadcast landscape comment-lottery entry back into the interaction area and copy the uni-h5 positioning logic exactly, so it no longer appears offset by Mini Program navigation changes or while non-interaction tabs are active.

## What I already know

* User request: 评论抽奖的按钮要放到互动中，并完全像素级 1:1 抄 uni-h5 的定位逻辑。
* H5 source: `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/components/LiveLandscapeStage.vue` renders `<live-external-lottery-tools>` immediately before the right-side `interact-section`.
* H5 source: `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/styles/live-landscape-stage.scss` sets `.landscape-lottery-tools { top: 536rpx; z-index: 5; }`.
* H5 source: `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/styles/entry-landscape-live.scss` overrides live landscape external lottery tools to `top: 528rpx; right: 24rpx; z-index: 1001; width: 88rpx; gap: 10rpx;`.
* Current uni-app source adds `var(--broadcast-nav-height)` to both top values, which diverges from H5 positioning.
* Current uni-app source already gates the landscape comment-lottery entry with `activeTab === 'interact'` through `showLandscapeCommentLotteryEntry`.

## Assumptions

* "互动中" means the button should only be visible for the interaction tab/content, matching H5's `showLandscapeCommentLotteryEntry` computed guard.
* Keep existing Mini Program business-popup hiding behavior.
* Do not change lottery API, activity state, modal contents, or other marketing flows.

## Requirements

* The landscape comment-lottery entry remains tied to the interaction tab state.
* The landscape lottery tool top positioning must match H5 values exactly: base `536rpx`, live override `528rpx`.
* Remove the Mini Program nav-height offset from the lottery tool positioning.
* Keep the H5 live override values for right/z-index/width/gap/bubble/icon sizing.
* Scope stays inside `uniapp-src` broadcast source and focused tests.

## Acceptance Criteria

* [ ] `LiveLandscapeStage.vue` renders the landscape lottery tool inside the interaction section flow area rather than above it.
* [ ] `.landscape-lottery-tools` uses `top: 536rpx` without `--broadcast-nav-height`.
* [ ] `.external-lottery-tools` live override uses `top: 528rpx` without `--broadcast-nav-height`.
* [ ] Focused static regression test covers the H5 positioning values.
* [ ] Focused test passes.
* [ ] `npm run build:mp-weixin` is attempted.

## Definition of Done

* Focused tests pass.
* WeChat Mini Program build passes or failure is reported with the concrete reason.
* No unrelated working tree changes are reverted.

## Out of Scope

* Changing comment lottery APIs, modal behavior, prize display, or WebSocket handling.
* Editing root legacy Mini Program source.
* Editing `/Users/apple/Desktop/code/live_h5`.
* Redesigning the lottery icon visuals beyond H5 positioning parity.

## Technical Notes

* H5 references:
  * `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/components/LiveLandscapeStage.vue`
  * `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/styles/live-landscape-stage.scss`
  * `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/styles/entry-landscape-live.scss`
* Uni-app targets:
  * `uniapp-src/src/pages/broadcast/components/LiveLandscapeStage.vue`
  * `uniapp-src/src/pages/broadcast/styles/live-landscape-stage.scss`
  * `uniapp-src/src/pages/broadcast/styles/entry-landscape-live.scss`
  * `uniapp-src/tests/live-style-parity.test.mjs`
