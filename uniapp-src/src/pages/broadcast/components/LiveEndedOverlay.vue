<template>
  <view
    v-if="visible"
    class="live-ended-overlay"
    :class="{ 'live-ended-overlay--portrait': portrait }"
  >
    <view class="live-ended-content">
      <text class="live-ended-title">{{ title }}</text>
      <text v-if="showViews" class="live-ended-views">{{ viewerCount }}人看过</text>
      <view class="live-ended-avatar-wrap">
        <image
          class="live-ended-avatar"
          :src="avatar"
          mode="aspectFill"
        />
      </view>
      <text class="live-ended-name">{{ name || "主播" }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  portrait: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  showViews: {
    type: Boolean,
    default: false,
  },
  viewerCount: {
    type: [String, Number],
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped>
/* ===== 直播已结束蒙层 ===== */
.live-ended-overlay {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}
.live-ended-overlay--portrait {
  position: fixed;
  z-index: 100;
}
.live-ended-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}
.live-ended-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 4rpx;
}
.live-ended-views {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20rpx;
}
.live-ended-avatar-wrap {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}
.live-ended-avatar {
  width: 100%;
  height: 100%;
}
.live-ended-name {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
  margin-top: 4rpx;
}
</style>
