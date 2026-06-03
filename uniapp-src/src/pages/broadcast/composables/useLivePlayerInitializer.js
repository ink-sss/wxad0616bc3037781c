import { nextTick } from "vue";
import { reportViewProgress } from "@/api/live.js";
import { createVideoPlayer } from "@/utils/videoPlay.js";
import { isLivePlayerSource } from "@/utils/live-route.js";
import { getReplayVideoEndTime, safeParseReplayTime } from "../utils/entry-format.js";
import { isWeChatDevtoolsRuntime } from "../utils/live-source.js";

function runPlayerCommand(command, id = "liveVideo", preferLivePlayer = false, createMediaContext) {
  const runLivePlayerCommand = () => {
    try {
      const liveCtx = typeof uni.createLivePlayerContext === "function"
        ? (createMediaContext?.(id, "live-player") || uni.createLivePlayerContext(id))
        : null;
      if (liveCtx && typeof liveCtx[command] === "function") {
        liveCtx[command]();
        return true;
      }
    } catch (e) {}
    return false;
  };
  const runVideoCommand = () => {
    try {
      const videoCtx = typeof uni.createVideoContext === "function"
        ? (createMediaContext?.(id, "video") || uni.createVideoContext(id))
        : null;
      if (videoCtx && typeof videoCtx[command] === "function") {
        videoCtx[command]();
        return true;
      }
    } catch (e) {}
    return false;
  };
  if (preferLivePlayer) {
    return runLivePlayerCommand() || runVideoCommand();
  }
  return runVideoCommand() || runLivePlayerCommand();
}

function redactPlaybackUrl(url = "") {
  return String(url || "").replace(
    /([?&](?:auth_key|txSecret|txTime|sign|signature|token|key)=)[^&]+/ig,
    "$1***",
  );
}

function buildFallbackCandidates(primaryUrl = "", opts = {}) {
  const seen = new Set();
  const candidates = [];
  const add = (url, meta = {}) => {
    const value = String(url || "").trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    candidates.push({
      url: value,
      type: meta.type || "",
      component: meta.component || "",
    });
  };
  if (Array.isArray(opts.liveCandidates)) {
    opts.liveCandidates.forEach((candidate) => add(candidate?.url, candidate || {}));
  }
  if (!candidates.length) {
    add(primaryUrl, { type: opts.sourceType, component: opts.sourceComponent });
  }
  add(opts.backupRtmpUrl, { type: "rtmp", component: "live-player" });
  add(opts.backupFlvUrl, { type: "flv", component: "live-player" });
  add(opts.backupHlsUrl, { type: "hls", component: "video" });
  add(opts.backupUrl, { type: opts.backupType || "", component: opts.backupComponent || "" });
  if (isWeChatDevtoolsRuntime()) {
    candidates.sort((a, b) => {
      const rank = (candidate) => {
        if (candidate.component === "video") return 0;
        if (candidate.type === "rtmp") return 9;
        return 1;
      };
      return rank(a) - rank(b);
    });
  }
  return candidates;
}

function findNextFallbackUrl(currentUrl = "", opts = {}) {
  const current = String(currentUrl || "").trim();
  const candidates = buildFallbackCandidates(current, opts);
  if (!candidates.length) return "";
  const currentIndex = candidates.findIndex((candidate) => candidate.url === current);
  const next = candidates.slice(currentIndex >= 0 ? currentIndex + 1 : 0).find((candidate) => candidate.url);
  return next?.url || "";
}

function getFallbackOptionsForUrl(nextUrl = "", opts = {}) {
  const nextCandidate = buildFallbackCandidates(nextUrl, opts)
    .find((candidate) => candidate?.url === nextUrl);
  return {
    ...opts,
    backupUrl: findNextFallbackUrl(nextUrl, opts),
    sourceType: nextCandidate?.type || opts.sourceType || "",
    sourceComponent: nextCandidate?.component || opts.sourceComponent || "",
  };
}

function createPlaybackFailureHandler(player, initVideoPlayer, opts = {}, onExhausted = () => {}) {
  let switching = false;
  return function handlePlaybackFailure(event = {}) {
    if (switching) return false;
    const currentUrl = player?.url || "";
    const nextUrl = findNextFallbackUrl(currentUrl, opts);
    if (!nextUrl || nextUrl === currentUrl) {
      onExhausted(event, opts);
      return false;
    }
    switching = true;
    console.warn("[Live] live-player fallback:", {
      from: redactPlaybackUrl(currentUrl),
      to: redactPlaybackUrl(nextUrl),
      reason: event?.detail?.code || event?.type || event?.message || "playback-failure",
    });
    initVideoPlayer(nextUrl, getFallbackOptionsForUrl(nextUrl, opts));
    return true;
  };
}

function updateMiniProgramMuted(id = "liveVideo", muted = false, preferLivePlayer = false, createMediaContext) {
  if (isWeChatDevtoolsRuntime()) return false;
  const applyLive = () => {
    try {
      const liveCtx = typeof uni.createLivePlayerContext === "function"
        ? (createMediaContext?.(id, "live-player") || uni.createLivePlayerContext(id))
        : null;
      if (liveCtx && typeof liveCtx.mute === "function" && muted) {
        liveCtx.mute();
        return true;
      }
      if (liveCtx && typeof liveCtx.play === "function") {
        liveCtx.play();
        return true;
      }
      if (liveCtx && typeof liveCtx.resume === "function") {
        liveCtx.resume();
        return true;
      }
    } catch (e) {}
    return false;
  };
  const applyVideo = () => {
    try {
      const videoCtx = typeof uni.createVideoContext === "function"
        ? (createMediaContext?.(id, "video") || uni.createVideoContext(id))
        : null;
      if (videoCtx && typeof videoCtx.play === "function") {
        videoCtx.play();
        return true;
      }
    } catch (e) {}
    return false;
  };
  if (preferLivePlayer) return applyLive();
  return applyVideo();
}

function normalizePlaybackUrl(url, opts = {}) {
  return String(
    url ||
	      opts.playUrl ||
	      opts.backupRtmpUrl ||
	      opts.backupUrl ||
	      opts.backupHlsUrl ||
	      opts.backupFlvUrl ||
      "",
  ).trim();
}

function shouldPreferLivePlayerContext(url = "", opts = {}) {
  if (opts.isReplay || opts.sourceComponent === "video") return false;
  if (opts.sourceComponent === "live-player") return true;
  return isLivePlayerSource(url);
}

function resolveMediaSourceComponent(url = "", opts = {}) {
  if (opts.isReplay || opts.sourceComponent === "video") return "video";
  if (opts.sourceComponent === "live-player") return "live-player";
  return isLivePlayerSource(url) ? "live-player" : "video";
}

export function useLivePlayerInitializer(ctx) {
  const {
    videoUrl,
    pullUrl,
    syncLiveMiniWindowState,
    videoDebugInfo,
    setVideoDebugActualCaptured,
    getVideoPlayer,
    setVideoPlayer,
    autoplayBlocked,
    isPlaying,
    videoFrameReady,
    isMuted,
    onVideoTimeUpdate,
    getSrcSwitchGuard,
    isScheduleWarmupMode,
    isWaitingSchedule,
    resumeAfterSchedule,
    isReplay,
    replayVideosList,
    replayCurrentIndex,
    persistReplayProgress,
    roomGroupType,
    liveId,
    replayCurrentVideoId,
    roomWatchByDay,
    pushStatus,
    playReplayVideoByIndex,
    stopHeartbeat,
    enterReplayPendingState,
    setReplayFutureStartTimer,
    resumeVideoPlayback,
    hasPendingUnmute,
    hasStoredSoundIntentRestore,
    scheduleLiveSoundIntentRestore,
    recordPlaybackDebugEvent = () => {},
    videoRenderKey,
    createMediaContext,
    mediaSourceComponent,
    mediaSourceType,
    playbackErrorVisible,
    playbackErrorText,
  } = ctx;
  let playbackReadyTimer = null;
  let lastInitPlayback = null;

  function clearPlaybackReadyTimer() {
    if (playbackReadyTimer) {
      clearTimeout(playbackReadyTimer);
      playbackReadyTimer = null;
    }
  }

  function clearPlaybackFailureState() {
    if (playbackErrorVisible) playbackErrorVisible.value = false;
    if (playbackErrorText) playbackErrorText.value = "";
  }

  function getPlaybackFailureText(event = {}, opts = {}) {
    const reason = event?.detail?.code || event?.type || event?.message || "";
    if (!normalizePlaybackUrl("", opts)) return "未获取到播放地址，请稍后重试";
    if (String(reason) === "playback-ready-timeout") {
      return opts.isReplay ? "录播加载超时，请重试" : "直播加载超时，请检查网络后重试";
    }
    return opts.isReplay ? "录播播放失败，请重试" : "直播播放失败，请检查网络后重试";
  }

  function showPlaybackFailureState(event = {}, opts = {}) {
    clearPlaybackReadyTimer();
    if (isPlaying) isPlaying.value = false;
    if (autoplayBlocked) autoplayBlocked.value = false;
    if (playbackErrorText) playbackErrorText.value = getPlaybackFailureText(event, opts);
    if (playbackErrorVisible) playbackErrorVisible.value = true;
    recordPlaybackDebugEvent("mini_player_failure_exhausted", {
      isReplay: !!opts.isReplay,
      sourceType: opts.sourceType || "",
      sourceComponent: opts.sourceComponent || "",
      reason: event?.detail?.code || event?.type || event?.message || "playback-failure",
    });
  }

  function startPlaybackReadyTimer(player, opts = {}) {
    clearPlaybackReadyTimer();
    if (opts.isReplay || !player?.url) return;
    playbackReadyTimer = setTimeout(() => {
      playbackReadyTimer = null;
      if (videoFrameReady?.value) return;
      recordPlaybackDebugEvent("mini_player_ready_timeout", {
        url: player.url || "",
        sourceType: player.sourceType || opts.sourceType || "",
        sourceComponent: player.sourceComponent || opts.sourceComponent || "",
      });
      player.handlePlaybackFailure?.({
        type: "playback-ready-timeout",
        detail: { code: "playback-ready-timeout" },
      });
    }, Number(opts.nativeLoadTimeoutMs || 8000));
  }

  function refreshMiniWindowState(url, opts = {}) {
    syncLiveMiniWindowState?.({
      force: true,
      playUrl: url,
      backupUrl: opts.backupUrl || "",
      backupFlvUrl: opts.backupFlvUrl || "",
      backupHlsUrl: opts.backupHlsUrl || "",
      isLive: !opts.isReplay,
      isReplay: !!opts.isReplay,
      currentTime: Number(opts.seekTo || 0),
      muted: !!isMuted.value,
    });
  }

  function markPlaybackReady() {
    clearPlaybackReadyTimer();
    clearPlaybackFailureState();
  }

  function createMiniPlayer(url, opts = {}) {
    const useLivePlayerContext = shouldPreferLivePlayerContext(url, opts);
    const player = createVideoPlayer({
      id: "liveVideo",
      url,
      createMediaContext,
      muted: isMuted.value,
      autoplay: true,
      live: useLivePlayerContext,
      onEnded: handleVideoPlayerEnded,
      onTimeUpdate: onVideoTimeUpdate,
    });
    player.url = url;
    player.backupUrl = opts.backupUrl || "";
    player.backupRtmpUrl = opts.backupRtmpUrl || "";
    player.backupFlvUrl = opts.backupFlvUrl || "";
    player.backupHlsUrl = opts.backupHlsUrl || "";
    player.liveCandidates = Array.isArray(opts.liveCandidates) ? opts.liveCandidates : [];
    player.sourceType = opts.sourceType || "";
    player.sourceComponent = opts.sourceComponent || (useLivePlayerContext ? "live-player" : "video");
    player.liveQuality = opts.liveQuality || "";
    player.rtcConfig = opts.rtcConfig || null;
    player.live = useLivePlayerContext;
    player.muted = !!isMuted.value;
    player.onEnded = handleVideoPlayerEnded;
    player.handlePlaybackFailure = createPlaybackFailureHandler(player, initVideoPlayer, opts, showPlaybackFailureState);
    player.setMuted = function setMuted(value) {
      this.muted = !!value;
      updateMiniProgramMuted(this.id, this.muted, this.live && isLivePlayerSource(this.url), createMediaContext);
    };
    player.unmute = function unmute() {
      this.setMuted(false);
      this.play();
    };
    setVideoPlayer(player);
    return player;
  }

  function initVideoPlayer(url, opts = {}) {
    const playUrl = normalizePlaybackUrl(url, opts);
    const preferLivePlayer = shouldPreferLivePlayerContext(playUrl, opts);
    const resolvedSourceComponent = resolveMediaSourceComponent(playUrl, opts);
    const normalizedOptions = {
      ...opts,
      playUrl,
      sourceComponent: resolvedSourceComponent,
      sourceType: opts.sourceType || (resolvedSourceComponent === "live-player" ? "live" : "video"),
    };
    lastInitPlayback = {
      url: playUrl,
      opts: normalizedOptions,
    };
    videoDebugInfo.value = {
      intent: Number(opts.seekTo || 0),
      actual: -1,
      source: opts.isReplay ? "mini-replay" : "mini-live",
    };
    setVideoDebugActualCaptured?.(false);
    clearPlaybackFailureState();
    autoplayBlocked.value = false;
    if (videoFrameReady) videoFrameReady.value = false;
    videoUrl.value = playUrl;
    if (pullUrl) pullUrl.value = playUrl;
    if (mediaSourceComponent) mediaSourceComponent.value = playUrl ? resolvedSourceComponent : "";
    if (mediaSourceType) mediaSourceType.value = playUrl ? normalizedOptions.sourceType : "";
    if (videoRenderKey && playUrl) {
      videoRenderKey.value += 1;
    }
    refreshMiniWindowState(playUrl, normalizedOptions);
    const oldPlayer = getVideoPlayer?.();
    if (oldPlayer && typeof oldPlayer.destroy === "function") {
      try { oldPlayer.destroy(); } catch (e) {}
    }
    const player = createMiniPlayer(playUrl, normalizedOptions);
    startPlaybackReadyTimer(player, normalizedOptions);
    recordPlaybackDebugEvent("mini_player_init", {
      isReplay: !!opts.isReplay,
      hasUrl: !!playUrl,
      seekTo: Number(opts.seekTo || 0),
      playUrl,
      sourceType: normalizedOptions.sourceType || "",
      sourceComponent: normalizedOptions.sourceComponent || "",
      liveCandidates: Array.isArray(opts.liveCandidates) ? opts.liveCandidates.length : 0,
    });
    nextTick(() => {
      if (!playUrl) return;
      if (opts.isReplay && Number(opts.seekTo || 0) > 0) {
        try { player.seek(Number(opts.seekTo || 0)); } catch (e) {}
      }
      const played = runPlayerCommand("play", "liveVideo", preferLivePlayer, createMediaContext);
      if (!played) {
        try { player.play?.(); } catch (e) {}
      }
      if (hasPendingUnmute?.() || hasStoredSoundIntentRestore?.()) {
        scheduleLiveSoundIntentRestore?.();
      }
    });
  }

  async function switchLiveStreamQuality(stream = {}, reason = "") {
    if (!stream?.playUrl || isReplay.value || isScheduleWarmupMode() || Number(pushStatus.value || 0) !== 1) {
      return false;
    }
	    initVideoPlayer(stream.playUrl, {
	      backupUrl: stream.backupUrl || "",
	      backupRtmpUrl: stream.backupRtmpUrl || "",
	      backupFlvUrl: stream.backupFlvUrl || "",
	      backupHlsUrl: stream.backupHlsUrl || "",
	      liveCandidates: stream.liveCandidates || [],
	      sourceType: stream.sourceType || "",
	      sourceComponent: stream.sourceComponent || "",
	      isReplay: false,
	      liveQuality: stream.quality || "",
	    });
    recordPlaybackDebugEvent("mini_quality_switch", {
      quality: stream.quality || "",
      label: stream.label || "",
      reason,
    });
    return true;
  }

  function handleLivePlayerFailure(event = {}) {
    const player = getVideoPlayer?.();
    if (player && typeof player.handlePlaybackFailure === "function") {
      return player.handlePlaybackFailure(event);
    }
    return false;
  }

  function retryPlayback() {
    const current = lastInitPlayback || {};
    const opts = current.opts || {};
    const candidates = buildFallbackCandidates(current.url || "", opts);
    const first = candidates[0]?.url || current.url || videoUrl?.value || pullUrl?.value || "";
    if (!first) {
      showPlaybackFailureState({ type: "retry-without-url" }, opts);
      return false;
    }
    const retryOptions = getFallbackOptionsForUrl(first, opts);
    initVideoPlayer(first, {
      ...retryOptions,
      seekTo: Number(opts.seekTo || 0),
      isReplay: !!opts.isReplay,
    });
    return true;
  }

  function handleWarmupOrLiveEnded() {
    if (isScheduleWarmupMode()) {
      isPlaying.value = false;
      if (!isWaitingSchedule.value) {
        resumeAfterSchedule();
      }
      return true;
    }
    if (!isReplay.value) {
      isPlaying.value = false;
      return true;
    }
    return false;
  }

  function handleReplayColumnEnded(currentVideo, durationSeconds) {
    if (roomGroupType.value !== 1) return false;
    if (currentVideo?.termId > 0) {
      reportViewProgress({
        roomId: Number(liveId.value),
        termId: Number(currentVideo.termId),
        videoId: Number(replayCurrentVideoId.value),
        lastPosition: durationSeconds,
        watchDuration: durationSeconds,
        watchStatus: 2,
      }).catch(() => {});
    }
    const nextIdx = replayCurrentIndex.value + 1;
    const nextVideo = nextIdx < replayVideosList.value.length ? replayVideosList.value[nextIdx] : null;
    const isSameTerm = nextVideo && currentVideo?.termId && nextVideo.termId === currentVideo.termId;
    const isNextCrossTerm = nextVideo && currentVideo?.termId && nextVideo.termId !== currentVideo.termId;
    const playFirstCurrentTermVideo = () => {
      const firstTermIdx = replayVideosList.value.findIndex((v) => v.termId === currentVideo.termId);
      if (firstTermIdx >= 0) {
        playReplayVideoByIndex(firstTermIdx, 0);
        return true;
      }
      return false;
    };
    const finishColumn = () => {
      isPlaying.value = false;
      pushStatus.value = 2;
      stopHeartbeat();
    };

    if (nextVideo && isSameTerm) {
      playReplayVideoByIndex(nextIdx, 0);
    } else if (nextVideo && isNextCrossTerm && roomWatchByDay.value !== 1) {
      if (Number(currentVideo?.termLoopPlay || 0) === 1) {
        if (!playFirstCurrentTermVideo()) playReplayVideoByIndex(nextIdx, 0);
      } else {
        playReplayVideoByIndex(nextIdx, 0);
      }
    } else if (nextVideo && isNextCrossTerm && roomWatchByDay.value === 1) {
      if (Number(currentVideo?.termLoopPlay || 0) === 1) {
        if (!playFirstCurrentTermVideo()) {
          isPlaying.value = false;
          pushStatus.value = 2;
        }
      } else {
        isPlaying.value = false;
        pushStatus.value = 2;
      }
    } else if (Number(currentVideo?.termLoopPlay || 0) === 1) {
      if (!playFirstCurrentTermVideo()) finishColumn();
    } else {
      finishColumn();
    }
    return true;
  }

  function handleTimedReplayEnded() {
    const now = Date.now();
    const nextIdx = replayCurrentIndex.value + 1;
    let foundNext = false;
    for (let i = nextIdx; i < replayVideosList.value.length; i++) {
      const v = replayVideosList.value[i];
      const vStart = safeParseReplayTime(v.startTime);
      const vEnd = getReplayVideoEndTime(v, vStart);
      if (vStart && now >= vStart && (!vEnd || now < vEnd)) {
        playReplayVideoByIndex(i, 0);
        foundNext = true;
        break;
      }
      if (vStart && now < vStart) {
        enterReplayPendingState(i);
        const delay = vStart - Date.now();
        setReplayFutureStartTimer(setTimeout(() => {
          setReplayFutureStartTimer(null);
          pushStatus.value = 1;
          playReplayVideoByIndex(i, 0);
        }, delay));
        foundNext = true;
        break;
      }
    }
    if (!foundNext) {
      isPlaying.value = false;
      pushStatus.value = 2;
      stopHeartbeat();
      try {
        uni.setStorageSync(`replay_all_done_${liveId.value}`, replayVideosList.value.map((v) => v.id).join(","));
      } catch (e) {}
    }
  }

  function handleVideoPlayerEnded() {
    clearPlaybackReadyTimer();
    if (getSrcSwitchGuard?.()) return;
    if (handleWarmupOrLiveEnded()) return;
    const currentVideo = replayVideosList.value[replayCurrentIndex.value];
    const durationSeconds = Number(currentVideo?.duration || 0);
    if (durationSeconds > 0) {
      persistReplayProgress(durationSeconds);
    }
    if (handleReplayColumnEnded(currentVideo, durationSeconds)) return;
    handleTimedReplayEnded();
  }

  return {
    initVideoPlayer,
    switchLiveStreamQuality,
    handleLivePlayerFailure,
    handleVideoPlayerEnded,
    markPlaybackReady,
    resumeVideoPlayback,
    retryPlayback,
  };
}
