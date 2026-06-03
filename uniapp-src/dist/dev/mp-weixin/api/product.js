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
function withProductContextAliases(data = {}) {
  const payload = { ...data };
  const aliasMap = {
    productId: ["product_id", "goodsId", "goods_id"],
    roomId: ["room_id", "liveId", "live_id", "liveRoomId", "live_room_id"],
    termId: ["term_id", "liveTermId", "live_term_id"],
    skuId: ["sku_id", "productSkuId", "product_sku_id", "specSkuId", "spec_sku_id"],
    tenantId: ["tenant_id"],
    roomCode: ["room_code"],
    shareCode: ["share_code"],
    bindId: ["bind_id"],
    liveType: ["live_type"],
    customerId: ["customer_id", "userId", "user_id"],
    videoId: ["video_id", "replayVideoId", "replay_video_id"]
  };
  Object.entries(aliasMap).forEach(([canonicalKey, keys]) => {
    const value = firstValue(payload, canonicalKey, ...keys);
    if (value === void 0)
      return;
    payload[canonicalKey] = value;
    keys.forEach((key) => {
      payload[key] = value;
    });
  });
  [
    "productId",
    "product_id",
    "goodsId",
    "goods_id",
    "roomId",
    "room_id",
    "liveId",
    "live_id",
    "liveRoomId",
    "live_room_id",
    "termId",
    "term_id",
    "liveTermId",
    "live_term_id",
    "skuId",
    "sku_id",
    "productSkuId",
    "product_sku_id",
    "specSkuId",
    "spec_sku_id",
    "tenantId",
    "tenant_id",
    "customerId",
    "customer_id",
    "userId",
    "user_id",
    "videoId",
    "video_id",
    "replayVideoId",
    "replay_video_id"
  ].forEach((key) => {
    if (payload[key] !== void 0)
      payload[key] = toNumberLike(payload[key]);
  });
  if (payload.liveRoomId === void 0 && payload.roomId !== void 0)
    payload.liveRoomId = payload.roomId;
  if (payload.live_room_id === void 0 && payload.room_id !== void 0)
    payload.live_room_id = payload.room_id;
  if (payload.liveTermId === void 0 && payload.termId !== void 0)
    payload.liveTermId = payload.termId;
  if (payload.live_term_id === void 0 && payload.term_id !== void 0)
    payload.live_term_id = payload.term_id;
  if (payload.userId === void 0 && payload.customerId !== void 0)
    payload.userId = payload.customerId;
  if (payload.user_id === void 0 && payload.customer_id !== void 0)
    payload.user_id = payload.customer_id;
  if (payload.customerId === void 0 && payload.userId !== void 0)
    payload.customerId = payload.userId;
  if (payload.customer_id === void 0 && payload.user_id !== void 0)
    payload.customer_id = payload.user_id;
  if (payload.replayVideoId === void 0 && payload.videoId !== void 0)
    payload.replayVideoId = payload.videoId;
  if (payload.replay_video_id === void 0 && payload.video_id !== void 0)
    payload.replay_video_id = payload.video_id;
  if (payload.videoId === void 0 && payload.replayVideoId !== void 0)
    payload.videoId = payload.replayVideoId;
  if (payload.video_id === void 0 && payload.replay_video_id !== void 0)
    payload.video_id = payload.replay_video_id;
  return payload;
}
function getProductDetail(productId, roomId, context = {}) {
  const isObjectParam = productId && typeof productId === "object";
  const meta = isObjectParam ? productId : context;
  const data = withProductContextAliases({
    ...meta,
    productId: firstValue(meta, "productId", "product_id", "goodsId", "goods_id") || (isObjectParam ? 0 : productId) || 0,
    roomId: firstValue(meta, "roomId", "room_id", "liveId", "live_id", "liveRoomId", "live_room_id") || roomId || 0
  });
  return api_h5.h5Get("/h5/live/productDetail", data);
}
function getSkuStock(skuId) {
  return api_h5.h5Get("/h5/live/skuStock", { skuId: Number(skuId || 0) });
}
exports.getProductDetail = getProductDetail;
exports.getSkuStock = getSkuStock;
