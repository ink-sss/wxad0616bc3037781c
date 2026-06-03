<template>
  <view class="viewer-limit">
    <image
      class="viewer-limit__image"
      src="@/assets/figma/get-watch-limit-info.png"
      mode="aspectFill"
    />
    <text class="viewer-limit__text">{{ text || "观看人数已达上限" }}</text>
  </view>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: "观看人数已达上限",
  },
});
</script>

<style lang="scss" scoped>
.viewer-limit {
  position: fixed;
  inset: 0;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
}

.viewer-limit__image {
  width: 418rpx;
  height: 340rpx;
  display: block;
  margin: 202rpx auto 20rpx;
}

.viewer-limit__text {
  width: 404rpx;
  height: 88rpx;
  display: block;
  margin: 0 auto;
  font-size: 32rpx;
  font-weight: 400;
  color: #999999;
  line-height: 44rpx;
  text-align: center;
}
</style>
