var t = require("../../common/vendor.js"),
  e = {
    name: "ss-scroll-navbar",
    props: {
      navArr: {
        type: Array,
        default: function() {
          return [{
            name: "推荐",
            category_id: "recent"
          }]
        }
      },
      defaultColor: {
        type: String,
        default: "#ffffff"
      },
      tabCurrentIndex: {
        type: Number,
        default: 0
      },
      scrollChangeIndex: {
        type: Number,
        default: 0
      },
      color: {
        type: String,
        default: "#ffffff"
      },
      activeText: {
        type: String,
        default: "#ffffff"
      },
      optionType: {
        type: String,
        default: ""
      },
      activeColorF: {
        type: String,
        default: "#ffffff"
      },
      activeColorS: {
        type: String,
        default: "#ffffff"
      },
      marginRight: {
        type: Number,
        default: 0
      }
    },
    data: function() {
      return {
        scrollLeft: 0,
        widthList: [],
        screenWidth: 0
      }
    },
    methods: {
      tabChange: function(t) {
        this.$emit("navbarTap", t);
        for (var e = this.widthList, n = 0, r = 0; r < t + 1; r++) n += e[r];
        var i = e[t];
        n -= this.screenWidth / 2, n -= i / 2, this.scrollLeft = n
      },
      calculateItemWidth: function() {
        var e = this,
          n = [];
        this.navArr.forEach((function(r, i) {
          t.index.createSelectorQuery().in(e).select("#item-" + i).fields({
            size: !0
          }, (function(t) {
            n.push(t.width)
          })).exec()
        })), this.widthList = n
      },
      calculateWindowWidth: function() {
        var e = t.index.getSystemInfoSync();
        this.screenWidth = e.screenWidth
      }
    },
    created: function() {
      var t = this;
      this.calculateWindowWidth(), setTimeout((function() {
        t.calculateItemWidth()
      }), 1e3)
    },
    watch: {
      scrollChangeIndex: function(t) {
        this.tabChange(t)
      }
    }
  },
  n = t._export_sfc(e, [
    ["render", function(e, n, r, i, o, a) {
      return {
        a: t.f(r.navArr, (function(e, n, i) {
          return t.e(r.optionType && 2 != r.optionType ? {
            a: 3 == r.optionType ? 1 : "",
            b: 1 == r.optionType ? "linear-gradient(to right,".concat(r.activeColorF || "#fff", " ,").concat(r.activeColorS || "#fff", ")") : "",
            c: 3 == r.optionType ? "".concat(r.activeColorF || "#fff") : ""
          } : {}, {
            d: t.t(e.text),
            e: t.o((function(t) {
              return a.tabChange(n)
            }), n),
            f: "item-" + n,
            g: n === r.tabCurrentIndex ? 1 : "",
            h: n === r.tabCurrentIndex ? 1 : "",
            i: n,
            j: n === r.tabCurrentIndex && 2 == r.optionType ? "linear-gradient(to right,".concat(r.activeColorF || "#fff", " ,").concat(r.activeColorS || "#fff", ")") : "",
            k: n === r.tabCurrentIndex ? r.activeText : r.defaultColor
          })
        })),
        b: r.optionType && 2 != r.optionType,
        c: 2 * r.marginRight + "rpx",
        d: t.n("optionType" + r.optionType),
        e: o.scrollLeft
      }
    }]
  ]);
wx.createComponent(n);