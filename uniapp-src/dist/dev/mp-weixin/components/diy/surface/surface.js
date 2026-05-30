"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiySurface",
  props: {
    itemData: { type: Object, default: () => ({}) },
    diytop: { type: [Number, String], default: 0 }
  },
  computed: {
    params() {
      return this.itemData.params || {};
    },
    styleConfig() {
      return this.itemData.style || {};
    },
    shouldHide() {
      return Number(this.params.showType) === 2 && Number(this.diytop || 0) < 50;
    },
    surfaceStyle() {
      const s = this.styleConfig;
      return `right:${s.right || 0}%;bottom:${s.bottom || 0}%;opacity:${Number(s.opacity || 100) / 100};`;
    }
  },
  methods: {
    toLink() {
      if (Number(this.params.type) === 2 && this.params.link && this.params.link.linkUrl) {
        if (typeof this.gotoPage === "function")
          this.gotoPage(this.params.link.linkUrl);
        return;
      }
      common_vendor.index.pageScrollTo({ scrollTop: 0, duration: 300 });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $options.params.image,
    b: common_vendor.o((...args) => $options.toLink && $options.toLink(...args), "a3"),
    c: common_vendor.n($options.shouldHide && "close"),
    d: common_vendor.s($options.surfaceStyle)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4aafb21a"]]);
wx.createComponent(Component);
