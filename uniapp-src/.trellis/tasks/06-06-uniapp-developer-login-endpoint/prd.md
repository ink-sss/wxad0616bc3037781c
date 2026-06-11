# Replace uniapp developer login endpoint

## Goal

Replace the uni-app login page's developer-tools login path with a local reused mini-program session, while keeping the existing login-session persistence path.

## What I already know

* The change targets `uniapp-src`, not the root legacy Mini Program source.
* The developer login entry is `loginWithWechatDevtoolsProfile()` in `uniapp-src/src/pages/login/page-tools.js`.
* The backend wrapper `loginMiniProgram()` posts to `/h5/miniprogram/login` through `h5Post()`, but the developer-tools path should no longer call it.
* The developer-tools login entry can still reuse `saveLoginSession()` so token, user id, open id, IM credentials, and supplier id are stored consistently.

## Requirements

* Developer-tools login must not call the login API.
* Developer-tools login must reuse the provided session fields:
  * `token`
  * `user_id: 874`
  * `open_id: "ot-Fn3Z4r2e0iN6UpuTl1MGUysg8"`
  * `im_user_id: "customer_874"`
  * `im_user_sig`
  * `shop_supplier_id: 15`
  * `msg: "登录成功"`
* The change must keep existing token/session persistence behavior.
* Plugin login and phone binding must not be changed.

## Acceptance Criteria

* [ ] Pressing the login page's "开发者工具登录" button writes the reused session through the normal persistence path.
* [ ] The developer login path no longer depends on `uni.login`/`wx.login` or `/h5/miniprogram/login`.
* [ ] A focused regression test verifies the developer login path does not call the API wrapper.

## Out of Scope

* Changing the WeChat login plugin flow.
* Changing H5 auth, phone binding, payment, or legacy root Mini Program source.
* Editing `uniapp-src/dist/` build output.

## Technical Notes

* Applicable frontend spec: `.trellis/spec/frontend/index.md`, `.trellis/spec/frontend/quality-guidelines.md`.
* Applicable thinking guide: `.trellis/spec/guides/index.md`.
