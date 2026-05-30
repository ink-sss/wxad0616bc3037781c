"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyImagesingle",
  props: { itemData: { type: Object, default: () => ({}) } },
  computed: {
    dataList() {
      return Array.isArray(this.itemData.data) ? this.itemData.data : [];
    },
    styleConfig() {
      return this.itemData.style || {};
    },
    wrapperStyle() {
      const s = this.styleConfig;
      return `padding-top:${this.toRpx(s.paddingTop)};padding-bottom:${this.toRpx(s.paddingTop)};padding-left:${this.toRpx(s.paddingLeft)};padding-right:${this.toRpx(s.paddingLeft)};background:${s.background || ""};`;
    },
    radiusStyle() {
      const top = 2 * Number(this.styleConfig.topRadio || 0);
      const bottom = 2 * Number(this.styleConfig.bottomRadio || 0);
      return `border-top-left-radius:${top}rpx;border-top-right-radius:${top}rpx;border-bottom-left-radius:${bottom}rpx;border-bottom-right-radius:${bottom}rpx;`;
    }
  },
  methods: {
    toRpx(value) {
      return `${2 * Number(value || 0)}rpx`;
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
        a: item.imgUrl || item.image,
        b: index,
        c: common_vendor.o(($event) => $options.gotoPages(item), index)
      };
    }),
    b: common_vendor.s($options.radiusStyle),
    c: common_vendor.s($options.wrapperStyle)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-378ca8b6"]]);
wx.createComponent(Component);
