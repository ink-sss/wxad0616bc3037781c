var t = require("../../../common/vendor.js"),
  a = t._export_sfc({
    data: function() {
      return {}
    },
    props: ["itemData"],
    methods: {
      scroll: function(t) {},
      gotoList: function() {
        this.gotoPage("/pagesPlus/bargain/list/list")
      },
      gotoDetail: function(t) {
        var a = "/pagesPlus/bargain/detail/detail?bargain_product_id=" + t;
        this.gotoPage(a)
      }
    }
  }, [
    ["render", function(a, e, i, o, r, l) {
      return t.e({
        a: i.itemData.data.product_list && i.itemData.data.product_list.length > 0
      }, i.itemData.data.product_list && i.itemData.data.product_list.length > 0 ? t.e({
        b: 1 == i.itemData.style.titleType
      }, 1 == i.itemData.style.titleType ? {
        c: t.t(i.itemData.params.title)
      } : {}, {
        d: 2 == i.itemData.style.titleType
      }, 2 == i.itemData.style.titleType ? {
        e: i.itemData.style.title_image
      } : {}, {
        f: t.t(i.itemData.params.more),
        g: i.itemData.style.moreColor,
        h: t.o((function() {
          return l.gotoList && l.gotoList.apply(l, arguments)
        }), "08"),
        i: i.itemData.style.moreColor,
        j: 2 * i.itemData.style.moreSize + "rpx",
        k: i.itemData.style.bgimage ? "url(" + i.itemData.style.bgimage + ")" : "",
        l: t.f(i.itemData.data.product_list, (function(a, e, o) {
          return t.e({
            a: a.product.file_path
          }, 1 == i.itemData.style.product_sales ? {
            b: t.t(a.total_sales),
            c: i.itemData.style.salesColor,
            d: i.itemData.style.bgSales
          } : {}, 1 == i.itemData.style.product_name ? {
            e: t.t(a.product.product_name),
            f: i.itemData.style.productName_color
          } : {}, 1 == i.itemData.style.product_price ? {
            g: t.t(a.bargain_price),
            h: i.itemData.style.productPrice_color
          } : {}, 1 == i.itemData.style.product_lineprice ? {
            i: t.t(a.product_price),
            j: i.itemData.style.productLine_color
          } : {}, {
            k: e,
            l: t.o((function(t) {
              return l.gotoDetail(a.bargain_product_id)
            }), e)
          })
        })),
        m: 2 * i.itemData.style.product_imgRadio + "rpx",
        n: 1 == i.itemData.style.product_sales,
        o: 1 == i.itemData.style.product_name,
        p: 1 == i.itemData.style.product_price,
        q: 1 == i.itemData.style.product_lineprice,
        r: i.itemData.style.productBg_color,
        s: 2 * i.itemData.style.product_topRadio + "rpx",
        t: 2 * i.itemData.style.product_topRadio + "rpx",
        v: 2 * i.itemData.style.product_bottomRadio + "rpx",
        w: 2 * i.itemData.style.product_bottomRadio + "rpx",
        x: i.itemData.style.background,
        y: 2 * i.itemData.style.topRadio + "rpx",
        z: 2 * i.itemData.style.topRadio + "rpx",
        A: 2 * i.itemData.style.bottomRadio + "rpx",
        B: 2 * i.itemData.style.bottomRadio + "rpx",
        C: i.itemData.style.bgcolor,
        D: 2 * i.itemData.style.paddingLeft + "rpx",
        E: 2 * i.itemData.style.paddingLeft + "rpx",
        F: 2 * i.itemData.style.paddingTop + "rpx",
        G: 2 * i.itemData.style.paddingBottom + "rpx"
      }) : {})
    }]
  ]);
wx.createComponent(a);