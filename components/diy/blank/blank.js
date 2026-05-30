var t = require("../../../common/vendor.js")._export_sfc({
  data: function() {
    return {}
  },
  props: ["itemData"],
  methods: {}
}, [
  ["render", function(t, e, a, i, o, p) {
    return {
      a: a.itemData.style.height + "px",
      b: a.itemData.style.background,
      c: a.itemData.style.topRadio + "px",
      d: a.itemData.style.topRadio + "px",
      e: a.itemData.style.bottomRadio + "px",
      f: a.itemData.style.bottomRadio + "px",
      g: a.itemData.style.bgcolor,
      h: a.itemData.style.paddingLeft + "px",
      i: a.itemData.style.paddingLeft + "px",
      j: a.itemData.style.paddingTop + "px",
      k: a.itemData.style.paddingBottom + "px"
    }
  }]
]);
wx.createComponent(t);