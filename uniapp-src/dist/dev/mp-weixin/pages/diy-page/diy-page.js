"use strict";
const common_vendor = require("../../common/vendor.js");
const platform_weixin_scan = require("../../platform/weixin/scan.js");
const Diy = () => "../../components/diy/diy.js";
const MpShare = () => "../../components/mp-share.js";
const AppShare = () => "../../components/app-share.js";
const _sfc_main = {
  components: {
    Diy,
    MpShare,
    AppShare
  },
  data() {
    return {
      page_id: null,
      items: [],
      page_info: { params: {}, style: {} },
      isMpShare: false,
      isAppShare: false,
      appParams: {
        title: "",
        summary: "",
        path: ""
      },
      url: ""
    };
  },
  onLoad(query = {}) {
    this.page_id = query.page_id;
    this.getData();
  },
  onShareAppMessage() {
    return {
      title: this.page_info.params && this.page_info.params.name || "自定义页面",
      path: "/pages/diy-page/diy-page?" + this.shareParams({ page_id: this.page_id })
    };
  },
  methods: {
    shareParams(extra = {}) {
      if (typeof this.getShareUrlParams === "function")
        return this.getShareUrlParams(extra);
      return Object.keys(extra).map((key) => `${key}=${extra[key]}`).join("&");
    },
    hasPage() {
      return typeof getCurrentPages === "function" && getCurrentPages().length > 1;
    },
    goback() {
      common_vendor.index.navigateBack();
    },
    getData() {
      if (typeof this._get !== "function") {
        return;
      }
      this._get("index/diy", {
        page_id: this.page_id,
        url: this.url
      }, (res) => {
        const data = res.data || {};
        this.page_info = data.page || this.page_info;
        this.items = data.items || [];
        this.setPage(this.page_info);
      });
    },
    setPage(page) {
      const params = page.params || {};
      const style = page.style || {};
      common_vendor.index.setNavigationBarTitle({ title: params.name || "自定义页面" });
      common_vendor.index.setNavigationBarColor({
        frontColor: style.titleTextColor === "white" ? "#ffffff" : "#000000",
        backgroundColor: style.titleBackgroundColor || "#ffffff"
      });
    },
    closeBottmpanel() {
      this.isMpShare = false;
    },
    closeAppShare() {
      this.isAppShare = false;
    },
    async scanQrcode() {
      try {
        const result = await platform_weixin_scan.scanQrCode();
        const url = "/pages/store/clerkorder?order_no=" + encodeURIComponent(result.result || "");
        if (typeof this.gotoPage === "function")
          this.gotoPage(url);
        else
          common_vendor.index.navigateTo({ url });
      } catch (error) {
        common_vendor.index.showToast({ title: "扫码失败，请重试", icon: "none" });
      }
    }
  }
};
if (!Array) {
  const _easycom_diy2 = common_vendor.resolveComponent("diy");
  const _component_mp_share = common_vendor.resolveComponent("mp-share");
  const _component_app_share = common_vendor.resolveComponent("app-share");
  (_easycom_diy2 + _component_mp_share + _component_app_share)();
}
const _easycom_diy = () => "../../components/diy/diy.js";
if (!Math) {
  _easycom_diy();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($options.scanQrcode, "08"),
    b: common_vendor.p({
      ["diy-items"]: $data.items
    }),
    c: common_vendor.o($options.closeBottmpanel, "52"),
    d: common_vendor.p({
      ["is-mp-share"]: $data.isMpShare
    }),
    e: common_vendor.o($options.closeAppShare, "4f"),
    f: common_vendor.p({
      ["is-app-share"]: $data.isAppShare,
      ["app-params"]: $data.appParams
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5f98a132"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
