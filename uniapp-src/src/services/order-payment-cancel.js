import { getWeixinApi } from "@/platform/weixin/runtime.js";

export function isPaymentCancelError(err = {}) {
  const text = [
    err?.message,
    err?.errMsg,
    err?.err_msg,
    err?.code,
  ].filter(Boolean).join(" ");
  return /用户取消支付|支付取消|requestPayment:fail.*(cancel|取消)|get_brand_wcpay_request:cancel|pay.*(cancel|取消)|cancel(?:led)? payment|user[_\s-]?cancel/i.test(text);
}

export function buildPendingOrderListUrl(roomCodeValue) {
  const code = String(roomCodeValue || "").trim();
  return `/pages/order/list?status=unpay${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`;
}

function resolvePaymentCancelApi(explicitApi) {
  return explicitApi || getWeixinApi("navigateTo", { preferUni: true }) || getWeixinApi("showToast", { preferUni: true });
}

export function handleCreatedOrderPaymentCancel({
  err,
  orderNo,
  roomCode,
  uniApi,
  navigationMethod = "navigateTo",
}) {
  if (!orderNo || !isPaymentCancelError(err)) return false;
  const runtimeApi = resolvePaymentCancelApi(uniApi);
  if (!runtimeApi) return false;
  const url = buildPendingOrderListUrl(roomCode);
  const navigate = typeof runtimeApi?.[navigationMethod] === "function"
    ? runtimeApi[navigationMethod].bind(runtimeApi)
    : typeof runtimeApi?.navigateTo === "function"
      ? runtimeApi.navigateTo.bind(runtimeApi)
      : null;
  if (navigate) {
    navigate({
      url,
      fail() {
        if (navigationMethod === "redirectTo" && typeof runtimeApi.navigateTo === "function") {
          runtimeApi.navigateTo({ url });
        }
      },
    });
  }
  if (typeof runtimeApi.showToast === "function") {
    runtimeApi.showToast({ title: "用户取消支付", icon: "none" });
  }
  return true;
}
