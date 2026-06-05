import {
  buildStatusPlaybackOptions,
  normalizeLiveSourceUrlKey,
  resolveStatusPullUrl,
} from "./live-source.js";

export function isLiveStatusPayload(payload) {
  if (!payload || typeof payload !== "object") return false;
  return [
    "pushStatus",
    "push_status",
    "liveStatus",
    "live_status",
    "status",
    "pullUrl",
    "pull_url",
    "pullRtmpUrl",
    "pull_rtmp_url",
    "pullFlvUrl",
    "pull_flv_url",
    "pullHlsUrl",
    "pull_hls_url",
    "pullStreams",
    "pull_streams",
    "streamList",
    "stream_list",
    "onlineCount",
    "online_count",
    "likeCount",
    "like_count",
    "viewCount",
    "view_count",
  ].some((key) => key in payload);
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function resolveLiveStatusPayload(data = {}) {
  if (isLiveStatusPayload(data?.data?.payload)) {
    return {
      ...data,
      ...data.data,
      ...data.data.payload,
    };
  }
  if (isLiveStatusPayload(data?.payload)) {
    return {
      ...data,
      ...data.payload,
    };
  }
  if (isLiveStatusPayload(data?.data)) {
    return {
      ...data,
      ...data.data,
    };
  }
  if (isPlainObject(data?.data) || isPlainObject(data?.payload)) {
    return {
      ...data,
      ...(isPlainObject(data.payload) ? data.payload : {}),
      ...(isPlainObject(data.data) ? data.data : {}),
      ...(isPlainObject(data.data?.payload) ? data.data.payload : {}),
    };
  }
  if (isLiveStatusPayload(data)) return data;
  return data;
}

function firstPresent(...values) {
  return values.find((item) => item !== undefined && item !== null && item !== "");
}

function getStatusNumber(payload = {}, fallback = undefined) {
  return firstPresent(payload.pushStatus, payload.push_status, payload.liveStatus, payload.live_status, payload.status, fallback);
}

function getOnlineCount(payload = {}) {
  return firstPresent(payload.onlineCount, payload.online_count, payload.viewerCount, payload.viewer_count, payload.viewCount, payload.view_count);
}

function getLikeCount(payload = {}) {
  return firstPresent(payload.likeCount, payload.like_count, payload.totalLikes, payload.total_likes);
}

function normalizeStatusPayload(payload = {}) {
  if (!payload || typeof payload !== "object") return {};
  return {
    ...payload,
    pushStatus: getStatusNumber(payload),
    pullUrl: firstPresent(payload.pullUrl, payload.pull_url, payload.streamUrl, payload.stream_url, payload.liveUrl, payload.live_url, payload.playUrl, payload.play_url, payload.url, ""),
    pullRtmpUrl: firstPresent(payload.pullRtmpUrl, payload.pull_rtmp_url, payload.rtmpUrl, payload.rtmp_url, payload.rtmp, ""),
    pullFlvUrl: firstPresent(payload.pullFlvUrl, payload.pull_flv_url, payload.flvUrl, payload.flv_url, payload.flv, ""),
    pullHlsUrl: firstPresent(payload.pullHlsUrl, payload.pull_hls_url, payload.hlsUrl, payload.hls_url, payload.m3u8Url, payload.m3u8_url, ""),
    pullStreams: firstPresent(payload.pullStreams, payload.pull_streams, payload.streamList, payload.stream_list, payload.streams, payload.liveStreams, payload.live_streams, []),
    onlineCount: getOnlineCount(payload),
    likeCount: getLikeCount(payload),
    viewCount: firstPresent(payload.viewCount, payload.view_count),
  };
}

function updateLikeCountFromTotal(ctx, value) {
  if (!ctx.likeCount || value === undefined || value === null) return;
  const next = Number(value);
  if (!Number.isFinite(next)) return;
  const current = Number(ctx.likeCount.value || 0);
  ctx.likeCount.value = Math.max(Number.isFinite(current) ? current : 0, next);
}

function refreshPinnedMessage(ctx) {
  ctx.refreshPinnedMessage?.();
}

function clearMessages(ctx) {
  if (!ctx.messages) return;
  ctx.messages.value = [];
  refreshPinnedMessage(ctx);
}

function updatePlayerSources(player, newPullUrl, playbackOptions) {
  if (player && typeof player.updateSources === "function") {
    player.updateSources(newPullUrl, playbackOptions);
  }
}

function shouldKeepActivePlaybackSource(ctx, player, options = {}) {
  if (!player?.url) return false;
  if (options.source !== "poll") return false;
  if (options.forceSwitchSameKey) return false;
  if (options.reason !== "playback_resume") return false;
  if (ctx.isPlaying?.value !== true) return false;
  if (ctx.videoFrameReady && ctx.videoFrameReady.value !== true) return false;
  return true;
}

function applyEndedSnapshot(ctx, payload) {
  const prevPushStatus = ctx.pushStatus ? Number(ctx.pushStatus.value) : undefined;
  if (ctx.pushStatus && payload.pushStatus !== undefined && payload.pushStatus !== null) {
    ctx.pushStatus.value = payload.pushStatus;
  }
  if (
    ctx.liveStatusText &&
    Number(ctx.roomGroupType?.value || 0) === 0 &&
    prevPushStatus !== 2
  ) {
    const startStr = String(ctx.liveStartTime?.value || "").trim();
    const startTs = startStr ? new Date(startStr.replace(/-/g, "/")).getTime() : 0;
    ctx.liveStatusText.value =
      Number.isFinite(startTs) && startTs > Date.now() ? "未开始" : "未直播";
  }
  if (ctx.pullUrl) ctx.pullUrl.value = "";
  if (ctx.isPlaying) ctx.isPlaying.value = false;
  clearMessages(ctx);
}

export function applyLiveStatusSnapshot(ctx, payload, options = {}) {
  if (!payload || typeof payload !== "object") return false;
  payload = normalizeStatusPayload(payload);
  const source = options.source || "poll";
  const forceSwitchSameKey = !!options.forceSwitchSameKey;
  const reason = options.reason || "";
  ctx.updateSignedStreams?.(payload);
  const preferredQuality = ctx.getPreferredLiveQuality?.() || "";
  const newPullUrl = resolveStatusPullUrl(payload, preferredQuality);
  const isReplayProtected = ctx.isReplay?.value && !ctx.isScheduleWarmupMode?.();
  const canRestoreLiveFromReplay = isReplayProtected && Number(payload.pushStatus) === 1 && !!newPullUrl;

  if (payload.onlineCount !== undefined || source === "poll") {
    ctx.setViewerCountDisplay?.(String(payload.onlineCount ?? ctx.viewerCount?.value ?? ""));
  }
  updateLikeCountFromTotal(ctx, payload.likeCount);

  if (isReplayProtected && !canRestoreLiveFromReplay) return true;
  if (canRestoreLiveFromReplay) {
    ctx.isReplay.value = false;
    clearMessages(ctx);
    ctx.recordPlaybackDebugEvent?.(`${source === "ws" ? "ws_status" : "status_poll"}_restore_live`, {
      pushStatus: payload.pushStatus,
      selectedUrl: newPullUrl,
      selectedQuality: preferredQuality,
      reason,
    });
  }
  if (ctx.isScheduleWarmupMode?.() && ctx.isWaitingSchedule?.value) return true;

  if (Number(payload.pushStatus) === 2) {
    applyEndedSnapshot(ctx, payload);
    return true;
  }

  if (ctx.pushStatus && payload.pushStatus !== undefined && payload.pushStatus !== null) {
    ctx.pushStatus.value = payload.pushStatus;
  }
  if (!ctx.pullUrl) return true;

  const oldPullUrl = ctx.pullUrl.value || "";
  const playbackOptions = buildStatusPlaybackOptions(payload, newPullUrl, preferredQuality);
  const oldSourceKey = normalizeLiveSourceUrlKey(oldPullUrl);
  const newSourceKey = normalizeLiveSourceUrlKey(newPullUrl);
  const eventPrefix = source === "ws" ? "ws_status" : "status_poll";

  ctx.recordPlaybackDebugEvent?.(`${eventPrefix}_source`, {
    pushStatus: payload.pushStatus,
    pullUrl: payload.pullUrl || "",
    pullFlvUrl: payload.pullFlvUrl || "",
    pullHlsUrl: payload.pullHlsUrl || "",
    selectedUrl: newPullUrl,
    selectedQuality: playbackOptions.liveQuality || preferredQuality || "",
    pullStreams: Array.isArray(payload.pullStreams) ? payload.pullStreams.length : 0,
    oldSourceKey,
    newSourceKey,
    reason,
    forceSwitchSameKey,
  });

  if (newPullUrl && !oldPullUrl) {
    ctx.pullUrl.value = newPullUrl;
    if (ctx.isReplay) ctx.isReplay.value = false;
    clearMessages(ctx);
    ctx.initVideoPlayer?.(newPullUrl, playbackOptions);
  } else if (newPullUrl && oldPullUrl && newSourceKey && oldSourceKey !== newSourceKey) {
    const player = ctx.getVideoPlayer?.();
    if (shouldKeepActivePlaybackSource(ctx, player, options)) {
      ctx.pullUrl.value = newPullUrl;
      updatePlayerSources(player, newPullUrl, playbackOptions);
      ctx.recordPlaybackDebugEvent?.(`${eventPrefix}_source_keep_active`, {
        activeUrl: player.url || "",
        selectedUrl: newPullUrl,
        oldSourceKey,
        newSourceKey,
        reason,
      });
      return true;
    }
    ctx.pullUrl.value = newPullUrl;
    ctx.recordPlaybackDebugEvent?.(`${eventPrefix}_source_switch`, {
      from: oldPullUrl,
      to: newPullUrl,
      oldSourceKey,
      newSourceKey,
    });
    ctx.initVideoPlayer?.(newPullUrl, playbackOptions);
  } else if (newPullUrl && oldPullUrl && forceSwitchSameKey) {
    ctx.pullUrl.value = newPullUrl;
    ctx.recordPlaybackDebugEvent?.(`${eventPrefix}_source_forced_switch`, {
      from: oldPullUrl,
      to: newPullUrl,
      oldSourceKey,
      newSourceKey,
      reason,
    });
    ctx.initVideoPlayer?.(newPullUrl, playbackOptions);
  } else {
    ctx.pullUrl.value = newPullUrl;
    const player = newPullUrl ? ctx.getVideoPlayer?.() : null;
    updatePlayerSources(player, newPullUrl, playbackOptions);
  }
  return true;
}
