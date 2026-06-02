"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_login_pageTools = require("./page-tools.js");
const _sfc_main = {
  data() {
    return {
      loading: false,
      submitting: false,
      invitation_id: 0,
      user_id: "",
      mobile: true,
      is_login: false,
      isRead: false,
      setting: {
        login_desc: "",
        login_logo: "",
        name: "",
        wx_get_nickname: true,
        wx_phone: false,
        wx_phone_compulsory: false
      },
      loginContext: {}
    };
  },
  onLoad(query = {}) {
    if (query.referee_id)
      common_vendor.index.setStorageSync("referee_id", query.referee_id);
    this.invitation_id = common_vendor.index.getStorageSync("invitation_id") || 0;
    this.loginContext = pages_login_pageTools.buildLoginContext(query, "/pages/center/index");
    this.getCodeType();
    this.redirectWhenAlreadyLoggedIn();
  },
  methods: {
    ensureRead() {
      if (this.isRead)
        return true;
      pages_login_pageTools.toast("请勾选并同意《隐私政策》和《用户协议》");
      return false;
    },
    getCodeType() {
      this._post("index/loginSetting", {}, (res) => {
        this.setting = Object.assign(this.setting, res.data.setting || {});
      });
    },
    redirectWhenAlreadyLoggedIn() {
      if (!pages_login_pageTools.alreadyH5LoggedIn())
        return;
      pages_login_pageTools.redirectAfterExistingH5Login(this.loginContext);
    },
    afterLogin(data) {
      if (this.setting.wx_phone && !this.mobile) {
        common_vendor.index.setStorageSync("get_phone", true);
        common_vendor.index.setStorageSync("wx_phone_compulsory", this.setting.wx_phone_compulsory);
      }
      pages_login_pageTools.redirectAfterExistingH5Login(this.loginContext);
    },
    async userLogin() {
      if (!this.ensureRead() || this.submitting)
        return;
      this.submitting = true;
      common_vendor.index.showLoading({ title: "正在处理", mask: true });
      try {
        await pages_login_pageTools.h5MiniWechatLogin(this.loginContext);
      } catch (error) {
        const message = (error == null ? void 0 : error.message) || (error == null ? void 0 : error.msg) || "授权失败，请重新登录";
        pages_login_pageTools.toast(message);
      } finally {
        this.submitting = false;
        common_vendor.index.hideLoading();
      }
    },
    getPhoneNumber(event) {
      this.userLogin(event);
    },
    xieyi(type) {
      this.gotoPage("/pages/webview/ue?type=" + type);
    },
    onNotLogin() {
      this.gotoPage("/pages/index/index");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.setting.login_logo || _ctx.config.pic_url + "/static/live/default_logo.jpeg",
    b: common_vendor.t($data.setting.name),
    c: $data.setting.login_desc
  }, $data.setting.login_desc ? {
    d: common_vendor.t($data.setting.login_desc)
  } : {}, {
    e: $data.submitting,
    f: common_vendor.o((...args) => $options.userLogin && $options.userLogin(...args), "55"),
    g: common_vendor.o((...args) => $options.onNotLogin && $options.onNotLogin(...args), "3c"),
    h: $data.isRead ? 1 : "",
    i: common_vendor.o(($event) => $options.xieyi("service"), "80"),
    j: common_vendor.o(($event) => $options.xieyi("privacy"), "8e"),
    k: common_vendor.o(($event) => $data.isRead = !$data.isRead, "8d"),
    l: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cdfe2409"]]);
wx.createPage(MiniProgramPage);
