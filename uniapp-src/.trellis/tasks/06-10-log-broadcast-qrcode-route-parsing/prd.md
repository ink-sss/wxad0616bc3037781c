# Log Broadcast QR Route Parsing

## Goal

Add clearly identifiable console logs for the broadcast entry Mini Program QR-code launch flow so the raw QR parameters and the parsed route result can be checked in WeChat Developer Tools.

## What I already know

- The QR page path in question is `pages/broadcast/entry`.
- `entry.vue` registers `useLiveLoadBootstrapRegistration`.
- `useLiveLoadBootstrap.js` receives page `onLoad(options)` and passes the options into `runLiveEntryBootstrap`.
- `runLiveEntryBootstrap` calls `normalizeLiveRouteOptions`, which parses `scene` through `parseScene`.
- Existing short-link code mostly passes `shortLink` through WeChat navigation APIs; there is no separate short-link resolver in `uniapp-src/src`.

## Requirements

- Log the raw QR/page `onLoad` parameters for `pages/broadcast/entry`.
- Log the decoded and parsed `scene` value when present.
- Log the final normalized route options after `normalizeLiveRouteOptions`.
- Map short QR scene fields: `sc` to `roomCode`/`shareCode`, and `lt` to `liveType`.
- Use a stable, explicit log prefix so the output is easy to filter.
- Do not change navigation, login, or live-room initialization behavior.

## Acceptance Criteria

- [ ] WeChat Developer Tools console shows logs prefixed with `[BroadcastQrRouteDebug]`.
- [ ] Logs include raw options, decoded/parsed scene data, and normalized route options.
- [ ] QR scenes using `sc` and `lt` enter the broadcast room with normalized `roomCode` and `liveType`.
- [ ] Existing broadcast entry flow still calls `ctx.initLive(options)` with the normalized options.

## Out of Scope

- Implementing a new short-link resolver.
- Changing QR-code generation.
- Changing login or live-room initialization behavior.

## Technical Notes

- Target file: `uniapp-src/src/pages/broadcast/composables/useLiveEntryBootstrap.js`.
- Parser source: `uniapp-src/src/utils/live-route.js`.
