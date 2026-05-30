var e = require("../../common/vendor.js");
require("../../env/config.js");
var t = getApp(),
  i = {
    data: function() {
      return {
        formData: {
          mobile: "",
          password: ""
        },
        setting: {
          name: "",
          login_logo: ""
        },
        isFromIndex: !1
      }
    },
    onLoad: function(i) {
      "index" === i.from && (this.isFromIndex = !0);
      var n = e.index.getStorageSync("setting_" + t.globalData.app_id);
      n && (this.setting = n), e.index.hideShareMenu()
    },
    onShow: function() {},
    methods: {
      createAccount: function() {
        e.index.setStorageSync("auto_open_add_streamer", !0), e.index.navigateBack()
      },
      goLiveList: function() {
        e.index.reLaunch({
          url: "/pages/live-push/live-list"
        })
      },
      formSubmit: function() {
        /^1(3|4|5|6|7|8|9)\d{9}$/.test(this.formData.mobile) ? "" != this.formData.password ? (e.index.showLoading({
          title: "正在提交"
        }), this._post("user.user/anchorLogin", {
          mobile: this.formData.mobile,
          password: this.formData.password
        }, (function(i) {
          if (e.index.hideLoading(), 1 == i.code) {
            e.index.showToast({
              title: i.msg,
              icon: "success"
            }), e.index.setStorageSync("token", i.data.token), e.index.setStorageSync("user_id", i.data.user_id), e.index.setStorageSync("shop_supplier_id", i.data.shop_supplier_id), t.globalData.is_login = !0, t.globalData.imUserId = i.data.im_user_id, t.globalData.imUserSig = i.data.im_user_sig, t.imLogout((function() {
              t.imLogin()
            }));
            var n = "/" + e.index.getStorageSync("currentPage"),
              o = e.index.getStorageSync("currentPageOptions");
            if (null != o && null != o) {
              if (Object.keys(o).length > 0) {
                for (var a in n += "?", o) n += a + "=" + o[a] + "&";
                n = n.substring(0, n.length - 1)
              }
              setTimeout((function() {
                e.index.reLaunch({
                  url: "/pages/live-push/live-list"
                })
              }), 1e3)
            } else setTimeout((function() {
              e.index.reLaunch({
                url: "/pages/live-push/live-list"
              })
            }), 1e3)
          } else e.index.showToast({
            title: i.msg,
            icon: "none"
          })
        }), !1, (function(t) {
          console.log(t), e.index.hideLoading()
        }))) : e.index.showToast({
          title: "密码不能为空！",
          duration: 2e3,
          icon: "none"
        }) : e.index.showToast({
          title: "手机有误,请重填！",
          duration: 2e3,
          icon: "none"
        })
      }
    }
  },
  n = e._export_sfc(i, [
    ["render", function(t, i, n, o, a, s) {
      return e.e({
        a: a.setting.login_logo || t.config.pic_url + "/static/live/default_logo.jpeg",
        b: e.t(a.setting.name),
        c: a.formData.mobile,
        d: e.o((function(e) {
          return a.formData.mobile = e.detail.value
        }), "54"),
        e: a.formData.password,
        f: e.o((function(e) {
          return a.formData.password = e.detail.value
        }), "db"),
        g: e.o((function() {
          return s.formSubmit && s.formSubmit.apply(s, arguments)
        }), "56"),
        h: a.isFromIndex
      }, (a.isFromIndex, {}), {
        i: a.isFromIndex
      }, a.isFromIndex ? {
        j: e.o((function() {
          return s.createAccount && s.createAccount.apply(s, arguments)
        }), "87")
      } : {}, {
        k: e.o((function() {
          return s.goLiveList && s.goLiveList.apply(s, arguments)
        }), "e0"),
        l: t.theme(),
        m: e.n(t.theme() || "")
      })
    }],
    ["__scopeId", "data-v-df58a860"]
  ]);
wx.createPage(n);