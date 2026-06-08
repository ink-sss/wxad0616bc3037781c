# fix uniapp live ws active send parity

## Goal

Make the uni-app Mini Program live WebSocket actively send the same enter message as the H5 live room after `wss://man.lqjy.cc/api/h5/live/ws` opens.

## What I already know

* The requested H5 interaction sends a signed envelope whose payload is `{ "type": 3, "msgId": "<id>" }`.
* H5 `useLiveWebSocket` calls `liveSocket.sendEnter()` in `onOpen`.
* H5 `LiveSocket.sendEnter()` delegates to `_send({ type: 3 })`; `_send` injects only `msgId` before `wrapMessage`.
* uni-app `useLiveWebSocket` already calls `liveSocket.sendEnter()` in `onOpen`.
* uni-app `MiniLiveSocket.sendEnter()` currently injects room, context, audience, and nested `data`, so it does not fully copy H5 payload shape.
* `uniapp-src/src/utils/ws-envelope.js` already wraps Mini Program messages as `{ v, ts, nonce, payload, sig, enc: false }` when a sign key exists.

## Assumptions

* The backend expects the active enter send to match H5 payload shape exactly, not a richer Mini Program payload.
* Chat/replay chat behavior should remain unchanged.

## Requirements

* Keep the existing active send timing: call `sendEnter()` after the backend WebSocket opens.
* Change Mini Program `sendEnter()` to send only `{ type: 3, msgId }` through the existing signed envelope path.
* Preserve H5-style `msgId` generation and allow the envelope helper to sign with the socket sign key.
* Add a focused test proving `sendEnter()` payload matches H5 plain shape.
* Add a focused test proving signed `sendEnter()` wraps that exact payload in the WebSocket envelope.

## Acceptance Criteria

* [ ] `MiniLiveSocket.sendEnter()` sends a payload with only `type` and `msgId` before envelope wrapping.
* [ ] Signed `sendEnter()` output has `v: 1`, `enc: false`, `payload.type: 3`, and no injected room/user/data fields in `payload`.
* [ ] Existing chat send tests still pass.

## Out of Scope

* Do not change the root legacy Mini Program source.
* Do not modify H5 source under `/Users/apple/Desktop/code/live_h5`.
* Do not redesign IM dual-channel behavior.

## Technical Notes

* H5 reference: `/Users/apple/Desktop/code/live_h5/src/utils/websocket.js`.
* H5 envelope reference: `/Users/apple/Desktop/code/live_h5/src/utils/ws-envelope.js`.
* Uni-app target: `uniapp-src/src/utils/mini-live-socket.js`.
* Focused tests: `uniapp-src/tests/live-chat-send.test.mjs`.
