<template>
  <view class="access-denied-overlay">
    <view class="access-denied-card">
      <view class="access-denied-lock" aria-hidden="true">
        <view class="access-denied-lock__shackle"></view>
        <view class="access-denied-lock__body">
          <view class="access-denied-lock__dot"></view>
        </view>
      </view>
      <text class="access-denied-title">{{ title }}</text>
      <view class="access-denied-anchor">
        <image
          class="access-denied-anchor-avatar"
          :src="avatar"
          mode="aspectFill"
        />
        <view class="access-denied-anchor-meta">
          <text class="access-denied-anchor-name">{{ userName }}</text>
          <text class="access-denied-anchor-id" @click="emit('copy-uid')">
            {{ uidText }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  userName: {
    type: String,
    default: "",
  },
  uidText: {
    type: String,
    default: "UID:--",
  },
});

const emit = defineEmits(["copy-uid"]);
</script>

<style lang="scss" scoped>
.access-denied-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  padding: 0 54rpx;
  box-sizing: border-box;
  background: #999999;
}

.access-denied-card {
  width: 100%;
  max-width: 620rpx;
  min-height: 560rpx;
  padding: 90rpx 30rpx 52rpx;
  border-radius: 28rpx;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  position: relative;
}

.access-denied-lock {
  width: 216rpx;
  height: 186rpx;
  margin-top: -144rpx;
  position: relative;
}

.access-denied-lock__shackle {
  position: absolute;
  left: 54rpx;
  top: 0;
  width: 108rpx;
  height: 92rpx;
  border: 18rpx solid #d9dde6;
  border-bottom: 0;
  border-radius: 68rpx 68rpx 0 0;
  box-sizing: border-box;
}

.access-denied-lock__body {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  bottom: 0;
  height: 122rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, #ffb76d 0%, #fd6119 100%);
  box-shadow: 0 16rpx 36rpx rgba(253, 97, 25, 0.24);
}

.access-denied-lock__dot {
  position: absolute;
  left: 50%;
  top: 38rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: #ffffff;
  transform: translateX(-50%);
}

.access-denied-lock__dot::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 20rpx;
  width: 12rpx;
  height: 36rpx;
  border-radius: 8rpx;
  background: #ffffff;
  transform: translateX(-50%);
}

.access-denied-title {
  width: 100%;
  font-size: 48rpx;
  font-weight: 700;
  color: #111111;
  line-height: 1.16;
  text-align: center;
  word-break: break-all;
  margin-bottom: 24rpx;
}

.access-denied-anchor {
  width: 100%;
  margin-top: auto;
  display: flex;
  align-items: center;
}

.access-denied-anchor-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: #f2f2f2;
}

.access-denied-anchor-meta {
  min-width: 0;
  margin-left: 22rpx;
  display: flex;
  flex-direction: column;
}

.access-denied-anchor-name {
  font-size: 44rpx;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.2;
}

.access-denied-anchor-id {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #b8bcc5;
  line-height: 1.35;
  word-break: break-all;
  user-select: text;
  cursor: pointer;
}
</style>
