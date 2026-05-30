var e = require("../../common/vendor.js"),
  o = {
    data: function() {
      return {
        formData: {
          mobile: "",
          code: ""
        },
        loging_password: "",
        register: {
          mobile: "",
          password: "",
          repassword: "",
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
        isShow: !0,
        is_login: 1,
        is_code: !1,
        phoneHeight: 0,
        isRead: !1,
        showWeixin: !1,
        showApple: !1,
        sms_open: !1,
        canUniverify: !1
      }
    },
    onLoad: function() {},
    onShow: function() {
      this.init(), this.getCodeType()
    },
    methods: {
      getCodeType: function() {
        var e = this;
        e._get("index/loginSetting", {}, (function(o) {
          e.sms_open = o.data.setting.h5_sms_open, e.is_code = e.sms_open
        }))
      },
      init: function() {
        var o = this;
        e.index.getSystemInfo({
          success: function(e) {
            o.phoneHeight = e.windowHeight
          }
        }), plus.runtime.isApplicationExist({
          pname: "com.tencent.mm",
          action: "weixin://"
        }) && (o.showWeixin = !0), e.index.getSystemInfo({
          success: function(e) {
            e.system.replace(/iOS /, ""), "ios" == e.platform && (o.showApple = !0)
          }
        })
      },
      formSubmit: function() {
        var o = this,
          i = {
            mobile: o.formData.mobile
          },
          n = "";
        if (o.isRead) {
          if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(o.formData.mobile)) return console.log(o.formData.mobile), void e.index.showToast({
            title: "手机有误,请重填！",
            duration: 2e3,
            icon: "none"
          });
          if (o.is_code) {
            if (console.log(o.is_code), "" == o.formData.code) return void e.index.showToast({
              title: "验证码不能为空！",
              duration: 2e3,
              icon: "none"
            });
            i.code = o.formData.code, n = "user.useropen/smslogin"
          } else {
            if ("" == o.loging_password) return void e.index.showToast({
              title: "密码不能为空！",
              duration: 2e3,
              icon: "none"
            });
            i.password = o.loging_password, n = "user.useropen/phonelogin"
          }
          e.index.showLoading({
            title: "正在提交"
          }), o._post(n, i, (function(i) {
            e.index.setStorageSync("token", i.data.token), e.index.setStorageSync("user_id", i.data.user_id);
            var n = e.index.getStorageSync("currentPage"),
              t = e.index.getStorageSync("currentPageOptions");
            if (Object.keys(t).length > 0) {
              for (var s in n += "?", t) n += s + "=" + t[s] + "&";
              n = n.substring(0, n.length - 1)
            }
            o.gotoPage(n)
          }), !1, (function() {
            e.index.hideLoading()
          }))
        } else e.index.showToast({
          title: "请同意并勾选协议内容",
          duration: 2e3,
          icon: "none"
        })
      },
      registerSub: function() {
        var o = this;
        if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(o.register.mobile)) return console.log(o.register.mobile), void e.index.showToast({
          title: "手机有误,请重填！",
          duration: 2e3,
          icon: "none"
        });
        o.sms_open && "" == o.register.code ? e.index.showToast({
          title: "验证码不能为空！",
          duration: 2e3,
          icon: "none"
        }) : o.register.password.length < 6 ? e.index.showToast({
          title: "密码至少6位数！",
          duration: 2e3,
          icon: "none"
        }) : o.register.password === o.register.repassword ? o.isRead ? (o.register.invitation_id = e.index.getStorageSync("invitation_id") ? e.index.getStorageSync("invitation_id") : 0, o.register.reg_source = "app", o.register.referee_id = e.index.getStorageSync("referee_id"), e.index.showLoading({
          title: "正在提交"
        }), o._post("user.useropen/register", o.register, (function(i) {
          e.index.showToast({
            title: "注册成功",
            duration: 3e3
          }), o.formData.mobile = o.register.mobile, o.register = {
            mobile: "",
            password: "",
            repassword: "",
            code: ""
          }, o.second = 0, o.changeMsg(), o.is_login = 1
        }), !1, (function() {
          e.index.hideLoading()
        }))) : e.index.showToast({
          title: "请同意并勾选协议内容",
          duration: 2e3,
          icon: "none"
        }) : e.index.showToast({
          title: "两次密码输入不一致！",
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
        }), o._post("user.useropen/resetpassword", o.resetpassword, (function(i) {
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
      isCode: function() {
        this.is_code ? this.$set(this, "is_code", !1) : this.$set(this, "is_code", !0), console.log(this.is_code)
      },
      sendCode: function() {
        var o = this;
        if (1 == o.is_login) {
          if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(o.formData.mobile)) return void e.index.showToast({
            title: "手机有误,请重填！",
            duration: 2e3,
            icon: "none"
          })
        } else if (2 == o.is_login) {
          if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(o.register.mobile)) return void e.index.showToast({
            title: "手机有误,请重填！",
            duration: 2e3,
            icon: "none"
          })
        } else if (0 == o.is_login && !/^1(3|4|5|6|7|8|9)\d{9}$/.test(o.resetpassword.mobile)) return void e.index.showToast({
          title: "手机有误,请重填！",
          duration: 2e3,
          icon: "none"
        });
        var i = "register",
          n = o.register.mobile;
        1 == o.is_login ? (i = "login", n = o.formData.mobile) : 0 == o.is_login && (i = "login", n = o.resetpassword.mobile), o._post("user.useropen/sendCode", {
          mobile: n,
          type: i
        }, (function(i) {
          1 == i.code && (e.index.showToast({
            title: "发送成功"
          }), o.is_send = !0, o.changeMsg())
        }))
      },
      login: function() {
        var o = this;
        plus.oauth.getServices((function(i) {
          var n = i[0];
          n.authResult ? console.log("已经登陆认证") : n.authorize((function(i) {
            e.index.showLoading({
              title: "登录中",
              mask: !0
            }), o._post("user.useropen/login", {
              code: i.code,
              source: "app"
            }, (function(i) {
              e.index.setStorageSync("token", i.data.token), e.index.setStorageSync("user_id", i.data.user_id);
              var n = e.index.getStorageSync("currentPage"),
                t = e.index.getStorageSync("currentPageOptions");
              if (Object.keys(t).length > 0) {
                for (var s in n += "?", t) n += s + "=" + t[s] + "&";
                n = n.substring(0, n.length - 1)
              }
              o.gotoPage(n)
            }), !1, (function() {
              e.index.hideLoading()
            }))
          }), (function(o) {
            console.log("登陆认证失败!"), e.index.showModal({
              title: "认证失败1",
              content: JSON.stringify(o)
            })
          }))
        }), (function(e) {
          console.log("获取服务列表失败：" + JSON.stringify(e))
        }))
      },
      changeMsg: function() {
        this.second > 0 ? (this.send_btn_txt = this.second + "秒", this.second--, setTimeout(this.changeMsg, 1e3)) : (this.send_btn_txt = "获取验证码", this.second = 60, this.is_send = !1)
      },
      xieyi: function(e) {
        this.gotoPage("/pages/webview/ue?type=" + e)
      },
      appleLogin: function() {
        var o = this;
        e.index.login({
          provider: "apple",
          success: function(i) {
            e.index.getUserInfo({
              provider: "apple",
              success: function(i) {
                if ("getUserInfo:ok" !== i.errMsg) return !1;
                e.index.showLoading({
                  title: "正在登录",
                  mask: !0
                }), o._post("user.userapple/login", {
                  invitation_id: o.invitation_id,
                  openId: i.userInfo.openId,
                  nickName: i.userInfo.fullName.giveName ? i.userInfo.fullName.giveName : "",
                  referee_id: e.index.getStorageSync("referee_id"),
                  source: "apple"
                }, (function(i) {
                  e.index.setStorageSync("token", i.data.token), e.index.setStorageSync("user_id", i.data.user_id);
                  var n = e.index.getStorageSync("currentPage"),
                    t = e.index.getStorageSync("currentPageOptions");
                  if (Object.keys(t).length > 0) {
                    for (var s in n += "?", t) n += s + "=" + t[s] + "&";
                    n = n.substring(0, n.length - 1)
                  }
                  o.gotoPage(n)
                }), !1, (function() {
                  e.index.hideLoading()
                }))
              }
            })
          },
          fail: function(e) {
            console.log("登录失败"), console.log(e)
          }
        })
      }
    }
  },
  i = e._export_sfc(o, [
    ["render", function(o, i, n, t, s, r) {
      return e.e({
        a: e.o((function(e) {
          return o.gotoPage("/pages/index/index")
        }), "90"),
        b: 2 == s.is_login
      }, 2 == s.is_login ? e.e({
        c: e.o((function(e) {
          return s.is_login = 1
        }), "1e"),
        d: s.is_send,
        e: s.register.mobile,
        f: e.o((function(e) {
          return s.register.mobile = e.detail.value
        }), "ad"),
        g: s.register.password,
        h: e.o((function(e) {
          return s.register.password = e.detail.value
        }), "68"),
        i: s.register.repassword,
        j: e.o((function(e) {
          return s.register.repassword = e.detail.value
        }), "f9"),
        k: s.sms_open
      }, s.sms_open ? {
        l: s.register.code,
        m: e.o((function(e) {
          return s.register.code = e.detail.value
        }), "5a"),
        n: e.t(s.send_btn_txt),
        o: e.o((function() {
          return r.sendCode && r.sendCode.apply(r, arguments)
        }), "bf"),
        p: s.is_send
      } : {}) : {}, {
        q: 1 == s.is_login
      }, 1 == s.is_login ? e.e({
        r: e.o((function(e) {
          return s.is_login = 2
        }), "70"),
        s: s.formData.mobile,
        t: e.o((function(e) {
          return s.formData.mobile = e.detail.value
        }), "4f"),
        v: !s.is_code
      }, s.is_code ? {} : {
        w: s.loging_password,
        x: e.o((function(e) {
          return s.loging_password = e.detail.value
        }), "45")
      }, {
        y: s.is_code && s.sms_open
      }, s.is_code && s.sms_open ? {
        z: s.formData.code,
        A: e.o((function(e) {
          return s.formData.code = e.detail.value
        }), "06"),
        B: e.t(s.send_btn_txt),
        C: e.o((function() {
          return r.sendCode && r.sendCode.apply(r, arguments)
        }), "34"),
        D: s.is_send
      } : {}) : {}, {
        E: 0 == s.is_login
      }, 0 == s.is_login ? {
        F: e.o((function(e) {
          return s.is_login = 1
        }), "8e"),
        G: s.is_send,
        H: s.resetpassword.mobile,
        I: e.o((function(e) {
          return s.resetpassword.mobile = e.detail.value
        }), "3a"),
        J: s.resetpassword.password,
        K: e.o((function(e) {
          return s.resetpassword.password = e.detail.value
        }), "6b"),
        L: s.resetpassword.repassword,
        M: e.o((function(e) {
          return s.resetpassword.repassword = e.detail.value
        }), "4f"),
        N: s.resetpassword.code,
        O: e.o((function(e) {
          return s.resetpassword.code = e.detail.value
        }), "18"),
        P: e.t(s.send_btn_txt),
        Q: e.o((function() {
          return r.sendCode && r.sendCode.apply(r, arguments)
        }), "84"),
        R: s.is_send
      } : {}, {
        S: 1 == s.is_login
      }, 1 == s.is_login ? e.e({
        T: !s.is_code
      }, s.is_code ? {} : {
        U: e.o((function(e) {
          return s.is_login = 0
        }), "f0")
      }, {
        V: s.sms_open
      }, s.sms_open ? {
        W: e.t(s.is_code ? "使用密码登录" : "使用验证码登录"),
        X: e.o((function(e) {
          return r.isCode()
        }), "82")
      } : {}, {
        Y: e.n(s.is_code ? "d-e-c" : "d-b-c")
      }) : {}, {
        Z: e.n(s.isRead ? "active agreement" : "agreement"),
        aa: e.o((function(e) {
          return r.xieyi("service")
        }), "bf"),
        ab: e.o((function(e) {
          return r.xieyi("privacy")
        }), "da"),
        ac: e.o((function(e) {
          return s.isRead = !s.isRead
        }), "b3"),
        ad: 2 == s.is_login
      }, 2 == s.is_login ? {
        ae: e.o((function() {
          return r.registerSub && r.registerSub.apply(r, arguments)
        }), "f3")
      } : {}, {
        af: 1 == s.is_login
      }, 1 == s.is_login ? {
        ag: e.o((function() {
          return r.formSubmit && r.formSubmit.apply(r, arguments)
        }), "14")
      } : {}, {
        ah: s.canUniverify
      }, s.canUniverify ? {
        ai: e.o((function() {
          return o.univerifyLogin && o.univerifyLogin.apply(o, arguments)
        }), "9d")
      } : {}, {
        aj: 0 == s.is_login
      }, 0 == s.is_login ? {
        ak: e.o((function() {
          return r.resetpasswordSub && r.resetpasswordSub.apply(r, arguments)
        }), "57")
      } : {}, {
        al: 1 == s.is_login
      }, 1 == s.is_login ? e.e({
        am: s.showWeixin
      }, s.showWeixin ? {
        an: e.o((function() {
          return r.login && r.login.apply(r, arguments)
        }), "7d")
      } : {}, {
        ao: s.showApple
      }, s.showApple ? {
        ap: e.o((function() {
          return r.appleLogin && r.appleLogin.apply(r, arguments)
        }), "54"),
        aq: o.config.pic_url + "/static/live/ios.png"
      } : {}) : {}, {
        ar: o.theme(),
        as: e.n(o.theme() || ""),
        at: e.s("height: " + s.phoneHeight + "px;")
      })
    }],
    ["__scopeId", "data-v-b79d7d08"]
  ]);
wx.createPage(i);