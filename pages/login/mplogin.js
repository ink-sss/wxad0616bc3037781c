var e = require("../../common/vendor.js"),
  n = getApp(),
  t = {
    data: function() {
      return {}
    },
    onLoad: function(t) {
      var r = this;
      if (e.index.setStorageSync("token", t.token), e.index.setStorageSync("user_id", t.user_id), n.globalData.is_login) {
        var g = "/" + e.index.getStorageSync("currentPage"),
          o = e.index.getStorageSync("currentPageOptions");
        if (Object.keys(o).length > 0) {
          for (var a in g += "?", o) g += a + "=" + o[a] + "&";
          g = g.substring(0, g.length - 1)
        }
        this.gotoPage(g, "reLaunch")
      } else n.getWxopen((function() {
        var n = "/" + e.index.getStorageSync("currentPage"),
          t = e.index.getStorageSync("currentPageOptions");
        if (Object.keys(t).length > 0) {
          for (var g in n += "?", t) n += g + "=" + t[g] + "&";
          n = n.substring(0, n.length - 1)
        }
        r.gotoPage(n, "reLaunch")
      }))
    }
  },
  r = e._export_sfc(t, [
    ["render", function(e, n, t, r, g, o) {
      return {}
    }]
  ]);
wx.createPage(r);