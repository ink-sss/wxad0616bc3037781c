var t = require("../../../common/vendor.js"),
  o = {
    components: {
      uniLoadMore: function() {
        return "../../../components/uni-load-more.js"
      }
    },
    data: function() {
      return {
        loading: !0,
        no_more: !1,
        scrollviewHigh: "",
        product_list: [],
        page: 1,
        last_page: "",
        isfollow: ""
      }
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.product_list.length && this.no_more ? 2 : 0
      }
    },
    onShow: function() {
      this.init(), this.getData()
    },
    methods: {
      init: function() {
        var o = this;
        o.page = 1, o.product_list = [], t.index.getSystemInfo({
          success: function(t) {
            o.scrollviewHigh = t.windowHeight
          }
        })
      },
      getData: function() {
        var t = this;
        t.loading = !0, t._post("user.Favorite/list", {
          page: t.page,
          type: 20,
          list_rows: 15
        }, (function(o) {
          t.loading = !1, t.last_page = o.data.list.last_page, t.product_list = t.product_list.concat(o.data.list.data), o.data.list.last_page <= 1 ? t.no_more = !0 : t.no_more = !1
        }))
      },
      scrolltolowerFunc: function() {
        var t = this;
        t.no_more || (t.page++, t.page <= t.last_page ? t.getData() : t.no_more = !0)
      },
      goto_product: function(t) {
        this.gotoPage("pages/product/detail/detail?product_id=" + t)
      },
      guanzhu: function(t) {
        var o = this;
        o.page = 1, o.loading = !0, o._post("user.Favorite/add", {
          pid: t,
          type: 20
        }, (function(t) {
          o.loading = !1, o._post("user.Favorite/list", {
            page: o.page,
            type: 20,
            list_rows: 15
          }, (function(t) {
            o.product_list = t.data.list.data
          }))
        }))
      }
    }
  };
Array || t.resolveComponent("uni-load-more")();
var e = t._export_sfc(o, [
  ["render", function(o, e, i, n, r, a) {
    return t.e({
      a: t.f(r.product_list, (function(o, e, i) {
        return t.e({
          a: o.product_image,
          b: t.o((function(t) {
            return a.goto_product(o.product_id)
          }), e),
          c: t.t(o.product_name),
          d: t.t(o.product_price),
          e: o.line_price
        }, o.line_price ? {
          f: t.t(o.line_price)
        } : {}, {
          g: t.o((function(t) {
            return a.guanzhu(o.product_id)
          }), e),
          h: t.o((function(t) {
            return a.goto_product(o.product_id)
          }), e),
          i: e
        })
      })),
      b: 0 == r.product_list.length && !r.loading
    }, 0 != r.product_list.length || r.loading ? {
      c: t.p({
        loadingType: a.loadingType
      })
    } : {}, {
      d: t.s("height:" + r.scrollviewHigh + "px;"),
      e: t.o((function() {
        return a.scrolltolowerFunc && a.scrolltolowerFunc.apply(a, arguments)
      }), "39"),
      f: t.n(o.theme() || ""),
      g: o.theme()
    })
  }]
]);
wx.createPage(e);