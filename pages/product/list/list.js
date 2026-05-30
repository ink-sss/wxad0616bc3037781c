var t = require("../../../common/vendor.js"),
  e = {
    components: {
      uniLoadMore: function() {
        return "../../../components/uni-load-more.js"
      }
    },
    data: function() {
      return {
        isLieBiao: !0,
        phoneHeight: 0,
        scrollviewHigh: 0,
        topRefresh: !1,
        loading: !0,
        no_more: !1,
        type_active: 0,
        price_top: !1,
        listData: [],
        page: 1,
        category_id: 0,
        search: "",
        sortType: "",
        sortPrice: 0,
        list_rows: 10,
        last_page: 0
      }
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.listData.length && this.no_more ? 2 : 0
      }
    },
    onLoad: function(t) {
      this.category_id = t.category_id || 0, t.search && (this.search = t.search), t.sortType && (this.sortType = t.sortType), t.sortPrice && (this.sortPrice = t.sortPrice)
    },
    mounted: function() {
      this.init(), this.getData()
    },
    onPullDownRefresh: function() {
      this.restoreData(), this.getData()
    },
    onShareAppMessage: function() {
      return {
        title: "全部分类",
        path: "/pages/product/category?" + this.getShareUrlParams()
      }
    },
    methods: {
      searchFunc: function() {
        this.listData = [], this.page = 1, this.getData()
      },
      init: function() {
        var e = this;
        t.index.getSystemInfo({
          success: function(o) {
            e.phoneHeight = o.windowHeight, t.index.createSelectorQuery().select(".top-box").boundingClientRect((function(t) {
              var o = e.phoneHeight - t.height;
              e.scrollviewHigh = o
            })).exec()
          }
        })
      },
      restoreData: function() {
        this.listData = [], this.category_id = 0, this.search = "", this.sortType = "", this.sortPrice = 0
      },
      tabTypeFunc: function(t) {
        var e = this;
        e.listData = [], e.page = 1, e.no_more = !1, e.loading = !0, 2 == t ? (e.price_top = !this.price_top, 1 == e.price_top ? e.sortPrice = 0 : e.sortPrice = 1, e.sortType = "price") : 1 == t && (e.price_top = !this.price_top, e.sortType = "sales"), e.type_active = t, console.log(e.type_active), e.getData()
      },
      getData: function() {
        var t = this,
          e = t.page,
          o = t.list_rows,
          i = t.category_id,
          r = t.search,
          a = t.sortType,
          n = t.sortPrice;
        t.loading = !0, t._get("product.product/lists", {
          page: e || 1,
          category_id: i,
          search: r,
          sortType: a,
          sortPrice: n,
          list_rows: o
        }, (function(e) {
          t.loading = !1, t.listData = t.listData.concat(e.data.list.data), t.last_page = e.data.list.last_page, e.data.list.last_page <= 1 && (t.no_more = !0)
        }))
      },
      gotoList: function(t) {
        var e = "pages/product/detail/detail?product_id=" + t;
        this.gotoPage(e)
      },
      gotoSearch: function() {
        self.gotoPage("/pages/product/search/search")
      },
      scrolltolowerFunc: function() {
        var t = this;
        if (t.bottomRefresh = !0, t.page++, t.loading = !0, t.page > t.last_page) return t.loading = !1, void(t.no_more = !0);
        t.getData()
      },
      select_type: function() {
        this.isLieBiao = !this.isLieBiao
      },
      goback: function() {
        var e = getCurrentPages();
        console.log(e.length), e.length <= 1 ? this.gotoPage("/pages/index/index") : t.index.navigateBack()
      }
    }
  };
Array || t.resolveComponent("uni-load-more")();
var o = t._export_sfc(e, [
  ["render", function(e, o, i, r, a, n) {
    return t.e({
      a: t.o((function(t) {
        return n.searchFunc()
      }), "37"),
      b: a.search,
      c: t.o((function(t) {
        return a.search = t.detail.value
      }), "12"),
      d: t.n(0 == a.type_active ? "item active" : "item"),
      e: t.o((function(t) {
        return n.tabTypeFunc(0)
      }), "b2"),
      f: t.n(1 == a.type_active ? "item active" : "item"),
      g: t.o((function(t) {
        return n.tabTypeFunc(1)
      }), "bb"),
      h: t.n(a.price_top && 2 == a.type_active ? "arrow active" : "arrow"),
      i: t.n(a.price_top || 2 != a.type_active ? "arrow" : "arrow active"),
      j: t.n(2 == a.type_active ? "item active" : "item"),
      k: t.o((function(t) {
        return n.tabTypeFunc(2)
      }), "5d"),
      l: e.config.pic_url + (1 == a.isLieBiao ? "/202604061216345ffa53811.png" : "/20260406121801e30e33517.png"),
      m: t.o((function(t) {
        return n.select_type()
      }), "58"),
      n: t.f(3, (function(t, e, o) {
        return {
          a: e
        }
      })),
      o: t.n(a.topRefresh ? "top-refresh open" : "top-refresh"),
      p: 1 == a.isLieBiao
    }, 1 == a.isLieBiao ? {
      q: t.f(a.listData, (function(e, o, i) {
        return t.e({
          a: e.product_stock <= 0
        }, (e.product_stock, {}), {
          b: e.product_image,
          c: t.t(e.product_name),
          d: t.t(e.product_price),
          e: t.t(e.product_sales),
          f: t.n(o == a.listData.length - 1 ? "noborder" : ""),
          g: o,
          h: t.o((function(t) {
            return n.gotoList(e.product_id)
          }), o)
        })
      }))
    } : {}, {
      r: 0 == a.isLieBiao
    }, 0 == a.isLieBiao ? {
      s: t.f(a.listData, (function(e, o, i) {
        return t.e({
          a: e.product_stock <= 0
        }, (e.product_stock, {}), {
          b: e.product_image,
          c: t.t(e.product_name),
          d: t.t(e.product_sales),
          e: t.t(e.product_price),
          f: t.n(o % 2 == 0 ? "ml20 mr20" : " mr20"),
          g: o,
          h: t.o((function(t) {
            return n.gotoList(e.product_id)
          }), o)
        })
      }))
    } : {}, {
      t: 0 == a.listData.length && !a.loading
    }, 0 != a.listData.length || a.loading ? {
      v: t.p({
        loadingType: n.loadingType
      })
    } : {}, {
      w: t.s("height:" + a.scrollviewHigh + "px;"),
      x: t.o((function() {
        return n.scrolltolowerFunc && n.scrolltolowerFunc.apply(n, arguments)
      }), "80"),
      y: e.theme(),
      z: t.n(e.theme() || "")
    })
  }],
  ["__scopeId", "data-v-1a9d9bbf"]
]);
e.__runtimeHooks = 2, wx.createPage(o);