var o = require("../../common/vendor.js"),
  e = {
    props: {
      wxPhoneCompulsory: {
        type: Boolean,
        default: !1
      }
    },
    data: function() {
      return {
        sessionKey: ""
      }
    },
    created: function() {
      var e = this;
      o.wx$1.login({
        success: function(o) {
          e._post("user.user/getSession", {
            code: o.code
          }, (function(o) {
            e.sessionKey = o.data.session_key
          }))
        }
      })
    },
    methods: {
      showUserLoginPop: function() {
        console.log("显示弹窗啊"), this.$refs.userLogin.open("bottom")
      },
      closeUserLoginPop: function() {
        this.$refs.userLogin.close()
      },
      onNotLogin: function() {
        this.wxPhoneCompulsory || this.closeUserLoginPop()
      },
      getPhoneNumber: function(e) {
        var n = this;
        if (console.log(e.detail), "getPhoneNumber:ok" !== e.detail.errMsg) return !1;
        o.index.showLoading({
          title: "正在处理",
          mask: !0
        }), o.wx$1.login({
          success: function(s) {
            n._post("user.user/bindMobile", {
              session_key: n.sessionKey,
              code: s.code,
              encrypted_data: e.detail.encryptedData,
              iv: e.detail.iv,
              user_id: o.index.getStorageSync("user_id")
            }, (function(e) {
              o.index.hideLoading(), n.closeUserLoginPop()
            }), !1, (function() {
              o.index.hideLoading(), n.closeUserLoginPop()
            }))
          }
        })
      }
    }
  };
Array || o.resolveComponent("uni-popup")(), Math;
var n = o._export_sfc(e, [
  ["render", function(e, n, s, r, i, t) {
    return o.e({
      a: !s.wxPhoneCompulsory
    }, s.wxPhoneCompulsory ? {} : {
      b: o.o((function() {
        return t.closeUserLoginPop && t.closeUserLoginPop.apply(t, arguments)
      }), "35")
    }, {
      c: o.o((function() {
        return t.getPhoneNumber && t.getPhoneNumber.apply(t, arguments)
      }), "03"),
      d: !s.wxPhoneCompulsory
    }, s.wxPhoneCompulsory ? {} : {
      e: o.o((function() {
        return t.onNotLogin && t.onNotLogin.apply(t, arguments)
      }), "37")
    }, {
      f: o.sr("userLogin", "e6786b94-0"),
      g: o.p({
        "mask-click": !s.wxPhoneCompulsory,
        type: "bottom",
        "background-color": "#fff",
        "border-radius": "24px 24px 0 0"
      })
    })
  }]
]);
wx.createComponent(n);