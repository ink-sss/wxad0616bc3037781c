"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "NoticeBarNvue",
  props: ["itemData", "config", "currentI", "navList", "color", "activeText", "optionType", "activeColorF", "activeColorS", "defaultColor", "marginRight", "isAppShare", "appParams", "isMpShare", "location", "diyItems", "userInfo", "serviceUserId", "diytop", "storeInfo", "isScroll", "wxPhoneCompulsory"],
  emits: ["close", "returnVal", "setIndex", "parentFunc", "scanQrcode", "onConfirm", "onCancel", "onChange", "currentIndex", "bg", "stopPush", "getData"],
  computed: {
    source() {
      return this.itemData || this.config || {};
    },
    displayTitle() {
      var _a, _b, _c, _d, _e, _f;
      return ((_b = (_a = this.source) == null ? void 0 : _a.params) == null ? void 0 : _b.title) || ((_d = (_c = this.source) == null ? void 0 : _c.style) == null ? void 0 : _d.title) || ((_e = this.source) == null ? void 0 : _e.title) || ((_f = this.source) == null ? void 0 : _f.name) || "";
    },
    displayText() {
      var _a, _b, _c, _d;
      return ((_b = (_a = this.source) == null ? void 0 : _a.params) == null ? void 0 : _b.text) || ((_c = this.source) == null ? void 0 : _c.text) || ((_d = this.source) == null ? void 0 : _d.desc) || "";
    },
    coverImage() {
      var _a, _b, _c, _d;
      const data = Array.isArray((_a = this.source) == null ? void 0 : _a.data) ? this.source.data[0] : (_b = this.source) == null ? void 0 : _b.data;
      return (data == null ? void 0 : data.imgUrl) || (data == null ? void 0 : data.image) || (data == null ? void 0 : data.imageUrl) || (data == null ? void 0 : data.product_image) || ((_c = this.source) == null ? void 0 : _c.imgUrl) || ((_d = this.source) == null ? void 0 : _d.image) || "";
    },
    primaryLink() {
      var _a, _b, _c, _d;
      const data = Array.isArray((_a = this.source) == null ? void 0 : _a.data) ? this.source.data[0] : (_b = this.source) == null ? void 0 : _b.data;
      return (data == null ? void 0 : data.linkUrl) || (data == null ? void 0 : data.link_url) || ((_c = this.source) == null ? void 0 : _c.linkUrl) || ((_d = this.source) == null ? void 0 : _d.link_url) || "";
    }
  },
  methods: {
    openLink(url) {
      if (!url)
        return;
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url: url.startsWith("/") ? url : "/" + url });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.itemData
  }, $props.itemData ? common_vendor.e({
    b: $options.coverImage
  }, $options.coverImage ? {
    c: $options.coverImage,
    d: common_vendor.o(($event) => $options.openLink($options.primaryLink), "d9")
  } : {}, {
    e: $options.displayTitle
  }, $options.displayTitle ? {
    f: common_vendor.t($options.displayTitle)
  } : {}, {
    g: $options.displayText
  }, $options.displayText ? {
    h: common_vendor.t($options.displayText)
  } : {}) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f1d1be68"]]);
wx.createComponent(Component);
