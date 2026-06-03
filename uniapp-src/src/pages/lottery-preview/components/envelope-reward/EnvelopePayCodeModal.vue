<template>
  <view v-if="activeModal === 'rewardPay' || activeModal === 'redPay'" class="envelope-reward-modal envelope-mask">
    <view class="pay-code-panel">
      <view class="pay-code-header">
        <text>{{ activeModal === 'rewardPay' ? '打赏' : '发红包' }}</text>
        <text class="pay-code-close" @click="emit('close')">×</text>
      </view>
      <view class="pay-code-body">
        <text>微信扫码支付</text>
        <image class="qr-image" :src="assets.mockQr" mode="aspectFill" />
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  activeModal: {
    type: String,
    required: true
  },
  assets: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["close"]);
</script>

<style lang="scss" scoped>
.pay-code-panel {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 620rpx;
  overflow: hidden;
  border-radius: 12rpx;
  background: #fff;
  transform: translate(-50%, -50%);
}

.pay-code-header {
  position: relative;
  padding: 28rpx 32rpx;
  color: #333;
  font-size: 32rpx;
  font-weight: 600;
  border-bottom: 2rpx solid #e5e5e5;
}

.pay-code-close {
  position: absolute;
  right: 32rpx;
  top: 16rpx;
  color: #777;
  font-size: 52rpx;
}

.pay-code-body {
  padding: 36rpx 32rpx 40rpx;
  color: #333;
  font-size: 28rpx;
  text-align: center;
}

.qr-image {
  display: block;
  width: 410rpx;
  height: 410rpx;
  margin: 28rpx auto 0;
}
</style>
