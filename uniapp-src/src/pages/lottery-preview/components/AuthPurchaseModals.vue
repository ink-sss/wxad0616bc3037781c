<template>
  <view v-if="activeModal === 'followQr'" class="qrcode-boxs dialog-center">
    <text class="qrcode-title">关注诺云直播</text>
    <image class="qrcode-img" :src="assets.followQr" mode="widthFix" />
    <text>做直播 用诺云</text>
  </view>

  <view v-if="activeModal === 'rechargeQr'" class="wechatpay-box dialog-center">
    <view class="wechat-login-pay">
      <image class="wechat-login-pay-img" :src="assets.mockQr" mode="aspectFill" />
      <text>请扫码到手机端支付</text>
    </view>
  </view>

  <view v-if="activeModal === 'loginQr'" class="wechatlogin-box dialog-center">
    <view class="wechat_login">
      <image class="layui-close" :src="assets.layuiClose" mode="aspectFill" @click="emit('close')" />
      <view class="codeLoginBox">
        <text class="codeLogin">微信登录</text>
      </view>
      <image class="img-responsive" :src="assets.mockQr" mode="aspectFill" />
      <text class="weChatCodeLogin">请使用微信扫描二维码登录</text>
    </view>
  </view>

  <view v-if="activeModal === 'userLimit'" class="user-limit-box">
    <view class="user-limit">
      <text class="user-limit-title">提示</text>
      <text class="user-limit-content">当前观看人数已达上限</text>
      <image class="user-limit-image" :src="assets.userLimit" mode="widthFix" />
    </view>
  </view>

  <view v-if="activeModal === 'miniLink'" class="goods-purchase-mini-link">
    <view class="mini-close" @click="emit('close')"></view>
    <image class="goods-purchase-mini-link-img" :src="assets.mockQr" mode="aspectFill" />
    <view class="mini-bt-bg">请使用微信扫码进行购买</view>
  </view>

  <view v-if="activeModal === 'gameMobile'" class="gameModal">
    <view class="info">
      <text class="game-close" @click="emit('close')">×</text>
      <image class="gameModal-image" :src="assets.warn" mode="aspectFill" />
      <text class="gameModal-desc">请使用手机微信打开直播间参与活动</text>
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
.dialog-center,
.goods-purchase-mini-link,
.gameModal .info {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 99999;
  transform: translate(-50%, -50%);
}

.qrcode-boxs {
  width: 520rpx;
  padding: 40rpx;
  text-align: center;
  border-radius: 16rpx;
  background: #fff;
}

.qrcode-img {
  width: 80%;
  margin: 20rpx auto;
}

.qrcode-title {
  display: block;
  color: #2ca25f;
  font-size: 32rpx;
}

.wechatpay-box {
  padding: 30rpx;
  border-radius: 16rpx;
  background: #fff;
}

.wechat-login-pay {
  width: 500rpx;
  padding: 0 64rpx 32rpx;
  text-align: center;
  border-radius: 16rpx;
  background: #fff;
  box-sizing: border-box;
}

.wechat-login-pay-img {
  width: 410rpx;
  height: 410rpx;
  margin-top: 40rpx;
  padding: 30rpx;
  box-sizing: border-box;
}

.wechatlogin-box .wechat_login {
  position: relative;
  padding: 96rpx 190rpx;
  border-radius: 48rpx;
  background: #fff;
  box-shadow: 0 24rpx 96rpx 32rpx rgba(0, 0, 0, 0.03), 0 18rpx 56rpx rgba(0, 0, 0, 0.05);
}

.wechat_login .layui-close {
  position: absolute;
  top: 32rpx;
  right: 40rpx;
  width: 40rpx;
  height: 40rpx;
}

.wechat_login .codeLogin {
  display: block;
  color: #333;
  font-size: 48rpx;
  font-weight: 600;
  text-align: center;
}

.wechat_login .img-responsive {
  display: block;
  width: 420rpx;
  height: 420rpx;
  margin: 64rpx auto 0;
}

.wechat_login .weChatCodeLogin {
  display: block;
  margin-top: 32rpx;
  color: #999;
  font-size: 28rpx;
  text-align: center;
}

.user-limit-box {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(0, 0, 0, 0.9);
}

.user-limit {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 600rpx;
  height: 420rpx;
  margin-left: -300rpx;
  margin-top: -210rpx;
  text-align: center;
  color: #787878;
  border: 2rpx solid #c9ccd0;
  border-radius: 10rpx;
  background: #fff;
}

.user-limit-title,
.user-limit-content {
  display: block;
}

.user-limit-title {
  margin-top: 52rpx;
  color: #333;
  font-size: 36rpx;
  font-weight: 600;
}

.user-limit-content {
  margin-top: 24rpx;
  font-size: 30rpx;
}

.user-limit-image {
  width: 200rpx;
  margin-top: 20rpx;
}

.goods-purchase-mini-link {
  width: 504rpx;
  height: 554rpx;
  text-align: center;
  border-radius: 24rpx;
  background: #fff;
}

.mini-close {
  position: absolute;
  right: 30rpx;
  top: 30rpx;
  width: 30rpx;
  height: 30rpx;
  background: url("../static/remote-icons/i-nuoyun-close2.png") center / contain no-repeat;
}

.goods-purchase-mini-link-img {
  width: 280rpx;
  height: 280rpx;
  margin-top: 76rpx;
}

.mini-bt-bg {
  position: absolute;
  bottom: -10rpx;
  width: 100%;
  height: 202rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 202rpx;
  background: url("../static/remote-icons/i-nuoyun-goods-mini-bt.png") center / contain no-repeat;
}

.gameModal .info {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 960rpx;
  max-width: 86vw;
  height: 480rpx;
  border-radius: 8rpx;
  background: #fff;
  box-shadow: 0 24rpx 96rpx 32rpx rgba(0, 0, 0, 0.03), 0 18rpx 56rpx rgba(0, 0, 0, 0.05);
}

.game-close {
  position: absolute;
  top: 28rpx;
  right: 44rpx;
  color: #333;
  font-size: 56rpx;
}

.gameModal-image {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 48rpx;
}

.gameModal-desc {
  color: #191919;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
}
</style>
