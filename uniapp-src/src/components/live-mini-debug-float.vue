<template>
  <cover-view v-if="show" class="live-mini-debug" @tap.stop="emitCopy">
    <cover-view class="live-mini-debug__title">小窗调试</cover-view>
    <cover-view class="live-mini-debug__summary">{{ summary }}</cover-view>
    <cover-view class="live-mini-debug__actions">
      <cover-view class="live-mini-debug__btn">复制信息</cover-view>
      <cover-view class="live-mini-debug__status">{{ copyStatus }}</cover-view>
    </cover-view>
  </cover-view>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  summary: { type: String, default: "" },
  copyStatus: { type: String, default: "" },
});

const emit = defineEmits(["copy"]);
let lastCopyEmitAt = 0;

function emitCopy() {
  const now = Date.now();
  if (now - lastCopyEmitAt < 250) return;
  lastCopyEmitAt = now;
  emit("copy");
}
</script>

<style lang="scss" scoped>
.live-mini-debug {
  position: fixed;
  right: 16rpx;
  bottom: 72rpx;
  z-index: 99999;
  width: 390rpx;
  padding: 14rpx;
  border-radius: 10rpx;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.28);
  pointer-events: auto;
}

.live-mini-debug__title {
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1.2;
}

.live-mini-debug__summary {
  margin-top: 8rpx;
  max-height: 96rpx;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.78);
  font-size: 20rpx;
  line-height: 1.2;
  word-break: break-all;
}

.live-mini-debug__actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 10rpx;
}

.live-mini-debug__btn {
  flex: 0 0 auto;
  padding: 0 14rpx;
  height: 44rpx;
  border-radius: 8rpx;
  background: #1677ff;
  color: #fff;
  font-size: 20rpx;
  line-height: 44rpx;
}

.live-mini-debug__status {
  min-width: 64rpx;
  color: rgba(255, 255, 255, 0.86);
  font-size: 20rpx;
  line-height: 1.2;
}
</style>
