<template>
  <view class="address-list-redirect">
    <text>正在进入地址管理...</text>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";

function buildQuery(options = {}) {
  return Object.keys(options)
    .filter((key) => options[key] !== undefined && options[key] !== null && options[key] !== "")
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(options[key]))}`)
    .join("&");
}

onLoad((options = {}) => {
  const query = buildQuery(options);
  uni.redirectTo({
    url: `/pages/address/index${query ? `?${query}` : ""}`,
  });
});
</script>

<style lang="scss" scoped>
.address-list-redirect {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f7f7;
  color: #999;
  font-size: 28rpx;
}
</style>
