"use strict";
const api_live = require("../../../api/live.js");
const utils_liveRoute = require("../../../utils/live-route.js");
const utils_videoPlay = require("../../../utils/videoPlay.js");
const pages_broadcast_utils_entryFormat = require("../utils/entry-format.js");
const pages_broadcast_utils_liveSource = require("../utils/live-source.js");
const LIVE_STREAM_INFO_RETRY_COUNT = 5;
const LIVE_STREAM_INFO_RETRY_DELAY = 300;
function firstPresent(...values) {
  return values.find((item) => item !== void 0 && item !== null && item !== "");
}
function resolveLivePullUrl(detail, preferHls) {
  if (!detail)
    return "";
  const rtmpUrl = firstPresent(
    detail.pullRtmpUrl,
    detail.pull_rtmp_url,
    detail.pullRtmp,
    detail.pull_rtmp,
    detail.rtmpUrl,
    detail.rtmp_url,
    detail.liveRtmpUrl,
    detail.live_rtmp_url,
    detail.rtmpPullUrl,
    detail.rtmp_pull_url
  );
  const flvUrl = firstPresent(
    detail.pullFlvUrl,
    detail.pull_flv_url,
    detail.httpFlvUrl,
    detail.http_flv_url,
    detail.pullHttpFlvUrl,
    detail.pull_http_flv_url,
    detail.flvUrl,
    detail.flv_url,
    detail.liveFlvUrl,
    detail.live_flv_url,
    detail.flvPullUrl,
    detail.flv_pull_url
  );
  const hlsUrl = firstPresent(
    detail.pullHlsUrl,
    detail.pull_hls_url,
    detail.adaptiveHlsUrl,
    detail.adaptive_hls_url,
    detail.liveAdaptiveHlsUrl,
    detail.live_adaptive_hls_url,
    detail.httpHlsUrl,
    detail.http_hls_url,
    detail.pullHttpHlsUrl,
    detail.pull_http_hls_url,
    detail.hlsUrl,
    detail.hls_url,
    detail.liveHlsUrl,
    detail.live_hls_url,
    detail.hlsPullUrl,
    detail.hls_pull_url,
    detail.m3u8Url,
    detail.m3u8_url,
    detail.m3u8,
    detail.hls
  );
  const genericUrl = firstPresent(
    detail.pullUrl,
    detail.pull_url,
    detail.streamUrl,
    detail.stream_url,
    detail.liveUrl,
    detail.live_url,
    detail.playUrl,
    detail.play_url,
    detail.sourceUrl,
    detail.source_url,
    detail.mediaUrl,
    detail.media_url,
    detail.src,
    detail.url
  );
  if (rtmpUrl && !preferHls)
    return rtmpUrl;
  if (preferHls) {
    return hlsUrl || flvUrl || rtmpUrl || genericUrl || "";
  }
  return flvUrl || hlsUrl || genericUrl || rtmpUrl || "";
}
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function resolveLiveRtcConfig(detail) {
  if (!detail || Number(detail.streamingProvider) !== 1 || !detail.rtcAppId || !detail.rtcChannel || !detail.rtcToken) {
    return null;
  }
  return {
    appId: detail.rtcAppId,
    channel: detail.rtcChannel,
    token: detail.rtcToken,
    uid: String(detail.rtcUid || detail.customerId || 0)
  };
}
function mergePullStreams(detail, streamInfo, preferHls) {
  const seen = /* @__PURE__ */ new Set();
  return [
    ...pages_broadcast_utils_liveSource.normalizePullStreams(streamInfo, preferHls),
    ...pages_broadcast_utils_liveSource.normalizePullStreams(detail, preferHls)
  ].filter((stream) => {
    const key = stream.sourceKey || stream.playUrl || `${stream.quality}:${stream.playUrl}`;
    if (!key || seen.has(key))
      return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.rank - b.rank);
}
function findCandidateUrl(candidates, type, mainUrl = "") {
  var _a;
  return ((_a = candidates.find((candidate) => candidate.type === type && candidate.url && candidate.url !== mainUrl)) == null ? void 0 : _a.url) || "";
}
function buildLivePlayerSource(detail, preferHls, preferredQuality = "", streamInfo = {}) {
  var _a;
  const rtc = resolveLiveRtcConfig(detail) || resolveLiveRtcConfig(streamInfo);
  const pullStreams = mergePullStreams(detail, streamInfo, preferHls);
  const selectedStream = pages_broadcast_utils_liveSource.selectDefaultStream(pullStreams, preferredQuality);
  const liveCandidates = utils_liveRoute.getMiniProgramLiveCandidates(detail, streamInfo);
  const primaryCandidate = pages_broadcast_utils_liveSource.selectMiniProgramLiveCandidate(liveCandidates, { preferHls });
  const rawMainUrl = (primaryCandidate == null ? void 0 : primaryCandidate.url) || (selectedStream == null ? void 0 : selectedStream.playUrl) || resolveLivePullUrl(detail, preferHls) || resolveLivePullUrl(streamInfo, preferHls);
  if (!rawMainUrl) {
    return {
      key: "",
      mainUrl: "",
      options: { pullStreams, liveCandidates },
      rtcConfig: null,
      stream: null,
      pullStreams,
      liveCandidates
    };
  }
  if (!primaryCandidate && selectedStream) {
    return {
      key: `url:${selectedStream.sourceKey}`,
      mainUrl: selectedStream.playUrl,
      options: {
        ...pages_broadcast_utils_liveSource.buildStreamPlaybackOptions(selectedStream),
        rtcConfig: rtc,
        pullStreams,
        liveCandidates
      },
      rtcConfig: rtc,
      stream: selectedStream,
      pullStreams,
      liveCandidates
    };
  }
  const backupRtmpUrl = findCandidateUrl(liveCandidates, "rtmp", rawMainUrl);
  const backupFlvUrl = findCandidateUrl(liveCandidates, "flv", rawMainUrl);
  const backupHlsUrl = findCandidateUrl(liveCandidates, "hls", rawMainUrl);
  const nextCandidateUrl = ((_a = liveCandidates.find((candidate) => candidate.url && candidate.url !== rawMainUrl)) == null ? void 0 : _a.url) || "";
  const mainKey = pages_broadcast_utils_liveSource.normalizeLiveSourceUrlKey(rawMainUrl);
  const backupRtmpKey = pages_broadcast_utils_liveSource.normalizeLiveSourceUrlKey(backupRtmpUrl);
  const backupFlvKey = pages_broadcast_utils_liveSource.normalizeLiveSourceUrlKey(backupFlvUrl);
  const backupHlsKey = pages_broadcast_utils_liveSource.normalizeLiveSourceUrlKey(backupHlsUrl);
  return {
    key: `url:${mainKey}:${backupRtmpKey}:${backupFlvKey}:${backupHlsKey}`,
    mainUrl: rawMainUrl,
    options: {
      backupUrl: nextCandidateUrl || (preferHls ? backupHlsUrl : backupFlvUrl || backupHlsUrl || ""),
      backupRtmpUrl,
      backupFlvUrl,
      backupHlsUrl,
      rtcConfig: rtc,
      pullStreams,
      liveCandidates,
      sourceType: (primaryCandidate == null ? void 0 : primaryCandidate.type) || "",
      sourceComponent: (primaryCandidate == null ? void 0 : primaryCandidate.component) || ""
    },
    rtcConfig: rtc,
    stream: selectedStream,
    pullStreams,
    liveCandidates
  };
}
function summarizeLiveSourcePayload(payload = {}, source = {}) {
  var _a, _b, _c, _d, _e;
  return {
    pushStatus: payload.pushStatus,
    streamingProvider: payload.streamingProvider,
    pullUrl: payload.pullUrl || "",
    pullFlvUrl: payload.pullFlvUrl || "",
    pullHlsUrl: payload.pullHlsUrl || "",
    adaptiveHlsUrl: payload.adaptiveHlsUrl || payload.adaptive_hls_url || "",
    pullRtmpUrl: payload.pullRtmpUrl || "",
    selectedUrl: source.mainUrl || "",
    backupUrl: ((_a = source.options) == null ? void 0 : _a.backupUrl) || "",
    backupFlvUrl: ((_b = source.options) == null ? void 0 : _b.backupFlvUrl) || "",
    backupHlsUrl: ((_c = source.options) == null ? void 0 : _c.backupHlsUrl) || "",
    pullStreams: Array.isArray(payload.pullStreams) ? payload.pullStreams.length : 0,
    selectedQuality: ((_d = source.stream) == null ? void 0 : _d.quality) || ((_e = source.options) == null ? void 0 : _e.liveQuality) || "",
    sourceKey: source.key || "",
    hasRtcConfig: !!source.rtcConfig
  };
}
function hasPlayableLiveStreamInfo(info) {
  const source = buildLivePlayerSource(info, pages_broadcast_utils_liveSource.isIOSRuntime());
  return !!source.key;
}
function parseLiveStartTs(detail) {
  const start = (detail == null ? void 0 : detail.startTime) || (detail == null ? void 0 : detail.scheduleTime) || "";
  if (!start)
    return 0;
  return pages_broadcast_utils_entryFormat.safeParseReplayTime(String(start));
}
function isLiveNotStartedDetail(detail) {
  const statusText = String((detail == null ? void 0 : detail.liveStatusText) || "").trim();
  if (statusText.includes("未开始") || statusText.includes("未开播"))
    return true;
  const startTs = parseLiveStartTs(detail);
  return Number((detail == null ? void 0 : detail.pushStatus) || 0) !== 1 && startTs > Date.now();
}
function isReplayPortraitEntryMode(resolvedMode, currentMode) {
  return (resolvedMode || currentMode || "portrait") === "portrait";
}
function normalizeReplayFirstVideoPayload(firstVideo) {
  if (!firstVideo || firstVideo.hasVideo === false)
    return null;
  const toNumber = (value, fallback = 0) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  };
  const replaySource = utils_videoPlay.selectReplayVideoPlaybackSource(firstVideo);
  const videoUrl = replaySource.playUrl || "";
  const videoId = toNumber(firstPresent(firstVideo.videoId, firstVideo.video_id, firstVideo.id, firstVideo.replayVideoId, firstVideo.replay_video_id), 0);
  return {
    id: videoId,
    videoId,
    video_id: videoId,
    replayVideoId: videoId,
    replay_video_id: videoId,
    termId: toNumber(firstPresent(firstVideo.termId, firstVideo.term_id, firstVideo.liveTermId, firstVideo.live_term_id, firstVideo.term), 0),
    term_id: toNumber(firstPresent(firstVideo.termId, firstVideo.term_id, firstVideo.liveTermId, firstVideo.live_term_id, firstVideo.term), 0),
    videoName: firstPresent(firstVideo.videoName, firstVideo.video_name, firstVideo.name, firstVideo.title, ""),
    video_name: firstPresent(firstVideo.videoName, firstVideo.video_name, firstVideo.name, firstVideo.title, ""),
    videoUrl,
    video_url: videoUrl,
    backupUrl: replaySource.backupUrl || "",
    backup_url: replaySource.backupUrl || "",
    sourceType: replaySource.sourceType || "",
    source_type: replaySource.sourceType || "",
    coverImage: firstPresent(firstVideo.coverImage, firstVideo.cover_image, firstVideo.cover, firstVideo.image, firstVideo.imageUrl, firstVideo.image_url, firstVideo.poster, ""),
    cover_image: firstPresent(firstVideo.coverImage, firstVideo.cover_image, firstVideo.cover, firstVideo.image, firstVideo.imageUrl, firstVideo.image_url, firstVideo.poster, ""),
    duration: toNumber(firstPresent(firstVideo.duration, firstVideo.durationSec, firstVideo.duration_sec, firstVideo.videoDuration, firstVideo.video_duration, firstVideo.length, firstVideo.seconds), 0),
    startTime: firstPresent(firstVideo.startTime, firstVideo.start_time, firstVideo.beginTime, firstVideo.begin_time, firstVideo.playStartTime, firstVideo.play_start_time, ""),
    start_time: firstPresent(firstVideo.startTime, firstVideo.start_time, firstVideo.beginTime, firstVideo.begin_time, firstVideo.playStartTime, firstVideo.play_start_time, ""),
    elapsedSeconds: Math.max(0, toNumber(firstPresent(firstVideo.elapsedSeconds, firstVideo.elapsed_seconds, firstVideo.currentSeconds, firstVideo.current_seconds), 0))
  };
}
async function getLiveStreamInfWithRetry(roomCode) {
  for (let i = 0; i < LIVE_STREAM_INFO_RETRY_COUNT; i += 1) {
    try {
      const result = await api_live.getLiveStreamInf(roomCode);
      if (!result || Number(result.pushStatus || 0) !== 1) {
        return result || null;
      }
      if (hasPlayableLiveStreamInfo(result)) {
        return result;
      }
    } catch (e) {
    }
    if (i < LIVE_STREAM_INFO_RETRY_COUNT - 1) {
      await wait(LIVE_STREAM_INFO_RETRY_DELAY);
    }
  }
  return null;
}
exports.buildLivePlayerSource = buildLivePlayerSource;
exports.getLiveStreamInfWithRetry = getLiveStreamInfWithRetry;
exports.isLiveNotStartedDetail = isLiveNotStartedDetail;
exports.isReplayPortraitEntryMode = isReplayPortraitEntryMode;
exports.normalizeReplayFirstVideoPayload = normalizeReplayFirstVideoPayload;
exports.summarizeLiveSourcePayload = summarizeLiveSourcePayload;
