"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyBase",
  props: {
    itemData: { type: Object, default: () => ({}) },
    userInfo: { type: Object, default: () => ({}) },
    storeInfo: { type: Object, default: () => ({}) }
  },
  emits: ["scanQrcode", "bg"],
  computed: {
    rawDetail() {
      return this.userInfo ? this.userInfo.detail : null;
    },
    detail() {
      return this.rawDetail || {};
    },
    hasUser() {
      return !!this.rawDetail;
    },
    styleConfig() {
      return this.itemData && this.itemData.style || {};
    },
    styleType() {
      return this.styleConfig.type || 1;
    },
    avatar() {
      return this.detail && this.detail.avatarUrl || "https://man.lqjy.cc/static/login-default.png";
    },
    wrapStyle() {
      const style = this.styleConfig;
      return [
        `background:${style.bgcolor || ""}`,
        `padding:${this.px(style.paddingTop)} ${this.px(style.paddingLeft)} ${this.px(style.paddingBottom)} ${this.px(style.paddingLeft)}`
      ].join(";");
    },
    baseStyle() {
      return `background:${this.styleConfig.background || "#fff"}`;
    },
    backgroundColor() {
      const colors = {
        1: "#ff5704",
        2: "#19ad57",
        3: "#ffcc00",
        4: "#33a7ff",
        5: "#e4e4e4",
        6: "#c8ba97",
        7: "#623ceb"
      };
      return colors[this.styleType] || "#ffffff";
    },
    pointsText() {
      return typeof this.points_name === "function" ? this.points_name() : "积分";
    }
  },
  watch: {
    backgroundColor: {
      immediate: true,
      handler(value) {
        this.$emit("bg", value);
      }
    }
  },
  methods: {
    px(value) {
      const number = Number(value || 0);
      return `${Number.isNaN(number) ? 0 : number}px`;
    },
    openLink(url) {
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    },
    openProfile() {
      this.openLink("/pages/user/set/set");
    },
    login() {
      if (typeof this.doLogin === "function")
        this.doLogin();
    },
    scanQrcode() {
      this.$emit("scanQrcode");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.hasUser
  }, $options.hasUser ? {
    b: $options.avatar,
    c: common_vendor.o((...args) => $options.openProfile && $options.openProfile(...args), "31")
  } : {
    d: $options.avatar,
    e: common_vendor.o((...args) => $options.login && $options.login(...args), "ee")
  }, {
    f: $options.hasUser
  }, $options.hasUser ? common_vendor.e({
    g: common_vendor.t($options.detail.nickName),
    h: Number($options.detail.grade_id || 0) > 0
  }, Number($options.detail.grade_id || 0) > 0 ? {
    i: common_vendor.t($options.detail.grade && $options.detail.grade.name)
  } : {}) : {
    j: common_vendor.o((...args) => $options.login && $options.login(...args), "a4")
  }, {
    k: $options.hasUser
  }, $options.hasUser ? {
    l: common_vendor.t($options.detail.user_id)
  } : {}, {
    m: common_vendor.n("bg-base-" + $options.styleType),
    n: common_vendor.t($options.hasUser ? $options.detail.balance : 0),
    o: common_vendor.o(($event) => $options.openLink("/pages/user/my-wallet/my-wallet"), "ef"),
    p: common_vendor.t($options.hasUser ? $options.detail.points : 0),
    q: common_vendor.t($options.pointsText),
    r: common_vendor.o(($event) => $options.openLink("/pages/user/points/points"), "f4"),
    s: common_vendor.t($props.userInfo.coupon || 0),
    t: common_vendor.o(($event) => $options.openLink("/pages/user/my-coupon/my-coupon"), "f1"),
    v: common_vendor.t($props.userInfo.storeCouponCount || 0),
    w: common_vendor.o(($event) => $options.openLink("/pages/user/myStoreCoupon/myStoreCoupon"), "2f"),
    x: common_vendor.s($options.baseStyle),
    y: common_vendor.s($options.wrapStyle)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ab9b0e27"]]);
wx.createComponent(Component);
