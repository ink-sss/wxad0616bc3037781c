# Weixin Risk Inventory

The project is deeply tied to `mp-weixin`. The migration should isolate WeChat-only behavior in `src/platform/weixin/`.

High-risk capabilities:

* Live viewing and TRTC: `live-player`, `live-pusher`, live player/pusher contexts, TRTC SDK, screen capture/recording controls.
* IM: TencentCloudChat, TIM upload plugin, AV chatroom join/quit, live barrage and moderation events.
* Payment and merchant transfer: `requestPayment` and `requestMerchantTransfer`.
* Login and authorization: `wx.login`, `getPhoneNumber`, `chooseAvatar`, legacy user info flows.
* Scan code write-off: home/user scan links into store clerk order and branch pages.
* Location and maps: `scope.userLocation`, `getLocation`, `openSetting`, `map` markers.
* WeChat-specific UI: `official-account`, `open-data`, `web-view`, customer service contact.
* Navigation: `navigateToMiniProgram` with short links and target app IDs.
* Platform APIs: update manager, account info, menu button geometry, subscribe messages.

Validation priority:

1. Login/phone binding.
2. Payment and merchant transfer.
3. Scan write-off.
4. Store location/map.
5. Product detail customer service/share.
6. Live vertical/horizontal/TRTC/IM.
7. DIY dynamic navigation and WeChat links.
