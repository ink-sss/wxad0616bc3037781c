import {
  consumeLiveMiniReturnState,
  loadLiveMiniState,
  saveLiveMiniState,
} from "@/utils/live-mini-state";
import { isVideoSource } from "@/utils/live-route.js";

/**
 * 小窗/离页播放状态同步。
 * 职责边界：保存/恢复悬浮播放相关上下文；不决定直播或录播应该播放哪一条源。
 */
export function useLiveMiniWindow(ctx) {
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
    loadCommentHistory,
  } = ctx;
  let lastLiveMiniStateSyncAt = 0;

  function isMiniWindowVideoSource(url = "", state = {}) {
    if (!url) return false;
    if (state?.isReplay === true || isReplay.value === true) return true;
    return isVideoSource(url);
  }

  function selectMiniWindowSource(extra = {}) {
    const preferred = String(extra.playUrl || displayVideoUrl.value || pullUrl.value || "");
    const backupHlsUrl = String(extra.backupHlsUrl || "");
    if (isMiniWindowVideoSource(preferred, extra)) {
      return {
        playUrl: preferred,
        backupUrl: String(extra.backupUrl || ""),
        backupHlsUrl,
      };
    }
    if (isMiniWindowVideoSource(backupHlsUrl, { ...extra, isReplay: false })) {
      return {
        playUrl: backupHlsUrl,
        backupUrl: String(extra.backupUrl || preferred || ""),
        backupHlsUrl,
      };
    }
    const previousState = loadLiveMiniState(roomCode.value) || {};
    if (isMiniWindowVideoSource(previousState.playUrl, previousState)) {
      return {
        playUrl: previousState.playUrl,
        backupUrl: previousState.backupUrl || preferred || "",
        backupHlsUrl: previousState.backupHlsUrl || backupHlsUrl,
      };
    }
    if (isMiniWindowVideoSource(previousState.backupHlsUrl, { ...previousState, isReplay: false })) {
      return {
        playUrl: previousState.backupHlsUrl,
        backupUrl: previousState.backupUrl || preferred || "",
        backupHlsUrl: previousState.backupHlsUrl,
      };
    }
    return {
      playUrl: "",
      backupUrl: String(extra.backupUrl || preferred || ""),
      backupHlsUrl,
    };
  }

  function getCurrentMiniWindowTime() {
    const videoEl = getLiveVideoElement();
    const currentTime = Number(videoEl?.currentTime || replayLastTime.value || 0);
    return Number.isFinite(currentTime) ? currentTime : 0;
  }

  function syncLiveMiniWindowState(extra = {}) {
    const force = extra.force === true;
    const now = Date.now();
    if (!force && now - lastLiveMiniStateSyncAt < 1500) return;
    const source = selectMiniWindowSource(extra);
    const sourceUrl = source.playUrl;
    const previousState = loadLiveMiniState(roomCode.value) || {};
    const hasRtcSource = !!(
      extra.rtcAppId &&
      extra.rtcChannel &&
      extra.rtcToken
    );
    const keepRtcSource = !hasRtcSource && previousState.roomCode === roomCode.value;
    const rtcAppId = hasRtcSource ? extra.rtcAppId : keepRtcSource ? previousState.rtcAppId : "";
    const rtcChannel = hasRtcSource ? extra.rtcChannel : keepRtcSource ? previousState.rtcChannel : "";
    const rtcToken = hasRtcSource ? extra.rtcToken : keepRtcSource ? previousState.rtcToken : "";
    const rtcUid = hasRtcSource ? extra.rtcUid : keepRtcSource ? previousState.rtcUid : "";
    const streamingProvider = Number(
      extra.streamingProvider || (keepRtcSource ? previousState.streamingProvider : 0) || 0,
    );
    if (!roomCode.value || (!sourceUrl && !(rtcAppId && rtcChannel && rtcToken))) return;
    lastLiveMiniStateSyncAt = now;
    const currentVideo = replayVideosList.value[replayCurrentIndex.value] || {};
    const currentTime = Math.max(0, Number(extra.currentTime ?? getCurrentMiniWindowTime() ?? 0));
    saveLiveMiniState({
      ...extra,
      roomCode: roomCode.value,
      liveId: liveId.value,
      videoId: extra.videoId || replayCurrentVideoId.value || currentVideo.id || "",
      replayIndex: Number.isFinite(Number(extra.replayIndex))
        ? Number(extra.replayIndex)
        : replayCurrentIndex.value,
      title: liveName.value || "",
      poster: extra.poster || currentVideoPoster.value || liveCover.value || "",
      playUrl: sourceUrl,
      backupUrl: source.backupUrl,
      backupFlvUrl: extra.backupFlvUrl || "",
      backupHlsUrl: source.backupHlsUrl,
      sourceType: extra.isReplay === true || isReplay.value === true ? "replay" : "hls",
      sourceComponent: "video",
      streamingProvider,
      rtcAppId,
      rtcChannel,
      rtcToken,
      rtcUid,
      currentTime,
      duration: Number(currentVideo.duration || 0),
      isReplay: extra.isReplay ?? isReplay.value,
      isLive: extra.isLive ?? !isReplay.value,
      muted: false,
      canPlayWithSound: true,
      soundMutedByUser: false,
      pushStatus: pushStatus.value,
      updatedAt: now,
    });
  }

  function pauseLivePlaybackForMiniWindow() {
    const currentTime = getCurrentMiniWindowTime();
    syncLiveMiniWindowState({
      force: true,
      currentTime,
      muted: false,
      canPlayWithSound: true,
      soundMutedByUser: false,
    });
    try {
      const videoPlayer = getVideoPlayer();
      if (videoPlayer && typeof videoPlayer.pause === "function") {
        videoPlayer.pause();
      } else if (videoPlayer && typeof videoPlayer.stop === "function") {
        videoPlayer.stop();
      } else {
        getLiveVideoElement()?.pause?.();
      }
    } catch (e) {}
    isPlaying.value = false;
  }

  function restoreLivePlaybackFromMiniWindow() {
    const state = consumeLiveMiniReturnState(roomCode.value) || loadLiveMiniState(roomCode.value);
    if (!state) return;
    if (state.canPlayWithSound) {
      scheduleLiveSoundIntentRestore();
    }
    const target = Number(state.currentTime || 0);
    if (!state.isReplay || target <= 0) return;
    const targetVideoId = String(state.videoId || "");
    let targetIndex = -1;
    if (targetVideoId) {
      targetIndex = replayVideosList.value.findIndex((v) => String(v.id || "") === targetVideoId);
    }
    if (targetIndex < 0 && Number.isFinite(Number(state.replayIndex))) {
      const idx = Number(state.replayIndex);
      if (idx >= 0 && idx < replayVideosList.value.length) {
        targetIndex = idx;
      }
    }
    if (targetIndex >= 0 && targetIndex !== replayCurrentIndex.value) {
      try {
        uni.setStorageSync(
          `replay_progress_${liveId.value}_${replayVideosList.value[targetIndex]?.id || replayCurrentVideoId.value}`,
          Math.floor(target),
        );
      } catch (e) {}
      playReplayVideoByIndex(targetIndex, target);
      return;
    }
    const videoEl = getLiveVideoElement();
    const current = Number(videoEl?.currentTime || 0);
    if (videoEl && Math.abs(current - target) > 2) {
      try {
        videoEl.currentTime = target;
        setSeekTarget(target);
        verifySeekResult(videoEl, target, 4);
      } catch (e) {}
    }
    replayLastTime.value = target;
    setLastSavedProgress(target);
    if (typeof replaceReplayMessagesAt === "function") {
      replaceReplayMessagesAt(target);
    }
    if (typeof loadCommentHistory === "function") {
      loadCommentHistory();
    }
  }

  function applyMiniResumeOptions(options = {}) {
    const target = Number(options.miniResumeTime || 0);
    if (!target || target <= 0) return false;
    const targetVideoId = String(options.miniResumeVideoId || "");
    const state = loadLiveMiniState(roomCode.value) || {};
    saveLiveMiniState({
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
      muted: false,
      canPlayWithSound: true,
      soundMutedByUser: false,
      force: true,
    });
    return true;
  }

  return {
    syncLiveMiniWindowState,
    pauseLivePlaybackForMiniWindow,
    restoreLivePlaybackFromMiniWindow,
    applyMiniResumeOptions,
  };
}
