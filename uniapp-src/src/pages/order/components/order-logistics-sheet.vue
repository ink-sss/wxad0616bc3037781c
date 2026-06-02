<template>
  <view class="logistics-overlay" @click="$emit('close')">
    <view class="logistics-sheet" @click.stop>
      <view class="logistics-header">
        <text class="logistics-title">物流详情</text>
        <view class="logistics-close" @click="$emit('close')">
          <text class="close-x">✕</text>
        </view>
      </view>
      <view class="logistics-company-bar" v-if="logisticsData">
        <view class="logistics-company-info">
          <text class="logistics-company-name">{{ logisticsData.logisticsCompany || '物流公司' }}</text>
          <view class="logistics-status-tag" :class="logisticsStatusClass">
            <text class="logistics-status-text">{{ logisticsStatusLabel }}</text>
          </view>
        </view>
        <view class="logistics-tracking-row" @click="$emit('copy')">
          <text class="logistics-tracking-no">{{ logisticsData.trackingNo || '--' }}</text>
          <image class="copy-icon" src="/static/icons/copy.svg" mode="aspectFit" />
        </view>
      </view>
      <scroll-view class="logistics-timeline-scroll" scroll-y>
        <view v-if="!logisticsData || !logisticsData.traces || logisticsData.traces.length === 0" class="logistics-empty">
          <text class="logistics-empty-text">暂无物流轨迹信息</text>
        </view>
        <view v-else class="logistics-timeline">
          <view
            v-for="(trace, idx) in logisticsData.traces"
            :key="idx"
            class="timeline-item"
            :class="{ 'timeline-item-active': idx === 0 }"
          >
            <view class="timeline-dot-col">
              <view class="timeline-dot" :class="{ 'timeline-dot-active': idx === 0 }" />
              <view v-if="idx < logisticsData.traces.length - 1" class="timeline-line" />
            </view>
            <view class="timeline-content">
              <text class="timeline-text" :class="{ 'timeline-text-active': idx === 0 }">{{ trace.content }}</text>
              <text class="timeline-time">{{ trace.time }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  logisticsData: {
    type: Object,
    default: null,
  },
  logisticsStatusLabel: {
    type: String,
    default: "查询中",
  },
  logisticsStatusClass: {
    type: String,
    default: "tag-default",
  },
});

defineEmits(["close", "copy"]);
</script>

<style lang="scss" scoped>
/* ===== 物流轨迹弹出面板 ===== */
.logistics-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.logistics-sheet {
  width: 100%;
  max-height: 75vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logistics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.logistics-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.logistics-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-x {
  font-size: 32rpx;
  color: #999;
}

.logistics-company-bar {
  padding: 20rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.logistics-company-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.logistics-company-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.logistics-status-tag {
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.tag-signed {
  background: #f0f9eb;
  color: #67c23a;
}

.tag-transit {
  background: #ecf5ff;
  color: #409eff;
}

.tag-default {
  background: #f5f5f5;
  color: #999;
}

.logistics-tracking-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
}

.logistics-tracking-no {
  font-size: 24rpx;
  color: #666;
}

.copy-icon {
  width: 28rpx;
  height: 28rpx;
}

.logistics-timeline-scroll {
  flex: 1;
  max-height: 55vh;
}

.logistics-empty {
  padding: 60rpx 0;
  text-align: center;
}

.logistics-empty-text {
  font-size: 28rpx;
  color: #999;
}

.logistics-timeline {
  padding: 24rpx 32rpx;
}

.timeline-item {
  display: flex;
  gap: 20rpx;
  min-height: 80rpx;
}

.timeline-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24rpx;
  flex-shrink: 0;
}

.timeline-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #ddd;
  flex-shrink: 0;
  margin-top: 6rpx;
}

.timeline-dot-active {
  background: #ff6b2e;
  width: 20rpx;
  height: 20rpx;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 46, 0.2);
}

.timeline-line {
  width: 2rpx;
  flex: 1;
  background: #e8e8e8;
  min-height: 40rpx;
}

.timeline-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 28rpx;
  overflow: hidden;
}

.timeline-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  display: block;
  word-break: break-all;
}

.timeline-text-active {
  color: #1a1a1a;
  font-weight: 500;
}

.timeline-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
}
</style>
