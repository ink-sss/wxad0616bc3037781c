var e = require("../../../../common/vendor.js"),
  n = {
    components: {
      uniIcons: function() {
        return "../../../../components/uni-icon/uni-icon.js"
      }
    },
    data: function() {
      return {
        balance: "",
        balanceType: !1,
        type: 0,
        loading: !0,
        checkedPay: [],
        payPrice: 0,
        isPay: !1,
        cashOnDeliveryType: !1
      }
    },
    props: {
      order_id: {
        type: Number,
        default: 0
      },
      order_type: {
        type: Number,
        default: 0
      }
    },
    emits: ["submit"],
    computed: {
      hasBanlance: function() {
        return 40 != this.order_type && -1 != this.checkedPay.indexOf(10)
      },
      hasCashOnDelivery: function() {
        return 40 != this.order_type && -1 != this.checkedPay.indexOf(40)
      }
    },
    watch: {
      order_id: function(e, n) {
        this.balanceType = !1, this.cashOnDeliveryType = !1, this.getData()
      }
    },
    mounted: function() {
      this.getData()
    },
    methods: {
      back: function() {
        e.index.showModal({
          title: "提示",
          content: "您的订单如在规定时间内未支付将被取消，请尽快完成支付",
          cancelText: "继续支付",
          confirmText: "确认离开",
          success: function(n) {
            n.confirm ? e.index.reLaunch({
              url: "/pages/user/index/index"
            }) : n.cancel && console.log("用户点击取消")
          }
        })
      },
      getTheme: function() {
        var e = "#ff5704";
        switch (this.theme()) {
          case "theme0":
            e = "#ff5704";
            break;
          case "theme1":
            e = "#19ad57";
            break;
          case "theme2":
            e = "#ffcc00";
            break;
          case "theme3":
            e = "#33a7ff";
            break;
          case "theme4":
            e = "#e4e4e4";
            break;
          case "theme5":
            e = "#c8ba97";
            break;
          case "theme6":
            e = "#623ceb"
        }
        return e
      },
      getData: function() {
        var n = this;
        n.loading = !0, e.index.showLoading({
          title: "加载中",
          mask: !0
        });
        var a = "user.order/pay";
        20 == n.order_type && (a = "supplier.index/pay"), 30 == n.order_type && (a = "plus.live.plan/pay"), 40 == n.order_type && (a = "balance.plan/pay"), 50 == n.order_type && (a = "plus.advance.Order/pay");
        var t = {
          order_id: n.order_id,
          pay_source: n.getPlatform()
        };
        n._get(a, t, (function(a) {
          n.loading = !1;
          var t = [];
          a.data.payTypes.forEach((function(e) {
            t.push(1 * e)
          })), n.checkedPay = t, n.payPrice = a.data.payPrice, n.balance = a.data.balance || "", 10 != n.checkedPay[0] ? n.pay_type = n.checkedPay[0] || n.checkedPay[1] || 20 : n.pay_type = n.checkedPay[1] || n.checkedPay[0], e.index.hideLoading()
        }))
      },
      switch2Change: function(e) {
        this.balanceType = e.detail.value, this.cashOnDeliveryType = !1
      },
      switchCashOnDeliveryChange: function(e) {
        this.cashOnDeliveryType = e.detail.value, this.balanceType = !1
      },
      submit: function() {
        this.$emit("submit", {
          useBalance: this.balanceType ? 1 : 0,
          useCashOnDelivery: this.cashOnDeliveryType ? 1 : 0,
          order_id: this.order_id
        }), this.closePopup()
      },
      payTypeFunc: function(e) {
        this.pay_type = e
      },
      closePopup: function() {
        this.$refs.cashier.close()
      },
      open: function() {
        this.$refs.cashier.open()
      }
    }
  };
Array || (e.resolveComponent("uni-icons") + e.resolveComponent("uni-popup"))(), Math || (function() {
  return "../../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js"
} + function() {
  return "../../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
})();
var a = e._export_sfc(n, [
  ["render", function(n, a, t, i, c, r) {
    return e.e({
      a: e.o(r.closePopup, "81"),
      b: e.p({
        type: "left-nav",
        size: "28",
        color: "#000"
      }),
      c: e.t(c.payPrice || "0.00"),
      d: e.f(c.checkedPay, (function(a, t, i) {
        return e.e({
          a: 20 == a
        }, 20 == a ? {
          b: t,
          c: e.n(20 == n.pay_type ? "item active" : "item"),
          d: e.o((function(e) {
            return r.payTypeFunc(20)
          }), t)
        } : {}, {
          e: t
        })
      })),
      e: r.hasBanlance && 40 != t.order_type
    }, r.hasBanlance && 40 != t.order_type ? {
      f: e.t(c.balance),
      g: n.getThemeColor(),
      h: c.balanceType,
      i: e.o((function() {
        return r.switch2Change && r.switch2Change.apply(r, arguments)
      }), "77")
    } : {}, {
      j: r.hasCashOnDelivery && 40 != t.order_type
    }, r.hasCashOnDelivery && 40 != t.order_type ? {
      k: n.getThemeColor(),
      l: c.cashOnDeliveryType,
      m: e.o((function() {
        return r.switchCashOnDeliveryChange && r.switchCashOnDeliveryChange.apply(r, arguments)
      }), "65")
    } : {}, {
      n: e.o((function() {
        return r.submit && r.submit.apply(r, arguments)
      }), "78"),
      o: n.theme(),
      p: e.n(n.theme() || ""),
      q: e.sr("cashier", "80e84ab0-0"),
      r: e.o(r.closePopup, "e5"),
      s: e.p({
        "is-mask-click": !1,
        type: "bottom",
        "background-color": "#fff",
        "border-radius": "20px 20px 0 0"
      })
    })
  }]
]);
wx.createComponent(a);