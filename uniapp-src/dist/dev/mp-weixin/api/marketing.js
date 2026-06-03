"use strict";
const api_h5 = require("./h5.js");
function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source == null ? void 0 : source[key];
    if (value !== void 0 && value !== null && value !== "")
      return value;
  }
  return void 0;
}
function toNumberLike(value) {
  if (value === void 0 || value === null || value === "")
    return void 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}
function applyAliases(payload, source, aliasMap) {
  Object.entries(aliasMap).forEach(([canonicalKey, aliases]) => {
    const value = firstValue(source, canonicalKey, ...aliases);
    if (value === void 0)
      return;
    payload[canonicalKey] = value;
    aliases.forEach((key) => {
      payload[key] = value;
    });
  });
  return payload;
}
function buildMarketingPayload(data = {}, extraAliases = {}) {
  const payload = { ...data };
  applyAliases(payload, data, {
    activityId: ["activity_id", "id"],
    prizeId: ["prize_id"],
    roomId: ["room_id", "liveId", "live_id"],
    termId: ["term_id", "liveTermId", "live_term_id"],
    customerId: ["customer_id", "userId", "user_id"],
    roomCode: ["room_code"],
    tenantId: ["tenant_id"],
    shareCode: ["share_code"],
    bindId: ["bind_id"],
    liveType: ["live_type"],
    watchDuration: ["watch_duration"],
    watchedSec: ["watched_sec"],
    thresholdSec: ["threshold_sec"],
    remainingSec: ["remaining_sec"],
    activityType: ["activity_type"],
    winType: ["win_type"],
    ...extraAliases
  });
  [
    "activityId",
    "activity_id",
    "prizeId",
    "prize_id",
    "roomId",
    "room_id",
    "liveId",
    "live_id",
    "termId",
    "term_id",
    "liveTermId",
    "live_term_id",
    "customerId",
    "customer_id",
    "userId",
    "user_id",
    "tenantId",
    "tenant_id",
    "watchDuration",
    "watch_duration",
    "watchedSec",
    "watched_sec",
    "thresholdSec",
    "threshold_sec",
    "remainingSec",
    "remaining_sec",
    "activityType",
    "activity_type",
    "winType",
    "win_type"
  ].forEach((key) => {
    if (payload[key] !== void 0)
      payload[key] = toNumberLike(payload[key]);
  });
  if (payload.liveId === void 0 && payload.roomId !== void 0)
    payload.liveId = payload.roomId;
  if (payload.live_id === void 0 && payload.room_id !== void 0)
    payload.live_id = payload.room_id;
  if (payload.roomId === void 0 && payload.liveId !== void 0)
    payload.roomId = payload.liveId;
  if (payload.room_id === void 0 && payload.live_id !== void 0)
    payload.room_id = payload.live_id;
  if (payload.userId === void 0 && payload.customerId !== void 0)
    payload.userId = payload.customerId;
  if (payload.user_id === void 0 && payload.customer_id !== void 0)
    payload.user_id = payload.customer_id;
  return payload;
}
function withNestedData(payload = {}) {
  const nested = payload.data && typeof payload.data === "object" && !Array.isArray(payload.data) ? { ...payload.data } : {};
  [
    "activityId",
    "activity_id",
    "prizeId",
    "prize_id",
    "roomId",
    "room_id",
    "liveId",
    "live_id",
    "termId",
    "term_id",
    "liveTermId",
    "live_term_id",
    "customerId",
    "customer_id",
    "userId",
    "user_id",
    "roomCode",
    "room_code",
    "tenantId",
    "tenant_id",
    "shareCode",
    "share_code",
    "bindId",
    "bind_id",
    "liveType",
    "live_type",
    "watchDuration",
    "watch_duration",
    "watchedSec",
    "watched_sec",
    "thresholdSec",
    "threshold_sec",
    "remainingSec",
    "remaining_sec",
    "activityType",
    "activity_type",
    "winType",
    "win_type",
    "comment",
    "content"
  ].forEach((key) => {
    if (payload[key] !== void 0 && payload[key] !== "")
      nested[key] = payload[key];
  });
  return { ...payload, data: nested };
}
function getPrizeRecordList(params = {}) {
  return api_h5.h5Get("/h5/marketing/prizeRecords", {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    winType: params.winType || params.win_type || 0,
    win_type: params.win_type || params.winType || 0,
    month: params.month || ""
  });
}
function claimWatchReward(data = {}) {
  return api_h5.h5Post("/h5/marketing/claimWatchReward", withNestedData(buildMarketingPayload(data)));
}
function getLotteryParticipants(params = {}) {
  const { participantsUrl, participants_url: participantsUrlSnake, ...data } = params || {};
  return api_h5.h5Get(participantsUrl || participantsUrlSnake || "/h5/marketing/lottery/participants", buildMarketingPayload(data, {
    drawId: ["draw_id", "lotteryId", "lottery_id"]
  }));
}
function getCommentLotteryList(params = {}) {
  return api_h5.h5Get("/h5/marketing/commentLottery/list", buildMarketingPayload(params));
}
function getCommentLotteryDetail(params = {}) {
  return api_h5.h5Get("/h5/marketing/commentLottery/detail", buildMarketingPayload(params));
}
function claimCommentReward(data = {}) {
  const payload = buildMarketingPayload(data, {
    comment: ["content"]
  });
  payload.comment = payload.comment || payload.content || "";
  payload.content = payload.content || payload.comment;
  return api_h5.h5Post("/h5/marketing/claimCommentReward", withNestedData(payload));
}
exports.claimCommentReward = claimCommentReward;
exports.claimWatchReward = claimWatchReward;
exports.getCommentLotteryDetail = getCommentLotteryDetail;
exports.getCommentLotteryList = getCommentLotteryList;
exports.getLotteryParticipants = getLotteryParticipants;
exports.getPrizeRecordList = getPrizeRecordList;
