"use strict";
function normalizeValue(value) {
  return value === void 0 || value === null ? "" : String(value).trim();
}
function appendParam(params, key, value) {
  const text = normalizeValue(value);
  if (!text || text === "0")
    return;
  params.push(`${key}=${encodeURIComponent(text)}`);
}
function buildBroadcastReturnPath(input = {}) {
  const params = [];
  const roomCode = normalizeValue(input.roomCode || input.room_code);
  const liveId = normalizeValue(input.liveId || input.live_id || input.roomId || input.room_id);
  const roomId = normalizeValue(input.roomId || input.room_id);
  const tenantId = normalizeValue(input.tenantId || input.tenant_id);
  const shareCode = normalizeValue(input.shareCode || input.share_code);
  const bindId = normalizeValue(input.bindId || input.bind_id);
  const replayVideoId = normalizeValue(
    input.replayVideoId || input.replay_video_id || input.videoId || input.video_id
  );
  const mode = normalizeValue(input.mode);
  const liveType = normalizeValue(input.liveType || input.live_type);
  const replay = normalizeValue(input.replay);
  const isReplay = input.isReplay === true || replay === "1" || mode.toLowerCase() === "replay" || liveType.toLowerCase() === "replay";
  appendParam(params, "roomCode", roomCode);
  appendParam(params, "liveId", liveId);
  if (roomId && roomId !== liveId)
    appendParam(params, "roomId", roomId);
  appendParam(params, "tenantId", tenantId);
  if (shareCode && shareCode !== roomCode)
    appendParam(params, "shareCode", shareCode);
  appendParam(params, "bindId", bindId);
  if (isReplay) {
    params.push("mode=replay");
    params.push("replay=1");
    params.push("liveType=replay");
    appendParam(params, "videoId", replayVideoId);
    appendParam(params, "video_id", replayVideoId);
    appendParam(params, "replayVideoId", replayVideoId);
    appendParam(params, "replay_video_id", replayVideoId);
  } else if (liveType) {
    appendParam(params, "liveType", liveType);
  }
  return `/pages/broadcast/entry${params.length ? `?${params.join("&")}` : ""}`;
}
exports.buildBroadcastReturnPath = buildBroadcastReturnPath;
