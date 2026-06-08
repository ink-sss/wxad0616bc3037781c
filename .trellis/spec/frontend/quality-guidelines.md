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
- Mini Program plugin components used by uni-app pages must be declared in both
  `src/pages.json` `plugins` and the consuming page's `style.usingComponents`.
  A normal `<button>` that calls local login code is not a substitute for
  rendering the plugin component, because it cannot invoke plugin UI or emit
  plugin events such as `loginSuccess`.
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

## Scenario: Mini Program Developer Tools Login Payload

### 1. Scope / Trigger

- Trigger: the login page's "开发者工具登录" shortcut needs to reuse a stable
  local Mini Program session for WeChat Developer Tools validation.
- Scope: `src/pages/login/page-tools.js`.

### 2. Signatures

- `loginWithWechatDevtoolsProfile()` -> local session object ->
  `saveLoginSession(session)`.

### 3. Contracts

- Developer-tools login must not call `uni.login`/`wx.login` or
  `/h5/miniprogram/login`.
- Developer-tools login returns the local reused session fields:
  `token`, `user_id=874`, `open_id`, `im_user_id="customer_874"`,
  `im_user_sig`, `shop_supplier_id=15`, and `msg="登录成功"`.
- The local session still passes through the normal H5 auth sync and
  mini-program session persistence path.

### 4. Validation & Error Matrix

- Local fixture missing `token` -> keep throwing `登录接口未返回 token`.
- Reused token expires on later H5 API calls -> existing auth failure handling
  must clear/redirect; do not add a second developer login network exchange.
- Plugin login success -> continue using the real Mini Program login code path.

### 5. Good/Base/Bad Cases

- Good: developer button persists the local reused session without any login
  API request.
- Base: plugin login still resolves a real login code and posts user profile
  fields from the plugin event.
- Bad: developer button calls `loginCode()` or `loginMiniProgram()` before
  persisting the reused session.

### 6. Tests Required

- Focused unit test asserts developer login does not call the WeChat login
  wrapper or mini-program login API wrapper.
- Focused unit test asserts token, `user_id`, `open_id`, IM credentials, and
  `shop_supplier_id` are passed through the normal persistence path.
- `npm run build:mp-weixin` passes from `uniapp-src/`.

### 7. Wrong vs Correct

Wrong:

```js
return loginMiniProgram({ code, nickName, avatarUrl });
```

Correct:

```js
const session = { token: DEVTOOLS_TOKEN, user_id: 874, shop_supplier_id: 15 };
saveLoginSession(session);
return Promise.resolve(session);
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
- Secondary-page live mini-window state must obey the same mp-weixin playback
  boundary: persist a `video`-compatible live URL as `playUrl` and keep
  RTMP/FLV only as diagnostics/backups. If the active room source is
  `live-player`-only, reuse the last cached HLS/video source or refetch detail
  plus stream info instead of rendering a visible empty mini-window.
- Secondary-page live mini-window overlays must be conditional on playback
  source/frame state. Do not render a generic `v-else` empty layer after the
  `video` node, because it can cover a valid native video when poster state
  changes before a frame is confirmed.
- In `mp-weixin`, tap controls layered over a native `video` mini-window must be
  `cover-view` overlays. Plain `view` overlays are not reliable for native-video
  click/close/return interactions.
- In `mp-weixin`, broadcast live-room first entry preserves the existing H5
  parity path: keep `isMuted=false` and immediately issue native sound playback
  commands. If the platform blocks that attempt, use the playback fallback/debug
  path rather than pre-muting the main room. Secondary-page mini-window playback
  may still autoplay muted and restore sound when returning to the room.
- In `mp-weixin`, do not call native websocket or Easemob SDK `close()` before
  the connection has reached an opened state. Closing a connecting or stale task
  can surface as `closeSocket:fail task not found` from the WeChat SDK.
- After creating the native HLS `video` node, replay the native sound/play
  command on short timers until a frame is ready. A single play command in the
  same tick as node creation can be too early and leave the poster visible.
- Returning from a secondary-page live mini-window to an active live room must
  recreate the live HLS player at the live edge instead of resuming the stale
  paused page video node and waiting for it to drift back into sync.

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
- Base: live page is playing a non-video source but cached mini-window state has
  `backupHlsUrl` -> secondary page mini-window promotes `backupHlsUrl` to
  `playUrl`.
- Bad: selecting `pullRtmpUrl`/`pullFlvUrl`, initializing `live-player`, or
  retrying a live-player-only candidate in `mp-weixin`.
- Bad: secondary page mini-window shows a black "直播间" shell with
  `hasPlayableSource=false` because cached `playUrl` was RTMP/FLV.
- Bad: secondary page mini-window has `hasPlayableSource=true` and receives
  `video_play`, but a fallback empty layer still covers the video because the
  empty state was implemented as an unconditional `v-else`.
- Bad: live room auto-entry starts muted or waits for a tap while a playable HLS
  source exists, leaving first entry stuck on the poster.

### 6. Tests Required

- `npm run build:mp-weixin` passes from `uniapp-src/`.
- Static scan of broadcast source and `src/utils/live-route.js` finds no H5
  browser globals/packages.
- Focused HLS sanity check confirms normal HLS sorts before adaptive HLS, with
  adaptive HLS used only when no normal HLS source exists.
- Focused no-HLS check confirms RTMP/FLV-only live payloads do not initialize
  playback in `mp-weixin`.
- Focused mini-window state check confirms broadcast leave-state persistence
  writes only video-compatible `playUrl`, promotes `backupHlsUrl` when needed,
  and does not treat RTMP/FLV cache as playable on secondary pages.
- Focused mini-window component check confirms empty/poster overlays are not
  unconditional fallbacks and `mp-weixin` controls over native video use
  `cover-view`.
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
  backend websocket when the live room is in H5-style dual mode.

### 3. Contracts

- `groupType=0` live rooms follow the H5 dual-channel contract: Easemob IM
  receives IM/chatroom events, while the backend live websocket remains the
  upstream channel for `sendChat`/`sendEnter` business messages.
- Backend websocket init success only means the socket was created and started
  connecting. In dual mode, prefer backend websocket for `sendChat` only after
  its state is `open`; while it is `connecting`/`reconnecting` and IM is open,
  return the IM send adapter so user danmu is not dropped during the connection
  window. Expose this as `channelDebugState.sendChannel`.
- If Easemob IM init returns `false`, fall back to the backend websocket only.
  This is H5 parity, not an extra compatibility path.
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

- IM token missing `appKey`, user, or token -> report IM init failure, then
  initialize backend websocket as the H5 fallback path.
- IM open/join fails -> expose the error in debug state, then fall back to
  backend websocket for live chat upstream.
- Same live room init repeats while pending/open -> return the existing init
  result; do not call `conn.close()`.
- Different live room init -> leave chatrooms, close the stale SDK connection,
  and mark the close as expected.
- SDK disconnect event with `[3000, "normal closed"]` and no matching expected
  close marker -> treat as a real investigation target.

### 5. Good/Base/Bad Cases

- Good: live room gets IM token, opens Easemob, joins the chatroom, also opens
  the backend websocket, and `sendChat` goes through the backend websocket.
- Good: if the backend websocket is still `connecting` after IM joined,
  `sendChat` temporarily uses the IM adapter and debug state reports
  `sendChannel=im`; once websocket state is `open`, debug reports
  `sendChannel=ws`.
- Base: replay room keeps the old websocket behavior.
- Bad: live room opens only Easemob IM and leaves the backend websocket idle,
  causing the H5 upstream chat path to disappear.
- Bad: dual-mode `getLiveSocket()` returns a backend websocket object that is
  still `connecting`, causing `MiniLiveSocket.sendRaw()` to return `false`
  immediately and the visible danmu send to fail.

### 6. Tests Required

- `npm run build:mp-weixin` passes from `uniapp-src/`.
- Focused tests assert `groupType=0` initializes both IM and backend websocket,
  returns the websocket from `getLiveSocket()` when it is open, returns the IM
  adapter while the websocket is still connecting, falls back to websocket when
  IM init fails, and sends fallback enter through IM in dual mode.
- Focused tests assert same-liveId IM init reuses pending/open SDK connections
  without closing them.
- Real-device or WeChat Developer Tools validation remains required for the
  actual Easemob websocket lifecycle.

### 7. Wrong vs Correct

Wrong:

```js
await imChannel.initWebSocket();
return imChannel.getLiveSocket().sendChat(text);
```

Correct:

```js
await imChannel.initWebSocket(wsUrl);
await wsChannel.initWebSocket(wsUrl);
return wsChannel.getLiveSocket().sendChat(text);
```

## Scenario: Mini Program Live WebSocket Enter Send Parity

### 1. Scope / Trigger

- Trigger: `pages/broadcast/entry` opens the backend live websocket
  `/h5/live/ws` in mp-weixin and must actively announce viewer entry.
- Scope: `src/pages/broadcast/composables/useLiveWebSocket.js`,
  `src/utils/mini-live-socket.js`, and `src/utils/ws-envelope.js`.

### 2. Signatures

- `useLiveWebSocket(...).initWebSocket(wsUrl)` opens the backend websocket and
  creates `MiniLiveSocket` with `sendEnterOnOpen: true`.
- `MiniLiveSocket.sendEnter()` sends the active enter payload.
- `MiniLiveSocket.sendOpenEnter()` schedules the active enter send after the
  socket `onOpen` event.
- `wrapMessage(payload, signKey)` signs websocket payloads as
  `{ v, ts, nonce, payload, sig, enc: false }` when a sign key exists.

### 3. Contracts

- The active enter payload must match the H5 websocket contract exactly:
  `{ type: 3, msgId: string }`.
- Do not inject `roomId`, `liveId`, room context, audience/user fields, or
  nested `data` into the enter payload. The room is already represented by the
  websocket URL query and auth token.
- When a sign key exists, only the H5-compatible enter payload belongs inside
  `envelope.payload`; the envelope itself may include `v`, `ts`, `nonce`,
  `sig`, and `enc`.
- `msgId` is generated client-side for enter messages before wrapping.
- The socket schedules enter internally after `onOpen`, before delegating to
  external page-level `onOpen` callbacks. Do not rely on page callbacks to
  perform the active enter send.
- If the first enter send fails, retry once with the same `msgId` so backend
  de-duplication can treat both attempts as one logical enter event.

### 4. Validation & Error Matrix

- Websocket not open -> `sendEnter()` returns `false`; do not fake a local enter
  message.
- Sign key missing -> send the same plain JSON payload without an envelope.
- Sign key present -> send the envelope and keep `payload` limited to `type` and
  `msgId`.
- First send fail after `onOpen` -> retry once with the same `msgId`; if retry
  also fails, log the failure instead of synthesizing a local enter.

### 5. Good/Base/Bad Cases

- Good: websocket open sends `{"type":3,"msgId":"..."}` or an envelope whose
  payload is exactly that object.
- Base: chat/replay chat still use the existing H5-compatible chat payload path.
- Bad: enter sends room, term, tenant, customer, avatar, or nested `data` fields
  and diverges from H5 backend behavior.

### 6. Tests Required

- Focused tests assert plain `sendEnter()` payload keys are exactly `type` and
  `msgId`.
- Focused tests assert signed `sendEnter()` envelope payload keys are exactly
  `type` and `msgId`.
- Focused tests assert `MiniLiveSocket` actively sends enter after websocket
  `onOpen`, and retries once with the same `msgId` after an initial send
  failure.
- `npm run build:mp-weixin` passes from `uniapp-src/`.

### 7. Wrong vs Correct

Wrong:

```js
return this.send({
  type: TYPE.ENTER,
  roomId: this.liveId,
  data: this.getAudiencePayload(),
});
```

Correct:

```js
return this.sendRaw({
  type: TYPE.ENTER,
  msgId: Math.random().toString(36).slice(2, 10),
});
```

---

## Mini Program Production Package Hygiene

- Production `mp-weixin` builds must force debug-only SDKs such as PageSpy to a
  stub module at build time. Runtime-only flags are not enough: if the real SDK
  import remains statically reachable, it can still enter `common/vendor.js` and
  inflate the main package.
- Uni-app `dev:mp-weixin` watch builds may still report Vite
  `command === "build"`. Do not use Vite `command` alone to disable debug SDKs;
  use the npm lifecycle script or another explicit release-build signal.
- WXSS minification must preserve CSS-required whitespace inside `calc()`
  arithmetic, for example `calc(190rpx + env(safe-area-inset-bottom))`.
  Removing spaces around `+` or binary `-` can invalidate layout-critical
  positioning in WeChat Developer Tools.
- After package-size work, inspect `dist/build/mp-weixin/common/vendor.js` for
  debug SDK names and measure the main package from `app.json` while excluding
  subpackage roots.

---

## Code Review Checklist

- Build passes for `mp-weixin`.
- Route count and route order match the expected Mini Program contract.
- No source file depends on compiled output.
- WeChat-only behavior is behind platform wrappers.
- `TODO:migration` entries are intentional and documented, not silent feature
  loss.
