"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const api_refund = require("../../api/refund.js");
const api_user = require("../../api/user.js");
const stores_user = require("../../stores/user.js");
const services_logout = require("../../services/logout.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const utils_liveRoute = require("../../utils/live-route.js");
const utils_liveRoomNavigation = require("../../utils/live-room-navigation.js");
const utils_routeNavigation = require("../../utils/route-navigation.js");
if (!Math) {
  (CenterSectionCard + LiveMiniWindow)();
}
const CenterSectionCard = () => "../../components/center-section-card.js";
const LiveMiniWindow = () => "../../components/live-mini-window.js";
const DEFAULT_AVATAR = "https://man.lqjy.cc/static/login-default.png";
const iconBase = "https://man.lqjy.cc/static/icons/";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const name = common_vendor.ref("用户");
    const avatar = common_vendor.ref(DEFAULT_AVATAR);
    const liveRoomCode = common_vendor.ref("");
    const liveRoomId = common_vendor.ref(0);
    const liveRoomContext = common_vendor.ref({});
    const isDistributor = common_vendor.ref(false);
    const distributorStatus = common_vendor.ref(0);
    const enableShare = common_vendor.ref(1);
    const nameTapCount = common_vendor.ref(0);
    let nameTapTimer = null;
    let lastQuery = {};
    const orderStats = common_vendor.ref({
      waitPay: 0,
      waitShip: 0,
      waitReceive: 0,
      waitReview: 0,
      refunding: 0
    });
    const orderItems = common_vendor.computed(() => [
      {
        key: "unpay",
        label: "待付款",
        icon: `${iconBase}order_0.png`,
        badge: orderStats.value.waitPay || 0
      },
      {
        key: "unsend",
        label: "待发货",
        icon: `${iconBase}order_1.png`,
        badge: orderStats.value.waitShip || 0
      },
      {
        key: "unreceive",
        label: "待收货",
        icon: `${iconBase}order_2.png`,
        badge: orderStats.value.waitReceive || 0
      },
      {
        key: "finished",
        label: "已完成",
        icon: `${iconBase}order_3.png`,
        badge: orderStats.value.waitReview || 0
      },
      {
        key: "refund",
        label: "退款/售后",
        icon: `${iconBase}order_4.png`,
        badge: orderStats.value.refunding || 0
      }
    ]);
    const moreItems = common_vendor.computed(() => {
      const items = [
        {
          key: "prizeRecord",
          label: "中奖记录",
          icon: `${iconBase}more1.png`
        }
      ];
      if (enableShare.value !== 0 && isDistributor.value && distributorStatus.value === 1) {
        items.push({
          key: "invitationRecord",
          label: "邀请记录",
          icon: `${iconBase}more2.png`
        });
      }
      items.push({ key: "address", label: "收货地址", icon: `${iconBase}more3.png` });
      items.push({ key: "complaint", label: "投诉", icon: `${iconBase}more4.png` });
      return items;
    });
    function normalizeCustomerName(customer = {}) {
      return customer.nickname || customer.nickName || customer.userName || customer.username || customer.name || customer.mobile || customer.phone || "用户";
    }
    function normalizeCustomerAvatar(customer = {}) {
      return customer.avatar || customer.avatarUrl || customer.headimgurl || customer.headImg || customer.head || DEFAULT_AVATAR;
    }
    function applyCustomer(customer = {}) {
      if (!customer || typeof customer !== "object")
        return;
      name.value = normalizeCustomerName(customer);
      avatar.value = normalizeCustomerAvatar(customer);
    }
    function applyCachedCustomer() {
      const userStore = stores_user.useUserStore();
      const cached = services_h5AuthContext.readCachedH5Customer() || userStore.userInfo || null;
      if (cached)
        applyCustomer(cached);
    }
    function resetNameTapState() {
      nameTapCount.value = 0;
      if (nameTapTimer) {
        clearTimeout(nameTapTimer);
        nameTapTimer = null;
      }
    }
    function handleNameTap() {
      nameTapCount.value += 1;
      if (nameTapTimer) {
        clearTimeout(nameTapTimer);
      }
      if (nameTapCount.value >= 10) {
        resetNameTapState();
        services_logout.logoutAndRedirect();
        return;
      }
      nameTapTimer = setTimeout(() => {
        resetNameTapState();
      }, 3e3);
    }
    function normalizeStats(orderUnreadStats = {}, refundUnreadStats = {}) {
      return {
        waitPay: Number(orderUnreadStats.unpay || orderUnreadStats.waitPay || orderUnreadStats.wait_pay || 0),
        waitShip: Number(orderUnreadStats.unsend || orderUnreadStats.waitShip || orderUnreadStats.wait_ship || 0),
        waitReceive: Number(orderUnreadStats.unreceive || orderUnreadStats.waitReceive || orderUnreadStats.wait_receive || 0),
        waitReview: Number(orderUnreadStats.finished || orderUnreadStats.waitReview || orderUnreadStats.wait_review || 0),
        refunding: Number(refundUnreadStats.refund || refundUnreadStats.refunding || refundUnreadStats.refundCount || 0)
      };
    }
    function applyCenterPayload(data = {}) {
      const customer = data.customer || data.userInfo || data.user || {};
      if (customer && Object.keys(customer).length > 0) {
        applyCustomer(customer);
        stores_user.useUserStore().setUserInfo(customer);
      }
      isDistributor.value = !!data.isDistributor || Number(data.distributorStatus || 0) === 1;
      distributorStatus.value = Number(data.distributorStatus || data.distributor_status || (isDistributor.value ? 1 : 0) || 0);
      enableShare.value = Number(data.enableShare ?? data.enable_share ?? enableShare.value);
    }
    async function loadCenter() {
      applyCachedCustomer();
      try {
        const [data, orderUnreadStats, refundUnreadStats] = await Promise.all([
          api_user.getCenter(),
          api_order.getOrderUnreadStats(),
          api_refund.getRefundUnreadStats()
        ]);
        applyCenterPayload(data || {});
        orderStats.value = normalizeStats(orderUnreadStats || {}, refundUnreadStats || {});
      } catch (err) {
        if (!services_h5AuthContext.handleH5Unauthorized(err, { ...lastQuery, redirect: "/pages/center/index" })) {
          console.error("[Center] loadCenter fail:", err);
          applyCachedCustomer();
        }
      }
    }
    function syncLiveContext(options = {}) {
      const normalized = utils_liveRoute.normalizeLiveRouteOptions(options || {});
      if (normalized.roomCode || normalized.roomId || normalized.liveId) {
        utils_liveRoomContext.saveLiveRoomContext(normalized);
      }
      liveRoomContext.value = utils_liveRoomContext.mergeLiveRoomContext(utils_liveRoomContext.loadLiveRoomContext() || {}, normalized || {});
      liveRoomCode.value = utils_liveRoomContext.resolveLiveRoomCode(normalized.roomCode);
      const ctx = liveRoomContext.value;
      liveRoomId.value = Number(normalized.roomId || normalized.liveId || (ctx == null ? void 0 : ctx.liveId) || (ctx == null ? void 0 : ctx.roomId) || 0);
      if (ctx) {
        isDistributor.value = !!ctx.isDistributor && Number(ctx.distributorStatus || 0) === 1;
        distributorStatus.value = Number(ctx.distributorStatus || (isDistributor.value ? 1 : 0) || 0);
        enableShare.value = Number(ctx.enableShare ?? ctx.enable_share ?? enableShare.value);
      }
    }
    common_vendor.onLoad((options = {}) => {
      lastQuery = options || {};
      syncLiveContext(options);
      applyCachedCustomer();
      loadCenter();
    });
    common_vendor.onShow(() => {
      syncLiveContext(lastQuery);
      loadCenter();
    });
    function onItemClick(item) {
      onAction(item.key);
    }
    function withLiveQuery(url) {
      return utils_liveRoomContext.appendLiveRoomQuery(url, liveRoomContext.value);
    }
    function onAction(type) {
      if (["orders", "unpay", "unsend", "unreceive", "finished", "refund"].includes(type)) {
        if (type === "refund") {
          common_vendor.index.navigateTo({ url: withLiveQuery("/pages/order/list?status=refund") });
          return;
        }
        const statusMap = {
          orders: "all",
          unpay: "unpay",
          unsend: "unsend",
          unreceive: "unreceive",
          finished: "finished"
        };
        common_vendor.index.navigateTo({ url: withLiveQuery(`/pages/order/list?status=${statusMap[type]}`) });
        return;
      }
      if (type === "complaint") {
        common_vendor.index.navigateTo({ url: withLiveQuery("/pages/report/report-type?fromPath=%2Fpages%2Fcenter%2Findex") });
        return;
      }
      if (type === "prizeRecord") {
        utils_routeNavigation.navigateToPrizeRecord(withLiveQuery("/pages/prize-record/index"));
        return;
      }
      if (type === "invitationRecord") {
        if (!liveRoomId.value) {
          common_vendor.index.showToast({ title: "请从直播间进入", icon: "none" });
          return;
        }
        common_vendor.index.navigateTo({
          url: withLiveQuery(`/pages/invitation-record/index?roomId=${liveRoomId.value}`)
        });
        return;
      }
      if (type === "address") {
        common_vendor.index.navigateTo({ url: withLiveQuery("/pages/address/index") });
      }
    }
    function goBack() {
      if (liveRoomCode.value) {
        utils_liveRoomNavigation.returnToLiveRoom(liveRoomCode.value, liveRoomContext.value);
        return;
      }
      common_vendor.index.navigateBack({
        fail: () => common_vendor.index.reLaunch({ url: "/pages/broadcast/entry" })
      });
    }
    return (_ctx, _cache) => {
      return {
        a: avatar.value,
        b: common_vendor.t(name.value),
        c: common_vendor.o(handleNameTap, "0a"),
        d: common_vendor.o(($event) => onAction("orders"), "12"),
        e: common_vendor.o(onItemClick, "f9"),
        f: common_vendor.p({
          title: "我的订单",
          items: orderItems.value,
          mode: "grid",
          variant: "order",
          ["show-link"]: true
        }),
        g: common_vendor.o(onItemClick, "05"),
        h: common_vendor.p({
          title: "更多功能",
          items: moreItems.value,
          mode: "grid",
          variant: "more"
        }),
        i: common_vendor.o(goBack, "9c"),
        j: common_vendor.p({
          ["room-code"]: liveRoomCode.value,
          ["bottom-offset"]: 140
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7be81911"]]);
wx.createPage(MiniProgramPage);
