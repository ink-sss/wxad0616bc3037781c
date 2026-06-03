<template>
  <view v-if="activeModal === 'couponOrderSelect'" class="coupon-box-c">
    <view class="coupon-box-bc"></view>
    <view class="coupon-list-box">
      <view class="coupon-list-box-header">
        <text class="coupon-list-box-title">选择优惠券</text>
        <text class="coupon-close" @click="emit('close')">×</text>
      </view>
      <view class="bestOffer">
        <view class="bestOfferLeft">
          <text class="bestOfferLeftTop">最佳优惠券组合2张</text>
          <text class="bestOfferLeftBot">共抵扣 ¥15.00</text>
        </view>
        <text class="bestOfferRight">使用最佳优惠</text>
      </view>
      <view class="coupon-list-ul">
        <view v-for="coupon in coupons" :key="coupon.name" class="coupon-list-li">
          <view class="coupon-price">
            <text class="unit">¥</text>
            <text class="price">{{ coupon.price }}</text>
          </view>
          <view class="coupon-desc">
            <text class="coupon-title">{{ coupon.name }}</text>
            <text class="coupon-subtitle">{{ coupon.limit }}</text>
            <text class="coupon-time">有效期：领取当日3天内可用</text>
          </view>
          <image class="sel-icon" :src="coupon.checked ? image.trueIcon : image.falseIcon" mode="aspectFill" />
        </view>
      </view>
      <text class="chooseLength">已选择 2 张优惠券</text>
      <text class="coupon-confirm">确定</text>
    </view>
  </view>

  <view v-if="activeModal === 'couponGiftBag'" class="gift-mask">
    <view class="couponGiftBag">
      <text class="gift-title">优惠券大礼包</text>
      <text class="coupon-close" @click="emit('close')">×</text>
    <view class="giftNameUl">
      <view v-for="coupon in coupons" :key="coupon.name" class="giftNameLi">
        <view class="giftNameLeft">
          <view class="noThreshold">
            <text class="noThresholdSymbol">¥</text>
            <text class="noThresholdPrice">{{ coupon.price }}</text>
          </view>
          <text class="noThresholdText">{{ coupon.limit }}</text>
        </view>
        <text class="gift-list-title">{{ coupon.name }}</text>
        <text class="gift-nav">有效期：领取当日3天内可用</text>
      </view>
    </view>
    <view class="shade"></view>
    <text class="immediately">立即领取</text>
    </view>
  </view>

  <view v-if="activeModal === 'couponExpireSubscribe'" class="productDetailsSubscriptionBg">
    <view class="productDetailsSubscription">
      <view class="productDetailsSubscriptionWrapper">
        <image class="closeBtn" :src="image.close" mode="aspectFill" @click="emit('close')" />
        <image class="topBg" :src="image.subscribeBg" mode="widthFix" />
        <text class="productDetailsSubscriptionTitle">优惠券过期提醒通知</text>
        <text class="productDetailsSubscriptionNav">订阅后，优惠券过期前将会以微信订阅消息形式通知您～</text>
        <view class="productDetailsSubscriptionHandle">
          <text class="productDetailsSubscriptionContainer productDetailsSubscriptionUnder">订阅</text>
          <text class="productDetailsSubscriptionContainer productDetailsSubscriptionCompleted">已订阅</text>
        </view>
      </view>
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
  trueIcon: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-num-coupon-true-563cf3df.png",
  falseIcon: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-num-coupon-false-10b47f4e.png",
  close: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-closeicon-748fe1f2.png",
  subscribeBg: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-subscribebg-15ba905b.png"
};

const coupons = [
  { name: "满100减10优惠券", price: "10", limit: "满100可用", checked: true },
  { name: "直播间无门槛券", price: "5", limit: "无门槛", checked: true },
  { name: "商品折扣券", price: "8", limit: "指定商品可用", checked: false }
];
</script>

<style lang="scss" scoped>
.coupon-box-c,
.gift-mask,
.productDetailsSubscriptionBg {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.58);
}

.coupon-box-bc {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
}

.coupon-list-box {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding-bottom: 36rpx;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 48rpx 48rpx 0 0;
  background: #fff;
}

.coupon-list-box-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: auto;
  padding-right: 20rpx;
  color: #333;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 50rpx;
  text-align: center;
}

.coupon-list-box-title {
  width: 100%;
  padding-top: 46rpx;
  margin-bottom: 48rpx;
}

.coupon-close {
  position: absolute;
  top: 36rpx;
  right: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  color: #999;
  font-size: 52rpx;
}

.bestOffer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 104rpx;
  margin: 0 28rpx 20rpx 32rpx;
  padding: 16rpx 24rpx;
  box-sizing: border-box;
  border-radius: 24rpx;
  background: rgba(250, 119, 20, 0.06);
}

.bestOfferLeftTop,
.bestOfferLeftBot {
  display: block;
}

.bestOfferLeftTop {
  color: #333;
  font-size: 24rpx;
  line-height: 36rpx;
}

.bestOfferLeftBot {
  color: #ff0e4c;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 36rpx;
}

.bestOfferRight {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 192rpx;
  height: 56rpx;
  margin-top: 8rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  border-radius: 28rpx;
  background: linear-gradient(270deg, #ff0e4c 0%, #ff6089 100%);
}

.coupon-list-ul {
  max-height: 772rpx;
  padding: 0 32rpx 20rpx;
  overflow-y: auto;
}

.coupon-list-li {
  display: flex;
  align-items: center;
  min-height: 152rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  box-sizing: border-box;
  border-radius: 20rpx;
  background: #fff6f0;
}

.coupon-price {
  width: 148rpx;
  color: #ff0e4c;
  font-weight: 700;
  text-align: center;
}

.unit {
  font-size: 28rpx;
}

.price {
  font-size: 60rpx;
}

.coupon-desc {
  flex: 1;
  min-width: 0;
}

.coupon-title,
.coupon-subtitle,
.coupon-time {
  display: block;
}

.coupon-title {
  color: #333;
  font-size: 28rpx;
  font-weight: 700;
}

.coupon-subtitle,
.coupon-time,
.chooseLength {
  color: #808080;
  font-size: 24rpx;
}

.coupon-time {
  margin-top: 10rpx;
}

.sel-icon {
  width: 44rpx;
  height: 44rpx;
  margin-left: 16rpx;
}

.chooseLength {
  display: block;
  padding: 4rpx 32rpx 24rpx;
}

.coupon-confirm,
.immediately {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 84rpx;
  margin: 0 32rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  border-radius: 42rpx;
  background: linear-gradient(270deg, #ff0e4c 0%, #ff6089 100%);
}

.couponGiftBag {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 1002;
  width: 100%;
  min-height: 544rpx;
  max-height: 1104rpx;
  overflow: hidden;
  border-radius: 30rpx 30rpx 0 0;
  background: url("../static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-gift-bg-17cc20d3.png") no-repeat;
  background-size: cover;
}

.gift-title {
  display: block;
  padding: 40rpx 80rpx 0;
  margin-bottom: 40rpx;
  overflow: hidden;
  color: #333;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 38rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.giftNameUl {
  max-height: 860rpx;
  margin-bottom: 120rpx;
  overflow: auto;
}

.giftNameLi {
  position: relative;
  display: flex;
  width: 710rpx;
  height: 180rpx;
  max-width: calc(100vw - 40rpx);
  margin: 0 auto 20rpx;
  list-style: none;
  background: url("../static/remote-icons/nyfs-oss-bcvdata-com-public-home-gift-namebg-234d8795.png") no-repeat;
  background-size: 100% 100%;
}

.giftNameLeft {
  width: 270rpx;
  height: 180rpx;
  text-align: center;
}

.noThreshold {
  display: flex;
  justify-content: center;
  padding-top: 48rpx;
  color: #ff5661;
  font-weight: bold;
}

.noThresholdSymbol {
  padding-top: 18rpx;
  margin-right: 10rpx;
  font-size: 30rpx;
}

.noThresholdPrice {
  font-size: 72rpx;
  line-height: 1;
}

.noThresholdText {
  display: block;
  width: fit-content;
  height: 40rpx;
  margin: 20rpx auto 0;
  padding: 8rpx 18rpx;
  box-sizing: border-box;
  color: #fff;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 24rpx;
  text-align: center;
  border-radius: 20rpx;
  background: linear-gradient(90deg, #ff4767, #fcb23c);
}

.gift-list-title {
  position: absolute;
  top: 22rpx;
  right: 40rpx;
  width: 380rpx;
  height: 70rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 36rpx;
}

.gift-nav {
  position: absolute;
  bottom: 22rpx;
  left: 286rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 300;
  line-height: 28rpx;
}

.immediately {
  position: absolute;
  left: 50%;
  bottom: 20rpx;
  width: 710rpx;
  max-width: calc(100vw - 40rpx);
  margin: 0;
  color: #af6700;
  background: linear-gradient(0deg, #ffce97, #ffc64b);
  transform: translateX(-50%);
}

.couponGiftBag .shade {
  position: absolute;
  left: 50%;
  bottom: 120rpx;
  width: 710rpx;
  max-width: calc(100vw - 40rpx);
  height: 80rpx;
  background: linear-gradient(0deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
  transform: translateX(-50%);
}

.productDetailsSubscription {
  position: absolute;
  left: 50%;
  top: 422rpx;
  width: 590rpx;
  height: 552rpx;
  margin-left: -294rpx;
  border-radius: 48rpx;
  background: #fff;
}

.productDetailsSubscriptionWrapper {
  position: relative;
  text-align: center;
}

.closeBtn {
  position: absolute;
  top: 28rpx;
  right: 28rpx;
  z-index: 2;
  width: 48rpx;
  height: 48rpx;
}

.topBg {
  width: 590rpx;
  height: 208rpx;
  margin-top: -32rpx;
}

.productDetailsSubscriptionTitle {
  display: block;
  margin-bottom: 16rpx;
  color: #333;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 50rpx;
}

.productDetailsSubscriptionNav {
  display: block;
  width: 462rpx;
  height: 84rpx;
  margin: 0 auto 48rpx;
  color: #666;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 42rpx;
  text-align: center;
}

.productDetailsSubscriptionHandle {
  text-align: center;
}

.productDetailsSubscriptionContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 494rpx;
  height: 88rpx;
  margin: 0 auto;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 44rpx;
}

.productDetailsSubscriptionUnder {
  color: #fff;
  background: #ff0e4c;
}

.productDetailsSubscriptionCompleted {
  display: none;
  color: #ff0e4c;
  background: rgba(255, 14, 76, 0.05);
}
</style>
