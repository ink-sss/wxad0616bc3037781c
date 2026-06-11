# Add Uniapp Request Identity Headers

## Goal

Add Mini Program identity headers to the uni-app API request wrapper so backend requests can identify the current Mini Program app and, when available, the current WeChat user identifiers.

## What I Already Know

- The requested scope is `uniapp-src`, not the root legacy Mini Program source.
- The common legacy API request wrapper is `uniapp-src/src/utils/request.js`.
- Mini Program app id and openid helpers already exist in `uniapp-src/src/api/miniprogram-login.js`.
- `X-Appid` must be sent on interface requests.
- `X-Unionid` and `X-Openid` must be sent only when values are available.

## Requirements

- Add `X-Appid` to headers in the unified `uniapp-src` request path.
- Resolve `X-Appid` from the current Mini Program app id using the existing Mini Program app id helper.
- Add `X-Unionid` only if a unionid value exists.
- Add `X-Openid` only if an openid value exists.
- Preserve the existing `content-type: application/json;charset=UTF-8` header for POST requests.
- Do not modify root legacy Mini Program source.

## Acceptance Criteria

- [ ] GET requests include `X-Appid`.
- [ ] POST requests include `X-Appid` and keep the existing JSON content-type header.
- [ ] `X-Openid` and `X-Unionid` are present only when stored identity values exist.
- [ ] Focused tests cover header construction.

## Out Of Scope

- Reworking login flows.
- Changing backend payload fields such as `appid`, `app_id`, or `token`.
- Modifying generated `uniapp-src/dist/` output.
