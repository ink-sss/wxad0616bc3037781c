# Fix Live Product Card Jitter

## Goal

Stop the uni-app live-room floating product card from repeatedly sliding or jittering in the WeChat mini-program while preserving manual swipe, purchase, and live product update behavior.

## Requirements

* Disable automatic movement on the floating product-card swiper in `uniapp-src/src/components/product-card.vue`.
* Keep manual swipe and `change` event behavior for multiple explaining products.
* Stabilize live product state updates so repeated product/current/stock/sold-out updates with the same product IDs do not replace list/object references unnecessarily.
* Do not modify purchase flow, product popup API, backend request shape, root legacy mini-program source, or `uniapp-src/dist/`.

## Acceptance Criteria

* The floating product card does not auto-slide by itself.
* Repeated live product updates for the same IDs keep the active card index stable.
* Existing websocket product push behavior still updates current product, stock, sold-out, and product-list state.
* Targeted live product tests pass.

## Definition of Done

* Relevant source and test updates are made only under `uniapp-src`.
* Targeted tests pass:
  * `node --test tests/live-products-response.test.mjs`
  * `node --test tests/live-ws-product-realtime.test.mjs`
* `npm run build:mp-weixin` is run if feasible.

## Technical Approach

* Remove the `autoplay`/`interval` attributes from the product-card `swiper`.
* Add helper logic in live product composables/handlers to patch existing product objects in place when IDs and order are stable.
* Add regression tests for source-level swiper autoplay removal and repeated same-ID product update stability.

## Out of Scope

* New UX controls for auto/manual carousel mode.
* Redesigning the product card.
* Changing H5 behavior or root legacy mini-program files.

## Technical Notes

* CodeGraph is not initialized in this repository.
* Relevant files inspected: `uniapp-src/src/components/product-card.vue`, `uniapp-src/src/pages/broadcast/composables/useLiveProducts.js`, `uniapp-src/src/pages/broadcast/composables/useLiveWsMessageHandler.js`, and existing live product tests.
