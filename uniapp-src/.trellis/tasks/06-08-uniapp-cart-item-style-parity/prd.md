# fix uniapp cart item style parity

## Goal

Make the `uniapp-src` shopping cart list look like the recovered Mini Program source instead of the current half-finished card/list rendering.

## What I already know

* The user reported the `uniapp-src` cart product list looks strange and provided a screenshot showing an empty supplier header strip, missing row checkboxes, a sparse product card, and no source-style settlement bar.
* The current source page is `uniapp-src/src/pages/cart/cart.vue`.
* The legacy Mini Program reference is `pages/cart/cart.wxml`, `pages/cart/cart.wxss`, and `pages/cart/cart.js`.
* `CodeGraph` is not initialized in this checkout, so file discovery used `rg` and direct reads.
* The legacy source renders cart checkboxes outside edit mode, applies `pb100` whenever the cart has goods, and shows a bottom settlement/delete bar whenever the cart has goods.
* The current uni-app cart hides supplier/product checkboxes unless edit mode is active and only renders the bottom action bar in edit mode, leaving the supplier title strip visibly empty when `store_open` is forced to `0`.

## Assumptions

* “基于源码复刻” means matching the root Mini Program cart source as the visual/behavior reference while modifying only `uniapp-src`.
* Checkout wiring is not part of this styling task. The restored visual checkout button should not pretend a working local-cart checkout exists if the confirm-order flow does not support cart IDs.

## Requirements

* Keep changes scoped to `uniapp-src/src/pages/cart/cart.vue`.
* Restore the cart list structure from the reference source:
  * Supplier checkbox is visible in the supplier header.
  * Product checkbox is visible in each product row.
  * Bottom bar is visible whenever the cart has goods, with settlement view in normal mode and delete view in edit mode.
* Align item spacing with the reference CSS:
  * Product card uses white rounded supplier container.
  * Image remains `102rpx` with `25rpx` radius.
  * Title, optional description, price, and stepper follow the source dimensions.
  * Empty SKU/description text must not create extra artificial height.
* Preserve existing local-cart data behavior for increment, decrement, selection, deletion, loading, empty state, and tab bar.
* Do not modify root Mini Program source or `uniapp-src/dist`.

## Acceptance Criteria

* [ ] The cart item list no longer shows a blank, unfinished supplier/product card when `store_open` is `0`.
* [ ] Cart item layout and stepper dimensions match `pages/cart/cart.wxss`.
* [ ] Normal mode shows the source-style bottom total/settlement bar; edit mode shows the source-style delete bar.
* [ ] `cd uniapp-src && npm run build:mp-weixin` completes, or any validation failure is documented.

## Definition of Done

* Task-specific source changes are implemented in `uniapp-src`.
* Relevant build or focused validation has been run.
* No unrelated dirty files are modified.

## Out of Scope

* Implementing full backend/local cart checkout.
* Refactoring cart state or local-cart storage.
* Modifying the legacy root Mini Program files.
* Editing generated `uniapp-src/dist` output.

## Technical Notes

* Relevant specs read:
  * `.trellis/spec/frontend/index.md`
  * `.trellis/spec/frontend/directory-structure.md`
  * `.trellis/spec/frontend/component-guidelines.md`
  * `.trellis/spec/frontend/quality-guidelines.md`
  * `.trellis/spec/guides/index.md`
* Relevant source/reference files inspected:
  * `uniapp-src/src/pages/cart/cart.vue`
  * `pages/cart/cart.wxml`
  * `pages/cart/cart.wxss`
  * `pages/cart/cart.js`
  * `uniapp-src/src/services/local-cart.js`
  * `uniapp-src/src/pages/order/confirm-order.vue`
  * `uniapp-src/src/pages/order/confirm.vue`
