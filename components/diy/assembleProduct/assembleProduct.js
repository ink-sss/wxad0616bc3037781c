var t = require("../../../common/vendor.js"),
  e = t._export_sfc({
    components: {},
    data: function() {
      return {}
    },
    props: ["itemData"],
    created: function() {},
    methods: {
      gotoList: function() {
        this.gotoPage("/pagesPlus/assemble/list/list")
      },
      gotoDetail: function(t) {
        var e = "/pagesPlus/assemble/detail/detail?assemble_product_id=" + t.assemble_product_id;
        this.gotoPage(e)
      }
    }
  }, [
    ["render", function(e, a, i, o, r, l) {
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
        }), "b2"),
        i: i.itemData.style.moreColor,
        j: 2 * i.itemData.style.moreSize + "rpx",
        k: i.itemData.style.bgimage ? "url(" + i.itemData.style.bgimage + ")" : "",
        l: t.f(i.itemData.data.product_list, (function(e, a, o) {
          return t.e({
            a: e.product.file_path
          }, 1 == i.itemData.style.product_numberbtn ? {
            b: t.t(e.assemble_num),
            c: i.itemData.style.number_color,
            d: "linear-gradient(to right, " + (i.itemData.style.title_color1 || "#fff") + ", " + (i.itemData.style.title_color2 || "#fff") + ")"
          } : {}, 1 == i.itemData.style.product_name ? {
            e: t.t(e.product.product_name)
          } : {}, 1 == i.itemData.style.product_price ? {
            f: t.t(e.assemble_price),
            g: i.itemData.style.productPrice_color
          } : {}, 1 == i.itemData.style.product_lineprice ? {
            h: t.t(e.product_price),
            i: i.itemData.style.productLine_color
          } : {}, 1 == i.itemData.style.product_btn ? {
            j: t.t(i.itemData.params.btntext),
            k: i.itemData.style.productLine_btnBackground,
            l: i.itemData.style.productLine_btnRadius + "px",
            m: i.itemData.style.productLine_btnColor
          } : {}, {
            n: t.o((function(t) {
              return l.gotoDetail(e)
            }), a),
            o: a
          })
        })),
        m: 2 * i.itemData.style.product_imgRadio + "rpx",
        n: 1 == i.itemData.style.product_numberbtn,
        o: 1 == i.itemData.style.product_name,
        p: 1 == i.itemData.style.product_price,
        q: 1 == i.itemData.style.product_lineprice,
        r: 1 == i.itemData.style.product_btn,
        s: i.itemData.style.productBg_color,
        t: 2 * i.itemData.style.product_topRadio + "rpx",
        v: 2 * i.itemData.style.product_topRadio + "rpx",
        w: 2 * i.itemData.style.product_bottomRadio + "rpx",
        x: 2 * i.itemData.style.product_bottomRadio + "rpx",
        y: i.itemData.style.background,
        z: 2 * i.itemData.style.topRadio + "rpx",
        A: 2 * i.itemData.style.topRadio + "rpx",
        B: 2 * i.itemData.style.bottomRadio + "rpx",
        C: 2 * i.itemData.style.bottomRadio + "rpx",
        D: i.itemData.style.bgcolor,
        E: 2 * i.itemData.style.paddingLeft + "rpx",
        F: 2 * i.itemData.style.paddingLeft + "rpx",
        G: 2 * i.itemData.style.paddingTop + "rpx",
        H: 2 * i.itemData.style.paddingBottom + "rpx"
      }) : {})
    }]
  ]);
wx.createComponent(e);