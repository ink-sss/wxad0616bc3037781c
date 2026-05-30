var o = require("../common/vendor.js"),
  e = {
    name: "load-more",
    props: {
      loadingType: {
        type: Number,
        default: 0
      },
      showImage: {
        type: Boolean,
        default: !0
      },
      color: {
        type: String,
        default: "#999999"
      },
      contentText: {
        type: Object,
        default: function() {
          return {
            contentdown: "上拉显示更多",
            contentrefresh: "正在加载...",
            contentnomore: "已经到底了"
          }
        }
      }
    },
    data: function() {
      return {}
    }
  },
  n = o._export_sfc(e, [
    ["render", function(e, n, t, r, c, l) {
      return o.e({
        a: 1 === t.loadingType && t.showImage
      }, 1 === t.loadingType && t.showImage ? {
        b: t.color,
        c: t.color,
        d: t.color,
        e: t.color,
        f: t.color,
        g: t.color,
        h: t.color,
        i: t.color,
        j: t.color,
        k: t.color,
        l: t.color,
        m: t.color
      } : {}, {
        n: o.t(0 === t.loadingType ? t.contentText.contentdown : 1 === t.loadingType ? t.contentText.contentrefresh : t.contentText.contentnomore),
        o: t.color
      })
    }]
  ]);
wx.createComponent(n);