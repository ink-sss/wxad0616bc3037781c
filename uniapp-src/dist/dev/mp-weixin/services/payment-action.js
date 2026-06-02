"use strict";
const api_pay = require("../api/pay.js");
const platform_weixin_payment = require("../platform/weixin/payment.js");
async function createMiniProgramPayment(orderNo, extra = {}) {
  const payRes = await api_pay.createPayment({
    orderNo,
    tradeType: "JSAPI",
    channelType: extra.channelType || 4,
    ...extra
  });
  const params = api_pay.normalizeRequestPaymentParams(payRes);
  if (!api_pay.hasRequestPaymentParams(params)) {
    throw new Error("支付参数缺失，无法发起小程序支付");
  }
  return params;
}
async function executeYeepayPayment(orderNo, extra = {}) {
  const params = await createMiniProgramPayment(orderNo, extra);
  await platform_weixin_payment.requestPayment(params);
  return "jsapi";
}
exports.executeYeepayPayment = executeYeepayPayment;
