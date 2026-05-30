"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "RecommendProduct",
  props: { location: { type: [String, Number], default: "" } },
  data() {
    return { listData: [], isShow: false, showName: "" };
  },
  computed: { themeName() {
    return typeof this.theme === "function" ? this.theme() : "";
  }, themeClass() {
    return this.themeName || "";
  } },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      if (typeof this._post !== "function")
        return;
      this._post("product.product/recommendProduct", { location: this.location }, (res) => {
        var _a, _b;
        if (((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.is_recommend) === 1) {
          this.isShow = true;
          this.showName = ((_b = res.data.recommend) == null ? void 0 : _b.name) || "";
          this.listData = res.data.list || [];
        }
      });
    },
    gotoProduct(productId) {
      if (typeof this.gotoPage === "function")
        this.gotoPage("pages/product/detail/detail?product_id=" + productId);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isShow
  }, $data.isShow ? {
    b: common_vendor.t($data.showName),
    c: common_vendor.f($data.listData, (item, k0, i0) => {
      return {
        a: item.product_image,
        b: common_vendor.t(item.product_name),
        c: common_vendor.t(item.product_sku && item.product_sku.product_price),
        d: common_vendor.t(item.product_sales),
        e: item.product_id,
        f: common_vendor.o(($event) => $options.gotoProduct(item.product_id), item.product_id)
      };
    }),
    d: common_vendor.n($options.themeClass),
    e: $options.themeName
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-90226087"]]);
wx.createComponent(Component);
