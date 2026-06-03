"use strict";
const pages_broadcast_utils_liveSource = require("./live-source.js");
function isLiveStatusPayload(payload) {
  if (!payload || typeof payload !== "object")
    return false;
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
    "view_count"
  ].some((key) => key in payload);
}
function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function resolveLiveStatusPayload(data = {}) {
  var _a, _b;
  if (isLiveStatusPayload((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.payload)) {
    return {
      ...data,
      ...data.data,
      ...data.data.payload
    };
  }
  if (isLiveStatusPayload(data == null ? void 0 : data.payload)) {
    return {
      ...data,
      ...data.payload
    };
  }
  if (isLiveStatusPayload(data == null ? void 0 : data.data)) {
    return {
      ...data,
      ...data.data
    };
  }
  if (isPlainObject(data == null ? void 0 : data.data) || isPlainObject(data == null ? void 0 : data.payload)) {
    return {
      ...data,
      ...isPlainObject(data.payload) ? data.payload : {},
      ...isPlainObject(data.data) ? data.data : {},
      ...isPlainObject((_b = data.data) == null ? void 0 : _b.payload) ? data.data.payload : {}
    };
  }
  if (isLiveStatusPayload(data))
    return data;
  return data;
}
function firstPresent(...values) {
  return values.find((item) => item !== void 0 && item !== null && item !== "");
}
function getStatusNumber(payload = {}, fallback = void 0) {
  return firstPresent(payload.pushStatus, payload.push_status, payload.liveStatus, payload.live_status, payload.status, fallback);
}
function getOnlineCount(payload = {}) {
  return firstPresent(payload.onlineCount, payload.online_count, payload.viewerCount, payload.viewer_count, payload.viewCount, payload.view_count);
}
function getLikeCount(payload = {}) {
  return firstPresent(payload.likeCount, payload.like_count, payload.totalLikes, payload.total_likes);
}
function normalizeStatusPayload(payload = {}) {
  if (!payload || typeof payload !== "object")
    return {};
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
    viewCount: firstPresent(payload.viewCount, payload.view_count)
  };
}
function updateLikeCountFromTotal(ctx, value) {
  if (!ctx.likeCount || value === void 0 || value === null)
    return;
  const next = Number(value);
  if (!Number.isFinite(next))
    return;
  const current = Number(ctx.likeCount.value || 0);
  ctx.likeCount.value = Math.max(Number.isFinite(current) ? current : 0, next);
}
function refreshPinnedMessage(ctx) {
  var _a;
  (_a = ctx.refreshPinnedMessage) == null ? void 0 : _a.call(ctx);
}
function clearMessages(ctx) {
  if (!ctx.messages)
    return;
  ctx.messages.value = [];
  refreshPinnedMessage(ctx);
}
function applyEndedSnapshot(ctx, payload) {
  var _a, _b;
  const prevPushStatus = ctx.pushStatus ? Number(ctx.pushStatus.value) : void 0;
  if (ctx.pushStatus && payload.pushStatus !== void 0 && payload.pushStatus !== null) {
    ctx.pushStatus.value = payload.pushStatus;
  }
  if (ctx.liveStatusText && Number(((_a = ctx.roomGroupType) == null ? void 0 : _a.value) || 0) === 0 && prevPushStatus !== 2) {
    const startStr = String(((_b = ctx.liveStartTime) == null ? void 0 : _b.value) || "").trim();
    const startTs = startStr ? new Date(startStr.replace(/-/g, "/")).getTime() : 0;
    ctx.liveStatusText.value = Number.isFinite(startTs) && startTs > Date.now() ? "未开始" : "未直播";
  }
  if (ctx.pullUrl)
    ctx.pullUrl.value = "";
  if (ctx.isPlaying)
    ctx.isPlaying.value = false;
  clearMessages(ctx);
}
function applyLiveStatusSnapshot(ctx, payload, options = {}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
  if (!payload || typeof payload !== "object")
    return false;
  payload = normalizeStatusPayload(payload);
  const source = options.source || "poll";
  const forceSwitchSameKey = !!options.forceSwitchSameKey;
  const reason = options.reason || "";
  (_a = ctx.updateSignedStreams) == null ? void 0 : _a.call(ctx, payload);
  const preferredQuality = ((_b = ctx.getPreferredLiveQuality) == null ? void 0 : _b.call(ctx)) || "";
  const newPullUrl = pages_broadcast_utils_liveSource.resolveStatusPullUrl(payload, preferredQuality);
  const isReplayProtected = ((_c = ctx.isReplay) == null ? void 0 : _c.value) && !((_d = ctx.isScheduleWarmupMode) == null ? void 0 : _d.call(ctx));
  const canRestoreLiveFromReplay = isReplayProtected && Number(payload.pushStatus) === 1 && !!newPullUrl;
  if (payload.onlineCount !== void 0 || source === "poll") {
    (_f = ctx.setViewerCountDisplay) == null ? void 0 : _f.call(ctx, String(payload.onlineCount ?? ((_e = ctx.viewerCount) == null ? void 0 : _e.value) ?? ""));
  }
  updateLikeCountFromTotal(ctx, payload.likeCount);
  if (isReplayProtected && !canRestoreLiveFromReplay)
    return true;
  if (canRestoreLiveFromReplay) {
    ctx.isReplay.value = false;
    clearMessages(ctx);
    (_g = ctx.recordPlaybackDebugEvent) == null ? void 0 : _g.call(ctx, `${source === "ws" ? "ws_status" : "status_poll"}_restore_live`, {
      pushStatus: payload.pushStatus,
      selectedUrl: newPullUrl,
      selectedQuality: preferredQuality,
      reason
    });
  }
  if (((_h = ctx.isScheduleWarmupMode) == null ? void 0 : _h.call(ctx)) && ((_i = ctx.isWaitingSchedule) == null ? void 0 : _i.value))
    return true;
  if (Number(payload.pushStatus) === 2) {
    applyEndedSnapshot(ctx, payload);
    return true;
  }
  if (ctx.pushStatus && payload.pushStatus !== void 0 && payload.pushStatus !== null) {
    ctx.pushStatus.value = payload.pushStatus;
  }
  if (!ctx.pullUrl)
    return true;
  const oldPullUrl = ctx.pullUrl.value || "";
  const playbackOptions = pages_broadcast_utils_liveSource.buildStatusPlaybackOptions(payload, newPullUrl, preferredQuality);
  const oldSourceKey = pages_broadcast_utils_liveSource.normalizeLiveSourceUrlKey(oldPullUrl);
  const newSourceKey = pages_broadcast_utils_liveSource.normalizeLiveSourceUrlKey(newPullUrl);
  const eventPrefix = source === "ws" ? "ws_status" : "status_poll";
  (_j = ctx.recordPlaybackDebugEvent) == null ? void 0 : _j.call(ctx, `${eventPrefix}_source`, {
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
    forceSwitchSameKey
  });
  if (newPullUrl && !oldPullUrl) {
    ctx.pullUrl.value = newPullUrl;
    if (ctx.isReplay)
      ctx.isReplay.value = false;
    clearMessages(ctx);
    (_k = ctx.initVideoPlayer) == null ? void 0 : _k.call(ctx, newPullUrl, playbackOptions);
  } else if (newPullUrl && oldPullUrl && newSourceKey && oldSourceKey !== newSourceKey) {
    ctx.pullUrl.value = newPullUrl;
    (_l = ctx.recordPlaybackDebugEvent) == null ? void 0 : _l.call(ctx, `${eventPrefix}_source_switch`, {
      from: oldPullUrl,
      to: newPullUrl,
      oldSourceKey,
      newSourceKey
    });
    (_m = ctx.initVideoPlayer) == null ? void 0 : _m.call(ctx, newPullUrl, playbackOptions);
  } else if (newPullUrl && oldPullUrl && forceSwitchSameKey) {
    ctx.pullUrl.value = newPullUrl;
    (_n = ctx.recordPlaybackDebugEvent) == null ? void 0 : _n.call(ctx, `${eventPrefix}_source_forced_switch`, {
      from: oldPullUrl,
      to: newPullUrl,
      oldSourceKey,
      newSourceKey,
      reason
    });
    (_o = ctx.initVideoPlayer) == null ? void 0 : _o.call(ctx, newPullUrl, playbackOptions);
  } else {
    ctx.pullUrl.value = newPullUrl;
    const player = newPullUrl ? (_p = ctx.getVideoPlayer) == null ? void 0 : _p.call(ctx) : null;
    if (player && typeof player.updateSources === "function") {
      player.updateSources(newPullUrl, playbackOptions);
    }
  }
  return true;
}
exports.applyLiveStatusSnapshot = applyLiveStatusSnapshot;
exports.resolveLiveStatusPayload = resolveLiveStatusPayload;
