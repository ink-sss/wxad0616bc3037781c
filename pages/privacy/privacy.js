var i = require("../../common/vendor.js"),
  e = {
    data: function() {
      return {
        windowHeight: 0,
        windowWidth: 0,
        service: "",
        privacy: ""
      }
    },
    onLoad: function() {
      var e = i.index.getSystemInfoSync();
      this.windowWidth = e.windowWidth, this.windowHeight = e.windowHeight
    },
    methods: {
      submit: function() {
        i.index.setStorageSync("firstEnter", 1), i.index.reLaunch({
          url: "/pages/index/index"
        })
      },
      quit: function() {
        plus.runtime.disagreePrivacy(), plus.runtime.quit(), plus.ios.import("UIApplication").sharedApplication().performSelector("exit")
      },
      xieyi: function(i) {
        this.gotoPage("/pages/webview/ue?type=" + i)
      }
    }
  },
  t = i._export_sfc(e, [
    ["render", function(e, t, n, r, o, u) {
      return {
        a: i.o((function(i) {
          return u.xieyi("service")
        }), "1b"),
        b: i.o((function(i) {
          return u.xieyi("privacy")
        }), "80"),
        c: i.o((function() {
          return u.quit && u.quit.apply(u, arguments)
        }), "9b"),
        d: i.o((function() {
          return u.submit && u.submit.apply(u, arguments)
        }), "ac"),
        e: i.s("width: 750rpx;height:" + o.windowHeight + "px;")
      }
    }]
  ]);
wx.createPage(t);