"use strict";
const common_vendor = require("../../../common/vendor.js");
if (!Math) {
  (LivePortraitStage + LiveLandscapeStage + LiveViewerLimitReached + LiveAccessDenied + LiveBroadcastMarketingLayer)();
}
const LiveAccessDenied = () => "./LiveAccessDenied.js";
const LiveBroadcastMarketingLayer = () => "./LiveBroadcastMarketingLayer.js";
const LiveLandscapeStage = () => "./LiveLandscapeStage.js";
const LivePortraitStage = () => "./LivePortraitStage.js";
const LiveViewerLimitReached = () => "./LiveViewerLimitReached.js";
const _sfc_main = {
  __name: "LiveBroadcastStageHost",
  props: {
    mode: { type: String, required: true },
    accessDenied: { type: Boolean, required: true },
    stageState: { type: Object, required: true },
    stageActions: { type: Object, required: true },
    accessDeniedTitle: { type: String, default: "" },
    accessDeniedUserAvatar: { type: String, default: "" },
    accessDeniedUserName: { type: String, default: "" },
    accessDeniedUidText: { type: String, default: "" },
    viewerLimitReached: { type: Boolean, default: false },
    viewerLimitText: { type: String, default: "观看人数已达上限" },
    marketingRuntime: { type: Object, required: true }
  },
  emits: ["copy-uid"],
  setup(__props, { expose: __expose }) {
    const props = __props;
    const portraitInputRef = common_vendor.ref(null);
    const landscapeInputRef = common_vendor.ref(null);
    function currentStageRef() {
      return props.mode === "landscape" ? landscapeInputRef.value : portraitInputRef.value;
    }
    function createMediaContext(id = "liveVideo", type = "video") {
      var _a, _b;
      return ((_b = (_a = currentStageRef()) == null ? void 0 : _a.createMediaContext) == null ? void 0 : _b.call(_a, id, type)) || null;
    }
    __expose({
      focus: () => {
        var _a, _b;
        return (_b = (_a = currentStageRef()) == null ? void 0 : _a.focus) == null ? void 0 : _b.call(_a);
      },
      blur: () => {
        var _a, _b;
        return (_b = (_a = currentStageRef()) == null ? void 0 : _a.blur) == null ? void 0 : _b.call(_a);
      },
      createMediaContext,
      createVideoContext: (id = "liveVideo") => createMediaContext(id, "video"),
      createLivePlayerContext: (id = "liveVideo") => createMediaContext(id, "live-player")
    });
    const marketingLayerState = common_vendor.computed(() => {
      const runtime = props.marketingRuntime || {};
      const modal = common_vendor.unref(runtime.normalLotteryActiveModal) || "";
      return {
        normalLotteryActiveModal: modal,
        normalLotteryPrize: common_vendor.unref(runtime.normalLotteryPrize) || {},
        normalLotteryWinners: common_vendor.unref(runtime.normalLotteryWinners) || [],
        normalLotteryParticipants: common_vendor.unref(runtime.normalLotteryParticipants) || [],
        visibleWatchRewardTasks: common_vendor.unref(runtime.visibleWatchRewardTasks) || [],
        showWatchRewardPanel: Boolean(common_vendor.unref(runtime.showWatchRewardPanel)),
        watchRewardPanelOpenKey: Number(common_vendor.unref(runtime.watchRewardPanelOpenKey) || 0),
        watchRewardResult: common_vendor.unref(runtime.watchRewardResult) || null,
        watchRewardBroadcast: common_vendor.unref(runtime.watchRewardBroadcast) || null,
        watchRewardBroadcastRenderKey: Number(common_vendor.unref(runtime.watchRewardBroadcastRenderKey) || 0),
        commentLotteryActiveModal: common_vendor.unref(runtime.commentLotteryActiveModal) || "",
        commentLotteryPanelActivity: common_vendor.unref(runtime.commentLotteryPanelActivity) || {},
        commentLotteryPanelPrizes: common_vendor.unref(runtime.commentLotteryPanelPrizes) || [],
        commentLotteryTipText: common_vendor.unref(runtime.commentLotteryTipText) || "",
        commentLotteryPasswordChangedText: common_vendor.unref(runtime.commentLotteryPasswordChangedText) || "",
        commentLotteryPrize: common_vendor.unref(runtime.commentLotteryPrize) || {},
        commentLotteryWinners: common_vendor.unref(runtime.commentLotteryWinners) || [],
        commentLotteryParticipants: common_vendor.unref(runtime.commentLotteryParticipants) || [],
        commentLotteryWinRecord: common_vendor.unref(runtime.commentLotteryWinRecord) || null,
        prizeRecordUrl: common_vendor.unref(runtime.prizeRecordUrl) || "/pages/prize-record/index"
      };
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.mode === "portrait" && !__props.accessDenied && !__props.viewerLimitReached
      }, __props.mode === "portrait" && !__props.accessDenied && !__props.viewerLimitReached ? {
        b: common_vendor.sr(portraitInputRef, "1368b748-0", {
          "k": "portraitInputRef"
        }),
        c: common_vendor.p({
          s: __props.stageState,
          a: __props.stageActions
        })
      } : __props.mode === "landscape" && !__props.accessDenied && !__props.viewerLimitReached ? {
        e: common_vendor.sr(landscapeInputRef, "1368b748-1", {
          "k": "landscapeInputRef"
        }),
        f: common_vendor.p({
          s: __props.stageState,
          a: __props.stageActions
        })
      } : __props.viewerLimitReached ? {
        h: common_vendor.p({
          text: __props.viewerLimitText
        })
      } : __props.accessDenied ? {
        j: common_vendor.o(($event) => _ctx.$emit("copy-uid"), "07"),
        k: common_vendor.p({
          title: __props.accessDeniedTitle,
          avatar: __props.accessDeniedUserAvatar,
          ["user-name"]: __props.accessDeniedUserName,
          ["uid-text"]: __props.accessDeniedUidText
        })
      } : {}, {
        d: __props.mode === "landscape" && !__props.accessDenied && !__props.viewerLimitReached,
        g: __props.viewerLimitReached,
        i: __props.accessDenied,
        l: !__props.viewerLimitReached
      }, !__props.viewerLimitReached ? {
        m: common_vendor.o(__props.marketingRuntime.closeLotteryModal, "3f"),
        n: common_vendor.o(__props.marketingRuntime.closeWatchRewardPanel, "f4"),
        o: common_vendor.o(__props.marketingRuntime.claimWatchRewardTask, "09"),
        p: common_vendor.o(__props.marketingRuntime.closeWatchRewardResult, "0b"),
        q: common_vendor.o(__props.marketingRuntime.openCommentLotteryPanel, "7e"),
        r: common_vendor.o(__props.marketingRuntime.closeCommentLotteryModal, "49"),
        s: common_vendor.o(__props.marketingRuntime.sendCommentLotteryText, "4d"),
        t: common_vendor.p({
          ["normal-lottery-active-modal"]: marketingLayerState.value.normalLotteryActiveModal,
          ["normal-lottery-prize"]: marketingLayerState.value.normalLotteryPrize,
          ["normal-lottery-winners"]: marketingLayerState.value.normalLotteryWinners,
          ["normal-lottery-participants"]: marketingLayerState.value.normalLotteryParticipants,
          ["watch-reward-rewards"]: marketingLayerState.value.visibleWatchRewardTasks,
          ["watch-reward-panel-visible"]: marketingLayerState.value.showWatchRewardPanel,
          ["watch-reward-panel-open-key"]: marketingLayerState.value.watchRewardPanelOpenKey,
          ["watch-reward-result"]: marketingLayerState.value.watchRewardResult,
          ["watch-reward-broadcast"]: marketingLayerState.value.watchRewardBroadcast,
          ["watch-reward-broadcast-key"]: marketingLayerState.value.watchRewardBroadcastRenderKey,
          ["comment-lottery-active-modal"]: marketingLayerState.value.commentLotteryActiveModal,
          ["comment-lottery-panel-activity"]: marketingLayerState.value.commentLotteryPanelActivity,
          ["comment-lottery-panel-prizes"]: marketingLayerState.value.commentLotteryPanelPrizes,
          ["comment-lottery-tip-text"]: marketingLayerState.value.commentLotteryTipText,
          ["comment-lottery-password-changed-text"]: marketingLayerState.value.commentLotteryPasswordChangedText,
          ["comment-lottery-prize"]: marketingLayerState.value.commentLotteryPrize,
          ["comment-lottery-winners"]: marketingLayerState.value.commentLotteryWinners,
          ["comment-lottery-participants"]: marketingLayerState.value.commentLotteryParticipants,
          ["comment-lottery-win-record"]: marketingLayerState.value.commentLotteryWinRecord,
          ["prize-record-url"]: marketingLayerState.value.prizeRecordUrl
        })
      } : {});
    };
  }
};
wx.createComponent(_sfc_main);
