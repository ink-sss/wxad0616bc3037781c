"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      supplierStatus: -1,
      loading: true
    };
  },
  onLoad() {
    this.getData();
  },
  methods: {
    getData() {
      if (typeof this._get !== "function") {
        this.loading = false;
        return;
      }
      common_vendor.index.showLoading({ title: "加载中..." });
      this.loading = true;
      this._get("user.index/detail", {}, (res) => {
        this.loading = false;
        this.supplierStatus = res.data ? res.data.supplierStatus : -1;
        if (this.supplierStatus === 2) {
          const url = "/pages/user/my_shop/my_shop";
          if (typeof this.gotoPage === "function")
            this.gotoPage(url, "redirect");
          else
            common_vendor.index.redirectTo({ url });
        } else if (this.supplierStatus === 3) {
          common_vendor.index.hideLoading();
          common_vendor.index.showModal({ content: "商户异常,请联系客服处理" });
        } else {
          common_vendor.index.setNavigationBarTitle({ title: this.supplierStatus === 0 ? "申请入驻" : "申请审核中" });
          common_vendor.index.hideLoading();
        }
      });
    },
    gotoApply() {
      const url = "/pages/agent/apply/apply";
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.loading && $data.supplierStatus !== 2
  }, !$data.loading && $data.supplierStatus !== 2 ? common_vendor.e({
    b: common_vendor.t($data.supplierStatus === 1 ? "申请审核中" : "申请入驻"),
    c: common_vendor.t($data.supplierStatus === 1 ? "您的商户入驻申请正在审核中，请耐心等待。" : "您还不是商户，请提交入驻申请。"),
    d: $data.supplierStatus === 0 || $data.supplierStatus === -1
  }, $data.supplierStatus === 0 || $data.supplierStatus === -1 ? {
    e: common_vendor.o((...args) => $options.gotoApply && $options.gotoApply(...args), "1f")
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c1b6fc1b"]]);
wx.createPage(MiniProgramPage);
