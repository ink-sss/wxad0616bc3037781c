"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_live = require("../../../api/live.js");
const stores_user = require("../../../stores/user.js");
const pages_broadcast_composables_useLiveCommentLottery = require("./useLiveCommentLottery.js");
const pages_broadcast_composables_useLiveNormalLottery = require("./useLiveNormalLottery.js");
const pages_broadcast_composables_useLiveWatchRewards = require("./useLiveWatchRewards.js");
function createMarketingSurfaceCloser(normalLottery, watchRewards, commentLottery) {
  return function closeMarketingSurfaces() {
    var _a, _b, _c, _d;
    (_a = normalLottery.closeLotteryModal) == null ? void 0 : _a.call(normalLottery);
    (_b = watchRewards.closeWatchRewardPanel) == null ? void 0 : _b.call(watchRewards);
    (_c = watchRewards.closeWatchRewardResult) == null ? void 0 : _c.call(watchRewards);
    (_d = commentLottery.closeCommentLotteryModal) == null ? void 0 : _d.call(commentLottery);
  };
}
function createMarketingGuard(marketingBlocked, closeMarketingSurfaces) {
  return function whenMarketingAllowed(handler, fallback = true) {
    if (marketingBlocked.value) {
      closeMarketingSurfaces();
      return fallback;
    }
    return handler();
  };
}
function createMarketingDisplayState(marketingBlocked, watchRewards, normalLottery, commentLottery, roomCode, pushStatus) {
  return {
    // 抽奖动画直接透传，不受任何守卫拦截
    normalLotteryActiveModal: common_vendor.computed(() => common_vendor.unref(normalLottery.normalLotteryActiveModal)),
    showWatchRewardPanel: common_vendor.computed(() => !marketingBlocked.value && Boolean(common_vendor.unref(watchRewards.showWatchRewardPanel))),
    watchRewardResult: common_vendor.computed(() => marketingBlocked.value ? null : common_vendor.unref(watchRewards.watchRewardResult)),
    watchRewardBroadcast: common_vendor.computed(() => marketingBlocked.value ? null : common_vendor.unref(watchRewards.watchRewardBroadcast)),
    hasVisibleWatchRewardTasks: common_vendor.computed(() => !marketingBlocked.value && Boolean(common_vendor.unref(watchRewards.hasVisibleWatchRewardTasks))),
    watchRewardEntryLabel: common_vendor.computed(() => marketingBlocked.value ? "" : common_vendor.unref(watchRewards.watchRewardEntryLabel)),
    commentLotteryActiveModal: common_vendor.computed(() => marketingBlocked.value ? "" : common_vendor.unref(commentLottery.commentLotteryActiveModal)),
    commentLotteryEntryVisible: common_vendor.computed(() => !marketingBlocked.value && Boolean(common_vendor.unref(commentLottery.commentLotteryEntryVisible))),
    commentLotteryBubbleVisible: common_vendor.computed(() => !marketingBlocked.value && Boolean(common_vendor.unref(commentLottery.commentLotteryBubbleVisible))),
    prizeRecordUrl: common_vendor.computed(() => {
      const code = String(common_vendor.unref(roomCode) || "").trim();
      return `/pages/prize-record/index${code ? `?roomCode=${encodeURIComponent(code)}` : ""}`;
    })
  };
}
function createMarketingActions(ctx) {
  const {
    marketingBlocked,
    closeMarketingSurfaces,
    whenMarketingAllowed,
    watchRewards,
    normalLottery,
    commentLottery,
    inputText,
    handleSendClick
  } = ctx;
  async function handleCommentLotterySendClick(overrideText) {
    const text = (typeof overrideText === "string" ? overrideText : inputText.value || "").trim();
    const sent = typeof overrideText === "string" ? await handleSendClick(overrideText) : await handleSendClick();
    if (sent !== false && text && !marketingBlocked.value) {
      commentLottery.handleCommentLotteryCommentSent(text);
    }
    return sent;
  }
  function syncMarketingFromLiveDetail(detail) {
    watchRewards.syncFromLiveDetail(detail);
    commentLottery.syncCommentLotteryFromLiveDetail({ allowAutoPopup: !marketingBlocked.value });
    if (marketingBlocked.value)
      closeMarketingSurfaces();
  }
  function reloadMarketingRuntime() {
    var _a, _b;
    (_a = watchRewards.reloadWatchRewards) == null ? void 0 : _a.call(watchRewards, { minStaleMs: 5e3 });
    (_b = commentLottery.loadCommentLotteryList) == null ? void 0 : _b.call(commentLottery);
    if (marketingBlocked.value)
      closeMarketingSurfaces();
  }
  function handleCommentLotteryStarted(message) {
    var _a;
    const handled = (_a = commentLottery.handleCommentLotteryStarted) == null ? void 0 : _a.call(commentLottery, message);
    if (marketingBlocked.value)
      closeMarketingSurfaces();
    return handled;
  }
  function handleCommentLotteryConfigUpdated(message) {
    var _a, _b;
    if (marketingBlocked.value) {
      (_a = commentLottery.loadCommentLotteryList) == null ? void 0 : _a.call(commentLottery);
      closeMarketingSurfaces();
      return true;
    }
    return (_b = commentLottery.handleCommentLotteryConfigUpdated) == null ? void 0 : _b.call(commentLottery, message);
  }
  function refreshCommentLotteryWhenBlocked() {
    var _a;
    if (!marketingBlocked.value)
      return false;
    (_a = commentLottery.loadCommentLotteryList) == null ? void 0 : _a.call(commentLottery);
    closeMarketingSurfaces();
    return true;
  }
  return {
    handleCommentLotterySendClick,
    openCommentPrizeRuleModal: () => whenMarketingAllowed(commentLottery.openCommentLotteryPanel),
    syncMarketingFromLiveDetail,
    reloadMarketingRuntime,
    requestWatchRewardReload: (payload) => {
      var _a;
      (_a = watchRewards.requestWatchRewardReload) == null ? void 0 : _a.call(watchRewards, payload);
      if (marketingBlocked.value)
        closeMarketingSurfaces();
    },
    openWatchRewardPanel: () => whenMarketingAllowed(watchRewards.openWatchRewardPanel),
    handleLotteryResult: (message) => normalLottery.handleLotteryResult(message),
    handleWinNotify: (message) => normalLottery.handleWinNotify(message),
    handleWinRecordUpdate: (message) => normalLottery.handleWinRecordUpdate(message),
    handleWatchRewardWinNotify: (message) => whenMarketingAllowed(() => watchRewards.handleWatchRewardWinNotify(message)),
    handleWatchRewardBroadcast: (message) => whenMarketingAllowed(() => watchRewards.handleWatchRewardBroadcast(message)),
    handleCommentLotteryStarted,
    handleCommentLotteryOpened: (message) => refreshCommentLotteryWhenBlocked() || commentLottery.handleCommentLotteryOpened(message),
    handleCommentLotteryConfigUpdated,
    handleCommentLotteryWinNotify: (message) => refreshCommentLotteryWhenBlocked() || commentLottery.handleCommentLotteryWinNotify(message),
    handleCommentLotteryWinRecordUpdate: (message) => refreshCommentLotteryWhenBlocked() || commentLottery.handleCommentLotteryWinRecordUpdate(message)
  };
}
function useLiveMarketingRuntime({
  roomCode,
  liveId,
  liveTenantId,
  shareCode,
  liveBindId,
  myUserId,
  isPlaying,
  getLiveDetailApi,
  getEffectiveTermId,
  sendMessage,
  inputText,
  handleSendClick,
  appendSystemMessage,
  shouldShowEntryOverlay,
  pushStatus,
  isReplay
}) {
  const userStore = stores_user.useUserStore();
  const marketingBlocked = common_vendor.computed(() => Boolean(common_vendor.unref(shouldShowEntryOverlay)) || !Boolean(common_vendor.unref(isReplay)) && Number(common_vendor.unref(pushStatus)) === 2);
  const watchRewards = pages_broadcast_composables_useLiveWatchRewards.useLiveWatchRewards({
    roomCode,
    liveId,
    liveTenantId,
    shareCode,
    liveBindId,
    isReplay,
    getEffectiveTermId,
    myUserId,
    isPlaying,
    getLiveDetailApi,
    claimWatchRewardApi: api_live.claimWatchReward,
    appendSystemMessage,
    getMyNickname: () => {
      var _a, _b;
      return ((_a = userStore.userInfo) == null ? void 0 : _a.nickname) || ((_b = userStore.userInfo) == null ? void 0 : _b.nickName) || "我";
    }
  });
  const normalLottery = pages_broadcast_composables_useLiveNormalLottery.useLiveNormalLottery({
    roomCode,
    liveId,
    liveTenantId,
    shareCode,
    liveBindId,
    isReplay,
    myUserId,
    getEffectiveTermId,
    getLotteryParticipantsApi: api_live.getLotteryParticipants,
    appendSystemMessage
  });
  const commentLottery = pages_broadcast_composables_useLiveCommentLottery.useLiveCommentLottery({
    roomCode,
    liveId,
    liveTenantId,
    shareCode,
    liveBindId,
    isReplay,
    myUserId,
    getEffectiveTermId,
    sendMessage,
    appendSystemMessage,
    getCommentLotteryListApi: api_live.getCommentLotteryList,
    getCommentLotteryDetailApi: api_live.getCommentLotteryDetail,
    claimCommentRewardApi: api_live.claimCommentReward,
    getLotteryParticipantsApi: api_live.getLotteryParticipants
  });
  const closeMarketingSurfaces = createMarketingSurfaceCloser(normalLottery, watchRewards, commentLottery);
  const whenMarketingAllowed = createMarketingGuard(marketingBlocked, closeMarketingSurfaces);
  const displayState = createMarketingDisplayState(marketingBlocked, watchRewards, normalLottery, commentLottery, roomCode);
  const actions = createMarketingActions({
    marketingBlocked,
    closeMarketingSurfaces,
    whenMarketingAllowed,
    watchRewards,
    normalLottery,
    commentLottery,
    inputText,
    handleSendClick
  });
  common_vendor.watch(marketingBlocked, (blocked) => {
    if (blocked)
      closeMarketingSurfaces();
  }, { immediate: true });
  return {
    ...watchRewards,
    ...normalLottery,
    ...commentLottery,
    ...displayState,
    ...actions
  };
}
exports.useLiveMarketingRuntime = useLiveMarketingRuntime;
