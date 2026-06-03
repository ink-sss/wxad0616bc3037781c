<template>
  <view
    v-if="isRolling || activeModal === 'commentLotterySlotResult'"
    class="comment-slot-modal"
  >
    <view v-if="isRolling" class="commentLotteryIngBox">
      <view class="commentLotteryIngWrap">
        <view class="commentLotteryIng">
          <view class="commentLotteryIngUl">
            <view
              v-for="column in rollingColumns"
              :key="column.className"
              :class="column.className"
            >
              <view
                v-for="user in column.users"
                :key="user.key"
                class="commentLotteryIngLi"
              >
                <view class="commentLotteryIngUser">
                  <image class="commentLotteryIngUserPhoto" :src="user.photo" mode="aspectFill" />
                  <text class="commentLotteryIngUserName">{{ user.name }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="commentLotteryIngBottom">
              <text class="commentLotteryIngBottomNum">
                参与此轮抽奖的用户共有
                <text class="commentLotteryIngBottomNumCount">{{ displayUsers.length }}</text>
                人
              </text>
            <view class="commentLotteryIngBottomPrize">
              <view class="commentLotteryIngBottomPrizeImg">
                <image class="commentLotteryIngBottomPrizePic" :src="prizeImage" mode="aspectFill" />
                <text class="commentLotteryIngBottomPrizeTip">{{ prizeLevelText }}</text>
              </view>
              <view class="commentLotteryIngBottomPrizeContent">
                <view class="commentLotteryIngBottomPrizeContentBox">
                  <text class="commentLotteryIngBottomPrizeContentLevel">{{ prizeLevelText }}</text>
                  <text class="commentLotteryIngBottomPrizeContentName">{{ prizeName }}</text>
                </view>
                <text class="commentLotteryIngBottomPrizeContentNum">
                  数量：
                  <text class="commentLotteryIngBottomPrizeContentCount">{{ prizeCount }}</text>
                </text>
              </view>
            </view>
          </view>
        </view>
        <image class="closeCommentLotteryImg close-2" :src="image.close" mode="aspectFill" @click="emit('close')" />
      </view>
    </view>

    <view v-if="activeModal === 'commentLotterySlotResult'" class="commentLottery-bg">
      <view class="commentLottery-absolute">
        <view class="commentLottery-box commentLottery-box3">
          <scroll-view class="commentLottery-ul" scroll-y>
            <view class="winnings-wrap">
              <view
                v-for="winner in resultWinners"
                :key="winner.phone"
                class="winnings"
              >
                <image class="commentLottery-scroll-photo-winnings" :src="winner.photo || image.avatar" mode="aspectFill" />
                <text class="commentLottery-scroll-name-winnings">{{ winner.name }}</text>
                <text class="commentLottery-scroll-phone-winnings">已中奖</text>
              </view>
            </view>
          </scroll-view>
        </view>
        <image class="closeCommentLotteryImg close-1" :src="image.close" mode="aspectFill" @click="emit('close')" />
      </view>
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
  participants: {
    type: Array,
    default: () => []
  },
  prize: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["close"]);

const isRolling = computed(() => props.activeModal === "commentLotteryRunning" || props.activeModal === "commentLotterySlotRolling");

const image = {
  avatar: "./static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg",
  close: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-icon-close-0cb4224d.png",
  gift: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-sign-gift-5def5533.png"
};

const columnClasses = ["lotteryFirst", "lotterySecond", "lotteryThird", "lotteryFourth"];

const fallbackRollingUsers = [
  { key: "comment-slot-fallback-1", name: "直播间观众", photo: image.avatar },
  { key: "comment-slot-fallback-2", name: "互动用户", photo: image.avatar },
  { key: "comment-slot-fallback-3", name: "幸运用户", photo: image.avatar },
  { key: "comment-slot-fallback-4", name: "热心观众", photo: image.avatar }
];

const displayUsers = computed(() => (props.participants.length > 0 ? props.participants : props.winners));
const resultWinners = computed(() => props.winners.slice(0, 20));
const prizeName = computed(() => props.prize.prizeName || props.prize.productName || props.prize.rewardName || "评论抽奖奖品");
const prizeImage = computed(() => props.prize.productImage || props.prize.rewardImage || image.gift);
const prizeLevelText = computed(() => props.prize.levelText || props.prize.prizeLevel || "一等奖");
const prizeCount = computed(() => props.prize.winCount || props.prize.quantity || Math.max(props.winners.length, 1));
const rollingSourceUsers = computed(() => (displayUsers.value.length > 0 ? displayUsers.value : fallbackRollingUsers));

function buildRollingUsers(columnIndex) {
  const source = rollingSourceUsers.value;
  const base = Array.from({ length: Math.max(source.length, 12) }).map((_, index) => {
    const winner = source[(index + columnIndex) % source.length];
    return {
      ...winner,
      key: `base-${columnIndex}-${index}-${winner.key || winner.phone || winner.name}`,
      name: winner.name,
      photo: winner.photo || image.avatar
    };
  });
  return [...base, ...base].map((winner, index) => ({
    ...winner,
    key: `roll-${columnIndex}-${index}-${winner.key}`,
    photo: winner.photo || image.avatar
  }));
}

const rollingColumns = computed(() => columnClasses.map((className, columnIndex) => ({
  className,
  users: buildRollingUsers(columnIndex)
})));
</script>

<style lang="scss" scoped>
.comment-slot-modal,
.comment-slot-modal .commentLotteryIngBox,
.comment-slot-modal .commentLottery-bg {
  position: fixed;
  inset: 0;
  z-index: 99999;
}

.comment-slot-modal .commentLotteryIngBox,
.comment-slot-modal .commentLottery-bg {
  background: rgba(0, 0, 0, 0.58);
}

.comment-slot-modal .commentLotteryIngWrap {
  position: absolute;
  left: 50%;
  top: 42%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
}

.comment-slot-modal .commentLotteryIng {
  width: 662rpx;
  height: 702rpx;
  max-width: 92vw;
  box-sizing: border-box;
  background: url("../static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-comment-lottery-new-bc-4566d5c5.png") no-repeat center;
  background-size: 100% 100%;
}

.comment-slot-modal .commentLotteryIngUl {
  position: relative;
  display: flex;
  width: 472rpx;
  height: 160rpx;
  margin: 120rpx auto 0;
  overflow: hidden;
}

.comment-slot-modal .commentLotteryIngUl .lotteryFirst,
.comment-slot-modal .commentLotteryIngUl .lotterySecond,
.comment-slot-modal .commentLotteryIngUl .lotteryThird,
.comment-slot-modal .commentLotteryIngUl .lotteryFourth {
  position: absolute;
  top: 0;
  width: 104rpx;
  animation: commentSlotRoll 3.64s linear forwards;
  will-change: transform;
}

.comment-slot-modal .commentLotteryIngUl .lotteryFirst {
  left: 14rpx;
}

.comment-slot-modal .commentLotteryIngUl .lotterySecond {
  left: 130rpx;
  animation-delay: 0.12s;
}

.comment-slot-modal .commentLotteryIngUl .lotteryThird {
  left: 244rpx;
  animation-delay: 0.24s;
}

.comment-slot-modal .commentLotteryIngUl .lotteryFourth {
  left: 358rpx;
  animation-delay: 0.36s;
}

.comment-slot-modal .commentLotteryIngLi {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160rpx;
  margin-bottom: 20rpx;
}

.comment-slot-modal .commentLotteryIngUser {
  width: 104rpx;
  height: 140rpx;
  border-radius: 16rpx;
  color: #999;
  font-size: 20rpx;
  text-align: center;
  background: #f7e1ff;
}

.comment-slot-modal .commentLotteryIngUserPhoto {
  width: 76rpx;
  height: 76rpx;
  margin-top: 16rpx;
  margin-bottom: 8rpx;
  border-radius: 50%;
}

.comment-slot-modal .commentLotteryIngUserName {
  display: block;
  width: 80rpx;
  margin-left: 12rpx;
  overflow: hidden;
  color: #333;
  font-size: 20rpx;
  line-height: 28rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-slot-modal .commentLotteryIngBottom {
  margin-top: 160rpx;
}

.comment-slot-modal .commentLotteryIngBottomNum {
  display: block;
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 44rpx;
  text-align: center;
}

.comment-slot-modal .commentLotteryIngBottomNumCount {
  margin: 0 8rpx;
  color: #fdf8c3;
}

.comment-slot-modal .commentLotteryIngBottomPrize {
  display: flex;
  align-items: center;
  width: 564rpx;
  height: 152rpx;
  margin: 16rpx auto 0;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 4rpx rgba(255, 255, 255, 0.59);
}

.comment-slot-modal .commentLotteryIngBottomPrizeImg {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  margin-right: 20rpx;
  margin-left: 16rpx;
  border-radius: 16rpx;
}

.comment-slot-modal .commentLotteryIngBottomPrizePic {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
}

.comment-slot-modal .commentLotteryIngBottomPrizeTip {
  position: absolute;
  left: 50%;
  bottom: -10rpx;
  width: 132rpx;
  height: 28rpx;
  color: #fff;
  font-size: 16rpx;
  line-height: 28rpx;
  text-align: center;
  border-radius: 14rpx;
  background: linear-gradient(90deg, #34b8ff, #a337ff);
  transform: translateX(-50%);
}

.comment-slot-modal .commentLotteryIngBottomPrizeContent {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 392rpx;
  height: 120rpx;
  color: #fff;
  font-size: 28rpx;
  text-align: left;
}

.comment-slot-modal .commentLotteryIngBottomPrizeContentBox {
  display: -webkit-box;
  overflow: hidden;
  color: #fff;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.comment-slot-modal .commentLotteryIngBottomPrizeContentLevel {
  margin-right: 8rpx;
  padding: 0 8rpx;
  border-radius: 8rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 34rpx;
  background: linear-gradient(90deg, #34b8ff, #a337ff);
}

.comment-slot-modal .commentLotteryIngBottomPrizeContentName,
.comment-slot-modal .commentLotteryIngBottomPrizeContentNum {
  color: #fff;
  font-size: 28rpx;
  line-height: 40rpx;
}

.comment-slot-modal .commentLotteryIngBottomPrizeContentCount {
  font-weight: 700;
}

.comment-slot-modal .commentLottery-absolute {
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
}

.comment-slot-modal .commentLottery-box {
  width: 606rpx;
  // min-height: 764rpx;
  overflow: hidden;
  border-radius: 48rpx;
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 100% auto;
  background-color: #1a1b3a;
  box-sizing: border-box;
}

.comment-slot-modal .commentLottery-box3 {
  background-image: url("../static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-open-more-prize-96ca7a91.png");
}

.comment-slot-modal .commentLottery-ul {
  width: 100%;
  max-height: 664rpx;
  margin: 136rpx auto 0;
  padding: 0 32rpx 40rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

.comment-slot-modal .winnings-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  padding: 24rpx 16rpx;
  box-sizing: border-box;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 2rpx rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(28rpx);
}

.comment-slot-modal .commentLottery-ul .winnings {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200rpx;
  padding: 24rpx 0;
}


.comment-slot-modal .commentLottery-scroll-photo-winnings {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 12rpx;
  border-radius: 50%;
}

.comment-slot-modal .commentLottery-scroll-name-winnings {
  max-width: 180rpx;
  overflow: hidden;
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 34rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-slot-modal .commentLottery-scroll-phone-winnings {
  margin-top: 4rpx;
  color: #fdf8c3;
  font-size: 22rpx;
  line-height: 32rpx;
}



.comment-slot-modal .closeCommentLotteryImg {
  display: block;
  width: 64rpx;
  height: 64rpx;
  margin: 48rpx auto 0;
}
.comment-slot-modal .closeCommentLotteryImg.close-1{
  margin-top: 20rpx;
}
.comment-slot-modal .closeCommentLotteryImg.close-2{
  margin-top: 54rpx;
}
@keyframes commentSlotRoll {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-50%);
  }

  50.01% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-25%);
  }
}
</style>
