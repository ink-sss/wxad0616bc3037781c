var t = require("../../../common/vendor.js"),
  a = t._export_sfc({
    data: function() {
      return {}
    },
    props: ["itemData"],
    methods: {
      gotoPages: function(t) {
        this.gotoPage(t.linkUrl)
      }
    }
  }, [
    ["render", function(a, e, i, n, o, m) {
      return t.e({
        a: i.itemData.style.layout > -1
      }, i.itemData.style.layout > -1 ? {
        b: t.f(i.itemData.data, (function(a, e, i) {
          return {
            a: a.imgUrl,
            b: e,
            c: t.o((function(t) {
              return m.gotoPages(a)
            }), e)
          }
        })),
        c: t.n("column__" + i.itemData.style.layout)
      } : t.e({
        d: i.itemData.data[0].imgUrl,
        e: t.o((function(t) {
          return m.gotoPages(i.itemData.data[0])
        }), "8f"),
        f: i.itemData.data.length >= 2
      }, i.itemData.data.length >= 2 ? {
        g: i.itemData.data[1].imgUrl,
        h: t.o((function(t) {
          return m.gotoPages(i.itemData.data[1])
        }), "a9")
      } : {}, {
        i: i.itemData.data.length >= 3
      }, i.itemData.data.length >= 3 ? {
        j: i.itemData.data[2].imgUrl,
        k: t.o((function(t) {
          return m.gotoPages(i.itemData.data[2])
        }), "57")
      } : {}, {
        l: i.itemData.data.length >= 4
      }, i.itemData.data.length >= 4 ? {
        m: i.itemData.data[3].imgUrl,
        n: t.o((function(t) {
          return m.gotoPages(i.itemData.data[3])
        }), "87")
      } : {}, {
        o: i.itemData.style.paddingTop + "px " + i.itemData.style.paddingLeft + "px"
      }), {
        p: i.itemData.style.background,
        q: 2 * i.itemData.style.paddingTop + "rpx " + 2 * i.itemData.style.paddingLeft + "rpx " + 2 * i.itemData.style.paddingBottom + "rpx " + 2 * i.itemData.style.paddingLeft + "rpx"
      })
    }]
  ]);
wx.createComponent(a);