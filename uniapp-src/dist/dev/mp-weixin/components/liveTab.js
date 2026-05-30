"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "LiveTab",
  data() {
    return { liveGo: null };
  },
  computed: { optionIcon() {
    var _a;
    return (((_a = this.config) == null ? void 0 : _a.pic_url) || "") + "/20251127111915b056e6357.png";
  } },
  mounted() {
    this.liveGo = common_vendor.index.getStorageSync("is_liveGo") || null;
  },
  methods: {
    backToLive() {
      if (!this.liveGo)
        return;
      common_vendor.index.removeStorageSync("is_liveGo");
      const type = this.liveGo.liveType === "horizontal" ? "live-horizontal" : "live-vertical";
      common_vendor.index.navigateTo({ url: "/pages/live/" + type + "?live_id=" + this.liveGo.liveId });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.liveGo
  }, $data.liveGo ? common_vendor.e({
    b: $options.optionIcon,
    c: $data.liveGo.liveAvatar
  }, $data.liveGo.liveAvatar ? {
    d: $data.liveGo.liveAvatar
  } : {}, {
    e: common_vendor.o((...args) => $options.backToLive && $options.backToLive(...args), "33")
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f419a4cb"]]);
wx.createComponent(Component);
