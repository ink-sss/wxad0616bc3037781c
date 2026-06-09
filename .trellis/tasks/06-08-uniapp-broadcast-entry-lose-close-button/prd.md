# fix: uniapp broadcast entry popup close buttons

## Goal

Fix the `uniapp-src` broadcast entry popup UI so user-facing live room popups have visible close affordances in Mini Program.

## What I already know

* User screenshot shows the "未中奖" popup without a visible close button.
* The active page is `uniapp-src/src/pages/broadcast/entry.vue`, through `LiveBroadcastMarketingLayer`.
* `CommentLotteryResultModals.vue` already emits `close`; the lose close image is positioned below the modal body and can be outside the visible popup area.
* A live-room popup scan found that share, address, address form, report, sign-in, coupon, and lottery popups already expose close/cancel/auto-close behavior.
* The personal-center bottom sheet disables `BottomSheetPopup`'s visible close control.
* The product-buy popup has a close event through `wd-popup`, but no visible close button in its content.
* The portrait product-list drawer closes by tapping the mask, but has no visible close button in the drawer.

## Assumptions

* Close actions should reuse each component's existing `close` event wiring.
* Business logic for lottery, order creation, address management, and report submission should remain unchanged.

## Requirements

* The lose result modal must show a visible close button.
* The personal-center popup must show a visible close button.
* The product-buy popup must show a visible close button.
* The portrait product-list drawer must show a visible close button.
* Close buttons must dismiss their modal through existing close events.
* Lottery result logic, order logic, and address logic must remain unchanged.

## Acceptance Criteria

* [ ] `commentLotteryLose` renders a visible close affordance.
* [ ] The live personal-center popup renders a visible close affordance.
* [ ] The live product-buy popup renders a visible close affordance.
* [ ] The portrait product-list drawer renders a visible close affordance.
* [ ] Clicking/tapping close affordances emits the existing `close` events.
* [ ] Diff is limited to live-room popup UI and task metadata.

## Definition of Done

* Focused code inspection passes.
* Run a minimal frontend validation command where feasible.
* Note if full Mini Program build is not run.

## Technical Notes

* Primary files: `uniapp-src/src/components/live-lottery/CommentLotteryResultModals.vue`, `uniapp-src/src/components/center-popup.vue`, `uniapp-src/src/components/product-buy-popup.vue`, `uniapp-src/src/pages/broadcast/components/LiveProductShelf.vue`, and broadcast stage call sites.
* Call path: `LiveBroadcastStageHost.vue` -> `LiveBroadcastMarketingLayer.vue` -> `CommentLotteryResultModals.vue`.
