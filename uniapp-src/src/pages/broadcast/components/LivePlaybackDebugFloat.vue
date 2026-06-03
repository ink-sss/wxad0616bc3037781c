<template>
  <view
    v-if="show"
    class="playback-debug-float"
    @click.stop
    @touchstart.stop
  >
    <view class="playback-debug-float__title">播放调试</view>
    <view class="playback-debug-float__summary">{{ summary }}</view>
    <view
      v-if="qualityControls.length"
      class="playback-debug-float__quality"
    >
      <view class="playback-debug-float__quality-state">{{ qualityText }}</view>
      <view class="playback-debug-float__quality-actions">
        <view
          v-for="item in qualityControls"
          :key="item.quality"
          class="playback-debug-float__quality-btn"
          :class="{ 'is-active': item.active, 'is-disabled': item.disabled }"
          @click.stop="!item.disabled && $emit('quality', item.quality)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>
    <view class="playback-debug-float__actions">
      <view
        class="playback-debug-float__btn"
        @click.stop="$emit('copy')"
      >
        复制信息
      </view>
      <text class="playback-debug-float__status">{{ copyStatus }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  summary: {
    type: String,
    default: "",
  },
  copyStatus: {
    type: String,
    default: "",
  },
  qualityControls: {
    type: Array,
    default: () => [],
  },
  qualityText: {
    type: String,
    default: "",
  },
});

defineEmits(["copy", "quality"]);
</script>

<style lang="scss" scoped>
.playback-debug-float {
  position: fixed;
  right: 16rpx;
  bottom: calc(148rpx + env(safe-area-inset-bottom));
  z-index: 99999;
  width: 360rpx;
  padding: 14rpx;
  border-radius: 10rpx;
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.28);
  pointer-events: auto;
}

.playback-debug-float__title {
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1.2;
}

.playback-debug-float__summary {
  margin-top: 8rpx;
  max-height: 72rpx;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.78);
  font-size: 20rpx;
  line-height: 1.2;
  word-break: break-all;
}

.playback-debug-float__actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 10rpx;
}

.playback-debug-float__btn {
  flex: 0 0 auto;
  margin: 0;
  padding: 0 14rpx;
  height: 44rpx;
  border-radius: 8rpx;
  background: #1677ff;
  color: #fff;
  font-size: 20rpx;
  line-height: 44rpx;
}

.playback-debug-float__status {
  min-width: 64rpx;
  color: rgba(255, 255, 255, 0.86);
  font-size: 20rpx;
  line-height: 1.2;
}

.playback-debug-float__quality {
  margin-top: 10rpx;
}

.playback-debug-float__quality-state {
  color: rgba(255, 255, 255, 0.86);
  font-size: 19rpx;
  line-height: 1.25;
  word-break: break-all;
}

.playback-debug-float__quality-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.playback-debug-float__quality-btn {
  flex: 0 0 auto;
  margin: 0;
  padding: 0 12rpx;
  min-width: 66rpx;
  height: 38rpx;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.9);
  font-size: 18rpx;
  line-height: 38rpx;
}

.playback-debug-float__quality-btn.is-active {
  background: #1677ff;
  color: #fff;
}

.playback-debug-float__quality-btn.is-disabled {
  opacity: 0.45;
  pointer-events: none;
}
</style>
