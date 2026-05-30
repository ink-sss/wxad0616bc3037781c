"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_live_pageTools = require("./page-tools.js");
const _sfc_main = {
  onLoad() {
    common_vendor.index.hideShareMenu && common_vendor.index.hideShareMenu({ menus: ["shareAppMessage", "shareTimeline"] });
  },
  methods: {
    goIndex() {
      pages_live_pageTools.goBackOrHome();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goIndex && $options.goIndex(...args), "5e")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8ddf8554"]]);
wx.createPage(MiniProgramPage);
