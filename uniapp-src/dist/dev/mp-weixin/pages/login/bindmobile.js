"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_login_pageTools = require("./page-tools.js");
const _sfc_main = {
  data() {
    return {
      userId: "",
      submitting: false
    };
  },
  onLoad() {
    this.userId = common_vendor.index.getStorageSync("user_id") || "";
  },
  methods: {
    getPhoneNumber(event) {
      if (this.submitting)
        return;
      this.submitting = true;
      common_vendor.index.showLoading({ title: "正在处理", mask: true });
      pages_login_pageTools.bindMiniProgramMobile(this.userId, event).then((data = {}) => {
        if (data.user_id)
          common_vendor.index.setStorageSync("user_id", data.user_id);
        common_vendor.index.showToast({ title: "绑定成功" });
        common_vendor.index.navigateBack();
      }).catch((error) => {
        pages_login_pageTools.toast((error == null ? void 0 : error.message) || (error == null ? void 0 : error.msg) || "授权失败，请重新授权");
      }).finally(() => {
        this.submitting = false;
        common_vendor.index.hideLoading();
      });
    },
    onNotLogin() {
      this.gotoPage("/pages/index/index");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.getPhoneNumber && $options.getPhoneNumber(...args), "12"),
    b: common_vendor.o((...args) => $options.onNotLogin && $options.onNotLogin(...args), "7a")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a4859d8d"]]);
wx.createPage(MiniProgramPage);
