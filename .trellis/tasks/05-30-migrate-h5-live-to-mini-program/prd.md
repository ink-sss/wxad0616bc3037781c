# Migrate H5 Live Viewer Loop To Mini Program

## Goal

Fully migrate the H5 viewer-side live commerce loop into `uniapp-src/` for
WeChat Mini Program. Success means a viewer can enter live/replay, interact,
buy, pay, manage orders/refunds/addresses/complaints, review prizes/invitations,
and return to live without landing on migration placeholders.

The target is not just “main live page compiles.” The viewer closed loop must be
usable after WeChat Developer Tools and real-device validation.

## Scope

Included viewer-side flows:

- Live and replay viewing.
- Personal center entries for viewer modules.
- Product shelf, current teaching product, product detail entry, order confirm,
  order creation, payment, payment result, order list, and order detail.
- Refund apply, refund list, refund detail, refund cancel, and return logistics.
- Address list, add, edit, set default, delete, and WeChat address import.
- Complaint submit, complaint images, complaint list/detail.
- Prize records, invitation records, live sign-in, normal lottery, comment
  lottery, watch rewards, share, and return-to-live.

Excluded flows:

- Anchor pushing, live management, merchant backend, agent backend,
  `massHelper`, and enterprise WeChat sidebar features.
- Old paths for excluded flows should remain compile-safe and may thinly
  redirect or show a clear unavailable state, but they are not part of the
  migrated viewer loop.

## Requirements

1. Keep business-code implementation under `uniapp-src/`. Trellis task/spec
   updates may be under `.trellis/`.
2. Add/maintain H5 viewer API modules for `live`, `marketing`, `order`, `pay`,
   `refund`, `address`, and `complaint`. The request layer must reuse the
   current mini-program token and remain compatible with a later H5 JWT switch.
3. `pages/broadcast/entry` and `pages/broadcast/replay` must use mini-program
   native `live-player`/`video`. They must not use browser DOM globals,
   `hls.js`, `flv.js`, `weixin-js-sdk`, or browser Agora runtime.
4. Live/replay must cover lightweight stream lookup, first replay video, replay
   progress reporting, replay simulated messages, comments, likes, current
   teaching product, product shelf, buy reminders, sign-in, normal lottery,
   comment lottery, watch rewards, complaint, share, and return-to-live.
5. WebSocket adapter must unpack H5 envelopes, normalize events, reconnect,
   ping, track online count, and handle product/status/activity events. If
   `/h5/live/wsSignKey` returns `signKey`, Mini Program signing must avoid
   browser crypto; if a runtime cannot perform a signed path, the downgrade must
   be explicit in code comments.
6. Viewer transaction pages must use `/h5/order/*`, `/h5/pay/*`, and
   `uni.requestPayment` through the platform wrapper. H5 Yeepay/browser redirect
   payment is not acceptable for the mini-program viewer loop.
7. Address management must be real mini-program pages using `/h5/address/*`.
   WeChat address import must use `uni.chooseAddress` through a platform wrapper.
8. Complaint and refund image upload must not use H5 `fetch`,
   `XMLHttpRequest`, or Blob reads. Use mini-program-native upload/presigned PUT
   adapters.
9. Register and verify viewer-loop routes:
   - `/pages/broadcast/entry`
   - `/pages/broadcast/replay`
   - `/pages/center/index`
   - `/pages/order/confirm`
   - `/pages/order/list`
   - `/pages/order/detail`
   - `/pages/order/pay`
   - `/pages/order/receipt`
   - `/pages/order/refund*`
   - `/pages/address/*`
   - `/pages/report/*`
   - `/pages/prize-record/index`
   - `/pages/invitation-record/index`
   - old `/pages/live/live-vertical` and `/pages/live/live-horizontal` as thin
     redirects.
10. Personal-center secondary pages must preserve the H5 implementation as the
    visual and interaction source of truth. Order, payment, receipt, refund,
    address, complaint/report, prize-record, and invitation-record pages should
    migrate H5 templates, class names, layout rhythm, colors, cards, lists,
    empty states, popups, filters, and bottom actions directly into
    `uniapp-src/`. Re-designed lightweight Mini Program-style pages do not
    satisfy this task unless the H5 page has no corresponding source and the
    fallback is explicitly scoped.
11. H5 WeChat authorization semantics must be synchronized through a
    mini-program-native adapter. Mini Program pages must use `uni.login` /
    `wx.login` to obtain a Mini Program code, exchange it with the backend for
    the same H5 viewer `token`/`customer`, persist both `h5_token` and legacy
    `token`, and preserve redirect/live context (`roomCode`, `roomId`,
    `liveId`, `tenantId`, `bindId`). Browser OAuth URLs, `window.location`,
    JSSDK, cookies, `localStorage`/`sessionStorage`, and DTE/bind iframe flows
    must not be copied into Mini Program source. `bindId` has no Mini Program
    cross-domain iframe equivalent; the Mini Program boundary is local storage
    plus backend auth payload support.

## Acceptance Criteria

- `npm run build:mp-weixin` passes from `uniapp-src/`.
- Static scan of viewer-loop source finds no unguarded `window`, `document`,
  `localStorage`, `sessionStorage`, or `navigator`, and no `hls.js`, `flv.js`,
  `weixin-js-sdk`, `@dcloudio/uni-h5`, or browser Agora DOM dependency.
- Registered viewer-loop routes have matching `.vue` source files.
- New/live/personal-center viewer-loop entries do not terminate in
  `TODO:migration` empty-shell pages.
- Personal center must render a user information area directly from
  `/h5/user/center` (`customer`) first, with local legacy mini-program userInfo
  cache only as a display fallback; the user card must not depend on DIY page
  payloads being returned.
- Personal center order badges must prefer `/h5/order/unreadStats` and
  `/h5/refund/unreadStats`; legacy `user.index/center.orderCount` must not be
  the primary stats source.
- Personal-center secondary pages for orders, payment result/receipt, refunds,
  addresses, complaints, prize records, and invitation records must use the H5
  API modules as their primary path. They must not route users into v1
  `user.order/*` transaction calls or empty shell pages from personal-center
  navigation.
- Personal-center secondary pages must match the H5 page structure and visual
  behavior closely. A compile-safe but visually redesigned lightweight page is
  not accepted as complete for this migration.
- Mini Program login and H5 401 handling route through the native H5 auth
  adapter and preserve H5 redirect semantics for broadcast, center, order,
  refund, address, prize, invitation, and complaint/report pages.
- Payment code uses mini-program payment APIs, not H5 browser payment redirects.
- Real usability is not accepted until WeChat Developer Tools plus real-device
  validation covers live-player playback, replay playback/progress, WebSocket
  events/reconnect, payment, image upload, address import, share, and navigation
  back to live.

## Manual Validation Required

This coding session can build and statically scan the mini-program source, but
it cannot claim real-device success unless the workflow is actually run in
WeChat Developer Tools and on a physical WeChat device.
