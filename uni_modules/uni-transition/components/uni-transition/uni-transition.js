var t = require("../../../../@babel/runtime/helpers/toConsumableArray"),
  i = require("../../../../@babel/runtime/helpers/objectSpread2"),
  n = require("./createAnimation.js"),
  a = require("../../../../common/vendor.js"),
  o = {
    name: "uniTransition",
    emits: ["click", "change"],
    props: {
      show: {
        type: Boolean,
        default: !1
      },
      modeClass: {
        type: [Array, String],
        default: function() {
          return "fade"
        }
      },
      duration: {
        type: Number,
        default: 300
      },
      styles: {
        type: Object,
        default: function() {
          return {}
        }
      },
      customClass: {
        type: String,
        default: ""
      },
      onceRender: {
        type: Boolean,
        default: !1
      }
    },
    data: function() {
      return {
        isShow: !1,
        transform: "",
        opacity: 0,
        animationData: {},
        durationTime: 300,
        config: {}
      }
    },
    watch: {
      show: {
        handler: function(t) {
          t ? this.open() : this.isShow && this.close()
        },
        immediate: !0
      }
    },
    computed: {
      stylesObject: function() {
        var t = i(i({}, this.styles), {}, {
            "transition-duration": this.duration / 1e3 + "s"
          }),
          n = "";
        for (var a in t) n += this.toLine(a) + ":" + t[a] + ";";
        return n
      },
      transformStyles: function() {
        return "transform:" + this.transform + ";opacity:" + this.opacity + ";" + this.stylesObject
      }
    },
    created: function() {
      this.config = {
        duration: this.duration,
        timingFunction: "ease",
        transformOrigin: "50% 50%",
        delay: 0
      }, this.durationTime = this.duration
    },
    methods: {
      init: function() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        t.duration && (this.durationTime = t.duration), this.animation = n.createAnimation(Object.assign(this.config, t), this)
      },
      onClick: function() {
        this.$emit("click", {
          detail: this.isShow
        })
      },
      step: function(i) {
        var n = this,
          a = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
        return this.animation ? (Object.keys(i).forEach((function(a) {
          var o, e = i[a];
          "function" == typeof n.animation[a] && (Array.isArray(e) ? (o = n.animation)[a].apply(o, t(e)) : n.animation[a](e))
        })), this.animation.step(a), this) : this
      },
      run: function(t) {
        this.animation && this.animation.run(t)
      },
      open: function() {
        var t = this;
        clearTimeout(this.timer), this.isShow = !0, this.transform = this.styleInit(!1).transform || "", this.opacity = this.styleInit(!1).opacity || 0, this.$nextTick((function() {
          t.timer = setTimeout((function() {
            t.animation = n.createAnimation(t.config, t), t.tranfromInit(!1).step(), t.animation.run((function() {
              t.transform = "", t.opacity = t.styleInit(!1).opacity || 1, t.$emit("change", {
                detail: t.isShow
              })
            }))
          }), 80)
        }))
      },
      close: function(t) {
        var i = this;
        this.animation && this.tranfromInit(!0).step().run((function() {
          i.isShow = !1, i.animationData = null, i.animation = null;
          var t = i.styleInit(!1),
            n = t.opacity,
            a = t.transform;
          i.opacity = n || 1, i.transform = a, i.$emit("change", {
            detail: i.isShow
          })
        }))
      },
      styleInit: function(t) {
        var i = this,
          n = {
            transform: "",
            opacity: 1
          },
          a = function(t, a) {
            var o = i.animationType(t)[a];
            a.startsWith("fade") ? n.opacity = o : n.transform += o + " "
          };
        return "string" == typeof this.modeClass ? a(t, this.modeClass) : this.modeClass.forEach((function(i) {
          return a(t, i)
        })), n
      },
      tranfromInit: function(t) {
        var i = this,
          n = function(t, n) {
            var a = null;
            "fade" === n ? a = t ? 0 : 1 : (a = t ? "-100%" : "0", "zoom-in" === n && (a = t ? .8 : 1), "zoom-out" === n && (a = t ? 1.2 : 1), "slide-right" === n && (a = t ? "100%" : "0"), "slide-bottom" === n && (a = t ? "100%" : "0")), i.animation[i.animationMode()[n]](a)
          };
        return "string" == typeof this.modeClass ? n(t, this.modeClass) : this.modeClass.forEach((function(i) {
          n(t, i)
        })), this.animation
      },
      animationType: function(t) {
        return {
          fade: t ? 1 : 0,
          "slide-top": "translateY(".concat(t ? "0" : "-100%", ")"),
          "slide-right": "translateX(".concat(t ? "0" : "100%", ")"),
          "slide-bottom": "translateY(".concat(t ? "0" : "100%", ")"),
          "slide-left": "translateX(".concat(t ? "0" : "-100%", ")"),
          "zoom-in": "scaleX(".concat(t ? 1 : .8, ") scaleY(").concat(t ? 1 : .8, ")"),
          "zoom-out": "scaleX(".concat(t ? 1 : 1.2, ") scaleY(").concat(t ? 1 : 1.2, ")")
        }
      },
      animationMode: function() {
        return {
          fade: "opacity",
          "slide-top": "translateY",
          "slide-right": "translateX",
          "slide-bottom": "translateY",
          "slide-left": "translateX",
          "zoom-in": "scale",
          "zoom-out": "scale"
        }
      },
      toLine: function(t) {
        return t.replace(/([A-Z])/g, "-$1").toLowerCase()
      }
    }
  },
  e = a._export_sfc(o, [
    ["render", function(t, i, n, o, e, s) {
      return {
        a: e.isShow,
        b: e.animationData,
        c: a.n(n.customClass),
        d: a.s(s.transformStyles),
        e: a.o((function() {
          return s.onClick && s.onClick.apply(s, arguments)
        }), "92")
      }
    }]
  ]);
wx.createComponent(e);