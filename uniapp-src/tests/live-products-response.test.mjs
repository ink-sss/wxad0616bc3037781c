import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadLiveProductsModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "live-products-"));
  const sourcePath = join(root, "src/pages/broadcast/composables/useLiveProducts.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace('import { computed, ref } from "vue";', `
const ref = (value) => ({ value });
const computed = (getter) => ({ get value() { return getter(); } });
`)
    .replace(
      'import { normalizeScheduleNodes } from "../useReplayProductSchedule.js";',
      "const normalizeScheduleNodes = () => [];",
    );
  const modulePath = join(tempDir, "useLiveProducts.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

test("live product list reads nested H5 response payloads", async () => {
  const { useLiveProducts } = await loadLiveProductsModule();
  const liveId = { value: 1001 };
  const showProduct = { value: false };
  const productCalls = [];
  const state = useLiveProducts({
    liveId,
    showProduct,
    isReplay: { value: false },
    replayCurrentVideoId: { value: 0 },
    roomCode: { value: "room-a" },
    liveTenantId: { value: 12 },
    shareCode: { value: "" },
    liveBindId: { value: 0 },
    myUserId: { value: 34 },
    getEffectiveTermId: () => 56,
    getCurrentProduct: async () => ({}),
    getLiveProducts: async (...args) => {
      productCalls.push(args);
      return {
        data: {
          data: {
            records: [
              {
                product_id: 801,
                product_name: "深层商品",
                product_image: "https://example.test/product.png",
                product_price: "19.9",
                product_stock: 8,
              },
            ],
            total: 1,
          },
        },
      };
    },
  });

  await state.loadProductList(true);

  assert.deepEqual(productCalls, [[1001, 1, 20]]);
  assert.equal(state.productTotal.value, 1);
  assert.equal(state.productList.value.length, 1);
  assert.equal(state.productList.value[0].id, 801);
  assert.equal(state.productList.value[0].title, "深层商品");
  assert.equal(state.productList.value[0].price, "19.90");
  assert.equal(state.productFinished.value, true);
});

test("live current product keeps the H5 argument shape", async () => {
  const { useLiveProducts } = await loadLiveProductsModule();
  const currentProductCalls = [];
  const showProduct = { value: false };
  const state = useLiveProducts({
    liveId: { value: 1002 },
    showProduct,
    isReplay: { value: false },
    replayCurrentVideoId: { value: 0 },
    getLiveProducts: async () => ({}),
    getCurrentProduct: async (...args) => {
      currentProductCalls.push(args);
      return [{ id: 901, name: "当前讲解", salePrice: 9.9, stock: 2 }];
    },
  });

  await state.loadCurrentProduct();

  assert.deepEqual(currentProductCalls, [[1002]]);
  assert.equal(showProduct.value, true);
  assert.equal(state.currentProduct.value.id, 901);
});

test("repeated current product refresh keeps card state references stable", async () => {
  const { useLiveProducts } = await loadLiveProductsModule();
  const showProduct = { value: false };
  const state = useLiveProducts({
    liveId: { value: 1003 },
    showProduct,
    isReplay: { value: false },
    replayCurrentVideoId: { value: 0 },
    getLiveProducts: async () => ({}),
    getCurrentProduct: async () => [
      { id: 901, name: "当前讲解", salePrice: 9.9, stock: 8 },
    ],
  });

  state.productList.value = [
    { id: 900, productId: 900, title: "其他商品", isCurrent: false },
    { id: 901, productId: 901, title: "旧标题", stock: 3, isCurrent: true },
  ];
  state.productCardActiveIndex.value = 1;

  await state.loadCurrentProduct();
  const productListRef = state.productList.value;
  const currentItemRef = state.productList.value[1];
  const currentProductRef = state.currentProduct.value;

  await state.loadCurrentProduct();

  assert.equal(state.productList.value, productListRef);
  assert.equal(state.productList.value[1], currentItemRef);
  assert.equal(state.currentProduct.value, currentProductRef);
  assert.equal(state.productCardActiveIndex.value, 0);
  assert.equal(state.productList.value[1].title, "当前讲解");
  assert.equal(state.productList.value[1].stock, 8);
  assert.equal(showProduct.value, true);
});
