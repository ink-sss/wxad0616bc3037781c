var r = {
    data: function() {
      return {
        url: ""
      }
    },
    onLoad: function(r) {
      this.url = decodeURIComponent(r.url)
    },
    methods: {}
  },
  e = require("../../common/vendor.js")._export_sfc(r, [
    ["render", function(r, e, n, o, t, u) {
      return {
        a: t.url
      }
    }]
  ]);
wx.createPage(e);