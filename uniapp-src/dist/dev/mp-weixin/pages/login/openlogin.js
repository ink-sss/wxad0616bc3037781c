"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_login_pageTools = require("./page-tools.js");
const _sfc_main = {
  data() {
    return {
      formData: { mobile: "", code: "" },
      loging_password: "",
      register: { mobile: "", password: "", repassword: "", code: "" },
      resetpassword: { mobile: "", password: "", repassword: "", code: "" },
      is_send: false,
      send_btn_txt: "获取验证码",
      second: 60,
      is_login: 1,
      is_code: false,
      isRead: false,
      sms_open: false
    };
  },
  onShow() {
    this.getCodeType();
  },
  methods: {
    getCodeType() {
      this._get("index/loginSetting", {}, (res) => {
        this.sms_open = !!(res.data.setting && res.data.setting.h5_sms_open);
        this.is_code = this.sms_open;
      });
    },
    submitSuccess(data) {
      if (data.token)
        common_vendor.index.setStorageSync("token", data.token);
      if (data.user_id)
        common_vendor.index.setStorageSync("user_id", data.user_id);
      this.gotoPage(pages_login_pageTools.getCurrentRedirect("/pages/user/index/index"));
    },
    formSubmit() {
      if (!this.isRead) {
        pages_login_pageTools.toast("请同意并勾选协议内容");
        return;
      }
      if (!pages_login_pageTools.mobileValid(this.formData.mobile)) {
        pages_login_pageTools.toast("手机有误,请重填！");
        return;
      }
      const payload = { mobile: this.formData.mobile };
      let endpoint = "user.useropen/phonelogin";
      if (this.is_code) {
        if (!this.formData.code) {
          pages_login_pageTools.toast("验证码不能为空！");
          return;
        }
        payload.code = this.formData.code;
        endpoint = "user.useropen/smslogin";
      } else {
        if (!this.loging_password) {
          pages_login_pageTools.toast("密码不能为空！");
          return;
        }
        payload.password = this.loging_password;
      }
      common_vendor.index.showLoading({ title: "正在提交" });
      this._post(endpoint, payload, (res) => this.submitSuccess(res.data), false, () => common_vendor.index.hideLoading());
    },
    registerSub() {
      if (!pages_login_pageTools.mobileValid(this.register.mobile)) {
        pages_login_pageTools.toast("手机有误,请重填！");
        return;
      }
      if (this.sms_open && !this.register.code) {
        pages_login_pageTools.toast("验证码不能为空！");
        return;
      }
      if (this.register.password.length < 6) {
        pages_login_pageTools.toast("密码至少6位数！");
        return;
      }
      if (this.register.password !== this.register.repassword) {
        pages_login_pageTools.toast("两次密码输入不一致！");
        return;
      }
      if (!this.isRead) {
        pages_login_pageTools.toast("请同意并勾选协议内容");
        return;
      }
      const payload = Object.assign({}, this.register, {
        invitation_id: common_vendor.index.getStorageSync("invitation_id") || 0,
        reg_source: "app",
        referee_id: common_vendor.index.getStorageSync("referee_id")
      });
      common_vendor.index.showLoading({ title: "正在提交" });
      this._post(
        "user.useropen/register",
        payload,
        () => {
          common_vendor.index.showToast({ title: "注册成功" });
          this.formData.mobile = this.register.mobile;
          this.register = { mobile: "", password: "", repassword: "", code: "" };
          this.is_login = 1;
        },
        false,
        () => common_vendor.index.hideLoading()
      );
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
          this.is_login = 1;
        },
        false,
        () => common_vendor.index.hideLoading()
      );
    },
    isCode() {
      this.is_code = !this.is_code;
    },
    sendCode() {
      let mobile = this.formData.mobile;
      let type = "login";
      if (this.is_login === 2) {
        mobile = this.register.mobile;
        type = "register";
      }
      if (this.is_login === 0)
        mobile = this.resetpassword.mobile;
      if (!pages_login_pageTools.mobileValid(mobile)) {
        pages_login_pageTools.toast("手机有误,请重填！");
        return;
      }
      this._post("user.useropen/sendCode", { mobile, type }, (res) => {
        if (res.code === 1) {
          common_vendor.index.showToast({ title: "发送成功" });
          this.is_send = true;
          this.changeMsg();
        }
      });
    },
    xieyi(type) {
      this.gotoPage("/pages/webview/ue?type=" + type);
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.is_login === 1 ? 1 : "",
    b: common_vendor.o(($event) => $data.is_login = 1, "10"),
    c: $data.is_login === 2 ? 1 : "",
    d: common_vendor.o(($event) => $data.is_login = 2, "92"),
    e: $data.is_login === 0 ? 1 : "",
    f: common_vendor.o(($event) => $data.is_login = 0, "bc"),
    g: $data.is_login === 1
  }, $data.is_login === 1 ? common_vendor.e({
    h: $data.formData.mobile,
    i: common_vendor.o(($event) => $data.formData.mobile = $event.detail.value, "98"),
    j: $data.is_code
  }, $data.is_code ? {
    k: $data.formData.code,
    l: common_vendor.o(($event) => $data.formData.code = $event.detail.value, "00"),
    m: common_vendor.t($data.send_btn_txt),
    n: $data.is_send,
    o: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "a8")
  } : {
    p: $data.loging_password,
    q: common_vendor.o(($event) => $data.loging_password = $event.detail.value, "ba")
  }, {
    r: common_vendor.t($data.is_code ? "使用密码登录" : "使用验证码登录"),
    s: common_vendor.o((...args) => $options.isCode && $options.isCode(...args), "c7"),
    t: common_vendor.o((...args) => $options.formSubmit && $options.formSubmit(...args), "34")
  }) : $data.is_login === 2 ? common_vendor.e({
    w: $data.register.mobile,
    x: common_vendor.o(($event) => $data.register.mobile = $event.detail.value, "e3"),
    y: $data.register.password,
    z: common_vendor.o(($event) => $data.register.password = $event.detail.value, "78"),
    A: $data.register.repassword,
    B: common_vendor.o(($event) => $data.register.repassword = $event.detail.value, "ff"),
    C: $data.sms_open
  }, $data.sms_open ? {
    D: $data.register.code,
    E: common_vendor.o(($event) => $data.register.code = $event.detail.value, "cc"),
    F: common_vendor.t($data.send_btn_txt),
    G: $data.is_send,
    H: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "e2")
  } : {}, {
    I: common_vendor.o((...args) => $options.registerSub && $options.registerSub(...args), "01")
  }) : {
    J: $data.resetpassword.mobile,
    K: common_vendor.o(($event) => $data.resetpassword.mobile = $event.detail.value, "54"),
    L: $data.resetpassword.code,
    M: common_vendor.o(($event) => $data.resetpassword.code = $event.detail.value, "20"),
    N: common_vendor.t($data.send_btn_txt),
    O: $data.is_send,
    P: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "3c"),
    Q: $data.resetpassword.password,
    R: common_vendor.o(($event) => $data.resetpassword.password = $event.detail.value, "8b"),
    S: $data.resetpassword.repassword,
    T: common_vendor.o(($event) => $data.resetpassword.repassword = $event.detail.value, "78"),
    U: common_vendor.o((...args) => $options.resetpasswordSub && $options.resetpasswordSub(...args), "35")
  }, {
    v: $data.is_login === 2,
    V: $data.isRead ? 1 : "",
    W: common_vendor.o(($event) => $options.xieyi("service"), "7e"),
    X: common_vendor.o(($event) => $options.xieyi("privacy"), "d6"),
    Y: common_vendor.o(($event) => $data.isRead = !$data.isRead, "4b")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8adfc4cc"]]);
wx.createPage(MiniProgramPage);
