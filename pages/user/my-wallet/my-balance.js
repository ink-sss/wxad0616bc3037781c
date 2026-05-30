var t = require("../../../common/vendor.js");
Array || t.resolveComponent("uni-load-more")();
var e = t._export_sfc({
  components: {
    uniLoadMore: function() {
      return "../../../components/uni-load-more.js"
    }
  },
  data: function() {
    return {
      loading: !0,
      topRefresh: !1,
      phoneHeight: 0,
      scrollviewHigh: 0,
      tableData: [],
      last_page: 0,
      page: 1,
      list_rows: 20,
      no_more: !1,
      type: "all"
    }
  },
  computed: {
    loadingType: function() {
      return this.loading ? 1 : 0 != this.tableData.length && this.no_more ? 2 : 0
    }
  },
  onLoad: function(t) {
    this.type = t.type, this.getData()
  },
  onReachBottom: function() {
    var t = this;
    t.page < t.last_page && (t.page++, t.getData()), t.no_more = !0
  },
  methods: {
    getData: function() {
      var t = this,
        e = t.page,
        a = t.list_rows;
      t.loading = !0, t._get("balance.log/lists", {
        page: e || 1,
        list_rows: a,
        type: t.type
      }, (function(e) {
        if (t.loading = !1, t.tableData = t.tableData.concat(e.data.list.data), t.last_page = e.data.list.last_page, e.data.list.last_page <= 1) return t.no_more = !0, !1
      }))
    }
  }
}, [
  ["render", function(e, a, n, o, i, l) {
    return t.e({
      a: t.f(i.tableData, (function(e, a, n) {
        return t.e({
          a: t.t(e.scene.text),
          b: t.t(e.create_time),
          c: e.money > 0
        }, e.money > 0 ? {
          d: t.t(e.money)
        } : {
          e: t.t(e.money)
        }, {
          f: a
        })
      })),
      b: 0 == i.tableData.length && !i.loading
    }, 0 != i.tableData.length || i.loading ? {
      c: t.p({
        loadingType: l.loadingType
      })
    } : {})
  }]
]);
wx.createPage(e);