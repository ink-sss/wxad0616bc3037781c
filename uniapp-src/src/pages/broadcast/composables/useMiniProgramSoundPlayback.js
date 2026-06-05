/**
 * Mini Program native media sound playback commands.
 * 职责边界：只操作 video/live-player 原生 context，保证有声播放意图能落到原生播放器。
 */
function safeCall(context, method, args = []) {
  try {
    if (context && typeof context[method] === "function") {
      context[method](...args);
      return true;
    }
  } catch (e) {}
  return false;
}

export function applyNativeSoundPlayback(context, options = {}) {
  if (!context) return false;
  const isLivePlayer = options.type === "live-player";
  let applied = false;

  if (isLivePlayer) {
    applied = safeCall(context, "unmute") || applied;
    applied = safeCall(context, "setSoundMode", ["speaker"]) || applied;
  } else {
    applied = safeCall(context, "setMuted", [false]) || applied;
    applied = safeCall(context, "setVolume", [1]) || applied;
  }

  applied = safeCall(context, "play") || applied;
  if (isLivePlayer) {
    applied = safeCall(context, "resume") || applied;
  }
  return applied;
}

export function createNativeMediaContext(id = "liveVideo", type = "video", createMediaContext) {
  try {
    const context = createMediaContext?.(id, type);
    if (context) return context;
  } catch (e) {}
  try {
    if (type === "live-player" && typeof uni.createLivePlayerContext === "function") {
      return uni.createLivePlayerContext(id);
    }
    if (type === "video" && typeof uni.createVideoContext === "function") {
      return uni.createVideoContext(id);
    }
  } catch (e) {}
  return null;
}

export function applyMiniProgramSoundPlayback(options = {}) {
  const {
    id = "liveVideo",
    preferLivePlayer = false,
    knownComponent = "",
    createMediaContext,
  } = options;
  const applyVideo = () => applyNativeSoundPlayback(
    createNativeMediaContext(id, "video", createMediaContext),
    { type: "video" },
  );
  const applyLive = () => applyNativeSoundPlayback(
    createNativeMediaContext(id, "live-player", createMediaContext),
    { type: "live-player" },
  );

  if (knownComponent === "video") return applyVideo();
  if (knownComponent === "live-player") return applyLive();
  if (preferLivePlayer) return applyLive() || applyVideo();
  return applyVideo() || applyLive();
}
