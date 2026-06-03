<template>
  <view v-if="activeModal === 'redWinner'" class="envelope-reward-modal envelope-mask">
    <view class="winner-envelope-box txt-center">
      <view class="winner-envelope-close" @click="emit('close')">
        <view class="common-close-icon"></view>
      </view>
      <view class="winner-envelope-photo">
        <image :src="assets.avatar" mode="aspectFill" />
        <text class="winner-envelope-name">老铁的红包</text>
        <text class="winner-envelope-remark">恭喜发财，大吉大利</text>
      </view>
      <view class="winner-envelope-amount">
        <text>8.88</text>
        元
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
.winner-envelope-box {
  position: absolute;
  left: 50%;
  top: 45%;
  width: 600rpx;
  height: 794rpx;
  overflow: hidden;
  border-radius: 4rpx;
  background-color: #cc3d15;
  transform: translate(-50%, -50%);
}

.winner-envelope-photo {
  width: 960rpx;
  height: 960rpx;
  margin: -712rpx auto auto -184rpx;
  border-radius: 480rpx;
  background: #e05449;
  box-shadow: 0 0 2rpx #ba2a1f;
}

.winner-envelope-photo image {
  width: 80rpx;
  height: 80rpx;
  margin-top: 916rpx;
  border-radius: 50%;
}

.winner-envelope-photo text {
  display: block;
  color: #ffe2b1;
}

.winner-envelope-name {
  width: 520rpx;
  margin: 26rpx auto 0;
  overflow: hidden;
  font-size: 24rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.winner-envelope-remark {
  width: 438rpx;
  margin: 26rpx auto 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 36rpx;
}

.winner-envelope-close {
  position: absolute;
  left: 50%;
  bottom: -180rpx;
  width: 80rpx;
  height: 80rpx;
  transform: translateX(-50%);
}

.winner-envelope-amount {
  margin-top: 300rpx;
  color: #ffe2b1;
  font-size: 32rpx;
  font-weight: 500;
}

.winner-envelope-amount text {
  font-size: 56rpx;
}
</style>
