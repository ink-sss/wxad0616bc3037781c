export function isPaymentCancelError(err = {}) {
  const text = [
    err?.message,
    err?.errMsg,
    err?.err_msg,
    err?.code,
  ].filter(Boolean).join(" ");
  return /用户取消支付|requestPayment:fail cancel|requestPayment:fail.*cancel|pay.*cancel|cancel payment/i.test(text);
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
}) {
  if (!orderNo || !isPaymentCancelError(err)) return false;
  uniApi.navigateTo({ url: buildPendingOrderListUrl(roomCode) });
  uniApi.showToast({ title: "用户取消支付", icon: "none" });
  return true;
}
