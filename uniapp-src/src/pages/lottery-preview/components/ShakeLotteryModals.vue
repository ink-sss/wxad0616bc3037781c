<template>
  <view v-if="activeModal === 'shakeLotteryStart'" class="shakeStart shakeBox">
    <view class="shake-red-raining-time">剩余时间 <text class="shake-red-raining-time-value">00:10</text></view>
    <view class="shakeStartContent">
      <image class="shakeCountDown" :src="image.countDown" mode="aspectFill" />
      <view class="shakeCenter">
        <image class="shakeGesture shakeingA" :src="image.gesture" mode="aspectFill" />
        <image class="shakeBottom" :src="image.startBottom" mode="aspectFill" />
      </view>
      <text class="shakeTip">听说摇的越快，中奖机会更大呦~</text>
      <text class="shakeTipIos">ios系统点击授权允许获取动作与方向的访问权限后可正常使用摇一摇</text>
      <view class="shakeBtnBox">
        <text class="shakeBtnBoxAction iosEmpower">授权</text>
        <text class="shakeBtnBoxAction shakeExplainBtn">活动说明</text>
      </view>
    </view>
    <image class="closeShakeBox" :src="image.iconClose" mode="aspectFill" @click="emit('close')" />
  </view>

  <view v-if="activeModal === 'shakeLotteryWin'" class="shakeSuccess shakeBox">
    <view class="shakeResultContent">
      <view class="shakeBc">
        <image class="shakePrizeImg" :src="image.gift" mode="aspectFill" />
        <text class="shakePrizeName">私域直播增长礼包</text>
        <text class="shakePrizeBtn shakePerfect">完善信息</text>
        <text class="shakePrizeBtn shakeReceive">领取</text>
        <text class="shakePrizeTip">奖品需领取后有效</text>
      </view>
      <image class="closeShakeBox" :src="image.iconClose" mode="aspectFill" @click="emit('close')" />
    </view>
  </view>

  <view v-if="activeModal === 'shakeLotteryLose'" class="shakeFail shakeBox">
    <view class="shakeResultContent">
      <view class="shakeBc"></view>
      <image class="closeShakeBox" :src="image.iconClose" mode="aspectFill" @click="emit('close')" />
    </view>
  </view>

  <view v-if="activeModal === 'shakeLotteryExplain'" class="shakeExplainBox">
    <view class="shakeExplainBc"></view>
    <view class="shakeExplainCenter">
      <view class="shakeExplainHeader">
        <view class="shakeExplainLine"></view>
        <text class="shakeExplainHeaderTitle">活动说明</text>
        <view class="shakeExplainLine"></view>
      </view>
      <view class="shakeExplainText">
        <text class="shakeExplainTextLine">1. 活动开始后按提示摇动手机参与抽奖。</text>
        <text class="shakeExplainTextLine">2. 摇动越快，获得中奖资格的概率越高。</text>
        <text class="shakeExplainTextLine">3. 中奖后请按提示完善信息或领取奖品。</text>
      </view>
      <view class="shakeExplainBottom"></view>
    </view>
  </view>

  <view v-if="activeModal === 'shakeLotteryReceive'" class="shakeReceiveS">
    <view class="shakeReceiveSuccessBc"></view>
      <view class="shakeReceiveSuccess">
      <image class="shakeReceiveSuccessImage" :src="image.receive" mode="aspectFill" />
      <text class="shakeReceiveSuccessTitle">领奖成功!</text>
      <text class="shakeReceiveRecord" @click="openPrizeRecord">
        前往 <text class="tool-luckydraw">中奖记录</text> 查看中奖详情
      </text>
    </view>
  </view>

  <view v-if="activeModal === 'shakeLotteryPerfect'" class="shakePerfectBox shakeBox">
    <view class="shakePerfectContent">
      <view class="shakePerfectCenter">
        <text class="shakePerfectTitle">完善信息</text>
        <view class="shakePerfectField"><text>请输入姓名</text></view>
        <view class="shakePerfectField"><text>请输入手机号</text></view>
        <view class="shakePerfectField shakeSmsBox">
          <text>短信验证码</text>
          <view class="shakeSms">
            <text class="shakeSendSms">发送验证码</text>
            <text class="shakeEndSms">60s后获取</text>
          </view>
        </view>
        <view class="shakePerfectField"><text>请输入联系地址</text></view>
        <text class="shakePerfectConfirm">确定</text>
      </view>
      <image class="closeShakeBox" :src="image.iconClose" mode="aspectFill" @click="emit('close')" />
    </view>
  </view>
</template>

<script setup>
import { navigateToPrizeRecord } from "@/utils/route-navigation";

const props = defineProps({
  activeModal: {
    type: String,
    required: true
  },
  recordUrl: {
    type: String,
    default: "/pages/prize-record/index"
  }
});

const emit = defineEmits(["close"]);

const image = {
  countDown: "./static/remote-icons/i-nuoyun-shake-countdown-10.png",
  gesture: "./static/remote-icons/i-nuoyun-shake-gesture.png",
  startBottom: "./static/remote-icons/i-nuoyun-shake-start-bottom.png",
  iconClose: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-icon-close-0cb4224d.png",
  gift: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-sign-gift-5def5533.png",
  receive: "./static/remote-icons/i-nuoyun-shake-receive.png"
};

function openPrizeRecord() {
  navigateToPrizeRecord(props.recordUrl);
}
</script>

<style lang="scss" scoped>
.shakeBox,
.shakeExplainBox,
.shakeReceiveS {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.6);
  text-align: center;
}

.shakeResultContent,
.shakeStartContent {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  transform: translate(-50%, -50%);
}

.shakeSuccess .shakeBc {
  width: 626rpx;
  height: 670rpx;
  margin: 0 auto 30rpx;
  padding-top: 290rpx;
  box-sizing: border-box;
  background: url("../static/remote-icons/i-nuoyun-shake-success.png") no-repeat;
  background-size: 100% 100%;
}

.shakePrizeImg {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 20rpx;
}

.shakePrizeName {
  display: block;
  width: 460rpx;
  margin: 0 auto 20rpx;
  padding: 0 20rpx;
  overflow: hidden;
  box-sizing: border-box;
  color: #fff;
  font-size: 28rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shakePrizeBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 294rpx;
  height: 68rpx;
  margin: 0 auto 20rpx;
  border-radius: 34rpx;
  color: #ed4427;
  font-size: 32rpx;
  background-color: #fde73a;
  box-shadow: 2rpx 4rpx 6rpx rgba(153, 15, 14, 0.26);
}

.shakePrizeTip {
  display: block;
  width: 460rpx;
  margin: 0 auto;
  padding: 0 20rpx;
  overflow: hidden;
  box-sizing: border-box;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shakeFail .shakeBc {
  width: 470rpx;
  height: 518rpx;
  margin: 0 auto 48rpx;
  background: url("../static/remote-icons/i-nuoyun-shake-fail.png") no-repeat;
  background-size: 100% 100%;
}

.shakeCountDown {
  width: 162rpx;
  height: 118rpx;
  margin-bottom: 30rpx;
}

.shakeCenter {
  position: relative;
  width: 470rpx;
  height: 470rpx;
  margin: 0 auto;
  padding-top: 60rpx;
  box-sizing: border-box;
  background: url("../static/remote-icons/i-nuoyun-shake-start-bc.png") no-repeat;
  background-size: 100% 100%;
}

.shakeGesture {
  width: 280rpx;
  height: 356rpx;
  transform-origin: 140rpx 356rpx;
}

.shakeBottom {
  position: absolute;
  left: 50%;
  bottom: -26rpx;
  width: 446rpx;
  height: 126rpx;
  transform: translateX(-50%);
}

.shakeingA {
  animation: shakeing 1s linear infinite;
}

.shakeTip {
  display: block;
  margin: 40rpx 0 26rpx;
  color: #fff;
  font-size: 24rpx;
}

.shakeTipIos {
  display: block;
  width: 414rpx;
  margin: 0 auto 26rpx;
  color: #fecf80;
  font-size: 24rpx;
}

.shakeBtnBox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.shakeBtnBoxAction {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 240rpx;
  height: 76rpx;
  border-radius: 40rpx;
  color: #f91d41;
  font-size: 32rpx;
  background: linear-gradient(0deg, #feba60, #fed49e);
}

.iosEmpower {
  margin-right: 40rpx;
}

.shakeExplainBc,
.shakeReceiveSuccessBc {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
}

.shakeExplainCenter {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 640rpx;
  overflow: hidden;
  border-radius: 20rpx;
  background: #fff;
  transform: translate(-50%, -50%);
}

.shakeExplainHeader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  font-size: 32rpx;
  font-weight: 500;
  background: url("../static/remote-icons/i-nuoyun-shake-explain-bc.png") no-repeat;
  background-size: 100% 100%;
}

.shakeExplainLine {
  width: 60rpx;
  height: 2rpx;
  background: #666;
}

.shakeExplainHeaderTitle {
  margin: 0 16rpx;
}

.shakeExplainText {
  height: 560rpx;
  padding: 40rpx 28rpx 28rpx;
  box-sizing: border-box;
  overflow-y: auto;
  font-size: 28rpx;
  text-align: left;
}

.shakeExplainTextLine {
  display: block;
  color: #333;
  line-height: 48rpx;
}

.shakeExplainBottom {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 108rpx;
  background: linear-gradient(0deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
}

.shakeReceiveSuccess {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 580rpx;
  height: 504rpx;
  padding-top: 100rpx;
  border-radius: 20rpx;
  box-sizing: border-box;
  color: #333;
  font-size: 32rpx;
  font-weight: 500;
  text-align: center;
  background: #fff;
  transform: translate(-50%, -50%);
}

.shakeReceiveSuccessImage {
  width: 128rpx;
  height: 128rpx;
  margin-bottom: 50rpx;
}

.shakeReceiveSuccessTitle,
.shakeReceiveRecord {
  display: block;
}

.shakeReceiveRecord {
  margin-top: 90rpx;
  color: #999;
  font-size: 28rpx;
  font-weight: 400;
}

.tool-luckydraw {
  display: inline;
  color: #ed4427;
}

.shakePerfectContent {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 620rpx;
  transform: translate(-50%, -50%);
}

.shakePerfectCenter {
  padding-bottom: 68rpx;
  border-radius: 48rpx;
  background: url("../static/remote-icons/nyfs-oss-bcvdata-com-wechat-live-themenew-shakeperfectcenterbg-8f8ff185.png") no-repeat;
  background-size: cover;
}

.shakePerfectTitle {
  display: block;
  padding: 46rpx 0 48rpx;
  color: #333;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 50rpx;
  text-align: center;
}

.shakePerfectField {
  display: flex;
  align-items: center;
  height: 88rpx;
  margin: 0 48rpx 32rpx;
  padding: 0 32rpx;
  border: 2rpx solid #ffeaea;
  border-radius: 44rpx;
  box-sizing: border-box;
  color: #999;
  font-size: 28rpx;
  text-align: left;
  background: #fff;
}

.shakeSmsBox {
  justify-content: space-between;
}

.shakeSms {
  height: 24rpx;
  margin-left: 20rpx;
  padding-left: 20rpx;
  border-left: 4rpx solid #e3e3e3;
  color: #c82207;
  font-size: 24rpx;
  line-height: 24rpx;
}

.shakeEndSms {
  display: none;
}

.shakePerfectConfirm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 566rpx;
  height: 80rpx;
  margin: 60rpx auto 0;
  border-radius: 40rpx;
  color: #c82207;
  font-size: 32rpx;
  background: #fde73a;
  box-shadow: 2rpx 4rpx 6rpx rgba(153, 15, 14, 0.26);
}

.closeShakeBox {
  width: 60rpx;
  height: 60rpx;
}

@keyframes shakeing {
  25% {
    transform: rotate(-45deg);
  }

  50% {
    transform: rotate(0deg);
  }

  75% {
    transform: rotate(45deg);
  }

  100% {
    transform: rotate(0deg);
  }
}
</style>
