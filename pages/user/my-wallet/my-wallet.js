var a = require("../../../common/vendor.js"),
  e = require("../../../common/assets.js"),
  t = {
    data: function() {
      return {
        dataList: [],
        balance: "",
        balance_open: 1,
        cash_open: 0,
        loading: !0
      }
    },
    onShow: function() {
      this.getData()
    },
    methods: {
      getData: function() {
        var e = this;
        a.index.showLoading({
          title: "加载中..."
        }), e.loading = !0, e._get("balance.log/index", {}, (function(t) {
          e.loading = !1, e.dataList = t.data.list, e.balance = t.data.balance, e.balance_open = t.data.balance_open, e.cash_open = t.data.cash_open, a.index.hideLoading()
        }))
      },
      gotoList: function(a) {
        this.gotoPage("/pages/user/my-wallet/my-balance?type=" + a)
      },
      goback: function() {
        a.index.navigateBack()
      },
      gotoPay: function() {
        this.gotoPage("/pages/order/recharge")
      }
    }
  },
  o = a._export_sfc(t, [
    ["render", function(t, o, n, i, c, r) {
      return a.e({
        a: a.s("height:" + t.topBarTop() + "px;"),
        b: a.o((function() {
          return r.goback && r.goback.apply(r, arguments)
        }), "ab"),
        c: a.s(0 == t.topBarHeight() ? "" : "height:" + t.topBarHeight() + "px;"),
        d: !c.loading
      }, c.loading ? {} : a.e({
        e: a.t(c.balance),
        f: c.cash_open
      }, c.cash_open ? {
        g: a.o((function(a) {
          return t.gotoPage("/pages/user/cash/apply")
        }), "f6"),
        h: a.o((function(a) {
          return t.gotoPage("/pages/user/cash/list")
        }), "70")
      } : {}), {
        i: a.s("height:" + (368 + 2 * t.topBarHeight() + 2 * t.topBarTop()) + "rpx;"),
        j: !c.loading
      }, c.loading ? {} : a.e({
        k: c.balance_open
      }, c.balance_open ? {
        l: e._imports_0$2,
        m: a.o((function() {
          return r.gotoPay && r.gotoPay.apply(r, arguments)
        }), "a8"),
        n: e._imports_1$2,
        o: a.o((function(a) {
          return r.gotoList("rechange")
        }), "7a")
      } : {}, {
        p: a.o((function(a) {
          return r.gotoList("all")
        }), "30"),
        q: a.f(c.dataList, (function(e, t, o) {
          return a.e({
            a: a.t(e.scene.text),
            b: e.money > 0
          }, e.money > 0 ? {
            c: a.t(e.money)
          } : {
            d: a.t(e.money)
          }, {
            e: a.t(e.create_time),
            f: t
          })
        }))
      }))
    }]
  ]);
wx.createPage(o);