"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "LiveEndedOverlay",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    portrait: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    },
    showViews: {
      type: Boolean,
      default: false
    },
    viewerCount: {
      type: [String, Number],
      default: ""
    },
    avatar: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? common_vendor.e({
        b: common_vendor.t(__props.title),
        c: __props.showViews
      }, __props.showViews ? {
        d: common_vendor.t(__props.viewerCount)
      } : {}, {
        e: __props.avatar,
        f: common_vendor.t(__props.name || "主播"),
        g: __props.portrait ? 1 : ""
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5258492c"]]);
wx.createComponent(Component);
