var e = require("../common/vendor.js"),
  n = e._export_sfc({
    data: function() {
      return {}
    },
    props: ["loadding"],
    computed: {}
  }, [
    ["render", function(n, o, r, t, d, i) {
      return e.e({
        a: r.loadding
      }, r.loadding ? {
        b: n.config.pic_url + "/static/live/loading.gif"
      } : {})
    }],
    ["__scopeId", "data-v-437f31b2"]
  ]);
wx.createComponent(n);