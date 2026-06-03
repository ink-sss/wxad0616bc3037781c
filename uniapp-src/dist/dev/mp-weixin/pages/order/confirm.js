"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const services_paymentAction = require("../../services/payment-action.js");
const api_address = require("../../api/address.js");
const services_wechatAddress = require("../../services/wechat-address.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const api_product = require("../../api/product.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
if (!Math) {
  (AddressListPanel + BottomSheetPopup + AddressFormPopup + LiveMiniWindow)();
}
const BottomSheetPopup = () => "../../components/bottom-sheet-popup.js";
const AddressListPanel = () => "../../components/address-list-panel.js";
const AddressFormPopup = () => "../../components/address-form-popup.js";
const LiveMiniWindow = () => "../../components/live-mini-window.js";
const _sfc_main = {
  __name: "confirm",
  setup(__props) {
    const product = common_vendor.ref({
      image: "",
      title: "",
      price: "0.00"
    });
    const quantity = common_vendor.ref(1);
    const remark = common_vendor.ref("");
    const productId = common_vendor.ref(0);
    const skuId = common_vendor.ref(0);
    const liveRoomId = common_vendor.ref(0);
    const liveTermId = common_vendor.ref(0);
    const liveRoomCode = common_vendor.ref("");
    const tenantId = common_vendor.ref(0);
    const address = common_vendor.ref(null);
    const confirmData = common_vendor.ref(null);
    const needAddress = common_vendor.computed(() => {
      var _a;
      return ((_a = confirmData.value) == null ? void 0 : _a.requireAddress) !== 2;
    });
    const loading = common_vendor.ref(false);
    const pendingOrderId = common_vendor.ref(0);
    const showAddressPopup = common_vendor.ref(false);
    const showAddressFormPopup = common_vendor.ref(false);
    const editAddressData = common_vendor.ref(null);
    const addressList = common_vendor.ref([]);
    const selectedAddressId = common_vendor.ref(null);
    function firstValue(source = {}, ...keys) {
      for (const key of keys) {
        const value = source == null ? void 0 : source[key];
        if (value !== void 0 && value !== null && value !== "")
          return value;
      }
      return void 0;
    }
    function toPositiveNumber(value, fallback = 0) {
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? n : fallback;
    }
    function applyOrderQuery(source = {}) {
      productId.value = toPositiveNumber(firstValue(source, "productId", "product_id", "goodsId", "goods_id"), productId.value);
      skuId.value = toPositiveNumber(firstValue(source, "skuId", "sku_id", "productSkuId", "product_sku_id", "specSkuId", "spec_sku_id"), skuId.value);
      quantity.value = toPositiveNumber(firstValue(source, "quantity", "product_num", "totalNum", "total_num"), quantity.value || 1);
      liveRoomId.value = toPositiveNumber(firstValue(source, "roomId", "room_id", "liveRoomId", "live_room_id", "liveId", "live_id"), liveRoomId.value);
      liveTermId.value = toPositiveNumber(firstValue(source, "termId", "term_id", "liveTermId", "live_term_id"), liveTermId.value);
      liveRoomCode.value = utils_liveRoomContext.resolveLiveRoomCode(firstValue(source, "roomCode", "room_code") || liveRoomCode.value);
      tenantId.value = toPositiveNumber(firstValue(source, "tenantId", "tenant_id"), tenantId.value);
      if (source.addressId || source.address_id) {
        address.value = { id: toPositiveNumber(firstValue(source, "addressId", "address_id"), 0) };
      }
      if (source.title || source.productName || source.product_name) {
        product.value.title = firstValue(source, "title", "productName", "product_name");
      }
      if (source.image || source.productImage || source.product_image) {
        product.value.image = firstValue(source, "image", "productImage", "product_image");
      }
      if (source.price || source.productPrice || source.product_price) {
        product.value.price = String(firstValue(source, "price", "productPrice", "product_price"));
      }
    }
    const totalPrice = common_vendor.computed(() => {
      if (confirmData.value)
        return confirmData.value.payAmount || "0.00";
      const total = Number(product.value.price || 0) * quantity.value;
      return total.toFixed(2);
    });
    function getOrderListUrl(status) {
      const code = String(liveRoomCode.value || "").trim();
      return `/pages/order/list?status=${status}${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`;
    }
    const shippingFee = common_vendor.computed(() => {
      if (confirmData.value)
        return confirmData.value.shippingFee || "0.00";
      return "0.00";
    });
    async function loadConfirm() {
      var _a, _b, _c;
      if (!productId.value)
        return;
      try {
        const data = await api_order.confirmOrder({
          tenantId: tenantId.value,
          items: [
            {
              productId: productId.value,
              skuId: skuId.value,
              quantity: quantity.value
            }
          ],
          addressId: ((_a = address.value) == null ? void 0 : _a.id) || 0,
          liveRoomId: liveRoomId.value,
          liveTermId: liveTermId.value
        });
        if (data) {
          confirmData.value = data;
          if (data.address) {
            address.value = data.address;
          }
          if (((_b = data.items) == null ? void 0 : _b.length) > 0) {
            const item = data.items[0];
            product.value = {
              image: item.coverImage || product.value.image,
              title: item.productName || product.value.title,
              price: ((_c = item.price) == null ? void 0 : _c.toFixed(2)) || product.value.price,
              spec: item.skuText || ""
            };
          }
        }
      } catch (err) {
        console.error("[Confirm] loadConfirm fail:", err);
      }
    }
    async function loadDefaultAddress() {
      try {
        const list = await api_address.getAddressList();
        if (Array.isArray(list) && list.length > 0) {
          const def = list.find((a) => a.isDefault === 1) || list[0];
          address.value = def;
        }
      } catch (err) {
        console.error("[Confirm] loadAddress fail:", err);
      }
    }
    common_vendor.onLoad((options) => {
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      applyOrderQuery(options || {});
      if (options == null ? void 0 : options.payload) {
        const parsed = JSON.parse(decodeURIComponent(options.payload));
        applyOrderQuery({ ...options || {}, ...parsed });
      }
      if ((options == null ? void 0 : options.wxAddrDone) === "1") {
        loadDefaultAddress().then(() => {
          common_vendor.index.showToast({ title: "地址导入成功", icon: "success" });
          loadConfirm();
        });
        return;
      }
      loadDefaultAddress().then(() => loadConfirm()).then(() => {
        if (!needAddress.value)
          address.value = null;
      });
    });
    common_vendor.onShow(async () => {
      if (!services_h5AuthContext.ensureH5PageAuth())
        return;
      loadConfirm();
      if (pendingOrderId.value) {
        try {
          const detail = await api_order.getOrderDetail(pendingOrderId.value);
          const status = Number((detail == null ? void 0 : detail.orderStatus) || 0);
          if (status >= 2) {
            pendingOrderId.value = 0;
            common_vendor.index.showToast({ title: "支付成功", icon: "success" });
            setTimeout(() => {
              common_vendor.index.redirectTo({ url: getOrderListUrl("unsend") });
            }, 1200);
            return;
          }
        } catch (e) {
          console.error("[Confirm] check pending order fail:", e);
        }
        pendingOrderId.value = 0;
      }
    });
    async function loadAddressById(addrId) {
      const cached = addressList.value.find((a) => a.id === addrId);
      if (cached) {
        address.value = cached._raw || cached;
        loadConfirm();
        return;
      }
      try {
        const list = await api_address.getAddressList();
        if (Array.isArray(list)) {
          const found = list.find((a) => a.id === addrId);
          if (found) {
            address.value = found;
            loadConfirm();
          }
        }
      } catch (err) {
        console.error("[Confirm] loadAddressById fail:", err);
      }
    }
    async function increaseQty() {
      if (skuId.value) {
        try {
          const stockData = await api_product.getSkuStock(skuId.value);
          if (stockData && quantity.value + 1 > stockData.stock) {
            common_vendor.index.showToast({
              title: `库存不足，最多可购买${stockData.stock}件`,
              icon: "none"
            });
            return;
          }
        } catch (err) {
          console.error("[Confirm] stock check fail:", err);
        }
      }
      quantity.value += 1;
      loadConfirm();
    }
    function decreaseQty() {
      if (quantity.value <= 1)
        return;
      quantity.value -= 1;
      loadConfirm();
    }
    function goAddress() {
      var _a;
      selectedAddressId.value = ((_a = address.value) == null ? void 0 : _a.id) || null;
      loadAddressList();
      showAddressPopup.value = true;
    }
    async function loadAddressList() {
      try {
        const list = await api_address.getAddressList();
        if (Array.isArray(list)) {
          addressList.value = list.map((item) => ({
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
          }));
        }
      } catch (err) {
        console.error("[Confirm] loadAddressList fail:", err);
      }
    }
    function confirmAddressSelect() {
      if (!selectedAddressId.value)
        return;
      showAddressPopup.value = false;
      loadAddressById(selectedAddressId.value);
    }
    function onAddAddress() {
      editAddressData.value = null;
      showAddressFormPopup.value = true;
    }
    function onEditAddress(item) {
      editAddressData.value = (item == null ? void 0 : item._raw) || item;
      showAddressFormPopup.value = true;
    }
    async function onAddressSaved() {
      showAddressFormPopup.value = false;
      await loadAddressList();
      if (!address.value && addressList.value.length > 0) {
        const first = addressList.value[0];
        selectedAddressId.value = first.id;
        loadAddressById(first.id);
      }
    }
    async function onDeleteAddress(item) {
      try {
        await api_address.deleteAddress(item.id);
        common_vendor.index.showToast({ title: "删除成功", icon: "success" });
        if (selectedAddressId.value === item.id) {
          selectedAddressId.value = null;
          address.value = null;
        }
        await loadAddressList();
      } catch (err) {
        console.error("[OrderConfirm] deleteAddress fail:", err);
        common_vendor.index.showToast({ title: "删除失败", icon: "none" });
      }
    }
    async function onImportWx() {
      const ok = await services_wechatAddress.importWxAddress();
      if (ok)
        await loadAddressList();
    }
    async function onPay() {
      var _a, _b;
      if (loading.value)
        return;
      if (needAddress.value && !((_a = address.value) == null ? void 0 : _a.id)) {
        common_vendor.index.showToast({ title: "请选择收货地址", icon: "none" });
        return;
      }
      if (!productId.value) {
        common_vendor.index.showToast({ title: "商品信息异常", icon: "none" });
        return;
      }
      loading.value = true;
      try {
        const orderRes = await api_order.createOrder({
          tenantId: tenantId.value,
          items: [
            {
              productId: productId.value,
              skuId: skuId.value,
              quantity: quantity.value
            }
          ],
          addressId: needAddress.value ? ((_b = address.value) == null ? void 0 : _b.id) || 0 : 0,
          liveRoomId: liveRoomId.value,
          liveTermId: liveTermId.value,
          buyerRemark: remark.value,
          source: liveRoomId.value ? 2 : 1
        });
        if (!(orderRes == null ? void 0 : orderRes.orderNo)) {
          common_vendor.index.showToast({ title: "创建订单失败", icon: "none" });
          return;
        }
        if (orderRes.isDuplicate) {
          console.log("[OrderConfirm] 命中防重复下单，复用已有订单:", orderRes.orderNo);
          common_vendor.index.showToast({ title: "已有待付款订单，正在跳转支付", icon: "none", duration: 1500 });
        }
        pendingOrderId.value = orderRes.orderId || orderRes.ID || 0;
        const payMode = await services_paymentAction.executeYeepayPayment(orderRes.orderNo, {
          roomCode: liveRoomCode.value
        });
        if (payMode === "jsapi") {
          pendingOrderId.value = 0;
        }
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "下单失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: needAddress.value
      }, needAddress.value ? common_vendor.e({
        b: address.value
      }, address.value ? {
        c: common_vendor.t(address.value.receiverName || address.value.name || "--"),
        d: common_vendor.t(address.value.receiverPhone || address.value.mobile || "--"),
        e: common_vendor.t(address.value.fullAddress || address.value.province + address.value.city + address.value.district + address.value.address || "--")
      } : {}, {
        f: common_vendor.o(goAddress, "a3")
      }) : {}, {
        g: product.value.image,
        h: common_vendor.t(product.value.title),
        i: common_vendor.t(product.value.price),
        j: quantity.value <= 1 ? 1 : "",
        k: common_vendor.o(decreaseQty, "35"),
        l: common_vendor.t(quantity.value),
        m: common_vendor.o(increaseQty, "66"),
        n: remark.value,
        o: common_vendor.o(($event) => remark.value = $event.detail.value, "db"),
        p: common_vendor.t(totalPrice.value),
        q: needAddress.value
      }, needAddress.value ? {
        r: common_vendor.t(shippingFee.value)
      } : {}, {
        s: common_vendor.t(totalPrice.value),
        t: common_vendor.o(onPay, "cf"),
        v: common_vendor.o(($event) => selectedAddressId.value = $event, "62"),
        w: common_vendor.o(confirmAddressSelect, "17"),
        x: common_vendor.o(onEditAddress, "8d"),
        y: common_vendor.o(onAddAddress, "84"),
        z: common_vendor.o(onDeleteAddress, "05"),
        A: common_vendor.o(onImportWx, "7b"),
        B: common_vendor.p({
          list: addressList.value,
          ["selected-id"]: selectedAddressId.value,
          title: "地址管理",
          ["button-text"]: "确定",
          ["show-default-row"]: false,
          ["button-disabled"]: !selectedAddressId.value
        }),
        C: common_vendor.o(($event) => showAddressPopup.value = false, "40"),
        D: common_vendor.p({
          visible: showAddressPopup.value,
          height: addressList.value.length === 0 ? "66vh" : "78vh",
          radius: "24rpx 24rpx 0 0",
          duration: 500,
          ["with-mask"]: true,
          ["mask-color"]: "rgba(0, 0, 0, 0.35)"
        }),
        E: common_vendor.o(($event) => showAddressFormPopup.value = false, "97"),
        F: common_vendor.o(onAddressSaved, "60"),
        G: common_vendor.p({
          visible: showAddressFormPopup.value,
          ["edit-data"]: editAddressData.value,
          ["popup-height"]: "78vh"
        }),
        H: common_vendor.p({
          ["room-code"]: liveRoomCode.value,
          ["bottom-offset"]: 180
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-36cb8dad"]]);
wx.createPage(MiniProgramPage);
