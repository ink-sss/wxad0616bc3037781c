var t = require("../../../common/vendor.js"),
  a = t._export_sfc({
    data: function() {
      return {}
    },
    props: ["itemData"],
    methods: {
      gotoSearch: function() {
        this.gotoPage("/pages/product/search/search")
      }
    }
  }, [
    ["render", function(a, e, o, r, i, p) {
      return t.e({
        a: t.s("height:" + a.topBarTop() + "px;"),
        b: "image" == o.itemData.params.title_type
      }, "image" == o.itemData.params.title_type ? {
        c: o.itemData.params.toplogo
      } : {}, {
        d: "text" == o.itemData.params.title_type
      }, "text" == o.itemData.params.title_type ? {
        e: t.t(o.itemData.params.title),
        f: o.itemData.style.titleTextColor
      } : {}, {
        g: o.itemData.style.searchColor || "#999",
        h: t.t(o.itemData.params.searchText),
        i: t.o((function() {
          return p.gotoSearch && p.gotoSearch.apply(p, arguments)
        }), "c9"),
        j: o.itemData.style.searchBackGround,
        k: o.itemData.style.searchColor,
        l: a.topBarRight(),
        m: o.itemData.style.bgcolor,
        n: 2 * o.itemData.style.topRadio + "rpx",
        o: 2 * o.itemData.style.topRadio + "rpx",
        p: 2 * o.itemData.style.bottomRadio + "rpx",
        q: 2 * o.itemData.style.bottomRadio + "rpx",
        r: o.itemData.style.background,
        s: 2 * o.itemData.style.paddingLeft + "rpx",
        t: 2 * o.itemData.style.paddingLeft + "rpx",
        v: 2 * o.itemData.style.paddingTop + "rpx",
        w: 2 * o.itemData.style.paddingBottom + "rpx"
      })
    }],
    ["__scopeId", "data-v-697b2b80"]
  ]);
wx.createComponent(a);