# fix: uniapp live secondary page video mini window parity

## Goal

从 uni-app 直播间进入个人中心、订单等二级页面时，保留 H5 端已有的视频小窗交互，并针对微信小程序运行环境做兼容，避免只显示封面或丢失返回直播能力。

## What I Already Know

* 当前主要修改范围是 `uniapp-src/`，H5 工程 `/Users/apple/Desktop/code/live_h5/` 只作为行为参考。
* H5 端二级页使用 `live-mini-window`，具备视频播放、拖拽、关闭、点击返回直播、播放按钮和房间状态缓存。
* `uniapp-src/src/components/live-mini-window.vue` 已经复制了 H5 的外层模板和样式。
* `uniapp-src/src/composables/useLiveMiniWindow.js` 当前实现较轻，只从缓存取一次状态，缺少 onShow 刷新、关闭记忆、拖拽点击区分、回放进度回写和小程序播放兼容。
* 直播间侧 `uniapp-src/src/pages/broadcast/composables/useLiveMiniWindow.js` 负责保存离页小窗状态，二级页侧 `uniapp-src/src/composables/useLiveMiniWindow.js` 负责展示和返回。

## Assumptions

* 本任务先对齐已有二级页内的 `live-mini-window` 组件行为，不新建全局 App 级悬浮层。
* 小程序端使用 uni-app `<video>` 与 `uni.createVideoContext`，不照搬 H5 DOM、Agora FLS、hls.js/flv.js 等浏览器播放器。
* 小程序视频小窗默认静音自动播放，用户可点播放按钮恢复播放；返回直播时携带回放进度参数。

## Requirements

* 二级页进入时能从直播间缓存恢复小窗状态，并在页面 `onShow` 时刷新状态。
* 小窗支持 H5 同款交互：拖拽、关闭、点击返回直播、播放按钮、封面兜底。
* 关闭小窗后，同一房间在当前会话内不反复弹出。
* 回放小窗返回直播前保存当前播放进度。
* 不引入浏览器专属 API 到微信小程序端。

## Acceptance Criteria

* [ ] 从直播间进入个人中心等已挂载 `live-mini-window` 的二级页时，小窗能显示并播放可用视频源。
* [ ] 拖拽不会误触返回直播；未拖拽点击小窗可返回直播。
* [ ] 关闭按钮隐藏当前房间小窗并清理缓存。
* [ ] 回放小窗返回直播时带回 `miniResumeTime`、`miniResumeVideoId` 等恢复参数。
* [ ] `npm run build:mp-weixin` 通过，或明确记录无法通过的既有原因。

## Out of Scope

* 不改根目录旧小程序源码。
* 不修改 `/Users/apple/Desktop/code/live_h5/`。
* 不新增直播间以外页面的业务入口，只修已有 `live-mini-window` 组件能力。

## Technical Notes

* H5 参考：`/Users/apple/Desktop/code/live_h5/src/components/live-mini-window.vue`
* H5 参考：`/Users/apple/Desktop/code/live_h5/src/composables/useLiveMiniWindow.js`
* uni-app 目标：`uniapp-src/src/components/live-mini-window.vue`
* uni-app 目标：`uniapp-src/src/composables/useLiveMiniWindow.js`
* 状态工具：`uniapp-src/src/utils/live-mini-state.js`
