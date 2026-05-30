"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyTitle",
  props: { itemData: { type: Object, default: () => ({}) }, userInfo: { type: Object, default: () => ({}) }, storeInfo: { type: Object, default: () => ({}) }, diytop: { type: [Number, String], default: 0 } },
  emits: ["setIndex", "parentFunc", "scanQrcode", "bg"],
  computed: {
    dataList() {
      return Array.isArray(this.itemData.data) ? this.itemData.data : this.itemData.data ? [this.itemData.data] : [];
    },
    styleConfig() {
      return this.itemData.style || {};
    },
    params() {
      return this.itemData.params || {};
    },
    boxStyle() {
      const s = this.styleConfig;
      return { background: s.background || s.bgcolor || "", paddingTop: this.toRpx(s.paddingTop), paddingBottom: this.toRpx(s.paddingBottom), paddingLeft: this.toRpx(s.paddingLeft), paddingRight: this.toRpx(s.paddingLeft) };
    }
  },
  methods: { toRpx(v) {
    return v === void 0 || v === "" ? "" : String(v).includes("rpx") || String(v).includes("px") ? String(v) : (Number(v) * 2 || 0) + "rpx";
  }, openLink(url) {
    if (!url)
      return;
    if (typeof this.gotoPage === "function")
      this.gotoPage(url);
    else
      common_vendor.index.navigateTo({ url: url.startsWith("/") ? url : "/" + url });
  } }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.params.title || $options.styleConfig.title || $props.itemData.name),
    b: common_vendor.s($options.boxStyle)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9fd1deff"]]);
wx.createComponent(Component);
