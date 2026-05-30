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
    ["render", function(a, e, o, i, r, n) {
      return {
        a: t.f(o.itemData.data, (function(a, e, o) {
          return {
            a: a.imgUrl,
            b: e,
            c: t.o((function(t) {
              return n.gotoPages(a)
            }), e)
          }
        })),
        b: 2 * o.itemData.style.topRadio + "rpx",
        c: 2 * o.itemData.style.topRadio + "rpx",
        d: 2 * o.itemData.style.bottomRadio + "rpx",
        e: 2 * o.itemData.style.bottomRadio + "rpx",
        f: t.s("padding-top: " + 2 * o.itemData.style.paddingTop + "rpx;padding-bottom:" + 2 * o.itemData.style.paddingTop + "rpx; padding-left:" + 2 * o.itemData.style.paddingLeft + "rpx;padding-right:" + 2 * o.itemData.style.paddingLeft + "rpx;  background:" + o.itemData.style.background)
      }
    }]
  ]);
wx.createComponent(a);