var e = require("../../common/vendor.js"),
  n = {
    data: function() {
      return {
        sessionKey: ""
      }
    },
    onLoad: function() {
      var n = this;
      e.wx$1.login({
        success: function(e) {
          n._post("user.user/getSession", {
            code: e.code
          }, (function(e) {
            n.sessionKey = e.data.session_key
          }))
        }
      })
    },
    methods: {
      onNotLogin: function() {
        this.gotoPage("/pages/index/index")
      },
      getPhoneNumber: function(n) {
        var o = this;
        if (console.log(n.detail), "getPhoneNumber:ok" !== n.detail.errMsg) return !1;
        e.index.showLoading({
          title: "正在处理",
          mask: !0
        }), e.wx$1.login({
          success: function(i) {
            o._post("user.user/bindMobile", {
              session_key: o.sessionKey,
              encrypted_data: n.detail.encryptedData,
              iv: n.detail.iv
            }, (function(n) {
              e.index.hideLoading(), e.index.navigateBack()
            }), !1, (function() {
              e.index.hideLoading()
            }))
          }
        })
      }
    }
  },
  o = e._export_sfc(n, [
    ["render", function(n, o, i, t, s, r) {
      return {
        a: e.o((function() {
          return r.getPhoneNumber && r.getPhoneNumber.apply(r, arguments)
        }), "87"),
        b: e.o((function() {
          return r.onNotLogin && r.onNotLogin.apply(r, arguments)
        }), "45")
      }
    }]
  ]);
wx.createPage(o);