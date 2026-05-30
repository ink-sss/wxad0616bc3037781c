var e = require("../../../../common/vendor.js"),
  t = {
    data: function() {
      return {
        phoneHeight: 0,
        scrollviewHigh: 0,
        Visible: !1,
        datalist: {},
        ratio: 1
      }
    },
    props: ["isCoupon", "couponList", "discount"],
    onLoad: function() {},
    mounted: function() {
      this.init()
    },
    watch: {
      isCoupon: function(e, t) {
        e != t && (this.Visible = e, this.datalist = this.couponList, this.getHeight())
      }
    },
    methods: {
      init: function() {
        var t = this;
        e.index.getSystemInfo({
          success: function(e) {
            t.phoneHeight = e.windowHeight, t.ratio = e.windowWidth / 750, t.getHeight()
          }
        })
      },
      getHeight: function() {
        var e = Object.keys(this.couponList).length;
        e > 2 ? this.scrollviewHigh = .5 * this.phoneHeight : 1 == e ? this.scrollviewHigh = 250 * this.ratio + 60 : 2 == e && (this.scrollviewHigh = 460 * this.ratio + 60)
      },
      selectCoupon: function(t, o) {
        var i = this;
        e.index.showLoading({
          title: "领取中"
        }), i._post("user.coupon/receive", {
          coupon_id: t.coupon_id
        }, (function(t) {
          e.index.hideLoading(), e.index.showToast({
            title: "领取成功",
            duration: 2e3,
            icon: "success"
          }), i.datalist[o].is_receive = !0, console.log("1", i.datalist)
        }))
      },
      closePopup: function() {
        this.$emit("close")
      }
    }
  },
  o = e._export_sfc(t, [
    ["render", function(t, o, i, n, p, u) {
      return e.e({
        a: e.o((function() {
          return u.closePopup && u.closePopup.apply(u, arguments)
        }), "0f"),
        b: e.o((function() {
          return u.closePopup && u.closePopup.apply(u, arguments)
        }), "bf"),
        c: i.discount.product_reduce.length > 0
      }, i.discount.product_reduce.length > 0 ? {
        d: e.f(i.discount.product_reduce, (function(t, o, i) {
          return e.e({
            a: 1 == t.full_type
          }, 1 == t.full_type ? {
            b: e.t(t.full_value)
          } : {}, {
            c: 2 == t.full_type
          }, 2 == t.full_type ? {
            d: e.t(t.full_value)
          } : {}, {
            e: 1 == t.reduce_type
          }, 1 == t.reduce_type ? {
            f: e.t(t.reduce_value)
          } : {}, {
            g: 2 == t.reduce_type
          }, 2 == t.reduce_type ? {
            h: e.t((100 - t.reduce_value) / 10)
          } : {}, {
            i: o,
            j: t,
            k: o
          })
        }))
      } : {}, {
        e: i.discount.give_points > 0
      }, i.discount.give_points > 0 ? {
        f: e.t(t.points_name()),
        g: e.t(t.points_name()),
        h: e.t(i.discount.give_points),
        i: e.t(t.points_name())
      } : {}, {
        j: e.f(p.datalist, (function(o, i, n) {
          return e.e({
            a: e.t(o.name),
            b: 10 == o.expire_type
          }, 10 == o.expire_type ? {
            c: e.t(o.expire_day)
          } : {}, {
            d: 20 == o.expire_type
          }, 20 == o.expire_type ? {
            e: e.t(o.start_time.text),
            f: e.t(o.end_time.text)
          } : {}, {
            g: 20 == o.coupon_type.value
          }, 20 == o.coupon_type.value ? {
            h: e.t(o.max_price > 0 ? "最多抵扣" + 1 * o.max_price + "元" : "无最高抵扣限制")
          } : {}, {
            i: 10 == o.coupon_type.value
          }, 10 == o.coupon_type.value ? {
            j: e.t(1 * o.reduce_price)
          } : {}, {
            k: 20 == o.coupon_type.value
          }, 20 == o.coupon_type.value ? {
            l: e.t(o.discount)
          } : {}, {
            m: e.t(o.min_price > 0 ? "满" + 1 * o.min_price + "元可用" : "无门槛"),
            n: !o.is_receive
          }, o.is_receive ? {} : {
            o: e.o((function(e) {
              return u.selectCoupon(o, i)
            }), i)
          }, {
            p: e.n(o.is_get ? "coupon-item coupon-item-gray" : "coupon-item coupon-item-" + o.color.text),
            q: 20 == o.apply_range
          }, 20 == o.apply_range ? {
            r: e.o((function(e) {
              return t.gotoPage("/pages/coupon/detail?coupon_id=" + o.coupon_id + "&apply_range=" + o.apply_range)
            }), i)
          } : 30 == o.apply_range ? {
            t: e.o((function(e) {
              return t.gotoPage("/pages/coupon/detail?coupon_id=" + o.coupon_id + "&apply_range=" + o.apply_range)
            }), i)
          } : {}, {
            s: 30 == o.apply_range,
            v: i
          })
        })),
        k: e.s("height:" + p.scrollviewHigh + "px;"),
        l: e.o((function() {}), "b0"),
        m: e.n(p.Visible ? "usable-coupon open" : "usable-coupon close")
      })
    }],
    ["__scopeId", "data-v-bebd5c9e"]
  ]);
wx.createComponent(o);