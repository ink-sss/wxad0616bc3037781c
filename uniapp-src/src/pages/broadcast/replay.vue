<template>
  <view class="redirect-page">
    <text class="redirect-text">正在跳转...</text>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";
import { buildBroadcastEntryUrl, normalizeLiveRouteOptions } from "@/utils/live-route.js";

onLoad((options) => {
  const resolved = normalizeLiveRouteOptions(options || {});
  const url = buildBroadcastEntryUrl({
    ...resolved,
    replay: "1",
    liveType: "replay",
    mode: resolved.mode || "landscape",
    tenantId: options?.tenantId || "",
    liveName: options?.liveName || "",
    cover: options?.cover || "",
    liveCover: options?.liveCover || "",
    _tc: options?._tc || "",
    wx_token: options?.wx_token || "",
  });
  uni.redirectTo({ url });
});
</script>

<style lang="scss" scoped>
.redirect-page {
  width: 750rpx;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.redirect-text {
  font-size: 28rpx;
  color: #999;
}
</style>
