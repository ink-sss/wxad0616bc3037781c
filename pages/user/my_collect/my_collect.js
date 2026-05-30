var o = require("../../../common/vendor.js"),
  t = {
    components: {
      uniLoadMore: function() {
        return "../../../components/uni-load-more.js"
      }
    },
    data: function() {
      return {
        shop_list: [],
        loading: !0,
        no_more: !1,
        scrollviewHigh: "",
        page: 1,
        last_page: "",
        isfollow: ""
      }
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.shop_list.length && this.no_more ? 2 : 0
      }
    },
    onShow: function() {
      this.getData(), this.init()
    },
    methods: {
      init: function() {
        var t = this;
        t.shop_list = [], t.page = 1, o.index.getSystemInfo({
          success: function(o) {
            t.scrollviewHigh = o.windowHeight
          }
        })
      },
      getData: function() {
        var o = this;
        o._post("user.Favorite/list", {
          page: o.page,
          type: 10,
          list_rows: 15
        }, (function(t) {
          o.loading = !1, o.shop_list = o.shop_list.concat(t.data.list.data), o.last_page = t.data.list.last_page, t.data.list.last_page <= 1 ? o.no_more = !0 : o.no_more = !1
        }))
      },
      scrolltolowerFunc: function() {
        var o = this;
        o.no_more || (o.page++, o.page <= o.last_page ? o.getData() : o.no_more = !0)
      },
      goto_shop: function(o) {
        this.gotoPage("/pages/shop/shop?shop_supplier_id=" + o)
      },
      goto_product: function(o) {
        this.gotoPage("/pages/product/detail/detail?product_id=" + o)
      }
    }
  };
Array || o.resolveComponent("uni-load-more")();
var e = o._export_sfc(t, [
  ["render", function(t, e, i, n, s, r) {
    return o.e({
      a: o.f(s.shop_list, (function(t, e, i) {
        return o.e({
          a: t.logo,
          b: o.t(t.store_name),
          c: o.t(t.categoryName),
          d: o.t(t.product_sales),
          e: o.t(t.fav_count),
          f: o.t(t.score),
          g: o.o((function(o) {
            return r.goto_shop(t.shop_supplier_id)
          }), e),
          h: s.shop_list[e].productList.length > 0
        }, s.shop_list[e].productList.length > 0 ? {
          i: o.f(s.shop_list[e].productList, (function(t, e, i) {
            return o.e({
              a: t.logo,
              b: o.t(t.product_price > 1e3 ? 1 * t.product_price : t.product_price),
              c: t.line_price
            }, t.line_price ? {
              d: o.t(t.line_price > 1e3 ? 1 * t.line_price : t.line_price)
            } : {}, {
              e: e,
              f: o.o((function(o) {
                return r.goto_product(t.product_id)
              }), e)
            })
          })),
          j: o.n(s.shop_list[e].productList.length < 3 ? "shop_list_body_item_product2" : "shop_list_body_item_product")
        } : {}, {
          k: e
        })
      })),
      b: 0 == s.shop_list.length && !s.loading
    }, 0 != s.shop_list.length || s.loading ? {
      c: o.p({
        loadingType: r.loadingType
      })
    } : {}, {
      d: o.s("height:" + s.scrollviewHigh + "px;"),
      e: o.o((function() {
        return r.scrolltolowerFunc && r.scrolltolowerFunc.apply(r, arguments)
      }), "55")
    })
  }]
]);
wx.createPage(e);