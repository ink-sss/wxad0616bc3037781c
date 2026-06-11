# 复刻直播录屏截屏监听逻辑

## 目标

将 `uniapp-src/src/pages/broadcast/entry.vue` 使用的微信小程序录屏、截屏保护逻辑对齐根目录旧小程序直播页实现。

## 范围

- 只修改 `uniapp-src` 直播入口相关源码。
- 旧小程序源码 `pages/live/live-vertical.js`、`pages/live/live-horizontal.js` 只作为行为来源，不修改。
- 对齐 `onScreenRecordingStateChanged`、录屏遮罩、确认退出弹窗、`exitMiniProgram` 调用方式，以及 `is_capture_screen === 0` 时的截屏隐藏和截屏监听逻辑。

## 验收

- 录屏开始时显示遮罩并弹出“检测到录屏，将退出小程序以确保内容安全。”确认弹窗。
- 用户点击“确定退出”后调用退出小程序能力。
- 录屏停止时隐藏遮罩。
- 房间配置 `is_capture_screen === 0` 时调用 `setVisualEffectOnCapture({ visualEffect: "hidden" })` 并注册截屏监听。
- 不改变旧小程序源码，不手改 `dist`。
