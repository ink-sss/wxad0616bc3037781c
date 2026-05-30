var e = require("../common/vendor.js");
Array || e.resolveComponent("uni-icons")(), Math;
var t = {
    __name: "notice-bar-nvue",
    props: {
      text: {
        type: [String],
        default: ""
      },
      startWidth: {
        type: Number,
        default: 0
      },
      width: {
        type: Number,
        default: 750
      },
      speed: {
        type: Number,
        default: 15
      },
      fontSize: {
        type: Number,
        default: 30
      },
      color: {
        type: String,
        default: "#de8c17"
      },
      backgroundColor: {
        type: String,
        default: "#fffbe8"
      },
      showGetMore: {
        type: Boolean,
        default: !1
      },
      moreText: {
        type: String,
        default: "-"
      },
      moreColor: {
        type: String,
        default: "#999999"
      },
      showIcon: {
        type: Boolean,
        default: !1
      },
      leftText: {
        type: String,
        default: ""
      },
      leftColor: {
        type: String,
        default: "#de8c17"
      },
      showClose: {
        type: Boolean,
        default: !1
      }
    },
    emits: ["click", "getmore", "close"],
    setup: function(t, o) {
      var r = o.emit,
        l = t,
        n = e.ref(!0),
        u = null,
        a = e.ref(0),
        f = e.ref(0),
        i = e.ref(0),
        p = e.ref(50);
      e.onMounted((function() {
        u && clearInterval(u), a.value = l.startWidth;
        var e = l.text.length * l.fontSize;
        if (f.value = l.width, l.showGetMore && "" != l.showGetMore && (f.value = l.width - l.moreText.length * l.fontSize - 20), l.showClose && (f.value = f.value - p.value), l.showIcon && (i.value = 52, f.value = f.value - i.value, a.value += i.value), "" != l.leftText) {
          var t = l.leftText.length * l.fontSize + 20;
          i.value += t, f.value = f.value - t, a.value += i.value
        }
        u = setInterval((function() {
          a.value -= 1, a.value < -e && (a.value = f.value)
        }), l.speed)
      })), e.onUnmounted((function() {
        clearInterval(u)
      }));
      var s = function() {
          x("click")
        },
        c = function() {
          x("getmore")
        },
        v = function() {
          n.value = !1, x("close")
        },
        x = r;
      return function(o, r) {
        return e.e({
          a: n.value
        }, n.value ? e.e({
          b: t.showIcon
        }, t.showIcon ? {
          c: e.p({
            type: "sound",
            size: e.index.upx2px(t.fontSize + 16),
            color: t.color
          }),
          d: e.o(s, "75")
        } : {}, {
          e: "" != t.leftText
        }, "" != t.leftText ? {
          f: e.t(t.leftText),
          g: t.leftColor,
          h: t.fontSize + "rpx",
          i: (t.showIcon ? 46 : 0) + "rpx",
          j: e.o(s, "d6")
        } : {}, {
          k: e.t(t.text),
          l: e.unref(a) + "rpx",
          m: t.color,
          n: t.fontSize + "rpx",
          o: e.unref(f) + "rpx",
          p: e.unref(i) + "rpx",
          q: e.o(s, "ab"),
          r: t.showGetMore && "-" != t.moreText
        }, t.showGetMore && "-" != t.moreText ? {
          s: e.t(t.moreText),
          t: t.moreColor,
          v: t.fontSize + "rpx",
          w: (t.showClose ? e.unref(p) : 0) + "rpx",
          x: e.o(c, "75")
        } : {}, {
          y: t.showGetMore && "-" == t.moreText
        }, t.showGetMore && "-" == t.moreText ? {
          z: e.o(c, "6e"),
          A: e.p({
            type: "right",
            size: e.index.upx2px(t.fontSize + 4),
            color: t.moreColor
          }),
          B: (t.showClose ? e.unref(p) : 0) + "rpx"
        } : {}, {
          C: t.showClose
        }, t.showClose ? {
          D: e.o(v, "2f"),
          E: e.p({
            type: "closeempty",
            size: e.index.upx2px(t.fontSize + 4),
            color: t.color
          })
        } : {}, {
          F: t.backgroundColor,
          G: t.width + "rpx"
        }) : {})
      }
    }
  },
  o = e._export_sfc(t, [
    ["__scopeId", "data-v-6849269c"]
  ]);
wx.createComponent(o);