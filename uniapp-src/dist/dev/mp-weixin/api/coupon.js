"use strict";
const api_h5 = require("./h5.js");
function getUsableCoupons(data = {}) {
  return api_h5.h5Post("/h5/coupon/usableList", data);
}
exports.getUsableCoupons = getUsableCoupons;
