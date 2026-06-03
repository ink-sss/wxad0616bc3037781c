"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_broadcast_composables_useLiveEntryBootstrap = require("./useLiveEntryBootstrap.js");
function useLiveLoadBootstrap(ctx) {
  const {
    getLiveDetail,
    initLive,
    scrollToBottom,
    isDebugLocalLogin,
    syncKeyboardViewportBaseHeight,
    getLiveVideoElement,
    applyInlineVideoAttrs,
    resumeVideoPlayback,
    handlePageHide,
    handlePageBackground,
    setPageVisible,
    refreshLiveStatusNow,
    isWeChatIOSH5,
    getWeixinBridgeReadyHandler,
    setWeixinBridgeReadyHandler,
    getVisibilityResumeHandler,
    setVisibilityResumeHandler,
    userStore,
    pendingRecoverBuyCtx,
    setPendingSubscribeBack,
    setShowEntryOverlay,
    setShowWxAddrDonePlayBtn,
    setSafeBottom,
    setIsIOSKeyboardMode
  } = ctx;
  common_vendor.onLoad(async (options) => {
    const shouldStop = await pages_broadcast_composables_useLiveEntryBootstrap.runLiveEntryBootstrap(options || {}, {
      getLiveDetail,
      initLive,
      nextTick: common_vendor.nextTick$1,
      scrollToBottom,
      isDebugLocalLogin,
      syncKeyboardViewportBaseHeight,
      getLiveVideoElement,
      applyInlineVideoAttrs,
      resumeVideoPlayback,
      handlePageHide,
      handlePageBackground,
      setPageVisible,
      refreshLiveStatusNow,
      isWeChatIOSH5,
      weixinBridgeReadyHandler: getWeixinBridgeReadyHandler,
      setWeixinBridgeReadyHandler,
      visibilityResumeHandler: getVisibilityResumeHandler,
      setVisibilityResumeHandler,
      userStore,
      pendingRecoverBuyCtx,
      setPendingSubscribeBack,
      setShowEntryOverlay,
      setShowWxAddrDonePlayBtn,
      setSafeBottom,
      setIsIOSKeyboardMode
    });
    if (shouldStop)
      return;
  });
}
function useLiveLoadBootstrapRegistration(ctx) {
  useLiveLoadBootstrap({
    getLiveDetail: ctx.getLiveDetail,
    initLive: ctx.initLive,
    scrollToBottom: ctx.scrollToBottom,
    isDebugLocalLogin: ctx.isDebugLocalLogin,
    syncKeyboardViewportBaseHeight: ctx.syncKeyboardViewportBaseHeight,
    getLiveVideoElement: ctx.getLiveVideoElement,
    applyInlineVideoAttrs: ctx.applyInlineVideoAttrs,
    resumeVideoPlayback: ctx.resumeVideoPlayback,
    handlePageHide: ctx.handlePageHide,
    handlePageBackground: ctx.handlePageBackground,
    setPageVisible: ctx.setPageVisible,
    refreshLiveStatusNow: ctx.refreshLiveStatusNow,
    isWeChatIOSH5: ctx.isWeChatIOSH5,
    getWeixinBridgeReadyHandler: ctx.getWeixinBridgeReadyHandler,
    setWeixinBridgeReadyHandler: ctx.setWeixinBridgeReadyHandler,
    getVisibilityResumeHandler: ctx.getVisibilityResumeHandler,
    setVisibilityResumeHandler: ctx.setVisibilityResumeHandler,
    userStore: ctx.userStore,
    pendingRecoverBuyCtx: ctx.pendingRecoverBuyCtx,
    setPendingSubscribeBack: ctx.setPendingSubscribeBack,
    setShowEntryOverlay(value) {
      ctx.showEntryOverlay.value = value;
    },
    setShowWxAddrDonePlayBtn(value) {
      ctx.showWxAddrDonePlayBtn.value = value;
    },
    setSafeBottom(value) {
      ctx.safeBottom.value = value;
    },
    setIsIOSKeyboardMode(value) {
      ctx.isIOSKeyboardMode.value = value;
    }
  });
}
exports.useLiveLoadBootstrapRegistration = useLiveLoadBootstrapRegistration;
