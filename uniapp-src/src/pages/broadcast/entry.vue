<template>
  <LiveBroadcastStageHost
    ref="stageHostRef"
    :mode="mode"
    :access-denied="accessDenied"
    :stage-state="stageState"
    :stage-actions="stageActions"
    :access-denied-title="accessDeniedTitle"
    :access-denied-user-avatar="accessDeniedUserAvatar"
    :access-denied-user-name="accessDeniedUserName"
    :access-denied-uid-text="accessDeniedUidText"
    :viewer-limit-reached="viewerLimitReached"
    :viewer-limit-text="viewerLimitText"
    :marketing-runtime="marketingRuntime"
    @copy-uid="copyAccessDeniedUid"
  />
  <LiveImDebugFloat
    :show="imDebugVisible"
    title="直播调试"
    :summary="imDebugSummary"
    :copy-status="imDebugCopyStatus"
    @copy="copyImDebugInfo"
  />
  <view v-if="screenRecording" class="onScreenRecord" />
</template>
<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import { getLiveSocketDebugSnapshot, installLiveSocketDebug, setLiveSocketDebugEnabled } from "@/utils/live-socket-debug.js";
defineOptions({ inheritAttrs: false });
import LiveBroadcastStageHost from "./components/LiveBroadcastStageHost.vue";
import LiveImDebugFloat from "./components/LiveImDebugFloat.vue";
import { enterLiveRoom, getCommentHistory, getCurrentProduct, getLiveDetail, getLiveProducts, getLiveStatus, leaveLiveRoom, liveHeartbeat, sendBuyReminder, sendLike, checkSigned, reportViewProgress } from "@/api/live.js";
import { confirmOrder, createOrder, getOrderDetail, getOrderList, getOrderUnreadStats } from "@/api/order";
import { getUsableCoupons } from "@/api/coupon";
import { getCenter } from "@/api/user";
import { getRefundUnreadStats } from "@/api/refund";
import { executeYeepayPayment } from "@/services/payment-action";
import { importWxAddress } from "@/services/wechat-address";
import { readBindId } from "@/services/h5-auth-context";
import { saveBuyContext, loadBuyContext, clearBuyContext } from "@/utils/live-buy-context";
import { saveLiveRoomContext } from "@/utils/live-room-context";
import { getAddressList, deleteAddress } from "@/api/address";
import { createReplayProductScheduleController } from "./useReplayProductSchedule.js";
import { useLiveProducts } from "./composables/useLiveProducts.js";
import { useLivePurchase } from "./composables/useLivePurchase.js";
import { isTruthyFlag, useLiveSidePanels } from "./composables/useLiveSidePanels.js";
import { useUserStore } from "@/stores/user";
import { pinia } from "@/stores";
import { useDomainStore } from "@/stores/domain";
import { getCustomNavBarHeightStyle } from "@/utils/navigation-bar";
import { getApiBaseUrl } from "@/utils/url-helpers";
import { buildBroadcastReturnPath } from "@/utils/live-route-context.js";
import { useLiveChatInput } from "./composables/useLiveChatInput.js";
import { useLiveComments } from "./composables/useLiveComments.js";
import { useLiveDisplayState } from "./composables/useLiveDisplayState.js";
import { useLiveEntryActions } from "./composables/useLiveEntryActions.js";
import { useLiveEntryHelpers } from "./composables/useLiveEntryHelpers.js";
import { useLiveEntryInitializer } from "./composables/useLiveEntryInitializer.js";
import { useLiveEntryLifecycle } from "./composables/useLiveEntryLifecycle.js";
import { useLiveAdaptiveQuality } from "./composables/useLiveAdaptiveQuality.js";
import { useLiveEnterNotice } from "./composables/useLiveEnterNotice.js";
import { useLiveBuyingNotice } from "./composables/useLiveBuyingNotice.js";
import { useIOSWechatBridgeAutoPlay } from "./composables/useIOSWechatBridgeAutoPlay.js";
import { useLiveLoadBootstrapRegistration } from "./composables/useLiveLoadBootstrap.js";
import { useLiveMiniWindow } from "./composables/useLiveMiniWindow.js";
import { useLiveMuteState } from "./composables/useLiveMuteState.js";
import { useLiveMarketingRuntime } from "./composables/useLiveMarketingRuntime.js";
import { useLiveHeartbeatStatus } from "./composables/useLiveHeartbeatStatus.js";
import { useLiveMiniProgramParity } from "./composables/useLiveMiniProgramParity.js";
import { useLivePageLeave } from "./composables/useLivePageLeave.js";
import { useLivePlaybackWiring } from "./composables/useLivePlaybackWiring.js";
import { useLiveProgressReport } from "./composables/useLiveProgressReport.js";
import { useLiveScheduleResume } from "./composables/useLiveScheduleResume.js";
import { useLiveScreenWakeLock } from "./composables/useLiveScreenWakeLock.js";
import { useLiveSoundIntent } from "./composables/useLiveSoundIntent.js";
import { useLiveStageBinding } from "./composables/useLiveStageBinding.js";
import { useLiveSubscribePush } from "./composables/useLiveSubscribePush.js";
import { useLiveViewerMetrics } from "./composables/useLiveViewerMetrics.js";
import { useLiveVideoRuntime } from "./composables/useLiveVideoRuntime.js";
import { useMessageChannel } from "./composables/useMessageChannel.js";
import { createLiveWsMessageHandler } from "./composables/useLiveWsMessageHandler.js";
import { defaultAvatar, detectIOSH5, detectWeChatIOSH5 } from "./utils/entry-format.js";
import { shouldPreferMiniProgramHlsPlayback } from "./utils/live-source.js";
const isWeChatIOSH5 = detectWeChatIOSH5();
const isIOSH5 = detectIOSH5();
const stageHostRef = ref(null);
const API_BASE = getApiBaseUrl();
const sessionId = ref("");
let enterTimestamp = 0;
const mode = ref("portrait"); // 'portrait' 竖屏 | 'landscape' 横屏
const videoUrl = ref("");
const videoRenderKey = ref(0);
const isPlaying = ref(false);
const videoFrameReady = ref(false);
const isMuted = ref(false);
const videoDebugInfo = ref({
  intent: 0,
  actual: -1,
  source: "init", // 'resume' | 'fresh' | 'loop-restart' | 'live' | 'init'
});
let _videoDebugActualCaptured = false;
const liveId = ref("");
const liveName = ref("");
const liveCover = ref("");
const replayCover = ref("");
const chatBgImage = ref("");
const liveDate = ref("");
const anchorName = ref("官方直播间");
const anchorAvatar = ref("https://man.lqjy.cc/static/icons/default.png");
const broadcastNavHeight = ref(getCustomNavBarHeightStyle());
const liveInitResolved = ref(false);
const liveRedirecting = ref(false);
const showEntryOverlay = ref(true);
const showReplayFirstVideoLoading = ref(false);
const likeCount = ref(0);
const {
  viewerCount, viewerCountAnimating, displayViewerCount, setViewerCountDisplay, applyH5ViewerEnterBoost,
  applyH5ViewerLeaveDecrease, stopViewerCountAnimation,
} = useLiveViewerMetrics();
const safeBottom = ref(0);
const isIOSKeyboardMode = ref(false);
const showProduct = ref(false);
const showProductList = ref(false);
const showShare = ref(false);
const myUserId = ref(0);
const replayCurrentVideoId = ref(0);
const replayLoopPlay = ref(false);
let replayLoopStartTime = 0; // 循环播放开始的时间戳(ms)，用于限制loopDuration
const replayLastTime = ref(0);
const replayVideosList = ref([]);
const replayCurrentIndex = ref(-1);
const scheduleEnabled = ref(0);
const scheduleTimeStr = ref("");
const pushTime = ref(0);
const warmUpVideoUrl = ref("");
const warmUpVideoCoverImage = ref("");
const bizCode = ref("");
const nowTs = ref(Date.now());
const entryInitRuntime = {
  lastInitOptions: {},
  skipEntryOverlayOnce: false,
  liveInitToken: "",
  pendingSubscribeBack: false,
};
const liveDebugOptions = ref({});
const imDebugCopyStatus = ref("");
let isScheduleWarmupMode = false;
const roomSetting = ref({
  enableChat: 1,
  enableVoice: 0,
  enableShare: 1,
  enableLike: 1,
  enableReward: 1,
  muteAll: 0,
  commentReview: 0,
  encryptNickname: 1,
  showHistory: 1,
  enterRemind: 0,
  leaveRemind: 0,
  buyReminder: 1,
  buySuccessReminder: 0,
  showHotSale: 1,
});
const { screenRecording } = useLiveMiniProgramParity({ roomSetting, liveInitResolved });
const {
  userMuted, userBlocked, muteTipVisible, muteRemainText, chatDisabled, startMuteCountdown, stopMuteCountdown,
} = useLiveMuteState({ roomSetting });
const {
  inputFocused, inputText, keyboardHeight, bottomBarStyle,
  onInputFocus, focusInput, blurInput, onInputBlur, syncKeyboardViewportBaseHeight, stopKeyboardListener,
} = useLiveChatInput({
  mode,
  chatDisabled,
  isIOSKeyboardMode,
  getStageRef: () => stageHostRef.value,
});
const roomCode = ref("");
const liveTenantId = ref(0); // 直播间商户ID，用于跨域跳转和分享链接
const shareCode = ref("");
const liveBindId = ref("");
const roomGroupType = ref(0); // 0=普通直播间 1=录播栏目
const roomBroadcastMethod = ref(null); // null=后端未返回 0=未配置 1=网页直播(IM) 2=视频录播(WS)
const roomWatchByDay = ref(0); // 按天观看:0关闭1开启
const roomCurrentTermId = ref(0); // 当前课期ID
const broadcastReturnPath = computed(() => buildBroadcastReturnPath({
  roomCode: roomCode.value,
  liveId: liveId.value,
  tenantId: liveTenantId.value,
  shareCode: shareCode.value,
  bindId: liveBindId.value || readBindId(),
  isReplay: isReplay.value,
  replayVideoId: replayCurrentVideoId.value,
  liveType: isReplay.value ? "replay" : "live",
}));
function getBroadcastSharePath() {
  const params = [];
  if (roomCode.value) params.push(`roomCode=${encodeURIComponent(roomCode.value)}`);
  if (liveId.value) params.push(`liveId=${encodeURIComponent(liveId.value)}`);
  if (liveTenantId.value) params.push(`tenantId=${encodeURIComponent(liveTenantId.value)}`);
  if (shareCode.value) params.push(`shareCode=${encodeURIComponent(shareCode.value)}`);
  const bindId = liveBindId.value || readBindId();
  if (bindId) params.push(`bindId=${encodeURIComponent(bindId)}`);
  appendReplayShareParams(params);
  const query = params.join("&");
  return `/pages/broadcast/entry${query ? `?${query}` : ""}`;
}

function appendReplayShareParams(params) {
  if (!isReplay.value) return;
  params.push("mode=replay");
  params.push("replay=1");
  params.push("liveType=replay");
  const videoId = String(replayCurrentVideoId.value || "").trim();
  if (!videoId || videoId === "0") return;
  const encoded = encodeURIComponent(videoId);
  params.push(`videoId=${encoded}`);
  params.push(`video_id=${encoded}`);
  params.push(`replayVideoId=${encoded}`);
  params.push(`replay_video_id=${encoded}`);
}

function getBroadcastShareTitle() {
  return liveName.value || `${anchorName.value || "主播"}的直播间`;
}

onShareAppMessage(() => ({
  title: getBroadcastShareTitle(),
  path: getBroadcastSharePath(),
  imageUrl: liveCover.value || anchorAvatar.value || "",
}));

onShareTimeline(() => {
  const path = getBroadcastSharePath();
  return {
    title: getBroadcastShareTitle(),
    query: path.includes("?") ? path.split("?")[1] : "",
    imageUrl: liveCover.value || anchorAvatar.value || "",
  };
});

function getEffectiveTermId() {
  if (roomCurrentTermId.value > 0) return roomCurrentTermId.value;
  if (isReplay.value && replayCurrentIndex.value >= 0) {
    const v = replayVideosList.value?.[replayCurrentIndex.value];
    if (v?.termId > 0) return v.termId;
  }
  if (isReplay.value && replayVideosList.value?.length > 0) {
    for (const v of replayVideosList.value) {
      if (v.termId > 0) return v.termId;
    }
  }
  return 0;
}
const userStore = useUserStore();
const domainStore = useDomainStore(pinia);
const activeTab = ref("interact"); // 'interact' | 'products' | 'sign'
const activeTabIndex = ref("0");
const tabDebugEvents = ref([]);
const pushStatus = ref(0);
const pullUrl = ref("");
const isReplay = ref(false);
const isLiveVisualMode = ref(false);
const hasReplay = ref(false);
const liveStatusText = ref('');
const pageVisible = ref(true);
const landscapeMiniActive = ref(false);
const lastStatusPushAt = ref(0);
const accessDenied = ref(false);
const viewerLimitReached = ref(false);
const viewerLimitText = ref("观看人数已达上限");
// RTC 直播参数；仅 groupType===0 直播且后端三字段齐备时启用，其余场景为 null → 走小程序拉流播放器
const rtcConfig = ref(null);
const quickReplies = ref([]);
const showWxAddrDonePlayBtn = ref(false);
const autoplayBlocked = ref(false);
const playbackErrorVisible = ref(false);
const playbackErrorText = ref("");
const mediaSourceComponent = ref("");
const mediaSourceType = ref("");
let switchToFirstAvailableTab = () => {};
let videoPlayer = null;
let weixinBridgeReadyHandler = null;
let visibilityResumeHandler = null;
let syncLiveMiniWindowState = () => {};
let stopReplayFutureStartTimer = () => {};
let getReplayVideoSchedule = () => ({ activeIdx: -1, futureIdx: -1 });
let resetReplayContext = () => {};
let enterReplayPendingState = () => {};
let playReplayVideoByIndex = () => {};
let getSavedReplayProgress = () => 0;
let getPreferredReplayResume = () => 0;
let onVideoTimeUpdate = () => {};
let getSeekTarget = () => 0;
let setSeekTarget = () => {};
let setLastSavedProgress = () => {};
let initVideoPlayer = () => {};
let switchLiveStreamQuality = async () => false;
let handleLivePlayerFailure = () => false;
let markPlaybackReady = () => {};
let retryPlayback = () => false;
let resumeAfterSchedule = () => {};
let startHeartbeat = () => {};
let stopHeartbeat = () => {};
let startStatusPoll = () => {};
let stopStatusPoll = () => {};
let refreshLiveStatusNow = async () => null;
let initWebSocket = async () => {};
let getLiveSocket = () => null;
let closeLiveSocket = () => {};
let sendFallbackEnter = () => {};
let getLiveVideoElement = () => null;
let applyInlineVideoAttrs = () => {};
let resumeVideoPlayback = () => {};
let clearLiveMiniWindowState = () => {};
let tryIOSWechatBridgeAutoPlay = () => {};
let tryIOSWechatBridgeMutedPlay = () => {};
let setIOSWechatBridgeSoundAutoPlayAllowed = () => {};
let enterLive = () => {};
let manualPlayVideo = () => {};
function setLandscapeMiniActive(value) {
  const next = !!value;
  const prev = landscapeMiniActive.value;
  landscapeMiniActive.value = next;
  if (prev && !next) {
    refreshLiveStatusNow({ reason: "landscape_mini_restore" });
  }
}
function markStatusPushReceived() {
  lastStatusPushAt.value = Date.now();
}
function isLiveDebugEnabled(options = liveDebugOptions.value || {}) {
  const forceOff = options.debug === "0" || options.live_debug === "0" || options.im_debug === "0";
  return !forceOff;
}
function syncLiveSocketDebug(options = liveDebugOptions.value || {}) {
  const enabled = isLiveDebugEnabled(options);
  installLiveSocketDebug(enabled);
  setLiveSocketDebugEnabled(enabled);
}
function setLiveDebugOptions(options = {}) {
  liveDebugOptions.value = { ...(options || {}) };
  syncLiveSocketDebug(liveDebugOptions.value);
}
function safeStringify(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch (_) {
    return String(value || "");
  }
}
function maskDebugString(value = "") {
  return String(value).replace(
    /([?&](?:token|wx_token|auth|auth_key|sign|signature|secret|_tc)=)[^&]*/gi,
    "$1***",
  );
}
function maskDebugObject(value = {}) {
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, rawValue]) => {
    if (/token|auth|sign|signature|secret|_tc/i.test(key)) {
      return [key, "***"];
    }
    return [key, typeof rawValue === "string" ? maskDebugString(rawValue) : rawValue];
  }));
}
function getCurrentRouteInfo() {
  try {
    const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
    const page = pages[pages.length - 1];
    return {
      route: page?.route || "",
      options: maskDebugObject(page?.options || {}),
    };
  } catch (_) {
    return { route: "", options: {} };
  }
}
function getProductListDebugLength() {
  return Array.isArray(productList?.value) ? productList.value.length : 0;
}
function getLiveTabDebugState() {
  return {
    mode: mode.value,
    activeTab: activeTab.value,
    activeTabIndex: activeTabIndex.value,
    showProductList: showProductList.value,
    productListLength: getProductListDebugLength(),
    productLoading: productLoading.value,
    productFinished: productFinished.value,
    roomSetting: {
      enableChat: roomSetting.value?.enableChat,
      showProduct: roomSetting.value?.showProduct,
    },
  };
}
function recordTabDebugEvent(type, detail = {}) {
  const event = {
    at: new Date().toISOString(),
    type,
    detail,
    state: getLiveTabDebugState(),
  };
  tabDebugEvents.value = [...tabDebugEvents.value.slice(-29), event];
}
syncLiveSocketDebug();
let scheduleLiveSoundIntentRestore = () => {};
let hasPendingUnmute = () => false;
let markStoredSoundIntentRestore = () => {};
let clearStoredSoundIntentRestore = () => {};
let hasStoredSoundIntentRestore = () => false;
let stopLiveSoundIntentRestore = () => {};
let syncScreenWakeLock = () => {};
let releaseScreenWakeLock = () => {};
let stopScreenWakeLock = () => {};
function syncStageVideoElement() {
  nextTick(() => {
    if (!displayVideoUrl.value) return;
    const currentPlayer = videoPlayer;
    if (!currentPlayer) return;
    const seekTo = isReplay.value
      ? Number(replayLastTime.value || 0)
      : 0;
    initVideoPlayer(displayVideoUrl.value, {
      backupUrl: currentPlayer.backupUrl || "",
      backupRtmpUrl: currentPlayer.backupRtmpUrl || "",
      backupFlvUrl: currentPlayer.backupFlvUrl || "",
      backupHlsUrl: currentPlayer.backupHlsUrl || "",
      liveCandidates: Array.isArray(currentPlayer.liveCandidates) ? currentPlayer.liveCandidates : [],
      sourceType: currentPlayer.sourceType || "",
      sourceComponent: currentPlayer.sourceComponent || "",
      liveQuality: currentPlayer.liveQuality || "",
      rtcConfig: currentPlayer.rtcConfig || null,
      isReplay: isReplay.value,
      seekTo,
    });
  });
}
let reportLiveEntry = async () => false;
let pauseLivePlaybackForMiniWindow = () => {};
let restoreLivePlaybackFromMiniWindow = () => {};
let applyMiniResumeOptions = () => false;
let applyProductHotOrder = () => false;
let refreshCenterOrderStats = () => {};
const helperAccessDeniedUnionId = () => accessDeniedUnionId.value;
const entryHelpers = useLiveEntryHelpers({
  API_BASE, roomCode, liveId, liveName, liveCover, mode, liveTenantId,
  getAccessDeniedUnionId: helperAccessDeniedUnionId,
  isPlaying,
  syncLiveMiniWindowState: (...args) => syncLiveMiniWindowState(...args),
});
const {
  buildWsUrl, isDebugLocalLogin, _isSameOrigin, getLiveRedirectUrl,
  getOrderListUrl, copyAccessDeniedUid, onVideoPlay,
} = entryHelpers;
const {
  showBuyPopup, buyProduct, buyRemark, buyLoading, pendingOrderId, showAddressPopup, addressPopupSource, showAddressFormPopup,
  editAddressData, addressList, selectedAddressId, selectedAddress, pendingRecoverBuyCtx, buyAddressText, buyShippingFee, buyGoodsAmount,
  buyTotalPrice, buyDiscountAmount, usableCoupons, unusableCoupons, selectedCouponId, couponLoading, onProductBuy, onBuyConfirm,
  ensureBuyAddressLoaded, openBuyAddressPopup, onBuyQuantityChange, onBuySkuChange, onBuyCouponSelect, onSelectBuyAddress, onAddBuyAddress, onEditBuyAddress,
  onBuyAddressSaved, onDeleteBuyAddress, onImportWxAddress, recoverBuyContextFromWxPick,
	} = useLivePurchase({
	  liveId, roomCode, liveTenantId, shareCode, liveBindId, isReplay, replayCurrentVideoId,
	  showProductList, getLiveRedirectUrl, getEffectiveTermId, isDebugLocalLogin, getAddressList,
	  deleteAddress, confirmOrder, createOrder, getUsableCoupons, executeYeepayPayment, importWxAddress, saveBuyContext, loadBuyContext,
	  clearBuyContext,
	  onOrderCreated: ({ productId, quantity }) => applyProductHotOrder(productId, quantity),
	  onPendingOrderChanged: () => refreshCenterOrderStats(),
  sendBuyReminder, roomSetting, roomGroupType, mode, userStore,
});
const {
  showLiveReportPopup, showCenterPopup, centerPopupOrderStats, centerPopupName, centerPopupAvatar, signConfig, signFields, hasSigned,
  showSignPopup, toggleCenter, onCenterAction, goReport, onSignedDone, loadSignStatus,
  refreshCenterOrderStats: refreshCenterOrderStatsAction,
} = useLiveSidePanels({
  liveId, roomCode, roomCurrentTermId, myUserId, liveTenantId, shareCode, liveBindId, isReplay, replayCurrentVideoId, anchorName, anchorAvatar, userStore, getLiveRedirectUrl, isDebugLocalLogin,
  ensureBuyAddressLoaded, addressPopupSource, showAddressPopup, getCenter, getOrderUnreadStats, getOrderList, getRefundUnreadStats, checkSigned,
});
refreshCenterOrderStats = refreshCenterOrderStatsAction;
const displayState = useLiveDisplayState({
  userStore, anchorName, liveName, warmUpVideoUrl, warmUpVideoCoverImage, liveCover, replayCover, isReplay,
  replayCurrentIndex, replayVideosList, videoUrl, isIOSH5, scheduleTimeStr, nowTs, scheduleEnabled, domainStore,
  pushStatus, videoDebugInfo, chatBgImage, isWeChatIOSH5, showEntryOverlay, accessDenied, mode, roomGroupType,
});
const {
  accessDeniedUserAvatar, accessDeniedUserName, accessDeniedUnionId, accessDeniedTitle, accessDeniedUidText, shouldShowEntryOverlay, currentVideoPoster, videoPoster,
  displayVideoUrl, scheduleTargetTs, isWaitingSchedule, countdownParts, hasSubscribeConfig, showLandscapeSubscribe, videoDebugBadge, showNotStartedOverlay,
  liveOverlayTitle, commentListStyle,
} = displayState;
const { onSubscribePush } = useLiveSubscribePush({
  liveTenantId, domainStore,
});
watch([displayVideoUrl, mode, isReplay], ([url, nextMode, replay]) => {
  if (!showReplayFirstVideoLoading.value) return;
  if (url || nextMode !== "portrait" || !replay) {
    showReplayFirstVideoLoading.value = false;
  }
});
watch([displayVideoUrl, videoRenderKey, isReplay], ([url, renderKey, replay]) => {
  if (!url || replay || !shouldPreferMiniProgramHlsPlayback()) return;
  nextTick(() => {
    if (!displayVideoUrl.value || videoRenderKey.value !== renderKey || isReplay.value) return;
    resumeVideoPlayback(80, { force: true });
  });
}, { flush: "post" });
const {
  currentProduct, productTotal, productPage, productPageSize, productLoading, productFinished, productList, explainingProductId,
  productCardActiveIndex, productCardItems, mapProductItem, syncProductCardIndex, onProductCardChange, incrementProductHotOrder, setProductSales, loadProductList,
  loadCurrentProduct,
	} = useLiveProducts({
	  liveId, showProduct, isReplay, replayCurrentVideoId, getLiveProducts, getCurrentProduct,
	});
applyProductHotOrder = incrementProductHotOrder;
const liveComments = useLiveComments({
  videoUrl, isPlaying, isReplay, roomGroupType, roomSetting, pushStatus, liveStatusText, hasReplay, liveId, replayCurrentVideoId,
  replayLastTime, chatDisabled, inputText, inputFocused, keyboardHeight,
  blurInput, defaultAvatar, getCommentHistory, getLiveSocket: () => getLiveSocket(),
  userStore, roomCode, liveTenantId, shareCode, liveBindId, getEffectiveTermId, myUserId,
});
const {
  scrollToId, commentScrollWithAnimation, messages, visibleMessages, pinnedMessage, refreshPinnedMessage, replayCommentTimeline, replayCommentCursor, shouldShowComments,
  canAppendLiveMessages, formatLiveNickname, scrollToBottom, sendMessage, handleSendClick,
  shouldFollowLatestCommentWindow, handleCommentWindowScroll, loadPreviousCommentWindow, loadNextCommentWindow, loadCommentHistory, enqueueReplayComments, clearCommentQueue, appendReplayComment, appendSystemMessage,
  replaceReplayMessagesAt, syncReplayCommentCursor, isPendingSentContent, upgradeOptimisticMessage, hasVisibleChatMessage,
} = liveComments;
const { enterNotice, showEnterNotice } = useLiveEnterNotice();
const {
  buyingNotice, goShoppingNotice, productListSuccessNotice, showBuyingNotice, showGoShoppingNotice, showProductListSuccessNotice, bindProductListMockRotation,
} = useLiveBuyingNotice();
bindProductListMockRotation({
  showProductList, productList,
  enabled: () => Number(roomSetting.value?.buySuccessReminder || 0) === 1,
});
const marketingRuntime = useLiveMarketingRuntime({
  roomCode, liveId, liveTenantId, shareCode, liveBindId, myUserId, isPlaying,
  getLiveDetailApi: getLiveDetail,
  getEffectiveTermId, sendMessage, inputText, handleSendClick, appendSystemMessage, shouldShowEntryOverlay, pushStatus, isReplay,
});
const {
  hasVisibleWatchRewardTasks, watchRewardEntryLabel, commentLotteryEntryVisible, commentLotteryEntryKeyword, commentLotteryBubbleVisible, syncMarketingFromLiveDetail, reloadMarketingRuntime, requestWatchRewardReload,
  openWatchRewardPanel, handleWatchRewardWinNotify, handleWatchRewardBroadcast, handleLotteryResult,
  handleWinNotify: handleLotteryWinNotify,
  handleWinRecordUpdate, handleCommentLotterySendClick, openCommentPrizeRuleModal, handleCommentLotteryStarted, handleCommentLotteryOpened, handleCommentLotteryConfigUpdated, handleCommentLotteryWinNotify, handleCommentLotteryWinRecordUpdate,
} = marketingRuntime;
const scheduleExplainTimerRef = ref(null);
const replayFutureStartTimerRef = ref(null);
const scheduleExplainActiveId = ref(0);
const replayProductSchedule = createReplayProductScheduleController();
const videoRuntime = useLiveVideoRuntime({
  videoUrl, warmUpVideoUrl,
  isScheduleWarmupMode: () => isScheduleWarmupMode,
  isPlaying, isReplay, pushStatus, videoFrameReady, mediaSourceComponent,
  getVideoPlayer: () => videoPlayer,
  createMediaContext: (id, type) => stageHostRef.value?.createMediaContext?.(id, type),
});
getLiveVideoElement = videoRuntime.getLiveVideoElement;
applyInlineVideoAttrs = videoRuntime.applyInlineVideoAttrs;
resumeVideoPlayback = videoRuntime.resumeVideoPlayback;
const recordPlaybackDebugEvent = () => {};
const probePlaybackUrl = () => {};
const liveAdaptiveQuality = useLiveAdaptiveQuality({
  switchStream: (stream, reason) => switchLiveStreamQuality(stream, reason),
  recordPlaybackDebugEvent,
});
const {
  setPullStreams,
  updateSignedStreams,
  getPreferredQuality: getPreferredLiveQuality,
  handleQualitySample,
} = liveAdaptiveQuality;
const iosWechatBridge = useIOSWechatBridgeAutoPlay({
  isWeChatIOSH5, isMuted,
  getVideoPlayer: () => videoPlayer,
  getLiveVideoElement,
  syncLiveMiniWindowState: (...args) => syncLiveMiniWindowState(...args),
  recordPlaybackDebugEvent,
});
tryIOSWechatBridgeAutoPlay = iosWechatBridge.tryIOSWechatBridgeAutoPlay;
tryIOSWechatBridgeMutedPlay = iosWechatBridge.tryIOSWechatBridgeMutedPlay;
setIOSWechatBridgeSoundAutoPlayAllowed = iosWechatBridge.setIOSWechatBridgeSoundAutoPlayAllowed;
const {
  persistReplayProgress, flushViewProgressBeacon,
} = useLiveProgressReport({
  isReplay, liveId, replayCurrentVideoId, replayLastTime, getLiveVideoElement,
  getSeekTarget: () => getSeekTarget(),
  setLastSavedProgress: (value) => setLastSavedProgress(value),
  roomGroupType, replayVideosList, replayCurrentIndex,
  roomCode, liveTenantId, shareCode, liveBindId, myUserId,
});
const entryActions = useLiveEntryActions({
  mode, showProductList, productLoading, productList, loadProductList, activeTabIndex, activeTab, currentProduct,
  getEffectiveTermId, liveId, roomCode, liveTenantId, shareCode, liveBindId, isReplay, myUserId, likeCount, sendLike, getLiveSocket, isMuted,
  getVideoPlayer: () => videoPlayer,
  roomSetting, isTruthyFlag, signConfig,
  recordTabDebugEvent,
});
const {
  hearts, tapEffects, comboInfo, toggleProduct, onGrab, onProductDetail, doLike, onVideoTap,
  finishHeartAnimation, finishTapEffect, onShareAction, setActiveTabIndex, onTabChange,
} = entryActions;
switchToFirstAvailableTab = entryActions.switchToFirstAvailableTab;
const playbackWiring = useLivePlaybackWiring({
  replayFutureStartTimerRef, replayVideosList, replayCurrentIndex, replayCurrentVideoId, replayLoopPlay, replayLastTime, isReplay, isPlaying,
  pullUrl, videoUrl, replayProductSchedule, scheduleExplainActiveId, messages, clearCommentQueue, productList, showProduct,
  refreshPinnedMessage,
  explainingProductId, currentProduct,
  getVideoPlayer: () => videoPlayer,
  setVideoPlayer: (value) => { videoPlayer = value; },
  getLiveVideoElement, loadCommentHistory, loadCurrentProduct, liveId, roomGroupType, roomWatchByDay, pushStatus, stopHeartbeat,
  roomCode, liveTenantId, shareCode, liveBindId, myUserId,
  persistReplayProgress, roomCurrentTermId, syncLiveMiniWindowState, syncReplayCommentCursor, enqueueReplayComments, replayCommentCursor, replayCommentTimeline, replaceReplayMessagesAt,
  mapProductItem, syncProductCardIndex,
  incrementProductHotOrder: applyProductHotOrder,
  showBuyingNotice, showGoShoppingNotice, formatLiveNickname,
  reportViewProgressApi: reportViewProgress,
  scheduleExplainTimerRef,
  setVideoDebugActualCaptured: (value) => { _videoDebugActualCaptured = value; },
  videoDebugInfo, currentVideoPoster, liveCover, isMuted, videoFrameReady,
  videoRenderKey,
  createMediaContext: (id, type) => stageHostRef.value?.createMediaContext?.(id, type),
  mediaSourceComponent,
  mediaSourceType,
  getVideoDebugActualCaptured: () => _videoDebugActualCaptured,
  applyInlineVideoAttrs, autoplayBlocked,
  isScheduleWarmupMode: () => isScheduleWarmupMode,
  isWaitingSchedule, resumeAfterSchedule,
  setReplayFutureStartTimer: (timer) => { replayFutureStartTimerRef.value = timer; },
  tryIOSWechatBridgeAutoPlay, tryIOSWechatBridgeMutedPlay, resumeVideoPlayback,
  hasPendingUnmute: (...args) => hasPendingUnmute(...args),
  hasStoredSoundIntentRestore: (...args) => hasStoredSoundIntentRestore(...args),
  scheduleLiveSoundIntentRestore: (...args) => scheduleLiveSoundIntentRestore(...args),
  rtcConfig, isWeChatIOSH5, quickReplies,
  refreshLiveStatusNow: (...args) => refreshLiveStatusNow(...args),
  recordPlaybackDebugEvent,
  probePlaybackUrl,
  onQualitySample: handleQualitySample,
  playbackErrorVisible,
  playbackErrorText,
  mediaSourceComponent,
  mediaSourceType,
});
stopReplayFutureStartTimer = playbackWiring.stopReplayFutureStartTimer;
getReplayVideoSchedule = playbackWiring.getReplayVideoSchedule;
resetReplayContext = playbackWiring.resetReplayContext;
enterReplayPendingState = playbackWiring.enterReplayPendingState;
playReplayVideoByIndex = playbackWiring.playReplayVideoByIndex;
getSavedReplayProgress = playbackWiring.getSavedReplayProgress;
getPreferredReplayResume = playbackWiring.getPreferredReplayResume;
onVideoTimeUpdate = playbackWiring.onVideoTimeUpdate;
getSeekTarget = playbackWiring.getSeekTarget;
setSeekTarget = playbackWiring.setSeekTarget;
setLastSavedProgress = playbackWiring.setLastSavedProgress;
initVideoPlayer = playbackWiring.initVideoPlayer;
switchLiveStreamQuality = playbackWiring.switchLiveStreamQuality;
handleLivePlayerFailure = playbackWiring.handleLivePlayerFailure;
markPlaybackReady = playbackWiring.markPlaybackReady;
retryPlayback = playbackWiring.retryPlayback;
const handleVideoPlayerEnded = playbackWiring.handleVideoPlayerEnded;
const soundIntent = useLiveSoundIntent({
  isMuted, showEntryOverlay, isWaitingSchedule, warmUpVideoUrl, getLiveVideoElement,
  getVideoPlayer: () => videoPlayer,
  syncLiveMiniWindowState: (...args) => syncLiveMiniWindowState(...args),
  resumeVideoPlayback, setIOSWechatBridgeSoundAutoPlayAllowed,
  onEnterLive: () => {
    reportLiveEntry().catch((e) => console.warn("[Live] reportLiveEntry fail:", e));
  },
});
enterLive = soundIntent.enterLive;
manualPlayVideo = soundIntent.manualPlayVideo;
scheduleLiveSoundIntentRestore = soundIntent.scheduleLiveSoundIntentRestore;
hasPendingUnmute = soundIntent.hasPendingUnmute;
markStoredSoundIntentRestore = soundIntent.markStoredSoundIntentRestore;
clearStoredSoundIntentRestore = soundIntent.clearStoredSoundIntentRestore;
hasStoredSoundIntentRestore = soundIntent.hasStoredSoundIntentRestore;
stopLiveSoundIntentRestore = soundIntent.stopLiveSoundIntentRestore;
const screenWakeLock = useLiveScreenWakeLock({
  roomGroupType, isReplay, pushStatus, isPlaying, pullUrl, videoUrl,
});
syncScreenWakeLock = screenWakeLock.syncScreenWakeLock;
releaseScreenWakeLock = screenWakeLock.releaseWakeLock;
stopScreenWakeLock = screenWakeLock.stopScreenWakeLock;
const miniWindow = useLiveMiniWindow({
  getLiveVideoElement, replayLastTime, displayVideoUrl, pullUrl, roomCode, replayVideosList, replayCurrentIndex, liveId,
  replayCurrentVideoId, liveName, currentVideoPoster, liveCover, isReplay, isMuted, pushStatus, isPlaying,
  getVideoPlayer: () => videoPlayer,
  scheduleLiveSoundIntentRestore,
  initVideoPlayer: (...args) => initVideoPlayer(...args),
  playReplayVideoByIndex, setSeekTarget,
  verifySeekResult: (...args) => playbackWiring.verifySeekResult(...args),
  setLastSavedProgress: (value) => setLastSavedProgress(value),
  replaceReplayMessagesAt, loadCommentHistory,
});
syncLiveMiniWindowState = miniWindow.syncLiveMiniWindowState;
pauseLivePlaybackForMiniWindow = miniWindow.pauseLivePlaybackForMiniWindow;
restoreLivePlaybackFromMiniWindow = miniWindow.restoreLivePlaybackFromMiniWindow;
applyMiniResumeOptions = miniWindow.applyMiniResumeOptions;
clearLiveMiniWindowState = miniWindow.clearLiveMiniWindowState;
const handleWsMessage = createLiveWsMessageHandler({
  myUserId, isReplay, replayCurrentVideoId, replayCommentTimeline, formatLiveNickname, defaultAvatar, canAppendLiveMessages, shouldFollowLatestCommentWindow, messages,
  showEnterNotice, showBuyingNotice, showGoShoppingNotice, showProductList, showProductListSuccessNotice,
  isEntryOverlayVisible: () => Boolean(shouldShowEntryOverlay.value),
  refreshPinnedMessage, scrollToBottom, currentProduct, mapProductItem,
  incrementProductHotOrder: applyProductHotOrder,
  setProductSales, showProduct, productList, explainingProductId, syncProductCardIndex, productTotal, productFinished, showBuyPopup,
  buyProduct, buyLoading, likeCount, setViewerCountDisplay, viewerCount, roomSetting, pushStatus, hasReplay,
  liveStatusText, roomGroupType,
  liveStartTime: liveDate,
  switchToFirstAvailableTab, inputFocused, replayProductSchedule, scheduleExplainActiveId, replayLastTime, replayCommentCursor, clearCommentQueue, videoDebugInfo,
  resetReplayLoopDebugState: () => {
    setLastSavedProgress(0);
    _videoDebugActualCaptured = false;
  },
  getLiveVideoElement,
  getVideoPlayer: () => videoPlayer,
  createMediaContext: (id, type) => stageHostRef.value?.createMediaContext?.(id, type),
  liveId, isPlaying, userMuted, userBlocked, muteTipVisible, muteRemainText, accessDenied, startMuteCountdown,
  stopMuteCountdown,
  onWatchRewardWinNotify: handleWatchRewardWinNotify,
  onWatchRewardLifecycle: requestWatchRewardReload,
  onWatchRewardBroadcast: handleWatchRewardBroadcast,
  onLotteryResult: handleLotteryResult,
  onWinRecordUpdate: handleWinRecordUpdate,
  onLotteryWinNotify: handleLotteryWinNotify,
  onCommentLotteryStarted: handleCommentLotteryStarted,
  onCommentLotteryOpened: handleCommentLotteryOpened,
  onCommentLotteryConfigUpdated: handleCommentLotteryConfigUpdated,
  onCommentLotteryWinNotify: handleCommentLotteryWinNotify,
  onCommentLotteryWinRecordUpdate: handleCommentLotteryWinRecordUpdate,
  isPendingSentContent, upgradeOptimisticMessage, hasVisibleChatMessage,
  recordPlaybackDebugEvent,
  updateSignedStreams,
  getPreferredLiveQuality,
  markStatusPushReceived,
});
const webSocket = useMessageChannel({
  liveId, roomCode, liveTenantId, shareCode, liveBindId, isReplay, myUserId, getEffectiveTermId,
  roomGroupType, roomBroadcastMethod, loadCommentHistory, handleWsMessage,
  onOpen: reloadMarketingRuntime,
});
initWebSocket = webSocket.initWebSocket;
getLiveSocket = webSocket.getLiveSocket;
closeLiveSocket = webSocket.closeLiveSocket;
sendFallbackEnter = webSocket.sendFallbackEnter;
const imDebugVisible = computed(() => {
  return false;
});
const liveTabDebugSummary = computed(() => {
  const state = getLiveTabDebugState();
  const lastEvent = tabDebugEvents.value[tabDebugEvents.value.length - 1];
  const last = lastEvent
    ? `${lastEvent.type}:${lastEvent.detail?.parsedName || lastEvent.state?.activeTabIndex || "-"}`
    : "-";
  return `tab:${state.activeTab}/${state.activeTabIndex} goods:${state.productListLength} loading:${state.productLoading ? "Y" : "N"} showProduct:${state.roomSetting.showProduct ?? "-"} last:${last}`;
});
const imDebugSummary = computed(() => {
  const state = webSocket.channelDebugState.value || {};
  const im = state.im || {};
  const ws = state.ws || {};
  const socketDebug = getLiveSocketDebugSnapshot();
  const socketEvents = Array.isArray(socketDebug.events) ? socketDebug.events : [];
  const lastSocketClose = socketEvents
    .slice()
    .reverse()
    .find((event) => String(event?.event || "").startsWith("socket_close"));
  const err = im.openError || im.joinError || im.tokenError || im.lastSendSkipReason || "";
  const close = im.lastClose || {};
  const closeReason = close.code || close.reason ? `${close.code || "-"}:${close.reason || "-"}` : "-";
  const wsSend = ws.lastSendOk === null || ws.lastSendOk === undefined ? "-" : (ws.lastSendOk ? "Y" : "N");
  const socketClose = lastSocketClose ? `${lastSocketClose.event}#${lastSocketClose.taskId || "-"}` : "-";
  return `${liveTabDebugSummary.value} | mode:${state.mode || "-"} send:${state.sendChannel || "-"} ws:${ws.state || state.wsState || "-"} wsSend:${wsSend} wsEvent:${ws.lastEvent || "-"} wsFail:${ws.lastSendFail || "-"} im:${im.state || "-"} imOpen:${im.isOpened ? "Y" : "N"} imSend:${im.lastSendOk === null ? "-" : (im.lastSendOk ? "Y" : "N")} imEvent:${im.lastEvent || "-"} close:${closeReason}${im.expectedClose ? "(expected)" : ""} sockClose:${socketClose} err:${err || "-"}`;
});
const imDebugReport = computed(() => safeStringify({
  generatedAt: new Date().toISOString(),
  route: getCurrentRouteInfo(),
  live: {
    liveId: liveId.value,
    roomCode: roomCode.value,
    roomGroupType: roomGroupType.value,
    roomBroadcastMethod: roomBroadcastMethod.value,
    pushStatus: pushStatus.value,
    isReplay: isReplay.value,
    replayCurrentVideoId: replayCurrentVideoId.value,
    tokenPresent: Boolean(userStore.token),
  },
  tabs: {
    ...getLiveTabDebugState(),
    recentEvents: tabDebugEvents.value.slice(-30),
  },
  playback: {
    videoUrl: maskDebugString(videoUrl.value),
    displayVideoUrl: maskDebugString(displayVideoUrl.value),
    pullUrl: maskDebugString(pullUrl.value),
    isPlaying: isPlaying.value,
    videoFrameReady: videoFrameReady.value,
    isMuted: isMuted.value,
    mediaSourceComponent: mediaSourceComponent.value,
    mediaSourceType: mediaSourceType.value,
    videoDebugInfo: videoDebugInfo.value,
  },
  messageChannel: webSocket.channelDebugState.value,
  wsDebug: webSocket.channelDebugState.value?.ws || null,
  socketDebug: getLiveSocketDebugSnapshot(),
}));
function copyImDebugInfo() {
  const report = imDebugReport.value;
  imDebugCopyStatus.value = "复制中...";
  function markCopied() {
    imDebugCopyStatus.value = "已复制";
  }
  function fallbackCopy(reason = "") {
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav?.clipboard?.writeText) {
      nav.clipboard.writeText(report).then(markCopied).catch(() => {
        imDebugCopyStatus.value = reason ? `复制失败:${reason}` : "复制失败";
      });
      return;
    }
    if (typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = report;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        imDebugCopyStatus.value = copied ? "已复制" : (reason ? `复制失败:${reason}` : "复制失败");
        return;
      } catch (_) {}
    }
    imDebugCopyStatus.value = reason ? `复制失败:${reason}` : "复制失败";
  }
  if (!uni?.setClipboardData) {
    fallbackCopy("noapi");
    return;
  }
  uni.setClipboardData({
    data: report,
    success() {
      markCopied();
    },
    fail(error) {
      fallbackCopy(error?.errMsg || "uni");
    },
  });
}
const heartbeatStatus = useLiveHeartbeatStatus({
  liveId, sessionId,
  getEnterTimestamp: () => enterTimestamp,
  pushStatus, isPlaying, liveHeartbeat, getLiveStatus, setViewerCountDisplay, viewerCount, likeCount, isReplay,
  videoFrameReady,
  isScheduleWarmupMode: () => isScheduleWarmupMode,
  isWaitingSchedule, pullUrl, messages,
  refreshPinnedMessage,
  initVideoPlayer: (...args) => initVideoPlayer(...args),
  getVideoPlayer: () => videoPlayer,
  recordPlaybackDebugEvent,
  updateSignedStreams,
  getPreferredLiveQuality,
  getPushChannelState: () => webSocket.channelState.value,
  getLastStatusPushAt: () => lastStatusPushAt.value,
  getIsPageVisible: () => pageVisible.value,
  getIsMiniWindowActive: () => landscapeMiniActive.value,
  getIsPlaybackPaused: () => {
    if (!pullUrl.value) return false;
    const el = getLiveVideoElement();
    return !isPlaying.value || !!el?.paused;
  },
});
startHeartbeat = heartbeatStatus.startHeartbeat;
stopHeartbeat = heartbeatStatus.stopHeartbeat;
startStatusPoll = heartbeatStatus.startStatusPoll;
stopStatusPoll = heartbeatStatus.stopStatusPoll;
refreshLiveStatusNow = heartbeatStatus.refreshLiveStatusNow;
const scheduleResume = useLiveScheduleResume({
  scheduleTargetTs, nowTs,
  setScheduleWarmupMode: (value) => {
    isScheduleWarmupMode = value;
  },
  replayVideosList, isReplay, pushStatus,
  getReplayVideoSchedule: (...args) => getReplayVideoSchedule(...args),
  playReplayVideoByIndex: (...args) => playReplayVideoByIndex(...args),
  enterReplayPendingState: (...args) => enterReplayPendingState(...args),
  replayFutureStartTimerRef, pullUrl,
  initVideoPlayer: (...args) => initVideoPlayer(...args),
  buildWsUrl, liveId, initWebSocket, roomSetting, loadCommentHistory, loadProductList, loadCurrentProduct, userStore,
  reportLiveEntry: (...args) => reportLiveEntry(...args),
  startStatusPoll,
});
const { stopScheduleTimers, startScheduleTimers } = scheduleResume;
resumeAfterSchedule = scheduleResume.resumeAfterSchedule;
const {
  initLive, getLastInitOptions, setPendingSubscribeBack,
  reportLiveEntry: reportLiveEntryAction,
  isDistributor, distributorStatus,
} = useLiveEntryInitializer({
  runtime: entryInitRuntime,
  stopScheduleTimers,
  liveInitResolved,
  liveRedirecting,
  accessDenied,
  viewerLimitReached,
  viewerLimitText,
  showEntryOverlay,
  shouldShowEntryOverlay,
  showReplayFirstVideoLoading,
  pendingRecoverBuyCtx,
  isWeChatIOSH5,
  isMuted,
  replayCover,
  resetReplayContext,
  liveId,
  roomCode,
  shareCode,
  liveBindId,
  liveTenantId,
  liveName,
  liveCover,
  mode,
  userStore,
  myUserId,
  getLiveRedirectUrl,
  rtcConfig,
  roomGroupType,
  roomBroadcastMethod,
  roomWatchByDay,
  roomCurrentTermId,
  _isSameOrigin,
  anchorName,
  anchorAvatar,
  setViewerCountDisplay,
  likeCount,
  saveContextOptions: saveLiveRoomContext,
  chatBgImage, liveDate, pushStatus, pullUrl, videoUrl, videoFrameReady, isReplay, isLiveVisualMode,
  hasReplay, liveStatusText, isWaitingSchedule, scheduleEnabled, scheduleTimeStr, pushTime, warmUpVideoUrl, warmUpVideoCoverImage,
  bizCode, nowTs, replayVideosList, replayCurrentVideoId, replayLoopPlay, replayCurrentIndex, userBlocked, roomSetting,
  getPreferredReplayResume, getSavedReplayProgress, replayLastTime, signConfig, signFields, hasSigned, showSignPopup, loadSignStatus,
  switchToFirstAvailableTab,
  setScheduleWarmupMode: (value) => {
    isScheduleWarmupMode = value;
  },
  setLastSavedProgress: (value) => setLastSavedProgress(value),
  initVideoPlayer: (...args) => initVideoPlayer(...args),
  startScheduleTimers, getReplayVideoSchedule, enterReplayPendingState,
  setReplayFutureStartTimer: (timer) => {
    replayFutureStartTimerRef.value = timer;
  },
  playReplayVideoByIndex, initWebSocket, loadCommentHistory, loadProductList, loadCurrentProduct, sessionId,
  setEnterTimestamp: (value) => {
    enterTimestamp = value;
  },
  applyH5ViewerEnterBoost,
  startHeartbeat,
  stopHeartbeat,
  startStatusPoll,
  stopStatusPoll,
  recoverBuyContextFromWxPick,
  buildWsUrl,
  isPlaying,
  onLiveDetailLoaded: syncMarketingFromLiveDetail,
  quickReplies,
  sendFallbackEnter,
  closeLiveSocket,
  getLiveVideoElement,
  getVideoPlayer: () => videoPlayer,
  setVideoPlayer: (value) => { videoPlayer = value; },
  markStoredSoundIntentRestore, clearStoredSoundIntentRestore, setIOSWechatBridgeSoundAutoPlayAllowed,
  recordPlaybackDebugEvent,
  setPullStreams,
  getPreferredLiveQuality,
});
reportLiveEntry = reportLiveEntryAction;
const { handlePageHide, handlePageBackground } = useLivePageLeave({
  syncLiveMiniWindowState, persistReplayProgress, flushViewProgressBeacon, applyH5ViewerLeaveDecrease, liveId, sessionId,
  getEnterTimestamp: () => enterTimestamp,
  API_BASE,
  flushPendingLikes: entryActions.flushPendingLikes,
});
useLiveEntryLifecycle({
  applyMiniResumeOptions, getLastInitOptions, restoreLivePlaybackFromMiniWindow, resumeVideoPlayback, isMuted,
  hasPendingUnmute, scheduleLiveSoundIntentRestore, pendingOrderId, getOrderDetail, getOrderListUrl,
  pauseLivePlaybackForMiniWindow, clearLiveMiniWindowState, persistReplayProgress, stopKeyboardListener, stopScheduleTimers,
  roomGroupType, isReplay, replayCurrentVideoId, liveId, replayVideosList, replayCurrentIndex,
  reportViewProgress, replayLastTime, resetReplayContext, stopHeartbeat, stopStatusPoll,
  stopMuteCountdown, stopReplayFutureStartTimer, applyH5ViewerLeaveDecrease, stopViewerCountAnimation, scheduleExplainTimerRef,
  stopLiveSoundIntentRestore, syncScreenWakeLock, releaseScreenWakeLock, stopScreenWakeLock,
  replayProductSchedule, closeLiveSocket, handlePageHide, handlePageBackground, userStore,
  setPageVisible: (value) => { pageVisible.value = !!value; },
  refreshLiveStatusNow: (...args) => refreshLiveStatusNow(...args),
  leaveLiveRoom, sessionId,
  getVideoPlayer: () => videoPlayer,
  setVideoPlayer: (value) => { videoPlayer = value; },
  getWeixinBridgeReadyHandler: () => weixinBridgeReadyHandler,
  setWeixinBridgeReadyHandler: (handler) => { weixinBridgeReadyHandler = handler; },
  getVisibilityResumeHandler: () => visibilityResumeHandler,
  setVisibilityResumeHandler: (handler) => { visibilityResumeHandler = handler; },
  getEnterTimestamp: () => enterTimestamp,
});
const { stageState, stageActions } = useLiveStageBinding({
  mode, accessDenied, viewerLimitReached, liveInitResolved, anchorName, anchorAvatar, likeCount, isWaitingSchedule,
  broadcastNavHeight,
  warmUpVideoUrl, roomSetting, viewerCountAnimating, displayViewerCount, displayVideoUrl, videoRenderKey, isReplay, replayCurrentVideoId, hasReplay, isLiveVisualMode, quickReplies, roomGroupType,
  mediaSourceComponent, mediaSourceType,
  liveStatusText,
  videoPoster, replayCover, isMuted, showWxAddrDonePlayBtn, autoplayBlocked, playbackErrorVisible, playbackErrorText, showReplayFirstVideoLoading, isPlaying, isIOSH5, liveCover, videoFrameReady,
  tapEffects, comboInfo, shouldShowComments, scrollToId, commentScrollWithAnimation, messages, visibleMessages, showProduct, pinnedMessage,
  enterNotice, buyingNotice, goShoppingNotice, productListSuccessNotice,
  showProductList, currentProduct, productCardItems, productCardActiveIndex, productList, productTotal, productLoading,
  productFinished, muteTipVisible, userBlocked, muteRemainText, inputText, inputFocused,
  keyboardHeight, chatDisabled, bottomBarStyle, hearts, showShare, showCenterPopup, centerPopupName,
  centerPopupAvatar, centerPopupOrderStats, showBuyPopup, buyProduct, buyAddressText, selectedAddress,
  buyShippingFee, buyGoodsAmount, buyTotalPrice, buyDiscountAmount, buyRemark, buyLoading, usableCoupons, unusableCoupons, selectedCouponId, couponLoading, showLiveReportPopup, liveId,
  roomCode, shareCode, liveBindId, liveTenantId, broadcastReturnPath, liveName, showAddressPopup, addressList, selectedAddressId, showAddressFormPopup, editAddressData,
  signConfig, showSignPopup, signFields, hasSigned, roomCurrentTermId, myUserId, pushStatus, showNotStartedOverlay,
  liveOverlayTitle, shouldShowEntryOverlay, activeTab, activeTabIndex, showLandscapeSubscribe, commentListStyle, hasVisibleWatchRewardTasks, watchRewardEntryLabel,
  defaultAvatar, goReport, onVideoPlay, onVideoTimeUpdate, onVideoTap, manualPlayVideo,
  recordPlaybackDebugEvent,
  handleVideoPlayerEnded,
  handleLivePlayerFailure: (...args) => handleLivePlayerFailure(...args),
  markPlaybackReady: (...args) => markPlaybackReady(...args),
  retryPlayback: (...args) => retryPlayback(...args),
  getVideoPlayer: () => videoPlayer,
  setVideoFrameReady: (value) => { videoFrameReady.value = !!value; },
  onProductCardChange, onGrab, onProductBuy, onProductDetail, loadProductList, focusInput,
  onInputFocus, sendMessage, onInputBlur, handleSendClick: handleCommentLotterySendClick, handleCommentWindowScroll, loadPreviousCommentWindow, loadNextCommentWindow, toggleCenter, toggleProduct,
  doLike, finishHeartAnimation, finishTapEffect, onShareAction, onCenterAction, openBuyAddressPopup, onBuyQuantityChange, onBuySkuChange, onBuyCouponSelect, onBuyConfirm,
  onSelectBuyAddress, onAddBuyAddress, onEditBuyAddress, onDeleteBuyAddress, onImportWxAddress, onBuyAddressSaved,
  isTruthyFlag, onSignedDone, enterLive, onSubscribePush, setActiveTabIndex, onTabChange, openCommentPrizeRuleModal, openWatchRewardPanel,
  commentLotteryEntryVisible, commentLotteryEntryKeyword, commentLotteryBubbleVisible,
  isDistributor, distributorStatus,
  scheduleTimeStr, liveDate,
  syncLiveMiniWindowState, clearStoredSoundIntentRestore, setIOSWechatBridgeSoundAutoPlayAllowed,
  setLandscapeMiniActive,
});
watch(mode, () => {
  syncStageVideoElement();
});
watch(pushStatus, (next, prev) => {
  if (Number(next) !== 2 || Number(prev) === 2) return;
  if (isReplay.value && !isScheduleWarmupMode) return;
  if (hasReplay.value && replayVideosList.value.length > 0 && !videoUrl.value) return;
  try { videoPlayer?.pause?.(); } catch (e) {}
  try { getLiveVideoElement()?.pause?.(); } catch (e) {}
  isPlaying.value = false;
  videoUrl.value = "";
});
watch(videoFrameReady, (ready) => {
  if (ready) autoplayBlocked.value = false;
});
watch(isPlaying, (next, prev) => {
  if (next && !prev) refreshLiveStatusNow({ reason: "playback_resume" });
});
useLiveLoadBootstrapRegistration({
  getLiveDetail, initLive, scrollToBottom, isDebugLocalLogin, syncKeyboardViewportBaseHeight, getLiveVideoElement, applyInlineVideoAttrs, resumeVideoPlayback,
  handlePageHide, handlePageBackground,
  onOptions: setLiveDebugOptions,
  setPageVisible: (value) => { pageVisible.value = !!value; },
  refreshLiveStatusNow: (...args) => refreshLiveStatusNow(...args),
  isWeChatIOSH5,
  getWeixinBridgeReadyHandler: () => weixinBridgeReadyHandler,
  setWeixinBridgeReadyHandler: (handler) => { weixinBridgeReadyHandler = handler; },
  getVisibilityResumeHandler: () => visibilityResumeHandler,
  setVisibilityResumeHandler: (handler) => { visibilityResumeHandler = handler; },
  userStore, pendingRecoverBuyCtx, setPendingSubscribeBack, showEntryOverlay, showWxAddrDonePlayBtn, safeBottom, isIOSKeyboardMode,
});
</script>
<style lang="scss">
@import "./styles/entry-global.scss";
</style>
