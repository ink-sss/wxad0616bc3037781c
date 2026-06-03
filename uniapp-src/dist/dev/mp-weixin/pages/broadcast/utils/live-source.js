"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_urlHelpers = require("../../../utils/url-helpers.js");
const utils_liveRoute = require("../../../utils/live-route.js");
function isIOSRuntime() {
  try {
    const info = typeof common_vendor.index.getSystemInfoSync === "function" ? common_vendor.index.getSystemInfoSync() : {};
    return /ios/i.test(String(info.platform || info.system || ""));
  } catch (e) {
    return false;
  }
}
function isWeChatDevtoolsRuntime() {
  try {
    const info = typeof common_vendor.index.getSystemInfoSync === "function" ? common_vendor.index.getSystemInfoSync() : {};
    const platform = String(info.platform || "").toLowerCase();
    const system = String(info.system || "").toLowerCase();
    return platform === "devtools" || system.includes("devtools");
  } catch (e) {
    return false;
  }
}
function findCandidate(candidates = [], predicate = () => false) {
  return candidates.find((candidate) => (candidate == null ? void 0 : candidate.url) && predicate(candidate)) || null;
}
function selectMiniProgramLiveCandidate(candidates = [], options = {}) {
  if (!Array.isArray(candidates) || !candidates.length)
    return null;
  if (isWeChatDevtoolsRuntime()) {
    return findCandidate(candidates, (candidate) => candidate.component === "video") || findCandidate(candidates, (candidate) => candidate.type !== "rtmp" && candidate.component === "live-player") || findCandidate(candidates, (candidate) => candidate.type !== "rtmp") || findCandidate(candidates, () => true);
  }
  if (options == null ? void 0 : options.preferHls) {
    return findCandidate(candidates, (candidate) => candidate.component === "video" && candidate.type === "hls") || findCandidate(candidates, (candidate) => candidate.component === "video") || findCandidate(candidates, (candidate) => candidate.component === "live-player" && candidate.type === "flv") || findCandidate(candidates, (candidate) => candidate.component === "live-player" && candidate.type === "rtmp") || findCandidate(candidates, (candidate) => candidate.component === "live-player") || findCandidate(candidates, () => true);
  }
  return findCandidate(candidates, (candidate) => candidate.component === "live-player" && candidate.type === "rtmp") || findCandidate(candidates, (candidate) => candidate.component === "live-player" && candidate.type === "flv") || findCandidate(candidates, (candidate) => candidate.component === "live-player") || findCandidate(candidates, (candidate) => candidate.component === "video" && candidate.type === "hls") || findCandidate(candidates, (candidate) => candidate.component === "video") || findCandidate(candidates, () => true);
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
  return values.find((item) => item !== void 0 && item !== null && item !== "");
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
  "detail"
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
  "pull_url_list"
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
  "ext"
];
const STREAM_SOURCE_COMPONENT_FIELDS = [
  "sourceComponent",
  "source_component",
  "component",
  "playerComponent",
  "player_component"
];
function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function collectStreamSources(payload = {}) {
  const sources = [];
  const seen = /* @__PURE__ */ new Set();
  const push = (value) => {
    if (!isPlainObject(value) || seen.has(value))
      return;
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
      if (Array.isArray(source[field]))
        return source[field];
    }
  }
  return [];
}
function classifyStreamToken(token = "") {
  const value = String(token || "").toLowerCase().replace(/[_\s]/g, "-");
  if (!value)
    return null;
  if (value.includes("rtmp"))
    return { sourceType: "rtmp", sourceComponent: "live-player" };
  if (value.includes("flv"))
    return { sourceType: "flv", sourceComponent: "live-player" };
  if (value.includes("hls") || value.includes("m3u8"))
    return { sourceType: "hls", sourceComponent: "video" };
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
    if ((item == null ? void 0 : item[field]) !== void 0 && (item == null ? void 0 : item[field]) !== null)
      tokens.push(item[field]);
  });
  STREAM_SOURCE_COMPONENT_FIELDS.forEach((field) => {
    if ((item == null ? void 0 : item[field]) !== void 0 && (item == null ? void 0 : item[field]) !== null)
      tokens.push(item[field]);
  });
  for (const token of tokens) {
    const meta = classifyStreamToken(token);
    if (meta)
      return meta;
  }
  const url = String(playUrl || "").toLowerCase();
  if (url.startsWith("rtmp://"))
    return { sourceType: "rtmp", sourceComponent: "live-player" };
  if (url.includes(".flv") || url.includes("/flv") || url.includes("httpflv") || url.includes("http-flv")) {
    return { sourceType: "flv", sourceComponent: "live-player" };
  }
  if (url.includes(".m3u8") || url.includes("/hls") || url.includes("/m3u8") || url.includes("httphls") || url.includes("http-hls")) {
    return { sourceType: "hls", sourceComponent: "video" };
  }
  if (url.includes(".mp4"))
    return { sourceType: "mp4", sourceComponent: "video" };
  if (utils_liveRoute.isVideoSource(playUrl))
    return { sourceType: "video", sourceComponent: "video" };
  if (utils_liveRoute.isLivePlayerSource(playUrl))
    return { sourceType: "live", sourceComponent: "live-player" };
  return { sourceType: "", sourceComponent: "" };
}
function firstUrlFromList(value) {
  if (!Array.isArray(value))
    return "";
  return safeStreamUrl(value.find((item) => typeof item === "string" || typeof item === "number"));
}
function normalizeLiveSourceUrlKey(url) {
  if (!url)
    return "";
  const rawUrl = String(url).trim();
  const parsed = utils_urlHelpers.parseAbsoluteUrl(rawUrl, { assumeDomain: false });
  if (parsed) {
    return utils_urlHelpers.removeUrlQueryParam(`${parsed.origin}${parsed.pathname}${parsed.search}`, "auth_key");
  }
  return utils_urlHelpers.removeUrlQueryParam(rawUrl, "auth_key");
}
function normalizePullStreams(payload = {}, preferHls = isIOSRuntime()) {
  const rawStreams = getPullStreamItems(payload);
  const streams = rawStreams.map((rawItem, index) => {
    const item = isPlainObject(rawItem) ? rawItem : { url: rawItem };
    const quality = String(firstPresent(item == null ? void 0 : item.quality, item == null ? void 0 : item.qualityName, item == null ? void 0 : item.quality_name, item == null ? void 0 : item.qualityCode, item == null ? void 0 : item.quality_code, item == null ? void 0 : item.definition, item == null ? void 0 : item.clarity, item == null ? void 0 : item.resolution, item == null ? void 0 : item.name, index === 0 ? "origin" : `line-${index + 1}`)).trim();
    const rtmpUrl = safeStreamUrl(firstPresent(item == null ? void 0 : item.rtmpUrl, item == null ? void 0 : item.rtmp_url, item == null ? void 0 : item.pullRtmpUrl, item == null ? void 0 : item.pull_rtmp_url, item == null ? void 0 : item.pullRtmp, item == null ? void 0 : item.pull_rtmp, item == null ? void 0 : item.liveRtmpUrl, item == null ? void 0 : item.live_rtmp_url, item == null ? void 0 : item.rtmpPullUrl, item == null ? void 0 : item.rtmp_pull_url, item == null ? void 0 : item.rtmp));
    const flvUrl = safeStreamUrl(firstPresent(item == null ? void 0 : item.flvUrl, item == null ? void 0 : item.flv_url, item == null ? void 0 : item.pullFlvUrl, item == null ? void 0 : item.pull_flv_url, item == null ? void 0 : item.httpFlvUrl, item == null ? void 0 : item.http_flv_url, item == null ? void 0 : item.pullHttpFlvUrl, item == null ? void 0 : item.pull_http_flv_url, item == null ? void 0 : item.liveFlvUrl, item == null ? void 0 : item.live_flv_url, item == null ? void 0 : item.flvPullUrl, item == null ? void 0 : item.flv_pull_url, item == null ? void 0 : item.flv));
    const hlsUrl = safeStreamUrl(firstPresent(item == null ? void 0 : item.hlsUrl, item == null ? void 0 : item.hls_url, item == null ? void 0 : item.pullHlsUrl, item == null ? void 0 : item.pull_hls_url, item == null ? void 0 : item.adaptiveHlsUrl, item == null ? void 0 : item.adaptive_hls_url, item == null ? void 0 : item.liveAdaptiveHlsUrl, item == null ? void 0 : item.live_adaptive_hls_url, item == null ? void 0 : item.httpHlsUrl, item == null ? void 0 : item.http_hls_url, item == null ? void 0 : item.pullHttpHlsUrl, item == null ? void 0 : item.pull_http_hls_url, item == null ? void 0 : item.liveHlsUrl, item == null ? void 0 : item.live_hls_url, item == null ? void 0 : item.hlsPullUrl, item == null ? void 0 : item.hls_pull_url, item == null ? void 0 : item.m3u8Url, item == null ? void 0 : item.m3u8_url, item == null ? void 0 : item.m3u8, item == null ? void 0 : item.hls));
    const genericUrl = safeStreamUrl(firstPresent(item == null ? void 0 : item.playUrl, item == null ? void 0 : item.play_url, item == null ? void 0 : item.streamUrl, item == null ? void 0 : item.stream_url, item == null ? void 0 : item.liveUrl, item == null ? void 0 : item.live_url, item == null ? void 0 : item.pullUrl, item == null ? void 0 : item.pull_url, item == null ? void 0 : item.sourceUrl, item == null ? void 0 : item.source_url, item == null ? void 0 : item.mediaUrl, item == null ? void 0 : item.media_url, item == null ? void 0 : item.src, item == null ? void 0 : item.source, item == null ? void 0 : item.url, firstUrlFromList(item == null ? void 0 : item.urls), firstUrlFromList(item == null ? void 0 : item.urlList), firstUrlFromList(item == null ? void 0 : item.url_list)));
    const playUrl = preferHls ? hlsUrl || flvUrl || rtmpUrl || genericUrl : rtmpUrl || flvUrl || hlsUrl || genericUrl;
    if (!quality || !playUrl)
      return null;
    const sourceMeta = inferStreamSourceMeta(item, playUrl);
    const backupRtmpUrl = rtmpUrl && rtmpUrl !== playUrl ? rtmpUrl : "";
    const backupFlvUrl = flvUrl && flvUrl !== playUrl ? flvUrl : "";
    const backupHlsUrl = hlsUrl && hlsUrl !== playUrl ? hlsUrl : "";
    const bitrateKbps = Number((item == null ? void 0 : item.bitrateKbps) || 0);
    return {
      quality,
      label: String((item == null ? void 0 : item.label) || quality).trim(),
      isDefault: (item == null ? void 0 : item.isDefault) === true,
      bitrateKbps: Number.isFinite(bitrateKbps) && bitrateKbps > 0 ? bitrateKbps : 0,
      rtmpUrl,
      flvUrl,
      hlsUrl,
      playUrl,
      backupUrl: preferHls ? backupFlvUrl || backupRtmpUrl || "" : backupFlvUrl || backupHlsUrl || "",
      backupRtmpUrl,
      backupFlvUrl,
      backupHlsUrl,
      sourceType: sourceMeta.sourceType || "",
      sourceComponent: sourceMeta.sourceComponent || "",
      sourceKey: normalizeLiveSourceUrlKey(playUrl),
      rank: qualityRank(quality)
    };
  }).filter(Boolean).sort((a, b) => a.rank - b.rank);
  return streams;
}
function selectDefaultStream(streams = [], preferredQuality = "") {
  if (!streams.length)
    return null;
  const preferred = preferredQuality ? streams.find((stream) => stream.quality === preferredQuality) : null;
  return preferred || streams.find((stream) => stream.isDefault) || streams[0];
}
function selectStreamByQuality(streams = [], quality = "") {
  if (!quality)
    return null;
  return streams.find((stream) => stream.quality === quality) || null;
}
function buildStreamPlaybackOptions(stream = {}) {
  return {
    backupUrl: stream.backupUrl || "",
    backupRtmpUrl: stream.backupRtmpUrl || "",
    backupFlvUrl: stream.backupFlvUrl || "",
    backupHlsUrl: stream.backupHlsUrl || "",
    pullStreams: stream.pullStreams || void 0,
    liveQuality: stream.quality || "",
    sourceType: stream.sourceType || "",
    sourceComponent: stream.sourceComponent || ""
  };
}
function resolveStatusPullUrl(payload = {}, preferredQuality = "") {
  const candidate = selectMiniProgramLiveCandidate(utils_liveRoute.getMiniProgramLiveCandidates(payload), { preferHls: isIOSRuntime() });
  if (candidate == null ? void 0 : candidate.url)
    return candidate.url;
  const stream = selectDefaultStream(normalizePullStreams(payload), preferredQuality);
  if (stream == null ? void 0 : stream.playUrl)
    return stream.playUrl;
  if (payload.pullRtmpUrl || payload.pull_rtmp_url || payload.rtmpUrl || payload.rtmp_url) {
    return payload.pullRtmpUrl || payload.pull_rtmp_url || payload.rtmpUrl || payload.rtmp_url;
  }
  if (isIOSRuntime()) {
    return payload.pullHlsUrl || payload.pull_hls_url || payload.adaptiveHlsUrl || payload.adaptive_hls_url || payload.httpHlsUrl || payload.http_hls_url || payload.m3u8Url || payload.m3u8_url || payload.pullFlvUrl || payload.pull_flv_url || payload.httpFlvUrl || payload.http_flv_url || payload.pullUrl || payload.pull_url || "";
  }
  return payload.pullFlvUrl || payload.pull_flv_url || payload.httpFlvUrl || payload.http_flv_url || payload.pullHlsUrl || payload.pull_hls_url || payload.adaptiveHlsUrl || payload.adaptive_hls_url || payload.httpHlsUrl || payload.http_hls_url || payload.m3u8Url || payload.m3u8_url || payload.pullUrl || payload.pull_url || "";
}
function buildStatusPlaybackOptions(payload = {}, mainUrl = "", preferredQuality = "") {
  var _a;
  const liveCandidates = utils_liveRoute.getMiniProgramLiveCandidates(payload);
  const matchedCandidate = liveCandidates.find((candidate) => candidate.url && candidate.url === mainUrl) || null;
  const streams = normalizePullStreams(payload);
  const stream = selectDefaultStream(streams, preferredQuality);
  if (stream && (!mainUrl || stream.playUrl === mainUrl)) {
    return {
      ...buildStreamPlaybackOptions(stream),
      pullStreams: streams,
      liveCandidates
    };
  }
  const backupRtmpUrl = firstPresent(payload.pullRtmpUrl, payload.pull_rtmp_url, payload.pullRtmp, payload.pull_rtmp, payload.rtmpUrl, payload.rtmp_url, payload.liveRtmpUrl, payload.live_rtmp_url, payload.rtmpPullUrl, payload.rtmp_pull_url) && firstPresent(payload.pullRtmpUrl, payload.pull_rtmp_url, payload.pullRtmp, payload.pull_rtmp, payload.rtmpUrl, payload.rtmp_url, payload.liveRtmpUrl, payload.live_rtmp_url, payload.rtmpPullUrl, payload.rtmp_pull_url) !== mainUrl ? firstPresent(payload.pullRtmpUrl, payload.pull_rtmp_url, payload.pullRtmp, payload.pull_rtmp, payload.rtmpUrl, payload.rtmp_url, payload.liveRtmpUrl, payload.live_rtmp_url, payload.rtmpPullUrl, payload.rtmp_pull_url) : "";
  const backupFlvUrl = firstPresent(payload.pullFlvUrl, payload.pull_flv_url, payload.httpFlvUrl, payload.http_flv_url, payload.pullHttpFlvUrl, payload.pull_http_flv_url, payload.flvUrl, payload.flv_url, payload.liveFlvUrl, payload.live_flv_url, payload.flvPullUrl, payload.flv_pull_url) && firstPresent(payload.pullFlvUrl, payload.pull_flv_url, payload.httpFlvUrl, payload.http_flv_url, payload.pullHttpFlvUrl, payload.pull_http_flv_url, payload.flvUrl, payload.flv_url, payload.liveFlvUrl, payload.live_flv_url, payload.flvPullUrl, payload.flv_pull_url) !== mainUrl ? firstPresent(payload.pullFlvUrl, payload.pull_flv_url, payload.httpFlvUrl, payload.http_flv_url, payload.pullHttpFlvUrl, payload.pull_http_flv_url, payload.flvUrl, payload.flv_url, payload.liveFlvUrl, payload.live_flv_url, payload.flvPullUrl, payload.flv_pull_url) : "";
  const backupHlsUrl = firstPresent(payload.pullHlsUrl, payload.pull_hls_url, payload.adaptiveHlsUrl, payload.adaptive_hls_url, payload.httpHlsUrl, payload.http_hls_url, payload.pullHttpHlsUrl, payload.pull_http_hls_url, payload.hlsUrl, payload.hls_url, payload.liveHlsUrl, payload.live_hls_url, payload.hlsPullUrl, payload.hls_pull_url, payload.m3u8Url, payload.m3u8_url, payload.m3u8, payload.hls) && firstPresent(payload.pullHlsUrl, payload.pull_hls_url, payload.adaptiveHlsUrl, payload.adaptive_hls_url, payload.httpHlsUrl, payload.http_hls_url, payload.pullHttpHlsUrl, payload.pull_http_hls_url, payload.hlsUrl, payload.hls_url, payload.liveHlsUrl, payload.live_hls_url, payload.hlsPullUrl, payload.hls_pull_url, payload.m3u8Url, payload.m3u8_url, payload.m3u8, payload.hls) !== mainUrl ? firstPresent(payload.pullHlsUrl, payload.pull_hls_url, payload.adaptiveHlsUrl, payload.adaptive_hls_url, payload.httpHlsUrl, payload.http_hls_url, payload.pullHttpHlsUrl, payload.pull_http_hls_url, payload.hlsUrl, payload.hls_url, payload.liveHlsUrl, payload.live_hls_url, payload.hlsPullUrl, payload.hls_pull_url, payload.m3u8Url, payload.m3u8_url, payload.m3u8, payload.hls) : "";
  const nextCandidateUrl = ((_a = liveCandidates.find((candidate) => candidate.url && candidate.url !== mainUrl)) == null ? void 0 : _a.url) || "";
  return {
    backupUrl: nextCandidateUrl || (isIOSRuntime() ? backupHlsUrl : backupFlvUrl || backupHlsUrl || ""),
    backupRtmpUrl,
    backupFlvUrl,
    backupHlsUrl,
    pullStreams: streams,
    liveCandidates,
    sourceType: (matchedCandidate == null ? void 0 : matchedCandidate.type) || "",
    sourceComponent: (matchedCandidate == null ? void 0 : matchedCandidate.component) || ""
  };
}
exports.buildStatusPlaybackOptions = buildStatusPlaybackOptions;
exports.buildStreamPlaybackOptions = buildStreamPlaybackOptions;
exports.isIOSRuntime = isIOSRuntime;
exports.isWeChatDevtoolsRuntime = isWeChatDevtoolsRuntime;
exports.normalizeLiveSourceUrlKey = normalizeLiveSourceUrlKey;
exports.normalizePullStreams = normalizePullStreams;
exports.resolveStatusPullUrl = resolveStatusPullUrl;
exports.selectDefaultStream = selectDefaultStream;
exports.selectMiniProgramLiveCandidate = selectMiniProgramLiveCandidate;
exports.selectStreamByQuality = selectStreamByQuality;
