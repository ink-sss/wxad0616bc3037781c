/**
 * broadcast entry 专属展示格式化工具。
 * 职责边界：只放直播入口私有的默认资源、观看数/时间格式和录播时间解析，不上提到全局 common。
 */
export const ZAN_IMAGES = [
  "https://man.lqjy.cc/static/zan/zan_1.png",
  "https://man.lqjy.cc/static/zan/zan_2.png",
  "https://man.lqjy.cc/static/zan/zan_3.png",
  "https://man.lqjy.cc/static/zan/zan_4.png",
  "https://man.lqjy.cc/static/zan/zan_5.png",
];
// 默认头像：与抽奖 composable 中 DEFAULT_AVATAR 保持一致，避免 figma mcp 占位 URL 无法访问导致头像不显示
export const defaultAvatar =
  "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg";

// [调试] 格式化秒数为 mm:ss
export function formatPlayTime(seconds) {
  if (seconds < 0 || !Number.isFinite(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatViewCount(count) {
  const num = Number(count) || 0;
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "万";
  }
  return String(num);
}

export function formatLikeCount(count) {
  const num = Number(count) || 0;
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "w";
  }
  return String(num);
}

export function normalizeMode(detail = {}) {
  const displayMode = Number(detail.displayMode || 0);
  if (displayMode === 1) {
    return "landscape";
  }
  if (displayMode === 2) {
    return "portrait";
  }
  return "";
}

export function normalizeLiveType(value) {
  return String(value || "").trim().toLowerCase() === "live" ? "live" : "replay";
}

export function resolveLiveVisualMode(liveType) {
  return normalizeLiveType(liveType) === "live";
}

export function isLiveCoverOnlyStatusText(value) {
  const statusText = String(value || "").trim();
  return (
    statusText.includes("未直播") ||
    statusText.includes("未开始") ||
    statusText.includes("未开播")
  );
}

export function safeParseReplayTime(timeText) {
  if (!timeText) return 0;
  const ts = new Date(String(timeText).replace(" ", "T")).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

export function getReplayVideoEndTime(video, videoStart) {
  const estimatedEnd = safeParseReplayTime(video.estimatedEndTime);
  if (estimatedEnd) return estimatedEnd;
  if (video?.loopPlay === 1) return 0;
  const durationSeconds = Number(video.duration || 0);
  if (videoStart && durationSeconds > 0) {
    return videoStart + durationSeconds * 1000;
  }
  return 0;
}

export function detectWeChatIOSH5() {
  return false;
}

export function detectIOSH5() {
  return false;
}
