"use strict";
const platform_weixin_navigation = require("../../platform/weixin/navigation.js");
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      url: ""
    };
  },
  computed: {
    webViewOptions() {
      return platform_weixin_navigation.webViewProps(this.url, { progressbarColor: "#f03b2f" });
    }
  },
  onLoad(query = {}) {
    this.url = query.url ? decodeURIComponent(query.url) : "";
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.url
  }, $data.url ? {
    b: $options.webViewOptions.src,
    c: $options.webViewOptions.progressbarColor
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-44708cf1"]]);
wx.createPage(MiniProgramPage);
