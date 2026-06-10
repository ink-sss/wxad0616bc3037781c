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

export function handleCreatedOrderPaymentCancel({
  err,
  orderNo,
  roomCode,
  uniApi = uni,
  navigationMethod = "navigateTo",
}) {
  if (!orderNo || !isPaymentCancelError(err)) return false;
  const url = buildPendingOrderListUrl(roomCode);
  const navigate = typeof uniApi?.[navigationMethod] === "function"
    ? uniApi[navigationMethod].bind(uniApi)
    : uniApi.navigateTo.bind(uniApi);
  navigate({
    url,
    fail() {
      if (navigationMethod === "redirectTo" && typeof uniApi.navigateTo === "function") {
        uniApi.navigateTo({ url });
      }
    },
  });
  uniApi.showToast({ title: "用户取消支付", icon: "none" });
  return true;
}
