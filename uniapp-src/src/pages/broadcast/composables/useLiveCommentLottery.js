import { computed, onBeforeUnmount, ref } from "vue";
import {
  appendLotteryWinMessage,
  getLotteryActivityType,
  getLotteryRecordKey,
  isCommentLotteryPayload as isCommentLotteryMessagePayload,
  unwrapLotteryPayload,
} from "./live-lottery-message.js";

const ACTIVITY_TYPE_COMMENT = 3;
const MODAL_LIST = "commentLotteryList";
const MODAL_ROLLING = "commentLotterySlotRolling";
const MODAL_RESULT = "commentLotterySlotResult";
const MODAL_WIN = "commentLotteryWin";
const MODAL_LOSE = "commentLotteryLose";
const MODAL_PASSWORD_CHANGED = "commentPasswordChanged";
const ROLLING_DURATION = 4000;
const RESULT_AUTO_CLOSE_DELAY = 1600;
const WIN_DELAY = 1000;
const LOSE_DELAY = 2000;
const QUICK_COMMENT_SEND_THROTTLE_MS = 1500;
const DEFAULT_AVATAR = "/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg";
const DEFAULT_TIP_TEXT = "发送指定评论参与抽奖";
const NO_COMMENT_LOTTERY_TEXT = "此直播间无抽奖活动";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
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
  const nestedKeys = ["page", "pager", "pagination", "result", "data", "payload"];
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
  for (const source of sources) {
    for (const key of fallbackKeys) {
      if (Array.isArray(source[key])) return source[key];
    }
  }
  return [];
}

function unwrapResponseObject(data = {}) {
  if (!isPlainObject(data)) return {};
  const sources = getPayloadSources(data);
  return sources.reduce((acc, item) => ({ ...acc, ...item }), {});
}

function buildRoomContext(deps = {}) {
  const roomId = toNumber(deps.liveId?.value ?? deps.liveId);
  const termId = toNumber(typeof deps.getEffectiveTermId === "function" ? deps.getEffectiveTermId() : 0);
  const customerId = toNumber(deps.myUserId?.value ?? deps.myUserId);
  const roomCode = String(deps.roomCode?.value ?? deps.roomCode ?? "").trim();
  const tenantId = toNumber(deps.liveTenantId?.value ?? deps.liveTenantId);
  const shareCode = String(deps.shareCode?.value ?? deps.shareCode ?? "").trim();
  const bindId = deps.liveBindId?.value ?? deps.liveBindId ?? "";
  const liveType = String(deps.liveType?.value ?? deps.liveType ?? (deps.isReplay?.value ? "replay" : "live")).trim();
  return {
    roomId,
    room_id: roomId,
    liveId: roomId,
    live_id: roomId,
    termId,
    term_id: termId,
    liveTermId: termId,
    live_term_id: termId,
    customerId,
    customer_id: customerId,
    userId: customerId,
    user_id: customerId,
    roomCode,
    room_code: roomCode,
    tenantId,
    tenant_id: tenantId,
    shareCode,
    share_code: shareCode,
    bindId,
    bind_id: bindId,
    liveType,
    live_type: liveType,
  };
}

function normalizeLevel(level) {
  const text = String(level ?? "").trim();
  return text || "1";
}

function isCommentLotteryPayload(payload = {}) {
  return getLotteryActivityType(payload) === ACTIVITY_TYPE_COMMENT ||
    Boolean(firstValue(payload, "prizeId", "prize_id") && firstValue(payload, "activityId", "activity_id"));
}

function getDrawKey(payload = {}) {
  const drawId = String(firstValue(payload, "drawId", "draw_id", "lotteryId", "lottery_id") || "");
  if (drawId) return drawId;
  return `${firstValue(payload, "activityId", "activity_id") || ""}:${firstValue(payload, "prizeId", "prize_id") || ""}:${firstValue(payload, "drawTime", "draw_time", "serverTime", "server_time") || ""}`;
}

function getRecordKey(payload = {}) {
  return getLotteryRecordKey(payload);
}

function getStartedKey(payload = {}, data = {}) {
  const activityPayload = firstValue(payload, "activity", "activity_info") || {};
  const activePrizePayload = firstValue(payload, "activePrize", "active_prize") || {};
  const prizePayload = firstValue(payload, "prize", "prize_info") || {};
  const activityId = firstValue(activityPayload, "activityId", "activity_id", "id") ||
    firstValue(payload, "activityId", "activity_id") ||
    firstValue(data, "activityId", "activity_id") ||
    "";
  const prizeId = firstValue(activePrizePayload, "prizeId", "prize_id", "id") ||
    firstValue(prizePayload, "prizeId", "prize_id", "id") ||
    firstValue(payload, "prizeId", "prize_id") ||
    firstValue(data, "prizeId", "prize_id") ||
    "";
  if (!activityId || !prizeId) return "";
  return `${activityId}:${prizeId}`;
}

function getPrizeStateKey(activityId, prizeId) {
  if (!activityId || !prizeId) return "";
  return `${activityId}:${prizeId}`;
}

function getVisibleTipText(activity = {}, prize = {}) {
  const passwordText = getVisiblePasswordText(activity, prize);
  if (passwordText) return passwordText;
  return DEFAULT_TIP_TEXT;
}

function getVisiblePasswordText(activity = {}, prize = {}) {
  const displayMode = toNumber(firstValue(prize, "passwordDisplayMode", "password_display_mode") ?? firstValue(activity, "passwordDisplayMode", "password_display_mode"));
  const displayText = String(firstValue(prize, "displayPasswordText", "display_password_text") || firstValue(activity, "displayPasswordText", "display_password_text") || "").trim();
  return displayMode === 1 ? displayText : "";
}

function normalizePrize(prize = {}, activity = {}) {
  const name = firstValue(prize, "prizeName", "prize_name", "name", "rewardName", "reward_name", "productName", "product_name") || "评论抽奖奖品";
  const image = firstValue(prize, "productImage", "product_image", "rewardImage", "reward_image", "image") || "";
  return {
    ...prize,
    prizeId: toNumber(firstValue(prize, "prizeId", "prize_id", "id")),
    activityId: toNumber(firstValue(prize, "activityId", "activity_id") || firstValue(activity, "activityId", "activity_id")),
    prizeName: name,
    productName: firstValue(prize, "productName", "product_name") || name,
    productImage: image,
    prizeLevel: toNumber(firstValue(prize, "prizeLevel", "prize_level"), 1),
    prizeLevelText: normalizeLevel(firstValue(prize, "prizeLevelText", "prize_level_text", "levelText", "level_text", "prizeLevel", "prize_level")),
    levelText: normalizeLevel(firstValue(prize, "prizeLevelText", "prize_level_text", "levelText", "level_text", "prizeLevel", "prize_level")),
    winCount: Math.max(toNumber(firstValue(prize, "winCount", "win_count", "winnerCount", "winner_count", "rewardQuantity", "reward_quantity", "quantity", "num"), 1), 1),
    status: toNumber(firstValue(prize, "status", "drawStatus", "draw_status")),
    participantCount: toNumber(firstValue(prize, "participantCount", "participant_count")),
    winnerCount: toNumber(firstValue(prize, "winnerCount", "winner_count")),
    tipText: getVisibleTipText(activity, prize),
  };
}

function normalizeActivity(activity = {}) {
  const currentUser = firstValue(activity, "currentUser", "current_user") || { result: "none" };
  const normalized = {
    ...activity,
    activityId: toNumber(firstValue(activity, "activityId", "activity_id", "id")),
    activityName: firstValue(activity, "activityName", "activity_name", "name") || "评论抽奖",
    status: toNumber(firstValue(activity, "status", "activityStatus", "activity_status")),
    participantCount: toNumber(firstValue(activity, "participantCount", "participant_count")),
    activePrizeId: toNumber(firstValue(activity, "activePrizeId", "active_prize_id", "prizeId", "prize_id")),
    showEntry: toNumber(firstValue(activity, "showEntry", "show_entry")),
    prizeQuantityDisplay: toNumber(firstValue(activity, "prizeQuantityDisplay", "prize_quantity_display") ?? 1, 1),
    passwordDisplayMode: toNumber(firstValue(activity, "passwordDisplayMode", "password_display_mode")),
    requireShipping: toNumber(firstValue(activity, "requireShipping", "require_shipping")),
    requireSms: toNumber(firstValue(activity, "requireSms", "require_sms")),
    autoPopup: toNumber(firstValue(activity, "autoPopup", "auto_popup")),
    currentUser,
  };
  normalized.prizes = pickNestedList(activity, "prizes", "prizeList", "prize_list", "awards", "awardList", "award_list").map((prize) => normalizePrize(prize, normalized));
  return normalized;
}

function normalizeDisplayUser(item = {}, index = 0) {
  const nickname = firstValue(item, "nickname", "nickName", "nick_name", "nick", "customerName", "customer_name", "name") || `用户${index + 1}`;
  return {
    key: String(firstValue(item, "recordId", "record_id", "winnerRecordId", "winner_record_id", "customerId", "customer_id", "userId", "user_id") || `${nickname}-${index}`),
    name: nickname,
    phone: firstValue(item, "phone", "mobile", "maskedPhone", "masked_phone") || "已中奖",
    photo: firstValue(item, "avatar", "photo", "image", "headImage", "head_image") || DEFAULT_AVATAR,
    recordId: toNumber(firstValue(item, "recordId", "record_id", "winnerRecordId", "winner_record_id")),
    customerId: toNumber(firstValue(item, "customerId", "customer_id", "userId", "user_id")),
    raw: item,
  };
}

function buildFallbackUsers() {
  return [
    { key: "comment-lottery-default-1", name: "直播间观众", phone: "", photo: DEFAULT_AVATAR },
    { key: "comment-lottery-default-2", name: "互动用户", phone: "", photo: DEFAULT_AVATAR },
    { key: "comment-lottery-default-3", name: "幸运用户", phone: "", photo: DEFAULT_AVATAR },
  ];
}

function normalizeWinRecord(record = {}, fallbackPrize = {}) {
  const rewardName = firstValue(record, "rewardName", "reward_name", "prizeName", "prize_name") ||
    firstValue(fallbackPrize, "prizeName", "prize_name", "productName", "product_name") ||
    "评论抽奖奖品";
  return {
    ...record,
    winnerRecordId: toNumber(firstValue(record, "winnerRecordId", "winner_record_id", "recordId", "record_id", "id")),
    recordId: toNumber(firstValue(record, "recordId", "record_id", "winnerRecordId", "winner_record_id", "id")),
    activityId: toNumber(firstValue(record, "activityId", "activity_id") || firstValue(fallbackPrize, "activityId", "activity_id")),
    prizeId: toNumber(firstValue(record, "prizeId", "prize_id") || firstValue(fallbackPrize, "prizeId", "prize_id")),
    rewardName,
    rewardImage: firstValue(record, "rewardImage", "reward_image", "productImage", "product_image", "image") || firstValue(fallbackPrize, "productImage", "product_image") || "",
    prizeLevel: toNumber(firstValue(record, "prizeLevel", "prize_level") || firstValue(fallbackPrize, "prizeLevel", "prize_level"), 1),
    prizeLevelText: normalizeLevel(firstValue(record, "prizeLevelText", "prize_level_text", "levelText", "level_text", "prizeLevel", "prize_level") || firstValue(fallbackPrize, "prizeLevelText", "prize_level_text", "levelText", "level_text", "prizeLevel", "prize_level")),
    levelText: normalizeLevel(firstValue(record, "prizeLevelText", "prize_level_text", "levelText", "level_text", "prizeLevel", "prize_level") || firstValue(fallbackPrize, "prizeLevelText", "prize_level_text", "levelText", "level_text", "prizeLevel", "prize_level")),
    quantity: Math.max(toNumber(firstValue(record, "quantity", "num"), 1), 1),
    createdAt: firstValue(record, "createdAt", "created_at", "winTime", "win_time") || "",
  };
}

function hasCommentLotteryPrize(activity) {
  return Boolean(activity?.activityId && normalizeList(activity.prizes).some((item) => item.prizeId));
}

function shouldShowEntry(activity) {
  return isActiveActivity(activity) && activity.showEntry === 1 && Boolean(activity.prizes.some((item) => item.status === 1));
}

function isActiveActivity(activity) {
  return activity && activity.status === 1 && hasCommentLotteryPrize(activity);
}

function hasMetParticipationCondition(activity = {}) {
  const currentUser = firstValue(activity, "currentUser", "current_user") || {};
  return currentUser.result === "joined" || currentUser.result === "win" || currentUser.participated === true;
}

function shouldAutoOpenPanel(activity) {
  return isActiveActivity(activity) && activity.autoPopup === 1 && !hasMetParticipationCondition(activity);
}

function createCommentLotteryState() {
  const activities = ref([]);
  const activeActivityId = ref(0);
  const activePrizeId = ref(0);
  const activeModal = ref("");
  const participants = ref([]);
  const winners = ref([]);
  const currentPrize = ref({});
  const currentWinRecord = ref(null);
  const passwordChangedText = ref("");
  const hasEntry = ref(false);
  const bubbleVisible = ref(true);
  const tipText = ref(DEFAULT_TIP_TEXT);
  const loading = ref(false);
  const handledDrawIds = new Set();
  const handledRecordIds = new Set();
  const handledMessageIds = new Set();
  const handledStartKeys = new Set();
  const openedPrizeKeys = new Set();
  const autoPopupKeys = new Set();
  const timers = [];
  const state = {
    activities,
    activeActivityId,
    activePrizeId,
    activeModal,
    participants,
    winners,
    currentPrize,
    currentWinRecord,
    passwordChangedText,
    hasEntry,
    bubbleVisible,
    tipText,
    loading,
    handledDrawIds,
    handledRecordIds,
    handledMessageIds,
    handledStartKeys,
    openedPrizeKeys,
    autoPopupKeys,
    lastQuickCommentSendAt: 0,
    timers,
  };
  bindComputedState(state);
  return state;
}

function bindComputedState(state) {
  state.activeActivity = computed(() => {
    const id = toNumber(state.activeActivityId.value);
    return state.activities.value.find((item) => item.activityId === id) ||
      state.activities.value.find(isActiveActivity) ||
      state.activities.value.find(shouldShowEntry) ||
      null;
  });
  state.activePrize = computed(() => {
    const activity = state.activeActivity.value;
    if (!activity) return null;
    const id = toNumber(state.activePrizeId.value || activity.activePrizeId);
    return activity.prizes.find((item) => item.prizeId === id) ||
      activity.prizes.find((item) => item.status === 1) ||
      activity.prizes[0] ||
      null;
  });
  state.displayParticipants = computed(() => (
    state.participants.value.length > 0 ? state.participants.value : buildFallbackUsers()
  ));
  state.entryVisible = computed(() => state.hasEntry.value);
  state.entryKeyword = computed(() => state.tipText.value || state.activePrize.value?.tipText || DEFAULT_TIP_TEXT);
  state.panelActivity = computed(() => state.activeActivity.value || {});
  state.panelPrizes = computed(() => state.activeActivity.value?.prizes || []);
}

function getActiveVisiblePasswordText(state) {
  return getVisiblePasswordText(state.activeActivity.value || {}, state.activePrize.value || {});
}

function canShowPasswordChangedModal(state) {
  return ![MODAL_ROLLING, MODAL_RESULT, MODAL_WIN, MODAL_LOSE].includes(state.activeModal.value);
}

function clearTimers(state) {
  while (state.timers.length) {
    clearTimeout(state.timers.pop());
  }
}

function setTimer(state, fn, delay) {
  const timer = setTimeout(fn, delay);
  state.timers.push(timer);
}

function updateEntryState(state) {
  const visible = state.activities.value.some(shouldShowEntry);
  state.hasEntry.value = visible;
  if (!visible) return;
  state.tipText.value = state.activePrize.value?.tipText ||
    state.activeActivity.value?.displayPasswordText ||
    DEFAULT_TIP_TEXT;
}

function applyOpenedPrizeState(state, activity) {
  const prizes = activity.prizes.map((item) => (
    state.openedPrizeKeys.has(getPrizeStateKey(activity.activityId, item.prizeId)) ? { ...item, status: 2 } : item
  ));
  const runningPrize = prizes.find((item) => item.status === 1);
  return {
    ...activity,
    status: runningPrize ? 1 : activity.status,
    activePrizeId: runningPrize?.prizeId || 0,
    prizes,
  };
}

function syncActivePrizeState(state) {
  const activity = state.activeActivity.value;
  if (!activity) return;
  const firstRunningPrize = activity.prizes.find((item) => item.status === 1);
  if (firstRunningPrize) {
    state.activePrizeId.value = firstRunningPrize.prizeId;
  }
}

function markPrizeOpened(state, payload = {}, data = {}) {
  const activityId = toNumber(firstValue(payload, "activityId", "activity_id") || firstValue(data, "activityId", "activity_id"));
  const prizeId = toNumber(firstValue(payload, "prizeId", "prize_id") || firstValue(data, "prizeId", "prize_id"));
  if (!activityId) return;
  const prizeKey = getPrizeStateKey(activityId, prizeId);
  if (prizeKey) state.openedPrizeKeys.add(prizeKey);
  const index = state.activities.value.findIndex((item) => item.activityId === activityId);
  if (index < 0) return;
  const activity = state.activities.value[index];
  const prizes = activity.prizes.map((item) => (
    !prizeId || item.prizeId === prizeId ? { ...item, status: 2 } : item
  ));
  const hasRunningPrize = prizes.some((item) => item.status === 1);
  const runningPrize = prizes.find((item) => item.status === 1);
  state.activities.value.splice(index, 1, {
    ...activity,
    status: hasRunningPrize ? 1 : 2,
    activePrizeId: runningPrize?.prizeId || 0,
    prizes,
  });
  if (!hasRunningPrize) state.activePrizeId.value = 0;
  updateEntryState(state);
}

function applyListResponse(state, actions, data = {}, { allowAutoPopup = false } = {}) {
  const response = unwrapResponseObject(data);
  state.activities.value = pickNestedList(response, "activities", "activityList", "activity_list", "list").map((activity) => applyOpenedPrizeState(state, normalizeActivity(activity)));
  state.activeActivityId.value = toNumber(firstValue(response, "activeActivityId", "active_activity_id", "activityId", "activity_id")) || state.activeActivity.value?.activityId || 0;
  state.activePrizeId.value = toNumber(firstValue(response, "activePrizeId", "active_prize_id", "prizeId", "prize_id")) || state.activeActivity.value?.activePrizeId || 0;
  syncActivePrizeState(state);
  updateEntryState(state);

  const activity = state.activeActivity.value;
  const prize = state.activePrize.value;
  if (activity && prize) {
    state.currentPrize.value = prize;
    state.tipText.value = prize.tipText || state.tipText.value;
  }
  const currentUser = activity?.currentUser || {};
  const ownRecord = firstValue(currentUser, "ownWinRecord", "own_win_record");
  if (currentUser.result === "win" && ownRecord) {
    state.currentWinRecord.value = normalizeWinRecord(ownRecord, prize || {});
  }
  if (!allowAutoPopup || !activity || !shouldAutoOpenPanel(activity)) return;
  const key = `${activity.activityId}:${activity.activePrizeId || prize?.prizeId || 0}`;
  if (!state.autoPopupKeys.has(key)) {
    state.autoPopupKeys.add(key);
    actions.openPanel();
  }
}

function createListActions(state, deps) {
  async function loadCommentLotteryList(options = {}) {
    const context = {
      ...buildRoomContext(deps),
      activityType: ACTIVITY_TYPE_COMMENT,
      activity_type: ACTIVITY_TYPE_COMMENT,
      winType: ACTIVITY_TYPE_COMMENT,
      win_type: ACTIVITY_TYPE_COMMENT,
    };
    const roomId = context.roomId;
    if (!roomId || typeof deps.getCommentLotteryListApi !== "function") return;
    try {
      state.loading.value = true;
      const data = await deps.getCommentLotteryListApi(context);
      applyListResponse(state, actions, data, options);
    } catch (err) {
      console.warn("[Live][CommentLottery] load list fail:", err);
      if (options.showError) uni.showToast({ title: "评论抽奖加载失败，请稍后重试", icon: "none" });
    } finally {
      state.loading.value = false;
    }
  }

  async function refreshActivity(activityId) {
    const id = toNumber(activityId);
    if (!id || typeof deps.getCommentLotteryDetailApi !== "function") return loadCommentLotteryList();
    try {
      const detail = await deps.getCommentLotteryDetailApi({
        ...buildRoomContext(deps),
        activityId: id,
        activity_id: id,
        activityType: ACTIVITY_TYPE_COMMENT,
        activity_type: ACTIVITY_TYPE_COMMENT,
        winType: ACTIVITY_TYPE_COMMENT,
        win_type: ACTIVITY_TYPE_COMMENT,
      });
      const next = normalizeActivity(unwrapResponseObject(detail));
      const index = state.activities.value.findIndex((item) => item.activityId === next.activityId);
      if (index >= 0) state.activities.value.splice(index, 1, next);
      else state.activities.value.push(next);
      state.activeActivityId.value = next.activityId || state.activeActivityId.value;
      state.activePrizeId.value = next.activePrizeId || state.activePrizeId.value;
      updateEntryState(state);
    } catch (err) {
      console.warn("[Live][CommentLottery] refresh activity fail:", err);
    }
  }

  async function reloadFromConfigUpdate(message = {}) {
    const beforeText = getActiveVisiblePasswordText(state);
    await loadCommentLotteryList();
    const afterText = getActiveVisiblePasswordText(state);
    const activity = state.activeActivity.value;
    const prize = state.activePrize.value;
    if (!activity || !prize || !isActiveActivity(activity) || prize.status !== 1) return true;
    if (!afterText || afterText === beforeText || !canShowPasswordChangedModal(state)) return true;
    state.passwordChangedText.value = afterText;
    state.activeModal.value = MODAL_PASSWORD_CHANGED;
    return true;
  }

  const actions = {
    loadCommentLotteryList,
    refreshActivity,
    reloadFromConfigUpdate,
    openPanel() {
      if (!state.entryVisible.value || !isActiveActivity(state.activeActivity.value)) {
        state.activeModal.value = "";
        uni.showToast({ title: NO_COMMENT_LOTTERY_TEXT, icon: "none" });
        return false;
      }
      state.activeModal.value = MODAL_LIST;
      return true;
    },
    closeModal() {
      clearTimers(state);
      if ((state.activeModal.value === MODAL_WIN || state.activeModal.value === MODAL_LOSE) && state.winners.value.length > 0) {
        state.activeModal.value = MODAL_RESULT;
        return;
      }
      state.activeModal.value = "";
    },
    syncFromLiveDetail(options = {}) {
      loadCommentLotteryList({ allowAutoPopup: options.allowAutoPopup !== false });
    },
  };
  return actions;
}

function upsertStartedActivity(state, payload, data) {
  const activityPayload = firstValue(payload, "activity", "activity_info") || {};
  const activePrizePayload = firstValue(payload, "activePrize", "active_prize") || {};
  const prizePayload = firstValue(payload, "prize", "prize_info") || {};
  const tipPayload = firstValue(payload, "tip", "tip_info") || {};
  const activityId = firstValue(activityPayload, "activityId", "activity_id", "id") ||
    firstValue(data, "activityId", "activity_id") ||
    firstValue(payload, "activityId", "activity_id");
  const existingActivity = state.activities.value.find((item) => item.activityId === toNumber(activityId));
  const activity = normalizeActivity({
    ...activityPayload,
    activityId,
    activePrizeId: firstValue(activityPayload, "activePrizeId", "active_prize_id") || firstValue(data, "prizeId", "prize_id") || firstValue(payload, "prizeId", "prize_id"),
    showEntry: firstValue(activityPayload, "showEntry", "show_entry") ?? 1,
    status: firstValue(activityPayload, "status", "activityStatus", "activity_status") ?? 1,
    autoPopup: firstValue(activityPayload, "autoPopup", "auto_popup") ?? firstValue(payload, "autoPopup", "auto_popup") ?? existingActivity?.autoPopup,
    prizeQuantityDisplay: firstValue(activityPayload, "prizeQuantityDisplay", "prize_quantity_display") ?? firstValue(payload, "prizeQuantityDisplay", "prize_quantity_display"),
    passwordDisplayMode: firstValue(activePrizePayload, "passwordDisplayMode", "password_display_mode"),
    displayPasswordText: firstValue(activePrizePayload, "displayPasswordText", "display_password_text") || firstValue(tipPayload, "displayPasswordText", "display_password_text"),
    prizes: [activePrizePayload, prizePayload].filter((item) => Object.keys(item).length > 0),
    currentUser: existingActivity?.currentUser || state.activeActivity.value?.currentUser || { result: "none" },
  });
  const prize = activity.prizes[0] || normalizePrize({
    ...prizePayload,
    prizeId: firstValue(prizePayload, "prizeId", "prize_id", "id") || firstValue(data, "prizeId", "prize_id") || firstValue(payload, "prizeId", "prize_id"),
    activityId: firstValue(prizePayload, "activityId", "activity_id") || firstValue(data, "activityId", "activity_id") || firstValue(payload, "activityId", "activity_id"),
  }, activity);
  if (prize.prizeId && !activity.prizes.length) activity.prizes = [prize];
  const existingIndex = state.activities.value.findIndex((item) => item.activityId === activity.activityId);
  if (existingIndex >= 0) {
    const existing = state.activities.value[existingIndex];
    const prizeMap = new Map(existing.prizes.map((item) => [item.prizeId, item]));
    activity.prizes.forEach((item) => prizeMap.set(item.prizeId, item));
    state.activities.value.splice(existingIndex, 1, { ...existing, ...activity, prizes: Array.from(prizeMap.values()) });
  } else if (activity.activityId) {
    state.activities.value.push(activity);
  }
  return { activity, prize };
}

function createWsActions(state, deps, listActions) {
  function handleStarted(message = {}) {
    const { data, payload } = unwrapLotteryPayload(message);
    const startedKey = getStartedKey(payload, data);
    if (startedKey && state.handledStartKeys.has(startedKey)) return true;
    const { activity, prize } = upsertStartedActivity(state, payload, data);
    if (!activity.activityId || !prize.prizeId) {
      updateEntryState(state);
      listActions.loadCommentLotteryList();
      return false;
    }
    if (startedKey) state.handledStartKeys.add(startedKey);
    state.activeActivityId.value = activity.activityId || state.activeActivityId.value;
    state.activePrizeId.value = prize.prizeId || activity.activePrizeId || state.activePrizeId.value;
    state.currentPrize.value = prize;
    const tipPayload = firstValue(payload, "tip", "tip_info") || {};
    state.tipText.value = firstValue(tipPayload, "displayPasswordText", "display_password_text", "actionText", "action_text") || prize.tipText || DEFAULT_TIP_TEXT;
    state.hasEntry.value = true;
    // 新一轮活动开启：恢复白色提示气泡显示
    state.bubbleVisible.value = true;
    deps.appendSystemMessage?.(`${activity.activityName || "评论抽奖"}已开始，${state.tipText.value}`);
    listActions.loadCommentLotteryList({ allowAutoPopup: true });
    return true;
  }

  function handleOpened(message = {}) {
    const { data, payload } = unwrapLotteryPayload(message);
    if (!isCommentLotteryMessagePayload(message) && !isCommentLotteryPayload(payload)) return false;
    const drawKey = getDrawKey(payload);
    if (!drawKey || state.handledDrawIds.has(drawKey)) return true;
    state.handledDrawIds.add(drawKey);
    startOpenedFlow(state, deps, listActions, payload, data);
    return true;
  }

  function handleConfigUpdated(message = {}) {
    listActions.reloadFromConfigUpdate(message);
    return true;
  }

  return { handleStarted, handleOpened, handleConfigUpdated };
}

function startOpenedFlow(state, deps, listActions, payload, data) {
  clearTimers(state);
  state.activeActivityId.value = toNumber(firstValue(payload, "activityId", "activity_id") || firstValue(data, "activityId", "activity_id")) || state.activeActivityId.value;
  state.activePrizeId.value = toNumber(firstValue(payload, "prizeId", "prize_id") || firstValue(data, "prizeId", "prize_id")) || state.activePrizeId.value;
  markPrizeOpened(state, payload, data);
  state.currentPrize.value = normalizePrize({
    prizeId: firstValue(payload, "prizeId", "prize_id") || firstValue(data, "prizeId", "prize_id"),
    activityId: firstValue(payload, "activityId", "activity_id") || firstValue(data, "activityId", "activity_id"),
    prizeName: firstValue(payload, "prizeName", "prize_name", "rewardName", "reward_name"),
    productName: firstValue(payload, "productName", "product_name", "rewardName", "reward_name", "prizeName", "prize_name"),
    productImage: firstValue(payload, "productImage", "product_image", "rewardImage", "reward_image"),
    prizeLevel: firstValue(payload, "prizeLevel", "prize_level"),
    prizeLevelText: firstValue(payload, "prizeLevelText", "prize_level_text", "levelText", "level_text"),
    winCount: firstValue(payload, "winCount", "win_count", "winnerCount", "winner_count", "rewardQuantity", "reward_quantity"),
    status: 2,
  }, { activityId: firstValue(payload, "activityId", "activity_id") || firstValue(data, "activityId", "activity_id") });
  state.winners.value = pickNestedList(payload, "winners", "winnerList", "winner_list", "records", "recordList", "record_list", "results", "resultList", "result_list").map(normalizeDisplayUser);
  state.winners.value.forEach((winner) => {
    appendLotteryWinMessage(deps.appendSystemMessage, state.handledMessageIds, winner.raw || winner, state.currentPrize.value);
  });
  deps.appendSystemMessage?.(`本轮${firstValue(payload, "activityName", "activity_name", "name") || "评论抽奖"}开奖结果已揭晓`);
  loadParticipants(state, deps, payload);
  state.activeModal.value = MODAL_ROLLING;
  setTimer(state, () => {
    state.activeModal.value = MODAL_RESULT;
    refreshAfterDraw(state, listActions, payload);
  }, ROLLING_DURATION);
}

function autoCloseResultModal(state) {
  if (state.activeModal.value === MODAL_RESULT) {
    state.activeModal.value = "";
  }
}

async function loadParticipants(state, deps, payload) {
  state.participants.value = pickNestedList(payload, "participants", "participantList", "participant_list", "users", "userList", "user_list").map(normalizeDisplayUser);
  if (state.participants.value.length > 0 || typeof deps.getLotteryParticipantsApi !== "function") return;
  try {
    const res = await deps.getLotteryParticipantsApi({
      ...buildRoomContext(deps),
      activityId: firstValue(payload, "activityId", "activity_id"),
      activity_id: firstValue(payload, "activityId", "activity_id"),
      drawId: firstValue(payload, "drawId", "draw_id", "lotteryId", "lottery_id"),
      draw_id: firstValue(payload, "drawId", "draw_id", "lotteryId", "lottery_id"),
      participantsUrl: firstValue(payload, "participantsUrl", "participants_url"),
      participants_url: firstValue(payload, "participantsUrl", "participants_url"),
      activityType: ACTIVITY_TYPE_COMMENT,
      activity_type: ACTIVITY_TYPE_COMMENT,
      winType: ACTIVITY_TYPE_COMMENT,
      win_type: ACTIVITY_TYPE_COMMENT,
    });
    state.participants.value = pickNestedList(res || {}, "participants", "participantList", "participant_list", "users", "userList", "user_list").map(normalizeDisplayUser);
  } catch (err) {
    console.warn("[Live][CommentLottery] load participants fail:", err);
  }
}

async function refreshAfterDraw(state, listActions, payload = {}) {
  setTimer(state, () => autoCloseResultModal(state), RESULT_AUTO_CLOSE_DELAY);
  await listActions.loadCommentLotteryList();
  const currentUser = state.activeActivity.value?.currentUser || {};
  const result = firstValue(currentUser, "result", "status") || "";
  const ownRecord = firstValue(currentUser, "ownWinRecord", "own_win_record");
  if (result === "win" && ownRecord) {
    state.currentWinRecord.value = normalizeWinRecord(ownRecord, state.currentPrize.value);
  }
  if (state.currentWinRecord.value && toNumber(firstValue(state.currentWinRecord.value, "activityId", "activity_id")) === toNumber(firstValue(payload, "activityId", "activity_id"))) {
    setTimer(state, () => { state.activeModal.value = MODAL_WIN; }, WIN_DELAY);
    return;
  }
  // 修复: 增加更多的未中奖状态判断,确保参与过的用户都能看到未中奖弹窗
  if (result === "lose" || result === "not_participated" || result === "none" || result === "") {
    // 只有明确参与了抽奖的用户才显示未中奖弹窗
    const participated = firstValue(currentUser, "participated", "isParticipated", "is_participated") === true || 
                        result === "lose" || 
                        result === "not_participated";
    if (participated) {
      setTimer(state, () => { state.activeModal.value = MODAL_LOSE; }, LOSE_DELAY);
    }
  }
}

function createWinnerActions(state, deps, listActions) {
  function handleWinNotify(message = {}) {
    const { payload } = unwrapLotteryPayload(message);
    if (!isCommentLotteryMessagePayload(message) && !isCommentLotteryPayload(payload)) return false;
    const key = getRecordKey(payload);
    const isDuplicate = state.handledRecordIds.has(key);
    if (key) state.handledRecordIds.add(key);
    state.currentWinRecord.value = normalizeWinRecord(payload, state.currentPrize.value);
    appendLotteryWinMessage(deps.appendSystemMessage, state.handledMessageIds, payload, state.currentPrize.value);
    state.activeActivityId.value = state.currentWinRecord.value.activityId || state.activeActivityId.value;
    state.activePrizeId.value = state.currentWinRecord.value.prizeId || state.activePrizeId.value;
    if (isDuplicate) return true;
    if (state.activeModal.value === MODAL_ROLLING) {
      listActions.loadCommentLotteryList();
      return true;
    }
    setTimer(state, () => { state.activeModal.value = MODAL_WIN; }, WIN_DELAY);
    listActions.loadCommentLotteryList();
    return true;
  }

  function handleWinRecordUpdate(message = {}) {
    const { payload } = unwrapLotteryPayload(message);
    if (!isCommentLotteryMessagePayload(message) && !isCommentLotteryPayload(payload)) return false;
    const payloadActivityId = toNumber(firstValue(payload, "activityId", "activity_id"));
    if (payloadActivityId && payloadActivityId !== toNumber(state.activeActivityId.value)) return true;
    const seen = new Set(state.winners.value.map((item) => String(item.recordId || item.key)));
    pickNestedList(payload, "records", "recordList", "record_list", "newRecords", "new_records", "winners", "winnerList", "winner_list", "results", "resultList", "result_list").forEach((item, index) => {
      const winner = normalizeDisplayUser(item, index);
      const key = String(winner.recordId || winner.key);
      if (!seen.has(key)) {
        state.winners.value.push(winner);
        seen.add(key);
      }
      appendLotteryWinMessage(deps.appendSystemMessage, state.handledMessageIds, item, state.currentPrize.value);
    });
    listActions.loadCommentLotteryList();
    return true;
  }

  return { handleWinNotify, handleWinRecordUpdate };
}

function createCommentActions(state, deps, listActions) {
  async function handleCommentSent(comment) {
    const text = String(comment || "").trim();
    const activity = state.activeActivity.value;
    const prize = state.activePrize.value;
    if (!text || !activity || !isActiveActivity(activity) || typeof deps.claimCommentRewardApi !== "function") return;
    // 用户已发送评论参与抽奖，自动隐藏白色提示气泡（按钮入口保留）
    state.bubbleVisible.value = false;
    try {
      await deps.claimCommentRewardApi({
        ...buildRoomContext(deps),
        activityId: activity.activityId,
        activity_id: activity.activityId,
        prizeId: prize?.prizeId,
        prize_id: prize?.prizeId,
        activityType: ACTIVITY_TYPE_COMMENT,
        activity_type: ACTIVITY_TYPE_COMMENT,
        winType: ACTIVITY_TYPE_COMMENT,
        win_type: ACTIVITY_TYPE_COMMENT,
        comment: text,
        content: text,
      });
      uni.showToast({ title: "已参与抽奖", icon: "none" });
      await listActions.refreshActivity(activity.activityId);
    } catch (err) {
      const message = err?.message || err?.response?.msg || "";
      if (message.includes("未开始") || message.includes("已结束") || message.includes("不存在")) {
        listActions.loadCommentLotteryList();
      }
    }
  }

  async function sendCommentLotteryText(comment) {
    const activity = state.activeActivity.value;
    const firstRunningPrize = activity?.prizes.find((p) => p.status === 1) || null;
    if (firstRunningPrize) {
      state.activePrizeId.value = firstRunningPrize.prizeId;
    }
    const text = String(comment || firstRunningPrize?.tipText || state.activePrize.value?.tipText || state.tipText.value || "").trim();
    if (!text || text === DEFAULT_TIP_TEXT) {
      uni.showToast({ title: "请在评论区发送主播提示的内容参与", icon: "none" });
      return;
    }
    const now = Date.now();
    if (now - state.lastQuickCommentSendAt < QUICK_COMMENT_SEND_THROTTLE_MS) return false;
    state.lastQuickCommentSendAt = now;
    if (typeof deps.sendMessage !== "function") {
      uni.showToast({ title: "评论发送不可用，请在评论区手动发送", icon: "none" });
      return false;
    }
    const sent = await deps.sendMessage(text);
    if (sent === false) return false;
    await handleCommentSent(text);
    state.activeModal.value = "";
    return true;
  }

  return { handleCommentSent, sendCommentLotteryText };
}

function buildReturnApi(state, actions) {
  return {
    commentLotteryActiveModal: state.activeModal,
    commentLotteryActivities: state.activities,
    commentLotteryEntryVisible: state.entryVisible,
    commentLotteryEntryKeyword: state.entryKeyword,
    commentLotteryBubbleVisible: state.bubbleVisible,
    commentLotteryTipText: state.tipText,
    commentLotteryPasswordChangedText: state.passwordChangedText,
    commentLotteryPanelActivity: state.panelActivity,
    commentLotteryPanelPrizes: state.panelPrizes,
    commentLotteryPrize: state.currentPrize,
    commentLotteryWinners: state.winners,
    commentLotteryParticipants: state.displayParticipants,
    commentLotteryWinRecord: state.currentWinRecord,
    loadCommentLotteryList: actions.loadCommentLotteryList,
    syncCommentLotteryFromLiveDetail: actions.syncFromLiveDetail,
    openCommentLotteryPanel: actions.openPanel,
    closeCommentLotteryModal: actions.closeModal,
    sendCommentLotteryText: actions.sendCommentLotteryText,
    handleCommentLotteryStarted: actions.handleStarted,
    handleCommentLotteryOpened: actions.handleOpened,
    handleCommentLotteryConfigUpdated: actions.handleConfigUpdated,
    handleCommentLotteryWinNotify: actions.handleWinNotify,
    handleCommentLotteryWinRecordUpdate: actions.handleWinRecordUpdate,
    handleCommentLotteryCommentSent: actions.handleCommentSent,
  };
}

export function useLiveCommentLottery(deps) {
  const state = createCommentLotteryState();
  const listActions = createListActions(state, deps);
  const wsActions = createWsActions(state, deps, listActions);
  const winnerActions = createWinnerActions(state, deps, listActions);
  const commentActions = createCommentActions(state, deps, listActions);
  const actions = {
    ...listActions,
    ...wsActions,
    ...winnerActions,
    ...commentActions,
  };
  onBeforeUnmount(() => clearTimers(state));
  return buildReturnApi(state, actions);
}
