# fix uniapp order detail address selection

## Goal

Fix the uni-app order detail flow where tapping "选择/更换收货地址" appears to do nothing. The order detail page must reliably open the address selection page for orders that can update prize/winner shipping addresses, then update the order address and refresh the detail view after a user chooses an address.

## What I Already Know

- User reports the issue in `uniapp-src` order detail.
- `uniapp-src/src/pages/order/detail.vue` renders the address card and binds both the card and the "选择/更换" action to `openAddressSelect`.
- The current order detail route is registered as `pages/order/detail` in `uniapp-src/src/pages.json`.
- The address selection page is registered as `pagesPlus/main/address/index`.
- `detail.vue` opens `/pagesPlus/main/address/index?select=1` and listens for the global `address-selected` event.
- `pagesPlus/main/address/index.vue` emits `address-selected` when an address row is clicked in `select=1` mode, then calls `uni.navigateBack()`.
- The backend update API is already wrapped as `updatePrizeOrderAddress` in `uniapp-src/src/api/order.js`.

## Assumptions

- This task targets the existing prize/winner address update behavior on order detail, not normal order-confirm address selection.
- The route should remain in `pagesPlus/main/address/index` because it is already registered in the uni-app subpackage.
- If navigation fails, the user should get a visible toast instead of a silent no-op.

## Requirements

- The address card/action in `uniapp-src/src/pages/order/detail.vue` must open the registered address selection page when the order can update its address.
- The selection page must send enough address data back for the detail page to call `updatePrizeOrderAddress` and refresh.
- The detail page must prevent duplicate address updates while one update is pending.
- Failures must be visible via existing `uni.showToast` style.
- Keep changes scoped to `uniapp-src` source files.

## Acceptance Criteria

- [ ] Tapping "选择/更换" on an eligible order navigates to address selection instead of appearing inert.
- [ ] Tapping an address in selection mode returns to the order detail page, calls `updatePrizeOrderAddress`, and reloads detail.
- [ ] Navigation failure surfaces a toast.
- [ ] Existing address management behavior outside select mode remains unchanged.

## Definition of Done

- Focused code changes in `uniapp-src/src`.
- Build or smallest practical static validation run from `uniapp-src`.
- No edits to root legacy Mini Program source or `uniapp-src/dist`.

## Out of Scope

- Redesigning order detail UI.
- Changing backend API contracts.
- Reworking normal order confirmation address selection.
- Modifying `/Users/apple/Desktop/code/live_h5`.

## Technical Notes

- Relevant specs read: `.trellis/spec/frontend/index.md`, `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`, `.trellis/spec/guides/index.md`.
- H5 source has equivalent logic at `/Users/apple/Desktop/code/live_h5/src/pages/order/detail.vue`; uni-app uses the migrated `pagesPlus/main/address/index` path.
