# 统一支付成功跳转订单详情

## Goal

统一 `uniapp-src` 小程序支付确认成功后的用户落点：支付成功后进入订单详情页查看订单最新状态；如果支付动作本身从订单详情页发起，则不重复打开页面，只刷新当前订单详情。

## What I Already Know

- 主支付确认链路在 `uniapp-src/src/services/payment-action.js`：`requestPayment` 返回后会轮询 `/h5/pay/result`，后端确认 `payStatus === 1` 才返回 `confirmed: true`。
- 当前不同入口成功后行为不一致：
  - `/pages/order/pay` 显示成功页按钮，查看订单当前跳待付款列表。
  - `/pages/order/list` 支付成功后跳待发货列表。
  - `/pages/order/confirm` 和直播购买依赖 `onShow` 检查订单状态后跳待发货列表。
  - `/pages/order/detail` 点击支付会打开 `/pages/order/pay`。
- 用户要求：统一支付成功后跳订单详情页；如果本身就在订单详情页，更新订单状态。

## Requirements

- 所有新的主支付入口在 `confirmed: true` 后应进入订单详情页。
- 订单详情页发起支付时应传递返回上下文，支付成功后刷新详情页状态，不重复跳转新的详情页。
- 保留取消支付逻辑：已创建订单后取消支付仍进入待付款列表。
- 保留 `PAY_RESULT_PENDING` 语义：后端未确认时不误判支付成功。
- 不改旧小程序根目录源码，不手改 `uniapp-src/dist/`。

## Acceptance Criteria

- [ ] `pages/order/pay.vue` 支付确认成功后根据上下文跳订单详情；详情来源则返回并刷新详情。
- [ ] `pages/order/list.vue` 支付确认成功后跳该订单详情，而不是待发货列表。
- [ ] `pages/order/confirm.vue` 支付确认成功或 `onShow` 兜底确认后跳订单详情。
- [ ] `pages/broadcast/composables/useLivePurchase.js` / `useLiveEntryLifecycle.js` 支付确认成功后跳订单详情。
- [ ] `pages/order/detail.vue` 从详情页发起支付后刷新当前详情状态。
- [ ] 最小验证通过，至少运行静态检索和可行时 `npm run build:mp-weixin`。

## Out Of Scope

- 不重构支付后端 API。
- 不迁移或统一遗留 `common/pay.js` 与旧 `pages/live/commponents/*` 支付组件，除非主链路仍能触达且会影响本次验收。
- 不改变未支付、取消支付、支付结果待确认的业务定义。

## Technical Notes

- 适合抽取轻量 helper 到 `uniapp-src/src/services/`，因为行为是订单支付后的跨页面业务导航，不属于纯工具。
- 订单详情页路由为 `/pages/order/detail?id=<orderId>&status=<status>&roomCode=<roomCode>`，详情页内部会重新请求 `/h5/order/detail`。
- 若只有 `orderNo` 无 `orderId`，订单列表已有按 `orderNo` 过滤能力，但订单详情目前主要需要 `id`。本次主创建/列表入口都有 `orderId` 或可从列表 item 取得。
