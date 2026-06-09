# uniapp live entry parity frontend

## Goal

在 `uniapp-src` 内完成直播间入口前端复刻，默认服务端已返回所需字段，不开发服务端接口。目标是让 `/pages/broadcast/entry` 在短链、二维码、首次进入、小程序提审相关配置、直播间详情字段、分享、防截屏/录屏等行为上对齐旧小程序源码可见逻辑。

## Requirements

- 只面向 `/pages/broadcast/entry` 新入口，不兼容、不维护、不测试 `pages/live/live-vertical` 和 `pages/live/live-horizontal` 旧路径转发。
- 在 `App.vue` 小程序启动阶段解析 `options.query/scene`，持久化 `referee_id/uid`、`live_id`、`shop_supplier_id`、直播入口上下文。
- 启动阶段调用现有 `fetchLoginSetting()`，将返回的登录/提审配置写入旧小程序同名 storage 和 `globalData`。
- 增强直播入口参数解析，支持当前参数 `roomCode=miufct6sqaqh&tenantId=15&liveType=live&_tc=xthxirwe9f`，也支持二维码 `scene` 中的编码 URL、hash query、逗号分隔 `key:value`。
- 在直播详情初始化中归一化服务端已返回的 `setting` 或 `room_setting`，把旧字段映射到当前 `roomSetting`，覆盖分享、匿名、购物、热销、客服、在线人数等前端交互字段。
- 新增小程序直播入口 parity composable，并接入 `entry.vue`：按房间设置控制分享菜单、防截屏、录屏开始退出小程序，并在页面卸载时清理监听。
- 处理旧小程序源码可见的前端状态：`-2` 或等价字段进入拒绝态，`-3` 或 `self_group=1` 进入验证/登录相关前端状态。

## Acceptance Criteria

- [ ] `/pages/broadcast/entry?roomCode=miufct6sqaqh&tenantId=15&liveType=live&_tc=xthxirwe9f` 能保留完整上下文并进入当前直播初始化流程。
- [ ] `scene` 为编码 URL、hash query、逗号 `key:value` 格式时，能解析出直播上下文并进入同一初始化流程。
- [ ] `loginSetting` 返回后，`mpState`、`wxOpen`、`wxBinding`、`smsOpen`、`setting_${appId}` 与 `globalData.is_login/live_page/im_*` 被同步。
- [ ] `room_setting.is_share/self_group/is_capture_screen` 等字段能驱动分享菜单和防截屏/录屏行为。
- [ ] 不修改根目录旧小程序源码，不修改 `uniapp-src/dist`。
- [ ] `npm run test:live-entry-bootstrap` 和 `npm run build:mp-weixin` 通过，或说明无法运行的原因。

## Out of Scope

- 不开发服务端接口。
- 不兼容旧 `pages/live/live-vertical`、`pages/live/live-horizontal` 路径。
- 不手改构建产物。

## Technical Notes

- 当前工程已有 `uniapp-src/src/utils/live-route.js`、`useLiveEntryBootstrap.js`、`useLiveEntryInitializer.js`、`platform/weixin/capture.js`、`tests/live-entry-bootstrap.test.mjs` 可作为主要接入点。
- 旧小程序参考：根目录 `app.js`、`common/utils.js`、`pages/live/live-vertical.js`，只读参考。
