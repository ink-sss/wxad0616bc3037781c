var e = require("../../../../common/vendor.js");
Array || e.resolveComponent("Countdown")();
var t = e._export_sfc({
  components: {
    Countdown: function() {
      return "../../../../components/countdown/countdown-act.js"
    }
  },
  data: function() {
    return {}
  },
  props: ["detail", "is_fav"],
  methods: {
    sendFunc: function(e) {
      this.$emit("send", e)
    },
    returnValFunc: function(e) {}
  }
}, [
  ["render", function(t, n, i, o, r, a) {
    return e.e({
      a: e.t(t.subPrice(i.detail.product_price, "1")),
      b: e.t(t.subPrice(i.detail.product_price, "2")),
      c: i.detail.product_sku && i.detail.product_sku.line_price
    }, i.detail.product_sku && i.detail.product_sku.line_price ? {
      d: e.t(i.detail.product_sku.line_price)
    } : {}, {
      e: e.sr("countdown", "855be7fe-0"),
      f: e.o(a.returnValFunc, "77"),
      g: e.p({
        activeName: "previewProduct",
        config: {
          startstamp: i.detail.preview.start_time,
          endstamp: i.detail.preview.end_time,
          type: "preview"
        },
        start_name: "距开始仅剩",
        end_name: "距开始仅剩"
      }),
      h: e.t(i.detail.product_name),
      i: i.detail.selling_point
    }, i.detail.selling_point ? {
      j: e.t(i.detail.selling_point)
    } : {}, {
      k: e.o((function(e) {
        return a.sendFunc("showShare")
      }), "87"),
      l: e.n(i.is_fav ? "icon-shoucang2 dominant" : "icon-shoucang1"),
      m: e.n(i.is_fav ? "dominant" : "gray9"),
      n: e.o((function(e) {
        return a.sendFunc("favorite")
      }), "50")
    })
  }],
  ["__scopeId", "data-v-855be7fe"]
]);
wx.createComponent(t);