var e = require("../../../common/vendor.js");
require("../../../env/config.js");
var t = {
    data: function() {
      return {
        phoneHeight: 0,
        scrollviewHigh: 0,
        state_active: 0,
        DataList: {},
        no_more: !1,
        loading: !1,
        data_type: "not_use",
        supList: []
      }
    },
    mounted: function() {
      this.init(), this.getData()
    },
    methods: {
      init: function() {
        var t = this;
        e.index.getSystemInfo({
          success: function(n) {
            t.phoneHeight = n.windowHeight, e.index.createSelectorQuery().select(".top-tabbar").boundingClientRect((function(e) {
              var n = t.phoneHeight - e.height;
              t.scrollviewHigh = n
            })).exec()
          }
        })
      },
      getData: function() {
        var t = this;
        e.index.showLoading({
          title: "加载中"
        });
        var n = t.data_type;
        t._get("user.coupon/lists", {
          data_type: n
        }, (function(n) {
          e.index.hideLoading(), t.DataList = n.data.list, t.getSup()
        }))
      },
      getSup: function() {
        var e = [],
          t = {
            name: "平台优惠券",
            list: []
          };
        this.DataList.forEach((function(n, i) {
          if (console.log(i), null == n.supplier) t.list.push(n);
          else if ("" == e) e.push({
            name: n.supplier.name,
            list: [n]
          });
          else {
            var o = !0;
            e.forEach((function(e, t) {
              e.name === n.supplier.name && (o = !1, e.list.push(n))
            })), o && e.push({
              name: n.supplier.name,
              list: [n]
            })
          }
        })), console.log(e), e.push(t), this.supList = e
      },
      stateFunc: function(e) {
        var t = this;
        t.state_active != e && (0 == e && (t.data_type = "not_use"), 1 == e && (t.data_type = "is_use"), 2 == e && (t.data_type = "is_expire"), t.state_active = e, t.getData())
      },
      scrolltoupperFunc: function() {
        console.log("滚动视图区域到顶")
      },
      scrolltolowerFunc: function() {
        console.log("滚动视图区域到底")
      },
      lookRule: function(e) {
        e.rule = !0
      },
      closeRule: function(e) {
        e.rule = !1
      }
    }
  },
  n = e._export_sfc(t, [
    ["render", function(t, n, i, o, a, s) {
      return e.e({
        a: e.n(0 == a.state_active ? "tab-item active" : "tab-item"),
        b: e.o((function(e) {
          return s.stateFunc(0)
        }), "80"),
        c: e.n(1 == a.state_active ? "tab-item active" : "tab-item"),
        d: e.o((function(e) {
          return s.stateFunc(1)
        }), "a2"),
        e: e.n(2 == a.state_active ? "tab-item active" : "tab-item"),
        f: e.o((function(e) {
          return s.stateFunc(2)
        }), "74"),
        g: a.DataList && a.DataList.length > 0
      }, a.DataList && a.DataList.length > 0 ? {
        h: e.f(a.supList, (function(n, i, o) {
          return e.e({
            a: n.name && n.list && n.list.length > 0
          }, n.name && n.list && n.list.length > 0 ? {
            b: e.t(n.name)
          } : {}, {
            c: e.f(n.list, (function(n, i, o) {
              return e.e({
                a: 1 == n.is_use
              }, 1 == n.is_use ? {
                b: t.config.pic_url + "/static/coupon-status1.png"
              } : {}, {
                c: 1 == n.is_expire
              }, 1 == n.is_expire ? {
                d: t.config.pic_url + "/static/coupon-status2.png"
              } : {}, {
                e: e.t(n.name),
                f: 10 == n.expire_type
              }, 10 == n.expire_type ? {
                g: e.t(n.expire_day)
              } : {}, {
                h: 20 == n.expire_type
              }, 20 == n.expire_type ? {
                i: e.t(n.start_time.text),
                j: e.t(n.end_time.text)
              } : {}, {
                k: 10 == n.coupon_type.value
              }, 10 == n.coupon_type.value ? {
                l: e.t(1 * n.reduce_price)
              } : {}, {
                m: 20 == n.coupon_type.value
              }, 20 == n.coupon_type.value ? {
                n: e.t(n.discount / 10)
              } : {}, {
                o: e.t(n.min_price > 0 ? "满" + 1 * n.min_price + "元可用" : "无门槛"),
                p: 0 == n.is_expire && 0 == n.is_use
              }, 0 == n.is_expire && 0 == n.is_use ? e.e({
                q: 10 != n.apply_range
              }, 10 != n.apply_range ? {
                r: e.o((function(e) {
                  return t.gotoPage("/pages/coupon/detail?coupon_id=" + n.coupon_id + "&apply_range=" + n.apply_range)
                }), i)
              } : {
                s: e.o((function(e) {
                  return t.gotoPage("/pages/index/index")
                }), i)
              }) : {}, {
                t: e.n(0 == n.is_expire && 0 == n.is_use ? "coupon-item coupon-item-" + n.color.text : "coupon-item coupon-item-gray"),
                v: 20 == n.apply_range
              }, 20 == n.apply_range ? {
                w: e.o((function(e) {
                  return t.gotoPage("/pages/coupon/detail?coupon_id=" + n.coupon_id + "&apply_range=" + n.apply_range)
                }), i)
              } : 30 == n.apply_range ? {
                y: e.o((function(e) {
                  return t.gotoPage("/pages/coupon/detail?coupon_id=" + n.coupon_id + "&apply_range=" + n.apply_range)
                }), i)
              } : {}, {
                x: 30 == n.apply_range,
                z: i
              })
            })),
            d: i
          })
        }))
      } : {}, {
        i: a.loading
      }, (a.loading, {}), {
        j: a.no_more
      }, (a.no_more, {}), {
        k: 0 == a.DataList.length && !a.loading
      }, (0 != a.DataList.length || a.loading, {}), {
        l: e.s("height:" + a.scrollviewHigh + "px;"),
        m: e.o((function() {
          return s.scrolltoupperFunc && s.scrolltoupperFunc.apply(s, arguments)
        }), "4b"),
        n: e.o((function() {
          return s.scrolltolowerFunc && s.scrolltolowerFunc.apply(s, arguments)
        }), "6b"),
        o: t.theme(),
        p: e.n(t.theme())
      })
    }],
    ["__scopeId", "data-v-588fa5e0"]
  ]);
wx.createPage(n);