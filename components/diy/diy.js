var e = require("../../common/vendor.js");
Array || (e.resolveComponent("options") + e.resolveComponent("topMerge") + e.resolveComponent("search") + e.resolveComponent("surface") + e.resolveComponent("banner") + e.resolveComponent("imagesingle") + e.resolveComponent("windows") + e.resolveComponent("videos") + e.resolveComponent("articles") + e.resolveComponent("special") + e.resolveComponent("notice") + e.resolveComponent("titles") + e.resolveComponent("navBar") + e.resolveComponent("product") + e.resolveComponent("coupon") + e.resolveComponent("service") + e.resolveComponent("shipinLiveIndex") + e.resolveComponent("richText") + e.resolveComponent("blank") + e.resolveComponent("guide") + e.resolveComponent("seckillProduct") + e.resolveComponent("previewProduct") + e.resolveComponent("assembleProduct") + e.resolveComponent("bargainProduct") + e.resolveComponent("live") + e.resolveComponent("userBase") + e.resolveComponent("store") + e.resolveComponent("order") + e.resolveComponent("uni-load-more"))(), Math;
var t = e._export_sfc({
  components: {
    search: function() {
      return "./search/search.js"
    },
    uniLoadMore: function() {
      return "../uni-load-more.js"
    },
    banner: function() {
      return "./banner/banner.js"
    },
    imagesingle: function() {
      return "./imagesingle/imagesingle.js"
    },
    shipinLiveIndex: function() {
      return "./shipinLive/shipinLive.js"
    },
    windows: function() {
      return "./window/window.js"
    },
    videos: function() {
      return "./videos/videos.js"
    },
    articles: function() {
      return "./article/article.js"
    },
    special: function() {
      return "./special/special.js"
    },
    notice: function() {
      return "./notice/notice.js"
    },
    titles: function() {
      return "./title/title.js"
    },
    coupon: function() {
      return "./coupon/coupon.js"
    },
    richText: function() {
      return "./richText/richText.js"
    },
    navBar: function() {
      return "./navBar/navBar.js"
    },
    store: function() {
      return "./store/store.js"
    },
    service: function() {
      return "./service/service.js"
    },
    blank: function() {
      return "./blank/blank.js"
    },
    guide: function() {
      return "./guide/guide.js"
    },
    product: function() {
      return "./product/product.js"
    },
    seckillProduct: function() {
      return "./seckillProduct/seckillProduct.js"
    },
    assembleProduct: function() {
      return "./assembleProduct/assembleProduct.js"
    },
    bargainProduct: function() {
      return "./bargainProduct/bargainProduct.js"
    },
    previewProduct: function() {
      return "./previewProduct/previewProduct.js"
    },
    userBase: function() {
      return "./base/base.js"
    },
    order: function() {
      return "./order/order.js"
    },
    live: function() {
      return "./live/live.js"
    },
    options: function() {
      return "./option/option.js"
    },
    topMerge: function() {
      return "./topMerge/topMerge.js"
    },
    surface: function() {
      return "./surface/surface.js"
    }
  },
  data: function() {
    return {
      thisindex: 0,
      category_id: "",
      listData: [],
      page: 1,
      last_page: 0,
      no_more: !1,
      loading: !0
    }
  },
  props: ["diyItems", "userInfo", "serviceUserId", "diytop", "storeInfo"],
  computed: {
    loadingType: function() {
      return this.loading ? 1 : 0 != this.listData.length && this.no_more ? 2 : 0
    },
    scrolltop: function() {
      var e = 80 - 2 * this.diytop;
      return e <= 0 ? 0 : e
    }
  },
  created: function() {},
  methods: {
    scanQrcode: function() {
      this.$emit("scanQrcode")
    },
    loadinData: function() {
      var e = this;
      this.$nextTick((function() {
        e.$refs.shipinLiveRef && e.$refs.shipinLiveRef[0] && e.$refs.shipinLiveRef[0].getData()
      }))
    },
    parentFunc: function(e) {
      this.$emit(e.name, e.value)
    },
    setIndex: function(e, t) {
      this.thisindex = e, "" == t && 0 !== this.category_id ? (this.category_id = 0, this.initProduct()) : this.category_id != t && (this.category_id = t || 0, this.initProduct())
    },
    getProduct: function() {
      var e = this,
        t = e.page;
      e.loading = !0, e._get("product.product/lists", {
        page: t || 1,
        category_id: e.category_id,
        search: "",
        sortType: "all",
        sortPrice: 0,
        list_rows: 20
      }, (function(n) {
        e.loading = !1, e.$emit("stopPush"), e.listData = e.listData.concat(n.data.list.data), e.last_page = n.data.list.last_page, n.data.list.last_page <= 1 && (e.no_more = !0), t >= 9 && (e.no_more = !0)
      }))
    },
    pullDown: function() {
      0 != this.thisindex ? this.initProduct() : this.$emit("getData")
    },
    initProduct: function() {
      0 != this.thisindex && (this.listData = [], this.page = 1, this.no_more = !1, this.getProduct())
    },
    scrolltolowerFunc: function() {
      0 != this.thisindex && (this.page < this.last_page && (this.page++, this.getProduct()), this.no_more = !0)
    },
    bg: function(e) {
      this.$emit("bg", e)
    }
  }
}, [
  ["render", function(t, n, o, i, a, r) {
    return e.e({
      a: e.f(o.diyItems, (function(t, n, i) {
        return e.e({
          a: "option" == t.type
        }, "option" == t.type ? {
          b: e.o(r.setIndex, n),
          c: "308cf962-0-" + i,
          d: e.p({
            itemData: t
          })
        } : {}, {
          e: "topMerge" == t.type
        }, "topMerge" == t.type ? {
          f: e.o(r.parentFunc, n),
          g: e.o(r.setIndex, n),
          h: "308cf962-1-" + i,
          i: e.p({
            itemData: t,
            diytop: o.diytop
          })
        } : {}, {
          j: "search" === t.type
        }, "search" === t.type ? {
          k: "308cf962-2-" + i,
          l: e.p({
            itemData: t,
            diytop: o.diytop
          })
        } : {}, {
          m: "surface" == t.type
        }, "surface" == t.type ? {
          n: "308cf962-3-" + i,
          o: e.p({
            itemData: t,
            diytop: o.diytop
          })
        } : {}, {
          p: n
        })
      })),
      b: 0 == a.thisindex
    }, 0 == a.thisindex ? {
      c: e.f(o.diyItems, (function(t, n, i) {
        return e.e({
          a: "banner" === t.type && null != t.data
        }, "banner" === t.type && null != t.data ? {
          b: "308cf962-4-" + i,
          c: e.p({
            itemData: t
          })
        } : {}, {
          d: "imageSingle" === t.type && null != t.data
        }, "imageSingle" === t.type && null != t.data ? {
          e: "308cf962-5-" + i,
          f: e.p({
            itemData: t
          })
        } : {}, {
          g: "window" == t.type && null != t.data
        }, "window" == t.type && null != t.data ? {
          h: "308cf962-6-" + i,
          i: e.p({
            itemData: t
          })
        } : {}, {
          j: "video" == t.type
        }, "video" == t.type ? {
          k: "308cf962-7-" + i,
          l: e.p({
            itemData: t
          })
        } : {}, {
          m: "article" == t.type && null != t.data
        }, "article" == t.type && null != t.data ? {
          n: "308cf962-8-" + i,
          o: e.p({
            itemData: t
          })
        } : {}, {
          p: "special" == t.type && null != t.data
        }, "special" == t.type && null != t.data ? {
          q: "308cf962-9-" + i,
          r: e.p({
            itemData: t
          })
        } : {}, {
          s: "notice" == t.type
        }, "notice" == t.type ? {
          t: "308cf962-10-" + i,
          v: e.p({
            itemData: t
          })
        } : {}, {
          w: "title" == t.type
        }, "title" == t.type ? {
          x: "308cf962-11-" + i,
          y: e.p({
            itemData: t
          })
        } : {}, {
          z: "navBar" === t.type && null != t.data
        }, "navBar" === t.type && null != t.data ? {
          A: "308cf962-12-" + i,
          B: e.p({
            itemData: t
          })
        } : {}, {
          C: "product" === t.type && null != t.data
        }, "product" === t.type && null != t.data ? {
          D: "308cf962-13-" + i,
          E: e.p({
            itemData: t
          })
        } : {}, {
          F: "coupon" === t.type && null != t.data
        }, "coupon" === t.type && null != t.data ? {
          G: "308cf962-14-" + i,
          H: e.p({
            itemData: t
          })
        } : {}, {
          I: "service" == t.type
        }, "service" == t.type ? {
          J: "308cf962-15-" + i,
          K: e.p({
            itemData: t
          })
        } : {}, {
          L: "videoLive" == t.type
        }, "videoLive" == t.type ? {
          M: e.sr("shipinLiveRef", "308cf962-16-" + i, {
            f: 1
          }),
          N: "308cf962-16-" + i,
          O: e.p({
            itemData: t
          })
        } : {}, {
          P: "richText" === t.type
        }, "richText" === t.type ? {
          Q: "308cf962-17-" + i,
          R: e.p({
            itemData: t
          })
        } : {}, {
          S: "blank" == t.type
        }, "blank" == t.type ? {
          T: "308cf962-18-" + i,
          U: e.p({
            itemData: t
          })
        } : {}, {
          V: "guide" == t.type
        }, "guide" == t.type ? {
          W: "308cf962-19-" + i,
          X: e.p({
            itemData: t
          })
        } : {}, {
          Y: "seckillProduct" == t.type && null != t.data
        }, "seckillProduct" == t.type && null != t.data ? {
          Z: "308cf962-20-" + i,
          aa: e.p({
            itemData: t
          })
        } : {}, {
          ab: "previewProduct" == t.type && null != t.data
        }, "previewProduct" == t.type && null != t.data ? {
          ac: "308cf962-21-" + i,
          ad: e.p({
            itemData: t
          })
        } : {}, {
          ae: "assembleProduct" == t.type && null != t.data
        }, "assembleProduct" == t.type && null != t.data ? {
          af: "308cf962-22-" + i,
          ag: e.p({
            itemData: t
          })
        } : {}, {
          ah: "bargainProduct" == t.type && null != t.data
        }, "bargainProduct" == t.type && null != t.data ? {
          ai: "308cf962-23-" + i,
          aj: e.p({
            itemData: t
          })
        } : {}, {
          ak: "live" == t.type && null != t.data
        }, "live" == t.type && null != t.data ? {
          al: "308cf962-24-" + i,
          am: e.p({
            itemData: t
          })
        } : {}, {
          an: "base" === t.type
        }, "base" === t.type ? {
          ao: e.o(r.scanQrcode, n),
          ap: e.o(r.bg, n),
          aq: "308cf962-25-" + i,
          ar: e.p({
            itemData: t,
            userInfo: o.userInfo
          })
        } : {}, {
          as: "base" === t.type && o.storeInfo
        }, "base" === t.type && o.storeInfo ? {
          at: "308cf962-26-" + i,
          av: e.p({
            itemData: t,
            storeInfo: o.storeInfo
          })
        } : {}, {
          aw: "order" === t.type
        }, "order" === t.type ? {
          ax: "308cf962-27-" + i,
          ay: e.p({
            itemData: t,
            userInfo: o.userInfo
          })
        } : {}, {
          az: n
        })
      }))
    } : {}, {
      d: 0 != a.thisindex
    }, 0 != a.thisindex ? e.e({
      e: e.f(a.listData, (function(n, o, i) {
        return e.e({
          a: n.product_image,
          b: e.t(n.product_name),
          c: e.t(n.product_sku.product_price),
          d: n.product_sku && n.product_sku.line_price > 0
        }, n.product_sku && n.product_sku.line_price > 0 ? {
          e: e.t(n.product_sku.line_price)
        } : {}, {
          f: o,
          g: e.n(o % 2 == 1 ? "product_item_right" : ""),
          h: e.o((function(e) {
            return t.gotoPage("/pages/product/detail/detail?product_id=" + n.product_id)
          }), o)
        })
      })),
      f: 0 == a.listData.length && !a.loading
    }, 0 != a.listData.length || a.loading ? {
      g: e.p({
        loadingType: r.loadingType
      })
    } : {}) : {})
  }]
]);
wx.createComponent(t);