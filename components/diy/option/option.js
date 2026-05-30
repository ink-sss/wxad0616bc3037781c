var t = require("../../../common/vendor.js");
Array || t.resolveComponent("navBar")(), Math;
var a = t._export_sfc({
  data: function() {
    return {
      thisindex: 0
    }
  },
  props: ["itemData"],
  methods: {
    setIndex: function(t) {
      this.thisindex = t, this.category_id = this.itemData.data[t] && this.itemData.data[t].category_id || "", this.$emit("setIndex", this.thisindex, this.category_id)
    }
  }
}, [
  ["render", function(a, e, i, o, r, s) {
    return {
      a: t.o(s.setIndex, "1f"),
      b: t.p({
        optionType: "".concat(i.itemData.params.type || 1),
        activeText: i.itemData.style.activeText,
        activeColorF: i.itemData.style.active_color1,
        activeColorS: i.itemData.style.active_color2,
        defaultColor: "#333333",
        currentI: r.thisindex,
        navList: i.itemData.data
      }),
      c: 2 * i.itemData.style.topRadio + "rpx",
      d: 2 * i.itemData.style.topRadio + "rpx",
      e: 2 * i.itemData.style.bottomRadio + "rpx",
      f: 2 * i.itemData.style.bottomRadio + "rpx",
      g: "linear-gradient(to right,".concat(i.itemData.style.bgcolor_color1 || "#fff", " , ").concat(i.itemData.style.bgcolor_color2 || "#fff", ")"),
      h: i.itemData.style.background,
      i: 2 * i.itemData.style.paddingLeft + "rpx",
      j: 2 * i.itemData.style.paddingLeft + "rpx",
      k: 2 * i.itemData.style.paddingTop + "rpx",
      l: 2 * i.itemData.style.paddingBottom + "rpx",
      m: 2 * i.itemData.style.marginTop + "rpx"
    }
  }]
]);
wx.createComponent(a);