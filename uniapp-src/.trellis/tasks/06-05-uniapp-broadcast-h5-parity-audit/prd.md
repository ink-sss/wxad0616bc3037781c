# brainstorm: align uniapp broadcast with h5 live interactions

## Goal

Audit `uniapp-src` broadcast live room against `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/` and adjust remaining old Mini Program / fallback logic so the uni-app broadcast room copies H5 live-room interaction, channel, and API behavior as closely as Mini Program constraints allow.

## What I Already Know

* User expects "完全复制粘贴 h5 的直播间交互等".
* Previous bug showed `uniapp-src` broadcast chat fell back to WebSocket while H5 sends live-room chat through the third-party Easemob IM chatroom.
* `uniapp-src` is the target source tree. Root Mini Program source is only a behavior reference unless explicitly requested.
* H5 broadcast source lives at `/Users/apple/Desktop/code/live_h5/src/pages/broadcast/`.
* Mini Program platform differences must be adapted, not copied blindly: no H5-only `window`/`document`/browser OAuth/player APIs.

## Assumptions

* "Old version logic" means logic copied from root legacy Mini Program or temporary fallback stubs that diverge from H5 broadcast behavior.
* Highest priority is runtime behavior parity in broadcast entry, especially chat/IM, products, marketing popups, playback, input, share, likes, enter/leave, and user-visible states.
* H5 is the source of truth unless Mini Program capability requires an adapter.

## Open Questions

* None blocking yet. The first pass can be derived from code comparison.

## Requirements

* Compare current `uniapp-src/src/pages/broadcast/` with H5 broadcast implementation and identify old/fallback logic.
* Prioritize fixing user-visible or business-critical divergences over cosmetic-only differences.
* Preserve uni-app/mp-weixin compatibility while copying H5 behavior.
* Keep changes scoped to `uniapp-src` source/tests/package metadata unless a dependency is required.
* Add/update focused tests for fixed divergences.

## Acceptance Criteria

* [ ] Produce a concrete list of remaining H5-parity divergences found in broadcast code.
* [ ] Fix high-impact divergences that are safe to address in this task.
* [ ] Explain any divergences intentionally left due to Mini Program platform constraints.
* [ ] Relevant tests pass.
* [ ] `npm run build:mp-weixin` passes.

## Definition of Done

* Tests added/updated where appropriate.
* `npm run build:mp-weixin` passes or any failure is explained as unrelated/pre-existing.
* No hand edits to `uniapp-src/dist/`.
* No default edits to root legacy Mini Program source or external H5 source.

## Out of Scope

* Rewriting root legacy Mini Program source.
* Editing `/Users/apple/Desktop/code/live_h5/`.
* Browser-only H5 OAuth/player mechanics that cannot run in mp-weixin.

## Technical Notes

* Existing task-specific change already added `easemob-websdk@4.21.1` and an Easemob `useIMChannel` for broadcast.
* Relevant specs: `.trellis/spec/frontend/index.md`, `.trellis/spec/frontend/quality-guidelines.md`.
* 2026-06-05: 环信 IM 初始化不能被后端业务 WS URL 闸门拦住。`buildWsUrl()` 依赖本地 token；当 token 为空时仍应初始化直播间 IM，否则网络面板不会出现环信 `wss://im-api-wechat.easemob.com/websocket`。
* 2026-06-05: 按环信 uni-app 文档重新接入：小程序端必须使用 `easemob-websdk/uniApp/Easemob-chat`，并设置 `uni.WebIM = EC`、`useOwnUploadFun: true`、`isHttpDNS: false`、`isAutoLogin: false`。不要再用 Web SDK 根入口或手写 `_getSock` patch。
