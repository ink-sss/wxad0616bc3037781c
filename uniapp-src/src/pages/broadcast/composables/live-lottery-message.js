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
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

const WINNER_NAME_KEYS = [
  "nickname",
  "nickName",
  "nick_name",
  "nick",
  "name",
  "customerName",
  "customer_name",
  "customerNickname",
  "customer_nickname",
  "customerNickName",
  "customer_nick_name",
  "userName",
  "user_name",
  "username",
  "userNickname",
  "user_nickname",
  "winnerName",
  "winner_name",
  "winnerNickname",
  "winner_nickname",
  "memberName",
  "member_name",
  "memberNickname",
  "member_nickname",
];

const WINNER_OBJECT_KEYS = [
  "winner",
  "winnerUser",
  "winner_user",
  "winningUser",
  "winning_user",
  "customer",
  "customerInfo",
  "customer_info",
  "user",
  "userInfo",
  "user_info",
  "member",
  "memberInfo",
  "member_info",
  "profile",
];

function normalizeDisplayName(value) {
  return String(value ?? "").trim();
}

export function maskLotteryWinnerName(name, defaultName = "中奖用户") {
  const raw = normalizeDisplayName(name);
  if (!raw) return defaultName;
  const chars = Array.from(raw);
  if (chars.length <= 1) return raw;
  if (chars.length === 2) return `${chars[0]}*${chars[1]}`;
  return `${chars[0]}***${chars[chars.length - 1]}`;
}

function getWinnerNameFromObject(source, seen = new Set()) {
  if (!isObject(source) || seen.has(source)) return "";
  seen.add(source);
  const directName = normalizeDisplayName(firstValue(source, ...WINNER_NAME_KEYS));
  if (directName) return directName;
  for (const key of WINNER_OBJECT_KEYS) {
    const nestedName = getWinnerNameFromObject(source[key], seen);
    if (nestedName) return nestedName;
  }
  return "";
}

export function unwrapLotteryPayload(message = {}) {
  const root = isObject(message) ? message : {};
  const data = isObject(root.data) ? root.data : {};
  const payload = isObject(root.payload) ? root.payload : {};
  const dataPayload = isObject(data.payload) ? data.payload : {};
  const payloadData = isObject(payload.data) ? payload.data : {};
  const result = isObject(root.result) ? root.result :
    isObject(data.result) ? data.result :
    isObject(payload.result) ? payload.result :
    isObject(dataPayload.result) ? dataPayload.result :
    {};
  const mergedData = {
    ...payload,
    ...payloadData,
    ...dataPayload,
    ...data,
    ...result,
  };
  const mergedPayload = {
    ...mergedData,
    ...root,
    ...result,
  };
  return { data: mergedData, payload: mergedPayload };
}

export function getLotteryActivityType(value = {}) {
  return toNumber(
    value.activityType ??
    value.activity_type ??
    value.winType ??
    value.win_type,
  );
}

export function isCommentLotteryPayload(message = {}) {
  const { data, payload } = unwrapLotteryPayload(message);
  return getLotteryActivityType(data) === 3 ||
    getLotteryActivityType(payload) === 3 ||
    Boolean((payload.event || data.event || "").toString().startsWith("comment_lottery_"));
}

export function getLotteryRecordKey(payload = {}) {
  const recordId = firstValue(payload, "recordId", "record_id", "winnerRecordId", "winner_record_id", "id") || "";
  if (recordId) return String(recordId);
  const activityId = firstValue(payload, "activityId", "activity_id") || "";
  const prizeId = firstValue(payload, "prizeId", "prize_id", "rewardId", "reward_id") || "";
  const customerId = firstValue(payload, "customerId", "customer_id", "userId", "user_id") || "";
  const drawId = firstValue(payload, "drawId", "draw_id", "lotteryId", "lottery_id") || "";
  return `${drawId}:${activityId}:${prizeId}:${customerId}`;
}

export function getLotteryRewardName(record = {}, fallbackPrize = {}) {
  return firstValue(record, "rewardName", "reward_name") ||
    firstValue(record, "productName", "product_name") ||
    firstValue(record, "prizeName", "prize_name") ||
    firstValue(fallbackPrize, "rewardName", "reward_name") ||
    firstValue(fallbackPrize, "productName", "product_name") ||
    firstValue(fallbackPrize, "prizeName", "prize_name") ||
    fallbackPrize.name ||
    fallbackPrize.title ||
    "抽奖奖品";
}

export function getLotteryWinnerName(record = {}, defaultName = "中奖用户") {
  return getWinnerNameFromObject(record) || defaultName;
}

export function getLotteryWinnerDisplayName(record = {}, defaultName = "中奖用户") {
  const rawName = getLotteryWinnerName(record, "");
  return rawName ? maskLotteryWinnerName(rawName, defaultName) : defaultName;
}

export function appendLotteryWinMessage(appendSystemMessage, seenKeys, record = {}, fallbackPrize = {}, options = {}) {
  if (typeof appendSystemMessage !== "function") return false;
  const defaultName = options.defaultName || "中奖用户";
  const rawNick = getLotteryWinnerName(record, "");
  const nick = rawNick ? maskLotteryWinnerName(rawNick, defaultName) : defaultName;
  const key = getLotteryRecordKey(record) || `${rawNick || defaultName}:${getLotteryRewardName(record, fallbackPrize)}`;
  if (key && seenKeys?.has(key)) return false;
  if (key) seenKeys?.add(key);
  const prizeName = getLotteryRewardName(record, fallbackPrize);
  appendSystemMessage({
    type: "lottery_win",
    nick,
    prizeName,
    icon: options.icon || DEFAULT_LOTTERY_WIN_ICON,
    content: `${nick}获得${prizeName}`,
  });
  return true;
}
