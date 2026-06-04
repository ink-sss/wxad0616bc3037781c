"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_broadcast_utils_entryFormat = require("../utils/entry-format.js");
const pages_broadcast_utils_livePlayerStatus = require("../utils/live-player-status.js");
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
      if (pages_broadcast_utils_livePlayerStatus.LIVE_PLAYER_READY_CODES.includes(code)) {
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
      if (pages_broadcast_utils_livePlayerStatus.hasLivePlayerNetActivity(info)) {
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
        L: common_vendor.t(common_vendor.unref(watchRewardEntryLabel) || "领取"),
        M: common_vendor.o((...args) => common_vendor.unref(openWatchRewardPanel) && common_vendor.unref(openWatchRewardPanel)(...args), "88")
      } : {}, {
        N: isLiveLandscapeStyle.value
      }, isLiveLandscapeStyle.value ? common_vendor.e({
        O: common_vendor.unref(pushStatus) === 1
      }, common_vendor.unref(pushStatus) === 1 ? {} : {}, {
        P: common_vendor.o(toggleFullscreen, "2c"),
        Q: isLiveLandscapeStyle.value
      }, isLiveLandscapeStyle.value ? {
        R: stageCollapsed.value ? 1 : "",
        S: common_vendor.o(toggleCollapse, "5e")
      } : {}) : {}, {
        T: stageCollapsed.value
      }, stageCollapsed.value ? {
        U: common_vendor.o(closeMiniWindow, "41"),
        V: common_vendor.o(() => {
        }, "1c"),
        W: common_vendor.unref(isMuted) ? "https://man.lqjy.cc/static/icons/competitor-live/icon-volume-off.svg" : "https://man.lqjy.cc/static/icons/competitor-live/icon-volume-on.svg",
        X: common_vendor.o((...args) => common_vendor.unref(toggleMute) && common_vendor.unref(toggleMute)(...args), "ff"),
        Y: common_vendor.o(() => {
        }, "a4"),
        Z: common_vendor.o(() => {
        }, "85"),
        aa: common_vendor.o(() => {
        }, "a4")
      } : {}, {
        ab: miniHidden.value && stageCollapsed.value ? 1 : "",
        ac: isFakeFullscreen.value ? 1 : "",
        ad: common_vendor.unref(isPlaying) || common_vendor.unref(videoFrameReady) ? 1 : "",
        ae: common_vendor.s(miniWindowStyle.value),
        af: common_vendor.o(onMiniDragStart, "10"),
        ag: common_vendor.o(onMiniDragMove, "5a"),
        ah: common_vendor.o(onMiniDragEnd, "2c"),
        ai: common_vendor.o(onMiniDragEnd, "93"),
        aj: common_vendor.unref(anchorAvatar),
        ak: common_vendor.t(common_vendor.unref(anchorName)),
        al: common_vendor.t(common_vendor.unref(displayViewerCount)),
        am: !common_vendor.unref(anchorName) ? 1 : "",
        an: common_vendor.unref(roomGroupType) !== 1 && common_vendor.unref(roomSetting).showStatus !== 0
      }, common_vendor.unref(roomGroupType) !== 1 && common_vendor.unref(roomSetting).showStatus !== 0 ? common_vendor.e({
        ao: common_vendor.unref(pushStatus) === 1 && !common_vendor.unref(isReplay)
      }, common_vendor.unref(pushStatus) === 1 && !common_vendor.unref(isReplay) ? {} : {}, {
        ap: common_vendor.t(isLiveLandscapeStyle.value ? common_vendor.unref(liveLandscapeStatusText) : liveStatusLabel.value),
        aq: common_vendor.n(liveStatusClass.value)
      }) : {}, {
        ar: isLiveLandscapeStyle.value
      }, isLiveLandscapeStyle.value ? common_vendor.e({
        as: common_vendor.o((...args) => common_vendor.unref(goReport) && common_vendor.unref(goReport)(...args), "26"),
        at: common_vendor.o((...args) => common_vendor.unref(toggleCenter) && common_vendor.unref(toggleCenter)(...args), "af"),
        av: common_vendor.unref(roomSetting).showViewerData !== 0
      }, common_vendor.unref(roomSetting).showViewerData !== 0 ? {
        aw: common_vendor.t(common_vendor.unref(displayViewerCount)),
        ax: common_vendor.unref(viewerCountAnimating) ? 1 : ""
      } : {}) : {}, {
        ay: !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl))
      }, !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl)) ? common_vendor.e({
        az: common_vendor.unref(roomSetting).showViewerData !== 0
      }, common_vendor.unref(roomSetting).showViewerData !== 0 ? {
        aA: common_vendor.t(common_vendor.unref(displayViewerCount)),
        aB: common_vendor.unref(viewerCountAnimating) ? 1 : ""
      } : {}, {
        aC: common_vendor.o((...args) => common_vendor.unref(goReport) && common_vendor.unref(goReport)(...args), "5d")
      }) : {}, {
        aD: !stageCollapsed.value,
        aE: !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl)) && !anyBusinessPopupOpen.value
      }, !(common_vendor.unref(isWaitingSchedule) && common_vendor.unref(warmUpVideoUrl)) && !anyBusinessPopupOpen.value ? {
        aF: common_vendor.o(common_vendor.unref(openCommentPrizeRuleModal), "2c"),
        aG: common_vendor.o(common_vendor.unref(openWatchRewardPanel), "ff"),
        aH: common_vendor.p({
          ["comment-lottery-visible"]: showLandscapeCommentLotteryEntry.value,
          keyword: common_vendor.unref(commentLotteryEntryKeyword),
          ["bubble-visible"]: common_vendor.unref(commentLotteryBubbleVisible),
          ["watch-reward-visible"]: !isLiveLandscapeStyle.value && common_vendor.unref(hasVisibleWatchRewardTasks),
          ["watch-reward-label"]: common_vendor.unref(watchRewardEntryLabel)
        })
      } : {}, {
        aI: stageCollapsed.value
      }, stageCollapsed.value ? {
        aJ: common_vendor.t(common_vendor.unref(displayViewerCount)),
        aK: common_vendor.o(toggleCollapse, "b3"),
        aL: common_vendor.o(() => {
        }, "74")
      } : {}, {
        aM: common_vendor.unref(roomSetting).enableChat !== 0
      }, common_vendor.unref(roomSetting).enableChat !== 0 ? {
        aN: common_vendor.p({
          title: landscapeInteractTitle.value,
          name: "0"
        })
      } : {}, {
        aO: common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled)
      }, common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled) ? {
        aP: common_vendor.p({
          title: "签到",
          name: "2"
        })
      } : {}, {
        aQ: common_vendor.unref(roomSetting).showProduct !== 0
      }, common_vendor.unref(roomSetting).showProduct !== 0 ? {
        aR: common_vendor.p({
          title: landscapeProductTitle.value,
          name: "1"
        })
      } : {}, {
        aS: common_vendor.o(common_vendor.unref(setActiveTabIndex), "0e"),
        aT: common_vendor.o(common_vendor.unref(onTabChange), "55"),
        aU: common_vendor.p({
          ["model-value"]: common_vendor.unref(activeTabIndex),
          color: "#000000",
          ["inactive-color"]: "#7f7f7f"
        }),
        aV: common_vendor.unref(showLandscapeSubscribe)
      }, common_vendor.unref(showLandscapeSubscribe) ? {
        aW: common_vendor.o((...args) => common_vendor.unref(onSubscribePush) && common_vendor.unref(onSubscribePush)(...args), "f7")
      } : {}, {
        aX: common_vendor.unref(showLandscapeSubscribe) ? 1 : "",
        aY: common_vendor.unref(roomSetting).enableChat !== 0
      }, common_vendor.unref(roomSetting).enableChat !== 0 ? common_vendor.e({
        aZ: common_vendor.p({
          ["room-setting"]: common_vendor.unref(roomSetting),
          variant: "landscape"
        }),
        ba: common_vendor.unref(pinnedMessage)
      }, common_vendor.unref(pinnedMessage) ? {
        bb: common_vendor.unref(pinnedMessage).avatar || common_vendor.unref(defaultAvatar),
        bc: common_vendor.t(common_vendor.unref(pinnedMessage).nick),
        bd: common_vendor.t(common_vendor.unref(pinnedMessage).content)
      } : {}, {
        be: common_vendor.unref(shouldShowComments)
      }, common_vendor.unref(shouldShowComments) ? {
        bf: common_vendor.f(common_vendor.unref(visibleMessages), (msg, k0, i0) => {
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
        bg: !common_vendor.unref(inputFocused),
        bh: common_vendor.unref(scrollToId),
        bi: common_vendor.unref(commentScrollWithAnimation),
        bj: common_vendor.o((...args) => common_vendor.unref(handleCommentWindowScroll) && common_vendor.unref(handleCommentWindowScroll)(...args), "4b")
      } : {}, {
        bk: common_vendor.unref(activeTab) === "interact",
        bl: common_vendor.s(common_vendor.unref(commentListStyle))
      }) : {}, {
        bm: common_vendor.o(common_vendor.unref(onProductBuy), "37"),
        bn: common_vendor.o(common_vendor.unref(onProductDetail), "8f"),
        bo: common_vendor.o(($event) => common_vendor.unref(loadProductList)(), "b7"),
        bp: common_vendor.p({
          mode: "landscape-list",
          ["product-list"]: common_vendor.unref(productList),
          ["product-loading"]: common_vendor.unref(productLoading),
          ["product-finished"]: common_vendor.unref(productFinished),
          ["success-notice"]: common_vendor.unref(productListSuccessNotice)
        }),
        bq: common_vendor.unref(activeTab) === "products",
        br: common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled)
      }, common_vendor.unref(isTruthyFlag)(common_vendor.unref(signConfig).enabled) ? {
        bs: common_vendor.o(common_vendor.unref(onSignedDone), "09"),
        bt: common_vendor.o(($event) => {
          common_vendor.unref(setActiveTab)("interact");
          common_vendor.unref(setActiveTabIndex)("0");
        }, "b9"),
        bv: common_vendor.p({
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
        bw: common_vendor.unref(activeTab) === "sign"
      } : {}, {
        bx: common_vendor.unref(roomSetting).enableChat !== 0 && common_vendor.unref(muteTipVisible) && common_vendor.unref(activeTab) === "interact"
      }, common_vendor.unref(roomSetting).enableChat !== 0 && common_vendor.unref(muteTipVisible) && common_vendor.unref(activeTab) === "interact" ? {
        by: common_vendor.t(common_vendor.unref(userBlocked) ? "您已被拉黑，无法参与互动" : common_vendor.unref(muteRemainText) ? `您已被禁言，剩余${common_vendor.unref(muteRemainText)}` : "您已被禁言")
      } : {}, {
        bz: common_vendor.o(($event) => common_vendor.unref(setShowProduct)($event), "7f"),
        bA: common_vendor.o(common_vendor.unref(onProductCardChange), "f9"),
        bB: common_vendor.o(common_vendor.unref(onProductBuy), "64"),
        bC: common_vendor.p({
          mode: "landscape-anchor",
          ["show-product"]: common_vendor.unref(showProduct),
          ["current-product"]: common_vendor.unref(currentProduct),
          ["product-card-items"]: common_vendor.unref(productCardItems),
          ["product-card-active-index"]: common_vendor.unref(productCardActiveIndex),
          ["show-hot-sale"]: Number(common_vendor.unref(roomSetting).showHotSale ?? 1) === 1
        }),
        bD: common_vendor.sr(landscapeInputRef, "cecf1cb1-9", {
          "k": "landscapeInputRef"
        }),
        bE: common_vendor.o(common_vendor.unref(focusInput), "70"),
        bF: common_vendor.o(common_vendor.unref(setInputText), "b9"),
        bG: common_vendor.o(common_vendor.unref(onInputFocus), "dc"),
        bH: common_vendor.o(common_vendor.unref(handleSendClick), "d9"),
        bI: common_vendor.o(common_vendor.unref(onInputBlur), "27"),
        bJ: common_vendor.o(common_vendor.unref(handleSendClick), "9e"),
        bK: common_vendor.o(common_vendor.unref(toggleCenter), "4a"),
        bL: common_vendor.o(common_vendor.unref(doLike), "7b"),
        bM: common_vendor.o(common_vendor.unref(finishHeartAnimation), "c9"),
        bN: common_vendor.o(handleQuickReply, "ff"),
        bO: common_vendor.o(($event) => common_vendor.unref(setShowShare)(true), "a8"),
        bP: common_vendor.p({
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
        bQ: common_vendor.unref(renderSharePopup)
      }, common_vendor.unref(renderSharePopup) ? {
        bR: common_vendor.o(($event) => common_vendor.unref(setShowShare)(false), "50"),
        bS: common_vendor.o(common_vendor.unref(onShareAction), "52"),
        bT: common_vendor.p({
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
        bU: common_vendor.unref(renderBuyPopup)
      }, common_vendor.unref(renderBuyPopup) ? {
        bV: common_vendor.o(($event) => common_vendor.unref(setShowBuyPopup)(false), "dd"),
        bW: common_vendor.o(common_vendor.unref(openBuyAddressPopup), "89"),
        bX: common_vendor.o(($event) => common_vendor.unref(setBuyRemark)($event), "f4"),
        bY: common_vendor.o(common_vendor.unref(onBuyQuantityChange), "bb"),
        bZ: common_vendor.o(common_vendor.unref(onBuySkuChange), "9e"),
        ca: common_vendor.o(common_vendor.unref(onBuyCouponSelect), "8e"),
        cb: common_vendor.o(common_vendor.unref(onBuyConfirm), "aa"),
        cc: common_vendor.p({
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
        cd: common_vendor.unref(renderAddressPopup)
      }, common_vendor.unref(renderAddressPopup) ? {
        ce: common_vendor.o(common_vendor.unref(onSelectBuyAddress), "f4"),
        cf: common_vendor.o(common_vendor.unref(onAddBuyAddress), "c0"),
        cg: common_vendor.o(common_vendor.unref(onEditBuyAddress), "90"),
        ch: common_vendor.o(common_vendor.unref(onAddBuyAddress), "b6"),
        ci: common_vendor.o(common_vendor.unref(onDeleteBuyAddress), "25"),
        cj: common_vendor.o(common_vendor.unref(onImportWxAddress), "af"),
        ck: common_vendor.p({
          list: common_vendor.unref(addressList),
          ["selected-id"]: common_vendor.unref(selectedAddressId),
          title: "地址管理",
          ["button-text"]: "新增",
          ["show-default-row"]: false,
          ["button-disabled"]: false
        }),
        cl: common_vendor.o(($event) => common_vendor.unref(setShowAddressPopup)(false), "0a"),
        cm: common_vendor.p({
          visible: common_vendor.unref(showAddressPopup),
          height: common_vendor.unref(addressList).length === 0 ? "52vh" : "78vh",
          radius: "24rpx 24rpx 0 0",
          duration: 500,
          ["z-index"]: BUY_POPUP_Z_INDEX + 2,
          ["with-mask"]: true,
          ["mask-color"]: "rgba(0, 0, 0, 0.35)"
        })
      } : {}, {
        cn: common_vendor.unref(renderAddressFormPopup)
      }, common_vendor.unref(renderAddressFormPopup) ? {
        co: common_vendor.o(($event) => common_vendor.unref(setShowAddressFormPopup)(false), "b9"),
        cp: common_vendor.o(common_vendor.unref(onBuyAddressSaved), "5e"),
        cq: common_vendor.p({
          visible: common_vendor.unref(showAddressFormPopup),
          ["edit-data"]: common_vendor.unref(editAddressData),
          ["popup-height"]: "78vh",
          ["z-index"]: BUY_POPUP_Z_INDEX + 4
        })
      } : {}, {
        cr: common_vendor.unref(renderCenterPopup)
      }, common_vendor.unref(renderCenterPopup) ? {
        cs: common_vendor.o(($event) => common_vendor.unref(setShowCenterPopup)(false), "60"),
        ct: common_vendor.o(common_vendor.unref(onCenterAction), "41"),
        cv: common_vendor.p({
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
        cw: common_vendor.unref(enterNotice).visible && !common_vendor.unref(shouldShowEntryOverlay)
      }, common_vendor.unref(enterNotice).visible && !common_vendor.unref(shouldShowEntryOverlay) ? common_vendor.e({
        cx: common_vendor.unref(enterNotice).noticeType === "leave"
      }, common_vendor.unref(enterNotice).noticeType === "leave" ? {
        cy: common_vendor.t(common_vendor.unref(enterNotice).nick)
      } : {
        cz: common_vendor.t(common_vendor.unref(enterNotice).nick)
      }, {
        cA: common_vendor.unref(enterNotice).key,
        cB: common_vendor.unref(enterNotice).leaving ? 1 : ""
      }) : {}, {
        cC: common_vendor.unref(buyingNotice).visible
      }, common_vendor.unref(buyingNotice).visible ? common_vendor.e({
        cD: common_vendor.t(common_vendor.unref(buyingNotice).nick),
        cE: common_vendor.unref(buyingNotice).count > 1
      }, common_vendor.unref(buyingNotice).count > 1 ? {
        cF: common_vendor.t(common_vendor.unref(buyingNotice).count)
      } : {}, {
        cG: common_vendor.t(common_vendor.unref(buyingNotice).noticeText || "正在去购买"),
        cH: common_vendor.unref(buyingNotice).key,
        cI: common_vendor.unref(buyingNotice).leaving ? 1 : ""
      }) : {}, {
        cJ: common_vendor.unref(goShoppingNotice).visible
      }, common_vendor.unref(goShoppingNotice).visible ? common_vendor.e({
        cK: common_vendor.unref(goShoppingNotice).productImage
      }, common_vendor.unref(goShoppingNotice).productImage ? {
        cL: common_vendor.unref(goShoppingNotice).productImage
      } : {}, {
        cM: common_vendor.t(common_vendor.unref(goShoppingNotice).nick),
        cN: common_vendor.t(common_vendor.unref(goShoppingNotice).count > 1 ? `等${common_vendor.unref(goShoppingNotice).count}人在购买` : common_vendor.unref(goShoppingNotice).noticeText || "正在去购买"),
        cO: common_vendor.unref(goShoppingNotice).productName
      }, common_vendor.unref(goShoppingNotice).productName ? {
        cP: common_vendor.t(common_vendor.unref(goShoppingNotice).productName)
      } : {}, {
        cQ: common_vendor.unref(goShoppingNotice).key,
        cR: common_vendor.unref(goShoppingNotice).leaving ? 1 : ""
      }) : {}, {
        cS: common_vendor.o(common_vendor.unref(enterLive), "60"),
        cT: common_vendor.p({
          show: common_vendor.unref(shouldShowEntryOverlay),
          landscape: true
        }),
        cU: common_vendor.unref(renderLiveReportPopup)
      }, common_vendor.unref(renderLiveReportPopup) ? {
        cV: common_vendor.o(common_vendor.unref(setShowLiveReportPopup), "11"),
        cW: common_vendor.p({
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
        cX: common_vendor.unref(activeTab) === "products" ? 1 : "",
        cY: common_vendor.unref(isLiveVisualMode) ? 1 : "",
        cZ: common_vendor.unref(isLiveVisualMode) ? 1 : "",
        da: !common_vendor.unref(isLiveVisualMode) ? 1 : "",
        db: stageCollapsed.value ? 1 : "",
        dc: common_vendor.s(landscapeBottomStyle.value)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cecf1cb1"]]);
wx.createComponent(Component);
