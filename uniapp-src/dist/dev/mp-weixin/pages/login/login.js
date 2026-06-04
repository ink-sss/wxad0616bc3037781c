"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_login_pageTools = require("./page-tools.js");
const api_miniprogramLogin = require("../../api/miniprogram-login.js");
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
    this.loadWechatLoginStatus();
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
    loadWechatLoginStatus() {
      this.loading = true;
      pages_login_pageTools.loginCode().then((code) => api_miniprogramLogin.preLoginMiniProgram({
        code,
        source: "wx",
        invitation_id: this.invitation_id,
        referee_id: common_vendor.index.getStorageSync("referee_id") || ""
      })).then((data = {}) => {
        this.user_id = data.user_id || "";
        this.mobile = data.mobile !== void 0 ? data.mobile : true;
        this.is_login = !!data.is_login;
        if (data.user_id)
          common_vendor.index.setStorageSync("user_id", data.user_id);
      }).catch(() => {
      }).finally(() => {
        this.loading = false;
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
    async loginSuccess(event) {
      if (!this.ensureRead() || this.submitting)
        return;
      this.submitting = true;
      common_vendor.index.showLoading({ title: "正在处理", mask: true });
      try {
        const data = await pages_login_pageTools.loginWithWechatPluginProfile(this, event);
        this.afterLogin(data);
      } catch (error) {
        const message = (error == null ? void 0 : error.message) || (error == null ? void 0 : error.msg) || "授权失败，请重新登录";
        pages_login_pageTools.toast(message);
      } finally {
        this.submitting = false;
        common_vendor.index.hideLoading();
      }
    },
    loginFail() {
      pages_login_pageTools.toast("授权失败，请重新登录");
    },
    loginCancel() {
      pages_login_pageTools.toast("授权失败，请重新登录");
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
      pages_login_pageTools.redirectAfterSkippedH5Login(this.loginContext);
    }
  }
};
if (!Array) {
  const _component_wechat_login = common_vendor.resolveComponent("wechat-login");
  _component_wechat_login();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.setting.login_logo || _ctx.config.pic_url + "/live/default_logo.jpeg",
    b: common_vendor.t($data.setting.name),
    c: $data.setting.login_desc
  }, $data.setting.login_desc ? {
    d: common_vendor.t($data.setting.login_desc)
  } : {}, {
    e: common_vendor.o($options.loginSuccess, "5f"),
    f: common_vendor.o($options.loginFail, "7a"),
    g: common_vendor.o($options.loginCancel, "02"),
    h: common_vendor.o((...args) => $options.onNotLogin && $options.onNotLogin(...args), "69"),
    i: $data.isRead ? 1 : "",
    j: common_vendor.o(($event) => $options.xieyi("service"), "e7"),
    k: common_vendor.o(($event) => $options.xieyi("privacy"), "a7"),
    l: common_vendor.o(($event) => $data.isRead = !$data.isRead, "a8"),
    m: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cdfe2409"]]);
wx.createPage(MiniProgramPage);
