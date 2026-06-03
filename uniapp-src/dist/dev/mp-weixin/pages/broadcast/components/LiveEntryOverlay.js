"use strict";
const common_vendor = require("../../../common/vendor.js");
if (!Array) {
  const _easycom_wd_overlay2 = common_vendor.resolveComponent("wd-overlay");
  _easycom_wd_overlay2();
}
const _easycom_wd_overlay = () => "../../../node-modules/wot-design-uni/components/wd-overlay/wd-overlay.js";
if (!Math) {
  _easycom_wd_overlay();
}
const _sfc_main = {
  __name: "LiveEntryOverlay",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    landscape: {
      type: Boolean,
      default: false
    }
  },
  emits: ["enter"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _cache) => {
      return {
        a: __props.landscape ? 1 : "",
        b: common_vendor.o(($event) => emit("enter"), "bb"),
        c: common_vendor.p({
          show: __props.show,
          ["z-index"]: 900
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fcf21325"]]);
wx.createComponent(Component);
