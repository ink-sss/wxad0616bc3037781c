# Replace Uniapp Developer Tools Login Token

## Goal

Replace the local WeChat Developer Tools login session used by the uni-app login page with the latest successful login response provided by the user.

## Requirements

- Update the developer-tools login fixture in `uniapp-src/src/pagesPlus/main/login/page-tools.js`.
- Preserve the existing shortcut behavior: no `uni.login`, `wx.login`, or `/h5/miniprogram/login` request during developer-tools login.
- Keep the normal session persistence path through `saveLoginSession`.
- Update the focused test assertions to match the new fixture.
- Keep changes scoped to `uniapp-src` source/tests and the relevant Trellis spec note.

## Acceptance Criteria

- [ ] `loginWithWechatDevtoolsProfile()` returns the new token response fields:
  `user_id=884`, `open_id="ot-Fn3Z4r2e0iN6UpuTl1MGUysg8"`,
  `im_user_id="customer_884"`, the provided `im_user_sig`,
  `shop_supplier_id=15`, and `msg="登录成功"`.
- [ ] The focused developer-tools login test passes.
- [ ] The frontend quality guideline's developer-tools login contract matches the new fixture.

## Out of Scope

- No changes to real plugin login or H5 login behavior.
- No changes to root legacy Mini Program source.
- No changes to generated `uniapp-src/dist/`.

## Technical Notes

- Current implementation is in `uniapp-src/src/pagesPlus/main/login/page-tools.js`.
- Focused test is `uniapp-src/tests/login-page-devtools.test.mjs`; it currently references an outdated `src/pages/login` path and needs to target `pagesPlus/main/login`.
