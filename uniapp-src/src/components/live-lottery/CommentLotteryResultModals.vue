<template>
  <view v-if="activeModal === 'commentLotteryWin'" class="comment-result-modal">
    <view class="winPrize_Box_bg"></view>
    <view class="winPrize_Box">
      <view class="untitledAnimation_box">
        <view class="untitledAnimation"></view>
        <image class="win-prize-light" :src="image.star" mode="aspectFill" />
        <view class="winPrizeBox">
          <image class="winningAward" :src="image.winningAward" mode="aspectFill" />
          <image class="winningAwardPop" :src="image.pop" mode="widthFix" />
          <view class="winPrize">
            <view class="winPrizeImgBox">
              <image class="winPrizeImg" :src="prizeImage" mode="aspectFill" />
              <text class="winPrizeGrade">{{ prizeLevelText }}</text>
            </view>
            <text class="winPrizeName">{{ prizeName }}</text>
            <view class="toLuckyDraw" @click.stop="openPrizeRecord">
              <text class="toLuckyDraw__line">奖品需领取后有效</text>
              <text class="toLuckyDraw__line tool-luckydraw">
                请前往 <text class="prizeTipsText">中奖记录</text> 查看
              </text>
            </view>
            <view class="winPrizePerfect claimRewards" @click.stop="openPrizeRecord">
              <text class="claimRewardsText">领取奖励</text>
            </view>
            <image class="closeWinPrizeBox" :src="image.closeIcon" mode="aspectFill" @click="emit('close')" />
          </view>
        </view>
      </view>
    </view>
  </view>

  <view v-if="activeModal === 'commentLotteryLose'" class="comment-result-modal losePrizeBox">
    <view class="losePrize">
      <text class="losePrizeText">很遗憾，您暂未中奖</text>
      <view class="toLuckyDrawTwo" @click.stop="openPrizeRecord">
        前往
        <text class="tool-luckydraw">中奖记录</text>
      </view>
      <image class="closeLosePrizeBox" :src="image.closeIcon" mode="aspectFill" @click="emit('close')" />
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { navigateToPrizeRecord, normalizeAppRoute } from "@/utils/route-navigation";

const props = defineProps({
  activeModal: {
    type: String,
    required: true
  },
  prize: {
    type: Object,
    default: () => ({})
  },
  winRecord: {
    type: Object,
    default: null
  },
  recordUrl: {
    type: String,
    default: "/pagesPlus/main/prize-record/index"
  }
});

const emit = defineEmits(["close"]);

const image = {
  gift: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-sign-gift-5def5533.png",
  closeIcon: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-commons-close-icon-75e80e51.png",
  star: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-star-icon-288074ca.webp",
  winningAward: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-winning-award-d13632f4.png",
  pop: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-untitledanimation-25b60726.webp"
};

const prizeName = computed(() => props.winRecord?.rewardName || props.prize?.prizeName || props.prize?.productName || "评论抽奖奖品");
const prizeImage = computed(() => props.winRecord?.rewardImage || props.prize?.productImage || image.gift);
const prizeLevelText = computed(() => props.winRecord?.levelText || props.winRecord?.prizeLevelText || props.prize?.levelText || props.prize?.prizeLevelText || props.winRecord?.prizeLevel || props.prize?.prizeLevel || "1");

function openPrizeRecord() {
  const route = normalizeAppRoute(props.recordUrl || "/pagesPlus/main/prize-record/index");
  if (!route) {
    uni.showToast({ title: "暂无可查看内容", icon: "none" });
    return;
  }
  emit("close");
  navigateToPrizeRecord(route);
}
</script>

<style lang="scss" scoped>
.comment-result-modal,
.comment-result-modal .winPrize_Box_bg,
.comment-result-modal .winPrize_Box {
  position: fixed;
  inset: 0;
}

.comment-result-modal {
  z-index: 99999;
}

.comment-result-modal .winPrize_Box_bg,
.comment-result-modal.losePrizeBox {
  background: rgba(0, 0, 0, 0.58);
}

.comment-result-modal .winPrize_Box_bg {
  z-index: 10003;
}

.comment-result-modal .winPrize_Box {
  z-index: 10005;
  animation: commentResultPop 0.4s linear 1;
}

.comment-result-modal .untitledAnimation_box {
  position: relative;
  width: 100%;
  height: 100%;
}

.comment-result-modal .untitledAnimation {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1200rpx;
  height: 1200rpx;
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-sunlight-circle-bg-9d128783.png") no-repeat center;
  background-size: contain;
  transform: translate(-50%, -50%);
  transform-origin: center center;
  animation: commentLightRotate 8s linear infinite;
}

.comment-result-modal .win-prize-light {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 614rpx;
  height: 614rpx;
  transform: translate(-50%, -48%);
}

.comment-result-modal .winPrizeBox {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 646rpx;
  height: 806rpx;
  max-width: 92vw;
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-prize-bg-7c92e47e.png");
  background-size: 100% 100%;
  transform: translate(-50%, -50%);
}

.comment-result-modal .winningAward {
  position: absolute;
  top: -180rpx;
  left: 50%;
  width: 524rpx;
  height: 150rpx;
  margin-left: -262rpx;
}

.comment-result-modal .winningAwardPop {
  position: absolute;
  left: 0;
  bottom: 820rpx;
  width: 100%;
}

.comment-result-modal .winPrize {
  margin-top: 184rpx;
}

.comment-result-modal .winPrizeImgBox {
  position: relative;
  width: 224rpx;
  height: 224rpx;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 20rpx;
}

.comment-result-modal .winPrizeImg {
  display: block;
  width: 100%;
  height: 100%;
}

.comment-result-modal .winPrizeGrade {
  position: absolute;
  left: 50%;
  bottom: 0;
  display: block;
  width: 100%;
  height: 48rpx;
  border-radius: 0 0 20rpx 20rpx;
  opacity: 0.9;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 48rpx;
  text-align: center;
  background: linear-gradient(90deg, #1c80ff 0.02%, #9237ff 100%);
  transform: translateX(-50%);
}

.comment-result-modal .winPrizeName {
  display: -webkit-box;
  width: 378rpx;
  height: 80rpx;
  margin: 24rpx auto 0;
  overflow: hidden;
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 40rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.comment-result-modal .claimRewards {
  position: absolute;
  bottom: -18rpx;
  left: 50%;
  display: block;
  width: 426rpx;
  height: 98rpx;
  margin-left: -212rpx;
  cursor: pointer;
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-award-btn-98d71572.png") no-repeat;
  background-size: cover;
}

.comment-result-modal .claimRewardsText {
  position: absolute;
  width: 2rpx;
  height: 2rpx;
  overflow: hidden;
  opacity: 0;
}

.comment-result-modal .toLuckyDraw {
  width: 410rpx;
  margin: 20rpx auto 0;
  padding: 10rpx 0;
  border-radius: 24rpx;
  cursor: pointer;
  color: #ccc;
  font-size: 24rpx;
  line-height: 40rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.08);
}

.comment-result-modal .toLuckyDraw__line {
  display: block;
}

.comment-result-modal .toLuckyDraw .prizeTipsText {
  display: inline;
  color: #fdf8c3;
}

.comment-result-modal .closeWinPrizeBox,
.comment-result-modal .closeLosePrizeBox {
  position: absolute;
  left: 50%;
  bottom: -100rpx;
  width: 52rpx;
  height: 52rpx;
  opacity: 0.7;
  transform: translateX(-50%);
}

.comment-result-modal .losePrize {
  position: absolute;
  left: 50%;
  top: 40%;
  width: 610rpx;
  height: 528rpx;
  box-sizing: border-box;
  border-radius: 48rpx;
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-lose-prize-icon-c9e67e0a.png") no-repeat;
  background-size: cover;
  transform: translate(-50%, -50%);
}

.comment-result-modal .losePrizeText {
  position: absolute;
  bottom: 128rpx;
  left: 50%;
  color: #fff;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 40rpx;
  white-space: nowrap;
  transform: translateX(-50%);
}

.comment-result-modal .toLuckyDrawTwo {
  position: absolute;
  bottom: 48rpx;
  left: 50%;
  cursor: pointer;
  color: #fff;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 40rpx;
  opacity: 0.5;
  white-space: nowrap;
  transform: translateX(-50%);
}

.comment-result-modal .toLuckyDrawTwo .tool-luckydraw {
  display: inline;
  color: #33b8ff;
  font-weight: 700;
}

@keyframes commentResultPop {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(0.5);
  }

  75% {
    transform: scale(0.75);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes commentLightRotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
