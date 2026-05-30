var t = require("../../../common/vendor.js"),
  e = {
    data: function() {
      return {
        listData: [],
        styleValue: "",
        index_num: 0,
        lineHeight: 0,
        maxSize: 0,
        timer: null
      }
    },
    props: ["itemData"],
    created: function() {
      this.listData = this.itemData.data, this.init()
    },
    methods: {
      init: function() {
        var e = this;
        (1 == this.itemData.style.display && this.listData.length > 1 || 2 == this.itemData.style.display && this.listData.length > 2) && t.index.getSystemInfo({
          success: function(t) {
            e.lineHeight = t.windowWidth / 750 * 30, e.maxSize = e.listData.length, 2 == e.itemData.style.display && (e.lineHeight = 2 * e.lineHeight, e.maxSize = e.maxSize / 2), e.timer = setInterval((function() {
              e.animation()
            }), 3e3)
          }
        })
      },
      animation: function() {
        var t = this;
        t.index_num++, t.index_num >= t.maxSize && (t.index_num = 0), this.styleValue = -t.lineHeight * t.index_num
      },
      gotoPageFunc: function(t) {
        var e;
        e = t && void 0 !== t ? "pages/article/detail/detail?article_id=" + t.article_id : "pages/article/list/list", this.gotoPage(e)
      }
    }
  },
  i = t._export_sfc(e, [
    ["render", function(e, i, a, n, l, s) {
      return t.e({
        a: l.listData.length > 0
      }, l.listData.length > 0 ? {
        b: a.itemData.style.image,
        c: t.f(l.listData, (function(e, i, a) {
          return {
            a: t.t(e.article_title),
            b: i,
            c: t.o((function(t) {
              return s.gotoPageFunc(e)
            }), i)
          }
        })),
        d: t.s("transform: translate(0," + l.styleValue + "px);"),
        e: t.n("display_" + a.itemData.style.display),
        f: t.o((function(t) {
          return s.gotoPageFunc()
        }), "d1"),
        g: a.itemData.style.background,
        h: 2 * a.itemData.style.topRadio + "rpx",
        i: 2 * a.itemData.style.topRadio + "rpx",
        j: 2 * a.itemData.style.bottomRadio + "rpx",
        k: 2 * a.itemData.style.bottomRadio + "rpx",
        l: a.itemData.style.bgcolor,
        m: 2 * a.itemData.style.paddingLeft + "rpx",
        n: 2 * a.itemData.style.paddingLeft + "rpx",
        o: 2 * a.itemData.style.paddingTop + "rpx",
        p: 2 * a.itemData.style.paddingBottom + "rpx"
      } : {})
    }]
  ]);
wx.createComponent(i);