# fix order confirm pay button click

## Goal

Restore the immediate payment action on `uniapp-src/src/pages/order/confirm.vue` so tapping "立即支付" reaches the existing order creation and payment flow in the Mini Program confirmation page.

## What I Already Know

- The user reported that the "立即支付" button click event cannot be triggered.
- The current template binds the footer button with `@click="onPay"`.
- `onPay` already contains the order creation, duplicate-order handling, Yeepay payment call, payment success navigation, and cancellation handling.
- The page has fixed footer UI and bottom sheet popup components; the payment footer must not remain under a stale popup wrapper, and Mini Program native layers can require `cover-view` for fixed CTAs.
- After the click path was restored, the cancel-payment branch exposed a runtime error: `order-payment-cancel.js` used `uniApi = uni` as a parameter default, but mp-weixin service modules can execute without a `uni` lexical binding.
- The worktree already had unrelated dirty changes, including existing edits in `confirm.vue`; this task should keep changes narrow.

## Assumptions

- The failure is event delivery to the footer button, not the payment API body.
- The desired behavior is to preserve the existing `onPay` business flow.

## Requirements

- Use a Mini Program-compatible tap binding for the "立即支付" control.
- Avoid changing payment business logic or API contracts.
- Keep the cancel-payment handler safe in mp-weixin service-module scope.
- Keep the footer clickable above normal page content and native video layers.
- Do not let the footer cover or conflict with address bottom sheets when they are open.

## Acceptance Criteria

- [x] The "立即支付" control in `confirm.vue` is bound through a Mini Program event path that calls `onPay`.
- [x] The mp-weixin footer is rendered as `cover-view` and hidden while address popups are open.
- [x] Cancel-payment handling no longer reads bare global `uni` during function parameter evaluation.
- [x] No unrelated payment API contract or address flow is refactored.
- [x] A focused Mini Program build is run.

## Out of Scope

- Reworking the order payment flow.
- Re-enabling or redesigning the live mini-window on the confirm page.
- Fixing unrelated dirty files in the worktree.

## Technical Notes

- Relevant file: `uniapp-src/src/pages/order/confirm.vue`.
- Nearby payment page `uniapp-src/src/pages/order/pay.vue` uses an explicit fixed-footer `z-index`.
- Closed popup components are destroyed with `v-if` so their fixed wrappers cannot intercept footer taps.
- Runtime APIs used by service modules should be passed explicitly or resolved
  inside the function body through `platform/weixin/runtime.js`; never use
  `uniApi = uni` as a parameter default.
