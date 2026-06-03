"use strict";
const common_vendor = require("../common/vendor.js");
const BUY_CONTEXT_KEY = "h5_live_buy_context";
function saveBuyContext(context = {}) {
  try {
    common_vendor.index.setStorageSync(BUY_CONTEXT_KEY, {
      ...context,
      updatedAt: Date.now()
    });
  } catch (error) {
  }
}
function loadBuyContext() {
  try {
    return common_vendor.index.getStorageSync(BUY_CONTEXT_KEY) || null;
  } catch (error) {
    return null;
  }
}
function clearBuyContext() {
  try {
    common_vendor.index.removeStorageSync(BUY_CONTEXT_KEY);
  } catch (error) {
  }
}
exports.clearBuyContext = clearBuyContext;
exports.loadBuyContext = loadBuyContext;
exports.saveBuyContext = saveBuyContext;
