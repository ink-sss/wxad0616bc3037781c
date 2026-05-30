var t = require("../../@babel/runtime/helpers/defineProperty"),
  e = require("../../common/vendor.js"),
  i = require("../../common/throttle.js"),
  o = {
    components: {
      spec: function() {
        return "./detail/popup/spec.js"
      },
      categoryMaskVue: function() {
        return "./categoryMask.js"
      }
    },
    data: function() {
      return {
        loading: !0,
        searchName: "搜索商品",
        show_type: 3,
        style: 1,
        phoneHeight: 0,
        scrollviewHigh: 0,
        listData: [],
        childlist: [],
        select_index: 0,
        catename: "全部商品",
        productlist: [],
        page: 1,
        category_id: 0,
        tableData: [],
        isLogin: !1,
        shoppingNum: 0,
        shoppingPrice: null,
        productModel: {},
        isPopup: !1,
        specData: null,
        detail: null,
        isDomHeight: !0,
        shoppingHeight: 0,
        searchHeight: 0,
        footerHeight: 0,
        productArr: [],
        url: "",
        platFormType: "",
        osName: "",
        openPopCate: !1
      }
    },
    onReady: function() {
      e.index.hideTabBar()
    },
    onLoad: function() {
      var t = e.index.getSystemInfoSync().uniPlatform,
        i = "";
      e.index.getSystemInfo({
        success: function(t) {
          i = t.osName
        }
      }), this.osName = i, this.platFormType = t
    },
    mounted: function() {
      this.init()
    },
    onShow: function() {
      this.productlist = [], this.no_more = !1, this.page = 1, this.select_index = 0, this.getData()
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.productlist.length && this.no_more ? 2 : 0
      }
    },
    onShareAppMessage: function() {
      return {
        title: this.templet.share_title,
        path: "/pages/product/category?" + this.getShareUrlParams()
      }
    },
    methods: {
      lookProduct: function() {
        this.$refs.categoryMaskRef.open()
      },
      isBuyFast: function() {
        if (this.isLogin && (this.isLogin && 10 == this.show_type && 4 == this.style || 20 == this.show_type && 3 == this.style)) {
          var t = this.phoneHeight - this.searchHeight - this.shoppingHeight;
          return this.scrollviewHigh = t - this.footerHeight, !0
        }
        return this.scrollviewHigh = this.phoneHeight - this.searchHeight - this.footerHeight, !1
      },
      showTwo: function() {
        return 20 == this.show_type && (2 == this.style || 3 == this.style) || 10 == this.show_type && 2 == this.style
      },
      init: function() {
        var t = this;
        e.index.getSystemInfo({
          success: function(i) {
            t.phoneHeight = i.windowHeight, e.index.createSelectorQuery().select("#searchBox").boundingClientRect((function(e) {
              t.searchHeight = e.height || 0
            })).exec();
            var o = e.index.createSelectorQuery().select("#footBottom");
            o && o.boundingClientRect((function(e) {
              e && e.height && (t.footerHeight = e.height)
            })).exec(), t.isDomHeight = !1
          }
        })
      },
      hasImages: function(t) {
        return null != t.images && null != t.images.file_path ? t.images.file_path : ""
      },
      getData: function() {
        var t = this;
        t.loading = !0, t._get("product.category/index", {}, (function(e) {
          t.show_type = e.data.template.category_style, t.style = e.data.template.wind_style, t.listData = e.data.list, t.listData && t.listData.length > 0 && (t.listData[0].child && 20 == t.show_type ? (t.category_id = t.listData[0].child[0].category_id, t.childlist = t.listData[0].child) : t.category_id = t.listData[0].category_id), 2 == t.style ? t.getProduct() : (10 == t.show_type && 4 == t.style || 20 == t.show_type && 3 == t.style) && (t.getProduct(), t.getShoppingNum()), t.background = e.data.background, t.loading = !1
        }))
      },
      changeCategory: function(t) {
        this.category_id = t, this.productlist = [], this.page = 1, this.no_more = !1, this.openPopCate = !1, this.getProduct()
      },
      getCheckedIds: function() {
        var t = [];
        return this.productArr.forEach((function(e) {
          t.push("".concat(e.cart_id))
        })), t
      },
      Submit: function() {
        var t = this.getCheckedIds();
        if (0 == t.length) return e.index.showToast({
          title: "请选择商品",
          icon: "none"
        }), !1;
        this.gotoPage("/pages/order/confirm-order?order_type=cart&cart_ids=" + t)
      },
      getShoppingNum: function() {
        var t = this;
        t._post("product.Category/lists", {}, (function(e) {
          var i = e.data.productList;
          if (t.isLogin = !1, i) {
            t.isLogin = !0, t.tableData = i;
            var o = 0,
              s = 0,
              a = [];
            i && i.length > 0 && i.forEach((function(t) {
              t.productList && t.productList.length > 0 && t.productList.forEach((function(t) {
                a.push(t), o += t.total_num, s += parseFloat(t.total_num) * parseFloat(t.product_price)
              }))
            })), t.productArr = a, t.shoppingNum = o, t.shoppingPrice = s.toFixed(2)
          }
        }), (function(e) {
          t.productlist = [], t.no_more = !1, t.page = 1, t.getData()
        }))
      },
      addShopping: function(t) {
        20 == t.spec_type ? this.getSpecData(t.product_id) : this.addSingleSpec(t.product_id)
      },
      addSingleSpec: function(t) {
        var e = this;
        e._post("order.cart/add", {
          product_id: t,
          total_num: 1,
          spec_sku_id: 0
        }, (function(t) {
          e.getShoppingNum()
        }))
      },
      scrolltolowerFunc: function() {
        var t = this;
        console.log(1), t.no_more || (t.page++, t.page <= t.last_page ? t.getProduct() : t.no_more = !0)
      },
      getSpecData: function(t) {
        var i = this;
        i._get("product.product/detail", {
          product_id: t,
          url: i.url,
          visitcode: i.getVisitcode()
        }, (function(t) {
          t.data.specData ? (i.isPopup = !1, i.detail = t.data.detail, i.specData = t.data.specData, i.initSpecData(t.data.specData)) : e.index.showToast({
            title: "暂无规格，请于后台添加!",
            mask: !1,
            duration: 1500,
            icon: "none"
          })
        }))
      },
      initMaskPopup: function() {
        var e, i = {
          specData: this.specData,
          detail: this.detail,
          productSpecArr: null != this.specData ? new Array(this.specData.spec_attr.length) : [],
          show_sku: (e = {
            sku_image: "",
            price: 0,
            product_sku_id: 0,
            line_price: 0,
            stock: 0
          }, t(e, "product_sku_id", 0), t(e, "sum", 1), e),
          plus_sku: null,
          type: "card",
          plus_name: ""
        };
        this.productModel = i, this.isPopup = !0
      },
      initSpecData: function(t) {
        for (var e in t.spec_attr)
          for (var i in t.spec_attr[e].spec_items) t.spec_attr[e].spec_items[i].checked = !1;
        this.specData = t, this.initMaskPopup()
      },
      closePopup: function() {
        this.isPopup = !1, this.getShoppingNum()
      },
      getProduct: function() {
        var t = this,
          e = t.page,
          i = t.category_id;
        t.sortType, t.sortPrice, t.loading = !0, t._get("product.product/lists", {
          page: e || 1,
          category_id: i,
          search: "",
          sortType: "",
          sortPrice: "",
          list_rows: 20
        }, (function(e) {
          t.loading = !1, t.productlist = t.productlist.concat(e.data.list.data), t.last_page = e.data.list.last_page, e.data.list.last_page <= 1 && (t.no_more = !0)
        }))
      },
      selectCategory: function(t) {
        var e = this;
        i.throttle((function() {
          10 == e.show_type ? (e.select_index = t, e.catename = e.listData[e.select_index].name, e.changeCategory(e.listData[e.select_index].category_id)) : e.listData[t].child ? (e.childlist = e.listData[t].child, e.select_index = t, e.catename = e.listData[e.select_index].name, e.changeCategory(e.childlist[0].category_id)) : (e.select_index = t, e.childlist = [], e.catename = e.listData[e.select_index].name, e.changeCategory(e.listData[e.select_index].category_id))
        }))
      },
      hasSelect: function() {},
      gotoList: function(t) {
        var e = t;
        this.gotoPage("/pages/product/list/list?category_id=" + e + "&sortType=all&search=&sortPrice=0")
      },
      wxGetUserInfo: function(t) {
        if (!t.detail.iv) return e.index.showToast({
          title: "您取消了授权,登录失败",
          icon: "none"
        }), !1
      },
      gotoSearch: function() {
        this.gotoPage("/pages/product/search/search")
      }
    }
  };
Array || (e.resolveComponent("categoryMaskVue") + e.resolveComponent("tabBar") + e.resolveComponent("spec"))();
var s = e._export_sfc(o, [
  ["render", function(t, i, o, s, a, n) {
    return e.e({
      a: e.t(a.searchName),
      b: e.o((function() {
        return n.gotoSearch && n.gotoSearch.apply(n, arguments)
      }), "b6"),
      c: e.s(0 == t.topBarHeight() ? "" : "height:" + t.topBarHeight() + "px;padding-top:" + t.topBarTop() + "px"),
      d: 10 == a.show_type && 3 == a.style
    }, 10 == a.show_type && 3 == a.style ? {
      e: e.f(a.listData, (function(t, i, o) {
        return {
          a: n.hasImages(t),
          b: e.t(t.name),
          c: i,
          d: e.o((function(e) {
            return n.gotoList(t.category_id)
          }), i)
        }
      })),
      f: e.s("height:" + a.scrollviewHigh + "px;")
    } : {}, {
      g: 20 == a.show_type && (1 == a.style || 2 == a.style || 3 == a.style) || 10 == a.show_type && (1 == a.style || 2 == a.style || 4 == a.style)
    }, 20 == a.show_type && (1 == a.style || 2 == a.style || 3 == a.style) || 10 == a.show_type && (1 == a.style || 2 == a.style || 4 == a.style) ? e.e({
      h: n.showTwo()
    }, n.showTwo() ? {
      i: e.f(a.listData, (function(t, i, o) {
        return {
          a: e.t(t.name),
          b: e.n(a.select_index == i ? "item active" : "item"),
          c: i,
          d: e.o((function(t) {
            return n.selectCategory(i)
          }), i)
        }
      })),
      j: e.s("height:" + a.scrollviewHigh + "px;")
    } : {}, {
      k: 1 == a.style && 20 == a.show_type || 4 == a.style && 10 == a.show_type
    }, 1 == a.style && 20 == a.show_type || 4 == a.style && 10 == a.show_type ? {
      l: e.f(a.listData, (function(t, i, o) {
        return {
          a: e.t(t.name),
          b: e.n(a.select_index == i ? "item active" : "item"),
          c: i,
          d: e.o((function(t) {
            return n.selectCategory(i)
          }), i)
        }
      })),
      m: e.s("height:" + a.scrollviewHigh + "px;")
    } : {}, {
      n: 1 == a.style && 20 == a.show_type
    }, 1 == a.style && 20 == a.show_type ? {
      o: e.f(a.childlist, (function(t, i, o) {
        return {
          a: n.hasImages(t),
          b: e.t(t.name),
          c: i,
          d: e.o((function(e) {
            return n.gotoList(t.category_id)
          }), i)
        }
      })),
      p: e.s("height:" + a.scrollviewHigh + "px;")
    } : {}, {
      q: 1 == a.style && 10 == a.show_type
    }, 1 == a.style && 10 == a.show_type ? {
      r: e.f(a.listData, (function(t, i, o) {
        return {
          a: n.hasImages(t),
          b: e.t(t.name),
          c: i,
          d: e.o((function(e) {
            return n.gotoList(t.category_id)
          }), i)
        }
      })),
      s: e.s("height:" + a.scrollviewHigh + "px;")
    } : {}, {
      t: 2 == a.style || 3 == a.style || 4 == a.style
    }, 2 == a.style || 3 == a.style || 4 == a.style ? e.e({
      v: 20 == a.show_type && (2 == a.style || 3 == a.style)
    }, 20 != a.show_type || 2 != a.style && 3 != a.style ? {} : {
      w: e.f(a.childlist, (function(t, i, o) {
        return {
          a: e.t(t.name),
          b: e.o((function(e) {
            return n.changeCategory(t.category_id)
          }), i),
          c: t.category_id == a.category_id ? 1 : "",
          d: i
        }
      }))
    }, {
      x: e.f(a.productlist, (function(i, o, s) {
        return e.e({
          a: i.product_stock <= 0
        }, (i.product_stock, {}), {
          b: i.product_image,
          c: e.t(i.product_name),
          d: e.t(i.product_min_price),
          e: a.shoppingPrice && 1 != i.isActivity && n.isBuyFast() && 1 != i.is_virtual && "" == i.custom_form
        }, a.shoppingPrice && 1 != i.isActivity && n.isBuyFast() && 1 != i.is_virtual && "" == i.custom_form ? {
          f: e.o((function(t) {
            return n.addShopping(i)
          }), o)
        } : {}, {
          g: e.o((function(e) {
            return t.gotoPage("/pages/product/detail/detail?product_id=" + i.product_id)
          }), o),
          h: o
        })
      })),
      y: e.o((function() {
        return n.scrolltolowerFunc && n.scrolltolowerFunc.apply(n, arguments)
      }), "26"),
      z: e.s("height:" + a.scrollviewHigh + "px;")
    }) : {}) : {}, {
      A: e.sr("categoryMaskRef", "bdcd1b6a-0"),
      B: e.o(n.getShoppingNum, "5e"),
      C: e.p({
        dataList: a.productArr
      }),
      D: n.isBuyFast()
    }, n.isBuyFast() ? e.e({
      E: a.shoppingNum && 0 != a.shoppingNum
    }, a.shoppingNum && 0 != a.shoppingNum ? {
      F: e.t(a.shoppingNum)
    } : {}, {
      G: e.o((function() {
        return n.lookProduct && n.lookProduct.apply(n, arguments)
      }), "23"),
      H: e.t(a.shoppingPrice),
      I: e.o((function() {
        return n.Submit && n.Submit.apply(n, arguments)
      }), "aa")
    }) : {}, {
      J: a.isDomHeight && "android" != a.osName
    }, (a.isDomHeight && a.osName, {}), {
      K: e.p({
        isScroll: !0
      }),
      L: e.o(n.closePopup, "dd"),
      M: e.p({
        isPopup: a.isPopup,
        isCategory: !0,
        productModel: a.productModel
      }),
      N: a.openPopCate
    }, a.openPopCate ? {
      O: e.s("height:" + a.searchHeight + "px;"),
      P: e.f(a.childlist, (function(t, i, o) {
        return {
          a: e.t(t.name),
          b: e.o((function(e) {
            return n.changeCategory(t.category_id)
          }), i),
          c: t.category_id == a.category_id ? 1 : "",
          d: i
        }
      })),
      Q: e.o((function(t) {
        return a.openPopCate = !1
      }), "07")
    } : {}, {
      R: t.theme(),
      S: e.n(t.theme() || "")
    })
  }]
]);
o.__runtimeHooks = 2, wx.createPage(s);