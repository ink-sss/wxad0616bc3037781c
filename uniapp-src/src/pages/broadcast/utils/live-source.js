/**
 * 直播播放源选择与去重工具。
 * 职责边界：只处理 H5 直播地址字段和源 key 归一化，不操作播放器实例或页面状态。
 */

import { parseAbsoluteUrl, removeUrlQueryParam } from "@/utils/url-helpers.js";
import { getMiniProgramLiveCandidates, isLivePlayerSource, isVideoSource } from "@/utils/live-route.js";

export function isIOSRuntime() {
  try {
    const info = typeof uni.getSystemInfoSync === "function" ? uni.getSystemInfoSync() : {};
    return /ios/i.test(String(info.platform || info.system || ""));
  } catch (e) {
    return false;
  }
}

export function isWeChatDevtoolsRuntime() {
  try {
    const info = typeof uni.getSystemInfoSync === "function" ? uni.getSystemInfoSync() : {};
    const platform = String(info.platform || "").toLowerCase();
    const system = String(info.system || "").toLowerCase();
    return platform === "devtools" || system.includes("devtools");
  } catch (e) {
    return false;
  }
}

function isMiniProgramRuntime() {
  try {
    const info = typeof uni.getSystemInfoSync === "function" ? uni.getSystemInfoSync() : {};
    const uniPlatform = String(info.uniPlatform || "").toLowerCase();
    if (uniPlatform === "mp-weixin") return true;
    if (isWeChatDevtoolsRuntime()) return true;
    return typeof uni.getAccountInfoSync === "function";
  } catch (e) {
    return false;
  }
}

export function shouldPreferMiniProgramHlsPlayback() {
  return isMiniProgramRuntime() || isIOSRuntime();
}

function findCandidate(candidates = [], predicate = () => false) {
  return candidates.find((candidate) => candidate?.url && predicate(candidate)) || null;
}

export function selectMiniProgramLiveCandidate(candidates = [], options = {}) {
  if (!Array.isArray(candidates) || !candidates.length) return null;
  const preferVideo = shouldPreferMiniProgramHlsPlayback() || options?.preferVideo === true || options?.preferHls === true;
  const isAdaptiveHlsCandidate = (candidate) => (
    candidate?.component === "video" &&
    candidate?.type === "hls" &&
    (candidate.isAdaptiveHls === true || String(candidate.field || "").toLowerCase().includes("adaptive"))
  );
  if (preferVideo) {
    return findCandidate(candidates, (candidate) => candidate.component === "video" && candidate.type === "hls" && !isAdaptiveHlsCandidate(candidate)) ||
      findCandidate(candidates, isAdaptiveHlsCandidate) ||
      null;
  }
  return findCandidate(candidates, (candidate) => candidate.component === "live-player" && candidate.type === "rtmp") ||
    findCandidate(candidates, (candidate) => candidate.component === "live-player" && candidate.type === "flv") ||
    findCandidate(candidates, (candidate) => candidate.component === "live-player" && candidate.type !== "rtmp") ||
    findCandidate(candidates, (candidate) => candidate.component === "video" && candidate.type === "hls" && !isAdaptiveHlsCandidate(candidate)) ||
    findCandidate(candidates, isAdaptiveHlsCandidate) ||
    findCandidate(candidates, (candidate) => candidate.component === "video") ||
    findCandidate(candidates, () => true);
}

const QUALITY_ORDER = ["origin", "sd", "ld"];
const QUALITY_RANK = QUALITY_ORDER.reduce((acc, quality, index) => {
  acc[quality] = index;
  return acc;
}, {});

function qualityRank(quality) {
  return QUALITY_RANK[quality] ?? QUALITY_ORDER.length;
}

function safeStreamUrl(value) {
  return typeof value === "string" ? value.trim() : "";
}

function firstPresent(...values) {
  return values.find((item) => item !== undefined && item !== null && item !== "");
}

function firstNormalHls(...values) {
  return safeStreamUrl(firstPresent(...values));
}

function firstAdaptiveHls(...values) {
  return safeStreamUrl(firstPresent(...values));
}

const STREAM_SOURCE_OBJECT_FIELDS = [
  "payload",
  "data",
  "result",
  "streamInf",
  "streamInfo",
  "stream_inf",
  "stream_info",
  "playInfo",
  "play_info",
  "mediaInfo",
  "media_info",
  "media",
  "liveStream",
  "live_stream",
  "liveSource",
  "live_source",
  "live",
  "liveInfo",
  "live_info",
  "pullStream",
  "pull_stream",
  "pullInfo",
  "pull_info",
  "stream",
  "urls",
  "urlInfo",
  "url_info",
  "room",
  "detail",
];

const STREAM_SOURCE_LIST_FIELDS = [
  "pullStreams",
  "pull_streams",
  "streamList",
  "stream_list",
  "streams",
  "liveStreams",
  "live_streams",
  "streamInfos",
  "stream_infos",
  "playUrls",
  "play_urls",
  "urlList",
  "url_list",
  "lines",
  "lineList",
  "line_list",
  "sourceList",
  "source_list",
  "sources",
  "pullUrlList",
  "pull_url_list",
];

const STREAM_SOURCE_TYPE_FIELDS = [
  "type",
  "sourceType",
  "source_type",
  "streamType",
  "stream_type",
  "protocol",
  "format",
  "playType",
  "play_type",
  "urlType",
  "url_type",
  "mediaType",
  "media_type",
  "ext",
];

const STREAM_SOURCE_COMPONENT_FIELDS = [
  "sourceComponent",
  "source_component",
  "component",
  "playerComponent",
  "player_component",
];

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function collectStreamSources(payload = {}) {
  const sources = [];
  const seen = new Set();
  const push = (value) => {
    if (!isPlainObject(value) || seen.has(value)) return;
    seen.add(value);
    sources.push(value);
    STREAM_SOURCE_OBJECT_FIELDS.forEach((field) => {
      push(value[field]);
    });
    STREAM_SOURCE_LIST_FIELDS.forEach((field) => {
      if (Array.isArray(value[field])) {
        value[field].forEach(push);
      }
    });
  };
  push(payload);
  return sources;
}

function getPullStreamItems(payload = {}) {
  const sources = collectStreamSources(payload);
  for (const source of sources) {
    for (const field of STREAM_SOURCE_LIST_FIELDS) {
      if (Array.isArray(source[field])) return source[field];
    }
  }
  return [];
}

function classifyStreamToken(token = "") {
  const value = String(token || "").toLowerCase().replace(/[_\s]/g, "-");
  if (!value) return null;
  if (value.includes("rtmp")) return { sourceType: "rtmp", sourceComponent: "live-player" };
  if (value.includes("flv")) return { sourceType: "flv", sourceComponent: "live-player" };
  if (value.includes("hls") || value.includes("m3u8")) return { sourceType: "hls", sourceComponent: "video" };
  if (value.includes("mp4") || value === "video" || value.includes("vod") || value.includes("replay")) {
    return { sourceType: "mp4", sourceComponent: "video" };
  }
  if (value.includes("live-player") || value.includes("liveplayer")) {
    return { sourceType: "live", sourceComponent: "live-player" };
  }
  return null;
}

function inferStreamSourceMeta(item = {}, playUrl = "") {
  const tokens = [];
  STREAM_SOURCE_TYPE_FIELDS.forEach((field) => {
    if (item?.[field] !== undefined && item?.[field] !== null) tokens.push(item[field]);
  });
  STREAM_SOURCE_COMPONENT_FIELDS.forEach((field) => {
    if (item?.[field] !== undefined && item?.[field] !== null) tokens.push(item[field]);
  });
  for (const token of tokens) {
    const meta = classifyStreamToken(token);
    if (meta) return meta;
  }
  const url = String(playUrl || "").toLowerCase();
  if (url.startsWith("rtmp://")) return { sourceType: "rtmp", sourceComponent: "live-player" };
  if (url.includes(".flv") || url.includes("/flv") || url.includes("httpflv") || url.includes("http-flv")) {
    return { sourceType: "flv", sourceComponent: "live-player" };
  }
  if (url.includes(".m3u8") || url.includes("/hls") || url.includes("/m3u8") || url.includes("httphls") || url.includes("http-hls")) {
    return { sourceType: "hls", sourceComponent: "video" };
  }
  if (url.includes(".mp4")) return { sourceType: "mp4", sourceComponent: "video" };
  if (isVideoSource(playUrl)) return { sourceType: "video", sourceComponent: "video" };
  if (isLivePlayerSource(playUrl)) return { sourceType: "live", sourceComponent: "live-player" };
  return { sourceType: "", sourceComponent: "" };
}

function firstUrlFromList(value) {
  if (!Array.isArray(value)) return "";
  return safeStreamUrl(value.find((item) => typeof item === "string" || typeof item === "number"));
}

function getPayloadNormalHlsUrl(payload = {}) {
  return firstNormalHls(
    payload.pullHlsUrl,
    payload.pull_hls_url,
    payload.httpHlsUrl,
    payload.http_hls_url,
    payload.pullHttpHlsUrl,
    payload.pull_http_hls_url,
    payload.hlsUrl,
    payload.hls_url,
    payload.liveHlsUrl,
    payload.live_hls_url,
    payload.hlsPullUrl,
    payload.hls_pull_url,
    payload.m3u8Url,
    payload.m3u8_url,
    payload.m3u8,
    payload.hls,
  );
}

function getPayloadAdaptiveHlsUrl(payload = {}) {
  return firstAdaptiveHls(
    payload.adaptiveHlsUrl,
    payload.adaptive_hls_url,
    payload.liveAdaptiveHlsUrl,
    payload.live_adaptive_hls_url,
  );
}

export function normalizeLiveSourceUrlKey(url) {
  if (!url) return "";
  const rawUrl = String(url).trim();
  const parsed = parseAbsoluteUrl(rawUrl, { assumeDomain: false });
  if (parsed) {
    return removeUrlQueryParam(`${parsed.origin}${parsed.pathname}${parsed.search}`, "auth_key");
  }
  return removeUrlQueryParam(rawUrl, "auth_key");
}

export function normalizePullStreams(payload = {}, preferHls = shouldPreferMiniProgramHlsPlayback()) {
  const rawStreams = getPullStreamItems(payload);
  const streams = rawStreams
    .map((rawItem, index) => {
      const item = isPlainObject(rawItem) ? rawItem : { url: rawItem };
      const quality = String(firstPresent(item?.quality, item?.qualityName, item?.quality_name, item?.qualityCode, item?.quality_code, item?.definition, item?.clarity, item?.resolution, item?.name, index === 0 ? "origin" : `line-${index + 1}`)).trim();
      const rtmpUrl = safeStreamUrl(firstPresent(item?.rtmpUrl, item?.rtmp_url, item?.pullRtmpUrl, item?.pull_rtmp_url, item?.pullRtmp, item?.pull_rtmp, item?.liveRtmpUrl, item?.live_rtmp_url, item?.rtmpPullUrl, item?.rtmp_pull_url, item?.rtmp));
      const flvUrl = safeStreamUrl(firstPresent(item?.flvUrl, item?.flv_url, item?.pullFlvUrl, item?.pull_flv_url, item?.httpFlvUrl, item?.http_flv_url, item?.pullHttpFlvUrl, item?.pull_http_flv_url, item?.liveFlvUrl, item?.live_flv_url, item?.flvPullUrl, item?.flv_pull_url, item?.flv));
      const hlsUrl = firstNormalHls(item?.hlsUrl, item?.hls_url, item?.pullHlsUrl, item?.pull_hls_url, item?.httpHlsUrl, item?.http_hls_url, item?.pullHttpHlsUrl, item?.pull_http_hls_url, item?.liveHlsUrl, item?.live_hls_url, item?.hlsPullUrl, item?.hls_pull_url, item?.m3u8Url, item?.m3u8_url, item?.m3u8, item?.hls);
      const adaptiveHlsUrl = firstAdaptiveHls(item?.adaptiveHlsUrl, item?.adaptive_hls_url, item?.liveAdaptiveHlsUrl, item?.live_adaptive_hls_url);
      const viableHlsUrl = hlsUrl || adaptiveHlsUrl;
      const genericUrl = safeStreamUrl(firstPresent(item?.playUrl, item?.play_url, item?.streamUrl, item?.stream_url, item?.liveUrl, item?.live_url, item?.pullUrl, item?.pull_url, item?.sourceUrl, item?.source_url, item?.mediaUrl, item?.media_url, item?.src, item?.source, item?.url, firstUrlFromList(item?.urls), firstUrlFromList(item?.urlList), firstUrlFromList(item?.url_list)));
      const genericSourceMeta = inferStreamSourceMeta(item, genericUrl);
      const videoGenericUrl = genericSourceMeta.sourceComponent === "video" ? genericUrl : "";
      const playUrl = preferHls ? (viableHlsUrl || videoGenericUrl) : (rtmpUrl || flvUrl || viableHlsUrl || genericUrl);
      if (!quality || !playUrl) return null;
      const sourceMeta = inferStreamSourceMeta(item, playUrl);
      const backupRtmpUrl = !preferHls && rtmpUrl && rtmpUrl !== playUrl ? rtmpUrl : "";
      const backupFlvUrl = !preferHls && flvUrl && flvUrl !== playUrl ? flvUrl : "";
      const backupHlsUrl = viableHlsUrl && viableHlsUrl !== playUrl ? viableHlsUrl : "";
      const bitrateKbps = Number(item?.bitrateKbps || 0);
      return {
        quality,
        label: String(item?.label || quality).trim(),
        isDefault: item?.isDefault === true,
        bitrateKbps: Number.isFinite(bitrateKbps) && bitrateKbps > 0 ? bitrateKbps : 0,
        rtmpUrl,
        flvUrl,
        hlsUrl: viableHlsUrl,
        normalHlsUrl: hlsUrl,
        adaptiveHlsUrl,
        playUrl,
        backupUrl: preferHls ? "" : (backupFlvUrl || backupHlsUrl || ""),
        backupRtmpUrl,
        backupFlvUrl,
        backupHlsUrl,
        sourceType: sourceMeta.sourceType || "",
        sourceComponent: sourceMeta.sourceComponent || "",
        sourceKey: normalizeLiveSourceUrlKey(playUrl),
        rank: qualityRank(quality),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank);
  return streams;
}

export function selectDefaultStream(streams = [], preferredQuality = "") {
  if (!streams.length) return null;
  const preferred = preferredQuality
    ? streams.find((stream) => stream.quality === preferredQuality)
    : null;
  return preferred || streams.find((stream) => stream.isDefault) || streams[0];
}

export function selectStreamByQuality(streams = [], quality = "") {
  if (!quality) return null;
  return streams.find((stream) => stream.quality === quality) || null;
}

export function buildStreamPlaybackOptions(stream = {}) {
  return {
    backupUrl: stream.backupUrl || "",
    backupRtmpUrl: shouldPreferMiniProgramHlsPlayback() ? "" : (stream.backupRtmpUrl || ""),
    backupFlvUrl: shouldPreferMiniProgramHlsPlayback() ? "" : (stream.backupFlvUrl || ""),
    backupHlsUrl: stream.backupHlsUrl || "",
    pullStreams: stream.pullStreams || undefined,
    liveQuality: stream.quality || "",
    sourceType: stream.sourceType || "",
    sourceComponent: stream.sourceComponent || "",
  };
}

export function resolveStatusPullUrl(payload = {}, preferredQuality = "") {
  const preferHls = shouldPreferMiniProgramHlsPlayback();
  const candidate = selectMiniProgramLiveCandidate(getMiniProgramLiveCandidates(payload), { preferHls });
  if (candidate?.url) return candidate.url;
  const stream = selectDefaultStream(normalizePullStreams(payload, preferHls), preferredQuality);
  if (stream?.playUrl) return stream.playUrl;
  if (preferHls) {
    return getPayloadNormalHlsUrl(payload) || getPayloadAdaptiveHlsUrl(payload) || "";
  }
  return payload.pullRtmpUrl || payload.pull_rtmp_url || payload.rtmpUrl || payload.rtmp_url || payload.pullFlvUrl || payload.pull_flv_url || payload.httpFlvUrl || payload.http_flv_url || getPayloadNormalHlsUrl(payload) || getPayloadAdaptiveHlsUrl(payload) || payload.pullUrl || payload.pull_url || "";
}

export function buildStatusPlaybackOptions(payload = {}, mainUrl = "", preferredQuality = "") {
  const liveCandidates = getMiniProgramLiveCandidates(payload);
  const matchedCandidate = liveCandidates.find((candidate) => candidate.url && candidate.url === mainUrl) || null;
  const preferHls = shouldPreferMiniProgramHlsPlayback();
  const streams = normalizePullStreams(payload, preferHls);
  const stream = selectDefaultStream(streams, preferredQuality);
  if (stream && (!mainUrl || stream.playUrl === mainUrl)) {
    return {
      ...buildStreamPlaybackOptions(stream),
      pullStreams: streams,
      liveCandidates,
    };
  }
  const backupRtmpUrl = firstPresent(payload.pullRtmpUrl, payload.pull_rtmp_url, payload.pullRtmp, payload.pull_rtmp, payload.rtmpUrl, payload.rtmp_url, payload.liveRtmpUrl, payload.live_rtmp_url, payload.rtmpPullUrl, payload.rtmp_pull_url) && firstPresent(payload.pullRtmpUrl, payload.pull_rtmp_url, payload.pullRtmp, payload.pull_rtmp, payload.rtmpUrl, payload.rtmp_url, payload.liveRtmpUrl, payload.live_rtmp_url, payload.rtmpPullUrl, payload.rtmp_pull_url) !== mainUrl
    ? firstPresent(payload.pullRtmpUrl, payload.pull_rtmp_url, payload.pullRtmp, payload.pull_rtmp, payload.rtmpUrl, payload.rtmp_url, payload.liveRtmpUrl, payload.live_rtmp_url, payload.rtmpPullUrl, payload.rtmp_pull_url)
    : "";
  const backupFlvUrl = firstPresent(payload.pullFlvUrl, payload.pull_flv_url, payload.httpFlvUrl, payload.http_flv_url, payload.pullHttpFlvUrl, payload.pull_http_flv_url, payload.flvUrl, payload.flv_url, payload.liveFlvUrl, payload.live_flv_url, payload.flvPullUrl, payload.flv_pull_url) && firstPresent(payload.pullFlvUrl, payload.pull_flv_url, payload.httpFlvUrl, payload.http_flv_url, payload.pullHttpFlvUrl, payload.pull_http_flv_url, payload.flvUrl, payload.flv_url, payload.liveFlvUrl, payload.live_flv_url, payload.flvPullUrl, payload.flv_pull_url) !== mainUrl
    ? firstPresent(payload.pullFlvUrl, payload.pull_flv_url, payload.httpFlvUrl, payload.http_flv_url, payload.pullHttpFlvUrl, payload.pull_http_flv_url, payload.flvUrl, payload.flv_url, payload.liveFlvUrl, payload.live_flv_url, payload.flvPullUrl, payload.flv_pull_url)
    : "";
  const payloadHlsUrl = getPayloadNormalHlsUrl(payload) || getPayloadAdaptiveHlsUrl(payload);
  const backupHlsUrl = payloadHlsUrl && payloadHlsUrl !== mainUrl
    ? payloadHlsUrl
    : "";
  const nextCandidate = selectMiniProgramLiveCandidate(
    liveCandidates.filter((candidate) => candidate.url && candidate.url !== mainUrl),
    { preferHls },
  );
  const nextCandidateUrl = nextCandidate?.url || "";
  return {
    backupUrl: nextCandidateUrl || (preferHls ? backupHlsUrl : (backupFlvUrl || backupHlsUrl || "")),
    backupRtmpUrl: preferHls ? "" : backupRtmpUrl,
    backupFlvUrl: preferHls ? "" : backupFlvUrl,
    backupHlsUrl,
    pullStreams: streams,
    liveCandidates,
    sourceType: matchedCandidate?.type || "",
    sourceComponent: matchedCandidate?.component || "",
  };
}
