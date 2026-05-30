"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      windowHeight: 0,
      windowWidth: 0
    };
  },
  onLoad() {
    const info = common_vendor.index.getSystemInfoSync();
    this.windowWidth = info.windowWidth;
    this.windowHeight = info.windowHeight;
  },
  methods: {
    submit() {
      common_vendor.index.setStorageSync("firstEnter", 1);
      common_vendor.index.reLaunch({ url: "/pages/index/index" });
    },
    quit() {
      common_vendor.index.showToast({ title: "已取消授权", icon: "none" });
    },
    xieyi(type) {
      const url = "/pages/webview/ue?type=" + type;
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.xieyi("service"), "b1"),
    b: common_vendor.o(($event) => $options.xieyi("privacy"), "2d"),
    c: common_vendor.o((...args) => $options.quit && $options.quit(...args), "2c"),
    d: common_vendor.o((...args) => $options.submit && $options.submit(...args), "5b"),
    e: $data.windowHeight + "px"
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d0a51c61"]]);
wx.createPage(MiniProgramPage);
