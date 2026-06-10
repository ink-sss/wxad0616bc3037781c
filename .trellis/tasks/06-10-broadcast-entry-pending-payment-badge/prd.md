# fix broadcast entry pending payment badge

## Goal

When a viewer creates an unpaid order from `uniapp-src/src/pages/broadcast/entry.vue`, the live-room personal center order badge should reflect the new pending-payment count even if the viewer does not navigate into order detail.

## What I already know

* The user reported that creating a pending-payment order in the broadcast entry does not show the pending-payment badge unless they enter order detail first.
* `center-popup.vue` renders the pending-payment badge from `orderStats.waitPay`.
* `useLiveSidePanels.js` owns `centerPopupOrderStats` and currently loads stats through `loadCenterPopupData()` when the center popup opens.
* `useLivePurchase.js` calls `onOrderCreated` after a non-duplicate order is created, but `entry.vue` currently uses that callback only to update product hot-order UI.

## Requirements

* After a non-duplicate live-room order is created, refresh the live center order unread stats so the `待付款` badge can update before visiting order detail.
* Keep the existing product hot-order update behavior.
* Do not change the paid-success navigation flow.
* Do not hand-edit `uniapp-src/dist/`.

## Acceptance Criteria

* [ ] Creating an unpaid order in `pages/broadcast/entry` triggers an order-stat refresh.
* [ ] `centerPopupOrderStats.waitPay` continues to map backend pending-payment aliases through existing stat normalization.
* [ ] Existing side-panel stat tests pass.

## Definition of Done

* Focused tests run for live side-panel/order badge behavior.
* Build or smallest practical verification is run; if not possible, document why.

## Out of Scope

* Reworking order APIs.
* Changing order-detail navigation.
* Modifying legacy root Mini Program source.

## Technical Notes

* Primary files: `uniapp-src/src/pages/broadcast/entry.vue`, `uniapp-src/src/pages/broadcast/composables/useLiveSidePanels.js`.
* Existing test file: `uniapp-src/tests/live-side-panels.test.mjs`.
