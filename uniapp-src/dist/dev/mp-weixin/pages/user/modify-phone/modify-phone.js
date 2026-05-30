"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_user_pageTools = require("../page-tools.js");
const _sfc_main = {
  data() {
    return {
      formData: { mobile: "", code: "" },
      is_send: false,
      send_btn_txt: "获取验证码",
      second: 60
    };
  },
  methods: {
    formSubmit() {
      if (!pages_user_pageTools.mobileValid(this.formData.mobile)) {
        pages_user_pageTools.toast("手机有误,请重填！");
        return;
      }
      if (!this.formData.code) {
        pages_user_pageTools.toast("请输入验证码");
        return;
      }
      common_vendor.index.showLoading({ title: "正在提交" });
      this._post(
        "user.userweb/bindMobile",
        this.formData,
        (res) => {
          common_vendor.index.showToast({ title: res.msg || "绑定成功" });
          setTimeout(() => common_vendor.index.navigateBack(), 800);
        },
        false,
        () => common_vendor.index.hideLoading()
      );
    },
    sendCode() {
      if (!pages_user_pageTools.mobileValid(this.formData.mobile)) {
        pages_user_pageTools.toast("手机有误,请重填！");
        return;
      }
      this._post("user.userweb/sendCode", { mobile: this.formData.mobile, type: "register" }, (res) => {
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.formData.mobile,
    b: common_vendor.o(($event) => $data.formData.mobile = $event.detail.value, "ce"),
    c: $data.formData.code,
    d: common_vendor.o(($event) => $data.formData.code = $event.detail.value, "14"),
    e: common_vendor.t($data.send_btn_txt),
    f: $data.is_send,
    g: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "a2"),
    h: common_vendor.o((...args) => $options.formSubmit && $options.formSubmit(...args), "3c")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c08ce957"]]);
wx.createPage(MiniProgramPage);
