# H5 Live Debug Entry Parity

## Goal

Make `uniapp-src` Mini Program live-room entry follow the H5 bootstrap behavior for local debugging:

`/pages/broadcast/entry?roomCode=...&tenantId=...&liveType=...&_tc=...&wx_token=...`

## Source Of Truth

- `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/composables/useLiveEntryBootstrap.js`
- `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/utils/entry-init.js`

## Constraints

- Port the H5 startup order, replacing only Mini Program platform boundaries.
- Do not hardcode user, room, or JWT defaults in source.
- Keep live detail and customer identity sourced from backend/runtime auth, not frontend constants.
- H5-only browser branches such as `window`, cookies, domain guard, DTE, and history cleanup are not copied into Mini Program code.

## Acceptance

- `wx_token` from launch options writes both `h5_token` and `token`.
- Route/live context keeps `roomCode`, `tenantId`, `liveId`, `_tc`, `liveType`, and cover fields.
- `scene` can carry equivalent live entry params.
- `bindId` with `wx_token` keeps both bind context and token.
- Missing token still redirects to login with the original broadcast query.
- `debugLive=1` can read local storage debug config but has no embedded JWT fallback.
- Build output contains no old hardcoded JWT.
