import { onLoad } from "@dcloudio/uni-app";
import { nextTick } from "vue";
import { runLiveEntryBootstrap } from "./useLiveEntryBootstrap.js";

/**
 * uni-app onLoad 注册器。
 * 职责边界：把页面壳传入的 getter/setter 接给 runLiveEntryBootstrap，避免 entry.vue 直接堆 onLoad 分支。
 */
export function useLiveLoadBootstrap(ctx) {
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
    setIsIOSKeyboardMode,
    setPlaybackDebugRouteOptions,
  } = ctx;

  onLoad(async (options) => {
    setPlaybackDebugRouteOptions?.(options || {});
    const shouldStop = await runLiveEntryBootstrap(options || {}, {
      getLiveDetail,
      initLive,
      nextTick,
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
      setIsIOSKeyboardMode,
    });
    if (shouldStop) return;
  });
}

/**
 * 页面 onLoad 启动注册的薄封装。
 * 职责边界：把 entry.vue 的本地可变引用转成 useLiveLoadBootstrap 需要的 getter/setter。
 */
export function useLiveLoadBootstrapRegistration(ctx) {
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
    },
    setPlaybackDebugRouteOptions: ctx.setPlaybackDebugRouteOptions,
  });
}
