"use strict";
const common_vendor = require("../../common/vendor.js");
const api_live = require("../../api/live.js");
const api_order = require("../../api/order.js");
const api_coupon = require("../../api/coupon.js");
const api_user = require("../../api/user.js");
const api_refund = require("../../api/refund.js");
const services_paymentAction = require("../../services/payment-action.js");
const services_wechatAddress = require("../../services/wechat-address.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const utils_liveBuyContext = require("../../utils/live-buy-context.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const api_address = require("../../api/address.js");
const pages_broadcast_useReplayProductSchedule = require("./useReplayProductSchedule.js");
const pages_broadcast_composables_useLiveProducts = require("./composables/useLiveProducts.js");
const pages_broadcast_composables_useLivePurchase = require("./composables/useLivePurchase.js");
const pages_broadcast_composables_useLiveSidePanels = require("./composables/useLiveSidePanels.js");
const stores_user = require("../../stores/user.js");
const stores_index = require("../../stores/index.js");
const stores_domain = require("../../stores/domain.js");
const utils_navigationBar = require("../../utils/navigation-bar.js");
const utils_urlHelpers = require("../../utils/url-helpers.js");
const pages_broadcast_utils_liveRouteContext = require("./utils/live-route-context.js");
const pages_broadcast_composables_useLiveChatInput = require("./composables/useLiveChatInput.js");
const pages_broadcast_composables_useLiveComments = require("./composables/useLiveComments.js");
const pages_broadcast_composables_useLiveDisplayState = require("./composables/useLiveDisplayState.js");
const pages_broadcast_composables_useLiveEntryActions = require("./composables/useLiveEntryActions.js");
const pages_broadcast_composables_useLiveEntryHelpers = require("./composables/useLiveEntryHelpers.js");
const pages_broadcast_composables_useLiveEntryInitializer = require("./composables/useLiveEntryInitializer.js");
const pages_broadcast_composables_useLiveEntryLifecycle = require("./composables/useLiveEntryLifecycle.js");
const pages_broadcast_composables_useLiveAdaptiveQuality = require("./composables/useLiveAdaptiveQuality.js");
const pages_broadcast_composables_useLiveEnterNotice = require("./composables/useLiveEnterNotice.js");
const pages_broadcast_composables_useLiveBuyingNotice = require("./composables/useLiveBuyingNotice.js");
const pages_broadcast_composables_useIOSWechatBridgeAutoPlay = require("./composables/useIOSWechatBridgeAutoPlay.js");
const pages_broadcast_composables_useLiveLoadBootstrap = require("./composables/useLiveLoadBootstrap.js");
const pages_broadcast_composables_useLiveMiniWindow = require("./composables/useLiveMiniWindow.js");
const pages_broadcast_composables_useLiveMuteState = require("./composables/useLiveMuteState.js");
const pages_broadcast_composables_useLiveMarketingRuntime = require("./composables/useLiveMarketingRuntime.js");
const pages_broadcast_composables_useLiveHeartbeatStatus = require("./composables/useLiveHeartbeatStatus.js");
const pages_broadcast_composables_useLivePageLeave = require("./composables/useLivePageLeave.js");
const pages_broadcast_composables_useLivePlaybackDebug = require("./composables/useLivePlaybackDebug.js");
const pages_broadcast_composables_useLivePlaybackWiring = require("./composables/useLivePlaybackWiring.js");
const pages_broadcast_composables_useLiveProgressReport = require("./composables/useLiveProgressReport.js");
const pages_broadcast_composables_useLiveScheduleResume = require("./composables/useLiveScheduleResume.js");
const pages_broadcast_composables_useLiveScreenWakeLock = require("./composables/useLiveScreenWakeLock.js");
const pages_broadcast_composables_useLiveSoundIntent = require("./composables/useLiveSoundIntent.js");
const pages_broadcast_composables_useLiveStageBinding = require("./composables/useLiveStageBinding.js");
const pages_broadcast_composables_useLiveSubscribePush = require("./composables/useLiveSubscribePush.js");
const pages_broadcast_composables_useLiveViewerMetrics = require("./composables/useLiveViewerMetrics.js");
const pages_broadcast_composables_useLiveVideoRuntime = require("./composables/useLiveVideoRuntime.js");
const pages_broadcast_composables_useMessageChannel = require("./composables/useMessageChannel.js");
const pages_broadcast_composables_useLiveWsMessageHandler = require("./composables/useLiveWsMessageHandler.js");
const pages_broadcast_utils_entryFormat = require("./utils/entry-format.js");
if (!Math) {
  (LiveBroadcastStageHost + LivePlaybackDebugFloat)();
}
const LiveBroadcastStageHost = () => "./components/LiveBroadcastStageHost.js";
const LivePlaybackDebugFloat = () => "./components/LivePlaybackDebugFloat.js";
const _sfc_main = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "entry",
  setup(__props) {
    const isWeChatIOSH5 = pages_broadcast_utils_entryFormat.detectWeChatIOSH5();
    const isIOSH5 = pages_broadcast_utils_entryFormat.detectIOSH5();
    const stageHostRef = common_vendor.ref(null);
    const API_BASE = utils_urlHelpers.getApiBaseUrl();
    const sessionId = common_vendor.ref("");
    let enterTimestamp = 0;
    const mode = common_vendor.ref("portrait");
    const videoUrl = common_vendor.ref("");
    const videoRenderKey = common_vendor.ref(0);
    const isPlaying = common_vendor.ref(false);
    const videoFrameReady = common_vendor.ref(false);
    const isMuted = common_vendor.ref(true);
    const videoDebugInfo = common_vendor.ref({
      intent: 0,
      actual: -1,
      source: "init"
      // 'resume' | 'fresh' | 'loop-restart' | 'live' | 'init'
    });
    let _videoDebugActualCaptured = false;
    const liveId = common_vendor.ref("");
    const liveName = common_vendor.ref("");
    const liveCover = common_vendor.ref("");
    const replayCover = common_vendor.ref("");
    const chatBgImage = common_vendor.ref("");
    const liveDate = common_vendor.ref("");
    const anchorName = common_vendor.ref("官方直播间");
    const anchorAvatar = common_vendor.ref("https://man.lqjy.cc/static/icons/default.png");
    const broadcastNavHeight = common_vendor.ref(utils_navigationBar.getCustomNavBarHeightStyle());
    const liveInitResolved = common_vendor.ref(false);
    const liveRedirecting = common_vendor.ref(false);
    const showEntryOverlay = common_vendor.ref(true);
    const showReplayFirstVideoLoading = common_vendor.ref(false);
    const likeCount = common_vendor.ref(0);
    const {
      viewerCount,
      viewerCountAnimating,
      displayViewerCount,
      setViewerCountDisplay,
      applyH5ViewerEnterBoost,
      applyH5ViewerLeaveDecrease,
      stopViewerCountAnimation
    } = pages_broadcast_composables_useLiveViewerMetrics.useLiveViewerMetrics();
    const safeBottom = common_vendor.ref(0);
    const isIOSKeyboardMode = common_vendor.ref(false);
    const showProduct = common_vendor.ref(false);
    const showProductList = common_vendor.ref(false);
    const showShare = common_vendor.ref(false);
    const myUserId = common_vendor.ref(0);
    const replayCurrentVideoId = common_vendor.ref(0);
    const replayLoopPlay = common_vendor.ref(false);
    const replayLastTime = common_vendor.ref(0);
    const replayVideosList = common_vendor.ref([]);
    const replayCurrentIndex = common_vendor.ref(-1);
    const scheduleEnabled = common_vendor.ref(0);
    const scheduleTimeStr = common_vendor.ref("");
    const pushTime = common_vendor.ref(0);
    const warmUpVideoUrl = common_vendor.ref("");
    const warmUpVideoCoverImage = common_vendor.ref("");
    const bizCode = common_vendor.ref("");
    const nowTs = common_vendor.ref(Date.now());
    const entryInitRuntime = {
      lastInitOptions: {},
      skipEntryOverlayOnce: false,
      liveInitToken: "",
      pendingSubscribeBack: false
    };
    let isScheduleWarmupMode = false;
    const roomSetting = common_vendor.ref({
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
      showHotSale: 1
    });
    const {
      userMuted,
      userBlocked,
      muteTipVisible,
      muteRemainText,
      chatDisabled,
      startMuteCountdown,
      stopMuteCountdown
    } = pages_broadcast_composables_useLiveMuteState.useLiveMuteState({ roomSetting });
    const {
      inputFocused,
      inputText,
      keyboardHeight,
      bottomBarStyle,
      onInputFocus,
      focusInput,
      blurInput,
      onInputBlur,
      syncKeyboardViewportBaseHeight,
      stopKeyboardListener
    } = pages_broadcast_composables_useLiveChatInput.useLiveChatInput({
      mode,
      chatDisabled,
      getStageRef: () => stageHostRef.value
    });
    const roomCode = common_vendor.ref("");
    const liveTenantId = common_vendor.ref(0);
    const shareCode = common_vendor.ref("");
    const liveBindId = common_vendor.ref("");
    const roomGroupType = common_vendor.ref(0);
    const roomBroadcastMethod = common_vendor.ref(null);
    const roomWatchByDay = common_vendor.ref(0);
    const roomCurrentTermId = common_vendor.ref(0);
    const broadcastReturnPath = common_vendor.computed(() => pages_broadcast_utils_liveRouteContext.buildBroadcastReturnPath({
      roomCode: roomCode.value,
      liveId: liveId.value,
      tenantId: liveTenantId.value,
      shareCode: shareCode.value,
      bindId: liveBindId.value || services_h5AuthContext.readBindId(),
      isReplay: isReplay.value,
      replayVideoId: replayCurrentVideoId.value,
      liveType: isReplay.value ? "replay" : "live"
    }));
    function getBroadcastSharePath() {
      const params = [];
      if (roomCode.value)
        params.push(`roomCode=${encodeURIComponent(roomCode.value)}`);
      if (liveId.value)
        params.push(`liveId=${encodeURIComponent(liveId.value)}`);
      if (liveTenantId.value)
        params.push(`tenantId=${encodeURIComponent(liveTenantId.value)}`);
      if (shareCode.value)
        params.push(`shareCode=${encodeURIComponent(shareCode.value)}`);
      const bindId = liveBindId.value || services_h5AuthContext.readBindId();
      if (bindId)
        params.push(`bindId=${encodeURIComponent(bindId)}`);
      appendReplayShareParams(params);
      const query = params.join("&");
      return `/pages/broadcast/entry${query ? `?${query}` : ""}`;
    }
    function appendReplayShareParams(params) {
      if (!isReplay.value)
        return;
      params.push("mode=replay");
      params.push("replay=1");
      params.push("liveType=replay");
      const videoId = String(replayCurrentVideoId.value || "").trim();
      if (!videoId || videoId === "0")
        return;
      const encoded = encodeURIComponent(videoId);
      params.push(`videoId=${encoded}`);
      params.push(`video_id=${encoded}`);
      params.push(`replayVideoId=${encoded}`);
      params.push(`replay_video_id=${encoded}`);
    }
    function getBroadcastShareTitle() {
      return liveName.value || `${anchorName.value || "主播"}的直播间`;
    }
    common_vendor.onShareAppMessage(() => ({
      title: getBroadcastShareTitle(),
      path: getBroadcastSharePath(),
      imageUrl: liveCover.value || anchorAvatar.value || ""
    }));
    common_vendor.onShareTimeline(() => {
      const path = getBroadcastSharePath();
      return {
        title: getBroadcastShareTitle(),
        query: path.includes("?") ? path.split("?")[1] : "",
        imageUrl: liveCover.value || anchorAvatar.value || ""
      };
    });
    function getEffectiveTermId() {
      var _a, _b;
      if (roomCurrentTermId.value > 0)
        return roomCurrentTermId.value;
      if (isReplay.value && replayCurrentIndex.value >= 0) {
        const v = (_a = replayVideosList.value) == null ? void 0 : _a[replayCurrentIndex.value];
        if ((v == null ? void 0 : v.termId) > 0)
          return v.termId;
      }
      if (isReplay.value && ((_b = replayVideosList.value) == null ? void 0 : _b.length) > 0) {
        for (const v of replayVideosList.value) {
          if (v.termId > 0)
            return v.termId;
        }
      }
      return 0;
    }
    const userStore = stores_user.useUserStore();
    const domainStore = stores_domain.useDomainStore(stores_index.pinia);
    const activeTab = common_vendor.ref("interact");
    const activeTabIndex = common_vendor.ref("0");
    const pushStatus = common_vendor.ref(0);
    const pullUrl = common_vendor.ref("");
    const isReplay = common_vendor.ref(false);
    const isLiveVisualMode = common_vendor.ref(false);
    const hasReplay = common_vendor.ref(false);
    const liveStatusText = common_vendor.ref("");
    const pageVisible = common_vendor.ref(true);
    const landscapeMiniActive = common_vendor.ref(false);
    const lastStatusPushAt = common_vendor.ref(0);
    const accessDenied = common_vendor.ref(false);
    const viewerLimitReached = common_vendor.ref(false);
    const viewerLimitText = common_vendor.ref("观看人数已达上限");
    const rtcConfig = common_vendor.ref(null);
    const quickReplies = common_vendor.ref([]);
    const showWxAddrDonePlayBtn = common_vendor.ref(false);
    const autoplayBlocked = common_vendor.ref(false);
    const playbackErrorVisible = common_vendor.ref(false);
    const playbackErrorText = common_vendor.ref("");
    const mediaSourceComponent = common_vendor.ref("");
    const mediaSourceType = common_vendor.ref("");
    let switchToFirstAvailableTab = () => {
    };
    let videoPlayer = null;
    let weixinBridgeReadyHandler = null;
    let visibilityResumeHandler = null;
    let syncLiveMiniWindowState = () => {
    };
    let stopReplayFutureStartTimer = () => {
    };
    let getReplayVideoSchedule = () => ({ activeIdx: -1, futureIdx: -1 });
    let resetReplayContext = () => {
    };
    let enterReplayPendingState = () => {
    };
    let playReplayVideoByIndex = () => {
    };
    let getSavedReplayProgress = () => 0;
    let getPreferredReplayResume = () => 0;
    let onVideoTimeUpdate = () => {
    };
    let getSeekTarget = () => 0;
    let setSeekTarget = () => {
    };
    let setLastSavedProgress = () => {
    };
    let initVideoPlayer = () => {
    };
    let switchLiveStreamQuality = async () => false;
    let handleLivePlayerFailure = () => false;
    let markPlaybackReady = () => {
    };
    let retryPlayback = () => false;
    let resumeAfterSchedule = () => {
    };
    let startHeartbeat = () => {
    };
    let stopHeartbeat = () => {
    };
    let startStatusPoll = () => {
    };
    let stopStatusPoll = () => {
    };
    let refreshLiveStatusNow = async () => null;
    let initWebSocket = async () => {
    };
    let getLiveSocket = () => null;
    let closeLiveSocket = () => {
    };
    let sendFallbackEnter = () => {
    };
    let getLiveVideoElement = () => null;
    let applyInlineVideoAttrs = () => {
    };
    let resumeVideoPlayback = () => {
    };
    let tryIOSWechatBridgeAutoPlay = () => {
    };
    let tryIOSWechatBridgeMutedPlay = () => {
    };
    let setIOSWechatBridgeSoundAutoPlayAllowed = () => {
    };
    let enterLive = () => {
    };
    let manualPlayVideo = () => {
    };
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
    let scheduleLiveSoundIntentRestore = () => {
    };
    let hasPendingUnmute = () => false;
    let markStoredSoundIntentRestore = () => {
    };
    let clearStoredSoundIntentRestore = () => {
    };
    let hasStoredSoundIntentRestore = () => false;
    let stopLiveSoundIntentRestore = () => {
    };
    let syncScreenWakeLock = () => {
    };
    let releaseScreenWakeLock = () => {
    };
    let stopScreenWakeLock = () => {
    };
    let getLiveQualityDebugSnapshot = () => null;
    function syncStageVideoElement() {
      common_vendor.nextTick$1(() => {
        if (!displayVideoUrl.value)
          return;
        const currentPlayer = videoPlayer;
        if (!currentPlayer)
          return;
        const seekTo = isReplay.value ? Number(replayLastTime.value || 0) : 0;
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
          seekTo
        });
      });
    }
    let reportLiveEntry = async () => false;
    let pauseLivePlaybackForMiniWindow = () => {
    };
    let restoreLivePlaybackFromMiniWindow = () => {
    };
    let applyMiniResumeOptions = () => false;
    let applyProductHotOrder = () => false;
    const helperAccessDeniedUnionId = () => accessDeniedUnionId.value;
    const entryHelpers = pages_broadcast_composables_useLiveEntryHelpers.useLiveEntryHelpers({
      API_BASE,
      roomCode,
      liveId,
      liveName,
      liveCover,
      mode,
      liveTenantId,
      getAccessDeniedUnionId: helperAccessDeniedUnionId,
      isPlaying,
      syncLiveMiniWindowState: (...args) => syncLiveMiniWindowState(...args)
    });
    const {
      buildWsUrl,
      isDebugLocalLogin,
      _isSameOrigin,
      getLiveRedirectUrl,
      getOrderListUrl,
      copyAccessDeniedUid,
      onVideoPlay
    } = entryHelpers;
    const {
      showBuyPopup,
      buyProduct,
      buyRemark,
      buyLoading,
      pendingOrderId,
      showAddressPopup,
      addressPopupSource,
      showAddressFormPopup,
      editAddressData,
      addressList,
      selectedAddressId,
      selectedAddress,
      pendingRecoverBuyCtx,
      buyAddressText,
      buyShippingFee,
      buyGoodsAmount,
      buyTotalPrice,
      buyDiscountAmount,
      usableCoupons,
      unusableCoupons,
      selectedCouponId,
      couponLoading,
      onProductBuy,
      onBuyConfirm,
      ensureBuyAddressLoaded,
      openBuyAddressPopup,
      onBuyQuantityChange,
      onBuySkuChange,
      onBuyCouponSelect,
      onSelectBuyAddress,
      onAddBuyAddress,
      onEditBuyAddress,
      onBuyAddressSaved,
      onDeleteBuyAddress,
      onImportWxAddress,
      recoverBuyContextFromWxPick
    } = pages_broadcast_composables_useLivePurchase.useLivePurchase({
      liveId,
      roomCode,
      liveTenantId,
      shareCode,
      liveBindId,
      isReplay,
      replayCurrentVideoId,
      showProductList,
      getLiveRedirectUrl,
      getEffectiveTermId,
      isDebugLocalLogin,
      getAddressList: api_address.getAddressList,
      deleteAddress: api_address.deleteAddress,
      confirmOrder: api_order.confirmOrder,
      createOrder: api_order.createOrder,
      getUsableCoupons: api_coupon.getUsableCoupons,
      executeYeepayPayment: services_paymentAction.executeYeepayPayment,
      importWxAddress: services_wechatAddress.importWxAddress,
      saveBuyContext: utils_liveBuyContext.saveBuyContext,
      loadBuyContext: utils_liveBuyContext.loadBuyContext,
      clearBuyContext: utils_liveBuyContext.clearBuyContext,
      onOrderCreated: ({ productId, quantity }) => applyProductHotOrder(productId, quantity),
      sendBuyReminder: api_live.sendBuyReminder,
      roomSetting,
      roomGroupType,
      mode,
      userStore
    });
    const {
      showLiveReportPopup,
      showCenterPopup,
      centerPopupOrderStats,
      centerPopupName,
      centerPopupAvatar,
      signConfig,
      signFields,
      hasSigned,
      showSignPopup,
      toggleCenter,
      onCenterAction,
      goReport,
      onSignedDone,
      loadSignStatus
    } = pages_broadcast_composables_useLiveSidePanels.useLiveSidePanels({
      liveId,
      roomCode,
      roomCurrentTermId,
      myUserId,
      liveTenantId,
      shareCode,
      liveBindId,
      isReplay,
      replayCurrentVideoId,
      anchorName,
      anchorAvatar,
      userStore,
      getLiveRedirectUrl,
      isDebugLocalLogin,
      ensureBuyAddressLoaded,
      addressPopupSource,
      showAddressPopup,
      getCenter: api_user.getCenter,
      getOrderUnreadStats: api_order.getOrderUnreadStats,
      getRefundUnreadStats: api_refund.getRefundUnreadStats,
      checkSigned: api_live.checkSigned
    });
    const displayState = pages_broadcast_composables_useLiveDisplayState.useLiveDisplayState({
      userStore,
      anchorName,
      liveName,
      warmUpVideoUrl,
      warmUpVideoCoverImage,
      liveCover,
      replayCover,
      isReplay,
      replayCurrentIndex,
      replayVideosList,
      videoUrl,
      isIOSH5,
      scheduleTimeStr,
      nowTs,
      scheduleEnabled,
      domainStore,
      pushStatus,
      videoDebugInfo,
      chatBgImage,
      isWeChatIOSH5,
      showEntryOverlay,
      accessDenied,
      mode,
      roomGroupType
    });
    const {
      accessDeniedUserAvatar,
      accessDeniedUserName,
      accessDeniedUnionId,
      accessDeniedTitle,
      accessDeniedUidText,
      shouldShowEntryOverlay,
      currentVideoPoster,
      videoPoster,
      displayVideoUrl,
      scheduleTargetTs,
      isWaitingSchedule,
      showLandscapeSubscribe,
      showNotStartedOverlay,
      liveOverlayTitle,
      commentListStyle
    } = displayState;
    const { onSubscribePush } = pages_broadcast_composables_useLiveSubscribePush.useLiveSubscribePush({
      liveTenantId,
      domainStore
    });
    common_vendor.watch([displayVideoUrl, mode, isReplay], ([url, nextMode, replay]) => {
      if (!showReplayFirstVideoLoading.value)
        return;
      if (url || nextMode !== "portrait" || !replay) {
        showReplayFirstVideoLoading.value = false;
      }
    });
    const {
      currentProduct,
      productTotal,
      productLoading,
      productFinished,
      productList,
      explainingProductId,
      productCardActiveIndex,
      productCardItems,
      mapProductItem,
      syncProductCardIndex,
      onProductCardChange,
      incrementProductHotOrder,
      setProductSales,
      loadProductList,
      loadCurrentProduct
    } = pages_broadcast_composables_useLiveProducts.useLiveProducts({
      liveId,
      showProduct,
      isReplay,
      replayCurrentVideoId,
      getLiveProducts: api_live.getLiveProducts,
      getCurrentProduct: api_live.getCurrentProduct,
      roomCode,
      liveTenantId,
      shareCode,
      liveBindId,
      myUserId,
      getEffectiveTermId
    });
    applyProductHotOrder = incrementProductHotOrder;
    const liveComments = pages_broadcast_composables_useLiveComments.useLiveComments({
      videoUrl,
      isPlaying,
      isReplay,
      roomGroupType,
      roomSetting,
      pushStatus,
      liveStatusText,
      hasReplay,
      liveId,
      replayCurrentVideoId,
      replayLastTime,
      chatDisabled,
      inputText,
      inputFocused,
      keyboardHeight,
      blurInput,
      defaultAvatar: pages_broadcast_utils_entryFormat.defaultAvatar,
      getCommentHistory: api_live.getCommentHistory,
      getLiveSocket: () => getLiveSocket(),
      userStore,
      sendLiveComment: api_live.sendLiveComment,
      roomCode,
      liveTenantId,
      shareCode,
      liveBindId,
      getEffectiveTermId,
      myUserId
    });
    const {
      scrollToId,
      commentScrollWithAnimation,
      messages,
      visibleMessages,
      pinnedMessage,
      refreshPinnedMessage,
      replayCommentTimeline,
      replayCommentCursor,
      shouldShowComments,
      canAppendLiveMessages,
      formatLiveNickname,
      scrollToBottom,
      sendMessage,
      handleSendClick,
      shouldFollowLatestCommentWindow,
      handleCommentWindowScroll,
      loadPreviousCommentWindow,
      loadNextCommentWindow,
      loadCommentHistory,
      enqueueReplayComments,
      clearCommentQueue,
      appendSystemMessage,
      replaceReplayMessagesAt,
      syncReplayCommentCursor,
      isPendingSentContent,
      upgradeOptimisticMessage,
      hasVisibleChatMessage
    } = liveComments;
    const { enterNotice, showEnterNotice } = pages_broadcast_composables_useLiveEnterNotice.useLiveEnterNotice();
    const {
      buyingNotice,
      goShoppingNotice,
      productListSuccessNotice,
      showBuyingNotice,
      showGoShoppingNotice,
      showProductListSuccessNotice,
      bindProductListMockRotation
    } = pages_broadcast_composables_useLiveBuyingNotice.useLiveBuyingNotice();
    bindProductListMockRotation({
      showProductList,
      productList,
      enabled: () => {
        var _a;
        return Number(((_a = roomSetting.value) == null ? void 0 : _a.buySuccessReminder) || 0) === 1;
      }
    });
    const marketingRuntime = pages_broadcast_composables_useLiveMarketingRuntime.useLiveMarketingRuntime({
      roomCode,
      liveId,
      liveTenantId,
      shareCode,
      liveBindId,
      myUserId,
      isPlaying,
      getLiveDetailApi: api_live.getLiveDetail,
      getEffectiveTermId,
      sendMessage,
      inputText,
      handleSendClick,
      appendSystemMessage,
      shouldShowEntryOverlay,
      pushStatus,
      isReplay
    });
    const {
      hasVisibleWatchRewardTasks,
      watchRewardEntryLabel,
      commentLotteryEntryVisible,
      commentLotteryEntryKeyword,
      commentLotteryBubbleVisible,
      syncMarketingFromLiveDetail,
      reloadMarketingRuntime,
      requestWatchRewardReload,
      openWatchRewardPanel,
      handleWatchRewardWinNotify,
      handleWatchRewardBroadcast,
      handleLotteryResult,
      handleWinNotify: handleLotteryWinNotify,
      handleWinRecordUpdate,
      handleCommentLotterySendClick,
      openCommentPrizeRuleModal,
      handleCommentLotteryStarted,
      handleCommentLotteryOpened,
      handleCommentLotteryConfigUpdated,
      handleCommentLotteryWinNotify,
      handleCommentLotteryWinRecordUpdate
    } = marketingRuntime;
    const scheduleExplainTimerRef = common_vendor.ref(null);
    const replayFutureStartTimerRef = common_vendor.ref(null);
    const scheduleExplainActiveId = common_vendor.ref(0);
    const replayProductSchedule = pages_broadcast_useReplayProductSchedule.createReplayProductScheduleController();
    const videoRuntime = pages_broadcast_composables_useLiveVideoRuntime.useLiveVideoRuntime({
      videoUrl,
      warmUpVideoUrl,
      isScheduleWarmupMode: () => isScheduleWarmupMode,
      isPlaying,
      isReplay,
      pushStatus,
      videoFrameReady,
      mediaSourceComponent,
      getVideoPlayer: () => videoPlayer,
      createMediaContext: (id, type) => {
        var _a, _b;
        return (_b = (_a = stageHostRef.value) == null ? void 0 : _a.createMediaContext) == null ? void 0 : _b.call(_a, id, type);
      }
    });
    getLiveVideoElement = videoRuntime.getLiveVideoElement;
    applyInlineVideoAttrs = videoRuntime.applyInlineVideoAttrs;
    resumeVideoPlayback = videoRuntime.resumeVideoPlayback;
    const playbackDebug = pages_broadcast_composables_useLivePlaybackDebug.useLivePlaybackDebug({
      enabled: isPlaybackDebugFloatEnabled,
      getSnapshot: () => ({
        roomCode: roomCode.value,
        liveId: liveId.value,
        roomGroupType: roomGroupType.value,
        roomBroadcastMethod: roomBroadcastMethod.value,
        pushStatus: pushStatus.value,
        liveStatusText: liveStatusText.value,
        isReplay: isReplay.value,
        isPlaying: isPlaying.value,
        isMuted: isMuted.value,
        videoFrameReady: videoFrameReady.value,
        pullUrl: pullUrl.value,
        videoUrl: videoUrl.value,
        displayVideoUrl: displayVideoUrl.value,
        mediaSourceComponent: mediaSourceComponent.value,
        mediaSourceType: mediaSourceType.value,
        mode: mode.value,
        isIOSH5,
        isWeChatIOSH5,
        videoDebugInfo: videoDebugInfo.value,
        liveQuality: getLiveQualityDebugSnapshot(),
        rtcConfig: rtcConfig.value ? {
          appId: rtcConfig.value.appId || "",
          channel: rtcConfig.value.channel || "",
          uid: rtcConfig.value.uid || "",
          tokenLength: String(rtcConfig.value.token || "").length
        } : null
      }),
      getVideoElement: () => getLiveVideoElement(),
      getVideoPlayer: () => videoPlayer
    });
    const {
      playbackDebugReport,
      playbackDebugSummary,
      recordPlaybackDebugEvent,
      probePlaybackUrl
    } = playbackDebug;
    const playbackDebugCopyStatus = common_vendor.ref("");
    const showPlaybackDebugFloat = common_vendor.computed(isPlaybackDebugFloatEnabled);
    const liveAdaptiveQuality = pages_broadcast_composables_useLiveAdaptiveQuality.useLiveAdaptiveQuality({
      switchStream: (stream, reason) => switchLiveStreamQuality(stream, reason),
      recordPlaybackDebugEvent
    });
    const {
      controls: liveQualityControls,
      debugState: liveQualityDebugState,
      setPullStreams,
      updateSignedStreams,
      getPreferredQuality: getPreferredLiveQuality,
      handleQualitySample,
      handleDebugQualityClick
    } = liveAdaptiveQuality;
    getLiveQualityDebugSnapshot = () => liveQualityDebugState.value;
    const liveQualityDebugText = common_vendor.computed(() => {
      const state = liveQualityDebugState.value || {};
      const sample = state.sample || {};
      const label = state.currentLabel || state.currentQuality || "未选择";
      const modeText = state.mode === "manual" ? "手动" : "自动";
      const throughput = Number(sample.throughputKbps || 0) > 0 ? `${sample.throughputKbps}kbps` : "--";
      const bufferSeconds = Number(sample.bufferSeconds || 0);
      const buffer = bufferSeconds > 0 ? `${bufferSeconds.toFixed(1)}s` : "--";
      const stallRatio = Math.round(Number(sample.rebufferRatio || 0) * 100);
      return `${modeText}/${label} 速率:${throughput} 缓冲:${buffer} 卡顿:${stallRatio}%`;
    });
    function handleQualityDebugClick(quality) {
      handleDebugQualityClick(quality);
    }
    function isTruthyDebugFlag(value) {
      return value === "1" || value === "true" || value === "yes";
    }
    function isFalsyDebugFlag(value) {
      return value === "0" || value === "false" || value === "no";
    }
    function readDebugFlag(params) {
      if (!params)
        return "";
      return (params.get("live_debug") || params.get("playback_debug") || params.get("debug") || "").trim().toLowerCase();
    }
    function isPlaybackDebugEnabled() {
      const flag = readDebugFlag({
        get(key) {
          try {
            return common_vendor.index.getStorageSync(key) || "";
          } catch (e) {
            return "";
          }
        }
      });
      if (isFalsyDebugFlag(flag))
        return false;
      if (isTruthyDebugFlag(flag))
        return true;
      try {
        return common_vendor.index.getStorageSync("_debug") === "1" || common_vendor.index.getStorageSync("_playback_debug") === "1";
      } catch (e) {
        return false;
      }
    }
    function isPlaybackDebugFloatEnabled() {
      return utils_urlHelpers.isLocalDevelopmentHost() || isPlaybackDebugEnabled();
    }
    function copyTextWithUniClipboard(text) {
      if (typeof common_vendor.index.setClipboardData !== "function") {
        return Promise.reject(new Error("uni.setClipboardData unavailable"));
      }
      return new Promise((resolve, reject) => {
        common_vendor.index.setClipboardData({
          data: text,
          showToast: false,
          success: resolve,
          fail: reject
        });
      });
    }
    async function copyTextToClipboard(text) {
      await copyTextWithUniClipboard(text);
    }
    async function copyPlaybackDebugReport() {
      const text = playbackDebugReport.value || "";
      playbackDebugCopyStatus.value = "复制中...";
      recordPlaybackDebugEvent("debug_copy_requested", {
        length: text.length
      });
      try {
        await copyTextToClipboard(text);
        playbackDebugCopyStatus.value = "已复制";
        setTimeout(() => {
          if (playbackDebugCopyStatus.value === "已复制")
            playbackDebugCopyStatus.value = "";
        }, 1800);
      } catch (e) {
        playbackDebugCopyStatus.value = "复制失败";
        recordPlaybackDebugEvent("debug_copy_failed", {
          message: (e == null ? void 0 : e.message) || String(e || "")
        });
      }
    }
    const iosWechatBridge = pages_broadcast_composables_useIOSWechatBridgeAutoPlay.useIOSWechatBridgeAutoPlay();
    tryIOSWechatBridgeAutoPlay = iosWechatBridge.tryIOSWechatBridgeAutoPlay;
    tryIOSWechatBridgeMutedPlay = iosWechatBridge.tryIOSWechatBridgeMutedPlay;
    setIOSWechatBridgeSoundAutoPlayAllowed = iosWechatBridge.setIOSWechatBridgeSoundAutoPlayAllowed;
    const {
      persistReplayProgress,
      flushViewProgressBeacon
    } = pages_broadcast_composables_useLiveProgressReport.useLiveProgressReport({
      isReplay,
      liveId,
      replayCurrentVideoId,
      replayLastTime,
      getLiveVideoElement,
      getSeekTarget: () => getSeekTarget(),
      setLastSavedProgress: (value) => setLastSavedProgress(value),
      replayVideosList,
      replayCurrentIndex,
      roomCode,
      liveTenantId,
      shareCode,
      liveBindId,
      myUserId
    });
    const entryActions = pages_broadcast_composables_useLiveEntryActions.useLiveEntryActions({
      mode,
      showProductList,
      productLoading,
      productList,
      loadProductList,
      activeTabIndex,
      activeTab,
      currentProduct,
      getEffectiveTermId,
      liveId,
      roomCode,
      liveTenantId,
      shareCode,
      liveBindId,
      isReplay,
      myUserId,
      likeCount,
      sendLike: api_live.sendLike,
      getLiveSocket,
      isMuted,
      getVideoPlayer: () => videoPlayer,
      roomSetting,
      isTruthyFlag: pages_broadcast_composables_useLiveSidePanels.isTruthyFlag,
      signConfig
    });
    const {
      hearts,
      tapEffects,
      comboInfo,
      toggleProduct,
      onGrab,
      onProductDetail,
      doLike,
      onVideoTap,
      finishHeartAnimation,
      finishTapEffect,
      onShareAction,
      onTabChange
    } = entryActions;
    switchToFirstAvailableTab = entryActions.switchToFirstAvailableTab;
    const playbackWiring = pages_broadcast_composables_useLivePlaybackWiring.useLivePlaybackWiring({
      replayFutureStartTimerRef,
      replayVideosList,
      replayCurrentIndex,
      replayCurrentVideoId,
      replayLoopPlay,
      replayLastTime,
      isReplay,
      isPlaying,
      pullUrl,
      videoUrl,
      replayProductSchedule,
      scheduleExplainActiveId,
      messages,
      clearCommentQueue,
      productList,
      showProduct,
      refreshPinnedMessage,
      explainingProductId,
      currentProduct,
      getVideoPlayer: () => videoPlayer,
      setVideoPlayer: (value) => {
        videoPlayer = value;
      },
      getLiveVideoElement,
      loadCommentHistory,
      loadCurrentProduct,
      liveId,
      roomGroupType,
      roomWatchByDay,
      pushStatus,
      stopHeartbeat,
      roomCode,
      liveTenantId,
      shareCode,
      liveBindId,
      myUserId,
      persistReplayProgress,
      roomCurrentTermId,
      syncLiveMiniWindowState,
      syncReplayCommentCursor,
      enqueueReplayComments,
      replayCommentCursor,
      replayCommentTimeline,
      replaceReplayMessagesAt,
      mapProductItem,
      syncProductCardIndex,
      incrementProductHotOrder: applyProductHotOrder,
      showBuyingNotice,
      formatLiveNickname,
      reportViewProgressApi: api_live.reportViewProgress,
      scheduleExplainTimerRef,
      setVideoDebugActualCaptured: (value) => {
        _videoDebugActualCaptured = value;
      },
      videoDebugInfo,
      currentVideoPoster,
      liveCover,
      isMuted,
      videoFrameReady,
      videoRenderKey,
      createMediaContext: (id, type) => {
        var _a, _b;
        return (_b = (_a = stageHostRef.value) == null ? void 0 : _a.createMediaContext) == null ? void 0 : _b.call(_a, id, type);
      },
      getVideoDebugActualCaptured: () => _videoDebugActualCaptured,
      applyInlineVideoAttrs,
      autoplayBlocked,
      isScheduleWarmupMode: () => isScheduleWarmupMode,
      isWaitingSchedule,
      resumeAfterSchedule,
      setReplayFutureStartTimer: (timer) => {
        replayFutureStartTimerRef.value = timer;
      },
      tryIOSWechatBridgeAutoPlay,
      tryIOSWechatBridgeMutedPlay,
      resumeVideoPlayback,
      hasPendingUnmute: (...args) => hasPendingUnmute(...args),
      hasStoredSoundIntentRestore: (...args) => hasStoredSoundIntentRestore(...args),
      scheduleLiveSoundIntentRestore: (...args) => scheduleLiveSoundIntentRestore(...args),
      rtcConfig,
      isWeChatIOSH5,
      quickReplies,
      refreshLiveStatusNow: (...args) => refreshLiveStatusNow(...args),
      recordPlaybackDebugEvent,
      probePlaybackUrl,
      onQualitySample: handleQualitySample,
      playbackErrorVisible,
      playbackErrorText,
      mediaSourceComponent,
      mediaSourceType
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
    const soundIntent = pages_broadcast_composables_useLiveSoundIntent.useLiveSoundIntent({
      isMuted,
      showEntryOverlay,
      isWaitingSchedule,
      warmUpVideoUrl,
      getLiveVideoElement,
      getVideoPlayer: () => videoPlayer,
      syncLiveMiniWindowState: (...args) => syncLiveMiniWindowState(...args),
      resumeVideoPlayback,
      setIOSWechatBridgeSoundAutoPlayAllowed,
      onEnterLive: () => {
        reportLiveEntry().catch((e) => console.warn("[Live] reportLiveEntry fail:", e));
      }
    });
    enterLive = soundIntent.enterLive;
    manualPlayVideo = soundIntent.manualPlayVideo;
    scheduleLiveSoundIntentRestore = soundIntent.scheduleLiveSoundIntentRestore;
    hasPendingUnmute = soundIntent.hasPendingUnmute;
    markStoredSoundIntentRestore = soundIntent.markStoredSoundIntentRestore;
    clearStoredSoundIntentRestore = soundIntent.clearStoredSoundIntentRestore;
    hasStoredSoundIntentRestore = soundIntent.hasStoredSoundIntentRestore;
    stopLiveSoundIntentRestore = soundIntent.stopLiveSoundIntentRestore;
    const screenWakeLock = pages_broadcast_composables_useLiveScreenWakeLock.useLiveScreenWakeLock({
      roomGroupType,
      isReplay,
      pushStatus,
      isPlaying,
      pullUrl,
      videoUrl
    });
    syncScreenWakeLock = screenWakeLock.syncScreenWakeLock;
    releaseScreenWakeLock = screenWakeLock.releaseWakeLock;
    stopScreenWakeLock = screenWakeLock.stopScreenWakeLock;
    const miniWindow = pages_broadcast_composables_useLiveMiniWindow.useLiveMiniWindow({
      getLiveVideoElement,
      replayLastTime,
      displayVideoUrl,
      pullUrl,
      roomCode,
      replayVideosList,
      replayCurrentIndex,
      liveId,
      replayCurrentVideoId,
      liveName,
      currentVideoPoster,
      liveCover,
      isReplay,
      isMuted,
      pushStatus,
      isPlaying,
      getVideoPlayer: () => videoPlayer,
      scheduleLiveSoundIntentRestore,
      playReplayVideoByIndex,
      setSeekTarget,
      verifySeekResult: (...args) => playbackWiring.verifySeekResult(...args),
      setLastSavedProgress: (value) => setLastSavedProgress(value),
      replaceReplayMessagesAt,
      loadCommentHistory
    });
    syncLiveMiniWindowState = miniWindow.syncLiveMiniWindowState;
    pauseLivePlaybackForMiniWindow = miniWindow.pauseLivePlaybackForMiniWindow;
    restoreLivePlaybackFromMiniWindow = miniWindow.restoreLivePlaybackFromMiniWindow;
    applyMiniResumeOptions = miniWindow.applyMiniResumeOptions;
    const handleWsMessage = pages_broadcast_composables_useLiveWsMessageHandler.createLiveWsMessageHandler({
      myUserId,
      isReplay,
      replayCurrentVideoId,
      replayCommentTimeline,
      formatLiveNickname,
      defaultAvatar: pages_broadcast_utils_entryFormat.defaultAvatar,
      canAppendLiveMessages,
      shouldFollowLatestCommentWindow,
      messages,
      showEnterNotice,
      showBuyingNotice,
      showGoShoppingNotice,
      showProductList,
      showProductListSuccessNotice,
      isEntryOverlayVisible: () => Boolean(shouldShowEntryOverlay.value),
      refreshPinnedMessage,
      scrollToBottom,
      currentProduct,
      mapProductItem,
      incrementProductHotOrder: applyProductHotOrder,
      setProductSales,
      showProduct,
      productList,
      explainingProductId,
      syncProductCardIndex,
      productTotal,
      productFinished,
      showBuyPopup,
      buyProduct,
      buyLoading,
      likeCount,
      setViewerCountDisplay,
      viewerCount,
      roomSetting,
      pushStatus,
      hasReplay,
      liveStatusText,
      roomGroupType,
      liveStartTime: liveDate,
      switchToFirstAvailableTab,
      inputFocused,
      replayProductSchedule,
      scheduleExplainActiveId,
      replayLastTime,
      replayCommentCursor,
      clearCommentQueue,
      videoDebugInfo,
      resetReplayLoopDebugState: () => {
        setLastSavedProgress(0);
        _videoDebugActualCaptured = false;
      },
      getLiveVideoElement,
      getVideoPlayer: () => videoPlayer,
      createMediaContext: (id, type) => {
        var _a, _b;
        return (_b = (_a = stageHostRef.value) == null ? void 0 : _a.createMediaContext) == null ? void 0 : _b.call(_a, id, type);
      },
      liveId,
      isPlaying,
      userMuted,
      userBlocked,
      muteTipVisible,
      muteRemainText,
      accessDenied,
      startMuteCountdown,
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
      isPendingSentContent,
      upgradeOptimisticMessage,
      hasVisibleChatMessage,
      recordPlaybackDebugEvent,
      updateSignedStreams,
      getPreferredLiveQuality,
      markStatusPushReceived
    });
    const webSocket = pages_broadcast_composables_useMessageChannel.useMessageChannel({
      liveId,
      roomCode,
      liveTenantId,
      shareCode,
      liveBindId,
      isReplay,
      myUserId,
      getEffectiveTermId,
      roomGroupType,
      roomBroadcastMethod,
      loadCommentHistory,
      handleWsMessage,
      onOpen: reloadMarketingRuntime
    });
    initWebSocket = webSocket.initWebSocket;
    getLiveSocket = webSocket.getLiveSocket;
    closeLiveSocket = webSocket.closeLiveSocket;
    sendFallbackEnter = webSocket.sendFallbackEnter;
    const heartbeatStatus = pages_broadcast_composables_useLiveHeartbeatStatus.useLiveHeartbeatStatus({
      liveId,
      sessionId,
      getEnterTimestamp: () => enterTimestamp,
      pushStatus,
      isPlaying,
      liveHeartbeat: api_live.liveHeartbeat,
      getLiveStatus: api_live.getLiveStatus,
      setViewerCountDisplay,
      viewerCount,
      likeCount,
      isReplay,
      isScheduleWarmupMode: () => isScheduleWarmupMode,
      isWaitingSchedule,
      pullUrl,
      messages,
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
        if (!pullUrl.value)
          return false;
        const el = getLiveVideoElement();
        return !isPlaying.value || !!(el == null ? void 0 : el.paused);
      }
    });
    startHeartbeat = heartbeatStatus.startHeartbeat;
    stopHeartbeat = heartbeatStatus.stopHeartbeat;
    startStatusPoll = heartbeatStatus.startStatusPoll;
    stopStatusPoll = heartbeatStatus.stopStatusPoll;
    refreshLiveStatusNow = heartbeatStatus.refreshLiveStatusNow;
    const scheduleResume = pages_broadcast_composables_useLiveScheduleResume.useLiveScheduleResume({
      scheduleTargetTs,
      nowTs,
      setScheduleWarmupMode: (value) => {
        isScheduleWarmupMode = value;
      },
      replayVideosList,
      isReplay,
      pushStatus,
      getReplayVideoSchedule: (...args) => getReplayVideoSchedule(...args),
      playReplayVideoByIndex: (...args) => playReplayVideoByIndex(...args),
      enterReplayPendingState: (...args) => enterReplayPendingState(...args),
      replayFutureStartTimerRef,
      pullUrl,
      initVideoPlayer: (...args) => initVideoPlayer(...args),
      buildWsUrl,
      liveId,
      initWebSocket,
      roomSetting,
      loadCommentHistory,
      loadProductList,
      loadCurrentProduct,
      reportLiveEntry: (...args) => reportLiveEntry(...args),
      startStatusPoll
    });
    const { stopScheduleTimers, startScheduleTimers } = scheduleResume;
    resumeAfterSchedule = scheduleResume.resumeAfterSchedule;
    const {
      initLive,
      getLastInitOptions,
      setPendingSubscribeBack,
      reportLiveEntry: reportLiveEntryAction,
      isDistributor,
      distributorStatus
    } = pages_broadcast_composables_useLiveEntryInitializer.useLiveEntryInitializer({
      runtime: entryInitRuntime,
      stopScheduleTimers,
      liveInitResolved,
      liveRedirecting,
      accessDenied,
      viewerLimitReached,
      viewerLimitText,
      showEntryOverlay,
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
      saveContextOptions: utils_liveRoomContext.saveLiveRoomContext,
      chatBgImage,
      liveDate,
      pushStatus,
      pullUrl,
      videoUrl,
      videoFrameReady,
      isReplay,
      isLiveVisualMode,
      hasReplay,
      liveStatusText,
      isWaitingSchedule,
      scheduleEnabled,
      scheduleTimeStr,
      pushTime,
      warmUpVideoUrl,
      warmUpVideoCoverImage,
      bizCode,
      nowTs,
      replayVideosList,
      replayCurrentVideoId,
      replayLoopPlay,
      replayCurrentIndex,
      userBlocked,
      roomSetting,
      getPreferredReplayResume,
      getSavedReplayProgress,
      replayLastTime,
      signConfig,
      signFields,
      hasSigned,
      showSignPopup,
      loadSignStatus,
      switchToFirstAvailableTab,
      setScheduleWarmupMode: (value) => {
        isScheduleWarmupMode = value;
      },
      setLastSavedProgress: (value) => setLastSavedProgress(value),
      initVideoPlayer: (...args) => initVideoPlayer(...args),
      startScheduleTimers,
      getReplayVideoSchedule,
      enterReplayPendingState,
      setReplayFutureStartTimer: (timer) => {
        replayFutureStartTimerRef.value = timer;
      },
      playReplayVideoByIndex,
      initWebSocket,
      loadCommentHistory,
      loadProductList,
      loadCurrentProduct,
      sessionId,
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
      setVideoPlayer: (value) => {
        videoPlayer = value;
      },
      markStoredSoundIntentRestore,
      clearStoredSoundIntentRestore,
      setIOSWechatBridgeSoundAutoPlayAllowed,
      recordPlaybackDebugEvent,
      setPullStreams,
      getPreferredLiveQuality
    });
    reportLiveEntry = reportLiveEntryAction;
    const { handlePageHide, handlePageBackground } = pages_broadcast_composables_useLivePageLeave.useLivePageLeave({
      syncLiveMiniWindowState,
      persistReplayProgress,
      flushViewProgressBeacon,
      liveId,
      sessionId,
      getEnterTimestamp: () => enterTimestamp,
      flushPendingLikes: entryActions.flushPendingLikes
    });
    pages_broadcast_composables_useLiveEntryLifecycle.useLiveEntryLifecycle({
      applyMiniResumeOptions,
      getLastInitOptions,
      restoreLivePlaybackFromMiniWindow,
      resumeVideoPlayback,
      isMuted,
      hasPendingUnmute,
      scheduleLiveSoundIntentRestore,
      pendingOrderId,
      getOrderDetail: api_order.getOrderDetail,
      getOrderListUrl,
      pauseLivePlaybackForMiniWindow,
      persistReplayProgress,
      stopKeyboardListener,
      stopScheduleTimers,
      syncLiveMiniWindowState,
      roomGroupType,
      isReplay,
      replayCurrentVideoId,
      liveId,
      replayVideosList,
      replayCurrentIndex,
      reportViewProgress: api_live.reportViewProgress,
      replayLastTime,
      resetReplayContext,
      stopHeartbeat,
      stopStatusPoll,
      stopMuteCountdown,
      stopReplayFutureStartTimer,
      applyH5ViewerLeaveDecrease,
      stopViewerCountAnimation,
      scheduleExplainTimerRef,
      stopLiveSoundIntentRestore,
      syncScreenWakeLock,
      releaseScreenWakeLock,
      stopScreenWakeLock,
      replayProductSchedule,
      closeLiveSocket,
      handlePageHide,
      handlePageBackground,
      userStore,
      setPageVisible: (value) => {
        pageVisible.value = !!value;
      },
      refreshLiveStatusNow: (...args) => refreshLiveStatusNow(...args),
      leaveLiveRoom: api_live.leaveLiveRoom,
      sessionId,
      getVideoPlayer: () => videoPlayer,
      setVideoPlayer: (value) => {
        videoPlayer = value;
      },
      getWeixinBridgeReadyHandler: () => weixinBridgeReadyHandler,
      setWeixinBridgeReadyHandler: (handler) => {
        weixinBridgeReadyHandler = handler;
      },
      getVisibilityResumeHandler: () => visibilityResumeHandler,
      setVisibilityResumeHandler: (handler) => {
        visibilityResumeHandler = handler;
      },
      getEnterTimestamp: () => enterTimestamp
    });
    const { stageState, stageActions } = pages_broadcast_composables_useLiveStageBinding.useLiveStageBinding({
      mode,
      accessDenied,
      viewerLimitReached,
      liveInitResolved,
      anchorName,
      anchorAvatar,
      likeCount,
      isWaitingSchedule,
      broadcastNavHeight,
      warmUpVideoUrl,
      roomSetting,
      viewerCountAnimating,
      displayViewerCount,
      displayVideoUrl,
      videoRenderKey,
      isReplay,
      replayCurrentVideoId,
      hasReplay,
      isLiveVisualMode,
      quickReplies,
      roomGroupType,
      mediaSourceComponent,
      mediaSourceType,
      liveStatusText,
      videoPoster,
      replayCover,
      isMuted,
      showWxAddrDonePlayBtn,
      autoplayBlocked,
      playbackErrorVisible,
      playbackErrorText,
      showReplayFirstVideoLoading,
      isPlaying,
      isIOSH5,
      liveCover,
      videoFrameReady,
      tapEffects,
      comboInfo,
      shouldShowComments,
      scrollToId,
      commentScrollWithAnimation,
      messages,
      visibleMessages,
      showProduct,
      pinnedMessage,
      enterNotice,
      buyingNotice,
      goShoppingNotice,
      productListSuccessNotice,
      showProductList,
      currentProduct,
      productCardItems,
      productCardActiveIndex,
      productList,
      productTotal,
      productLoading,
      productFinished,
      muteTipVisible,
      userBlocked,
      muteRemainText,
      inputText,
      inputFocused,
      keyboardHeight,
      chatDisabled,
      bottomBarStyle,
      hearts,
      showShare,
      showCenterPopup,
      centerPopupName,
      centerPopupAvatar,
      centerPopupOrderStats,
      showBuyPopup,
      buyProduct,
      buyAddressText,
      selectedAddress,
      buyShippingFee,
      buyGoodsAmount,
      buyTotalPrice,
      buyDiscountAmount,
      buyRemark,
      buyLoading,
      usableCoupons,
      unusableCoupons,
      selectedCouponId,
      couponLoading,
      showLiveReportPopup,
      liveId,
      roomCode,
      shareCode,
      liveBindId,
      liveTenantId,
      broadcastReturnPath,
      liveName,
      showAddressPopup,
      addressList,
      selectedAddressId,
      showAddressFormPopup,
      editAddressData,
      signConfig,
      showSignPopup,
      signFields,
      hasSigned,
      roomCurrentTermId,
      myUserId,
      pushStatus,
      showNotStartedOverlay,
      liveOverlayTitle,
      shouldShowEntryOverlay,
      activeTab,
      activeTabIndex,
      showLandscapeSubscribe,
      commentListStyle,
      hasVisibleWatchRewardTasks,
      watchRewardEntryLabel,
      defaultAvatar: pages_broadcast_utils_entryFormat.defaultAvatar,
      goReport,
      onVideoPlay,
      onVideoTimeUpdate,
      onVideoTap,
      manualPlayVideo,
      handleVideoPlayerEnded,
      handleLivePlayerFailure: (...args) => handleLivePlayerFailure(...args),
      markPlaybackReady: (...args) => markPlaybackReady(...args),
      retryPlayback: (...args) => retryPlayback(...args),
      getVideoPlayer: () => videoPlayer,
      setVideoFrameReady: (value) => {
        videoFrameReady.value = !!value;
      },
      onProductCardChange,
      onGrab,
      onProductBuy,
      onProductDetail,
      loadProductList,
      focusInput,
      onInputFocus,
      sendMessage,
      onInputBlur,
      handleSendClick: handleCommentLotterySendClick,
      handleCommentWindowScroll,
      loadPreviousCommentWindow,
      loadNextCommentWindow,
      toggleCenter,
      toggleProduct,
      doLike,
      finishHeartAnimation,
      finishTapEffect,
      onShareAction,
      onCenterAction,
      openBuyAddressPopup,
      onBuyQuantityChange,
      onBuySkuChange,
      onBuyCouponSelect,
      onBuyConfirm,
      onSelectBuyAddress,
      onAddBuyAddress,
      onEditBuyAddress,
      onDeleteBuyAddress,
      onImportWxAddress,
      onBuyAddressSaved,
      isTruthyFlag: pages_broadcast_composables_useLiveSidePanels.isTruthyFlag,
      onSignedDone,
      enterLive,
      onSubscribePush,
      onTabChange,
      openCommentPrizeRuleModal,
      openWatchRewardPanel,
      commentLotteryEntryVisible,
      commentLotteryEntryKeyword,
      commentLotteryBubbleVisible,
      isDistributor,
      distributorStatus,
      scheduleTimeStr,
      liveDate,
      syncLiveMiniWindowState,
      clearStoredSoundIntentRestore,
      setIOSWechatBridgeSoundAutoPlayAllowed,
      setLandscapeMiniActive
    });
    common_vendor.watch(mode, () => {
      syncStageVideoElement();
    });
    common_vendor.watch(pushStatus, (next, prev) => {
      var _a, _b, _c;
      if (Number(next) !== 2 || Number(prev) === 2)
        return;
      if (isReplay.value && !isScheduleWarmupMode)
        return;
      if (hasReplay.value && replayVideosList.value.length > 0 && !videoUrl.value)
        return;
      try {
        (_a = videoPlayer == null ? void 0 : videoPlayer.pause) == null ? void 0 : _a.call(videoPlayer);
      } catch (e) {
      }
      try {
        (_c = (_b = getLiveVideoElement()) == null ? void 0 : _b.pause) == null ? void 0 : _c.call(_b);
      } catch (e) {
      }
      isPlaying.value = false;
      videoUrl.value = "";
    });
    common_vendor.watch(videoFrameReady, (ready) => {
      if (ready)
        autoplayBlocked.value = false;
    });
    common_vendor.watch(isPlaying, (next, prev) => {
      if (next && !prev)
        refreshLiveStatusNow({ reason: "playback_resume" });
    });
    pages_broadcast_composables_useLiveLoadBootstrap.useLiveLoadBootstrapRegistration({
      getLiveDetail: api_live.getLiveDetail,
      initLive,
      scrollToBottom,
      isDebugLocalLogin,
      syncKeyboardViewportBaseHeight,
      getLiveVideoElement,
      applyInlineVideoAttrs,
      resumeVideoPlayback,
      handlePageHide,
      handlePageBackground,
      setPageVisible: (value) => {
        pageVisible.value = !!value;
      },
      refreshLiveStatusNow: (...args) => refreshLiveStatusNow(...args),
      isWeChatIOSH5,
      getWeixinBridgeReadyHandler: () => weixinBridgeReadyHandler,
      setWeixinBridgeReadyHandler: (handler) => {
        weixinBridgeReadyHandler = handler;
      },
      getVisibilityResumeHandler: () => visibilityResumeHandler,
      setVisibilityResumeHandler: (handler) => {
        visibilityResumeHandler = handler;
      },
      userStore,
      pendingRecoverBuyCtx,
      setPendingSubscribeBack,
      showEntryOverlay,
      showWxAddrDonePlayBtn,
      safeBottom,
      isIOSKeyboardMode
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.sr(stageHostRef, "4bc7a2f9-0", {
          "k": "stageHostRef"
        }),
        b: common_vendor.o(common_vendor.unref(copyAccessDeniedUid), "07"),
        c: common_vendor.p({
          mode: mode.value,
          ["access-denied"]: accessDenied.value,
          ["stage-state"]: common_vendor.unref(stageState),
          ["stage-actions"]: common_vendor.unref(stageActions),
          ["access-denied-title"]: common_vendor.unref(accessDeniedTitle),
          ["access-denied-user-avatar"]: common_vendor.unref(accessDeniedUserAvatar),
          ["access-denied-user-name"]: common_vendor.unref(accessDeniedUserName),
          ["access-denied-uid-text"]: common_vendor.unref(accessDeniedUidText),
          ["viewer-limit-reached"]: viewerLimitReached.value,
          ["viewer-limit-text"]: viewerLimitText.value,
          ["marketing-runtime"]: common_vendor.unref(marketingRuntime)
        }),
        d: common_vendor.o(copyPlaybackDebugReport, "73"),
        e: common_vendor.o(handleQualityDebugClick, "e9"),
        f: common_vendor.p({
          show: showPlaybackDebugFloat.value,
          summary: common_vendor.unref(playbackDebugSummary),
          ["copy-status"]: playbackDebugCopyStatus.value,
          ["quality-controls"]: common_vendor.unref(liveQualityControls),
          ["quality-text"]: liveQualityDebugText.value
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4bc7a2f9"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
