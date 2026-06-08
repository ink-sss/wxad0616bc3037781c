<template>
  <view class="report-index">
    <text class="report-index__text">正在进入投诉页面...</text>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";

onLoad((query = {}) => {
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  uni.redirectTo({
    url: `/pagesPlus/main/report/report-home${params ? `?${params}` : ""}`,
  });
});
</script>

<style scoped>
.report-index {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6f8;
}

.report-index__text {
  font-size: 28rpx;
  color: #666;
}
</style>
