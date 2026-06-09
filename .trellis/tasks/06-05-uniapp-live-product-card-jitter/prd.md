# Fix Live Product Card Jitter

## Goal

Stop the uni-app live-room floating product card from repeatedly sliding or jittering in the WeChat mini-program while preserving the intended 5-second automatic carousel, manual swipe, purchase, and live product update behavior.

## Requirements

* Keep the floating product-card swiper automatic movement at 5 seconds per slide.
* Avoid controlled `current` updates fighting the native swiper during automatic movement.
* Keep manual swipe and `change` event behavior for multiple explaining products.
* Stabilize live product state updates so repeated product/current/stock/sold-out updates with the same product IDs do not replace list/object references unnecessarily.
* Do not modify purchase flow, product popup API, backend request shape, root legacy mini-program source, or `uniapp-src/dist/`.

## Acceptance Criteria

* The floating product card auto-slides about every 5 seconds instead of continuously jittering left and right.
* Repeated live product updates for the same IDs keep the active card index stable.
* Existing websocket product push behavior still updates current product, stock, sold-out, and product-list state.
* Targeted live product tests pass.

## Definition of Done

* Relevant source and test updates are made only under `uniapp-src`.
* Targeted tests pass:
  * `node --test tests/product-card-static.test.mjs`
  * `node --test tests/live-products-response.test.mjs`
  * `node --test tests/live-ws-product-realtime.test.mjs`
* `npm run build:mp-weixin` is run if feasible.

## Technical Approach

* Keep `autoplay` and `interval="5000"` on the product-card `swiper`.
* Remove product-card window slicing so `swiper` `current` uses the same full-list index emitted by `change`.
* Add helper logic in live product composables/handlers to patch existing product objects in place when IDs and order are stable.
* Add regression tests for source-level swiper autoplay interval, no window slicing, and repeated same-ID product update stability.

## Out of Scope

* New UX controls for auto/manual carousel mode.
* Redesigning the product card.
* Changing H5 behavior or root legacy mini-program files.

## Technical Notes

* CodeGraph is not initialized in this repository.
* User clarified automatic carousel is required; the bug is continuous iOS jitter, not the 5-second auto-scroll itself.
* Relevant files inspected: `uniapp-src/src/components/product-card.vue`, `uniapp-src/src/pages/broadcast/composables/useLiveProducts.js`, `uniapp-src/src/pages/broadcast/composables/useLiveWsMessageHandler.js`, and existing live product tests.
