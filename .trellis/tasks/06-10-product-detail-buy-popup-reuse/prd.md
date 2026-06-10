# implement: product detail buy popup reuse

## Goal

Change the uni-app product detail page so normal product "立即购买" opens the same order popup used in the live room instead of navigating to `/pages/order/confirm`. Normal products must support real order confirmation, address selection, coupon selection, order creation, payment, and success navigation from the popup.

## What I Already Know

- Main work is under `uniapp-src/`.
- Current product detail page is `uniapp-src/src/pages/product/detail/detail.vue`.
- Current normal buy flow uses `gotoBuyConfirm()` to navigate to `/pages/order/confirm`.
- Live room already uses `uniapp-src/src/components/product-buy-popup.vue`.
- Live purchase orchestration exists in `uniapp-src/src/pages/broadcast/composables/useLivePurchase.js`.
- Current order confirmation page has address, order confirm, order create, payment, and payment success handling logic.

## Requirements

- Normal product detail "立即购买" opens `product-buy-popup` in-place.
- Normal product popup supports SKU selection, quantity, buyer remark, address selection/edit/import, coupons, confirm price, order create, payment, payment cancel, and payment success navigation.
- Old product spec popup remains for add-to-cart and existing non-normal selection paths only.
- `product-buy-popup` remains backwards-compatible for live room usage.
- `product-buy-popup` `confirm` payload includes the selected SKU object in addition to existing fields.
- `product-buy-popup` supports optional `confirmText`, defaulting to `立即购买`.
- Presale, seckill, and custom-form product clicks open the same visual popup but confirmation shows `该商品类型暂不支持弹窗下单`.
- Do not modify root legacy mini-program source or `/Users/apple/Desktop/code/live_h5`.

## Acceptance Criteria

- [ ] Normal product detail no longer navigates to `/pages/order/confirm` from "立即购买".
- [ ] Product detail renders the live room order popup and address popups.
- [ ] Normal products can build `confirmOrder` and `createOrder` payloads with product id, SKU id, quantity, tenant, address, coupon, live context, and remark.
- [ ] Special product types show the unsupported toast when confirming from the popup.
- [ ] Existing live-room popup usage still compiles.
- [ ] Focused tests cover product popup helpers and component payload behavior.
- [ ] `npm run build:mp-weixin` passes from `uniapp-src/`.

## Out of Scope

- Full migration of legacy presale, seckill, bargain, assemble, cart, or custom form order endpoints.
- Changing root legacy mini-program source.
- Reworking the live-room purchase flow.

## Technical Notes

- CodeGraph is not initialized in this repo; use `rg`/file reads for implementation.
- Relevant frontend specs: `.trellis/spec/frontend/index.md`, `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`, `.trellis/spec/guides/index.md`.
- Existing unrelated dirty files must not be reverted or included.
