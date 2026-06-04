"use strict";
function useLiveSoundIntent(ctx) {
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
    setIOSWechatBridgeSoundAutoPlayAllowed
  } = ctx;
  let _pendingUnmute = false;
  let _pendingStoredSoundIntentRestore = false;
  let _pendingUnmuteTimer = null;
  function getPlaybackVideoElement(videoPlayer = getVideoPlayer()) {
    if (videoPlayer && typeof videoPlayer.getVideoElement === "function") {
      const playerVideoEl = videoPlayer.getVideoElement();
      if (playerVideoEl)
        return playerVideoEl;
    }
    return typeof getLiveVideoElement === "function" && getLiveVideoElement() || null;
  }
  function applyLiveSoundIntent() {
    _pendingStoredSoundIntentRestore = false;
    isMuted.value = false;
    setIOSWechatBridgeSoundAutoPlayAllowed == null ? void 0 : setIOSWechatBridgeSoundAutoPlayAllowed(true);
    const videoPlayer = typeof getVideoPlayer === "function" ? getVideoPlayer() : null;
    if (videoPlayer) {
      if (typeof videoPlayer.setMuted === "function") {
        videoPlayer.setMuted(false);
      } else if (typeof videoPlayer.unmute === "function") {
        videoPlayer.unmute();
      } else {
        try {
          videoPlayer.muted = false;
        } catch (_) {
        }
      }
      try {
        if (typeof videoPlayer.playFromUserGesture === "function") {
          videoPlayer.playFromUserGesture();
        } else if (typeof videoPlayer.play === "function") {
          videoPlayer.play();
        }
      } catch (_) {
      }
    }
    syncLiveMiniWindowState({
      force: true,
      muted: false,
      canPlayWithSound: true,
      soundMutedByUser: false
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
      if (videoPlayer && (el && el.muted === false || !el && videoPlayer.muted === false && isMuted.value === false)) {
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
    onEnterLive == null ? void 0 : onEnterLive();
    if (isWaitingSchedule.value && warmUpVideoUrl.value) {
      return;
    }
    const videoPlayer = getVideoPlayer();
    if (videoPlayer) {
      try {
        applyLiveSoundIntent();
      } catch (e) {
        console.warn("[Live] unmute failed:", e);
        resumeVideoPlayback();
      }
    } else {
      _pendingUnmute = true;
      resumeVideoPlayback();
    }
  }
  function manualPlayVideo() {
    const videoPlayer = getVideoPlayer();
    if (videoPlayer) {
      try {
        applyLiveSoundIntent();
        if (typeof videoPlayer.playFromUserGesture === "function") {
          videoPlayer.playFromUserGesture();
        }
        resumeVideoPlayback();
        return;
      } catch (err) {
        console.warn("[Live] manualPlayVideo unmute failed:", err);
      }
    }
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
    stopLiveSoundIntentRestore
  };
}
exports.useLiveSoundIntent = useLiveSoundIntent;
