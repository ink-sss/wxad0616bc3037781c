import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadLivePurchaseModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "live-purchase-"));
  const sourcePath = join(root, "src/pages/broadcast/composables/useLivePurchase.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace('import { computed, ref } from "vue";', `
const ref = (value) => ({ value });
const computed = (getter) => ({ get value() { return getter(); } });
`)
    .replace('import { getProductDetail } from "@/api/product.js";', "const getProductDetail = async () => null;")
    .replace('import { navigatePaymentSuccessOrderDetail } from "@/services/order-payment-navigation";', "const navigatePaymentSuccessOrderDetail = () => {};")
    .replace('import { handleCreatedOrderPaymentCancel } from "@/services/order-payment-cancel.js";', `
function isPaymentCancelError(err = {}) {
  const text = [err?.message, err?.errMsg, err?.err_msg, err?.code].filter(Boolean).join(" ");
  return /用户取消支付|requestPayment:fail cancel|requestPayment:fail.*cancel|pay.*cancel|cancel payment/i.test(text);
}
function buildPendingOrderListUrl(roomCodeValue) {
  const code = String(roomCodeValue || "").trim();
  return \`/pages/order/list?status=unpay\${code ? \`&roomCode=\${encodeURIComponent(code)}\` : ""}\`;
}
function handleCreatedOrderPaymentCancel({ err, orderNo, roomCode, uniApi }) {
  if (!orderNo || !isPaymentCancelError(err)) return false;
  uniApi.navigateTo({ url: buildPendingOrderListUrl(roomCode) });
  uniApi.showToast({ title: "用户取消支付", icon: "none" });
  return true;
}
`)
    .replace('import { getWeixinApi } from "@/platform/weixin/runtime.js";', "const getWeixinApi = () => null;");
  const modulePath = join(tempDir, "useLivePurchase.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

test("live buy reminder keeps the H5 payload shape", async () => {
  const { useLivePurchase } = await loadLivePurchaseModule();
  const reminderCalls = [];
  const state = useLivePurchase({
    liveId: { value: 77 },
    roomCode: { value: "room-code" },
    liveTenantId: { value: 12 },
    shareCode: { value: "share-code" },
    liveBindId: { value: 5 },
    isReplay: { value: false },
    replayCurrentVideoId: { value: 0 },
    showProductList: { value: true },
    getLiveRedirectUrl: () => "/pages/broadcast/entry?roomCode=room-code",
    getEffectiveTermId: () => 99,
    isDebugLocalLogin: () => false,
    getAddressList: async () => [],
    deleteAddress: async () => {},
    confirmOrder: async () => ({}),
    createOrder: async () => ({}),
    getUsableCoupons: async () => ({ usable: [], unusable: [] }),
    executeYeepayPayment: async () => ({}),
    importWxAddress: async () => {},
    saveBuyContext: () => {},
    loadBuyContext: () => null,
    clearBuyContext: () => {},
    onOrderCreated: () => {},
    sendBuyReminder: async (...args) => {
      reminderCalls.push(args);
    },
    roomSetting: { value: { buyReminder: 1 } },
    roomGroupType: { value: 0 },
    mode: { value: "portrait" },
    userStore: {
      token: "token",
      userInfo: {
        id: 100,
        customerId: 100,
      },
    },
    uniApi: {
      navigateTo() {},
      showToast() {},
    },
    logger: {
      log() {},
      warn() {},
      error() {},
    },
  });

  await state.onProductBuy({
    item: {
      id: 802,
      skuId: 33,
      title: "商品",
      image: "https://example.test/product.png",
      price: "19.90",
    },
  });

  assert.deepEqual(reminderCalls, [[{ roomId: 77, productId: 802 }]]);
});

test("live purchase payment cancel opens pending order list", async () => {
  const { useLivePurchase } = await loadLivePurchaseModule();
  const navigations = [];
  const toasts = [];
  const pendingOrderChanges = [];
  const state = useLivePurchase({
    liveId: { value: 77 },
    roomCode: { value: "room-code" },
    liveTenantId: { value: 12 },
    shareCode: { value: "" },
    liveBindId: { value: 5 },
    isReplay: { value: false },
    replayCurrentVideoId: { value: 0 },
    showProductList: { value: false },
    getLiveRedirectUrl: () => "/pages/broadcast/entry?roomCode=room-code",
    getEffectiveTermId: () => 99,
    isDebugLocalLogin: () => false,
    getAddressList: async () => [],
    deleteAddress: async () => {},
    confirmOrder: async () => ({}),
    createOrder: async () => ({ orderNo: "NO1", orderId: 77 }),
    getUsableCoupons: async () => ({ usable: [], unusable: [] }),
    executeYeepayPayment: async () => {
      const err = new Error("用户取消支付");
      err.errMsg = "requestPayment:fail cancel";
      throw err;
    },
    importWxAddress: async () => {},
    saveBuyContext: () => {},
    loadBuyContext: () => null,
    clearBuyContext: () => {},
    onOrderCreated: () => {},
    onPendingOrderChanged: (payload) => {
      pendingOrderChanges.push(payload);
    },
    sendBuyReminder: async () => {},
    roomSetting: { value: { buyReminder: 1 } },
    roomGroupType: { value: 0 },
    mode: { value: "portrait" },
    userStore: { token: "token", userInfo: { id: 100 } },
    uniApi: {
      navigateTo(payload) {
        navigations.push(payload);
      },
      showToast(payload) {
        toasts.push(payload);
      },
    },
    logger: {
      log() {},
      warn() {},
      error() {},
    },
  });

  await state.onBuyConfirm({
    product: { id: 802, tenantId: 12, requireAddress: 2 },
    quantity: 1,
    skuId: 0,
  });

  assert.deepEqual(navigations, [
    { url: "/pages/order/list?status=unpay&roomCode=room-code" },
  ]);
  assert.deepEqual(pendingOrderChanges, [
    { orderRes: { orderNo: "NO1", orderId: 77 }, orderId: 77, orderNo: "NO1" },
  ]);
  assert.equal(toasts.some((item) => item.title === "下单失败"), false);
  assert.equal(toasts.at(-1)?.title, "用户取消支付");
});

test("live purchase create order failure keeps original error toast", async () => {
  const { useLivePurchase } = await loadLivePurchaseModule();
  const navigations = [];
  const toasts = [];
  const state = useLivePurchase({
    liveId: { value: 77 },
    roomCode: { value: "room-code" },
    liveTenantId: { value: 12 },
    shareCode: { value: "" },
    liveBindId: { value: 5 },
    isReplay: { value: false },
    replayCurrentVideoId: { value: 0 },
    showProductList: { value: false },
    getLiveRedirectUrl: () => "/pages/broadcast/entry?roomCode=room-code",
    getEffectiveTermId: () => 99,
    isDebugLocalLogin: () => false,
    getAddressList: async () => [],
    deleteAddress: async () => {},
    confirmOrder: async () => ({}),
    createOrder: async () => {
      throw new Error("库存不足");
    },
    getUsableCoupons: async () => ({ usable: [], unusable: [] }),
    executeYeepayPayment: async () => ({}),
    importWxAddress: async () => {},
    saveBuyContext: () => {},
    loadBuyContext: () => null,
    clearBuyContext: () => {},
    onOrderCreated: () => {},
    sendBuyReminder: async () => {},
    roomSetting: { value: { buyReminder: 1 } },
    roomGroupType: { value: 0 },
    mode: { value: "portrait" },
    userStore: { token: "token", userInfo: { id: 100 } },
    uniApi: {
      navigateTo(payload) {
        navigations.push(payload);
      },
      showToast(payload) {
        toasts.push(payload);
      },
    },
    logger: {
      log() {},
      warn() {},
      error() {},
    },
  });

  await state.onBuyConfirm({
    product: { id: 802, tenantId: 12, requireAddress: 2 },
    quantity: 1,
    skuId: 0,
  });

  assert.deepEqual(navigations, []);
  assert.equal(toasts.at(-1)?.title, "库存不足");
});
