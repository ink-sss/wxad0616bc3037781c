"use strict";
const common_vendor = require("../../../common/vendor.js");
const components_liveLottery_modalData = require("../../../components/live-lottery/modal-data.js");
if (!Math) {
  (CommentPrizeRuleModal + CommentPrizeConfirmModal + CommentSlotLotteryModals + CommentLotteryResultModals + CommentLotteryPasswordModal + WechatLotteryModals + SlotLotteryModals + WechatLotteryAwardsUserModal + WechatLotteryResultModals + WatchDurationRewardModal + CouponReceiveModals)();
}
const CommentLotteryPasswordModal = () => "../../../components/live-lottery/CommentLotteryPasswordModal.js";
const CommentSlotLotteryModals = () => "../../../components/live-lottery/CommentSlotLotteryModals.js";
const CommentLotteryResultModals = () => "../../../components/live-lottery/CommentLotteryResultModals.js";
const SlotLotteryModals = () => "../../../components/live-lottery/SlotLotteryModals.js";
const WechatLotteryModals = () => "../../../components/live-lottery/WechatLotteryModals.js";
const WechatLotteryAwardsUserModal = () => "../../../components/live-lottery/wechat-lottery/WechatLotteryAwardsUserModal.js";
const WechatLotteryResultModals = () => "../../../components/live-lottery/WechatLotteryResultModals.js";
const WatchDurationRewardModal = () => "../../../components/live-lottery/WatchDurationRewardModal.js";
const CouponReceiveModals = () => "../../../components/live-lottery/CouponReceiveModals.js";
const CommentPrizeConfirmModal = () => "../../../components/live-lottery/comment-lottery/CommentPrizeConfirmModal.js";
const CommentPrizeRuleModal = () => "../../../components/comment-prize-rule-modal.js";
const _sfc_main = {
  __name: "LiveBroadcastMarketingLayer",
  props: {
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
  },
  emits: [
    "close-normal-lottery",
    "close-watch-reward-panel",
    "claim-watch-reward",
    "close-watch-reward-result",
    "open-comment-lottery-panel",
    "close-comment-lottery",
    "send-comment-lottery"
  ],
  setup(__props, { expose: __expose, emit: __emit }) {
    const COMMENT_LOTTERY_PANEL_MODALS = /* @__PURE__ */ new Set(["commentPrizeRule", "commentLotteryList", "commentPrizeConfirm"]);
    const COMMENT_LOTTERY_SLOT_MODALS = /* @__PURE__ */ new Set(["commentLotteryRunning", "commentLotterySlotRolling", "commentLotterySlotResult"]);
    const COMMENT_LOTTERY_RESULT_MODALS = /* @__PURE__ */ new Set(["commentLotteryWin", "commentLotteryLose"]);
    const COMMENT_LOTTERY_PASSWORD_MODALS = /* @__PURE__ */ new Set(["commentPasswordChanged"]);
    const WECHAT_LOTTERY_MODALS = /* @__PURE__ */ new Set(["wechatOpenPrizeConfirm", "wechatLotteryCountdown", "wechatLotteryEffect"]);
    const SLOT_LOTTERY_MODALS = /* @__PURE__ */ new Set(["wechatSlotRolling", "wechatSlotResult"]);
    const WECHAT_LOTTERY_AWARDS_MODALS = /* @__PURE__ */ new Set(["wechatLotteryAwards", "wechatLotteryAwardsUser"]);
    const WECHAT_LOTTERY_RESULT_MODALS = /* @__PURE__ */ new Set(["wechatLotteryWin", "wechatLotteryLose", "wechatLotteryPerfect"]);
    const props = __props;
    const emit = __emit;
    const watchRewardActiveModal = common_vendor.computed(() => {
      var _a;
      if (props.watchRewardPanelVisible)
        return "watchDurationReward";
      if (Number((_a = props.watchRewardResult) == null ? void 0 : _a.rewardType) === 1)
        return "watchGoodsReward";
      return "";
    });
    const couponRewardActiveModal = common_vendor.computed(() => {
      var _a;
      return Number((_a = props.watchRewardResult) == null ? void 0 : _a.rewardType) === 2 ? "couponReceiveSuccess" : "";
    });
    const shouldRenderCommentLotteryPanel = common_vendor.computed(() => COMMENT_LOTTERY_PANEL_MODALS.has(props.commentLotteryActiveModal));
    const shouldRenderCommentLotterySlot = common_vendor.computed(() => COMMENT_LOTTERY_SLOT_MODALS.has(props.commentLotteryActiveModal));
    const shouldRenderCommentLotteryResult = common_vendor.computed(() => COMMENT_LOTTERY_RESULT_MODALS.has(props.commentLotteryActiveModal));
    const shouldRenderCommentLotteryPassword = common_vendor.computed(() => COMMENT_LOTTERY_PASSWORD_MODALS.has(props.commentLotteryActiveModal));
    const shouldRenderWechatLottery = common_vendor.computed(() => WECHAT_LOTTERY_MODALS.has(props.normalLotteryActiveModal));
    const shouldRenderSlotLottery = common_vendor.computed(() => SLOT_LOTTERY_MODALS.has(props.normalLotteryActiveModal));
    const shouldRenderWechatLotteryAwards = common_vendor.computed(() => WECHAT_LOTTERY_AWARDS_MODALS.has(props.normalLotteryActiveModal));
    const shouldRenderWechatLotteryResult = common_vendor.computed(() => WECHAT_LOTTERY_RESULT_MODALS.has(props.normalLotteryActiveModal));
    const shouldRenderWatchReward = common_vendor.computed(() => Boolean(watchRewardActiveModal.value));
    const shouldRenderCouponReward = common_vendor.computed(() => Boolean(couponRewardActiveModal.value));
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
    __expose({
      openCommentPrizeRuleModal
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: shouldRenderCommentLotteryPanel.value
      }, shouldRenderCommentLotteryPanel.value ? {
        b: common_vendor.o(closeBroadcastModal, "65"),
        c: common_vendor.o(($event) => emit("send-comment-lottery", $event), "96"),
        d: common_vendor.p({
          ["active-modal"]: __props.commentLotteryActiveModal,
          activity: __props.commentLotteryPanelActivity,
          prizes: __props.commentLotteryPanelPrizes,
          ["tip-text"]: __props.commentLotteryTipText
        })
      } : {}, {
        e: shouldRenderCommentLotteryPanel.value
      }, shouldRenderCommentLotteryPanel.value ? {
        f: common_vendor.o(closeBroadcastModal, "5c"),
        g: common_vendor.p({
          ["active-modal"]: __props.commentLotteryActiveModal
        })
      } : {}, {
        h: shouldRenderCommentLotterySlot.value
      }, shouldRenderCommentLotterySlot.value ? {
        i: common_vendor.o(closeBroadcastModal, "4c"),
        j: common_vendor.p({
          ["active-modal"]: __props.commentLotteryActiveModal,
          winners: __props.commentLotteryWinners,
          participants: __props.commentLotteryParticipants,
          prize: __props.commentLotteryPrize
        })
      } : {}, {
        k: shouldRenderCommentLotteryResult.value
      }, shouldRenderCommentLotteryResult.value ? {
        l: common_vendor.o(closeBroadcastModal, "b0"),
        m: common_vendor.p({
          ["active-modal"]: __props.commentLotteryActiveModal,
          prize: __props.commentLotteryPrize,
          ["win-record"]: __props.commentLotteryWinRecord,
          ["record-url"]: __props.prizeRecordUrl
        })
      } : {}, {
        n: shouldRenderCommentLotteryPassword.value
      }, shouldRenderCommentLotteryPassword.value ? {
        o: common_vendor.o(closeBroadcastModal, "4e"),
        p: common_vendor.o(($event) => emit("send-comment-lottery", $event), "f1"),
        q: common_vendor.p({
          ["active-modal"]: __props.commentLotteryActiveModal,
          ["password-text"]: __props.commentLotteryPasswordChangedText
        })
      } : {}, {
        r: shouldRenderWechatLottery.value
      }, shouldRenderWechatLottery.value ? {
        s: common_vendor.o(($event) => emit("close-normal-lottery"), "38"),
        t: common_vendor.p({
          ["active-modal"]: __props.normalLotteryActiveModal,
          winners: __props.normalLotteryParticipants,
          prize: __props.normalLotteryPrize
        })
      } : {}, {
        v: shouldRenderSlotLottery.value
      }, shouldRenderSlotLottery.value ? {
        w: common_vendor.o(($event) => emit("close-normal-lottery"), "5b"),
        x: common_vendor.p({
          ["active-modal"]: __props.normalLotteryActiveModal,
          winners: __props.normalLotteryParticipants,
          ["result-winners"]: __props.normalLotteryWinners,
          prize: __props.normalLotteryPrize
        })
      } : {}, {
        y: shouldRenderWechatLotteryAwards.value
      }, shouldRenderWechatLotteryAwards.value ? {
        z: common_vendor.o(($event) => emit("close-normal-lottery"), "33"),
        A: common_vendor.p({
          ["active-modal"]: __props.normalLotteryActiveModal,
          winners: __props.normalLotteryWinners,
          prize: __props.normalLotteryPrize
        })
      } : {}, {
        B: shouldRenderWechatLotteryResult.value
      }, shouldRenderWechatLotteryResult.value ? {
        C: common_vendor.o(($event) => emit("close-normal-lottery"), "b8"),
        D: common_vendor.p({
          ["active-modal"]: __props.normalLotteryActiveModal,
          prize: __props.normalLotteryPrize,
          ["record-url"]: __props.prizeRecordUrl
        })
      } : {}, {
        E: shouldRenderWatchReward.value
      }, shouldRenderWatchReward.value ? {
        F: common_vendor.o(closeWatchRewardModal, "1d"),
        G: common_vendor.o(($event) => emit("claim-watch-reward", $event), "b4"),
        H: common_vendor.p({
          ["active-modal"]: watchRewardActiveModal.value,
          assets: common_vendor.unref(components_liveLottery_modalData.assets),
          ["watch-rewards"]: __props.watchRewardRewards,
          ["open-key"]: __props.watchRewardPanelOpenKey,
          ["reward-result"]: __props.watchRewardResult,
          ["record-url"]: __props.prizeRecordUrl
        })
      } : {}, {
        I: shouldRenderCouponReward.value
      }, shouldRenderCouponReward.value ? {
        J: common_vendor.o(($event) => emit("close-watch-reward-result"), "71"),
        K: common_vendor.p({
          ["active-modal"]: couponRewardActiveModal.value,
          assets: common_vendor.unref(components_liveLottery_modalData.assets),
          coupon: __props.watchRewardResult,
          ["record-url"]: __props.prizeRecordUrl
        })
      } : {}, {
        L: __props.watchRewardBroadcast
      }, __props.watchRewardBroadcast ? {
        M: common_vendor.t(__props.watchRewardBroadcast.nickname),
        N: common_vendor.t(__props.watchRewardBroadcast.rewardName),
        O: common_vendor.t(__props.watchRewardBroadcast.rewardQuantity || 1),
        P: common_vendor.t(__props.watchRewardBroadcast.unit),
        Q: __props.watchRewardBroadcastKey
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-592ec829"]]);
wx.createComponent(Component);
