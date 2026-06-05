import { computed, ref } from "vue";
import { normalizeLiveSourceUrlKey } from "../utils/live-source.js";

const MAX_DEBUG_EVENTS = 80;
const SECRET_QUERY_KEYS = ["auth_key", "txSecret", "txTime", "sign", "signature", "token", "key"];

function safeValue(value) {
  if (value === undefined || value === null) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (e) {
    return String(value);
  }
}

function sanitizePlaybackUrl(url = "") {
  const rawUrl = String(url || "").trim();
  if (!rawUrl) return "";
  return rawUrl.replace(
    new RegExp(`([?&](?:${SECRET_QUERY_KEYS.join("|")})=)[^&#]+`, "ig"),
    "$1***",
  );
}

function buildUrlIdentity(url = "") {
  const rawUrl = String(url || "").trim();
  return {
    rawUrl,
    sanitizedUrl: sanitizePlaybackUrl(rawUrl),
    sourceKey: normalizeLiveSourceUrlKey(rawUrl),
  };
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
      windowWidth: Number(info.windowWidth || 0),
      windowHeight: Number(info.windowHeight || 0),
      screenWidth: Number(info.screenWidth || 0),
      screenHeight: Number(info.screenHeight || 0),
      pixelRatio: Number(info.pixelRatio || 0),
      safeArea: info.safeArea || null,
      statusBarHeight: Number(info.statusBarHeight || 0),
    };
  } catch (e) {
    return {};
  }
}

function resolveActiveMediaComponent(snapshot = {}, player = null) {
  if (snapshot.mediaSourceComponent) return snapshot.mediaSourceComponent;
  if (player?.sourceComponent) return player.sourceComponent;
  if (snapshot.isReplay) return "video";
  if (player?.live === true) return "live-player";
  return "";
}

function readMediaContainerSnapshot(snapshot = {}, runtime = {}) {
  const mode = snapshot.mode || "";
  const isPortrait = mode !== "landscape";
  const windowWidth = Number(runtime.windowWidth || runtime.screenWidth || 0);
  const windowHeight = Number(runtime.windowHeight || runtime.screenHeight || 0);
  return {
    stageMode: mode,
    mediaId: "liveVideo",
    cssWidth: isPortrait ? "750rpx" : "100%",
    cssHeight: isPortrait ? "100vh" : "100%",
    viewportWidth: windowWidth,
    viewportHeight: windowHeight,
    screenWidth: Number(runtime.screenWidth || 0),
    screenHeight: Number(runtime.screenHeight || 0),
    videoObjectFit: "cover",
    livePlayerObjectFit: "fillCrop",
  };
}

function readVideoPlayer(player, snapshot = {}) {
  const activeUrl = player?.url || snapshot.displayVideoUrl || snapshot.videoUrl || snapshot.pullUrl || "";
  if (!player) {
    return {
      exists: false,
      activeComponent: resolveActiveMediaComponent(snapshot, null),
      sourceType: snapshot.mediaSourceType || "",
      ...buildUrlIdentity(activeUrl),
    };
  }
  return {
    exists: true,
    activeComponent: resolveActiveMediaComponent(snapshot, player),
    sourceComponent: player.sourceComponent || "",
    sourceType: player.sourceType || snapshot.mediaSourceType || "",
    activeType: typeof player.getActiveType === "function" ? player.getActiveType() : "",
    ...buildUrlIdentity(activeUrl),
    backupUrl: sanitizePlaybackUrl(player.backupUrl || ""),
    backupFlvUrl: sanitizePlaybackUrl(player.backupFlvUrl || ""),
    backupHlsUrl: sanitizePlaybackUrl(player.backupHlsUrl || ""),
    backupRtmpUrl: sanitizePlaybackUrl(player.backupRtmpUrl || ""),
    muted: !!player.muted,
    live: !!player.live,
    liveQuality: player.liveQuality || "",
    liveCandidates: Array.isArray(player.liveCandidates)
      ? player.liveCandidates.map((candidate) => ({
        type: candidate?.type || "",
        component: candidate?.component || "",
        field: candidate?.field || "",
        isAdaptiveHls: candidate?.isAdaptiveHls === true,
        ...buildUrlIdentity(candidate?.url || ""),
      }))
      : [],
  };
}

function readSoundPolicy(snapshot = {}, player = null, events = []) {
  const restoreEvent = [...events]
    .reverse()
    .find((event) => event?.type === "mini_player_sound_restore");
  return {
    requestedMuted: false,
    stateMuted: snapshot.isMuted === true,
    playerMuted: !!player?.muted,
    effectiveMuted: snapshot.isMuted === true || !!player?.muted,
    soundMode: "speaker",
    showMuteButton: false,
    entryOverlayVisible: !!snapshot.shouldShowEntryOverlay,
    rawEntryOverlayState: !!snapshot.showEntryOverlay,
    nativeRestoreAttempted: !!restoreEvent,
    nativeRestoreApplied: restoreEvent?.payload?.applied === true,
    nativeRestoreComponent: restoreEvent?.payload?.sourceComponent || resolveActiveMediaComponent(snapshot, player),
    nativeRestorePath: "video:setMuted(false)+setVolume(1)+play; live-player:unmute+setSoundMode(speaker)+play+resume",
    autoplayPolicyNote: "mp-weixin may still require a user gesture before audible autoplay; this page does not block first paint with an entry overlay.",
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
      ...buildUrlIdentity(url),
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
    const runtime = readMiniRuntimeSnapshot();
    return JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        runtime,
        page: snapshot,
        media: {
          activeComponent: resolveActiveMediaComponent(snapshot, player),
          sourceType: snapshot.mediaSourceType || player?.sourceType || "",
          currentUrl: buildUrlIdentity(snapshot.displayVideoUrl || player?.url || snapshot.videoUrl || snapshot.pullUrl || ""),
          pullUrl: buildUrlIdentity(snapshot.pullUrl || ""),
          videoUrl: buildUrlIdentity(snapshot.videoUrl || ""),
          container: readMediaContainerSnapshot(snapshot, runtime),
          soundPolicy: readSoundPolicy(snapshot, player, events.value),
        },
        videoPlayer: readVideoPlayer(player, snapshot),
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
