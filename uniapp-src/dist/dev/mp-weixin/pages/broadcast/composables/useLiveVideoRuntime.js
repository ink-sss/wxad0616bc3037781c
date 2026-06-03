"use strict";
const common_vendor = require("../../../common/vendor.js");
function useLiveVideoRuntime(ctx) {
  const {
    videoUrl,
    warmUpVideoUrl,
    isScheduleWarmupMode,
    isPlaying,
    isReplay,
    pushStatus,
    videoFrameReady,
    mediaSourceComponent,
    getVideoPlayer,
    createMediaContext
  } = ctx;
  function getLiveVideoElement() {
    return null;
  }
  function applyInlineVideoAttrs() {
  }
  function invokeContextPlay(context, methods = ["play"]) {
    if (!context)
      return false;
    let invoked = false;
    methods.forEach((method) => {
      try {
        if (typeof context[method] === "function") {
          context[method]();
          invoked = true;
        }
      } catch (e) {
      }
    });
    return invoked;
  }
  function shouldPreferVideoContext() {
    if (isReplay == null ? void 0 : isReplay.value)
      return true;
    if ((mediaSourceComponent == null ? void 0 : mediaSourceComponent.value) === "video")
      return true;
    if ((mediaSourceComponent == null ? void 0 : mediaSourceComponent.value) === "live-player")
      return false;
    return false;
  }
  function getKnownMediaComponent() {
    if (isReplay == null ? void 0 : isReplay.value)
      return "video";
    if ((mediaSourceComponent == null ? void 0 : mediaSourceComponent.value) === "video")
      return "video";
    if ((mediaSourceComponent == null ? void 0 : mediaSourceComponent.value) === "live-player")
      return "live-player";
    const player = getVideoPlayer == null ? void 0 : getVideoPlayer();
    if ((player == null ? void 0 : player.sourceComponent) === "video")
      return "video";
    if ((player == null ? void 0 : player.sourceComponent) === "live-player" || (player == null ? void 0 : player.live) === true)
      return "live-player";
    return "";
  }
  function tryPlayNativeContext(preferVideo = false) {
    const tryVideo = () => {
      try {
        const videoCtx = (createMediaContext == null ? void 0 : createMediaContext("liveVideo", "video")) || (typeof common_vendor.index.createVideoContext === "function" ? common_vendor.index.createVideoContext("liveVideo") : null);
        return invokeContextPlay(videoCtx, ["play"]);
      } catch (e) {
      }
      return false;
    };
    const tryLive = () => {
      try {
        const liveCtx = (createMediaContext == null ? void 0 : createMediaContext("liveVideo", "live-player")) || (typeof common_vendor.index.createLivePlayerContext === "function" ? common_vendor.index.createLivePlayerContext("liveVideo") : null);
        return invokeContextPlay(liveCtx, ["play", "resume"]);
      } catch (e) {
      }
      return false;
    };
    const knownComponent = getKnownMediaComponent();
    if (knownComponent === "video")
      return tryVideo();
    if (knownComponent === "live-player")
      return tryLive();
    if (preferVideo)
      return tryVideo() || tryLive();
    return tryLive() || tryVideo();
  }
  function resumeVideoPlayback(delay = 0, options = {}) {
    if (delay && typeof delay === "object") {
      options = delay;
      delay = 0;
    }
    const force = options.force === true;
    const hasVideoSource = !!(videoUrl.value || isScheduleWarmupMode() && warmUpVideoUrl.value);
    const isEndedLiveWithoutReplay = pushStatus.value === 2 && !(isReplay == null ? void 0 : isReplay.value);
    if (!hasVideoSource && !(getVideoPlayer == null ? void 0 : getVideoPlayer()) || !force && isPlaying.value && (videoFrameReady == null ? void 0 : videoFrameReady.value) !== false || isEndedLiveWithoutReplay) {
      return;
    }
    const exec = () => {
      var _a;
      const videoPlayer = getVideoPlayer == null ? void 0 : getVideoPlayer();
      const hasSource = !!(videoUrl.value || isScheduleWarmupMode() && warmUpVideoUrl.value);
      const isEndedLiveWithoutReplay2 = pushStatus.value === 2 && !(isReplay == null ? void 0 : isReplay.value);
      if (!hasSource && !videoPlayer || !force && isPlaying.value && (videoFrameReady == null ? void 0 : videoFrameReady.value) !== false || isEndedLiveWithoutReplay2)
        return;
      let played = false;
      if (videoPlayer) {
        try {
          (_a = videoPlayer.play) == null ? void 0 : _a.call(videoPlayer);
          played = true;
        } catch (e) {
        }
      }
      const preferredVideo = shouldPreferVideoContext();
      const nativePlayed = tryPlayNativeContext(preferredVideo);
      if (played || nativePlayed) {
        isPlaying.value = true;
      }
    };
    if (delay > 0) {
      setTimeout(exec, delay);
      return;
    }
    exec();
  }
  return {
    getLiveVideoElement,
    applyInlineVideoAttrs,
    resumeVideoPlayback
  };
}
exports.useLiveVideoRuntime = useLiveVideoRuntime;
