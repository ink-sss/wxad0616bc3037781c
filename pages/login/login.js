var e = require("../../common/vendor.js"),
  i = getApp(),
  n = {
    components: {
      userSetPop: function() {
        return "./user-set-pop.js"
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
        env_type: "production"
      }
    },
    onShow: function() {
      this.env_type = "production", this.wx_phone = e.index.getStorageSync("wxBinding") || 0
    },
    onLoad: function(i) {
      i.referee_id && e.index.setStorageSync("referee_id", i.referee_id), this.invitation_id = e.index.getStorageSync("invitation_id") || 0;
      var n = this;
      this.getCodeType(), e.index.getUserInfo({
        success: function(i) {
          var o = i.userInfo;
          e.index.login({
            provider: "weixin",
            success: function(i) {
              n.code = i.code, "login:ok" == i.errMsg && (n.code, o.nickName, o.avatarUrl, n._post("user.user/login", {
                code: n.code,
                source: "wx",
                invitation_id: n.invitation_id,
                referee_id: e.index.getStorageSync("referee_id")
              }, (function(e) {
                n.user_id = e.data.user_id, n.mobile = e.data.mobile, n.is_login = e.data.is_login
              }), !1, (function() {
                n.loading = !1
              })))
            }
          })
        }
      })
    },
    methods: {
      loginSuccess: function(n) {
        var o = this;
        o.loading || (o.isRead ? (e.index.showLoading({
          title: "正在处理",
          mask: !0
        }), e.wx$1.login({
          success: function(t) {
            var a = {
              code: t.code,
              shop_supplier_id: i.globalData.shop_supplier_id,
              nickName: n.detail.detail.userInfo.nickName,
              avatarUrl: n.detail.detail.userInfo.avatarUrl
            };
            o._post("user.user/userLogin", a, (function(n) {
              e.index.setStorageSync("token", n.data.token), e.index.setStorageSync("user_id", n.data.user_id), i.globalData.is_login = !0, i.globalData.imUserId = n.data.im_user_id, i.globalData.imUserSig = n.data.im_user_sig, n.data.shop_supplier_id && e.index.setStorageSync("shop_supplier_id", n.data.shop_supplier_id), i.imLogin(), o.setting.wx_phone && !o.mobile && (e.index.setStorageSync("get_phone", !0), e.index.setStorageSync("wx_phone_compulsory", o.setting.wx_phone_compulsory)), e.index.navigateBack()
            }), !1, (function() {
              e.index.hideLoading()
            }))
          }
        })) : e.index.showToast({
          title: "请勾选并同意《隐私政策》和《用户协议》",
          icon: "none"
        }))
      },
      loginFail: function(i) {
        console.log("loginFailloginFailloginFail"), console.log(i), e.index.showToast({
          title: "授权失败，请重新登录",
          icon: "none"
        })
      },
      loginCancel: function(i) {
        console.log("loginCancelloginCancelloginCancel"), console.log(i), e.index.showToast({
          title: "授权失败，请重新登录",
          icon: "none"
        })
      },
      xieyi: function(e) {
        this.gotoPage("/pages/webview/ue?type=" + e)
      },
      setOk: function() {
        e.index.navigateBack()
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
      UserLogin: function() {
        var n = this;
        n.loading || (n.isRead ? (e.index.showLoading({
          title: "正在处理",
          mask: !0
        }), e.wx$1.login({
          success: function(o) {
            var t = {
              code: o.code,
              shop_supplier_id: i.globalData.shop_supplier_id
            };
            n._post("user.user/userLogin", t, (function(o) {
              e.index.setStorageSync("token", o.data.token), e.index.setStorageSync("user_id", o.data.user_id), i.globalData.is_login = !0, i.globalData.imUserId = o.data.im_user_id, i.globalData.imUserSig = o.data.im_user_sig, o.data.shop_supplier_id && e.index.setStorageSync("shop_supplier_id", o.data.shop_supplier_id), i.imLogin(), n.is_login && n.setting.wx_get_nickname ? n.$refs.userSetPop.showUserSetPop() : e.index.navigateBack()
            }), !1, (function() {
              e.index.hideLoading()
            }))
          }
        })) : e.index.showToast({
          title: "请勾选并同意《隐私政策》和《用户协议》",
          icon: "none"
        }))
      },
      getUserInfo: function(n) {
        var o = this;
        if (!o.loading)
          if (o.isRead) {
            if ("getPhoneNumber:ok" !== n.detail.errMsg) return !1;
            e.index.showLoading({
              title: "正在处理",
              mask: !0
            }), e.wx$1.login({
              success: function(t) {
                var a = {
                  code: t.code,
                  user_id: o.user_id,
                  encrypted_data: n.detail.encryptedData,
                  iv: n.detail.iv
                };
                o._post("user.user/bindMobile", a, (function(n) {
                  e.index.setStorageSync("token", n.data.token), e.index.setStorageSync("user_id", n.data.user_id), i.globalData.is_login = !0, i.globalData.imUserId = n.data.im_user_id, i.globalData.imUserSig = n.data.im_user_sig, i.imLogin(), o.is_login && o.setting.wx_get_nickname ? o.$refs.userSetPop.showUserSetPop() : e.index.navigateBack()
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
        var n = this;
        e.index.login({
          provider: "alipay",
          success: function(i) {
            e.index.getUserInfo({
              provider: "alipay",
              success: function(e) {
                n.aliPayLogin(i, e)
              }
            })
          },
          fail: function(e) {
            console.log(e)
          }
        })
      },
      aliPayLogin: function(i, n) {
        var o = this;
        e.index.showLoading({
          title: "登录中",
          mask: !0
        }), o._post("user.useralipay/login", {
          code: i.code,
          avatar: n.avatar,
          nickName: n.nickName
        }, (function(i) {
          e.index.setStorageSync("token", i.data.token), e.index.setStorageSync("user_id", i.data.user_id), o.gotoPage("/pages/index/index", "redirect")
        }), !1, (function() {
          o.gotoPage("/pages/index/index", "redirect")
        }))
      }
    },
    onUnload: function() {
      e.index.reLaunch({
        url: "/pages/index/index"
      })
    }
  };
Array || (e.resolveComponent("wechat-login") + e.resolveComponent("user-set-pop"))();
var o = e._export_sfc(n, [
  ["render", function(i, n, o, t, a, s) {
    return e.e({
      a: a.setting.login_logo || i.config.pic_url + "/static/live/default_logo.jpeg",
      b: e.t(a.setting.name),
      c: "development" == a.env_type
    }, "development" == a.env_type ? e.e({
      d: !a.mobile
    }, a.mobile ? {
      h: e.o((function() {
        return s.UserLogin && s.UserLogin.apply(s, arguments)
      }), "74")
    } : e.e({
      e: a.wx_phone
    }, a.wx_phone ? {
      f: e.o((function() {
        return s.getUserInfo && s.getUserInfo.apply(s, arguments)
      }), "f4")
    } : {
      g: e.o((function(e) {
        return s.UserLogin()
      }), "ac")
    })) : {
      i: e.o(s.loginSuccess, "17"),
      j: e.o(s.loginFail, "8a"),
      k: e.o(s.loginCancel, "94")
    }, {
      l: e.n(a.isRead ? "active agreement" : "agreement"),
      m: e.o((function(e) {
        return s.xieyi("service")
      }), "9d"),
      n: e.o((function(e) {
        return s.xieyi("privacy")
      }), "c9"),
      o: e.o((function(e) {
        return a.isRead = !a.isRead
      }), "db"),
      p: e.o((function() {
        return s.onNotLogin && s.onNotLogin.apply(s, arguments)
      }), "a0"),
      q: e.sr("userSetPop", "011e9eb4-1"),
      r: e.o(s.setOk, "77"),
      s: i.theme(),
      t: e.n(i.theme() || "")
    })
  }]
]);
wx.createPage(o);