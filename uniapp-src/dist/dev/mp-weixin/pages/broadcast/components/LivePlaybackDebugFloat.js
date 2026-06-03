"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "LivePlaybackDebugFloat",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    summary: {
      type: String,
      default: ""
    },
    copyStatus: {
      type: String,
      default: ""
    },
    qualityControls: {
      type: Array,
      default: () => []
    },
    qualityText: {
      type: String,
      default: ""
    }
  },
  emits: ["copy", "quality"],
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.show
      }, __props.show ? common_vendor.e({
        b: common_vendor.t(__props.summary),
        c: __props.qualityControls.length
      }, __props.qualityControls.length ? {
        d: common_vendor.t(__props.qualityText),
        e: common_vendor.f(__props.qualityControls, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.quality,
            c: item.active ? 1 : "",
            d: item.disabled ? 1 : "",
            e: common_vendor.o(($event) => !item.disabled && _ctx.$emit("quality", item.quality), item.quality)
          };
        })
      } : {}, {
        f: common_vendor.o(($event) => _ctx.$emit("copy"), "58"),
        g: common_vendor.t(__props.copyStatus),
        h: common_vendor.o(() => {
        }, "f6"),
        i: common_vendor.o(() => {
        }, "a4")
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fbad6282"]]);
wx.createComponent(Component);
