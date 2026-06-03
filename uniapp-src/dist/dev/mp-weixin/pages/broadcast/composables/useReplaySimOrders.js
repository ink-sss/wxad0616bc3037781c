"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_live = require("../../../api/live.js");
const WINDOW_SIZE = 20;
const PRELOAD_LEAD_SEC = 5;
function firstValue(source = {}, ...keys) {
  if (!source || typeof source !== "object")
    return void 0;
  for (const key of keys) {
    const value = source[key];
    if (value !== void 0 && value !== null && value !== "")
      return value;
  }
  return void 0;
}
function firstObject(source = {}, ...keys) {
  for (const key of keys) {
    const value = firstValue(source, key);
    if (value && typeof value === "object" && !Array.isArray(value))
      return value;
  }
  return {};
}
function pickReplaySimList(payload) {
  if (Array.isArray(payload))
    return payload;
  if (!payload || typeof payload !== "object")
    return [];
  const directKeys = [
    "list",
    "records",
    "rows",
    "items",
    "messages",
    "simMessages",
    "sim_messages",
    "orderList",
    "order_list",
    "orders"
  ];
  for (const key of directKeys) {
    const value = payload[key];
    if (Array.isArray(value))
      return value;
  }
  if (payload.data && payload.data !== payload)
    return pickReplaySimList(payload.data);
  if (payload.result && payload.result !== payload)
    return pickReplaySimList(payload.result);
  return [];
}
function toSeconds(value, fallback = NaN) {
  if (value === void 0 || value === null || value === "")
    return fallback;
  if (typeof value === "string" && value.includes(":")) {
    const parts = value.split(":").map((part) => Number(part));
    if (parts.every((part) => Number.isFinite(part))) {
      return parts.reduce((total, part) => total * 60 + part, 0);
    }
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function toPositiveInt(value, fallback = 1) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
function normalizeReplaySimOrder(raw = {}) {
  const payload = raw && typeof raw === "object" ? raw : {};
  const product = firstObject(payload, "product", "goods", "goodsInfo", "goods_info", "productInfo", "product_info");
  const customer = firstObject(payload, "customer", "user", "buyer", "viewer");
  const triggerAtSec = toSeconds(firstValue(
    payload,
    "triggerAtSec",
    "trigger_at_sec",
    "triggerSecond",
    "trigger_second",
    "triggerSeconds",
    "trigger_seconds",
    "timelineSeconds",
    "timeline_seconds",
    "playSeconds",
    "play_seconds",
    "playTime",
    "play_time",
    "showAtSec",
    "show_at_sec",
    "offsetSec",
    "offset_sec",
    "second",
    "seconds",
    "time"
  ));
  if (!Number.isFinite(triggerAtSec))
    return null;
  const productId = Number(firstValue(
    payload,
    "productId",
    "product_id",
    "goodsId",
    "goods_id",
    "skuProductId",
    "sku_product_id"
  ) || firstValue(product, "id", "productId", "product_id", "goodsId", "goods_id") || 0);
  const quantity = toPositiveInt(firstValue(
    payload,
    "quantity",
    "qty",
    "num",
    "count",
    "buyCount",
    "buy_count",
    "productNum",
    "product_num",
    "goodsNum",
    "goods_num"
  ), 1);
  const customerName = String(firstValue(
    payload,
    "customerName",
    "customer_name",
    "nickname",
    "nick",
    "userName",
    "user_name",
    "buyerName",
    "buyer_name"
  ) || firstValue(customer, "customerName", "customer_name", "nickname", "nick", "name", "userName", "user_name") || "观众");
  const productName = String(firstValue(
    payload,
    "productName",
    "product_name",
    "goodsName",
    "goods_name",
    "title"
  ) || firstValue(product, "name", "title", "productName", "product_name", "goodsName", "goods_name") || "");
  const productImage = String(firstValue(
    payload,
    "productImage",
    "product_image",
    "goodsPic",
    "goods_pic",
    "goodsImage",
    "goods_image",
    "image",
    "img",
    "pic",
    "cover",
    "thumb"
  ) || firstValue(product, "image", "img", "pic", "cover", "thumb", "productImage", "product_image", "goodsPic", "goods_pic") || "");
  const noticeText = String(firstValue(
    payload,
    "noticeText",
    "notice_text",
    "actionText",
    "action_text",
    "text",
    "content"
  ) || "");
  return {
    ...payload,
    triggerAtSec,
    productId,
    quantity,
    customerName,
    productName,
    productImage,
    noticeText
  };
}
function normalizeReplaySimMessages(payload) {
  return pickReplaySimList(payload).map(normalizeReplaySimOrder).filter(Boolean).sort((a, b) => a.triggerAtSec - b.triggerAtSec);
}
function alignDownToWindow(sec) {
  const n = Math.max(0, Math.floor(Number(sec) || 0));
  return Math.floor(n / WINDOW_SIZE) * WINDOW_SIZE;
}
function useReplaySimOrders() {
  const simTimeline = common_vendor.ref([]);
  const simCursor = common_vendor.ref(0);
  let _videoId = 0;
  let _loadedEndSec = 0;
  let _loading = false;
  const loadSimMessages = async (videoId, startFromSec = 0) => {
    _videoId = videoId;
    simTimeline.value = [];
    simCursor.value = 0;
    _loadedEndSec = 0;
    _loading = false;
    if (!videoId)
      return;
    await _loadWindow(alignDownToWindow(startFromSec));
  };
  const resetSimMessages = () => {
    _videoId = 0;
    simTimeline.value = [];
    simCursor.value = 0;
    _loadedEndSec = 0;
    _loading = false;
  };
  const consumeSimOrders = (currentSeconds) => {
    if (_videoId && !_loading && _loadedEndSec > 0 && currentSeconds >= _loadedEndSec - PRELOAD_LEAD_SEC) {
      _loadWindow(_loadedEndSec);
    }
    const pending = [];
    while (simCursor.value < simTimeline.value.length) {
      const item = simTimeline.value[simCursor.value];
      if (item.triggerAtSec > currentSeconds)
        break;
      pending.push(item);
      simCursor.value++;
    }
    return pending;
  };
  const syncSimCursor = (currentSeconds) => {
    if (simTimeline.value.length > 0 && currentSeconds < simTimeline.value[0].triggerAtSec) {
      simTimeline.value = [];
      simCursor.value = 0;
      _loadedEndSec = 0;
      if (_videoId) {
        _loadWindow(alignDownToWindow(currentSeconds));
      }
      return;
    }
    const timeline = simTimeline.value;
    let lo = 0;
    let hi = timeline.length;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (timeline[mid].triggerAtSec <= currentSeconds) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    simCursor.value = lo;
  };
  const _loadWindow = async (startSec) => {
    if (_loading)
      return;
    _loading = true;
    const alignedStart = alignDownToWindow(startSec);
    const endSec = alignedStart + WINDOW_SIZE;
    try {
      const data = normalizeReplaySimMessages(await api_live.getReplaySimMessages(_videoId, alignedStart, endSec));
      if (Array.isArray(data) && data.length > 0) {
        simTimeline.value = simTimeline.value.concat(data);
      }
      _loadedEndSec = endSec;
    } catch (e) {
      console.error("[useReplaySimOrders] 加载模拟消息失败:", e);
    } finally {
      _loading = false;
    }
  };
  return {
    simTimeline,
    simCursor,
    loadSimMessages,
    resetSimMessages,
    consumeSimOrders,
    syncSimCursor
  };
}
exports.useReplaySimOrders = useReplaySimOrders;
