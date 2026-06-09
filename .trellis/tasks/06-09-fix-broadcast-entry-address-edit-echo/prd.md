# fix broadcast entry address edit echo

## Goal

Fix the uni-app broadcast entry address edit flow so editing an existing shipping address from the live purchase/address popup pre-fills the address form fields, matching the behavior from personal center address editing.

## What I Already Know

- User reports: `uniapp-src` -> `pages/broadcast/entry` -> 收货地址 -> 编辑收货地址 does not echo address info.
- User reports: 个人中心 -> 收货地址 -> 编辑收货地址 does echo address info.
- The main edit target is `uniapp-src`, not the legacy root mini-program source.
- The broadcast purchase flow uses `address-list-panel` plus `address-form-popup`.
- The personal center address edit page is `uniapp-src/src/pagesPlus/main/address/edit.vue`.

## Assumptions

- The expected behavior is that all editable fields are prefilled: receiver, phone, region, detailed address, and default switch.
- The fix should preserve add-address behavior and address save/update behavior.
- The issue is likely a data-shape or reactive handoff mismatch in the live popup flow rather than an API contract change.

## Requirements

- Editing an address from the broadcast entry address popup must pass complete existing address data into the edit form.
- Existing personal center address edit behavior must remain unchanged.
- Address save should continue using the existing API/service layer.
- Scope stays within `uniapp-src` source/tests/docs as needed.

## Acceptance Criteria

- [ ] Existing address fields are visible when the broadcast address edit popup opens.
- [ ] Creating a new address from the same popup still opens an empty form.
- [ ] Saving an edited address still calls the update flow with the same address id.
- [ ] Personal center address edit continues to work.
- [ ] Minimal relevant validation/build command is run or the reason for not running it is documented.

## Out of Scope

- Reworking the whole address management UI.
- Changing root legacy mini-program files.
- Changing backend address API contracts.
- Changing unrelated order/refund files currently dirty in the worktree.

## Technical Notes

- `uniapp-src/src/components/address-form-popup.vue` currently reads edit data from props when `visible` changes.
- `uniapp-src/src/pages/broadcast/composables/useLivePurchase.js` owns `editAddressData`, `addressList`, and broadcast address handlers.
- `uniapp-src/src/pages/broadcast/components/LivePortraitStage.vue` and `LiveLandscapeStage.vue` render the address popup/form.
- `uniapp-src/src/pagesPlus/main/address/edit.vue` loads/normalizes address details for the personal center path.
- Root cause found: broadcast stage components gate `address-form-popup` with `v-if` delayed rendering, so the component can mount for the first time while `visible` is already `true`. A watcher that only reacts to later `visible` changes will not fill the form on that initial mount. Address form popups should use an immediate prop sync and include both `visible` and edit-data props in the watcher source.
