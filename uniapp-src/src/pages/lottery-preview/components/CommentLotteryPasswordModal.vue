<template>
  <view v-if="activeModal === 'commentPasswordChanged'" class="commentLotteryPop-up">
    <view class="commentLotteryPop-box commentLotteryPop-box1">
      <view class="lapseTop"></view>
      <view class="lapseContent">
        <text class="commentLotteryPop-title">请点击【一键发送评论】重新发送</text>
        <view class="rafflePassword">
          <text class="rafflePasswordTitle">抽奖口令</text>
          <text class="commentLotteryPop-newPassword">{{ displayPasswordText }}</text>
        </view>
        <text class="goToComment" @click="emit('send-comment')">一键发送评论</text>
        <view class="auto-close">
          <text class="auto-close-count">{{ remainSeconds }}</text>
          <text>s 后自动关闭</text>
        </view>
      </view>
      <image class="commentLotteryPop-pic" :src="closeIcon" mode="aspectFill" @click="emit('close')" />
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
  passwordText: {
    type: String,
    default: "好运连连"
  },
  countdown: {
    type: Number,
    default: 10
  }
});

const emit = defineEmits(["close", "send-comment"]);
const closeIcon = "./static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-commons-close-icon-75e80e51.png";
const displayPasswordText = computed(() => String(props.passwordText || "").trim() || "好运连连");
const remainSeconds = ref(props.countdown);
let timer = null;

function clearAutoCloseTimer() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}

function startAutoCloseTimer() {
  clearAutoCloseTimer();
  remainSeconds.value = Math.max(Number(props.countdown) || 10, 1);
  timer = setInterval(() => {
    remainSeconds.value -= 1;
    if (remainSeconds.value <= 0) {
      clearAutoCloseTimer();
      emit("close");
    }
  }, 1000);
}

watch(
  () => props.activeModal,
  (modal) => {
    if (modal === "commentPasswordChanged") {
      startAutoCloseTimer();
      return;
    }
    clearAutoCloseTimer();
  },
  { immediate: true },
);

onBeforeUnmount(clearAutoCloseTimer);
</script>

<style lang="scss" scoped>
.commentLotteryPop-up {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.5);
}

.commentLotteryPop-box {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 10002;
  width: 606rpx;
  height: 632rpx;
  border-radius: 48rpx;
  background-image: url("../static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-lapse-small-bg-new-8d7430b4.png");
  background-size: 100% 100%;
  transform: translate(-50%, -50%);
}

.commentLotteryPop-pic {
  position: absolute;
  left: 50%;
  bottom: -100rpx;
  width: 52rpx;
  height: 52rpx;
  margin-left: -26rpx;
  opacity: 0.7;
}

.lapseTop {
  height: 132rpx;
}

.lapseContent {
  position: relative;
  z-index: 10002;
  width: 542rpx;
  height: 452rpx;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 2rpx rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(28rpx);
}

.commentLotteryPop-title {
  display: block;
  margin: 48rpx auto 0;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  text-align: center;
}

.rafflePassword {
  width: 472rpx;
  height: 128rpx;
  margin: 24rpx auto 0;
  border: 2rpx solid #6c77be;
  border-radius: 24rpx;
  background: linear-gradient(184deg, #283063 0%, #1d213d 100%);
}

.rafflePasswordTitle {
  display: block;
  padding-top: 20rpx;
  margin-bottom: 4rpx;
  color: #bcb1c9;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 40rpx;
  text-align: center;
}

.commentLotteryPop-newPassword {
  display: block;
  padding: 0 28rpx;
  color: #e3ccff;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 40rpx;
  text-align: center;
}

.goToComment {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 478rpx;
  height: 88rpx;
  margin: 32rpx auto 0;
  border-radius: 52rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  background: linear-gradient(90deg, #0071ff 0.02%, #8824ff 100%);
}

.auto-close {
  display: flex;
  justify-content: center;
  margin-top: 16rpx;
  color: #bcb1c9;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 40rpx;
}

.auto-close-count {
  margin-right: 4rpx;
  color: #fff;
  font-weight: 700;
}
</style>
