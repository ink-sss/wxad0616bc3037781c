# implement: frontend miniprogram product display compatibility

## Goal

Make the uni-app frontend consume the server-provided `/h5/miniprogram/categories`, `/h5/miniprogram/products`, and `/h5/miniprogram/productDetail` display APIs directly at page level. Missing fields should use safe defaults when possible; unavailable capabilities should be hidden or disabled.

## What I already know

* User selected page-level direct compatibility, not a global legacy adapter.
* Server success envelope uses `code: 0`, so these display requests must not use the legacy `_get` success path.
* Homepage and TabBar should use the frontend's pre-migration default theme when old `index/index` and `index/nav` are missing.
* The default homepage should still show a product stream and request `/h5/miniprogram/products`.
* Product detail should keep local cart add, but direct purchase is disabled with a toast.

## Requirements

* Category page calls `{config.h5_api_url}/h5/miniprogram/categories` and maps `id/name/icon/children` to current page fields.
* Category, product list page, and DIY product flow call `{config.h5_api_url}/h5/miniprogram/products` and map product fields to old UI names.
* Product detail page and category multi-spec popup call `{config.h5_api_url}/h5/miniprogram/productDetail` and map detail/spec/SKU fields to old UI names.
* Optional `tenantId` is sent only when configured; `appId` is always sent from `config.appid`.
* Missing coupon, favorite, service, merchant, customer service, evaluation, presale, seckill, home popup, official account, and collection data does not show fake UI.
* Share popup must not trigger `plus.task.Task/dayTask`.

## Acceptance Criteria

* [ ] Homepage opens with the pre-migration default search/header theme, default TabBar, and product stream without relying on old index endpoints.
* [ ] Category tree renders from the new categories API or shows an empty state without throwing.
* [ ] Product list, category product stream, and DIY product stream render mapped product data and paginate correctly.
* [ ] Product detail renders name, images, price, stock, detail content/images, and supports multi-spec local cart add.
* [ ] Direct purchase is visible but disabled with a toast and no order route.
* [ ] Build passes with `npm run build:mp-weixin`.

## Out of Scope

* Server cart, checkout, coupons, favorite, login, customer service, reviews, merchant store, presale, seckill, and legacy Guankeyun endpoint compatibility.

## Technical Notes

* Existing local cart implementation is in `uniapp-src/src/services/local-cart.js` and should be preserved.
* Related source files: `config.js`, `install.js`, `footTabbar.vue`, `index.vue`, `category.vue`, `list.vue`, `detail.vue`, `diy.vue`.
