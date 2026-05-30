"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  methods: {
    gotoShopList() {
      const url = "/pages/shop/shop_list";
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.switchTab({ url });
    },
    gotoApplication() {
      const url = "/pages/shop/application_status";
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.gotoShopList && $options.gotoShopList(...args), "83"),
    b: common_vendor.o((...args) => $options.gotoApplication && $options.gotoApplication(...args), "b7")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-17bc23ec"]]);
wx.createPage(MiniProgramPage);
