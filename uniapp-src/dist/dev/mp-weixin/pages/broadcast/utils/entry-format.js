"use strict";
const ZAN_IMAGES = [
  "/static/zan/zan_1.png",
  "/static/zan/zan_2.png",
  "/static/zan/zan_3.png",
  "/static/zan/zan_4.png",
  "/static/zan/zan_5.png"
];
const defaultAvatar = "/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg";
function formatPlayTime(seconds) {
  if (seconds < 0 || !Number.isFinite(seconds))
    return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function formatViewCount(count) {
  const num = Number(count) || 0;
  if (num >= 1e4) {
    return (num / 1e4).toFixed(1) + "万";
  }
  return String(num);
}
function formatLikeCount(count) {
  const num = Number(count) || 0;
  if (num >= 1e4) {
    return (num / 1e4).toFixed(1) + "w";
  }
  return String(num);
}
function normalizeMode(detail = {}) {
  const displayMode = Number(detail.displayMode || 0);
  if (displayMode === 1) {
    return "landscape";
  }
  if (displayMode === 2) {
    return "portrait";
  }
  return "";
}
function normalizeLiveType(value) {
  return String(value || "").trim().toLowerCase() === "live" ? "live" : "replay";
}
function resolveLiveVisualMode(liveType) {
  return normalizeLiveType(liveType) === "live";
}
function isLiveCoverOnlyStatusText(value) {
  const statusText = String(value || "").trim();
  return statusText.includes("未直播") || statusText.includes("未开始") || statusText.includes("未开播");
}
function safeParseReplayTime(timeText) {
  if (!timeText)
    return 0;
  const ts = new Date(String(timeText).replace(" ", "T")).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}
function getReplayVideoEndTime(video, videoStart) {
  const estimatedEnd = safeParseReplayTime(video.estimatedEndTime);
  if (estimatedEnd)
    return estimatedEnd;
  if ((video == null ? void 0 : video.loopPlay) === 1)
    return 0;
  const durationSeconds = Number(video.duration || 0);
  if (videoStart && durationSeconds > 0) {
    return videoStart + durationSeconds * 1e3;
  }
  return 0;
}
function detectWeChatIOSH5() {
  return false;
}
function detectIOSH5() {
  return false;
}
exports.ZAN_IMAGES = ZAN_IMAGES;
exports.defaultAvatar = defaultAvatar;
exports.detectIOSH5 = detectIOSH5;
exports.detectWeChatIOSH5 = detectWeChatIOSH5;
exports.formatLikeCount = formatLikeCount;
exports.formatPlayTime = formatPlayTime;
exports.formatViewCount = formatViewCount;
exports.getReplayVideoEndTime = getReplayVideoEndTime;
exports.isLiveCoverOnlyStatusText = isLiveCoverOnlyStatusText;
exports.normalizeLiveType = normalizeLiveType;
exports.normalizeMode = normalizeMode;
exports.resolveLiveVisualMode = resolveLiveVisualMode;
exports.safeParseReplayTime = safeParseReplayTime;
