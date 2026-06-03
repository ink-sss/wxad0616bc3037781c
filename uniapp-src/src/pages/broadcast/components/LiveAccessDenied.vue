<template>
  <view class="access-denied-overlay">
    <view class="access-denied-card">
      <image
        class="access-denied-lock"
        src="@/assets/figma/live-access-lock.png"
        mode="aspectFit"
      />
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
