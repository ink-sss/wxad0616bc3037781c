# fix: uniapp live ws pushed products not updating miniprogram

## Goal

Fix the uni-app mini-program live room so products pushed by the anchor over the live message channel appear immediately in the broadcast page product card and product shelf.

## What I Already Know

* User reported that `uniapp-src` live page WS has an issue: anchor real-time product pushes do not display on the mini-program page.
* The active mini-program live entry is `src/pages/broadcast/entry.vue`.
* Runtime message handling flows through `useMessageChannel` -> `useLiveWebSocket` -> `MiniLiveSocket` -> `createLiveWsMessageHandler`.
* Product state is owned by `useLiveProducts` and rendered through `LiveProductShelf`.

## Root Cause

* Product message aliases did not cover legacy/production event names such as `explain_goods`, `goods_shelf`, and old `@ExplainEdit---{json}` system notices.
* When a single pushed/explaining product was not already present in `productList`, the handler updated `currentProduct` but did not insert the product into the shelf list. The list popup and product-card carousel could therefore remain stale until a later API reload.

## Requirements

* Normalize legacy `@ExplainEdit---` notices into product status updates.
* Recognize common product/goods shelf and explaining aliases from WS payloads.
* Upsert pushed products into the reactive product list and clear stale `isCurrent` flags.
* Preserve existing sold-out state when replacing product data from realtime pushes.

## Acceptance Criteria

* [x] A legacy `@ExplainEdit---{"product_id":...}` payload becomes a product explaining update.
* [x] A single pushed explaining product not already in `productList` appears immediately and becomes current.
* [x] A `goods_shelf`/product list payload replaces the shelf in real time.
* [x] Existing live entry bootstrap tests still pass.
* [x] `npm run build:mp-weixin` succeeds.

## Technical Notes

* Changed `uniapp-src/src/utils/mini-live-socket.js` message normalization.
* Changed `uniapp-src/src/pages/broadcast/composables/useLiveWsMessageHandler.js` product event normalization and list upsert handling.
* Added `uniapp-src/tests/live-ws-product-realtime.test.mjs`.
