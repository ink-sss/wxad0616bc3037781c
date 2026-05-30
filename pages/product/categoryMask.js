var t = require("../../common/vendor.js"),
  n = {
    components: {
      spec: function() {
        return "./detail/popup/spec.js"
      }
    },
    props: ["dataList"],
    data: function() {
      return {
        show: !1,
        is_auto: 0,
        platFormType: ""
      }
    },
    methods: {
      open: function() {
        var n = t.index.getStorageSync("TabBar");
        n && (this.is_auto = n.is_auto);
        var o = t.index.getSystemInfoSync().uniPlatform;
        this.platFormType = o, this.$props.dataList && this.$props.dataList.length > 0 && (this.show = !this.show)
      },
      closeMask: function() {
        this.show = !1
      },
      addFunc: function(n) {
        console.log("item", n);
        var o = this;
        t.index.showLoading({
          title: "加载中"
        }), o._post("order.cart/add", {
          product_id: n.product_id,
          spec_sku_id: n.spec_sku_id,
          total_num: 1
        }, (function(n) {
          t.index.hideLoading(), o.loadding = !1, o.$emit("get-shopping-num")
        }), (function() {
          o.loadding = !1
        }))
      },
      reduceFunc: function(n) {
        var o = this;
        n.totalNum <= 1 || (t.index.showLoading({
          title: "加载中"
        }), o._post("order.cart/sub", {
          product_id: n.product_id,
          spec_sku_id: n.spec_sku_id
        }, (function(n) {
          o.loadding = !1, t.index.hideLoading(), o.$emit("get-shopping-num")
        }), (function() {
          o.loadding = !1
        })))
      },
      clickDel: function(n) {
        var o = this;
        t.index.showModal({
          title: "提示",
          content: "您确定要移除该商品吗?",
          success: function(t) {
            t.confirm && o._post("order.cart/delete", {
              cart_id: n.cart_id
            }, (function(t) {
              o.$emit("get-shopping-num")
            }))
          }
        })
      },
      getCheckedIds: function() {
        var t = [];
        return this.$props.dataList && this.$props.dataList.forEach((function(n) {
          t.push(n.cart_id)
        })), t
      },
      onDelete: function() {
        var n = this,
          o = n.getCheckedIds();
        if (!o.length) return n.showError("您还没有选择商品"), !1;
        t.index.showModal({
          title: "提示",
          content: "您确定要清空购物车吗?",
          success: function(t) {
            t.confirm && n._post("order.cart/delete", {
              cart_id: o.join()
            }, (function(t) {
              n.$emit("get-shopping-num")
            }))
          }
        })
      }
    }
  },
  o = t._export_sfc(n, [
    ["render", function(n, o, e, i, r, c) {
      return t.e({
        a: r.show
      }, r.show ? {
        b: t.o((function() {
          return c.onDelete && c.onDelete.apply(c, arguments)
        }), "4c"),
        c: t.f(e.dataList, (function(n, o, e) {
          return t.e({
            a: n.product_image,
            b: t.t(n.product_name),
            c: t.o((function(t) {
              return c.clickDel(n)
            }), n),
            d: n.product_attr
          }, n.product_attr ? {
            e: t.t(n.product_attr)
          } : {}, {
            f: t.t(n.product_price),
            g: t.o((function(t) {
              return c.reduceFunc(n)
            }), n),
            h: t.t(n.total_num),
            i: t.o((function(t) {
              return c.addFunc(n)
            }), n),
            j: n
          })
        })),
        d: t.o((function() {
          return c.closeMask && c.closeMask.apply(c, arguments)
        }), "92")
      } : {})
    }]
  ]);
wx.createComponent(o);