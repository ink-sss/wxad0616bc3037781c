import { computed, onBeforeUnmount, ref } from "vue";
import {
  appendLotteryWinMessage,
  getLotteryActivityType,
  getLotteryRecordKey,
  getLotteryRewardName,
  getLotteryWinnerName,
  unwrapLotteryPayload,
} from "./live-lottery-message.js";

const ACTIVITY_TYPE_NORMAL = 2;
const ACTIVITY_TYPE_COMMENT = 3;
const MODAL_COUNTDOWN = "wechatLotteryCountdown";
const MODAL_ROLLING = "wechatLotteryEffect";
const MODAL_AWARDS = "wechatLotteryAwardsUser";
const MODAL_WIN = "wechatLotteryWin";
const MODAL_LOSE = "wechatLotteryLose";
const RESULT_DELAY = 3000;
const ROLLING_DURATION = 4500;
const DEFAULT_AVATAR = "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function buildRoomContext(ctx = {}) {
  const roomId = toNumber(ctx.liveId?.value ?? ctx.liveId);
  const termId = toNumber(typeof ctx.getEffectiveTermId === "function" ? ctx.getEffectiveTermId() : 0);
  const customerId = toNumber(ctx.myUserId?.value ?? ctx.myUserId);
  const roomCode = String(ctx.roomCode?.value ?? ctx.roomCode ?? "").trim();
  const tenantId = toNumber(ctx.liveTenantId?.value ?? ctx.liveTenantId);
  const shareCode = String(ctx.shareCode?.value ?? ctx.shareCode ?? "").trim();
  const bindId = ctx.liveBindId?.value ?? ctx.liveBindId ?? "";
  const liveType = String(ctx.liveType?.value ?? ctx.liveType ?? (ctx.isReplay?.value ? "replay" : "live")).trim();
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

function normalizeLotteryPayload(message = {}) {
  const { data, payload } = unwrapLotteryPayload(message);
  return {
    ...data,
    ...payload,
    ...(message && typeof message === "object" && !Array.isArray(message) ? message : {}),
  };
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
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
  ].filter((item) => isPlainObject(item) && Object.keys(item).length > 0);
}

function pickLotteryList(payload = {}, ...keys) {
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

function getRecordKey(payload = {}) {
  return getLotteryRecordKey(payload);
}

function normalizeDisplayUser(item = {}, index = 0) {
  const nickname = getLotteryWinnerName(item, `用户${index + 1}`);
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

function normalizeParticipant(item = {}, index = 0) {
  const nickname = getLotteryWinnerName(item, `用户${index + 1}`);
  return {
    key: String(firstValue(item, "customerId", "customer_id", "userId", "user_id") || `${nickname}-${index}`),
    name: nickname,
    phone: firstValue(item, "phone", "mobile", "maskedPhone", "masked_phone") || "",
    photo: firstValue(item, "avatar", "photo", "image", "headImage", "head_image") || DEFAULT_AVATAR,
    customerId: toNumber(firstValue(item, "customerId", "customer_id", "userId", "user_id")),
    raw: item,
  };
}

function buildFallbackParticipants(winners) {
  if (winners.length > 0) return winners;
  return [
    { key: "lottery-default-1", name: "直播间观众", phone: "", photo: DEFAULT_AVATAR },
    { key: "lottery-default-2", name: "幸运用户", phone: "", photo: DEFAULT_AVATAR },
    { key: "lottery-default-3", name: "热心老铁", phone: "", photo: DEFAULT_AVATAR },
  ];
}

function buildPrize(payload = {}) {
  const firstWinner = pickLotteryList(payload, "winners", "winnerList", "winner_list", "records", "recordList", "record_list", "newRecords", "new_records", "results", "resultList", "result_list")[0] || {};
  const productName = getLotteryRewardName(payload, firstWinner) || firstValue(payload, "activityName", "activity_name", "name") || "抽奖奖品";
  const orderId = toNumber(firstValue(payload, "orderId", "order_id"));
  return {
    title: productName,
    name: productName,
    image: firstValue(payload, "productImage", "product_image", "rewardImage", "reward_image", "image") ||
      firstValue(firstWinner, "productImage", "product_image", "rewardImage", "reward_image", "image") ||
      "",
    level: "",
    quantity: Math.max(toNumber(firstValue(payload, "rewardQuantity", "reward_quantity", "quantity", "num"), 1), 1),
    orderId,
    orderNo: firstValue(payload, "orderNo", "order_no") || "",
    winRecordUrl: firstValue(payload, "winRecordUrl", "win_record_url") || "",
    orderDetailUrl: firstValue(payload, "orderDetailUrl", "order_detail_url") || (orderId ? `/pages/order/detail?id=${orderId}` : ""),
  };
}

function buildChatMessage(payload = {}, winners = []) {
  const chatMessage = firstValue(payload, "chatMessage", "chat_message");
  if (chatMessage) return chatMessage;
  if (!winners.length) return `本轮${firstValue(payload, "activityName", "activity_name", "name") || "抽奖"}暂无中奖用户`;
  const names = winners.slice(0, 3).map((item) => item.name).filter(Boolean).join("、");
  const suffix = winners.length > 3 ? `等 ${winners.length} 位用户` : "";
  const firstWinner = pickLotteryList(payload, "winners", "winnerList", "winner_list")[0] || {};
  return `恭喜 ${names}${suffix} 获得 ${getLotteryRewardName(payload, firstWinner) || "奖品"}`;
}

function isLotteryWinPayload(payload = {}) {
  const activityType = getLotteryActivityType(payload);
  const winType = toNumber(firstValue(payload, "winType", "win_type"));
  if (activityType === 1 || winType === 1) return false;
  return [ACTIVITY_TYPE_NORMAL, ACTIVITY_TYPE_COMMENT].includes(activityType) ||
    [ACTIVITY_TYPE_NORMAL, ACTIVITY_TYPE_COMMENT].includes(winType) ||
    Boolean(firstValue(payload, "drawId", "draw_id", "lotteryId", "lottery_id", "winnerRecordId", "winner_record_id", "recordId", "record_id", "prizeId", "prize_id", "productName", "product_name"));
}

function isSameDrawOrActivity(left, right) {
  if (!left || !right) return false;
  const leftDrawId = String(firstValue(left, "drawId", "draw_id", "lotteryId", "lottery_id") || "");
  const rightDrawId = String(firstValue(right, "drawId", "draw_id", "lotteryId", "lottery_id") || "");
  if (leftDrawId && rightDrawId) return leftDrawId === rightDrawId;
  const leftActivityId = toNumber(firstValue(left, "activityId", "activity_id"));
  const rightActivityId = toNumber(firstValue(right, "activityId", "activity_id"));
  return leftActivityId > 0 && leftActivityId === rightActivityId;
}

export function useLiveNormalLottery({
  roomCode,
  liveId,
  liveTenantId,
  shareCode,
  liveBindId,
  isReplay,
  myUserId,
  getEffectiveTermId,
  getLotteryParticipantsApi,
  appendSystemMessage,
}) {
  const activeModal = ref("");
  const currentDraw = ref(null);
  const currentPrize = ref(buildPrize());
  const winners = ref([]);
  const participants = ref([]);
  const ownWin = ref(null);
  const resultGateOpen = ref(false);
  const handledDrawIds = new Set();
  const handledRecordIds = new Set();
  const handledMessageIds = new Set();
  const timers = [];

  const displayParticipants = computed(() => (
    participants.value.length > 0 ? participants.value : buildFallbackParticipants(winners.value)
  ));

  function clearTimers() {
    while (timers.length) {
      clearTimeout(timers.pop());
    }
  }

  function setModalLater(modal, delay) {
    const timer = setTimeout(() => {
      if (typeof modal === "function") {
        modal();
        return;
      }
      activeModal.value = modal;
    }, delay);
    timers.push(timer);
  }

  function closeLotteryModal() {
    clearTimers();
    activeModal.value = "";
    resultGateOpen.value = false;
  }

  function showAwards() {
    activeModal.value = MODAL_AWARDS;
  }

  function resetForDraw(payload) {
    clearTimers();
    currentDraw.value = payload;
    currentPrize.value = buildPrize(payload);
    winners.value = pickLotteryList(payload, "winners", "winnerList", "winner_list", "records", "recordList", "record_list", "newRecords", "new_records", "results", "resultList", "result_list").map(normalizeDisplayUser);
    participants.value = pickLotteryList(payload, "participants", "participantList", "participant_list", "users", "userList", "user_list").map(normalizeParticipant);
    resultGateOpen.value = false;
    if (!isSameDrawOrActivity(ownWin.value, payload)) {
      ownWin.value = null;
    }
    activeModal.value = "";
  }

  async function loadParticipants(payload) {
    if (participants.value.length > 0 || typeof getLotteryParticipantsApi !== "function") return;
    if (toNumber(firstValue(payload, "method", "drawMethod", "draw_method"), 2) !== 1) return;
    try {
      const activityType = getLotteryActivityType(payload) || ACTIVITY_TYPE_NORMAL;
      const res = await getLotteryParticipantsApi({
        ...buildRoomContext({ roomCode, liveId, liveTenantId, shareCode, liveBindId, isReplay, myUserId, getEffectiveTermId }),
        activityId: firstValue(payload, "activityId", "activity_id"),
        activity_id: firstValue(payload, "activityId", "activity_id"),
        drawId: firstValue(payload, "drawId", "draw_id", "lotteryId", "lottery_id"),
        draw_id: firstValue(payload, "drawId", "draw_id", "lotteryId", "lottery_id"),
        participantsUrl: firstValue(payload, "participantsUrl", "participants_url"),
        participants_url: firstValue(payload, "participantsUrl", "participants_url"),
        activityType,
        activity_type: activityType,
        winType: activityType,
        win_type: activityType,
      });
      participants.value = pickLotteryList(res || {}, "participants", "participantList", "participant_list", "users", "userList", "user_list").map(normalizeParticipant);
    } catch (err) {
      console.warn("[LiveLottery] load participants fail:", err);
    }
  }

  function showOwnResult() {
    resultGateOpen.value = true;
    const payload = currentDraw.value || {};
    if (ownWin.value && isSameDrawOrActivity(ownWin.value, payload)) {
      currentPrize.value = buildPrize({ ...payload, ...ownWin.value });
      activeModal.value = MODAL_WIN;
      return;
    }
    if (getLotteryActivityType(payload) === ACTIVITY_TYPE_COMMENT) {
      return;
    }
    activeModal.value = MODAL_LOSE;
  }

  async function handleLotteryResult(message) {
    const payload = normalizeLotteryPayload(message);
    const activityType = getLotteryActivityType(payload);
    if (![ACTIVITY_TYPE_NORMAL, ACTIVITY_TYPE_COMMENT].includes(activityType)) {
      return false;
    }
    const drawId = String(firstValue(payload, "drawId", "draw_id", "lotteryId", "lottery_id") || `${firstValue(payload, "activityId", "activity_id") || ""}:${firstValue(payload, "drawTime", "draw_time", "serverTime", "server_time") || ""}`);
    if (!drawId || handledDrawIds.has(drawId)) return true;
    handledDrawIds.add(drawId);
    resetForDraw({ ...payload, drawId });
    // 逐位中奖用户追加 lottery_win 样式消息到评论区
    winners.value.forEach((winner) => {
      appendLotteryWinMessage(appendSystemMessage, handledMessageIds, winner.raw || winner, currentPrize.value);
    });

    const countdownMs = Math.max(toNumber(firstValue(payload, "countdownSec", "countdown_sec"), 3), 3) * 1000;
    const participantsReady = loadParticipants(payload);
    activeModal.value = MODAL_COUNTDOWN;

    if (toNumber(firstValue(payload, "method", "drawMethod", "draw_method"), 2) === 1) {
      setModalLater(async () => {
        await participantsReady;
        if (participants.value.length > 0) {
          activeModal.value = MODAL_ROLLING;
          setModalLater(showAwards, ROLLING_DURATION);
          setModalLater(showOwnResult, ROLLING_DURATION + RESULT_DELAY);
          return;
        }
        showAwards();
        setModalLater(showOwnResult, RESULT_DELAY);
      }, countdownMs);
      return true;
    }
    setModalLater(showAwards, countdownMs);
    setModalLater(showOwnResult, countdownMs + RESULT_DELAY);
    return true;
  }

  function handleWinNotify(message) {
    const payload = normalizeLotteryPayload(message);
    if (!isLotteryWinPayload(payload)) return false;
    const key = getRecordKey(payload);
    if (handledRecordIds.has(key)) return true;
    handledRecordIds.add(key);
    ownWin.value = payload;
    // 个人中奖通知也追加到评论区（handledMessageIds 防止与 handleLotteryResult 重复）
    appendLotteryWinMessage(appendSystemMessage, handledMessageIds, payload, currentPrize.value);
    if (!firstValue(currentDraw.value || {}, "activityId", "activity_id")) {
      // 修复: 新用户/指定用户/下单用户没有经过 countdown/rolling 流程就收到 win_notify
      // 直接初始化当前开奖数据并显示中奖弹窗,不让用户错过
      currentDraw.value = { ...payload, winners: [], activityType: getLotteryActivityType(payload) || firstValue(payload, "winType", "win_type") };
      currentPrize.value = buildPrize(payload);
      activeModal.value = MODAL_WIN;
      return true;
    }
    if (resultGateOpen.value && isSameDrawOrActivity(payload, currentDraw.value)) {
      showOwnResult();
    }
    return true;
  }

  function handleWinRecordUpdate(message) {
    const payload = normalizeLotteryPayload(message);
    const activityType = getLotteryActivityType(payload);
    if (![ACTIVITY_TYPE_NORMAL, ACTIVITY_TYPE_COMMENT].includes(activityType)) return false;
    const currentActivityId = toNumber(firstValue(currentDraw.value || {}, "activityId", "activity_id"));
    const nextActivityId = toNumber(firstValue(payload, "activityId", "activity_id"));
    if (!currentActivityId || currentActivityId !== nextActivityId) return true;
    const seen = new Set(winners.value.map((item) => String(item.recordId || item.key)));
    pickLotteryList(payload, "records", "recordList", "record_list", "newRecords", "new_records", "winners", "winnerList", "winner_list", "results", "resultList", "result_list").forEach((item, index) => {
      const winner = normalizeDisplayUser(item, index);
      const key = String(winner.recordId || winner.key);
      if (!seen.has(key)) {
        winners.value.push(winner);
        seen.add(key);
      }
    });
    return true;
  }

  onBeforeUnmount(clearTimers);

  return {
    normalLotteryActiveModal: activeModal,
    normalLotteryPrize: currentPrize,
    normalLotteryWinners: winners,
    normalLotteryParticipants: displayParticipants,
    closeLotteryModal,
    handleLotteryResult,
    handleWinNotify,
    handleWinRecordUpdate,
  };
}
