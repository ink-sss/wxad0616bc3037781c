var e = require("../../common/vendor.js");
require("../../store/index.js");
var i = getApp(),
  o = {
    components: {
      userSetPop: function() {
        return "./user-set-pop.js"
      },
      bindMobile: function() {
        return "./bindmobile-pop.js"
      }
    },
    data: function() {
      return {
        wx_phone: !1,
        loading: !0,
        background: "",
        listData: [],
        invitation_id: 0,
        user_id: "",
        mobile: !0,
        isRead: !1,
        setting: {
          login_desc: "",
          login_logo: "",
          name: "",
          wx_get_nickname: !0,
          wx_phone: !1,
          wx_phone_compulsory: !1
        },
        is_login: !1,
        is_detection: !1,
        unconscious_login: 0,
        env_type: "production",
        isH5: !1
      }
    },
    created: function() {
      this.env_type = "production", this.wx_phone = e.index.getStorageSync("wxBinding") || 0, this.invitation_id = e.index.getStorageSync("invitation_id") || 0;
      var i = this;
      this.getCodeType(), e.index.getUserInfo({
        success: function(o) {
          var n = o.userInfo;
          e.index.login({
            provider: "weixin",
            success: function(o) {
              console.log("res-login", o), i.code = o.code, "login:ok" == o.errMsg && (i.code, n.nickName, n.avatarUrl, i._post("user.user/login", {
                code: i.code,
                source: "wx",
                invitation_id: i.invitation_id,
                referee_id: e.index.getStorageSync("referee_id")
              }, (function(e) {
                i.user_id = e.data.user_id, i.mobile = e.data.mobile, i.is_login = e.data.is_login, i.is_detection = !0, 1 == i.unconscious_login && i.UserLogin()
              }), !1, (function() {
                i.loading = !1
              })))
            }
          })
        }
      })
    },
    methods: {
      loginSuccess: function(o) {
        var n = this;
        n.loading || (e.index.showLoading({
          title: "正在处理",
          mask: !0
        }), e.wx$1.login({
          success: function(t) {
            var s = {
              code: t.code,
              nickName: o.detail.detail.userInfo.nickName,
              avatarUrl: o.detail.detail.userInfo.avatarUrl
            };
            n._post("user.user/userLogin", s, (function(o) {
              i.imLogout(), e.index.setStorageSync("token", o.data.token), e.index.setStorageSync("user_id", o.data.user_id), i.globalData.is_login = !0, i.globalData.imUserId = o.data.im_user_id, i.globalData.imUserSig = o.data.im_user_sig, i.imLogin(), n.$emit("loginOk"), n.closeUserLoginPop(), n.setting.wx_phone && !n.mobile && n.$refs.bindmobile.showUserLoginPop()
            }), !1, (function() {
              e.index.hideLoading()
            }))
          }
        }))
      },
      loginFail: function(i) {
        e.index.showToast({
          title: "授权失败，请重新登录",
          icon: "none"
        })
      },
      loginCancel: function(i) {
        e.index.showToast({
          title: "授权失败，请重新登录",
          icon: "none"
        })
      },
      showUserLoginPop: function(e) {
        this.isH5 ? 1 == e ? this.quickLogin() : this.$refs.userLogin.open("bottom") : 1 == e ? (this.unconscious_login = 1, this.is_detection && this.UserLogin()) : this.$refs.userLogin.open("bottom")
      },
      closeUserLoginPop: function() {
        this.$refs.userLogin.close()
      },
      xieyi: function(e) {
        this.gotoPage("/pages/webview/ue?type=" + e)
      },
      setOk: function() {
        this.$emit("loginOk"), this.closeUserLoginPop()
      },
      getCodeType: function() {
        var e = this;
        e._post("index/loginSetting", {}, (function(i) {
          e.setting = i.data.setting
        }))
      },
      onNotLogin: function() {
        this.gotoPage("/pages/index/index")
      },
      goH5Login: function() {
        this.isRead ? this.isH5 ? this.quickLogin() : this.doLogin() : e.index.showToast({
          title: "请勾选并同意《隐私政策》和《用户协议》",
          icon: "none"
        })
      },
      UserLogin: function() {
        var o = this;
        o.loading && 0 == this.unconscious_login || (o.isRead || 0 != this.unconscious_login ? (0 == this.unconscious_login && e.index.showLoading({
          title: "正在处理",
          mask: !0
        }), e.wx$1.login({
          success: function(n) {
            var t = {
              code: n.code
            };
            o._post("user.user/userLogin", t, (function(n) {
              i.imLogout(), e.index.setStorageSync("token", n.data.token), e.index.setStorageSync("user_id", n.data.user_id), i.globalData.is_login = !0, i.globalData.imUserId = n.data.im_user_id, i.globalData.imUserSig = n.data.im_user_sig, i.imLogin(), 0 == o.unconscious_login ? o.is_login && o.setting.wx_get_nickname ? o.$refs.userSetPop.showUserSetPop() : (o.$emit("loginOk"), o.closeUserLoginPop()) : o.$emit("loginOk")
            }), !1, (function() {
              e.index.hideLoading()
            }))
          }
        })) : e.index.showToast({
          title: "请勾选并同意《隐私政策》和《用户协议》",
          icon: "none"
        }))
      },
      getUserInfo: function(o) {
        var n = this;
        if (!n.loading)
          if (n.isRead) {
            if ("getPhoneNumber:ok" !== o.detail.errMsg) return !1;
            e.index.showLoading({
              title: "正在处理",
              mask: !0
            }), e.wx$1.login({
              success: function(t) {
                var s = {
                  code: t.code,
                  user_id: n.user_id,
                  encrypted_data: o.detail.encryptedData,
                  iv: o.detail.iv
                };
                n._post("user.user/bindMobile", s, (function(o) {
                  i.imLogout(), e.index.setStorageSync("token", o.data.token), e.index.setStorageSync("user_id", o.data.user_id), i.globalData.is_login = !0, i.globalData.imUserId = o.data.im_user_id, i.globalData.imUserSig = o.data.im_user_sig, i.imLogin(), n.is_login && n.setting.wx_get_nickname ? n.$refs.userSetPop.showUserSetPop() : (n.$emit("loginOk"), n.closeUserLoginPop())
                }), !1, (function() {
                  e.index.hideLoading()
                }))
              }
            })
          } else e.index.showToast({
            title: "请勾选并同意《隐私政策》和《用户协议》",
            icon: "none"
          })
      },
      onGetAuthorize: function(i) {
        console.log("开始授权");
        var o = this;
        e.index.login({
          provider: "alipay",
          success: function(i) {
            console.log("sucss"), e.index.getUserInfo({
              provider: "alipay",
              success: function(e) {
                o.aliPayLogin(i, e)
              }
            })
          },
          fail: function(e) {
            console.log(e)
          }
        })
      },
      aliPayLogin: function(i, o) {
        var n = this;
        console.log(i), console.log(o), e.index.showLoading({
          title: "登录中",
          mask: !0
        }), n._post("user.useralipay/login", {
          code: i.code,
          avatar: o.avatar,
          nickName: o.nickName
        }, (function(i) {
          console.log(i.data.token), e.index.setStorageSync("token", i.data.token), e.index.setStorageSync("user_id", i.data.user_id), n.gotoPage("/pages/index/index", "redirect")
        }), !1, (function() {
          n.gotoPage("/pages/index/index", "redirect")
        }))
      },
      quickLogin: function() {
        var o = this,
          n = navigator.userAgent.toLowerCase(),
          t = /micromessenger/.test(n) ? "mp" : "h5";
        e.index.showLoading({
          title: "登录中...",
          mask: !0
        }), this._post("user.user/getUserByTokenH5", {
          source: t,
          referee_id: e.index.getStorageSync("referee_id") || 0
        }, (function(n) {
          e.index.hideLoading(), n.data.token && e.index.setStorageSync("token", n.data.token), e.index.setStorageSync("user_id", n.data.user_id), i.imLogout(), i.globalData.is_login = !0, i.globalData.imUserId = n.data.im_user_id, i.globalData.imUserSig = n.data.im_user_sig, i.imLogin(), o.$emit("loginOk"), o.closeUserLoginPop()
        }), (function(i) {
          e.index.hideLoading()
        }))
      },
      read: function() {
        this.isRead = !this.isRead
      }
    }
  };
Array || (e.resolveComponent("wechat-login") + e.resolveComponent("uni-popup") + e.resolveComponent("user-set-pop") + e.resolveComponent("bind-mobile"))(), Math;
var n = e._export_sfc(o, [
  ["render", function(i, o, n, t, s, a) {
    return e.e({
      a: "development" == s.env_type
    }, "development" == s.env_type ? e.e({
      b: !s.mobile
    }, s.mobile ? {
      f: e.o((function() {
        return a.UserLogin && a.UserLogin.apply(a, arguments)
      }), "cc")
    } : e.e({
      c: s.wx_phone
    }, s.wx_phone ? {
      d: e.o((function() {
        return a.getUserInfo && a.getUserInfo.apply(a, arguments)
      }), "7f")
    } : {
      e: e.o((function(e) {
        return a.UserLogin()
      }), "38")
    })) : {
      g: e.o(a.loginSuccess, "30"),
      h: e.o(a.loginFail, "9f"),
      i: e.o(a.loginCancel, "2c")
    }, {
      j: e.n(s.isRead ? "active agreement" : "agreement"),
      k: e.o((function(e) {
        return a.xieyi("service")
      }), "67"),
      l: e.o((function(e) {
        return a.xieyi("privacy")
      }), "45"),
      m: e.o((function(e) {
        return a.read()
      }), "88"),
      n: e.sr("userLogin", "5c2c02ac-0"),
      o: e.p({
        "mask-click": !1,
        type: "bottom",
        "background-color": "#fff",
        "border-radius": "20px 20px 0 0"
      }),
      p: e.sr("userSetPop", "5c2c02ac-2"),
      q: e.o(a.setOk, "87"),
      r: e.sr("bindmobile", "5c2c02ac-3"),
      s: e.p({
        "wx-phone-compulsory": s.setting.wx_phone_compulsory
      }),
      t: i.theme(),
      v: e.n(i.theme() || "")
    })
  }]
]);
wx.createComponent(n);