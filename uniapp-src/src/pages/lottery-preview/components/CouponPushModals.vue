<template>
  <view v-if="activeModal === 'couponPushList' || activeModal === 'couponPushEmpty'" class="push-coupon-box">
    <view class="push-coupon-content">
      <view class="push-coupon-header">
        <text class="li-check-text-on">多选</text>
        <text>推送优惠券</text>
        <text class="coupon-close" @click="emit('close')">×</text>
      </view>
      <view v-if="activeModal === 'couponPushList'" class="push-coupon-ul">
        <view v-for="coupon in coupons" :key="coupon.name" class="push-coupon-li">
          <view class="push-coupon-li-box">
            <view class="coupon-info">
              <text class="coupon-name">{{ coupon.name }}</text>
              <view class="coupon-num">
                <view class="coupon-num-progress">
                  <view class="coupon-num-progress-bar" :style="{ width: coupon.percent }"></view>
                  <text class="coupon-num-progress-text">已领{{ coupon.received }}张</text>
                </view>
                <text class="coupon-num-proportion">{{ coupon.percent }}</text>
              </view>
            </view>
            <text class="push-coupon-btn">推送</text>
          </view>
        </view>
      </view>
      <view v-else class="push-coupon-no-data">
        <image class="push-coupon-no-data-icon" :src="image.empty" mode="aspectFill" />
        <text>暂无可推送优惠券</text>
      </view>
      <view class="push-bottom">
        <view class="all-push">
          <image class="all-push-icon" :src="image.noCheck" mode="aspectFill" />
          <text>全选</text>
        </view>
        <text class="all-push-btn">推送</text>
      </view>
    </view>
  </view>

  <view v-if="activeModal === 'couponPushTime'" class="push-coupon-time-box">
    <view class="push-coupon-time-header">
      <image class="push-coupon-time-left" :src="image.left" mode="aspectFill" />
      <text>优惠券推送</text>
      <text class="coupon-close" @click="emit('close')">×</text>
    </view>
    <view class="push-coupon-time-tip">
      <image class="push-coupon-time-tip-icon" :src="image.tip" mode="aspectFill" />
      <text>您可设置奖品兑换券的领取时间，时间结束后无法领取</text>
    </view>
    <view class="push-coupon-time-center">
      <view class="push-coupon-time-content">
        <text class="strong">领取时间</text>
        <text>限时</text>
        <text class="push-coupon-time-inp">60</text>
        <text>秒内领取</text>
      </view>
      <text class="push-coupon-time-inp-tip">领取时间可设置为30-600秒</text>
    </view>
    <view class="push-coupon-time-foot">
      <text class="push-coupon-time-cancel" @click="emit('close')">取消</text>
      <text class="push-coupon-time-confirm">开始推送</text>
    </view>
  </view>

</template>

<script setup>
defineProps({
  activeModal: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close"]);

const image = {
  empty: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-coupon-push-coupon-no-data-682f4f4d.png",
  noCheck: "./static/remote-icons/nyfs-oss-bcvdata-com-public-mobile-images-order-no-check-9ad3ef03.png",
  left: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-pay-left-834aed5e.png",
  tip: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-goods-refund-tip-5eba5241.png"
};

const coupons = [
  { name: "满100减10奖品兑换券", received: 18, percent: "36%" },
  { name: "无门槛直播间专享券", received: 42, percent: "84%" },
  { name: "全部商品可用折扣券", received: 7, percent: "14%" }
];

</script>

<style lang="scss" scoped>
.push-coupon-box,
.push-coupon-time-box {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 99999;
  width: 100%;
  height: 75%;
  border-radius: 48rpx 48rpx 0 0;
  background: #fff;
}

.push-coupon-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.push-coupon-header,
.push-coupon-time-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 124rpx;
  color: #333;
  font-size: 36rpx;
  font-weight: 700;
}

.li-check-text-on {
  position: absolute;
  left: 32rpx;
  color: #ff0e4c;
  font-size: 28rpx;
  font-weight: 400;
}

.coupon-close {
  position: absolute;
  right: 32rpx;
  top: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  color: #999;
  font-size: 52rpx;
}

.push-coupon-ul {
  flex: 1;
  overflow-y: auto;
}

.push-coupon-li {
  margin-top: 24rpx;
  padding: 0 32rpx;
}

.push-coupon-li-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 176rpx;
  padding: 24rpx 32rpx;
  box-sizing: border-box;
  background: url("../static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-push-coupon-45774041.png") center / 100% 100% no-repeat;
}

.coupon-info {
  flex: 1;
  min-width: 0;
}

.coupon-name {
  display: block;
  color: #333;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 40rpx;
}

.coupon-num {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
}

.coupon-num-progress {
  position: relative;
  flex: 1;
  height: 28rpx;
  overflow: hidden;
  border-radius: 14rpx;
  background: rgba(255, 14, 76, 0.1);
}

.coupon-num-progress-bar {
  height: 100%;
  border-radius: 14rpx;
  background: linear-gradient(270deg, #ff0e4c 0%, #ff86a5 100%);
}

.coupon-num-progress-text {
  position: absolute;
  left: 20rpx;
  top: 0;
  color: #ff0e4c;
  font-size: 22rpx;
  line-height: 28rpx;
}

.coupon-num-proportion {
  width: 68rpx;
  margin-left: 8rpx;
  color: #ff0e4c;
  font-size: 22rpx;
}

.push-coupon-btn,
.all-push-btn,
.push-coupon-time-confirm,
.coupon-bind-phone-confirm {
  color: #fff;
  text-align: center;
  background: linear-gradient(270deg, #ff0e4c 0%, #ff6089 100%);
}

.push-coupon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 136rpx;
  height: 64rpx;
  margin-left: 24rpx;
  font-size: 28rpx;
  border-radius: 32rpx;
}

.push-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 32rpx 68rpx;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.all-push {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 28rpx;
}

.all-push-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 8rpx;
}

.all-push-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 72rpx;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 36rpx;
}

.push-coupon-no-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #808080;
  font-size: 28rpx;
}

.push-coupon-no-data-icon {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 16rpx;
}

.push-coupon-time-left {
  position: absolute;
  left: 32rpx;
  width: 48rpx;
  height: 48rpx;
}

.push-coupon-time-tip {
  display: flex;
  align-items: center;
  min-height: 60rpx;
  padding: 0 32rpx;
  color: #ff0e4c;
  font-size: 24rpx;
  background: rgba(255, 14, 76, 0.1);
}

.push-coupon-time-tip-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
}

.push-coupon-time-center {
  padding: 48rpx 32rpx;
}

.push-coupon-time-content {
  display: flex;
  align-items: center;
  color: #333;
  font-size: 28rpx;
}

.strong {
  margin-right: 24rpx;
  font-weight: 700;
}

.push-coupon-time-inp {
  width: 200rpx;
  height: 64rpx;
  margin: 0 16rpx;
  color: #333;
  font-weight: 700;
  line-height: 64rpx;
  text-align: center;
  border: 2rpx solid #d8d8d8;
  border-radius: 12rpx;
}

.push-coupon-time-inp-tip {
  display: block;
  margin: 16rpx 0 0 136rpx;
  color: #808080;
  font-size: 24rpx;
}

.push-coupon-time-foot {
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  width: 100%;
  padding: 16rpx 32rpx 70rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.push-coupon-time-cancel,
.coupon-bind-phone-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 240rpx;
  height: 88rpx;
  margin-right: 30rpx;
  color: #333;
  border-radius: 44rpx;
  background: #f6f6f6;
}

.push-coupon-time-confirm,
.coupon-bind-phone-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 88rpx;
  font-weight: 700;
  border-radius: 44rpx;
}

</style>
