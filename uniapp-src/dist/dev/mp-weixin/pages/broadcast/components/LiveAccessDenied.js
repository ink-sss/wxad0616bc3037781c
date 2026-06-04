"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  __name: "LiveAccessDenied",
  props: {
    title: {
      type: String,
      default: ""
    },
    avatar: {
      type: String,
      default: ""
    },
    userName: {
      type: String,
      default: ""
    },
    uidText: {
      type: String,
      default: "UID:--"
    }
  },
  emits: ["copy-uid"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0,
        b: common_vendor.t(__props.title),
        c: __props.avatar,
        d: common_vendor.t(__props.userName),
        e: common_vendor.t(__props.uidText),
        f: common_vendor.o(($event) => emit("copy-uid"), "7e")
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a2f6db9e"]]);
wx.createComponent(Component);
