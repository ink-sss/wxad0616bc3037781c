var e = require("../../../common/vendor.js");
require("../../../env/config.js");
var t = {
  components: {
    Popup: function() {
      return "../../../components/uni-popup.js"
    },
    uniLoadMore: function() {
      return "../../../components/uni-load-more.js"
    }
  },
  data: function() {
    return {
      state_active: 0,
      topRefresh: !1,
      listData: [],
      dataType: "all",
      order_id: 0,
      last_page: 0,
      page: 1,
      list_rows: 10,
      no_more: !1,
      loading: !0,
      isCodeImg: !1,
      codeImg: "",
      isfirst: !1,
      mch_id: "",
      search: ""
    }
  },
  computed: {
    loadingType: function() {
      return this.loading ? 1 : 0 != this.listData.length && this.no_more ? 2 : 0
    }
  },
  mounted: function() {
    this.searchFunc(), this.isfirst && this.searchFunc(), this.showMyList()
  },
  methods: {
    showMyList: function() {
      this.$refs.myOrderList.open("bottom")
    },
    searchFunc: function() {
      var e = this;
      e.page = 1, e.listData = [], e.no_more = !1, this.getData()
    },
    cancelAdvance: function(t) {
      var a = this,
        r = t;
      e.index.showModal({
        title: "提示",
        content: "您确定要取消吗?",
        success: function(t) {
          t.confirm && (e.index.showLoading({
            title: "正在处理"
          }), a._get("plus.advance.Order/cancelFront", {
            order_id: r
          }, (function(t) {
            e.index.hideLoading(), e.index.showToast({
              title: "操作成功",
              duration: 2e3,
              icon: "success"
            }), a.searchFunc()
          })))
        }
      })
    },
    depositPay: function(e) {
      this.gotoPage("/pages/order/confirm-order?order_type=retainage&order_id=" + e)
    },
    stateFunc: function(e) {
      var t = this;
      if (t.state_active != e) {
        switch (t.page = 1, t.loading = !0, t.state_active = e, e) {
          case 0:
            t.listData = [], t.dataType = "all";
            break;
          case 1:
            t.listData = [], t.dataType = "payment";
            break;
          case 2:
            t.listData = [], t.dataType = "delivery";
            break;
          case 3:
            t.listData = [], t.dataType = "received";
            break;
          case 4:
            t.listData = [], t.dataType = "comment"
        }
        t.getData()
      }
    },
    getData: function() {
      var e = this;
      e.loading = !0;
      var t = e.dataType;
      e._get("user.order/lists", {
        dataType: t,
        page: e.page,
        pay_source: e.getPlatform(),
        list_rows: e.list_rows,
        search: e.search
      }, (function(t) {
        e.loading = !1, e.listData = e.listData.concat(t.data.list.data), e.last_page = t.data.list.last_page, e.mch_id = t.data.mch_id, t.data.list.last_page <= 1 ? e.no_more = !0 : e.no_more = !1, e.isfirst = !0
      }))
    },
    gotoOrder: function(e) {
      this.gotoPage("/pages/order/order-detail?order_id=" + e)
    },
    toShop: function(e) {
      this.gotoPage("/pages/shop/shop?shop_supplier_id=" + e)
    },
    onPayOrder: function(e) {
      this.gotoPage("/pages/order/cashier?order_type=1&order_id=" + e)
    },
    orderReceipt: function(t) {
      var a = this;
      e.index.showModal({
        title: "提示",
        content: "您确定要收货吗?",
        success: function(r) {
          r.confirm ? (e.index.showLoading({
            title: "正在处理"
          }), a._post("user.order/receipt", {
            order_id: t.order_id
          }, (function(t) {
            e.index.hideLoading(), e.index.showToast({
              title: t.msg,
              duration: 2e3,
              icon: "success"
            }), a.searchFunc()
          }))) : e.index.showToast({
            title: "取消收货",
            duration: 1e3,
            icon: "none"
          })
        }
      })
    },
    toBottom: function() {
      var e = this;
      e.page < e.last_page && (e.page++, e.getData()), e.no_more = !0
    },
    countDown: function(e) {
      var t = e - Date.now() / 1e3,
        a = Math.floor(t / 86400),
        r = t % 86400,
        o = Math.floor(r / 3600);
      r %= 3600;
      var n = Math.floor(r / 60),
        s = r % 60;
      return a = this.convertTwo(a), o = this.convertTwo(o), n = this.convertTwo(n), s = this.convertTwo(s), parseInt(a) > 0 ? parseInt(a) + "天 " : parseInt(o) + "时" + parseInt(n) + "分" + parseInt(s) + "秒"
    },
    retractCancelOrder: function(t) {
      var a = this,
        r = t.order_id;
      e.index.showModal({
        title: "提示",
        content: "您确定要取消退款订单吗?",
        success: function(t) {
          t.confirm && (e.index.showLoading({
            title: "正在处理"
          }), a._get("user.order/retract", {
            order_id: r
          }, (function(t) {
            e.index.hideLoading(), e.index.showToast({
              title: "操作成功",
              duration: 2e3,
              icon: "success"
            }), a.searchFunc()
          })))
        }
      })
    },
    deleteCancelOrder: function(t) {
      var a = this,
        r = t.order_id;
      e.index.showModal({
        title: "提示",
        content: "您确定要删除订单吗?",
        success: function(t) {
          t.confirm && (e.index.showLoading({
            title: "正在处理"
          }), a._get("user.order/delete", {
            order_id: r
          }, (function(t) {
            e.index.hideLoading(), e.index.showToast({
              title: "操作成功",
              duration: 2e3,
              icon: "success"
            }), a.searchFunc()
          })))
        }
      })
    },
    cancelOrder: function(t) {
      var a = this,
        r = t.order_id,
        o = "您确定要取消吗?";
      t.orderSupplierCount && t.orderSupplierCount > 0 && (o = "取消订单后，促销优惠将一并取消，是否继续？"), e.index.showModal({
        title: "提示",
        content: o,
        success: function(t) {
          t.confirm && (e.index.showLoading({
            title: "正在处理"
          }), a._get("user.order/cancel", {
            order_id: r
          }, (function(t) {
            e.index.hideLoading(), e.index.showToast({
              title: "操作成功",
              duration: 2e3,
              icon: "success"
            }), a.searchFunc()
          })))
        }
      })
    },
    gotoEvaluate: function(e) {
      this.gotoPage("/pages/order/evaluate/evaluate?order_id=" + e)
    },
    onQRCode: function(t) {
      var a = this;
      e.index.showLoading({
        title: "加载中"
      });
      var r = t,
        o = a.getPlatform();
      a._get("user.order/qrcode", {
        order_id: r,
        source: o
      }, (function(t) {
        e.index.hideLoading(), a.isCodeImg = !0, a.codeImg = t.data.qrcode
      }))
    },
    nowOverTime: function(e) {
      return (new Date).getTime() >= new Date(1e3 * e).getTime()
    },
    hideCodePopupFunc: function() {
      this.isCodeImg = !1
    },
    gotoAssembleShare: function(e) {
      this.gotoPage("/pagesPlus/assemble/fight-group-detail/fight-group-detail?assemble_bill_id=" + e)
    },
    wxOrder: function(t) {
      var a = this;
      e.wx$1.openBusinessView && e.wx$1.openBusinessView({
        businessType: "weappOrderConfirm",
        extraData: {
          merchant_id: a.mch_id,
          merchant_trade_no: t.trade_no,
          transaction_id: t.transaction_id
        },
        success: function() {
          a._post("user.order/receipt", {
            order_id: t.order_id
          }, (function(t) {
            e.index.showToast({
              title: t.msg,
              duration: 2e3,
              icon: "success"
            }), a.searchFunc()
          }))
        },
        fail: function() {},
        complete: function() {}
      })
    }
  }
};
Array || (e.resolveComponent("template") + e.resolveComponent("uni-load-more") + e.resolveComponent("Popup") + e.resolveComponent("uni-popup"))(), Math;
var a = e._export_sfc(t, [
  ["render", function(t, a, r, o, n, s) {
    return e.e({
      a: e.o((function(e) {
        return s.searchFunc()
      }), "e1"),
      b: n.search,
      c: e.o((function(e) {
        return n.search = e.detail.value
      }), "1f"),
      d: e.n(0 == n.state_active ? "tab-item active tab-box" : "tab-item tab-box"),
      e: e.o((function(e) {
        return s.stateFunc(0)
      }), "0c"),
      f: e.n(1 == n.state_active ? "tab-item active tab-box" : "tab-item tab-box"),
      g: e.o((function(e) {
        return s.stateFunc(1)
      }), "97"),
      h: e.n(2 == n.state_active ? "tab-item active tab-box" : "tab-item tab-box"),
      i: e.o((function(e) {
        return s.stateFunc(2)
      }), "c4"),
      j: e.n(3 == n.state_active ? "tab-item active tab-box" : "tab-item tab-box"),
      k: e.o((function(e) {
        return s.stateFunc(3)
      }), "3e"),
      l: e.n(4 == n.state_active ? "tab-item active tab-box" : "tab-item tab-box"),
      m: e.o((function(e) {
        return s.stateFunc(4)
      }), "5c"),
      n: e.f(n.listData, (function(a, r, o) {
        return e.e({
          a: a.supplier
        }, a.supplier ? {
          b: e.t(a.supplier.name)
        } : {}, {
          c: e.o((function(e) {
            return s.toShop(a.supplier.shop_supplier_id)
          }), r),
          d: e.t(a.state_text),
          e: e.t(a.order_source_text),
          f: e.t(a.order_no),
          g: a.product.length > 1
        }, a.product.length > 1 ? {
          h: e.f(a.product, (function(e, t, a) {
            return {
              a: t,
              b: e.image.file_path
            }
          })),
          i: e.t(a.pay_price),
          j: e.t(a.productNum),
          k: e.o((function(e) {
            return s.gotoOrder(a.order_id)
          }), r)
        } : e.e({
          l: e.f(a.product, (function(e, t, a) {
            return {
              a: t,
              b: e.image.file_path
            }
          })),
          m: e.t(a.product[0].product_name),
          n: 70 == a.order_source
        }, 70 == a.order_source ? {
          o: e.t((1 * a.pay_price + 1 * a.advance.pay_price).toFixed(2))
        } : {
          p: e.t(a.pay_price)
        }, {
          q: e.t(a.product[0].total_num),
          r: e.o((function(e) {
            return s.gotoOrder(a.order_id)
          }), r)
        }), {
          s: 70 == a.order_source
        }, 70 == a.order_source ? e.e({
          t: e.t(20 == a.advance.pay_status.value ? "已支付" : "待支付"),
          v: e.t(a.advance.pay_price),
          w: e.t(20 == a.advance.pay_status.value && 20 == a.pay_status.value ? "已支付" : "待支付"),
          x: e.t(a.pay_price),
          y: 10 == a.order_status.value
        }, 10 == a.order_status.value ? e.e({
          z: a.advance && 20 == a.advance.pay_status.value
        }, a.advance && 20 == a.advance.pay_status.value ? e.e({
          A: s.nowOverTime(a.advance.end_time) && a.pay_end_time_format
        }, s.nowOverTime(a.advance.end_time) && a.pay_end_time_format ? {
          B: e.t(a.pay_end_time_format)
        } : a.advance.end_time_text ? {
          D: e.t(a.advance.end_time_text)
        } : {}, {
          C: a.advance.end_time_text
        }) : {}) : {}, {
          E: 10 == a.advance.pay_status.value && 10 == a.advance.order_status
        }, 10 == a.advance.pay_status.value && 10 == a.advance.order_status ? e.e({
          F: !s.nowOverTime(a.advance.pay_end_time) && !s.nowOverTime(a.advance.end_time)
        }, s.nowOverTime(a.advance.pay_end_time) || s.nowOverTime(a.advance.end_time) ? {} : {
          G: e.t(s.countDown(a.advance.pay_end_time))
        }) : {}, {
          H: 21 == a.order_status.value
        }, 21 == a.order_status.value ? {
          I: e.o((function(e) {
            return s.retractCancelOrder(a)
          }), r)
        } : {}, {
          J: 20 == a.order_status.value
        }, 20 == a.order_status.value ? {
          K: e.o((function(e) {
            return s.deleteCancelOrder(a)
          }), r)
        } : {}, {
          L: 20 == a.advance.pay_status.value && 10 == a.pay_status.value
        }, 20 == a.advance.pay_status.value && 10 == a.pay_status.value ? e.e({
          M: s.nowOverTime(a.advance.end_time) && 20 != a.order_status.value
        }, s.nowOverTime(a.advance.end_time) && 20 != a.order_status.value ? {
          N: e.o((function(e) {
            return t.gotoPage("/pages/order/cashier?order_id=" + a.order_id)
          }), r)
        } : {}) : {}, {
          O: 10 == a.pay_status.value && 10 == a.advance.order_status && 1 == a.advance.money_return
        }, 10 == a.pay_status.value && 10 == a.advance.order_status && 1 == a.advance.money_return ? {
          P: e.o((function(e) {
            return s.cancelAdvance(a.advance.order_advance_id)
          }), r)
        } : {}, {
          Q: 10 == a.order_status.value && 20 == a.pay_status.value
        }, 10 == a.order_status.value && 20 == a.pay_status.value ? e.e({
          R: 10 == a.delivery_status.value
        }, 10 == a.delivery_status.value ? {
          S: e.o((function(e) {
            return s.cancelOrder(a)
          }), r)
        } : {}) : {}, {
          T: 10 == a.advance.pay_status.value && 20 != a.order_status.value && (a.advance.pay_end_time > 0 && !s.nowOverTime(a.advance.pay_end_time) || a.advance.pay_end_time <= 0)
        }, 10 == a.advance.pay_status.value && 20 != a.order_status.value && (a.advance.pay_end_time > 0 && !s.nowOverTime(a.advance.pay_end_time) || a.advance.pay_end_time <= 0) ? {
          U: e.o((function(e) {
            return t.gotoPage("/pages/order/cashier?order_type=50&order_id=" + a.advance.order_advance_id)
          }), r)
        } : {}, {
          V: 20 == a.delivery_status.value && 10 == a.receipt_status.value
        }, 20 == a.delivery_status.value && 10 == a.receipt_status.value ? e.e({
          W: 20 == a.pay_type.value && "wx" == a.pay_source
        }, 20 == a.pay_type.value && "wx" == a.pay_source ? {
          X: e.o((function(e) {
            return s.wxOrder(a)
          }), r)
        } : {
          Y: e.o((function(e) {
            return s.orderReceipt(a)
          }), r)
        }) : {}, {
          Z: 30 == a.order_status.value && 0 == a.is_comment
        }, 30 == a.order_status.value && 0 == a.is_comment ? {
          aa: e.o((function(e) {
            return s.gotoEvaluate(a.order_id)
          }), r)
        } : {}) : e.e({
          ab: 21 == a.order_status.value
        }, 21 == a.order_status.value ? {
          ac: e.o((function(e) {
            return s.retractCancelOrder(a)
          }), r)
        } : {}, {
          ad: 20 == a.order_status.value
        }, 20 == a.order_status.value ? {
          ae: e.o((function(e) {
            return s.deleteCancelOrder(a)
          }), r)
        } : {}, {
          af: 10 == a.order_status.value
        }, 10 == a.order_status.value ? e.e({
          ag: 10 == a.pay_status.value
        }, 10 == a.pay_status.value ? {
          ah: e.o((function(e) {
            return s.cancelOrder(a)
          }), r)
        } : {}, {
          ai: 20 == a.pay_status.value && 10 == a.delivery_status.value
        }, 20 == a.pay_status.value && 10 == a.delivery_status.value ? {
          aj: e.o((function(e) {
            return s.cancelOrder(a)
          }), r)
        } : {}, {
          ak: 20 == a.pay_status.value && 20 == a.delivery_type.value && 10 == a.delivery_status.value
        }, 20 == a.pay_status.value && 20 == a.delivery_type.value && 10 == a.delivery_status.value ? e.e({
          al: 30 == a.order_source && 20 == a.assemble_status
        }, 30 == a.order_source && 20 == a.assemble_status ? {
          am: e.o((function(e) {
            return s.onQRCode(a.order_id)
          }), r)
        } : {}, {
          an: 30 != a.order_source
        }, 30 != a.order_source ? {
          ao: e.o((function(e) {
            return s.onQRCode(a.order_id)
          }), r)
        } : {}) : {}, {
          ap: 10 == a.pay_status.value
        }, 10 == a.pay_status.value ? {
          aq: e.o((function(e) {
            return s.onPayOrder(a.order_id)
          }), r)
        } : {}, {
          ar: 20 == a.delivery_status.value && 10 == a.receipt_status.value
        }, 20 == a.delivery_status.value && 10 == a.receipt_status.value ? e.e({
          as: 20 == a.pay_type.value && "wx" == a.pay_source
        }, 20 == a.pay_type.value && "wx" == a.pay_source ? {
          at: e.o((function(e) {
            return s.wxOrder(a)
          }), r)
        } : {
          av: e.o((function(e) {
            return s.orderReceipt(a)
          }), r)
        }) : {}) : {}, {
          aw: 30 == a.order_status.value && 0 == a.is_comment
        }, 30 == a.order_status.value && 0 == a.is_comment ? {
          ax: e.o((function(e) {
            return s.gotoEvaluate(a.order_id)
          }), r)
        } : {}, {
          ay: 10 == a.assemble_status && 30 == a.order_source
        }, 10 == a.assemble_status && 30 == a.order_source ? {
          az: e.o((function(e) {
            return s.gotoAssembleShare(a.product[0].bill_source_id)
          }), r)
        } : {}), {
          aA: r
        })
      })),
      o: 0 == n.listData.length && !n.loading
    }, 0 != n.listData.length || n.loading ? {
      q: e.p({
        loadingType: s.loadingType
      })
    } : {
      p: t.config.pic_url + "/static/list-null.png"
    }, {
      r: e.o((function(e) {
        return s.toBottom()
      }), "74"),
      s: n.codeImg,
      t: e.o(s.hideCodePopupFunc, "71"),
      v: e.p({
        show: n.isCodeImg,
        type: "middle",
        height: "auto"
      }),
      w: t.theme(),
      x: e.n(t.theme() || ""),
      y: e.sr("myOrderList", "43d2dd70-0"),
      z: e.p({
        type: "bottom",
        "background-color": "#fff",
        "border-radius": "20px 20px 0 0"
      })
    })
  }]
]);
wx.createComponent(a);