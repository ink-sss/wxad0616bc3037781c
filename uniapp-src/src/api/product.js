import { h5Get, h5Post } from "./h5.js";

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function toNumberLike(value) {
  if (value === undefined || value === null || value === "") return undefined;
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
	    videoId: ["video_id", "replayVideoId", "replay_video_id"],
	  };
  Object.entries(aliasMap).forEach(([canonicalKey, keys]) => {
    const value = firstValue(payload, canonicalKey, ...keys);
    if (value === undefined) return;
    payload[canonicalKey] = value;
    keys.forEach((key) => {
      payload[key] = value;
    });
  });
  [
    "productId", "product_id", "goodsId", "goods_id",
    "roomId", "room_id", "liveId", "live_id", "liveRoomId", "live_room_id",
    "termId", "term_id", "liveTermId", "live_term_id",
	    "skuId", "sku_id", "productSkuId", "product_sku_id", "specSkuId", "spec_sku_id",
	    "tenantId", "tenant_id",
	    "customerId", "customer_id", "userId", "user_id",
	    "videoId", "video_id", "replayVideoId", "replay_video_id",
	  ].forEach((key) => {
	    if (payload[key] !== undefined) payload[key] = toNumberLike(payload[key]);
	  });
  if (payload.liveRoomId === undefined && payload.roomId !== undefined) payload.liveRoomId = payload.roomId;
  if (payload.live_room_id === undefined && payload.room_id !== undefined) payload.live_room_id = payload.room_id;
	  if (payload.liveTermId === undefined && payload.termId !== undefined) payload.liveTermId = payload.termId;
	  if (payload.live_term_id === undefined && payload.term_id !== undefined) payload.live_term_id = payload.term_id;
	  if (payload.userId === undefined && payload.customerId !== undefined) payload.userId = payload.customerId;
	  if (payload.user_id === undefined && payload.customer_id !== undefined) payload.user_id = payload.customer_id;
	  if (payload.customerId === undefined && payload.userId !== undefined) payload.customerId = payload.userId;
	  if (payload.customer_id === undefined && payload.user_id !== undefined) payload.customer_id = payload.user_id;
	  if (payload.replayVideoId === undefined && payload.videoId !== undefined) payload.replayVideoId = payload.videoId;
	  if (payload.replay_video_id === undefined && payload.video_id !== undefined) payload.replay_video_id = payload.video_id;
	  if (payload.videoId === undefined && payload.replayVideoId !== undefined) payload.videoId = payload.replayVideoId;
	  if (payload.video_id === undefined && payload.replay_video_id !== undefined) payload.video_id = payload.replay_video_id;
	  return payload;
	}

export function getProductDetail(productId, roomId, context = {}) {
  const isObjectParam = productId && typeof productId === "object";
  const meta = isObjectParam ? productId : context;
  const data = withProductContextAliases({
    ...meta,
    productId: firstValue(meta, "productId", "product_id", "goodsId", "goods_id") || (isObjectParam ? 0 : productId) || 0,
    roomId: firstValue(meta, "roomId", "room_id", "liveId", "live_id", "liveRoomId", "live_room_id") || roomId || 0,
  });
  return h5Get("/h5/live/productDetail", data);
}

export function getSkuStock(skuId) {
  return h5Get("/h5/live/skuStock", { skuId: Number(skuId || 0) });
}

export function calcShippingFee(data = {}) {
  return h5Post("/h5/express/calcFee", data);
}
