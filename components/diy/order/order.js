var e = require("../../../common/vendor.js"),
  t = e._export_sfc({
    data: function() {
      return {
        orderItem: [{
          name: "待付款",
          url: "/pages/order/myorder?dataType=payment",
          pop: "payment"
        }, {
          name: "待发货",
          url: "/pages/order/myorder?dataType=delivery",
          pop: "delivery"
        }, {
          name: "待收货",
          url: "/pages/order/myorder?dataType=received",
          pop: "received"
        }, {
          name: "待评价",
          url: "/pages/order/myorder?dataType=comment",
          pop: "comment"
        }, {
          name: "退款/售后",
          url: "/pages/order/refund/index/index",
          pop: "refund"
        }]
      }
    },
    props: ["itemData", "userInfo"],
    created: function() {},
    methods: {
      gotoDetail: function(e) {
        this.gotoPage(e.linkUrl)
      }
    }
  }, [
    ["render", function(t, r, o, a, n, d) {
      return {
        a: e.f(n.orderItem, (function(r, a, n) {
          return e.e({
            a: "/static/order/" + o.itemData.style.type + "-" + a + ".png"
          }, o.userInfo.orderCount ? e.e({
            b: null != o.userInfo.orderCount[r.pop] && o.userInfo.orderCount[r.pop] > 0
          }, null != o.userInfo.orderCount[r.pop] && o.userInfo.orderCount[r.pop] > 0 ? {
            c: e.t(o.userInfo.orderCount[r.pop])
          } : {}) : {}, {
            d: e.t(r.name),
            e: a,
            f: e.o((function(e) {
              return t.gotoPage(r.url)
            }), a)
          })
        })),
        b: o.userInfo.orderCount,
        c: o.itemData.style.background,
        d: 2 * o.itemData.style.topRadio + "rpx " + 2 * o.itemData.style.topRadio + "rpx " + 2 * o.itemData.style.bottomRadio + "rpx " + 2 * o.itemData.style.bottomRadio + "rpx",
        e: o.itemData.style.bgcolor,
        f: 2 * o.itemData.style.paddingTop + "rpx " + 2 * o.itemData.style.paddingLeft + "rpx " + 2 * o.itemData.style.paddingBottom + "rpx " + 2 * o.itemData.style.paddingLeft + "rpx"
      }
    }],
    ["__scopeId", "data-v-3ee4d983"]
  ]);
wx.createComponent(t);