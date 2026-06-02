"use strict";
const common_vendor = require("../../common/vendor.js");
const platform_weixin_scan = require("../../platform/weixin/scan.js");
const Diy = () => "../../components/diy/diy.js";
const HomePush = () => "./home-push/home-push.js";
const SearchProduct = () => "../../components/searchProduct.js";
const LiveTab = () => "../../components/liveTab.js";
const TabBar = () => "../../components/tabbar/footTabbar.js";
const _sfc_main = {
  components: {
    Diy,
    HomePush,
    SearchProduct,
    LiveTab,
    TabBar
  },
  data() {
    return {
      loading: true,
      loadding: true,
      items: [],
      is_collection: false,
      is_follow: "0",
      is_homepush: false,
      homepush_data: {},
      homeShare: {},
      url: "",
      diytop: 0,
      showSearch: false,
      liveData: null,
      loadError: ""
    };
  },
  computed: {
    themeClass() {
      return typeof this.theme === "function" ? this.theme() : "";
    },
    collectionTopStyle() {
      const top = typeof this.topBarTop === "function" ? this.topBarTop() : 0;
      const height = typeof this.topBarHeight === "function" ? this.topBarHeight() : 0;
      return `top:${top + height + 10}px;`;
    }
  },
  onReady() {
    common_vendor.index.hideTabBar();
  },
  onLoad(query = {}) {
    common_vendor.index.removeStorageSync("me");
    if (query.invitation_id)
      common_vendor.index.setStorageSync("invitation_id", query.invitation_id);
    if (query.referee_id)
      common_vendor.index.setStorageSync("referee_id", query.referee_id);
    this.liveData = common_vendor.index.getStorageSync("is_liveGo") || null;
    this.getData();
  },
  onPullDownRefresh() {
    this.toggleInit();
  },
  onReachBottom() {
    if (this.$refs.diy && this.$refs.diy.scrolltolowerFunc) {
      this.$refs.diy.scrolltolowerFunc();
    }
  },
  onPageScroll(event) {
    this.diytop = event.scrollTop;
  },
  onShareAppMessage() {
    return {
      title: this.homeShare.share_title || "首页",
      path: "/pages/index/index?" + this.shareParams(),
      imageUrl: this.homeShare.share_img || ""
    };
  },
  onShareTimeline() {
    return {
      title: this.homeShare.share_title || "首页",
      query: this.shareParams(),
      imageUrl: this.homeShare.share_img || ""
    };
  },
  methods: {
    shareParams(extra = {}) {
      if (typeof this.getShareUrlParams === "function")
        return this.getShareUrlParams(extra);
      return Object.keys(extra).map((key) => `${key}=${extra[key]}`).join("&");
    },
    stopPush() {
      common_vendor.index.stopPullDownRefresh();
    },
    openSearch(value) {
      if (value !== false)
        this.showSearch = true;
    },
    closeSearch() {
      this.showSearch = false;
    },
    finishLoading(errorMessage = "") {
      this.loading = false;
      this.loadding = false;
      if (errorMessage)
        this.loadError = errorMessage;
      common_vendor.index.hideLoading();
      common_vendor.index.stopPullDownRefresh();
    },
    getData() {
      if (typeof this._get !== "function") {
        this.finishLoading("页面初始化失败，请稍后重试");
        return;
      }
      this.loadError = "";
      common_vendor.index.showLoading({ title: "加载中" });
      this._get("index/index", { url: this.url }, (res) => {
        const data = res.data || {};
        this.items = data.items || [];
        this.homeShare = data.page && data.page.params || {};
        if (data.page)
          this.setPage(data.page);
        const setting = data.setting || {};
        if (common_vendor.index.getStorageSync("isFirst") === "" && setting.collection && setting.collection.status === "1") {
          this.is_collection = true;
          common_vendor.index.setStorageSync("isFirst", 1);
        }
        this.is_follow = setting.officia ? setting.officia.status : "0";
        const homepushName = common_vendor.index.getStorageSync("homepush_name");
        if (setting.homepush && setting.homepush.is_open && homepushName !== setting.homepush.name) {
          this.homepush_data = setting.homepush;
          this.is_homepush = true;
        }
        this.finishLoading();
      }, () => {
        this.finishLoading("首页加载失败，点击重试");
      }, (result = {}) => {
        if (this.loading && (!result.data || result.data.code !== 1)) {
          this.finishLoading("首页加载失败，点击重试");
        }
      });
    },
    setPage(page) {
      const params = page.params || {};
      common_vendor.index.setNavigationBarTitle({ title: params.name || "首页" });
      common_vendor.index.setNavigationBarColor({
        frontColor: "#ffffff",
        backgroundColor: "#ffffff"
      });
    },
    toggleInit() {
      if (this.$refs.diy && this.$refs.diy.pullDown) {
        this.$refs.diy.pullDown();
      } else {
        this.getData();
      }
    },
    async scanQrcode() {
      try {
        const result = await platform_weixin_scan.scanQrCode();
        if (result.errMsg === "scanCode:ok" || result.result) {
          this.gotoWriteOff(result.result);
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "扫码失败，请重试", icon: "none" });
      }
    },
    gotoWriteOff(orderNo) {
      const url = "/pages/store/clerkorder?order_no=" + encodeURIComponent(orderNo || "");
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    },
    goLive(type) {
      const urls = ["/pages/live-push/live-list", "/pages/live-push/live-push", "/pages/broadcast/entry?liveId=7171"];
      common_vendor.index.navigateTo({ url: urls[type] || urls[0] });
    }
  }
};
if (!Array) {
  const _easycom_diy2 = common_vendor.resolveComponent("diy");
  const _component_home_push = common_vendor.resolveComponent("home-push");
  const _component_search_product = common_vendor.resolveComponent("search-product");
  const _component_live_tab = common_vendor.resolveComponent("live-tab");
  const _component_tab_bar = common_vendor.resolveComponent("tab-bar");
  (_easycom_diy2 + _component_home_push + _component_search_product + _component_live_tab + _component_tab_bar)();
}
const _easycom_diy = () => "../../components/diy/diy.js";
if (!Math) {
  _easycom_diy();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.items
  }, $data.items ? {
    b: common_vendor.sr("diy", "83a5a03c-0"),
    c: common_vendor.o($options.openSearch, "50"),
    d: common_vendor.o($options.stopPush, "39"),
    e: common_vendor.o($options.getData, "cf"),
    f: common_vendor.o($options.scanQrcode, "02"),
    g: common_vendor.p({
      ["diy-items"]: $data.items,
      diytop: $data.diytop
    })
  } : {}, {
    h: $data.loading
  }, $data.loading ? {} : $data.loadError ? {
    j: common_vendor.t($data.loadError),
    k: common_vendor.o((...args) => $options.getData && $options.getData(...args), "0a")
  } : {}, {
    i: $data.loadError,
    l: $data.is_collection
  }, $data.is_collection ? {
    m: common_vendor.o(($event) => $data.is_collection = false, "f0"),
    n: common_vendor.s($options.collectionTopStyle)
  } : {}, {
    o: $data.is_follow === "1" || $data.is_follow === 1
  }, $data.is_follow === "1" || $data.is_follow === 1 ? {
    p: common_vendor.o(($event) => $data.is_follow = 0, "11")
  } : {}, {
    q: $data.is_homepush
  }, $data.is_homepush ? {
    r: common_vendor.o(($event) => $data.is_homepush = false, "7e"),
    s: common_vendor.p({
      ["homepush-data"]: $data.homepush_data
    })
  } : {}, {
    t: $data.showSearch
  }, $data.showSearch ? {
    v: common_vendor.o($options.closeSearch, "95"),
    w: common_vendor.p({
      ["is-show"]: $data.showSearch
    })
  } : {}, {
    x: common_vendor.n($options.themeClass),
    y: $options.themeClass
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-83a5a03c"]]);
_sfc_main.__runtimeHooks = 7;
wx.createPage(MiniProgramPage);
