<template>
  <view v-if="activeModal === 'redOpen'" class="envelope-reward-modal envelope-mask">
    <view class="open-envelope-box txt-center">
      <view class="open-envelope-close" @click="emit('close')">
        <view class="common-close-icon"></view>
      </view>
      <view class="open-envelope-photo">
        <image :src="assets.avatar" mode="aspectFill" />
        <text class="open-envelope-name">老铁的红包</text>
        <text class="open-envelope-remark">恭喜发财，大吉大利</text>
      </view>
      <view class="open-envelope-btn"></view>
      <view class="open-envelope-box-bottom">
        <text class="look-luck">查看领取详情 ›</text>
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
.open-envelope-box {
  position: absolute;
  left: 50%;
  top: 45%;
  width: 594rpx;
  height: 800rpx;
  overflow: hidden;
  border-radius: 4rpx;
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-envelope-bg-682dda9f.png");
  background-size: 100% 100%;
  background-color: transparent;
  transform: translate(-50%, -50%);
}

.open-envelope-photo {
  width: 960rpx;
  height: 900rpx;
  margin: -400rpx auto auto -180rpx;
  border-radius: 480rpx;
}

.open-envelope-photo image {
  width: 108rpx;
  height: 108rpx;
  margin-top: 480rpx;
  box-sizing: border-box;
  border: 2rpx solid #feffaf;
  border-radius: 50%;
}

.open-envelope-photo text {
  display: block;
  color: #feffaf;
}

.open-envelope-name {
  width: 520rpx;
  margin: 8rpx auto 0;
  overflow: hidden;
  font-size: 28rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.open-envelope-remark {
  width: 450rpx;
  margin: 24rpx auto 0;
  overflow: hidden;
  color: #feffaf;
  font-size: 48rpx;
  font-weight: bold;
  line-height: 56rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.open-envelope-btn {
  width: 168rpx;
  height: 168rpx;
  margin: -110rpx auto 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff6aa 0, #ffd758 35%, #d99b1c 100%);
  box-shadow: inset 0 -10rpx 16rpx rgba(118, 67, 0, 0.28), 0 16rpx 36rpx rgba(70, 12, 0, 0.22);
}

.open-envelope-box-bottom .look-luck {
  position: absolute;
  left: 50%;
  bottom: 20rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  transform: translateX(-50%);
}

.open-envelope-close {
  position: absolute;
  left: 50%;
  bottom: -120rpx;
  width: 64rpx;
  height: 64rpx;
  transform: translateX(-50%);
}

</style>
