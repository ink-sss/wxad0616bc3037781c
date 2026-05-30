var e = require("../../common/vendor.js");
require("../../env/config.js");
var o = getApp(),
  n = {
    data: function() {
      return {
        formData: {
          mobile: "",
          password: "",
          code: ""
        },
        resetpassword: {
          mobile: "",
          password: "",
          repassword: "",
          code: ""
        },
        is_send: !1,
        send_btn_txt: "获取验证码",
        second: 60,
        ip: "",
        is_login: 2,
        sms_open: !1,
        isRead: !0
      }
    },
    onLoad: function(o) {
      o && o.referee_id && e.index.setStorageSync("referee_id", o.referee_id)
    },
    onShow: function() {
      this.getCodeType()
    },
    methods: {
      xieyi: function(e) {
        this.gotoPage("/pages/webview/ue?type=" + e)
      },
      getCodeType: function() {
        var e = this;
        e._post("index/loginSetting", {}, (function(o) {
          e.sms_open = o.data.setting.h5_sms_open, e.sms_open || (e.is_login = 1)
        }))
      },
      formSubmit: function() {
        var n = this;
        if (n.isRead) {
          var i = {
              mobile: n.formData.mobile,
              invitation_id: n.invitation_id || 0,
              referee_id: e.index.getStorageSync("referee_id") || 0
            },
            t = "";
          if (/^1(3|4|5|6|7|8|9)\d{9}$/.test(n.formData.mobile)) {
            if (2 == n.is_login) {
              if (n.sms_open && "" == n.formData.code) return void e.index.showToast({
                title: "验证码不能为空！",
                duration: 2e3,
                icon: "none"
              });
              i.code = n.formData.code, t = "user.useropen/smslogin"
            } else {
              if (i.password = n.formData.password, "" == n.formData.password) return void e.index.showToast({
                title: "密码不能为空！",
                duration: 2e3,
                icon: "none"
              });
              t = "user.useropen/phonelogin"
            }
            e.index.showLoading({
              title: "正在提交"
            }), n._post(t, i, (function(i) {
              e.index.setStorageSync("token", i.data.token), e.index.setStorageSync("user_id", i.data.user_id);
              var t = "/" + e.index.getStorageSync("currentPage"),
                s = e.index.getStorageSync("currentPageOptions");
              if (Object.keys(s).length > 0) {
                for (var r in t += "?", s) t += r + "=" + s[r] + "&";
                t = t.substring(0, t.length - 1)
              }
              o.globalData.is_login ? n.gotoPage(t, "redirect") : o.getWxopen((function() {
                n.gotoPage(t, "redirect")
              }))
            }), !1, (function() {
              e.index.hideLoading()
            }))
          } else e.index.showToast({
            title: "手机有误,请重填！",
            duration: 2e3,
            icon: "none"
          })
        } else e.index.showToast({
          title: "请先阅读并接受用户协议及隐私政策",
          duration: 2e3,
          icon: "none"
        })
      },
      resetpasswordSub: function() {
        var o = this;
        /^1(3|4|5|6|7|8|9)\d{9}$/.test(o.resetpassword.mobile) ? "" != o.resetpassword.code ? o.resetpassword.password.length < 6 ? e.index.showToast({
          title: "密码至少6位数！",
          duration: 2e3,
          icon: "none"
        }) : o.resetpassword.password === o.resetpassword.repassword ? (e.index.showLoading({
          title: "正在提交"
        }), o._post("user.useropen/resetpassword", o.resetpassword, (function(n) {
          e.index.showToast({
            title: "重置成功",
            duration: 3e3
          }), o.formData.mobile = o.resetpassword.mobile, o.resetpassword = {
            mobile: "",
            password: "",
            repassword: "",
            code: ""
          }, o.second = 0, o.changeMsg(), o.is_login = 1
        }), !1, (function() {
          e.index.hideLoading()
        }))) : e.index.showToast({
          title: "两次密码输入不一致！",
          duration: 2e3,
          icon: "none"
        }) : e.index.showToast({
          title: "验证码不能为空！",
          duration: 2e3,
          icon: "none"
        }) : e.index.showToast({
          title: "手机有误,请重填！",
          duration: 2e3,
          icon: "none"
        })
      },
      sendCode: function() {
        var o = this;
        if (0 != o.is_login) {
          if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(o.formData.mobile)) return void e.index.showToast({
            title: "手机有误,请重填！",
            duration: 2e3,
            icon: "none"
          })
        } else if (0 == o.is_login && !/^1(3|4|5|6|7|8|9)\d{9}$/.test(o.resetpassword.mobile)) return void e.index.showToast({
          title: "手机有误,请重填！",
          duration: 2e3,
          icon: "none"
        });
        var n = o.formData.mobile;
        0 == o.is_login && (n = o.resetpassword.mobile), o._post("user.useropen/sendCode", {
          mobile: n,
          type: "sms"
        }, (function(n) {
          1 == n.code && (e.index.showToast({
            title: "发送成功"
          }), o.is_send = !0, o.changeMsg())
        }))
      },
      changeMsg: function() {
        this.second > 0 ? (this.send_btn_txt = this.second + "秒", this.second--, setTimeout(this.changeMsg, 1e3)) : (this.send_btn_txt = "获取验证码", this.second = 60, this.is_send = !1)
      },
      quickLogin: function() {
        var n = this,
          i = navigator.userAgent.toLowerCase(),
          t = /micromessenger/.test(i) ? "mp" : "h5";
        e.index.showLoading({
          title: "登录中..."
        }), this._post("user.user/getUserByTokenH5", {
          source: t,
          referee_id: e.index.getStorageSync("referee_id") || 0
        }, (function(i) {
          e.index.hideLoading(), i.data.token && e.index.setStorageSync("token", i.data.token), e.index.setStorageSync("user_id", i.data.user_id);
          var t = "/" + e.index.getStorageSync("currentPage"),
            s = e.index.getStorageSync("currentPageOptions");
          if (Object.keys(s).length > 0) {
            for (var r in t += "?", s) t += r + "=" + s[r] + "&";
            t = t.substring(0, t.length - 1)
          }
          o.globalData.is_login ? n.gotoPage(t, "redirect") : o.getWxopen((function() {
            n.gotoPage(t, "redirect")
          }))
        }), (function(o) {
          e.index.hideLoading()
        }))
      }
    }
  },
  i = e._export_sfc(n, [
    ["render", function(o, n, i, t, s, r) {
      return e.e({
        a: e.o((function(e) {
          return o.gotoPage("/pages/index/index")
        }), "d4"),
        b: 0 != s.is_login
      }, 0 != s.is_login ? e.e({
        c: 2 == s.is_login
      }, (s.is_login, {}), {
        d: 1 == s.is_login
      }, (s.is_login, {}), {
        e: 2 == s.is_login
      }, (s.is_login, {}), {
        f: s.is_send,
        g: s.formData.mobile,
        h: e.o((function(e) {
          return s.formData.mobile = e.detail.value
        }), "bc"),
        i: 1 == s.is_login
      }, 1 == s.is_login ? {
        j: s.formData.password,
        k: e.o((function(e) {
          return s.formData.password = e.detail.value
        }), "f4"),
        l: e.o((function(e) {
          return s.is_login = 0
        }), "8d")
      } : {}, {
        m: 2 == s.is_login && s.sms_open
      }, 2 == s.is_login && s.sms_open ? {
        n: s.formData.code,
        o: e.o((function(e) {
          return s.formData.code = e.detail.value
        }), "6f"),
        p: e.t(s.send_btn_txt),
        q: e.o((function() {
          return r.sendCode && r.sendCode.apply(r, arguments)
        }), "1b"),
        r: s.is_send
      } : {}) : {}, {
        s: 0 == s.is_login
      }, 0 == s.is_login ? {
        t: s.is_send,
        v: s.resetpassword.mobile,
        w: e.o((function(e) {
          return s.resetpassword.mobile = e.detail.value
        }), "e1"),
        x: s.resetpassword.code,
        y: e.o((function(e) {
          return s.resetpassword.code = e.detail.value
        }), "b1"),
        z: e.t(s.send_btn_txt),
        A: e.o((function() {
          return r.sendCode && r.sendCode.apply(r, arguments)
        }), "6e"),
        B: s.is_send,
        C: s.resetpassword.password,
        D: e.o((function(e) {
          return s.resetpassword.password = e.detail.value
        }), "3c"),
        E: s.resetpassword.repassword,
        F: e.o((function(e) {
          return s.resetpassword.repassword = e.detail.value
        }), "5c")
      } : {}, {
        G: e.n(s.isRead ? "active agreement" : "agreement"),
        H: e.o((function(e) {
          return r.xieyi("service")
        }), "51"),
        I: e.o((function(e) {
          return r.xieyi("privacy")
        }), "75"),
        J: e.o((function(e) {
          return s.isRead = !s.isRead
        }), "e5"),
        K: 2 == s.is_login
      }, 2 == s.is_login ? {
        L: e.o((function() {
          return r.formSubmit && r.formSubmit.apply(r, arguments)
        }), "25")
      } : {}, {
        M: 1 == s.is_login
      }, 1 == s.is_login ? {
        N: e.o((function() {
          return r.formSubmit && r.formSubmit.apply(r, arguments)
        }), "67")
      } : {}, {
        O: 0 == s.is_login
      }, 0 == s.is_login ? {
        P: e.o((function() {
          return r.resetpasswordSub && r.resetpasswordSub.apply(r, arguments)
        }), "e7")
      } : {}, {
        Q: 1 == s.is_login
      }, 1 == s.is_login ? {
        R: e.o((function(e) {
          return s.is_login = 2
        }), "cb")
      } : {}, {
        S: 2 == s.is_login
      }, 2 == s.is_login ? {
        T: e.o((function(e) {
          return s.is_login = 1
        }), "78")
      } : {}, {
        U: 0 == s.is_login
      }, 0 == s.is_login ? {
        V: e.o((function(e) {
          return s.is_login = 1
        }), "d7")
      } : {}, {
        W: o.theme(),
        X: e.n(o.theme() || "")
      })
    }],
    ["__scopeId", "data-v-6d71fea3"]
  ]);
wx.createPage(i);