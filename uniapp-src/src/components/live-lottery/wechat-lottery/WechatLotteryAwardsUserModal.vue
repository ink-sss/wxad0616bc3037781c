<template>
  <view v-if="isVisible" class="source-awards-modal">
    <view class="luckydrawBg"></view>
    <view class="luckydrawView">
      <view class="element">
        <image
          v-for="index in 6"
          :key="index"
          :class="`element${index}`"
          :src="image.element"
          mode="aspectFill"
        />
      </view>
      <view class="luckydrawInfo">
        <image class="luckydrawAwards" :src="image.awardsTitle" mode="widthFix" />
        <image class="lotteryTop" :src="image.lotteryTop" mode="widthFix" />
        <image class="lotteryFloor" :src="image.lotteryFloor" mode="widthFix" />
        <image class="lotteryFloorLine" :src="image.lotteryLine" mode="widthFix" />
        <view class="luckydrawMiddle">
          <view class="middleMargin"></view>
          <text class="luckydrawTitle">{{ prizeTitle }}</text>
          <scroll-view class="awardsList" scroll-y>
            <view
              v-for="(winner, index) in displayWinners"
              :key="winner.key"
              :class="['awardsLi', index === displayWinners.length - 1 ? 'awardsLiLast' : '']"
            >
              <image class="photoSrc" :src="winner.photo" mode="aspectFill" />
              <text class="name">{{ winner.name }}</text>
              <text v-if="winner.phone" class="phone">{{ winner.phone }}</text>
            </view>
          </scroll-view>
          <view class="floorMargin"></view>
        </view>
      </view>
      <image class="floorClose" :src="image.floorClose" mode="aspectFill" @click="emit('close')" />
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";

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

const base = "https://nyfs-oss.bcvdata.com/Public/Home/Images";
const image = {
  avatar: "/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg",
  awardsTitle: `${base}/Watch/luckydraw/luckydrawAwards2.png`,
  lotteryTop: `${base}/Watch/luckydraw/lotteryTop3.png`,
  lotteryFloor: `${base}/Watch/luckydraw/lotteryFloor.png`,
  lotteryLine: `${base}/Watch/luckydraw/lotteryFloorLine.png`,
  floorClose: `${base}/Watch/luckydraw/floorClose.png`,
  element: "/static/remote-icons/nyfs-oss-bcvdata-com-public-pkenvelope-element3-b60b22b7.png"
};

const isVisible = computed(() => (
  props.activeModal === "wechatLotteryAwards" ||
  props.activeModal === "wechatLotteryAwardsUser"
));

const prizeName = computed(() => props.prize.name || props.prize.title || "抽奖奖品");
const prizeTitle = computed(() => prizeName.value);
const displayWinners = computed(() => {
  if (!props.winners.length) {
    return [{ key: "source-award-empty", name: "暂无中奖用户", phone: "", photo: image.avatar }];
  }
  return props.winners.map((winner, index) => ({
    key: winner.key || winner.recordId || winner.customerId || `source-award-user-${index}`,
    name: winner.name || winner.nickname || `用户${index + 1}`,
    phone: winner.phone || winner.mobile || "已中奖",
    photo: winner.photo || winner.avatar || image.avatar
  }));
});
</script>

<style lang="scss" scoped>
.source-awards-modal {
  position: fixed;
  inset: 0;
  z-index: 100000;
  overflow: hidden;
}

.source-awards-modal .luckydrawBg {
  position: fixed;
  inset: 0;
  z-index: 2002;
  background: rgba(0, 0, 0, 0.5);
}

.source-awards-modal .luckydrawView {
  position: fixed;
  left: 50%;
  top: 54%;
  z-index: 2003;
  width: 100%;
  transform: translate(-50%, -50%);
}

.source-awards-modal .luckydrawInfo {
  position: relative;
  width: 606rpx;
  margin: 0 auto;
  border-radius: 40rpx;
  background-image: url("/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-lottery-2d8f96df.png");
  background-size: 100% 100%;
  box-shadow: 0 0 40rpx 0 #ffd48b;
  animation: sourceAwardsFadeInOut 2s infinite;
}

.source-awards-modal .luckydrawAwards {
  position: absolute;
  left: 134rpx;
  top: -228rpx;
  display: block;
  width: 336rpx;
  height: 80rpx;
}

.source-awards-modal .lotteryTop {
  position: absolute;
  top: -156rpx;
  left: 138rpx;
  z-index: 1;
  display: block;
  width: 334rpx;
  height: 350rpx;
}

.source-awards-modal .lotteryFloor {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 606rpx;
  height: 252rpx;
  border-radius: 40rpx;
}

.source-awards-modal .lotteryFloorLine {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 606rpx;
  height: 4rpx;
  transform: translateX(-50%);
}

.source-awards-modal .luckydrawMiddle {
  position: relative;
  width: 606rpx;
  margin: 0 auto;
  border: 2rpx solid #ffcd92;
  border-radius: 40rpx;
}

.source-awards-modal .middleMargin {
  height: 168rpx;
}

.source-awards-modal .luckydrawTitle {
  display: block;
  width: 440rpx;
  margin: 0 auto;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 40rpx;
  text-align: center;
}

.source-awards-modal .awardsList {
  width: 542rpx;
  max-height: 424rpx;
  margin: 32rpx auto 0;
  overflow: hidden;
  border-radius: 32rpx;
  background: linear-gradient(180deg, #ffddcd 0%, #fff 100%);
}

.source-awards-modal .awardsLi {
  display: flex;
  align-items: center;
  margin: 0 40rpx;
  padding-top: 24rpx;
}

.source-awards-modal .awardsLiLast {
  padding-bottom: 24rpx;
}

.source-awards-modal .photoSrc {
  display: block;
  width: 56rpx;
  height: 56rpx;
  margin-right: 12rpx;
  border-radius: 50%;
}

.source-awards-modal .name {
  flex: 1;
  overflow: hidden;
  color: #ff0e4c;
  font-size: 24rpx;
  font-weight: 700;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-awards-modal .phone {
  margin-left: 28rpx;
  color: #f02a5d;
  font-size: 24rpx;
}

.source-awards-modal .floorMargin {
  height: 32rpx;
}

.source-awards-modal .floorClose {
  display: block;
  width: 84rpx;
  height: 84rpx;
  margin: 34rpx auto 0;
}

.source-awards-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-top: 32rpx;
}

.source-awards-chat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 540rpx;
  min-height: 56rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  color: #ff596f;
  font-size: 28rpx;
  border-radius: 32rpx;
  background: rgba(255, 245, 204, 0.88);
}

.source-awards-speaker {
  margin-right: 12rpx;
  color: #ff1e51;
  transform: rotate(180deg);
}

.source-awards-modal .element {
  position: absolute;
  top: -240rpx;
  width: 100%;
  height: 20vh;
}

.source-awards-modal .element .element1,
.source-awards-modal .element .element2,
.source-awards-modal .element .element3,
.source-awards-modal .element .element4,
.source-awards-modal .element .element5,
.source-awards-modal .element .element6 {
  position: absolute;
  left: 50%;
  top: 100%;
  width: 50rpx;
  height: 50rpx;
  margin-left: -24rpx;
  opacity: 0;
}

.source-awards-modal .element .element1 {
  animation: sourceAwardElement1 2.5s infinite;
}

.source-awards-modal .element .element2 {
  animation: sourceAwardElement2 2.5s infinite;
}

.source-awards-modal .element .element3 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceAwardElement3 2.8s infinite;
}

.source-awards-modal .element .element4 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceAwardElement4 2.8s infinite;
}

.source-awards-modal .element .element5 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceAwardElement5 3s infinite;
}

.source-awards-modal .element .element6 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceAwardElement6 3s infinite;
}

@keyframes sourceAwardsFadeInOut {
  0% {
    box-shadow: 4rpx 4rpx 80rpx 4rpx #ffd48b;
  }

  50% {
    box-shadow: 4rpx 4rpx 20rpx 4rpx #ffd48b;
  }

  100% {
    box-shadow: 4rpx 4rpx 80rpx 4rpx #ffd48b;
  }
}

@keyframes sourceAwardElement1 {
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

@keyframes sourceAwardElement2 {
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

@keyframes sourceAwardElement3 {
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

@keyframes sourceAwardElement4 {
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

@keyframes sourceAwardElement5 {
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

@keyframes sourceAwardElement6 {
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
