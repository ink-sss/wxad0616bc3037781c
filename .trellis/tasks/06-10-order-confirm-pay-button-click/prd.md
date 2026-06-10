# fix order confirm pay button click

## Goal

Restore the immediate payment action on `uniapp-src/src/pages/order/confirm.vue` so tapping "立即支付" reaches the existing order creation and payment flow in the Mini Program confirmation page.

## What I Already Know

- The user reported that the "立即支付" button click event cannot be triggered.
- The current template binds the footer button with `@click="onPay"`.
- `onPay` already contains the order creation, duplicate-order handling, Yeepay payment call, payment success navigation, and cancellation handling.
- The page has fixed footer UI and bottom sheet popup components; the payment footer needs a stacking level above normal content but below popup sheets.
- The worktree already had unrelated dirty changes, including existing edits in `confirm.vue`; this task should keep changes narrow.

## Assumptions

- The failure is event delivery to the footer button, not the payment API body.
- The desired behavior is to preserve the existing `onPay` business flow.

## Requirements

- Use a Mini Program-compatible tap binding for the "立即支付" control.
- Avoid changing payment business logic or API contracts.
- Keep the footer clickable above normal page content.
- Do not let the footer cover address bottom sheets when they are open.

## Acceptance Criteria

- [ ] The "立即支付" control in `confirm.vue` is bound with a tap event that calls `onPay`.
- [ ] The fixed payment bar has an explicit `z-index` lower than bottom-sheet popups.
- [ ] No unrelated payment logic, API layer, or address flow is refactored.
- [ ] A focused verification or Mini Program build is run when feasible.

## Out of Scope

- Reworking the order payment flow.
- Re-enabling or redesigning the live mini-window on the confirm page.
- Fixing unrelated dirty files in the worktree.

## Technical Notes

- Relevant file: `uniapp-src/src/pages/order/confirm.vue`.
- Nearby payment page `uniapp-src/src/pages/order/pay.vue` uses an explicit fixed-footer `z-index`.
- `bottom-sheet-popup` default `zIndex` is `80`, so the confirm footer should remain below that.
