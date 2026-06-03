"use strict";
const DEFAULT_LOTTERY_WIN_ICON = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffd84d" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>');
function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}
function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source == null ? void 0 : source[key];
    if (value !== void 0 && value !== null && value !== "")
      return value;
  }
  return void 0;
}
function unwrapLotteryPayload(message = {}) {
  const root = isObject(message) ? message : {};
  const data = isObject(root.data) ? root.data : {};
  const payload = isObject(root.payload) ? root.payload : {};
  const dataPayload = isObject(data.payload) ? data.payload : {};
  const payloadData = isObject(payload.data) ? payload.data : {};
  const result = isObject(root.result) ? root.result : isObject(data.result) ? data.result : isObject(payload.result) ? payload.result : isObject(dataPayload.result) ? dataPayload.result : {};
  const mergedData = {
    ...payload,
    ...payloadData,
    ...dataPayload,
    ...data,
    ...result
  };
  const mergedPayload = {
    ...mergedData,
    ...root,
    ...result
  };
  return { data: mergedData, payload: mergedPayload };
}
function getLotteryActivityType(value = {}) {
  return toNumber(
    value.activityType ?? value.activity_type ?? value.winType ?? value.win_type
  );
}
function isCommentLotteryPayload(message = {}) {
  const { data, payload } = unwrapLotteryPayload(message);
  return getLotteryActivityType(data) === 3 || getLotteryActivityType(payload) === 3 || Boolean((payload.event || data.event || "").toString().startsWith("comment_lottery_"));
}
function getLotteryRecordKey(payload = {}) {
  const recordId = firstValue(payload, "recordId", "record_id", "winnerRecordId", "winner_record_id", "id") || "";
  if (recordId)
    return String(recordId);
  const activityId = firstValue(payload, "activityId", "activity_id") || "";
  const prizeId = firstValue(payload, "prizeId", "prize_id", "rewardId", "reward_id") || "";
  const customerId = firstValue(payload, "customerId", "customer_id", "userId", "user_id") || "";
  const drawId = firstValue(payload, "drawId", "draw_id", "lotteryId", "lottery_id") || "";
  return `${drawId}:${activityId}:${prizeId}:${customerId}`;
}
function getLotteryRewardName(record = {}, fallbackPrize = {}) {
  return firstValue(record, "rewardName", "reward_name") || firstValue(record, "productName", "product_name") || firstValue(record, "prizeName", "prize_name") || firstValue(fallbackPrize, "rewardName", "reward_name") || firstValue(fallbackPrize, "productName", "product_name") || firstValue(fallbackPrize, "prizeName", "prize_name") || fallbackPrize.name || fallbackPrize.title || "抽奖奖品";
}
function getLotteryWinnerName(record = {}, defaultName = "中奖用户") {
  return record.nickname || record.nickName || record.nick_name || record.name || record.nick || record.customerName || record.customer_name || record.customerNickname || record.customer_nickname || record.userNickname || record.user_nickname || defaultName;
}
function appendLotteryWinMessage(appendSystemMessage, seenKeys, record = {}, fallbackPrize = {}, options = {}) {
  if (typeof appendSystemMessage !== "function")
    return false;
  const key = getLotteryRecordKey(record) || `${record.nickname || ""}:${getLotteryRewardName(record, fallbackPrize)}`;
  if (key && (seenKeys == null ? void 0 : seenKeys.has(key)))
    return false;
  if (key)
    seenKeys == null ? void 0 : seenKeys.add(key);
  const nick = getLotteryWinnerName(record, options.defaultName || "中奖用户");
  const prizeName = getLotteryRewardName(record, fallbackPrize);
  appendSystemMessage({
    type: "lottery_win",
    nick,
    prizeName,
    icon: options.icon || DEFAULT_LOTTERY_WIN_ICON,
    content: `${nick}获得${prizeName}`
  });
  return true;
}
exports.appendLotteryWinMessage = appendLotteryWinMessage;
exports.getLotteryActivityType = getLotteryActivityType;
exports.getLotteryRecordKey = getLotteryRecordKey;
exports.getLotteryRewardName = getLotteryRewardName;
exports.isCommentLotteryPayload = isCommentLotteryPayload;
exports.unwrapLotteryPayload = unwrapLotteryPayload;
