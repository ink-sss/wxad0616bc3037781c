require("../../../@babel/runtime/helpers/Arrayincludes");
var t = require("../../../common/vendor.js"),
  a = require("../../../common/assets.js");
Array || t.resolveComponent("Countdown")();
var e = t._export_sfc({
  components: {
    Countdown: function() {
      return "../../countdown/countdown-diySeckill.js"
    }
  },
  data: function() {
    return {
      countdownConfig: {
        startstamp: 0,
        endstamp: 0,
        title: " ",
        type: "hours"
      }
    }
  },
  computed: {
    borderStyle: function() {
      var t = 2 * this.itemData.style.topRadio + "rpx",
        a = 2 * this.itemData.style.bottomRadio + "rpx";
      return {
        borderTopLeftRadius: t,
        borderTopRightRadius: t,
        borderBottomLeftRadius: a,
        borderBottomRightRadius: a,
        backgroundImage: "linear-gradient(to right, ".concat(this.itemData.style.bgcolor_color1 || "#fff", ", ").concat(this.itemData.style.bgcolor_color2 || "#fff", ")")
      }
    }
  },
  props: ["itemData"],
  created: function() {
    this.countdownConfig.endstamp = this.itemData.data.end_time, this.countdownConfig.startstamp = this.itemData.data.start_time
  },
  methods: {
    scroll: function(t) {},
    gotoList: function() {
      this.gotoPage("/pagesPlus/seckill/list/list")
    },
    gotoDetail: function(t, a) {
      var e = "/pagesPlus/seckill/detail/detail?seckill_product_id=" + t + "&time_id=" + a;
      this.gotoPage(e)
    }
  }
}, [
  ["render", function(e, o, i, r, m, l) {
    return t.e({
      a: i.itemData && i.itemData.style
    }, i.itemData && i.itemData.style ? t.e({
      b: 1 == i.itemData.params.titleType
    }, 1 == i.itemData.params.titleType ? {
      c: t.t(i.itemData.params.title),
      d: i.itemData.style.titleColor,
      e: 2 * i.itemData.style.titleSize + "rpx",
      f: 1 == i.itemData.style.titleWeight ? "bold" : "",
      g: 2 == i.itemData.style.titleWeight ? "italic" : ""
    } : {}, {
      h: 2 == i.itemData.params.titleType
    }, 2 == i.itemData.params.titleType ? {
      i: i.itemData.params.titleimage
    } : {}, {
      j: i.itemData.style.color,
      k: t.p({
        back_color: i.itemData.style.title_color1,
        back_colorR: i.itemData.style.title_color2,
        titleF: i.itemData.style.title_color1,
        titleS: i.itemData.style.title_color2,
        number_color: i.itemData.style.number_color,
        config: m.countdownConfig,
        activeName: "noborder"
      }),
      l: t.t(i.itemData.params.more),
      m: i.itemData.style.moreColor,
      n: 2 * i.itemData.style.moreSize + "rpx",
      o: i.itemData.style.moreColor,
      p: 2 * i.itemData.style.moreSize + "rpx",
      q: t.o((function(t) {
        return l.gotoList()
      }), "c6"),
      r: 2 == i.itemData.params.titleBgType ? "linear-gradient(to right, ".concat(i.itemData.style.titleBg_color1 || "#fff", ", ").concat(i.itemData.style.titleBg_color2 || "#fff", ")") : "url(" + i.itemData.params.bgimage + ")",
      s: t.f(2 == i.itemData.params.column ? 2 : 1, (function(e, o, r) {
        return {
          a: t.f(i.itemData.data.product_list, (function(e, r, m) {
            return t.e({
              a: ![2].includes(i.itemData.params.column) || r % 2 === o
            }, [2].includes(i.itemData.params.column) && r % 2 !== o ? {} : t.e({
              b: 2 * i.itemData.style.productTopRadio + "rpx",
              c: 2 * i.itemData.style.productTopRadio + "rpx",
              d: 2 * i.itemData.style.productBottomRadio + "rpx",
              e: 2 * i.itemData.style.productBottomRadio + "rpx",
              f: e.product.file_path,
              g: i.itemData.params.productName
            }, i.itemData.params.productName ? {
              h: t.t(e.product.product_name),
              i: i.itemData.style.nameWeight ? 1 : "",
              j: i.itemData.style.productName_color,
              k: t.n(1 == i.itemData.params.column ? "text-ellipsis-2" : "text-ellipsis")
            } : {}, {
              l: i.itemData.params.productSales
            }, i.itemData.params.productSales ? {
              m: e.sale_rate,
              n: "linear-gradient(to right, " + (i.itemData.style.productSlider_color1 || "#fff") + ", " + (i.itemData.style.productSlider_color2 || "#fff") + ")",
              o: "linear-gradient(to right, " + (i.itemData.style.productSlider_color1 || "#fff") + ", " + (i.itemData.style.productSlider_color2 || "#fff") + ")",
              p: t.t(e.sale_rate),
              q: i.itemData.style.productSlider_color
            } : {}, {
              r: i.itemData.params.productPrice
            }, i.itemData.params.productPrice ? t.e({
              s: 3 == i.itemData.params.column
            }, 3 == i.itemData.params.column ? {
              t: a._imports_0$21
            } : {}, {
              v: 4 == i.itemData.params.column && 1 == i.itemData.params.product_btn
            }, 4 == i.itemData.params.column && 1 == i.itemData.params.product_btn ? {
              w: i.itemData.style.btn_text_color,
              x: "linear-gradient(to right, " + (i.itemData.style.productBtn_color1 || "#fff") + ", " + (i.itemData.style.productBtn_color2 || "#fff") + ")"
            } : {}, {
              y: t.t(e.seckill_price),
              z: i.itemData.style.productPrice_color,
              A: 3 == i.itemData.params.column ? "linear-gradient(to right, " + (i.itemData.style.productBtn_color1 || "#fff") + ", " + (i.itemData.style.productBtn_color2 || "#fff") + ")" : ""
            }) : {}, {
              B: i.itemData.params.linePrice
            }, i.itemData.params.linePrice ? {
              C: t.t(e.product_price),
              D: i.itemData.style.productLine_color,
              E: 3 == i.itemData.params.column || 4 == i.itemData.params.column ? "center" : ""
            } : {}, {
              F: 1 == i.itemData.params.product_btn ? 1 : "",
              G: 1 == i.itemData.params.product_btn && (1 == i.itemData.params.column || 2 == i.itemData.params.column)
            }, 1 != i.itemData.params.product_btn || 1 != i.itemData.params.column && 2 != i.itemData.params.column ? {} : {
              H: i.itemData.style.btn_text_color,
              I: "linear-gradient(to right, " + (i.itemData.style.productBtn_color1 || "#fff") + ", " + (i.itemData.style.productBtn_color2 || "#fff") + ")"
            }, {
              J: t.o((function(t) {
                return l.gotoDetail(e.seckill_product_id, i.itemData.data.id)
              }), r)
            }), {
              K: r
            })
          })),
          b: o
        }
      })),
      t: t.n("column__".concat(i.itemData.params.column)),
      v: t.n("column__".concat(i.itemData.params.column)),
      w: t.s(l.borderStyle),
      x: 2 * i.itemData.style.paddingLeft + "rpx",
      y: 2 * i.itemData.style.paddingLeft + "rpx",
      z: 2 * i.itemData.style.paddingTop + "rpx",
      A: 2 * i.itemData.style.paddingBottom + "rpx",
      B: 2 * i.itemData.style.marginTop + "rpx",
      C: i.itemData.style.background
    }) : {})
  }],
  ["__scopeId", "data-v-6af3723c"]
]);
wx.createComponent(e);