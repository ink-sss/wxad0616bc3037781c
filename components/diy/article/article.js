var t = require("../../../common/vendor.js"),
  a = {
    data: function() {
      return {
        listData: []
      }
    },
    props: ["itemData"],
    created: function() {
      this.listData = this.itemData.data
    },
    methods: {
      unitWan: function(t) {
        return (1 * t / 1e4).toFixed(2) + "万"
      },
      gotoPageFunc: function(t) {
        var a = "pages/article/detail/detail?article_id=" + t.article_id;
        this.gotoPage(a)
      },
      add0: function(t) {
        return t < 10 ? "0" + t : t
      },
      format: function(t) {
        var a = new Date(t),
          e = a.getFullYear(),
          i = a.getMonth() + 1,
          l = a.getDate();
        return e + "-" + this.add0(i) + "-" + this.add0(l)
      }
    }
  },
  e = t._export_sfc(a, [
    ["render", function(a, e, i, l, n, r) {
      return {
        a: t.f(n.listData, (function(a, e, l) {
          return t.e(10 == i.itemData.style.display ? t.e({
            a: null != a.image && "" != a.image.file_path
          }, null != a.image && "" != a.image.file_path ? {
            b: a.image.file_path
          } : {}, {
            c: t.t(a.article_title),
            d: t.t(a.actual_views > 1e4 ? r.unitWan(a.actual_views) : a.actual_views),
            e: t.t(r.format(a.create_time))
          }) : {}, 20 == i.itemData.style.display ? {
            f: t.t(a.article_title),
            g: t.t(a.actual_views > 1e4 ? r.unitWan(a.actual_views) : a.actual_views),
            h: t.t(r.format(a.create_time))
          } : {}, {
            i: e,
            j: t.o((function(t) {
              return r.gotoPageFunc(a)
            }), e)
          })
        })),
        b: 10 == i.itemData.style.display,
        c: 20 == i.itemData.style.display,
        d: t.n("show-type__" + i.itemData.style.display),
        e: i.itemData.style.background,
        f: 2 * i.itemData.style.topRadio + "rpx",
        g: 2 * i.itemData.style.topRadio + "rpx",
        h: 2 * i.itemData.style.bottomRadio + "rpx",
        i: 2 * i.itemData.style.bottomRadio + "rpx",
        j: i.itemData.style.bgcolor,
        k: 2 * i.itemData.style.paddingLeft + "rpx",
        l: 2 * i.itemData.style.paddingLeft + "rpx",
        m: 2 * i.itemData.style.paddingTop + "rpx",
        n: 2 * i.itemData.style.paddingBottom + "rpx"
      }
    }]
  ]);
wx.createComponent(e);