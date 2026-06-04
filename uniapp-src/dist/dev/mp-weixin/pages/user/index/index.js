"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_user_pageTools = require("../page-tools.js");
const api_order = require("../../../api/order.js");
const api_refund = require("../../../api/refund.js");
const api_user = require("../../../api/user.js");
const utils_liveRoute = require("../../../utils/live-route.js");
const utils_liveRoomContext = require("../../../utils/live-room-context.js");
const RequestLoading = () => "../../../components/liveloading.js";
const LiveTab = () => "../../../components/liveTab.js";
const TabBar = () => "../../../components/tabbar/footTabbar.js";
function defaultDetail() {
  return { balance: 0, points: 0, grade: { name: "" } };
}
function toNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}
function hasToken() {
  try {
    return !!(common_vendor.index.getStorageSync("h5_token") || common_vendor.index.getStorageSync("token"));
  } catch (error) {
    return false;
  }
}
function readStorageObject(key) {
  try {
    const value = common_vendor.index.getStorageSync(key);
    if (!value)
      return null;
    if (typeof value === "string")
      return JSON.parse(value);
    return typeof value === "object" ? value : null;
  } catch (error) {
    return null;
  }
}
function readCachedCustomer() {
  const keys = ["h5_user_info", "h5Customer", "customer", "userInfo", "user_info", "user"];
  for (const key of keys) {
    const value = readStorageObject(key);
    if (value)
      return value.customer || value.userInfo || value;
  }
  return null;
}
function normalizeCustomer(customer = {}) {
  const base = defaultDetail();
  if (!customer || typeof customer !== "object")
    return base;
  const name = customer.nickName || customer.nickname || customer.userName || customer.username || customer.name || customer.mobile || "";
  const avatar = customer.avatarUrl || customer.avatar || customer.headimgurl || customer.headImg || customer.head || "";
  const userId = customer.user_id || customer.userId || customer.customerId || customer.customer_id || customer.id || "";
  return {
    ...base,
    ...customer,
    nickName: name,
    nickname: customer.nickname || name,
    userName: customer.userName || customer.username || name,
    avatarUrl: avatar,
    avatar,
    user_id: userId,
    userId,
    mobile: customer.mobile || customer.phone || "",
    grade: customer.grade || { name: customer.gradeName || "" },
    balance: customer.balance || 0,
    points: customer.points || 0
  };
}
function normalizeOrderCount(orderStats = {}, refundStats = {}) {
  const payment = toNumber(orderStats.payment ?? orderStats.unpay ?? orderStats.waitPay ?? orderStats.pendingPay);
  const delivery = toNumber(orderStats.delivery ?? orderStats.unsend ?? orderStats.waitShip ?? orderStats.waitDelivery);
  const received = toNumber(orderStats.received ?? orderStats.unreceive ?? orderStats.waitReceive);
  const finished = toNumber(orderStats.finished ?? orderStats.complete ?? orderStats.waitReview ?? orderStats.comment);
  const refund = toNumber(refundStats.refund ?? refundStats.refunding ?? refundStats.processing ?? refundStats.unread ?? refundStats.total ?? orderStats.refund);
  return {
    payment,
    unpay: payment,
    delivery,
    unsend: delivery,
    received,
    unreceive: received,
    finished,
    complete: finished,
    comment: finished,
    refund
  };
}
const _sfc_main = {
  components: {
    RequestLoading,
    LiveTab,
    TabBar
  },
  data() {
    return {
      isloadding: true,
      detail: defaultDetail(),
      orderCount: {},
      wxBinding: false,
      getPhone: false,
      isLoggedIn: false,
      bgColor: "#ff5704",
      liveRoomContext: {}
    };
  },
  computed: {
    themeClass() {
      return typeof this.theme === "function" ? this.theme() : "";
    },
    h5OrderItems() {
      var _a, _b, _c, _d, _e;
      return [
        { type: "unpay", text: "待付款", count: ((_a = this.orderCount) == null ? void 0 : _a.unpay) || 0, icon: "https://man.lqjy.cc/static/icon/pay.png" },
        { type: "unsend", text: "待发货", count: ((_b = this.orderCount) == null ? void 0 : _b.unsend) || 0, icon: "https://man.lqjy.cc/static/icon/daifahuo.png" },
        { type: "unreceive", text: "待收货", count: ((_c = this.orderCount) == null ? void 0 : _c.unreceive) || 0, icon: "https://man.lqjy.cc/static/icon/daishouhuo.png" },
        { type: "finished", text: "已完成", count: ((_d = this.orderCount) == null ? void 0 : _d.finished) || 0, icon: "https://man.lqjy.cc/static/order/1-3.png" },
        { type: "refund", text: "退款/售后", count: ((_e = this.orderCount) == null ? void 0 : _e.refund) || 0, icon: "https://man.lqjy.cc/static/icon/icon-tuikuan.png" }
      ];
    },
    h5ServiceItems() {
      return [
        { type: "prizeRecord", text: "中奖记录", icon: "https://man.lqjy.cc/static/icon/lottery-points.png" },
        { type: "invitationRecord", text: "邀请记录", icon: "https://man.lqjy.cc/static/icon/icon-tuandui.png" },
        { type: "complaint", text: "投诉", icon: "https://man.lqjy.cc/static/icon/chat.png" },
        { type: "address", text: "收货地址", icon: "https://man.lqjy.cc/static/icon/address_icon.png" }
      ];
    },
    hasProfile() {
      return !!(this.detail && (this.detail.nickName || this.detail.nickname || this.detail.userName || this.detail.user_id || this.detail.userId));
    },
    profileAvatar() {
      var _a, _b;
      return ((_a = this.detail) == null ? void 0 : _a.avatarUrl) || ((_b = this.detail) == null ? void 0 : _b.avatar) || "https://man.lqjy.cc/static/login-default.png";
    },
    profileName() {
      if (this.hasProfile) {
        return this.detail.nickName || this.detail.nickname || this.detail.userName || this.detail.mobile || "用户";
      }
      return this.isLoggedIn ? "用户" : "点击登录";
    },
    profileSubtitle() {
      var _a, _b;
      if (!this.isLoggedIn)
        return "未登录，点击登录";
      const id = ((_a = this.detail) == null ? void 0 : _a.user_id) || ((_b = this.detail) == null ? void 0 : _b.userId);
      return id ? `ID:${id}` : "ID:--";
    },
    profileGradeName() {
      var _a, _b, _c;
      if (!this.isLoggedIn)
        return "";
      const grade = (_a = this.detail) == null ? void 0 : _a.grade;
      if (typeof grade === "string" && grade)
        return grade;
      return (grade == null ? void 0 : grade.name) || ((_b = this.detail) == null ? void 0 : _b.gradeName) || ((_c = this.detail) == null ? void 0 : _c.grade_name) || "普通会员";
    }
  },
  onReady() {
    common_vendor.index.hideTabBar();
  },
  onLoad(query = {}) {
    this.wxBinding = common_vendor.index.getStorageSync("wxBinding");
    if (query && query.referee_id)
      common_vendor.index.setStorageSync("referee_id", query.referee_id);
    if ((query == null ? void 0 : query.roomCode) || (query == null ? void 0 : query.roomId) || (query == null ? void 0 : query.liveId))
      utils_liveRoomContext.saveLiveRoomContext(utils_liveRoute.normalizeLiveRouteOptions(query));
    this.syncAuthFromStorage();
    this.applyCachedProfile();
    this.syncLiveContext();
    common_vendor.index.setNavigationBarColor({ frontColor: "#ffffff", backgroundColor: "#ffffff" });
  },
  onShow() {
    this.syncLiveContext();
    this.getData();
  },
  onPullDownRefresh() {
    this.getData();
  },
  methods: {
    async getData() {
      this.isloadding = true;
      common_vendor.index.showLoading({ title: "加载中" });
      this.syncAuthFromStorage();
      this.applyCachedProfile();
      try {
        await this.loadH5CenterData();
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.msg) || (error == null ? void 0 : error.message) || "个人中心加载失败", icon: "none" });
      } finally {
        common_vendor.index.stopPullDownRefresh();
        common_vendor.index.hideLoading();
        this.isloadding = false;
      }
    },
    async loadH5CenterData() {
      const [centerResult, orderResult, refundResult] = await Promise.allSettled([
        api_user.getCenter(),
        api_order.getOrderUnreadStats(),
        api_refund.getRefundUnreadStats()
      ]);
      let loaded = false;
      let centerData = {};
      if (centerResult.status === "fulfilled") {
        centerData = centerResult.value || {};
        const customer = centerData.customer || centerData.customerInfo || centerData.userInfo || centerData.user || centerData.profile;
        if (customer)
          this.applyProfile(customer, { cache: true, h5: true });
        this.getPhone = !!(centerData.getPhone || centerData.needBindPhone || centerData.needBindMobile || (customer == null ? void 0 : customer.needBindPhone));
        loaded = true;
      }
      if (orderResult.status === "fulfilled" || refundResult.status === "fulfilled") {
        this.orderCount = normalizeOrderCount(
          orderResult.status === "fulfilled" ? orderResult.value : {},
          refundResult.status === "fulfilled" ? refundResult.value : {}
        );
        loaded = true;
      } else if (centerResult.status === "fulfilled") {
        this.orderCount = normalizeOrderCount(centerData.orderStats || centerData.orderCount || {}, centerData.refundStats || {});
      }
      if (!loaded)
        throw centerResult.reason || orderResult.reason || refundResult.reason || new Error("H5个人中心加载失败");
    },
    applyProfile(customer = {}, options = {}) {
      const normalized = normalizeCustomer(customer);
      this.detail = {
        ...defaultDetail(),
        ...this.detail,
        ...normalized,
        grade: normalized.grade || this.detail.grade || { name: "" }
      };
      if (options.h5)
        this.isLoggedIn = true;
      if (options.cache && (normalized.user_id || normalized.nickName || normalized.avatarUrl)) {
        common_vendor.index.setStorageSync("h5_user_info", normalized);
      }
    },
    applyCachedProfile() {
      const cached = readCachedCustomer();
      if (cached)
        this.applyProfile(cached, { cache: false, h5: false });
    },
    syncAuthFromStorage() {
      this.isLoggedIn = hasToken();
    },
    openProfileOrLogin() {
      if (!this.isLoggedIn) {
        if (typeof this.doLogin === "function")
          this.doLogin();
        return;
      }
      this.gotoPage("/pages/user/set/set");
    },
    bindMobile() {
      this.gotoPage("/pages/user/modify-phone/modify-phone");
    },
    getPhoneNumber(event) {
      var _a, _b, _c;
      if (((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.errMsg) && event.detail.errMsg !== "getPhoneNumber:ok")
        return false;
      common_vendor.index.showLoading({ title: "加载中" });
      const userId = ((_b = this.detail) == null ? void 0 : _b.user_id) || ((_c = this.detail) == null ? void 0 : _c.userId) || common_vendor.index.getStorageSync("user_id");
      pages_user_pageTools.bindMiniProgramMobile(userId, event).then((data = {}) => {
        common_vendor.index.showToast({ title: "绑定成功" });
        this.detail.mobile = data.mobile;
        if (data.user_id)
          common_vendor.index.setStorageSync("user_id", data.user_id);
      }).catch((error) => {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.message) || (error == null ? void 0 : error.msg) || "授权失败，请重新授权", icon: "none" });
      }).finally(() => common_vendor.index.hideLoading());
    },
    syncLiveContext() {
      this.liveRoomContext = utils_liveRoomContext.mergeLiveRoomContext(utils_liveRoomContext.loadLiveRoomContext() || {});
    },
    withLiveQuery(url) {
      return utils_liveRoomContext.appendLiveRoomQuery(url, this.liveRoomContext || {});
    },
    gotoH5CenterModule(type) {
      var _a, _b;
      const roomId = ((_a = this.liveRoomContext) == null ? void 0 : _a.roomId) || ((_b = this.liveRoomContext) == null ? void 0 : _b.liveId) || "";
      const routes = {
        orders: this.withLiveQuery("/pages/order/list?status=all"),
        unpay: this.withLiveQuery("/pages/order/list?status=unpay"),
        unsend: this.withLiveQuery("/pages/order/list?status=unsend"),
        unreceive: this.withLiveQuery("/pages/order/list?status=unreceive"),
        refund: this.withLiveQuery("/pages/order/refund-list"),
        prizeRecord: this.withLiveQuery("/pages/prize-record/index"),
        invitationRecord: this.withLiveQuery(`/pages/invitation-record/index?roomId=${encodeURIComponent(roomId)}`),
        complaint: this.withLiveQuery("/pages/report/report-type?fromPath=%2Fpages%2Fcenter%2Findex"),
        address: this.withLiveQuery("/pages/address/index")
      };
      const url = routes[type];
      if (url)
        common_vendor.index.navigateTo({ url });
    }
  }
};
if (!Array) {
  const _component_request_loading = common_vendor.resolveComponent("request-loading");
  const _component_live_tab = common_vendor.resolveComponent("live-tab");
  const _component_tab_bar = common_vendor.resolveComponent("tab-bar");
  (_component_request_loading + _component_live_tab + _component_tab_bar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.s(`background:${$data.bgColor};`),
    b: common_vendor.s(`background:${$data.bgColor};`),
    c: $options.profileAvatar,
    d: common_vendor.t($options.profileName),
    e: $options.profileGradeName
  }, $options.profileGradeName ? {
    f: common_vendor.t($options.profileGradeName)
  } : {}, {
    g: common_vendor.t($options.profileSubtitle),
    h: common_vendor.o((...args) => $options.openProfileOrLogin && $options.openProfileOrLogin(...args), "7e"),
    i: $data.getPhone
  }, $data.getPhone ? common_vendor.e({
    j: $data.wxBinding
  }, $data.wxBinding ? {
    k: common_vendor.o((...args) => $options.getPhoneNumber && $options.getPhoneNumber(...args), "ec")
  } : {
    l: common_vendor.o((...args) => $options.bindMobile && $options.bindMobile(...args), "8e")
  }) : {}, {
    m: common_vendor.o(($event) => $options.gotoH5CenterModule("orders"), "71"),
    n: common_vendor.f($options.h5OrderItems, (item, k0, i0) => {
      return common_vendor.e({
        a: item.icon,
        b: common_vendor.t(item.text),
        c: item.count
      }, item.count ? {
        d: common_vendor.t(item.count)
      } : {}, {
        e: item.type,
        f: common_vendor.o(($event) => $options.gotoH5CenterModule(item.type), item.type)
      });
    }),
    o: common_vendor.f($options.h5ServiceItems, (item, k0, i0) => {
      return {
        a: item.icon,
        b: common_vendor.t(item.text),
        c: item.type,
        d: common_vendor.o(($event) => $options.gotoH5CenterModule(item.type), item.type)
      };
    }),
    p: $data.isloadding
  }, $data.isloadding ? {
    q: common_vendor.p({
      loadding: $data.isloadding
    })
  } : {}, {
    r: common_vendor.n($options.themeClass),
    s: $options.themeClass
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e43f9ca3"]]);
wx.createPage(MiniProgramPage);
