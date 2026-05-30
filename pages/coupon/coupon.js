var e = require("../../common/vendor.js"),
  t = {
    data: function() {
      return {
        loadding: !0,
        indicatorDots: !0,
        autoplay: !0,
        interval: 2e3,
        duration: 500,
        DataList: [],
        page: 1,
        list_rows: 10
      }
    },
    onShow: function() {
      this.getData()
    },
    methods: {
      getData: function() {
        var t = this;
        e.index.showLoading({
          title: "加载中"
        }), t._get("coupon.coupon/lists", {
          page: t.page,
          list_rows: t.list_rows
        }, (function(o) {
          t.DataList = o.data.list, t.loadding = !1, e.index.hideLoading()
        }))
      },
      lookRule: function(e) {
        e.rule = !0
      },
      closeRule: function(e) {
        e.rule = !1
      },
      receive: function(t) {
        var o = this;
        e.index.showLoading({
          title: "领取中"
        }), o._post("user.coupon/receive", {
          coupon_id: t
        }, (function(t) {
          e.index.hideLoading(), o.getData(), e.index.showToast({
            title: "领取成功",
            duration: 2e3,
            icon: "success"
          })
        }), (function(e) {
          o.getData()
        }))
      }
    }
  },
  o = e._export_sfc(t, [
    ["render", function(t, o, n, a, i, p) {
      return e.e({
        a: !i.loadding
      }, i.loadding ? {} : e.e({
        b: i.DataList.length > 0
      }, i.DataList.length > 0 ? {
        c: e.f(i.DataList, (function(o, n, a) {
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
            n: o.state.value > 0
          }, o.state.value > 0 ? {
            o: e.o((function(e) {
              return p.receive(o.coupon_id)
            }), n)
          } : {
            p: e.t(o.state.text),
            q: e.o((function() {}), n)
          }, {
            r: e.n("coupon-item coupon-item-" + o.color.text),
            s: e.o((function(e) {
              return p.lookRule(o)
            }), n),
            t: 20 == o.apply_range
          }, 20 == o.apply_range ? {
            v: e.o((function(e) {
              return t.gotoPage("/pages/coupon/detail?coupon_id=" + o.coupon_id + "&apply_range=" + o.apply_range)
            }), n)
          } : 30 == o.apply_range ? {
            x: e.o((function(e) {
              return t.gotoPage("/pages/coupon/detail?coupon_id=" + o.coupon_id + "&apply_range=" + o.apply_range)
            }), n)
          } : {
            y: e.o((function(e) {
              return t.gotoPage("/pages/coupon/detail?coupon_id=" + o.coupon_id + "&apply_range=" + o.apply_range)
            }), n)
          }, {
            w: 30 == o.apply_range,
            z: n
          })
        }))
      } : {
        d: t.config.pic_url + "/static/live/none.png"
      }, {
        e: t.theme(),
        f: e.n(t.theme() || "")
      }))
    }]
  ]);
wx.createPage(o);