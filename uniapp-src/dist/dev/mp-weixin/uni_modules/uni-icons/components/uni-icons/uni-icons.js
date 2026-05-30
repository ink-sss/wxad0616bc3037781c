"use strict";
const common_vendor = require("../../../../common/vendor.js");
const ICONS = {
  right: "",
  left: "",
  up: "",
  down: "",
  close: "",
  checkmarkempty: "",
  search: "",
  clear: "",
  info: ""
};
const _sfc_main = {
  name: "UniIcons",
  props: { type: { type: String, default: "" }, color: { type: String, default: "#333" }, size: { type: [Number, String], default: 24 }, customPrefix: { type: String, default: "" } },
  emits: ["click"],
  computed: {
    glyph() {
      return ICONS[this.type] || "";
    },
    iconStyle() {
      return { color: this.color, fontSize: this.size + "px" };
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.glyph),
    b: common_vendor.s($options.iconStyle),
    c: common_vendor.o(($event) => _ctx.$emit("click", $event), "63")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b40d096c"]]);
wx.createComponent(Component);
