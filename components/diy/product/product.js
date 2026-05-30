require("../../../@babel/runtime/helpers/Arrayincludes");
var t = require("../../../common/vendor.js"),
  a = t._export_sfc({
    components: {},
    data: function() {
      return {}
    },
    props: ["itemData"],
    created: function() {},
    computed: {
      borderStyle: function() {
        var t = [3, 4, 6].includes(this.itemData.params.column),
          a = t ? "".concat(this.itemData.style.topRadio, "px") : "",
          e = t ? "".concat(this.itemData.style.bottomRadio, "px") : "";
        return {
          borderTopLeftRadius: a,
          borderTopRightRadius: a,
          borderBottomLeftRadius: e,
          borderBottomRightRadius: e,
          backgroundImage: t ? "linear-gradient(to right, ".concat(this.itemData.style.bgcolor_color1 || "#fff", ", ").concat(this.itemData.style.bgcolor_color2 || "#fff", ")") : ""
        }
      },
      productStyle: function() {
        var t = ![3, 4, 6].includes(this.itemData.params.column),
          a = t ? "".concat(this.itemData.style.topRadio, "px") : "",
          e = t ? "".concat(this.itemData.style.bottomRadio, "px") : "";
        return {
          borderTopLeftRadius: a,
          borderTopRightRadius: a,
          borderBottomLeftRadius: e,
          borderBottomRightRadius: e,
          backgroundImage: t ? "linear-gradient(to right, ".concat(this.itemData.style.bgcolor_color1 || "#fff", ", ").concat(this.itemData.style.bgcolor_color2 || "#fff", ")") : ""
        }
      }
    },
    methods: {
      scroll: function(t) {},
      gotoDetail: function(t) {
        var a = "/pages/product/detail/detail?product_id=" + t;
        this.gotoPage(a)
      }
    }
  }, [
    ["render", function(a, e, r, o, i, c) {
      return {
        a: t.f(2 == r.itemData.params.column || 4 == r.itemData.params.column ? 2 : 1, (function(e, o, i) {
          return {
            a: t.f(r.itemData.data, (function(e, i, m) {
              return t.e({
                a: ![2, 4].includes(r.itemData.params.column) || i % 2 === o
              }, [2, 4].includes(r.itemData.params.column) && i % 2 !== o ? {} : t.e({
                b: 2 * r.itemData.style.productTopRadio + "rpx",
                c: 2 * r.itemData.style.productTopRadio + "rpx",
                d: 2 * r.itemData.style.productBottomRadio + "rpx",
                e: 2 * r.itemData.style.productBottomRadio + "rpx",
                f: e.image || "",
                g: r.itemData.params.productName
              }, r.itemData.params.productName ? {
                h: t.t(e.product_name),
                i: r.itemData.style.nameWeight ? 1 : ""
              } : {}, {
                j: r.itemData.style.product_name_color,
                k: r.itemData.params.productPrice
              }, r.itemData.params.productPrice ? {
                l: t.t(e.product_price),
                m: r.itemData.style.product_price_color
              } : {}, {
                n: r.itemData.params.linePrice && e.line_price > 0
              }, r.itemData.params.linePrice && e.line_price > 0 ? {
                o: t.t(e.line_price),
                p: r.itemData.style.line_price_color
              } : {}, {
                q: r.itemData.params.productSales
              }, r.itemData.params.productSales ? {
                r: t.t(e.product_sales),
                s: r.itemData.style.product_sales_color
              } : {}, {
                t: r.itemData.params.comment
              }, r.itemData.params.comment ? t.e({
                v: e.goodRate
              }, e.goodRate ? {
                w: t.t(e.goodRate),
                x: r.itemData.style.product_comment_color
              } : {}) : {}, {
                y: 1 == r.itemData.params.showCart
              }, 1 == r.itemData.params.showCart ? t.e({
                z: 0 == r.itemData.params.cartType
              }, 0 == r.itemData.params.cartType ? {
                A: t.t(r.itemData.params.cartText || "购买"),
                B: r.itemData.style.cart_text_color,
                C: "linear-gradient(to right, " + (r.itemData.style.cart_color1 || "#fff") + ", " + (r.itemData.style.cart_color2 || "#fff") + ")"
              } : {}, {
                D: 1 == r.itemData.params.cartType
              }, 1 == r.itemData.params.cartType ? {
                E: r.itemData.style.cart_text_color,
                F: "linear-gradient(to right, " + (r.itemData.style.cart_color1 || "#fff") + ", " + (r.itemData.style.cart_color2 || "#fff") + ")"
              } : {}, {
                G: 2 == r.itemData.params.cartType
              }, 2 == r.itemData.params.cartType ? {
                H: r.itemData.style.cart_text_color,
                I: "linear-gradient(to right, " + (r.itemData.style.cart_color1 || "#fff") + ", " + (r.itemData.style.cart_color2 || "#fff") + ")"
              } : {}) : {}, {
                J: t.s(c.productStyle),
                K: t.o((function(t) {
                  return a.gotoPage("/pages/product/detail/detail?product_id=" + e.product_id)
                }), i)
              }), {
                L: i
              })
            })),
            b: o
          }
        })),
        b: t.n("column__".concat(r.itemData.params.column)),
        c: t.n("column__".concat(r.itemData.params.column)),
        d: t.s(c.borderStyle),
        e: 2 * r.itemData.style.paddingLeft + "rpx",
        f: 2 * r.itemData.style.paddingLeft + "rpx",
        g: 2 * r.itemData.style.paddingTop + "rpx",
        h: 2 * r.itemData.style.paddingBottom + "rpx",
        i: 2 * r.itemData.style.marginTop + "rpx",
        j: r.itemData.style.background
      }
    }],
    ["__scopeId", "data-v-ec647ca3"]
  ]);
wx.createComponent(a);