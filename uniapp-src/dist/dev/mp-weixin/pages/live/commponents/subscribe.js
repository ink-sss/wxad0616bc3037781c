"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_live_pageTools = require("../page-tools.js");
const _sfc_main = {
  props: {
    liveId: { type: [Number, String], default: "" }
  },
  methods: {
    subscribe() {
      pages_live_pageTools.requestWithVm(this, "_post", "live.market/subscribe", { live_id: this.liveId }).then(() => common_vendor.index.showToast({ title: "已预约提醒", icon: "success" })).catch(() => {
        common_vendor.index.showToast({ title: "暂无法预约提醒", icon: "none" });
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.subscribe && $options.subscribe(...args), "50")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-330fc403"]]);
wx.createComponent(Component);
