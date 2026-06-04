"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const api_refund = require("../../api/refund.js");
const services_paymentAction = require("../../services/payment-action.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
if (!Math) {
  (LiveMiniWindow + OrderLogisticsSheet)();
}
const OrderLogisticsSheet = () => "./components/order-logistics-sheet.js";
const LiveMiniWindow = () => "../../components/live-mini-window.js";
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const logisticsVisible = common_vendor.ref(false);
    const logisticsData = common_vendor.ref(null);
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
    function copyTrackingNo() {
      var _a;
      if (!((_a = logisticsData.value) == null ? void 0 : _a.trackingNo))
        return;
      common_vendor.index.setClipboardData({
        data: logisticsData.value.trackingNo,
        showToast: false,
        success() {
          common_vendor.index.showToast({ title: "物流单号已复制", icon: "none" });
        }
      });
    }
    function splitPrice(priceStr) {
      const [int, dec = "00"] = String(priceStr).split(".");
      return { priceInt: int, priceDec: dec };
    }
    const tabs = [
      { key: "all", label: "全部", status: 0 },
      { key: "unpay", label: "待付款", status: 1 },
      { key: "unsend", label: "待发货", status: 2 },
      { key: "unreceive", label: "待收货", status: 3 },
      { key: "finished", label: "已完成", status: 4 },
      { key: "cancelled", label: "已取消", status: 5 },
      { key: "refund", label: "退款/售后" }
    ];
    const statusTextMap = {
      1: "待付款",
      2: "待发货",
      3: "待收货",
      4: "已完成",
      5: "已取消"
    };
    const statusKeyMap = {
      1: "unpay",
      2: "unsend",
      3: "unreceive",
      4: "finished",
      5: "cancelled"
    };
    const winSourceTextMap = {
      1: "观看奖励",
      2: "抽奖",
      3: "评论抽奖"
    };
    const orderList = common_vendor.ref([]);
    const refundList = common_vendor.ref([]);
    const activeTab = common_vendor.ref("all");
    const scrollLeft = common_vendor.ref(0);
    const page = common_vendor.ref(1);
    const total = common_vendor.ref(0);
    const loadingMore = common_vendor.ref(false);
    const liveRoomCode = common_vendor.ref("");
    const queryOrderNo = common_vendor.ref("");
    function onTabPress(name) {
      activeTab.value = name;
      scrollTabToCenter(name);
    }
    function scrollTabToCenter(tabKey) {
      common_vendor.nextTick$1(() => {
        const query = common_vendor.index.createSelectorQuery();
        query.select(`#tab-${tabKey}`).boundingClientRect();
        query.select(".status-scroll").boundingClientRect();
        query.select(".status-scroll").scrollOffset();
        query.exec((res) => {
          const tabRect = res[0];
          const scrollRect = res[1];
          const scrollInfo = res[2];
          if (!tabRect || !scrollRect || !scrollInfo)
            return;
          const currentScroll = scrollInfo.scrollLeft || 0;
          const tabCenter = tabRect.left - scrollRect.left + currentScroll + tabRect.width / 2;
          const targetScroll = tabCenter - scrollRect.width / 2;
          scrollLeft.value = Math.max(0, targetScroll);
        });
      });
    }
    function buildActions(order) {
      const actions = [];
      const s = order.orderStatus;
      const refundStatus = Number(order.refundStatus || 0);
      const winSource = Number(order.winSource || 0);
      if (s === 1) {
        actions.push({ key: "cancel", label: "取消订单" });
        actions.push({ key: "pay", label: "立即支付", primary: true });
      } else if (s === 2) {
        if (refundStatus === 0 && winSource === 0) {
          actions.push({ key: "refund", label: "申请退款" });
        }
        actions.push({ key: "remind", label: "提醒发货" });
      } else if (s === 3) {
        if (refundStatus === 0 && winSource === 0) {
          actions.push({ key: "refund", label: "申请退款" });
        }
        if (refundStatus === 0) {
          actions.push({ key: "extend", label: "延长收货" });
          actions.push({ key: "logistics", label: "查看物流" });
          actions.push({ key: "confirm", label: "确认收货", primary: true });
        }
      } else if (s === 4) {
        if (refundStatus === 0 && winSource === 0) {
          actions.push({ key: "refund", label: "申请售后" });
        }
        if (refundStatus === 0) {
          actions.push({ key: "rebuy", label: "再次购买" });
        }
      } else if (s === 5) {
        actions.push({ key: "delete", label: "删除订单" });
      }
      return actions;
    }
    function mapOrder(item) {
      var _a, _b;
      const firstItem = ((_a = item.items) == null ? void 0 : _a[0]) || {};
      const priceStr = ((_b = item.payAmount) == null ? void 0 : _b.toFixed(2)) || "0.00";
      const refundStatus = Number(item.refundStatus || 0);
      const winSource = Number(item.winSource || 0);
      const winSourceText = item.winSourceText || winSourceTextMap[winSource] || "";
      const refundMetaMap = {
        1: {
          text: "退款中",
          tagClass: "refund-tag-processing"
        },
        2: {
          text: "已退款",
          tagClass: "refund-tag-success"
        },
        3: {
          text: "部分退款",
          tagClass: "refund-tag-processing"
        }
      };
      const refundMeta = refundMetaMap[refundStatus] || null;
      const isRefundSuccess = refundStatus === 2;
      return {
        id: item.id,
        orderNo: item.orderNo,
        status: statusKeyMap[item.orderStatus] || "all",
        statusText: statusTextMap[item.orderStatus] || "",
        statusClass: item.orderStatus <= 3 ? "status-highlight" : "status-muted",
        image: firstItem.coverImage || "",
        title: firstItem.productName || "",
        spec: firstItem.skuText || "",
        quantity: firstItem.quantity || item.itemCount || 1,
        ...splitPrice(priceStr),
        refundStatus,
        refundTag: (refundMeta == null ? void 0 : refundMeta.text) || "",
        refundTagClass: (refundMeta == null ? void 0 : refundMeta.tagClass) || "",
        winSource,
        winTag: winSourceText ? `${winSourceText}奖品` : "",
        winTime: item.winTime || "",
        cardClass: isRefundSuccess ? "order-card-refund-success" : "",
        roomCode: item.roomCode || item.liveRoomCode || item._roomCode || "",
        isRead: Number((item == null ? void 0 : item.isRead) || 0),
        actions: buildActions(item),
        _raw: item
      };
    }
    function mapRefund(item) {
      const refundStatus = Number((item == null ? void 0 : item.refundStatus) || 0);
      const refundStatusTagMap = {
        1: { text: "待处理", tagClass: "refund-tag-processing" },
        2: { text: "待退货", tagClass: "refund-tag-processing" },
        3: { text: "待商家收货", tagClass: "refund-tag-processing" },
        4: { text: "退款成功", tagClass: "refund-tag-success" },
        5: { text: "退款关闭", tagClass: "refund-tag-closed" },
        6: { text: "退款中", tagClass: "refund-tag-processing" }
      };
      const tagMeta = refundStatusTagMap[refundStatus] || null;
      const priceStr = Number((item == null ? void 0 : item.refundAmount) || 0).toFixed(2);
      const [priceInt, priceDec = "00"] = priceStr.split(".");
      return {
        id: (item == null ? void 0 : item.id) || 0,
        refundNo: (item == null ? void 0 : item.refundNo) || "",
        orderId: (item == null ? void 0 : item.orderId) || 0,
        refundType: Number((item == null ? void 0 : item.refundType) || 0),
        refundTypeText: Number((item == null ? void 0 : item.refundType) || 0) === 2 ? "退货退款" : "仅退款",
        statusText: "退款/售后",
        statusClass: "status-muted",
        refundTag: (tagMeta == null ? void 0 : tagMeta.text) || "售后处理中",
        refundTagClass: (tagMeta == null ? void 0 : tagMeta.tagClass) || "refund-tag-processing",
        refundReason: (item == null ? void 0 : item.refundReason) || "-",
        refundAmount: priceStr,
        priceInt,
        priceDec,
        createdAt: (item == null ? void 0 : item.createdAt) || "-",
        productName: (item == null ? void 0 : item.productName) || "",
        coverImage: (item == null ? void 0 : item.coverImage) || "",
        skuText: (item == null ? void 0 : item.skuText) || "",
        price: (item == null ? void 0 : item.price) || 0,
        quantity: (item == null ? void 0 : item.quantity) || 1,
        isRead: Number((item == null ? void 0 : item.isRead) || 0)
      };
    }
    async function loadOrders(reset = false) {
      if (activeTab.value === "refund") {
        if (reset) {
          refundList.value = [];
        }
        loadingMore.value = true;
        try {
          const data = await api_refund.getRefundList({
            page: page.value,
            pageSize: 20,
            refundStatus: 0
          });
          const list = Array.isArray(data == null ? void 0 : data.list) ? data.list.map(mapRefund) : [];
          refundList.value = list;
          total.value = Number((data == null ? void 0 : data.total) || list.length || 0);
        } catch (err) {
          console.error("[OrderList] loadRefundList fail:", err);
        } finally {
          loadingMore.value = false;
        }
        return;
      }
      if (reset) {
        page.value = 1;
        orderList.value = [];
      }
      const tab = tabs.find((t) => t.key === activeTab.value);
      loadingMore.value = true;
      try {
        const data = await api_order.getOrderList({
          page: page.value,
          pageSize: 10,
          orderStatus: (tab == null ? void 0 : tab.status) ?? 0,
          orderNo: queryOrderNo.value
        });
        const mappedList = ((data == null ? void 0 : data.list) || []).map(mapOrder);
        const list = queryOrderNo.value ? mappedList.filter((item) => String(item.orderNo || "").trim() === queryOrderNo.value) : mappedList;
        if (!liveRoomCode.value) {
          const matchedOrder = list.find((item) => item.roomCode);
          if (matchedOrder == null ? void 0 : matchedOrder.roomCode) {
            liveRoomCode.value = matchedOrder.roomCode;
          }
        }
        if (reset) {
          orderList.value = list;
        } else {
          orderList.value = [...orderList.value, ...list];
        }
        total.value = (data == null ? void 0 : data.total) || list.length;
      } catch (err) {
        console.error("[OrderList] loadOrders fail:", err);
      } finally {
        loadingMore.value = false;
      }
    }
    common_vendor.watch(activeTab, () => {
      loadOrders(true);
    });
    common_vendor.onLoad((options) => {
      liveRoomCode.value = utils_liveRoomContext.resolveLiveRoomCode(options == null ? void 0 : options.roomCode);
      queryOrderNo.value = String((options == null ? void 0 : options.orderNo) || (options == null ? void 0 : options.order_no) || (options == null ? void 0 : options.outTradeNo) || (options == null ? void 0 : options.out_trade_no) || "").trim();
      if (options == null ? void 0 : options.status) {
        const target = tabs.find((item) => item.key === options.status);
        if (target)
          activeTab.value = target.key;
      }
      loadOrders(true);
      scrollTabToCenter(activeTab.value);
    });
    common_vendor.onShow(() => {
      loadOrders(true);
    });
    const filteredOrders = common_vendor.computed(() => orderList.value);
    function goDetail(item) {
      const code = String(item.roomCode || liveRoomCode.value || "").trim();
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?id=${item.id}&status=${item.status}${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`
      });
    }
    function goRefundDetail(item) {
      common_vendor.index.navigateTo({
        url: `/pages/order/refund-detail?refundId=${item.id}${item.orderId ? `&orderId=${item.orderId}` : ""}`
      });
    }
    async function onAction(type, item) {
      if (type === "refund")
        return navigateRefund(item);
      if (type === "pay")
        return handlePayAction(item);
      if (type === "cancel")
        return handleCancelAction(item);
      if (type === "logistics")
        return handleLogisticsAction(item);
      if (type === "remind")
        return showRemindToast();
      if (type === "extend")
        return handleExtendAction(item);
      if (type === "confirm")
        return handleConfirmAction(item);
      if (type === "delete")
        return handleDeleteAction(item);
      if (type === "rebuy")
        return navigateRebuy(item);
    }
    function navigateRefund(item) {
      common_vendor.index.navigateTo({ url: "/pages/order/refund?orderId=" + item.id });
    }
    async function handlePayAction(item) {
      try {
        const code = String(item.roomCode || liveRoomCode.value || "").trim();
        const payMode = await services_paymentAction.executeYeepayPayment(item.orderNo, { roomCode: code });
        if (payMode === "jsapi") {
          common_vendor.index.showToast({ title: "支付成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.redirectTo({
              url: `/pages/order/list?status=unsend${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`
            });
          }, 1200);
        }
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "支付失败", icon: "none" });
      }
    }
    async function confirmDangerAction(msg) {
      return new Promise((resolve) => {
        common_vendor.index.showModal({
          title: "提示",
          content: msg,
          confirmColor: "#ff6b2e",
          success: (res) => resolve(!!res.confirm),
          fail: () => resolve(false)
        });
      });
    }
    async function handleCancelAction(item) {
      if (!await confirmDangerAction("确定取消订单吗？"))
        return;
      try {
        await api_order.cancelOrder(item.id);
        common_vendor.index.showToast({ title: "已取消订单", icon: "none" });
        loadOrders(true);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "取消失败", icon: "none" });
      }
    }
    async function handleLogisticsAction(item) {
      try {
        common_vendor.index.showLoading({ title: "查询中..." });
        const data = await api_order.getLogistics(item.id);
        common_vendor.index.hideLoading();
        if (!(data == null ? void 0 : data.logisticsCompany) && !(data == null ? void 0 : data.trackingNo)) {
          common_vendor.index.showToast({ title: "暂无物流信息", icon: "none" });
          return;
        }
        logisticsData.value = data;
        logisticsVisible.value = true;
      } catch (err) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "获取物流失败", icon: "none" });
      }
    }
    function showRemindToast() {
      common_vendor.index.showToast({ title: "已提醒发货", icon: "none" });
    }
    async function handleExtendAction(item) {
      try {
        await api_order.extendReceive(item.id);
        common_vendor.index.showToast({ title: "延长收货成功", icon: "success" });
        loadOrders(true);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "延长收货失败", icon: "none" });
      }
    }
    async function handleConfirmAction(item) {
      try {
        await api_order.confirmReceive(item.id);
        common_vendor.index.showToast({ title: "确认收货成功", icon: "success" });
        loadOrders(true);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "操作失败", icon: "none" });
      }
    }
    async function handleDeleteAction(item) {
      if (!await confirmDangerAction("确定删除订单吗？"))
        return;
      try {
        await api_order.deleteOrder(item.id);
        common_vendor.index.showToast({ title: "订单已删除", icon: "none" });
        loadOrders(true);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "删除失败", icon: "none" });
      }
    }
    function navigateRebuy(item) {
      var _a;
      const raw = item._raw || {};
      const firstItem = ((_a = raw.items) == null ? void 0 : _a[0]) || {};
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabs, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: common_vendor.n(activeTab.value === tab.key ? "status-tab-text-active" : ""),
            c: tab.key,
            d: `tab-${tab.key}`,
            e: common_vendor.n(activeTab.value === tab.key ? "status-tab-item-active" : ""),
            f: common_vendor.n(index === tabs.length - 1 ? "status-tab-item-last" : ""),
            g: common_vendor.o(($event) => onTabPress(tab.key), tab.key)
          };
        }),
        b: scrollLeft.value,
        c: activeTab.value === "refund"
      }, activeTab.value === "refund" ? common_vendor.e({
        d: refundList.value.length
      }, refundList.value.length ? {
        e: common_vendor.f(refundList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.refundNo),
            b: common_vendor.t(item.statusText),
            c: common_vendor.n(item.statusClass),
            d: item.coverImage,
            e: common_vendor.t(item.productName),
            f: common_vendor.t(item.quantity),
            g: common_vendor.t(item.skuText),
            h: common_vendor.t(item.refundTag),
            i: common_vendor.n(item.refundTagClass),
            j: common_vendor.t(item.priceInt),
            k: common_vendor.t(item.priceDec),
            l: common_vendor.o(($event) => goRefundDetail(item), item.id),
            m: item.id
          };
        })
      } : {}) : filteredOrders.value.length ? {
        g: common_vendor.f(filteredOrders.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.orderNo),
            b: common_vendor.t(item.statusText),
            c: common_vendor.n(item.statusClass),
            d: item.image,
            e: common_vendor.t(item.title),
            f: common_vendor.t(item.quantity),
            g: common_vendor.t(item.spec),
            h: item.winTag || item.refundTag
          }, item.winTag || item.refundTag ? common_vendor.e({
            i: item.winTag
          }, item.winTag ? {
            j: common_vendor.t(item.winTag)
          } : {}, {
            k: item.refundTag
          }, item.refundTag ? {
            l: common_vendor.t(item.refundTag),
            m: common_vendor.n(item.refundTagClass)
          } : {}) : {}, {
            n: common_vendor.t(item.priceInt),
            o: common_vendor.t(item.priceDec),
            p: common_vendor.o(($event) => goDetail(item), item.id),
            q: item.actions.length
          }, item.actions.length ? {
            r: common_vendor.f(item.actions, (action, k1, i1) => {
              return {
                a: common_vendor.t(action.label),
                b: action.key,
                c: common_vendor.n(action.primary ? "action-btn-primary" : ""),
                d: common_vendor.o(($event) => onAction(action.key, item), action.key)
              };
            })
          } : {}, {
            s: item.id,
            t: common_vendor.n(item.cardClass)
          });
        })
      } : {
        h: common_vendor.t(activeTab.value === "refund" ? "暂无退款/售后记录" : queryOrderNo.value ? "未找到关联订单" : "暂无订单")
      }, {
        f: filteredOrders.value.length,
        i: common_vendor.p({
          ["room-code"]: liveRoomCode.value
        }),
        j: logisticsVisible.value
      }, logisticsVisible.value ? {
        k: common_vendor.o(($event) => logisticsVisible.value = false, "36"),
        l: common_vendor.o(copyTrackingNo, "df"),
        m: common_vendor.p({
          ["logistics-data"]: logisticsData.value,
          ["logistics-status-label"]: logisticsStatusLabel.value,
          ["logistics-status-class"]: logisticsStatusClass.value
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-80f8e5f8"]]);
wx.createPage(MiniProgramPage);
