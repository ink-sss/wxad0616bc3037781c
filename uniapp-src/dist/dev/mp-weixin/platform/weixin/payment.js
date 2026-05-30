"use strict";
const platform_weixin_runtime = require("./runtime.js");
function canRequestMerchantTransfer() {
  return platform_weixin_runtime.canIUse("requestMerchantTransfer");
}
function requestMerchantTransfer(params = {}) {
  if (!canRequestMerchantTransfer()) {
    return Promise.reject(platform_weixin_runtime.unsupportedError("requestMerchantTransfer"));
  }
  return platform_weixin_runtime.promisifyApi("requestMerchantTransfer", params);
}
exports.requestMerchantTransfer = requestMerchantTransfer;
