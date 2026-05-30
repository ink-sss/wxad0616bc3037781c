"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyBanner",
  props: { itemData: { type: Object, default: () => ({}) } },
  data() {
    return { current: 0 };
  },
  computed: {
    dataList() {
      return Array.isArray(this.itemData.data) ? this.itemData.data : [];
    },
    styleConfig() {
      return this.itemData.style || {};
    },
    indicatorActiveColor() {
      return this.styleConfig.btnColor || "#ffffff";
    },
    wrapperStyle() {
      const s = this.styleConfig;
      return `background:${s.background || ""};padding-left:${this.toRpx(s.paddingLeft)};padding-right:${this.toRpx(s.paddingLeft)};padding-top:${this.toRpx(s.paddingTop)};padding-bottom:${this.toRpx(s.paddingBottom)};`;
    },
    radiusStyle() {
      const top = 2 * Number(this.styleConfig.topRadio || 0);
      const bottom = 2 * Number(this.styleConfig.bottomRadio || 0);
      return `border-radius:${top}rpx ${top}rpx ${bottom}rpx ${bottom}rpx;`;
    }
  },
  methods: {
    toRpx(value) {
      return `${2 * Number(value || 0)}rpx`;
    },
    changeSwiper(event) {
      this.current = event.detail.current;
    },
    gotoPages(item) {
      if (item && item.linkUrl && typeof this.gotoPage === "function")
        this.gotoPage(item.linkUrl);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($options.dataList, (item, index, i0) => {
      return {
        a: "dot-" + index,
        b: common_vendor.n($data.current === index ? "swiper-dot active" : "swiper-dot")
      };
    }),
    b: common_vendor.s(`background-color:${$options.indicatorActiveColor};`),
    c: common_vendor.n($options.styleConfig.imgShape || "round"),
    d: common_vendor.f($options.dataList, (item, index, i0) => {
      return {
        a: item.imgUrl,
        b: index,
        c: common_vendor.o(($event) => $options.gotoPages(item), index)
      };
    }),
    e: common_vendor.s(`height:${$options.styleConfig.height || 240}rpx;${$options.radiusStyle}`),
    f: common_vendor.s(`height:${$options.styleConfig.height || 240}rpx;${$options.radiusStyle}`),
    g: common_vendor.s(`height:${$options.styleConfig.height || 240}rpx;`),
    h: common_vendor.o((...args) => $options.changeSwiper && $options.changeSwiper(...args), "86"),
    i: common_vendor.s($options.wrapperStyle)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-53e3b12e"]]);
wx.createComponent(Component);
