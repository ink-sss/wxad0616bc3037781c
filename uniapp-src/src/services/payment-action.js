import { createPayment, getPayResult, hasRequestPaymentParams, normalizeRequestPaymentParams } from "@/api/pay";
import { getMiniProgramAppId, getStoredMiniProgramOpenId } from "@/api/miniprogram-login";
import { requestPayment } from "@/platform/weixin/payment";

const DEFAULT_CHANNEL_TYPE = 4;
const DEFAULT_POLL_INTERVAL = 1000;
const DEFAULT_POLL_ATTEMPTS = 15;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizePayStatus(result = {}) {
  const status = result.payStatus ?? result.pay_status ?? result.status ?? result.paymentStatus ?? result.payment_status;
  return Number(status || 0);
}

export function resolveMiniProgramPaymentIdentity(extra = {}) {
  const appId = extra.appId || extra.app_id || getMiniProgramAppId();
  const openId = extra.openId || extra.open_id || extra.openid || getStoredMiniProgramOpenId();
  if (!appId) {
    throw new Error("缺少小程序 AppID，无法发起支付");
  }
  if (!openId) {
    throw new Error("缺少小程序 open_id，请重新登录后再支付");
  }
  return { appId, openId };
}

export async function createMiniProgramPayment(orderNo, extra = {}) {
  if (!orderNo) throw new Error("缺少订单号，无法发起支付");
  const identity = resolveMiniProgramPaymentIdentity(extra);
  const payRes = await createPayment({
    orderNo,
    channelType: extra.channelType || DEFAULT_CHANNEL_TYPE,
    ...extra,
    tradeType: "mini_program",
    channelType: extra.channelType || DEFAULT_CHANNEL_TYPE,
    appId: identity.appId,
    openId: identity.openId,
  });
  const params = normalizeRequestPaymentParams(payRes);
  if (!hasRequestPaymentParams(params)) {
    throw new Error("支付参数缺失，无法发起小程序支付");
  }
  return { params, payRes, identity };
}

export async function waitMiniProgramPayResult(orderNo, options = {}) {
  const attempts = Number(options.pollAttempts || options.attempts || DEFAULT_POLL_ATTEMPTS);
  const interval = Number(options.pollInterval || options.interval || DEFAULT_POLL_INTERVAL);
  let lastResult = null;

  for (let i = 0; i < attempts; i += 1) {
    if (i > 0) await sleep(interval);
    lastResult = await getPayResult(orderNo);
    if (normalizePayStatus(lastResult) === 1) {
      return {
        confirmed: true,
        orderNo,
        result: lastResult,
      };
    }
  }

  const error = new Error("支付处理中，请稍后在订单列表查看支付状态");
  error.code = "PAY_RESULT_PENDING";
  error.orderNo = orderNo;
  error.result = lastResult;
  throw error;
}

export async function executeYeepayPayment(orderNo, extra = {}) {
  const { params, payRes, identity } = await createMiniProgramPayment(orderNo, extra);
  await requestPayment(params);
  const confirmation = await waitMiniProgramPayResult(orderNo, extra);
  return {
    mode: "mini_program",
    payMode: "mini_program",
    legacyMode: "jsapi",
    confirmed: true,
    orderNo,
    params,
    payRes,
    identity,
    result: confirmation.result,
  };
}
