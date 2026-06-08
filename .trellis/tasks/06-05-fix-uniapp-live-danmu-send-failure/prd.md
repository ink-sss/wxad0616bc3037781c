# fix: uniapp live danmu send failure

## Goal

Fix the `pages/broadcast/entry` danmu send failure in mp-weixin live rooms where Easemob IM is already open and joined, but the backend live websocket is still connecting.

## What I Already Know

- User debug sample was generated on 2026-06-05 from `pages/broadcast/entry` with `roomCode=miufct6sqaqh`, `tenantId=15`, `liveId=235`, and `groupType=0`.
- The message channel is in dual mode: `active=im+ws`, IM state is `open`, both main/sub chatrooms are joined, and IM sent `enter` successfully.
- The same sample shows `wsState=connecting`, which means the backend live websocket exists but is not ready for `sendChat`.
- Current `useMessageChannel.getLiveSocket()` returns the backend websocket in dual mode without checking whether it is open.
- `MiniLiveSocket.sendRaw()` and `send()` return `false` immediately when `open=false`.
- `useLiveComments.sendMessage()` retries briefly, but it retries the same not-open websocket and still fails if the websocket has not opened in that window.

## Assumptions

- H5 parity still prefers backend websocket for live chat upstream once it is open.
- When the backend websocket is not open but IM is ready, using the IM chat adapter is a valid short-window fallback because the IM adapter already sends custom `chat` payloads and the room is joined.
- Root legacy Mini Program files under `pages/` are out of scope for this task.

## Requirements

- Keep `groupType=0` live rooms in dual channel mode when both IM and backend websocket initialize.
- Prefer backend websocket for `sendChat` when the websocket is open.
- Fall back to the IM adapter for `sendChat` while the backend websocket is still connecting/reconnecting/closed but IM is open.
- Expose the current dual-mode send channel in debug state so future pasted diagnostics show whether sending is using `ws` or `im`.
- Keep replay `groupType=1` behavior on pure backend websocket unchanged.

## Acceptance Criteria

- [ ] Focused message-channel tests cover dual mode returning websocket when open.
- [ ] Focused message-channel tests cover dual mode returning IM when websocket is connecting.
- [ ] Focused message-channel tests cover debug send-channel state.
- [ ] Existing mini live chat payload tests still pass.
- [ ] `npm run build:mp-weixin` passes or any failure is documented.

## Out of Scope

- Changing root legacy Mini Program source.
- Reworking the Easemob credential flow.
- Replacing the backend websocket protocol.
- Changing live comment UI behavior or optimistic-message rendering.

## Technical Notes

- Relevant spec: `.trellis/spec/frontend/quality-guidelines.md`, Scenario: Broadcast Live Easemob IM Channel.
- Relevant code: `uniapp-src/src/pages/broadcast/composables/useMessageChannel.js`, `useLiveWebSocket.js`, `useIMChannel.js`, `useLiveComments.js`, and `uniapp-src/src/utils/mini-live-socket.js`.
