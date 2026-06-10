# fix uniapp broadcast order popup whitespace

## Goal

Remove the excessive white space in the live broadcast order popup so the popup fits its content while keeping a 30rpx gap above the footer area.

## What I Already Know

- User reported the issue on `uniapp-src` broadcast entry order popup with a screenshot.
- The order popup used by `pages/broadcast/entry` is `uniapp-src/src/components/product-buy-popup.vue`.
- The component is reused by both portrait and landscape broadcast stages.
- Existing local changes already added the popup close button and product title spacing; this task should preserve them.

## Requirements

- Remove the extra white area between the price rows and the footer, keeping only 30rpx spacing.
- Keep a maximum popup height so long content can still scroll within the bottom sheet.
- Keep product info, quantity controls, remark, coupon, price rows, and footer behavior unchanged.
- Scope edits to the uni-app source project.

## Acceptance Criteria

- [ ] The bottom order popup uses content height instead of forcing the current `84vh` layout.
- [ ] The scroll content keeps a 30rpx bottom gap before the footer.
- [ ] The popup still caps at 84vh and allows content scrolling when needed.
- [ ] No unrelated business logic, API, or route behavior is changed.

## Out Of Scope

- Redesigning the buy popup layout.
- Changing payment, coupon, address, SKU, or order submission behavior.
- Editing root legacy Mini Program source or generated `dist` output.

## Technical Notes

- Relevant component: `uniapp-src/src/components/product-buy-popup.vue`.
- Relevant caller examples: `uniapp-src/src/pages/broadcast/components/LivePortraitStage.vue`, `uniapp-src/src/pages/broadcast/components/LiveLandscapeStage.vue`.
- Relevant frontend specs: `.trellis/spec/frontend/index.md`, `.trellis/spec/frontend/component-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`.
