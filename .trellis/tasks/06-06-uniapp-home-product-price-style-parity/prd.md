# fix: uniapp homepage product price style parity

## Goal

Align the `uniapp-src` homepage DIY product card price area with the root Mini Program source styling so current price, line price, and sales text render like the original Mini Program.

## What I Already Know

- User reported the `uniapp-src` homepage product original/current price styling is incorrect and requested a complete copy of the Mini Program source style.
- `uniapp-src/src/pages/index/index.vue` renders homepage DIY content through `uniapp-src/src/components/diy/diy.vue`.
- The homepage product card implementation is `uniapp-src/src/components/diy/product/product.vue`.
- The Mini Program source reference is `components/diy/product/product.wxml` and `components/diy/product/product.wxss`.
- The legacy homepage fallback product list also uses price utility classes in `components/diy/diy.wxml`, `components/diy/diy.wxss`, and `pages/index/index.wxss`, but the active uni-app homepage product stream maps to the DIY product component.

## Requirements

- Keep changes scoped to `uniapp-src` source.
- Do not modify root Mini Program source; use it only as a reference.
- Preserve existing data fields and navigation behavior.
- Copy the Mini Program DIY product price-related layout and typography into the uni-app component in maintainable Vue/uni-app style.
- Make critical utility-class styling explicit inside the component because `product.vue` uses scoped styles and should not depend on root compiled `app.wxss`.

## Acceptance Criteria

- [ ] `uniapp-src/src/components/diy/product/product.vue` renders the current price with `¥` at `22rpx`, amount at `32rpx` bold, and line price at `22rpx` with strike-through and `10rpx` left spacing.
- [ ] Price row spacing matches the Mini Program source across supported product columns, including `margin-bottom: 10rpx` for columns 1/2/4/5 and `margin-bottom: 0` for columns 3/6.
- [ ] Sales text remains `24rpx` with `12rpx` right spacing where the Mini Program source defines it.
- [ ] Cart button absolute positioning for columns 1/2/3/5/6 matches the Mini Program source so price/sales layout is not distorted by the button.
- [ ] `cd uniapp-src && npm run build:mp-weixin` succeeds, or any inability to run it is reported.

## Out of Scope

- Product API/data normalization changes.
- Homepage product image/card redesign beyond the Mini Program style parity.
- Changes to root compiled Mini Program source or `uniapp-src/dist/`.

## Technical Notes

- Relevant implementation file: `uniapp-src/src/components/diy/product/product.vue`.
- Source reference files: `components/diy/product/product.wxml`, `components/diy/product/product.wxss`.
- Project component guideline requires recovered components to keep critical layout explicit in component styles instead of depending only on global utility classes.
