var o = require("../../../../@babel/runtime/helpers/typeof"),
  s = require("../../../../common/vendor.js"),
  t = {
    data: function() {
      return {
        Visible: !1,
        form: {
          detail: {},
          show_sku: {
            sku_image: ""
          }
        },
        stock: 0,
        selectSpec: "",
        isOpenSpec: !1,
        type: "",
        clock: !1
      }
    },
    props: ["isPopup", "productModel", "room_id", "specDisabled", "isCategory"],
    onLoad: function() {},
    mounted: function() {},
    computed: {
      isadd: function() {
        return this.form.show_sku.sum >= this.stock || this.form.show_sku.sum >= this.form.detail.limit_num
      },
      issub: function() {
        return this.form.show_sku.sum <= 1
      }
    },
    watch: {
      isPopup: function(o, s) {
        o != s && (this.Visible = o, (!this.isOpenSpec || this.isOpenSpec && this.isCategory) && (this.form = this.productModel, this.isOpenSpec = !0, this.initShowSku()), this.form.type = this.productModel.type)
      },
      "form.specData": {
        handler: function(o, s) {
          var t = this,
            i = "",
            e = "";
          if (this.isAll = !0, o) {
            for (var r = function(s) {
                null == t.form.productSpecArr[s] ? (t.isAll = !1, i += o.spec_attr[s].group_name + " ") : o.spec_attr[s].spec_items.forEach((function(o) {
                  t.form.productSpecArr[s] == o.item_id && (e += '"' + o.spec_value + '" ')
                }))
              }, u = 0; u < o.spec_attr.length; u++) r(u);
            this.isAll ? e = "已选: " + e : i = "请选择: " + i
          }
          this.selectSpec = this.isAll ? e : i
        },
        deep: !0,
        immediate: !0
      }
    },
    methods: {
      initShowSku: function() {
        this.form.show_sku.sku_image = this.form.detail.image[0].file_path, this.form.show_sku.product_price = this.form.detail.product_price, 20 == this.form.detail.spec_type && this.form.detail.product_price != this.form.detail.product_max_price && (this.form.show_sku.product_price = this.form.detail.product_price + "-" + this.form.detail.product_max_price), this.form.show_sku.spec_sku_id = 0, this.form.show_sku.line_price = this.form.detail.line_price, this.form.show_sku.stock_num = this.form.detail.product_stock, this.stock = this.form.detail.product_stock, "advance" == this.form.plus_name && (this.form.show_sku.product_price = this.form.plus_sku[0].product_price, this.form.show_sku.line_price = "", this.form.show_sku.sku_image = this.form.plus_sku[0].productSku.image ? this.form.plus_sku[0].productSku.image.file_path : this.form.detail.image[0].file_path, this.form.show_sku.stock_num = this.form.plus_sku[0].advance_stock, this.stock = this.form.plus_sku[0].advance_stock), "seckill" == this.form.plus_name && (this.form.show_sku.product_price = this.form.plus_sku[0].seckill_price, this.form.show_sku.line_price = this.form.plus_sku[0].product_price, this.form.show_sku.sku_image = this.form.plus_sku[0].productSku.image ? this.form.plus_sku[0].productSku.image.file_path : this.form.detail.image[0].file_path, this.form.show_sku.stock_num = this.form.plus_sku[0].seckill_stock, this.stock = this.form.plus_sku[0].seckill_stock)
      },
      selectAttr: function(o, s) {
        var t = this,
          i = t.form.specData.spec_attr[o].spec_items,
          e = i[s];
        if (e.checked) e.checked = !1, t.form.productSpecArr[o] = null;
        else {
          for (var r = 0; r < i.length; r++) i[r].checked = !1;
          e.checked = !0, t.form.productSpecArr[o] = e.item_id
        }
        for (var u = 0; u < t.form.productSpecArr.length; u++)
          if (null == t.form.productSpecArr[u]) return void t.initShowSku();
        t.updateSpecProduct()
      },
      updateSpecProduct: function() {
        var s = this,
          t = s.form.productSpecArr.join("_"),
          i = s.form.specData.spec_list;
        null != s.form.plus_sku && (i = s.form.plus_sku);
        var e = i.find((function(o) {
          return s.form.plus_name ? o.productSku.spec_sku_id == t : o.spec_sku_id == t
        }));
        if (!e) return s.clock = !0, void s.initShowSku();
        s.clock = !1, s.form.plus_name && !e.spec_form && (e.spec_form = e.productSku), "object" == o(e) && (s.form.plus_name ? (s.stock = e[s.form.plus_name + "_stock"], s.form.show_sku.sum > s.stock && (s.form.show_sku.sum = s.stock > 0 ? s.stock : 1)) : (s.stock = e.spec_form.stock_num, s.form.show_sku.sum > s.stock && (s.form.show_sku.sum = s.stock > 0 ? s.stock : 1)), s.form.show_sku.spec_sku_id = t, s.form.show_sku.product_price = e.spec_form.product_price, s.form.show_sku.line_price = e.spec_form.line_price, s.form.show_sku.product_weight = e.spec_form.product_weight, e.spec_form.image_id > 0 ? s.form.show_sku.sku_image = e.spec_form.image_path : s.form.show_sku.sku_image = s.form.detail.image[0].file_path, s.form.show_sku.stock_num = e.spec_form.stock_num, s.form.plus_name && (s.form.show_sku.product_price = e.product_price, "seckill" == s.form.plus_name && (s.form.show_sku.product_price = e.seckill_price), s.form.show_sku.stock_num = e[s.form.plus_name + "_stock"], s.form.show_sku.line_price = "", s.form.show_sku.sku_image = e.spec_form.image ? e.spec_form.image.file_path : s.form.detail.image[0].file_path, s.form.show_sku.advance_product_id = e.spec_form.image ? e.spec_form.image.file_path : s.form.detail.image[0].file_path))
      },
      closePopup: function() {
        this.$emit("close", this.form.specData, null)
      },
      confirmFunc: function() {
        if (null != this.form.specData)
          for (var o = 0; o < this.form.productSpecArr.length; o++)
            if (null == this.form.productSpecArr[o]) return void s.index.showToast({
              title: "请选择规格",
              icon: "none",
              duration: 2e3
            });
        "card" == this.form.type ? this.addCart() : this.createdOrder()
      },
      addCart: function() {
        var o = this,
          t = o.form.detail.product_id,
          i = o.form.show_sku.sum,
          e = o.form.show_sku.spec_sku_id;
        if (20 == o.form.detail.spec_type && 0 == e) return s.index.showToast({
          title: "请选择属性",
          icon: "none",
          duration: 2e3
        }), !1;
        o._post("order.cart/add", {
          product_id: t,
          total_num: i,
          spec_sku_id: e
        }, (function(t) {
          s.index.showToast({
            title: t.msg,
            duration: 2e3
          }), o.$emit("close", null, t.data.cart_total_num)
        }))
      },
      createdOrder: function() {
        var o = this.form.detail.product_id,
          s = this.form.show_sku.sum,
          t = this.form.show_sku.spec_sku_id,
          i = "";
        0 != this.room_id & "" != this.room_id && (i = "&room_id=" + this.room_id);
        var e = "/pages/order/confirm-order?product_id=" + o + "&product_num=" + s + "&product_sku_id=" + t + "&order_type=buy" + i;
        if ("deposit" == this.form.type) {
          if ("advance" == this.form.plus_name) {
            var r = this.form.detail.advance.sku.find((function(o) {
              return o.productSku.spec_sku_id == t
            }));
            e = "/pages/order/confirm-order?product_id=" + o + "&product_num=" + s + "&product_sku_id=" + t + "&advance_product_sku_id=" + r.advance_product_sku_id + "&advance_product_id=" + r.advance_product_id + "&order_type=deposit"
          }
          if ("seckill" == this.form.plus_name) {
            var u = this.form.plus_sku.find((function(o) {
              return o.productSku.spec_sku_id == t
            }));
            e = "/pages/order/confirm-order?seckill_product_id=" + u.seckill_product_id + "&product_num=" + s + "&time_id=" + this.form.time_id + "&product_sku_id=" + u.productSku.spec_sku_id + "&seckill_product_sku_id=" + u.seckill_product_sku_id + "&order_type=seckill"
          }
        }
        this.gotoPage(e)
      },
      add: function() {
        if (!(this.stock <= 0)) return "seckill" == this.form.plus_name && this.form.detail.single_num > 0 && this.form.show_sku.sum >= this.form.detail.single_num ? (s.index.showToast({
          title: "数量超过了限购数量",
          icon: "none",
          duration: 2e3
        }), !1) : this.form.show_sku.sum >= this.stock ? (s.index.showToast({
          title: "数量超过了库存",
          icon: "none",
          duration: 2e3
        }), !1) : this.form.detail.limit_num > 0 && this.form.show_sku.sum >= this.form.detail.limit_num ? (s.index.showToast({
          title: "数量超过了限购数量",
          icon: "none",
          duration: 2e3
        }), !1) : void this.form.show_sku.sum++
      },
      sub: function() {
        if (!(this.stock <= 0)) return "seckill" != this.form.plus_name && this.form.detail.single_num > 0 && this.form.show_sku.sum <= this.form.detail.single_num ? (s.index.showToast({
          title: "该商品数量".concat(this.form.detail.single_num, "起购"),
          icon: "none",
          duration: 2e3
        }), !1) : this.form.show_sku.sum < 2 ? (s.index.showToast({
          title: "商品数量至少为1",
          icon: "none",
          duration: 2e3
        }), !1) : void this.form.show_sku.sum--
      }
    }
  },
  i = s._export_sfc(t, [
    ["render", function(o, t, i, e, r, u) {
      return s.e({
        a: s.o((function(s) {
          return o.yulan(r.form.show_sku.sku_image, 0)
        }), "9e"),
        b: r.form.show_sku.sku_image,
        c: s.t(r.form.show_sku.product_price),
        d: 1 * r.form.show_sku.line_price > 0
      }, 1 * r.form.show_sku.line_price > 0 ? {
        e: s.t(r.form.show_sku.line_price)
      } : {}, {
        f: s.t(r.form.show_sku.stock_num),
        g: s.t(r.selectSpec),
        h: o.isAll && r.form.show_sku.product_weight > 0
      }, o.isAll && r.form.show_sku.product_weight > 0 ? {
        i: s.t(r.form.show_sku.product_weight)
      } : {}, {
        j: s.o((function() {
          return u.closePopup && u.closePopup.apply(u, arguments)
        }), "dc"),
        k: null != r.form.specData
      }, null != r.form.specData ? {
        l: s.f(r.form.specData.spec_attr, (function(o, t, i) {
          return {
            a: s.t(o.group_name),
            b: s.f(o.spec_items, (function(o, i, e) {
              return {
                a: s.t(o.spec_value),
                b: s.n(o.checked ? "btn-checked" : "btn-checke"),
                c: i,
                d: s.o((function(o) {
                  return u.selectAttr(t, i)
                }), i)
              }
            })),
            c: t
          }
        }))
      } : {}, {
        m: r.form.detail.single_num > 0
      }, r.form.detail.single_num > 0 ? {
        n: s.t("".concat(r.form.detail.single_num, "个").concat("seckill" == r.form.plus_name ? "限购" : "起售"))
      } : {}, {
        o: s.o((function(o) {
          return u.sub()
        }), "53"),
        p: u.issub ? "" : 1,
        q: r.form.show_sku.sum,
        r: s.o((function(o) {
          return r.form.show_sku.sum = o.detail.value
        }), "5c"),
        s: u.isadd ? "" : 1,
        t: s.o((function(o) {
          return u.add()
        }), "40"),
        v: i.specDisabled
      }, i.specDisabled || r.clock ? {} : {
        x: s.o((function(o) {
          return u.confirmFunc(r.form)
        }), "77")
      }, {
        w: !r.clock,
        y: s.o((function() {}), "9b"),
        z: s.n(r.Visible ? "product-popup open" : "product-popup close"),
        A: s.o((function() {}), "34"),
        B: s.o((function() {
          return u.closePopup && u.closePopup.apply(u, arguments)
        }), "bb")
      })
    }]
  ]);
wx.createComponent(i);