"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_login_pageTools = require("./page-tools.js");
const _sfc_main = {
  data() {
    return {
      sessionKey: "",
      submitting: false
    };
  },
  onLoad() {
    this.loadSession();
  },
  methods: {
    loadSession() {
      pages_login_pageTools.loginCode().then((code) => {
        this._post("user.user/getSession", { code }, (res) => {
          this.sessionKey = res.data.session_key;
        });
      });
    },
    getPhoneNumber(event) {
      if (this.submitting)
        return;
      let detail;
      try {
        detail = pages_login_pageTools.phonePayload(event);
      } catch (error) {
        pages_login_pageTools.toast("授权失败，请重新授权");
        return;
      }
      this.submitting = true;
      common_vendor.index.showLoading({ title: "正在处理", mask: true });
      this._post(
        "user.user/bindMobile",
        {
          session_key: this.sessionKey,
          encrypted_data: detail.encrypted_data,
          iv: detail.iv
        },
        () => common_vendor.index.navigateBack(),
        false,
        () => {
          this.submitting = false;
          common_vendor.index.hideLoading();
        }
      );
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
