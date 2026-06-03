"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_product = require("../../../api/product.js");
function getUniApi(explicitUni) {
  if (explicitUni)
    return explicitUni;
  return common_vendor.index;
}
function mapAddressItem(item = {}) {
  return {
    id: item.id,
    name: item.receiverName,
    mobile: item.receiverPhone,
    tag: item.isDefault === 1 ? "默认" : "",
    fullAddress: item.fullAddress || `${item.province || ""}${item.city || ""}${item.district || ""}${item.address || ""}`,
    receiverName: item.receiverName,
    receiverPhone: item.receiverPhone,
    province: item.province,
    city: item.city,
    district: item.district,
    address: item.address,
    isDefault: item.isDefault,
    _raw: item
  };
}
function pickRecoverAddress(addressList = [], newAddrId = 0) {
  const normalizedNewAddrId = newAddrId ? Number(newAddrId) : 0;
  let pickedAddr = null;
  let matchBy = "";
  if (normalizedNewAddrId) {
    pickedAddr = addressList.find(
      (it) => Number(it.id) === normalizedNewAddrId
    );
    if (pickedAddr)
      matchBy = "newAddrId";
  }
  if (!pickedAddr && addressList.length > 0) {
    pickedAddr = [...addressList].sort(
      (a, b) => Number(b.id) - Number(a.id)
    )[0];
    if (pickedAddr)
      matchBy = "fallback-largest-id";
  }
  return { pickedAddr, matchBy, newAddrId: normalizedNewAddrId };
}
function buildConfirmOrderPayload({
  tenantId,
  productId,
  skuId,
  quantity,
  addressId,
  liveRoomId,
  liveTermId,
  couponId
}) {
  const payload = {
    tenantId: tenantId || 0,
    items: [{ productId, skuId: skuId || 0, quantity: quantity || 1 }],
    addressId: addressId || 0,
    liveRoomId,
    liveTermId
  };
  if (couponId)
    payload.couponId = couponId;
  return payload;
}
function buildCreateOrderPayload({
  product,
  quantity,
  skuId,
  addressId,
  liveRoomId,
  liveTermId,
  buyerRemark,
  couponId,
  shareCode
}) {
  const payload = {
    tenantId: product.tenantId || 0,
    items: [
      {
        productId: product.id || 0,
        skuId: skuId || 0,
        quantity
      }
    ],
    addressId,
    liveRoomId,
    liveTermId,
    buyerRemark,
    source: liveRoomId ? 2 : 1
  };
  if (couponId)
    payload.couponId = couponId;
  if (shareCode)
    payload.shareCode = shareCode;
  return payload;
}
function isWxAddrDoneHit(wxAddrDoneRaw) {
  return wxAddrDoneRaw === "1" || wxAddrDoneRaw === 1 || wxAddrDoneRaw === true || Array.isArray(wxAddrDoneRaw) && wxAddrDoneRaw.some((v) => String(v) === "1") || typeof wxAddrDoneRaw === "string" && wxAddrDoneRaw.startsWith("1");
}
function firstTruthyQueryValue(raw) {
  if (Array.isArray(raw)) {
    return raw.find((v) => v) || "";
  }
  return raw || "";
}
function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source == null ? void 0 : source[key];
    if (value !== void 0 && value !== null && value !== "")
      return value;
  }
  return void 0;
}
function getProductId(item = {}) {
  return Number(firstValue(item, "id", "productId", "product_id", "goodsId", "goods_id") || 0);
}
function getProductSkuId(item = {}) {
  return Number(firstValue(item, "skuId", "sku_id", "productSkuId", "product_sku_id", "specSkuId", "spec_sku_id") || 0);
}
function useLivePurchase({
  liveId,
  roomCode,
  liveTenantId,
  shareCode,
  liveBindId,
  isReplay,
  replayCurrentVideoId,
  showProductList,
  getLiveRedirectUrl,
  getEffectiveTermId,
  isDebugLocalLogin,
  getAddressList,
  deleteAddress,
  confirmOrder,
  createOrder,
  getUsableCoupons,
  executeYeepayPayment,
  importWxAddress,
  saveBuyContext,
  loadBuyContext,
  clearBuyContext,
  onOrderCreated,
  sendBuyReminder,
  roomSetting,
  roomGroupType,
  mode,
  userStore,
  uniApi,
  logger = console
}) {
  const uniRuntime = getUniApi(uniApi);
  const showBuyPopup = common_vendor.ref(false);
  const buyProduct = common_vendor.ref({});
  const buyRemark = common_vendor.ref("");
  const buyLoading = common_vendor.ref(false);
  const buyConfirmData = common_vendor.ref(null);
  const buyQuantity = common_vendor.ref(1);
  const selectedSkuId = common_vendor.ref(0);
  const usableCoupons = common_vendor.ref([]);
  const unusableCoupons = common_vendor.ref([]);
  const selectedCouponId = common_vendor.ref(0);
  const couponLoading = common_vendor.ref(false);
  const pendingOrderId = common_vendor.ref(0);
  const showAddressPopup = common_vendor.ref(false);
  const addressPopupSource = common_vendor.ref("");
  const showAddressFormPopup = common_vendor.ref(false);
  const editAddressData = common_vendor.ref(null);
  const addressList = common_vendor.ref([]);
  const selectedAddressId = common_vendor.ref(null);
  const selectedAddress = common_vendor.ref(null);
  const pendingRecoverBuyCtx = common_vendor.ref(null);
  const buyAddressText = common_vendor.computed(() => {
    const target = selectedAddress.value;
    if (!target)
      return "";
    return target.fullAddress || `${target.province || ""}${target.city || ""}${target.district || ""}${target.address || ""}`;
  });
  const buyShippingFee = common_vendor.computed(() => {
    var _a;
    return ((_a = buyConfirmData.value) == null ? void 0 : _a.shippingFee) || "0.00";
  });
  const buyGoodsAmount = common_vendor.computed(() => {
    var _a;
    return ((_a = buyConfirmData.value) == null ? void 0 : _a.totalAmount) || buyProduct.value.price || "0.00";
  });
  const buyTotalPrice = common_vendor.computed(() => {
    var _a;
    return ((_a = buyConfirmData.value) == null ? void 0 : _a.payAmount) || buyProduct.value.price || "0.00";
  });
  const buyDiscountAmount = common_vendor.computed(() => {
    var _a;
    return ((_a = buyConfirmData.value) == null ? void 0 : _a.discountAmount) || "0.00";
  });
  function resetBuyCouponState() {
    usableCoupons.value = [];
    unusableCoupons.value = [];
    selectedCouponId.value = 0;
    buyConfirmData.value = null;
  }
  function getBestUsableCoupon(coupons = []) {
    if (!coupons.length)
      return null;
    return coupons.reduce((best, coupon) => {
      const bestAmount = Number(best.previewDiscount || best.reduceAmount || 0);
      const amount = Number(coupon.previewDiscount || coupon.reduceAmount || 0);
      return amount > bestAmount ? coupon : best;
    }, coupons[0]);
  }
  function getBuyItems({ productId, skuId, quantity }) {
    return [
      {
        productId: productId || 0,
        skuId: skuId || 0,
        quantity: quantity || 1
      }
    ];
  }
  async function loadUsableCoupons({ productId, skuId, quantity, autoPick = false }) {
    if (!productId || typeof getUsableCoupons !== "function") {
      couponLoading.value = false;
      usableCoupons.value = [];
      unusableCoupons.value = [];
      if (selectedCouponId.value)
        selectedCouponId.value = 0;
      return [];
    }
    couponLoading.value = true;
    try {
      const data = await getUsableCoupons({
        items: getBuyItems({ productId, skuId, quantity })
      });
      const usable = Array.isArray(data == null ? void 0 : data.usable) ? data.usable : [];
      usableCoupons.value = usable;
      unusableCoupons.value = Array.isArray(data == null ? void 0 : data.unusable) ? data.unusable : [];
      const currentId = Number(selectedCouponId.value) || 0;
      const stillUsable = usable.some((coupon) => Number(coupon.customerCouponId) === currentId);
      if (currentId && !stillUsable) {
        selectedCouponId.value = 0;
      }
      if (autoPick && usable.length > 0) {
        const bestCoupon = getBestUsableCoupon(usable);
        selectedCouponId.value = Number(bestCoupon == null ? void 0 : bestCoupon.customerCouponId) || 0;
      }
      return usable;
    } catch (err) {
      logger.error("[Live] loadUsableCoupons fail:", err);
      usableCoupons.value = [];
      unusableCoupons.value = [];
      if (selectedCouponId.value)
        selectedCouponId.value = 0;
      return [];
    } finally {
      couponLoading.value = false;
    }
  }
  function reportBuyReminder(item = {}) {
    var _a, _b, _c, _d, _e, _f;
    if ((roomGroupType == null ? void 0 : roomGroupType.value) === 1)
      return;
    if ((mode == null ? void 0 : mode.value) === "landscape")
      return;
    if ((roomSetting == null ? void 0 : roomSetting.value) && Number(roomSetting.value.buyReminder) !== 1)
      return;
    if (typeof sendBuyReminder !== "function")
      return;
    const roomId = Number(liveId.value || 0);
    const productId = getProductId(item);
    if (!roomId || !productId)
      return;
    const termId = typeof getEffectiveTermId === "function" ? getEffectiveTermId() : 0;
    const skuId = getProductSkuId(item);
    const replayVideoId = Number((replayCurrentVideoId == null ? void 0 : replayCurrentVideoId.value) || 0);
    const liveType = (isReplay == null ? void 0 : isReplay.value) ? "replay" : "live";
    const customerId = ((_a = userStore.userInfo) == null ? void 0 : _a.id) || ((_b = userStore.userInfo) == null ? void 0 : _b.customerId) || ((_c = userStore.userInfo) == null ? void 0 : _c.customer_id) || 0;
    const userId = ((_d = userStore.userInfo) == null ? void 0 : _d.id) || ((_e = userStore.userInfo) == null ? void 0 : _e.userId) || ((_f = userStore.userInfo) == null ? void 0 : _f.user_id) || customerId;
    const productName = firstValue(item, "title", "name", "productName", "product_name", "goodsName", "goods_name") || "";
    const productImage = firstValue(item, "image", "coverImage", "cover_image", "productImage", "product_image", "goodsPic", "goods_pic") || "";
    sendBuyReminder({
      roomId,
      room_id: roomId,
      liveId: roomId,
      live_id: roomId,
      roomCode: (roomCode == null ? void 0 : roomCode.value) || "",
      room_code: (roomCode == null ? void 0 : roomCode.value) || "",
      tenantId: (liveTenantId == null ? void 0 : liveTenantId.value) || 0,
      tenant_id: (liveTenantId == null ? void 0 : liveTenantId.value) || 0,
      shareCode: (shareCode == null ? void 0 : shareCode.value) || "",
      share_code: (shareCode == null ? void 0 : shareCode.value) || "",
      bindId: (liveBindId == null ? void 0 : liveBindId.value) || 0,
      bind_id: (liveBindId == null ? void 0 : liveBindId.value) || 0,
      liveType,
      live_type: liveType,
      termId,
      term_id: termId,
      liveTermId: termId,
      live_term_id: termId,
      videoId: replayVideoId,
      video_id: replayVideoId,
      replayVideoId,
      replay_video_id: replayVideoId,
      productId,
      product_id: productId,
      goodsId: productId,
      goods_id: productId,
      skuId,
      sku_id: skuId,
      productSkuId: skuId,
      product_sku_id: skuId,
      customerId,
      customer_id: customerId,
      userId,
      user_id: userId,
      productName,
      product_name: productName,
      goodsName: productName,
      goods_name: productName,
      productImage,
      product_image: productImage,
      goodsPic: productImage,
      goods_pic: productImage
    }).catch((err) => {
      var _a2;
      (_a2 = logger.warn) == null ? void 0 : _a2.call(logger, "[Live] sendBuyReminder fail:", err);
    });
  }
  async function onProductBuy({ item }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    if (!userStore.token && !isDebugLocalLogin()) {
      const redirect = encodeURIComponent(getLiveRedirectUrl());
      const tenantParam = liveTenantId.value ? `&tenantId=${liveTenantId.value}` : "";
      uniRuntime.navigateTo({
        url: `/pages/login/login?redirect=${redirect}${tenantParam}`
      });
      return;
    }
    reportBuyReminder(item);
    const productId = getProductId(item);
    const skuId = getProductSkuId(item);
    const termId = typeof getEffectiveTermId === "function" ? getEffectiveTermId() : 0;
    const replayVideoId = Number((replayCurrentVideoId == null ? void 0 : replayCurrentVideoId.value) || 0);
    const liveType = (isReplay == null ? void 0 : isReplay.value) ? "replay" : "live";
    const customerId = ((_a = userStore.userInfo) == null ? void 0 : _a.id) || ((_b = userStore.userInfo) == null ? void 0 : _b.customerId) || ((_c = userStore.userInfo) == null ? void 0 : _c.customer_id) || 0;
    const userId = ((_d = userStore.userInfo) == null ? void 0 : _d.id) || ((_e = userStore.userInfo) == null ? void 0 : _e.userId) || ((_f = userStore.userInfo) == null ? void 0 : _f.user_id) || customerId;
    try {
      const detail = await api_product.getProductDetail({
        productId,
        product_id: productId,
        goodsId: productId,
        goods_id: productId,
        roomId: liveId.value || 0,
        room_id: liveId.value || 0,
        liveId: liveId.value || 0,
        live_id: liveId.value || 0,
        roomCode: (roomCode == null ? void 0 : roomCode.value) || "",
        room_code: (roomCode == null ? void 0 : roomCode.value) || "",
        tenantId: (liveTenantId == null ? void 0 : liveTenantId.value) || 0,
        tenant_id: (liveTenantId == null ? void 0 : liveTenantId.value) || 0,
        shareCode: (shareCode == null ? void 0 : shareCode.value) || "",
        share_code: (shareCode == null ? void 0 : shareCode.value) || "",
        bindId: (liveBindId == null ? void 0 : liveBindId.value) || 0,
        bind_id: (liveBindId == null ? void 0 : liveBindId.value) || 0,
        liveType,
        live_type: liveType,
        termId,
        term_id: termId,
        liveTermId: termId,
        live_term_id: termId,
        customerId,
        customer_id: customerId,
        userId,
        user_id: userId,
        videoId: replayVideoId,
        video_id: replayVideoId,
        replayVideoId,
        replay_video_id: replayVideoId,
        skuId,
        sku_id: skuId,
        productSkuId: skuId,
        product_sku_id: skuId
      });
      if (detail) {
        buyProduct.value = {
          id: getProductId(detail) || productId,
          productId: getProductId(detail) || productId,
          product_id: getProductId(detail) || productId,
          tenantId: firstValue(detail, "tenantId", "tenant_id") || (liveTenantId == null ? void 0 : liveTenantId.value) || 0,
          tenant_id: firstValue(detail, "tenantId", "tenant_id") || (liveTenantId == null ? void 0 : liveTenantId.value) || 0,
          image: firstValue(detail, "coverImage", "cover_image", "productImage", "product_image", "goodsPic", "goods_pic", "image") || item.image,
          title: firstValue(detail, "name", "productName", "product_name", "goodsName", "goods_name", "title") || item.title,
          price: ((_h = (_g = detail.salePrice) == null ? void 0 : _g.toFixed) == null ? void 0 : _h.call(_g, 2)) || ((_j = (_i = detail.sale_price) == null ? void 0 : _i.toFixed) == null ? void 0 : _j.call(_i, 2)) || ((_l = (_k = detail.productPrice) == null ? void 0 : _k.toFixed) == null ? void 0 : _l.call(_k, 2)) || ((_n = (_m = detail.product_price) == null ? void 0 : _m.toFixed) == null ? void 0 : _n.call(_m, 2)) || item.price,
          stock: firstValue(detail, "stock", "stockNum", "stock_num", "productStock", "product_stock") || 0,
          isSoldOut: !!firstValue(detail, "isSoldOut", "is_sold_out", "soldOut", "sold_out"),
          soldOut: !!firstValue(detail, "isSoldOut", "is_sold_out", "soldOut", "sold_out") || Number(firstValue(detail, "stock", "stockNum", "stock_num", "productStock", "product_stock") || 0) <= 0,
          specs: detail.specs || [],
          skus: detail.skus || [],
          isMultiSpec: firstValue(detail, "isMultiSpec", "is_multi_spec") || 0,
          requireAddress: detail.requireAddress || item.requireAddress || 1
        };
        const skus = detail.skus || [];
        if (!detail.isMultiSpec && skus.length === 1) {
          selectedSkuId.value = skus[0].id || skus[0].ID || 0;
        } else {
          selectedSkuId.value = 0;
        }
      } else {
        buyProduct.value = item;
      }
    } catch (err) {
      logger.error("[Live] getProductDetail fail:", err);
      buyProduct.value = item;
    }
    buyRemark.value = "";
    buyQuantity.value = 1;
    resetBuyCouponState();
    couponLoading.value = true;
    showProductList.value = false;
    showBuyPopup.value = true;
    ensureBuyAddressLoaded().then(async () => {
      await loadUsableCoupons({
        productId: buyProduct.value.id || 0,
        skuId: selectedSkuId.value || 0,
        quantity: buyQuantity.value,
        autoPick: true
      });
      loadBuyConfirm({
        productId: buyProduct.value.id || 0,
        skuId: selectedSkuId.value || 0,
        quantity: buyQuantity.value
      });
    });
  }
  async function onBuyConfirm({ product, quantity, skuId }) {
    var _a, _b;
    if (buyLoading.value)
      return;
    selectedSkuId.value = skuId || selectedSkuId.value || 0;
    const needAddr = product.requireAddress !== 2;
    if (needAddr && !((_a = selectedAddress.value) == null ? void 0 : _a.id)) {
      uniRuntime.showToast({ title: "请选择收货地址", icon: "none" });
      return;
    }
    buyLoading.value = true;
    try {
      const orderRes = await createOrder(
        buildCreateOrderPayload({
          product,
          quantity,
          skuId,
          addressId: needAddr ? ((_b = selectedAddress.value) == null ? void 0 : _b.id) || 0 : 0,
          liveRoomId: liveId.value,
          liveTermId: getEffectiveTermId(),
          buyerRemark: buyRemark.value,
          couponId: selectedCouponId.value || 0,
          shareCode: (shareCode == null ? void 0 : shareCode.value) || roomCode.value || ""
        })
      );
      if (!(orderRes == null ? void 0 : orderRes.orderNo)) {
        uniRuntime.showToast({ title: "创建订单失败", icon: "none" });
        return;
      }
      if (orderRes.isDuplicate) {
        logger.log("[Live] 命中防重复下单，复用已有订单:", orderRes.orderNo);
        uniRuntime.showToast({ title: "已有待付款订单，正在跳转支付", icon: "none", duration: 1500 });
      } else {
        onOrderCreated == null ? void 0 : onOrderCreated({ productId: product.id, quantity, orderRes });
      }
      pendingOrderId.value = orderRes.orderId || orderRes.ID || 0;
      const payMode = await executeYeepayPayment(orderRes.orderNo, {
        roomCode: roomCode.value
      });
      if (payMode === "jsapi") {
        pendingOrderId.value = 0;
        showBuyPopup.value = false;
      }
    } catch (err) {
      uniRuntime.showToast({ title: (err == null ? void 0 : err.message) || "下单失败", icon: "none" });
    } finally {
      buyLoading.value = false;
    }
  }
  async function ensureBuyAddressLoaded(force = false) {
    if (!force && addressList.value.length > 0)
      return;
    try {
      const list = await getAddressList();
      if (!Array.isArray(list))
        return;
      addressList.value = list.map(mapAddressItem);
      const def = list.find((a) => a.isDefault === 1) || list[0];
      selectedAddressId.value = (def == null ? void 0 : def.id) || null;
    } catch (err) {
      logger.error("[Live] load address list fail:", err);
      uniRuntime.showToast({ title: (err == null ? void 0 : err.message) || "获取收货地址失败", icon: "none" });
    }
  }
  async function openBuyAddressPopup() {
    var _a;
    selectedAddressId.value = ((_a = selectedAddress.value) == null ? void 0 : _a.id) || null;
    await ensureBuyAddressLoaded(true);
    addressPopupSource.value = "buy";
    showAddressPopup.value = true;
  }
  async function loadBuyConfirm({ productId, skuId, quantity, couponId = selectedCouponId.value }) {
    var _a;
    if (!productId)
      return;
    try {
      const data = await confirmOrder(
        buildConfirmOrderPayload({
          tenantId: buyProduct.value.tenantId || 0,
          productId,
          skuId,
          quantity,
          addressId: ((_a = selectedAddress.value) == null ? void 0 : _a.id) || 0,
          liveRoomId: liveId.value,
          liveTermId: getEffectiveTermId(),
          couponId: couponId || 0
        })
      );
      if (!data)
        return;
      buyConfirmData.value = data;
      if (data.address) {
        selectedAddress.value = data.address;
        selectedAddressId.value = data.address.id || selectedAddressId.value;
      }
    } catch (err) {
      logger.error("[Live] loadBuyConfirm fail:", err);
    }
  }
  function onBuyQuantityChange(qty) {
    buyQuantity.value = qty;
    refreshBuyCouponAndConfirm({
      productId: buyProduct.value.id || 0,
      skuId: selectedSkuId.value || 0,
      quantity: qty
    });
  }
  function onBuySkuChange(skuId) {
    const normalizedSkuId = Number(skuId) || 0;
    if (selectedSkuId.value === normalizedSkuId)
      return;
    selectedSkuId.value = normalizedSkuId;
    refreshBuyCouponAndConfirm({
      productId: buyProduct.value.id || 0,
      skuId: normalizedSkuId,
      quantity: buyQuantity.value
    });
  }
  async function onBuyCouponSelect(customerCouponId) {
    selectedCouponId.value = Number(customerCouponId) || 0;
    await loadBuyConfirm({
      productId: buyProduct.value.id || 0,
      skuId: selectedSkuId.value || 0,
      quantity: buyQuantity.value,
      couponId: selectedCouponId.value || 0
    });
  }
  async function refreshBuyCouponAndConfirm({ productId, skuId, quantity }) {
    await loadUsableCoupons({ productId, skuId, quantity, autoPick: true });
    await loadBuyConfirm({ productId, skuId, quantity });
  }
  function confirmBuyAddress() {
    if (!selectedAddressId.value)
      return;
    const found = addressList.value.find(
      (item) => item.id === selectedAddressId.value
    );
    selectedAddress.value = (found == null ? void 0 : found._raw) || found || null;
    showAddressPopup.value = false;
    refreshBuyCouponAndConfirm({
      productId: buyProduct.value.id || 0,
      skuId: selectedSkuId.value || 0,
      quantity: buyQuantity.value
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
    editAddressData.value = (item == null ? void 0 : item._raw) || item;
    showAddressFormPopup.value = true;
  }
  async function onBuyAddressSaved() {
    showAddressFormPopup.value = false;
    addressList.value = [];
    await ensureBuyAddressLoaded();
  }
  async function onDeleteBuyAddress(item) {
    try {
      await deleteAddress(item.id);
      uniRuntime.showToast({ title: "删除成功", icon: "success" });
      if (selectedAddressId.value === item.id) {
        selectedAddressId.value = null;
        selectedAddress.value = null;
      }
      addressList.value = [];
      await ensureBuyAddressLoaded();
    } catch (err) {
      logger.error("[Live] deleteAddress fail:", err);
      uniRuntime.showToast({ title: "删除失败", icon: "none" });
    }
  }
  async function onImportWxAddress() {
    const isFromBuy = addressPopupSource.value === "buy";
    if (isFromBuy) {
      try {
        saveBuyContext({
          roomCode: roomCode.value || "",
          liveId: liveId.value || "",
          buyProduct: buyProduct.value || {},
          selectedSkuId: selectedSkuId.value || 0,
          buyQuantity: buyQuantity.value || 1,
          buyRemark: buyRemark.value || "",
          selectedCouponId: selectedCouponId.value || 0
        });
      } catch (e) {
        logger.warn("[Live] saveBuyContext fail:", e);
      }
    }
    const prevIds = new Set(
      (addressList.value || []).map((it) => Number(it.id)).filter((n) => n > 0)
    );
    const ok = await importWxAddress(isFromBuy ? buyProduct.value.tenantId : 0);
    if (ok) {
      if (isFromBuy)
        clearBuyContext();
      addressList.value = [];
      await ensureBuyAddressLoaded(true);
      if (isFromBuy) {
        const newlyAdded = (addressList.value || []).filter((it) => !prevIds.has(Number(it.id))).sort((a, b) => Number(b.id) - Number(a.id))[0];
        if (newlyAdded) {
          selectedAddressId.value = newlyAdded.id;
          selectedAddress.value = newlyAdded._raw || newlyAdded;
          refreshBuyCouponAndConfirm({
            productId: buyProduct.value.id || 0,
            skuId: selectedSkuId.value || 0,
            quantity: buyQuantity.value || 1
          });
          logger.log("[Live] 微信地址导入成功，已默认选中刚导入的地址 ✅", {
            addressId: newlyAdded.id,
            receiver: newlyAdded.receiverName
          });
        } else {
          logger.log("[Live] 微信地址导入成功，但 diff 没找到新增地址（可能是去重命中）");
        }
      } else {
        logger.log("[Live] 个人中心地址导入成功，仅刷新列表");
      }
    }
  }
  async function recoverBuyContextFromWxPick() {
    const recoverInfo = pendingRecoverBuyCtx.value;
    pendingRecoverBuyCtx.value = null;
    if (!recoverInfo)
      return;
    const ctx = loadBuyContext({ roomCode: roomCode.value || "" });
    if (!ctx) {
      clearBuyContext();
      return;
    }
    try {
      if (!ctx.buyProduct || !ctx.buyProduct.id) {
        return;
      }
      buyProduct.value = ctx.buyProduct;
      selectedSkuId.value = Number(ctx.selectedSkuId) || 0;
      buyQuantity.value = Number(ctx.buyQuantity) || 1;
      buyRemark.value = String(ctx.buyRemark || "");
      selectedCouponId.value = Number(ctx.selectedCouponId) || 0;
      showProductList.value = false;
      showBuyPopup.value = true;
      addressList.value = [];
      await ensureBuyAddressLoaded(true);
      const { pickedAddr, matchBy, newAddrId } = pickRecoverAddress(
        addressList.value,
        recoverInfo.newAddrId
      );
      if (pickedAddr) {
        selectedAddressId.value = pickedAddr.id;
        selectedAddress.value = pickedAddr._raw || pickedAddr;
      }
      await loadUsableCoupons({
        productId: buyProduct.value.id || 0,
        skuId: selectedSkuId.value || 0,
        quantity: buyQuantity.value
      });
      loadBuyConfirm({
        productId: buyProduct.value.id || 0,
        skuId: selectedSkuId.value || 0,
        quantity: buyQuantity.value,
        couponId: selectedCouponId.value || 0
      });
      logger.log("[Live] 下单弹窗已从 wxPick 跳回恢复 ✅", {
        productId: buyProduct.value.id,
        skuId: selectedSkuId.value,
        quantity: buyQuantity.value,
        newAddrId,
        pickedAddrId: (pickedAddr == null ? void 0 : pickedAddr.id) || 0,
        matchBy: matchBy || "none"
      });
    } catch (e) {
      logger.warn("[Live] recoverBuyContext fail:", e);
    } finally {
      clearBuyContext();
    }
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
    addressPopupSource,
    showAddressFormPopup,
    editAddressData,
    addressList,
    selectedAddressId,
    selectedAddress,
    pendingRecoverBuyCtx,
    buyAddressText,
    buyShippingFee,
    buyGoodsAmount,
    buyTotalPrice,
    buyDiscountAmount,
    onProductBuy,
    onBuyConfirm,
    ensureBuyAddressLoaded,
    openBuyAddressPopup,
    loadBuyConfirm,
    loadUsableCoupons,
    onBuyQuantityChange,
    onBuySkuChange,
    onBuyCouponSelect,
    confirmBuyAddress,
    onSelectBuyAddress,
    onAddBuyAddress,
    onEditBuyAddress,
    onBuyAddressSaved,
    onDeleteBuyAddress,
    onImportWxAddress,
    recoverBuyContextFromWxPick
  };
}
exports.firstTruthyQueryValue = firstTruthyQueryValue;
exports.isWxAddrDoneHit = isWxAddrDoneHit;
exports.useLivePurchase = useLivePurchase;
