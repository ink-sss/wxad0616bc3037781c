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
- Do not migrate H5 upload code that relies on `fetch`, `XMLHttpRequest`, or
  Blob reads into mp-weixin viewer flows. Use `src/platform/weixin/` file
  adapters and `uni.request`/`uni.uploadFile`-based paths instead.
- Do not copy H5 WeChat OAuth/JSSDK/DTE authorization mechanics into
  Mini Program source. `window.location`, browser storage/cookie auth hops,
  `weixin-js-sdk`, and cross-domain bind iframes are H5-only.

---

## Required Patterns

- Keep `src/pages.json` route order and route paths aligned with the source
  Mini Program route contract during migration.
- Isolate mp-weixin-only APIs in `src/platform/weixin/` wrappers.
- Keep H5 viewer-loop APIs behind `src/api/` modules; pages should call domain
  API helpers instead of embedding `/h5/*` request details.
- Keep intentional migration gaps explicit with `TODO:migration` and a reason.
- Do not expose migrated navigation entries that terminate in an empty
  `TODO:migration` shell; route them to a functional fallback page or keep the
  entry out of the user-facing flow.
- Do not let Mini Program personal-center order, refund, payment, address,
  complaint, prize, or invitation paths prefer legacy v1 transaction endpoints
  such as `user.order/lists`, `user.order/detail`, or `user.order/pay`.
- Pin dependency versions when Vue ecosystem compatibility requires it, such as
  Pinia 2.x with Vue 3.4.x.
- Personal center must render an explicit user information card independently
  of DIY payloads. The primary data source is `/h5/user/center` (`customer`),
  with local legacy userInfo cache only as a display fallback.
- Personal center order badges must use the H5 unread stats APIs first:
  `/h5/order/unreadStats` and `/h5/refund/unreadStats`.
- Personal-center secondary pages for order, payment, receipt, refund, address,
  complaint/report, prize-record, and invitation-record flows must migrate the
  H5 page/component structure and visual behavior as the source of truth. Do not
  substitute newly designed lightweight Mini Program-style pages when an H5
  page exists; only adapt unsupported platform capabilities such as payment,
  address import, upload, routing, and browser-only globals.
- H5 viewer authorization in mp-weixin must use a mini-native auth adapter:
  call `uni.login`/`wx.login`, exchange the Mini Program code through the H5
  auth backend for the H5 viewer `token`/`customer`, write both `h5_token` and
  compatible `token`, cache the H5 customer, and preserve redirect plus live
  context (`roomCode`, `roomId`, `liveId`, `tenantId`, `bindId`).
- When Mini Program has no equivalent for H5 DTE or cross-domain bind iframe
  behavior, keep the boundary explicit: persist the context in Mini Program
  storage and pass it to backend H5 auth APIs instead of adding browser-only
  globals or iframe code.

---

## Testing Requirements

- Run `npm run build:mp-weixin` from `uniapp-src/` after frontend migration work.
- Verify every `src/pages.json` route has a matching `.vue` file.
- Include both top-level `pages` and `subPackages` when checking Mini Program
  route coverage, and fail the check if the same full page path is registered
  in both places.
- Scan `uniapp-src/src` for forbidden compiled-output dependencies and direct
  high-risk WeChat API calls outside `platform/weixin`.
- Real-device or WeChat Developer Tools validation is required for login, phone
  binding, payment, merchant transfer, scan code, map/location, customer
  service, official account, web-view, live-player/live-pusher, TRTC, and IM.

---

## Scenario: H5 Viewer Auth In Mp-Weixin

### 1. Scope / Trigger

- Trigger: viewer-loop pages need the same H5 login semantics inside WeChat
  Mini Program.
- Scope: `uniapp-src/src/api/auth.js`, `src/services/h5-auth*.js`, login page,
  H5 request adapter, and H5 viewer-loop page entry guards.

### 2. Signatures

- `wechatSilentLogin(payload)` -> `POST /h5/auth/wechatSilentLogin`
- `smsLogin(payload)` -> `POST /h5/auth/smsLogin`
- `sendSmsCode(phone, tenantId, context)` -> `POST /h5/auth/sendSmsCode`
- `loginWithMiniProgramWechat(context)` -> `uni.login` code exchange result
- `ensureH5Authenticated(context)` -> `true` or redirects to login

### 3. Contracts

- Request fields: `code`, `tenantId`, `roomCode`, `roomId`, `liveId`,
  `bindId`, `redirect`, `liveType`, `termId`, `videoId`, plus
  `source/sourceClient=mp-weixin`, `platform=miniProgram`,
  `authType=miniProgramCode`.
- Response fields: backend must return a real H5 viewer `token`; it should
  return `customer`/`customerInfo`/`userInfo` when available.
- Storage writes: H5 success writes both `h5_token` and compatible `token`, and
  caches the customer under H5 user cache keys.
- Route handoff writes: viewer-loop page guards must accept route/query token
  aliases such as `wx_token`, `h5_token`, `token`, `accessToken`, and
  `access_token`; call `syncH5AuthSession` before deciding to redirect to login,
  and do not include the token in generated redirect URLs.
- Boundary: Mini Program stores `bindId` locally and passes it to backend auth;
  it does not implement H5 DTE iframe/cookie domain binding.

### 4. Validation & Error Matrix

- `uni.login` returns no `code` -> show login failure; do not write a token.
- `/h5/auth/wechatSilentLogin` rejects or is missing -> show backend exchange
  failure; do not fake success with legacy mini-program tokens.
- Response has `needAuth` but no token -> fail with a Mini Program OAuth
  boundary message; do not start browser OAuth.
- H5 API returns 401/403/expired token -> clear H5 token/customer cache and
  redirect to `/pages/login/login` with the current route as `redirect`.

### 5. Good/Base/Bad Cases

- Good: broadcast link with `roomCode`, `tenantId`, `bindId` redirects to login,
  exchanges Mini Program code, then relaunches back to broadcast with context.
- Good: broadcast link with `wx_token`, `roomCode`, and `tenantId` writes
  `h5_token`/`token` first, preserves tenant/customer hints in auth context, and
  enters the room without a login redirect.
- Base: center/order/address/report page with existing `h5_token` loads without
  repeating login.
- Bad: copying `window.location` OAuth, JSSDK, cookie, `localStorage`,
  `sessionStorage`, or iframe DTE code into `uniapp-src/src`.

### 6. Tests Required

- `npm run build:mp-weixin` passes.
- Static scan finds no H5-only globals/packages in auth/login/viewer-loop
  source.
- Static scan confirms `/h5/auth/wechatSilentLogin`,
  `/h5/auth/smsLogin`, `/h5/auth/sendSmsCode`, and
  `/h5/wechat/authConfig` adapter paths exist.
- Static or focused route-guard check confirms `ensureH5Authenticated(query)`
  syncs route token aliases before calling login redirect code.
- WeChat Developer Tools and real-device validation are still required for the
  actual code exchange and login redirect loop.

### 7. Wrong vs Correct

Wrong:

```js
window.location.replace("https://open.weixin.qq.com/connect/oauth2/authorize...");
```

Correct:

```js
const code = await getMiniProgramWechatCode();
await wechatSilentLogin({ code, sourceClient: "mp-weixin" });
```

## Scenario: Mini Program Live Playback Source Selection

### 1. Scope / Trigger

- Trigger: `pages/broadcast/entry` renders live/replay playback from `/h5/live/detail`
  and `/h5/live/streamInf` in mp-weixin.
- Scope: `src/utils/live-route.js`, `src/pages/broadcast/entry.vue`, and any
  broadcast stage components copied from H5.

### 2. Signatures

- `getMiniProgramLiveCandidates(detail, streamInfo)` -> ordered candidate list.
- `getBestLiveUrl(detail, { streamInfo })` -> first candidate URL.
- `getBestReplayUrl(detail, replayVideo)` -> replay/video URL.

### 3. Contracts

- Current Mini Program appIds do not have `live-player` permission. Broadcast
  live playback in `mp-weixin` must use the `video` component with HLS/m3u8
  sources; do not select RTMP/FLV or initialize `live-player` as a fallback.
- Normal HLS fields (`pullHlsUrl`, `httpHlsUrl`, `m3u8Url`) must stay ahead of
  adaptive HLS fields (`adaptiveHlsUrl`, `liveAdaptiveHlsUrl`) unless adaptive
  HLS is the only viable HLS candidate.
- Live candidates must carry `{ url, type, component }`. RTMP/FLV candidates may
  be parsed for diagnostics or non-mini-program reference paths, but `mp-weixin`
  source selection must ignore them. Replay uses `video`.
- Live candidates from adaptive HLS fields must carry `isAdaptiveHls` so source
  selection and playback debug output can distinguish ABR streams from the
  origin/default HLS stream.
- `/h5/live/streamInf` is not just a fallback for missing detail URLs. Fetch it
  for live rooms when `roomCode` exists so detail data missing HLS cannot mask a
  usable HLS source from stream info.

### 4. Validation & Error Matrix

- HLS `video` failure -> switch to the next HLS/video candidate when available.
- Candidate list exhausted -> show a user-visible playback failure state.
- No HLS/video live candidates -> show a user-visible "no playable line" state;
  do not fall back to RTMP/FLV in `mp-weixin`.
- Replay `video` error -> show replay failure state; do not try live sources.

### 5. Good/Base/Bad Cases

- Good: detail has HLS and adaptive HLS -> selected URL is normal HLS, backup is
  adaptive HLS.
- Base: stream info has HLS and detail only has FLV/RTMP -> selected URL is the
  stream-info HLS source.
- Bad: selecting `pullRtmpUrl`/`pullFlvUrl`, initializing `live-player`, or
  retrying a live-player-only candidate in `mp-weixin`.

### 6. Tests Required

- `npm run build:mp-weixin` passes from `uniapp-src/`.
- Static scan of broadcast source and `src/utils/live-route.js` finds no H5
  browser globals/packages.
- Focused HLS sanity check confirms normal HLS sorts before adaptive HLS, with
  adaptive HLS used only when no normal HLS source exists.
- Focused no-HLS check confirms RTMP/FLV-only live payloads do not initialize
  playback in `mp-weixin`.
- WeChat Developer Tools and real-device validation remain required for actual
  Mini Program video playback.

### 7. Wrong vs Correct

Wrong:

```js
return detail.pullRtmpUrl || detail.pullFlvUrl || "";
```

Correct:

```js
const candidates = getMiniProgramLiveCandidates(detail, streamInfo);
return selectMiniProgramLiveCandidate(candidates, { preferHls: true })?.url || "";
```

## Scenario: Broadcast Live Easemob IM Channel

### 1. Scope / Trigger

- Trigger: `pages/broadcast/entry` sends and receives live-room chat for
  `groupType=0` rooms in mp-weixin.
- Scope: `src/pages/broadcast/composables/useMessageChannel.js`,
  `useIMChannel.js`, live comment composables, and the IM debug surface.

### 2. Signatures

- `useMessageChannel({ roomGroupType, liveId, ... })` chooses the active
  message transport.
- `useIMChannel({ liveId, loadCommentHistory, handleWsMessage, onOpen })`
  connects to Easemob by using `easemob-websdk/uniApp/Easemob-chat`.
- `getImToken(liveId)` returns Easemob `appKey`, `imUsername`, `imToken`, and
  chatroom ids.
- `getLiveSocket().sendChat(content, data, options)` sends chat through the
  active transport.

### 3. Contracts

- `groupType=0` live rooms use Easemob IM only. Do not start the backend live
  websocket as a parallel upstream channel, and do not fall back to it when IM
  init fails.
- `groupType=1` replay rooms keep using the backend websocket for timeline
  comments.
- The Easemob SDK entry for uni-app is
  `easemob-websdk/uniApp/Easemob-chat`; assign it to `uni.WebIM` before using
  the SDK in mp-weixin.
- Open the SDK with `{ user: imUsername, accessToken: imToken }`, then
  `joinChatRoom({ roomId, leaveOtherRooms: false })`.
- Repeated init for the same `liveId` while connecting or already open must
  reuse the current connection. Closing a same-room connection causes the
  network panel to show `[3000, "normal closed"]` and loses the chat path.
- Client-initiated closes must be marked in debug state with
  `expectedClose=true` and `closeRequestedBy`, so normal lifecycle cleanup can
  be separated from SDK/server disconnects.

### 4. Validation & Error Matrix

- IM token missing `appKey`, user, or token -> report IM init failure; do not
  start backend websocket fallback for `groupType=0`.
- IM open/join fails -> keep the IM channel selected and expose the error in
  debug state; do not silently switch to backend websocket.
- Same live room init repeats while pending/open -> return the existing init
  result; do not call `conn.close()`.
- Different live room init -> leave chatrooms, close the stale SDK connection,
  and mark the close as expected.
- SDK disconnect event with `[3000, "normal closed"]` and no matching expected
  close marker -> treat as a real investigation target.

### 5. Good/Base/Bad Cases

- Good: live room gets IM token, opens Easemob, joins the chatroom, and
  `sendChat` sends a custom IM message.
- Base: replay room keeps the old websocket behavior.
- Bad: live room starts both IM and backend websocket, sends chat through the
  backend websocket, or falls back to backend websocket after IM failure.

### 6. Tests Required

- `npm run build:mp-weixin` passes from `uniapp-src/`.
- Focused tests assert `groupType=0` initializes only IM, keeps IM selected on
  IM failure, and suppresses fallback enter on the IM path.
- Focused tests assert same-liveId IM init reuses pending/open SDK connections
  without closing them.
- Real-device or WeChat Developer Tools validation remains required for the
  actual Easemob websocket lifecycle.

### 7. Wrong vs Correct

Wrong:

```js
await imChannel.initWebSocket(wsUrl);
await wsChannel.initWebSocket(wsUrl);
return wsChannel.getLiveSocket().sendChat(text);
```

Correct:

```js
await imChannel.initWebSocket();
return imChannel.getLiveSocket().sendChat(text);
```

---

## Code Review Checklist

- Build passes for `mp-weixin`.
- Route count and route order match the expected Mini Program contract.
- No source file depends on compiled output.
- WeChat-only behavior is behind platform wrappers.
- `TODO:migration` entries are intentional and documented, not silent feature
  loss.
