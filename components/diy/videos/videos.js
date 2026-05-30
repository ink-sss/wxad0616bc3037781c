var t = require("../../../common/vendor.js")._export_sfc({
  data: function() {
    return {}
  },
  props: ["itemData"],
  methods: {}
}, [
  ["render", function(t, a, e, i, r, o) {
    return {
      a: 2 * e.itemData.style.height + "rpx",
      b: 2 * e.itemData.style.topRadio + "rpx",
      c: 2 * e.itemData.style.topRadio + "rpx",
      d: 2 * e.itemData.style.bottomRadio + "rpx",
      e: 2 * e.itemData.style.bottomRadio + "rpx",
      f: e.itemData.params.videoUrl,
      g: e.itemData.params.poster,
      h: "1" == e.itemData.params.autoplay,
      i: e.itemData.style.bgcolor,
      j: 2 * e.itemData.style.paddingLeft + "rpx",
      k: 2 * e.itemData.style.paddingLeft + "rpx",
      l: 2 * e.itemData.style.paddingTop + "rpx",
      m: 2 * e.itemData.style.paddingBottom + "rpx"
    }
  }]
]);
wx.createComponent(t);