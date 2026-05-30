var e = require("../../../@babel/runtime/helpers/defineProperty"),
  t = require("../../../common/vendor.js"),
  i = require("../../../common/utils.js"),
  o = require("../../../common/assets.js"),
  a = {
    components: {
      spec: function() {
        return "./popup/spec.js"
      },
      share: function() {
        return "./popup/share.js"
      },
      uniPopup: function() {
        return "../../../components/uni-popup.js"
      },
      Mpservice: function() {
        return "../../../components/mpservice/Mpservice.js"
      },
      guarantee: function() {
        return "../../../components/guarantee.js"
      },
      AppShare: function() {
        return "../../../components/app-share.js"
      },
      coupon: function() {
        return "./popup/coupon.js"
      },
      Countdown: function() {
        return "../../../components/countdown/countdown-presale.js"
      },
      previewProduct: function() {
        return "./productinfo/previewProduct.js"
      }
    },
    data: function() {
      return {
        ispresale: !1,
        statusBarHeight: 0,
        titleBarHeight: 0,
        store_open: 1,
        phoneHeight: 0,
        scrollviewHigh: 0,
        loadding: !0,
        indicatorDots: !0,
        autoplay: !1,
        interval: 2e3,
        duration: 500,
        isPopup: !1,
        product_id: null,
        detail: {
          product_sku: {},
          show_sku: {
            product_price: "",
            product_sku_id: 0,
            line_price: "",
            stock_num: 0,
            sku_image: ""
          }
        },
        specData: null,
        productModel: {},
        buyNow: !1,
        url: "",
        productSpecArr: [],
        cart_total_num: 0,
        isbottmpanel: !1,
        isguarantee: !1,
        isCreatedImg: !1,
        poster_img: "",
        alreadyChioce: "",
        shop_info: "",
        isfollow: "",
        shop_supplier_id: "",
        serverList: "",
        room_id: "",
        isAppShare: !1,
        appParams: {
          title: "",
          summary: "",
          path: ""
        },
        service_type: 0,
        user_id: 0,
        is_virtual: 1,
        couponList: [],
        isCoupon: !1,
        middle: 1,
        isVideoPlay: !1,
        isContentVideoPlay: !1,
        show_discount: "",
        discount: {
          product_coupon: [],
          product_reduce: [],
          give_points: ""
        },
        activeName: "",
        activePrice: "",
        activeText: "",
        skuName: "",
        is_preview: 0,
        sTop: 0,
        topId: "",
        scrollId: "",
        commentTop: 0,
        contentTop: 0,
        isMPH5: !1,
        specDisabled: !1,
        referee_id: "",
        is_fav: !1,
        chatSetting: {},
        isKefuPop: !1
      }
    },
    onLoad: function(e) {
      this.GetStatusBarHeight();
      var o = i.utils.getSceneData(e);
      this.user_id = t.index.getStorageInfoSync("user_id"), this.room_id = e.room_id, this.product_id = e.product_id ? e.product_id : o.gid, e.referee_id && t.index.setStorageSync("referee_id", e.referee_id), this.referee_id = t.index.getStorageSync("referee_id") || ""
    },
    onReady: function() {
      this.init(), this.getData()
    },
    onShareAppMessage: function() {
      var e = this;
      e.taskFunc();
      var t = e.getShareUrlParams({
        product_id: e.product_id,
        referee_id: e.getUserId()
      });
      return {
        title: e.detail.product_name,
        path: "/pages/product/detail/detail?" + t,
        imageUrl: e.detail.image ? e.detail.image[0].file_path : ""
      }
    },
    methods: {
      scrollFunc: function(e) {
        this.scrollId = e.detail.scrollTop.toFixed(1)
      },
      GetStatusBarHeight: function() {
        t.index.getSystemInfoSync().statusBarHeight, this.statusBarHeight = t.index.getMenuButtonBoundingClientRect().top, this.titleBarHeight = t.index.getMenuButtonBoundingClientRect().height
      },
      init: function() {
        var e = this;
        t.index.getSystemInfo({
          success: function(i) {
            e.phoneHeight = i.windowHeight, t.index.createSelectorQuery().select(".btns-wrap").boundingClientRect((function(t) {
              var i = (e.phoneHeight, t.height);
              i = e.phoneHeight, e.scrollviewHigh = i
            })).exec()
          }
        })
      },
      initScroll: function() {
        var e, i = this,
          o = i.topBarHeight();
        e = o ? i.topBarHeight() + i.topBarTop() + 50 : 50, t.index.getSystemInfo({
          success: function(o) {
            t.index.createSelectorQuery().select("#product-comment").boundingClientRect((function(t) {
              console.log(t), i.commentTop = t.top - e
            })).exec(), t.index.createSelectorQuery().select("#product-content").boundingClientRect((function(t) {
              i.contentTop = t.top - e
            })).exec()
          }
        })
      },
      getData: function() {
        var e = this,
          o = e.product_id;
        t.index.showLoading({
          title: "加载中"
        }), e._get("product.product/detail", {
          product_id: o,
          url: e.url,
          visitcode: e.getVisitcode(),
          referee_id: e.referee_id
        }, (function(o) {
          console.log(1 == o.data.detail.is_preview && (new Date).valueOf() / 1e3 < o.data.detail.preview_time), null == o.data.mp_service ? e.service_type = 10 : e.service_type = o.data.mp_service.service_type, 1 == o.data.detail.is_preview && (new Date).valueOf() / 1e3 < o.data.detail.preview_time ? (e.is_preview = o.data.detail.is_preview, e.activeText = "预告", e.activeName = "preview", e.activePrice = "preview_price", e.specDisabled = !0, o.data.detail.preview = {
            start_time: (new Date).valueOf() / 1e3,
            end_time: o.data.detail.preview_time
          }) : o.data.detail.advance && null != o.data.detail.advance && (e.ispresale = !0, e.activeName = "advance", e.activeText = "预售", e.activePrice = "advance_price", e.skuName = "sku"), e.detail.secKill && (e.skuName = "seckill"), e.shop_supplier_id = o.data.detail.supplier.shop_supplier_id, e.shop_info = o.data.detail.supplier, e.isfollow = o.data.detail.isfollow, e.is_virtual = o.data.detail.is_virtual, e.is_fav = o.data.is_fav, e.couponList = o.data.couponList, null == o.data.mp_service ? e.service_type = 10 : e.service_type = o.data.mp_service.service_type, e.cart_total_num = o.data.cart_total_num, e.store_open = o.data.store_open, o.data.detail.content = i.utils.format_content(o.data.detail.content), e.activeName && "advance" != e.activeName && "preview" != e.activeName ? o.data.detail[e.activeName].specData && e.initSpecData(o.data.detail[e.activeName].specData) : 20 == o.data.detail.spec_type && e.initSpecData(o.data.specData), e.detail = o.data.detail, e.show_discount = o.data.show_discount, e.discount = o.data.discount, e.getServer(), e.getChatInfo(), e.loadding = !1, t.index.hideLoading(), e.$nextTick((function() {
            e.initScroll()
          }))
        }))
      },
      getServer: function() {
        var e = this,
          t = [];
        e.detail && e.detail.server && e.detail.server.forEach((function(e, i) {
          t.push(e.name)
        })), e.serverList = t.join("·")
      },
      changeTopId: function(e) {
        var t = 1 * e + (this.topId == e ? 1 : 0);
        this.topId = t
      },
      initSpecData: function(e) {
        var t = this;
        for (var i in e.spec_attr)
          for (var o in e.spec_attr[i].spec_items) e.spec_attr[i].spec_items[o].checked = !1;
        this.specData = e, this.specData.spec_attr && (this.specData.spec_attr.forEach((function(e) {
          t.alreadyChioce += e.group_name, t.alreadyChioce += " / "
        })), this.alreadyChioce = this.alreadyChioce.replace(/(\s\/\s)$/gi, ""))
      },
      openPopup: function(t) {
        var i, o = {
          specData: this.specData,
          detail: this.detail,
          productSpecArr: null != this.specData ? new Array(this.specData.spec_attr.length) : [],
          show_sku: (i = {
            sku_image: "",
            price: 0,
            product_sku_id: 0,
            line_price: 0,
            stock: 0
          }, e(i, "product_sku_id", 0), e(i, "sum", 1), i),
          plus_sku: null,
          type: t,
          plus_name: ""
        };
        this.detail.single_num > 0 && (o.show_sku.sum = this.detail.single_num), "advance" == this.activeName && (o.plus_sku = this.detail.advance.sku, o.plus_name = "advance"), "secKill" == this.activeName && (o.plus_sku = this.detail.secKill.seckillSku, o.plus_name = "seckill"), console.log(o), this.productModel = o, this.isPopup = !0
      },
      closePopup: function(e, t) {
        if (this.isPopup = !1, e && e.spec_attr) {
          this.alreadyChioce = "";
          var i = "已选：",
            o = "";
          e.spec_attr.forEach((function(e) {
            if (e.spec_items) {
              for (var t = "", a = 0; a < e.spec_items.length; a++) {
                var n = e.spec_items[a];
                if (n.checked) {
                  t = n.spec_value + " / ";
                  break
                }
              }
              "" != t ? i += t : o += e.group_name
            }
          })), "" != o ? this.alreadyChioce = o : (i = i.replace(/(\s\/\s)$/gi, ""), this.alreadyChioce = i)
        }
        t && (this.cart_total_num = t)
      },
      lookEvaluate: function(e) {
        this.gotoPage("/pages/product/detail/look-evaluate/look-evaluate?product_id=" + e)
      },
      goback: function() {
        var e = getCurrentPages();
        console.log(e.length), e.length <= 1 ? this.gotoPage("/pages/index/index") : t.index.navigateBack()
      },
      gotocart: function() {
        this.gotoPage("/pages/cart/cart")
      },
      closeBottmpanel: function(e) {
        this.isbottmpanel = !1, 2 == e.type && (this.poster_img = e.poster_img, this.isCreatedImg = !0)
      },
      closeGuarantee: function() {
        this.isguarantee = !1
      },
      showGuarantee: function() {
        this.isguarantee = !0
      },
      showShare: function() {
        this.isbottmpanel = !0, this.taskFunc()
      },
      closeAppShare: function(e) {
        this.isAppShare = !1
      },
      hidePopupFunc: function() {
        this.isCreatedImg = !1
      },
      savePosterImg: function() {
        var e = this;
        t.index.showLoading({
          title: "加载中"
        }), t.index.downloadFile({
          url: e.poster_img,
          success: function(i) {
            t.index.hideLoading(), t.index.saveImageToPhotosAlbum({
              filePath: i.tempFilePath,
              success: function(i) {
                t.index.showToast({
                  title: "保存成功",
                  icon: "success",
                  duration: 2e3
                }), e.isCreatedImg = !1
              },
              fail: function(e) {
                "saveImageToPhotosAlbum:fail auth deny" === e.errMsg && (t.index.showToast({
                  title: "请允许访问相册后重试",
                  icon: "none",
                  duration: 1e3
                }), setTimeout((function() {
                  t.index.openSetting()
                }), 1e3))
              },
              complete: function(e) {
                console.log("complete")
              }
            })
          }
        })
      },
      openCoupon: function() {
        this.isCoupon = !this.isCoupon
      },
      closeCouponFunc: function(e) {
        this.isCoupon = !1
      },
      goto_shop: function() {
        this.gotoPage("/pages/shop/shop?shop_supplier_id=" + this.shop_supplier_id)
      },
      favorite: function() {
        var e = this;
        e._post("user.Favorite/add", {
          pid: e.product_id,
          type: 20
        }, (function(i) {
          0 == e.isfollow ? (t.index.showToast({
            icon: "none",
            title: "收藏成功，请到“我的->我的收藏”查看和管理哦"
          }), e.isfollow = 1) : 1 == e.isfollow && (e.isfollow = 0, t.index.showToast({
            icon: "none",
            title: "取消成功"
          }))
        }))
      },
      changeSwiper: function() {
        this.isVideoPlay = !1
      },
      returnValFunc: function(e) {},
      taskFunc: function() {
        this._post("plus.task.Task/dayTask", {
          task_type: "product"
        }, (function(e) {
          console.log("分享成功")
        }))
      },
      sendFunc: function(e) {
        this[e]()
      },
      openVideo: function(e) {
        "video" == e ? (this.isVideoPlay = !0, this.isContentVideoPlay = !1) : (this.isVideoPlay = !1, this.isContentVideoPlay = !0)
      },
      getChatInfo: function() {
        console.log(this.shop_supplier_id, "shop_supplier_id");
        var e = this;
        e._post("live.roomNew/getChatSetting", {
          app_id: e.getAppId(),
          supplier_id: e.shop_supplier_id
        }, (function(t) {
          1 == t.code && (e.chatSetting = t.data)
        }))
      },
      contackBack: function() {},
      onKefuClick: function() {
        t.index.navigateTo({
          url: "/pages/webview/webview?url=" + encodeURIComponent(this.chatSetting.link)
        })
      },
      onWxKefuClick: function() {
        t.wx$1.openCustomerServiceChat({
          extInfo: {
            url: this.chatSetting.url
          },
          corpId: this.chatSetting.corpId,
          success: function(e) {
            console.log(e)
          },
          fail: function(e) {
            console.log(e)
          }
        })
      },
      onCodeKefuClick: function() {
        this.isKefuPop = !0
      },
      hideKefuPop: function() {
        this.isKefuPop = !1
      }
    }
  };
Array || (t.resolveComponent("previewProduct") + t.resolveComponent("Countdown") + t.resolveComponent("spec") + t.resolveComponent("share") + t.resolveComponent("guarantee") + t.resolveComponent("AppShare") + t.resolveComponent("uniPopup") + t.resolveComponent("coupon"))();
var n = t._export_sfc(a, [
  ["render", function(e, i, a, n, c, s) {
    return t.e({
      a: t.o((function() {
        return s.goback && s.goback.apply(s, arguments)
      }), "35"),
      b: e.config.pic_url + "/202604061206265273f3383.png",
      c: t.s(0 == e.topBarHeight() ? "" : "height:" + e.topBarHeight() + "px;"),
      d: t.s(0 == e.topBarHeight() ? "" : "height:" + e.topBarHeight() + "px;padding-top:" + e.topBarTop() + "px"),
      e: !c.loadding
    }, c.loadding ? {} : t.e({
      f: t.o((function() {
        return s.goback && s.goback.apply(s, arguments)
      }), "b0"),
      g: e.config.pic_url + "/202604061206265273f3383.png",
      h: t.s(0 == e.topBarHeight() ? "" : "height:" + e.topBarHeight() + "px;"),
      i: 1 * c.scrollId + 1 < c.commentTop ? 1 : "",
      j: t.o((function(e) {
        return s.changeTopId(0)
      }), "97"),
      k: 1 * c.scrollId + 1 < c.contentTop && 1 * c.scrollId + 1 > c.commentTop ? 1 : "",
      l: t.o((function(e) {
        return s.changeTopId(c.commentTop)
      }), "3f"),
      m: 1 * c.scrollId + 1 > c.contentTop ? 1 : "",
      n: t.o((function(e) {
        return s.changeTopId(c.contentTop)
      }), "c8"),
      o: t.s(0 == e.topBarHeight() ? "" : "padding-top:" + e.topBarTop() + "px"),
      p: t.n(c.scrollId < 100 ? "close" : "open"),
      q: c.detail.video_link
    }, c.detail.video_link ? t.e({
      r: !c.isVideoPlay
    }, c.isVideoPlay ? {} : {
      s: t.o((function(e) {
        return s.openVideo("video")
      }), "24")
    }, {
      t: !c.isVideoPlay
    }, c.isVideoPlay ? {} : {
      v: c.detail.poster ? c.detail.poster.file_path : c.detail.image[0].file_path,
      w: t.o((function(e) {
        return s.openVideo("video")
      }), "3a")
    }, {
      x: c.isVideoPlay
    }, c.isVideoPlay ? {
      y: c.detail.video_link,
      z: t.o((function(e) {
        return c.isVideoPlay = !1
      }), "8a"),
      A: c.isMPH5,
      B: c.isMPH5,
      C: c.isMPH5
    } : {}) : {}, {
      D: t.f(c.detail.image, (function(i, o, a) {
        return {
          a: t.o((function(t) {
            return e.yulan(c.detail.image, o)
          }), o),
          b: i.file_path,
          c: o
        }
      })),
      E: c.indicatorDots,
      F: c.autoplay,
      G: c.interval,
      H: c.duration,
      I: t.o((function() {
        return s.changeSwiper && s.changeSwiper.apply(s, arguments)
      }), "f8"),
      J: 1 == c.is_preview
    }, 1 == c.is_preview ? t.e({
      K: !c.loadding
    }, c.loadding ? {} : {
      L: t.o(s.sendFunc, "0c"),
      M: t.p({
        detail: c.detail,
        is_fav: c.is_fav
      })
    }) : {}, {
      N: c.ispresale
    }, c.ispresale ? t.e({
      O: "advance" == c.activeName
    }, "advance" == c.activeName ? {
      P: t.t(e.subPrice(c.detail[c.activeName][c.skuName][0].product_price, "1")),
      Q: t.t(e.subPrice(c.detail[c.activeName][c.skuName][0].product_price, "2"))
    } : {
      R: t.t(e.subPrice(c.detail[c.activeName][c.skuName][0][c.activePrice], "1")),
      S: t.t(e.subPrice(c.detail[c.activeName][c.skuName][0][c.activePrice], "2"))
    }, {
      T: "advance" == c.activeName
    }, "advance" == c.activeName ? {
      U: t.t((1 * c.detail[c.activeName][c.skuName][0].product_price - 1 * c.detail[c.activeName][c.skuName][0][c.activePrice] + 1 * c.detail[c.activeName].money).toFixed(2))
    } : {}, {
      V: "advance" == c.activeName
    }, "advance" == c.activeName ? {
      W: t.t(c.detail[c.activeName].money),
      X: t.t(c.detail[c.activeName][c.skuName][0][c.activePrice])
    } : {}, {
      Y: t.t(c.activeText),
      Z: o._imports_0$9,
      aa: t.sr("countdown", "e513e243-1"),
      ab: t.o(s.returnValFunc, "31"),
      ac: t.p({
        config: {
          startstamp: c.detail[c.activeName].start_time,
          endstamp: c.detail[c.activeName].end_time
        }
      }),
      ad: c.discount.give_points > 0
    }, c.discount.give_points > 0 ? {
      ae: t.t(e.points_name()),
      af: t.t(e.points_name()),
      ag: t.t(c.discount.give_points),
      ah: t.t(e.points_name())
    } : {}, {
      ai: c.discount.product_reduce.length > 0
    }, c.discount.product_reduce.length > 0 ? {
      aj: t.f(c.discount.product_reduce, (function(e, i, o) {
        return t.e({
          a: 1 == e.full_type
        }, 1 == e.full_type ? {
          b: t.t(e.full_value),
          c: t.t(e.reduce_value)
        } : {}, {
          d: 2 == e.full_type
        }, 2 == e.full_type ? {
          e: t.t(e.full_value),
          f: t.t((100 - e.reduce_value) / 10)
        } : {}, {
          g: i,
          h: e,
          i: i
        })
      }))
    } : {}, {
      ak: c.discount.product_coupon.length > 0
    }, c.discount.product_coupon.length > 0 ? {
      al: t.o((function(e) {
        return s.openCoupon()
      }), "04")
    } : {}, {
      am: t.t(c.detail.product_name),
      an: c.detail.selling_point
    }, c.detail.selling_point ? {
      ao: t.t(c.detail.selling_point)
    } : {}, {
      ap: "advance" == c.activeName
    }, "advance" == c.activeName ? {
      aq: t.t((1 * c.detail[c.activeName][c.skuName][0].product_price - 1 * c.detail[c.activeName][c.skuName][0][c.activePrice]).toFixed(2)),
      ar: t.t(c.detail[c.activeName].active_time[0]),
      as: t.t(c.detail[c.activeName].active_time[1])
    } : {}) : {}, {
      at: !c.ispresale && 1 != c.is_preview
    }, c.ispresale || 1 == c.is_preview ? {} : t.e({
      av: c.detail.is_user_grade
    }, (c.detail.is_user_grade, {}), {
      aw: t.t(c.detail.product_sku.product_price),
      ax: 20 == c.detail.spec_type && c.detail.product_sku.product_price != c.detail.product_max_price
    }, 20 == c.detail.spec_type && c.detail.product_sku.product_price != c.detail.product_max_price ? {
      ay: t.t(c.detail.product_max_price)
    } : {}, {
      az: o._imports_1$5,
      aA: t.o((function() {
        return s.showShare && s.showShare.apply(s, arguments)
      }), "8e"),
      aB: t.n(c.is_fav ? "" : "img_gray"),
      aC: o._imports_2$3,
      aD: t.o((function(e) {
        return s.favorite()
      }), "9f"),
      aE: c.detail.product_sku && c.detail.product_sku.line_price > 0
    }, c.detail.product_sku && c.detail.product_sku.line_price > 0 ? {
      aF: t.t(c.detail.product_sku.line_price)
    } : {}, {
      aG: t.t(c.detail.product_sales),
      aH: c.discount.give_points > 0
    }, c.discount.give_points > 0 ? {
      aI: t.t(e.points_name()),
      aJ: t.t(e.points_name()),
      aK: t.t(c.discount.give_points),
      aL: t.t(e.points_name())
    } : {}, {
      aM: c.discount.product_reduce.length > 0
    }, c.discount.product_reduce.length > 0 ? {
      aN: t.f(c.discount.product_reduce, (function(e, i, o) {
        return t.e({
          a: 1 == e.full_type
        }, 1 == e.full_type ? {
          b: t.t(e.full_value)
        } : {}, {
          c: 2 == e.full_type
        }, 2 == e.full_type ? {
          d: t.t(e.full_value),
          e: t.t((100 - e.reduce_value) / 10)
        } : {}, {
          f: 1 == e.reduce_type
        }, 1 == e.reduce_type ? {
          g: t.t(e.reduce_value)
        } : {}, {
          h: 2 == e.reduce_type
        }, 2 == e.reduce_type ? {
          i: t.t((100 - e.reduce_value) / 10)
        } : {}, {
          j: i,
          k: e,
          l: i
        })
      }))
    } : {}, {
      aO: c.discount.product_coupon.length > 0
    }, c.discount.product_coupon.length > 0 ? {
      aP: t.o((function(e) {
        return s.openCoupon()
      }), "c5")
    } : {}, {
      aQ: 20 == c.detail.supplier.store_type
    }, (c.detail.supplier.store_type, {}), {
      aR: t.t(c.detail.product_name),
      aS: c.detail.selling_point
    }, c.detail.selling_point ? {
      aT: t.t(c.detail.selling_point)
    } : {}), {
      aU: 20 == c.detail.spec_type || "" != c.detail.server || c.detail.secKill
    }, 20 == c.detail.spec_type || "" != c.detail.server || c.detail.secKill ? t.e({
      aV: c.detail.secKill
    }, c.detail.secKill ? {
      aW: t.o((function(t) {
        return e.gotoPage("/pagesPlus/seckill/detail/detail?seckill_product_id=".concat(c.detail.secKill.seckill_product_id, "&time_id=").concat(c.detail.secKill.time_id))
      }), "93")
    } : {}, {
      aX: 20 == c.detail.spec_type
    }, 20 == c.detail.spec_type ? {
      aY: t.t(c.alreadyChioce),
      aZ: t.n("" != c.detail.server ? "border-b-d9" : ""),
      ba: t.o((function(e) {
        return s.openPopup(c.ispresale ? "deposit" : "order")
      }), "b2")
    } : {}, {
      bb: "" != c.detail.server
    }, "" != c.detail.server ? {
      bc: t.t(c.serverList),
      bd: t.o((function() {
        return s.showGuarantee && s.showGuarantee.apply(s, arguments)
      }), "1b")
    } : {}) : {}, {
      be: t.t(c.detail.comment_data_count),
      bf: t.o((function(e) {
        return s.lookEvaluate(c.detail.product_id)
      }), "33"),
      bg: c.detail.comment_data_count > 0
    }, c.detail.comment_data_count > 0 ? {
      bh: t.f(c.detail.commentData, (function(e, i, o) {
        return t.e({
          a: i <= 1
        }, i <= 1 ? {
          b: e.user.avatarUrl,
          c: t.t(e.user.nickName),
          d: t.t(e.create_time),
          e: t.t(e.content)
        } : {}, {
          f: i
        })
      }))
    } : {}, {
      bi: c.store_open
    }, c.store_open ? {
      bj: c.shop_info.logos,
      bk: t.t(c.shop_info.name),
      bl: t.t(c.shop_info.category_name),
      bm: t.t(c.shop_info.product_sales),
      bn: t.t(c.shop_info.server_score),
      bo: t.o((function(e) {
        return s.goto_shop()
      }), "e7")
    } : {}, {
      bp: c.detail.video_link_detail
    }, c.detail.video_link_detail ? t.e({
      bq: !c.isContentVideoPlay
    }, c.isContentVideoPlay ? {} : {
      br: t.o((function(e) {
        return s.openVideo("content-video")
      }), "fb")
    }, {
      bs: !c.isContentVideoPlay
    }, c.isContentVideoPlay ? {} : {
      bt: c.detail.contentPoster ? c.detail.contentPoster.file_path : "",
      bv: t.o((function(e) {
        return s.openVideo("content-video")
      }), "80")
    }, {
      bw: c.isContentVideoPlay
    }, c.isContentVideoPlay ? {
      bx: c.detail.video_link_detail,
      by: t.o((function(e) {
        return c.isContentVideoPlay = !1
      }), "e4"),
      bz: c.isMPH5,
      bA: c.isMPH5,
      bB: c.isMPH5
    } : {}) : {}, {
      bC: 0 == c.detail.is_picture
    }, 0 == c.detail.is_picture ? {
      bD: c.detail.content
    } : {}, {
      bE: 1 == c.detail.is_picture
    }, 1 == c.detail.is_picture ? {
      bF: t.f(c.detail.contentImage, (function(e, t, i) {
        return {
          a: e.file_path,
          b: t
        }
      }))
    } : {}, {
      bG: c.topId,
      bH: t.o((function() {
        return s.scrollFunc && s.scrollFunc.apply(s, arguments)
      }), "7b"),
      bI: t.s("height:" + c.scrollviewHigh + "px")
    }), {
      bJ: t.o((function(t) {
        return e.gotoPage("/pages/index/index")
      }), "0f"),
      bK: c.cart_total_num > 0
    }, c.cart_total_num > 0 ? {
      bL: t.t(c.cart_total_num)
    } : {}, {
      bM: t.o((function(t) {
        return e.gotoPage("/pages/cart/cart")
      }), "4c"),
      bN: null !== c.chatSetting
    }, null !== c.chatSetting ? t.e({
      bO: 10 == c.chatSetting.type
    }, 10 == c.chatSetting.type ? {
      bP: t.o((function() {
        return s.contackBack && s.contackBack.apply(s, arguments)
      }), "a9")
    } : {}, {
      bQ: 20 == c.chatSetting.type && c.chatSetting.link
    }, 20 == c.chatSetting.type && c.chatSetting.link ? {
      bR: t.o((function() {
        return s.onKefuClick && s.onKefuClick.apply(s, arguments)
      }), "ea")
    } : {}, {
      bS: 30 == c.chatSetting.type && c.chatSetting.url && c.chatSetting.corpId
    }, 30 == c.chatSetting.type && c.chatSetting.url && c.chatSetting.corpId ? {
      bT: t.o((function() {
        return s.onWxKefuClick && s.onWxKefuClick.apply(s, arguments)
      }), "e6")
    } : {}, {
      bU: 40 == c.chatSetting.type && c.chatSetting.pic
    }, 40 == c.chatSetting.type && c.chatSetting.pic ? {
      bV: t.o((function() {
        return s.onCodeKefuClick && s.onCodeKefuClick.apply(s, arguments)
      }), "bd")
    } : {}) : {}, {
      bW: 1 == c.is_preview
    }, 1 == c.is_preview ? {} : t.e({
      bX: 1 == !c.room_id && !c.is_virtual && !c.ispresale && !c.detail.custom_form
    }, 1 != !c.room_id || c.is_virtual || c.ispresale || c.detail.custom_form ? {} : {
      bY: t.o((function(e) {
        return s.openPopup("card")
      }), "f1")
    }, {
      bZ: !c.ispresale
    }, c.ispresale ? t.e({
      cb: "advance" == c.activeName
    }, "advance" == c.activeName ? {
      cc: t.t(c.detail[c.activeName].money)
    } : {}, {
      cd: t.o((function(e) {
        return s.openPopup("deposit")
      }), "22")
    }) : {
      ca: t.o((function(e) {
        return s.openPopup("order")
      }), "ce")
    }), {
      ce: t.o(s.closePopup, "ab"),
      cf: t.p({
        specDisabled: c.specDisabled,
        isPopup: c.isPopup,
        productModel: c.productModel,
        room_id: c.room_id
      }),
      cg: t.o(s.closeBottmpanel, "03"),
      ch: t.p({
        isbottmpanel: c.isbottmpanel,
        product_id: c.product_id
      }),
      ci: t.o(s.closeGuarantee, "0e"),
      cj: t.p({
        isguarantee: c.isguarantee,
        server: c.detail.server
      }),
      ck: t.o(s.closeAppShare, "94"),
      cl: t.p({
        isAppShare: c.isAppShare,
        appParams: c.appParams
      }),
      cm: c.poster_img,
      cn: t.o((function() {
        return s.savePosterImg && s.savePosterImg.apply(s, arguments)
      }), "30"),
      co: t.o(s.hidePopupFunc, "16"),
      cp: t.p({
        height: "auto",
        show: c.isCreatedImg,
        type: "middle"
      }),
      cq: t.o(s.closeCouponFunc, "70"),
      cr: t.p({
        isCoupon: c.isCoupon,
        discount: c.discount,
        couponList: c.discount.product_coupon
      }),
      cs: null !== c.chatSetting
    }, null !== c.chatSetting ? {
      ct: c.chatSetting.pic,
      cv: t.o(s.hideKefuPop, "94"),
      cw: t.p({
        show: c.isKefuPop,
        type: "middle"
      })
    } : {}, {
      cx: e.theme(),
      cy: t.n(e.theme() || "")
    })
  }],
  ["__scopeId", "data-v-e513e243"]
]);
a.__runtimeHooks = 2, wx.createPage(n);