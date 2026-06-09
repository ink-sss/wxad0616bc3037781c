import { onBeforeUnmount } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";

/**
 * uni-app 页面生命周期收口。
 * 职责边界：只处理 onShow/onHide/onBeforeUnmount 的恢复、上报和清理顺序；不要在这里新增首屏初始化分支。
 */
export function useLiveEntryLifecycle(ctx) {
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
    clearLiveMiniWindowState,
    persistReplayProgress,
    stopKeyboardListener,
    stopScheduleTimers,
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
    sessionId,
  } = ctx;

  onShow(() => {
    setPageVisible?.(true);
    applyMiniResumeOptions(getLastInitOptions());
    const restoredFromMiniWindow = restoreLivePlaybackFromMiniWindow();
    syncScreenWakeLock?.();
    if (!restoredFromMiniWindow) {
      resumeVideoPlayback(80, { force: true });
    }
    refreshLiveStatusNow?.({ reason: "page_show" });
    if (!isMuted.value || hasPendingUnmute()) {
      scheduleLiveSoundIntentRestore();
    }
    if (!pendingOrderId.value) return;
    getOrderDetail(pendingOrderId.value)
      .then((detail) => {
        const status = Number(detail?.orderStatus || 0);
        if (status >= 2) {
          pendingOrderId.value = 0;
          uni.showToast({ title: "支付成功", icon: "none" });
          setTimeout(() => {
            uni.navigateTo({ url: getOrderListUrl("unsend") });
          }, 1200);
          return;
        }
        pendingOrderId.value = 0;
      })
      .catch((err) => {
        console.error("[Live] check pending order fail:", err);
        pendingOrderId.value = 0;
      });
  });

  onHide(() => {
    setPageVisible?.(false);
    releaseScreenWakeLock?.();
    pauseLivePlaybackForMiniWindow();
    if (handlePageBackground) {
      handlePageBackground();
    } else {
      persistReplayProgress();
    }
  });

  onBeforeUnmount(() => {
    stopKeyboardListener();
    stopScheduleTimers();
    clearLiveMiniWindowState?.();
    persistReplayProgress();
    // 录播栏目：组件卸载前上报最终进度
    if (isReplay.value && replayCurrentVideoId.value && liveId.value) {
      const currentVideo = replayVideosList.value[replayCurrentIndex.value];
      if (currentVideo?.termId > 0) {
        reportViewProgress({
          roomId: Number(liveId.value),
          termId: Number(currentVideo.termId),
          videoId: Number(replayCurrentVideoId.value),
          lastPosition: replayLastTime.value || 0,
          watchDuration: replayLastTime.value || 0,
          watchStatus: 1,
        }).catch(() => {});
      }
    }
    resetReplayContext();
    stopHeartbeat();
    stopStatusPoll();
    stopMuteCountdown();
    stopReplayFutureStartTimer();
    stopScreenWakeLock?.();
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
      const duration = enterTimestamp
        ? Math.floor((Date.now() - enterTimestamp) / 1000)
        : 0;
      leaveLiveRoom(liveId.value, sessionId.value, duration).catch((err) => {
        console.error("[Live] leaveLiveRoom fail:", err);
      });
    }
  });
}
