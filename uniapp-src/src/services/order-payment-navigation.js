export const ORDER_PAYMENT_SUCCESS_EVENT = "order-payment-success";

let lastSuccessNavigation = {
  keys: [],
  time: 0,
};

function cleanValue(value) {
  return String(value ?? "").trim();
}

function appendQuery(query, key, value) {
  const text = cleanValue(value);
  if (!text) return;
  query.push(`${key}=${encodeURIComponent(text)}`);
}

function getPaymentSuccessKeys(payload = {}) {
  return [
    cleanValue(payload.orderId || payload.id),
    cleanValue(payload.orderNo || payload.order_no),
  ].filter(Boolean);
}

function shouldSkipDuplicateNavigation(payload = {}) {
  const keys = getPaymentSuccessKeys(payload);
  if (!keys.length) return false;
  const now = Date.now();
  if (
    now - lastSuccessNavigation.time < 3000 &&
    keys.some((key) => lastSuccessNavigation.keys.includes(key))
  ) {
    return true;
  }
  lastSuccessNavigation = { keys, time: now };
  return false;
}

export function buildOrderDetailUrl(payload = {}) {
  const query = [];
  appendQuery(query, "id", payload.orderId || payload.id);
  appendQuery(query, "orderNo", payload.orderNo || payload.order_no);
  appendQuery(query, "status", payload.status);
  appendQuery(query, "roomCode", payload.roomCode || payload.room_code);
  return `/pages/order/detail${query.length ? `?${query.join("&")}` : ""}`;
}

export function emitOrderPaymentSuccess(payload = {}) {
  uni.$emit(ORDER_PAYMENT_SUCCESS_EVENT, {
    ...payload,
    orderId: payload.orderId || payload.id || 0,
  });
}

export function navigatePaymentSuccessOrderDetail(payload = {}, options = {}) {
  if (shouldSkipDuplicateNavigation(payload)) return;

  const url = buildOrderDetailUrl({
    status: "unsend",
    ...payload,
  });
  const delay = Number(options.delay || 0);
  const replace = Boolean(options.replace);
  const returnTo = cleanValue(options.returnTo || payload.returnTo);

  emitOrderPaymentSuccess(payload);

  const run = () => {
    if (returnTo === "detail") {
      const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1,
          fail() {
            uni.redirectTo({ url });
          },
        });
        return;
      }
      uni.redirectTo({ url });
      return;
    }

    const method = replace ? "redirectTo" : "navigateTo";
    uni[method]({
      url,
      fail() {
        uni.redirectTo({
          url,
          fail() {
            uni.reLaunch({ url });
          },
        });
      },
    });
  };

  if (delay > 0) {
    setTimeout(run, delay);
    return;
  }
  run();
}
