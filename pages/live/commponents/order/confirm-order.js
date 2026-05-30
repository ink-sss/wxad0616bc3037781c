var t = require("../../../../@babel/runtime/helpers/defineProperty"),
  o = require("../../../../@babel/runtime/helpers/objectSpread2"),
  e = require("../../../../common/vendor.js");
require("../../../../env/config.js");
var r = require("../../../../common/pay.js"),
  i = {
    components: {
      Myinfo: function() {
        return "./my-info.js"
      },
      Coupon: function() {
        return "./coupon.js"
      },
      Dist: function() {
        return "./distr.js"
      },
      Upload: function() {
        return "../../../../components/upload/upload2.js"
      },
      uniIcons: function() {
        return "../../../../components/uni-icon/uni-icon.js"
      },
      lineDashed: function() {
        return "../parallelogram-dashed-linp.js"
      },
      InputModal: function() {
        return "../input-modal.js"
      },
      addressAdd: function() {
        return "./address/add.js"
      },
      addressList: function() {
        return "./address/address.js"
      },
      cashier: function() {
        return "./cashier.js"
      }
    },
    data: function() {
      return {
        confirm: [],
        isUpload: !1,
        loading: !0,
        options: {
          order_type: "buy"
        },
        indicatorDots: !0,
        autoplay: !0,
        interval: 2e3,
        duration: 500,
        ProductData: [],
        OrderData: [],
        exist_address: !1,
        Address: {
          region: []
        },
        extract_store: [],
        last_extract: {},
        delivery: 10,
        store_id: 0,
        coupon_id: -1,
        is_use_points: 1,
        remark: "",
        pay_type: 20,
        isCoupon: !1,
        coupon_list: {},
        couponList: [],
        coupon_num: 0,
        isDist: !1,
        temlIds: [],
        product_couponid: 0,
        chooseSotr: 0,
        deliverySetting: [],
        choose_delivery: 10,
        store_data: {},
        choose_store_id: 0,
        store_list: {},
        room_id: "",
        showAlipay: !1,
        balance: "",
        store_open: 1,
        urldata: "",
        btnAtrrpx: {},
        mpState: null,
        index: 0,
        date: "请选择",
        time: "请选择",
        defaultDate: "",
        defaultTime: "",
        linkman: "",
        phone: "",
        clock: !1,
        specAttr: [],
        product_spec_type: 0,
        product_sku_id_arr: [],
        is_go_buy: !1,
        modalVisible: !1,
        popup_type: "",
        address_add_show: !1,
        address_list_show: !1,
        product_id: 0,
        product_num: 1,
        product_sku_id: "0",
        address_switch: 1,
        after_payment_pic: "",
        currentOrderId: 0
      }
    },
    created: function() {
      var t = this,
        o = e.index.getStorageSync("mpState");
      this.mpState = o, "mp" == this.getPlatform() && (this.urldata = window.location.href), t.$fire.on("selectStoreId", (function(o) {
        o && (t.extract_store = o, t.choose_store_id = o.store_id)
      })), t.$fire.on("checkedfir", (function(o) {
        t.choose_delivery = o
      }));
      var r = {
        height: 72,
        borderRadius: 40,
        fontSize: 28,
        width: 236
      };
      e.index.getSystemInfo({
        success: function(o) {
          var e = o.screenWidth / 750,
            i = {};
          for (var n in r) i[n] = r[n] * e;
          t.btnAtrrpx = i
        },
        fail: function() {
          t.btnAtrrpx = r
        }
      })
    },
    props: {
      product_id_n: {
        type: [String, Number],
        default: 0
      },
      product_num_n: {
        type: [String, Number],
        default: 0
      },
      product_sku_id_n: {
        type: [String, Number],
        default: "0"
      },
      liveId: {
        type: [Number, String],
        default: 0
      }
    },
    watch: {
      product_id_n: function(t, o) {
        this.product_id = t
      },
      product_num_n: function(t, o) {
        this.product_num = t
      },
      product_sku_id_n: function(t, o) {
        this.product_sku_id = t
      }
    },
    mounted: function() {
      this.product_id = this.product_id_n, this.product_num = this.product_num_n, this.product_sku_id = this.product_sku_id_n, this.showShowList()
    },
    methods: {
      goShopDetail: function() {
        this.gotoPage("pages/product/detail/detail?product_id=" + this.product_id)
      },
      refreshData: function() {
        this.getData()
      },
      popupClose: function() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
          o = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
        ("add" == t || "list" == t) && (this.popup_type = ""), o && this.getData()
      },
      maskClick: function() {
        console.log("popup_typepopup_typepopup_typepopup_type"), console.log(this.popup_type), "add" == this.popup_type ? (this.$refs.addressAddPop.closePopup(), this.popup_type = "") : "list" == this.popup_type ? this.popup_type = this.$refs.addressListPop.closePopup() : this.closePopup()
      },
      goAddressPage: function(t) {
        var o = this;
        "add" == t ? (this.address_add_show ? this.$refs.addressAddPop.showPopup() : (this.address_add_show = !0, this.$nextTick((function() {
          o.$refs.addressAddPop.showPopup()
        }))), this.popup_type = "add") : (this.address_list_show ? this.$refs.addressListPop.showPopup() : (this.address_list_show = !0, this.$nextTick((function() {
          o.$refs.addressListPop.showPopup()
        }))), this.popup_type = "list")
      },
      addNewAddress: function() {
        var t = this;
        this.$refs.addressListPop.closePopup(), setTimeout((function() {
          t.address_add_show ? t.$refs.addressAddPop.showPopup() : (t.address_add_show = !0, t.$nextTick((function() {
            t.$refs.addressAddPop.showPopup()
          }))), t.popup_type = "add"
        }), 300)
      },
      setData: function() {
        this.options = {
          order_type: "buy",
          product_id: this.product_id,
          product_num: this.product_num,
          product_sku_id: this.product_sku_id
        }, this.product_sku_id_arr = this.product_sku_id.split("_"), this.getData()
      },
      editpopup: function(t) {
        t.show || (this.modalVisible = !1)
      },
      handleConfirm: function(t) {
        this.is_go_buy || (this.options.product_num = t, this.getData())
      },
      handleCancel: function() {},
      editNumCustomize: function() {
        this.is_go_buy || (this.modalVisible = !0)
      },
      editNum: function(t) {
        this.is_go_buy || ("del" == t && this.options.product_num > 1 ? (this.options.product_num--, this.getData()) : "add" == t && (this.options.product_num++, this.getData()))
      },
      editSpace: function(t, o) {
        this.is_go_buy || (this.product_sku_id_arr[t] = o, this.options.product_sku_id = this.product_sku_id_arr.join("_"), this.getData())
      },
      closePopup: function() {
        this.$refs.orderList.close()
      },
      showShowList: function() {
        e.index.setStorageSync("exitImGroup", "no"), this.specAttr = [], this.product_spec_type = 0, this.product_sku_id_arr = [], this.$refs.orderList.open("bottom"), this.setData()
      },
      subscribeSuccess: function() {
        this.SubmitOrder()
      },
      subscribeFail: function() {
        this.SubmitOrder()
      },
      getTemplateId: function() {
        var t = this;
        t._post("index/getSignPackage", {
          url: t.urldata,
          paySource: t.getPlatform()
        }, (function(o) {
          t.mpMessage(o.data.signPackage)
        }))
      },
      init: function() {
        var e = "",
          r = "",
          i = this;
        i.ProductData.forEach((function(n, s) {
          e = n.shop_supplier_id, r = {
            coupon_id: n.orderData.coupon_id,
            delivery: n.orderData.delivery,
            store_id: n.orderData.extract_store.store_id || 0,
            remark: ""
          }, i.store_data = o(o({}, i.store_data), {}, t({}, e, r))
        }))
      },
      hasType: function(t) {
        return -1 != this.deliverySetting.indexOf(t)
      },
      openUpload: function(t) {
        this.index = t, this.isUpload = !0
      },
      getImgsFunc: function(t) {
        var o = this;
        if (t && void 0 !== t) {
          var e = o.index;
          o.confirm[e].value = o.confirm[e].value.concat(t)
        }
        o.isUpload = !1
      },
      deleteImg: function(t, o) {
        this.confirm[t].value.splice(o, 1)
      },
      getCurrentDate: function() {
        var t = new Date;
        return "".concat(t.getFullYear(), "-").concat(String(t.getMonth() + 1).padStart(2, "0"), "-").concat(String(t.getDate()).padStart(2, "0"))
      },
      getCurrentTime: function() {
        var t = new Date;
        return "".concat(String(t.getHours()).padStart(2, "0"), ":").concat(String(t.getMinutes()).padStart(2, "0"), ":").concat(String(t.getSeconds()).padStart(2, "0"))
      },
      formpost: function(t, o) {
        var e = document.createElement("form");
        for (var r in e.action = t, e.method = "post", e.target = "_self", e.style.display = "none", o) {
          var i = document.createElement("input");
          i.name = r, i.value = o[r], e.appendChild(i)
        }
        document.body.appendChild(e), this.$nextTick((function(t) {
          e.submit()
        }))
      },
      bindDateChange: function(t, o) {
        this.confirm[o].value = t.detail.value
      },
      bindTimeChange: function(t, o) {
        this.confirm[o].value = t.detail.value
      },
      getDate: function(t) {
        var o = new Date,
          e = o.getFullYear(),
          r = o.getMonth() + 1,
          i = o.getDate();
        return "start" === t ? e -= 60 : "end" === t && (e += 2), r = r > 9 ? r : "0" + r, i = i > 9 ? i : "0" + i, "".concat(e, "-").concat(r, "-").concat(i)
      },
      uploadpic: function(t, o) {
        var e = this;
        this.canvasStatus = !0, this.utils.uploadImageChange("/front/file/upload/image", (function(t) {
          o.value.push(t.data.url)
        }), (function(t) {
          e.canvasStatus = !1
        }), (function(t) {
          e.canvasWidth = t.w, e.canvasHeight = t.h
        }))
      },
      DelPic: function(t, o) {
        this.confirm[t].value, this.confirm[t].value.splice(o, 1)
      },
      payTypeFunc: function(t) {
        this.pay_type = t
      },
      onShowPoints: function(t) {
        var o = this;
        t.detail.value ? o.is_use_points = 1 : o.is_use_points = 0, o.getData()
      },
      onTogglePopupCoupon: function(t, o) {
        var e = this;
        e.chooseSotr = 0 != o ? o.shop_supplier_id : 0, e.isCoupon = !0, e.couponList = t
      },
      closeCouponFunc: function(t) {
        var o = this;
        if (t && "number" != typeof t) o.isCoupon = !1;
        else {
          if (0 != o.chooseSotr) {
            var e = o.chooseSotr;
            o.store_data[e].coupon_id = t > 0 ? t : 0, o.chooseSotr = 0
          } else o.coupon_id = t > 0 ? t : 0;
          o.isCoupon = !1, o.getData()
        }
      },
      getData: function() {
        var t = this;
        e.index.showLoading({
          title: "加载中"
        });
        var r = function(o) {
            t.OrderData = o.data.orderInfo.orderData, t.OrderData.address && (t.linkman = t.OrderData.address.name, t.phone = t.OrderData.address.phone), t.temlIds = o.data.template_arr, t.ProductData = o.data.orderInfo.supplierList, t.exist_address = t.OrderData.exist_address, t.Address = t.OrderData.address, t.product_spec_type = o.data.product_spec_type, t.address_switch = o.data.address_switch, null != o.data.specData && 20 == o.data.product_spec_type && (t.specAttr = o.data.specData.spec_attr), t.ProductData.forEach((function(o) {
              o.productList.forEach((function(o) {
                t.confirm = o.custom_form
              }))
            })), t.confirm && t.confirm.map((function(t) {
              "img" === t.label && (t.value = [])
            })), t.last_extract = t.OrderData.last_extract, "deposit" != t.options.order_type && (t.coupon_list = t.OrderData.coupon_list, t.coupon_id = t.OrderData.coupon_id_sys, t.coupon_num = Object.keys(t.coupon_list).length), t.balance = o.data.balance, t.store_open = o.data.store_open, 0 == t.OrderData.order_pay_price && (t.pay_type = 10), "{}" == JSON.stringify(t.store_data) && t.init(), o.data.show_alipay && (t.showAlipay = !0), t.loading = !1, e.index.hideLoading()
          },
          i = {
            delivery: t.delivery,
            store_id: t.store_id,
            coupon_id: t.coupon_id,
            is_use_points: t.is_use_points,
            pay_source: t.getPlatform(),
            room_new_id: t.liveId
          };
        "{}" == JSON.stringify(t.store_data) || (i = o(o({}, i), {}, {
          supplier: t.store_data
        })), t.is_go_buy = !0, "buy" === t.options.order_type ? t._get("order.order/buy", {
          params: JSON.stringify(Object.assign({}, i, {
            product_id: t.options.product_id,
            product_num: t.options.product_num,
            product_sku_id: t.options.product_sku_id
          }))
        }, (function(o) {
          t.is_go_buy = !1, r(o)
        }), (function(o) {
          t.closePopup(), t.is_go_buy = !1, e.index.hideLoading()
        })) : "deposit" === t.options.order_type ? (Object.assign({}, i, {
          product_id: t.options.product_id,
          product_num: t.options.product_num,
          product_sku_id: t.options.product_sku_id,
          advance_product_sku_id: t.options.advance_product_sku_id,
          advance_product_id: t.options.advance_product_id
        }), t._get("plus.advance.Order/frontBuy", {
          params: JSON.stringify(Object.assign({}, i, {
            product_id: t.options.product_id,
            product_num: t.options.product_num,
            product_sku_id: t.options.product_sku_id,
            advance_product_sku_id: t.options.advance_product_sku_id,
            advance_product_id: t.options.advance_product_id
          }))
        }, (function(t) {
          r(t)
        }), (function(t) {
          e.index.navigateBack()
        }))) : "retainage" === t.options.order_type ? t._get("plus.advance.Order/buy", {
          params: JSON.stringify(Object.assign({}, i, {
            order_id: t.options.order_id
          }))
        }, (function(t) {
          r(t)
        }), (function(t) {
          e.index.navigateBack()
        })) : "cart" === t.options.order_type ? t._get("order.order/cart", {
          params: JSON.stringify(Object.assign({}, i, {
            cart_ids: t.options.cart_ids || 0
          }))
        }, (function(t) {
          r(t)
        }), (function(t) {
          e.index.navigateBack()
        })) : "points" == t.options.order_type ? t._get("plus.points.order/buy", {
          params: JSON.stringify(Object.assign({}, i, {
            point_product_id: t.options.point_product_id,
            product_sku_id: t.options.product_sku_id,
            point_product_sku_id: t.options.point_product_sku_id,
            product_num: t.options.product_num
          }))
        }, (function(t) {
          r(t)
        }), (function(t) {
          e.index.navigateBack()
        })) : "seckill" === t.options.order_type ? t._get("plus.seckill.order/buy", {
          params: JSON.stringify(Object.assign({}, i, {
            seckill_product_id: t.options.seckill_product_id,
            product_sku_id: t.options.product_sku_id,
            seckill_product_sku_id: t.options.seckill_product_sku_id,
            time_id: t.options.time_id,
            product_num: t.options.product_num
          }))
        }, (function(t) {
          r(t)
        }), (function(t) {
          e.index.navigateBack()
        })) : "bargain" === t.options.order_type ? t._get("plus.bargain.order/buy", {
          params: JSON.stringify(Object.assign({}, i, {
            bargain_product_id: t.options.bargain_product_id,
            product_sku_id: t.options.product_sku_id,
            bargain_product_sku_id: t.options.bargain_product_sku_id,
            bargain_task_id: t.options.bargain_task_id
          }))
        }, (function(t) {
          r(t)
        }), (function(t) {
          e.index.navigateBack()
        })) : "assemble" === t.options.order_type && t._get("plus.assemble.order/buy", {
          params: JSON.stringify(Object.assign({}, i, {
            assemble_product_id: t.options.assemble_product_id,
            product_sku_id: t.options.product_sku_id,
            assemble_product_sku_id: t.options.assemble_product_sku_id,
            product_num: t.options.product_num,
            assemble_bill_id: t.options.assemble_bill_id
          }))
        }, (function(t) {
          r(t)
        }), (function(t) {
          e.index.navigateBack()
        }))
      },
      toDecimal2: function(t) {
        var o = parseFloat(t);
        if (isNaN(o)) return "0.00";
        o = Math.round(100 * t);
        var e = Math.round(1e3 * t).toString().split("");
        (e = e[e.length - 1]) >= 5 ? o = (o - 1) / 100 : o /= 100;
        var r = o.toString(),
          i = r.indexOf(".");
        for (i < 0 && (i = r.length, r += "."); r.length <= i + 2;) r += "0";
        return r
      },
      DistUp: function(t) {
        if (30 != t.orderData.delivery) {
          var o = this;
          o.store_id = t.shop_supplier_id, o.chooseSotr = t.shop_supplier_id, o.choose_delivery = t.orderData.delivery, o.chooseSotr, o.getData(), o.deliverySetting = t.orderData.deliverySetting, o.extract_store = t.orderData.extract_store, this.isDist = !0
        }
      },
      closeDistFunc: function(t) {
        var o = this;
        if (o.isDist = !1, console.log("closeDistFunc"), console.log(t), console.log(t.checked_id), t.checked_id) {
          o.choose_delivery = t.checked_id;
          var e = "";
          o.extract_store.region && (e = o.extract_store.region.province + o.extract_store.region.city + o.extract_store.region.region + o.extract_store.store_name);
          var r = o.chooseSotr,
            i = o.choose_store_id;
          o.delivery = o.choose_delivery, o.store_id = r, o.store_data[r].store_id = i, o.store_data[r].delivery = o.choose_delivery, o.store_list[r] = e, o.chooseSotr = 0, o.show_extract = t.show_extract, o.getData()
        }
      },
      objKeys: function(t, o) {
        if (t) return 1 == o ? Object.keys(t).length : Object.keys(t)
      },
      SubmitOrder: function() {
        var t = this;
        if (!t.OrderData.show_extract || t.phone && t.linkman)
          if (1 != t.address_switch || !t.OrderData.show_address || t.exist_address) {
            if (this.confirm)
              for (var o = 0; o < this.confirm.length; o++) {
                var r = this.confirm[o];
                if (r.status) {
                  if (("text" === r.label || "data" === r.label || "time" === r.label || "id" === r.label) && !r.value.trim()) return e.index.showToast({
                    title: "请输入".concat(r.title),
                    icon: "none"
                  });
                  if ("number" === r.label && r.value <= 0) return e.index.showToast({
                    title: "请输入".concat(r.title),
                    icon: "none"
                  });
                  if ("email" === r.label && !/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(r.value)) return e.index.showToast({
                    title: "请输入正确的".concat(r.title),
                    icon: "none"
                  });
                  if ("phone" === r.label && !/^1(3|4|5|7|8|9|6)\d{9}$/i.test(r.value)) return e.index.showToast({
                    title: "请输入正确的".concat(r.title),
                    icon: "none"
                  });
                  if ("img" === r.label && !r.value.length > 0) return e.index.showToast({
                    title: "请上传".concat(r.title),
                    icon: "none"
                  })
                }
              }
            e.index.showLoading({
              title: "加载中",
              mask: !0
            });
            var i = {
              pay_type: t.pay_type,
              room_new_id: t.liveId,
              coupon_id: t.coupon_id,
              is_use_points: t.is_use_points,
              custom_form: t.confirm,
              phone: t.phone || "",
              linkman: t.linkman
            };
            i = Object.assign(i, {
              supplier: t.store_data
            });
            var n = "";
            "buy" === t.options.order_type && (n = "order.order/buy", i = Object.assign(i, {
              product_id: t.options.product_id,
              product_num: t.options.product_num,
              product_sku_id: t.options.product_sku_id,
              room_new_id: t.liveId || 0
            }), i = JSON.stringify(i)), "deposit" === t.options.order_type && (n = "plus.advance.Order/frontBuy", i = Object.assign(i, {
              product_id: t.options.product_id,
              product_num: t.options.product_num,
              product_sku_id: t.options.product_sku_id,
              advance_product_sku_id: t.options.advance_product_sku_id,
              advance_product_id: t.options.advance_product_id
            }), i = JSON.stringify(i)), "retainage" === t.options.order_type && (n = "plus.advance.Order/buy", i = Object.assign(i, {
              order_id: t.options.order_id
            }), i = JSON.stringify(i)), "cart" === t.options.order_type && (n = "order.order/cart", i = Object.assign(i, {
              cart_ids: t.options.cart_ids || 0,
              room_id: t.options.room_id || 0
            }), i = JSON.stringify(i)), "points" === t.options.order_type && (n = "plus.points.order/buy", i = Object.assign(i, {
              point_product_id: t.options.point_product_id,
              product_sku_id: t.options.product_sku_id,
              point_product_sku_id: t.options.point_product_sku_id,
              product_num: t.options.product_num
            }), i = JSON.stringify(i)), "seckill" === t.options.order_type && (n = "plus.seckill.order/buy", i = Object.assign(i, {
              seckill_product_id: t.options.seckill_product_id,
              product_sku_id: t.options.product_sku_id,
              seckill_product_sku_id: t.options.seckill_product_sku_id,
              time_id: t.options.time_id,
              product_num: t.options.product_num
            }), i = JSON.stringify(i)), "bargain" === t.options.order_type && (n = "plus.bargain.order/buy", i = Object.assign(i, {
              bargain_product_id: t.options.bargain_product_id,
              product_sku_id: t.options.product_sku_id,
              bargain_product_sku_id: t.options.bargain_product_sku_id,
              bargain_task_id: t.options.bargain_task_id
            }), i = JSON.stringify(i)), "assemble" === t.options.order_type && (n = "plus.assemble.order/buy", i = Object.assign(i, {
              assemble_product_id: t.options.assemble_product_id,
              product_sku_id: t.options.product_sku_id,
              assemble_product_sku_id: t.options.assemble_product_sku_id,
              assemble_bill_id: t.options.assemble_bill_id,
              product_num: t.options.product_num
            }), i = JSON.stringify(i)), t.clock || (t.clock = !0, t.subMessage(t.temlIds, (function() {
              t._post(n, {
                params: i
              }, (function(o) {
                t.clock = !1, e.index.hideLoading();
                var r;
                r = "deposit" == t.options.order_type || "retainage" == t.options.order_type ? o.data.order_id : o.data.order_id.join(","), t.currentOrderId = r, t.closePopup(), t.$refs.cashierDialog.open()
              }), (function(o) {
                t.clock = !1, e.index.hideLoading()
              }))
            })))
          } else e.index.showToast({
            title: "请选择收货地址",
            icon: "none"
          });
        else e.index.showToast({
          title: "请填写自提信息",
          icon: "none"
        })
      },
      paySubmit: function(t) {
        var o = this,
          i = {
            order_id: t.order_id,
            pay_source: o.getPlatform(),
            payType: 20,
            use_balance: t.useBalance,
            use_cash_on_delivery: t.useCashOnDelivery
          };
        e.index.showLoading({}), o._post("user.order/pay", i, (function(t) {
          if (o.loading = !1, o.isPay = !0, e.index.hideLoading(), 10 == t.data.pay_type || 40 == t.data.pay_type) {
            var i = "支付成功";
            40 == t.data.pay_type && (i = "下单成功"), e.index.showToast({
              title: i,
              icon: "success",
              duration: 4e3
            }), r.pay(t, o, o.paySuccess, o.payError)
          } else r.pay(t, o, o.paySuccess, o.payError);
          o.paySuccess()
        }), (function(t) {
          e.index.hideLoading()
        }))
      },
      paySuccess: function(t) {
        var o = this;
        this.closePopup(), t && 1 == t.code && (this.after_payment_pic = "", this._post("product.product/getProductAfterPaymentPic", {
          product_id: this.product_id
        }, (function(t) {
          1 == t.code && t.data && (o.after_payment_pic = t.data, o.$refs.pai.open())
        })))
      },
      payError: function(t) {},
      closeImg: function() {
        this.$refs.pai.close()
      }
    }
  };
Array || (e.resolveComponent("uni-icons") + e.resolveComponent("Myinfo") + e.resolveComponent("line-dashed") + e.resolveComponent("Coupon") + e.resolveComponent("Dist") + e.resolveComponent("Upload") + e.resolveComponent("Input-modal") + e.resolveComponent("address-add") + e.resolveComponent("address-list") + e.resolveComponent("uni-popup") + e.resolveComponent("cashier"))(), Math || (function() {
  return "../../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js"
} + function() {
  return "../../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
})();
var n = e._export_sfc(i, [
  ["render", function(t, o, r, i, n, s) {
    return e.e({
      a: !n.loading
    }, n.loading ? {} : e.e({
      b: e.o(s.closePopup, "b8"),
      c: e.p({
        type: "left-nav",
        size: "28",
        color: "#000"
      }),
      d: e.t(n.ProductData[0].supplier.name),
      e: n.OrderData.show_address
    }, n.OrderData.show_address ? {
      f: e.o(s.goAddressPage, "18"),
      g: e.p({
        dis: "retainage" == n.options.order_type,
        Address: n.Address,
        is_order: !0,
        exist_address: n.exist_address
      })
    } : {}, {
      h: n.OrderData.show_address
    }, (n.OrderData.show_address, {}), {
      i: e.f(n.ProductData, (function(o, r, i) {
        return e.e(n.store_open ? {
          a: e.t(o.supplier.name)
        } : {}, {
          b: null != o.productList
        }, null != o.productList ? {
          c: e.f(o.productList, (function(t, o, r) {
            return e.e({
              a: t.product_image,
              b: e.t(t.product_name),
              c: e.t(t.product_price),
              d: t.product_reduce_money > 0
            }, t.product_reduce_money > 0 ? {
              e: e.t(t.product_reduce_money)
            } : {}, {
              f: 1 == t.is_user_grade
            }, 1 == t.is_user_grade ? {
              g: e.t(t.grade_product_price)
            } : {}, {
              h: t.delivery_name
            }, t.delivery_name ? {
              i: e.t(t.delivery_name)
            } : {}, {
              j: e.o((function(t) {
                return s.editNum("del")
              }), o),
              k: e.o((function() {
                return s.editNumCustomize && s.editNumCustomize.apply(s, arguments)
              }), o),
              l: e.o((function(t) {
                return s.editNum("add")
              }), o),
              m: "4d544580-4-" + i + "-" + r + ",4d544580-0",
              n: e.o((function() {
                return s.goShopDetail && s.goShopDetail.apply(s, arguments)
              }), o),
              o: o
            })
          })),
          d: t.config.pic_url + "/static/live/pro_del.png",
          e: e.t(n.options.product_num),
          f: t.config.pic_url + "/static/live/pro_add.png",
          g: e.p({
            type: "arrowright",
            size: "18",
            color: "#bababa"
          })
        } : {}, {
          h: e.f(n.specAttr, (function(t, o, r) {
            return {
              a: e.t(t.group_name),
              b: e.f(t.spec_items, (function(t, r, i) {
                return {
                  a: e.t(t.spec_value),
                  b: e.o((function(e) {
                    return s.editSpace(o, t.item_id)
                  }), r),
                  c: n.product_sku_id_arr[o] == t.item_id ? 1 : "",
                  d: r
                }
              })),
              c: o
            }
          })),
          i: e.f(o.buyProduct, (function(t, o, r) {
            return e.e({
              a: t.product_image,
              b: e.t(t.product_name),
              c: t.product_sku.product_attr
            }, t.product_sku.product_attr ? {
              d: e.t(t.product_sku.product_attr)
            } : {}, {
              e: t.line_price > 0
            }, t.line_price > 0 ? {
              f: e.t(t.line_price)
            } : {}, {
              g: e.t(t.total_num),
              h: "gift_" + o
            })
          })),
          j: 10 == o.orderData.delivery
        }, (o.orderData.delivery, {}), {
          k: 20 == o.orderData.delivery
        }, 20 == o.orderData.delivery ? {
          l: e.t(o.orderData.extract_store ? o.orderData.extract_store.store_name : "无")
        } : {}, {
          m: 30 == o.orderData.delivery
        }, (o.orderData.delivery, {}), {
          n: 30 != o.orderData.delivery
        }, 30 != o.orderData.delivery ? e.e({
          o: 10 == o.orderData.delivery
        }, 10 == o.orderData.delivery ? {
          p: e.t(0 != o.orderData.express_price ? "￥ " + o.orderData.express_price : "快递 免费")
        } : {}) : {}, {
          q: e.o((function(t) {
            return s.DistUp(o)
          }), r)
        }, "deposit" == n.options.order_type ? {
          r: e.t(n.OrderData.order_total_front_price),
          s: e.t(n.OrderData.order_total_pay_price),
          t: e.t(n.OrderData.reduce_money),
          v: e.t(o.productList[0].advance.active_time[0]),
          w: e.t(o.productList[0].advance.active_time[1])
        } : e.e({
          x: !n.OrderData.force_points
        }, n.OrderData.force_points ? {} : e.e({
          y: s.objKeys(o.orderData.couponList, 1) > 0
        }, s.objKeys(o.orderData.couponList, 1) > 0 ? e.e({
          z: o.orderData.coupon_money > 0
        }, o.orderData.coupon_money > 0 ? {
          A: e.t(o.orderData.coupon_money),
          B: e.o((function(t) {
            return s.onTogglePopupCoupon(o.orderData.couponList, o)
          }), r)
        } : {
          C: e.t(s.objKeys(o.orderData.couponList, 1)),
          D: e.o((function(t) {
            return s.onTogglePopupCoupon(o.orderData.couponList, o)
          }), r)
        }) : {}), {
          E: o.orderData.reduce
        }, o.orderData.reduce ? {
          F: e.t(o.orderData.reduce.active_name),
          G: e.t(o.orderData.reduce.reduced_price)
        } : {}, {
          H: o.orderData.reduce_money
        }, o.orderData.reduce_money ? {
          I: e.t(o.orderData.reduce_money)
        } : {}, {
          J: 1 == n.is_use_points && !n.OrderData.force_points && o.orderData.points_money > 0
        }, 1 == n.is_use_points && !n.OrderData.force_points && o.orderData.points_money > 0 ? {
          K: e.t(t.points_name()),
          L: e.t(o.orderData.points_money)
        } : {}, {
          M: n.store_data[o.shop_supplier_id].remark,
          N: e.o((function(t) {
            return n.store_data[o.shop_supplier_id].remark = t.detail.value
          }), r),
          O: e.t(o.productList.length),
          P: e.t(o.orderData.order_total_price),
          Q: !n.OrderData.force_points
        }, n.OrderData.force_points ? {} : {
          R: e.t(s.toDecimal2(o.orderData.order_pay_price))
        }), {
          S: r
        })
      })),
      j: n.store_open,
      k: "deposit" == n.options.order_type,
      l: "deposit" != n.options.order_type
    }, "deposit" != n.options.order_type ? e.e({
      m: e.t(n.OrderData.order_total_price),
      n: n.OrderData.is_coupon
    }, n.OrderData.is_coupon ? e.e({
      o: n.coupon_num > 0
    }, n.coupon_num > 0 ? e.e({
      p: n.OrderData.coupon_money_sys > 0
    }, n.OrderData.coupon_money_sys > 0 ? {
      q: e.t(n.OrderData.coupon_money_sys),
      r: e.o((function(t) {
        return s.onTogglePopupCoupon(n.coupon_list, 0)
      }), "f0")
    } : {
      s: e.t(n.coupon_num),
      t: e.o((function(t) {
        return s.onTogglePopupCoupon(n.coupon_list, 0)
      }), "77")
    }) : {}) : {}, {
      v: n.OrderData.product_reduce_money > 0
    }, n.OrderData.product_reduce_money > 0 ? {
      w: e.t(n.OrderData.product_reduce_money)
    } : {}, {
      x: n.OrderData.reduce_money
    }, n.OrderData.reduce_money ? {
      y: e.t(n.OrderData.reduce_money)
    } : {}, {
      z: n.OrderData.is_allow_points && 0 == n.OrderData.force_points && 0 != n.OrderData.points_money
    }, n.OrderData.is_allow_points && 0 == n.OrderData.force_points && 0 != n.OrderData.points_money ? {
      A: e.t(t.points_name()),
      B: e.t(s.toDecimal2(n.OrderData.points_money)),
      C: e.o((function() {
        return s.onShowPoints && s.onShowPoints.apply(s, arguments)
      }), "9d")
    } : {}) : {}, {
      D: n.confirm && null != n.confirm
    }, n.confirm && null != n.confirm ? {
      E: e.f(n.confirm, (function(t, o, r) {
        return e.e({
          a: t.status
        }, (t.status, {}), {
          b: e.t(t.title),
          c: "text" == t.label
        }, "text" == t.label ? {
          d: "请填写" + t.title,
          e: t.value,
          f: e.o((function(o) {
            return t.value = o.detail.value
          }), o)
        } : {}, {
          g: "number" == t.label
        }, "number" == t.label ? {
          h: "请填写" + t.title,
          i: t.value,
          j: e.o((function(o) {
            return t.value = o.detail.value
          }), o)
        } : {}, {
          k: "email" == t.label
        }, "email" == t.label ? {
          l: "请填写" + t.title,
          m: t.value,
          n: e.o((function(o) {
            return t.value = o.detail.value
          }), o)
        } : {}, {
          o: "data" == t.label
        }, "data" == t.label ? e.e({
          p: "" == t.value
        }, "" == t.value ? {
          q: e.t(n.date + t.title)
        } : {
          r: e.t(t.value)
        }, {
          s: t.value,
          t: e.o((function(t) {
            return s.bindDateChange(t, o)
          }), o)
        }) : {}, {
          v: "time" == t.label
        }, "time" == t.label ? e.e({
          w: "" == t.value
        }, "" == t.value ? {
          x: e.t(n.time + t.title)
        } : {}, {
          y: e.t(t.value),
          z: t.value,
          A: e.o((function(t) {
            return s.bindTimeChange(t, o)
          }), o)
        }) : {}, {
          B: "id" == t.label
        }, "id" == t.label ? {
          C: "请填写" + t.title,
          D: t.value,
          E: e.o((function(o) {
            return t.value = o.detail.value
          }), o)
        } : {}, {
          F: "phone" == t.label
        }, "phone" == t.label ? {
          G: "请填写" + t.title,
          H: t.value,
          I: e.o((function(o) {
            return t.value = o.detail.value
          }), o)
        } : {}, {
          J: o
        })
      }))
    } : {}, {
      F: n.OrderData.show_extract
    }, n.OrderData.show_extract ? {
      G: n.linkman,
      H: e.o((function(t) {
        return n.linkman = t.detail.value
      }), "1e"),
      I: n.phone,
      J: e.o((function(t) {
        return n.phone = t.detail.value
      }), "70")
    } : {}, {
      K: "deposit" == n.options.order_type
    }, "deposit" == n.options.order_type ? {
      L: e.t(n.OrderData.order_total_front_price)
    } : e.e({
      M: !n.OrderData.force_points
    }, n.OrderData.force_points ? {} : {
      N: e.t(n.OrderData.order_pay_price)
    }, {
      O: n.OrderData.force_points
    }, n.OrderData.force_points ? {
      P: e.t(t.points_name()),
      Q: e.t(n.ProductData[0].orderData.points_num)
    } : {}), {
      R: e.o((function() {
        return s.SubmitOrder && s.SubmitOrder.apply(s, arguments)
      }), "5e"),
      S: e.o(s.closeCouponFunc, "f8"),
      T: e.p({
        isCoupon: n.isCoupon,
        couponList: n.couponList
      }),
      U: e.o(s.closeDistFunc, "d4"),
      V: e.p({
        choose_delivery: n.choose_delivery,
        isDist: n.isDist,
        chooseSotr: n.chooseSotr,
        extract_store: n.extract_store,
        last_extract: n.last_extract,
        deliverySetting: n.deliverySetting
      }),
      W: n.isUpload
    }, n.isUpload ? {
      X: e.o(s.getImgsFunc, "11"),
      Y: e.p({
        num: 1
      })
    } : {}, {
      Z: e.o(s.handleConfirm, "09"),
      aa: e.o(s.handleCancel, "ac"),
      ab: e.o((function(t) {
        return n.modalVisible = t
      }), "a8"),
      ac: e.p({
        title: "请输入购买件数",
        placeholder: "请输入购买件数...",
        defaultValue: n.options.product_num,
        textarea: !1,
        inputType: "number",
        visible: n.modalVisible
      }),
      ad: n.address_add_show
    }, n.address_add_show ? {
      ae: e.sr("addressAddPop", "4d544580-9,4d544580-0"),
      af: e.o(s.popupClose, "d3")
    } : {}, {
      ag: n.address_list_show
    }, n.address_list_show ? {
      ah: e.sr("addressListPop", "4d544580-10,4d544580-0"),
      ai: e.o(s.popupClose, "5d"),
      aj: e.o(s.refreshData, "51"),
      ak: e.o(s.addNewAddress, "e5")
    } : {}, {
      al: t.theme(),
      am: e.n(t.theme() || "")
    }), {
      an: e.sr("orderList", "4d544580-0"),
      ao: e.o(s.maskClick, "f1"),
      ap: e.o(s.editpopup, "b7"),
      aq: e.p({
        "is-mask-click": !1,
        type: "bottom",
        "background-color": "#fff",
        "border-radius": "20px 20px 0 0"
      }),
      ar: e.o(s.closeImg, "59"),
      as: e.p({
        type: "clear",
        size: "40",
        color: "#ffffff"
      }),
      at: n.after_payment_pic,
      av: e.sr("pai", "4d544580-11"),
      aw: e.p({
        "is-mask-click": !1
      }),
      ax: e.sr("cashierDialog", "4d544580-13"),
      ay: e.o(s.paySubmit, "82"),
      az: e.p({
        order_id: n.currentOrderId
      })
    })
  }],
  ["__scopeId", "data-v-4d544580"]
]);
wx.createComponent(n);