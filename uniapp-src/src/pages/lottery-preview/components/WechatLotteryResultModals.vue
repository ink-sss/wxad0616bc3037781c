<template>
  <view v-if="activeModal === 'wechatLotteryWin'" class="wechat-draw-panel source-win-modal">
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
        <image class="lotteryTop" :src="image.lotteryTop" mode="widthFix" />
        <image class="lotteryFloor" :src="image.lotteryFloor" mode="widthFix" />
        <image class="lotteryFloorLine" :src="image.lotteryLine" mode="widthFix" />
        <view class="luckydrawMiddle">
          <view class="middleMargin"></view>
          <image class="luckydrawCongrats" :src="image.congrats" mode="widthFix" />
          <text class="prizename">{{ prizeTitle }}</text>
          <image class="writeoffRemind" :src="image.writeoff" mode="widthFix" />
          <view class="verifynoView">
            <text class="verifyno">{{ orderText }}</text>
            <view class="verifynoLine"></view>
            <view class="copyView">
              <image class="copyIcon" :src="image.copyIcon" mode="aspectFill" />
              <text class="copyText">复制</text>
            </view>
          </view>
          <text class="perfectAddress" @click="handlePrizeAction">{{ actionText }}</text>
          <text class="inDrawRecord" @click="handleRecordAction">前往 <text class="inDrawRecordKeyword">中奖记录</text> 查看详情</text>
          <!-- <view class="floorMargin"></view> -->
        </view>
      </view>
      <image class="floorClose" :src="image.floorClose" mode="aspectFill" @click="emit('close')" />
    </view>
  </view>

  <view v-if="activeModal === 'wechatLotteryLose'" class="wechat-draw-panel">
    <view class="notPrizeBg"></view>
    <view class="notPrizeView">
      <view class="notPrizeInfo">
        <view class="notPrizeMargin"></view>
        <text class="notPrizeText">很遗憾，大奖与您擦肩而过~</text>
        <text class="notPrizeNav" @click="handleRecordAction">前往中奖记录</text>
      </view>
      <image class="floorClose" :src="image.floorClose" mode="aspectFill" @click="emit('close')" />
    </view>
  </view>

  <view v-if="activeModal === 'wechatLotteryPerfect'" class="wechat-perfect">
    <view class="perfect-card">
      <text class="perfect-title">完善信息</text>
      <text class="perfect-input">请输入姓名</text>
      <text class="perfect-input">请输入手机号</text>
      <view class="perfect-row">
        <text>请输入验证码</text>
        <text class="send-code">获取验证码</text>
      </view>
      <text class="perfect-input">请输入地址</text>
      <text class="perfect-confirm">确定</text>
      <image class="perfect-close" :src="image.floorClose" mode="aspectFill" @click="emit('close')" />
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { navigateToPrizeRecord, navigateWithH5Fallback, normalizeAppRoute } from "@/utils/route-navigation";

const props = defineProps({
  activeModal: {
    type: String,
    required: true
  },
  prize: {
    type: Object,
    default: () => ({})
  },
  recordUrl: {
    type: String,
    default: "/pagesPlus/main/prize-record/index"
  }
});

const emit = defineEmits(["close"]);

const base = "https://man.lqjy.cc/static/Public/Home/Images";
const image = {
  floorClose: `${base}/Watch/luckydraw/floorClose.png`,
  lotteryTop: `${base}/Watch/luckydraw/lotteryTop3.png`,
  lotteryFloor: `${base}/Watch/luckydraw/lotteryFloor.png`,
  lotteryLine: `${base}/Watch/luckydraw/lotteryFloorLine.png`,
  congrats: `${base}/Watch/luckydraw/luckydrawCongrats.png`,
  writeoff: `${base}/Watch/luckydraw/write-offRemind.png`,
  copyIcon: `${base}/Watch/luckydraw/copyIcon.png`,
  element: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-pkenvelope-element3-b60b22b7.png"
};

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function appendQuery(route, params = {}) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!route || !entries.length) return route;
  const query = entries
    .filter(([key]) => !new RegExp(`[?&]${key}=`).test(route))
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  if (!query) return route;
  return `${route}${route.includes("?") ? "&" : "?"}${query}`;
}

const prizeTitle = computed(() => (
  firstValue(props.prize, "name", "title", "prizeName", "prize_name", "rewardName", "reward_name", "productName", "product_name") || "抽奖奖品"
));
const orderNo = computed(() => firstValue(props.prize, "orderNo", "order_no", "outTradeNo", "out_trade_no") || "");
const orderId = computed(() => firstValue(props.prize, "orderId", "order_id") || "");
const roomCode = computed(() => firstValue(props.prize, "roomCode", "room_code", "liveRoomCode", "live_room_code", "_roomCode") || "");
const orderDetailUrl = computed(() => firstValue(props.prize, "orderDetailUrl", "order_detail_url", "orderUrl", "order_url", "detailUrl", "detail_url") || "");
const winRecordUrl = computed(() => firstValue(props.prize, "winRecordUrl", "win_record_url", "recordUrl", "record_url") || props.recordUrl);
const orderText = computed(() => orderNo.value ? `订单号：${orderNo.value}` : "奖品已发放至中奖记录");
const actionText = computed(() => getOrderTarget() ? "查看订单" : "查看奖品");

function normalizeRoute(url) {
  if (!url) return "";
  return normalizeAppRoute(url);
}

function navigateTo(url) {
  const route = normalizeRoute(url);
  if (!route) {
    uni.showToast({ title: "暂无可查看内容", icon: "none" });
    return;
  }
  navigateWithH5Fallback(route);
}

function getOrderTarget() {
  const rawDetailUrl = orderDetailUrl.value;
  if (rawDetailUrl) {
    const detailUrl = normalizeAppRoute(rawDetailUrl);
    if (!/^https?:\/\//i.test(detailUrl)) {
      return appendQuery(detailUrl, { roomCode: roomCode.value });
    }
    if (!orderId.value && !orderNo.value) return detailUrl;
  }
  if (orderId.value) {
    return appendQuery("/pages/order/detail", { id: orderId.value, roomCode: roomCode.value });
  }
  if (orderNo.value) {
    return appendQuery("/pages/order/list", { orderNo: orderNo.value, roomCode: roomCode.value });
  }
  return "";
}

function handlePrizeAction() {
  const orderTarget = getOrderTarget();
  if (orderTarget) return navigateTo(orderTarget);
  handleRecordAction();
}

function handleRecordAction() {
  navigateToPrizeRecord(winRecordUrl.value || props.recordUrl);
}
</script>

<style lang="scss" scoped>
.wechat-draw-panel,
.wechat-perfect {
  position: fixed;
  inset: 0;
  z-index: 99999;
}

.source-win-modal .luckydrawBg,
.notPrizeBg {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.notPrizeView,
.perfect-card {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 640rpx;
  max-width: 90vw;
  transform: translate(-50%, -50%);
}

.notPrizeView {
  min-height: 860rpx;
}

.notPrizeView .floorClose {
  position: absolute;
  left: 50%;
  bottom: -120rpx;
  width: 72rpx;
  height: 72rpx;
  transform: translateX(-50%);
}

.notPrizeInfo {
  width: 100%;
}

.notPrizeInfo {
  position: relative;
  min-height: 744rpx;
  text-align: center;
  border-radius: 0 0 44rpx 44rpx;
  background: #f53c34;
}

.source-win-modal .lotteryTop,
.source-win-modal .lotteryFloor,
.source-win-modal .lotteryFloorLine {
  display: block;
}

.notPrizeMargin {
  height: 176rpx;
}

.perfect-close {
  position: absolute;
  left: 50%;
  bottom: -120rpx;
  width: 72rpx;
  height: 72rpx;
  transform: translateX(-50%);
}

.notPrizeText {
  display: block;
  margin-top: 36rpx;
  color: #fff;
  font-size: 32rpx;
}

.copyText,
.notPrizeNav {
  color: #fff;
  font-size: 32rpx;
}

.perfect-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 440rpx;
  height: 80rpx;
  margin: 32rpx auto 0;
  color: #a23a18;
  font-size: 30rpx;
  font-weight: 700;
  border-radius: 40rpx;
  background: linear-gradient(180deg, #fff8c9, #ffd96d);
}

.notPrizeNav {
  position: absolute;
  left: 50%;
  top: 621rpx;
  display: block;
  cursor: pointer;
  line-height: 44rpx;
  transform: translateX(-50%);
}

.notPrizeInfo {
  background:  url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-noprizebg-ff5f7a55.png") top center / contain no-repeat;
}

.notPrizeText {
  margin-top: 360rpx;
}

.perfect-card {
  padding: 56rpx 48rpx 64rpx;
  box-sizing: border-box;
  border-radius: 32rpx;
  background: #fff;
}

.perfect-title,
.perfect-input,
.perfect-row {
  display: block;
}

.perfect-title {
  margin-bottom: 36rpx;
  color: #333;
  font-size: 40rpx;
  font-weight: 700;
  text-align: center;
}

.perfect-input,
.perfect-row {
  height: 88rpx;
  margin-top: 24rpx;
  padding: 0 28rpx;
  color: #999;
  font-size: 28rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: #f5f5f5;
}

.perfect-row {
  display: flex;
  justify-content: space-between;
}

.send-code {
  color: #ff435f;
}

.source-win-modal {
  overflow: hidden;
}

.source-win-modal .luckydrawBg {
  z-index: 2002;
  background: rgba(0, 0, 0, 0.5);
}

.source-win-modal .luckydrawView {
  position: fixed;
  left: 50%;
  top: 52%;
  z-index: 2003;
  width: 100%;
  transform: translate(-50%, -50%);
}

.source-win-modal .luckydrawInfo {
  position: relative;
  width: 606rpx;
  margin: 0 auto;
  border-radius: 40rpx;
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-lottery-2d8f96df.png");
  background-size: 100% 100%;
  box-shadow: 0 0 40rpx 0 #ffd48b;
  animation: sourceWinFadeInOut 2s infinite;
}

.source-win-modal .lotteryTop {
  position: absolute;
  top: -156rpx;
  left: 138rpx;
  z-index: 1;
  width: 334rpx;
  height: 350rpx;
}

.source-win-modal .lotteryFloor {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 606rpx;
  height: 252rpx;
  border-radius: 40rpx;
}

.source-win-modal .lotteryFloorLine {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 606rpx;
  height: 4rpx;
  transform: translateX(-50%);
}

.source-win-modal .luckydrawMiddle {
  position: relative;
  width: 606rpx;
  margin: 0 auto;
  text-align: center;
  border: 2rpx solid #ffcd92;
  border-radius: 40rpx;
}

.source-win-modal .middleMargin {
  height: 168rpx;
}

.source-win-modal .luckydrawCongrats {
  display: block;
  width: 342rpx;
  height: 68rpx;
  margin: 0 auto;
}

.source-win-modal .prizename {
  display: block;
  margin: 26rpx 44rpx 0;
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 52rpx;
  text-align: center;
}

.source-win-modal .writeoffRemind {
  display: none;
  width: 508rpx;
  height: 174rpx;
  margin: 0 auto;
}

.source-win-modal .verifynoView {
  display: none;
  align-items: center;
  justify-content: center;
  width: 502rpx;
  height: 88rpx;
  margin: 32rpx auto 0;
  border-radius: 44rpx;
  background: rgba(255, 170, 142, 0.51);
  box-shadow: inset 0 0 20rpx 0 rgba(255, 0, 0, 0.05);
}

.source-win-modal .verifyno {
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
}

.source-win-modal .verifynoLine {
  width: 2rpx;
  height: 24rpx;
  margin: 0 16rpx;
  background: rgba(255, 255, 255, 0.19);
}

.source-win-modal .copyView {
  display: flex;
  align-items: center;
}

.source-win-modal .copyIcon {
  display: block;
  width: 28rpx;
  height: 28rpx;
}

.source-win-modal .copyText {
  margin-left: 8rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.source-win-modal .perfectAddress {
  display: block;
  width: 422rpx;
  height: 88rpx;
  margin: 64rpx auto 0;
  cursor: pointer;
  color: #ff0e4c;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 88rpx;
  text-align: center;
  border-radius: 50rpx;
  background: linear-gradient(180deg, #fff3e8 0%, #ffc8af 86%, #ffd3c1 100%);
  box-shadow: inset 0 0 6rpx 0 rgba(255, 255, 255, 0.28), inset 0 -6rpx 6rpx 0 rgba(253, 248, 232, 0.34);
}

.source-win-modal .inDrawRecord {
  // display: block;
  // margin-top: 52rpx;
  height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.49);
  font-size: 28rpx;
  text-align: center;
}

.source-win-modal .inDrawRecordKeyword {
  color: #fff;
  font-weight: 700;
}

.source-win-modal .floorMargin {
  height: 32rpx;
}

.source-win-modal .floorClose {
  display: block;
  width: 84rpx;
  height: 84rpx;
  margin: 34rpx auto 0;
}

.source-win-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 540rpx;
  min-height: 56rpx;
  margin: 28rpx auto 0;
  padding: 0 24rpx;
  box-sizing: border-box;
  color: #ff596f;
  font-size: 28rpx;
  border-radius: 32rpx;
  background: rgba(255, 245, 204, 0.88);
}

.source-win-speaker {
  margin-right: 12rpx;
  color: #ff1e51;
  transform: rotate(180deg);
}

.source-win-modal .element {
  position: absolute;
  top: -240rpx;
  width: 100%;
  height: 20vh;
  overflow-x: hidden;
}

.source-win-modal .element .element1,
.source-win-modal .element .element2,
.source-win-modal .element .element3,
.source-win-modal .element .element4,
.source-win-modal .element .element5,
.source-win-modal .element .element6 {
  position: absolute;
  left: 50%;
  top: 100%;
  width: 50rpx;
  height: 50rpx;
  margin-left: -24rpx;
  opacity: 0;
}

.source-win-modal .element .element1 {
  animation: sourceWinElement1 2.5s infinite;
}

.source-win-modal .element .element2 {
  animation: sourceWinElement2 2.5s infinite;
}

.source-win-modal .element .element3 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceWinElement3 2.8s infinite;
}

.source-win-modal .element .element4 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceWinElement4 2.8s infinite;
}

.source-win-modal .element .element5 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceWinElement5 3s infinite;
}

.source-win-modal .element .element6 {
  width: 30rpx;
  height: 30rpx;
  animation: sourceWinElement6 3s infinite;
}

@keyframes sourceWinFadeInOut {
  0%,
  100% {
    box-shadow: 4rpx 4rpx 80rpx 4rpx #ffd48b;
  }

  50% {
    box-shadow: 4rpx 4rpx 20rpx 4rpx #ffd48b;
  }
}

@keyframes sourceWinElement1 {
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

@keyframes sourceWinElement2 {
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
    transform: rotate(360deg);
  }
}

@keyframes sourceWinElement3 {
  0% {
    opacity: 0;
    transform: rotate(0deg);
  }

  50% {
    opacity: 0.8;
  }

  100% {
    left: 100%;
    top: 100rpx;
    opacity: 0;
    transform: rotate(360deg);
  }
}

@keyframes sourceWinElement4 {
  0% {
    opacity: 0;
    transform: rotate(0deg);
  }

  50% {
    opacity: 0.8;
  }

  100% {
    left: 0;
    top: 100rpx;
    opacity: 0;
    transform: rotate(360deg);
  }
}

@keyframes sourceWinElement5 {
  0% {
    opacity: 0;
    transform: rotate(0deg);
  }

  30% {
    opacity: 0.4;
  }

  55%,
  100% {
    opacity: 0;
  }

  100% {
    left: 100%;
    top: -150rpx;
    transform: rotate(360deg);
  }
}

@keyframes sourceWinElement6 {
  0% {
    opacity: 0;
    transform: rotate(0deg);
  }

  30% {
    opacity: 0.4;
  }

  55%,
  100% {
    opacity: 0;
  }

  100% {
    left: 100rpx;
    top: -200rpx;
    transform: rotate(360deg);
  }
}
</style>
