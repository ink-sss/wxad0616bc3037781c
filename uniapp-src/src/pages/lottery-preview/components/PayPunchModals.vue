<template>
  <view v-if="activeModal === 'payWarn'" class="payPicWarnModal pay-card dialog-center">
    <view class="payBg">付费下载</view>
    <view class="payPicWarn">
      <text class="tipText">高清无水印大图需付费后可下载，付费后可查看并下载</text>
      <text class="momey">¥ <text>345.78</text></text>
      <view class="payGoBtn">立即支付</view>
      <view class="payWarnCheck">
        <image :src="assets.checked" mode="aspectFill" />
        <text>不再提醒</text>
      </view>
    </view>
    <image class="pay-close-bottom" :src="assets.pictureClose" mode="aspectFill" @click="emit('close')" />
  </view>

  <view v-if="activeModal === 'wechatPay'" class="weChatPayModal pay-card dialog-center">
    <image class="pay-close" :src="assets.layuiClose" mode="aspectFill" @click="emit('close')" />
    <view class="title">
      <image :src="assets.wechatIcon" mode="aspectFill" />
      <text>微信支付</text>
    </view>
    <text class="momey">¥ <text>345.78</text></text>
    <image class="payCode" :src="assets.mockQr" mode="aspectFill" />
    <text class="wechatPayTip">请使用微信扫码支付</text>
    <text class="wechatPayTip1">支付过程中请不要关闭该窗口!</text>
  </view>

  <view v-if="activeModal === 'paySuccess'" class="weChatPaySuccessModal pay-card dialog-center">
    <image class="pay-close" :src="assets.layuiClose" mode="aspectFill" @click="emit('close')" />
    <text class="title">支付成功</text>
    <text class="tip">可批量下载高清无水印大图或前往个人中心-付费图片查看已购买图片</text>
    <view class="batchDownload">批量下载</view>
  </view>

  <view v-if="activeModal === 'batchDownload'" class="batchDownPicModal pay-card dialog-center">
    <image class="pay-close" :src="assets.layuiClose" mode="aspectFill" @click="emit('close')" />
    <text class="title">批量下载须知</text>
    <text class="tip">批量下载前请确保浏览器已关闭每次询问下载位置，否则每下载一张照片都将询问一次下载位置</text>
    <view class="batchDownloadBox">
      <text class="cancelBatchDownBtn">取消</text>
      <text class="startDownBtn">开始下载</text>
    </view>
  </view>

  <view v-if="activeModal === 'punchForce' || activeModal === 'punchOpen' || activeModal === 'punchSuccess'" class="PCpunchClockUserDialog">
    <image class="punchClockUserDialogIconClose" :src="assets.punchClose" mode="aspectFill" @click="emit('close')" />
    <image v-if="activeModal === 'punchForce'" class="forceClockIcon" :src="assets.notClocking" mode="aspectFill" />
    <image v-if="activeModal === 'punchOpen'" class="icon_clockedinbefore" :src="assets.beforeClocking" mode="aspectFill" />
    <image v-if="activeModal === 'punchSuccess'" class="icon_clockedinsuc" :src="assets.sucIcon" mode="aspectFill" />
    <view v-if="activeModal === 'punchOpen'" class="pcCountdownTimer">
      <text class="pcCountdownNumber">00</text><text>时</text>
      <text class="pcCountdownNumber">12</text><text>分</text>
      <text class="pcCountdownNumber">36</text><text>秒</text><text>后结束</text>
    </view>
    <text v-if="activeModal === 'punchForce'" class="forceClockDialogTip">您未完成打卡，已暂停观看直播</text>
    <text v-if="activeModal === 'punchOpen'" class="forceClockTip forceClockTipShow">为避免直播观看暂停，请及时打卡～</text>
    <view class="punchClockUserDialogBtn">
      {{ activeModal === 'punchOpen' ? '点击打卡' : activeModal === 'punchForce' ? '继续观看' : '关闭' }}
    </view>
    <text v-if="activeModal === 'punchSuccess'" class="CountDownTips">5秒后自动关闭</text>
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
.PCpunchClockUserDialog {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 99999;
  transform: translate(-50%, -50%);
}

.pay-card {
  width: 720rpx;
  max-width: 88vw;
  text-align: center;
  border-radius: 48rpx;
  background: #fff;
  box-shadow: 0 24rpx 96rpx 32rpx rgba(0, 0, 0, 0.03), 0 18rpx 56rpx rgba(0, 0, 0, 0.05);
}

.payBg {
  height: 200rpx;
  padding: 58rpx 0 0 80rpx;
  box-sizing: border-box;
  text-align: left;
  color: #333;
  font-size: 64rpx;
  background: url("../static/remote-icons/nyfs-oss-bcvdata-com-wechat-live-livepicture-payimgmodalbgnew-3b9c9d69.png") center / cover no-repeat;
}

.payPicWarn {
  padding: 48rpx 80rpx 64rpx;
}

.tipText,
.tip,
.wechatPayTip,
.wechatPayTip1 {
  display: block;
  color: #333;
  font-size: 28rpx;
  line-height: 40rpx;
}

.momey {
  display: block;
  margin: 32rpx 0;
  color: #ff0e4c;
  font-size: 36rpx;
  font-weight: 600;
}

.momey text {
  font-size: 64rpx;
}

.payGoBtn,
.batchDownload,
.cancelBatchDownBtn,
.startDownBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 44rpx;
}

.payGoBtn,
.batchDownload {
  width: 560rpx;
  margin: 0 auto 32rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  background: linear-gradient(90deg, rgb(255, 84, 63), rgb(255, 67, 97));
}

.payWarnCheck {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
}

.payWarnCheck image {
  width: 36rpx;
  height: 36rpx;
  margin-right: 8rpx;
}

.pay-close-bottom {
  position: absolute;
  bottom: -108rpx;
  left: 50%;
  width: 64rpx;
  height: 64rpx;
  transform: translateX(-50%);
}

.pay-close {
  position: absolute;
  top: 32rpx;
  right: 40rpx;
  width: 40rpx;
  height: 40rpx;
}

.weChatPayModal,
.weChatPaySuccessModal,
.batchDownPicModal {
  padding: 64rpx 80rpx 80rpx;
  box-sizing: border-box;
}

.weChatPayModal .title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
  color: #333;
  font-size: 48rpx;
  font-weight: 600;
}

.weChatPayModal .title image {
  width: 56rpx;
  height: 56rpx;
  margin-right: 16rpx;
}

.payCode {
  width: 460rpx;
  height: 460rpx;
}

.wechatPayTip {
  color: #999;
}

.wechatPayTip1 {
  margin-top: 12rpx;
}

.weChatPaySuccessModal .title,
.batchDownPicModal .title {
  display: block;
  margin-bottom: 48rpx;
  color: #333;
  font-size: 36rpx;
  font-weight: 600;
}

.weChatPaySuccessModal .tip,
.batchDownPicModal .tip {
  margin-bottom: 64rpx;
}

.batchDownload {
  background: linear-gradient(90deg, #2685ff, #003bd7);
}

.batchDownloadBox {
  display: flex;
  justify-content: space-between;
}

.cancelBatchDownBtn,
.startDownBtn {
  display: inline-block;
  width: 264rpx;
  text-align: center;
}

.cancelBatchDownBtn {
  color: #333;
  background: #f6f6f6;
}

.startDownBtn {
  color: #fff;
  font-weight: 600;
  background: linear-gradient(90deg, #2685ff, #003bd7);
}

.PCpunchClockUserDialog {
  width: 800rpx;
  max-width: 84vw;
  padding: 80rpx 100rpx;
  box-sizing: border-box;
  text-align: center;
  border-radius: 48rpx;
  background: url("../static/remote-icons/nyfs-oss-bcvdata-com-public-punchclock-pcdialogbg-d37b4393.png") center / 100% 100% no-repeat;
}

.punchClockUserDialogIconClose {
  position: absolute;
  right: 40rpx;
  top: 32rpx;
  width: 40rpx;
  height: 40rpx;
}

.forceClockIcon {
  width: 320rpx;
  height: 320rpx;
}

.icon_clockedinbefore {
  width: 316rpx;
  height: 212rpx;
  margin-bottom: 8rpx;
}

.icon_clockedinsuc {
  width: 260rpx;
  height: 248rpx;
}

.forceClockDialogTip,
.forceClockTip,
.CountDownTips {
  display: block;
  color: #333;
  font-size: 28rpx;
  line-height: 44rpx;
}

.forceClockTipShow {
  margin-top: 32rpx;
  color: #808080;
}

.punchClockUserDialogBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  margin-top: 64rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 100rpx;
  background: linear-gradient(137deg, #02a9ff, #8c56ff);
}

.pcCountdownTimer {
  color: #000201;
  font-size: 32rpx;
}

.pcCountdownTimer text {
  display: inline-block;
  margin-right: 16rpx;
}

.pcCountdownTimer .pcCountdownNumber {
  width: 72rpx;
  height: 72rpx;
  color: #000201;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 72rpx;
  border-radius: 12rpx;
  background: linear-gradient(136deg, #f3eeff, #ebf7ff);
}

.CountDownTips {
  margin-top: 24rpx;
  color: rgba(51, 51, 51, 0.4);
}
</style>
