# fix: uniapp live player no permission fallback

## Goal

修复 `uniapp-src` 微信小程序直播间在当前 appId 下选择 `live-player + rtmp` 后报 `operateLivePlayer:fail no permission`，导致直播无法播放的问题。当前小程序都没有 `live-player` 权限，目标是统一使用 `<video>` 播放 HLS，不再考虑 `live-player` 组件或 RTMP/FLV 兜底。

## What I already know

* 用户报错来自微信基础库 3.16.0：`operateLivePlayer:fail no permission, appId=wx3bf933f8a2018d8d`。
* 调试信息显示当前直播源实际选择为 `live-player`，`sourceType=rtmp`，播放 URL 为 `rtmp://hls.yaakoo123.cn/live/room_235?...`。
* 同一调试报告里存在可用 HLS 候选：`pullHlsUrl` 与 `adaptiveHlsUrl`，其组件应为 `video`。
* 当前未提交改动把 `isIOSRuntime()` / `isWeChatDevtoolsRuntime()` 的 HLS 优先保护改成固定 `false`，并让状态轮询从 HLS 切回 `live-player`。
* 用户已明确：目前小程序都没权限，所以小程序端都用 `video` 组件播放，暂不考虑 `live-player` 组件。

## Requirements

* `mp-weixin` 直播不得选择 `live-player` 候选，不按 appId 区分。
* HLS/video 优先策略必须同时作用于：
  * 早期 `streamInf` 启播；
  * 详情接口启播；
  * 状态轮询/恢复播放选源；
  * “是否有可播放直播源”的判断。
* 当后端只给 RTMP/FLV 时，不回退到 `live-player`，应进入无可用 HLS 播放线/失败态。
* 状态轮询不能把正在播放的 HLS/video 强制切回 RTMP/live-player。
* 测试必须覆盖小程序原生运行时统一 HLS/video、DevTools HLS/video、以及 RTMP/FLV-only 不播放。

## Acceptance Criteria

* [ ] 调试报告中 `mediaSourceComponent` 为 `video`，`mediaSourceType` 为 `hls`。
* [ ] 不再触发 `operateLivePlayer:fail no permission` 的初始化/恢复播放命令。
* [ ] `uniapp-src/tests/live-playback-source.test.mjs` 覆盖 HLS 优先和 RTMP/FLV-only 不回退路径并通过。
* [ ] `npm run build:mp-weixin` 通过，或说明无法运行原因。

## Out of Scope

* 不申请/配置微信 `live-player` 类目权限。
* 不保留 `live-player` 作为当前小程序端播放兜底。
* 不修改根目录旧小程序源码或 `uniapp-src/dist/` 构建产物。
* 不改已有直播间 UI 样式、图标或无关未提交改动。

## Technical Notes

* 主要排查文件：
  * `uniapp-src/src/pages/broadcast/utils/live-source.js`
  * `uniapp-src/src/pages/broadcast/composables/live-entry-initializer-helpers.js`
  * `uniapp-src/src/pages/broadcast/composables/useLiveEntryInitializer.js`
  * `uniapp-src/src/pages/broadcast/utils/live-status-snapshot.js`
  * `uniapp-src/src/pages/broadcast/composables/useLivePlayerInitializer.js`
  * `uniapp-src/tests/live-playback-source.test.mjs`
* CodeGraph 未初始化，已改用 `rg` 和文件阅读定位。
