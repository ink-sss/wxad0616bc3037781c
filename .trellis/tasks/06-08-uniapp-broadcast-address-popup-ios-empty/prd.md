# fix uniapp broadcast address popup ios empty list

## Goal

Fix the uni-app broadcast entry personal-center shipping address popup so iOS real WeChat mini-program devices display existing address rows after the address list has loaded.

## What I Already Know

* User reports `uniapp-src` `pages/broadcast/entry` personal-center address popup shows an empty list on iOS real devices.
* Address data exists: importing an existing WeChat address shows the duplicate-address toast, and importing a new address shows success.
* `center-popup.vue` emits `address`; `useLiveSidePanels` calls `ensureBuyAddressLoaded(true)`, sets `addressPopupSource` to `center`, then opens the shared address popup.
* `useLivePurchase.ensureBuyAddressLoaded()` populates `addressList` from `getAddressList()` and maps items with `mapAddressItem()`.
* The duplicate-address toast comes from `services/wechat-address.js`, which also reads `getAddressList()`, so the data path can receive existing addresses.
* The visible address rows are wrapped in `address-list-panel.vue` inside a `scroll-view`. The first attempted fix moved `flex: 1; height: 0` to a wrapper, but the iOS real-device screenshot still showed the footer buttons directly under the title, proving the list area still collapsed.

## Requirements

* Existing address rows must be visible in the broadcast personal-center address popup on iOS real WeChat mini-program devices.
* Keep the current address management behavior: select, add, edit, delete, and import WeChat address.
* Keep the shared address list component compatible with order confirm and other existing callers.
* Do not modify root legacy mini-program source or `/Users/apple/Desktop/code/live_h5`.

## Acceptance Criteria

* [ ] When `addressList` contains rows, the shared address list panel renders those rows in a non-collapsed scroll area.
* [ ] Empty state still renders when the list is empty.
* [ ] Address footer actions remain visible in popup mode.
* [ ] A focused test covers the address list panel's mini-program scroll layout guard.
* [ ] Relevant unit/build checks run or the reason for skipping them is recorded.

## Out of Scope

* Reworking address API contracts.
* Changing address import duplicate matching behavior.
* Changing root legacy mini-program pages.

## Technical Notes

* Suspected root cause: WeChat mini-program iOS handles `scroll-view` height strictly; using the `scroll-view` itself as a flex child with `height: 0` can collapse the visible list even while data exists.
* Fix direction: wrap the `scroll-view` in a normal `view`, but give the wrapper a concrete `calc(...)` height from the popup viewport height (`78vh`) minus title/footer/safe-area chrome; keep the `scroll-view` at `height: 100%` inside that wrapper.
