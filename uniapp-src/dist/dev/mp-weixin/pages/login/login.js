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
      }
    };
  },
  onLoad(query = {}) {
    if (query.referee_id)
      common_vendor.index.setStorageSync("referee_id", query.referee_id);
    this.invitation_id = common_vendor.index.getStorageSync("invitation_id") || 0;
    this.getCodeType();
    this.preLogin();
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
    preLogin() {
      pages_login_pageTools.loginCode().then((code) => {
        this._post(
          "user.user/login",
          {
            code,
            source: "wx",
            invitation_id: this.invitation_id,
            referee_id: common_vendor.index.getStorageSync("referee_id")
          },
          (res) => {
            this.user_id = res.data.user_id || "";
            this.mobile = res.data.mobile;
            this.is_login = res.data.is_login;
          },
          false,
          () => {
            this.loading = false;
          }
        );
      }).catch(() => {
        this.loading = false;
      });
    },
    afterLogin(data) {
      pages_login_pageTools.saveLoginSession(data);
      if (this.setting.wx_phone && !this.mobile) {
        common_vendor.index.setStorageSync("get_phone", true);
        common_vendor.index.setStorageSync("wx_phone_compulsory", this.setting.wx_phone_compulsory);
      }
      common_vendor.index.redirectTo({ url: pages_login_pageTools.getCurrentRedirect("/pages/user/index/index") });
    },
    userLogin() {
      if (!this.ensureRead() || this.submitting)
        return;
      this.submitting = true;
      common_vendor.index.showLoading({ title: "正在处理", mask: true });
      pages_login_pageTools.loginCode().then((code) => {
        this._post(
          "user.user/userLogin",
          {
            code,
            shop_supplier_id: getApp().globalData && getApp().globalData.shop_supplier_id
          },
          (res) => this.afterLogin(res.data),
          false,
          () => {
            this.submitting = false;
            common_vendor.index.hideLoading();
          }
        );
      }).catch(() => {
        this.submitting = false;
        common_vendor.index.hideLoading();
        pages_login_pageTools.toast("授权失败，请重新登录");
      });
    },
    getPhoneNumber(event) {
      if (!this.ensureRead() || this.submitting)
        return;
      let detail;
      try {
        detail = pages_login_pageTools.phonePayload(event);
      } catch (error) {
        pages_login_pageTools.toast("授权失败，请重新登录");
        return;
      }
      this.submitting = true;
      common_vendor.index.showLoading({ title: "正在处理", mask: true });
      pages_login_pageTools.loginCode().then((code) => {
        this._post(
          "user.user/bindMobile",
          {
            code,
            user_id: this.user_id,
            encrypted_data: detail.encrypted_data,
            iv: detail.iv
          },
          (res) => this.afterLogin(res.data),
          false,
          () => {
            this.submitting = false;
            common_vendor.index.hideLoading();
          }
        );
      });
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
    e: $data.setting.wx_phone && !$data.mobile
  }, $data.setting.wx_phone && !$data.mobile ? {
    f: common_vendor.o((...args) => $options.getPhoneNumber && $options.getPhoneNumber(...args), "ea")
  } : {
    g: $data.submitting,
    h: common_vendor.o((...args) => $options.userLogin && $options.userLogin(...args), "ab")
  }, {
    i: common_vendor.o((...args) => $options.onNotLogin && $options.onNotLogin(...args), "eb"),
    j: $data.isRead ? 1 : "",
    k: common_vendor.o(($event) => $options.xieyi("service"), "04"),
    l: common_vendor.o(($event) => $options.xieyi("privacy"), "96"),
    m: common_vendor.o(($event) => $data.isRead = !$data.isRead, "0a"),
    n: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cdfe2409"]]);
wx.createPage(MiniProgramPage);
