var e = require("../common/vendor.js"),
  t = {
    props: {
      show: {
        type: Boolean,
        default: !1
      },
      type: {
        type: String,
        default: "middle"
      },
      width: {
        type: Number,
        default: 600
      },
      heigth: {
        type: Number,
        default: 800
      },
      padding: {
        type: Number,
        default: 30
      },
      backgroundColor: {
        type: String,
        default: "#ffffff"
      },
      boxShadow: {
        type: String,
        default: "0 0 30upx rgba(0, 0, 0, .1)"
      },
      msg: {
        type: String,
        default: ""
      },
      borderRadius: {
        type: Number,
        default: 10
      }
    },
    data: function() {
      return {
        offsetTop: 0
      }
    },
    methods: {
      hide: function() {
        this.$emit("hidePopup")
      }
    }
  },
  o = e._export_sfc(t, [
    ["render", function(t, o, r, d, p, u) {
      return e.e({
        a: r.show
      }, r.show ? {
        b: p.offsetTop + "px",
        c: e.o((function() {
          return u.hide && u.hide.apply(u, arguments)
        }), "79")
      } : {}, {
        d: r.show
      }, r.show ? e.e({
        e: "" != r.msg
      }, "" != r.msg ? {
        f: e.t(r.msg)
      } : {}, {
        g: e.n("uni-popup-" + r.type),
        h: e.s("width:" + r.width + "rpx; heigth:" + r.heigth + "rpx;padding:" + r.padding + "rpx;background-color:" + r.backgroundColor + ";box-shadow:" + r.boxShadow + ";border-radius:" + r.borderRadius + "rpx;")
      }) : {})
    }]
  ]);
wx.createComponent(o);