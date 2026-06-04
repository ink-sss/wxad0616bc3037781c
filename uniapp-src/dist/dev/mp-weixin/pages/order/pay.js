"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const services_paymentAction = require("../../services/payment-action.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const utils_liveRoomNavigation = require("../../utils/live-room-navigation.js");
if (!Math) {
  LiveMiniWindow();
}
const LiveMiniWindow = () => "../../components/live-mini-window.js";
const _sfc_main = {
  __name: "pay",
  setup(__props) {
    const status = common_vendor.ref("loading");
    const errorMsg = common_vendor.ref("");
    const orderNo = common_vendor.ref("");
    const orderId = common_vendor.ref(0);
    const liveRoomCode = common_vendor.ref("");
    const preferredChannelType = common_vendor.ref(0);
    const returnOrigin = common_vendor.ref("");
    const orderDetail = common_vendor.ref(null);
    const canBackLive = common_vendor.computed(() => !!returnOrigin.value && !!liveRoomCode.value);
    const orderItems = common_vendor.computed(() => {
      var _a;
      const items = (_a = orderDetail.value) == null ? void 0 : _a.items;
      return Array.isArray(items) ? items : [];
    });
    const statusTitle = common_vendor.computed(() => {
      if (status.value === "loading")
        return "正在准备支付";
      if (status.value === "paying")
        return "正在发起支付";
      if (status.value === "success")
        return "支付成功";
      return errorMsg.value || "支付失败";
    });
    const statusHint = common_vendor.computed(() => {
      if (status.value === "loading" || status.value === "paying")
        return "请稍候，即将弹出支付窗口...";
      if (status.value === "success")
        return "订单已支付完成";
      return "请检查网络后重试";
    });
    const statusHeaderClass = common_vendor.computed(() => {
      if (status.value === "success")
        return "header-success";
      if (status.value === "fail")
        return "header-fail";
      return "header-loading";
    });
    function formatPrice(val) {
      const n = Number(val);
      if (!Number.isFinite(n))
        return "0.00";
      return n.toFixed(2);
    }
    function maskPhone(phone) {
      if (!phone || phone.length < 7)
        return phone || "";
      return phone.substring(0, 3) + "****" + phone.substring(7);
    }
    async function loadOrderDetail() {
      if (!orderId.value)
        return;
      try {
        const detail = await api_order.getOrderDetail(orderId.value);
        if (detail) {
          orderDetail.value = detail;
        }
      } catch (e) {
        console.warn("[Pay] 获取订单详情失败:", e);
      }
    }
    async function doPay() {
      if (!orderNo.value) {
        status.value = "fail";
        errorMsg.value = "订单号缺失";
        return;
      }
      status.value = "paying";
      try {
        const payMode = await services_paymentAction.executeYeepayPayment(orderNo.value, {
          channelType: preferredChannelType.value || 4,
          roomCode: liveRoomCode.value
        });
        if (payMode === "cashier") {
          return;
        }
        status.value = "success";
      } catch (err) {
        status.value = "fail";
        errorMsg.value = (err == null ? void 0 : err.message) || "支付失败，请重试";
        if (orderId.value) {
          api_order.markOrderUnread(orderId.value).catch(() => {
          });
        }
      }
    }
    function retryPay() {
      doPay();
    }
    function goOrderList() {
      const code = String(liveRoomCode.value || "").trim();
      common_vendor.index.reLaunch({
        url: `/pages/order/list?status=unpay${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`
      });
    }
    function goBackLiveRoom() {
      const code = String(liveRoomCode.value || "").trim();
      if (!code)
        return;
      utils_liveRoomNavigation.returnToLiveRoom(code);
    }
    common_vendor.onLoad(async (query) => {
      orderNo.value = (query == null ? void 0 : query.orderNo) || "";
      orderId.value = Number((query == null ? void 0 : query.orderId) || (query == null ? void 0 : query.id)) || 0;
      liveRoomCode.value = utils_liveRoomContext.resolveLiveRoomCode(query == null ? void 0 : query.roomCode);
      preferredChannelType.value = Number(query == null ? void 0 : query.channelType) || 0;
      returnOrigin.value = decodeURIComponent((query == null ? void 0 : query.returnOrigin) || "");
      if (!orderNo.value) {
        status.value = "fail";
        errorMsg.value = "订单号缺失";
        return;
      }
      loadOrderDetail();
      doPay();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: status.value === "loading" || status.value === "paying"
      }, status.value === "loading" || status.value === "paying" ? {} : status.value === "success" ? {} : status.value === "fail" ? {} : {}, {
        b: status.value === "success",
        c: status.value === "fail",
        d: common_vendor.t(statusTitle.value),
        e: common_vendor.t(statusHint.value),
        f: common_vendor.n(statusHeaderClass.value),
        g: orderDetail.value && orderItems.value.length
      }, orderDetail.value && orderItems.value.length ? {
        h: common_vendor.f(orderItems.value, (item, idx, i0) => {
          return common_vendor.e({
            a: item.coverImage
          }, item.coverImage ? {
            b: item.coverImage
          } : {}, {
            c: common_vendor.t(item.productName),
            d: item.skuText
          }, item.skuText ? {
            e: common_vendor.t(item.skuText)
          } : {}, {
            f: common_vendor.t(formatPrice(item.price)),
            g: common_vendor.t(item.quantity),
            h: idx
          });
        })
      } : {}, {
        i: common_vendor.t(orderNo.value),
        j: orderDetail.value
      }, orderDetail.value ? {
        k: common_vendor.t(formatPrice(orderDetail.value.totalAmount))
      } : {}, {
        l: orderDetail.value && orderDetail.value.shippingFee > 0
      }, orderDetail.value && orderDetail.value.shippingFee > 0 ? {
        m: common_vendor.t(formatPrice(orderDetail.value.shippingFee))
      } : {}, {
        n: orderDetail.value && orderDetail.value.discountAmount > 0
      }, orderDetail.value && orderDetail.value.discountAmount > 0 ? {
        o: common_vendor.t(formatPrice(orderDetail.value.discountAmount))
      } : {}, {
        p: common_vendor.t(orderDetail.value ? formatPrice(orderDetail.value.payAmount) : "--"),
        q: orderDetail.value && orderDetail.value.receiverName
      }, orderDetail.value && orderDetail.value.receiverName ? {
        r: common_vendor.t(orderDetail.value.receiverName),
        s: common_vendor.t(maskPhone(orderDetail.value.receiverPhone)),
        t: common_vendor.t(orderDetail.value.receiverAddress)
      } : {}, {
        v: status.value === "loading" || status.value === "paying"
      }, status.value === "loading" || status.value === "paying" ? {} : status.value === "success" ? common_vendor.e({
        x: canBackLive.value
      }, canBackLive.value ? {
        y: common_vendor.o(goBackLiveRoom, "ee")
      } : {}, {
        z: common_vendor.o(goOrderList, "6c"),
        A: canBackLive.value ? 1 : ""
      }) : status.value === "fail" ? common_vendor.e({
        C: canBackLive.value
      }, canBackLive.value ? {
        D: common_vendor.o(goBackLiveRoom, "3c")
      } : {}, {
        E: common_vendor.o(goOrderList, "b0"),
        F: common_vendor.o(retryPay, "b1")
      }) : {}, {
        w: status.value === "success",
        B: status.value === "fail",
        G: common_vendor.p({
          ["room-code"]: liveRoomCode.value,
          ["return-origin"]: returnOrigin.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-faef4742"]]);
wx.createPage(MiniProgramPage);
