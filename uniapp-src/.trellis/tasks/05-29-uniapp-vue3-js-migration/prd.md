# Convert project to uni-app Vue3 JS

## Goal

Rebuild the current compiled WeChat Mini Program output as a maintainable uni-app + Vue 3 + JavaScript source project under `uniapp-src/`, while preserving the current root output as a reference. The first supported target is `mp-weixin`.

## Requirements

* Create a standard uni-app Vue 3/Vite/JavaScript project in `uniapp-src/`.
* Keep the existing compiled Mini Program files untouched unless a later task explicitly asks to remove them.
* Generate and maintain `src/pages.json` from the current `app.json`, preserving the main package, 9 subpackages, tabBar, page window options, permissions, and lazy-loading behavior where uni-app supports it.
* Restore `src/manifest.json`, `src/main.js`, `src/App.vue`, `src/uni.scss`, environment config, request helpers, validators, navigation helpers, global app methods, Vuex store compatibility, and Pinia chat store compatibility.
* Do not import `common/vendor.js` as a source dependency. Recover npm dependencies and source imports instead.
* Prefer Vue Options API for recovered pages and components because the compiled output mostly preserves Options API structure.
* Migrate recoverable business pages and components into `.vue` files. When a route is only an empty compiled placeholder, create a compile-safe placeholder page and document that no business logic exists to recover.
* Establish `src/platform/weixin/` for mp-weixin-specific capabilities: login, phone number, payment, merchant transfer, scan code, location/map, official account, customer service, web-view, navigate-to-miniprogram, live-player/live-pusher, TRTC, IM, subscription messages, update manager, account info, and screen capture/recording behavior.
* Preserve existing backend API protocol, including `_get`, `_post`, specialized store/supplier request helpers, error-code handling, token invalidation behavior, and login redirects.
* Preserve existing route paths and business semantics for share links, tabBar links, dynamic DIY links, and scan-code write-off links.
* Use parallel workers with non-overlapping write scopes. Public configuration and shared runtime files are owned by one integration worker.

## Acceptance Criteria

* [ ] `uniapp-src/package.json` has working scripts for `dev:mp-weixin` and `build:mp-weixin`.
* [ ] `npm install` can complete inside `uniapp-src/`.
* [ ] `npm run build:mp-weixin` can complete inside `uniapp-src/`.
* [ ] WeChat Developer Tools can import `uniapp-src/dist/build/mp-weixin`.
* [ ] The five tab pages open: home, category, shop list, cart, user center.
* [ ] High-risk pages have explicit migration notes and at least compile-safe implementations: login/phone binding, product detail, order/payment entry, user cash apply/list, store write-off, webview, live vertical/horizontal, TRTC component.
* [ ] `components/diy/*` dynamic rendering supports the current component type list or marks unsupported compiled-only gaps with `TODO:migration`.
* [ ] Placeholder routes from empty compiled pages are present and compile-safe.
* [ ] `uniapp-src/` does not depend on the compiled `common/vendor.js` module.
* [ ] All `TODO:migration` markers are either non-blocking documented gaps or fixed before claiming full feature parity.

## Definition of Done

* `mp-weixin` build passes.
* Public route paths from `app.json` are represented in `src/pages.json`.
* Shared runtime, stores, and request helpers are restored in source form.
* High-risk WeChat-only APIs are isolated behind `platform/weixin` wrappers or guarded by `#ifdef MP-WEIXIN`.
* Quality check has reviewed the generated source against this PRD and Trellis specs.

## Technical Approach

Build the source project in phases:

1. Scaffold `uniapp-src/` with uni-app Vue 3/Vite structure, dependencies, config, global styles, static assets, and pages/manifest generation.
2. Recover shared runtime: `App.vue`, `main.js`, env config, request helpers, navigation, validation, payment/upload utilities, Vuex, Pinia, and global components.
3. Add `platform/weixin` wrappers before migrating pages that use WeChat-only APIs.
4. Migrate reusable components, using official `uni_modules` replacements where clear and preserving custom business components where behavior is project-specific.
5. Migrate real business pages by domain and generate placeholders for compiled-only empty routes.
6. Run build, fix compile errors, then run a check pass.

## Parallel Implementation Plan

* W0 Integration/scaffold owns: `uniapp-src/package.json`, `vite.config.js`, `index.html`, `src/pages.json`, `src/manifest.json`, `src/main.js`, `src/App.vue`, `src/uni.scss`, shared project config.
* W1 Shared runtime owns: `uniapp-src/src/env/**`, `src/common/**`, `src/utils/**`, request/validator/navigation/pay/upload helpers.
* W2 State/dependencies owns: `uniapp-src/src/store/**`, dependency declarations for Vuex/Pinia/Tencent IM/TRTC, and store compatibility notes.
* W3 WeChat platform owns: `uniapp-src/src/platform/weixin/**` and any wrapper docs for mp-weixin-only APIs.
* W4 Components owns: `uniapp-src/src/components/**` and `uniapp-src/src/uni_modules/**`.
* W5 Product/cart pages owns: `uniapp-src/src/pages/product/**` and `uniapp-src/src/pages/cart/**`.
* W6 Login/user pages owns: `uniapp-src/src/pages/login/**` and `uniapp-src/src/pages/user/**`.
* W7 Home/shop/content pages owns: `uniapp-src/src/pages/index/**`, `shop/**`, `store/**`, `article/**`, `coupon/**`, `webview/**`, `privacy/**`, `diy-page/**`, `performance/**`.
* W8 Live pages owns: `uniapp-src/src/pages/live/**`.
* W9 Placeholder subpackages owns: `uniapp-src/src/pages/live-push/**`, `live-management/**`, `branch/**`, `order/**`, `agent/**`, `pagesPlus/**`, and `pages/user/my_shop/**` placeholder recovery where existing source is empty.

Only W0 may edit `src/pages.json` and shared root config. Other workers should produce files in their owned directories and list any needed route/config changes in their final notes.

## Decision (ADR-lite)

**Context**: The repository contains compiled mp-weixin output, not original `.vue` source. Many WXML templates and JS render helpers have compressed aliases and bridge fields. Some configured routes are empty placeholders.

**Decision**: Rebuild a source project under `uniapp-src/`, recover source logic where possible, generate placeholders where no business logic exists, and isolate WeChat-only capabilities behind platform wrappers.

**Consequences**: This is faster and safer than trying to treat compiled output as source. Some pages cannot be fully restored without original source or product/API reimplementation. The first deliverable is a maintainable mp-weixin source project with explicit parity gaps.

## Out of Scope

* H5/App/native multi-platform parity.
* Removing or rewriting the existing compiled output at repo root.
* Recreating business logic for routes that are only empty placeholder compiled pages.
* Changing backend API contracts.
* Redesigning UI/UX beyond source recovery and compile fixes.

## Technical Notes

* Current project has no `package.json`, `pages.json`, `manifest.json`, `App.vue`, or source `main.js`.
* `common/vendor.js` contains Vue 3.4.21, Vuex 4.1.0, Pinia, TencentCloudChat 3.5.7, TIM upload plugin, and uni runtime code, but it is a compiled bundle.
* `app.json` defines 171 routes: 48 main pages, 9 subpackages, and 123 subpackage pages.
* About 55 routes have recoverable business content; about 115 are empty placeholders.
* Component inventory: 54 business components plus 4 `uni_modules`.
* High-risk mp-weixin capabilities: live-player/live-pusher/TRTC, IM group lifecycle, payment, merchant transfer, login/phone authorization, scan write-off, map/location, official-account, web-view, customer service, navigate-to-miniprogram, subscribe messages, update manager, and screen capture/recording APIs.

## Research References

* [`research/page-inventory.md`](research/page-inventory.md) — route and page recoverability inventory.
* [`research/runtime-dependencies.md`](research/runtime-dependencies.md) — dependency and global runtime recovery notes.
* [`research/component-inventory.md`](research/component-inventory.md) — component migration and replacement strategy.
* [`research/weixin-risk.md`](research/weixin-risk.md) — mp-weixin-only capability risks and validation priorities.
