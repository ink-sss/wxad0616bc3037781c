import { createPayment, hasRequestPaymentParams, normalizeRequestPaymentParams } from "@/api/pay";
import { requestPayment } from "@/platform/weixin/payment";

export async function createMiniProgramPayment(orderNo, extra = {}) {
  const payRes = await createPayment({
    orderNo,
    tradeType: "JSAPI",
    channelType: extra.channelType || 4,
    ...extra,
  });
  const params = normalizeRequestPaymentParams(payRes);
  if (!hasRequestPaymentParams(params)) {
    throw new Error("支付参数缺失，无法发起小程序支付");
  }
  return params;
}

export async function executeYeepayPayment(orderNo, extra = {}) {
  const params = await createMiniProgramPayment(orderNo, extra);
  await requestPayment(params);
  return "jsapi";
}
