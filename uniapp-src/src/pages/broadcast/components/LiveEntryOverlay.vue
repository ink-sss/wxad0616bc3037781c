<template>
  <wd-overlay
    :show="show"
    @click="emit('enter')"
    :z-index="900"
  >
    <view
      class="entry-overlay-content"
      :class="{ 'entry-overlay-content--landscape': landscape }"
    >
      <view class="entry-btn">
        <view class="bars-anim">
          <view class="bar bar1"></view>
          <view class="bar bar2"></view>
          <view class="bar bar3"></view>
        </view>
        <text class="entry-btn-text">点击进入直播间</text>
      </view>
    </view>
  </wd-overlay>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  landscape: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["enter"]);
</script>

<style lang="scss" scoped>
/* ===== 进入直播间蒙层 ===== */
.entry-overlay-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.entry-btn {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  border-radius: 60rpx;
  padding: 20rpx 48rpx;
}
.entry-btn-text {
  font-size: 30rpx;
  color: #fff;
  font-weight: 500;
  letter-spacing: 2rpx;
}
.bars-anim {
  display: flex;
  align-items: flex-end;
  gap: 6rpx;
  height: 36rpx;
}
.bar {
  width: 6rpx;
  border-radius: 3rpx;
  background: #fff;
  animation: barBounce 0.8s ease-in-out infinite alternate;
}
.bar1 {
  height: 20rpx;
  animation-delay: 0s;
}
.bar2 {
  height: 32rpx;
  animation-delay: 0.2s;
}
.bar3 {
  height: 20rpx;
  animation-delay: 0.4s;
}
@keyframes barBounce {
  0% {
    transform: scaleY(0.4);
  }
  100% {
    transform: scaleY(1);
  }
}
</style>
