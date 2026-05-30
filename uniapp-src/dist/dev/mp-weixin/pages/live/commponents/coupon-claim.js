"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_live_pageTools = require("../page-tools.js");
const _sfc_main = {
  props: { couponId: { type: [Number, String], default: "" }, text: { type: String, default: "领券" } },
  data() {
    return { visible: true };
  },
  methods: {
    receive() {
      pages_live_pageTools.requestWithVm(this, "_post", "user.coupon/receive", { coupon_id: this.couponId }).then(() => {
        common_vendor.index.showToast({ title: "领取成功", icon: "success" });
        this.visible = false;
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.visible
  }, $data.visible ? {
    b: common_vendor.t($props.text),
    c: common_vendor.o((...args) => $options.receive && $options.receive(...args), "c5")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d2055cf7"]]);
wx.createComponent(Component);
