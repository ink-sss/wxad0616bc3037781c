"use strict";
const common_vendor = require("../../../common/vendor.js");
function safeValue(value) {
  if (value === void 0 || value === null)
    return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (e) {
    return String(value);
  }
}
function readMiniRuntimeSnapshot() {
  try {
    const info = typeof common_vendor.index.getSystemInfoSync === "function" ? common_vendor.index.getSystemInfoSync() : {};
    return {
      platform: info.platform || "",
      system: info.system || "",
      model: info.model || "",
      SDKVersion: info.SDKVersion || "",
      appName: info.appName || ""
    };
  } catch (e) {
    return {};
  }
}
function readVideoPlayer(player) {
  if (!player)
    return { exists: false };
  return {
    exists: true,
    url: player.url || "",
    backupUrl: player.backupUrl || "",
    backupFlvUrl: player.backupFlvUrl || "",
    backupHlsUrl: player.backupHlsUrl || "",
    activeType: typeof player.getActiveType === "function" ? player.getActiveType() : "",
    muted: !!player.muted,
    live: !!player.live
  };
}
function buildSummary(events) {
  const last = events[events.length - 1];
  if (!last)
    return "等待播放事件";
  return `${last.type} · ${last.timeText}`;
}
function useLivePlaybackDebug(options = {}) {
  const events = common_vendor.ref([]);
  const urlProbes = common_vendor.ref([]);
  function isDebugEnabled() {
    if (typeof options.enabled === "function")
      return !!options.enabled();
    return options.enabled !== false;
  }
  function recordPlaybackDebugEvent(type, payload = {}) {
    if (!isDebugEnabled())
      return;
    const event = {
      ts: Date.now(),
      timeText: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      type,
      payload: safeValue(payload)
    };
    events.value = [...events.value.slice(-80 + 1), event];
  }
  function probePlaybackUrl(url, label = "playback") {
    if (!isDebugEnabled() || !url)
      return;
    const probe = {
      ts: Date.now(),
      timeText: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      label,
      url,
      ok: true,
      note: "mini media component owns playback probing"
    };
    urlProbes.value = [...urlProbes.value.slice(-9), probe];
    recordPlaybackDebugEvent("url_probe", probe);
  }
  const playbackDebugSummary = common_vendor.computed(() => buildSummary(events.value));
  const playbackDebugReport = common_vendor.computed(() => {
    const snapshot = typeof options.getSnapshot === "function" ? safeValue(options.getSnapshot()) : {};
    const player = typeof options.getVideoPlayer === "function" ? options.getVideoPlayer() : null;
    return JSON.stringify(
      {
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        runtime: readMiniRuntimeSnapshot(),
        page: snapshot,
        videoPlayer: readVideoPlayer(player),
        urlProbes: safeValue(urlProbes.value),
        events: safeValue(events.value)
      },
      null,
      2
    );
  });
  return {
    playbackDebugReport,
    playbackDebugSummary,
    recordPlaybackDebugEvent,
    probePlaybackUrl
  };
}
exports.useLivePlaybackDebug = useLivePlaybackDebug;
