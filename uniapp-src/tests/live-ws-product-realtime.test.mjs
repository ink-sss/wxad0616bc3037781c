import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadWsHandlerModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "live-ws-handler-"));
  const sourcePath = join(root, "src/pages/broadcast/composables/useLiveWsMessageHandler.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace('import { nextTick } from "vue";', "const nextTick = (callback) => callback();")
    .replace(
      'import {\n  applyLiveStatusSnapshot,\n  resolveLiveStatusPayload,\n} from "../utils/live-status-snapshot.js";',
      "const applyLiveStatusSnapshot = () => {};\nconst resolveLiveStatusPayload = (data) => data?.data || data?.payload || data;",
    );
  const modulePath = join(tempDir, "useLiveWsMessageHandler.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

function createCtx(initialProducts = []) {
  const ctx = {
    myUserId: { value: 1 },
    isReplay: { value: false },
    replayCurrentVideoId: { value: 0 },
    messages: { value: [] },
    currentProduct: { value: {} },
    showProduct: { value: false },
    productList: { value: initialProducts },
    explainingProductId: { value: 0 },
    productTotal: { value: initialProducts.length },
    productFinished: { value: false },
    productCardIndexSyncedWith: 0,
    defaultAvatar: "",
    canAppendLiveMessages: () => true,
    shouldFollowLatestCommentWindow: () => true,
    scrollToBottom() {},
    refreshPinnedMessage() {},
    formatLiveNickname: (nick) => nick,
    mapProductItem(item = {}) {
      const id = Number(item.productId || item.product_id || item.goodsId || item.goods_id || item.id || 0);
      return {
        ...item,
        id,
        productId: id,
        product_id: id,
        title: item.productName || item.product_name || item.goodsName || item.goods_name || item.name || item.title || "",
        image: item.productImage || item.product_image || item.goodsImage || item.goods_image || item.image || "",
        price: item.productPrice || item.product_price || item.price || "0.00",
      };
    },
    syncProductCardIndex(productId = 0) {
      this.productCardIndexSyncedWith = Number(productId || 0);
    },
  };
  return ctx;
}

test("legacy ExplainEdit notice is normalized to a product_status_update", async () => {
  const { normalizeBroadcastWsMessage } = await loadWsHandlerModule();
  const normalized = normalizeBroadcastWsMessage({
    type: "TIMGroupTipElem",
    payload: {
      userDefinedField: '@ExplainEdit---{"product_id":801,"product_name":"实时讲解商品"}',
    },
  });

  assert.equal(normalized.type, "product_status_update");
  assert.equal(normalized.action, "explaining");
  assert.equal(normalized.product_id, 801);
  assert.equal(normalized.product_name, "实时讲解商品");
});

test("explaining product pushed by websocket is inserted into the live product list", async () => {
  const { createLiveWsMessageHandler } = await loadWsHandlerModule();
  const ctx = createCtx([
    { id: 1, productId: 1, product_id: 1, title: "旧商品", isCurrent: true },
  ]);
  const handleWsMessage = createLiveWsMessageHandler(ctx);

  handleWsMessage({
    event: "explain_goods",
    data: {
      product_id: 802,
      product_name: "新推送商品",
      product_price: "19.90",
    },
  });

  assert.equal(ctx.showProduct.value, true);
  assert.equal(ctx.currentProduct.value.id, 802);
  assert.equal(ctx.currentProduct.value.title, "新推送商品");
  assert.equal(ctx.explainingProductId.value, 802);
  assert.equal(ctx.productList.value.length, 2);
  assert.equal(ctx.productList.value[0].isCurrent, false);
  assert.equal(ctx.productList.value[1].id, 802);
  assert.equal(ctx.productList.value[1].isCurrent, true);
  assert.equal(ctx.productTotal.value, 2);
  assert.equal(ctx.productCardIndexSyncedWith, 802);
});

test("explaining product id-only push keeps existing hot sale product details", async () => {
  const { createLiveWsMessageHandler } = await loadWsHandlerModule();
  const ctx = createCtx([
    {
      id: 802,
      productId: 802,
      product_id: 802,
      title: "原热卖商品",
      stock: 200,
      hotSales: 183,
      isCurrent: false,
    },
  ]);
  const handleWsMessage = createLiveWsMessageHandler(ctx);

  handleWsMessage({
    event: "explain_goods",
    data: {
      product_id: 802,
    },
  });

  assert.equal(ctx.showProduct.value, true);
  assert.equal(ctx.currentProduct.value.id, 802);
  assert.equal(ctx.currentProduct.value.title, "原热卖商品");
  assert.equal(ctx.currentProduct.value.stock, 200);
  assert.equal(ctx.currentProduct.value.hotSales, 183);
  assert.equal(ctx.productList.value.length, 1);
  assert.equal(ctx.productList.value[0].isCurrent, true);
  assert.equal(ctx.productList.value[0].hotSales, 183);
  assert.equal(ctx.productTotal.value, 1);
  assert.equal(ctx.productCardIndexSyncedWith, 802);
});

test("product list websocket aliases replace the shelf in real time", async () => {
  const { createLiveWsMessageHandler } = await loadWsHandlerModule();
  const ctx = createCtx([{ id: 1, productId: 1, product_id: 1, title: "旧商品" }]);
  const handleWsMessage = createLiveWsMessageHandler(ctx);

  handleWsMessage({
    event: "goods_shelf",
    data: {
      goodsList: [
        { goods_id: 901, goods_name: "货架商品 A" },
        { goods_id: 902, goods_name: "货架商品 B", isCurrent: true },
      ],
    },
  });

  assert.deepEqual(ctx.productList.value.map((item) => item.id), [901, 902]);
  assert.equal(ctx.productTotal.value, 2);
  assert.equal(ctx.productFinished.value, true);
  assert.equal(ctx.currentProduct.value.id, 902);
  assert.equal(ctx.showProduct.value, true);
});

test("same product list websocket refresh patches existing card objects in place", async () => {
  const { createLiveWsMessageHandler } = await loadWsHandlerModule();
  const initialProducts = [
    { id: 901, productId: 901, product_id: 901, title: "货架商品 A", stock: 5, isCurrent: false },
    { id: 902, productId: 902, product_id: 902, title: "货架商品 B", stock: 6, isCurrent: true },
  ];
  const ctx = createCtx(initialProducts);
  ctx.currentProduct.value = initialProducts[1];
  const handleWsMessage = createLiveWsMessageHandler(ctx);

  handleWsMessage({
    event: "goods_shelf",
    data: {
      goodsList: [
        { goods_id: 901, goods_name: "货架商品 A+", stock: 4 },
        { goods_id: 902, goods_name: "货架商品 B+", stock: 3, isCurrent: true },
      ],
    },
  });

  assert.equal(ctx.productList.value, initialProducts);
  assert.equal(ctx.productList.value[0], initialProducts[0]);
  assert.equal(ctx.productList.value[1], initialProducts[1]);
  assert.equal(ctx.currentProduct.value, initialProducts[1]);
  assert.equal(ctx.productList.value[0].title, "货架商品 A+");
  assert.equal(ctx.productList.value[1].title, "货架商品 B+");
  assert.equal(ctx.productList.value[1].isCurrent, true);
  assert.equal(ctx.productCardIndexSyncedWith, 902);
});
