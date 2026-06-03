import { computed, ref } from "vue";

const MAX_DEBUG_EVENTS = 80;

function safeValue(value) {
  if (value === undefined || value === null) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (e) {
    return String(value);
  }
}

function readMiniRuntimeSnapshot() {
  try {
    const info = typeof uni.getSystemInfoSync === "function" ? uni.getSystemInfoSync() : {};
    return {
      platform: info.platform || "",
      system: info.system || "",
      model: info.model || "",
      SDKVersion: info.SDKVersion || "",
      appName: info.appName || "",
    };
  } catch (e) {
    return {};
  }
}

function readVideoPlayer(player) {
  if (!player) return { exists: false };
  return {
    exists: true,
    url: player.url || "",
    backupUrl: player.backupUrl || "",
    backupFlvUrl: player.backupFlvUrl || "",
    backupHlsUrl: player.backupHlsUrl || "",
    activeType: typeof player.getActiveType === "function" ? player.getActiveType() : "",
    muted: !!player.muted,
    live: !!player.live,
  };
}

function buildSummary(events) {
  const last = events[events.length - 1];
  if (!last) return "等待播放事件";
  return `${last.type} · ${last.timeText}`;
}

export function useLivePlaybackDebug(options = {}) {
  const events = ref([]);
  const urlProbes = ref([]);

  function isDebugEnabled() {
    if (typeof options.enabled === "function") return !!options.enabled();
    return options.enabled !== false;
  }

  function recordPlaybackDebugEvent(type, payload = {}) {
    if (!isDebugEnabled()) return;
    const event = {
      ts: Date.now(),
      timeText: new Date().toLocaleTimeString(),
      type,
      payload: safeValue(payload),
    };
    events.value = [...events.value.slice(-MAX_DEBUG_EVENTS + 1), event];
  }

  function probePlaybackUrl(url, label = "playback") {
    if (!isDebugEnabled() || !url) return;
    const probe = {
      ts: Date.now(),
      timeText: new Date().toLocaleTimeString(),
      label,
      url,
      ok: true,
      note: "mini media component owns playback probing",
    };
    urlProbes.value = [...urlProbes.value.slice(-9), probe];
    recordPlaybackDebugEvent("url_probe", probe);
  }

  const playbackDebugSummary = computed(() => buildSummary(events.value));

  const playbackDebugReport = computed(() => {
    const snapshot = typeof options.getSnapshot === "function" ? safeValue(options.getSnapshot()) : {};
    const player = typeof options.getVideoPlayer === "function" ? options.getVideoPlayer() : null;
    return JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        runtime: readMiniRuntimeSnapshot(),
        page: snapshot,
        videoPlayer: readVideoPlayer(player),
        urlProbes: safeValue(urlProbes.value),
        events: safeValue(events.value),
      },
      null,
      2,
    );
  });

  return {
    playbackDebugReport,
    playbackDebugSummary,
    recordPlaybackDebugEvent,
    probePlaybackUrl,
  };
}
