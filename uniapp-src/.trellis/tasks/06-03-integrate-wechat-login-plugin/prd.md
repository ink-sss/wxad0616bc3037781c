# brainstorm: integrate wechat login plugin into uniapp

## Goal

Analyze the existing WeChat login authorization plugin under `plugin_` and define how `uniapp-src` should use the same login authorization flow in the uni-app Vue 3 mini program source.

## What I already know

* User wants `uniapp-src` to use the login authorization method provided by `plugin_/`.
* The plugin is a WeChat Mini Program plugin at `plugin_/wx43134e071b752953`.
* `plugin.json` exposes `wechat-login` as `components/hello-component`.
* The component wraps `functional-page-navigator name="loginAndGetUserInfo"` and emits `loginSuccess`, `loginFail`, and `loginCancel`.
* The plugin does not exchange business tokens by itself. It only obtains WeChat functional-page user authorization data and returns it to the host page.
* The old compiled mini program uses `<wechat-login>` in `pages/login/login.wxml` and `pages/login/login-pop.wxml`.
* Old login success flow:
  * read `event.detail.detail.userInfo.nickName`
  * read `event.detail.detail.userInfo.avatarUrl`
  * call `wx.login` again to obtain `code`
  * POST `user.user/userLogin` with `code`, `nickName`, `avatarUrl`, and optionally `shop_supplier_id`
  * store `token`, `user_id`, `shop_supplier_id`
  * update `app.globalData.is_login`, `imUserId`, `imUserSig`
  * call `app.imLogin()`
  * if `setting.wx_phone && !mobile`, set `get_phone` and `wx_phone_compulsory`
* Current `uniapp-src/src/pages/login/login.vue` already has a "微信一键登录" button, but it calls `h5MiniWechatLogin()`.
* Current `h5MiniWechatLogin()` uses `uni.login -> /h5/auth/wechatSilentLogin` and expects an H5-style token response.
* Current `uniapp-src/src/pages.json` has `"plugins": {}` and does not declare `wx43134e071b752953`.
* Current `uniapp-src/src/manifest.json` has `mp-weixin.setting.localPlugins: false`.

## Assumptions (temporary)

* The desired behavior is to match the old mini program production login path, not the H5 silent auth bridge.
* The backend endpoint `user.user/userLogin` is still available to `uniapp-src` through the existing `_post` mixin.
* The plugin id remains `wx43134e071b752953`.
* The project will use the existing plugin directory as a local plugin during development/build, or the same plugin id will be configured in WeChat Mini Program backend.

## Open Questions

* Should `uniapp-src` keep the current `/h5/auth/wechatSilentLogin` path as a fallback, or fully switch mini program login to the old `user.user/userLogin` path?
* Is the plugin available as an uploaded WeChat plugin for appid `wx3bf933f8a2018d8d`, or should `uniapp-src` enable `localPlugins` and package `plugin_/wx43134e071b752953` locally?
* Does the production backend still require `nickName/avatarUrl`, or can it accept only `code`?

## Requirements (evolving)

* Declare the WeChat login plugin in the generated mini program config.
* Use `<wechat-login>` on the mini program login screen for the authorization button.
* Preserve the agreement checkbox gate before starting authorization.
* On `loginSuccess`, exchange WeChat data for a business login session using the same contract as the old mini program.
* Preserve token/session side effects used by the rest of `uniapp-src`.
* Preserve redirect behavior after successful login.
* Preserve fail/cancel toast behavior.
* Do not break H5/web login pages.

## Acceptance Criteria (evolving)

* [ ] `uniapp-src` mp-weixin build declares `wechat-login` as `plugin://wx43134e071b752953/wechat-login`.
* [ ] Login page renders plugin button in mp-weixin runtime.
* [ ] Agreement unchecked state prevents plugin login.
* [ ] `loginSuccess` calls `wx.login`/`uni.login` and sends `code`, `nickName`, `avatarUrl`, and relevant context to backend.
* [ ] Successful backend response stores `token`, `user_id`, optional `shop_supplier_id`, and IM credentials.
* [ ] Successful login redirects back to the intended page.
* [ ] Fail/cancel paths show "授权失败，请重新登录".
* [ ] H5 auth helpers remain available for existing H5-specific routes.

## Definition of Done (team quality bar)

* Tests added/updated where practical.
* `npm run build:mp-weixin` completes or any blocker is documented.
* Generated mini program output includes plugin component usage.
* Manual WeChat DevTools verification plan is documented if automated test cannot cover functional-page authorization.
* Rollback is simple: revert login page/plugin config changes and fall back to existing `h5MiniWechatLogin()`.

## Out of Scope (explicit)

* Rewriting all auth flows in the app.
* Changing backend login contracts unless current endpoints are unavailable.
* Modifying the plugin implementation unless WeChat requires local plugin packaging changes.
* Touching dirty generated `uniapp-src/dist` files by hand.

## Technical Notes

* Plugin files inspected:
  * `plugin_/wx43134e071b752953/plugin.json`
  * `plugin_/wx43134e071b752953/index.js`
  * `plugin_/wx43134e071b752953/components/hello-component.js`
  * `plugin_/wx43134e071b752953/components/hello-component.wxml`
* Existing old mini program flow inspected:
  * `pages/login/login.wxml`
  * `pages/login/login.js`
  * `pages/login/login-pop.js`
* Current uni-app login flow inspected:
  * `uniapp-src/src/pages/login/login.vue`
  * `uniapp-src/src/pages/login/page-tools.js`
  * `uniapp-src/src/services/h5-auth.js`
  * `uniapp-src/src/api/auth.js`
  * `uniapp-src/src/services/h5-auth-context.js`
  * `uniapp-src/src/pages.json`
  * `uniapp-src/src/manifest.json`

## Premises

1. The plugin is a UI/auth capability bridge, not a complete login SDK.
2. Business login still belongs in `uniapp-src`, using the app backend to convert WeChat data into `token` and user session state.
3. The safest migration is to add a mini program plugin-login path while preserving the current H5 auth helper as fallback until backend behavior is confirmed.

## Approaches Considered

### Approach A: Minimal parity with old mini program

Use `<wechat-login>` directly in `uniapp-src/src/pages/login/login.vue`, declare it in page/global component config, and add handlers that mirror old `pages/login/login.js` against `user.user/userLogin`.

Effort: S
Risk: Medium

Pros:
* Closest to the proven old production behavior.
* Smallest implementation surface.
* Avoids forcing `/h5/auth/wechatSilentLogin` to handle profile data it may not expect.

Cons:
* Couples the login page to old `_post` endpoint names.
* Requires confirming plugin declaration format in uni-app build output.
* Functional-page authorization needs real WeChat DevTools/device verification.

Reuses:
* Old `pages/login/login.js` login success contract.
* Current `page-tools.saveLoginSession()` storage and IM side effects.
* Current login page redirect context.

### Approach B: Service abstraction with plugin event input

Create a service function such as `loginWithWechatPluginProfile(event, context)` that normalizes plugin event shape, calls `uni.login`, posts to backend, and syncs session. The login page only calls the service.

Effort: M
Risk: Low to Medium

Pros:
* Keeps event parsing and backend contract out of the Vue page.
* Easier to unit-test normalization and session sync.
* Can keep `h5MiniWechatLogin()` as fallback behind the same page.

Cons:
* More files than minimal parity.
* Still depends on the old backend endpoint unless a new API is added.
* Requires a clear naming split between H5 auth and mini program plugin auth.

Reuses:
* `platform/weixin/auth.login()`.
* `page-tools.saveLoginSession()`.
* `services/h5-auth-context` redirect/session helpers where applicable.

### Approach C: Backend-first unified auth endpoint

Keep the current page button flow but change `/h5/auth/wechatSilentLogin` or add a new unified endpoint to accept `code`, `nickName`, `avatarUrl`, tenant/live context, and return the same token payload for H5 and mp-weixin.

Effort: L
Risk: Medium to High

Pros:
* Cleanest long-term contract if H5/live auth and mini program auth should converge.
* Avoids exposing old `user.user/userLogin` endpoint in new source.
* Could reduce duplicate auth code over time.

Cons:
* Requires backend changes and contract validation.
* Slower path to parity.
* Higher regression risk for existing H5/live auth behavior.

Reuses:
* Current `h5-auth.js` shape and redirect handling.
* Current `/h5/auth/wechatSilentLogin` response parsing.

## Recommendation

Choose Approach B if implementation follows this design. It keeps old-production parity but puts the plugin-specific parsing and backend exchange in a small service instead of embedding it all in `login.vue`.

The minimal variant of Approach B can ship quickly:

1. Add plugin declaration.
2. Add `wechat-login` usage to `login.vue` under mp-weixin.
3. Add `loginWithWechatPluginProfile()` service.
4. Reuse `saveLoginSession()` and existing redirect context.
5. Keep current `h5MiniWechatLogin()` as fallback only if plugin is unavailable or backend rejects the old contract.

## Implementation Sketch

* Plugin config:
  * `pages.json` should declare `plugins.wx43134e071b752953`.
  * Login page should declare `usingComponents.wechat-login = "plugin://wx43134e071b752953/wechat-login"` if uni-app does not emit it from direct usage.
  * If using local plugin, `manifest.json`/project config must allow local plugins and map plugin root.
* Login page:
  * Replace the plain mini program login button with plugin component in mp-weixin runtime.
  * Bind `@loginSuccess`, `@loginFail`, `@loginCancel`.
  * Keep agreement checkbox as a gate.
* Service:
  * Normalize `event.detail.detail.userInfo` defensively.
  * Call `login({ provider: "weixin" })` to get code.
  * POST `user.user/userLogin` with `code`, `nickName`, `avatarUrl`, `shop_supplier_id`, plus existing referral/context fields where needed.
  * Call shared session sync helper.
* Verification:
  * Build mp-weixin.
  * Inspect generated `app.json`/page json for plugin declaration.
  * Use WeChat DevTools to run login success/cancel/fail.

