var t = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  e = require("../../../@babel/runtime/helpers/asyncToGenerator"),
  a = require("../../../common/vendor.js"),
  r = {
    data: function() {
      return {
        thisindex: 0,
        current: 0,
        category_id: "",
        op: 0,
        isCategotyPop: !1
      }
    },
    computed: {},
    props: ["itemData", "diytop"],
    watch: {
      diytop: function(t, e) {
        if (t != e) {
          var a = t * this._wW / (20 * this._wW);
          this.op = a >= 1 ? 1 : a
        }
      }
    },
    created: function() {
      var a = this;
      return e(t().mark((function e() {
        var r;
        return t().wrap((function(t) {
          for (;;) switch (t.prev = t.next) {
            case 0:
              return t.next = 2, a.getSystemInfo();
            case 2:
              r = t.sent, a._wW = r.windowWidth / 750;
            case 4:
            case "end":
              return t.stop()
          }
        }), e)
      })))()
    },
    methods: {
      changeIndex: function(t) {
        this.thisindex = t, this.isCategotyPop = !1
      },
      topHead: function(t) {
        return t + 2 * this.topBarTop()
      },
      openSearch: function(t) {
        this.$emit("parentFunc", {
          name: "openSearch",
          value: t
        })
      },
      getSystemInfo: function() {
        return new Promise((function(t, e) {
          a.index.getSystemInfo({
            success: function(e) {
              t(e)
            }
          })
        }))
      },
      setIndex: function(t) {
        this.thisindex = t, this.category_id = this.itemData.data[t] && this.itemData.data[t].category_id || "", this.$emit("setIndex", this.thisindex, this.category_id)
      },
      changeSwiper: function(t) {
        this.current = t.detail.current
      }
    }
  };
Array || a.resolveComponent("navBar")(), Math;
var i = a._export_sfc(r, [
  ["render", function(t, e, r, i, n, o) {
    return a.e({
      a: a.s("height:" + t.topBarTop() + "px;"),
      b: a.f(r.itemData.images, (function(t, e, a) {
        return {
          a: n.current == e ? 1 : "",
          b: e,
          c: t.imgUrl || ""
        }
      })),
      c: a.s("height: ".concat(o.topHead(r.itemData.params.showCategory ? 508 : 442), "rpx;")),
      d: r.itemData.params.topLogo,
      e: r.itemData.style.searchColor || "#999",
      f: a.t(r.itemData.params.searchText),
      g: a.s("margin-right:" + t.topBarRight() + ";"),
      h: a.o((function(t) {
        return o.openSearch(!0)
      }), "ce"),
      i: r.itemData.params.showCategory ? "" : 1,
      j: r.itemData.params.showCategory
    }, r.itemData.params.showCategory ? {
      k: a.o(o.setIndex, "14"),
      l: a.p({
        defaultColor: "#fff",
        marginRight: r.itemData.style.categoryPadding,
        currentI: n.thisindex,
        navList: r.itemData.data
      }),
      m: a.o((function(t) {
        return n.isCategotyPop = !0
      }), "6e")
    } : {}, {
      n: r.itemData.params.topUp ? "" : 1,
      o: a.f(r.itemData.images, (function(t, e, a) {
        return {
          a: n.current == e ? 1 : "",
          b: e,
          c: t.imgUrl || ""
        }
      })),
      p: "linear-gradient(rgba(245, 245, 245, 0) 0%, rgba(245, 245, 245, 0) 50%,".concat(r.itemData.style.bgcolor_color1 || "#fff", " 100%)"),
      q: r.itemData.params.topUp
    }, r.itemData.params.topUp ? {
      r: a.s("height: ".concat(o.topHead(r.itemData.params.showCategory ? 168 : 102), "rpx;width: 100%;"))
    } : {}, {
      s: a.f(r.itemData.images, (function(e, i, o) {
        return {
          a: a.n("imageType".concat(r.itemData.params.type) + (n.current == i ? " active" : "")),
          b: e.imgUrl,
          c: i,
          d: a.o((function(a) {
            return t.gotoPage(e.linkUrl)
          }), i)
        }
      })),
      t: 2 * r.itemData.style.topRadio + "rpx " + 2 * r.itemData.style.topRadio + "rpx " + 2 * r.itemData.style.bottomRadio + "rpx " + 2 * r.itemData.style.bottomRadio + "rpx",
      v: 1 == r.itemData.params.type ? "0" : "40rpx",
      w: 1 == r.itemData.params.type ? "0" : "40rpx",
      x: a.o((function() {
        return o.changeSwiper && o.changeSwiper.apply(o, arguments)
      }), "c7"),
      y: a.f(r.itemData.images, (function(t, e, i) {
        return {
          a: e,
          b: a.n(n.current == e ? "active " + r.itemData.style.imgShape : r.itemData.style.imgShape),
          c: a.s(n.current == e ? "background:" + r.itemData.style.btnColor : "background:" + r.itemData.style.btnOpColor)
        }
      })),
      z: "left" == r.itemData.style.btnShape ? 1 : "",
      A: "center" == r.itemData.style.btnShape ? 1 : "",
      B: "right" == r.itemData.style.btnShape ? 1 : "",
      C: n.isCategotyPop
    }, n.isCategotyPop ? {
      D: a.s("height:" + t.topBarTop() + "px;min-height:20rpx"),
      E: a.f(r.itemData.data, (function(t, e, r) {
        return {
          a: a.t(t.text),
          b: n.thisindex == e ? 1 : "",
          c: e,
          d: a.o((function(t) {
            return o.changeIndex(e)
          }), e)
        }
      })),
      F: a.o((function() {}), "b4"),
      G: a.o((function(t) {
        return n.isCategotyPop = !1
      }), "00")
    } : {})
  }],
  ["__scopeId", "data-v-8d20f96c"]
]);
wx.createComponent(i);