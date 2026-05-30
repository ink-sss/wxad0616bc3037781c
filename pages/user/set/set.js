var e = require("../../../@babel/runtime/helpers/typeof"),
  o = require("../../../common/vendor.js");
require("../../../env/config.js");
var n = {
  components: {
    Popup: function() {
      return "../../../components/uni-popup.js"
    },
    Upload: function() {
      return "../../../components/upload/upload2.js"
    }
  },
  data: function() {
    return {
      userInfo: {},
      isPopup: !1,
      imageList: [],
      newName: "",
      type: "",
      isUpload: !1,
      mobileModel: {
        mobile: "",
        code: ""
      },
      passwordModel: {
        mobile: "",
        code: "",
        password: "",
        repassword: ""
      },
      is_send: !1,
      send_btn_txt: "获取验证码",
      second: 60,
      isPhone: !1,
      isPassword: !1,
      sms_open: !1
    }
  },
  onShow: function() {
    this.getData(), this.getCodeType()
  },
  methods: {
    clearStorage: function() {
      o.index.clearStorageSync()
    },
    getCodeType: function() {
      var e = this;
      e._post("index/loginSetting", {}, (function(o) {
        e.sms_open = o.data.setting.h5_sms_open
      }))
    },
    maskPhone: function(e) {
      return e && 11 === e.length ? e.replace(/(\d{3})\d{4}(\d{4})/, "$1***$2") : e
    },
    isPasswordOpen: function() {
      this.userInfo.mobile ? (this.isPassword = !0, this.passwordModel = {
        mobile: this.userInfo.mobile,
        code: "",
        password: "",
        repassword: ""
      }) : o.index.showToast({
        title: "请先绑定手机号",
        icon: "none"
      })
    },
    isPhoneOpen: function() {
      this.isPhone = !0, this.mobileModel = {
        mobile: "",
        code: ""
      }
    },
    changePassword: function() {
      var e = this,
        n = e.passwordModel;
      n.mobile ? !e.sms_open || n.code ? n.password ? n.password.length < 6 ? o.index.showToast({
        title: "请输入6位以上的密码",
        icon: "none"
      }) : n.password == n.repassword ? e._post("user.Useropen/changePassword", n, (function(n) {
        o.index.showModal({
          title: "提示",
          content: "修改成功",
          success: function() {
            e.isPassword = !1, e.getData()
          }
        })
      })) : o.index.showToast({
        title: "两次密码输入不一致",
        icon: "none"
      }) : o.index.showToast({
        title: "请输入密码",
        icon: "none"
      }) : o.index.showToast({
        title: "请输入验证码",
        icon: "none"
      }) : o.index.showToast({
        title: "请输入手机号",
        icon: "none"
      })
    },
    changePhone: function() {
      var e = this,
        n = e.mobileModel;
      !e.sms_open || n.code ? e._post("user.Useropen/changeMobile", n, (function(n) {
        o.index.showModal({
          title: "提示",
          content: "修改成功",
          success: function() {
            e.isPhone = !1, e.getData()
          }
        })
      })) : o.index.showToast({
        title: "请输入验证码",
        icon: "none"
      })
    },
    changeName: function(e) {
      var o = this;
      "mobile" == e && (o.oldmobile = o.userInfo.mobile), o.type = e, o.newName = o.userInfo[e], o.isPopup = !0
    },
    onChooseAvatar: function(e) {
      console.log(e), this.uploadFile([e.detail.avatarUrl])
    },
    getData: function() {
      var e = this;
      o.index.showLoading({
        title: "加载中"
      }), e._get("user.index/setting", {}, (function(n) {
        e.userInfo = n.data.userInfo, o.index.hideLoading()
      }))
    },
    gotoBind: function() {
      o.index.navigateTo({
        url: "/pages/user/modify-phone/modify-phone"
      })
    },
    changeAvatarUrl: function() {
      this.isUpload = !0
    },
    changeinput: function(e) {
      this.newName = e.target.value
    },
    changeGender: function(e) {
      this.userInfo.gender = e.detail.value
    },
    subName: function(e) {
      var o = this;
      o.loading || ("gender" != o.type && (o.newName = e.detail.value.newName), o.userInfo[o.type] = this.newName, o.update())
    },
    uploadFile: function(n) {
      var t = this;
      t.imageList = [];
      var s = 0,
        i = n.length,
        a = {
          token: t.config.token,
          app_id: t.getAppId(),
          appid: t.config.appid
        };
      o.index.showLoading({
        title: "图片上传中"
      }), n.forEach((function(n, r) {
        o.index.uploadFile({
          url: t.websiteUrl + "/index.php?s=/api/file.upload/image",
          filePath: n,
          name: "iFile",
          formData: a,
          success: function(o) {
            var n = "object" == e(o.data) ? o.data : JSON.parse(o.data);
            1 === n.code ? t.imageList.push(n.data) : t.showError(n.msg)
          },
          complete: function() {
            s++, i === s && (o.index.hideLoading(), t.getImgsFunc(t.imageList))
          }
        })
      }))
    },
    getImgsFunc: function(e) {
      if (e && void 0 !== e) {
        this.userInfo.avatarUrl = e[0].file_path, this.update(), this.isUpload = !1
      }
    },
    hidePopupFunc: function() {
      this.isPopup = !1
    },
    logout: function() {
      var e = this;
      e._post("/user.User/logOut", {}, (function(n) {
        o.index.removeStorageSync("token"), o.index.removeStorageSync("user_id"), o.index.removeStorageSync("shop_supplier_id"), o.index.removeStorageSync("supplier_user_id"), e.gotoPage("/pages/index/index"), getApp().imLogout()
      }))
    },
    update: function() {
      var e = this;
      if (!e.loading) {
        o.index.showLoading({
          title: "加载中"
        });
        var n = e.userInfo;
        e.loading = !0, e._post("user.user/updateInfo", n, (function(n) {
          e.showSuccess("修改成功", (function() {
            e.loading = !1, e.isPopup = !1, o.index.hideLoading(), e.getData()
          }), (function(n) {
            o.index.hideLoading(), e.loading = !1, e.isPopup = !1
          }))
        }))
      }
    },
    sendCode: function(e) {
      var n = this,
        t = this[e];
      if (/^1(3|4|5|6|7|8|9)\d{9}$/.test(t.mobile)) {
        var s = "login";
        "mobileModel" == e && (s = "register"), n._post("user.userweb/sendCode", {
          mobile: t.mobile,
          type: s
        }, (function(e) {
          1 == e.code && (o.index.showToast({
            title: "发送成功"
          }), n.is_send = !0, n.changeMsg())
        }))
      } else o.index.showToast({
        title: "手机有误,请重填！",
        duration: 2e3,
        icon: "none"
      })
    },
    changeMsg: function() {
      this.second > 0 ? (this.send_btn_txt = this.second + "秒", this.second--, setTimeout(this.changeMsg, 1e3)) : (this.send_btn_txt = "获取验证码", this.second = 60, this.is_send = !1)
    },
    deleteAccount: function() {
      var e = this;
      o.index.showModal({
        title: "提示",
        content: "是否确认删除账号？删除后您将无法用此账号登录，此账户下的数据也将删除",
        success: function(n) {
          n.confirm && e._post("user.user/deleteAccount", {}, (function(n) {
            e.showSuccess("删除成功", (function() {
              o.index.removeStorageSync("token"), o.index.removeStorageSync("user_id"), e.gotoPage("/pages/index/index")
            }))
          }), !1, (function() {
            o.index.hideLoading()
          }))
        }
      })
    }
  }
};
Array || o.resolveComponent("Upload")();
var t = o._export_sfc(n, [
  ["render", function(e, n, t, s, i, a) {
    return o.e({
      a: i.userInfo.avatarUrl || "/static/login-default.png",
      b: o.o((function() {
        return a.onChooseAvatar && a.onChooseAvatar.apply(a, arguments)
      }), "83"),
      c: o.t(i.userInfo.user_id),
      d: i.userInfo.nickName,
      e: o.o((function(e) {
        return i.userInfo.nickName = e.detail.value
      }), "ac"),
      f: o.t(a.maskPhone(i.userInfo.mobile)),
      g: o.t(i.userInfo.mobile ? "修改" : "绑定"),
      h: o.o((function() {
        return a.isPhoneOpen && a.isPhoneOpen.apply(a, arguments)
      }), "f0"),
      i: e.getThemeColor(),
      j: 1 == i.userInfo.gender,
      k: e.getThemeColor(),
      l: 0 == i.userInfo.gender,
      m: o.o((function() {
        return a.changeGender && a.changeGender.apply(a, arguments)
      }), "64"),
      n: o.t(i.userInfo.password ? "已设置" : ""),
      o: o.t(i.userInfo.password ? "修改" : "设置"),
      p: o.o((function() {
        return a.isPasswordOpen && a.isPasswordOpen.apply(a, arguments)
      }), "15"),
      q: i.isPhone
    }, i.isPhone ? o.e({
      r: o.o((function(e) {
        return i.isPhone = !1
      }), "f3"),
      s: o.o((function(e) {
        return i.isPhone = !1
      }), "be"),
      t: i.mobileModel.mobile,
      v: o.o((function(e) {
        return i.mobileModel.mobile = e.detail.value
      }), "a7"),
      w: i.sms_open
    }, i.sms_open ? {
      x: i.mobileModel.code,
      y: o.o((function(e) {
        return i.mobileModel.code = e.detail.value
      }), "50"),
      z: o.t(i.send_btn_txt),
      A: o.o((function(e) {
        return a.sendCode("mobileModel")
      }), "e7"),
      B: i.is_send
    } : {}, {
      C: o.o((function() {
        return a.changePhone && a.changePhone.apply(a, arguments)
      }), "cb")
    }) : {}, {
      D: i.isPassword
    }, i.isPassword ? o.e({
      E: o.o((function(e) {
        return i.isPassword = !1
      }), "15"),
      F: o.o((function(e) {
        return i.isPassword = !1
      }), "5b"),
      G: o.t(a.maskPhone(i.passwordModel.mobile)),
      H: i.sms_open
    }, i.sms_open ? {
      I: i.passwordModel.code,
      J: o.o((function(e) {
        return i.passwordModel.code = e.detail.value
      }), "5c"),
      K: o.t(i.send_btn_txt),
      L: o.o((function(e) {
        return a.sendCode("passwordModel")
      }), "89"),
      M: i.is_send
    } : {}, {
      N: i.passwordModel.password,
      O: o.o((function(e) {
        return i.passwordModel.password = e.detail.value
      }), "10"),
      P: i.passwordModel.repassword,
      Q: o.o((function(e) {
        return i.passwordModel.repassword = e.detail.value
      }), "46"),
      R: o.o((function() {
        return a.changePassword && a.changePassword.apply(a, arguments)
      }), "03")
    }) : {}, {
      S: o.o((function() {
        return a.update && a.update.apply(a, arguments)
      }), "90"),
      T: o.o((function(e) {
        return a.logout()
      }), "1d"),
      U: i.isUpload
    }, i.isUpload ? {
      V: o.o(a.getImgsFunc, "0c"),
      W: o.p({
        num: 1
      })
    } : {}, {
      X: e.theme(),
      Y: o.n(e.theme() || "")
    })
  }]
]);
wx.createPage(t);
