# implement: uniapp mini program payment integration

## Goal

Implement the approved unified WeChat Mini Program Yeepay payment plan for `uniapp-src`, especially live-room purchases. The payment flow must use Mini Program `open_id`, create orders with `source=4`, create Yeepay payment orders with `tradeType=mini_program`, parse `prePayTn`, invoke the platform payment wrapper, and confirm final success through `/h5/pay/result` polling.

## What I already know

* Approved design doc: `/Users/apple/.gstack/projects/wxad0616bc3037781c/apple-main-design-20260604-181644.md`.
* Existing front-end success UI exists, but it currently trusts `requestPayment` success instead of backend payment result.
* Existing `src/services/payment-action.js` sends `tradeType: "JSAPI"`.
* Existing live and order confirm creation paths use `source: liveRoomId ? 2 : 1`.
* Login helpers save token/user/shop supplier, but do not persist `open_id` under a stable payment key.
* Frontend spec requires mp-weixin APIs behind `src/platform/weixin/`, not scattered direct payment calls.

## Requirements

* Persist Mini Program `open_id` from login/pre-login/session responses in stable storage aliases.
* Provide a shared payment identity resolver for current Mini Program appId + openId.
* Create payment orders with `tradeType: "mini_program"`, `channelType: 4`, current appId, and openId.
* Parse Yeepay `payParams.prePayTn` JSON string and flat payment fields into `requestPayment` params.
* Poll `/h5/pay/result` after `requestPayment` success and only report confirmed success for `payStatus=1`.
* Use the shared service from live-room purchase, order confirm, order pay page, and order list pay action.
* Keep live-room popup payment UX; do not force cashier-page navigation.

## Acceptance Criteria

* [x] `src/api/pay.js` normalizes `prePayTn` JSON and flat fields.
* [x] `src/services/payment-action.js` owns identity resolution, payment creation, requestPayment invocation, and result polling.
* [x] Login session helpers persist `open_id` aliases.
* [x] Mini Program order creation paths send `source: 4`.
* [x] Callers do not show final success until the shared service confirms backend payment result.
* [x] `node --check` passes for touched JS files.
* [x] `npm run build:mp-weixin` passes from `uniapp-src/`.

## Definition of Done

* Tests/checks run and results recorded.
* No unrelated dirty files are reverted or modified.
* Remaining manual WeChat DevTools/real-device validation is clearly reported.

## Out of Scope

* Backend API implementation.
* Refund, shipping sync, and merchant transfer changes.
* Redesigning live-room buying UI.

## Technical Notes

* Key files: `uniapp-src/src/api/pay.js`, `uniapp-src/src/services/payment-action.js`, `uniapp-src/src/api/miniprogram-login.js`, `uniapp-src/src/pages/login/page-tools.js`, `uniapp-src/src/pages/user/page-tools.js`, `uniapp-src/src/pages/broadcast/composables/useLivePurchase.js`, `uniapp-src/src/pages/order/confirm.vue`, `uniapp-src/src/pages/order/pay.vue`, `uniapp-src/src/pages/order/list.vue`.
* Relevant frontend specs: `.trellis/spec/frontend/quality-guidelines.md`, `.trellis/spec/frontend/state-management.md`, `.trellis/spec/frontend/directory-structure.md`.


## Verification Results

* `node --check` passed for `src/api/pay.js`, `src/api/miniprogram-login.js`, `src/services/payment-action.js`, and `src/pages/broadcast/composables/useLivePurchase.js`.
* Focused static scan found no remaining `tradeType: "JSAPI"`, `source: liveRoomId ? 2 : 1`, or `payMode === "jsapi"` in the migrated `api/services/broadcast/order` payment paths.
* `git diff --check` passed for touched files.
* `npm run build:mp-weixin` passed from `uniapp-src/`.
* Existing legacy direct `requestPayment` wrapper usages remain in `src/common/pay.js` and old `pages/live/commponents/*` components; current live routes redirect to the broadcast flow and were not expanded in this task.
* WeChat DevTools and real-device payment validation remain required with a backend-confirmed AppID/open_id/product tuple.
