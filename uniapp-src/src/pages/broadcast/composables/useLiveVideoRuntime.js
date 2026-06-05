/**
 * 小程序媒体组件运行时能力。
 * 职责边界：恢复 live-player/video 播放；不查找 DOM，不保存播放业务状态。
 */
import { applyMiniProgramSoundPlayback } from "./useMiniProgramSoundPlayback.js";

export function useLiveVideoRuntime(ctx) {
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
    createMediaContext,
  } = ctx;

  function getLiveVideoElement() {
    return null;
  }

  function applyInlineVideoAttrs() {}

  function shouldPreferVideoContext() {
    if (isReplay?.value) return true;
    if (mediaSourceComponent?.value === "video") return true;
    if (mediaSourceComponent?.value === "live-player") return false;
    return false;
  }

  function getKnownMediaComponent() {
    if (isReplay?.value) return "video";
    if (mediaSourceComponent?.value === "video") return "video";
    if (mediaSourceComponent?.value === "live-player") return "live-player";
    const player = getVideoPlayer?.();
    if (player?.sourceComponent === "video") return "video";
    if (player?.sourceComponent === "live-player" || player?.live === true) return "live-player";
    return "";
  }

  function tryPlayNativeContext(preferVideo = false) {
    return applyMiniProgramSoundPlayback({
      id: "liveVideo",
      preferLivePlayer: !preferVideo,
      knownComponent: getKnownMediaComponent(),
      createMediaContext,
    });
  }

  function resumeVideoPlayback(delay = 0, options = {}) {
    if (delay && typeof delay === "object") {
      options = delay;
      delay = 0;
    }
    const force = options.force === true;
    const hasVideoSource = !!(videoUrl.value || (isScheduleWarmupMode() && warmUpVideoUrl.value));
    const isEndedLiveWithoutReplay = pushStatus.value === 2 && !isReplay?.value;
    if ((!hasVideoSource && !getVideoPlayer?.()) || (!force && isPlaying.value && videoFrameReady?.value !== false) || isEndedLiveWithoutReplay) {
      return;
    }
    const exec = () => {
      const videoPlayer = getVideoPlayer?.();
      const hasSource = !!(videoUrl.value || (isScheduleWarmupMode() && warmUpVideoUrl.value));
      const isEndedLiveWithoutReplay = pushStatus.value === 2 && !isReplay?.value;
      if ((!hasSource && !videoPlayer) || (!force && isPlaying.value && videoFrameReady?.value !== false) || isEndedLiveWithoutReplay) return;
      let played = false;
      if (videoPlayer) {
        try {
          videoPlayer.play?.();
          played = true;
        } catch (e) {}
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
    resumeVideoPlayback,
  };
}
