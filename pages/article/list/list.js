var t = require("../../../common/vendor.js"),
  e = {
    components: {
      uniLoadMore: function() {
        return "../../../components/uni-load-more.js"
      }
    },
    data: function() {
      return {
        loading: !0,
        phoneHeight: 0,
        scrollviewHigh: 0,
        listData: [],
        no_more: null,
        list_rows: 10,
        page: 1,
        categorys: [],
        category_id: 0
      }
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.listData.length && this.no_more ? 2 : 0
      }
    },
    onLoad: function(t) {
      this.category_id = t.category_id
    },
    mounted: function() {
      this.init(), this.getCategory(), this.getData()
    },
    methods: {
      init: function() {
        var e = this;
        t.index.getSystemInfo({
          success: function(i) {
            e.phoneHeight = i.windowHeight, t.index.createSelectorQuery().select(".top-tabbar").boundingClientRect((function(t) {
              var i = e.phoneHeight - t.height;
              e.scrollviewHigh = i
            })).exec()
          }
        })
      },
      getCategory: function() {
        var t = this;
        t._get("plus.article.article/category", {}, (function(e) {
          t.categorys = e.data.category
        }))
      },
      tabTypeFunc: function(t) {
        t != this.category_id && (this.category_id = t, this.page = 1, this.listData = [], this.getData())
      },
      getData: function() {
        var e = this,
          i = e.page,
          a = e.list_rows;
        e.loading = !0, t.index.showLoading({
          title: "加载中"
        }), e._get("plus.article.article/index", {
          page: i || 1,
          list_rows: a,
          category_id: e.category_id
        }, (function(i) {
          e.listData = e.listData.concat(i.data.list.data), e.last_page = i.data.list.last_page, i.data.list.last_page <= 1 && (e.no_more = !0), e.loading = !1, t.index.hideLoading()
        }))
      },
      scrolltolowerFunc: function() {
        var t = this;
        if (t.bottomRefresh = !0, t.page++, t.loading = !0, t.page > t.last_page) return t.loading = !1, void(t.no_more = !0);
        t.getData()
      },
      gotoDetail: function(t) {
        this.gotoPage("/pages/article/detail/detail?article_id=" + t)
      }
    }
  };
Array || (t.resolveComponent("uni-load-more") + t.resolveComponent("tabBar"))();
var i = t._export_sfc(e, [
  ["render", function(e, i, a, o, n, r) {
    return t.e({
      a: t.n(0 == n.category_id ? "tab-item  active" : "tab-item "),
      b: t.o((function(t) {
        return r.tabTypeFunc(0)
      }), "13"),
      c: t.f(n.categorys, (function(e, i, a) {
        return {
          a: t.t(e.name),
          b: t.n(n.category_id == e.category_id ? "tab-item  active" : "tab-item "),
          c: i,
          d: t.o((function(t) {
            return r.tabTypeFunc(e.category_id)
          }), i)
        }
      })),
      d: t.f(n.listData, (function(e, i, a) {
        return t.e({
          a: t.t(e.article_title),
          b: t.t(e.dec),
          c: t.t(e.create_time),
          d: t.t(e.actual_views),
          e: null != e.image
        }, null != e.image ? {
          f: e.image.file_path
        } : {}, {
          g: i,
          h: t.o((function(t) {
            return r.gotoDetail(e.article_id)
          }), i)
        })
      })),
      e: 0 == n.listData.length && !n.loading
    }, 0 != n.listData.length || n.loading ? {
      f: t.p({
        loadingType: r.loadingType
      })
    } : {}, {
      g: t.s("height:" + n.scrollviewHigh + "px;"),
      h: t.o((function() {
        return r.scrolltolowerFunc && r.scrolltolowerFunc.apply(r, arguments)
      }), "e8"),
      i: e.theme(),
      j: t.n(e.theme() || "")
    })
  }]
]);
wx.createPage(i);