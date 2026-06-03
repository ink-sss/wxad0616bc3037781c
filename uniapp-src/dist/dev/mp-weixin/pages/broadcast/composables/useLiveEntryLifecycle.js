"use strict";
const common_vendor = require("../../../common/vendor.js");
function useLiveEntryLifecycle(ctx) {
  const {
    applyMiniResumeOptions,
    getLastInitOptions,
    restoreLivePlaybackFromMiniWindow,
    resumeVideoPlayback,
    isMuted,
    hasPendingUnmute,
    scheduleLiveSoundIntentRestore,
    pendingOrderId,
    getOrderDetail,
    getOrderListUrl,
    pauseLivePlaybackForMiniWindow,
    persistReplayProgress,
    stopKeyboardListener,
    stopScheduleTimers,
    syncLiveMiniWindowState,
    roomGroupType,
    replayCurrentVideoId,
    isReplay,
    liveId,
    replayVideosList,
    replayCurrentIndex,
    reportViewProgress,
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
    getVideoPlayer,
    setVideoPlayer,
    closeLiveSocket,
    getWeixinBridgeReadyHandler,
    setWeixinBridgeReadyHandler,
    getVisibilityResumeHandler,
    setVisibilityResumeHandler,
    handlePageHide,
    handlePageBackground,
    setPageVisible,
    refreshLiveStatusNow,
    userStore,
    getEnterTimestamp,
    leaveLiveRoom,
    sessionId
  } = ctx;
  common_vendor.onShow(() => {
    setPageVisible == null ? void 0 : setPageVisible(true);
    applyMiniResumeOptions(getLastInitOptions());
    restoreLivePlaybackFromMiniWindow();
    syncScreenWakeLock == null ? void 0 : syncScreenWakeLock();
    resumeVideoPlayback(80, { force: true });
    refreshLiveStatusNow == null ? void 0 : refreshLiveStatusNow({ reason: "page_show" });
    if (!isMuted.value || hasPendingUnmute()) {
      scheduleLiveSoundIntentRestore();
    }
    if (!pendingOrderId.value)
      return;
    getOrderDetail(pendingOrderId.value).then((detail) => {
      const status = Number((detail == null ? void 0 : detail.orderStatus) || 0);
      if (status >= 2) {
        pendingOrderId.value = 0;
        common_vendor.index.showToast({ title: "支付成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: getOrderListUrl("unsend") });
        }, 1200);
        return;
      }
      pendingOrderId.value = 0;
    }).catch((err) => {
      console.error("[Live] check pending order fail:", err);
      pendingOrderId.value = 0;
    });
  });
  common_vendor.onHide(() => {
    setPageVisible == null ? void 0 : setPageVisible(false);
    releaseScreenWakeLock == null ? void 0 : releaseScreenWakeLock();
    pauseLivePlaybackForMiniWindow();
    if (handlePageBackground) {
      handlePageBackground();
    } else {
      persistReplayProgress();
    }
  });
  common_vendor.onBeforeUnmount(() => {
    stopKeyboardListener();
    stopScheduleTimers();
    syncLiveMiniWindowState({ force: true });
    persistReplayProgress();
    if (isReplay.value && replayCurrentVideoId.value && liveId.value) {
      const currentVideo = replayVideosList.value[replayCurrentIndex.value];
      if ((currentVideo == null ? void 0 : currentVideo.termId) > 0) {
        reportViewProgress({
          roomId: Number(liveId.value),
          termId: Number(currentVideo.termId),
          videoId: Number(replayCurrentVideoId.value),
          lastPosition: replayLastTime.value || 0,
          watchDuration: replayLastTime.value || 0,
          watchStatus: 1
        }).catch(() => {
        });
      }
    }
    resetReplayContext();
    stopHeartbeat();
    stopStatusPoll();
    stopMuteCountdown();
    stopReplayFutureStartTimer();
    stopScreenWakeLock == null ? void 0 : stopScreenWakeLock();
    applyH5ViewerLeaveDecrease();
    stopViewerCountAnimation();
    if (scheduleExplainTimerRef.value) {
      clearTimeout(scheduleExplainTimerRef.value);
      scheduleExplainTimerRef.value = null;
    }
    stopLiveSoundIntentRestore();
    replayProductSchedule.resetScheduleState();
    const videoPlayer = getVideoPlayer();
    if (videoPlayer) {
      videoPlayer.destroy();
      setVideoPlayer(null);
    }
    closeLiveSocket();
    setWeixinBridgeReadyHandler(null);
    setVisibilityResumeHandler(null);
    if (userStore.token && liveId.value) {
      const enterTimestamp = getEnterTimestamp();
      const duration = enterTimestamp ? Math.floor((Date.now() - enterTimestamp) / 1e3) : 0;
      leaveLiveRoom(liveId.value, sessionId.value, duration).catch((err) => {
        console.error("[Live] leaveLiveRoom fail:", err);
      });
    }
  });
}
exports.useLiveEntryLifecycle = useLiveEntryLifecycle;
