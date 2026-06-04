<template>
  <view v-if="isVisible" class="commentPrizeBox">
    <view class="commentPrizeBoxBc" @click="handleClose"></view>
    <view class="commentPrizeContent">
      <template v-if="!showRulePanel">
        <view class="commentPrizeContentHeader" @click="openRulePanel"></view>
        <view class="closeCommentPrizeBox" @click.stop="handleClose">
          <image class="closeCommentPrizeIcon" :src="image.lotteryClose" mode="aspectFill" />
        </view>
        <image class="lottery_comment" :src="image.commentHeader" mode="aspectFill" />
        <view class="commentPrizeContentBox">
          <scroll-view class="commentPrizeUl" scroll-x>
            <view class="commentPrizeUlTrack">
              <view
                v-for="(item, index) in displayPrizeCards"
                :key="item.key"
                :class="[item.cardClass, index === displayPrizeCards.length - 1 ? 'commentPrizeCardLast' : '']"
              >
                <view :class="['haveInHand', item.badgeClass]"></view>
                <view :class="['forbidenForCommentPrize', { forbidenForCommentPrizeShow: item.isDrawn }]"></view>
                <view :class="['commentPrizeLiImgBox', item.imageBoxClass]">
                  <image class="commentPrizeLiImg" :src="item.image" mode="aspectFill" />
                  <view class="commentPrizeLiBottom">
                    <text :class="['commentPrizeLiNum', item.numClass]">{{ item.level }}</text>
                    <text :class="['prizeNickone', item.nameClass]">{{ item.name }}</text>
                    <view v-if="item.showPrizeNum" :class="['prizeNum', { prizeNumOne: item.isOnePrize }]">
                      <text v-if="item.showCount" class="prizeNumText">共{{ item.countText }}份</text>
                      <view v-if="item.showCount" class="prizeNumTextLine"></view>
                      <text class="prizeNumText">{{ item.participantText }}人已参与</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
          <view v-if="showParticipateActions" class="commentPrizeText">
            <view class="commentPrizeTextC">
              <view class="wordTextContentBox">
                <text class="wordTextTitle">参与条件</text>
                <text class="wordTextContentRight">{{ userStatusText }}</text>
              </view>
              <text class="wordTextContent">{{ conditionText }}</text>
            </view>
            <text class="commentPrizeSpeak" @click="handleSendComment">{{ actionText }}</text>
          </view>
        </view>
      </template>
      <view v-else class="rulePanel">
        <image class="explainUlArrowLeft" :src="image.arrowLeft" mode="aspectFill" @click="closeRulePanel" />
        <view class="closeCommentPrizeBox" @click.stop="handleClose">
          <image class="closeCommentPrizeIcon" :src="image.lotteryClose" mode="aspectFill" />
        </view>
        <view class="explainUl">
          <text class="explainTitle">抽奖规则</text>
          <text v-for="rule in lotteryRules" :key="rule" class="explainli">{{ rule }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  activeModal: {
    type: String,
    required: true
  },
  activity: {
    type: Object,
    default: () => ({})
  },
  prizes: {
    type: Array,
    default: () => []
  },
  tipText: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["close", "send-comment"]);
const showRulePanel = ref(false);

const image = {
  lotteryClose: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-lottery-close-icon-0ad17f9d.png",
  commentHeader: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-lottery-comment-header-abb7423b.png",
  arrowLeft: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-commons-arrow-left-gray-f0a8573f.png",
  productOne: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-sign-gift-5def5533.png",
  productTwo: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg",
  productThree: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-prize-bg-7c92e47e.png"
};

const fallbackPrizeCards = [
  { id: "fallback-1", level: "1", name: "评论奖品", img: image.productOne, is_open_prize: 2, num: 1, person_count: 0, is_display_num: 1 },
  { id: "fallback-2", level: "2", name: "互动福利", img: image.productTwo, is_open_prize: 0, num: 1, person_count: 0, is_display_num: 1 },
  { id: "fallback-3", level: "3", name: "直播好礼", img: image.productThree, is_open_prize: 0, num: 1, person_count: 0, is_display_num: 1 }
];

const DEFAULT_TIP_TEXT = "发送指定评论参与抽奖";

const displayPrizeCards = computed(() => {
  const source = props.prizes.length ? props.prizes : fallbackPrizeCards;
  const prizeListLength = source.length;
  return source.map((item, index) => {
    const status = getCompetitorPrizeStatus(item);
    const count = toNumber(item.num ?? item.winCount ?? item.rewardQuantity ?? item.quantity, 0);
    const participantCount = toNumber(item.person_count ?? item.participantCount, 0);
    const displayNum = Number(item.is_display_num ?? item.prizeQuantityDisplay ?? props.activity?.prizeQuantityDisplay ?? 1) === 1;
    const cardSize = prizeListLength <= 3 ? prizeListLength : 3;
    return {
      key: item.prizeId || item.id || `${item.prizeName || item.name}-${index}`,
      level: item.level || item.prizeLevelText || item.levelText || item.prizeLevel || index + 1,
      name: item.name || item.prizeName || item.productName || "评论抽奖奖品",
      image: item.img || item.productImage || image.productOne,
      countText: formatCommentPrizeNum(count),
      participantText: formatCommentPrizeNum(participantCount, true),
      showCount: displayNum,
      showPrizeNum: prizeListLength < 3,
      isOnePrize: prizeListLength === 1,
      isDrawn: status === 1,
      cardClass: getPrizeCardClass(prizeListLength, status),
      badgeClass: `commentPrizeLiType${status}`,
      imageBoxClass: `commentPrizeLiImgBox${cardSize}`,
      numClass: `commentPrizeLiNum${cardSize}`,
      nameClass: `prizeNickone${cardSize}`
    };
  });
});

const isVisible = computed(() => ["commentPrizeRule", "commentLotteryList"].includes(props.activeModal));

const hasVisiblePasswordText = computed(() => Boolean(props.tipText && props.tipText !== DEFAULT_TIP_TEXT));
const showParticipateActions = computed(() => Number(props.activity?.status) === 1 && hasVisiblePasswordText.value);

const userStatusText = computed(() => {
  const result = props.activity?.currentUser?.result || "none";
  if (result === "joined") return "已达成";
  if (result === "win") return "已中奖";
  if (result === "lose") return "未中奖";
  if (result === "not_participated") return "未参与本轮";
  return "未达成";
});

const conditionText = computed(() => props.tipText || "发送指定评论参与");
const actionText = computed(() => hasVisiblePasswordText.value ? "一键发送评论" : "去评论区发送");

const lotteryRules = [
  "1. 用户需要在聊天互动区域发送正确抽奖口令",
  "2. 抽奖口令由主播提供/直接显示口令",
  "3. 在主播开奖前发送正确抽奖口令即可获得抽奖资格",
  "4. 每轮抽奖后资格取消，需要重新发送口令"
];

watch(
  () => props.activeModal,
  (activeModal) => {
    if (!["commentPrizeRule", "commentLotteryList"].includes(activeModal)) {
      showRulePanel.value = false;
    }
  }
);

function openRulePanel() {
  showRulePanel.value = true;
}

function closeRulePanel() {
  showRulePanel.value = false;
}

function handleClose() {
  showRulePanel.value = false;
  emit("close");
}

function handleSendComment() {
  showRulePanel.value = false;
  emit("send-comment", conditionText.value);
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCompetitorPrizeStatus(item) {
  if (item.is_open_prize !== undefined) return toNumber(item.is_open_prize);
  const status = toNumber(item.status);
  if (status === 2) return 1;
  if (status === 1) return 2;
  return 0;
}

function getPrizeCardClass(length, status) {
  if (length === 1) return ["notStartBg", "commentPrizeLi"];
  if (length === 2) return ["haveInHandBg", "commentPrizeLi", status === 1 ? "hasBeenHandBg" : "orHandBg"];
  if (length === 3) return ["prizeEndBg", "commentPrizeLi", "threeOrHandBg"];
  return ["fourthBg", "commentPrizeLi", status === 1 ? "threeHasBeenBg" : "threeOrHandBg"];
}

function formatCommentPrizeNum(value, isLarge = false) {
  const num = toNumber(value);
  if (num > 99999) return "10w+";
  if (isLarge) return num;
  if (num > 9999) return "1w+";
  return num;
}
</script>

<style lang="scss" scoped>
.commentPrizeBox {
  position: fixed;
  inset: 0;
  z-index: 99999;
}

.commentPrizeBoxBc {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.commentPrizeContent {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 136rpx 0 64rpx;
  box-sizing: border-box;
  border-radius: 48rpx 48rpx 0 0;
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-bg-new-commentprize-e3b6e811.png") no-repeat;
  background-size: cover;
}

.commentPrizeContentBox {
  width: 100%;
  overflow: hidden;
}

.commentPrizeContentHeader {
  position: absolute;
  left: 6rpx;
  top: 22rpx;
  z-index: 2;
  width: 88rpx;
  height: 88rpx;
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-lottery-tips-icon-4c577585.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 36rpx 36rpx;
}

.closeCommentPrizeBox {
  position: absolute;
  top: 16rpx;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
}

.closeCommentPrizeIcon {
  width: 32rpx;
  height: 32rpx;
}

.lottery_comment {
  position: absolute;
  left: 50%;
  top: 48rpx;
  width: 382rpx;
  height: 40rpx;
  transform: translateX(-50%);
}

.commentPrizeUlBox {
  position: relative;
}

.commentPrizeUl {
  width: 100%;
  padding: 0 32rpx;
  box-sizing: border-box;
}

.commentPrizeUlTrack {
  display: flex;
  flex-wrap: nowrap;
  width: max-content;
  min-width: 100%;
  box-sizing: border-box;
}

.commentPrizeLi {
  position: relative;
  flex-shrink: 0;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.commentPrizeCardLast {
  margin-right: 0;
}

.notStartBg {
  display: flex;
  align-items: center;
  width: 686rpx;
  height: 240rpx;
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-prize-one-bg-bf2bdee8.png") no-repeat;
  background-size: 100% 100%;
}

.haveInHandBg {
  position: relative;
  width: 330rpx;
  height: 380rpx;
  margin-right: 26rpx;
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-prize-two-bg-e8d7bdbd.png") no-repeat;
  background-size: 100% 100%;
}

.threeOrHandBg {
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-prize-thre-bg-1a948604.png") no-repeat;
  background-size: 100% 100%;
}

.prizeEndBg {
  width: 220rpx;
  height: 360rpx;
  margin-right: 14rpx;
}

.fourthBg {
  width: 220rpx;
  height: 356rpx;
  margin-right: 14rpx;
}

.haveInHand {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  width: 94rpx;
  height: 40rpx;
  background-size: 100% 100%;
}

.commentPrizeLiType0 {
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-lottery-not-started-0db79bb6.png");
}

.commentPrizeLiType1 {
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-lottery-drawn-e0e29558.png");
}

.commentPrizeLiType2 {
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-lottery-in-progress-7e8792fb.png");
}

.prizeEndBg .commentPrizeLiImgBox .commentPrizeLiImg,
.fourthBg .commentPrizeLiImgBox .commentPrizeLiImg {
  display: block;
  width: 160rpx;
  height: 160rpx;
  margin: 20rpx auto 12rpx;
  border-radius: 14rpx;
  object-fit: cover;
}

.notStartBg .commentPrizeLiImgBox {
  position: relative;
  display: flex;
  padding-left: 32rpx;
}

.notStartBg .commentPrizeLiImgBox .commentPrizeLiImg {
  display: block;
  width: 176rpx;
  height: 176rpx;
  border-radius: 16rpx;
  object-fit: cover;
}

.notStartBg .commentPrizeLiBottom {
  position: relative;
  padding: 2rpx 0 0 24rpx;
}

.notStartBg .commentPrizeLiNum,
.notStartBg .prizeNickone {
  margin-left: 0;
  margin-right: 0;
  text-align: left;
}

.notStartBg .prizeNum {
  margin-left: 0;
  margin-right: 0;
}

.haveInHandBg .commentPrizeLiImgBox {
  padding-top: 20rpx;
}

.commentPrizeLiImgBox2 {
  padding-top: 48rpx !important;
}

.commentPrizeLiImgBox3 {
  padding-top: 56rpx !important;
}

.haveInHandBg .commentPrizeLiImgBox .commentPrizeLiImg {
  display: block;
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto 12rpx;
  border-radius: 14rpx;
  object-fit: cover;
}

.haveInHandBg .commentPrizeLiImgBox2 .commentPrizeLiImg {
  width: 136rpx !important;
  height: 136rpx !important;
}

.commentPrizeLiImgBox3 .commentPrizeLiImg {
  width: 136rpx !important;
  height: 136rpx !important;
  margin: 0 auto !important;
}

.haveInHandBg .commentPrizeLiBottom {
  padding: 0 24rpx;
}

.commentPrizeLiNum {
  display: block;
  width: 280rpx;
  overflow: hidden;
  color: transparent;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 40rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  text-align: center;
  background: linear-gradient(to right, #e3ccff, #cb8aff);
  background-clip: text;
  -webkit-background-clip: text;
}

.commentPrizeLiNum2 {
  width: 282rpx;
  text-align: center;
  margin: 0 auto;
}

.commentPrizeLiNum3 {
  width: 172rpx !important;
  text-align: center;
  margin: 24rpx auto 0;
}

.prizeNickone {
  display: block;
  width: 422rpx;
  margin: 4rpx auto 0;
  color: transparent;
  font-size: 28rpx;
  line-height: 36rpx;
  text-align: center;
  background: linear-gradient(to right, #fff, #b7b9ff);
  background-clip: text;
  -webkit-background-clip: text;
}

.prizeNickone1 {
  display: -webkit-box;
  overflow: hidden;
  height: 80rpx;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.prizeNickone2 {
  width: 282rpx;
  margin-top: 4rpx;
  overflow: hidden;
  font-size: 24rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prizeNickone3 {
  display: -webkit-box;
  width: 172rpx;
  margin: 4rpx auto 0;
  padding: 0;
  overflow: hidden;
  font-size: 24rpx;
  text-align: center;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.prizeNum {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  max-width: 300rpx;
  height: 40rpx;
  margin: 16rpx auto 0;
  padding: 0 8rpx;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prizeNumText {
  width: fit-content;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
}

.prizeNumOne {
  justify-content: flex-start;
  margin: 12rpx 0 0;
}

.prizeNumTextLine {
  width: 2rpx;
  height: 20rpx;
  margin: 0 8rpx;
  background: rgba(255, 255, 255, 0.2);
}

.forbidenForCommentPrize {
  position: absolute;
  inset: 0;
  z-index: 99;
  display: none;
  border-radius: 24rpx;
  background: rgba(30, 30, 60, 0.5);
}

.forbidenForCommentPrizeShow {
  display: block;
}

.commentPrizeText {
  padding: 0 32rpx;
}

.commentPrizeTextC {
  padding: 28rpx 32rpx;
  border: 2rpx solid #354162;
  border-radius: 24rpx;
  background: linear-gradient(196deg, #2a3569 0%, #21294c 100%);
}

.wordTextContentBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wordTextTitle {
  color: transparent;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 42rpx;
  background: linear-gradient(to right, #b7b9ff, #fff);
  background-clip: text;
  -webkit-background-clip: text;
}

.wordTextContent,
.wordTextContentRight {
  color: #fff;
  font-size: 24rpx;
  line-height: 36rpx;
}

.wordTextContent {
  display: block;
  margin-top: 14rpx;
}

.commentPrizeSpeak {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  margin: 40rpx auto 0;
  border-radius: 52rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  background: linear-gradient(90deg, #0071ff 0.02%, #8824ff 100%);
}

.rulePanel {
  min-height: 496rpx;
}

.explainUlArrowLeft {
  position: absolute;
  top: 30rpx;
  left: 28rpx;
  z-index: 2;
  width: 16rpx;
  height: 28rpx;
  padding: 20rpx;
  box-sizing: content-box;
}

.explainUl {
  position: relative;
  padding: 0 28rpx 56rpx 48rpx;
}

.explainTitle {
  display: block;
  margin-top: -24rpx;
  color: transparent;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 40rpx;
  background: linear-gradient(to right, #e3ccff 0%, #cb8aff 100%);
  background-clip: text;
  -webkit-background-clip: text;
}

.explainli {
  display: block;
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  line-height: 34rpx;
}
</style>
