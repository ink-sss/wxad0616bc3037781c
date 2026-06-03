"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const pages_broadcast_utils_entryFormat = require("../utils/entry-format.js");
const utils_liveRoute = require("../../../utils/live-route.js");
if (!Array) {
  const _easycom_wd_overlay2 = common_vendor.resolveComponent("wd-overlay");
  const _easycom_wd_transition2 = common_vendor.resolveComponent("wd-transition");
  (_easycom_wd_overlay2 + _easycom_wd_transition2)();
}
const _easycom_wd_overlay = () => "../../../node-modules/wot-design-uni/components/wd-overlay/wd-overlay.js";
const _easycom_wd_transition = () => "../../../node-modules/wot-design-uni/components/wd-transition/wd-transition.js";
if (!Math) {
  (LiveExternalLotteryTools + LiveMarqueeAd + LiveProductShelf + LiveChatBar + SharePopup + CenterPopup + ProductBuyPopup + LiveReportPopup + AddressListPanel + BottomSheetPopup + AddressFormPopup + _easycom_wd_overlay + LiveSignIn + _easycom_wd_transition + LiveEndedOverlay + LiveEntryOverlay)();
}
const SharePopup = () => "../../../components/share-popup.js";
const CenterPopup = () => "../../../components/center-popup.js";
const ProductBuyPopup = () => "../../../components/product-buy-popup.js";
const BottomSheetPopup = () => "../../../components/bottom-sheet-popup.js";
const AddressListPanel = () => "../../../components/address-list-panel.js";
const AddressFormPopup = () => "../../../components/address-form-popup.js";
const LiveSignIn = () => "../../../components/live-sign-in.js";
const LiveReportPopup = () => "../../../components/live-report-popup.js";
const LiveChatBar = () => "./LiveChatBar.js";
const LiveEndedOverlay = () => "./LiveEndedOverlay.js";
const LiveEntryOverlay = () => "./LiveEntryOverlay.js";
const LiveExternalLotteryTools = () => "./LiveExternalLotteryTools.js";
const LiveMarqueeAd = () => "./LiveMarqueeAd.js";
const LiveProductShelf = () => "./LiveProductShelf.js";
const BUY_POPUP_Z_INDEX = 1e8;
const POPUP_RENDER_LEAVE_DELAY = 500;
const CHAT_AREA_HEIGHT_RPX = 320;
const CHAT_STACK_GAP_RPX = 8;
const CHAT_NOTICE_STEP_RPX = 56;
const NOTICE_STACK_LIFT_RPX = 10;
const _sfc_main = {
  __name: "LivePortraitStage",
  props: {
    s: {
      type: Object,
      required: true
    },
    a: {
      type: Object,
      required: true
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const LIVE_PLAYER_READY_CODES = [2003, 2004, 2007, 2008];
    const LIVE_PLAYER_NET_ACTIVITY_FIELDS = [
      ["videoBitrate", "videoKBitrate", "videoBitrateKbps", "VIDEO_BITRATE", "VIDEO_KBITRATE", "VIDEO_BITRATE_KBPS", "video_bitrate", "video_kbitrate", "video_bitrate_kbps"],
      ["audioBitrate", "audioKBitrate", "audioBitrateKbps", "AUDIO_BITRATE", "AUDIO_KBITRATE", "AUDIO_BITRATE_KBPS", "audio_bitrate", "audio_kbitrate", "audio_bitrate_kbps"],
      ["videoFPS", "fps", "VIDEO_FPS", "FPS", "video_fps"],
      ["netSpeed", "netJitter", "NET_SPEED", "NET_JITTER", "net_speed", "net_jitter"],
      ["videoWidth", "width", "VIDEO_WIDTH", "video_width"],
      ["videoHeight", "height", "VIDEO_HEIGHT", "video_height"]
    ];
    function firstNumericField(source, fields) {
      if (!source)
        return 0;
      for (const field of fields) {
        const raw = source[field];
        if (raw === void 0 || raw === null || raw === "")
          continue;
        const value = Number(raw);
        if (Number.isFinite(value))
          return value;
        const parsed = Number.parseFloat(raw);
        if (Number.isFinite(parsed))
          return parsed;
      }
      return 0;
    }
    function hasLivePlayerNetActivity(info) {
      return LIVE_PLAYER_NET_ACTIVITY_FIELDS.some((fields) => firstNumericField(info, fields) > 0);
    }
    const {
      mode,
      accessDenied,
      isWechatH5,
      isIOS,
      anchorName,
      anchorAvatar,
      likeCount,
      isWaitingSchedule,
      warmUpVideoUrl,
      roomSetting,
      viewerCountAnimating,
      displayViewerCount,
      displayVideoUrl,
      mediaSourceComponent,
      mediaSourceType,
      videoRenderKey,
      isReplay,
      isLiveVisualMode,
      hasReplay,
      liveStatusText,
      quickReplies,
      roomGroupType,
      videoPoster,
      replayCover,
      isMuted,
      showWxAddrDonePlayBtn,
      autoplayBlocked,
      playbackErrorVisible,
      playbackErrorText,
      showReplayFirstVideoLoading,
      isPlaying,
      videoFrameReady,
      isIOSH5,
      liveCover,
      tapEffects,
      comboInfo,
      shouldShowComments,
      scrollToId,
      commentScrollWithAnimation,
      visibleMessages,
      enterNotice,
      buyingNotice,
      goShoppingNotice,
      productListSuccessNotice,
      pinnedMessage,
      showProduct,
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
      replayCurrentVideoId,
      roomCurrentTermId,
      myUserId,
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
      pushStatus,
      pushTime,
      showNotStartedOverlay,
      liveOverlayTitle,
      shouldShowEntryOverlay,
      activeTab,
      activeTabIndex,
      showLandscapeSubscribe,
      scheduleTimeStr,
      liveDate,
      commentListStyle,
      defaultAvatar,
      hasVisibleWatchRewardTasks,
      watchRewardEntryLabel,
      commentLotteryEntryVisible,
      commentLotteryEntryKeyword,
      commentLotteryBubbleVisible,
      isDistributor,
      distributorStatus
    } = common_vendor.toRefs(props.s);
    function useDelayedRender(source, delay = POPUP_RENDER_LEAVE_DELAY) {
      const shouldRender = common_vendor.ref(Boolean(source.value));
      let timer = null;
      common_vendor.watch(source, (visible) => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        if (visible) {
          shouldRender.value = true;
          return;
        }
        if (!shouldRender.value)
          return;
        timer = setTimeout(() => {
          shouldRender.value = false;
          timer = null;
        }, delay);
      }, { immediate: true });
      common_vendor.onBeforeUnmount(() => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      });
      return shouldRender;
    }
    const renderSharePopup = useDelayedRender(showShare);
    const renderCenterPopup = useDelayedRender(showCenterPopup);
    const renderBuyPopup = useDelayedRender(showBuyPopup);
    const renderAddressPopup = useDelayedRender(showAddressPopup);
    const renderAddressFormPopup = useDelayedRender(showAddressFormPopup);
    const renderLiveReportPopup = useDelayedRender(showLiveReportPopup);
    const renderSignPopup = useDelayedRender(showSignPopup);
    function parseStageStartTs(value) {
      if (!value)
        return 0;
      const ts = new Date(String(value).replace(/-/g, "/")).getTime();
      return Number.isFinite(ts) ? ts : 0;
    }
    const isLiveNotStarted = common_vendor.computed(() => {
      if (pages_broadcast_utils_entryFormat.isLiveCoverOnlyStatusText(liveStatusText.value))
        return true;
      if (isWaitingSchedule.value && !warmUpVideoUrl.value)
        return true;
      const startTs = parseStageStartTs(liveDate.value);
      return pushStatus.value !== 1 && startTs > Date.now();
    });
    const liveStatusLabel = common_vendor.computed(() => {
      if (isReplay.value)
        return "回放";
      if (liveStatusText.value)
        return liveStatusText.value;
      if (isLiveNotStarted.value)
        return "未开始";
      if (hasReplay.value && pushStatus.value !== 1)
        return "回放";
      if (pushStatus.value === 1)
        return "直播中";
      if (!hasReplay.value && pushStatus.value !== 1)
        return "已结束";
      return "未开始";
    });
    const liveStatusClass = common_vendor.computed(() => {
      if (isReplay.value)
        return "live-status--replay";
      if (isLiveNotStarted.value)
        return "live-status--pending";
      if (hasReplay.value && pushStatus.value !== 1)
        return "live-status--replay";
      if (pushStatus.value === 1)
        return "live-status--live";
      return "live-status--pending";
    });
    const useLiveVisualStyle = common_vendor.computed(() => isLiveVisualMode.value);
    const shouldUseLivePlayer = common_vendor.computed(() => {
      const url = String(displayVideoUrl.value || "");
      if (!url || isReplay.value)
        return false;
      if (isWaitingSchedule.value && warmUpVideoUrl.value)
        return false;
      if (mediaSourceComponent.value === "video")
        return false;
      if (mediaSourceComponent.value === "live-player")
        return true;
      return utils_liveRoute.isLivePlayerSource(url);
    });
    const anchorSubText = common_vendor.computed(
      () => useLiveVisualStyle.value ? displayViewerCount.value : `${pages_broadcast_utils_entryFormat.formatLikeCount(likeCount.value)}本场点赞`
    );
    const isChatAreaScrolled = common_vendor.ref(false);
    function handleChatAreaScroll(event) {
      var _a;
      const scrollTop = Number(((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.scrollTop) || 0);
      isChatAreaScrolled.value = scrollTop > 2;
      handleCommentWindowScroll(event);
    }
    const chatAreaBottomRpx = common_vendor.computed(() => {
      return useLiveVisualStyle.value ? 190 : 190;
    });
    const chatTopAnchorBottomRpx = common_vendor.computed(
      () => chatAreaBottomRpx.value + CHAT_AREA_HEIGHT_RPX + CHAT_STACK_GAP_RPX + NOTICE_STACK_LIFT_RPX
    );
    const keyboardAvoidancePx = common_vendor.computed(() => {
      if (!inputFocused.value)
        return 0;
      const height = Number(keyboardHeight.value || 0);
      return height > 0 ? height : 0;
    });
    function buildKeyboardAwareBottomStyle(bottomRpx, extraStyle = {}) {
      const keyboardOffset = keyboardAvoidancePx.value;
      return {
        ...extraStyle,
        bottom: keyboardOffset > 0 ? `calc(${bottomRpx}rpx + env(safe-area-inset-bottom) + ${keyboardOffset}px)` : `calc(${bottomRpx}rpx + env(safe-area-inset-bottom))`
      };
    }
    const chatAreaStyle = common_vendor.computed(() => buildKeyboardAwareBottomStyle(chatAreaBottomRpx.value));
    const chatTopAnchorStyle = common_vendor.computed(() => buildKeyboardAwareBottomStyle(
      chatTopAnchorBottomRpx.value,
      { zIndex: useLiveVisualStyle.value ? 9 : 3 }
    ));
    const pinnedBarStyle = common_vendor.computed(() => chatTopAnchorStyle.value);
    const enterNoticeStyle = common_vendor.computed(() => {
      const pinnedOffset = pinnedMessage.value ? CHAT_NOTICE_STEP_RPX : 0;
      const bottom = chatTopAnchorBottomRpx.value + pinnedOffset;
      return buildKeyboardAwareBottomStyle(bottom);
    });
    const buyingNoticeStyle = common_vendor.computed(() => {
      var _a;
      const pinnedOffset = pinnedMessage.value ? CHAT_NOTICE_STEP_RPX : 0;
      const baseBottom = chatTopAnchorBottomRpx.value + pinnedOffset;
      const enterVisible = !!(((_a = enterNotice.value) == null ? void 0 : _a.visible) && !shouldShowEntryOverlay.value);
      const bottom = enterVisible ? baseBottom + CHAT_NOTICE_STEP_RPX : baseBottom;
      return buildKeyboardAwareBottomStyle(bottom);
    });
    const goShoppingNoticeStyle = common_vendor.computed(() => {
      var _a, _b;
      const pinnedOffset = pinnedMessage.value ? CHAT_NOTICE_STEP_RPX : 0;
      const baseBottom = chatTopAnchorBottomRpx.value + pinnedOffset;
      const enterVisible = !!(((_a = enterNotice.value) == null ? void 0 : _a.visible) && !shouldShowEntryOverlay.value);
      const buyingVisible = !!((_b = buyingNotice.value) == null ? void 0 : _b.visible);
      const bottom = baseBottom + (enterVisible ? CHAT_NOTICE_STEP_RPX : 0) + (buyingVisible ? CHAT_NOTICE_STEP_RPX : 0);
      return buildKeyboardAwareBottomStyle(bottom);
    });
    const shouldRenderLivePoster = common_vendor.computed(() => !isReplay.value && !warmUpVideoUrl.value && !!liveCover.value);
    const showManualPlayButton = common_vendor.computed(
      () => !!showWxAddrDonePlayBtn.value || !!(autoplayBlocked == null ? void 0 : autoplayBlocked.value) && !!displayVideoUrl.value && !isReplay.value && (!isPlaying.value || !videoFrameReady.value)
    );
    const showLivePoster = common_vendor.computed(
      () => shouldRenderLivePoster.value && (isLiveNotStarted.value || isWaitingSchedule.value || !hasReplay.value && pushStatus.value !== 1 || pushStatus.value === 1 && !videoFrameReady.value && !isReplay.value)
    );
    const shouldRenderReplayPoster = common_vendor.computed(
      () => mode.value === "portrait" && isReplay.value && !!displayVideoUrl.value && !!replayCoverPoster.value
    );
    const replayPosterHidden = common_vendor.computed(
      () => shouldRenderReplayPoster.value && !!replayPosterFadeReady.value
    );
    const replayCoverPoster = common_vendor.computed(() => {
      return isReplay.value ? replayCover.value || "" : "";
    });
    const replayPlaybackConfirmed = common_vendor.ref(false);
    const replayPosterFadeReady = common_vendor.ref(false);
    let replayPosterHideTimer = null;
    common_vendor.onBeforeUnmount(() => {
      if (replayReadyFallbackTimer) {
        clearTimeout(replayReadyFallbackTimer);
        replayReadyFallbackTimer = null;
      }
      if (replayPosterHideTimer) {
        clearTimeout(replayPosterHideTimer);
        replayPosterHideTimer = null;
      }
    });
    common_vendor.watch(displayVideoUrl, () => {
      replayPlaybackConfirmed.value = false;
      replayPosterFadeReady.value = false;
    });
    common_vendor.watch(
      () => [
        shouldRenderReplayPoster.value,
        videoFrameReady.value,
        isPlaying.value || replayPlaybackConfirmed.value,
        displayVideoUrl.value
      ],
      ([
        renderPoster,
        frameReady,
        playbackReady
      ]) => {
        if (replayPosterHideTimer) {
          clearTimeout(replayPosterHideTimer);
          replayPosterHideTimer = null;
        }
        if (!renderPoster || !frameReady || !playbackReady) {
          replayPosterFadeReady.value = false;
          return;
        }
        replayPosterHideTimer = setTimeout(() => {
          replayPosterHideTimer = null;
          if (shouldRenderReplayPoster.value && videoFrameReady.value && (isPlaying.value || replayPlaybackConfirmed.value)) {
            replayPosterFadeReady.value = true;
          }
        }, 240);
      },
      { immediate: true }
    );
    const {
      setIsPlaying,
      setShowProduct,
      setShowProductList,
      setShowShare,
      setShowCenterPopup,
      setShowBuyPopup,
      setShowAddressPopup,
      setShowAddressFormPopup,
      setShowSignPopup,
      setBuyRemark,
      setActiveTab,
      setActiveTabIndex,
      setInputText,
      setShowLiveReportPopup,
      goReport,
      onVideoPlay,
      onVideoTimeUpdate,
      onVideoTap,
      manualPlayVideo,
      setVideoFrameReady,
      onProductCardChange,
      onGrab,
      onProductBuy,
      onProductDetail,
      loadProductList,
      focusInput,
      onInputFocus,
      sendMessage,
      onInputBlur,
      handleSendClick,
      handleCommentWindowScroll,
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
      isTruthyFlag,
      onSignedDone,
      enterLive,
      onSubscribePush,
      onTabChange,
      openCommentPrizeRuleModal,
      openWatchRewardPanel,
      handleLivePlayerFailure,
      markPlaybackReady,
      retryPlayback
    } = props.a;
    const handleVideoPlayerEnded = props.a.handleVideoPlayerEnded || (() => {
    });
    let frameCallbackPending = false;
    let replayReadyFallbackTimer = null;
    function commitVideoFrameReady(source) {
      setVideoFrameReady(true);
      markPlaybackReady == null ? void 0 : markPlaybackReady(source);
    }
    function scheduleReplayReadyFallback(el, source) {
      if (!el || replayReadyFallbackTimer)
        return;
      replayReadyFallbackTimer = setTimeout(() => {
        replayReadyFallbackTimer = null;
        if (videoFrameReady.value)
          return;
        if (Number(el.readyState || 0) >= 2 && !el.paused) {
          commitVideoFrameReady(`${source}-stable-readyState`);
        }
      }, 180);
    }
    function markReplayVideoFrameReady(event) {
      var _a;
      if (videoFrameReady.value)
        return;
      const el = event == null ? void 0 : event.target;
      if ((event == null ? void 0 : event.type) === "playing") {
        replayPlaybackConfirmed.value = true;
      }
      if (!el) {
        if ((event == null ? void 0 : event.type) === "loadeddata" || (event == null ? void 0 : event.type) === "playing") {
          commitVideoFrameReady((event == null ? void 0 : event.type) || "media-event");
        }
        return;
      }
      if (typeof el.requestVideoFrameCallback === "function" && (event == null ? void 0 : event.type) !== "timeupdate") {
        if (frameCallbackPending)
          return;
        frameCallbackPending = true;
        el.requestVideoFrameCallback(() => {
          frameCallbackPending = false;
          commitVideoFrameReady((event == null ? void 0 : event.type) || "frame-callback");
        });
        return;
      }
      const currentTime = Number(el.currentTime ?? ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.currentTime) ?? 0);
      if ((event == null ? void 0 : event.type) === "timeupdate" && currentTime > 0) {
        commitVideoFrameReady("timeupdate-progress");
        return;
      }
      if (typeof el.requestVideoFrameCallback !== "function") {
        scheduleReplayReadyFallback(el, (event == null ? void 0 : event.type) || "media-event");
      }
    }
    function markVideoFrameReady(event) {
      var _a;
      if (isReplay.value) {
        markReplayVideoFrameReady(event);
        return;
      }
      if (videoFrameReady.value)
        return;
      const el = event == null ? void 0 : event.target;
      if (!el) {
        if ((event == null ? void 0 : event.type) === "loadeddata" || (event == null ? void 0 : event.type) === "playing" || (event == null ? void 0 : event.type) === "live-player-netstatus") {
          commitVideoFrameReady((event == null ? void 0 : event.type) || "media-event");
        }
        return;
      }
      if (el && typeof el.requestVideoFrameCallback === "function" && (event == null ? void 0 : event.type) !== "timeupdate") {
        if (frameCallbackPending)
          return;
        frameCallbackPending = true;
        el.requestVideoFrameCallback(() => {
          frameCallbackPending = false;
          commitVideoFrameReady((event == null ? void 0 : event.type) || "frame-callback");
        });
        return;
      }
      const currentTime = Number((el == null ? void 0 : el.currentTime) ?? ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.currentTime) ?? 0);
      if ((event == null ? void 0 : event.type) === "loadeddata" || (event == null ? void 0 : event.type) === "playing" || Number(el.readyState || 0) >= 2 || currentTime > 0) {
        commitVideoFrameReady((event == null ? void 0 : event.type) || "media-event");
      }
    }
    function handleVideoPlay(event) {
      setIsPlaying(true);
      if (isReplay.value) {
        replayPlaybackConfirmed.value = true;
      }
      if (typeof onVideoPlay === "function") {
        onVideoPlay(event);
      }
    }
    function handleVideoPause() {
      setIsPlaying(false);
      replayPlaybackConfirmed.value = false;
    }
    function handleVideoEnded() {
      setIsPlaying(false);
      handleVideoPlayerEnded();
    }
    function handleLivePlayerStateChange(event) {
      var _a;
      const code = Number(((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.code) || 0);
      if (LIVE_PLAYER_READY_CODES.includes(code)) {
        setIsPlaying(true);
        commitVideoFrameReady("live-player-state");
        markPlaybackReady == null ? void 0 : markPlaybackReady("live-player-state");
        if (typeof onVideoPlay === "function") {
          onVideoPlay(event);
        }
        return;
      }
      if ([-2301, -2302, 2103, 2105].includes(code)) {
        setIsPlaying(false);
        handleLivePlayerFailure == null ? void 0 : handleLivePlayerFailure(event);
      }
    }
    function handleLivePlayerNetStatus(event) {
      var _a;
      const info = ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.info) || (event == null ? void 0 : event.detail) || {};
      if (hasLivePlayerNetActivity(info)) {
        setIsPlaying(true);
        commitVideoFrameReady("live-player-netstatus");
        if (typeof onVideoPlay === "function") {
          onVideoPlay(event);
        }
      }
    }
    function handleLivePlayerError(event) {
      console.warn("[Live] live-player error:", {
        src: displayVideoUrl.value,
        detail: (event == null ? void 0 : event.detail) || event
      });
      setIsPlaying(false);
      handleLivePlayerFailure == null ? void 0 : handleLivePlayerFailure(event);
    }
    function handleVideoError(event, sourceUrl = "") {
      const currentUrl = String(displayVideoUrl.value || "");
      const eventUrl = String(sourceUrl || "");
      if (shouldUseLivePlayer.value || eventUrl && eventUrl !== currentUrl) {
        console.warn("[Live] ignored stale video error:", {
          eventSrc: eventUrl,
          currentSrc: currentUrl,
          usingLivePlayer: shouldUseLivePlayer.value,
          detail: (event == null ? void 0 : event.detail) || event
        });
        return;
      }
      console.warn("[Live] video error:", {
        src: currentUrl,
        detail: (event == null ? void 0 : event.detail) || event
      });
      setIsPlaying(false);
      handleLivePlayerFailure == null ? void 0 : handleLivePlayerFailure({ ...event, type: "video-error" });
    }
    function handleVideoTimeUpdate(event) {
      markVideoFrameReady(event);
      onVideoTimeUpdate(event);
    }
    function handleQuickReply(text) {
      handleSendClick(text);
    }
    function findNoticeProduct(productId) {
      const id = Number(productId || 0);
      if (!id)
        return null;
      return productList.value.find((item) => Number(item.id || item.productId || 0) === id) || null;
    }
    function buildGoShoppingNoticeProductFallback() {
      const notice = goShoppingNotice.value || {};
      const id = Number(notice.productId || 0);
      if (!id)
        return null;
      return {
        id,
        image: notice.productImage || "",
        title: notice.productName || ""
      };
    }
    function openGoShoppingNoticeProduct() {
      var _a;
      const product = findNoticeProduct((_a = goShoppingNotice.value) == null ? void 0 : _a.productId) || buildGoShoppingNoticeProductFallback();
      if (!product)
        return;
      onProductBuy({ item: product });
    }
    const portraitInputRef = common_vendor.ref(null);
    const instance = common_vendor.getCurrentInstance();
    function createMediaContext(id = "liveVideo", type = "video") {
      const component = instance == null ? void 0 : instance.proxy;
      try {
        if (type === "live-player" && typeof common_vendor.index.createLivePlayerContext === "function") {
          return common_vendor.index.createLivePlayerContext(id, component);
        }
        if (typeof common_vendor.index.createVideoContext === "function") {
          return common_vendor.index.createVideoContext(id, component);
        }
        if (type !== "live-player" && typeof common_vendor.index.createLivePlayerContext === "function") {
          return common_vendor.index.createLivePlayerContext(id, component);
        }
      } catch (e) {
      }
      return null;
    }
    __expose({
      focus: () => {
        var _a, _b;
        return (_b = (_a = portraitInputRef.value) == null ? void 0 : _a.focus) == null ? void 0 : _b.call(_a);
      },
      blur: () => {
        var _a, _b;
        return (_b = (_a = portraitInputRef.value) == null ? void 0 : _a.blur) == null ? void 0 : _b.call(_a);
      },
      createMediaContext,
      createVideoContext: (id = "liveVideo") => createMediaContext(id, "video"),
      createLivePlayerContext: (id = "liveVideo") => createMediaContext(id, "live-player")
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(mode) === "portrait" && !common_vendor.unref(accessDenied)
      }, common_vendor.unref(mode) === "portrait" && !common_vendor.unref(accessDenied) ? common_vendor.e({
        b: common_vendor.unref(showReplayFirstVideoLoading)
      }, common_vendor.unref(showReplayFirstVideoLoading) ? {
        c: common_assets._imports_0$13
      } : {}, {
        d: common_vendor.unref(anchorAvatar),
        e: common_vendor.t(common_vendor.unref(anchorName)),
        f: useLiveVisualStyle.value
      }, useLiveVisualStyle.value ? {
        g: common_assets._imports_1$5
      } : {}, {
        h: common_vendor.t(anchorSubText.value),
        i: !common_vendor.unref(anchorName) ? 1 : "",
        j: common_vendor.unref(roomGroupType) !== 1 && common_vendor.unref(roomSetting).showStatus !== 0
      }, common_vendor.unref(roomGroupType) !== 1 && common_vendor.unref(roomSetting).showStatus !== 0 ? {
        k: common_vendor.t(liveStatusLabel.value),
        l: common_vendor.n(liveStatusClass.value)
      } : {}, {
        m: !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl))
      }, !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl)) ? common_vendor.e({
        n: common_vendor.unref(roomSetting).showViewerData !== 0
      }, common_vendor.unref(roomSetting).showViewerData !== 0 ? {
        o: common_assets._imports_2$3,
        p: common_vendor.t(common_vendor.unref(displayViewerCount)),
        q: common_vendor.unref(viewerCountAnimating) ? 1 : ""
      } : {}, {
        r: common_assets._imports_3$1,
        s: common_vendor.o((...args) => common_vendor.unref(goReport) && common_vendor.unref(goReport)(...args), "90")
      }) : {}, {
        t: !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl))
      }, !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl)) ? {
        v: common_vendor.o(common_vendor.unref(openCommentPrizeRuleModal), "cb"),
        w: common_vendor.o(common_vendor.unref(openWatchRewardPanel), "79"),
        x: common_vendor.p({
          ["comment-lottery-visible"]: common_vendor.unref(commentLotteryEntryVisible),
          keyword: common_vendor.unref(commentLotteryEntryKeyword),
          ["bubble-visible"]: common_vendor.unref(commentLotteryBubbleVisible),
          ["watch-reward-visible"]: common_vendor.unref(hasVisibleWatchRewardTasks),
          ["watch-reward-label"]: common_vendor.unref(watchRewardEntryLabel)
        })
      } : {}, {
        y: shouldUseLivePlayer.value && common_vendor.unref(displayVideoUrl)
      }, shouldUseLivePlayer.value && common_vendor.unref(displayVideoUrl) ? {
        z: "live-player-" + common_vendor.unref(videoRenderKey),
        A: common_vendor.unref(displayVideoUrl),
        B: common_vendor.unref(isMuted),
        C: common_vendor.unref(isMuted) ? "speaker" : "speaker",
        D: common_vendor.unref(mode) === "portrait" ? "vertical" : "horizontal",
        E: common_vendor.unref(videoPoster) ? "url(" + common_vendor.unref(videoPoster) + ")" : "none",
        F: common_vendor.o(handleLivePlayerStateChange, "11"),
        G: common_vendor.o(handleLivePlayerNetStatus, "3a"),
        H: common_vendor.o(handleLivePlayerError, "ff"),
        I: common_vendor.o((...args) => common_vendor.unref(onVideoTap) && common_vendor.unref(onVideoTap)(...args), "fb")
      } : {}, {
        J: !shouldUseLivePlayer.value && common_vendor.unref(displayVideoUrl)
      }, !shouldUseLivePlayer.value && common_vendor.unref(displayVideoUrl) ? {
        K: common_vendor.unref(videoRenderKey),
        L: common_vendor.unref(displayVideoUrl),
        M: common_vendor.unref(isWaitingSchedule) && !!common_vendor.unref(warmUpVideoUrl),
        N: common_vendor.unref(videoPoster) ? "url(" + common_vendor.unref(videoPoster) + ")" : "none",
        O: common_vendor.unref(isMuted),
        P: common_vendor.unref(videoPoster),
        Q: common_vendor.o(handleVideoPlay, "bd"),
        R: common_vendor.o(markVideoFrameReady, "cc"),
        S: common_vendor.o(markVideoFrameReady, "e6"),
        T: common_vendor.o(markVideoFrameReady, "02"),
        U: common_vendor.o(handleVideoPause, "2c"),
        V: common_vendor.o(handleVideoTimeUpdate, "b4"),
        W: common_vendor.o(handleVideoEnded, "8d"),
        X: common_vendor.o(($event) => handleVideoError($event, common_vendor.unref(displayVideoUrl)), "2d"),
        Y: common_vendor.o((...args) => common_vendor.unref(onVideoTap) && common_vendor.unref(onVideoTap)(...args), "da")
      } : {}, {
        Z: showManualPlayButton.value
      }, showManualPlayButton.value ? {
        aa: common_vendor.o((...args) => common_vendor.unref(manualPlayVideo) && common_vendor.unref(manualPlayVideo)(...args), "76")
      } : {}, {
        ab: shouldRenderLivePoster.value
      }, shouldRenderLivePoster.value ? {
        ac: common_vendor.unref(liveCover),
        ad: !showLivePoster.value ? 1 : ""
      } : {}, {
        ae: shouldRenderReplayPoster.value
      }, shouldRenderReplayPoster.value ? {
        af: replayCoverPoster.value,
        ag: replayPosterHidden.value ? 1 : ""
      } : {}, {
        ah: common_vendor.unref(playbackErrorVisible)
      }, common_vendor.unref(playbackErrorVisible) ? {
        ai: common_vendor.t(common_vendor.unref(playbackErrorText) || "播放失败，请重试"),
        aj: common_vendor.o((...args) => common_vendor.unref(retryPlayback) && common_vendor.unref(retryPlayback)(...args), "ca")
      } : {}, {
        ak: common_vendor.f(common_vendor.unref(tapEffects), (effect, k0, i0) => {
          return {
            a: effect.slotId + "-" + effect.runId,
            b: effect.img,
            c: effect.x + "px",
            d: effect.y + "px",
            e: common_vendor.o(($event) => common_vendor.unref(finishTapEffect)(effect.slotId, effect.runId), effect.slotId + "-" + effect.runId)
          };
        }),
        al: common_vendor.unref(comboInfo).visible
      }, common_vendor.unref(comboInfo).visible ? {
        am: common_vendor.t(common_vendor.unref(comboInfo).count),
        an: common_vendor.unref(comboInfo).key,
        ao: common_vendor.unref(comboInfo).x + "px",
        ap: common_vendor.unref(comboInfo).y + "px"
      } : {}, {
        aq: common_vendor.p({
          ["room-setting"]: common_vendor.unref(roomSetting),
          variant: "portrait"
        }),
        ar: common_vendor.unref(shouldShowComments) && common_vendor.unref(pinnedMessage)
      }, common_vendor.unref(shouldShowComments) && common_vendor.unref(pinnedMessage) ? {
        as: common_vendor.t(common_vendor.unref(pinnedMessage).nick),
        at: common_vendor.t(common_vendor.unref(pinnedMessage).content),
        av: common_vendor.s(pinnedBarStyle.value)
      } : {}, {
        aw: common_vendor.unref(shouldShowComments)
      }, common_vendor.unref(shouldShowComments) ? {
        ax: common_vendor.f(common_vendor.unref(visibleMessages), (msg, k0, i0) => {
          return common_vendor.e({
            a: msg.type === "system"
          }, msg.type === "system" ? {
            b: common_vendor.t(msg.content)
          } : msg.type === "lottery_win" ? {
            d: msg.icon,
            e: common_vendor.t(msg.nick),
            f: common_vendor.t(msg.prizeName)
          } : msg.type === "enter" || msg.type === "leave" ? {
            h: common_vendor.t(msg.content)
          } : common_vendor.e({
            i: msg.isAdmin
          }, msg.isAdmin ? {} : {}, {
            j: common_vendor.t(msg.nick),
            k: common_vendor.t(msg.content)
          }), {
            c: msg.type === "lottery_win",
            g: msg.type === "enter" || msg.type === "leave",
            l: msg._visibleIndex,
            m: "msg-" + msg._visibleIndex,
            n: common_vendor.n(msg.type === "system" ? "system-bubble" : ""),
            o: common_vendor.n(msg.type === "lottery_win" ? "lottery-win-bubble" : ""),
            p: common_vendor.n(msg.type === "enter" || msg.type === "leave" ? "enter-bubble" : "")
          });
        }),
        ay: isChatAreaScrolled.value ? 1 : "",
        az: !common_vendor.unref(inputFocused),
        aA: common_vendor.s(chatAreaStyle.value),
        aB: common_vendor.unref(scrollToId),
        aC: common_vendor.unref(commentScrollWithAnimation),
        aD: common_vendor.o(handleChatAreaScroll, "63")
      } : {}, {
        aE: common_vendor.unref(enterNotice).visible && !common_vendor.unref(shouldShowEntryOverlay)
      }, common_vendor.unref(enterNotice).visible && !common_vendor.unref(shouldShowEntryOverlay) ? common_vendor.e({
        aF: common_vendor.unref(enterNotice).noticeType === "leave"
      }, common_vendor.unref(enterNotice).noticeType === "leave" ? {
        aG: common_vendor.t(common_vendor.unref(enterNotice).nick)
      } : {
        aH: common_vendor.t(common_vendor.unref(enterNotice).nick)
      }, {
        aI: common_vendor.unref(enterNotice).key,
        aJ: common_vendor.unref(enterNotice).leaving ? 1 : "",
        aK: common_vendor.s(enterNoticeStyle.value)
      }) : {}, {
        aL: common_vendor.unref(buyingNotice).visible
      }, common_vendor.unref(buyingNotice).visible ? common_vendor.e({
        aM: common_assets._imports_0$12,
        aN: common_vendor.t(common_vendor.unref(buyingNotice).nick),
        aO: common_vendor.unref(buyingNotice).count > 1
      }, common_vendor.unref(buyingNotice).count > 1 ? {
        aP: common_vendor.t(common_vendor.unref(buyingNotice).count)
      } : {}, {
        aQ: common_vendor.t(common_vendor.unref(buyingNotice).noticeText || "正在去购买"),
        aR: common_vendor.unref(buyingNotice).key,
        aS: common_vendor.unref(buyingNotice).leaving ? 1 : "",
        aT: common_vendor.s(buyingNoticeStyle.value)
      }) : {}, {
        aU: common_vendor.unref(goShoppingNotice).visible
      }, common_vendor.unref(goShoppingNotice).visible ? common_vendor.e({
        aV: common_vendor.unref(goShoppingNotice).productImage
      }, common_vendor.unref(goShoppingNotice).productImage ? {
        aW: common_vendor.unref(goShoppingNotice).productImage
      } : {}, {
        aX: common_vendor.t(common_vendor.unref(goShoppingNotice).nick),
        aY: common_vendor.t(common_vendor.unref(goShoppingNotice).count > 1 ? `等${common_vendor.unref(goShoppingNotice).count}人在购买` : common_vendor.unref(goShoppingNotice).noticeText || "正在去购买"),
        aZ: common_vendor.unref(goShoppingNotice).productName
      }, common_vendor.unref(goShoppingNotice).productName ? {
        ba: common_vendor.t(common_vendor.unref(goShoppingNotice).productName)
      } : {}, {
        bb: common_vendor.o(openGoShoppingNoticeProduct, "c4"),
        bc: common_vendor.unref(goShoppingNotice).key,
        bd: common_vendor.unref(goShoppingNotice).leaving ? 1 : "",
        be: common_vendor.s(goShoppingNoticeStyle.value)
      }) : {}, {
        bf: common_vendor.o(($event) => common_vendor.unref(setShowProduct)($event), "3b"),
        bg: common_vendor.o(($event) => common_vendor.unref(setShowProductList)($event), "03"),
        bh: common_vendor.o(common_vendor.unref(onProductCardChange), "61"),
        bi: common_vendor.o(common_vendor.unref(onProductBuy), "f9"),
        bj: common_vendor.o(common_vendor.unref(onProductDetail), "54"),
        bk: common_vendor.o(($event) => common_vendor.unref(loadProductList)(), "51"),
        bl: common_vendor.p({
          mode: "portrait",
          ["show-product"]: common_vendor.unref(showProduct),
          ["show-product-list"]: common_vendor.unref(showProductList),
          ["current-product"]: common_vendor.unref(currentProduct),
          ["product-card-items"]: common_vendor.unref(productCardItems),
          ["product-card-active-index"]: common_vendor.unref(productCardActiveIndex),
          ["product-list"]: common_vendor.unref(productList),
          ["product-total"]: common_vendor.unref(productTotal),
          ["product-loading"]: common_vendor.unref(productLoading),
          ["product-finished"]: common_vendor.unref(productFinished),
          ["success-notice"]: common_vendor.unref(productListSuccessNotice),
          ["show-hot-sale"]: Number(common_vendor.unref(roomSetting).showHotSale ?? 1) === 1
        }),
        bm: common_vendor.unref(muteTipVisible)
      }, common_vendor.unref(muteTipVisible) ? {
        bn: common_vendor.t(common_vendor.unref(userBlocked) ? "您已被拉黑，无法参与互动" : common_vendor.unref(muteRemainText) ? `您已被禁言，剩余${common_vendor.unref(muteRemainText)}` : "您已被禁言")
      } : {}, {
        bo: common_vendor.sr(portraitInputRef, "49f93bbb-3", {
          "k": "portraitInputRef"
        }),
        bp: common_vendor.o(common_vendor.unref(focusInput), "6e"),
        bq: common_vendor.o(common_vendor.unref(setInputText), "55"),
        br: common_vendor.o(common_vendor.unref(onInputFocus), "eb"),
        bs: common_vendor.o(common_vendor.unref(handleSendClick), "0e"),
        bt: common_vendor.o(common_vendor.unref(onInputBlur), "2e"),
        bv: common_vendor.o(common_vendor.unref(handleSendClick), "b0"),
        bw: common_vendor.o(common_vendor.unref(toggleCenter), "7a"),
        bx: common_vendor.o(common_vendor.unref(toggleProduct), "d9"),
        by: common_vendor.o(common_vendor.unref(doLike), "46"),
        bz: common_vendor.o(common_vendor.unref(finishHeartAnimation), "34"),
        bA: common_vendor.o(handleQuickReply, "a5"),
        bB: common_vendor.o(($event) => common_vendor.unref(setShowShare)(true), "48"),
        bC: common_vendor.p({
          ["model-value"]: common_vendor.unref(inputText),
          variant: "portrait",
          show: !common_vendor.unref(isWaitingSchedule),
          focused: common_vendor.unref(inputFocused),
          ["disabled-text"]: common_vendor.unref(chatDisabled),
          ["bottom-style"]: common_vendor.unref(bottomBarStyle),
          ["room-setting"]: common_vendor.unref(roomSetting),
          ["product-count"]: common_vendor.unref(productTotal) || common_vendor.unref(productList).length,
          ["live-toolbar"]: useLiveVisualStyle.value,
          hearts: common_vendor.unref(hearts),
          ["like-count"]: common_vendor.unref(likeCount),
          ["quick-replies"]: common_vendor.unref(quickReplies),
          ["is-distributor"]: common_vendor.unref(isDistributor),
          ["distributor-status"]: common_vendor.unref(distributorStatus)
        }),
        bD: common_vendor.unref(renderSharePopup)
      }, common_vendor.unref(renderSharePopup) ? {
        bE: common_vendor.o(($event) => common_vendor.unref(setShowShare)(false), "67"),
        bF: common_vendor.o(common_vendor.unref(onShareAction), "e2"),
        bG: common_vendor.p({
          visible: common_vendor.unref(showShare),
          ["room-id"]: common_vendor.unref(liveId),
          ["room-code"]: common_vendor.unref(roomCode),
          ["share-code"]: common_vendor.unref(shareCode),
          ["bind-id"]: common_vendor.unref(liveBindId),
          ["tenant-id"]: common_vendor.unref(liveTenantId),
          ["is-replay"]: common_vendor.unref(isReplay),
          ["replay-video-id"]: common_vendor.unref(replayCurrentVideoId),
          ["anchor-name"]: common_vendor.unref(anchorName),
          ["anchor-avatar"]: common_vendor.unref(anchorAvatar),
          ["live-name"]: common_vendor.unref(liveName),
          ["live-cover"]: common_vendor.unref(liveCover),
          ["push-time"]: common_vendor.unref(pushTime),
          ["schedule-time"]: common_vendor.unref(scheduleTimeStr),
          ["live-date"]: common_vendor.unref(liveDate),
          ["is-distributor"]: common_vendor.unref(isDistributor),
          ["distributor-status"]: common_vendor.unref(distributorStatus)
        })
      } : {}, {
        bH: common_vendor.unref(renderCenterPopup)
      }, common_vendor.unref(renderCenterPopup) ? {
        bI: common_vendor.o(($event) => common_vendor.unref(setShowCenterPopup)(false), "2b"),
        bJ: common_vendor.o(common_vendor.unref(onCenterAction), "7d"),
        bK: common_vendor.p({
          visible: common_vendor.unref(showCenterPopup),
          name: common_vendor.unref(centerPopupName),
          avatar: common_vendor.unref(centerPopupAvatar),
          ["order-stats"]: common_vendor.unref(centerPopupOrderStats),
          ["is-distributor"]: common_vendor.unref(isDistributor),
          ["distributor-status"]: common_vendor.unref(distributorStatus),
          ["enable-share"]: common_vendor.unref(roomSetting).enableShare
        })
      } : {}, {
        bL: common_vendor.unref(renderBuyPopup)
      }, common_vendor.unref(renderBuyPopup) ? {
        bM: common_vendor.o(($event) => common_vendor.unref(setShowBuyPopup)(false), "c3"),
        bN: common_vendor.o(common_vendor.unref(openBuyAddressPopup), "d5"),
        bO: common_vendor.o(($event) => common_vendor.unref(setBuyRemark)($event), "85"),
        bP: common_vendor.o(common_vendor.unref(onBuyQuantityChange), "1a"),
        bQ: common_vendor.o(common_vendor.unref(onBuySkuChange), "0e"),
        bR: common_vendor.o(common_vendor.unref(onBuyCouponSelect), "18"),
        bS: common_vendor.o(common_vendor.unref(onBuyConfirm), "a8"),
        bT: common_vendor.p({
          visible: common_vendor.unref(showBuyPopup),
          ["z-index"]: BUY_POPUP_Z_INDEX,
          ["coupon-z-index"]: BUY_POPUP_Z_INDEX + 1,
          product: common_vendor.unref(buyProduct),
          ["address-text"]: common_vendor.unref(buyAddressText),
          ["address-detail"]: common_vendor.unref(selectedAddress) || {},
          ["shipping-fee"]: common_vendor.unref(buyShippingFee),
          ["goods-amount"]: common_vendor.unref(buyGoodsAmount),
          ["total-price"]: common_vendor.unref(buyTotalPrice),
          ["discount-amount"]: common_vendor.unref(buyDiscountAmount),
          remark: common_vendor.unref(buyRemark),
          loading: common_vendor.unref(buyLoading),
          ["require-address"]: common_vendor.unref(buyProduct).requireAddress || 1,
          ["usable-coupons"]: common_vendor.unref(usableCoupons),
          ["unusable-coupons"]: common_vendor.unref(unusableCoupons),
          ["selected-coupon-id"]: common_vendor.unref(selectedCouponId),
          ["coupon-loading"]: common_vendor.unref(couponLoading)
        })
      } : {}, {
        bU: common_vendor.unref(renderLiveReportPopup)
      }, common_vendor.unref(renderLiveReportPopup) ? {
        bV: common_vendor.o(common_vendor.unref(setShowLiveReportPopup), "53"),
        bW: common_vendor.p({
          visible: common_vendor.unref(showLiveReportPopup),
          ["live-id"]: common_vendor.unref(liveId),
          ["room-code"]: common_vendor.unref(roomCode),
          ["tenant-id"]: common_vendor.unref(liveTenantId),
          ["term-id"]: common_vendor.unref(roomCurrentTermId),
          ["customer-id"]: common_vendor.unref(myUserId),
          ["user-id"]: common_vendor.unref(myUserId),
          ["is-replay"]: common_vendor.unref(isReplay),
          ["replay-video-id"]: common_vendor.unref(replayCurrentVideoId),
          ["live-name"]: common_vendor.unref(liveName),
          cover: common_vendor.unref(liveCover),
          ["from-path"]: common_vendor.unref(broadcastReturnPath)
        })
      } : {}, {
        bX: common_vendor.unref(renderAddressPopup)
      }, common_vendor.unref(renderAddressPopup) ? {
        bY: common_vendor.o(common_vendor.unref(onSelectBuyAddress), "41"),
        bZ: common_vendor.o(common_vendor.unref(onAddBuyAddress), "20"),
        ca: common_vendor.o(common_vendor.unref(onEditBuyAddress), "7a"),
        cb: common_vendor.o(common_vendor.unref(onAddBuyAddress), "fa"),
        cc: common_vendor.o(common_vendor.unref(onDeleteBuyAddress), "1f"),
        cd: common_vendor.o(common_vendor.unref(onImportWxAddress), "b2"),
        ce: common_vendor.p({
          list: common_vendor.unref(addressList),
          ["selected-id"]: common_vendor.unref(selectedAddressId),
          title: "地址管理",
          ["button-text"]: "新增",
          ["show-default-row"]: false,
          ["button-disabled"]: false
        }),
        cf: common_vendor.o(($event) => common_vendor.unref(setShowAddressPopup)(false), "d1"),
        cg: common_vendor.p({
          visible: common_vendor.unref(showAddressPopup),
          height: common_vendor.unref(addressList).length === 0 ? "52vh" : "78vh",
          radius: "24rpx 24rpx 0 0",
          duration: 500,
          ["z-index"]: BUY_POPUP_Z_INDEX + 2,
          ["with-mask"]: true,
          ["mask-color"]: "rgba(0, 0, 0, 0.35)"
        })
      } : {}, {
        ch: common_vendor.unref(renderAddressFormPopup)
      }, common_vendor.unref(renderAddressFormPopup) ? {
        ci: common_vendor.o(($event) => common_vendor.unref(setShowAddressFormPopup)(false), "1d"),
        cj: common_vendor.o(common_vendor.unref(onBuyAddressSaved), "0f"),
        ck: common_vendor.p({
          visible: common_vendor.unref(showAddressFormPopup),
          ["edit-data"]: common_vendor.unref(editAddressData),
          ["popup-height"]: "78vh",
          ["z-index"]: BUY_POPUP_Z_INDEX + 4
        })
      } : {}, {
        cl: common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled) && common_vendor.unref(renderSignPopup)
      }, common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled) && common_vendor.unref(renderSignPopup) ? {
        cm: common_vendor.o(($event) => !common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).forceEnabled) && common_vendor.unref(setShowSignPopup)(false), "80"),
        cn: common_vendor.p({
          show: common_vendor.unref(showSignPopup),
          ["custom-style"]: "z-index:950;background:rgba(0,0,0,0.5);"
        })
      } : {}, {
        co: common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled) && common_vendor.unref(renderSignPopup)
      }, common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled) && common_vendor.unref(renderSignPopup) ? common_vendor.e({
        cp: !common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).forceEnabled)
      }, !common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).forceEnabled) ? {
        cq: common_vendor.o(($event) => common_vendor.unref(setShowSignPopup)(false), "c0")
      } : {}, {
        cr: common_vendor.o(common_vendor.unref(onSignedDone), "f6"),
        cs: common_vendor.o(($event) => common_vendor.unref(setShowSignPopup)(false), "d2"),
        ct: common_vendor.p({
          ["room-id"]: common_vendor.unref(liveId),
          ["room-code"]: common_vendor.unref(roomCode),
          ["tenant-id"]: common_vendor.unref(liveTenantId),
          ["share-code"]: common_vendor.unref(shareCode),
          ["bind-id"]: common_vendor.unref(liveBindId),
          ["live-type"]: common_vendor.unref(isReplay) ? "replay" : "live",
          ["term-id"]: common_vendor.unref(roomCurrentTermId),
          ["customer-id"]: common_vendor.unref(myUserId),
          ["user-id"]: common_vendor.unref(myUserId),
          config: common_vendor.unref(signConfig),
          fields: common_vendor.unref(signFields),
          signed: common_vendor.unref(hasSigned),
          ["show-welcome-text"]: true,
          ["show-skip"]: !common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).forceEnabled),
          ["submit-text"]: "确定",
          ["success-mode"]: "toast"
        }),
        cv: common_vendor.o(() => {
        }, "37"),
        cw: common_vendor.o(($event) => !common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).forceEnabled) && common_vendor.unref(setShowSignPopup)(false), "46"),
        cx: common_vendor.p({
          show: common_vendor.unref(showSignPopup),
          duration: 500,
          ["custom-style"]: "position:fixed;left:0;top:0;right:0;bottom:0;z-index:951;"
        })
      }) : {}, {
        cy: common_vendor.p({
          visible: common_vendor.unref(showNotStartedOverlay) && !(common_vendor.unref(roomGroupType) === 0 && common_vendor.unref(isReplay)) && !common_vendor.unref(showProductList) && !common_vendor.unref(showBuyPopup) && !common_vendor.unref(showAddressPopup) && !common_vendor.unref(showAddressFormPopup),
          portrait: true,
          title: common_vendor.unref(liveOverlayTitle),
          ["show-views"]: false,
          ["viewer-count"]: common_vendor.unref(displayViewerCount),
          avatar: common_vendor.unref(anchorAvatar),
          name: common_vendor.unref(anchorName)
        }),
        cz: common_vendor.o(common_vendor.unref(enterLive), "a2"),
        cA: common_vendor.p({
          show: common_vendor.unref(shouldShowEntryOverlay)
        }),
        cB: useLiveVisualStyle.value ? 1 : "",
        cC: !useLiveVisualStyle.value ? 1 : "",
        cD: common_vendor.s(common_vendor.unref(isWechatH5) && common_vendor.unref(isIOS) ? {
          opacity: 1,
          transition: "opacity 0.3s"
        } : {})
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-49f93bbb"]]);
wx.createComponent(Component);
