var n = require("../../common/vendor.js"),
  o = {
    name: "uni-icon",
    props: {
      type: String,
      color: String,
      size: [Number, String]
    },
    computed: {
      fontSize: function() {
        return "".concat(this.size, "px")
      }
    },
    methods: {
      onClick: function() {
        this.$emit("click")
      }
    }
  },
  t = n._export_sfc(o, [
    ["render", function(o, t, e, i, r, c) {
      return {
        a: n.n("uni-icon-" + e.type),
        b: e.color,
        c: c.fontSize,
        d: n.o((function(n) {
          return c.onClick()
        }), "9c")
      }
    }]
  ]);
wx.createComponent(t);