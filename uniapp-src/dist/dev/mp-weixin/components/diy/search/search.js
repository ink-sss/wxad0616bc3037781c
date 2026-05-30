"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiySearch",
  props: { itemData: { type: Object, default: () => ({}) } },
  computed: {
    styleConfig() {
      return this.itemData.style || {};
    },
    params() {
      return this.itemData.params || {};
    },
    navBackground() {
      return this.resolveBackground(this.styleConfig, ["bgcolor", "backgroundColor", "background", "bgcolor_color1", "bgcolorColor1"]);
    },
    wrapperBackground() {
      return this.resolveBackground(this.styleConfig, ["background", "backgroundColor", "bgcolor", "bgcolor_color1", "bgcolorColor1"]) || this.navBackground;
    },
    wrapperStyle() {
      const s = this.styleConfig;
      return `background:${this.wrapperBackground};padding-left:${this.toRpx(s.paddingLeft)};padding-right:${this.toRpx(s.paddingLeft)};padding-top:${this.toRpx(s.paddingTop)};padding-bottom:${this.toRpx(s.paddingBottom)};`;
    },
    navStyle() {
      const s = this.styleConfig;
      const top = 2 * Number(s.topRadio || 0);
      const bottom = 2 * Number(s.bottomRadio || 0);
      return `background:${this.navBackground || this.wrapperBackground};border-top-left-radius:${top}rpx;border-top-right-radius:${top}rpx;border-bottom-left-radius:${bottom}rpx;border-bottom-right-radius:${bottom}rpx;`;
    },
    headTopStyle() {
      return `height:${this.topBarTopSafe()}px;background:${this.wrapperBackground};`;
    },
    searchStyle() {
      const s = this.styleConfig;
      return `background:${s.searchBackGround || "#f5f5f5"};color:${s.searchColor || "#999"};margin-right:${this.topBarRightSafe()};`;
    }
  },
  methods: {
    resolveBackground(style, keys) {
      for (const key of keys) {
        if (key === "bgcolor_color1" && style && style.bgcolor_color1 && style.bgcolor_color2) {
          return `linear-gradient(to right, ${style.bgcolor_color1}, ${style.bgcolor_color2})`;
        }
        const value = style && style[key];
        if (typeof value === "string" && value.trim())
          return value;
      }
      return "";
    },
    toRpx(value) {
      return value === void 0 || value === "" ? "" : `${2 * Number(value || 0)}rpx`;
    },
    topBarTopSafe() {
      return typeof this.topBarTop === "function" ? this.topBarTop() : 0;
    },
    topBarRightSafe() {
      return typeof this.topBarRight === "function" ? this.topBarRight() : "0rpx";
    },
    gotoSearch() {
      if (typeof this.gotoPage === "function")
        this.gotoPage("/pages/product/search/search");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.s($options.headTopStyle),
    b: $options.params.title_type === "image"
  }, $options.params.title_type === "image" ? {
    c: $options.params.toplogo
  } : {}, {
    d: $options.params.title_type === "text"
  }, $options.params.title_type === "text" ? {
    e: common_vendor.t($options.params.title),
    f: common_vendor.s(`color:${$options.styleConfig.titleTextColor};`)
  } : {}, {
    g: common_vendor.s(`color:${$options.styleConfig.searchColor || "#999"};`),
    h: common_vendor.t($options.params.searchText),
    i: common_vendor.s($options.searchStyle),
    j: common_vendor.o((...args) => $options.gotoSearch && $options.gotoSearch(...args), "dd"),
    k: common_vendor.s($options.navStyle),
    l: common_vendor.s($options.wrapperStyle)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-58510f39"]]);
wx.createComponent(Component);
