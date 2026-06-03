"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_live = require("../../../api/live.js");
function useLiveProgressReport(ctx) {
  const {
    isReplay,
    liveId,
    replayCurrentVideoId,
    replayLastTime,
    getLiveVideoElement,
    getSeekTarget,
    setLastSavedProgress,
    replayVideosList,
    replayCurrentIndex
  } = ctx;
  function persistReplayProgress(forceSeconds) {
    if (!isReplay.value || !liveId.value || !replayCurrentVideoId.value) {
      console.warn("[Live][断点] persistReplayProgress SKIPPED - 条件不满足");
      return;
    }
    let currentSeconds = Number(forceSeconds);
    const isForce = Number.isFinite(currentSeconds) && currentSeconds >= 0;
    if (!isForce) {
      const videoEl = getLiveVideoElement();
      currentSeconds = Number((videoEl == null ? void 0 : videoEl.currentTime) || replayLastTime.value || 0);
    }
    currentSeconds = Math.floor(currentSeconds);
    if (currentSeconds <= 0)
      return;
    const seekTarget = getSeekTarget();
    if (!isForce && seekTarget > 0 && currentSeconds < seekTarget - 2) {
      console.warn("[Live][断点] persistReplayProgress SKIPPED (seek 保护期, 拒绝倒退保存):", {
        currentSeconds,
        _seekTarget: seekTarget
      });
      return;
    }
    if (!isForce) {
      try {
        const lastSaved = Number(common_vendor.index.getStorageSync(
          `replay_progress_${liveId.value}_${replayCurrentVideoId.value}`
        ) || 0);
        if (lastSaved > 0 && currentSeconds < lastSaved - 30) {
          console.warn("[Live][断点] persistReplayProgress 拒绝大幅倒退保存:", {
            currentSeconds,
            lastSaved,
            diff: lastSaved - currentSeconds
          });
          return;
        }
      } catch (e) {
      }
    }
    const storageKey = `replay_progress_${liveId.value}_${replayCurrentVideoId.value}`;
    try {
      const lastSaved = Number(common_vendor.index.getStorageSync(storageKey) || 0);
      currentSeconds = Math.max(currentSeconds, lastSaved);
    } catch (e) {
    }
    replayLastTime.value = currentSeconds;
    setLastSavedProgress(currentSeconds);
    try {
      common_vendor.index.setStorageSync(storageKey, currentSeconds);
    } catch (e) {
    }
  }
  function flushViewProgressBeacon() {
    if (!isReplay.value)
      return;
    if (!replayCurrentVideoId.value || !liveId.value)
      return;
    const currentVideo = replayVideosList.value[replayCurrentIndex.value];
    if (!(currentVideo == null ? void 0 : currentVideo.termId))
      return;
    api_live.reportViewProgress({
      roomId: Number(liveId.value),
      termId: Number(currentVideo.termId),
      videoId: Number(replayCurrentVideoId.value),
      lastPosition: replayLastTime.value || 0,
      watchDuration: replayLastTime.value || 0,
      watchStatus: 1
    }).catch(() => {
    });
  }
  return {
    persistReplayProgress,
    flushViewProgressBeacon
  };
}
exports.useLiveProgressReport = useLiveProgressReport;
