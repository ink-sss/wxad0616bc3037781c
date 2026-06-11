# Fix Live Product Card Jitter

## Goal

Stop the uni-app live-room floating product card from repeatedly sliding or jittering in the WeChat mini-program while preserving the intended 5-second automatic carousel, manual swipe, purchase, and live product update behavior.

## Requirements

* Keep the floating product-card swiper automatic movement at 5 seconds per slide.
* Avoid native `swiper` autoplay fighting controlled `current` updates during automatic movement on iOS.
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

* Remove native `autoplay`/`interval` from the product-card `swiper`.
* Use a component-owned 5-second timer to emit the next global index while keeping `swiper` `current` controlled by the existing parent state.
* Keep `circular="true"` on the product-card `swiper` so the last-to-first transition does not reverse direction.
* Keep product-card window slicing removed so `swiper` `current` uses the same full-list index emitted by `change`.
* Add helper logic in live product composables/handlers to patch existing product objects in place when IDs and order are stable.
* Add regression tests for the component-owned 5-second carousel interval, no native swiper autoplay, no window slicing, and repeated same-ID product update stability.

## Out of Scope

* New UX controls for auto/manual carousel mode.
* Redesigning the product card.
* Changing H5 behavior or root legacy mini-program files.

## Technical Notes

* CodeGraph is not initialized in this repository.
* User clarified automatic carousel is required; the bug is continuous iOS jitter, not the 5-second auto-scroll itself.
* iOS real device still reproduced with native `swiper` autoplay; the stable path is to avoid native autoplay and advance the controlled index from component code.
* Relevant files inspected: `uniapp-src/src/components/product-card.vue`, `uniapp-src/src/pages/broadcast/composables/useLiveProducts.js`, `uniapp-src/src/pages/broadcast/composables/useLiveWsMessageHandler.js`, and existing live product tests.
