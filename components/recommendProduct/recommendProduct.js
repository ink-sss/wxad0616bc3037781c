var t = require("../../common/vendor.js"),
  o = t._export_sfc({
    data: function() {
      return {
        listData: [],
        isShow: !1,
        showName: ""
      }
    },
    created: function() {
      this.getData()
    },
    props: ["location"],
    methods: {
      getData: function() {
        var t = this;
        t.page, t._post("product.product/recommendProduct", {
          location: t.location
        }, (function(o) {
          1 == o.data.is_recommend && (t.isShow = !0, t.showName = o.data.recommend.name, t.listData = o.data.list)
        }))
      },
      gotoProduct: function(t) {
        var o = "pages/product/detail/detail?product_id=" + t;
        this.gotoPage(o)
      }
    }
  }, [
    ["render", function(o, e, a, r, c, n) {
      return t.e({
        a: c.isShow
      }, c.isShow ? {
        b: t.t(c.showName),
        c: t.f(c.listData, (function(o, e, a) {
          return {
            a: o.product_image,
            b: t.t(o.product_name),
            c: t.t(o.product_sku.product_price),
            d: t.t(o.product_sales),
            e: e,
            f: t.o((function(t) {
              return n.gotoProduct(o.product_id)
            }), e)
          }
        })),
        d: o.theme(),
        e: t.n(o.theme() || "")
      } : {})
    }]
  ]);
wx.createComponent(o);