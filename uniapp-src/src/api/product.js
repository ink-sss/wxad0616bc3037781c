import { h5Get, h5Post } from "./h5.js";

export function getProductDetail(productId, roomId) {
  const data = { productId: Number(productId || 0) };
  if (roomId) data.roomId = Number(roomId);
  return h5Get("/h5/live/productDetail", data);
}

export function getSkuStock(skuId) {
  return h5Get("/h5/live/skuStock", { skuId: Number(skuId || 0) });
}

export function calcShippingFee(data = {}) {
  return h5Post("/h5/express/calcFee", data);
}
