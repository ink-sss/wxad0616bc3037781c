var e = require("../../../common/vendor.js")._export_sfc({
  data: function() {
    return {}
  },
  props: ["itemData"],
  methods: {}
}, [
  ["render", function(e, t, a, n, r, i) {
    return {
      a: a.itemData.style.lineHeight + "px",
      b: a.itemData.style.lineColor,
      c: a.itemData.style.lineStyle,
      d: a.itemData.style.paddingTop + "px 0",
      e: a.itemData.style.background
    }
  }]
]);
wx.createComponent(e);