var e = require("../../@babel/runtime/helpers/toConsumableArray"),
  t = require("../../@babel/runtime/helpers/defineProperty"),
  i = require("../../common/vendor.js");
require("../../env/config.js");
var o = require("../../common/assets.js"),
  a = {
    components: {
      uniLoadMore: function() {
        return "../../components/uni-load-more.js"
      }
    },
    data: function() {
      return {
        isLieBiao: !0,
        shop_info: "",
        product_list: "",
        dataList: "",
        shop_supplier_id: "",
        isfollow: "",
        indicatorDots: !1,
        autoplay: !0,
        interval: 5e3,
        duration: 1e3,
        listData: [],
        topRefresh: !1,
        loading: !0,
        no_more: !1,
        type_active: "all",
        price_top: !1,
        shopData: [],
        page: 1,
        search: "",
        last_page: 0,
        scrollviewHigh: 0,
        topheight: 0,
        nav_type: 0,
        is_open: 0,
        is_record: 0,
        liveList: [],
        dataModel: {
          qq: "",
          wechat: "",
          phone: ""
        },
        service_type: 0,
        service_open: 0,
        statusBarHeight: 0,
        titleBarHeight: 0,
        category_id: 0,
        sortPrice: 0,
        adList: "",
        swiperCurrent: 0
      }
    },
    computed: {
      loadingType: function() {
        return this.loading ? 1 : 0 != this.product_list.length && this.no_more ? 2 : 0
      }
    },
    onLoad: function(e) {
      this.GetStatusBarHeight(), this.shop_supplier_id = e.shop_supplier_id
    },
    onShow: function() {
      this.getData()
    },
    mounted: function() {
      this.getProduct(this.type_active)
    },
    onPullDownRefresh: function() {
      this.restoreData(), this.getData(), this.getProduct(this.type_active)
    },
    methods: {
      changeSwiper: function(e) {
        this.swiperCurrent = e.detail.current
      },
      searchFunc: function() {
        this.shopData = [], this.product_list = [], this.page = 1, this.category_id = 0, this.sortType = "", this.sortPrice = 0, this.getProduct(this.type_active)
      },
      getScore: function(e, t) {
        if ((e *= 1) <= 0 || !e) return 0;
        var i = e % 1;
        return 1 == t ? e - i : 2 == t ? 0 == i ? 0 : 1 : void 0
      },
      GetStatusBarHeight: function() {
        i.index.getSystemInfoSync().statusBarHeight, this.statusBarHeight = i.index.getMenuButtonBoundingClientRect().top, this.titleBarHeight = i.index.getMenuButtonBoundingClientRect().height
      },
      init: function() {
        var e = this;
        i.index.getSystemInfo({
          success: function(t) {
            e.phoneHeight = t.windowHeight, i.index.createSelectorQuery().in(e).select(".shop_head").boundingClientRect((function(t) {
              e.topheight = t.height;
              var o = 2 * e.phoneHeight - 2 * t.height - 100;
              e.scrollviewHigh = o, i.index.hideLoading()
            })).exec()
          }
        })
      },
      scrolltolowerFunc: function() {
        var e = this;
        if (e.bottomRefresh = !0, e.page++, e.loading = !0, e.page > e.last_page) return e.loading = !1, void(e.no_more = !0);
        e.getProduct(e.type_active)
      },
      getProduct: function(i) {
        var o, a = this,
          n = a.page;
        a.loading = !0, a._get("product.product/lists", (t(o = {
          page: n || 1,
          sortType: "price",
          sortPrice: 1
        }, "sortType", i), t(o, "shop_supplier_id", a.shop_supplier_id), t(o, "search", a.search), o), (function(t) {
          a.loading = !1, a.product_list = [].concat(e(a.product_list), e(t.data.list.data)), a.last_page = t.data.list.last_page, t.data.list.last_page <= 1 && (a.no_more = !0)
        }))
      },
      restoreData: function() {
        this.shopData = [], this.product_list = [], this.page = 1, this.category_id = 0, this.search = "", this.sortType = "", this.sortPrice = 0
      },
      getservice: function() {
        var e = this;
        e.isloding = !0, e._get("index/mpService", {
          shop_supplier_id: e.shop_supplier_id
        }, (function(t) {
          e.dataModel = t.data.mp_service, e.isloding = !1
        }))
      },
      tabTypeFunc: function(e) {
        var t = this;
        e != t.type_active && (t.product_list = [], t.page = 1, t.no_more = !1, t.loading = !0, t.type_active = e, t.getProduct(e))
      },
      getData: function() {
        var e = this;
        e.loading = !0, i.index.showLoading({
          title: "加载中...."
        }), e._post("supplier.index/index", {
          shop_supplier_id: e.shop_supplier_id,
          visitcode: e.getVisitcode()
        }, (function(t) {
          e.loading = !1, e.shop_info = t.data.detail, e.adList = t.data.adList, e.isfollow = t.data.detail.isfollow, e.listData = t.data.couponList, e.is_record = t.data.liv_status.is_record, e.is_open = t.data.liv_status.is_open, e.liveList = t.data.liveList.data, e.service_open = t.data.service_open, t.data.mp_service ? e.service_type = t.data.mp_service.service_type : e.service_type = 10, e.scrollviewHigh || e.$nextTick((function() {
            e.init()
          })), i.index.hideLoading(), e.getservice()
        }))
      },
      select_type: function() {
        this.isLieBiao = !this.isLieBiao
      },
      goto_product: function(e) {
        this.gotoPage("/pages/product/detail/detail?product_id=" + e)
      },
      guanzhu: function() {
        var e = this;
        e._post("user.Favorite/add", {
          pid: e.shop_supplier_id,
          type: 10
        }, (function(t) {
          0 == e.isfollow ? e.isfollow = 1 : 1 == e.isfollow && (e.isfollow = 0)
        }))
      },
      receiveCoupon: function(e) {
        var t = this,
          o = t.listData[e];
        if (0 == o.state.value) return i.index.showToast({
          title: "已抢光",
          icon: "none"
        }), !1;
        t._post("user.coupon/receive", {
          coupon_id: o.coupon_id
        }, (function(e) {
          i.index.showToast({
            title: "领取成功",
            icon: "success",
            mask: !0,
            duration: 2e3
          }), o.state.value = 0, o.state.text = "已领取"
        })), t.getData(t.type_active)
      },
      copyQQ: function(e) {
        i.index.setClipboardData({
          data: e,
          success: function(e) {
            i.index.showToast({
              title: "复制成功",
              icon: "success",
              mask: !0,
              duration: 2e3
            })
          }
        })
      },
      callPhone: function(e) {
        i.index.makePhoneCall({
          phoneNumber: e
        })
      },
      toRoom: function(e) {
        if ("" == e.record_url) return !1;
        this.gotoPage("/pagesLive/live/playback?room_id=" + e.room_id)
      },
      toSevice: function() {
        10 == this.service_type || this.shop_info.user_id == i.index.getStorageInfoSync("user_id") ? this.nav_type = 3 : 20 == this.service_type && (0 == this.shop_info.category_id ? i.index.showToast({
          title: "尚未设置客服",
          icon: "none",
          duration: 2e3
        }) : this.getUserId() ? this.shop_info.chat_user_id && 0 != this.shop_info.chat_user_id ? this.gotoPage("/pagesPlus/chat/chat?chat_user_id=" + this.shop_info.chat_user_id + "&shop_supplier_id=" + this.shop_info.shop_supplier_id + "&nickName=" + this.shop_info.store_name) : this.nav_type = 3 : this.doLogin())
      },
      goback: function() {
        i.index.navigateBack({})
      }
    }
  };
Array || i.resolveComponent("uni-load-more")();
var n = i._export_sfc(a, [
  ["render", function(e, t, a, n, r, s) {
    return i.e({
      a: i.s("height:" + r.topheight + "px;"),
      b: r.shop_info.back_image
    }, r.shop_info.back_image ? {
      c: i.s("height:" + r.topheight + "px;"),
      d: r.shop_info.back_image
    } : {}, {
      e: i.s("height:" + e.topBarTop() + "px;"),
      f: i.o((function(t) {
        return e.gotoPage("/pages/index/index")
      }), "d8"),
      g: i.o((function(e) {
        return s.searchFunc()
      }), "dd"),
      h: r.search,
      i: i.o((function(e) {
        return r.search = e.detail.value
      }), "f0"),
      j: i.s("height:" + e.topBarHeight() + "px;;margin-right:" + e.topBarRight() + ";"),
      k: i.s(0 == e.topBarHeight() ? "" : "height:" + e.topBarHeight() + "px;"),
      l: r.shop_info.logos || e.config.pic_url + "/static/shop-default.png",
      m: i.t(r.shop_info.store_name || ""),
      n: i.f(s.getScore(r.shop_info.server_score, 1), (function(e, t, i) {
        return {
          a: t
        }
      })),
      o: o._imports_0$5,
      p: s.getScore(r.shop_info.server_score, 2)
    }, s.getScore(r.shop_info.server_score, 2) ? {
      q: o._imports_1$4
    } : {}, {
      r: i.f(5, (function(e, t, i) {
        return {
          a: t
        }
      })),
      s: o._imports_2$2,
      t: i.t(r.shop_info.server_score || ""),
      v: i.t(r.shop_info.category_name || ""),
      w: i.o((function(t) {
        return e.gotoPage("/pages/shop/shop_detail?shop_supplier_id=" + r.shop_supplier_id)
      }), "fa"),
      x: i.t(r.shop_info.product_sales || "0"),
      y: i.t(r.shop_info.fav_count || "0"),
      z: i.t(r.isfollow ? "已关注" : "+关注"),
      A: i.o((function(e) {
        return s.guanzhu()
      }), "31"),
      B: r.shop_info.back_image ? 1 : "",
      C: r.adList && "" != r.adList
    }, r.adList && "" != r.adList ? {
      D: i.f(r.adList, (function(e, t, i) {
        return {
          a: e.image.file_path,
          b: t
        }
      })),
      E: i.o((function() {
        return s.changeSwiper && s.changeSwiper.apply(s, arguments)
      }), "d4"),
      F: i.f(r.adList, (function(e, t, o) {
        return {
          a: i.n(r.swiperCurrent == t ? "swiper-dot active" : "swiper-dot"),
          b: t
        }
      }))
    } : {}, {
      G: 0 == r.nav_type
    }, 0 == r.nav_type ? {
      H: i.n("all" == r.type_active ? "item active" : "item"),
      I: i.o((function(e) {
        return s.tabTypeFunc("all")
      }), "61"),
      J: i.n("sales" == r.type_active ? "item active" : "item"),
      K: i.o((function(e) {
        return s.tabTypeFunc("sales")
      }), "ef"),
      L: i.n("price" == r.type_active ? "item active" : "item"),
      M: i.o((function(e) {
        return s.tabTypeFunc("price")
      }), "28"),
      N: e.config.pic_url + (1 == r.isLieBiao ? "/202604061216345ffa53811.png" : "/20260406121801e30e33517.png"),
      O: i.o((function(e) {
        return s.select_type()
      }), "be")
    } : {}, {
      P: 0 == r.nav_type
    }, 0 == r.nav_type ? {
      Q: i.f(r.product_list, (function(e, t, o) {
        return i.e({
          a: e.product_stock <= 0
        }, (e.product_stock, {}), {
          b: e.product_image,
          c: i.t(e.product_name),
          d: i.t(e.product_sales),
          e: i.t(e.product_price),
          f: 1 * e.line_price > 0
        }, 1 * e.line_price > 0 ? {
          g: i.t(e.line_price)
        } : {}, {
          h: t,
          i: i.o((function(t) {
            return s.goto_product(e.product_id)
          }), t)
        })
      })),
      R: i.n(r.isLieBiao ? "" : "list-2")
    } : {}, {
      S: 1 == r.nav_type
    }, 1 == r.nav_type ? i.e({
      T: r.liveList.length > 0
    }, r.liveList.length > 0 ? {
      U: i.f(r.liveList, (function(e, t, o) {
        return i.e({
          a: "" != e.record_url
        }, (e.record_url, {}), {
          b: "" == e.record_url
        }, (e.record_url, {}), {
          c: e.share.file_path,
          d: t,
          e: i.o((function(t) {
            return s.toRoom(e)
          }), t)
        })
      }))
    } : {}) : {}, {
      V: 2 == r.nav_type
    }, 2 == r.nav_type ? {
      W: i.f(r.listData, (function(t, o, a) {
        return i.e({
          a: i.t(t.name),
          b: 10 == t.expire_type
        }, 10 == t.expire_type ? {
          c: i.t(t.expire_day)
        } : {}, {
          d: 20 == t.expire_type
        }, 20 == t.expire_type ? {
          e: i.t(t.start_time.text),
          f: i.t(t.end_time.text)
        } : {}, {
          g: 0 != t.max_price
        }, 0 != t.max_price ? {
          h: i.t(t.max_price)
        } : {}, {
          i: 10 == t.coupon_type.value
        }, 10 == t.coupon_type.value ? {
          j: i.t(1 * t.reduce_price)
        } : {}, {
          k: 20 == t.coupon_type.value
        }, 20 == t.coupon_type.value ? {
          l: i.t(t.discount)
        } : {}, {
          m: i.t(t.min_price > 0 ? "满" + 1 * t.min_price + "元可用" : "无门槛"),
          n: 0 == t.is_get
        }, 0 == t.is_get ? {
          o: i.o((function(e) {
            return s.receiveCoupon(o)
          }), o)
        } : {
          p: i.o((function() {}), o)
        }, {
          q: i.n("coupon-item-" + t.color.text),
          r: 20 == t.apply_range
        }, 20 == t.apply_range ? {
          s: i.o((function(i) {
            return e.gotoPage("/pages/coupon/detail?coupon_id=" + t.coupon_id + "&apply_range=" + t.apply_range)
          }), o)
        } : 30 == t.apply_range ? {
          v: i.o((function(i) {
            return e.gotoPage("/pages/coupon/detail?coupon_id=" + t.coupon_id + "&apply_range=" + t.apply_range)
          }), o)
        } : {
          w: i.o((function(i) {
            return e.gotoPage("/pages/coupon/detail?coupon_id=" + t.coupon_id + "&apply_range=" + t.apply_range)
          }), o)
        }, {
          t: 30 == t.apply_range,
          x: o
        })
      }))
    } : {}, {
      X: 3 == r.nav_type
    }, 3 == r.nav_type ? i.e({
      Y: !e.isloding
    }, e.isloding ? {} : i.e({
      Z: null == r.dataModel || "" == r.dataModel.qq && "" == r.dataModel.wechat && "" == r.dataModel.phone
    }, (null == r.dataModel || "" == r.dataModel.qq && "" == r.dataModel.wechat && r.dataModel.phone, {}), {
      aa: null != r.dataModel
    }, null != r.dataModel ? i.e({
      ab: "" != r.dataModel.qq
    }, "" != r.dataModel.qq ? {
      ac: o._imports_0$4,
      ad: i.t(r.dataModel.qq),
      ae: i.o((function(e) {
        return s.copyQQ(r.dataModel.qq)
      }), "52")
    } : {}, {
      af: "" != r.dataModel.wechat
    }, "" != r.dataModel.wechat ? {
      ag: o._imports_1$3,
      ah: i.t(r.dataModel.wechat),
      ai: i.o((function(e) {
        return s.copyQQ(r.dataModel.qq)
      }), "17")
    } : {}, {
      aj: "" != r.dataModel.phone
    }, "" != r.dataModel.phone ? {
      ak: o._imports_2$1,
      al: i.t(r.dataModel.phone),
      am: i.o((function(e) {
        return s.callPhone(r.dataModel.phone)
      }), "56")
    } : {}) : {})) : {}, {
      an: 0 == r.nav_type
    }, 0 == r.nav_type ? i.e({
      ao: 0 == r.product_list.length && !r.loading
    }, 0 != r.product_list.length || r.loading ? {
      ap: i.p({
        loadingType: s.loadingType
      })
    } : {}) : {}, {
      aq: i.s("height:" + r.scrollviewHigh + "rpx;"),
      ar: i.o((function() {
        return s.scrolltolowerFunc && s.scrolltolowerFunc.apply(s, arguments)
      }), "e5"),
      as: i.n(0 == r.nav_type ? "active" : ""),
      at: i.o((function(e) {
        return r.nav_type = 0
      }), "72"),
      av: 1 == r.is_record && 1 == r.is_open
    }, 1 == r.is_record && 1 == r.is_open ? {
      aw: i.n(1 == r.nav_type ? "active" : ""),
      ax: i.o((function(e) {
        return r.nav_type = 1
      }), "31")
    } : {}, {
      ay: r.listData.length > 0
    }, r.listData.length > 0 ? {
      az: i.n(2 == r.nav_type ? "active" : ""),
      aA: i.o((function(e) {
        return r.nav_type = 2
      }), "02")
    } : {}, {
      aB: r.service_open
    }, r.service_open ? {
      aC: i.n(3 == r.nav_type ? "active" : ""),
      aD: i.o((function() {
        return s.toSevice && s.toSevice.apply(s, arguments)
      }), "17")
    } : {}, {
      aE: e.theme(),
      aF: i.n(e.theme() || "")
    })
  }]
]);
wx.createPage(n);