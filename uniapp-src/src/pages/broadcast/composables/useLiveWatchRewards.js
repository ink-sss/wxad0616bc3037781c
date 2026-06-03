import { computed, onBeforeUnmount, ref, watch } from "vue";
import { appendLotteryWinMessage, unwrapLotteryPayload } from "./live-lottery-message.js";

const WATCH_REWARD_RELOAD_DELAY = 500;
const WATCH_REWARD_BROADCAST_DURATION = 2800;
const CLAIM_STATUS_SOLD_OUT = 5;
const WATCH_REWARD_CLAIM_STORAGE_PREFIX = "live_watch_reward_claimed_v1";
const WATCH_REWARD_CLAIM_STORAGE_LIMIT = 100;

// 模块级别：记录已抢光的活动ID，跨组件挂载持久有效（SPA内不会丢失）
// 解决问题：后端缓存(30s/5min)中库存数据过期，重新进入直播间时reload把已抢光任务又拉回来
const _soldOutActivityIds = new Set();

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeEventName(value = "") {
  return String(value || "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[-\s.]+/g, "_")
    .replace(/__+/g, "_")
    .toLowerCase();
}

function normalizeWatchRewardPayload(message = {}) {
  if (!isPlainObject(message)) return {};
  const { data, payload } = unwrapLotteryPayload(message);
  const nestedData = isPlainObject(message.data) ? message.data : {};
  const topPayload = isPlainObject(message.payload) ? message.payload : {};
  const nestedPayload = isPlainObject(nestedData.payload) ? nestedData.payload : {};
  return {
    ...message,
    ...topPayload,
    ...nestedPayload,
    ...(isPlainObject(data) ? data : {}),
    ...(isPlainObject(payload) ? payload : {}),
  };
}

function getPayloadSources(payload = {}) {
  if (!isPlainObject(payload)) return [];
  const data = isPlainObject(payload.data) ? payload.data : {};
  const nestedPayload = isPlainObject(data.payload) ? data.payload : {};
  const topPayload = isPlainObject(payload.payload) ? payload.payload : {};
  const result = isPlainObject(payload.result) ? payload.result : {};
  return [
    payload,
    data,
    nestedPayload,
    topPayload,
    result,
    isPlainObject(data.result) ? data.result : {},
    isPlainObject(topPayload.result) ? topPayload.result : {},
  ].filter((item) => Object.keys(item).length > 0);
}

function pickNestedList(payload = {}, ...keys) {
  const sources = getPayloadSources(payload);
  const nestedKeys = ["page", "pager", "pagination", "result", "data", "payload", "marketingConfig", "marketing_config"];
  const fallbackKeys = ["records", "rows", "items", "list", "dataList", "data_list"];
  for (const source of sources) {
    for (const key of keys) {
      if (Array.isArray(source[key])) return source[key];
    }
    for (const nestedKey of nestedKeys) {
      const nested = source[nestedKey];
      if (!isPlainObject(nested)) continue;
      for (const key of keys) {
        if (Array.isArray(nested[key])) return nested[key];
      }
      for (const key of fallbackKeys) {
        if (Array.isArray(nested[key])) return nested[key];
      }
    }
  }
  return [];
}

function toBooleanFlag(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  const text = String(value).trim().toLowerCase();
  if (["true", "yes", "y", "on"].includes(text)) return true;
  if (["false", "no", "n", "off"].includes(text)) return false;
  return Boolean(value);
}

function normalizeClaimSuccessPayload(raw = {}, fallbackTask = {}) {
  const base = normalizeWatchRewardPayload(raw);
  const record = firstValue(base, "record", "claimRecord", "claim_record", "winnerRecord", "winner_record", "result") || {};
  const reward = firstValue(base, "reward", "rewardInfo", "reward_info", "prize", "prizeInfo", "prize_info", "coupon", "product", "goods") || {};
  const activity = firstValue(base, "activity", "activityInfo", "activity_info", "watchReward", "watch_reward") || {};
  const progress = firstValue(base, "userProgress", "user_progress", "progress") || {};
  const merged = {
    ...(isPlainObject(fallbackTask) ? fallbackTask : {}),
    ...(isPlainObject(activity) ? activity : {}),
    ...(isPlainObject(reward) ? reward : {}),
    ...(isPlainObject(record) ? record : {}),
    ...base,
  };
  const activityId = getActivityId(merged);
  const activityType = toNumber(firstValue(merged, "activityType", "activity_type", "winType", "win_type"), 1);
  const explicitClaimStatus =
    firstValue(base, "claimStatus", "claim_status") ??
    firstValue(record, "claimStatus", "claim_status") ??
    firstValue(reward, "claimStatus", "claim_status") ??
    firstValue(activity, "claimStatus", "claim_status");
  const claimStatus = toNumber(explicitClaimStatus, 3);
  const rewardType = toNumber(firstValue(merged, "rewardType", "reward_type", "prizeType", "prize_type"), toNumber(fallbackTask.rewardType, 2));
  const rewardName = firstValue(merged, "rewardName", "reward_name", "productName", "product_name", "couponName", "coupon_name", "prizeName", "prize_name", "name") || fallbackTask.rewardName || "观看奖励";
  const rewardImage = firstValue(merged, "rewardImage", "reward_image", "productImage", "product_image", "couponImage", "coupon_image", "prizeImage", "prize_image", "image") || fallbackTask.rewardImage || "";
  const rewardQuantity = toNumber(firstValue(merged, "rewardQuantity", "reward_quantity", "quantity", "num"), fallbackTask.rewardQuantity || 1) || 1;
  const customerCouponId = firstValue(merged, "customerCouponId", "customer_coupon_id", "couponCustomerId", "coupon_customer_id", "couponId", "coupon_id") || fallbackTask.customerCouponId || 0;
  const orderNo = firstValue(merged, "orderNo", "order_no", "orderId", "order_id", "outTradeNo", "out_trade_no") || fallbackTask.orderNo || "";
  const claimedAt = firstValue(merged, "claimedAt", "claimed_at", "createdAt", "created_at", "winTime", "win_time") || fallbackTask.claimedAt || "";
  const progressPayload = isPlainObject(progress) ? progress : {};
  return {
    ...merged,
    activityId,
    activity_id: activityId,
    activityType,
    activity_type: activityType,
    claimStatus,
    claim_status: claimStatus,
    alreadyClaimed: toBooleanFlag(firstValue(merged, "alreadyClaimed", "already_claimed", "isClaimed", "is_claimed"), false),
    rewardType,
    reward_type: rewardType,
    rewardName,
    reward_name: rewardName,
    rewardImage,
    reward_image: rewardImage,
    rewardQuantity,
    reward_quantity: rewardQuantity,
    customerCouponId,
    customer_coupon_id: customerCouponId,
    orderNo,
    order_no: orderNo,
    needReceiver: toBooleanFlag(firstValue(merged, "needReceiver", "need_receiver", "needAddress", "need_address"), Boolean(fallbackTask.needReceiver)),
    claimedAt,
    claimed_at: claimedAt,
    userProgress: {
      ...(fallbackTask.userProgress || {}),
      ...progressPayload,
      watchedSec: firstValue(progressPayload, "watchedSec", "watched_sec", "effectiveWatchedSec", "effective_watched_sec") ?? progressPayload.watchedSec,
      thresholdSec: firstValue(progressPayload, "thresholdSec", "threshold_sec") ?? progressPayload.thresholdSec,
    },
  };
}

function pickNumber(...values) {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function getActivityId(payload = {}) {
  return toNumber(firstValue(payload, "activityId", "activity_id", "watchRewardActivityId", "watch_reward_activity_id", "watchRewardId", "watch_reward_id", "id"));
}

function getActivityType(payload = {}) {
  return toNumber(firstValue(payload, "activityType", "activity_type", "winType", "win_type"));
}

function getWatchRewardEventName(payload = {}) {
  return normalizeEventName(
    firstValue(payload, "event", "action", "operation", "op", "customEvent", "custom_event", "eventName", "event_name", "name", "cmd", "type") || ""
  );
}

function hasWatchRewardMarker(payload = {}) {
  const eventName = getWatchRewardEventName(payload);
  const compactName = eventName.replace(/_/g, "");
  return eventName.includes("watch_reward") ||
    compactName.includes("watchreward") ||
    eventName.includes("watch_duration") ||
    compactName.includes("watchduration") ||
    firstValue(payload, "watchRewardActivityId", "watch_reward_activity_id", "watchRewardId", "watch_reward_id") !== undefined;
}

function isWatchRewardPayload(payload = {}) {
  return getActivityType(payload) === 1 || hasWatchRewardMarker(payload);
}

function getCustomerId(myUserId, payload = {}) {
  return toNumber(firstValue(payload, "customerId", "customer_id", "userId", "user_id") || myUserId.value || 0);
}

function getClaimKey(myUserId, payload = {}) {
  const activityId = getActivityId(payload);
  const customerId = getCustomerId(myUserId, payload);
  const claimedAt =
    firstValue(payload, "claimedAt", "claimed_at") ||
    firstValue(payload, "createdAt", "created_at") ||
    firstValue(payload, "customerCouponId", "customer_coupon_id") ||
    firstValue(payload, "orderNo", "order_no", "orderId", "order_id") ||
    "done";
  return `${activityId}:${customerId}:${claimedAt}`;
}

function getClaimStorageKey(roomCode, customerId) {
  const room = String(roomCode || "").trim();
  const userId = toNumber(customerId);
  if (!room || userId <= 0) return "";
  return `${WATCH_REWARD_CLAIM_STORAGE_PREFIX}:${room}:${userId}`;
}

function readStorageValue(key) {
  try {
    if (uni?.getStorageSync) {
      const value = uni.getStorageSync(key);
      if (value !== undefined && value !== null && value !== "") return String(value);
    }
  } catch (e) {}
  return "";
}

function writeStorageValue(key, value) {
  try {
    uni?.setStorageSync?.(key, value);
  } catch (e) {}
}

function readStoredClaimMarkers(roomCode, customerId) {
  const key = getClaimStorageKey(roomCode, customerId);
  if (!key) return [];
  const raw = readStorageValue(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch (e) {
    return [];
  }
}

function writeStoredClaimMarkers(roomCode, customerId, markers) {
  const key = getClaimStorageKey(roomCode, customerId);
  if (!key) return;
  const next = Array.from(new Set(markers)).slice(-WATCH_REWARD_CLAIM_STORAGE_LIMIT);
  writeStorageValue(key, JSON.stringify(next));
}

function getRewardUnit(task) {
  return Number(task.rewardType) === 1 ? "件" : "张";
}

function formatEntryCountdown(seconds) {
  const remaining = Math.max(toNumber(seconds), 0);
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function normalizeLifecycleAction(payload = {}) {
  const rawAction = String(
    firstValue(payload, "action", "event", "operation", "op", "changeType", "change_type") || ""
  ).toLowerCase();
  if (["create", "add", "enable", "open", "start", "reopen"].includes(rawAction)) return "open";
  if (["edit", "update", "modify"].includes(rawAction)) return "update";
  if (["close", "disable", "stop", "offline"].includes(rawAction)) return "close";
  if (["delete", "remove"].includes(rawAction)) return "delete";
  return rawAction;
}

function getClaimErrorMessage(err) {
  return err?.message || err?.response?.msg || "领取失败，请稍后重试";
}

function isWatchRewardNotReachedError(message) {
  return message.includes("观看时长未达标") ||
    message.includes("观看时长不足") ||
    message.includes("未找到观看记录");
}

function isWatchRewardInvalidError(message) {
  return message.includes("活动未启用") ||
    message.includes("活动已关闭") ||
    message.includes("活动已失效") ||
    message.includes("活动不存在");
}

function isWatchRewardSoldOutError(err, message) {
  const code = toNumber(err?.response?.code || err?.code);
  return code === 40003 ||
    message.includes("已领完") ||
    message.includes("领完") ||
    message.includes("已抢完") ||
    message.includes("抢完") ||
    message.includes("已发放完毕") ||
    message.includes("库存不足") ||
    message.includes("名额已满") ||
    message.includes("中奖名额已满");
}

function parseRemainingSecFromMessage(message) {
  const match = String(message || "").match(/还需观看\s*(\d+)\s*秒/);
  return match ? toNumber(match[1], null) : null;
}

function getExplicitStockExhausted(raw = {}) {
  const explicit = firstValue(raw, "stockExhausted", "stock_exhausted");
  if (explicit !== undefined) return Boolean(explicit);
  const stockKeys = [
    "remainingStock",
    "remaining_stock",
    "rewardStock",
    "reward_stock",
    "stock",
    "remainingCoupon",
    "remaining_coupon",
    "couponRemaining",
    "coupon_remaining",
    "remainingQuota",
    "remaining_quota",
    "remainingCount",
    "remaining_count",
  ];
  for (const key of stockKeys) {
    if (raw[key] === undefined || raw[key] === null || raw[key] === "") continue;
    const value = Number(raw[key]);
    if (Number.isFinite(value)) return value <= 0;
  }
  return null;
}

function readActivityScopedWatchedSec(raw, progress) {
  const hasMarker = Boolean(
    firstValue(progress, "progressStartedAt", "progress_started_at") ||
    firstValue(progress, "activityOpenedAt", "activity_opened_at") ||
    firstValue(raw, "progressStartedAt", "progress_started_at") ||
    firstValue(raw, "activityOpenedAt", "activity_opened_at") ||
    firstValue(raw, "progressSource", "progress_source") === "activity"
  );
  return pickNumber(
    firstValue(progress, "activityWatchedSec", "activity_watched_sec"),
    firstValue(progress, "watchRewardWatchedSec", "watch_reward_watched_sec"),
    firstValue(progress, "activityEffectiveWatchedSec", "activity_effective_watched_sec"),
    firstValue(progress, "effectiveWatchedSecAfterOpen", "effective_watched_sec_after_open"),
    firstValue(raw, "activityWatchedSec", "activity_watched_sec"),
    firstValue(raw, "watchRewardWatchedSec", "watch_reward_watched_sec"),
    firstValue(raw, "activityEffectiveWatchedSec", "activity_effective_watched_sec"),
    hasMarker ? firstValue(progress, "effectiveWatchedSec", "effective_watched_sec") : undefined,
    hasMarker ? firstValue(progress, "watchedSec", "watched_sec") : undefined,
    hasMarker ? firstValue(raw, "effectiveWatchedSec", "effective_watched_sec") : undefined,
    hasMarker ? firstValue(raw, "watchedSec", "watched_sec") : undefined
  );
}

function hasActivityScopedProgress(raw, progress, watchedSec) {
  return watchedSec !== null ||
    Boolean(
      firstValue(progress, "progressStartedAt", "progress_started_at") ||
      firstValue(progress, "activityOpenedAt", "activity_opened_at") ||
      firstValue(progress, "activityRemainingSec", "activity_remaining_sec") !== undefined ||
      firstValue(raw, "progressStartedAt", "progress_started_at") ||
      firstValue(raw, "activityOpenedAt", "activity_opened_at") ||
      firstValue(raw, "activityRemainingSec", "activity_remaining_sec") !== undefined ||
      firstValue(raw, "progressSource", "progress_source") === "activity"
  );
}

function buildClaimFailureProgressPatch(err, message, currentTask = {}) {
  const data = err?.response?.data || err?.data || {};
  const progress = data.userProgress || data.user_progress || data.progress || {};
  const thresholdSec = toNumber(currentTask.thresholdSec);
  let remainingSec = pickNumber(
    firstValue(progress, "activityRemainingSec", "activity_remaining_sec"),
    firstValue(data, "activityRemainingSec", "activity_remaining_sec"),
    firstValue(progress, "remainingSec", "remaining_sec"),
    firstValue(data, "remainingSec", "remaining_sec"),
    parseRemainingSecFromMessage(message)
  );
  let watchedSec = readActivityScopedWatchedSec(data, progress);

  if (watchedSec === null && remainingSec !== null) {
    watchedSec = Math.max(thresholdSec - remainingSec, 0);
  }
  if (watchedSec === null) {
    const fallbackRemaining = Math.max(toNumber(currentTask.remainingSec, 1), 1);
    watchedSec = Math.max(thresholdSec - fallbackRemaining, 0);
    remainingSec = fallbackRemaining;
  }
  watchedSec = Math.max(watchedSec, 0);
  remainingSec = Math.max(pickNumber(remainingSec, thresholdSec - watchedSec) || 0, 0);

  return {
    activityWatchedSec: watchedSec,
    activityRemainingSec: remainingSec,
    watchedSec,
    remainingSec,
    reached: remainingSec <= 0,
    progressSource: progress.progressSource || data.progressSource || "activity",
    userProgress: {
      ...(currentTask.userProgress || {}),
      ...progress,
      activityWatchedSec: watchedSec,
      activityRemainingSec: remainingSec,
      remainingSec,
      reached: remainingSec <= 0,
      activityOpenedAt: firstValue(progress, "activityOpenedAt", "activity_opened_at") || firstValue(data, "activityOpenedAt", "activity_opened_at") || currentTask.activityOpenedAt || "",
      progressStartedAt: firstValue(progress, "progressStartedAt", "progress_started_at") || firstValue(data, "progressStartedAt", "progress_started_at") || "",
      progressSource: firstValue(progress, "progressSource", "progress_source") || firstValue(data, "progressSource", "progress_source") || "activity",
    },
  };
}

function getTaskRecencyKey(task = {}) {
  return String(
    firstValue(task, "activityOpenedAt", "activity_opened_at") ||
    task.userProgress?.activityOpenedAt ||
    task.user_progress?.activity_opened_at ||
    firstValue(task, "openedAt", "opened_at") ||
    firstValue(task, "updatedAt", "updated_at") ||
    firstValue(task, "createdAt", "created_at") ||
    ""
  );
}

function getClaimMarker(task = {}) {
  const activityId = getActivityId(task);
  if (activityId <= 0) return "";
  return `${activityId}:${getTaskRecencyKey(task) || "default"}`;
}

function rememberClaimedTask(roomCode, customerId, task = {}) {
  const marker = getClaimMarker(task);
  if (!marker) return;
  const markers = readStoredClaimMarkers(roomCode, customerId);
  if (markers.includes(marker)) return;
  markers.push(marker);
  writeStoredClaimMarkers(roomCode, customerId, markers);
}

function isStoredClaimedTask(roomCode, customerId, task = {}) {
  const marker = getClaimMarker(task);
  if (!marker) return false;
  return readStoredClaimMarkers(roomCode, customerId).includes(marker);
}

function compareWatchRewardTasksDesc(a, b) {
  const left = getTaskRecencyKey(a);
  const right = getTaskRecencyKey(b);
  if (left !== right) return right.localeCompare(left);
  return toNumber(b.activityId) - toNumber(a.activityId);
}

function isVisibleWatchRewardTask(task = {}, myUserId = 0) {
  const claimStatus = toNumber(firstValue(task, "claimStatus", "claim_status"));
  // 已领取(claimed=true 或 claimStatus=3)的任务不再显示
  if (task.claimed || claimStatus === 3) return false;
  // 已抢光的活动不再显示（防止后端缓存返回过期库存拉回任务）
  if (_soldOutActivityIds.has(getActivityId(task))) return false;
  // 指定用户(userType=2)活动不在前端过滤：
  // 所有用户首次都能看到，领取失败后由后端 Redis 标记过滤，下次不再返回
  return getActivityId(task) > 0 &&
    toNumber(firstValue(task, "activityStatus", "activity_status"), 1) === 1 &&
    (claimStatus === 0 || claimStatus === 1);
}

function normalizeTask(raw, existing, options = {}) {
  const thresholdSec = toNumber(firstValue(raw, "thresholdSec", "threshold_sec"), toNumber(firstValue(raw, "duration", "duration_minutes")) * 60);
  const progress = raw.userProgress || raw.user_progress || {};
  let claimStatus = toNumber(firstValue(raw, "claimStatus", "claim_status"));
  if (
    existing?.claimStatus === 3 &&
    getClaimMarker(existing) === getClaimMarker(raw) &&
    claimStatus !== 4 &&
    claimStatus !== CLAIM_STATUS_SOLD_OUT
  ) {
    claimStatus = 3;
  }
  if (
    existing?.claimStatus === 2 &&
    claimStatus !== 3 &&
    claimStatus !== 4 &&
    claimStatus !== CLAIM_STATUS_SOLD_OUT
  ) {
    claimStatus = 2;
  }
  const explicitStockExhausted = getExplicitStockExhausted(raw);
  const stockExhausted = claimStatus === CLAIM_STATUS_SOLD_OUT ||
    explicitStockExhausted === true ||
    (explicitStockExhausted === null && Boolean(existing?.stockExhausted));
  const activityScopedWatchedSec = readActivityScopedWatchedSec(raw, progress);
  const scopedByMarker = hasActivityScopedProgress(raw, progress, activityScopedWatchedSec);
  const explicitRemainingSec = pickNumber(
    firstValue(progress, "activityRemainingSec", "activity_remaining_sec"),
    firstValue(raw, "activityRemainingSec", "activity_remaining_sec"),
    firstValue(progress, "remainingSec", "remaining_sec"),
    firstValue(raw, "remainingSec", "remaining_sec")
  );
  let watchedSec = activityScopedWatchedSec;
  if (watchedSec === null && scopedByMarker && explicitRemainingSec !== null) {
    watchedSec = Math.max(thresholdSec - explicitRemainingSec, 0);
  }
  if (watchedSec === null) {
    // 当前后端的 effectiveWatchedSec/watchedSec 是课期累计时长，不能作为活动开启后的倒计时口径。
    watchedSec = toNumber(options.localWatchedSec);
  }
  if (claimStatus === 3) {
    watchedSec = thresholdSec;
  }
  const rewardType = toNumber(firstValue(raw, "rewardType", "reward_type"));
  const rewardQuantity = toNumber(firstValue(raw, "rewardQuantity", "reward_quantity", "quantity", "num"), 1) || 1;
  const remainingSec = Math.max(thresholdSec - watchedSec, 0);
  const reached = scopedByMarker ? (Boolean(progress.reached) || remainingSec <= 0) : remainingSec <= 0;
  if (
    claimStatus !== 2 &&
    claimStatus !== 3 &&
    claimStatus !== 4 &&
    claimStatus !== CLAIM_STATUS_SOLD_OUT
  ) {
    claimStatus = stockExhausted ? CLAIM_STATUS_SOLD_OUT : (reached ? 1 : 0);
  }

  return {
    ...(existing || {}),
    ...raw,
    activityId: getActivityId(raw),
    activityName: firstValue(raw, "activityName", "activity_name", "name") || "",
    activityStatus: toNumber(firstValue(raw, "activityStatus", "activity_status"), 1),
    duration: toNumber(firstValue(raw, "duration", "duration_minutes")),
    thresholdSec,
    claimType: toNumber(firstValue(raw, "claimType", "claim_type"), 1),
    userType: toNumber(firstValue(raw, "userType", "user_type")),
    userIds: firstValue(raw, "userIds", "user_ids") || "",
    rewardType,
    rewardName: firstValue(raw, "rewardName", "reward_name", "productName", "product_name", "couponName", "coupon_name", "name") || "观看奖励",
    rewardImage: firstValue(raw, "rewardImage", "reward_image", "productImage", "product_image", "couponImage", "coupon_image", "image") || "",
    rewardQuantity,
    rewardLabel: `${rewardType === 1 ? "商品" : "优惠券"}${rewardQuantity}${rewardType === 1 ? "件" : "张"}`,
    watchedSec,
    remainingSec,
    reached,
    claimStatus,
    stockExhausted,
    claimed: Boolean(firstValue(raw, "claimed", "isClaimed", "is_claimed")) || claimStatus === 3,
    collapsed: existing?.collapsed || false,
    claimedAt: firstValue(raw, "claimedAt", "claimed_at") || existing?.claimedAt || "",
    orderNo: firstValue(raw, "orderNo", "order_no", "orderId", "order_id") || existing?.orderNo || "",
    customerCouponId: firstValue(raw, "customerCouponId", "customer_coupon_id") || existing?.customerCouponId || 0,
  };
}

export function useLiveWatchRewards(ctx) {
  const {
    roomCode,
    liveId,
    liveTenantId,
    shareCode,
    liveBindId,
    isReplay,
    getEffectiveTermId,
    myUserId,
    isPlaying,
    getLiveDetailApi,
    claimWatchRewardApi,
    appendSystemMessage,
    getMyNickname: resolveMyNickname,
  } = ctx;

  // 逐人 lottery_win 消息去重 Set（broadcast 与 win_notify 可能重复推送同一条记录）
  const handledMessageIds = new Set();

  // 本人中奖时，后端 payload 可能不携 nickname，由上层注入当前用户昵称兜底。
  function getMyNickname() {
    return resolveMyNickname?.() || "我";
  }

  const watchRewardTasks = ref([]);
  const showWatchRewardPanel = ref(false);
  const watchRewardPanelOpenKey = ref(0);
  const watchRewardResult = ref(null);
  const watchRewardBroadcast = ref(null);
  const watchRewardBroadcastRenderKey = ref(0);
  const seenClaimKeys = new Set();
  const claimingIds = new Set();
  const autoClaimCooldownUntil = new Map();
  const localProgressWatchedSec = new Map();
  const pendingProgressResetIds = new Set();
  // [2026-05-22] 记录最后一次从 detail 同步的时间戳，用于 reloadWatchRewards 的短期幂等跳过。
  //   场景：entry.vue 在 onLiveDetailLoaded 会同步一次，WS onOpen 又会触发 reloadMarketingRuntime，
  //   两者靠近时 reload 是冗余的；IM 消息驱动的 requestWatchRewardReload 不会过该路径，付费不会被误跳。
  let _lastSyncAt = 0;
  let tickTimer = null;
  let reloadTimer = null;
  let broadcastTimer = null;

  const visibleWatchRewardTasks = computed(() => {
    return watchRewardTasks.value.filter((task) => isVisibleWatchRewardTask(task, toNumber(myUserId.value)));
  });

  const hasVisibleWatchRewardTasks = computed(() => {
    return visibleWatchRewardTasks.value.length > 0;
  });

  const watchRewardEntryLabel = computed(() => {
    const claimableTask = visibleWatchRewardTasks.value.find((task) => task.claimStatus === 1);
    if (claimableTask) return "领取";
    const pendingTask = visibleWatchRewardTasks.value
      .filter((task) => task.claimStatus === 0 && task.remainingSec > 0)
      .sort((a, b) => a.remainingSec - b.remainingSec)[0];
    if (pendingTask) return formatEntryCountdown(pendingTask.remainingSec);
    return "";
  });

  function syncFromLiveDetail(detail) {
    _lastSyncAt = Date.now();
    const marketingConfig = detail?.marketingConfig || detail?.marketing_config || {};
    const list = pickNestedList(
      { ...detail, marketingConfig },
      "watchRewards",
      "watch_rewards",
      "watchRewardList",
      "watch_reward_list",
      "watchRewardActivities",
      "watch_reward_activities",
      "watchDurationRewards",
      "watch_duration_rewards",
      "rewards",
      "rewardList",
      "reward_list",
    );
    if (!Array.isArray(list)) {
      watchRewardTasks.value = [];
      showWatchRewardPanel.value = false;
      localProgressWatchedSec.clear();
      pendingProgressResetIds.clear();
      return;
    }
    const existingMap = new Map(watchRewardTasks.value.map((item) => [item.activityId, item]));
    const storageCustomerId = toNumber(firstValue(detail || {}, "customerId", "customer_id", "userId", "user_id") || myUserId.value || 0);
    const nextIds = new Set(list.map((item) => getActivityId(item)).filter((id) => id > 0));
    Array.from(localProgressWatchedSec.keys()).forEach((id) => {
      if (!nextIds.has(id)) localProgressWatchedSec.delete(id);
    });
    watchRewardTasks.value = list
      .map((item) => {
        const activityId = getActivityId(item);
        const existing = existingMap.get(activityId);
        let sourceItem = item;
        const claimStatus = toNumber(firstValue(item, "claimStatus", "claim_status"));
        if (claimStatus === 3) {
          rememberClaimedTask(roomCode.value, storageCustomerId, item);
        } else if (isStoredClaimedTask(roomCode.value, storageCustomerId, item)) {
          sourceItem = { ...item, claimStatus: 3, claimed: true };
        }
        const effectiveClaimStatus = toNumber(firstValue(sourceItem, "claimStatus", "claim_status"));
        if (effectiveClaimStatus === 3 || effectiveClaimStatus === 4) {
          localProgressWatchedSec.delete(activityId);
          pendingProgressResetIds.delete(activityId);
        } else if (activityId > 0 && (!localProgressWatchedSec.has(activityId) || pendingProgressResetIds.has(activityId))) {
          localProgressWatchedSec.set(activityId, 0);
          pendingProgressResetIds.delete(activityId);
        }
        return normalizeTask(sourceItem, existing, {
          localWatchedSec: localProgressWatchedSec.get(activityId) || 0,
        });
      })
      .filter((task) => isVisibleWatchRewardTask(task, toNumber(myUserId.value)))
      .sort(compareWatchRewardTasksDesc);
    if (!hasVisibleWatchRewardTasks.value) {
      showWatchRewardPanel.value = false;
    }
    checkAutoClaims();
  }

  async function reloadWatchRewards({ minStaleMs = 0 } = {}) {
    if (!roomCode.value || typeof getLiveDetailApi !== "function") return;
    if (minStaleMs > 0 && _lastSyncAt && Date.now() - _lastSyncAt < minStaleMs) {
      // 刚从 detail 同步过，跳过冗余拉取
      return;
    }
    try {
      const detail = await getLiveDetailApi(roomCode.value);
      syncFromLiveDetail(detail);
    } catch (err) {
      console.warn("[Live][WatchReward] reload detail fail:", err);
    }
  }

  function requestWatchRewardReload(payload = {}) {
    const eventPayload = normalizeWatchRewardPayload(payload);
    const action = normalizeLifecycleAction(eventPayload);
    const activityId = getActivityId(eventPayload);
    // open 表示活动「新开启」，本地累计需从 0 重新计算；
    // update 仅是活动属性/库存等元信息变更，不应清零任一活动的累计观看时长，
    // 否则在「多奖励同时可领取场景」下，领取其中一个会触发 update lifecycle，
    // 导致其它未领取奖励被错误地重置进度（bug：另一个奖励重新计时）。
    if (action === "open" && activityId <= 0) {
      localProgressWatchedSec.clear();
      pendingProgressResetIds.clear();
      _soldOutActivityIds.clear();
    }
    if (action === "open" && activityId > 0) {
      localProgressWatchedSec.set(activityId, 0);
      pendingProgressResetIds.add(activityId);
      _soldOutActivityIds.delete(activityId);
      updateTask(activityId, { stockExhausted: false });
    }
    if (action === "update" && activityId > 0) {
      // 仅刷新库存等元信息提示，不重置本地/服务端累计时长
      _soldOutActivityIds.delete(activityId);
      updateTask(activityId, { stockExhausted: false });
    }
    if ((action === "delete" || action === "close") && activityId > 0) {
      localProgressWatchedSec.delete(activityId);
      pendingProgressResetIds.delete(activityId);
      watchRewardTasks.value = watchRewardTasks.value.filter((task) => task.activityId !== activityId);
      if (!hasVisibleWatchRewardTasks.value) {
        showWatchRewardPanel.value = false;
      }
    }
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      reloadTimer = null;
      reloadWatchRewards();
    }, WATCH_REWARD_RELOAD_DELAY);
  }

  function openWatchRewardPanel() {
    if (hasVisibleWatchRewardTasks.value) {
      watchRewardPanelOpenKey.value += 1;
      showWatchRewardPanel.value = true;
    }
  }

  function closeWatchRewardPanel() {
    showWatchRewardPanel.value = false;
  }

  function closeWatchRewardResult() {
    watchRewardResult.value = null;
  }

  function updateTask(activityId, patch) {
    const id = toNumber(activityId);
    watchRewardTasks.value = watchRewardTasks.value.map((task) => {
      if (task.activityId !== id) return task;
      return normalizeTask({ ...task, ...patch }, task, {
        localWatchedSec: localProgressWatchedSec.get(id) || task.watchedSec || 0,
      });
    });
  }

  function removeWatchRewardTask(activityId) {
    const id = toNumber(activityId);
    if (!id) return;
    claimingIds.delete(id);
    autoClaimCooldownUntil.delete(id);
    localProgressWatchedSec.delete(id);
    pendingProgressResetIds.delete(id);
    watchRewardTasks.value = watchRewardTasks.value.filter((task) => task.activityId !== id);
    if (!hasVisibleWatchRewardTasks.value) {
      showWatchRewardPanel.value = false;
    }
  }

  function applyClaimSuccess(payload = {}, options = {}) {
    const normalizedInput = normalizeClaimSuccessPayload(payload, options.fallbackTask || {});
    const activityId = getActivityId(normalizedInput);
    if (!activityId) return;
    claimingIds.delete(activityId);
    const existingTask = watchRewardTasks.value.find((task) => task.activityId === activityId) || {};
    const normalizedPayload = normalizeTask(normalizedInput, existingTask, {
      localWatchedSec: existingTask.watchedSec || 0,
    });
    const mergedPayload = normalizeTask({ ...existingTask, ...normalizedPayload }, existingTask, {
      localWatchedSec: existingTask.watchedSec || 0,
    });
    const key = getClaimKey(myUserId, mergedPayload);
    const alreadySeen = seenClaimKeys.has(key);
    seenClaimKeys.add(key);
    rememberClaimedTask(roomCode.value, getCustomerId(myUserId, mergedPayload), mergedPayload);
    // 领取成功后直接从任务列表移除(而非仅更新claimStatus),
    // 确保列表中不再出现已领取的任务
    removeWatchRewardTask(activityId);
    if (!alreadySeen && !mergedPayload.alreadyClaimed && options.showResult !== false) {
      showWatchRewardPanel.value = false;
      watchRewardResult.value = {
        ...mergedPayload,
        rewardName: mergedPayload.rewardName || "观看奖励",
        rewardImage: mergedPayload.rewardImage || "",
        rewardQuantity: toNumber(mergedPayload.rewardQuantity, 1) || 1,
        rewardType: toNumber(mergedPayload.rewardType, 2),
      };
    } else if (!hasVisibleWatchRewardTasks.value) {
      showWatchRewardPanel.value = false;
    }
  }

  async function claimWatchRewardTask(taskOrId) {
    const activityId = toNumber(typeof taskOrId === "object" ? taskOrId.activityId : taskOrId);
    if (!activityId || claimingIds.has(activityId) || typeof claimWatchRewardApi !== "function") return;
    claimingIds.add(activityId);
    updateTask(activityId, { claimStatus: 2 });
    if (!hasVisibleWatchRewardTasks.value) {
      showWatchRewardPanel.value = false;
    }
    try {
      const currentTask = watchRewardTasks.value.find((task) => task.activityId === activityId) || { activityId };
      const result = await claimWatchRewardApi({
        activityId,
        activity_id: activityId,
        roomId: toNumber(liveId?.value),
        room_id: toNumber(liveId?.value),
        liveId: toNumber(liveId?.value),
        live_id: toNumber(liveId?.value),
        tenantId: toNumber(liveTenantId?.value),
        tenant_id: toNumber(liveTenantId?.value),
        shareCode: shareCode?.value || "",
        share_code: shareCode?.value || "",
        bindId: liveBindId?.value || "",
        bind_id: liveBindId?.value || "",
        liveType: isReplay?.value ? "replay" : "live",
        live_type: isReplay?.value ? "replay" : "live",
        termId: typeof getEffectiveTermId === "function" ? getEffectiveTermId() : 0,
        term_id: typeof getEffectiveTermId === "function" ? getEffectiveTermId() : 0,
        customerId: toNumber(myUserId.value),
        customer_id: toNumber(myUserId.value),
        userId: toNumber(myUserId.value),
        user_id: toNumber(myUserId.value),
        roomCode: roomCode.value || "",
        room_code: roomCode.value || "",
        watchDuration: toNumber(currentTask.watchedSec),
        watch_duration: toNumber(currentTask.watchedSec),
        watchedSec: toNumber(currentTask.watchedSec),
        watched_sec: toNumber(currentTask.watchedSec),
        thresholdSec: toNumber(currentTask.thresholdSec),
        threshold_sec: toNumber(currentTask.thresholdSec),
        remainingSec: toNumber(currentTask.remainingSec),
        remaining_sec: toNumber(currentTask.remainingSec),
      });
      applyClaimSuccess(result || { activityId }, { fallbackTask: currentTask });
    } catch (err) {
      claimingIds.delete(activityId);
      const currentTask = watchRewardTasks.value.find((task) => task.activityId === activityId);
      if (currentTask?.claimType === 2) {
        autoClaimCooldownUntil.set(activityId, Date.now() + 30000);
      }
      const msg = getClaimErrorMessage(err);
      if (isWatchRewardInvalidError(msg)) {
        requestWatchRewardReload({ action: "close", activityId });
      } else if (isWatchRewardSoldOutError(err, msg)) {
        _soldOutActivityIds.add(activityId);
        removeWatchRewardTask(activityId);
        if (currentTask?.claimType !== 2) {
          uni.showToast({ title: "奖品已经被抢光了", icon: "none" });
        }
        return;
      } else if (isWatchRewardNotReachedError(msg)) {
        const progressPatch = buildClaimFailureProgressPatch(err, msg, currentTask);
        localProgressWatchedSec.set(activityId, progressPatch.watchedSec);
        pendingProgressResetIds.delete(activityId);
        updateTask(activityId, {
          ...progressPatch,
          claimStatus: progressPatch.reached ? 1 : 0,
        });
        requestWatchRewardReload();
      } else {
        updateTask(activityId, { claimStatus: currentTask?.reached ? 1 : 0 });
      }
      uni.showToast({ title: msg, icon: "none" });
    }
  }

  function handleWatchRewardWinNotify(message) {
    const payload = normalizeWatchRewardPayload(message);
    if (!isWatchRewardPayload(payload)) return;
    const customerId = getCustomerId(myUserId, payload);
    if (myUserId.value > 0 && customerId > 0 && customerId !== toNumber(myUserId.value)) return;
    // 本人中奖同步追加评论区 lottery_win 消息（handledMessageIds 防与 broadcast 重复）
    appendLotteryWinMessage(
      appendSystemMessage,
      handledMessageIds,
      payload,
      {},
      { defaultName: getMyNickname() }
    );
    applyClaimSuccess(payload, { showResult: true });
  }

  function handleWatchRewardBroadcast(message) {
    const payload = normalizeWatchRewardPayload(message);
    if (!isWatchRewardPayload(payload)) return;
    // 别人中奖全房间广播：同步追加 lottery_win 消息到评论区
    appendLotteryWinMessage(appendSystemMessage, handledMessageIds, payload, {});
    if (broadcastTimer) clearTimeout(broadcastTimer);
    watchRewardBroadcast.value = {
      nickname: firstValue(payload, "nickname", "nick", "customerName", "customer_name") || "观众",
      text: payload.text || `${firstValue(payload, "nickname", "nick", "customerName", "customer_name") || "观众"} 获得观看奖励：${firstValue(payload, "rewardName", "reward_name", "productName", "product_name", "couponName", "coupon_name") || "奖品"}`,
      rewardName: firstValue(payload, "rewardName", "reward_name", "productName", "product_name", "couponName", "coupon_name") || "观看奖励",
      rewardQuantity: toNumber(firstValue(payload, "rewardQuantity", "reward_quantity", "quantity", "num"), 1) || 1,
      rewardType: toNumber(firstValue(payload, "rewardType", "reward_type"), 2),
      unit: getRewardUnit({
        rewardType: firstValue(payload, "rewardType", "reward_type"),
      }),
    };
    watchRewardBroadcastRenderKey.value += 1;
    broadcastTimer = setTimeout(() => {
      watchRewardBroadcast.value = null;
      broadcastTimer = null;
    }, WATCH_REWARD_BROADCAST_DURATION);
  }

  function advanceLocalProgress() {
    if (!isPlaying.value) return;
    let changed = false;
    watchRewardTasks.value = watchRewardTasks.value.map((task) => {
      if (task.claimStatus === 3 || task.claimStatus === 4 || task.activityStatus !== 1) return task;
      const watchedSec = task.watchedSec + 1;
      const remainingSec = Math.max(task.thresholdSec - watchedSec, 0);
      let claimStatus = task.claimStatus;
      if (remainingSec <= 0 && claimStatus === 0) {
        claimStatus = 1;
      }
      localProgressWatchedSec.set(task.activityId, watchedSec);
      changed = true;
      return {
        ...task,
        watchedSec,
        remainingSec,
        reached: remainingSec <= 0,
        claimStatus,
      };
    });
    if (changed) checkAutoClaims();
  }

  function checkAutoClaims() {
    watchRewardTasks.value.forEach((task) => {
      if (
        task.activityStatus === 1 &&
        task.claimType === 2 &&
        task.claimStatus === 1 &&
        task.reached &&
        Date.now() >= (autoClaimCooldownUntil.get(task.activityId) || 0)
      ) {
        claimWatchRewardTask(task);
      }
    });
  }

  function startTicker() {
    if (tickTimer) return;
    tickTimer = setInterval(advanceLocalProgress, 1000);
  }

  function stopTicker() {
    if (!tickTimer) return;
    clearInterval(tickTimer);
    tickTimer = null;
  }

  watch(isPlaying, (playing) => {
    if (playing) startTicker();
    else stopTicker();
  }, { immediate: true });

  onBeforeUnmount(() => {
    stopTicker();
    if (reloadTimer) clearTimeout(reloadTimer);
    if (broadcastTimer) clearTimeout(broadcastTimer);
  });

  return {
    watchRewardTasks,
    visibleWatchRewardTasks,
    hasVisibleWatchRewardTasks,
    watchRewardEntryLabel,
    showWatchRewardPanel,
    watchRewardPanelOpenKey,
    watchRewardResult,
    watchRewardBroadcast,
    watchRewardBroadcastRenderKey,
    syncFromLiveDetail,
    reloadWatchRewards,
    requestWatchRewardReload,
    openWatchRewardPanel,
    closeWatchRewardPanel,
    closeWatchRewardResult,
    claimWatchRewardTask,
    handleWatchRewardWinNotify,
    handleWatchRewardBroadcast,
  };
}
