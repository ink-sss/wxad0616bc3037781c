"use strict";
function useLiveScheduleResume(ctx) {
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
    startStatusPoll
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
    }, 1e3);
    const delay = Math.max(0, scheduleTargetTs.value - Date.now());
    scheduleExpireTimer = setTimeout(() => {
      stopScheduleTimers();
      nowTs.value = Date.now();
      resumeAfterSchedule();
    }, delay + 300);
  }
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
    const wsUrl = buildWsUrl(liveId.value);
    if (wsUrl) {
      initWebSocket(wsUrl).catch(
        (e) => console.warn("[Live][schedule] initWebSocket fail:", e)
      );
    }
    if (!isReplay.value && roomSetting.value.showHistory === 1) {
      try {
        loadCommentHistory();
      } catch (e) {
      }
    }
    loadProductList(true).catch(() => {
    });
    loadCurrentProduct().catch(() => {
    });
    reportLiveEntry == null ? void 0 : reportLiveEntry().catch(() => {
    });
    startStatusPoll();
  }
  return {
    stopScheduleTimers,
    startScheduleTimers,
    resumeAfterSchedule
  };
}
exports.useLiveScheduleResume = useLiveScheduleResume;
