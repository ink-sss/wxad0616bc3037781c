var t = require("../../../../common/vendor.js"),
  e = {
    data: function() {
      return {
        phoneHeight: 0,
        scrollviewHigh: 0,
        Visible: !1,
        datalist: {},
        ratio: 1
      }
    },
    props: ["isCoupon", "couponList"],
    onLoad: function() {},
    mounted: function() {
      this.init()
    },
    watch: {
      isCoupon: function(t, e) {
        t != e && (this.Visible = t, this.datalist = this.couponList, this.getHeight())
      }
    },
    methods: {
      init: function() {
        var e = this;
        t.index.getSystemInfo({
          success: function(t) {
            e.phoneHeight = t.windowHeight, e.ratio = t.windowWidth / 750, e.getHeight()
          }
        })
      },
      getHeight: function() {
        var t = Object.keys(this.couponList).length;
        t > 2 ? this.scrollviewHigh = .6 * this.phoneHeight : 1 == t ? this.scrollviewHigh = 230 * this.ratio : 2 == t && (this.scrollviewHigh = 460 * this.ratio)
      },
      selectCoupon: function(t) {
        this.closePopup(t)
      },
      closePopup: function(t) {
        this.$emit("close", t)
      }
    }
  },
  i = t._export_sfc(e, [
    ["render", function(e, i, o, n, c, s) {
      return {
        a: t.o((function(t) {
          return s.closePopup(null)
        }), "b6"),
        b: t.f(c.datalist, (function(e, i, o) {
          return t.e({
            a: t.t(e.name),
            b: t.t(e.start_time.text),
            c: t.t(e.end_time.text),
            d: e.max_price > 0
          }, e.max_price > 0 ? {
            e: t.t(e.max_price > 0 ? "最多抵扣" + 1 * e.max_price + "元" : "无最高抵扣限制")
          } : {}, {
            f: 10 == e.coupon_type.value
          }, 10 == e.coupon_type.value ? {
            g: t.t(1 * e.reduce_price)
          } : {}, {
            h: 20 == e.coupon_type.value
          }, 20 == e.coupon_type.value ? {
            i: t.t(e.discount)
          } : {}, {
            j: t.t(e.min_price > 0 ? "满" + 1 * e.min_price + "元可用" : "无门槛"),
            k: t.n("coupon-item coupon-item-" + e.color.text),
            l: t.o((function(t) {
              return s.selectCoupon(e.user_coupon_id)
            }), i),
            m: i
          })
        })),
        c: t.s("height:" + c.scrollviewHigh + "px;"),
        d: t.o((function(t) {
          return s.closePopup(0)
        }), "8f"),
        e: t.o((function() {}), "82"),
        f: t.n(c.Visible ? "usable-coupon open" : "usable-coupon close")
      }
    }],
    ["__scopeId", "data-v-6b9ebcdc"]
  ]);
wx.createComponent(i);