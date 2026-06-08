import { computed, unref, watch } from "vue";
import {
  claimCommentReward,
  claimWatchReward,
  getCommentLotteryDetail,
  getCommentLotteryList,
  getLotteryParticipants,
} from "@/api/live.js";
import { useUserStore } from "@/stores/user";
import { useLiveCommentLottery } from "./useLiveCommentLottery.js";
import { useLiveNormalLottery } from "./useLiveNormalLottery.js";
import { useLiveWatchRewards } from "./useLiveWatchRewards.js";

function createMarketingSurfaceCloser(normalLottery, watchRewards, commentLottery) {
  return function closeMarketingSurfaces() {
    normalLottery.closeLotteryModal?.();
    watchRewards.closeWatchRewardPanel?.();
    watchRewards.closeWatchRewardResult?.();
    commentLottery.closeCommentLotteryModal?.();
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
    normalLotteryActiveModal: computed(() => unref(normalLottery.normalLotteryActiveModal)),
    showWatchRewardPanel: computed(() => !marketingBlocked.value && Boolean(unref(watchRewards.showWatchRewardPanel))),
    watchRewardResult: computed(() => marketingBlocked.value ? null : unref(watchRewards.watchRewardResult)),
    watchRewardBroadcast: computed(() => marketingBlocked.value ? null : unref(watchRewards.watchRewardBroadcast)),
    hasVisibleWatchRewardTasks: computed(() => !marketingBlocked.value && Boolean(unref(watchRewards.hasVisibleWatchRewardTasks))),
    watchRewardEntryLabel: computed(() => marketingBlocked.value ? "" : unref(watchRewards.watchRewardEntryLabel)),
    commentLotteryActiveModal: computed(() => marketingBlocked.value ? "" : unref(commentLottery.commentLotteryActiveModal)),
    commentLotteryEntryVisible: computed(() => !marketingBlocked.value && Boolean(unref(commentLottery.commentLotteryEntryVisible))),
    commentLotteryBubbleVisible: computed(() => !marketingBlocked.value && Boolean(unref(commentLottery.commentLotteryBubbleVisible))),
    prizeRecordUrl: computed(() => {
      const code = String(unref(roomCode) || "").trim();
      return `/pagesPlus/main/prize-record/index${code ? `?roomCode=${encodeURIComponent(code)}` : ""}`;
    }),
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
    handleSendClick,
    pushStatus,
  } = ctx;

  async function handleCommentLotterySendClick(overrideText) {
    const text = (typeof overrideText === "string" ? overrideText : inputText.value || "").trim();
    const sent = typeof overrideText === "string"
      ? await handleSendClick(overrideText)
      : await handleSendClick();
    if (sent !== false && text && !marketingBlocked.value) {
      commentLottery.handleCommentLotteryCommentSent(text);
    }
    return sent;
  }

  function syncMarketingFromLiveDetail(detail) {
    watchRewards.syncFromLiveDetail(detail);
    commentLottery.syncCommentLotteryFromLiveDetail({ allowAutoPopup: !marketingBlocked.value });
    if (marketingBlocked.value) closeMarketingSurfaces();
  }

  function reloadMarketingRuntime() {
    // [2026-05-22] WS onOpen 会调本函数。刚 initLive 后联调场景下，detail 刚被 onLiveDetailLoaded 同步过，
    //   这里冗余拉取 detail 是问题根源。传 minStaleMs 让 watchRewards 在近期已同步时跳过，
    //   评论抽奖走独立接口不受影响。
    watchRewards.reloadWatchRewards?.({ minStaleMs: 5000 });
    commentLottery.loadCommentLotteryList?.();
    if (marketingBlocked.value) closeMarketingSurfaces();
  }

  function handleCommentLotteryStarted(message) {
    const handled = commentLottery.handleCommentLotteryStarted?.(message);
    if (marketingBlocked.value) closeMarketingSurfaces();
    return handled;
  }

  function handleCommentLotteryConfigUpdated(message) {
    if (marketingBlocked.value) {
      commentLottery.loadCommentLotteryList?.();
      closeMarketingSurfaces();
      return true;
    }
    return commentLottery.handleCommentLotteryConfigUpdated?.(message);
  }

  function refreshCommentLotteryWhenBlocked() {
    if (!marketingBlocked.value) return false;
    commentLottery.loadCommentLotteryList?.();
    closeMarketingSurfaces();
    return true;
  }

  return {
    handleCommentLotterySendClick,
    openCommentPrizeRuleModal: () => whenMarketingAllowed(commentLottery.openCommentLotteryPanel),
    syncMarketingFromLiveDetail,
    reloadMarketingRuntime,
    requestWatchRewardReload: (payload) => {
      watchRewards.requestWatchRewardReload?.(payload);
      if (marketingBlocked.value) closeMarketingSurfaces();
    },
    openWatchRewardPanel: () => whenMarketingAllowed(watchRewards.openWatchRewardPanel),
    handleLotteryResult: (message) => normalLottery.handleLotteryResult(message),
    handleWinNotify: (message) => normalLottery.handleWinNotify(message),
    handleWinRecordUpdate: (message) => normalLottery.handleWinRecordUpdate(message),
    handleWatchRewardWinNotify: (message) => whenMarketingAllowed(() => watchRewards.handleWatchRewardWinNotify(message)),
    handleWatchRewardBroadcast: (message) => whenMarketingAllowed(() => watchRewards.handleWatchRewardBroadcast(message)),
    handleCommentLotteryStarted,
    handleCommentLotteryOpened: (message) => (
      refreshCommentLotteryWhenBlocked() || commentLottery.handleCommentLotteryOpened(message)
    ),
    handleCommentLotteryConfigUpdated,
    handleCommentLotteryWinNotify: (message) => (
      refreshCommentLotteryWhenBlocked() || commentLottery.handleCommentLotteryWinNotify(message)
    ),
    handleCommentLotteryWinRecordUpdate: (message) => (
      refreshCommentLotteryWhenBlocked() || commentLottery.handleCommentLotteryWinRecordUpdate(message)
    ),
  };
}

/**
 * 直播间营销活动运行时装配。
 * 职责边界：聚合观看奖励、普通抽奖、评论抽奖状态和 WS 回调；不处理视频、商品、购买等页面主流程。
 */
export function useLiveMarketingRuntime({
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
  isReplay,
}) {
  const userStore = useUserStore();
  const marketingBlocked = computed(() => (
    Boolean(unref(shouldShowEntryOverlay)) ||
    (!Boolean(unref(isReplay)) && Number(unref(pushStatus)) === 2)
  ));
  const watchRewards = useLiveWatchRewards({
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
    claimWatchRewardApi: claimWatchReward,
    appendSystemMessage,
    getMyNickname: () => userStore.userInfo?.nickname || userStore.userInfo?.nickName || "我",
  });

  const normalLottery = useLiveNormalLottery({
    roomCode,
    liveId,
    liveTenantId,
    shareCode,
    liveBindId,
    isReplay,
    myUserId,
    getEffectiveTermId,
    getLotteryParticipantsApi: getLotteryParticipants,
    appendSystemMessage,
  });

  const commentLottery = useLiveCommentLottery({
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
    getCommentLotteryListApi: getCommentLotteryList,
    getCommentLotteryDetailApi: getCommentLotteryDetail,
    claimCommentRewardApi: claimCommentReward,
    getLotteryParticipantsApi: getLotteryParticipants,
  });

  const closeMarketingSurfaces = createMarketingSurfaceCloser(normalLottery, watchRewards, commentLottery);
  const whenMarketingAllowed = createMarketingGuard(marketingBlocked, closeMarketingSurfaces);
  const displayState = createMarketingDisplayState(marketingBlocked, watchRewards, normalLottery, commentLottery, roomCode, pushStatus);
  const actions = createMarketingActions({
    marketingBlocked,
    closeMarketingSurfaces,
    whenMarketingAllowed,
    watchRewards,
    normalLottery,
    commentLottery,
    inputText,
    handleSendClick,
    pushStatus,
  });

  watch(marketingBlocked, (blocked) => {
    if (blocked) closeMarketingSurfaces();
  }, { immediate: true });

  return {
    ...watchRewards,
    ...normalLottery,
    ...commentLottery,
    ...displayState,
    ...actions,
  };
}
