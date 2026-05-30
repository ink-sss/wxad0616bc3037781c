var t = require("../../../common/vendor.js"),
  a = {
    components: {
      uniLoadMore: function() {
        return "../../../components/uni-load-more.js"
      },
      recharge: function() {
        return "./part/recharge.js"
      }
    },
    data: function() {
      return {
        isPop: !1,
        loadding: !0,
        indicatorDots: !0,
        autoplay: !0,
        interval: 2e3,
        duration: 500,
        topRefresh: !1,
        phoneHeight: 0,
        scrollviewHigh: 0,
        tableData: [],
        last_page: 0,
        page: 1,
        list_rows: 20,
        no_more: !1,
        loading: !0,
        points: 0,
        is_open: !1,
        discount_ratio: "0",
        is_trans_balance: !1
      }
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.tableData.length && this.no_more ? 2 : 0
      }
    },
    onReady: function() {
      t.index.setNavigationBarTitle({
        title: this.points_name()
      })
    },
    mounted: function() {
      this.getData()
    },
    onReachBottom: function() {
      var t = this;
      t.page < t.last_page && (t.page++, t.getData()), t.no_more = !0
    },
    methods: {
      closePop: function(t) {
        null != t && (this.page = 1, this.tableData = [], this.getData()), this.isPop = !1
      },
      getData: function() {
        var t = this,
          a = t.page,
          e = t.list_rows;
        t._get("points.log/index", {
          page: a || 1,
          list_rows: e
        }, (function(a) {
          if (t.loading = !1, t.points = a.data.points, t.discount_ratio = a.data.discount_ratio, t.is_open = a.data.is_open, t.is_trans_balance = a.data.is_trans_balance, t.tableData = t.tableData.concat(a.data.list.data), t.last_page = a.data.list.last_page, a.data.list.last_page <= 1) return t.no_more = !0, !1
        }))
      },
      gotoShop: function() {
        this.gotoPage("/pagesPlus/points/list/list")
      }
    }
  };
Array || (t.resolveComponent("uni-load-more") + t.resolveComponent("recharge"))();
var e = t._export_sfc(a, [
  ["render", function(a, e, o, n, i, s) {
    return t.e({
      a: a.config.pic_url + "/20260406112403d4a588219.png",
      b: t.t(a.points_name()),
      c: t.t(i.points),
      d: i.is_trans_balance
    }, i.is_trans_balance ? {
      e: t.o((function(t) {
        return i.isPop = !0
      }), "bc")
    } : {}, {
      f: i.is_open
    }, i.is_open ? {
      g: t.t(a.points_name()),
      h: t.o((function() {
        return s.gotoShop && s.gotoShop.apply(s, arguments)
      }), "e6")
    } : {}, {
      i: t.f(i.tableData, (function(e, o, n) {
        return t.e({
          a: t.t(a.points_name(e.describe)),
          b: t.t(e.create_time),
          c: e.value > 0
        }, e.value > 0 ? {
          d: t.t(e.value)
        } : {
          e: t.t(e.value)
        }, {
          f: o
        })
      })),
      j: 0 == i.tableData.length && !i.loading
    }, 0 != i.tableData.length || i.loading ? {
      k: t.p({
        loadingType: s.loadingType
      })
    } : {}, {
      l: t.o(s.closePop, "61"),
      m: t.p({
        isPop: i.isPop,
        discount_ratio: i.discount_ratio
      }),
      n: a.theme(),
      o: t.n(a.theme() || "")
    })
  }]
]);
wx.createPage(e);