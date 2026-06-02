"use strict";
const api_h5 = require("./h5.js");
function getSkuStock(skuId) {
  return api_h5.h5Get("/h5/live/skuStock", { skuId: Number(skuId || 0) });
}
exports.getSkuStock = getSkuStock;
