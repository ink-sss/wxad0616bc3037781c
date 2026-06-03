"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_order = require("../../api/order.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
if (!Math) {
  (OrderLogisticsSheet + LiveMiniWindow)();
}
const OrderLogisticsSheet = () => "./components/order-logistics-sheet.js";
const LiveMiniWindow = () => "../../components/live-mini-window.js";
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const orderDetail = common_vendor.ref(null);
    const logisticsVisible = common_vendor.ref(false);
    const logisticsData = common_vendor.ref(null);
    const logisticsLoading = common_vendor.ref(false);
    const addressUpdating = common_vendor.ref(false);
    const ORDER_STATUS_META = {
      1: {
        status: "unpay",
        statusTitle: "待付款",
        subtitle: "请尽快完成支付",
        heroImage: "/static/icons/order1.png",
        heroClass: "status-hero-unpay"
      },
      2: {
        status: "unsend",
        statusTitle: "待发货",
        subtitle: "商家正在备货中，请耐心等待发货",
        heroImage: "/static/icons/order2.png",
        heroClass: "status-hero-unsend"
      },
      3: {
        status: "unreceive",
        statusTitle: "待收货",
        subtitle: "您的包裹正在运输中，请保持电话畅通",
        heroImage: "/static/icons/order2.png",
        heroClass: "status-hero-unreceive"
      },
      4: {
        status: "finished",
        statusTitle: "已完成",
        subtitle: "订单已完成，感谢您的购买",
        heroImage: "/static/icons/order2.png",
        heroClass: "status-hero-finished"
      },
      5: {
        status: "cancelled",
        statusTitle: "已取消",
        subtitle: "订单已取消",
        heroImage: "/static/icons/order2.png",
        heroClass: "status-hero-unsend"
      }
    };
    const heroClass = common_vendor.computed(() => {
      var _a;
      return ((_a = orderDetail.value) == null ? void 0 : _a.heroClass) || "";
    });
    const logisticsStatusLabel = common_vendor.computed(() => {
      var _a;
      const s = (_a = logisticsData.value) == null ? void 0 : _a.status;
      if (s === 3)
        return "已签收";
      if (s === 2)
        return "运输中";
      if (s === 1)
        return "已发货";
      return "查询中";
    });
    const logisticsStatusClass = common_vendor.computed(() => {
      var _a;
      const s = (_a = logisticsData.value) == null ? void 0 : _a.status;
      if (s === 3)
        return "tag-signed";
      if (s === 2)
        return "tag-transit";
      return "tag-default";
    });
    function formatAmount(value) {
      const num = Number(value || 0);
      return num.toFixed(2);
    }
    function resolvePayType(payMethod) {
      const map = {
        4: "易宝支付"
      };
      return map[Number(payMethod)] || "未支付";
    }
    function buildReceiverFullAddress(detail) {
      const region = [
        detail.receiverProvince,
        detail.receiverCity,
        detail.receiverDistrict
      ].filter(Boolean).join("");
      const address = detail.receiverAddress || "";
      if (region && address && !address.startsWith(region)) {
        return `${region}${address}`;
      }
      return address || region;
    }
    function buildActions(detail) {
      const actions = [];
      const orderStatus = Number((detail == null ? void 0 : detail.orderStatus) || 0);
      const refundStatus = Number((detail == null ? void 0 : detail.refundStatus) || 0);
      const winSource = Number((detail == null ? void 0 : detail.winSource) || 0);
      if (orderStatus === 1) {
        actions.push({ key: "pay", label: "立即支付", primary: true });
      }
      if (orderStatus === 2) {
        if (refundStatus === 0 && winSource === 0) {
          actions.push({ key: "refund", label: "申请退款" });
        } else if (refundStatus > 0) {
          actions.push({ key: "progress", label: "售后进度" });
        }
        actions.push({ key: "remind", label: "提醒发货", primary: true });
      }
      if (orderStatus === 3) {
        if (refundStatus === 0 && winSource === 0) {
          actions.push({ key: "refund", label: "申请售后" });
        } else if (refundStatus > 0) {
          actions.push({ key: "progress", label: "售后进度" });
        }
        actions.push({ key: "logistics", label: "查看物流" });
        actions.push({ key: "extend", label: "延长收货" });
        actions.push({ key: "confirm", label: "确认收货", primary: true });
      }
      if (orderStatus === 4) {
        if (refundStatus === 0 && winSource === 0) {
          actions.push({ key: "refund", label: "申请售后" });
        } else if (refundStatus > 0) {
          actions.push({ key: "progress", label: "售后进度" });
        }
        if (refundStatus === 0) {
          actions.push({ key: "rebuy", label: "再次购买", primary: true });
        }
      }
      return actions;
    }
    function mapOrderDetail(detail = {}) {
      var _a, _b;
      const orderStatus = Number(detail.orderStatus || 0);
      const refundStatus = Number(detail.refundStatus || 0);
      const winSource = Number(detail.winSource || 0);
      const canSelectAddress = detail.canSelectAddress ?? (orderStatus === 2 && refundStatus === 0 && winSource > 0);
      let meta = ORDER_STATUS_META[orderStatus] || ORDER_STATUS_META[5];
      if (refundStatus === 2) {
        meta = {
          status: "refund_success",
          statusTitle: "退款成功",
          subtitle: "退款金额已原路返回，请注意查收",
          heroImage: "/static/icons/order3.png",
          heroClass: "status-hero-refund"
        };
      }
      const firstItem = Array.isArray(detail.items) && detail.items.length > 0 ? detail.items[0] : {};
      return {
        id: detail.id || 0,
        status: meta.status,
        statusTitle: meta.statusTitle,
        highlightText: "",
        subtitle: meta.subtitle,
        heroImage: meta.heroImage,
        heroClass: meta.heroClass,
        orderNo: detail.orderNo || "",
        createTime: detail.createdAt || "",
        payType: resolvePayType(detail.payMethod),
        expressType: ((_a = detail.shipping) == null ? void 0 : _a.logisticsCompany) || "暂无物流信息",
        expressNo: ((_b = detail.shipping) == null ? void 0 : _b.trackingNo) || "--",
        address: {
          name: detail.receiverName || "",
          phone: detail.receiverPhone || "",
          fullAddress: buildReceiverFullAddress(detail)
        },
        goods: {
          image: firstItem.coverImage || "",
          title: firstItem.productName || "暂无商品名称",
          spec: firstItem.skuText || "默认规格",
          unitPrice: formatAmount(firstItem.price),
          quantity: Number(firstItem.quantity || 0)
        },
        amount: {
          goodsAmount: formatAmount(detail.totalAmount),
          freightAmount: formatAmount(detail.shippingFee),
          payAmount: formatAmount(detail.payAmount)
        },
        roomCode: detail.roomCode || detail.liveRoomCode || detail._roomCode || "",
        winSource,
        winSourceText: detail.winSourceText || "",
        canSelectAddress: Boolean(canSelectAddress),
        actions: buildActions(detail),
        raw: detail,
        refundId: Number(detail.refundId || detail.refund_id || detail.afterSaleId || detail.after_sale_id || 0)
      };
    }
    async function loadOrderDetail(orderId) {
      const id = Number(orderId || 0);
      if (!id) {
        common_vendor.index.showToast({ title: "订单参数错误", icon: "none" });
        return;
      }
      try {
        const data = await api_order.getOrderDetail(id);
        orderDetail.value = mapOrderDetail(data || {});
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "获取订单详情失败", icon: "none" });
      }
    }
    function copyOrderNo() {
      var _a;
      if (!((_a = orderDetail.value) == null ? void 0 : _a.orderNo))
        return;
      common_vendor.index.setClipboardData({
        data: orderDetail.value.orderNo,
        success() {
          common_vendor.index.showToast({ title: "订单号已复制", icon: "none" });
        }
      });
    }
    function onExpressNoClick() {
      var _a;
      if (((_a = orderDetail.value) == null ? void 0 : _a.expressNo) === "--")
        return;
      handleAction("logistics");
    }
    function openAddressSelect() {
      var _a;
      if (!((_a = orderDetail.value) == null ? void 0 : _a.canSelectAddress))
        return;
      common_vendor.index.navigateTo({ url: "/pages/address/index?select=1" });
    }
    async function onAddressSelected(addressId) {
      var _a;
      const id = Number(addressId || 0);
      const orderId = ((_a = orderDetail.value) == null ? void 0 : _a.id) || 0;
      if (!id || !orderId || addressUpdating.value)
        return;
      addressUpdating.value = true;
      try {
        await api_order.updatePrizeOrderAddress({ orderId, addressId: id });
        common_vendor.index.showToast({ title: "收货地址已更新", icon: "success" });
        await loadOrderDetail(orderId);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "更新地址失败", icon: "none" });
      } finally {
        addressUpdating.value = false;
      }
    }
    function copyTrackingNo() {
      var _a;
      if (!((_a = logisticsData.value) == null ? void 0 : _a.trackingNo))
        return;
      common_vendor.index.setClipboardData({
        data: logisticsData.value.trackingNo,
        success() {
          common_vendor.index.showToast({ title: "物流单号已复制", icon: "none" });
        }
      });
    }
    async function handleAction(action) {
      if (action === "refund")
        return navigateRefund();
      if (action === "cancel")
        return handleCancelAction();
      if (action === "confirm")
        return handleConfirmAction();
      if (action === "logistics")
        return handleLogisticsAction();
      if (action === "remind")
        return common_vendor.index.showToast({ title: "已提醒发货", icon: "success" });
      if (action === "extend")
        return handleExtendAction();
      if (action === "pay")
        return navigatePay();
      if (action === "progress")
        return navigateRefundProgress();
      if (action === "rebuy")
        return navigateRebuy();
      return navigateOrderList();
    }
    function navigateRefund() {
      common_vendor.index.navigateTo({
        url: "/pages/order/refund?orderId=" + orderDetail.value.id
      });
    }
    function getRoomCodeQuery() {
      var _a;
      const code = String(((_a = orderDetail.value) == null ? void 0 : _a.roomCode) || "").trim();
      return code ? `&roomCode=${encodeURIComponent(code)}` : "";
    }
    function navigatePay() {
      var _a;
      const detail = orderDetail.value || {};
      const orderNo = String(detail.orderNo || ((_a = detail.raw) == null ? void 0 : _a.orderNo) || "").trim();
      if (!orderNo) {
        common_vendor.index.showToast({ title: "订单号缺失，无法支付", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/order/pay?orderNo=${encodeURIComponent(orderNo)}&id=${encodeURIComponent(detail.id || "")}${getRoomCodeQuery()}`
      });
    }
    function navigateRefundProgress() {
      var _a, _b, _c;
      const detail = orderDetail.value || {};
      const refundId = Number(detail.refundId || ((_a = detail.raw) == null ? void 0 : _a.refundId) || ((_b = detail.raw) == null ? void 0 : _b.refund_id) || ((_c = detail.raw) == null ? void 0 : _c.afterSaleId) || 0);
      if (refundId) {
        common_vendor.index.navigateTo({
          url: `/pages/order/refund-detail?refundId=${encodeURIComponent(refundId)}&orderId=${encodeURIComponent(detail.id || "")}${getRoomCodeQuery()}`
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/order/list?status=refund${getRoomCodeQuery()}`
      });
    }
    function navigateOrderList() {
      var _a;
      common_vendor.index.navigateTo({
        url: `/pages/order/list?status=${((_a = orderDetail.value) == null ? void 0 : _a.status) || "all"}${getRoomCodeQuery()}`
      });
    }
    async function handleCancelAction() {
      try {
        await api_order.cancelOrder(orderDetail.value.id);
        common_vendor.index.showToast({ title: "已取消订单", icon: "success" });
        await loadOrderDetail(orderDetail.value.id);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "取消订单失败", icon: "none" });
      }
    }
    async function handleConfirmAction() {
      try {
        await api_order.confirmReceive(orderDetail.value.id);
        common_vendor.index.showToast({ title: "确认收货成功", icon: "success" });
        await loadOrderDetail(orderDetail.value.id);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "确认收货失败", icon: "none" });
      }
    }
    async function handleLogisticsAction() {
      try {
        logisticsLoading.value = true;
        const data = await api_order.getLogistics(orderDetail.value.id);
        if (!(data == null ? void 0 : data.logisticsCompany) && !(data == null ? void 0 : data.trackingNo)) {
          common_vendor.index.showToast({ title: "暂无物流信息", icon: "none" });
          return;
        }
        logisticsData.value = data;
        logisticsVisible.value = true;
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "获取物流失败", icon: "none" });
      } finally {
        logisticsLoading.value = false;
      }
    }
    async function handleExtendAction() {
      try {
        await api_order.extendReceive(orderDetail.value.id);
        common_vendor.index.showToast({ title: "延长收货成功", icon: "success" });
        await loadOrderDetail(orderDetail.value.id);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "延长收货失败", icon: "none" });
      }
    }
    function navigateRebuy() {
      var _a, _b;
      const raw = ((_a = orderDetail.value) == null ? void 0 : _a.raw) || {};
      const firstItem = ((_b = raw.items) == null ? void 0 : _b[0]) || {};
      const payload = encodeURIComponent(
        JSON.stringify({
          productId: firstItem.productId || 0,
          skuId: firstItem.skuId || 0,
          quantity: firstItem.quantity || 1,
          roomId: raw.liveRoomId || raw.roomId || 0,
          title: firstItem.productName || "",
          image: firstItem.coverImage || "",
          price: firstItem.price || 0
        })
      );
      common_vendor.index.navigateTo({ url: "/pages/order/confirm?payload=" + payload });
    }
    common_vendor.onLoad((options) => {
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      common_vendor.index.$off("address-selected", onAddressSelected);
      common_vendor.index.$on("address-selected", onAddressSelected);
      const routeRoomCode = utils_liveRoomContext.resolveLiveRoomCode(options == null ? void 0 : options.roomCode);
      loadOrderDetail((options == null ? void 0 : options.id) || (options == null ? void 0 : options.orderId)).then(() => {
        if (routeRoomCode && orderDetail.value && !orderDetail.value.roomCode) {
          orderDetail.value.roomCode = routeRoomCode;
        }
      });
    });
    common_vendor.onUnload(() => {
      common_vendor.index.$off("address-selected", onAddressSelected);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: orderDetail.value
      }, orderDetail.value ? common_vendor.e({
        b: common_vendor.t(orderDetail.value.statusTitle),
        c: orderDetail.value.highlightText
      }, orderDetail.value.highlightText ? {
        d: common_vendor.t(orderDetail.value.highlightText)
      } : {}, {
        e: common_vendor.t(orderDetail.value.subtitle),
        f: orderDetail.value.heroImage,
        g: common_vendor.n(heroClass.value),
        h: common_assets._imports_0$3,
        i: orderDetail.value.address.fullAddress
      }, orderDetail.value.address.fullAddress ? {
        j: common_vendor.t(orderDetail.value.address.name),
        k: common_vendor.t(orderDetail.value.address.phone)
      } : {}, {
        l: orderDetail.value.address.fullAddress
      }, orderDetail.value.address.fullAddress ? {
        m: common_vendor.t(orderDetail.value.address.fullAddress)
      } : {}, {
        n: orderDetail.value.canSelectAddress
      }, orderDetail.value.canSelectAddress ? {
        o: common_vendor.t(orderDetail.value.address.fullAddress ? "更换" : "选择"),
        p: common_vendor.o(openAddressSelect, "99")
      } : {}, {
        q: orderDetail.value.canSelectAddress ? 1 : "",
        r: common_vendor.o(openAddressSelect, "86"),
        s: orderDetail.value.goods.image,
        t: common_vendor.t(orderDetail.value.goods.title),
        v: common_vendor.t(orderDetail.value.goods.unitPrice),
        w: common_vendor.t(orderDetail.value.goods.spec),
        x: common_vendor.t(orderDetail.value.goods.quantity),
        y: common_vendor.t(orderDetail.value.amount.goodsAmount),
        z: common_vendor.t(orderDetail.value.amount.freightAmount),
        A: common_vendor.t(orderDetail.value.amount.payAmount),
        B: common_vendor.t(orderDetail.value.orderNo),
        C: common_assets._imports_0$4,
        D: common_vendor.o(copyOrderNo, "54"),
        E: common_vendor.t(orderDetail.value.createTime),
        F: common_vendor.t(orderDetail.value.payType),
        G: common_vendor.t(orderDetail.value.expressType),
        H: common_vendor.t(orderDetail.value.expressNo),
        I: orderDetail.value.expressNo !== "--"
      }, orderDetail.value.expressNo !== "--" ? {} : {}, {
        J: orderDetail.value.expressNo !== "--" ? 1 : "",
        K: common_vendor.o(onExpressNoClick, "b1"),
        L: common_vendor.f(orderDetail.value.actions, (action, k0, i0) => {
          return {
            a: common_vendor.t(action.label),
            b: action.key,
            c: common_vendor.n(action.primary ? "bottom-btn-primary" : ""),
            d: common_vendor.o(($event) => handleAction(action.key), action.key)
          };
        }),
        M: logisticsVisible.value
      }, logisticsVisible.value ? {
        N: common_vendor.o(($event) => logisticsVisible.value = false, "dc"),
        O: common_vendor.o(copyTrackingNo, "66"),
        P: common_vendor.p({
          ["logistics-data"]: logisticsData.value,
          ["logistics-status-label"]: logisticsStatusLabel.value,
          ["logistics-status-class"]: logisticsStatusClass.value
        })
      } : {}, {
        Q: common_vendor.p({
          ["room-code"]: orderDetail.value.roomCode,
          ["bottom-offset"]: 380
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5511cfa9"]]);
wx.createPage(MiniProgramPage);
