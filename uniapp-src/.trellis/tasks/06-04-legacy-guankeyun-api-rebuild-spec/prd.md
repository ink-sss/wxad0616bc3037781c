# implement: legacy guankeyun api rebuild spec

## Goal

Produce a backend handoff document for the reduced legacy `https://api.guankeyun.net` interfaces still needed by storefront display flows, and implement a frontend-only local draft cart. The backend team only needs request parameters, interaction triggers, and response fields for the five display endpoints that remain in scope.

## What I already know

* Scope is limited to old Guankeyun APIs under `https://api.guankeyun.net`.
* The user explicitly excluded live, shop, payout, `/h5`, and other side flows.
* The user additionally excluded cart APIs, coupon receive, account/password login, SMS verification, and anchor login from backend reimplementation.
* Cart interaction can be implemented completely in frontend cache as a local draft cart, with no checkout button.
* Response shapes must be inferred from frontend source only; no live request capture is allowed.
* The runtime request wrapper sends requests to `${websiteUrl}/index.php/api/${endpoint}`.
* `websiteUrl` comes from `config.app_url`, which resolves to `https://api.guankeyun.net` in both development and production.

## Requirements

* Create a server-facing markdown document under `uniapp-src/dosc/`.
* Reduce the backend fixed old endpoint inventory to `index/index`, `index/nav`, `product.category/index`, `product.product/lists`, and `product.product/detail`.
* Include public request rules, common parameters, success/error handling, and frontend-consumed response fields.
* Document that cart, coupon receive, old login, SMS, and anchor login endpoints are explicitly out of backend scope.
* Implement local cart storage for cart page, category quick cart, category cart mask, and product spec popup add-cart.
* Hide cart checkout entry points and prevent `order_type=cart&cart_ids=...` navigation.
* Explain that `pages/user/index/index` and `pages/center/index` currently use `/h5` APIs and are excluded from old Guankeyun reimplementation.

## Acceptance Criteria

* [ ] Handoff document names the five fixed backend endpoints and explicitly excludes cart/coupon/login/SMS/anchor endpoints.
* [ ] Frontend cart page reads and writes local cache instead of `order.cart/lists/add/sub/delete`.
* [ ] Category quick cart reads and writes local cache instead of `product.Category/lists` and `order.cart/add`.
* [ ] Category cart mask reads and writes local cache instead of `order.cart/add/sub/delete`.
* [ ] Product spec popup add-cart writes local cache instead of `order.cart/add`.
* [ ] Cart and category quick cart no longer show checkout buttons.
* [ ] Static scan confirms no `order.cart/`, `product.Category/lists`, or `order_type=cart&cart_ids` remain in the active local cart flows.

## Out of Scope

* No real requests to `https://api.guankeyun.net`.
* No coupon receive implementation.
* No old login, SMS, or anchor login source changes in this task.
* No `/h5` endpoint reimplementation spec.
* No generated `dist/` file edits.

## Technical Notes

* Main wrapper: `uniapp-src/src/utils/request.js`.
* Runtime installer: `uniapp-src/src/utils/install.js`.
* Config: `uniapp-src/src/env/config.js`, `development.js`, `production.js`.
* Selected source areas: `pages/index`, `components/diy`, `components/tabbar`, `pages/product/category`, `pages/product/list`, `pages/cart`, `pages/login`, `pages/user/index`.
* CodeGraph is not initialized in this repository, so verification used static source scans.
