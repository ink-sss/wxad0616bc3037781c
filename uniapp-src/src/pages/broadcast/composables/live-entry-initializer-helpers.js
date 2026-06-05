import { getLiveStreamInf } from "@/api/live.js";
import { getMiniProgramLiveCandidates } from "@/utils/live-route.js";
import { selectReplayVideoPlaybackSource } from "@/utils/videoPlay.js";
import { safeParseReplayTime } from "../utils/entry-format.js";
import {
  buildStreamPlaybackOptions,
  isIOSRuntime,
  normalizeLiveSourceUrlKey,
  normalizePullStreams,
  selectMiniProgramLiveCandidate,
  selectDefaultStream,
} from "../utils/live-source.js";

export { isIOSRuntime, normalizeLiveSourceUrlKey };

const LIVE_STREAM_INFO_RETRY_COUNT = 5;
const LIVE_STREAM_INFO_RETRY_DELAY = 300;

function firstPresent(...values) {
  return values.find((item) => item !== undefined && item !== null && item !== "");
}

export function resolveLivePullUrl(detail, preferHls) {
  if (!detail) return "";
  const adaptiveHlsUrl = firstPresent(
    detail.adaptiveHlsUrl,
    detail.adaptive_hls_url,
    detail.liveAdaptiveHlsUrl,
    detail.live_adaptive_hls_url,
  );
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
    detail.rtmp_pull_url,
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
    detail.flv_pull_url,
  );
  const normalHlsUrl = firstPresent(
    detail.pullHlsUrl,
    detail.pull_hls_url,
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
    detail.hls,
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
    detail.url,
  );
  if (preferHls) {
    return normalHlsUrl || adaptiveHlsUrl || flvUrl || rtmpUrl || genericUrl || "";
  }
  return rtmpUrl || flvUrl || normalHlsUrl || adaptiveHlsUrl || genericUrl || "";
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function resolveLiveRtcConfig(detail) {
  if (!detail || Number(detail.streamingProvider) !== 1 || !detail.rtcAppId || !detail.rtcChannel || !detail.rtcToken) {
    return null;
  }
  return {
    appId: detail.rtcAppId,
    channel: detail.rtcChannel,
    token: detail.rtcToken,
    uid: String(detail.rtcUid || detail.customerId || 0),
  };
}

function mergePullStreams(detail, streamInfo, preferHls) {
  const seen = new Set();
  return [
    ...normalizePullStreams(streamInfo, preferHls),
    ...normalizePullStreams(detail, preferHls),
  ]
    .filter((stream) => {
      const key = stream.sourceKey || stream.playUrl || `${stream.quality}:${stream.playUrl}`;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.rank - b.rank);
}

function findCandidateUrl(candidates, type, mainUrl = "") {
  return candidates.find((candidate) => candidate.type === type && candidate.url && candidate.url !== mainUrl)?.url || "";
}

export function buildLivePlayerSource(detail, preferHls, preferredQuality = "", streamInfo = {}) {
  const rtc = resolveLiveRtcConfig(detail) || resolveLiveRtcConfig(streamInfo);
  const pullStreams = mergePullStreams(detail, streamInfo, preferHls);
  const selectedStream = selectDefaultStream(pullStreams, preferredQuality);
  const liveCandidates = getMiniProgramLiveCandidates(detail, streamInfo);
  const primaryCandidate = selectMiniProgramLiveCandidate(liveCandidates, { preferHls });
  const rawMainUrl = primaryCandidate?.url || selectedStream?.playUrl || resolveLivePullUrl(detail, preferHls) || resolveLivePullUrl(streamInfo, preferHls);
  if (!rawMainUrl) {
    return {
      key: "",
      mainUrl: "",
      options: { pullStreams, liveCandidates },
      rtcConfig: null,
      stream: null,
      pullStreams,
      liveCandidates,
    };
  }
  if (!primaryCandidate && selectedStream) {
    return {
      key: `url:${selectedStream.sourceKey}`,
      mainUrl: selectedStream.playUrl,
      options: {
        ...buildStreamPlaybackOptions(selectedStream),
        rtcConfig: rtc,
        pullStreams,
        liveCandidates,
      },
      rtcConfig: rtc,
      stream: selectedStream,
      pullStreams,
      liveCandidates,
    };
  }
  const backupRtmpUrl = findCandidateUrl(liveCandidates, "rtmp", rawMainUrl);
  const backupFlvUrl = findCandidateUrl(liveCandidates, "flv", rawMainUrl);
  const backupHlsUrl = findCandidateUrl(liveCandidates, "hls", rawMainUrl);
  const nextCandidateUrl = liveCandidates.find((candidate) => candidate.url && candidate.url !== rawMainUrl)?.url || "";
  const mainKey = normalizeLiveSourceUrlKey(rawMainUrl);
  const backupRtmpKey = normalizeLiveSourceUrlKey(backupRtmpUrl);
  const backupFlvKey = normalizeLiveSourceUrlKey(backupFlvUrl);
  const backupHlsKey = normalizeLiveSourceUrlKey(backupHlsUrl);
  return {
    key: `url:${mainKey}:${backupRtmpKey}:${backupFlvKey}:${backupHlsKey}`,
    mainUrl: rawMainUrl,
    options: {
      backupUrl: nextCandidateUrl || (preferHls ? backupHlsUrl : (backupFlvUrl || backupHlsUrl || "")),
      backupRtmpUrl,
      backupFlvUrl,
      backupHlsUrl,
      rtcConfig: rtc,
      pullStreams,
      liveCandidates,
      sourceType: primaryCandidate?.type || "",
      sourceComponent: primaryCandidate?.component || "",
    },
    rtcConfig: rtc,
    stream: selectedStream,
    pullStreams,
    liveCandidates,
  };
}

export function summarizeLiveSourcePayload(payload = {}, source = {}) {
  return {
    pushStatus: payload.pushStatus,
    streamingProvider: payload.streamingProvider,
    pullUrl: payload.pullUrl || "",
    pullFlvUrl: payload.pullFlvUrl || "",
    pullHlsUrl: payload.pullHlsUrl || "",
    adaptiveHlsUrl: payload.adaptiveHlsUrl || payload.adaptive_hls_url || "",
    pullRtmpUrl: payload.pullRtmpUrl || "",
    selectedUrl: source.mainUrl || "",
    backupUrl: source.options?.backupUrl || "",
    backupFlvUrl: source.options?.backupFlvUrl || "",
    backupHlsUrl: source.options?.backupHlsUrl || "",
    pullStreams: Array.isArray(payload.pullStreams) ? payload.pullStreams.length : 0,
    selectedQuality: source.stream?.quality || source.options?.liveQuality || "",
    sourceKey: source.key || "",
    hasRtcConfig: !!source.rtcConfig,
  };
}

export function hasPlayableLiveStreamInfo(info) {
  const source = buildLivePlayerSource(info, isIOSRuntime());
  return !!source.key;
}

export function parseLiveStartTs(detail) {
  const start = detail?.startTime || detail?.scheduleTime || "";
  if (!start) return 0;
  return safeParseReplayTime(String(start));
}

export function isLiveNotStartedDetail(detail) {
  const statusText = String(detail?.liveStatusText || "").trim();
  if (statusText.includes("未开始") || statusText.includes("未开播")) return true;
  const startTs = parseLiveStartTs(detail);
  return Number(detail?.pushStatus || 0) !== 1 && startTs > Date.now();
}

export function isReplayPortraitEntryMode(resolvedMode, currentMode) {
  return (resolvedMode || currentMode || "portrait") === "portrait";
}

export function normalizeReplayFirstVideoPayload(firstVideo) {
  if (!firstVideo || firstVideo.hasVideo === false) return null;
  const toNumber = (value, fallback = 0) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  };
  const replaySource = selectReplayVideoPlaybackSource(firstVideo);
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
    elapsedSeconds: Math.max(0, toNumber(firstPresent(firstVideo.elapsedSeconds, firstVideo.elapsed_seconds, firstVideo.currentSeconds, firstVideo.current_seconds), 0)),
  };
}

export async function getLiveStreamInfWithRetry(roomCode) {
  for (let i = 0; i < LIVE_STREAM_INFO_RETRY_COUNT; i += 1) {
    try {
      const result = await getLiveStreamInf(roomCode);
      if (!result || Number(result.pushStatus || 0) !== 1) {
        return result || null;
      }
      if (hasPlayableLiveStreamInfo(result)) {
        return result;
      }
    } catch (e) {}
    if (i < LIVE_STREAM_INFO_RETRY_COUNT - 1) {
      await wait(LIVE_STREAM_INFO_RETRY_DELAY);
    }
  }
  return null;
}
