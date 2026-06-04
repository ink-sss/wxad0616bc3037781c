"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const utils_liveRoomNavigation = require("../../utils/live-room-navigation.js");
if (!Math) {
  LiveMiniWindow();
}
const LiveMiniWindow = () => "../../components/live-mini-window.js";
const _sfc_main = {
  __name: "receipt",
  setup(__props) {
    const receiptDetail = common_vendor.ref(null);
    const loadError = common_vendor.ref("");
    const debugParams = common_vendor.ref({ outTradeNo: "", subMchId: "", checkCode: "", raw: "" });
    const ORDER_STATUS_META = {
      1: { statusTitle: "待付款" },
      2: { statusTitle: "待发货" },
      3: { statusTitle: "待收货" },
      4: { statusTitle: "已完成" },
      5: { statusTitle: "已取消" }
    };
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
    function mapReceiptDetail(detail = {}) {
      const firstItem = Array.isArray(detail.items) && detail.items.length > 0 ? detail.items[0] : {};
      const meta = ORDER_STATUS_META[Number(detail.orderStatus || 0)] || ORDER_STATUS_META[5];
      return {
        id: detail.id || 0,
        statusTitle: meta.statusTitle,
        orderNo: detail.orderNo || "",
        createTime: detail.createdAt || "",
        payType: resolvePayType(detail.payMethod),
        address: {
          name: detail.receiverName || "",
          phone: detail.receiverPhone || "",
          fullAddress: detail.receiverAddress || ""
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
        roomCode: detail.roomCode || detail.liveRoomCode || "",
        liveType: detail.liveType || ""
      };
    }
    async function loadReceiptDetail(orderNo, subMchId, orderId) {
      try {
        const detail = orderNo ? await api_order.getReceiptDetail(orderNo, subMchId) : await api_order.getOrderDetail(orderId);
        receiptDetail.value = mapReceiptDetail(detail || {});
        loadError.value = "";
      } catch (err) {
        const errMsg = (err == null ? void 0 : err.message) || (err == null ? void 0 : err.errMsg) || "订单信息加载失败";
        console.error("[Receipt] 获取小票失败:", err);
        loadError.value = errMsg;
      }
    }
    function goOrderList() {
      var _a;
      const code = String(((_a = receiptDetail.value) == null ? void 0 : _a.roomCode) || "").trim();
      common_vendor.index.reLaunch({
        url: `/pages/order/list?status=unsend${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`
      });
    }
    function goBackLive() {
      var _a, _b;
      const code = (_a = receiptDetail.value) == null ? void 0 : _a.roomCode;
      if (!code)
        return;
      const liveType = String(((_b = receiptDetail.value) == null ? void 0 : _b.liveType) || "").trim();
      utils_liveRoomNavigation.returnToLiveRoom(code, liveType ? { liveType } : {});
    }
    common_vendor.onLoad((options = {}) => {
      const outTradeNo = String(
        options.out_trade_no || options.orderNo || options.outTradeNo || ""
      ).trim();
      const orderId = Number(options.id || options.orderId || options.order_id || 0);
      const subMchId = String(options.sub_mch_id || options.subMchId || "").trim();
      const checkCode = String(options.check_code || options.checkCode || "").trim();
      debugParams.value = {
        outTradeNo,
        subMchId,
        checkCode,
        raw: JSON.stringify(options || {})
      };
      if (!outTradeNo && !orderId) {
        loadError.value = "缺少订单参数";
        return;
      }
      loadReceiptDetail(outTradeNo, subMchId, orderId);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: receiptDetail.value
      }, receiptDetail.value ? common_vendor.e({
        b: common_vendor.t(receiptDetail.value.orderNo),
        c: common_vendor.t(receiptDetail.value.amount.goodsAmount),
        d: common_vendor.t(receiptDetail.value.amount.freightAmount),
        e: common_vendor.t(receiptDetail.value.amount.payAmount),
        f: common_vendor.o(goOrderList, "b3"),
        g: receiptDetail.value.roomCode
      }, receiptDetail.value.roomCode ? {
        h: common_vendor.o(goBackLive, "ae")
      } : {}, {
        i: common_vendor.p({
          ["room-code"]: receiptDetail.value.roomCode,
          enabled: true
        })
      }) : loadError.value ? {
        k: common_vendor.t(loadError.value),
        l: common_vendor.t(debugParams.value.outTradeNo || "(空)"),
        m: common_vendor.t(debugParams.value.subMchId || "(空)"),
        n: common_vendor.t(debugParams.value.checkCode ? "已收到" : "(空)"),
        o: common_vendor.t(debugParams.value.raw)
      } : {}, {
        j: loadError.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-630cbc0b"]]);
wx.createPage(MiniProgramPage);
