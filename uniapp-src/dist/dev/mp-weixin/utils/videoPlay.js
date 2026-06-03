"use strict";
const common_vendor = require("../common/vendor.js");
function deriveMp4FromM3u8(url = "") {
  return String(url || "").replace(/\.m3u8(\?|#|$)/i, ".mp4$1");
}
function normalizeMediaUrl(url = "") {
  return String(url || "").trim();
}
function getMediaPath(url = "") {
  return normalizeMediaUrl(url).split("?")[0].split("#")[0].toLowerCase();
}
function isReplayVideoSource(url = "") {
  const value = normalizeMediaUrl(url).toLowerCase();
  const path = getMediaPath(value);
  if (!value)
    return false;
  if (value.startsWith("rtmp://"))
    return false;
  if (path.endsWith(".flv") || path.includes("/flv") || value.includes("format=flv") || value.includes("protocol=flv") || value.includes("type=flv")) {
    return false;
  }
  return path.endsWith(".mp4") || path.endsWith(".m3u8") || value.includes("format=mp4") || value.includes("type=mp4") || value.includes("format=m3u8") || value.includes("type=m3u8") || value.includes("protocol=hls");
}
function getReplaySourceCandidates(source = {}) {
  const push = (list, url, type = "") => {
    const value = normalizeMediaUrl(url);
    if (!value || list.some((item) => item.url === value))
      return;
    list.push({ url: value, type });
  };
  const explicit = [];
  push(explicit, source.videoUrl, "");
  push(explicit, source.video_url, "");
  push(explicit, source.playUrl, "");
  push(explicit, source.play_url, "");
  push(explicit, source.replayUrl, "");
  push(explicit, source.replay_url, "");
  push(explicit, source.fileUrl, "");
  push(explicit, source.file_url, "");
  push(explicit, source.url, "");
  push(explicit, source.mp4Url, "mp4");
  push(explicit, source.mp4_url, "mp4");
  push(explicit, source.m3u8Url, "hls");
  push(explicit, source.m3u8_url, "hls");
  push(explicit, source.hlsUrl, "hls");
  push(explicit, source.hls_url, "hls");
  return explicit;
}
function isDefinitelyUnsupportedReplayUrl(url = "") {
  const value = normalizeMediaUrl(url).toLowerCase();
  const path = getMediaPath(value);
  if (!value)
    return true;
  return value.startsWith("rtmp://") || path.endsWith(".flv") || path.includes("/flv") || value.includes("format=flv") || value.includes("protocol=flv") || value.includes("type=flv");
}
function inferReplaySourceType(url = "") {
  const value = normalizeMediaUrl(url).toLowerCase();
  const path = getMediaPath(value);
  if (path.endsWith(".mp4") || value.includes("format=mp4") || value.includes("type=mp4"))
    return "mp4";
  if (path.endsWith(".m3u8") || value.includes("format=m3u8") || value.includes("type=m3u8") || value.includes("protocol=hls"))
    return "hls";
  return "";
}
function selectReplayVideoPlaybackSource(source = {}) {
  const candidates = getReplaySourceCandidates(source);
  const playable = candidates.find((item) => isReplayVideoSource(item.url));
  const fallback = candidates.find((item) => !isDefinitelyUnsupportedReplayUrl(item.url));
  const selected = playable || fallback || null;
  const playUrl = (selected == null ? void 0 : selected.url) || "";
  const mp4Backup = inferReplaySourceType(playUrl) === "hls" ? deriveMp4FromM3u8(playUrl) : "";
  const backupUrl = mp4Backup && mp4Backup !== playUrl ? mp4Backup : "";
  return {
    playUrl,
    backupUrl,
    sourceType: (selected == null ? void 0 : selected.type) || inferReplaySourceType(playUrl)
  };
}
function createVideoPlayer(options = {}) {
  const id = options.id || "liveVideo";
  const getVideoContext = () => {
    var _a;
    try {
      const context = (_a = options.createMediaContext) == null ? void 0 : _a.call(options, id, "video");
      if (context)
        return context;
      return common_vendor.index.createVideoContext ? common_vendor.index.createVideoContext(id) : null;
    } catch (error) {
      return null;
    }
  };
  const getLiveContext = () => {
    var _a;
    try {
      const context = (_a = options.createMediaContext) == null ? void 0 : _a.call(options, id, "live-player");
      if (context)
        return context;
      return common_vendor.index.createLivePlayerContext ? common_vendor.index.createLivePlayerContext(id) : null;
    } catch (error) {
      return null;
    }
  };
  const getContext = () => options.live || player.live ? getLiveContext() || getVideoContext() : getVideoContext() || getLiveContext();
  const player = {
    id,
    url: options.url || "",
    backupUrl: options.backupUrl || "",
    live: !!options.live,
    muted: !!options.muted,
    onEnded: options.onEnded || null,
    play() {
      var _a, _b;
      try {
        (_b = (_a = getContext()) == null ? void 0 : _a.play) == null ? void 0 : _b.call(_a);
      } catch (error) {
      }
    },
    pause() {
      var _a, _b;
      try {
        (_b = (_a = getContext()) == null ? void 0 : _a.pause) == null ? void 0 : _b.call(_a);
      } catch (error) {
      }
    },
    stop() {
      var _a, _b;
      try {
        (_b = (_a = getContext()) == null ? void 0 : _a.stop) == null ? void 0 : _b.call(_a);
      } catch (error) {
      }
    },
    seek(time = 0) {
      var _a, _b;
      try {
        (_b = (_a = getVideoContext()) == null ? void 0 : _a.seek) == null ? void 0 : _b.call(_a, Number(time || 0));
      } catch (error) {
      }
    },
    setMuted(value) {
      this.muted = !!value;
    },
    unmute() {
      this.setMuted(false);
      this.play();
    },
    playFromUserGesture() {
      this.play();
    },
    destroy() {
      var _a, _b;
      try {
        (_b = (_a = getContext()) == null ? void 0 : _a.pause) == null ? void 0 : _b.call(_a);
      } catch (error) {
      }
    },
    _startAutoplayWatchdog() {
    },
    getActiveType() {
      return this.live ? "live-player" : "video";
    },
    getVideoElement() {
      return null;
    }
  };
  return player;
}
exports.createVideoPlayer = createVideoPlayer;
exports.deriveMp4FromM3u8 = deriveMp4FromM3u8;
exports.selectReplayVideoPlaybackSource = selectReplayVideoPlaybackSource;
