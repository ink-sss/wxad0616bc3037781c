var t = require("../../../../common/vendor.js"),
  i = {
    name: "uniPopup",
    components: {},
    emits: ["change", "maskClick"],
    props: {
      animation: {
        type: Boolean,
        default: !0
      },
      type: {
        type: String,
        default: "center"
      },
      isMaskClick: {
        type: Boolean,
        default: null
      },
      maskClick: {
        type: Boolean,
        default: null
      },
      backgroundColor: {
        type: String,
        default: "none"
      },
      safeArea: {
        type: Boolean,
        default: !0
      },
      maskBackgroundColor: {
        type: String,
        default: "rgba(0, 0, 0, 0.4)"
      },
      borderRadius: {
        type: String
      }
    },
    watch: {
      type: {
        handler: function(t) {
          this.config[t] && this[this.config[t]](!0)
        },
        immediate: !0
      },
      isDesktop: {
        handler: function(t) {
          this.config[t] && this[this.config[this.type]](!0)
        },
        immediate: !0
      },
      maskClick: {
        handler: function(t) {
          this.mkclick = t
        },
        immediate: !0
      },
      isMaskClick: {
        handler: function(t) {
          this.mkclick = t
        },
        immediate: !0
      },
      showPopup: function(t) {}
    },
    data: function() {
      return {
        duration: 300,
        ani: [],
        showPopup: !1,
        showTrans: !1,
        popupWidth: 0,
        popupHeight: 0,
        config: {
          top: "top",
          bottom: "bottom",
          center: "center",
          left: "left",
          right: "right",
          message: "top",
          dialog: "center",
          share: "bottom"
        },
        maskClass: {
          position: "fixed",
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        },
        transClass: {
          backgroundColor: "transparent",
          borderRadius: this.borderRadius || "0",
          position: "fixed",
          left: 0,
          right: 0
        },
        maskShow: !0,
        mkclick: !0,
        popupstyle: "top"
      }
    },
    computed: {
      getStyles: function() {
        var t = {
          backgroundColor: this.bg
        };
        return this.borderRadius, t = Object.assign(t, {
          borderRadius: this.borderRadius
        })
      },
      isDesktop: function() {
        return this.popupWidth >= 500 && this.popupHeight >= 500
      },
      bg: function() {
        return "" === this.backgroundColor || "none" === this.backgroundColor ? "transparent" : this.backgroundColor
      }
    },
    mounted: function() {
      var i = this;
      ! function() {
        var o = t.index.getWindowInfo(),
          s = o.windowWidth,
          e = o.windowHeight,
          n = o.windowTop,
          a = o.safeArea,
          r = o.screenHeight;
        o.safeAreaInsets;
        i.popupWidth = s, i.popupHeight = e + (n || 0), a && i.safeArea ? i.safeAreaInsets = r - a.bottom : i.safeAreaInsets = 0
      }()
    },
    unmounted: function() {
      this.setH5Visible()
    },
    activated: function() {
      this.setH5Visible(!this.showPopup)
    },
    deactivated: function() {
      this.setH5Visible(!0)
    },
    created: function() {
      null === this.isMaskClick && null === this.maskClick ? this.mkclick = !0 : this.mkclick = null !== this.isMaskClick ? this.isMaskClick : this.maskClick, this.animation ? this.duration = 300 : this.duration = 0, this.messageChild = null, this.clearPropagation = !1, this.maskClass.backgroundColor = this.maskBackgroundColor
    },
    methods: {
      setH5Visible: function() {},
      closeMask: function() {
        this.maskShow = !1
      },
      disableMask: function() {
        this.mkclick = !1
      },
      clear: function(t) {
        t.stopPropagation(), this.clearPropagation = !0
      },
      open: function(t) {
        this.showPopup || (t && -1 !== ["top", "center", "bottom", "left", "right", "message", "dialog", "share"].indexOf(t) || (t = this.type), this.config[t] ? (this[this.config[t]](), this.$emit("change", {
          show: !0,
          type: t
        })) : console.error("缺少类型：", t))
      },
      close: function(t) {
        var i = this;
        this.showTrans = !1, this.$emit("change", {
          show: !1,
          type: this.type
        }), clearTimeout(this.timer), this.timer = setTimeout((function() {
          i.showPopup = !1
        }), 300)
      },
      touchstart: function() {
        this.clearPropagation = !1
      },
      onTap: function() {
        this.clearPropagation ? this.clearPropagation = !1 : (this.$emit("maskClick"), this.mkclick && this.close())
      },
      top: function(t) {
        var i = this;
        this.popupstyle = this.isDesktop ? "fixforpc-top" : "top", this.ani = ["slide-top"], this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        }, t || (this.showPopup = !0, this.showTrans = !0, this.$nextTick((function() {
          i.showPoptrans(), i.messageChild && "message" === i.type && i.messageChild.timerClose()
        })))
      },
      bottom: function(t) {
        this.popupstyle = "bottom", this.ani = ["slide-bottom"], this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: this.safeAreaInsets + "px",
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        }, t || this.showPoptrans()
      },
      center: function(t) {
        this.popupstyle = "center", this.ani = ["fade"], this.transClass = {
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: this.borderRadius || "0"
        }, t || this.showPoptrans()
      },
      left: function(t) {
        this.popupstyle = "left", this.ani = ["slide-left"], this.transClass = {
          position: "fixed",
          left: 0,
          bottom: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        }, t || this.showPoptrans()
      },
      right: function(t) {
        this.popupstyle = "right", this.ani = ["slide-right"], this.transClass = {
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        }, t || this.showPoptrans()
      },
      showPoptrans: function() {
        var t = this;
        this.$nextTick((function() {
          t.showPopup = !0, t.showTrans = !0
        }))
      }
    }
  };
Array || t.resolveComponent("uni-transition")(), Math;
var o = t._export_sfc(i, [
  ["render", function(i, o, s, e, n, a) {
    return t.e({
      a: n.showPopup
    }, n.showPopup ? t.e({
      b: n.maskShow
    }, n.maskShow ? {
      c: t.o(a.onTap, "85"),
      d: t.p({
        name: "mask",
        "mode-class": "fade",
        styles: n.maskClass,
        duration: n.duration,
        show: n.showTrans
      })
    } : {}, {
      e: t.s(a.getStyles),
      f: t.n(n.popupstyle),
      g: t.o((function() {
        return a.clear && a.clear.apply(a, arguments)
      }), "28"),
      h: t.o(a.onTap, "f6"),
      i: t.p({
        "mode-class": n.ani,
        name: "content",
        styles: n.transClass,
        duration: n.duration,
        show: n.showTrans
      }),
      j: t.o((function() {
        return a.touchstart && a.touchstart.apply(a, arguments)
      }), "18"),
      k: t.n(n.popupstyle),
      l: t.n(a.isDesktop ? "fixforpc-z-index" : "")
    }) : {})
  }]
]);
wx.createComponent(o);