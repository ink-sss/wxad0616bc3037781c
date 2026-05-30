"use strict";
const common_vendor = require("../../../../common/vendor.js");
const Countdown = () => "../../../../components/countdown/countdown-act.js";
const _sfc_main = {
  components: {
    Countdown
  },
  props: {
    detail: {
      type: Object,
      default: () => ({ product_sku: {}, preview: {} })
    },
    is_fav: Boolean
  },
  methods: {
    sendFunc(type) {
      this.$emit("send", type);
    },
    returnValFunc() {
    }
  }
};
if (!Array) {
  const _component_Countdown = common_vendor.resolveComponent("Countdown");
  _component_Countdown();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t(_ctx.subPrice($props.detail.product_price, "1")),
    b: common_vendor.t(_ctx.subPrice($props.detail.product_price, "2")),
    c: $props.detail.product_sku && $props.detail.product_sku.line_price
  }, $props.detail.product_sku && $props.detail.product_sku.line_price ? {
    d: common_vendor.t($props.detail.product_sku.line_price)
  } : {}, {
    e: common_vendor.sr("countdown", "0b9b986c-0"),
    f: common_vendor.o($options.returnValFunc, "a1"),
    g: common_vendor.p({
      ["active-name"]: "previewProduct",
      config: {
        startstamp: $props.detail.preview.start_time,
        endstamp: $props.detail.preview.end_time,
        type: "preview"
      },
      start_name: "距开始仅剩",
      end_name: "距开始仅剩"
    }),
    h: common_vendor.t($props.detail.product_name),
    i: $props.detail.selling_point
  }, $props.detail.selling_point ? {
    j: common_vendor.t($props.detail.selling_point)
  } : {}, {
    k: common_vendor.o(($event) => $options.sendFunc("showShare"), "25"),
    l: common_vendor.n($props.is_fav ? "icon-shoucang2 dominant" : "icon-shoucang1"),
    m: common_vendor.n($props.is_fav ? "dominant" : "gray9"),
    n: common_vendor.o(($event) => $options.sendFunc("favorite"), "4c")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0b9b986c"]]);
wx.createComponent(Component);
