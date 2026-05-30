"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_user_pageTools = require("../page-tools.js");
const platform_weixin_scan = require("../../../platform/weixin/scan.js");
const Diy = () => "../../../components/diy/diy.js";
const RequestLoading = () => "../../../components/liveloading.js";
const LiveTab = () => "../../../components/liveTab.js";
const TabBar = () => "../../../components/tabbar/footTabbar.js";
const _sfc_main = {
  components: {
    Diy,
    RequestLoading,
    LiveTab,
    TabBar
  },
  data() {
    return {
      items: [],
      isloadding: true,
      loadding: true,
      detail: { balance: 0, points: 0, grade: { name: "" } },
      storeInfo: {},
      orderCount: {},
      coupon: 0,
      storeCouponCount: 0,
      user_type: "",
      msgcount: 0,
      sessionKey: "",
      wxBinding: false,
      getPhone: false,
      urls: "",
      jweixin: null,
      bgColor: "",
      liveData: null,
      version: ""
    };
  },
  computed: {
    themeClass() {
      return typeof this.theme === "function" ? this.theme() : "";
    },
    userInfo() {
      return {
        detail: this.detail,
        coupon: this.coupon,
        storeCouponCount: this.storeCouponCount,
        orderCount: this.orderCount,
        msgcount: this.msgcount,
        getPhone: this.getPhone
      };
    }
  },
  onReady() {
    common_vendor.index.hideTabBar();
  },
  onLoad(query = {}) {
    this.wxBinding = common_vendor.index.getStorageSync("wxBinding");
    if (query && query.referee_id)
      common_vendor.index.setStorageSync("referee_id", query.referee_id);
    this.getSession();
    common_vendor.index.setNavigationBarColor({ frontColor: "#ffffff", backgroundColor: "#ffffff" });
  },
  onShow() {
    this.getData();
  },
  onPullDownRefresh() {
    this.getData();
  },
  methods: {
    getSession() {
      pages_user_pageTools.loginCode().then((code) => {
        this._post("user.user/getSession", { code }, (res) => {
          this.sessionKey = res.data.session_key;
        });
      });
    },
    scanQrcode() {
      platform_weixin_scan.scanCode({ onlyFromCamera: true }).then((res) => {
        if (res.errMsg === "scanCode:ok")
          this.gotoPage("/pages/store/clerkorder?order_no=" + res.result);
        else
          pages_user_pageTools.toast("扫码失败，请重试");
      }).catch(() => pages_user_pageTools.toast("扫码失败，请重试"));
    },
    getData() {
      this.isloadding = true;
      common_vendor.index.showLoading({ title: "加载中" });
      this._get(
        "user.index/center",
        { url: this.urls, source: this.getPlatform() },
        (res) => {
          const data = res.data || {};
          const page = data.page || {};
          this.detail = data.userInfo;
          this.storeInfo = data.storeInfo || {};
          this.coupon = data.coupon || 0;
          this.storeCouponCount = data.storeCouponCount || 0;
          this.orderCount = data.orderCount || {};
          this.msgcount = data.msgcount || 0;
          this.getPhone = data.getPhone;
          this.loadding = false;
          this.items = page.items || [];
          this.setPage(page.page || {});
          this.loadding = false;
          common_vendor.index.stopPullDownRefresh();
          common_vendor.index.hideLoading();
          this.isloadding = false;
        },
        false,
        () => {
          common_vendor.index.stopPullDownRefresh();
          common_vendor.index.hideLoading();
          this.isloadding = false;
        }
      );
    },
    setPage(page = {}) {
      if (page.params && page.params.name) {
        common_vendor.index.setNavigationBarTitle({ title: page.params.name });
      }
    },
    bindMobile() {
      this.gotoPage("/pages/user/modify-phone/modify-phone");
    },
    getPhoneNumber(event) {
      var _a;
      if (((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.errMsg) && event.detail.errMsg !== "getPhoneNumber:ok")
        return false;
      let detail;
      try {
        detail = pages_user_pageTools.phonePayload(event);
      } catch (error) {
        return false;
      }
      common_vendor.index.showLoading({ title: "加载中" });
      this._post(
        "user.user/bindMobile",
        {
          session_key: this.sessionKey,
          encrypted_data: detail.encrypted_data,
          iv: detail.iv
        },
        (res) => {
          common_vendor.index.showToast({ title: "绑定成功" });
          this.detail.mobile = res.data.mobile;
        },
        false,
        () => common_vendor.index.hideLoading()
      );
    },
    bg(value) {
      this.bgColor = value;
    }
  }
};
if (!Array) {
  const _easycom_diy2 = common_vendor.resolveComponent("diy");
  const _component_request_loading = common_vendor.resolveComponent("request-loading");
  const _component_live_tab = common_vendor.resolveComponent("live-tab");
  const _component_tab_bar = common_vendor.resolveComponent("tab-bar");
  (_easycom_diy2 + _component_request_loading + _component_live_tab + _component_tab_bar)();
}
const _easycom_diy = () => "../../../components/diy/diy.js";
if (!Math) {
  _easycom_diy();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.s(`background:${$data.bgColor};`),
    b: $data.items
  }, $data.items ? common_vendor.e({
    c: $data.getPhone
  }, $data.getPhone ? common_vendor.e({
    d: $data.wxBinding
  }, $data.wxBinding ? {
    e: common_vendor.o((...args) => $options.getPhoneNumber && $options.getPhoneNumber(...args), "12")
  } : {
    f: common_vendor.o((...args) => $options.bindMobile && $options.bindMobile(...args), "c6")
  }) : {}, {
    g: common_vendor.o($options.scanQrcode, "9b"),
    h: common_vendor.o($options.bg, "fa"),
    i: common_vendor.p({
      ["diy-items"]: $data.items,
      ["store-info"]: $data.storeInfo,
      ["user-info"]: $options.userInfo
    })
  }) : {}, {
    j: $data.isloadding
  }, $data.isloadding ? {
    k: common_vendor.p({
      loadding: $data.isloadding
    })
  } : {}, {
    l: common_vendor.n($options.themeClass),
    m: $options.themeClass
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e43f9ca3"]]);
wx.createPage(MiniProgramPage);
