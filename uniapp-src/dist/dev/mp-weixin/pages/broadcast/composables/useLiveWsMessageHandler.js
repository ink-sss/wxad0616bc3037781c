"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_broadcast_utils_liveStatusSnapshot = require("../utils/live-status-snapshot.js");
function getCommentLotteryEventName(data = {}) {
  const payload = getDataPayload(data);
  const raw = normalizeEventName(payload.event || payload.action || "");
  if (raw === "comment_lottery_started" || raw === "begin_comment_lottery_prize")
    return "started";
  if (raw === "comment_lottery_opened" || raw === "open_prize")
    return "opened";
  if (raw === "comment_lottery_config_updated" || raw === "update_comment_lottery_config")
    return "config_updated";
  return "";
}
function isCommentLotteryMessage(data = {}) {
  const payload = getDataPayload(data);
  return Number(
    payload.activityType || data.activityType || payload.activity_type || data.activity_type || payload.winType || data.winType || payload.win_type || data.win_type || 0
  ) === 3 || String(data.type || "") === "comment_lottery" || Boolean(getCommentLotteryEventName(data));
}
function scrollAfterAppend(ctx) {
  common_vendor.nextTick$1(() => ctx.scrollToBottom());
}
function refreshPinnedMessage(ctx) {
  var _a;
  (_a = ctx.refreshPinnedMessage) == null ? void 0 : _a.call(ctx);
}
function clearMessages(ctx) {
  if (!ctx.messages)
    return;
  ctx.messages.value = [];
  refreshPinnedMessage(ctx);
}
function appendLiveMessage(ctx, message) {
  if (!ctx.canAppendLiveMessages())
    return false;
  const shouldFollow = typeof ctx.shouldFollowLatestCommentWindow === "function" ? ctx.shouldFollowLatestCommentWindow() : true;
  if (Number((message == null ? void 0 : message.isTop) || 0) === 1) {
    ctx.messages.value.forEach((item) => {
      item.isTop = 0;
    });
  }
  ctx.messages.value.push(message);
  if (Number((message == null ? void 0 : message.isTop) || 0) === 1) {
    refreshPinnedMessage(ctx);
  }
  if (shouldFollow)
    scrollAfterAppend(ctx);
  return true;
}
function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function normalizeEventName(value = "") {
  return String(value || "").trim().replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[-\s.]+/g, "_").replace(/__+/g, "_").toLowerCase();
}
function compactEventName(value = "") {
  return normalizeEventName(value).replace(/_/g, "");
}
function matchEventName(name, aliases = []) {
  const normalized = normalizeEventName(name);
  const compact = compactEventName(name);
  return aliases.some((alias) => {
    const next = normalizeEventName(alias);
    return normalized === next || compact === next.replace(/_/g, "");
  });
}
function getDataPayload(data = {}) {
  if (Array.isArray(data == null ? void 0 : data.data))
    return data.data;
  const nested = isPlainObject(data == null ? void 0 : data.data) ? data.data : {};
  const nestedPayload = isPlainObject(nested.payload) ? nested.payload : {};
  const topPayload = isPlainObject(data == null ? void 0 : data.payload) ? data.payload : {};
  if (isPlainObject(data) || isPlainObject(nested) || isPlainObject(topPayload)) {
    return {
      ...topPayload,
      ...nestedPayload,
      ...nested,
      ...isPlainObject(data) ? data : {}
    };
  }
  return data;
}
function getNestedPayload(data = {}) {
  var _a;
  if (Array.isArray(data == null ? void 0 : data.data))
    return data.data;
  if (isPlainObject((_a = data == null ? void 0 : data.data) == null ? void 0 : _a.payload))
    return data.data.payload;
  if (isPlainObject(data == null ? void 0 : data.data))
    return data.data;
  if (isPlainObject(data == null ? void 0 : data.payload))
    return data.payload;
  return {};
}
function firstPresent(...values) {
  return values.find((value) => value !== void 0 && value !== null && value !== "");
}
function getFirstObjectPayload(data = {}, ...keys) {
  const payload = getDataPayload(data);
  const nested = getNestedPayload(data);
  for (const source of [payload, nested, data]) {
    if (!isPlainObject(source))
      continue;
    for (const key of keys) {
      if (isPlainObject(source[key]))
        return source[key];
    }
  }
  if (isPlainObject(nested) && Object.keys(nested).length > 0)
    return nested;
  if (isPlainObject(payload) && Object.keys(payload).length > 0)
    return payload;
  return {};
}
const WS_NUMERIC_TYPE_MAP = {
  1: "chat",
  2: "like",
  3: "enter",
  4: "leave",
  5: "system",
  6: "product",
  7: "viewer_count",
  8: "gift",
  9: "setting_update",
  10: "comment_audit",
  11: "comment_delete",
  12: "comment_clear",
  13: "comment_top",
  14: "user_muted",
  15: "user_blocked",
  16: "user_unblocked",
  17: "product_status_update",
  18: "product_list",
  19: "product_stock",
  20: "video_loop_restart",
  21: "mute_word_filtered",
  22: "win_notify",
  23: "lottery_result",
  24: "win_record_update",
  27: "watch_reward_lifecycle",
  28: "watch_reward_broadcast",
  29: "comment_lottery_event",
  30: "live_status_update"
};
const WS_TYPE_ALIASES = [
  { type: "chat", aliases: ["chat", "comment", "message"] },
  { type: "like", aliases: ["like", "liked"] },
  { type: "enter", aliases: ["enter", "join"] },
  { type: "leave", aliases: ["leave", "quit"] },
  { type: "viewer_count", aliases: ["viewer_count", "online_count", "viewerCount", "onlineCount"] },
  { type: "system", aliases: ["system", "system_message"] },
  { type: "gift", aliases: ["gift"] },
  { type: "r_to_buy", aliases: ["r_to_buy", "buy_reminder", "buying_notice", "paid_order_notice"] },
  { type: "product", aliases: ["product", "current_product"] },
  { type: "product_status_update", aliases: ["product_status_update", "productstatusupdate", "product_status"] },
  { type: "product_list", aliases: ["product_list", "productlist"] },
  { type: "product_stock", aliases: ["product_stock", "productstock"] },
  { type: "setting_update", aliases: ["setting_update", "room_setting_update"] },
  { type: "comment_audit", aliases: ["comment_audit"] },
  { type: "comment_delete", aliases: ["comment_delete", "delete_comment"] },
  { type: "comment_clear", aliases: ["comment_clear", "clear_comment"] },
  { type: "comment_top", aliases: ["comment_top", "top_comment"] },
  { type: "user_muted", aliases: ["user_muted", "mute_user"] },
  { type: "user_blocked", aliases: ["user_blocked", "block_user"] },
  { type: "user_unblocked", aliases: ["user_unblocked", "unblock_user"] },
  { type: "mute_word_filtered", aliases: ["mute_word_filtered"] },
  { type: "live_ended", aliases: ["live_ended", "live_end"] },
  { type: "video_loop_restart", aliases: ["video_loop_restart"] },
  {
    type: "win_notify",
    aliases: [
      "win_notify",
      "lottery_win_notify",
      "watch_reward_win_notify",
      "watch_reward_win",
      "watch_reward_winner",
      "watch_reward_result",
      "watch_duration_reward_win",
      "watch_duration_reward_result"
    ]
  },
  { type: "lottery_result", aliases: ["lottery_result", "normal_lottery_result"] },
  { type: "win_record_update", aliases: ["win_record_update", "winrecordupdate"] },
  {
    type: "watch_reward_lifecycle",
    aliases: [
      "watch_reward_lifecycle",
      "watch_reward_update",
      "watch_reward_changed",
      "watch_reward_open",
      "watch_reward_close",
      "watch_reward_delete",
      "watch_reward_activity_update",
      "watch_duration_reward_lifecycle",
      "watch_duration_reward_update"
    ]
  },
  {
    type: "watch_reward_broadcast",
    aliases: [
      "watch_reward_broadcast",
      "watch_reward_notice",
      "watch_reward_award_notice",
      "watch_reward_win_broadcast",
      "watch_duration_reward_notice",
      "watch_duration_reward_broadcast"
    ]
  },
  {
    type: "comment_lottery_event",
    aliases: [
      "comment_lottery_event",
      "begin_comment_lottery_prize",
      "begincommentlotteryprize",
      "open_prize",
      "openprize",
      "update_comment_lottery_config",
      "updatecommentlotteryconfig"
    ]
  },
  { type: "comment_lottery", aliases: ["comment_lottery"] },
  { type: "live_status_update", aliases: ["live_status_update", "live_status", "live_status_snapshot"] }
];
function getMessageTypeSources(data = {}) {
  const sources = [];
  const push = (value) => {
    if (!isPlainObject(value))
      return;
    sources.push(value);
  };
  push(data);
  push(getDataPayload(data));
  push(getNestedPayload(data));
  return sources;
}
function resolveWsMessageType(data = {}) {
  const candidates = [];
  getMessageTypeSources(data).forEach((source) => {
    candidates.push(
      source.type,
      source.event,
      source.eventType,
      source.event_type,
      source.msgType,
      source.msg_type,
      source.messageType,
      source.message_type,
      source.customEvent,
      source.custom_event,
      source.eventName,
      source.event_name,
      source.name,
      source.cmd,
      source.action,
      source.operation,
      source.op
    );
  });
  for (const value of candidates) {
    if (value === void 0 || value === null || value === "")
      continue;
    const numericType = Number(value);
    if (Number.isInteger(numericType) && WS_NUMERIC_TYPE_MAP[numericType]) {
      return WS_NUMERIC_TYPE_MAP[numericType];
    }
    for (const item of WS_TYPE_ALIASES) {
      if (matchEventName(value, item.aliases))
        return item.type;
    }
  }
  return "";
}
function normalizeBroadcastWsMessage(data = {}) {
  if (!isPlainObject(data))
    return data;
  const type = resolveWsMessageType(data);
  if (!type)
    return data;
  if (data.type === type)
    return data;
  return { ...data, type };
}
function getProductEventPayload(data = {}) {
  const base = getDataPayload(data);
  const product = getFirstObjectPayload(
    data,
    "product",
    "currentProduct",
    "current_product",
    "goods",
    "goodsInfo",
    "goods_info",
    "item"
  );
  if (!isPlainObject(product) || Object.keys(product).length === 0)
    return base;
  return {
    ...base,
    ...product,
    action: product.action || base.action,
    operation: product.operation || base.operation,
    status: product.status || base.status,
    event: product.event || base.event
  };
}
function normalizeMessageId(message = {}) {
  const payload = getDataPayload(message);
  return String(
    message.msgId || message._clientMsgId || message.clientMsgId || message.msg_id || message.client_msg_id || payload.msgId || payload.clientMsgId || payload.msg_id || payload.client_msg_id || ""
  ).trim();
}
function normalizeChatContent(content) {
  return String(content || "").trim();
}
function normalizeMessageSeq(message = {}) {
  const payload = getDataPayload(message);
  const seq = Number(message.seq || payload.seq || 0);
  return Number.isFinite(seq) ? seq : 0;
}
function getCommentId(payload = {}) {
  return payload.commentId || payload.comment_id || payload.id;
}
function getReplayVideoId(payload = {}) {
  return Number(payload.replayVideoId || payload.replay_video_id || payload.videoId || payload.video_id || 0);
}
function getTimelineSeconds(payload = {}) {
  return Number(
    payload.timelineSeconds || payload.timeline_seconds || payload.timeLineSeconds || payload.playSeconds || payload.play_seconds || payload.commentSeconds || payload.comment_seconds || payload.commentTime || payload.comment_time || payload.time || 0
  );
}
function getProductNoticeMeta(payload = {}) {
  const product = getFirstObjectPayload(payload, "product", "currentProduct", "current_product", "goods", "goodsInfo", "goods_info", "item");
  const source = isPlainObject(product) ? { ...payload, ...product } : payload;
  return {
    productId: getProductId(source),
    productName: source.productName || source.product_name || source.goods_name || source.goodsName || source.name || source.title,
    productImage: source.productImage || source.product_image || source.goods_pic || source.goodsPic || source.goods_image || source.coverImage || source.cover_image || source.image,
    count: source.saleCount || source.sale_count || source.count || 0,
    sort: source.sort || source.goodsSort || source.goods_sort || ""
  };
}
function getProductId(payload = {}) {
  return Number(payload.productId || payload.product_id || payload.goodsId || payload.goods_id || payload.id || 0);
}
function sameProductId(left = {}, rightId = 0) {
  return getProductId(left) === Number(rightId || 0);
}
function normalizeProductAction(value = "") {
  const action = normalizeEventName(value);
  if (["explain", "explaining", "current_product", "current"].includes(action))
    return "explaining";
  if (["explaining_multi", "explain_multi", "multi_explaining", "current_products"].includes(action))
    return "explaining_multi";
  if (["top", "pinned", "pin"].includes(action))
    return "top";
  if (["sold_out", "soldout", "sell_out", "mark_sold_out"].includes(action))
    return "sold_out";
  return action;
}
function pickProductList(payload = {}, ...keys) {
  for (const key of keys) {
    if (Array.isArray(payload[key]))
      return payload[key];
  }
  return [];
}
const _paidOrderNoticeDedup = /* @__PURE__ */ new Map();
const PAID_ORDER_NOTICE_DEDUP_TTL = 5e3;
function markPaidOrderNoticeSeen(payload = {}) {
  const key = String(payload.orderNo || payload.order_no || payload.orderId || payload.order_id || "");
  if (!key)
    return false;
  const now = Date.now();
  const last = _paidOrderNoticeDedup.get(key);
  if (last && now - last < PAID_ORDER_NOTICE_DEDUP_TTL)
    return true;
  _paidOrderNoticeDedup.set(key, now);
  if (_paidOrderNoticeDedup.size > 100) {
    for (const [k, t] of _paidOrderNoticeDedup) {
      if (now - t > PAID_ORDER_NOTICE_DEDUP_TTL)
        _paidOrderNoticeDedup.delete(k);
    }
  }
  return false;
}
function getPayloadUserId(payload = {}) {
  return Number(payload.userId || payload.user_id || payload.customerId || payload.customer_id || 0);
}
function getPayloadNickname(payload = {}, fallback = "观众") {
  return payload.nick || payload.nickname || payload.userName || payload.user_name || payload.customerName || payload.customer_name || payload.name || fallback;
}
function getPayloadAvatar(payload = {}, fallback = "") {
  return payload.avatar || payload.avatarUrl || payload.avatar_url || payload.headImg || payload.head_img || fallback;
}
function getPayloadContent(payload = {}, fallback = "") {
  return payload.content || payload.comment || payload.message || payload.text || fallback;
}
function isOwnMessage(ctx, data) {
  const payload = getDataPayload(data);
  const incomingUserId = getPayloadUserId(payload);
  if (ctx.myUserId.value > 0) {
    if (incomingUserId > 0) {
      return incomingUserId === ctx.myUserId.value;
    }
  }
  if (ctx.isPendingSentContent && typeof ctx.isPendingSentContent === "function") {
    return ctx.isPendingSentContent(getPayloadContent(payload, getPayloadContent(data)));
  }
  return false;
}
function hasVisibleChatMessage(ctx, message) {
  return typeof ctx.hasVisibleChatMessage === "function" && ctx.hasVisibleChatMessage(message);
}
function buildChatMessage(ctx, data) {
  const payload = getDataPayload(data);
  const isAdmin = !!payload.isAdmin;
  const msgId = normalizeMessageId(data);
  const seq = normalizeMessageSeq(data);
  return {
    type: "chat",
    nick: isAdmin ? "管理员" : ctx.formatLiveNickname(getPayloadNickname(payload, "匿名")),
    content: getPayloadContent(payload, getPayloadContent(data)),
    avatar: getPayloadAvatar(payload, data.avatar || ctx.defaultAvatar),
    commentId: getCommentId(payload),
    msgId: msgId || void 0,
    seq: seq || void 0,
    isTop: Number(payload.isTop || 0),
    isAdmin
  };
}
function appendReplayChat(ctx, data, message = buildChatMessage(ctx, data)) {
  var _a, _b, _c;
  const payload = getDataPayload(data);
  if (!((_a = ctx.replayCommentTimeline) == null ? void 0 : _a.value))
    return false;
  const replayVideoId = getReplayVideoId(payload);
  if (!ctx.replayCurrentVideoId.value || replayVideoId <= 0)
    return false;
  if (replayVideoId !== Number(ctx.replayCurrentVideoId.value))
    return false;
  const timelineSeconds = getTimelineSeconds(payload);
  const commentId = Number(getCommentId(payload) || 0);
  const msgId = normalizeMessageId(message);
  const seq = normalizeMessageSeq(message);
  const exists = ctx.replayCommentTimeline.value.some((item) => {
    if (seq > 0 && normalizeMessageSeq(item) === seq)
      return true;
    if (commentId > 0 && Number(item.commentId || 0) === commentId)
      return true;
    if (msgId && normalizeMessageId(item) === msgId)
      return true;
    return Number(item.replayVideoId || 0) === replayVideoId && Number(item.timelineSeconds || 0) === timelineSeconds && normalizeChatContent(item.content) === normalizeChatContent(message.content);
  });
  if (exists)
    return false;
  ctx.replayCommentTimeline.value.push({
    ...message,
    seq: seq || message.seq,
    timelineSeconds,
    replayVideoId
  });
  ctx.replayCommentTimeline.value.sort(
    (a, b) => Number(a.timelineSeconds || 0) - Number(b.timelineSeconds || 0)
  );
  const currentReplaySeconds = Number(((_b = ctx.replayLastTime) == null ? void 0 : _b.value) || 0);
  if (timelineSeconds <= currentReplaySeconds) {
    (_c = ctx.syncReplayCommentCursor) == null ? void 0 : _c.call(ctx, currentReplaySeconds);
  }
  return true;
}
function handleChatMessage(ctx, data) {
  const message = buildChatMessage(ctx, data);
  const trackedReplayMessage = ctx.isReplay.value ? appendReplayChat(ctx, data, message) : false;
  const ownMessage = isOwnMessage(ctx, data);
  if (ownMessage) {
    if (ctx.upgradeOptimisticMessage) {
      const upgraded = ctx.upgradeOptimisticMessage(message, { allowSinglePendingFallback: true });
      if (upgraded)
        return;
    }
    if (ctx.isReplay.value && trackedReplayMessage && !hasVisibleChatMessage(ctx, message)) {
      appendLiveMessage(ctx, message);
    }
    return;
  }
  if (ctx.upgradeOptimisticMessage) {
    const upgraded = ctx.upgradeOptimisticMessage(message, { allowSinglePendingFallback: false });
    if (upgraded)
      return;
  }
  if (hasVisibleChatMessage(ctx, message))
    return;
  if (ctx.isReplay.value)
    return;
  appendLiveMessage(ctx, message);
}
const _audienceDedup = /* @__PURE__ */ new Map();
const AUDIENCE_DEDUP_TTL = 5e3;
function isDuplicateAudienceMsg(userId, type) {
  if (!userId)
    return false;
  const key = `${userId}:${type}`;
  const now = Date.now();
  const last = _audienceDedup.get(key);
  if (last && now - last < AUDIENCE_DEDUP_TTL)
    return true;
  _audienceDedup.set(key, now);
  if (_audienceDedup.size > 200) {
    for (const [k, t] of _audienceDedup) {
      if (now - t > AUDIENCE_DEDUP_TTL)
        _audienceDedup.delete(k);
    }
  }
  return false;
}
function canShowAudienceNotice(ctx, type) {
  var _a, _b, _c, _d;
  if (type === "enter")
    return Number(((_b = (_a = ctx.roomSetting) == null ? void 0 : _a.value) == null ? void 0 : _b.enterRemind) || 0) === 1;
  if (type === "leave")
    return Number(((_d = (_c = ctx.roomSetting) == null ? void 0 : _c.value) == null ? void 0 : _d.leaveRemind) || 0) === 1;
  return true;
}
function handleAudienceMessage(ctx, data, type, defaultContent) {
  var _a, _b, _c;
  const payload = getDataPayload(data);
  if ((type === "enter" || type === "leave") && ((_a = ctx.isEntryOverlayVisible) == null ? void 0 : _a.call(ctx)))
    return;
  if (!canShowAudienceNotice(ctx, type))
    return;
  if (type === "leave" && isOwnMessage(ctx, data))
    return;
  const nick = getPayloadNickname(payload);
  const avatar = getPayloadAvatar(payload, ctx.defaultAvatar);
  const displayNick = ctx.formatLiveNickname(nick);
  const userId = getPayloadUserId(payload);
  if ((type === "enter" || type === "leave") && isDuplicateAudienceMsg(userId, type))
    return;
  if (type === "enter") {
    (_b = ctx.showEnterNotice) == null ? void 0 : _b.call(ctx, displayNick, "enter");
    return;
  }
  if (type === "leave") {
    (_c = ctx.showEnterNotice) == null ? void 0 : _c.call(ctx, displayNick, "leave");
    return;
  }
  let content = payload.content;
  if (!content) {
    content = defaultContent;
  }
  appendLiveMessage(ctx, {
    type,
    nick: displayNick,
    content,
    avatar
  });
}
function handleProductMessage(ctx, data) {
  const payload = getProductEventPayload(data);
  if (payload && typeof payload === "object" && Object.keys(payload).length > 0) {
    ctx.currentProduct.value = ctx.mapProductItem(payload);
    ctx.showProduct.value = true;
    const curId = getProductId(payload);
    ctx.productList.value = ctx.productList.value.map((p) => ({ ...p, isCurrent: sameProductId(p, curId) }));
    ctx.explainingProductId.value = curId;
    ctx.syncProductCardIndex(curId);
    return;
  }
  ctx.showProduct.value = false;
  ctx.productList.value = ctx.productList.value.map((p) => ({ ...p, isCurrent: false }));
  ctx.explainingProductId.value = 0;
}
function handleExplainingMulti(ctx, data) {
  const payload = getDataPayload(data);
  const ids = pickProductList(payload, "explainingIds", "productIds", "product_ids", "goodsIds", "goods_ids", "ids").map((id) => Number(id || 0)).filter((id) => id > 0);
  const wsList = pickProductList(payload, "list", "products", "productList", "goodsList", "goods");
  const idSet = new Set(ids);
  ctx.productList.value = ctx.productList.value.map((p) => ({ ...p, isCurrent: idSet.has(getProductId(p)) }));
  if (ids.length <= 0) {
    ctx.showProduct.value = false;
    ctx.explainingProductId.value = 0;
    return;
  }
  let first = ctx.productList.value.find((p) => idSet.has(getProductId(p)));
  if (!first && wsList.length > 0)
    first = { ...ctx.mapProductItem(wsList[0]), isCurrent: true };
  if (!first)
    return;
  ctx.currentProduct.value = first;
  ctx.showProduct.value = true;
  ctx.explainingProductId.value = first.id;
  ctx.syncProductCardIndex(first.id);
}
function handleSoldOutUpdate(ctx, data, pid) {
  var _a, _b, _c, _d;
  const payload = getDataPayload(data);
  const raw = payload.isSoldOut ?? ((_a = payload.extra) == null ? void 0 : _a.isSoldOut);
  const isSoldOut = raw === true || raw === 1;
  ctx.productList.value = ctx.productList.value.map(
    (p) => p.id === pid ? { ...p, isSoldOut, soldOut: isSoldOut || Number(p.stock || 0) <= 0 } : p
  );
  if (((_b = ctx.currentProduct.value) == null ? void 0 : _b.id) === pid) {
    ctx.currentProduct.value = {
      ...ctx.currentProduct.value,
      isSoldOut,
      soldOut: isSoldOut || Number(ctx.currentProduct.value.stock || 0) <= 0
    };
  }
  if (((_d = (_c = ctx.buyProduct) == null ? void 0 : _c.value) == null ? void 0 : _d.id) === pid) {
    ctx.buyProduct.value = {
      ...ctx.buyProduct.value,
      isSoldOut,
      soldOut: isSoldOut || Number(ctx.buyProduct.value.stock || 0) <= 0
    };
  }
  ctx.syncProductCardIndex();
}
function handleProductStatusUpdate(ctx, data) {
  const payload = getProductEventPayload(data);
  const action = normalizeProductAction(payload.action || payload.operation || payload.status || payload.event || "");
  const pid = getProductId(payload);
  if (!action) {
    console.warn("[WS] product_status_update missing action:", data);
    return;
  }
  if (action === "explaining_multi") {
    handleExplainingMulti(ctx, data);
  } else if (action === "explaining") {
    ctx.explainingProductId.value = pid || 0;
    ctx.productList.value = ctx.productList.value.map((p) => ({ ...p, isCurrent: pid > 0 && sameProductId(p, pid) }));
    if (pid > 0) {
      const explainingProduct = ctx.productList.value.find((p) => sameProductId(p, pid));
      if (explainingProduct) {
        ctx.currentProduct.value = { ...explainingProduct, isCurrent: true };
        ctx.showProduct.value = true;
        ctx.syncProductCardIndex(pid);
      }
    } else {
      ctx.showProduct.value = false;
      ctx.currentProduct.value = {};
      ctx.syncProductCardIndex();
    }
  } else if (action === "top" && pid) {
    const isTop = payload.isTop || 0;
    ctx.productList.value = ctx.productList.value.map((p) => sameProductId(p, pid) ? { ...p, isTop } : p);
  } else if (action === "sold_out" && pid) {
    handleSoldOutUpdate(ctx, data, pid);
  }
}
function markReplayProductCurrent(ctx, list) {
  const wsVideoId = Number(ctx.replayCurrentVideoId.value || 0);
  return list.map((p) => {
    const vid = Number(p.videoId || 0);
    return { ...p, isCurrent: p.isCurrent && (vid === 0 || vid === wsVideoId) };
  });
}
function syncCurrentProductFromList(ctx, list) {
  const current = list.find((p) => p.isCurrent);
  if (!current) {
    ctx.syncProductCardIndex();
    return;
  }
  ctx.currentProduct.value = current;
  ctx.showProduct.value = true;
  ctx.explainingProductId.value = current.id;
  ctx.syncProductCardIndex(current.id);
}
function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}
function preserveKnownManualSoldOut(ctx, rawItem = {}, nextItem = {}) {
  var _a, _b, _c, _d;
  if (hasOwn(rawItem, "isSoldOut"))
    return nextItem;
  const pid = Number(nextItem.id || rawItem.id || 0);
  if (!pid)
    return nextItem;
  const existing = (_b = (_a = ctx.productList) == null ? void 0 : _a.value) == null ? void 0 : _b.find((item) => Number((item == null ? void 0 : item.id) || 0) === pid);
  const current = Number(((_d = (_c = ctx.currentProduct) == null ? void 0 : _c.value) == null ? void 0 : _d.id) || 0) === pid ? ctx.currentProduct.value : null;
  if ((existing == null ? void 0 : existing.isSoldOut) !== true && (current == null ? void 0 : current.isSoldOut) !== true)
    return nextItem;
  return {
    ...nextItem,
    isSoldOut: true,
    soldOut: true
  };
}
function handleProductList(ctx, data) {
  let rawList = [];
  const payload = getDataPayload(data);
  if (Array.isArray(data.data)) {
    rawList = data.data;
  } else if (Array.isArray(payload)) {
    rawList = payload;
  } else if (payload) {
    rawList = pickProductList(payload, "products", "productList", "list", "goodsList", "goods");
  }
  const list = rawList.map((item) => preserveKnownManualSoldOut(ctx, item, ctx.mapProductItem(item)));
  const useReplayFilter = ctx.isReplay.value && Number(ctx.replayCurrentVideoId.value || 0) > 0;
  ctx.productList.value = useReplayFilter ? markReplayProductCurrent(ctx, list) : list;
  ctx.productTotal.value = list.length;
  ctx.productFinished.value = true;
  syncCurrentProductFromList(ctx, ctx.productList.value);
}
function handleProductStock(ctx, data) {
  var _a;
  const payload = getDataPayload(data);
  const pid = getProductId(payload);
  const stock = payload.stock ?? 0;
  const stockSoldOut = !!payload.soldOut;
  if (!pid)
    return;
  ctx.productList.value = ctx.productList.value.map(
    (p) => sameProductId(p, pid) ? { ...p, stock, soldOut: !!p.isSoldOut || stockSoldOut } : p
  );
  if (sameProductId(ctx.currentProduct.value, pid)) {
    ctx.currentProduct.value = {
      ...ctx.currentProduct.value,
      stock,
      soldOut: !!ctx.currentProduct.value.isSoldOut || stockSoldOut
    };
  }
  if (payload.sales !== void 0) {
    (_a = ctx.setProductSales) == null ? void 0 : _a.call(ctx, pid, payload.sales);
  }
  ctx.syncProductCardIndex();
  if (stockSoldOut && !ctx.showBuyPopup.value && !ctx.buyLoading.value) {
    common_vendor.index.showToast({ title: "商品已售罄", icon: "none", duration: 2e3 });
  }
}
function handleSettingUpdate(ctx, data) {
  var _a, _b, _c;
  const payload = getDataPayload(data);
  const scope = payload.scope;
  if (scope === "watchReward") {
    (_a = ctx.onWatchRewardLifecycle) == null ? void 0 : _a.call(ctx, { ...data, ...payload, scope, action: payload.action, activityId: payload.activityId });
    return;
  }
  const s = normalizeSettingUpdatePayload(payload.setting || payload);
  const prevMuteAll = (_c = (_b = ctx.roomSetting) == null ? void 0 : _b.value) == null ? void 0 : _c.muteAll;
  Object.assign(ctx.roomSetting.value, s);
  if (s.enableChat !== void 0)
    ctx.switchToFirstAvailableTab();
  if (s.muteAll === void 0)
    return;
  if (Number(s.muteAll) === Number(prevMuteAll))
    return;
  if (s.muteAll === 1)
    ctx.inputFocused.value = false;
  const tipMsg = s.muteAll === 1 ? "主播开启了全员禁言" : "全员禁言已解除";
  common_vendor.index.showToast({ title: tipMsg, icon: "none" });
  appendLiveMessage(ctx, { type: "system", nick: "", content: tipMsg });
}
function updateLikeCountFromTotal(ctx, value) {
  if (!ctx.likeCount || value === void 0 || value === null)
    return;
  const next = Number(value);
  if (!Number.isFinite(next))
    return;
  const current = Number(ctx.likeCount.value || 0);
  ctx.likeCount.value = Math.max(Number.isFinite(current) ? current : 0, next);
}
function getLikeTotal(data = {}) {
  const payload = getDataPayload(data);
  const nested = getNestedPayload(data);
  return firstPresent(
    data.totalLikes,
    data.total_likes,
    data.likeCount,
    data.like_count,
    data.likes,
    data.totalLike,
    data.total_like,
    data.likeTotal,
    data.like_total,
    data.zanCount,
    data.zan_count,
    payload.totalLikes,
    payload.total_likes,
    payload.likeCount,
    payload.like_count,
    payload.likes,
    payload.totalLike,
    payload.total_like,
    payload.likeTotal,
    payload.like_total,
    payload.zanCount,
    payload.zan_count,
    nested.totalLikes,
    nested.total_likes,
    nested.likeCount,
    nested.like_count,
    nested.likes,
    nested.totalLike,
    nested.total_like,
    nested.likeTotal,
    nested.like_total,
    nested.zanCount,
    nested.zan_count
  );
}
function getLikeDelta(data = {}) {
  const payload = getDataPayload(data);
  const nested = getNestedPayload(data);
  return firstPresent(
    data.likeDelta,
    data.like_delta,
    data.delta,
    data.count,
    data.likeCountDelta,
    data.like_count_delta,
    data.addCount,
    data.add_count,
    data.likeNum,
    data.like_num,
    payload.likeDelta,
    payload.like_delta,
    payload.delta,
    payload.count,
    payload.likeCountDelta,
    payload.like_count_delta,
    payload.addCount,
    payload.add_count,
    payload.likeNum,
    payload.like_num,
    nested.likeDelta,
    nested.like_delta,
    nested.delta,
    nested.count,
    nested.likeCountDelta,
    nested.like_count_delta,
    nested.addCount,
    nested.add_count,
    nested.likeNum,
    nested.like_num
  );
}
function handleLiveStatusUpdate(ctx, data) {
  var _a;
  const payload = pages_broadcast_utils_liveStatusSnapshot.resolveLiveStatusPayload(data);
  if (!payload)
    return;
  (_a = ctx.markStatusPushReceived) == null ? void 0 : _a.call(ctx, payload);
  pages_broadcast_utils_liveStatusSnapshot.applyLiveStatusSnapshot(ctx, payload, { source: "ws" });
}
function handleLiveEnded(ctx, data) {
  var _a, _b, _c, _d;
  getDataPayload(data);
  if (((_a = ctx.isReplay) == null ? void 0 : _a.value) && !((_b = ctx.isScheduleWarmupMode) == null ? void 0 : _b.call(ctx)))
    return;
  if (((_c = ctx.isScheduleWarmupMode) == null ? void 0 : _c.call(ctx)) && ((_d = ctx.isWaitingSchedule) == null ? void 0 : _d.value))
    return;
  if (ctx.pushStatus)
    ctx.pushStatus.value = 2;
  if (ctx.pullUrl)
    ctx.pullUrl.value = "";
  if (ctx.isPlaying)
    ctx.isPlaying.value = false;
  clearMessages(ctx);
}
function normalizeSettingUpdatePayload(setting = {}) {
  const next = { ...setting };
  if (next.marqueePosition === void 0 && next.marqueeEnabled !== void 0) {
    next.marqueePosition = 1;
  }
  return next;
}
function handleCommentDelete(ctx, data) {
  const payload = getDataPayload(data);
  const ids = payload.commentIds || payload.comment_ids || payload.ids || (getCommentId(payload) ? [getCommentId(payload)] : []);
  if (ids.length <= 0)
    return;
  const idSet = new Set(ids.map((id) => String(id)));
  ctx.messages.value = ctx.messages.value.filter((m) => !m.commentId || !idSet.has(String(m.commentId)));
  refreshPinnedMessage(ctx);
}
function resetReplayLoopState(ctx) {
  ctx.replayProductSchedule.resetScheduleState();
  ctx.scheduleExplainActiveId.value = 0;
  ctx.replayLastTime.value = 0;
  ctx.replayCommentCursor.value = 0;
  ctx.clearCommentQueue();
  clearMessages(ctx);
  ctx.videoDebugInfo.value = { intent: 0, actual: -1, source: "loop-restart" };
  ctx.resetReplayLoopDebugState();
}
function restartReplayVideo(ctx) {
  var _a, _b;
  const videoEl = ctx.getLiveVideoElement();
  if (videoEl) {
    try {
      videoEl.currentTime = 0;
    } catch (e) {
    }
  }
  const videoPlayer = ctx.getVideoPlayer();
  if (videoPlayer) {
    try {
      (_a = videoPlayer.seek) == null ? void 0 : _a.call(videoPlayer, 0);
      videoPlayer.play();
    } catch (e) {
      console.warn("[Live] video player restart play fail:", e);
    }
    return;
  }
  try {
    const uniVideoCtx = ((_b = ctx.createMediaContext) == null ? void 0 : _b.call(ctx, "liveVideo", "video")) || (typeof common_vendor.index.createVideoContext === "function" ? common_vendor.index.createVideoContext("liveVideo") : null);
    if (!uniVideoCtx)
      return;
    uniVideoCtx.seek(0);
    uniVideoCtx.play();
  } catch (e) {
    console.warn("[Live] uni ctx loop restart fail:", e);
  }
}
function handleVideoLoopRestart(ctx, data) {
  const payload = getDataPayload(data);
  const replayVideoId = getReplayVideoId(payload);
  if (!ctx.isReplay.value || !ctx.replayCurrentVideoId.value)
    return;
  if (replayVideoId !== Number(ctx.replayCurrentVideoId.value))
    return;
  resetReplayLoopState(ctx);
  restartReplayVideo(ctx);
  try {
    common_vendor.index.setStorageSync(`replay_progress_${ctx.liveId.value}_${ctx.replayCurrentVideoId.value}`, 0);
  } catch (e) {
  }
  ctx.isPlaying.value = true;
}
function handleCommentTop(ctx, data) {
  const payload = getDataPayload(data);
  const topId = getCommentId(payload);
  const isTop = Number(payload.isTop || 0);
  if (!topId)
    return;
  ctx.messages.value.forEach((m) => {
    if (m.commentId === topId) {
      m.isTop = isTop;
    } else if (isTop === 1) {
      m.isTop = 0;
    }
  });
  ctx.refreshPinnedMessage && ctx.refreshPinnedMessage();
}
function handleUserMuted(ctx, data) {
  const payload = getDataPayload(data);
  if (getPayloadUserId(payload) !== ctx.myUserId.value)
    return;
  ctx.userMuted.value = true;
  ctx.inputFocused.value = false;
  const dur = payload.duration;
  if (dur && dur > 0) {
    ctx.startMuteCountdown(dur);
    common_vendor.index.showToast({ title: `您已被禁言${dur}分钟`, icon: "none", duration: 3e3 });
    return;
  }
  ctx.muteTipVisible.value = true;
  ctx.muteRemainText.value = "";
  common_vendor.index.showToast({ title: "您已被禁言", icon: "none", duration: 3e3 });
}
function handleUserBlocked(ctx, data) {
  const payload = getDataPayload(data);
  if (getPayloadUserId(payload) !== ctx.myUserId.value)
    return;
  ctx.userBlocked.value = true;
  ctx.accessDenied.value = true;
  ctx.inputFocused.value = false;
  ctx.muteTipVisible.value = true;
  ctx.muteRemainText.value = "";
}
function handleUserUnblocked(ctx, data) {
  const payload = getDataPayload(data);
  if (getPayloadUserId(payload) !== ctx.myUserId.value)
    return;
  const blockType = payload.blockType;
  if (blockType === 1) {
    ctx.userMuted.value = false;
    ctx.muteTipVisible.value = false;
    ctx.stopMuteCountdown();
  } else if (blockType === 2) {
    ctx.userBlocked.value = false;
    ctx.accessDenied.value = false;
    ctx.muteTipVisible.value = false;
  } else {
    ctx.userMuted.value = false;
    ctx.userBlocked.value = false;
    ctx.accessDenied.value = false;
    ctx.muteTipVisible.value = false;
    ctx.stopMuteCountdown();
  }
}
function handleMuteWordFiltered(ctx, data) {
  const filteredContent = data.content || "";
  for (let i = ctx.messages.value.length - 1; i >= 0; i--) {
    const m = ctx.messages.value[i];
    if (m.type === "chat" && m.content === filteredContent && !m.private) {
      ctx.messages.value[i] = { ...m, private: true };
      break;
    }
  }
}
function handleWinNotify(ctx, data) {
  var _a, _b, _c;
  if (isCommentLotteryMessage(data) && ((_a = ctx.onCommentLotteryWinNotify) == null ? void 0 : _a.call(ctx, data)))
    return;
  if ((_b = ctx.onLotteryWinNotify) == null ? void 0 : _b.call(ctx, data))
    return;
  (_c = ctx.onWatchRewardWinNotify) == null ? void 0 : _c.call(ctx, data);
}
function handleCommentLotteryEvent(ctx, data) {
  var _a, _b, _c;
  const eventName = getCommentLotteryEventName(data);
  if (eventName === "started") {
    (_a = ctx.onCommentLotteryStarted) == null ? void 0 : _a.call(ctx, data);
  } else if (eventName === "opened") {
    (_b = ctx.onCommentLotteryOpened) == null ? void 0 : _b.call(ctx, data);
  } else if (eventName === "config_updated") {
    (_c = ctx.onCommentLotteryConfigUpdated) == null ? void 0 : _c.call(ctx, data);
  }
}
function handleWatchRewardLifecycle(ctx, data) {
  var _a;
  if (isCommentLotteryMessage(data)) {
    handleCommentLotteryEvent(ctx, data);
    return;
  }
  (_a = ctx.onWatchRewardLifecycle) == null ? void 0 : _a.call(ctx, getDataPayload(data));
}
function handleSystemMessage(ctx, data) {
  var _a, _b, _c, _d, _e;
  const payload = getDataPayload(data);
  if (payload.buyReminder) {
    const nick = data.nick || data.nickname || getPayloadNickname(payload);
    const displayNick = ((_a = ctx.formatLiveNickname) == null ? void 0 : _a.call(ctx, nick)) || nick;
    (_b = ctx.showGoShoppingNotice) == null ? void 0 : _b.call(ctx, displayNick, payload.noticeText || "正在去购买", getProductNoticeMeta(payload));
    return;
  }
  if (payload.simOrder) {
    const repeatedPaidNotice = payload.paidOrder && markPaidOrderNoticeSeen(payload);
    (_c = ctx.incrementProductHotOrder) == null ? void 0 : _c.call(ctx, payload.productId, payload.quantity || 1, { virtual: !payload.paidOrder });
    if (repeatedPaidNotice)
      return;
    if (payload.paidOrder) {
      showPaidOrderSuccessNotice(ctx, data, payload);
      return;
    }
    const content = data.content || payload.content || "";
    const nick = extractSimOrderNick(content) || getPayloadNickname(payload);
    const displayNick = ((_d = ctx.formatLiveNickname) == null ? void 0 : _d.call(ctx, nick)) || nick;
    (_e = ctx.showBuyingNotice) == null ? void 0 : _e.call(ctx, displayNick, payload.noticeText, getProductNoticeMeta(payload));
    return;
  }
  appendLiveMessage(ctx, { type: "system", nick: "", content: data.content || payload.content || "" });
}
function canShowPaidOrderSuccessNotice(ctx) {
  var _a, _b;
  if (Number(((_b = (_a = ctx.roomSetting) == null ? void 0 : _a.value) == null ? void 0 : _b.buySuccessReminder) || 0) !== 1)
    return false;
  return true;
}
function showPaidOrderSuccessNotice(ctx, data, payload = getDataPayload(data)) {
  var _a, _b, _c;
  if (!canShowPaidOrderSuccessNotice(ctx))
    return;
  const nick = data.nick || data.nickname || getPayloadNickname(payload);
  const displayNick = ((_a = ctx.formatLiveNickname) == null ? void 0 : _a.call(ctx, nick)) || nick;
  const meta = getProductNoticeMeta(payload);
  meta.defer = !((_b = ctx.showProductList) == null ? void 0 : _b.value);
  (_c = ctx.showProductListSuccessNotice) == null ? void 0 : _c.call(ctx, displayNick, meta.productName || "", meta.productImage || "", meta);
}
function extractSimOrderNick(content) {
  if (!content)
    return "";
  const m = content.match(/^(.+?)\s*刚刚购买了/);
  return m ? m[1].trim() : "";
}
function handleCommentWsMessage(ctx, data) {
  switch (data.type) {
    case "chat":
    case "comment_audit":
      handleChatMessage(ctx, data);
      return true;
    case "enter":
      handleAudienceMessage(ctx, data, "enter", "进入了直播间");
      return true;
    case "gift":
      handleAudienceMessage(ctx, data, "gift", "送出了礼物");
      return true;
    case "system":
      handleSystemMessage(ctx, data);
      return true;
    case "comment_delete":
      handleCommentDelete(ctx, data);
      return true;
    case "comment_clear":
      clearMessages(ctx);
      return true;
    case "comment_top":
      handleCommentTop(ctx, data);
      return true;
    case "mute_word_filtered":
      handleMuteWordFiltered(ctx, data);
      return true;
    default:
      return false;
  }
}
function handleBuyingNotice(ctx, data) {
  var _a, _b, _c;
  const payload = getDataPayload(data);
  if (payload.paidOrder && markPaidOrderNoticeSeen(payload))
    return;
  if (payload.paidOrder) {
    if (isOwnMessage(ctx, data))
      return;
    showPaidOrderSuccessNotice(ctx, data, payload);
    return;
  }
  const nick = data.nick || data.nickname || getPayloadNickname(payload);
  const noticeText = data.noticeText || payload.noticeText || "";
  const displayNick = ((_a = ctx.formatLiveNickname) == null ? void 0 : _a.call(ctx, nick)) || nick;
  if (payload.buyReminder) {
    (_b = ctx.showGoShoppingNotice) == null ? void 0 : _b.call(ctx, displayNick, noticeText || "正在去购买", getProductNoticeMeta(payload));
    return;
  }
  if (isOwnMessage(ctx, data))
    return;
  (_c = ctx.showBuyingNotice) == null ? void 0 : _c.call(ctx, displayNick, noticeText, getProductNoticeMeta(payload));
}
function handleProductWsMessage(ctx, data) {
  switch (data.type) {
    case "product":
      handleProductMessage(ctx, data);
      return true;
    case "product_status_update":
      handleProductStatusUpdate(ctx, data);
      return true;
    case "product_list":
      handleProductList(ctx, data);
      return true;
    case "product_stock":
      handleProductStock(ctx, data);
      return true;
    case "r_to_buy":
      handleBuyingNotice(ctx, data);
      return true;
    default:
      return false;
  }
}
function handleRoomWsMessage(ctx, data) {
  switch (data.type) {
    case "like":
      if (!isOwnMessage(ctx, data)) {
        const total = getLikeTotal(data);
        if (total !== void 0 && total !== null) {
          updateLikeCountFromTotal(ctx, total);
        } else {
          const delta = Number(getLikeDelta(data) || 1);
          ctx.likeCount.value += Number.isFinite(delta) && delta > 0 ? delta : 1;
        }
      }
      return true;
    case "viewer_count":
      return true;
    case "setting_update":
      handleSettingUpdate(ctx, data);
      return true;
    case "live_status_update":
      handleLiveStatusUpdate(ctx, data);
      return true;
    case "live_ended":
      handleLiveEnded(ctx, data);
      return true;
    case "video_loop_restart":
      handleVideoLoopRestart(ctx, data);
      return true;
    case "user_muted":
      handleUserMuted(ctx, data);
      return true;
    case "user_blocked":
      handleUserBlocked(ctx, data);
      return true;
    case "user_unblocked":
      handleUserUnblocked(ctx, data);
      return true;
    default:
      return false;
  }
}
function handleMarketingWsMessage(ctx, data) {
  var _a, _b, _c, _d, _e;
  switch (data.type) {
    case "win_notify":
      handleWinNotify(ctx, data);
      return true;
    case "lottery_result":
      if (isCommentLotteryMessage(data) && ((_a = ctx.onCommentLotteryOpened) == null ? void 0 : _a.call(ctx, data)))
        return true;
      (_b = ctx.onLotteryResult) == null ? void 0 : _b.call(ctx, data);
      return true;
    case "win_record_update":
      if (isCommentLotteryMessage(data) && ((_c = ctx.onCommentLotteryWinRecordUpdate) == null ? void 0 : _c.call(ctx, data)))
        return true;
      (_d = ctx.onWinRecordUpdate) == null ? void 0 : _d.call(ctx, data);
      return true;
    case "comment_lottery_event":
    case "comment_lottery":
      handleCommentLotteryEvent(ctx, data);
      return true;
    case "watch_reward_lifecycle":
      handleWatchRewardLifecycle(ctx, data);
      return true;
    case "watch_reward_broadcast":
      (_e = ctx.onWatchRewardBroadcast) == null ? void 0 : _e.call(ctx, data);
      return true;
    default:
      return false;
  }
}
function createLiveWsMessageHandler(ctx) {
  return function handleWsMessage(data) {
    const normalizedData = normalizeBroadcastWsMessage(data);
    if (!normalizedData || !normalizedData.type)
      return;
    if (handleCommentWsMessage(ctx, normalizedData))
      return;
    if (handleProductWsMessage(ctx, normalizedData))
      return;
    if (handleRoomWsMessage(ctx, normalizedData))
      return;
    handleMarketingWsMessage(ctx, normalizedData);
  };
}
exports.createLiveWsMessageHandler = createLiveWsMessageHandler;
