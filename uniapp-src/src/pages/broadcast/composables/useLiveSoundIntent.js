/**
 * 用户有声播放意图。
 * 职责边界：处理进入直播间、手动播放和待恢复 unmute；不创建播放器、不选择播放源。
 */
export function useLiveSoundIntent(ctx) {
  const {
    isMuted,
    showEntryOverlay,
    isWaitingSchedule,
    warmUpVideoUrl,
    getLiveVideoElement,
    getVideoPlayer,
    syncLiveMiniWindowState,
    resumeVideoPlayback,
    onEnterLive,
    setIOSWechatBridgeSoundAutoPlayAllowed,
  } = ctx;
  let _pendingUnmute = false;
  let _pendingStoredSoundIntentRestore = false;
  let _pendingUnmuteTimer = null;

  function getPlaybackVideoElement(videoPlayer = getVideoPlayer()) {
    if (videoPlayer && typeof videoPlayer.getVideoElement === "function") {
      const playerVideoEl = videoPlayer.getVideoElement();
      if (playerVideoEl) return playerVideoEl;
    }
    return (typeof getLiveVideoElement === "function" && getLiveVideoElement()) || null;
  }

  function applyLiveSoundIntent() {
    _pendingStoredSoundIntentRestore = false;
    isMuted.value = false;
    setIOSWechatBridgeSoundAutoPlayAllowed?.(true);
    const videoPlayer = typeof getVideoPlayer === "function" ? getVideoPlayer() : null;
    // #ifdef H5
    const el = getPlaybackVideoElement(videoPlayer);
    if (el) {
      try {
        el.muted = false;
        el.removeAttribute("muted");
        el.volume = 1;
        el.play && el.play().catch(() => {});
      } catch (_) {}
    }
    // #endif
    if (videoPlayer) {
      if (typeof videoPlayer.setMuted === "function") {
        videoPlayer.setMuted(false);
      } else if (typeof videoPlayer.unmute === "function") {
        videoPlayer.unmute();
      } else {
        try {
          videoPlayer.muted = false;
        } catch (_) {}
      }
      try {
        if (typeof videoPlayer.playFromUserGesture === "function") {
          videoPlayer.playFromUserGesture();
        } else if (typeof videoPlayer.play === "function") {
          videoPlayer.play();
        }
      } catch (_) {}
    }
    syncLiveMiniWindowState({
      force: true,
      muted: false,
      canPlayWithSound: true,
      soundMutedByUser: false,
    });
  }

  function scheduleLiveSoundIntentRestore() {
    _pendingUnmute = true;
    if (_pendingUnmuteTimer) {
      clearTimeout(_pendingUnmuteTimer);
      _pendingUnmuteTimer = null;
    }
    let attempts = 0;
    const retry = () => {
      attempts += 1;
      applyLiveSoundIntent();
      const videoPlayer = getVideoPlayer();
      const el = getPlaybackVideoElement(videoPlayer);
      if (videoPlayer && ((el && el.muted === false) || (!el && videoPlayer.muted === false && isMuted.value === false))) {
        _pendingUnmute = false;
        _pendingUnmuteTimer = null;
        return;
      }
      if (attempts >= 8) {
        _pendingUnmute = false;
        _pendingUnmuteTimer = null;
        return;
      }
      _pendingUnmuteTimer = setTimeout(retry, attempts < 3 ? 160 : 420);
    };
    retry();
  }

  function enterLive() {
    showEntryOverlay.value = false;
    onEnterLive?.();
    // 等待开播期间由 VideoPlayer 接管暖场视频：必须在用户手势同步上下文内调 play()，
    // 否则 iOS/微信 会把 play() 降级为静音播放
    if (isWaitingSchedule.value && warmUpVideoUrl.value) {
      // #ifdef H5
      const el = (typeof getLiveVideoElement === "function" && getLiveVideoElement()) || null;
      if (el) {
        try {
          el.muted = false;
          isMuted.value = false;
          _pendingStoredSoundIntentRestore = false;
          setIOSWechatBridgeSoundAutoPlayAllowed?.(true);
          const videoPlayer = getVideoPlayer();
          if (videoPlayer) {
            try { videoPlayer.muted = false; } catch (e) {}
          }
          syncLiveMiniWindowState({ force: true });
          const p = el.play && el.play();
          if (p && typeof p.catch === "function") {
            p.catch((err) => {
              console.warn("[Live] 暖场带声播放失败，降级静音:", err);
              try {
                el.muted = true;
                isMuted.value = true;
                const videoPlayer = getVideoPlayer();
                if (videoPlayer) videoPlayer.muted = true;
                syncLiveMiniWindowState({ force: true });
                el.play && el.play();
              } catch (e) {}
            });
          }
        } catch (e) {}
      }
      // #endif
      return;
    }
    // [优化] 视频已静音自动播放，用户点击 overlay 是手势授权 → 切换有声
    const videoPlayer = getVideoPlayer();
    if (videoPlayer) {
      try {
        applyLiveSoundIntent();
      } catch (e) {
        console.warn("[Live] unmute failed:", e);
        resumeVideoPlayback();
      }
    } else {
      // VideoPlayer 还没初始化 → 在用户手势上下文内直接对 video DOM 有声 play，
      // 手势授权窗口极短(~1s)，不能等 videoPlayer 就绪再 unmute
      _pendingUnmute = true;
      // #ifndef H5
      // Mini Program has no DOM video element to grab here. Trigger the native
      // live-player/video resume path immediately, then let the pending unmute
      // retry apply once the player wrapper is created.
      resumeVideoPlayback();
      // #endif
      // #ifdef H5
      const el = (typeof getLiveVideoElement === "function" && getLiveVideoElement()) || null;
      if (el) {
        try {
          el.muted = false;
          el.removeAttribute("muted");
          el.volume = 1;
          isMuted.value = false;
          _pendingStoredSoundIntentRestore = false;
          setIOSWechatBridgeSoundAutoPlayAllowed?.(true);
          syncLiveMiniWindowState({ force: true });
          const p = el.play && el.play();
          if (p && typeof p.catch === "function") {
            p.catch(() => {
              // 有声被拒 → 降级静音播放，保证画面不黑
              el.muted = true;
              el.setAttribute("muted", "");
              isMuted.value = true;
              syncLiveMiniWindowState({ force: true });
              el.play && el.play().catch(() => {});
            });
          }
        } catch (e) {
          resumeVideoPlayback();
        }
      } else {
        resumeVideoPlayback();
      }
      // #endif
    }
  }

  function manualPlayVideo() {
    // 优先用 videoPlayer 的 unmute（内部会自动 play）—— 与 enterLive 的有声升级路径一致
    const videoPlayer = getVideoPlayer();
    if (videoPlayer) {
      try {
        applyLiveSoundIntent();
        if (typeof videoPlayer.playFromUserGesture === "function") {
          videoPlayer.playFromUserGesture();
        }
        // 防 unmute 内部 play 被拦截，再补一次 resume
        resumeVideoPlayback();
        return;
      } catch (err) {
        console.warn("[Live] manualPlayVideo unmute failed:", err);
      }
    }
    // 兜底：videoPlayer 未初始化时，直接走 resumeVideoPlayback 链路
    resumeVideoPlayback();
  }

  function hasPendingUnmute() {
    return _pendingUnmute;
  }

  function markStoredSoundIntentRestore() {
    _pendingStoredSoundIntentRestore = true;
  }

  function clearStoredSoundIntentRestore() {
    _pendingStoredSoundIntentRestore = false;
  }

  function hasStoredSoundIntentRestore() {
    return _pendingStoredSoundIntentRestore;
  }

  function stopLiveSoundIntentRestore() {
    if (_pendingUnmuteTimer) {
      clearTimeout(_pendingUnmuteTimer);
      _pendingUnmuteTimer = null;
    }
  }

  return {
    enterLive,
    manualPlayVideo,
    scheduleLiveSoundIntentRestore,
    hasPendingUnmute,
    markStoredSoundIntentRestore,
    clearStoredSoundIntentRestore,
    hasStoredSoundIntentRestore,
    stopLiveSoundIntentRestore,
  };
}
