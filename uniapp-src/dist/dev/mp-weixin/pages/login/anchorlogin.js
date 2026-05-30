"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_login_pageTools = require("./page-tools.js");
const _sfc_main = {
  data() {
    return {
      formData: { mobile: "", password: "" },
      setting: { name: "", login_logo: "" },
      isFromIndex: false,
      submitting: false
    };
  },
  onLoad(query = {}) {
    this.isFromIndex = query.from === "index";
    const app = getApp();
    const setting = common_vendor.index.getStorageSync("setting_" + (app && app.globalData && app.globalData.app_id || ""));
    if (setting)
      this.setting = setting;
    common_vendor.index.hideShareMenu();
  },
  methods: {
    createAccount() {
      common_vendor.index.setStorageSync("auto_open_add_streamer", true);
      common_vendor.index.navigateBack();
    },
    goLiveList() {
      common_vendor.index.reLaunch({ url: "/pages/live-push/live-list" });
    },
    formSubmit() {
      if (!pages_login_pageTools.mobileValid(this.formData.mobile)) {
        pages_login_pageTools.toast("手机有误,请重填！");
        return;
      }
      if (!this.formData.password) {
        pages_login_pageTools.toast("密码不能为空！");
        return;
      }
      this.submitting = true;
      common_vendor.index.showLoading({ title: "正在提交" });
      this._post(
        "user.user/anchorLogin",
        this.formData,
        (res) => {
          pages_login_pageTools.saveLoginSession(res.data);
          const app = getApp();
          if (app && typeof app.imLogout === "function")
            app.imLogout(() => app.imLogin && app.imLogin());
          common_vendor.index.showToast({ title: res.msg || "登录成功", icon: "success" });
          setTimeout(() => common_vendor.index.reLaunch({ url: "/pages/live-push/live-list" }), 1e3);
        },
        false,
        () => {
          this.submitting = false;
          common_vendor.index.hideLoading();
        }
      );
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.setting.login_logo || _ctx.config.pic_url + "/static/live/default_logo.jpeg",
    b: common_vendor.t($data.setting.name || "主播登录"),
    c: $data.formData.mobile,
    d: common_vendor.o(($event) => $data.formData.mobile = $event.detail.value, "09"),
    e: $data.formData.password,
    f: common_vendor.o(($event) => $data.formData.password = $event.detail.value, "a5"),
    g: $data.submitting,
    h: common_vendor.o((...args) => $options.formSubmit && $options.formSubmit(...args), "8c"),
    i: $data.isFromIndex
  }, $data.isFromIndex ? {
    j: common_vendor.o((...args) => $options.createAccount && $options.createAccount(...args), "21")
  } : {}, {
    k: common_vendor.o((...args) => $options.goLiveList && $options.goLiveList(...args), "86"),
    l: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c5054b9f"]]);
wx.createPage(MiniProgramPage);
