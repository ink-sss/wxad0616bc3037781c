var e = require("../../../common/vendor.js"),
  n = {
    __name: "full-screen-loading",
    props: {
      title: {
        type: [Number, String],
        default: ""
      }
    },
    setup: function(n) {
      var t = e.ref(0),
        r = null;
      return e.onMounted((function() {
          t.value = 0, r = setInterval((function() {
            t.value += 2, t.value >= 25 && clearInterval(r)
          }), 10)
        })), e.onUnmounted((function() {
          r && clearInterval(r)
        })),
        function(r, u) {
          return {
            a: "blur(".concat(t.value, "px)"),
            b: "blur(".concat(t.value, "px)"),
            c: e.t(n.title)
          }
        }
    }
  },
  t = e._export_sfc(n, [
    ["__scopeId", "data-v-828d64a6"]
  ]);
wx.createComponent(t);