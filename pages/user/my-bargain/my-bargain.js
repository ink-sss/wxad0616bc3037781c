var t = require("../../../common/vendor.js");
require("../../../env/config.js");
var e = {
  components: {
    uniLoadMore: function() {
      return "../../../components/uni-load-more.js"
    },
    Countdown: function() {
      return "../../../components/countdown/countdown.js"
    }
  },
  data: function() {
    return {
      loading: !0,
      phoneHeight: 0,
      scrollviewHigh: 0,
      status: 0,
      topRefresh: !1,
      page: 1,
      list_rows: 20,
      listData: [],
      no_more: !1,
      countdownConfig: {
        startstamp: 0,
        endstamp: 0,
        type: "text",
        title: "剩余："
      }
    }
  },
  computed: {
    loadingType: function() {
      return this.loading ? 1 : 0 != this.listData.length && this.no_more ? 2 : 0
    }
  },
  onLoad: function(t) {},
  mounted: function() {
    this.init(), this.getData()
  },
  methods: {
    rturnObjec: function(t) {
      return {
        type: "text",
        startstamp: 0,
        endstamp: t.end_time,
        title: "剩余"
      }
    },
    progressReturn: function(t) {
      return 1 == t.is_floor ? 100 : t.bargain_rate
    },
    init: function() {
      var e = this;
      t.index.getSystemInfo({
        success: function(n) {
          e.phoneHeight = n.windowHeight, t.index.createSelectorQuery().select(".top-tabbar").boundingClientRect((function(n) {
            var o = e.phoneHeight - n.height;
            t.index.createSelectorQuery().select(".more-bargaining").boundingClientRect((function(t) {
              var n = o - t.height;
              e.scrollviewHigh = n
            })).exec()
          })).exec()
        }
      })
    },
    stateFunc: function(t) {
      var e = this;
      e.status != t && (e.listData = [], e.page = 1, e.status = t, e.getData())
    },
    getData: function() {
      var t = this;
      t.loading = !0, t._get("user.bargain/lists", {
        page: t.page,
        list_rows: t.list_rows,
        status: t.status
      }, (function(e) {
        if (t.loading = !1, t.listData = t.listData.concat(e.data.list.data), t.last_page = e.data.list.last_page, e.data.list.last_page <= 1) return t.no_more = !0, !1
      }))
    },
    scrolltolowerFunc: function() {
      var t = this;
      t.no_more || (t.page++, t.page <= t.last_page ? t.getData() : t.no_more = !0)
    },
    gotoDetail: function(t) {
      this.gotoPage("/pagesPlus/bargain/haggle/haggle?bargain_task_id=" + t)
    },
    goback: function() {
      t.index.navigateBack({})
    },
    gotoMore: function() {
      this.gotoPage("/pagesPlus/bargain/list/list")
    },
    returnValFunc: function(t, e) {
      console.log(t, e)
    }
  }
};
Array || (t.resolveComponent("Countdown") + t.resolveComponent("uni-load-more"))();
var n = t._export_sfc(e, [
  ["render", function(e, n, o, a, i, r) {
    return t.e({
      a: t.n(0 == i.status ? "tab-item active" : "tab-item"),
      b: t.o((function(t) {
        return r.stateFunc(0)
      }), "d1"),
      c: t.n(1 == i.status ? "tab-item active" : "tab-item"),
      d: t.o((function(t) {
        return r.stateFunc(1)
      }), "63"),
      e: t.n(2 == i.status ? "tab-item active" : "tab-item"),
      f: t.o((function(t) {
        return r.stateFunc(2)
      }), "96"),
      g: t.f(i.listData, (function(e, n, o) {
        return t.e({
          a: t.t(e.create_time)
        }, 0 == i.status ? {
          b: "18e044f8-0-" + o,
          c: t.p({
            config: r.rturnObjec(e)
          })
        } : {}, {
          d: e.file_path,
          e: t.t(e.product_name),
          f: t.t(e.bargain_price),
          g: t.t(e.product_price),
          h: t.s("width:" + r.progressReturn(e) + "%;"),
          i: t.t(r.progressReturn(e)),
          j: t.o((function(t) {
            return r.gotoDetail(e.bargain_task_id)
          }), n),
          k: n
        })
      })),
      h: 0 == i.status,
      i: 0 == i.listData.length && !i.loading
    }, 0 != i.listData.length || i.loading ? {
      k: t.p({
        loadingType: r.loadingType
      })
    } : {
      j: e.config.pic_url + "/static/list-null.png"
    }, {
      l: t.s("height:" + i.scrollviewHigh + "px;"),
      m: t.o((function() {
        return r.scrolltolowerFunc && r.scrolltolowerFunc.apply(r, arguments)
      }), "d9"),
      n: t.o((function() {
        return r.gotoMore && r.gotoMore.apply(r, arguments)
      }), "e5"),
      o: e.theme(),
      p: t.n(e.theme() || "")
    })
  }]
]);
wx.createPage(n);