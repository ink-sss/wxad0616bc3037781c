<template>
  <view class="viewer-limit">
    <view class="viewer-limit__image" aria-hidden="true">
      <view class="viewer-limit__screen">
        <view class="viewer-limit__play"></view>
      </view>
      <view class="viewer-limit__person viewer-limit__person--left"></view>
      <view class="viewer-limit__person viewer-limit__person--right"></view>
    </view>
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
  margin: 202rpx auto 20rpx;
  position: relative;
}

.viewer-limit__screen {
  position: absolute;
  left: 72rpx;
  top: 18rpx;
  width: 274rpx;
  height: 190rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, #ffe9d9 0%, #ffd2b5 100%);
  box-shadow: 0 16rpx 36rpx rgba(253, 97, 25, 0.14);
}

.viewer-limit__screen::after {
  content: "";
  position: absolute;
  left: 88rpx;
  right: 88rpx;
  bottom: -34rpx;
  height: 34rpx;
  border-radius: 0 0 16rpx 16rpx;
  background: #f0f1f4;
}

.viewer-limit__play {
  position: absolute;
  left: 112rpx;
  top: 64rpx;
  width: 0;
  height: 0;
  border-top: 32rpx solid transparent;
  border-bottom: 32rpx solid transparent;
  border-left: 48rpx solid #fd6119;
}

.viewer-limit__person {
  position: absolute;
  bottom: 28rpx;
  width: 108rpx;
  height: 108rpx;
  border-radius: 54rpx 54rpx 28rpx 28rpx;
  background: #f2f3f5;
}

.viewer-limit__person::before {
  content: "";
  position: absolute;
  left: 30rpx;
  top: -56rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #d8dce3;
}

.viewer-limit__person--left {
  left: 54rpx;
}

.viewer-limit__person--right {
  right: 54rpx;
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
