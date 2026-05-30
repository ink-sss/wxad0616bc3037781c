var t = require("../../../common/utils.js"),
  e = {
    data: function() {
      return {}
    },
    props: ["itemData"],
    created: function() {},
    methods: {
      formatContent: function(e) {
        return t.utils.format_content(e)
      }
    }
  },
  n = require("../../../common/vendor.js")._export_sfc(e, [
    ["render", function(t, e, n, a, r, o) {
      return {
        a: o.formatContent(n.itemData.params.content),
        b: n.itemData.style.background,
        c: n.itemData.style.paddingTop + "px " + n.itemData.style.paddingLeft + "px"
      }
    }]
  ]);
wx.createComponent(n);