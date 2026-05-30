"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  emits: ["clikeLike"]
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => _ctx.$emit("clikeLike"), "34")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d6de9fc6"]]);
wx.createComponent(Component);
