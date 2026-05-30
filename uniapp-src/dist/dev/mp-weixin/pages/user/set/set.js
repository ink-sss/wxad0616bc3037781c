"use strict";
const common_vendor = require("../../../common/vendor.js");
const platform_weixin_auth = require("../../../platform/weixin/auth.js");
const pages_user_pageTools = require("../page-tools.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {},
      imageList: [],
      type: "",
      loading: false,
      mobileModel: { mobile: "", code: "" },
      passwordModel: { mobile: "", code: "", password: "", repassword: "" },
      is_send: false,
      send_btn_txt: "获取验证码",
      second: 60,
      isPhone: false,
      isPassword: false,
      sms_open: false
    };
  },
  onShow() {
    this.getData();
    this.getCodeType();
  },
  methods: {
    getCodeType() {
      this._post("index/loginSetting", {}, (res) => {
        this.sms_open = !!(res.data.setting && res.data.setting.h5_sms_open);
      });
    },
    maskPhone(value) {
      return value && value.length === 11 ? value.replace(/(\d{3})\d{4}(\d{4})/, "$1***$2") : value;
    },
    getData() {
      common_vendor.index.showLoading({ title: "加载中" });
      this._get(
        "user.index/setting",
        {},
        (res) => {
          this.userInfo = res.data.userInfo || {};
          common_vendor.index.hideLoading();
        },
        false,
        () => common_vendor.index.hideLoading()
      );
    },
    onChooseAvatar(event) {
      const avatar = platform_weixin_auth.normalizeAvatarEvent(event).avatarUrl;
      if (avatar)
        this.uploadFile([avatar]);
    },
    uploadFile(files) {
      this.imageList = [];
      let done = 0;
      const formData = {
        token: this.config.token,
        app_id: this.getAppId(),
        appid: this.config.appid
      };
      common_vendor.index.showLoading({ title: "图片上传中" });
      files.forEach((filePath) => {
        common_vendor.index.uploadFile({
          url: this.websiteUrl + "/index.php?s=/api/file.upload/image",
          filePath,
          name: "iFile",
          formData,
          success: (uploadRes) => {
            const data = typeof uploadRes.data === "object" ? uploadRes.data : JSON.parse(uploadRes.data);
            if (data.code === 1)
              this.imageList.push(data.data);
            else
              this.showError(data.msg);
          },
          complete: () => {
            done += 1;
            if (done === files.length) {
              common_vendor.index.hideLoading();
              this.getImgsFunc(this.imageList);
            }
          }
        });
      });
    },
    getImgsFunc(files) {
      if (files && files[0]) {
        this.userInfo.avatarUrl = files[0].file_path;
        this.update();
      }
    },
    changeGender(event) {
      this.userInfo.gender = event.detail.value;
      this.type = "gender";
      this.update();
    },
    update() {
      if (this.loading)
        return;
      this.loading = true;
      common_vendor.index.showLoading({ title: "加载中" });
      this._post(
        "user.user/updateInfo",
        this.userInfo,
        () => {
          this.showSuccess("修改成功", () => {
            this.loading = false;
            common_vendor.index.hideLoading();
            this.getData();
          });
        },
        false,
        () => {
          this.loading = false;
          common_vendor.index.hideLoading();
        }
      );
    },
    isPhoneOpen() {
      this.isPhone = true;
      this.mobileModel = { mobile: "", code: "" };
    },
    isPasswordOpen() {
      if (!this.userInfo.mobile) {
        pages_user_pageTools.toast("请先绑定手机号");
        return;
      }
      this.isPassword = true;
      this.passwordModel = { mobile: this.userInfo.mobile, code: "", password: "", repassword: "" };
    },
    changePhone() {
      if (this.sms_open && !this.mobileModel.code)
        return pages_user_pageTools.toast("请输入验证码");
      this._post("user.Useropen/changeMobile", this.mobileModel, () => {
        common_vendor.index.showModal({ title: "提示", content: "修改成功", success: () => {
          this.isPhone = false;
          this.getData();
        } });
      });
    },
    changePassword() {
      const model = this.passwordModel;
      if (!model.mobile)
        return pages_user_pageTools.toast("请输入手机号");
      if (this.sms_open && !model.code)
        return pages_user_pageTools.toast("请输入验证码");
      if (!model.password)
        return pages_user_pageTools.toast("请输入密码");
      if (model.password.length < 6)
        return pages_user_pageTools.toast("请输入6位以上的密码");
      if (model.password !== model.repassword)
        return pages_user_pageTools.toast("两次密码输入不一致");
      this._post("user.Useropen/changePassword", model, () => {
        common_vendor.index.showModal({ title: "提示", content: "修改成功", success: () => {
          this.isPassword = false;
          this.getData();
        } });
      });
    },
    sendCode(modelName) {
      const model = this[modelName];
      if (!pages_user_pageTools.mobileValid(model.mobile))
        return pages_user_pageTools.toast("手机有误,请重填！");
      this._post("user.userweb/sendCode", { mobile: model.mobile, type: modelName === "mobileModel" ? "register" : "login" }, (res) => {
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
    logout() {
      this._post("/user.User/logOut", {}, () => {
        common_vendor.index.removeStorageSync("token");
        common_vendor.index.removeStorageSync("user_id");
        common_vendor.index.removeStorageSync("shop_supplier_id");
        common_vendor.index.removeStorageSync("supplier_user_id");
        const app = getApp();
        if (app && typeof app.imLogout === "function")
          app.imLogout();
        this.gotoPage("/pages/index/index");
      });
    },
    deleteAccount() {
      common_vendor.index.showModal({
        title: "提示",
        content: "是否确认删除账号？删除后您将无法用此账号登录，此账户下的数据也将删除",
        success: (modal) => {
          if (modal.confirm) {
            this._post("user.user/deleteAccount", {}, () => {
              this.showSuccess("删除成功", () => {
                common_vendor.index.removeStorageSync("token");
                common_vendor.index.removeStorageSync("user_id");
                this.gotoPage("/pages/index/index");
              });
            });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userInfo.avatarUrl || "/static/login-default.png",
    b: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args), "d5"),
    c: common_vendor.t($data.userInfo.user_id || "--"),
    d: common_vendor.o(($event) => {
      $data.type = "nickName";
      $options.update();
    }, "e7"),
    e: $data.userInfo.nickName,
    f: common_vendor.o(($event) => $data.userInfo.nickName = $event.detail.value, "0b"),
    g: common_vendor.t($options.maskPhone($data.userInfo.mobile) || "去绑定"),
    h: common_vendor.o((...args) => $options.isPhoneOpen && $options.isPhoneOpen(...args), "3f"),
    i: Number($data.userInfo.gender) === 1,
    j: Number($data.userInfo.gender) === 0,
    k: common_vendor.o((...args) => $options.changeGender && $options.changeGender(...args), "9e"),
    l: common_vendor.t($data.userInfo.password ? "修改" : "设置"),
    m: common_vendor.o((...args) => $options.isPasswordOpen && $options.isPasswordOpen(...args), "91"),
    n: $data.isPhone
  }, $data.isPhone ? common_vendor.e({
    o: $data.mobileModel.mobile,
    p: common_vendor.o(($event) => $data.mobileModel.mobile = $event.detail.value, "6d"),
    q: $data.sms_open
  }, $data.sms_open ? {
    r: $data.mobileModel.code,
    s: common_vendor.o(($event) => $data.mobileModel.code = $event.detail.value, "71"),
    t: common_vendor.t($data.send_btn_txt),
    v: $data.is_send,
    w: common_vendor.o(($event) => $options.sendCode("mobileModel"), "5f")
  } : {}, {
    x: common_vendor.o((...args) => $options.changePhone && $options.changePhone(...args), "2b"),
    y: common_vendor.o(($event) => $data.isPhone = false, "08")
  }) : {}, {
    z: $data.isPassword
  }, $data.isPassword ? common_vendor.e({
    A: $data.passwordModel.mobile,
    B: common_vendor.o(($event) => $data.passwordModel.mobile = $event.detail.value, "24"),
    C: $data.sms_open
  }, $data.sms_open ? {
    D: $data.passwordModel.code,
    E: common_vendor.o(($event) => $data.passwordModel.code = $event.detail.value, "9e"),
    F: common_vendor.t($data.send_btn_txt),
    G: $data.is_send,
    H: common_vendor.o(($event) => $options.sendCode("passwordModel"), "bd")
  } : {}, {
    I: $data.passwordModel.password,
    J: common_vendor.o(($event) => $data.passwordModel.password = $event.detail.value, "42"),
    K: $data.passwordModel.repassword,
    L: common_vendor.o(($event) => $data.passwordModel.repassword = $event.detail.value, "39"),
    M: common_vendor.o((...args) => $options.changePassword && $options.changePassword(...args), "7c"),
    N: common_vendor.o(($event) => $data.isPassword = false, "cc")
  }) : {}, {
    O: common_vendor.o((...args) => $options.logout && $options.logout(...args), "59"),
    P: common_vendor.o((...args) => $options.deleteAccount && $options.deleteAccount(...args), "26"),
    Q: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d13701c0"]]);
wx.createPage(MiniProgramPage);
