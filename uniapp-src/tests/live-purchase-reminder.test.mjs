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
    .replace('import { getProductDetail } from "@/api/product.js";', "const getProductDetail = async () => null;");
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
