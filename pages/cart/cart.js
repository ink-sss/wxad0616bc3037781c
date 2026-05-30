var t = require("../../common/vendor.js");
require("../../env/config.js");
var e = require("../../common/assets.js"),
  o = {
    components: {
      recommendProduct: function() {
        return "../../components/recommendProduct/recommendProduct.js"
      }
    },
    data: function() {
      return {
        isloadding: !0,
        loadding: !0,
        isEdit: !1,
        tableData: [],
        arrIds: [],
        checkedAll: !1,
        totalPrice: 0,
        totalProduct: 0,
        store_open: 1,
        totalNum: 0
      }
    },
    onReady: function() {
      t.index.hideTabBar()
    },
    onShow: function() {
      this.getData()
    },
    methods: {
      getData: function() {
        var t = this;
        t.isloadding = !0, t._get("order.cart/lists", {}, (function(e) {
          t.isloadding = !1, t.tableData = e.data.productList, t.store_open = e.data.store_open, t.totalNum = e.data.totalNum, t.tableData.forEach((function(t, e) {
            t.checked = !1
          })), t.loadding = !1, t._initGoodsChecked()
        }), (function(e) {
          t.getData()
        }))
      },
      _initGoodsChecked: function() {
        var t = this,
          e = this,
          o = e.getCheckedData(),
          c = 0;
        e.tableData.forEach((function(t) {
          t.productList.forEach((function(t) {
            c++, t.checked = e.inArray("".concat(t.cart_id), o)
          }))
        })), e.totalProduct = c, e.isEdit = !1, e.checkedAll = o.length == e.totalProduct, e.tableData.forEach((function(e, o) {
          t.onUpsupChecked(t.tableData, o)
        })), e.updateTotalPrice()
      },
      getCheckedData: function() {
        return t.index.getStorageSync("CheckedData") || []
      },
      checkItem: function(t, e, o) {
        t.checked = !t.checked, this.$set(this.tableData[e].productList, o, t), console.log(this.tableData), this.onUpsupChecked(this.tableData, e), this.onUpdateChecked(), this.updateTotalPrice(), console.log(this.getCheckedData().length), this.checkedAll = this.getCheckedData().length == this.totalProduct
      },
      onUpsupChecked: function(t, e) {
        for (var o = !0, c = 0; c < t[e].productList.length; c++) t[e].productList[c].checked || (o = !1);
        this.$set(t[e], "checked", o), console.log("item=====" + o)
      },
      onUpdateChecked: function() {
        var e = [];
        this.tableData.forEach((function(t) {
          t.productList.forEach((function(t) {
            1 == t.checked && e.push("".concat(t.cart_id))
          }))
        })), console.log(e), t.index.setStorageSync("CheckedData", e)
      },
      checkStprItem: function(t, e) {
        console.log(t), t.checked = !t.checked, t.productList.forEach((function(e, o) {
          e.checked = t.checked
        })), this.updateTotalPrice(), this.onUpdateChecked(), console.log(this.getCheckedData().length), this.checkedAll = this.getCheckedData().length == this.totalProduct
      },
      onCheckedAll: function() {
        var t = this,
          e = this;
        e.checkedAll = !e.checkedAll, e.tableData.forEach((function(o) {
          t.$set(o, "checked", e.checkedAll), o.productList.forEach((function(t) {
            t.checked = e.checkedAll
          }))
        })), e.updateTotalPrice(), e.onUpdateChecked()
      },
      updateTotalPrice: function() {
        for (var t = 0, e = this.tableData, o = 0; o < e.length; o++)
          for (var c = 0; c < e[o].productList.length; c++) 1 == e[o].productList[c].checked && (t += e[o].productList[c].total_num * e[o].productList[c].product_price);
        this.totalPrice = t.toFixed(2)
      },
      Submit: function() {
        var e = this.getCheckedIds();
        if (0 == e.length) return t.index.showToast({
          title: "请选择商品",
          icon: "none"
        }), !1;
        this.gotoPage("/pages/order/confirm-order?order_type=cart&cart_ids=" + e)
      },
      addFunc: function(e) {
        var o = this,
          c = e.product_id,
          n = e.spec_sku_id;
        t.index.showLoading({
          title: "加载中"
        }), o._post("order.cart/add", {
          product_id: c,
          spec_sku_id: n,
          total_num: 1
        }, (function(e) {
          t.index.hideLoading(), o.loadding = !1, o.getData()
        }), (function() {
          o.loadding = !1
        }))
      },
      reduceFunc: function(e) {
        var o = this,
          c = e.product_id,
          n = e.spec_sku_id;
        e.total_num <= 1 || (t.index.showLoading({
          title: "加载中"
        }), o._post("order.cart/sub", {
          product_id: c,
          spec_sku_id: n
        }, (function(e) {
          o.loadding = !1, t.index.hideLoading(), o.getData()
        }), (function() {
          o.loadding = !1
        })))
      },
      onDelete: function() {
        var e = this,
          o = e.getCheckedIds();
        if (!o.length) return e.showError("您还没有选择商品"), !1;
        t.index.showModal({
          title: "提示",
          content: "您确定要移除选择的商品吗?",
          success: function(t) {
            t.confirm && e._post("order.cart/delete", {
              cart_id: o.join()
            }, (function(t) {
              e.getData(), e.onDeleteEvent(o)
            }))
          }
        })
      },
      getCheckedIds: function() {
        var t = [];
        return this.tableData.forEach((function(e) {
          e.productList.forEach((function(e) {
            1 == e.checked && t.push("".concat(e.cart_id))
          }))
        })), t
      },
      onDeleteEvent: function(t) {
        var e = this;
        return t.forEach((function(t) {
          e.tableData.forEach((function(o, c) {
            t == "".concat(o.cart_id) && e.tableData.splice(c, 1)
          }))
        })), e.$nextTick((function() {
          e.onUpdateChecked()
        })), !0
      },
      inArray: function(t, e) {
        for (var o in e)
          if (e[o] == t) return !0;
        return !1
      },
      gotoShop: function() {
        this.gotoPage("/pages/index/index")
      }
    }
  };
Array || (t.resolveComponent("recommendProduct") + t.resolveComponent("request-loading") + t.resolveComponent("tabBar"))(), Math;
var c = t._export_sfc(o, [
  ["render", function(o, c, n, i, a, d) {
    return t.e({
      a: !a.loadding
    }, a.loadding ? {} : t.e({
      b: a.totalNum > 0
    }, a.totalNum > 0 ? t.e({
      c: t.t(a.totalNum || 0),
      d: a.isEdit
    }, (a.isEdit, {}), {
      e: t.o((function(t) {
        return a.isEdit = !a.isEdit
      }), "58"),
      f: t.f(a.tableData, (function(c, n, i) {
        return t.e({
          a: c.checked,
          b: t.o((function(t) {
            return d.checkStprItem(c, n)
          }), n)
        }, a.store_open ? {
          c: t.t(c.supplier.name),
          d: t.o((function(t) {
            return o.gotoPage("/pages/shop/shop?shop_supplier_id=" + c.supplier.shop_supplier_id)
          }), n)
        } : {}, {
          e: t.f(c.productList, (function(c, i, a) {
            return t.e({
              a: c.checked,
              b: t.o((function(t) {
                return d.checkItem(c, n, i)
              }), i),
              c: t.o((function(t) {
                return o.gotoPage("/pages/product/detail/detail?product_id=" + c.product_id)
              }), i),
              d: c.product_image,
              e: t.t(c.product_name),
              f: t.t(c.product_sku.product_attr),
              g: t.t(c.product_price),
              h: c.total_num > 1
            }, c.total_num > 1 ? {
              i: e._imports_0
            } : {
              j: e._imports_1
            }, {
              k: t.o((function(t) {
                return d.reduceFunc(c)
              }), i),
              l: t.t(c.total_num),
              m: c.total_num < c.product_sku.stock_num
            }, c.total_num < c.product_sku.stock_num ? {
              n: e._imports_2,
              o: t.o((function(t) {
                return d.addFunc(c)
              }), i)
            } : {}, {
              p: i
            })
          })),
          f: n
        })
      })),
      g: a.store_open
    }) : {
      h: o.config.pic_url + "/static/list-null.png",
      i: t.o((function() {
        return d.gotoShop && d.gotoShop.apply(d, arguments)
      }), "5a")
    }, {
      j: a.totalNum > 0
    }, a.totalNum > 0 ? t.e({
      k: a.checkedAll,
      l: t.o((function() {
        return d.onCheckedAll && d.onCheckedAll.apply(d, arguments)
      }), "c5"),
      m: !a.isEdit
    }, a.isEdit ? {
      p: t.o((function(t) {
        return d.onDelete()
      }), "b6")
    } : {
      n: t.t(a.totalPrice),
      o: t.o((function(t) {
        return d.Submit()
      }), "d8")
    }) : {}, {
      q: t.p({
        location: 10
      }),
      r: a.totalNum > 0 ? 1 : ""
    }), {
      s: t.p({
        loadding: a.isloadding
      }),
      t: o.theme(),
      v: t.n(o.theme() || "")
    })
  }],
  ["__scopeId", "data-v-dd7e0e8e"]
]);
wx.createPage(c);