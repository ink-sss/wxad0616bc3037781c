"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
if (!Array) {
  const _easycom_wd_badge2 = common_vendor.resolveComponent("wd-badge");
  _easycom_wd_badge2();
}
const _easycom_wd_badge = () => "../node-modules/wot-design-uni/components/wd-badge/wd-badge.js";
if (!Math) {
  _easycom_wd_badge();
}
const _sfc_main = {
  __name: "center-section-card",
  props: {
    title: { type: String, default: "" },
    items: { type: Array, default: () => [] },
    mode: { type: String, default: "grid" },
    showLink: { type: Boolean, default: false },
    linkText: { type: String, default: "查看全部" },
    variant: { type: String, default: "order" }
  },
  emits: ["link", "item-click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const variantClass = common_vendor.computed(() => {
      return props.variant === "more" ? "section-card-more" : "section-card-order";
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(__props.title),
        b: __props.showLink
      }, __props.showLink ? {
        c: common_vendor.t(__props.linkText),
        d: common_vendor.o(($event) => emit("link"), "30")
      } : {}, {
        e: __props.mode === "grid"
      }, __props.mode === "grid" ? {
        f: common_vendor.f(__props.items, (item, k0, i0) => {
          return {
            a: item.icon,
            b: "5f745d95-0-" + i0,
            c: common_vendor.p({
              ["model-value"]: item.badge || "",
              ["custom-class"]: "grid-badge"
            }),
            d: common_vendor.t(item.label),
            e: item.key,
            f: common_vendor.o(($event) => emit("item-click", item), item.key)
          };
        })
      } : {
        g: common_vendor.f(__props.items, (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.label),
            c: item.key,
            d: common_vendor.n(index > 0 ? "list-item-border" : ""),
            e: common_vendor.o(($event) => emit("item-click", item), item.key)
          };
        }),
        h: common_assets._imports_1$3
      }, {
        i: common_vendor.n(variantClass.value)
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5f745d95"]]);
wx.createComponent(Component);
