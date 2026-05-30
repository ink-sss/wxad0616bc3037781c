var t = require("../../../common/vendor.js"),
  a = t._export_sfc({
    data: function() {
      return {
        indicatorDots: !0,
        autoplay: !0,
        interval: 2e3,
        duration: 500,
        indicatorActiveColor: "#ffffff",
        current: 0
      }
    },
    props: ["itemData"],
    created: function() {
      this.indicatorActiveColor = this.itemData.style.btnColor
    },
    methods: {
      changeSwiper: function(t) {
        this.current = t.detail.current
      }
    }
  }, [
    ["render", function(a, e, i, o, r, n) {
      return {
        a: t.f(i.itemData.data, (function(a, e, i) {
          return {
            a: t.n(r.current == e ? "swiper-dot active" : "swiper-dot"),
            b: e
          }
        })),
        b: t.s("background-color:" + r.indicatorActiveColor),
        c: t.n(i.itemData.style.imgShape),
        d: t.f(i.itemData.data, (function(e, i, o) {
          return {
            a: e.imgUrl,
            b: i,
            c: t.o((function(t) {
              return a.gotoPage(e.linkUrl)
            }), i)
          }
        })),
        e: i.itemData.style.height + "rpx",
        f: 2 * i.itemData.style.topRadio + "rpx " + 2 * i.itemData.style.topRadio + "rpx " + 2 * i.itemData.style.bottomRadio + "rpx " + 2 * i.itemData.style.bottomRadio + "rpx",
        g: i.itemData.style.height + "rpx",
        h: 2 * i.itemData.style.topRadio + "rpx " + 2 * i.itemData.style.topRadio + "rpx " + 2 * i.itemData.style.bottomRadio + "rpx " + 2 * i.itemData.style.bottomRadio + "rpx",
        i: r.autoplay,
        j: r.duration,
        k: t.o((function() {
          return n.changeSwiper && n.changeSwiper.apply(n, arguments)
        }), "e6"),
        l: t.s("height:" + i.itemData.style.height + "rpx;"),
        m: i.itemData.style.background,
        n: 2 * i.itemData.style.paddingLeft + "rpx",
        o: 2 * i.itemData.style.paddingLeft + "rpx",
        p: 2 * i.itemData.style.paddingTop + "rpx",
        q: 2 * i.itemData.style.paddingBottom + "rpx"
      }
    }]
  ]);
wx.createComponent(a);