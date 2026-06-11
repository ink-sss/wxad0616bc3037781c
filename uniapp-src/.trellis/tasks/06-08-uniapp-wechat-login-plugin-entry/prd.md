# fix uniapp wechat login plugin

## Goal

Restore the uni-app Mini Program login page so the normal WeChat login entry uses the registered `wechat-login` plugin component instead of a plain button.

## What I Already Know

* The current uni-app login page is `uniapp-src/src/pagesPlus/main/login/login.vue`.
* The current page renders plain `<button>` controls for both `开发者工具登录` and `微信一键登录`.
* `uniapp-src/src/pagesPlus/main/login/page-tools.js` already has `loginWithWechatPluginProfile(vm, event)`, but the page does not import or bind it.
* The legacy Mini Program page `pages/login/login.wxml` used `<wechat-login>` with `loginSuccess`, `loginFail`, and `loginCancel` bindings.
* `uniapp-src/src/pages.json` already declares the plugin provider, but the login page generated `login.json` currently has empty `usingComponents`.

## Assumptions

* In mp-weixin production behavior, the primary normal login path should invoke `<wechat-login>`.
* The developer-tools shortcut may remain available only in WeChat Developer Tools for local validation.
* Non-mp-weixin builds should continue to use the existing H5 mini-wechat auth flow.

## Requirements

* Render `<wechat-login>` on the mp-weixin login page for the normal WeChat login path.
* Bind plugin success/fail/cancel events to existing login persistence and toast behavior.
* Keep `开发者工具登录` hidden outside the devtools runtime.
* Add page-level `usingComponents` config so the mp-weixin generated login page can resolve `wechat-login`.
* Preserve the existing agreement check before accepting plugin success.

## Acceptance Criteria

* [ ] `npm run build:mp-weixin` completes from `uniapp-src/`.
* [ ] Generated `dist/build/mp-weixin/pagesPlus/main/login/login.wxml` contains `wechat-login`.
* [ ] Generated `dist/build/mp-weixin/pagesPlus/main/login/login.json` maps `wechat-login` to `plugin://wx43134e071b752953/wechat-login`.
* [ ] The normal mp-weixin login entry no longer compiles as only a plain button.

## Out of Scope

* Do not change root legacy Mini Program source.
* Do not change the external H5 project.
* Do not redesign the login page UI beyond restoring the plugin entry.

## Technical Notes

* Relevant files:
  * `uniapp-src/src/pagesPlus/main/login/login.vue`
  * `uniapp-src/src/pagesPlus/main/login/page-tools.js`
  * `uniapp-src/src/pages.json`
* Relevant legacy references:
  * `pages/login/login.wxml`
  * `pages/login/login.js`
