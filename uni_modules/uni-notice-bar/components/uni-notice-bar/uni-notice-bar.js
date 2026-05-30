var e = require("../../../../common/vendor.js"),
  t = {
    name: "UniNoticeBar",
    emits: ["click", "getmore", "close"],
    props: {
      text: {
        type: String,
        default: ""
      },
      moreText: {
        type: String,
        default: ""
      },
      backgroundColor: {
        type: String,
        default: "#FFF9EA"
      },
      speed: {
        type: Number,
        default: 100
      },
      color: {
        type: String,
        default: "#FF9A43"
      },
      fontSize: {
        type: Number,
        default: 14
      },
      moreColor: {
        type: String,
        default: "#FF9A43"
      },
      single: {
        type: [Boolean, String],
        default: !1
      },
      scrollable: {
        type: [Boolean, String],
        default: !1
      },
      showIcon: {
        type: [Boolean, String],
        default: !1
      },
      showGetMore: {
        type: [Boolean, String],
        default: !1
      },
      showClose: {
        type: [Boolean, String],
        default: !1
      }
    },
    data: function() {
      return {
        textWidth: 0,
        boxWidth: 0,
        wrapWidth: "",
        webviewHide: !1,
        elId: "Uni_".concat(Math.ceil(1e6 * Math.random()).toString(36)),
        elIdBox: "Uni_".concat(Math.ceil(1e6 * Math.random()).toString(36)),
        show: !0,
        animationDuration: "none",
        animationPlayState: "paused",
        animationDelay: "0s"
      }
    },
    watch: {
      text: function(e, t) {
        this.initSize()
      }
    },
    computed: {
      isShowGetMore: function() {
        return !0 === this.showGetMore || "true" === this.showGetMore
      },
      isShowClose: function() {
        return !(!0 !== this.showClose && "true" !== this.showClose || !1 !== this.showGetMore && "false" !== this.showGetMore)
      }
    },
    mounted: function() {
      var e = this;
      this.$nextTick((function() {
        e.initSize()
      }))
    },
    methods: {
      initSize: function() {
        var t = this;
        if (this.scrollable) {
          var o = [],
            i = new Promise((function(o, i) {
              e.index.createSelectorQuery().in(t).select("#".concat(t.elId)).boundingClientRect().exec((function(e) {
                t.textWidth = e[0].width, o()
              }))
            })),
            n = new Promise((function(o, i) {
              e.index.createSelectorQuery().in(t).select("#".concat(t.elIdBox)).boundingClientRect().exec((function(e) {
                t.boxWidth = e[0].width, o()
              }))
            }));
          o.push(i), o.push(n), Promise.all(o).then((function() {
            t.animationDuration = t.textWidth / t.speed + "s", t.animationDelay = "-".concat(t.boxWidth / t.speed, "s"), setTimeout((function() {
              t.animationPlayState = "running"
            }), 1e3)
          }))
        }
      },
      loopAnimation: function() {},
      clickMore: function() {
        this.$emit("getmore")
      },
      close: function() {
        this.show = !1, this.$emit("close")
      },
      onClick: function() {
        this.$emit("click")
      }
    }
  };
Array || e.resolveComponent("uni-icons")(), Math;
var o = e._export_sfc(t, [
  ["render", function(t, o, i, n, r, l) {
    return e.e({
      a: r.show
    }, r.show ? e.e({
      b: !0 === i.showIcon || "true" === i.showIcon
    }, !0 === i.showIcon || "true" === i.showIcon ? {
      c: e.p({
        type: "sound",
        color: i.color,
        size: 1.5 * i.fontSize
      })
    } : {}, {
      d: e.t(i.text),
      e: r.elId,
      f: i.scrollable ? 1 : "",
      g: i.scrollable || !i.single && !i.showGetMore ? "" : 1,
      h: i.color,
      i: i.fontSize + "px",
      j: 1.5 * i.fontSize + "px",
      k: r.wrapWidth + "px",
      l: r.animationDuration,
      m: r.animationDuration,
      n: r.webviewHide ? "paused" : r.animationPlayState,
      o: r.webviewHide ? "paused" : r.animationPlayState,
      p: r.animationDelay,
      q: r.animationDelay,
      r: r.elIdBox,
      s: i.scrollable ? 1 : "",
      t: i.scrollable || !i.single && !i.moreText ? "" : 1,
      v: i.scrollable ? 1 : "",
      w: i.scrollable || !i.single && !i.moreText ? "" : 1,
      x: i.scrollable ? 1.5 * i.fontSize + "px" : "auto",
      y: l.isShowGetMore
    }, l.isShowGetMore ? e.e({
      z: i.moreText.length > 0
    }, i.moreText.length > 0 ? {
      A: e.t(i.moreText),
      B: i.moreColor,
      C: i.fontSize + "px"
    } : {
      D: e.p({
        type: "right",
        color: i.moreColor,
        size: 1.1 * i.fontSize
      })
    }, {
      E: e.o((function() {
        return l.clickMore && l.clickMore.apply(l, arguments)
      }), "0c")
    }) : {}, {
      F: l.isShowClose
    }, l.isShowClose ? {
      G: e.o(l.close, "60"),
      H: e.p({
        type: "closeempty",
        color: i.color,
        size: 1.1 * i.fontSize
      })
    } : {}, {
      I: i.backgroundColor,
      J: e.o((function() {
        return l.onClick && l.onClick.apply(l, arguments)
      }), "93")
    }) : {})
  }],
  ["__scopeId", "data-v-7ba25369"]
]);
wx.createComponent(o);