var e = require("../../../common/vendor.js"),
  n = {
    __name: "parallelogram-dashed-linp",
    props: {
      lineWidth: {
        type: Number,
        default: 750
      }
    },
    setup: function(n) {
      var r = n,
        t = Math.ceil(r.lineWidth / 32);
      return function(n, r) {
        return {
          a: e.f(e.unref(t), (function(n, r, t) {
            return {
              a: r,
              b: e.n(r % 2 == 0 ? "orange" : "blue")
            }
          }))
        }
      }
    }
  },
  r = e._export_sfc(n, [
    ["__scopeId", "data-v-86d9edd6"]
  ]);
wx.createComponent(r);