<template>
  <view v-if="activeModal === 'wechatOpenPrizeConfirm'" class="wechat-open-prize">
    <view class="weui-dialog" @click.stop>
      <view class="weui-dialog__hd">
        <text class="weui-dialog__title">提示</text>
      </view>
      <text class="weui-dialog__bd">您确定要立即开奖么？</text>
      <view class="weui-dialog__ft">
        <text class="weui-dialog__btn open-prize-default" @click="emit('close')">取消</text>
        <text class="weui-dialog__btn open-prize-primary">确认</text>
      </view>
    </view>
  </view>

  <view v-if="activeModal === 'wechatLotteryCountdown'" class="lotteryCountDown">
    <view class="lotteryMask"></view>
    <view class="luckydrawFull">
      <image class="luckydrawFullBg" :src="image.redAnimation" mode="aspectFill" />
      <view class="luckydrawHeaderBg"></view>
      <view class="luckydrawFooterBg"></view>
    </view>
    <image class="rotateLight" :src="image.rotate" mode="aspectFill" />
    <image class="circle" :src="image.circle" mode="aspectFill" />
    <image class="light" :src="image.light" mode="aspectFill" />
    <view class="luckydrawMiddleContent">
      <view
        :key="countdownNumber"
        class="countdownBody countdownBodyScale"
        :class="`active${countdownNumber}`"
      ></view>
    </view>
  </view>

  <view v-if="activeModal === 'wechatLotteryEffect'" class="wechat-draw-panel source-lottery-effect">
    <view class="effectBg"></view>
    <view class="effectView">
      <image class="victoryBg" :src="image.effectTop" mode="aspectFill" />
      <view class="element">
        <image
          v-for="index in 6"
          :key="index"
          :class="`element${index}`"
          :src="image.element"
          mode="aspectFill"
        />
      </view>
      <view class="effectInfo">
        <view class="titleMargin"></view>
        <text class="title">{{ prizeTitle }}</text>
        <view class="luckScrollView">
          <view class="scrollBox">
            <view class="luckScroll luckScrollTop">
              <view
                v-for="(item, index) in rollingUsers"
                :key="item.key"
                :class="['luckli', index === rollingUsers.length - 1 ? 'luckliLast' : '']"
              >
                <image class="photoSrc" :src="item.photo" mode="aspectFill" />
                <text class="name">{{ item.name }}</text>
                <text v-if="item.phone" class="phone">{{ item.phone }}</text>
              </view>
            </view>
            <image class="luckScrollImg" :src="image.scrollCover" mode="aspectFill" />
          </view>
        </view>
      </view>
      <image class="floorClose" :src="image.floorClose" mode="aspectFill" @click="emit('close')" />
    </view>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  activeModal: {
    type: String,
    required: true
  },
  winners: {
    type: Array,
    required: true
  },
  prize: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["close"]);

const base = "https://man.lqjy.cc/static/Public/Home/Images";
const image = {
  avatar: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg",
  redAnimation: `${base}/redRain/redAnimation.png`,
  rotate: `${base}/redRain/rotate.png`,
  circle: `${base}/redRain/circle.png`,
  light: `${base}/redRain/light.png`,
  effectTop: `${base}/Watch/luckydraw/effectViewTopBg.png`,
  effectInfo: `${base}/Watch/luckydraw/effectInfo.png`,
  scrollCover: `${base}/Watch/luckydraw/luckScrollImg.png`,
  floorClose: `${base}/Watch/luckydraw/floorClose.png`,
  element: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-pkenvelope-element3-b60b22b7.png"
};

const prizeName = computed(() => props.prize.name || props.prize.title || "抽奖奖品");
const prizeTitle = computed(() => prizeName.value);
const sourceUsers = computed(() => props.winners.length > 0
  ? props.winners
  : [{ name: "山奈", phone: "781****1", photo: image.avatar }]);
const rollingUsers = computed(() => {
  const users = sourceUsers.value.length > 0 ? sourceUsers.value : [{ name: "用户", photo: image.avatar }];
  const cycleSize = Math.max(users.length, 10);
  const cycle = Array.from({ length: cycleSize }, (_, index) => {
    const item = users[index % users.length];
    return {
      sourceKey: item.key || item.customerId || item.name || index,
      name: item.name || "用户",
      phone: item.phone || "",
      photo: item.photo || image.avatar
    };
  });
  return [...cycle, ...cycle].map((item, index) => ({
    ...item,
    key: `source-lottery-user-${index}-${item.sourceKey}`
  }));
});

const countdownNumber = ref(3);
let countdownTimer = null;

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function startCountdown() {
  stopCountdown();
  countdownNumber.value = 3;
  countdownTimer = setInterval(() => {
    countdownNumber.value = countdownNumber.value === 1 ? 3 : countdownNumber.value - 1;
  }, 1000);
}

watch(
  () => props.activeModal,
  (activeModal) => {
    if (activeModal === "wechatLotteryCountdown") {
      startCountdown();
      return;
    }
    stopCountdown();
  },
  { immediate: true }
);

onBeforeUnmount(stopCountdown);
</script>

<style lang="scss" scoped>
.wechat-open-prize,
.lotteryCountDown,
.wechat-draw-panel {
  position: fixed;
  inset: 0;
  z-index: 99999;
}

.wechat-open-prize .weui-dialog {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 560rpx;
  overflow: hidden;
  text-align: center;
  border-radius: 12rpx;
  background: #fff;
  transform: translate(-50%, -50%);
}

.weui-dialog__hd {
  padding-top: 44rpx;
}

.weui-dialog__title {
  color: #000;
  font-size: 36rpx;
  font-weight: 600;
}

.weui-dialog__bd {
  display: block;
  padding: 28rpx 48rpx 44rpx;
  color: #808080;
  font-size: 30rpx;
  line-height: 44rpx;
}

.weui-dialog__ft {
  display: flex;
  border-top: 2rpx solid #e5e5e5;
}

.weui-dialog__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 96rpx;
  color: #353535;
  font-size: 34rpx;
}

.open-prize-primary {
  color: #576b95;
  border-left: 2rpx solid #e5e5e5;
}

.lotteryCountDown {
  z-index: 1000010;
  overflow: hidden;
}

.lotteryMask {
  position: fixed;
  inset: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.62);
}

.luckydrawFullBg,
.luckydrawFull,
.luckydrawHeaderBg,
.luckydrawFooterBg {
  position: absolute;
  inset: 0;
}

.lotteryCountDown .luckydrawFull,
.lotteryCountDown .rotateLight,
.lotteryCountDown .circle,
.lotteryCountDown .light,
.lotteryCountDown .luckydrawMiddleContent {
  z-index: 2;
}

.lotteryCountDown .luckydrawMiddleContent {
  position: relative;
}

.luckydrawFullBg {
  width: 100%;
  height: 100%;
}

.luckydrawHeaderBg {
  top: 80rpx;
  bottom: auto;
  height: 240rpx;
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-luckydrawtitle-63b14cab.png") center / contain no-repeat;
}

.luckydrawFooterBg {
  top: auto;
  height: 320rpx;
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-downbottombg-886421a4.png") center bottom / contain no-repeat;
}

.rotateLight,
.circle,
.light {
  position: fixed;
  left: 50%;
  top: 46%;
  width: 640rpx;
  height: 640rpx;
  transform: translate(-50%, -50%);
}

.rotateLight {
  animation: wechatRotate 5s linear infinite;
}

.circle,
.light {
  width: 460rpx;
  height: 460rpx;
}

.countdownBody {
  position: fixed;
  left: 50%;
  top: 46%;
  z-index: 3;
  width: 354rpx;
  height: 462rpx;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  transform: translate(-50%, -50%);
}

.countdownBody.active3 {
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-downthree-3943c463.png");
}

.countdownBody.active2 {
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-downtwo-6a7603ad.png");
}

.countdownBody.active1 {
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-downone-c2b06465.png");
}

.countdownBodyScale {
  animation: countdownScale 1s linear forwards;
}

.effectBg,
.luckydrawBg {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.source-lottery-effect .effectView {
  position: fixed;
  left: 50%;
  top: 45%;
  z-index: 2002;
  width: 630rpx;
  transform: translate(-50%, -50%);
}

.source-lottery-effect .floorClose {
  position: relative;
  left: auto;
  bottom: auto;
  display: block;
  width: 64rpx;
  height: 64rpx;
  margin: 34rpx auto 0;
  transform: none;
}

.source-lottery-effect .victoryBg {
  position: absolute;
  top: -80rpx;
  left: 50%;
  width: 100vw;
  height: 1288rpx;
  opacity: 0.5;
  transform: translateX(-50%);
  animation: sourceVictoryBg 2s linear infinite;
}

.source-lottery-effect .element {
  position: absolute;
  width: 100%;
  height: 20vh;
}

.source-lottery-effect .element .element1,
.source-lottery-effect .element .element2,
.source-lottery-effect .element .element3,
.source-lottery-effect .element .element4,
.source-lottery-effect .element .element5,
.source-lottery-effect .element .element6 {
  position: absolute;
  left: 50%;
  top: 100%;
  width: 50rpx;
  height: 50rpx;
  margin-left: -24rpx;
  opacity: 0;
}

.source-lottery-effect .element .element1 {
  animation: sourceElement1 2.5s infinite;
}

.source-lottery-effect .element .element2 {
  animation: sourceElement2 2.5s infinite;
}

.source-lottery-effect .element .element3 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceElement3 2.8s infinite;
}

.source-lottery-effect .element .element4 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceElement4 2.8s infinite;
}

.source-lottery-effect .element .element5 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceElement5 3s infinite;
}

.source-lottery-effect .element .element6 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceElement6 3s infinite;
}

.source-lottery-effect .effectInfo {
  position: relative;
  width: 630rpx;
  height: 940rpx;
  margin: 0 auto;
  text-align: center;
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-effectinfo-c7eeb3e4.png");
  background-size: 100% 100%;
}

.source-lottery-effect .titleMargin {
  height: 216rpx;
}

.source-lottery-effect .effectInfo .title {
  display: block;
  width: 460rpx;
  height: 60rpx;
  margin: 0 auto;
  overflow: hidden;
  color: #fff;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 60rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-lottery-effect .luckScrollView {
  position: relative;
  width: 514rpx;
  height: 464rpx;
  margin: 118rpx auto 0;
  border-radius: 60rpx;
}

.source-lottery-effect .scrollBox {
  position: relative;
  width: 514rpx;
  height: 464rpx;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 60rpx;
}

.source-lottery-effect .luckScroll {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.source-lottery-effect .luckScrollTop {
  animation: sourceLuckliLoop 1.25s linear infinite;
  will-change: transform;
}

.source-lottery-effect .luckScrollImg {
  position: absolute;
  left: 0;
  bottom: -4rpx;
  display: block;
  width: 514rpx;
  height: 480rpx;
}

.source-lottery-effect .luckli {
  display: flex;
  align-items: center;
  height: auto;
  margin: 0;
  padding: 24rpx 40rpx 0;
  border-radius: 0;
  background: transparent;
}

.source-lottery-effect .luckliLast {
  padding-bottom: 32rpx;
}

.source-lottery-effect .photoSrc {
  display: block;
  width: 56rpx;
  height: 56rpx;
  margin-right: 12rpx;
  border-radius: 50%;
}

.source-lottery-effect .name {
  flex: 1;
  overflow: hidden;
  color: #ff0e4c;
  font-size: 24rpx;
  font-weight: 700;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-lottery-effect .phone {
  margin-left: 12rpx;
  color: #f02a5d;
  font-size: 24rpx;
}

.source-effect-toast {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 496rpx;
  min-height: 64rpx;
  margin: 20rpx auto 0;
  padding: 0 24rpx;
  box-sizing: border-box;
  color: #ff5c63;
  font-size: 28rpx;
  border-radius: 32rpx;
  background: rgba(255, 243, 188, 0.88);
}

.source-effect-speaker {
  margin-right: 12rpx;
  color: #ff184f;
  transform: rotate(180deg);
}

@keyframes wechatRotate {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes countdownScale {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.1);
  }

  40% {
    transform: translate(-50%, -50%) scale(1);
  }

  60% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5);
  }
}

@keyframes sourceVictoryBg {
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }

  80% {
    opacity: 0.8;
  }

  100% {
    opacity: 0.5;
  }
}

@keyframes sourceLuckliLoop {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(0, -50%, 0);
  }
}

@keyframes sourceElement1 {
  0% {
    opacity: 0;
    transform: rotate(0deg);
  }

  50% {
    opacity: 0.8;
  }

  100% {
    left: 0;
    top: 0;
    opacity: 0;
    transform: rotate(360deg);
  }
}

@keyframes sourceElement2 {
  0% {
    opacity: 0;
    transform: rotate(0deg);
  }

  50% {
    opacity: 0.8;
  }

  100% {
    left: 100%;
    top: 0;
    opacity: 0;
    transform: rotate(-360deg);
  }
}

@keyframes sourceElement3 {
  0% {
    opacity: 0;
    transform: rotate(0deg);
  }

  50% {
    opacity: 0.8;
  }

  100% {
    left: 15%;
    top: 45%;
    opacity: 0;
    transform: rotate(360deg);
  }
}

@keyframes sourceElement4 {
  0% {
    opacity: 0;
    transform: rotate(0deg);
  }

  50% {
    opacity: 0.8;
  }

  100% {
    left: 80%;
    top: 45%;
    opacity: 0;
    transform: rotate(-360deg);
  }
}

@keyframes sourceElement5 {
  0% {
    opacity: 0;
    transform: rotate(0deg);
  }

  50% {
    opacity: 0.8;
  }

  100% {
    left: 20%;
    top: 10%;
    opacity: 0;
    transform: rotate(360deg);
  }
}

@keyframes sourceElement6 {
  0% {
    opacity: 0;
    transform: rotate(0deg);
  }

  50% {
    opacity: 0.8;
  }

  100% {
    left: 85%;
    top: 10%;
    opacity: 0;
    transform: rotate(-360deg);
  }
}
</style>
