# Fix Broadcast Cancelled Payment Flow

## Goal

Align the uni-app broadcast purchase flow with the H5 interaction: after a live-room order is created and the user cancels WeChat payment, do not show "下单失败". Navigate to the order list pending-payment tab and show "用户取消支付" so the order remains payable.

## Requirements

- Only change the `uniapp-src` purchase/payment-cancel flow and its regression tests.
- Detect payment-cancel errors from mini-program `requestPayment` and the H5-compatible message `用户取消支付`.
- In `onBuyConfirm`, after `createOrder` has returned an `orderNo`, handle payment cancellation separately:
  - Navigate to `/pages/order/list?status=unpay`, preserving `roomCode` when present.
  - Show `uni.showToast({ title: "用户取消支付", icon: "none" })`.
  - Do not show "下单失败".
- Apply the same created-order payment-cancel handling to the order confirmation page used by order list/detail "再次购买".
- Keep real order creation failures and non-cancel payment failures on the existing error toast path.
- Do not modify order APIs, cancel the order, or change shared payment service behavior.

## Acceptance Criteria

- [ ] Cancelling payment after order creation navigates to `status=unpay` with `roomCode`.
- [ ] Cancelling payment from the order page "再次购买" confirmation flow navigates to `status=unpay` with `roomCode`.
- [ ] Cancelling payment shows `用户取消支付` and never shows `下单失败`.
- [ ] A normal `createOrder` failure still shows its failure message or `下单失败`.
- [ ] Targeted regression test passes.

## Technical Notes

- H5 reference: `/Users/apple/Desktop/code/live_h5/src/services/yeepay-jsapi-pay.js` navigates to `/pages/order/list?status=unpay...` and rejects with `用户取消支付` on JSAPI cancel.
- Target logic: `uniapp-src/src/pages/broadcast/composables/useLivePurchase.js`, `uniapp-src/src/pages/order/confirm.vue`, and shared helper `uniapp-src/src/services/order-payment-cancel.js`.
- Project convention: order list pending-payment status is `unpay`.
