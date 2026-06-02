"use strict";
const api_h5 = require("./h5.js");
function createPayment(data = {}) {
  return api_h5.h5Post("/h5/pay/create", data);
}
function normalizeRequestPaymentParams(data = {}) {
  const source = data.payment || data.payParams || data.wxPay || data.jsapi || data;
  return {
    timeStamp: String(source.timeStamp || source.timestamp || source.time_stamp || ""),
    nonceStr: source.nonceStr || source.nonce_str || "",
    package: source.package || source.packageValue || source.package_value || source.prepayPackage || "",
    signType: source.signType || source.sign_type || "RSA",
    paySign: source.paySign || source.pay_sign || source.sign || ""
  };
}
function hasRequestPaymentParams(params = {}) {
  return !!(params.timeStamp && params.nonceStr && params.package && params.paySign);
}
exports.createPayment = createPayment;
exports.hasRequestPaymentParams = hasRequestPaymentParams;
exports.normalizeRequestPaymentParams = normalizeRequestPaymentParams;
