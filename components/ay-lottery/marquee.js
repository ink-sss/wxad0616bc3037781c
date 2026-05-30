var t = require("../../common/vendor.js"),
  e = {
    props: {
      list: {
        type: Array,
        default: function() {
          return []
        }
      },
      availableSurplusNum: {
        type: Number,
        default: 0
      },
      themeColor: {
        type: String,
        default: "#33CCCC"
      },
      bgColor: {
        type: String,
        default: "#1E90FF"
      },
      bg_sd_Color: {
        type: String,
        default: "#4169E1"
      },
      height: {
        type: Number,
        default: 676
      },
      width: {
        type: Number,
        default: 664
      },
      is_img_bg: {
        type: Boolean,
        default: !1
      },
      theme_img_bg: {
        type: String,
        default: ""
      },
      box_shadow_Color: {
        type: String,
        default: "#f0f0ee"
      },
      bg_img: {
        type: String,
        default: ""
      },
      stay_index: {
        type: Number,
        default: 1
      }
    },
    data: function() {
      return {
        dotList: 24,
        indexSelect: 0,
        isRunning: !1
      }
    },
    computed: {
      style_box: function() {
        var t = this,
          e = parseInt(t.height),
          n = parseInt(t.width),
          i = "";
        return e > 0 && (i = "height:".concat(e, "rpx;")), n > 0 && (i += "width:".concat(n, "rpx;")), i += "background-color:".concat(t.bgColor, ";"), t.is_img_bg && t.bg_img.length > 0 && (i += "background-image:url(".concat(t.bg_img, ");")), i + "box-shadow: 0 10px 0  ".concat(t.bg_sd_Color, ";")
      },
      style_box_in: function() {
        var t = this,
          e = parseInt(t.height),
          n = parseInt(t.width),
          i = "";
        e > 68 && (i = "height:".concat(e - 68, "rpx;")), n > 56 && (i += "width:".concat(n - 56, "rpx;")), i += "background-color:".concat(t.themeColor, ";");
        var r = t.theme_img_bg;
        return t.is_img_bg && r.length > 0 && (i += "background-image:url(".concat(t.theme_img_bg, ");")), i
      }
    },
    methods: {
      toDetailPage: function(t) {
        var e = this.list,
          n = t.index,
          i = {
            curIndex: n,
            item: e[n],
            list: e
          };
        this.$emit("toDetailPage", i)
      },
      random: function(t) {
        var e = Math.random() > .5 ? "2" : "1";
        t = t || 3;
        for (var n = 0; n < t; n++) e += Math.floor(10 * Math.random());
        return Number(e)
      },
      startFunc: function() {
        this.$emit("startFunc")
      },
      start: function() {
        var t = this,
          e = this;
        if (!this.isRunning) {
          this.isRunning = !0;
          var n = 0,
            i = 0,
            r = this.random(3),
            a = setInterval((function() {
              if (++n, n %= 8, t.indexSelect = n, (i += 40) > r) {
                n = e.stay_index, t.indexSelect = n, clearInterval(a), a = null;
                var o = {
                  curIndex: n,
                  item: e.list[n],
                  list: e.list
                };
                t.$emit("result", o), t.isRunning = !1
              }
            }), 70 + i)
        }
      }
    }
  },
  n = t._export_sfc(e, [
    ["render", function(e, n, i, r, a, o) {
      return {
        a: t.f(a.dotList, (function(e, n, i) {
          return {
            a: t.n("dot-" + (n + 1)),
            b: n
          }
        })),
        b: t.f(i.list, (function(e, n, r) {
          return {
            a: t.o((function(t) {
              return o.toDetailPage({
                index: n
              })
            }), n),
            b: e.img,
            c: t.t(e.name),
            d: t.n("award-" + (n + 1)),
            e: t.n(n == a.indexSelect ? "awardSelect" : ""),
            f: n,
            g: t.s({
              "background-image": "url(" + (i.is_img_bg ? e.img_bg : "") + ")"
            })
          }
        })),
        c: t.s({
          "box-shadow": "0 14rpx 0 " + i.box_shadow_Color
        }),
        d: t.n(a.isRunning ? "ative" : ""),
        e: t.o((function() {
          return o.startFunc && o.startFunc.apply(o, arguments)
        }), "da"),
        f: t.s(o.style_box_in),
        g: t.s(o.style_box)
      }
    }]
  ]);
wx.createComponent(n);