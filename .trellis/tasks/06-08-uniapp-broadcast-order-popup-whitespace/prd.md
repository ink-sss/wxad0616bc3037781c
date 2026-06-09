# fix uniapp broadcast order popup whitespace

## Goal

Reduce the excessive middle whitespace in the live broadcast order popup by 40rpx so the popup is not unnecessarily tall on the broadcast entry page.

## What I Already Know

- User reported the issue on `uniapp-src` broadcast entry order popup with a screenshot.
- The order popup used by `pages/broadcast/entry` is `uniapp-src/src/components/product-buy-popup.vue`.
- The component is reused by both portrait and landscape broadcast stages.
- Existing local changes already added the popup close button and product title spacing; this task should preserve them.

## Requirements

- Reduce the visible order popup height by 40rpx.
- Keep product info, quantity controls, remark, coupon, price rows, and footer behavior unchanged.
- Scope edits to the uni-app source project.

## Acceptance Criteria

- [ ] The bottom order popup height is 40rpx shorter than the current `84vh` layout.
- [ ] The popup internal container uses the same height as the `wd-popup` custom style.
- [ ] No unrelated business logic, API, or route behavior is changed.

## Out Of Scope

- Redesigning the buy popup layout.
- Changing payment, coupon, address, SKU, or order submission behavior.
- Editing root legacy Mini Program source or generated `dist` output.

## Technical Notes

- Relevant component: `uniapp-src/src/components/product-buy-popup.vue`.
- Relevant caller examples: `uniapp-src/src/pages/broadcast/components/LivePortraitStage.vue`, `uniapp-src/src/pages/broadcast/components/LiveLandscapeStage.vue`.
- Relevant frontend specs: `.trellis/spec/frontend/index.md`, `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`.
