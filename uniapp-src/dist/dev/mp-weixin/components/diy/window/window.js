"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyWindow",
  props: { itemData: { type: Object, default: () => ({}) } },
  computed: {
    dataList() {
      return Array.isArray(this.itemData.data) ? this.itemData.data : [];
    },
    styleConfig() {
      return this.itemData.style || {};
    },
    wrapperPadding() {
      const s = this.styleConfig;
      return `${this.toRpx(s.paddingTop)} ${this.toRpx(s.paddingLeft)} ${this.toRpx(s.paddingBottom)} ${this.toRpx(s.paddingLeft)}`;
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
  return common_vendor.e({
    a: Number($options.styleConfig.layout) > -1
  }, Number($options.styleConfig.layout) > -1 ? {
    b: common_vendor.f($options.dataList, (item, index, i0) => {
      return {
        a: item.imgUrl || item.image,
        b: index,
        c: common_vendor.o(($event) => $options.gotoPages(item), index)
      };
    }),
    c: common_vendor.n(`column__${$options.styleConfig.layout}`)
  } : common_vendor.e({
    d: $options.dataList[0] && $options.dataList[0].imgUrl,
    e: common_vendor.o(($event) => $options.gotoPages($options.dataList[0]), "aa"),
    f: $options.dataList.length >= 2
  }, $options.dataList.length >= 2 ? {
    g: $options.dataList[1].imgUrl,
    h: common_vendor.o(($event) => $options.gotoPages($options.dataList[1]), "c0")
  } : {}, {
    i: $options.dataList.length >= 3
  }, $options.dataList.length >= 3 ? {
    j: $options.dataList[2].imgUrl,
    k: common_vendor.o(($event) => $options.gotoPages($options.dataList[2]), "46")
  } : {}, {
    l: $options.dataList.length >= 4
  }, $options.dataList.length >= 4 ? {
    m: $options.dataList[3].imgUrl,
    n: common_vendor.o(($event) => $options.gotoPages($options.dataList[3]), "ea")
  } : {}, {
    o: common_vendor.s(`padding:${Number($options.styleConfig.paddingTop || 0)}px ${Number($options.styleConfig.paddingLeft || 0)}px;`)
  }), {
    p: common_vendor.s(`background:${$options.styleConfig.background || ""};padding:${$options.wrapperPadding};`)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-40efe3b8"]]);
wx.createComponent(Component);
