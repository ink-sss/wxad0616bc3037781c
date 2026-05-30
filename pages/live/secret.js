var e = require("../../common/vendor.js"),
  n = {
    data: function() {
      return {}
    },
    onLoad: function() {
      e.wx$1.hideShareMenu({
        menus: ["shareAppMessage", "shareTimeline"]
      })
    },
    methods: {
      goIndex: function() {
        var n = getCurrentPages();
        null == n[n.length - 2] ? e.index.switchTab({
          url: "/pages/index/index"
        }) : e.index.navigateBack({})
      }
    }
  },
  r = e._export_sfc(n, [
    ["render", function(n, r, a, t, i, o) {
      return {
        a: e.o((function() {
          return o.goIndex && o.goIndex.apply(o, arguments)
        }), "de")
      }
    }]
  ]);
wx.createPage(r);