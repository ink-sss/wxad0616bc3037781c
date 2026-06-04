"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_routeNavigation = require("../../utils/route-navigation.js");
const base = "https://man.lqjy.cc/static/Public/Home/Images";
const _sfc_main = {
  __name: "WechatLotteryResultModals",
  props: {
    activeModal: {
      type: String,
      required: true
    },
    prize: {
      type: Object,
      default: () => ({})
    },
    recordUrl: {
      type: String,
      default: "/pages/prize-record/index"
    }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const image = {
      floorClose: `${base}/Watch/luckydraw/floorClose.png`,
      lotteryTop: `${base}/Watch/luckydraw/lotteryTop3.png`,
      lotteryFloor: `${base}/Watch/luckydraw/lotteryFloor.png`,
      lotteryLine: `${base}/Watch/luckydraw/lotteryFloorLine.png`,
      congrats: `${base}/Watch/luckydraw/luckydrawCongrats.png`,
      writeoff: `${base}/Watch/luckydraw/write-offRemind.png`,
      copyIcon: `${base}/Watch/luckydraw/copyIcon.png`,
      element: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-pkenvelope-element3-b60b22b7.png"
    };
    function firstValue(source = {}, ...keys) {
      for (const key of keys) {
        const value = source == null ? void 0 : source[key];
        if (value !== void 0 && value !== null && value !== "")
          return value;
      }
      return void 0;
    }
    function appendQuery(route, params = {}) {
      const entries = Object.entries(params).filter(([, value]) => value !== void 0 && value !== null && value !== "");
      if (!route || !entries.length)
        return route;
      const query = entries.filter(([key]) => !new RegExp(`[?&]${key}=`).test(route)).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
      if (!query)
        return route;
      return `${route}${route.includes("?") ? "&" : "?"}${query}`;
    }
    const prizeTitle = common_vendor.computed(() => firstValue(props.prize, "name", "title", "prizeName", "prize_name", "rewardName", "reward_name", "productName", "product_name") || "抽奖奖品");
    const orderNo = common_vendor.computed(() => firstValue(props.prize, "orderNo", "order_no", "outTradeNo", "out_trade_no") || "");
    const orderId = common_vendor.computed(() => firstValue(props.prize, "orderId", "order_id") || "");
    const roomCode = common_vendor.computed(() => firstValue(props.prize, "roomCode", "room_code", "liveRoomCode", "live_room_code", "_roomCode") || "");
    const orderDetailUrl = common_vendor.computed(() => firstValue(props.prize, "orderDetailUrl", "order_detail_url", "orderUrl", "order_url", "detailUrl", "detail_url") || "");
    const winRecordUrl = common_vendor.computed(() => firstValue(props.prize, "winRecordUrl", "win_record_url", "recordUrl", "record_url") || props.recordUrl);
    const orderText = common_vendor.computed(() => orderNo.value ? `订单号：${orderNo.value}` : "奖品已发放至中奖记录");
    const actionText = common_vendor.computed(() => getOrderTarget() ? "查看订单" : "查看奖品");
    function normalizeRoute(url) {
      if (!url)
        return "";
      return utils_routeNavigation.normalizeAppRoute(url);
    }
    function navigateTo(url) {
      const route = normalizeRoute(url);
      if (!route) {
        common_vendor.index.showToast({ title: "暂无可查看内容", icon: "none" });
        return;
      }
      utils_routeNavigation.navigateWithH5Fallback(route);
    }
    function getOrderTarget() {
      const rawDetailUrl = orderDetailUrl.value;
      if (rawDetailUrl) {
        const detailUrl = utils_routeNavigation.normalizeAppRoute(rawDetailUrl);
        if (!/^https?:\/\//i.test(detailUrl)) {
          return appendQuery(detailUrl, { roomCode: roomCode.value });
        }
        if (!orderId.value && !orderNo.value)
          return detailUrl;
      }
      if (orderId.value) {
        return appendQuery("/pages/order/detail", { id: orderId.value, roomCode: roomCode.value });
      }
      if (orderNo.value) {
        return appendQuery("/pages/order/list", { orderNo: orderNo.value, roomCode: roomCode.value });
      }
      return "";
    }
    function handlePrizeAction() {
      const orderTarget = getOrderTarget();
      if (orderTarget)
        return navigateTo(orderTarget);
      handleRecordAction();
    }
    function handleRecordAction() {
      utils_routeNavigation.navigateToPrizeRecord(winRecordUrl.value || props.recordUrl);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.activeModal === "wechatLotteryWin"
      }, __props.activeModal === "wechatLotteryWin" ? {
        b: common_vendor.f(6, (index, k0, i0) => {
          return {
            a: index,
            b: common_vendor.n(`element${index}`)
          };
        }),
        c: image.element,
        d: image.lotteryTop,
        e: image.lotteryFloor,
        f: image.lotteryLine,
        g: image.congrats,
        h: common_vendor.t(prizeTitle.value),
        i: image.writeoff,
        j: common_vendor.t(orderText.value),
        k: image.copyIcon,
        l: common_vendor.t(actionText.value),
        m: common_vendor.o(handlePrizeAction, "d6"),
        n: common_vendor.o(handleRecordAction, "f9"),
        o: image.floorClose,
        p: common_vendor.o(($event) => emit("close"), "2c")
      } : {}, {
        q: __props.activeModal === "wechatLotteryLose"
      }, __props.activeModal === "wechatLotteryLose" ? {
        r: common_vendor.o(handleRecordAction, "ba"),
        s: image.floorClose,
        t: common_vendor.o(($event) => emit("close"), "25")
      } : {}, {
        v: __props.activeModal === "wechatLotteryPerfect"
      }, __props.activeModal === "wechatLotteryPerfect" ? {
        w: image.floorClose,
        x: common_vendor.o(($event) => emit("close"), "45")
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-23f7bbe9"]]);
wx.createComponent(Component);
