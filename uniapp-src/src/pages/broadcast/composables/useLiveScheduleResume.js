/**
 * 预约开播倒计时与到点恢复。
 * 职责边界：维护等待开播的 timer 和到点后的直播/录播恢复，不负责解析直播详情。
 */
export function useLiveScheduleResume(ctx) {
  const {
    scheduleTargetTs,
    nowTs,
    setScheduleWarmupMode,
    replayVideosList,
    isReplay,
    pushStatus,
    getReplayVideoSchedule,
    playReplayVideoByIndex,
    enterReplayPendingState,
    replayFutureStartTimerRef,
    pullUrl,
    initVideoPlayer,
    buildWsUrl,
    liveId,
    initWebSocket,
    roomSetting,
    loadCommentHistory,
    loadProductList,
    loadCurrentProduct,
    reportLiveEntry,
    startStatusPoll,
  } = ctx;

  let scheduleTickTimer = null;
  let scheduleExpireTimer = null;

  function stopScheduleTimers() {
    if (scheduleTickTimer) {
      clearInterval(scheduleTickTimer);
      scheduleTickTimer = null;
    }
    if (scheduleExpireTimer) {
      clearTimeout(scheduleExpireTimer);
      scheduleExpireTimer = null;
    }
  }

  function startScheduleTimers() {
    stopScheduleTimers();
    nowTs.value = Date.now();
    scheduleTickTimer = setInterval(() => {
      nowTs.value = Date.now();
    }, 1000);
    const delay = Math.max(0, scheduleTargetTs.value - Date.now());
    scheduleExpireTimer = setTimeout(() => {
      stopScheduleTimers();
      // 到点：就地平滑切换到真实播放源，避免整页重置/加载动画
      nowTs.value = Date.now(); // 确保 isWaitingSchedule 立即翻为 false
      resumeAfterSchedule();
    }, delay + 300);
  }

  /**
   * 倒计时归零后就地恢复播放：不重跑 initLive、不触发加载动画，
   * 直接把真实视频源切进 videoUrl，<video> 元素 src 变更但不卸载，
   * 并异步起 WebSocket/商品/心跳/轮询等辅助能力。
   */
  function resumeAfterSchedule() {
    setScheduleWarmupMode(false);
    const vids = replayVideosList.value || [];
    if (vids.length > 0) {
      isReplay.value = true;
      pushStatus.value = 1;
      const schedule = getReplayVideoSchedule(Date.now(), 0);
      try {
        if (schedule.activeIdx >= 0) {
          playReplayVideoByIndex(schedule.activeIdx, schedule.activeSeekSeconds || 0);
        } else if (schedule.futureIdx >= 0) {
          enterReplayPendingState(schedule.futureIdx);
          const delay = Math.max(0, schedule.futureStart - Date.now());
          replayFutureStartTimerRef.value = setTimeout(() => {
            replayFutureStartTimerRef.value = null;
            pushStatus.value = 1;
            playReplayVideoByIndex(schedule.futureIdx, 0);
          }, delay);
        } else {
          playReplayVideoByIndex(0, 0);
        }
      } catch (e) {
        console.warn("[Live][schedule] playReplayVideoByIndex fail:", e);
      }
    } else if (pullUrl.value) {
      isReplay.value = false;
      pushStatus.value = 1;
      try {
        initVideoPlayer(pullUrl.value);
      } catch (e) {
        console.warn("[Live][schedule] initVideoPlayer fail:", e);
      }
    } else {
      isReplay.value = false;
      pushStatus.value = 1;
    }

    // 消息通道：直播间 IM 不依赖后端 WS URL，统一交给 useMessageChannel 判断。
    const wsUrl = buildWsUrl(liveId.value);
    initWebSocket(wsUrl).catch((e) =>
      console.warn("[Live][schedule] initWebSocket fail:", e),
    );
    // 历史评论(非录播 + showHistory 开)
    if (!isReplay.value && roomSetting.value.showHistory === 1) {
      try { loadCommentHistory(); } catch (e) {}
    }
    // 商品
    loadProductList(true).catch(() => {});
    loadCurrentProduct().catch(() => {});

    reportLiveEntry?.().catch(() => {});
    // 推流状态轮询
    startStatusPoll();
  }

  return {
    stopScheduleTimers,
    startScheduleTimers,
    resumeAfterSchedule,
  };
}
