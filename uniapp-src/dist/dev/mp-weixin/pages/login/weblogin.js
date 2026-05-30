"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_login_pageTools = require("./page-tools.js");
const _sfc_main = {
  data() {
    return {
      formData: { mobile: "", password: "", code: "" },
      resetpassword: { mobile: "", password: "", repassword: "", code: "" },
      is_send: false,
      send_btn_txt: "获取验证码",
      second: 60,
      screen: "login",
      mode: "sms",
      sms_open: false,
      isRead: true
    };
  },
  onLoad(query = {}) {
    if (query.referee_id)
      common_vendor.index.setStorageSync("referee_id", query.referee_id);
  },
  onShow() {
    this.getCodeType();
  },
  methods: {
    getCodeType() {
      this._post("index/loginSetting", {}, (res) => {
        this.sms_open = !!(res.data.setting && res.data.setting.h5_sms_open);
        if (!this.sms_open)
          this.mode = "password";
      });
    },
    submitSuccess(data) {
      if (data.token)
        common_vendor.index.setStorageSync("token", data.token);
      if (data.user_id)
        common_vendor.index.setStorageSync("user_id", data.user_id);
      this.gotoPage(pages_login_pageTools.getCurrentRedirect("/pages/user/index/index"), "redirect");
    },
    formSubmit() {
      if (!this.isRead) {
        pages_login_pageTools.toast("请先阅读并接受用户协议及隐私政策");
        return;
      }
      if (!pages_login_pageTools.mobileValid(this.formData.mobile)) {
        pages_login_pageTools.toast("手机有误,请重填！");
        return;
      }
      const payload = {
        mobile: this.formData.mobile,
        invitation_id: this.invitation_id || 0,
        referee_id: common_vendor.index.getStorageSync("referee_id") || 0
      };
      let endpoint = "user.useropen/phonelogin";
      if (this.mode === "sms") {
        if (this.sms_open && !this.formData.code) {
          pages_login_pageTools.toast("验证码不能为空！");
          return;
        }
        payload.code = this.formData.code;
        endpoint = "user.useropen/smslogin";
      } else {
        if (!this.formData.password) {
          pages_login_pageTools.toast("密码不能为空！");
          return;
        }
        payload.password = this.formData.password;
      }
      common_vendor.index.showLoading({ title: "正在提交" });
      this._post(endpoint, payload, (res) => this.submitSuccess(res.data), false, () => common_vendor.index.hideLoading());
    },
    resetpasswordSub() {
      if (!pages_login_pageTools.mobileValid(this.resetpassword.mobile)) {
        pages_login_pageTools.toast("手机有误,请重填！");
        return;
      }
      if (!this.resetpassword.code) {
        pages_login_pageTools.toast("验证码不能为空！");
        return;
      }
      if (this.resetpassword.password.length < 6) {
        pages_login_pageTools.toast("密码至少6位数！");
        return;
      }
      if (this.resetpassword.password !== this.resetpassword.repassword) {
        pages_login_pageTools.toast("两次密码输入不一致！");
        return;
      }
      common_vendor.index.showLoading({ title: "正在提交" });
      this._post(
        "user.useropen/resetpassword",
        this.resetpassword,
        () => {
          common_vendor.index.showToast({ title: "重置成功" });
          this.formData.mobile = this.resetpassword.mobile;
          this.resetpassword = { mobile: "", password: "", repassword: "", code: "" };
          this.screen = "login";
          this.mode = "password";
        },
        false,
        () => common_vendor.index.hideLoading()
      );
    },
    sendCode() {
      const mobile = this.screen === "reset" ? this.resetpassword.mobile : this.formData.mobile;
      if (!pages_login_pageTools.mobileValid(mobile)) {
        pages_login_pageTools.toast("手机有误,请重填！");
        return;
      }
      this._post("user.useropen/sendCode", { mobile, type: this.screen === "reset" ? "login" : "sms" }, (res) => {
        if (res.code === 1) {
          common_vendor.index.showToast({ title: "发送成功" });
          this.is_send = true;
          this.changeMsg();
        }
      });
    },
    changeMsg() {
      if (this.second > 0) {
        this.send_btn_txt = this.second + "秒";
        this.second -= 1;
        setTimeout(() => this.changeMsg(), 1e3);
      } else {
        this.send_btn_txt = "获取验证码";
        this.second = 60;
        this.is_send = false;
      }
    },
    quickLogin() {
      common_vendor.index.showLoading({ title: "登录中..." });
      this._post(
        "user.user/getUserByTokenH5",
        { source: "wx", referee_id: common_vendor.index.getStorageSync("referee_id") || 0 },
        (res) => this.submitSuccess(res.data),
        false,
        () => common_vendor.index.hideLoading()
      );
    },
    xieyi(type) {
      this.gotoPage("/pages/webview/ue?type=" + type);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.mode === "sms" ? 1 : "",
    b: common_vendor.o(($event) => $data.mode = "sms", "9c"),
    c: $data.mode === "password" ? 1 : "",
    d: common_vendor.o(($event) => $data.mode = "password", "a1"),
    e: $data.screen === "login"
  }, $data.screen === "login" ? common_vendor.e({
    f: $data.formData.mobile,
    g: common_vendor.o(($event) => $data.formData.mobile = $event.detail.value, "ec"),
    h: $data.mode === "sms" && $data.sms_open
  }, $data.mode === "sms" && $data.sms_open ? {
    i: $data.formData.code,
    j: common_vendor.o(($event) => $data.formData.code = $event.detail.value, "b9"),
    k: common_vendor.t($data.send_btn_txt),
    l: $data.is_send,
    m: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "e0")
  } : {
    n: $data.formData.password,
    o: common_vendor.o(($event) => $data.formData.password = $event.detail.value, "c1")
  }, {
    p: common_vendor.o((...args) => $options.formSubmit && $options.formSubmit(...args), "e0"),
    q: common_vendor.o(($event) => $data.screen = "reset", "9a"),
    r: common_vendor.o((...args) => $options.quickLogin && $options.quickLogin(...args), "10")
  }) : {
    s: $data.resetpassword.mobile,
    t: common_vendor.o(($event) => $data.resetpassword.mobile = $event.detail.value, "9c"),
    v: $data.resetpassword.code,
    w: common_vendor.o(($event) => $data.resetpassword.code = $event.detail.value, "85"),
    x: common_vendor.t($data.send_btn_txt),
    y: $data.is_send,
    z: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "b6"),
    A: $data.resetpassword.password,
    B: common_vendor.o(($event) => $data.resetpassword.password = $event.detail.value, "89"),
    C: $data.resetpassword.repassword,
    D: common_vendor.o(($event) => $data.resetpassword.repassword = $event.detail.value, "28"),
    E: common_vendor.o((...args) => $options.resetpasswordSub && $options.resetpasswordSub(...args), "de"),
    F: common_vendor.o(($event) => $data.screen = "login", "ef")
  }, {
    G: $data.isRead ? 1 : "",
    H: common_vendor.o(($event) => $options.xieyi("service"), "26"),
    I: common_vendor.o(($event) => $options.xieyi("privacy"), "06"),
    J: common_vendor.o(($event) => $data.isRead = !$data.isRead, "d4")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9fcd4007"]]);
wx.createPage(MiniProgramPage);
