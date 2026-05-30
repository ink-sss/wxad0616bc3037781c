var t = require("../../../common/vendor.js"),
  e = t._export_sfc({
    components: {
      Countdown: function() {
        return "../../countdown/countdown-act.js"
      }
    },
    data: function() {
      return {
        countdownConfig: {
          startstamp: 0,
          endstamp: 0,
          title: " "
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
        this.gotoPage("/pagesPlus/preview/list")
      },
      gotoDetail: function(t) {
        var e = "/pages/product/detail/detail?product_id=" + t;
        this.gotoPage(e)
      }
    }
  }, [
    ["render", function(e, a, i, o, r, m) {
      return t.e({
        a: i.itemData.data.length > 0
      }, i.itemData.data.length > 0 ? t.e({
        b: 1 == i.itemData.style.titleType
      }, 1 == i.itemData.style.titleType ? {
        c: t.t(i.itemData.params.title),
        d: i.itemData.style.titleColor,
        e: 2 * i.itemData.style.titleSize + "rpx"
      } : {}, {
        f: 2 == i.itemData.style.titleType
      }, 2 == i.itemData.style.titleType ? {
        g: i.itemData.style.title_image
      } : {}, {
        h: t.t(i.itemData.params.more),
        i: i.itemData.style.moreColor,
        j: t.o((function() {
          return m.gotoList && m.gotoList.apply(m, arguments)
        }), "2f"),
        k: i.itemData.style.moreColor,
        l: 2 * i.itemData.style.moreSize + "rpx",
        m: i.itemData.style.bgimage ? "url(" + i.itemData.style.bgimage + ")" : "",
        n: t.f(i.itemData.data, (function(e, a, o) {
          return t.e({
            a: e.product_image
          }, 1 == i.itemData.style.product_tag ? {
            b: i.itemData.style.tagColor,
            c: i.itemData.style.bgTag
          } : {}, 1 == i.itemData.style.product_name ? {
            d: t.t(e.product_name),
            e: i.itemData.style.productName_color
          } : {}, 1 == i.itemData.style.product_price ? {
            f: t.t(e.product_price),
            g: i.itemData.style.productPrice_color
          } : {}, 1 == i.itemData.style.product_lineprice ? {
            h: t.t(e.line_price),
            i: i.itemData.style.productLine_color
          } : {}, {
            j: t.o((function(t) {
              return m.gotoDetail(e.product_id)
            }), a),
            k: a
          })
        })),
        o: 2 * i.itemData.style.product_imgRadio + "rpx",
        p: 1 == i.itemData.style.product_tag,
        q: 1 == i.itemData.style.product_name,
        r: 1 == i.itemData.style.product_price,
        s: 1 == i.itemData.style.product_lineprice,
        t: i.itemData.style.productBg_color,
        v: 2 * i.itemData.style.product_bottomRadio + "rpx",
        w: 2 * i.itemData.style.product_bottomRadio + "rpx",
        x: 2 * i.itemData.style.product_topRadio + "rpx",
        y: 2 * i.itemData.style.product_topRadio + "rpx",
        z: i.itemData.style.background,
        A: 2 * i.itemData.style.topRadio + "rpx",
        B: 2 * i.itemData.style.topRadio + "rpx",
        C: 2 * i.itemData.style.bottomRadio + "rpx",
        D: 2 * i.itemData.style.bottomRadio + "rpx",
        E: i.itemData.style.bgcolor,
        F: 2 * i.itemData.style.paddingLeft + "rpx",
        G: 2 * i.itemData.style.paddingLeft + "rpx",
        H: 2 * i.itemData.style.paddingTop + "rpx",
        I: 2 * i.itemData.style.paddingBottom + "rpx"
      }) : {})
    }],
    ["__scopeId", "data-v-db8cb64d"]
  ]);
wx.createComponent(e);