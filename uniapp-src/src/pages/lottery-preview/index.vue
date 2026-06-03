<template>
  <view class="lottery-preview-page">
    <view class="preview-header">
      <text class="preview-title">弹框合集预览</text>
      <text class="preview-subtitle">同步链接源码中已下发的隐藏弹框、抽奖动画和主要样式</text>
    </view>

    <view v-for="group in modalGroups" :key="group.title" class="preview-section">
      <text class="section-title">{{ group.title }}</text>
      <view class="preview-actions">
        <button
          v-for="item in group.items"
          :key="item.key"
          class="preview-button"
          :class="{ primary: item.primary }"
          @click="openModal(item.key)"
        >
          {{ item.label }}
        </button>
      </view>
    </view>

    <view class="preview-section">
      <text class="section-title">观看奖励领取提示1</text>
      <view class="preview-actions">
        <button class="preview-button primary" @click="openModal('watchRewardToastCoupon')">
          优惠券飘条
        </button>
        <button class="preview-button" @click="openModal('watchRewardToastGoods')">
          商品飘条
        </button>
      </view>
    </view>

    <view class="preview-note">
      <text>资源来自原 H5 静态地址；二维码、名单、金额为演示数据。</text>
    </view>

    <view v-if="hasActiveModal" class="modal-mask" @click="closeModal"></view>

    <LotteryModals
      :active-modal="activeModal"
      :assets="assets"
      :winners="winners"
      @close="closeModal"
    />
    <WechatLotteryModals
      :active-modal="activeModal"
      :winners="winners"
      @close="closeModal"
    />
    <WechatLotteryAwardsUserModal
      :active-modal="activeModal"
      :winners="winners"
      @close="closeModal"
    />
    <WechatLotteryResultModals
      :active-modal="activeModal"
      @close="closeModal"
    />
    <SlotLotteryModals
      :active-modal="activeModal"
      :winners="winners"
      @close="closeModal"
    />
    <CommentPrizeRuleModal
      :active-modal="activeModal"
      :activity="previewCommentLotteryActivity"
      :prizes="previewCommentLotteryPrizes"
      :tip-text="previewCommentLotteryTipText"
      @close="closeModal"
      @send-comment="startCommentLotteryFlow"
    />
    <CommentPrizeConfirmModal
      :active-modal="activeModal"
      @close="closeModal"
    />
    <CommentSlotLotteryModals
      :active-modal="activeModal"
      :winners="winners"
      @close="closeModal"
    />
    <CommentLotteryResultModals
      :active-modal="activeModal"
      @close="closeModal"
    />
    <CommentLotteryPasswordModal
      :active-modal="activeModal"
      @close="closeModal"
    />
    <CouponPushModals
      :active-modal="activeModal"
      @close="closeModal"
    />
    <CouponReceiveModals
      :active-modal="activeModal"
      :assets="assets"
      @close="closeModal"
    />
    <CouponOrderModals
      :active-modal="activeModal"
      @close="closeModal"
    />
    <TaskCouponModals
      :active-modal="activeModal"
      @close="closeModal"
    />
    <ShakeLotteryModals
      :active-modal="activeModal"
      @close="closeModal"
    />
    <EnvelopeRewardModals
      :active-modal="activeModal"
      :assets="assets"
      :red-records="redRecords"
      :reward-records="rewardRecords"
      @close="closeModal"
    />
    <AuthPurchaseModals
      :active-modal="activeModal"
      :assets="assets"
      @close="closeModal"
    />
    <PayPunchModals
      :active-modal="activeModal"
      :assets="assets"
      @close="closeModal"
    />
    <WatchDurationRewardModal
      :active-modal="activeModal"
      :assets="assets"
      @close="closeModal"
    />

    <view v-if="activeRewardBroadcast" class="watch-reward-competitor-preview">
      <view class="watch_reward_animations">
        <view class="watch-reward-animation-list">
          <view
            :key="`${activeModal}-${rewardBroadcastRenderKey}`"
            class="watch_reward-eb leftChangeZeroAnimation"
          >
            <view class="watch_reward-eb-con">
              <image
                class="watch_reward_img"
                src="./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-num-watch-reward-icon-422b8d60.png"
                mode="aspectFill"
              />
              <text class="watch_reward_name">{{ activeRewardBroadcast.username }}</text>
              <text class="watch_reward_action">获得</text>
              <text class="reward-amount">{{ activeRewardBroadcast.rewardText }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import AuthPurchaseModals from "./components/AuthPurchaseModals.vue";
import CommentLotteryPasswordModal from "./components/CommentLotteryPasswordModal.vue";
import CommentLotteryResultModals from "./components/CommentLotteryResultModals.vue";
import CommentSlotLotteryModals from "./components/CommentSlotLotteryModals.vue";
import CommentPrizeConfirmModal from "./components/comment-lottery/CommentPrizeConfirmModal.vue";
import CouponOrderModals from "./components/CouponOrderModals.vue";
import CouponPushModals from "./components/CouponPushModals.vue";
import CouponReceiveModals from "./components/CouponReceiveModals.vue";
import EnvelopeRewardModals from "./components/EnvelopeRewardModals.vue";
import LotteryModals from "./components/LotteryModals.vue";
import PayPunchModals from "./components/PayPunchModals.vue";
import ShakeLotteryModals from "./components/ShakeLotteryModals.vue";
import SlotLotteryModals from "./components/SlotLotteryModals.vue";
import TaskCouponModals from "./components/TaskCouponModals.vue";
import WatchDurationRewardModal from "./components/WatchDurationRewardModal.vue";
import WechatLotteryAwardsUserModal from "./components/wechat-lottery/WechatLotteryAwardsUserModal.vue";
import WechatLotteryModals from "./components/WechatLotteryModals.vue";
import WechatLotteryResultModals from "./components/WechatLotteryResultModals.vue";
import CommentPrizeRuleModal from "@/components/comment-prize-rule-modal.vue";
import { assets, modalGroups, redRecords, rewardRecords, winners } from "./modal-data";

const activeModal = ref("");
const rewardBroadcastRenderKey = ref(0);
const previewCommentLotteryActivity = {
  activityName: "评论抽奖",
  status: 1,
  prizeQuantityDisplay: 1,
  currentUser: { result: "none" }
};
const previewCommentLotteryTipText = "发送评论：12";
const previewCommentLotteryPrizes = [
  {
    id: 1,
    level: "1",
    name: "1",
    img: "./static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg",
    is_open_prize: 2,
    is_display_num: 1,
    num: 10,
    person_count: 0
  },
  {
    id: 2,
    level: "2",
    name: "2",
    img: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-prize-thre-bg-1a948604.png",
    is_open_prize: 0,
    is_display_num: 1,
    num: 1,
    person_count: 0
  }
];
const rewardBroadcastModals = {
  watchRewardToastCoupon: {
    username: "私域运营官",
    rewardText: "观看奖励优惠券1张"
  },
  watchRewardToastGoods: {
    username: "直播间贵客",
    rewardText: "观看奖励商品1件"
  }
};
const activeRewardBroadcast = computed(() => rewardBroadcastModals[activeModal.value] || null);
const hasActiveModal = computed(() => activeModal.value !== "" && !activeRewardBroadcast.value);
let commentLotteryFlowTimers = [];
let rewardBroadcastTimer = null;
const COMMENT_LOTTERY_ROLLING_DURATION = 4000;
const COMMENT_LOTTERY_RESULT_DURATION = 1600;

function openModal(key) {
  clearCommentLotteryFlowTimers();
  clearRewardBroadcastTimer();
  activeModal.value = key;
  if (rewardBroadcastModals[key]) {
    rewardBroadcastRenderKey.value += 1;
    rewardBroadcastTimer = setTimeout(() => {
      if (activeModal.value === key) {
        activeModal.value = "";
      }
      rewardBroadcastTimer = null;
    }, 2800);
  }
}

function closeModal() {
  clearCommentLotteryFlowTimers();
  clearRewardBroadcastTimer();
  activeModal.value = "";
}

function clearCommentLotteryFlowTimers() {
  commentLotteryFlowTimers.forEach((timer) => clearTimeout(timer));
  commentLotteryFlowTimers = [];
}

function setCommentLotteryModalLater(modal, delay) {
  const timer = setTimeout(() => {
    activeModal.value = modal;
  }, delay);
  commentLotteryFlowTimers.push(timer);
}

function clearRewardBroadcastTimer() {
  if (rewardBroadcastTimer) {
    clearTimeout(rewardBroadcastTimer);
    rewardBroadcastTimer = null;
  }
}

function startCommentLotteryFlow() {
  clearCommentLotteryFlowTimers();
  activeModal.value = "commentLotterySlotRolling";
  setCommentLotteryModalLater("commentLotterySlotResult", COMMENT_LOTTERY_ROLLING_DURATION);
  setCommentLotteryModalLater(
    Math.random() < 0.5 ? "commentLotteryWin" : "commentLotteryLose",
    COMMENT_LOTTERY_ROLLING_DURATION + COMMENT_LOTTERY_RESULT_DURATION
  );
}
</script>

<style lang="scss">
.lottery-preview-page {
  min-height: 100vh;
  padding: 96rpx 32rpx 48rpx;
  box-sizing: border-box;
  background: #f6f7fb;
}

.preview-header,
.preview-section {
  display: flex;
  flex-direction: column;
}

.preview-title {
  font-size: 42rpx;
  line-height: 1.25;
  font-weight: 700;
  color: #1f2329;
}

.preview-subtitle,
.preview-note {
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.45;
  color: #60646f;
}

.preview-section {
  margin-top: 36rpx;
}

.section-title {
  margin-bottom: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #1f2329;
}

.preview-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}

.preview-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 82rpx;
  border: 0;
  border-radius: 12rpx;
  background: #fff;
  color: #ff435f;
  font-size: 27rpx;
  font-weight: 600;
  box-shadow: 0 12rpx 32rpx rgba(31, 35, 41, 0.08);
}

.preview-button.primary {
  color: #fff;
  background: linear-gradient(90deg, rgb(255, 84, 63), rgb(255, 67, 97));
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.48);
}

.watch-reward-competitor-preview {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 460rpx;
  z-index: 99998;
  pointer-events: none;
  font-family: PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica, sans-serif;
  overflow: hidden;
}

.watch_reward_animations {
  position: relative;
  width: 550rpx;
  height: 48rpx;
  margin-top: 12rpx;
}

.watch-reward-animation-list {
  position: relative;
  width: 100%;
  height: 100%;
}

.watch_reward-eb {
  display: flex;
  align-items: center;
  width: 550rpx;
  max-width: 550rpx;
  height: 48rpx !important;
  padding: 0 16rpx !important;
  border-radius: 8rpx;
  background: rgba(255, 14, 76, 0.5);
  box-sizing: border-box;
  filter: blur(0);
  overflow: hidden;
}

.watch_reward-eb {
  position: absolute;
  left: 32rpx;
  top: 0;
  z-index: 1;
}

.watch_reward-eb-con {
  display: flex;
  align-items: center;
  max-width: 100%;
  min-width: 0;
  color: #fff;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 48rpx;
  white-space: nowrap;
  overflow: hidden;
}

.watch_reward_img {
  flex: 0 0 32rpx;
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
  object-fit: cover;
}

.watch_reward_name {
  display: block;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 196rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.watch_reward_action {
  flex: 0 0 auto;
  white-space: nowrap;
}

.watch_reward_name,
.reward-amount {
  font-weight: 700;
}

.reward-amount {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  margin-left: 4rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.leftChangeZeroAnimation {
  animation: leftChangeZero 0.3s ease-in-out 1, leftChange 0.5s ease 2.3s 1 forwards;
}

@keyframes leftChangeZero {
  from {
    left: 100%;
  }

  to {
    left: 32rpx;
  }
}

@keyframes leftChange {
  from {
    left: 32rpx;
  }

  to {
    left: -550rpx;
  }
}
</style>
