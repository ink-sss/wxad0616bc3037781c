"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyTopMerge",
  props: {
    itemData: { type: Object, default: () => ({}) },
    diytop: { type: [Number, String], default: 0 }
  },
  emits: ["setIndex", "parentFunc"],
  data() {
    return {
      thisindex: 0,
      current: 0,
      category_id: "",
      op: 0,
      isCategotyPop: false,
      _wW: 1
    };
  },
  computed: {
    dataList() {
      return Array.isArray(this.itemData.data) ? this.itemData.data : [];
    },
    images() {
      return Array.isArray(this.itemData.images) ? this.itemData.images : [];
    },
    styleConfig() {
      return this.itemData.style || {};
    },
    params() {
      return this.itemData.params || {};
    },
    backgroundGradient() {
      return `linear-gradient(rgba(245, 245, 245, 0) 0%, rgba(245, 245, 245, 0) 50%, ${this.styleConfig.bgcolor_color1 || "#fff"} 100%)`;
    },
    topMergeBackground() {
      const s = this.styleConfig;
      if (s.background)
        return s.background;
      if (s.backgroundColor)
        return s.backgroundColor;
      if (s.bgcolor)
        return s.bgcolor;
      if (s.bgcolor_color1 && s.bgcolor_color2) {
        return `linear-gradient(to right, ${s.bgcolor_color1}, ${s.bgcolor_color2})`;
      }
      return s.bgcolor_color1 || s.bgcolorColor1 || s.bgcolor_color2 || "#fff";
    },
    fixedTopStyle() {
      return `background:${this.topMergeBackground};`;
    },
    headTopStyle() {
      return `height:${this.topBarTopSafe()}px;background:${this.topMergeBackground};`;
    },
    fixedBackgroundStyle() {
      return `height:${this.topHead(this.params.showCategory ? 508 : 442)}rpx;background:${this.topMergeBackground};`;
    },
    backgroundLayerStyle() {
      return `background:${this.topMergeBackground};`;
    },
    bannerRadius() {
      const top = 2 * Number(this.styleConfig.topRadio || 0);
      const bottom = 2 * Number(this.styleConfig.bottomRadio || 0);
      return `border-radius:${top}rpx ${top}rpx ${bottom}rpx ${bottom}rpx;`;
    }
  },
  watch: {
    diytop(value, oldValue) {
      if (value !== oldValue) {
        const next = Number(value) * this._wW / (20 * this._wW);
        this.op = next >= 1 ? 1 : next;
      }
    }
  },
  created() {
    common_vendor.index.getSystemInfo({
      success: (res) => {
        this._wW = res.windowWidth / 750;
      }
    });
  },
  methods: {
    topBarTopSafe() {
      return typeof this.topBarTop === "function" ? this.topBarTop() : 0;
    },
    topBarRightSafe() {
      return typeof this.topBarRight === "function" ? this.topBarRight() : "0rpx";
    },
    topHead(value) {
      return value + 2 * this.topBarTopSafe();
    },
    openSearch(value) {
      this.$emit("parentFunc", { name: "openSearch", value });
    },
    changeIndex(index) {
      this.setIndex(index);
      this.isCategotyPop = false;
    },
    setIndex(index) {
      this.thisindex = index;
      this.category_id = this.dataList[index] && this.dataList[index].category_id || "";
      this.$emit("setIndex", this.thisindex, this.category_id);
    },
    changeSwiper(event) {
      this.current = event.detail.current;
    },
    gotoPages(item) {
      if (!item || !item.linkUrl)
        return;
      if (typeof this.gotoPage === "function")
        this.gotoPage(item.linkUrl);
      else
        common_vendor.index.navigateTo({ url: item.linkUrl.startsWith("/") ? item.linkUrl : "/" + item.linkUrl });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.s($options.headTopStyle),
    b: common_vendor.f($options.images, (item, index, i0) => {
      return {
        a: "fixed-bg-" + index,
        b: common_vendor.n($data.current === index && "active"),
        c: item.imgUrl || ""
      };
    }),
    c: common_vendor.s($options.fixedBackgroundStyle),
    d: $options.params.topLogo,
    e: common_vendor.s(`color:${$options.styleConfig.searchColor || "#999"};`),
    f: common_vendor.t($options.params.searchText),
    g: common_vendor.s(`margin-right:${$options.topBarRightSafe()};`),
    h: common_vendor.o(($event) => $options.openSearch(true), "d9"),
    i: common_vendor.n(!$options.params.showCategory && "mb20"),
    j: $options.params.showCategory
  }, $options.params.showCategory ? {
    k: common_vendor.f($options.dataList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.text || item.name || item.title),
        b: item.category_id || index,
        c: common_vendor.n($data.thisindex === index && "active"),
        d: common_vendor.o(($event) => $options.setIndex(index), item.category_id || index)
      };
    }),
    l: common_vendor.s(`margin-right:${$options.styleConfig.categoryPadding || 0}rpx;`),
    m: common_vendor.o(($event) => $data.isCategotyPop = true, "6c")
  } : {}, {
    n: common_vendor.n(!$options.params.topUp && "close"),
    o: common_vendor.s($options.fixedTopStyle),
    p: common_vendor.f($options.images, (item, index, i0) => {
      return {
        a: "bg-" + index,
        b: common_vendor.n($data.current === index && "active"),
        c: item.imgUrl || ""
      };
    }),
    q: common_vendor.s($options.backgroundLayerStyle),
    r: common_vendor.s(`background-image:${$options.backgroundGradient};`),
    s: $options.params.topUp
  }, $options.params.topUp ? {
    t: common_vendor.s(`height:${$options.topHead($options.params.showCategory ? 168 : 102)}rpx;width:100%;`)
  } : {}, {
    v: common_vendor.f($options.images, (item, index, i0) => {
      return {
        a: common_vendor.n($data.current === index && "active"),
        b: item.imgUrl,
        c: index,
        d: common_vendor.o(($event) => $options.gotoPages(item), index)
      };
    }),
    w: common_vendor.n(`imageType${$options.params.type || 1}`),
    x: common_vendor.s($options.bannerRadius),
    y: $options.params.type === 1 ? "0" : "40rpx",
    z: $options.params.type === 1 ? "0" : "40rpx",
    A: common_vendor.o((...args) => $options.changeSwiper && $options.changeSwiper(...args), "e6"),
    B: common_vendor.f($options.images, (item, index, i0) => {
      return {
        a: "dot-" + index,
        b: common_vendor.n($data.current === index && "active"),
        c: common_vendor.s(`background:${$data.current === index ? $options.styleConfig.btnColor : $options.styleConfig.btnOpColor};`)
      };
    }),
    C: common_vendor.n($options.styleConfig.imgShape || "round"),
    D: common_vendor.n($options.styleConfig.btnShape === "left" && "d-s-c"),
    E: common_vendor.n($options.styleConfig.btnShape === "center" && "d-c-c"),
    F: common_vendor.n($options.styleConfig.btnShape === "right" && "d-e-c"),
    G: $data.isCategotyPop
  }, $data.isCategotyPop ? {
    H: common_vendor.s(`height:${$options.topBarTopSafe()}px;min-height:20rpx;`),
    I: common_vendor.f($options.dataList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.text || item.name || item.title),
        b: item.category_id || index,
        c: common_vendor.n($data.thisindex === index && "active"),
        d: common_vendor.o(($event) => $options.changeIndex(index), item.category_id || index)
      };
    }),
    J: common_vendor.o(() => {
    }, "4e"),
    K: common_vendor.o(($event) => $data.isCategotyPop = false, "11")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e7b3ef0c"]]);
wx.createComponent(Component);
