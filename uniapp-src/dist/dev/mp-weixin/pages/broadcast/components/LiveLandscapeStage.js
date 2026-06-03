"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const pages_broadcast_utils_entryFormat = require("../utils/entry-format.js");
const utils_liveRoute = require("../../../utils/live-route.js");
if (!Array) {
  const _easycom_wd_tab2 = common_vendor.resolveComponent("wd-tab");
  const _easycom_wd_tabs2 = common_vendor.resolveComponent("wd-tabs");
  (_easycom_wd_tab2 + _easycom_wd_tabs2)();
}
const _easycom_wd_tab = () => "../../../node-modules/wot-design-uni/components/wd-tab/wd-tab.js";
const _easycom_wd_tabs = () => "../../../node-modules/wot-design-uni/components/wd-tabs/wd-tabs.js";
if (!Math) {
  (LiveEndedOverlay + LiveExternalLotteryTools + _easycom_wd_tab + _easycom_wd_tabs + LiveMarqueeAd + LiveProductShelf + LiveSignIn + LiveChatBar + SharePopup + ProductBuyPopup + AddressListPanel + BottomSheetPopup + AddressFormPopup + CenterPopup + LiveEntryOverlay + LiveReportPopup)();
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
const _sfc_main = {
  __name: "LiveLandscapeStage",
  props: {
    s: { type: Object, required: true },
    a: { type: Object, required: true }
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
      isMuted,
      playbackErrorVisible,
      playbackErrorText,
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
      pinnedMessage,
      productListSuccessNotice,
      showProduct,
      showProductList,
      currentProduct,
      productCardItems,
      productCardActiveIndex,
      productList,
      productLoading,
      productFinished,
      muteTipVisible,
      userBlocked,
      muteRemainText,
      inputText,
      inputFocused,
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
      hasVisibleWatchRewardTasks,
      watchRewardEntryLabel,
      commentLotteryEntryVisible,
      commentLotteryEntryKeyword,
      commentLotteryBubbleVisible,
      defaultAvatar,
      isDistributor,
      distributorStatus,
      enterNotice,
      buyingNotice,
      goShoppingNotice
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
    function parseStageStartTs(value) {
      if (!value)
        return 0;
      const ts = new Date(String(value).replace(
        /-/g,
        "/"
      )).getTime();
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
    const isLiveLandscapeStyle = common_vendor.computed(() => isLiveVisualMode.value);
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
    const stageCollapsed = common_vendor.ref(false);
    function toggleCollapse() {
      stageCollapsed.value = !stageCollapsed.value;
    }
    const miniHidden = common_vendor.ref(false);
    function closeMiniWindow() {
      miniHidden.value = true;
    }
    common_vendor.watch(stageCollapsed, (val) => {
      setLandscapeMiniActive == null ? void 0 : setLandscapeMiniActive(!!val);
      if (!val) {
        miniHidden.value = false;
        miniWindowOffset.value = { x: 0, y: 0 };
      }
    });
    const miniWindowOffset = common_vendor.ref({ x: 0, y: 0 });
    let miniDragState = null;
    const miniWindowStyle = common_vendor.computed(() => {
      if (!stageCollapsed.value)
        return {};
      const { x, y } = miniWindowOffset.value;
      if (!x && !y)
        return {};
      return { transform: `translate(${x}px, ${y}px)` };
    });
    function onMiniDragStart(e) {
      if (!stageCollapsed.value || miniHidden.value)
        return;
      const target = e.target;
      if (target && typeof target.closest === "function" && target.closest(".video-mini-controls")) {
        return;
      }
      const t = e.touches && e.touches[0] || e;
      miniDragState = {
        startX: t.clientX,
        startY: t.clientY,
        baseX: miniWindowOffset.value.x,
        baseY: miniWindowOffset.value.y
      };
    }
    function onMiniDragMove(e) {
      if (!miniDragState)
        return;
      const t = e.touches && e.touches[0] || e;
      miniWindowOffset.value = {
        x: miniDragState.baseX + (t.clientX - miniDragState.startX),
        y: miniDragState.baseY + (t.clientY - miniDragState.startY)
      };
      if (e && typeof e.preventDefault === "function") {
        try {
          e.preventDefault();
        } catch (err) {
        }
      }
    }
    function onMiniDragEnd() {
      miniDragState = null;
    }
    function handleVideoPause() {
      setIsPlaying(false);
    }
    function handleVideoEnded() {
      setIsPlaying(false);
      handleVideoPlayerEnded();
    }
    const isFakeFullscreen = common_vendor.ref(false);
    function toggleFullscreen() {
      isFakeFullscreen.value = !isFakeFullscreen.value;
      if (isFakeFullscreen.value && stageCollapsed.value) {
        stageCollapsed.value = false;
      }
    }
    const liveLandscapeStatusText = liveStatusLabel;
    const showLiveLandscapePreview = common_vendor.computed(() => {
      if (!isLiveLandscapeStyle.value)
        return false;
      if (isLiveNotStarted.value)
        return false;
      if (liveCover.value)
        return false;
      if (!displayVideoUrl.value)
        return true;
      return showNotStartedOverlay.value || isWaitingSchedule.value && !warmUpVideoUrl.value;
    });
    const shouldRenderLivePoster = common_vendor.computed(
      () => !warmUpVideoUrl.value && !!liveCover.value && !showLiveLandscapePreview.value && !(pushStatus.value === 1 && videoFrameReady.value)
    );
    const showLivePoster = common_vendor.computed(
      () => shouldRenderLivePoster.value && (isLiveNotStarted.value || isWaitingSchedule.value || !hasReplay.value && pushStatus.value !== 1 || pushStatus.value === 1 && !videoFrameReady.value && !isReplay.value)
    );
    const landscapeInteractTitle = common_vendor.computed(() => isLiveLandscapeStyle.value ? "互动" : "直播互动");
    const landscapeProductTitle = common_vendor.computed(() => isLiveLandscapeStyle.value ? "商品" : "商品列表");
    const bottomBarHeight = common_vendor.ref(0);
    function bindBottomBarObserver() {
      var _a;
      bottomBarHeight.value = ((_a = quickReplies.value) == null ? void 0 : _a.length) > 0 ? 180 : 110;
    }
    common_vendor.onMounted(() => {
      common_vendor.nextTick$1(bindBottomBarObserver);
    });
    common_vendor.watch([
      activeTab,
      quickReplies,
      inputFocused
    ], () => {
      common_vendor.nextTick$1(bindBottomBarObserver);
    });
    common_vendor.onBeforeUnmount(() => {
      setLandscapeMiniActive == null ? void 0 : setLandscapeMiniActive(false);
    });
    const anyBusinessPopupOpen = common_vendor.computed(() => Boolean(
      showBuyPopup.value || showCenterPopup.value || showShare.value || showAddressPopup.value || showAddressFormPopup.value || showSignPopup.value || showLiveReportPopup.value
    ));
    const showLandscapeCommentLotteryEntry = common_vendor.computed(() => activeTab.value === "interact" && commentLotteryEntryVisible.value);
    const landscapeBottomStyle = common_vendor.computed(() => {
      var _a;
      if (activeTab.value !== "interact")
        return {};
      if (bottomBarHeight.value > 0) {
        return { paddingBottom: `${bottomBarHeight.value}px` };
      }
      if (((_a = quickReplies.value) == null ? void 0 : _a.length) > 0) {
        return { paddingBottom: "calc(180rpx + env(safe-area-inset-bottom))" };
      }
      return { paddingBottom: "calc(110rpx + env(safe-area-inset-bottom))" };
    });
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
      toggleMute,
      setLandscapeMiniActive,
      handleLivePlayerFailure,
      markPlaybackReady,
      retryPlayback
    } = props.a;
    const handleVideoPlayerEnded = props.a.handleVideoPlayerEnded || (() => {
    });
    let frameCallbackPending = false;
    function markVideoFrameReady(event) {
      var _a;
      if (videoFrameReady.value)
        return;
      const el = event == null ? void 0 : event.target;
      if (!el) {
        if ((event == null ? void 0 : event.type) === "loadeddata" || (event == null ? void 0 : event.type) === "playing" || (event == null ? void 0 : event.type) === "live-player-netstatus") {
          setVideoFrameReady(true);
          markPlaybackReady == null ? void 0 : markPlaybackReady((event == null ? void 0 : event.type) || "media-event");
        }
        return;
      }
      if (el && typeof el.requestVideoFrameCallback === "function" && (event == null ? void 0 : event.type) !== "timeupdate") {
        if (frameCallbackPending)
          return;
        frameCallbackPending = true;
        el.requestVideoFrameCallback(() => {
          frameCallbackPending = false;
          setVideoFrameReady(true);
          markPlaybackReady == null ? void 0 : markPlaybackReady((event == null ? void 0 : event.type) || "frame-callback");
        });
        return;
      }
      const currentTime = Number((el == null ? void 0 : el.currentTime) ?? ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.currentTime) ?? 0);
      if ((event == null ? void 0 : event.type) === "loadeddata" || (event == null ? void 0 : event.type) === "playing" || Number(el.readyState || 0) >= 2 || currentTime > 0) {
        setVideoFrameReady(true);
        markPlaybackReady == null ? void 0 : markPlaybackReady((event == null ? void 0 : event.type) || "media-event");
      }
    }
    function handleVideoPlay(event) {
      setIsPlaying(true);
      if (typeof onVideoPlay === "function") {
        onVideoPlay(event);
      }
    }
    function handleVideoTimeUpdate(event) {
      markVideoFrameReady(event);
      onVideoTimeUpdate(event);
    }
    function handleLivePlayerStateChange(event) {
      var _a;
      const code = Number(((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.code) || 0);
      if (LIVE_PLAYER_READY_CODES.includes(code)) {
        setIsPlaying(true);
        setVideoFrameReady(true);
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
        markVideoFrameReady({ ...event, type: "live-player-netstatus" });
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
    function handleQuickReply(text) {
      handleSendClick(text);
    }
    const landscapeInputRef = common_vendor.ref(null);
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
        return (_b = (_a = landscapeInputRef.value) == null ? void 0 : _a.focus) == null ? void 0 : _b.call(_a);
      },
      blur: () => {
        var _a, _b;
        return (_b = (_a = landscapeInputRef.value) == null ? void 0 : _a.blur) == null ? void 0 : _b.call(_a);
      },
      createMediaContext,
      createVideoContext: (id = "liveVideo") => createMediaContext(id, "video"),
      createLivePlayerContext: (id = "liveVideo") => createMediaContext(id, "live-player")
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !common_vendor.unref(accessDenied)
      }, !common_vendor.unref(accessDenied) ? common_vendor.e({
        b: shouldUseLivePlayer.value && common_vendor.unref(displayVideoUrl)
      }, shouldUseLivePlayer.value && common_vendor.unref(displayVideoUrl) ? {
        c: "live-player-" + common_vendor.unref(videoRenderKey),
        d: common_vendor.unref(displayVideoUrl),
        e: common_vendor.unref(isMuted),
        f: common_vendor.unref(isMuted) ? "speaker" : "speaker",
        g: showLivePoster.value ? "url(" + common_vendor.unref(videoPoster) + ")" : "none",
        h: common_vendor.o(handleLivePlayerStateChange, "03"),
        i: common_vendor.o(handleLivePlayerNetStatus, "ae"),
        j: common_vendor.o(handleLivePlayerError, "64")
      } : {}, {
        k: !shouldUseLivePlayer.value && common_vendor.unref(displayVideoUrl)
      }, !shouldUseLivePlayer.value && common_vendor.unref(displayVideoUrl) ? {
        l: common_vendor.unref(videoRenderKey),
        m: common_vendor.unref(displayVideoUrl),
        n: common_vendor.unref(isWaitingSchedule) && !!common_vendor.unref(warmUpVideoUrl),
        o: showLivePoster.value ? "url(" + common_vendor.unref(videoPoster) + ")" : "none",
        p: common_vendor.unref(isMuted),
        q: showLivePoster.value ? common_vendor.unref(videoPoster) : "",
        r: common_vendor.o(handleVideoPlay, "14"),
        s: common_vendor.o(markVideoFrameReady, "5d"),
        t: common_vendor.o(markVideoFrameReady, "8d"),
        v: common_vendor.o(markVideoFrameReady, "ba"),
        w: common_vendor.o(handleVideoPause, "6a"),
        x: common_vendor.o(handleVideoEnded, "36"),
        y: common_vendor.o(handleVideoTimeUpdate, "0f"),
        z: common_vendor.o(($event) => handleVideoError($event, common_vendor.unref(displayVideoUrl)), "32")
      } : {}, {
        A: showLivePoster.value
      }, showLivePoster.value ? {
        B: common_vendor.unref(liveCover),
        C: !showLivePoster.value ? 1 : ""
      } : {}, {
        D: common_vendor.p({
          visible: common_vendor.unref(showNotStartedOverlay) && !(common_vendor.unref(roomGroupType) === 0 && common_vendor.unref(isReplay)),
          title: common_vendor.unref(liveOverlayTitle),
          ["show-views"]: false,
          ["viewer-count"]: common_vendor.unref(displayViewerCount),
          avatar: common_vendor.unref(anchorAvatar),
          name: common_vendor.unref(anchorName)
        }),
        E: showLiveLandscapePreview.value && (common_vendor.unref(liveCover) || common_vendor.unref(videoPoster))
      }, showLiveLandscapePreview.value && (common_vendor.unref(liveCover) || common_vendor.unref(videoPoster)) ? {
        F: common_vendor.unref(liveCover) || common_vendor.unref(videoPoster),
        G: common_vendor.o((...args) => common_vendor.unref(manualPlayVideo) && common_vendor.unref(manualPlayVideo)(...args), "c3")
      } : {}, {
        H: common_vendor.unref(playbackErrorVisible)
      }, common_vendor.unref(playbackErrorVisible) ? {
        I: common_vendor.t(common_vendor.unref(playbackErrorText) || "播放失败，请重试"),
        J: common_vendor.o((...args) => common_vendor.unref(retryPlayback) && common_vendor.unref(retryPlayback)(...args), "e8")
      } : {}, {
        K: isLiveLandscapeStyle.value && common_vendor.unref(hasVisibleWatchRewardTasks)
      }, isLiveLandscapeStyle.value && common_vendor.unref(hasVisibleWatchRewardTasks) ? {
        L: common_assets._imports_0$11,
        M: common_vendor.t(common_vendor.unref(watchRewardEntryLabel) || "领取"),
        N: common_vendor.o((...args) => common_vendor.unref(openWatchRewardPanel) && common_vendor.unref(openWatchRewardPanel)(...args), "88")
      } : {}, {
        O: isLiveLandscapeStyle.value
      }, isLiveLandscapeStyle.value ? common_vendor.e({
        P: common_vendor.unref(pushStatus) === 1
      }, common_vendor.unref(pushStatus) === 1 ? {} : {}, {
        Q: common_assets._imports_1$4,
        R: common_vendor.o(toggleFullscreen, "58"),
        S: isLiveLandscapeStyle.value
      }, isLiveLandscapeStyle.value ? {
        T: stageCollapsed.value ? 1 : "",
        U: common_assets._imports_2$2,
        V: common_vendor.o(toggleCollapse, "a0")
      } : {}) : {}, {
        W: stageCollapsed.value
      }, stageCollapsed.value ? {
        X: common_vendor.o(closeMiniWindow, "89"),
        Y: common_vendor.o(() => {
        }, "fd"),
        Z: common_vendor.unref(isMuted) ? "/static/icons/competitor-live/icon-volume-off.svg" : "/static/icons/competitor-live/icon-volume-on.svg",
        aa: common_vendor.o((...args) => common_vendor.unref(toggleMute) && common_vendor.unref(toggleMute)(...args), "2b"),
        ab: common_vendor.o(() => {
        }, "1a"),
        ac: common_vendor.o(() => {
        }, "61"),
        ad: common_vendor.o(() => {
        }, "a9")
      } : {}, {
        ae: miniHidden.value && stageCollapsed.value ? 1 : "",
        af: isFakeFullscreen.value ? 1 : "",
        ag: common_vendor.unref(isPlaying) || common_vendor.unref(videoFrameReady) ? 1 : "",
        ah: common_vendor.s(miniWindowStyle.value),
        ai: common_vendor.o(onMiniDragStart, "10"),
        aj: common_vendor.o(onMiniDragMove, "5a"),
        ak: common_vendor.o(onMiniDragEnd, "2c"),
        al: common_vendor.o(onMiniDragEnd, "93"),
        am: common_vendor.unref(anchorAvatar),
        an: common_vendor.t(common_vendor.unref(anchorName)),
        ao: isLiveLandscapeStyle.value
      }, isLiveLandscapeStyle.value ? {
        ap: common_assets._imports_3
      } : {}, {
        aq: common_vendor.t(common_vendor.unref(displayViewerCount)),
        ar: !common_vendor.unref(anchorName) ? 1 : "",
        as: common_vendor.unref(roomGroupType) !== 1 && common_vendor.unref(roomSetting).showStatus !== 0
      }, common_vendor.unref(roomGroupType) !== 1 && common_vendor.unref(roomSetting).showStatus !== 0 ? common_vendor.e({
        at: common_vendor.unref(pushStatus) === 1 && !common_vendor.unref(isReplay)
      }, common_vendor.unref(pushStatus) === 1 && !common_vendor.unref(isReplay) ? {} : {}, {
        av: common_vendor.t(isLiveLandscapeStyle.value ? common_vendor.unref(liveLandscapeStatusText) : liveStatusLabel.value),
        aw: common_vendor.n(liveStatusClass.value)
      }) : {}, {
        ax: isLiveLandscapeStyle.value
      }, isLiveLandscapeStyle.value ? common_vendor.e({
        ay: common_assets._imports_4,
        az: common_vendor.o((...args) => common_vendor.unref(goReport) && common_vendor.unref(goReport)(...args), "ad"),
        aA: common_assets._imports_5,
        aB: common_vendor.o((...args) => common_vendor.unref(toggleCenter) && common_vendor.unref(toggleCenter)(...args), "1e"),
        aC: common_vendor.unref(roomSetting).showViewerData !== 0
      }, common_vendor.unref(roomSetting).showViewerData !== 0 ? {
        aD: common_assets._imports_3,
        aE: common_vendor.t(common_vendor.unref(displayViewerCount)),
        aF: common_vendor.unref(viewerCountAnimating) ? 1 : ""
      } : {}) : {}, {
        aG: !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl))
      }, !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl)) ? common_vendor.e({
        aH: common_vendor.unref(roomSetting).showViewerData !== 0
      }, common_vendor.unref(roomSetting).showViewerData !== 0 ? common_vendor.e({
        aI: common_assets._imports_2$3,
        aJ: isLiveLandscapeStyle.value
      }, isLiveLandscapeStyle.value ? {
        aK: common_assets._imports_3
      } : {}, {
        aL: common_vendor.t(common_vendor.unref(displayViewerCount)),
        aM: common_vendor.unref(viewerCountAnimating) ? 1 : ""
      }) : {}, {
        aN: common_assets._imports_3$1,
        aO: common_vendor.o((...args) => common_vendor.unref(goReport) && common_vendor.unref(goReport)(...args), "7e")
      }) : {}, {
        aP: !stageCollapsed.value,
        aQ: !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl)) && !anyBusinessPopupOpen.value
      }, !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl)) && !anyBusinessPopupOpen.value ? {
        aR: common_vendor.o(common_vendor.unref(openCommentPrizeRuleModal), "3e"),
        aS: common_vendor.o(common_vendor.unref(openWatchRewardPanel), "e4"),
        aT: common_vendor.p({
          ["comment-lottery-visible"]: showLandscapeCommentLotteryEntry.value,
          keyword: common_vendor.unref(commentLotteryEntryKeyword),
          ["bubble-visible"]: common_vendor.unref(commentLotteryBubbleVisible),
          ["watch-reward-visible"]: !isLiveLandscapeStyle.value && common_vendor.unref(hasVisibleWatchRewardTasks),
          ["watch-reward-label"]: common_vendor.unref(watchRewardEntryLabel)
        })
      } : {}, {
        aU: stageCollapsed.value
      }, stageCollapsed.value ? {
        aV: common_assets._imports_3,
        aW: common_vendor.t(common_vendor.unref(displayViewerCount)),
        aX: common_assets._imports_2$2,
        aY: common_vendor.o(toggleCollapse, "96"),
        aZ: common_vendor.o(() => {
        }, "c7")
      } : {}, {
        ba: common_vendor.unref(roomSetting).enableChat !== 0
      }, common_vendor.unref(roomSetting).enableChat !== 0 ? {
        bb: common_vendor.p({
          title: landscapeInteractTitle.value,
          name: "0"
        })
      } : {}, {
        bc: common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled)
      }, common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled) ? {
        bd: common_vendor.p({
          title: "签到",
          name: "2"
        })
      } : {}, {
        be: common_vendor.unref(roomSetting).showProduct !== 0
      }, common_vendor.unref(roomSetting).showProduct !== 0 ? {
        bf: common_vendor.p({
          title: landscapeProductTitle.value,
          name: "1"
        })
      } : {}, {
        bg: common_vendor.o(common_vendor.unref(setActiveTabIndex), "49"),
        bh: common_vendor.o(common_vendor.unref(onTabChange), "93"),
        bi: common_vendor.p({
          ["model-value"]: common_vendor.unref(activeTabIndex),
          color: "#000000",
          ["inactive-color"]: "#7f7f7f"
        }),
        bj: common_vendor.unref(showLandscapeSubscribe)
      }, common_vendor.unref(showLandscapeSubscribe) ? {
        bk: common_vendor.o((...args) => common_vendor.unref(onSubscribePush) && common_vendor.unref(onSubscribePush)(...args), "bd")
      } : {}, {
        bl: common_vendor.unref(showLandscapeSubscribe) ? 1 : "",
        bm: common_vendor.unref(roomSetting).enableChat !== 0
      }, common_vendor.unref(roomSetting).enableChat !== 0 ? common_vendor.e({
        bn: common_vendor.p({
          ["room-setting"]: common_vendor.unref(roomSetting),
          variant: "landscape"
        }),
        bo: common_vendor.unref(pinnedMessage)
      }, common_vendor.unref(pinnedMessage) ? {
        bp: common_vendor.unref(pinnedMessage).avatar || common_vendor.unref(defaultAvatar),
        bq: common_vendor.t(common_vendor.unref(pinnedMessage).nick),
        br: common_vendor.t(common_vendor.unref(pinnedMessage).content)
      } : {}, {
        bs: common_vendor.unref(shouldShowComments)
      }, common_vendor.unref(shouldShowComments) ? {
        bt: common_vendor.f(common_vendor.unref(visibleMessages), (msg, k0, i0) => {
          return common_vendor.e({
            a: msg.type !== "lottery_win"
          }, msg.type !== "lottery_win" ? {
            b: msg.avatar || common_vendor.unref(defaultAvatar)
          } : {}, {
            c: msg.type !== "lottery_win"
          }, msg.type !== "lottery_win" ? common_vendor.e({
            d: msg.isAdmin
          }, msg.isAdmin ? {} : {}, {
            e: common_vendor.t(msg.nick)
          }) : {}, {
            f: msg.type === "lottery_win"
          }, msg.type === "lottery_win" ? {
            g: msg.icon,
            h: common_vendor.t(msg.nick),
            i: common_vendor.t(msg.prizeName)
          } : {}, {
            j: msg.type !== "lottery_win"
          }, msg.type !== "lottery_win" ? {
            k: common_vendor.t(msg.content),
            l: common_vendor.n(msg.type === "gift" ? "gift-text" : "")
          } : {}, {
            m: common_vendor.n(msg.type === "gift" ? "gift-bubble" : ""),
            n: common_vendor.n(msg.type === "lottery_win" ? "lottery-win-landscape-bubble" : ""),
            o: msg._visibleIndex,
            p: "msg-" + msg._visibleIndex,
            q: common_vendor.n(msg.type === "lottery_win" ? "comment-item--lottery-win" : "")
          });
        }),
        bv: !common_vendor.unref(inputFocused),
        bw: common_vendor.unref(scrollToId),
        bx: common_vendor.unref(commentScrollWithAnimation),
        by: common_vendor.o((...args) => common_vendor.unref(handleCommentWindowScroll) && common_vendor.unref(handleCommentWindowScroll)(...args), "56")
      } : {}, {
        bz: common_vendor.unref(activeTab) === "interact",
        bA: common_vendor.s(common_vendor.unref(commentListStyle))
      }) : {}, {
        bB: common_vendor.o(common_vendor.unref(onProductBuy), "00"),
        bC: common_vendor.o(common_vendor.unref(onProductDetail), "e5"),
        bD: common_vendor.o(($event) => common_vendor.unref(loadProductList)(), "39"),
        bE: common_vendor.p({
          mode: "landscape-list",
          ["product-list"]: common_vendor.unref(productList),
          ["product-loading"]: common_vendor.unref(productLoading),
          ["product-finished"]: common_vendor.unref(productFinished),
          ["success-notice"]: common_vendor.unref(productListSuccessNotice)
        }),
        bF: common_vendor.unref(activeTab) === "products",
        bG: common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled)
      }, common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled) ? {
        bH: common_vendor.o(common_vendor.unref(onSignedDone), "9b"),
        bI: common_vendor.o(($event) => {
          common_vendor.unref(setActiveTab)("interact");
          common_vendor.unref(setActiveTabIndex)("0");
        }, "9b"),
        bJ: common_vendor.p({
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
          ["show-welcome-text"]: false,
          ["show-skip"]: false,
          ["submit-text"]: "提交"
        }),
        bK: common_vendor.unref(activeTab) === "sign"
      } : {}, {
        bL: common_vendor.unref(roomSetting).enableChat !== 0 && common_vendor.unref(muteTipVisible) && common_vendor.unref(activeTab) === "interact"
      }, common_vendor.unref(roomSetting).enableChat !== 0 && common_vendor.unref(muteTipVisible) && common_vendor.unref(activeTab) === "interact" ? {
        bM: common_vendor.t(common_vendor.unref(userBlocked) ? "您已被拉黑，无法参与互动" : common_vendor.unref(muteRemainText) ? `您已被禁言，剩余${common_vendor.unref(muteRemainText)}` : "您已被禁言")
      } : {}, {
        bN: common_vendor.o(($event) => common_vendor.unref(setShowProduct)($event), "d5"),
        bO: common_vendor.o(common_vendor.unref(onProductCardChange), "47"),
        bP: common_vendor.o(common_vendor.unref(onProductBuy), "0f"),
        bQ: common_vendor.p({
          mode: "landscape-anchor",
          ["show-product"]: common_vendor.unref(showProduct),
          ["current-product"]: common_vendor.unref(currentProduct),
          ["product-card-items"]: common_vendor.unref(productCardItems),
          ["product-card-active-index"]: common_vendor.unref(productCardActiveIndex),
          ["show-hot-sale"]: Number(common_vendor.unref(roomSetting).showHotSale ?? 1) === 1
        }),
        bR: common_vendor.sr(landscapeInputRef, "cecf1cb1-9", {
          "k": "landscapeInputRef"
        }),
        bS: common_vendor.o(common_vendor.unref(focusInput), "0f"),
        bT: common_vendor.o(common_vendor.unref(setInputText), "4c"),
        bU: common_vendor.o(common_vendor.unref(onInputFocus), "3b"),
        bV: common_vendor.o(common_vendor.unref(handleSendClick), "91"),
        bW: common_vendor.o(common_vendor.unref(onInputBlur), "04"),
        bX: common_vendor.o(common_vendor.unref(handleSendClick), "da"),
        bY: common_vendor.o(common_vendor.unref(toggleCenter), "18"),
        bZ: common_vendor.o(common_vendor.unref(doLike), "eb"),
        ca: common_vendor.o(common_vendor.unref(finishHeartAnimation), "1f"),
        cb: common_vendor.o(handleQuickReply, "30"),
        cc: common_vendor.o(($event) => common_vendor.unref(setShowShare)(true), "65"),
        cd: common_vendor.p({
          ["model-value"]: common_vendor.unref(inputText),
          variant: "landscape",
          visible: common_vendor.unref(roomSetting).enableChat !== 0 && !common_vendor.unref(isWaitingSchedule),
          show: common_vendor.unref(activeTab) === "interact",
          focused: common_vendor.unref(inputFocused),
          ["disabled-text"]: common_vendor.unref(chatDisabled),
          ["bottom-style"]: common_vendor.unref(bottomBarStyle),
          ["room-setting"]: common_vendor.unref(roomSetting),
          ["live-toolbar"]: isLiveLandscapeStyle.value,
          hearts: common_vendor.unref(hearts),
          ["like-count"]: common_vendor.unref(likeCount),
          ["quick-replies"]: common_vendor.unref(quickReplies),
          ["is-distributor"]: common_vendor.unref(isDistributor),
          ["distributor-status"]: common_vendor.unref(distributorStatus)
        }),
        ce: common_vendor.unref(renderSharePopup)
      }, common_vendor.unref(renderSharePopup) ? {
        cf: common_vendor.o(($event) => common_vendor.unref(setShowShare)(false), "9e"),
        cg: common_vendor.o(common_vendor.unref(onShareAction), "88"),
        ch: common_vendor.p({
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
        ci: common_vendor.unref(renderBuyPopup)
      }, common_vendor.unref(renderBuyPopup) ? {
        cj: common_vendor.o(($event) => common_vendor.unref(setShowBuyPopup)(false), "28"),
        ck: common_vendor.o(common_vendor.unref(openBuyAddressPopup), "bd"),
        cl: common_vendor.o(($event) => common_vendor.unref(setBuyRemark)($event), "20"),
        cm: common_vendor.o(common_vendor.unref(onBuyQuantityChange), "de"),
        cn: common_vendor.o(common_vendor.unref(onBuySkuChange), "78"),
        co: common_vendor.o(common_vendor.unref(onBuyCouponSelect), "b2"),
        cp: common_vendor.o(common_vendor.unref(onBuyConfirm), "be"),
        cq: common_vendor.p({
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
        cr: common_vendor.unref(renderAddressPopup)
      }, common_vendor.unref(renderAddressPopup) ? {
        cs: common_vendor.o(common_vendor.unref(onSelectBuyAddress), "fc"),
        ct: common_vendor.o(common_vendor.unref(onAddBuyAddress), "6c"),
        cv: common_vendor.o(common_vendor.unref(onEditBuyAddress), "57"),
        cw: common_vendor.o(common_vendor.unref(onAddBuyAddress), "14"),
        cx: common_vendor.o(common_vendor.unref(onDeleteBuyAddress), "2a"),
        cy: common_vendor.o(common_vendor.unref(onImportWxAddress), "ff"),
        cz: common_vendor.p({
          list: common_vendor.unref(addressList),
          ["selected-id"]: common_vendor.unref(selectedAddressId),
          title: "地址管理",
          ["button-text"]: "新增",
          ["show-default-row"]: false,
          ["button-disabled"]: false
        }),
        cA: common_vendor.o(($event) => common_vendor.unref(setShowAddressPopup)(false), "99"),
        cB: common_vendor.p({
          visible: common_vendor.unref(showAddressPopup),
          height: common_vendor.unref(addressList).length === 0 ? "52vh" : "78vh",
          radius: "24rpx 24rpx 0 0",
          duration: 500,
          ["z-index"]: BUY_POPUP_Z_INDEX + 2,
          ["with-mask"]: true,
          ["mask-color"]: "rgba(0, 0, 0, 0.35)"
        })
      } : {}, {
        cC: common_vendor.unref(renderAddressFormPopup)
      }, common_vendor.unref(renderAddressFormPopup) ? {
        cD: common_vendor.o(($event) => common_vendor.unref(setShowAddressFormPopup)(false), "b0"),
        cE: common_vendor.o(common_vendor.unref(onBuyAddressSaved), "4e"),
        cF: common_vendor.p({
          visible: common_vendor.unref(showAddressFormPopup),
          ["edit-data"]: common_vendor.unref(editAddressData),
          ["popup-height"]: "78vh",
          ["z-index"]: BUY_POPUP_Z_INDEX + 4
        })
      } : {}, {
        cG: common_vendor.unref(renderCenterPopup)
      }, common_vendor.unref(renderCenterPopup) ? {
        cH: common_vendor.o(($event) => common_vendor.unref(setShowCenterPopup)(false), "c3"),
        cI: common_vendor.o(common_vendor.unref(onCenterAction), "57"),
        cJ: common_vendor.p({
          visible: common_vendor.unref(showCenterPopup),
          name: common_vendor.unref(centerPopupName),
          ["show-close"]: false,
          avatar: common_vendor.unref(centerPopupAvatar),
          ["order-stats"]: common_vendor.unref(centerPopupOrderStats),
          ["is-distributor"]: common_vendor.unref(isDistributor),
          ["distributor-status"]: common_vendor.unref(distributorStatus),
          ["enable-share"]: common_vendor.unref(roomSetting).enableShare
        })
      } : {}, {
        cK: common_vendor.unref(enterNotice).visible && !common_vendor.unref(shouldShowEntryOverlay)
      }, common_vendor.unref(enterNotice).visible && !common_vendor.unref(shouldShowEntryOverlay) ? common_vendor.e({
        cL: common_vendor.unref(enterNotice).noticeType === "leave"
      }, common_vendor.unref(enterNotice).noticeType === "leave" ? {
        cM: common_vendor.t(common_vendor.unref(enterNotice).nick)
      } : {
        cN: common_vendor.t(common_vendor.unref(enterNotice).nick)
      }, {
        cO: common_vendor.unref(enterNotice).key,
        cP: common_vendor.unref(enterNotice).leaving ? 1 : ""
      }) : {}, {
        cQ: common_vendor.unref(buyingNotice).visible
      }, common_vendor.unref(buyingNotice).visible ? common_vendor.e({
        cR: common_assets._imports_0$12,
        cS: common_vendor.t(common_vendor.unref(buyingNotice).nick),
        cT: common_vendor.unref(buyingNotice).count > 1
      }, common_vendor.unref(buyingNotice).count > 1 ? {
        cU: common_vendor.t(common_vendor.unref(buyingNotice).count)
      } : {}, {
        cV: common_vendor.t(common_vendor.unref(buyingNotice).noticeText || "正在去购买"),
        cW: common_vendor.unref(buyingNotice).key,
        cX: common_vendor.unref(buyingNotice).leaving ? 1 : ""
      }) : {}, {
        cY: common_vendor.unref(goShoppingNotice).visible
      }, common_vendor.unref(goShoppingNotice).visible ? common_vendor.e({
        cZ: common_vendor.unref(goShoppingNotice).productImage
      }, common_vendor.unref(goShoppingNotice).productImage ? {
        da: common_vendor.unref(goShoppingNotice).productImage
      } : {}, {
        db: common_vendor.t(common_vendor.unref(goShoppingNotice).nick),
        dc: common_vendor.t(common_vendor.unref(goShoppingNotice).count > 1 ? `等${common_vendor.unref(goShoppingNotice).count}人在购买` : common_vendor.unref(goShoppingNotice).noticeText || "正在去购买"),
        dd: common_vendor.unref(goShoppingNotice).productName
      }, common_vendor.unref(goShoppingNotice).productName ? {
        de: common_vendor.t(common_vendor.unref(goShoppingNotice).productName)
      } : {}, {
        df: common_vendor.unref(goShoppingNotice).key,
        dg: common_vendor.unref(goShoppingNotice).leaving ? 1 : ""
      }) : {}, {
        dh: common_vendor.o(common_vendor.unref(enterLive), "70"),
        di: common_vendor.p({
          show: common_vendor.unref(shouldShowEntryOverlay),
          landscape: true
        }),
        dj: common_vendor.unref(renderLiveReportPopup)
      }, common_vendor.unref(renderLiveReportPopup) ? {
        dk: common_vendor.o(common_vendor.unref(setShowLiveReportPopup), "25"),
        dl: common_vendor.p({
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
        dm: common_vendor.unref(activeTab) === "products" ? 1 : "",
        dn: common_vendor.unref(isLiveVisualMode) ? 1 : "",
        dp: common_vendor.unref(isLiveVisualMode) ? 1 : "",
        dq: !common_vendor.unref(isLiveVisualMode) ? 1 : "",
        dr: stageCollapsed.value ? 1 : "",
        ds: common_vendor.s(landscapeBottomStyle.value)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cecf1cb1"]]);
wx.createComponent(Component);
