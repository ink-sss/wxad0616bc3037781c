"use strict";
const utils_liveMiniState = require("../../../utils/live-mini-state.js");
function useLiveMiniWindow(ctx) {
  const {
    getLiveVideoElement,
    replayLastTime,
    displayVideoUrl,
    pullUrl,
    roomCode,
    replayVideosList,
    replayCurrentIndex,
    liveId,
    replayCurrentVideoId,
    liveName,
    currentVideoPoster,
    liveCover,
    isReplay,
    isMuted,
    pushStatus,
    isPlaying,
    getVideoPlayer,
    scheduleLiveSoundIntentRestore,
    playReplayVideoByIndex,
    setSeekTarget,
    verifySeekResult,
    setLastSavedProgress,
    replaceReplayMessagesAt,
    loadCommentHistory
  } = ctx;
  function syncLiveMiniWindowState(extra = {}) {
  }
  function pauseLivePlaybackForMiniWindow() {
  }
  function restoreLivePlaybackFromMiniWindow() {
  }
  function applyMiniResumeOptions(options = {}) {
    const target = Number(options.miniResumeTime || 0);
    if (!target || target <= 0)
      return false;
    const targetVideoId = String(options.miniResumeVideoId || "");
    const state = utils_liveMiniState.loadLiveMiniState(roomCode.value) || {};
    utils_liveMiniState.saveLiveMiniState({
      ...state,
      roomCode: roomCode.value,
      playUrl: state.playUrl || displayVideoUrl.value || pullUrl.value,
      streamingProvider: Number(state.streamingProvider || 0),
      rtcAppId: state.rtcAppId || "",
      rtcChannel: state.rtcChannel || "",
      rtcToken: state.rtcToken || "",
      rtcUid: state.rtcUid || "",
      isReplay: true,
      isLive: false,
      videoId: targetVideoId || state.videoId || replayCurrentVideoId.value || "",
      replayIndex: Number(options.miniResumeIndex ?? state.replayIndex ?? replayCurrentIndex.value),
      currentTime: target,
      canPlayWithSound: state.canPlayWithSound ?? !isMuted.value,
      soundMutedByUser: state.soundMutedByUser === true,
      force: true
    });
    return true;
  }
  return {
    syncLiveMiniWindowState,
    pauseLivePlaybackForMiniWindow,
    restoreLivePlaybackFromMiniWindow,
    applyMiniResumeOptions
  };
}
exports.useLiveMiniWindow = useLiveMiniWindow;
