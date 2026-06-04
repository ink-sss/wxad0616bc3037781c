<template>
  <CommentPrizeRuleModal
    v-if="shouldRenderCommentLotteryPanel"
    :active-modal="commentLotteryActiveModal"
    :activity="commentLotteryPanelActivity"
    :prizes="commentLotteryPanelPrizes"
    :tip-text="commentLotteryTipText"
    @close="closeBroadcastModal"
    @send-comment="emit('send-comment-lottery', $event)"
  />
  <CommentPrizeConfirmModal
    v-if="shouldRenderCommentLotteryPanel"
    :active-modal="commentLotteryActiveModal"
    @close="closeBroadcastModal"
  />
  <CommentSlotLotteryModals
    v-if="shouldRenderCommentLotterySlot"
    :active-modal="commentLotteryActiveModal"
    :winners="commentLotteryWinners"
    :participants="commentLotteryParticipants"
    :prize="commentLotteryPrize"
    @close="closeBroadcastModal"
  />
  <CommentLotteryResultModals
    v-if="shouldRenderCommentLotteryResult"
    :active-modal="commentLotteryActiveModal"
    :prize="commentLotteryPrize"
    :win-record="commentLotteryWinRecord"
    :record-url="prizeRecordUrl"
    @close="closeBroadcastModal"
  />
  <CommentLotteryPasswordModal
    v-if="shouldRenderCommentLotteryPassword"
    :active-modal="commentLotteryActiveModal"
    :password-text="commentLotteryPasswordChangedText"
    @close="closeBroadcastModal"
    @send-comment="emit('send-comment-lottery', $event)"
  />
  <WechatLotteryModals
    v-if="shouldRenderWechatLottery"
    :active-modal="normalLotteryActiveModal"
    :winners="normalLotteryParticipants"
    :prize="normalLotteryPrize"
    @close="emit('close-normal-lottery')"
  />
  <SlotLotteryModals
    v-if="shouldRenderSlotLottery"
    :active-modal="normalLotteryActiveModal"
    :winners="normalLotteryParticipants"
    :result-winners="normalLotteryWinners"
    :prize="normalLotteryPrize"
    @close="emit('close-normal-lottery')"
  />
  <WechatLotteryAwardsUserModal
    v-if="shouldRenderWechatLotteryAwards"
    :active-modal="normalLotteryActiveModal"
    :winners="normalLotteryWinners"
    :prize="normalLotteryPrize"
    @close="emit('close-normal-lottery')"
  />
  <WechatLotteryResultModals
    v-if="shouldRenderWechatLotteryResult"
    :active-modal="normalLotteryActiveModal"
    :prize="normalLotteryPrize"
    :record-url="prizeRecordUrl"
    @close="emit('close-normal-lottery')"
  />
  <WatchDurationRewardModal
    v-if="shouldRenderWatchReward"
    :active-modal="watchRewardActiveModal"
    :assets="assets"
    :watch-rewards="watchRewardRewards"
    :open-key="watchRewardPanelOpenKey"
    :reward-result="watchRewardResult"
    :record-url="prizeRecordUrl"
    @close="closeWatchRewardModal"
    @claim="emit('claim-watch-reward', $event)"
  />
  <CouponReceiveModals
    v-if="shouldRenderCouponReward"
    :active-modal="couponRewardActiveModal"
    :assets="assets"
    :coupon="watchRewardResult"
    :record-url="prizeRecordUrl"
    @close="emit('close-watch-reward-result')"
  />

  <view v-if="watchRewardBroadcast" class="watch-reward-competitor-preview">
    <view class="watch_reward_animations">
      <view class="watch-reward-animation-list">
        <view
          :key="watchRewardBroadcastKey"
          class="watch_reward-eb leftChangeZeroAnimation"
        >
          <view class="watch_reward-eb-con">
            <image
              class="watch_reward_img"
              src="https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-num-watch-reward-icon-422b8d60.png"
              mode="aspectFill"
            />
            <text class="watch_reward_name">{{ watchRewardBroadcast.nickname }}</text>
            <text class="watch_reward_action">获得</text>
            <text class="reward-amount">
              {{ watchRewardBroadcast.rewardName }}{{ watchRewardBroadcast.rewardQuantity || 1 }}{{ watchRewardBroadcast.unit }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { assets } from "@/components/live-lottery/modal-data";
import CommentLotteryPasswordModal from "@/components/live-lottery/CommentLotteryPasswordModal.vue";
import CommentSlotLotteryModals from "@/components/live-lottery/CommentSlotLotteryModals.vue";
import CommentLotteryResultModals from "@/components/live-lottery/CommentLotteryResultModals.vue";
import SlotLotteryModals from "@/components/live-lottery/SlotLotteryModals.vue";
import WechatLotteryModals from "@/components/live-lottery/WechatLotteryModals.vue";
import WechatLotteryAwardsUserModal from "@/components/live-lottery/wechat-lottery/WechatLotteryAwardsUserModal.vue";
import WechatLotteryResultModals from "@/components/live-lottery/WechatLotteryResultModals.vue";
import WatchDurationRewardModal from "@/components/live-lottery/WatchDurationRewardModal.vue";
import CouponReceiveModals from "@/components/live-lottery/CouponReceiveModals.vue";
import CommentPrizeConfirmModal from "@/components/live-lottery/comment-lottery/CommentPrizeConfirmModal.vue";
import CommentPrizeRuleModal from "@/components/comment-prize-rule-modal.vue";

const COMMENT_LOTTERY_PANEL_MODALS = new Set(["commentPrizeRule", "commentLotteryList", "commentPrizeConfirm"]);
const COMMENT_LOTTERY_SLOT_MODALS = new Set(["commentLotteryRunning", "commentLotterySlotRolling", "commentLotterySlotResult"]);
const COMMENT_LOTTERY_RESULT_MODALS = new Set(["commentLotteryWin", "commentLotteryLose"]);
const COMMENT_LOTTERY_PASSWORD_MODALS = new Set(["commentPasswordChanged"]);
const WECHAT_LOTTERY_MODALS = new Set(["wechatOpenPrizeConfirm", "wechatLotteryCountdown", "wechatLotteryEffect"]);
const SLOT_LOTTERY_MODALS = new Set(["wechatSlotRolling", "wechatSlotResult"]);
const WECHAT_LOTTERY_AWARDS_MODALS = new Set(["wechatLotteryAwards", "wechatLotteryAwardsUser"]);
const WECHAT_LOTTERY_RESULT_MODALS = new Set(["wechatLotteryWin", "wechatLotteryLose", "wechatLotteryPerfect"]);

const props = defineProps({
  normalLotteryActiveModal: { type: String, default: "" },
  normalLotteryPrize: { type: Object, default: () => ({}) },
  normalLotteryWinners: { type: Array, default: () => [] },
  normalLotteryParticipants: { type: Array, default: () => [] },
  watchRewardRewards: { type: Array, default: () => [] },
  watchRewardPanelVisible: { type: Boolean, default: false },
  watchRewardPanelOpenKey: { type: Number, default: 0 },
  watchRewardResult: { type: Object, default: null },
  watchRewardBroadcast: { type: Object, default: null },
  watchRewardBroadcastKey: { type: Number, default: 0 },
  commentLotteryActiveModal: { type: String, default: "" },
  commentLotteryPanelActivity: { type: Object, default: () => ({}) },
  commentLotteryPanelPrizes: { type: Array, default: () => [] },
  commentLotteryTipText: { type: String, default: "" },
  commentLotteryPasswordChangedText: { type: String, default: "" },
  commentLotteryPrize: { type: Object, default: () => ({}) },
  commentLotteryWinners: { type: Array, default: () => [] },
  commentLotteryParticipants: { type: Array, default: () => [] },
  commentLotteryWinRecord: { type: Object, default: null },
  prizeRecordUrl: { type: String, default: "/pages/prize-record/index" }
});

const emit = defineEmits([
  "close-normal-lottery",
  "close-watch-reward-panel",
  "claim-watch-reward",
  "close-watch-reward-result",
  "open-comment-lottery-panel",
  "close-comment-lottery",
  "send-comment-lottery"
]);

const watchRewardActiveModal = computed(() => {
  if (props.watchRewardPanelVisible) return "watchDurationReward";
  if (Number(props.watchRewardResult?.rewardType) === 1) return "watchGoodsReward";
  return "";
});
const couponRewardActiveModal = computed(() => (
  Number(props.watchRewardResult?.rewardType) === 2 ? "couponReceiveSuccess" : ""
));
const shouldRenderCommentLotteryPanel = computed(() => COMMENT_LOTTERY_PANEL_MODALS.has(props.commentLotteryActiveModal));
const shouldRenderCommentLotterySlot = computed(() => COMMENT_LOTTERY_SLOT_MODALS.has(props.commentLotteryActiveModal));
const shouldRenderCommentLotteryResult = computed(() => COMMENT_LOTTERY_RESULT_MODALS.has(props.commentLotteryActiveModal));
const shouldRenderCommentLotteryPassword = computed(() => COMMENT_LOTTERY_PASSWORD_MODALS.has(props.commentLotteryActiveModal));
const shouldRenderWechatLottery = computed(() => WECHAT_LOTTERY_MODALS.has(props.normalLotteryActiveModal));
const shouldRenderSlotLottery = computed(() => SLOT_LOTTERY_MODALS.has(props.normalLotteryActiveModal));
const shouldRenderWechatLotteryAwards = computed(() => WECHAT_LOTTERY_AWARDS_MODALS.has(props.normalLotteryActiveModal));
const shouldRenderWechatLotteryResult = computed(() => WECHAT_LOTTERY_RESULT_MODALS.has(props.normalLotteryActiveModal));
const shouldRenderWatchReward = computed(() => Boolean(watchRewardActiveModal.value));
const shouldRenderCouponReward = computed(() => Boolean(couponRewardActiveModal.value));

function openCommentPrizeRuleModal() {
  emit("open-comment-lottery-panel");
}

function closeBroadcastModal() {
  emit("close-comment-lottery");
}

function closeWatchRewardModal() {
  if (props.watchRewardPanelVisible) {
    emit("close-watch-reward-panel");
    return;
  }
  emit("close-watch-reward-result");
}

defineExpose({
  openCommentPrizeRuleModal
});
</script>

<style lang="scss" scoped>
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
