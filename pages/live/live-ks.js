var e = require("../../common/vendor.js");
Array || e.resolveComponent("uni-notice-bar")(), Math || (function() {
  return "../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js"
} + o)();
var o = function() {
    return "../../components/notice-bar-nvue.js"
  },
  r = {
    __name: "live-ks",
    setup: function(o) {
      var r = e.ref("阿斯卡吉受打，生");
      return function(o, n) {
        return e.e({
          a: "" != r.value
        }, "" != r.value ? {
          b: e.p({
            color: "#ffffff",
            "background-color": "rgba(1,1,1,0.75)",
            speed: 50,
            scrollable: !0,
            single: !0,
            text: r.value,
            moreColor: "#de8c17",
            moreText: "查看更多",
            showIcon: !0,
            showClose: !0
          })
        } : {}, {
          c: e.p({
            text: r.value,
            speed: 30,
            backgroundColor: "rgba(1,1,1,0.75)",
            color: "#ffffff",
            showClose: !0
          })
        })
      }
    },
    __runtimeHooks: 6
  };
wx.createPage(r);