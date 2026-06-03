/**
 * 直播心跳和直播状态轮询。
 * 职责边界：负责服务循环的启停与轮询节奏，不直接处理播放器 DOM 或 WebSocket 连接。
 */
import { applyLiveStatusSnapshot } from "../utils/live-status-snapshot.js";

const HEARTBEAT_INTERVAL_MS = 15000;
const STATUS_POLL_TICK_MS = 15000;
const STATUS_POLL_NORMAL_MS = 15000;
const STATUS_POLL_SLOW_MS = 60000;
const STATUS_POLL_FIRST_BACKOFF_MS = 30000;
const TRUSTED_STATUS_PUSH_TTL_MS = 30000;

export function useLiveHeartbeatStatus(ctx) {
  const {
    liveId,
    sessionId,
    getEnterTimestamp,
    pushStatus,
    isPlaying,
    liveHeartbeat,
    getLiveStatus,
    setViewerCountDisplay,
    viewerCount,
    likeCount,
    isReplay,
    isScheduleWarmupMode,
    isWaitingSchedule,
    pullUrl,
    messages,
    refreshPinnedMessage = () => {},
    initVideoPlayer,
    getVideoPlayer = () => null,
    recordPlaybackDebugEvent = () => {},
    updateSignedStreams = () => {},
    getPreferredLiveQuality = () => "",
    getPushChannelState = () => "",
    getLastStatusPushAt = () => 0,
    getIsPageVisible = () => true,
    getIsMiniWindowActive = () => false,
    getIsPlaybackPaused = () => false,
  } = ctx;
  let heartbeatTimer = null;
  let statusPollTimer = null;
  let lastStatusPollAt = 0;
  let consecutivePollFailures = 0;
  let statusPollPromise = null;

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      const enterTimestamp = getEnterTimestamp();
      if (!liveId.value || !sessionId.value || !enterTimestamp) return;
      if (getIsPageVisible() === false || getIsPlaybackPaused()) return;
      // [2026-05-11 修复] 视频已结束时不再上报心跳，防止观看时长无限累加
      if (pushStatus.value === 2 && !isPlaying.value) return;
      const duration = Math.floor((Date.now() - enterTimestamp) / 1000);
      liveHeartbeat(liveId.value, sessionId.value, duration).catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function startStatusPoll() {
    stopStatusPoll();
    lastStatusPollAt = 0;
    consecutivePollFailures = 0;
    pollLiveStatus({ force: true, reason: "start" });
    statusPollTimer = setInterval(() => {
      pollLiveStatus();
    }, STATUS_POLL_TICK_MS);
  }

  function stopStatusPoll() {
    if (statusPollTimer) {
      clearInterval(statusPollTimer);
      statusPollTimer = null;
    }
    statusPollPromise = null;
  }

  function isPushStatusTrusted(now = Date.now()) {
    const lastPushAt = Number(getLastStatusPushAt() || 0);
    if (lastPushAt <= 0 || now - lastPushAt > TRUSTED_STATUS_PUSH_TTL_MS) return false;
    const channelState = String(getPushChannelState?.() || "").toLowerCase();
    return !channelState || channelState === "open" || channelState === "connected";
  }

  function getStatusPollInterval(now = Date.now()) {
    const isInactive =
      getIsPageVisible() === false ||
      getIsMiniWindowActive() ||
      getIsPlaybackPaused();
    const baseInterval = isInactive || isPushStatusTrusted(now)
      ? STATUS_POLL_SLOW_MS
      : STATUS_POLL_NORMAL_MS;
    if (consecutivePollFailures <= 0) return baseInterval;
    const failureInterval = consecutivePollFailures === 1
      ? STATUS_POLL_FIRST_BACKOFF_MS
      : STATUS_POLL_SLOW_MS;
    return Math.max(baseInterval, failureInterval);
  }

  async function pollLiveStatus(options = {}) {
    if (!liveId.value || typeof getLiveStatus !== "function") return;
    const now = Date.now();
    const force = !!options.force;
    if (!force && now - lastStatusPollAt < getStatusPollInterval(now)) return statusPollPromise;
    if (statusPollPromise) return statusPollPromise;

    statusPollPromise = (async () => {
      try {
        const s = await getLiveStatus(liveId.value);
        if (!s) return;
        lastStatusPollAt = Date.now();
        consecutivePollFailures = 0;
        applyLiveStatusSnapshot({
          pushStatus,
          isPlaying,
          setViewerCountDisplay,
          viewerCount,
          likeCount,
          isReplay,
          isScheduleWarmupMode,
          isWaitingSchedule,
          pullUrl,
          messages,
          refreshPinnedMessage,
          initVideoPlayer,
          getVideoPlayer,
          recordPlaybackDebugEvent,
          updateSignedStreams,
          getPreferredLiveQuality,
        }, s, {
          source: "poll",
          forceSwitchSameKey: !!options.forceSwitchSameKey,
          reason: options.reason || "",
        });
      } catch (err) {
        lastStatusPollAt = Date.now();
        consecutivePollFailures += 1;
        console.error("[Live] pollLiveStatus fail:", err);
      } finally {
        statusPollPromise = null;
      }
    })();
    return statusPollPromise;
  }

  return {
    startHeartbeat,
    stopHeartbeat,
    startStatusPoll,
    stopStatusPoll,
    refreshLiveStatusNow: (options = {}) => pollLiveStatus({ ...options, force: true }),
  };
}
