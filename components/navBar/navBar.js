var e = require("../../common/vendor.js"),
  t = {
    props: ["currentI", "navList", "color", "activeText", "optionType", "activeColorF", "activeColorS", "defaultColor", "marginRight"],
    components: {
      ssScrollNavbar: function() {
        return "./scroll-navbar.js"
      }
    },
    data: function() {
      return {
        currentIndex: 0,
        isFixed: !1,
        topHeight: 0,
        listData: []
      }
    },
    onLoad: function(e) {
      this.calculateTopSectionHeight()
    },
    created: function() {},
    methods: {
      navbarTapHandler: function(e) {
        this.currentIndex = e, this.$emit("currentIndex", e)
      },
      scrollChnage: function(e) {
        e.detail.scrollTop >= this.topHeight ? this.isFixed = !0 : this.isFixed = !1
      },
      calculateTopSectionHeight: function() {
        var t = this;
        e.index.createSelectorQuery().select(".top-section").fields({
          size: !0
        }, (function(e) {
          t.topHeight = e.height
        })).exec()
      }
    },
    watch: {
      currentI: function(e) {
        this.navbarTapHandler(e)
      }
    }
  };
Array || e.resolveComponent("ss-scroll-navbar")();
var o = e._export_sfc(t, [
  ["render", function(t, o, r, n, i, a) {
    return {
      a: e.o(a.navbarTapHandler, "95"),
      b: e.p({
        tabCurrentIndex: i.currentIndex,
        scrollChangeIndex: r.currentI,
        navArr: r.navList,
        color: r.color,
        activeText: r.activeText,
        optionType: r.optionType,
        activeColorF: r.activeColorF,
        activeColorS: r.activeColorS,
        defaultColor: r.defaultColor,
        marginRight: r.marginRight
      }),
      c: i.isFixed ? 1 : "",
      d: e.o((function() {
        return a.scrollChnage && a.scrollChnage.apply(a, arguments)
      }), "7e")
    }
  }]
]);
wx.createComponent(o);