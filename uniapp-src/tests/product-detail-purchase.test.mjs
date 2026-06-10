import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadProductDetailPurchaseModule() {
  const tempDir = await mkdtemp(join(tmpdir(), "product-detail-purchase-"));
  const sourcePath = join(root, "src/composables/useProductDetailPurchase.js");
  let source = await readFile(sourcePath, "utf8");
  source = source
    .replace('import { computed, ref } from "vue";', `
const ref = (value) => ({ value });
const computed = (getter) => ({ get value() { return getter(); } });
`)
    .replace('import { getProductDetail } from "@/api/product.js";', "const getProductDetail = async () => null;")
    .replace('import { confirmOrder, createOrder, getOrderDetail } from "@/api/order.js";', `
const confirmOrder = async () => ({});
const createOrder = async () => ({});
const getOrderDetail = async () => ({});
`)
    .replace('import { getUsableCoupons } from "@/api/coupon.js";', "const getUsableCoupons = async () => ({ usable: [], unusable: [] });")
    .replace('import { deleteAddress, getAddressList } from "@/api/address.js";', `
const deleteAddress = async () => {};
const getAddressList = async () => [];
`)
    .replace('import { importWxAddress } from "@/services/wechat-address.js";', "const importWxAddress = async () => false;")
    .replace('import { executeYeepayPayment } from "@/services/payment-action.js";', "const executeYeepayPayment = async () => ({ confirmed: false });")
    .replace('import { navigatePaymentSuccessOrderDetail } from "@/services/order-payment-navigation.js";', "const navigatePaymentSuccessOrderDetail = () => {};")
    .replace('import { handleCreatedOrderPaymentCancel } from "@/services/order-payment-cancel.js";', "const handleCreatedOrderPaymentCancel = () => false;");
  const modulePath = join(tempDir, "useProductDetailPurchase.mjs");
  await writeFile(modulePath, source, "utf8");
  return import(pathToFileURL(modulePath).href);
}

test("normalizes legacy detail and spec data for the buy popup", async () => {
  const { normalizeProductForBuyPopup } = await loadProductDetailPurchaseModule();

  const product = normalizeProductForBuyPopup({
    detail: {
      product_id: 18,
      product_name: "莲子",
      product_price: "12.50",
      product_stock: 8,
      image: [{ file_path: "https://example.test/a.png" }],
      spec_type: 20,
    },
    specData: {
      spec_attr: [
        {
          group_name: "规格",
          spec_items: [
            { item_id: "101", spec_value: "小包" },
            { item_id: "102", spec_value: "大包" },
          ],
        },
      ],
      spec_list: [
        {
          spec_sku_id: "101",
          spec_text: "小包",
          spec_form: {
            product_price: "12.50",
            line_price: "15.00",
            stock_num: 6,
            image_id: 1,
            image_path: "https://example.test/sku.png",
          },
        },
      ],
    },
  });

  assert.equal(product.id, 18);
  assert.equal(product.title, "莲子");
  assert.equal(product.isMultiSpec, 1);
  assert.equal(product.specs[0].name, "规格");
  assert.equal(product.skus[0].id, "101");
  assert.equal(product.skus[0].salePrice, 12.5);
  assert.equal(product.skus[0].stock, 6);
});

test("normal product popup flow confirms, picks coupon, creates order, and navigates after payment", async () => {
  const { useProductDetailPurchase } = await loadProductDetailPurchaseModule();
  const confirmPayloads = [];
  const createPayloads = [];
  const navigations = [];
  const toasts = [];

  const purchase = useProductDetailPurchase({
    getProductDetailApi: async () => ({
      id: 18,
      name: "莲子",
      salePrice: 12.5,
      stock: 9,
      coverImage: "https://example.test/a.png",
      tenantId: 66,
      requireAddress: 1,
      skus: [{ id: 55, salePrice: 12.5, stock: 9, specText: "" }],
      specs: [],
      isMultiSpec: 0,
    }),
    getAddressListApi: async () => [
      {
        id: 10,
        receiverName: "张三",
        receiverPhone: "13800000000",
        province: "浙江",
        city: "杭州",
        district: "西湖",
        address: "1号",
        isDefault: 1,
      },
    ],
    getUsableCouponsApi: async (payload) => {
      assert.deepEqual(payload.items, [{ productId: 18, skuId: 55, quantity: 1 }]);
      return {
        usable: [
          { customerCouponId: 1, previewDiscount: "2.00" },
          { customerCouponId: 2, previewDiscount: "5.00" },
        ],
        unusable: [],
      };
    },
    confirmOrderApi: async (payload) => {
      confirmPayloads.push(payload);
      return {
        payAmount: "7.50",
        totalAmount: "12.50",
        discountAmount: "5.00",
        shippingFee: "0.00",
        address: { id: 10, fullAddress: "浙江杭州西湖1号" },
      };
    },
    createOrderApi: async (payload) => {
      createPayloads.push(payload);
      return { orderNo: "NO18", orderId: 99 };
    },
    executePayment: async () => ({ confirmed: true }),
    navigateSuccess: (payload, options) => {
      navigations.push({ payload, options });
    },
    uniApi: {
      showToast(payload) {
        toasts.push(payload);
      },
    },
    logger: { log() {}, warn() {}, error() {} },
  });

  await purchase.openProductDetailBuyPopup({
    detail: { product_id: 18, product_name: "莲子" },
    productId: 18,
    orderType: "buy",
    liveContext: {
      roomId: 77,
      termId: 88,
      roomCode: "room-code",
      shareCode: "share-code",
    },
  });

  purchase.buyRemark.value = "少放包装";
  await purchase.onBuyConfirm({
    product: purchase.buyProduct.value,
    quantity: 3,
    skuId: 55,
  });

  assert.equal(purchase.showBuyPopup.value, false);
  assert.equal(purchase.selectedCouponId.value, 2);
  assert.deepEqual(confirmPayloads.at(-1), {
    tenantId: 66,
    items: [{ productId: 18, skuId: 55, quantity: 1 }],
    addressId: 10,
    liveRoomId: 77,
    liveTermId: 88,
    couponId: 2,
  });
  assert.deepEqual(createPayloads, [
    {
      tenantId: 66,
      items: [{ productId: 18, skuId: 55, quantity: 3 }],
      addressId: 10,
      liveRoomId: 77,
      liveTermId: 88,
      buyerRemark: "少放包装",
      source: 4,
      couponId: 2,
      shareCode: "share-code",
    },
  ]);
  assert.equal(toasts.at(-1).title, "支付成功");
  assert.equal(navigations[0].payload.orderId, 99);
  assert.equal(navigations[0].payload.roomCode, "room-code");
});

test("unsupported product order types show a popup but do not create an order", async () => {
  const { useProductDetailPurchase } = await loadProductDetailPurchaseModule();
  const toasts = [];
  let createCalled = false;
  const purchase = useProductDetailPurchase({
    getProductDetailApi: async () => ({
      id: 18,
      name: "预售商品",
      salePrice: 12.5,
      stock: 9,
      requireAddress: 1,
    }),
    getAddressListApi: async () => [],
    createOrderApi: async () => {
      createCalled = true;
    },
    uniApi: {
      showToast(payload) {
        toasts.push(payload);
      },
    },
    logger: { log() {}, warn() {}, error() {} },
  });

  await purchase.openProductDetailBuyPopup({
    detail: { product_id: 18, product_name: "预售商品" },
    productId: 18,
    orderType: "deposit",
  });
  assert.equal(purchase.showBuyPopup.value, true);
  assert.equal(purchase.buyAllowMissingAddressConfirm.value, true);

  await purchase.onBuyConfirm({
    product: purchase.buyProduct.value,
    quantity: 1,
    skuId: 0,
  });

  assert.equal(createCalled, false);
  assert.equal(toasts.at(-1).title, "该商品类型暂不支持弹窗下单");
});

test("product buy popup exposes selected sku and configurable confirm text", async () => {
  const source = await readFile(join(root, "src/components/product-buy-popup.vue"), "utf8");

  assert.match(source, /confirmText:\s*\{\s*type:\s*String,\s*default:\s*"立即购买"\s*\}/);
  assert.match(source, /allowMissingAddressConfirm:\s*\{\s*type:\s*Boolean,\s*default:\s*false\s*\}/);
  assert.match(source, /sku:\s*currentSku\.value/);
});
