# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

The frontend quality bar is compile-safe uni-app source, exact route coverage,
and no dependency on compiled Mini Program output.

---

## Forbidden Patterns

- Do not import root compiled bundles such as `common/vendor.js`.
- Do not keep compiled registration artifacts in source: `_export_sfc`,
  `wx.createPage`, `wx.createComponent`, `@babel/runtime`, or CommonJS
  `require(...)` inside `uniapp-src/src` code.
- Do not scatter direct high-risk WeChat calls such as `wx.*`,
  `uni.requestPayment`, `uni.navigateToMiniProgram`, or `uni.getUpdateManager`
  outside `src/platform/weixin/`.

---

## Required Patterns

- Keep `src/pages.json` route order and route paths aligned with the source
  Mini Program route contract during migration.
- Isolate mp-weixin-only APIs in `src/platform/weixin/` wrappers.
- Keep intentional migration gaps explicit with `TODO:migration` and a reason.
- Pin dependency versions when Vue ecosystem compatibility requires it, such as
  Pinia 2.x with Vue 3.4.x.

---

## Testing Requirements

- Run `npm run build:mp-weixin` from `uniapp-src/` after frontend migration work.
- Verify every `src/pages.json` route has a matching `.vue` file.
- Scan `uniapp-src/src` for forbidden compiled-output dependencies and direct
  high-risk WeChat API calls outside `platform/weixin`.
- Real-device or WeChat Developer Tools validation is required for login, phone
  binding, payment, merchant transfer, scan code, map/location, customer
  service, official account, web-view, live-player/live-pusher, TRTC, and IM.

---

## Code Review Checklist

- Build passes for `mp-weixin`.
- Route count and route order match the expected Mini Program contract.
- No source file depends on compiled output.
- WeChat-only behavior is behind platform wrappers.
- `TODO:migration` entries are intentional and documented, not silent feature
  loss.
