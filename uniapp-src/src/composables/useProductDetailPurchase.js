import { computed, ref } from "vue";
import { getProductDetail } from "@/api/product.js";
import { confirmOrder, createOrder, getOrderDetail } from "@/api/order.js";
import { getUsableCoupons } from "@/api/coupon.js";
import { deleteAddress, getAddressList } from "@/api/address.js";
import { importWxAddress } from "@/services/wechat-address.js";
import { executeYeepayPayment } from "@/services/payment-action.js";
import { navigatePaymentSuccessOrderDetail } from "@/services/order-payment-navigation.js";
import { handleCreatedOrderPaymentCancel } from "@/services/order-payment-cancel.js";

export const UNSUPPORTED_PRODUCT_ORDER_TYPES = new Set([
  "deposit",
  "seckill",
  "custom_form",
]);

export function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function formatMoney(value, fallback = "0.00") {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return number.toFixed(2);
}

export function isUnsupportedProductOrderType(orderType) {
  return UNSUPPORTED_PRODUCT_ORDER_TYPES.has(String(orderType || ""));
}

export function mapProductAddressItem(item = {}) {
  return {
    id: item.id,
    name: item.receiverName || item.name || "",
    mobile: item.receiverPhone || item.mobile || "",
    tag: item.isDefault === 1 ? "默认" : "",
    fullAddress:
      item.fullAddress ||
      `${item.province || ""}${item.city || ""}${item.district || ""}${item.address || ""}`,
    receiverName: item.receiverName,
    receiverPhone: item.receiverPhone,
    province: item.province,
    city: item.city,
    district: item.district,
    address: item.address,
    isDefault: item.isDefault,
    _raw: item,
  };
}

export function getBestUsableCoupon(coupons = []) {
  if (!coupons.length) return null;
  return coupons.reduce((best, coupon) => {
    const bestAmount = Number(best.previewDiscount || best.reduceAmount || 0);
    const amount = Number(coupon.previewDiscount || coupon.reduceAmount || 0);
    return amount > bestAmount ? coupon : best;
  }, coupons[0]);
}

function normalizeImage(value) {
  if (!value) return "";
  return String(value).replace(/^"+|"+$/g, "").trim();
}

function getDetailImage(detail = {}) {
  const firstImage = Array.isArray(detail.image) ? detail.image[0] : null;
  const directImage = firstValue(
    detail,
    "coverImage",
    "cover_image",
    "productImage",
    "product_image",
    "goodsPic",
    "goods_pic",
  );
  const rawImage = Array.isArray(detail.image) ? firstImage : detail.image;
  return normalizeImage(
    directImage ||
      rawImage?.file_path ||
      rawImage?.url ||
      rawImage,
  );
}

function normalizePopupSpecs(source = {}, specData = null) {
  if (Array.isArray(source.specs) && source.specs.length > 0) {
    return source.specs.map((spec) => ({
      id: firstValue(spec, "id", "specId", "spec_id", "name") || "",
      name: firstValue(spec, "name", "group_name", "title") || "",
      values: Array.isArray(spec.values)
        ? spec.values.map((value) => ({
          id: firstValue(value, "id", "item_id", "value") || "",
          value: firstValue(value, "value", "spec_value", "name") || "",
        }))
        : [],
    })).filter((spec) => spec.name && spec.values.length > 0);
  }

  const attrs = Array.isArray(specData?.spec_attr) ? specData.spec_attr : [];
  return attrs.map((attr) => ({
    id: firstValue(attr, "id", "group_id", "group_name") || "",
    name: firstValue(attr, "group_name", "name") || "",
    values: Array.isArray(attr.spec_items)
      ? attr.spec_items.map((item) => ({
        id: firstValue(item, "item_id", "id", "spec_value") || "",
        value: firstValue(item, "spec_value", "value") || "",
      }))
      : [],
  })).filter((spec) => spec.name && spec.values.length > 0);
}

function normalizePopupSku(sku = {}, fallback = {}) {
  const specSkuId = firstValue(sku, "spec_sku_id", "specSkuId", "id", "ID") || 0;
  const specForm = sku.spec_form || sku.productSku || sku.product_sku || sku;
  const rawSpecValueIds = firstValue(sku, "specValueIds", "spec_value_ids");
  const specText = firstValue(sku, "specText", "spec_text", "product_attr") || "";
  return {
    ...sku,
    id: firstValue(sku, "id", "ID", "skuId", "sku_id", "productSkuId", "product_sku_id", "spec_sku_id", "specSkuId") || specSkuId || 0,
    specValueIds: rawSpecValueIds || String(specSkuId || "").replace(/_/g, ","),
    specText,
    salePrice: toNumber(firstValue(sku, "salePrice", "sale_price") || firstValue(specForm, "product_price", "salePrice", "sale_price"), toNumber(fallback.price, 0)),
    linePrice: toNumber(firstValue(sku, "linePrice", "line_price") || firstValue(specForm, "line_price", "linePrice"), 0),
    stock: toNumber(firstValue(sku, "stock", "stockNum", "stock_num") || firstValue(specForm, "stock_num", "stock"), fallback.stock || 0),
    image: normalizeImage(firstValue(sku, "image", "image_path") || firstValue(specForm, "image_path", "image") || fallback.image),
  };
}

function normalizePopupSkus(source = {}, specData = null, fallback = {}) {
  if (Array.isArray(source.skus) && source.skus.length > 0) {
    return source.skus.map((sku) => normalizePopupSku(sku, fallback));
  }
  if (Array.isArray(specData?.spec_list) && specData.spec_list.length > 0) {
    return specData.spec_list.map((sku) => normalizePopupSku(sku, fallback));
  }
  const productSku = source.product_sku || source.productSku || {};
  if (Object.keys(productSku).length > 0) {
    return [normalizePopupSku(productSku, fallback)];
  }
  return [];
}

export function normalizeProductForBuyPopup({
  detail = {},
  productDetail = null,
  specData = null,
  productId = 0,
  tenantId = 0,
} = {}) {
  const source = productDetail || detail || {};
  const fallbackImage = getDetailImage(detail);
  const priceValue = firstValue(source, "salePrice", "sale_price", "productPrice", "product_price", "price") ||
    firstValue(source.product_sku || {}, "product_price", "salePrice") ||
    firstValue(detail.product_sku || {}, "product_price", "salePrice") ||
    detail.product_price;
  const stockValue = firstValue(source, "stock", "stockNum", "stock_num", "productStock", "product_stock") ||
    firstValue(source.product_sku || {}, "stock_num", "stock") ||
    firstValue(detail.product_sku || {}, "stock_num", "stock") ||
    detail.product_stock;
  const image = getDetailImage(source) || fallbackImage;
  const stock = toNumber(stockValue, 0);
  const isVirtual = toNumber(firstValue(source, "is_virtual", "isVirtual", "productType") || detail.is_virtual, 0);
  const requireAddress = toNumber(firstValue(source, "requireAddress", "require_address") || detail.requireAddress || detail.require_address, isVirtual === 1 ? 2 : 1);
  const specs = normalizePopupSpecs(source, specData);
  const skus = normalizePopupSkus(source, specData, {
    image,
    price: priceValue,
    stock,
  });
  const isMultiSpec = toNumber(firstValue(source, "isMultiSpec", "is_multi_spec") ?? (detail.spec_type === 20 ? 1 : 0), 0);
  const id = firstValue(source, "id", "productId", "product_id", "goodsId", "goods_id") || productId || detail.product_id || 0;
  const soldOut = Boolean(firstValue(source, "isSoldOut", "is_sold_out", "soldOut", "sold_out")) || stock <= 0;

  return {
    id,
    productId: id,
    product_id: id,
    tenantId: firstValue(source, "tenantId", "tenant_id") || tenantId || detail.tenantId || detail.tenant_id || 0,
    tenant_id: firstValue(source, "tenantId", "tenant_id") || tenantId || detail.tenantId || detail.tenant_id || 0,
    image,
    title: firstValue(source, "name", "productName", "product_name", "goodsName", "goods_name", "title") || detail.product_name || "",
    price: formatMoney(priceValue),
    priceMin: formatMoney(firstValue(source, "priceMin", "price_min", "product_min_price") || priceValue),
    stock,
    isSoldOut: soldOut,
    soldOut,
    specs,
    skus,
    isMultiSpec,
    requireAddress,
  };
}

export function buildProductConfirmOrderPayload({
  product,
  productId,
  skuId,
  quantity,
  addressId,
  liveRoomId,
  liveTermId,
  couponId,
}) {
  const payload = {
    tenantId: product?.tenantId || product?.tenant_id || 0,
    items: [
      {
        productId: productId || product?.id || product?.productId || product?.product_id || 0,
        skuId: skuId || 0,
        quantity: quantity || 1,
      },
    ],
    addressId: addressId || 0,
    liveRoomId: liveRoomId || 0,
    liveTermId: liveTermId || 0,
  };
  if (couponId) payload.couponId = couponId;
  return payload;
}

export function buildProductCreateOrderPayload({
  product,
  productId,
  skuId,
  quantity,
  addressId,
  liveRoomId,
  liveTermId,
  buyerRemark,
  couponId,
  shareCode,
}) {
  const payload = {
    tenantId: product?.tenantId || product?.tenant_id || 0,
    items: [
      {
        productId: productId || product?.id || product?.productId || product?.product_id || 0,
        skuId: skuId || 0,
        quantity: quantity || 1,
      },
    ],
    addressId: addressId || 0,
    liveRoomId: liveRoomId || 0,
    liveTermId: liveTermId || 0,
    buyerRemark: buyerRemark || "",
    source: 4,
  };
  if (couponId) payload.couponId = couponId;
  if (shareCode) payload.shareCode = shareCode;
  return payload;
}

function resolveUniApi(explicitUni) {
  if (explicitUni) return explicitUni;
  if (typeof uni !== "undefined") return uni;
  return null;
}

function pickDefaultAddress(list = []) {
  return list.find((item) => item.isDefault === 1) || list[0] || null;
}

function normalizeLiveContext(context = {}) {
  return {
    liveRoomId: toNumber(firstValue(context, "liveRoomId", "live_room_id", "roomId", "room_id", "liveId", "live_id"), 0),
    liveTermId: toNumber(firstValue(context, "liveTermId", "live_term_id", "termId", "term_id"), 0),
    roomCode: String(firstValue(context, "roomCode", "room_code") || ""),
    tenantId: toNumber(firstValue(context, "tenantId", "tenant_id"), 0),
    shareCode: String(firstValue(context, "shareCode", "share_code") || ""),
  };
}

export function useProductDetailPurchase({
  getProductDetailApi = getProductDetail,
  confirmOrderApi = confirmOrder,
  createOrderApi = createOrder,
  getOrderDetailApi = getOrderDetail,
  getUsableCouponsApi = getUsableCoupons,
  getAddressListApi = getAddressList,
  deleteAddressApi = deleteAddress,
  importWxAddressApi = importWxAddress,
  executePayment = executeYeepayPayment,
  navigateSuccess = navigatePaymentSuccessOrderDetail,
  handlePaymentCancel = handleCreatedOrderPaymentCancel,
  uniApi,
  logger = console,
} = {}) {
  const runtimeUni = resolveUniApi(uniApi);
  const showBuyPopup = ref(false);
  const buyProduct = ref({});
  const buyRemark = ref("");
  const buyLoading = ref(false);
  const buyConfirmData = ref(null);
  const buyQuantity = ref(1);
  const selectedSkuId = ref(0);
  const usableCoupons = ref([]);
  const unusableCoupons = ref([]);
  const selectedCouponId = ref(0);
  const couponLoading = ref(false);
  const pendingOrderId = ref(0);
  const pendingOrderNo = ref("");
  const showAddressPopup = ref(false);
  const showAddressFormPopup = ref(false);
  const editAddressData = ref(null);
  const addressList = ref([]);
  const selectedAddressId = ref(null);
  const selectedAddress = ref(null);
  const currentProductId = ref(0);
  const currentOrderType = ref("buy");
  const currentLiveContext = ref(normalizeLiveContext());

  const isUnsupportedBuyOrderType = computed(() => isUnsupportedProductOrderType(currentOrderType.value));
  const buyAllowMissingAddressConfirm = computed(() => isUnsupportedBuyOrderType.value);
  const buyRequireAddress = computed(() => buyProduct.value?.requireAddress || 1);

  const buyAddressText = computed(() => {
    const target = selectedAddress.value;
    if (!target) return "";
    return (
      target.fullAddress ||
      `${target.province || ""}${target.city || ""}${target.district || ""}${target.address || ""}`
    );
  });

  const buyShippingFee = computed(() => buyConfirmData.value?.shippingFee || "0.00");
  const buyGoodsAmount = computed(() => buyConfirmData.value?.totalAmount || buyProduct.value.price || "0.00");
  const buyTotalPrice = computed(() => buyConfirmData.value?.payAmount || buyProduct.value.price || "0.00");
  const buyDiscountAmount = computed(() => buyConfirmData.value?.discountAmount || "0.00");
  const buyConfirmText = computed(() => "立即购买");

  function showToast(options) {
    runtimeUni?.showToast?.(options);
  }

  function resetBuyState({ keepAddress = true } = {}) {
    buyRemark.value = "";
    buyLoading.value = false;
    buyConfirmData.value = null;
    buyQuantity.value = 1;
    selectedSkuId.value = 0;
    usableCoupons.value = [];
    unusableCoupons.value = [];
    selectedCouponId.value = 0;
    couponLoading.value = false;
    if (!keepAddress) {
      selectedAddressId.value = null;
      selectedAddress.value = null;
      addressList.value = [];
    }
  }

  function getBuyItems({ productId, skuId, quantity }) {
    return [
      {
        productId: productId || 0,
        skuId: skuId || 0,
        quantity: quantity || 1,
      },
    ];
  }

  function resolveBuySkuId(skuId) {
    return skuId || selectedSkuId.value || buyProduct.value?.skus?.[0]?.id || 0;
  }

  async function loadUsableCoupons({ productId, skuId, quantity, autoPick = false }) {
    if (!productId || isUnsupportedBuyOrderType.value) {
      couponLoading.value = false;
      usableCoupons.value = [];
      unusableCoupons.value = [];
      selectedCouponId.value = 0;
      return [];
    }
    couponLoading.value = true;
    try {
      const data = await getUsableCouponsApi({
        items: getBuyItems({ productId, skuId, quantity }),
      });
      const usable = Array.isArray(data?.usable) ? data.usable : [];
      usableCoupons.value = usable;
      unusableCoupons.value = Array.isArray(data?.unusable) ? data.unusable : [];
      const currentId = Number(selectedCouponId.value) || 0;
      const stillUsable = usable.some((coupon) => Number(coupon.customerCouponId) === currentId);
      if (currentId && !stillUsable) selectedCouponId.value = 0;
      if (autoPick && usable.length > 0) {
        selectedCouponId.value = Number(getBestUsableCoupon(usable)?.customerCouponId) || 0;
      }
      return usable;
    } catch (err) {
      logger.error?.("[ProductDetailPurchase] loadUsableCoupons fail:", err);
      usableCoupons.value = [];
      unusableCoupons.value = [];
      selectedCouponId.value = 0;
      return [];
    } finally {
      couponLoading.value = false;
    }
  }

  async function loadBuyConfirm({ productId = currentProductId.value, skuId = selectedSkuId.value, quantity = buyQuantity.value, couponId = selectedCouponId.value } = {}) {
    if (!productId || isUnsupportedBuyOrderType.value) return;
    try {
      const data = await confirmOrderApi(
        buildProductConfirmOrderPayload({
          product: buyProduct.value,
          productId,
          skuId: resolveBuySkuId(skuId),
          quantity,
          addressId: selectedAddress.value?.id || selectedAddressId.value || 0,
          liveRoomId: currentLiveContext.value.liveRoomId,
          liveTermId: currentLiveContext.value.liveTermId,
          couponId: couponId || 0,
        }),
      );
      if (!data) return;
      buyConfirmData.value = data;
      if (data.address) {
        selectedAddress.value = data.address;
        selectedAddressId.value = data.address.id || selectedAddressId.value;
      }
    } catch (err) {
      logger.error?.("[ProductDetailPurchase] loadBuyConfirm fail:", err);
    }
  }

  async function refreshBuyCouponAndConfirm({ productId = currentProductId.value, skuId = selectedSkuId.value, quantity = buyQuantity.value } = {}) {
    if (isUnsupportedBuyOrderType.value) return;
    await loadUsableCoupons({ productId, skuId: resolveBuySkuId(skuId), quantity, autoPick: true });
    await loadBuyConfirm({ productId, skuId: resolveBuySkuId(skuId), quantity });
  }

  async function ensureBuyAddressLoaded(force = false) {
    if (!force && addressList.value.length > 0) return;
    try {
      const list = await getAddressListApi();
      if (!Array.isArray(list)) return;
      addressList.value = list.map(mapProductAddressItem);
      const selected = selectedAddressId.value
        ? addressList.value.find((item) => Number(item.id) === Number(selectedAddressId.value))
        : null;
      const def = selected || pickDefaultAddress(addressList.value);
      selectedAddressId.value = def?.id || null;
      selectedAddress.value = def?._raw || def || null;
    } catch (err) {
      logger.error?.("[ProductDetailPurchase] load address list fail:", err);
      showToast({ title: err?.message || "获取收货地址失败", icon: "none" });
    }
  }

  async function loadPopupProduct({ detail, productId, specData, liveContext }) {
    let productDetail = null;
    try {
      productDetail = await getProductDetailApi({
        productId,
        product_id: productId,
        goodsId: productId,
        goods_id: productId,
        roomId: liveContext.liveRoomId,
        room_id: liveContext.liveRoomId,
        liveId: liveContext.liveRoomId,
        live_id: liveContext.liveRoomId,
        liveRoomId: liveContext.liveRoomId,
        live_room_id: liveContext.liveRoomId,
        termId: liveContext.liveTermId,
        term_id: liveContext.liveTermId,
        liveTermId: liveContext.liveTermId,
        live_term_id: liveContext.liveTermId,
        roomCode: liveContext.roomCode,
        room_code: liveContext.roomCode,
        tenantId: liveContext.tenantId,
        tenant_id: liveContext.tenantId,
        shareCode: liveContext.shareCode,
        share_code: liveContext.shareCode,
      });
    } catch (err) {
      logger.error?.("[ProductDetailPurchase] getProductDetail fail:", err);
    }
    return normalizeProductForBuyPopup({
      detail,
      productDetail,
      specData,
      productId,
      tenantId: liveContext.tenantId,
    });
  }

  async function openProductDetailBuyPopup({ detail = {}, productId = 0, specData = null, orderType = "buy", liveContext = {} } = {}) {
    const live = normalizeLiveContext(liveContext);
    currentLiveContext.value = live;
    currentOrderType.value = orderType || "buy";
    currentProductId.value = firstValue(detail, "product_id", "productId", "id") || productId || 0;
    resetBuyState({ keepAddress: true });
    buyProduct.value = await loadPopupProduct({
      detail,
      productId: currentProductId.value,
      specData,
      liveContext: live,
    });
    if (isUnsupportedBuyOrderType.value) {
      buyProduct.value = {
        ...buyProduct.value,
        isSoldOut: false,
        soldOut: false,
        stock: Math.max(1, Number(buyProduct.value.stock || 0)),
      };
    }
    currentProductId.value = buyProduct.value.id || currentProductId.value;
    showBuyPopup.value = true;
    await ensureBuyAddressLoaded();
    if (!isUnsupportedBuyOrderType.value) {
      await refreshBuyCouponAndConfirm({
        productId: currentProductId.value,
        skuId: selectedSkuId.value || buyProduct.value?.skus?.[0]?.id || 0,
        quantity: buyQuantity.value,
      });
    }
  }

  async function openBuyAddressPopup() {
    selectedAddressId.value = selectedAddress.value?.id || selectedAddressId.value || null;
    await ensureBuyAddressLoaded(true);
    showAddressPopup.value = true;
  }

  function confirmBuyAddress() {
    if (!selectedAddressId.value) return;
    const found = addressList.value.find((item) => Number(item.id) === Number(selectedAddressId.value));
    selectedAddress.value = found?._raw || found || null;
    showAddressPopup.value = false;
    refreshBuyCouponAndConfirm({
      productId: currentProductId.value,
      skuId: selectedSkuId.value,
      quantity: buyQuantity.value,
    });
  }

  function onSelectBuyAddress(addrId) {
    selectedAddressId.value = addrId;
    confirmBuyAddress();
  }

  function onAddBuyAddress() {
    editAddressData.value = null;
    showAddressFormPopup.value = true;
  }

  function onEditBuyAddress(item) {
    editAddressData.value = item?._raw || item;
    showAddressFormPopup.value = true;
  }

  async function onBuyAddressSaved() {
    showAddressFormPopup.value = false;
    addressList.value = [];
    await ensureBuyAddressLoaded(true);
    await refreshBuyCouponAndConfirm({
      productId: currentProductId.value,
      skuId: selectedSkuId.value,
      quantity: buyQuantity.value,
    });
  }

  async function onDeleteBuyAddress(item) {
    try {
      await deleteAddressApi(item.id);
      showToast({ title: "删除成功", icon: "success" });
      if (Number(selectedAddressId.value) === Number(item.id)) {
        selectedAddressId.value = null;
        selectedAddress.value = null;
      }
      addressList.value = [];
      await ensureBuyAddressLoaded(true);
      await refreshBuyCouponAndConfirm({
        productId: currentProductId.value,
        skuId: selectedSkuId.value,
        quantity: buyQuantity.value,
      });
    } catch (err) {
      logger.error?.("[ProductDetailPurchase] deleteAddress fail:", err);
      showToast({ title: "删除失败", icon: "none" });
    }
  }

  async function onImportWxAddress() {
    const prevIds = new Set((addressList.value || []).map((item) => Number(item.id)).filter((id) => id > 0));
    const ok = await importWxAddressApi(buyProduct.value?.tenantId || buyProduct.value?.tenant_id || 0);
    if (!ok) return;
    addressList.value = [];
    await ensureBuyAddressLoaded(true);
    const newlyAdded = (addressList.value || [])
      .filter((item) => !prevIds.has(Number(item.id)))
      .sort((a, b) => Number(b.id) - Number(a.id))[0];
    if (newlyAdded) {
      selectedAddressId.value = newlyAdded.id;
      selectedAddress.value = newlyAdded._raw || newlyAdded;
    }
    await refreshBuyCouponAndConfirm({
      productId: currentProductId.value,
      skuId: selectedSkuId.value,
      quantity: buyQuantity.value,
    });
  }

  function onBuyQuantityChange(qty) {
    buyQuantity.value = qty;
    refreshBuyCouponAndConfirm({
      productId: currentProductId.value,
      skuId: selectedSkuId.value,
      quantity: qty,
    });
  }

  function onBuySkuChange(skuId) {
    const normalizedSkuId = skuId || 0;
    if (selectedSkuId.value === normalizedSkuId) return;
    selectedSkuId.value = normalizedSkuId;
    refreshBuyCouponAndConfirm({
      productId: currentProductId.value,
      skuId: normalizedSkuId,
      quantity: buyQuantity.value,
    });
  }

  async function onBuyCouponSelect(customerCouponId) {
    selectedCouponId.value = Number(customerCouponId) || 0;
    await loadBuyConfirm({
      productId: currentProductId.value,
      skuId: selectedSkuId.value,
      quantity: buyQuantity.value,
      couponId: selectedCouponId.value,
    });
  }

  async function onBuyConfirm({ product, quantity, skuId }) {
    if (buyLoading.value) return;
    if (isUnsupportedBuyOrderType.value) {
      showToast({ title: "该商品类型暂不支持弹窗下单", icon: "none" });
      return;
    }
    selectedSkuId.value = resolveBuySkuId(skuId);
    const needAddr = product.requireAddress !== 2;
    if (needAddr && !selectedAddress.value?.id) {
      showToast({ title: "请选择收货地址", icon: "none" });
      return;
    }
    buyLoading.value = true;
    let createdOrderNo = "";
    try {
      const orderRes = await createOrderApi(
        buildProductCreateOrderPayload({
          product,
          productId: currentProductId.value,
          skuId: selectedSkuId.value,
          quantity,
          addressId: needAddr ? selectedAddress.value?.id || 0 : 0,
          liveRoomId: currentLiveContext.value.liveRoomId,
          liveTermId: currentLiveContext.value.liveTermId,
          buyerRemark: buyRemark.value,
          couponId: selectedCouponId.value || 0,
          shareCode: currentLiveContext.value.shareCode || currentLiveContext.value.roomCode || "",
        }),
      );
      if (!orderRes?.orderNo) {
        showToast({ title: "创建订单失败", icon: "none" });
        return;
      }
      if (orderRes.isDuplicate) {
        logger.log?.("[ProductDetailPurchase] 命中防重复下单，复用已有订单:", orderRes.orderNo);
        showToast({ title: "已有待付款订单，正在跳转支付", icon: "none", duration: 1500 });
      }
      createdOrderNo = orderRes.orderNo;
      pendingOrderId.value = orderRes.orderId || orderRes.ID || 0;
      pendingOrderNo.value = orderRes.orderNo;
      const payResult = await executePayment(orderRes.orderNo, {
        roomCode: currentLiveContext.value.roomCode,
      });
      if (payResult?.confirmed) {
        showToast({ title: "支付成功", icon: "none" });
        navigateSuccess({
          orderId: pendingOrderId.value,
          orderNo: orderRes.orderNo,
          roomCode: currentLiveContext.value.roomCode,
        }, { delay: 1200 });
        pendingOrderId.value = 0;
        pendingOrderNo.value = "";
        showBuyPopup.value = false;
      }
    } catch (err) {
      if (handlePaymentCancel({
        err,
        orderNo: createdOrderNo,
        roomCode: currentLiveContext.value.roomCode,
        uniApi: runtimeUni,
      })) {
        return;
      }
      showToast({ title: err?.message || "下单失败", icon: "none" });
    } finally {
      buyLoading.value = false;
    }
  }

  async function checkPendingProductOrder() {
    if (!pendingOrderId.value) return;
    try {
      const detail = await getOrderDetailApi(pendingOrderId.value);
      const status = Number(detail?.orderStatus || 0);
      if (status >= 2) {
        const orderId = detail?.id || pendingOrderId.value;
        const orderNo = detail?.orderNo || pendingOrderNo.value || "";
        pendingOrderId.value = 0;
        pendingOrderNo.value = "";
        showToast({ title: "支付成功", icon: "none" });
        navigateSuccess({
          orderId,
          orderNo,
          roomCode: currentLiveContext.value.roomCode,
        }, { replace: true, delay: 1200 });
        return;
      }
    } catch (err) {
      logger.error?.("[ProductDetailPurchase] check pending order fail:", err);
    }
    pendingOrderId.value = 0;
    pendingOrderNo.value = "";
  }

  return {
    showBuyPopup,
    buyProduct,
    buyRemark,
    buyLoading,
    buyConfirmData,
    buyQuantity,
    selectedSkuId,
    usableCoupons,
    unusableCoupons,
    selectedCouponId,
    couponLoading,
    pendingOrderId,
    showAddressPopup,
    showAddressFormPopup,
    editAddressData,
    addressList,
    selectedAddressId,
    selectedAddress,
    currentOrderType,
    buyAddressText,
    buyShippingFee,
    buyGoodsAmount,
    buyTotalPrice,
    buyDiscountAmount,
    buyRequireAddress,
    buyConfirmText,
    buyAllowMissingAddressConfirm,
    isUnsupportedBuyOrderType,
    openProductDetailBuyPopup,
    openBuyAddressPopup,
    confirmBuyAddress,
    onSelectBuyAddress,
    onAddBuyAddress,
    onEditBuyAddress,
    onBuyAddressSaved,
    onDeleteBuyAddress,
    onImportWxAddress,
    onBuyQuantityChange,
    onBuySkuChange,
    onBuyCouponSelect,
    onBuyConfirm,
    checkPendingProductOrder,
    ensureBuyAddressLoaded,
  };
}
