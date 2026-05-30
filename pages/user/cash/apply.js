var t, a = require("../../../@babel/runtime/helpers/defineProperty"),
  e = require("../../../common/vendor.js");
require("../../../env/config.js");
var n = {
    data: function() {
      return {
        loadding: !0,
        indicatorDots: !0,
        autoplay: !0,
        interval: 2e3,
        duration: 500,
        withdraw_type: 10,
        agent: {},
        payType: [],
        words: {},
        temlIds: [],
        money: "",
        ifchecked: !1,
        url: "",
        clock: !1,
        cash_ratio: 0,
        cash_ratioMoney: "",
        overMoney: "0.00",
        isType: !1,
        pop_type: 10,
        balance: "",
        real_name: "",
        hasRealName: !1,
        form: {},
        min_money: ""
      }
    },
    mounted: function() {
      this.getData()
    },
    onLoad: function() {},
    watch: {
      money: function(t, a) {
        var e = this;
        t != a && (e.cash_ratioMoney = e.cash_ratio_percent(), e.overMoney = e.overprice())
      }
    },
    methods: (t = {
      typeFunc: function(t) {
        console.log(t, "n"), this.withdraw_type = t
      },
      selectType: function() {
        this.withdraw_type = this.pop_type, this.isType = !1
      },
      getData: function() {
        var t = this;
        e.index.showLoading({
          title: "加载中"
        }), t.loadding = !0, t._get("user.cash/index", {
          platform: t.getPlatform()
        }, (function(a) {
          var n = a.data.bankInfo;
          n && (t.form.bank_account = n.bank_account, t.form.bank_card = n.bank_card, t.form.bank_name = n.bank_name), t.min_money = a.data.min_money, t.balance = a.data.balance, t.cash_ratio = a.data.cash_ratio, t.hasRealName = !0, t.payType = a.data.pay_type, t.withdraw_type = t.payType[0], t.pop_type = t.withdraw_type, t.loadding = !1, e.index.hideLoading()
        }))
      },
      checkedme: function(t) {
        this.ifchecked = !this.ifchecked
      },
      TabType: function(t) {
        this.withdraw_type = t
      }
    }, a(t, "selectType", (function() {
      this.withdraw_type = this.pop_type, this.isType = !1
    })), a(t, "hasType", (function(t) {
      return -1 != this.payType.indexOf(t)
    })), a(t, "getAll", (function() {
      this.money = this.balance
    })), a(t, "cash_ratio_percent", (function() {
      var t = this.money * this.cash_ratio / 100;
      return t = Math.floor(100 * t) / 100
    })), a(t, "overprice", (function() {
      var t = this.money * this.cash_ratio / 100;
      return (t = t.toFixed(2)) || "0.00"
    })), a(t, "formSubmit", (function(t) {
      var a = this;
      if (!a.clock) {
        var n = a.form;
        n.pay_type = a.withdraw_type, n.money = a.money, n.source = a.getPlatform();
        var o = JSON.stringify(n);
        e.index.showLoading({
          title: "正在提交",
          mask: !0
        }), a._post("user.cash/submit", {
          data: o
        }, (function(t) {
          a.clock = !1, e.index.hideLoading(), 1 == t.code ? e.wx$1.requestMerchantTransfer({
            mchId: t.data.mchid,
            appId: t.data.wx_app_id,
            package: t.data.package_info,
            success: function(e) {
              console.log("success:", e), a._post("user.cash/submitResult", {
                out_bill_no: t.data.out_bill_no,
                apply_status: 40
              }, (function(t) {
                a.tableData = [], a.getData()
              }))
            },
            fail: function(e) {
              a._post("user.cash/submitResult", {
                out_bill_no: t.data.out_bill_no,
                apply_status: 60
              }, (function(t) {
                a.tableData = [], a.getData()
              }))
            }
          }) : e.index.showModal({
            title: "提示",
            content: t.msg,
            showCancel: !1,
            success: function(t) {
              e.index.navigateBack()
            }
          })
        }), (function(t) {
          a.clock = !1, e.index.hideLoading()
        }))
      }
    })), t)
  },
  o = e._export_sfc(n, [
    ["render", function(t, a, n, o, i, r) {
      return e.e({
        a: e.s("height:" + t.topBarTop() + "px;"),
        b: e.o((function() {
          return t.navBack && t.navBack.apply(t, arguments)
        }), "8f"),
        c: e.s(0 == t.topBarHeight() ? "" : "height:" + t.topBarHeight() + "px;"),
        d: e.t(i.balance || "0.00"),
        e: e.s("height:" + (328 + 2 * t.topBarHeight() + 2 * t.topBarTop()) + "rpx;"),
        f: i.payType.length > 1
      }, i.payType.length > 1 ? {
        g: e.f(i.payType, (function(a, n, o) {
          return e.e({
            a: 0 != n
          }, 0 != n ? {
            b: t.config.pic_url + "/static/agent/cashnav-l.png"
          } : {}, {
            c: n != i.payType.length - 1
          }, n != i.payType.length - 1 ? {
            d: t.config.pic_url + "/static/agent/cashnav-r.png"
          } : {}, {
            e: 10 == a
          }, {}, {
            f: 20 == a
          }, {}, {
            g: 30 == a
          }, {}, {
            h: 40 == a
          }, {}, {
            i: e.o((function(t) {
              return r.typeFunc(a)
            }), n),
            j: i.withdraw_type == a ? 1 : "",
            k: n
          })
        })),
        h: e.n("navType".concat(i.payType.length))
      } : {}, {
        i: "最低提现￥".concat(i.min_money),
        j: i.money,
        k: e.o((function(t) {
          return i.money = t.detail.value
        }), "d9"),
        l: e.o((function() {
          return r.getAll && r.getAll.apply(r, arguments)
        }), "1e"),
        m: 20 == i.withdraw_type
      }, 20 == i.withdraw_type ? {
        n: i.form.alipay_name,
        o: e.o((function(t) {
          return i.form.alipay_name = t.detail.value
        }), "c5"),
        p: i.form.alipay_account,
        q: e.o((function(t) {
          return i.form.alipay_account = t.detail.value
        }), "2d")
      } : {}, {
        r: 30 == i.withdraw_type
      }, 30 == i.withdraw_type ? {
        s: i.form.bank_account,
        t: e.o((function(t) {
          return i.form.bank_account = t.detail.value
        }), "e3"),
        v: i.form.bank_card,
        w: e.o((function(t) {
          return i.form.bank_card = t.detail.value
        }), "92"),
        x: i.form.bank_name,
        y: e.o((function(t) {
          return i.form.bank_name = t.detail.value
        }), "c1")
      } : {}, {
        z: e.t(i.balance || "0.00"),
        A: e.t(i.cash_ratio),
        B: e.t(i.overMoney),
        C: e.o((function() {
          return r.formSubmit && r.formSubmit.apply(r, arguments)
        }), "87"),
        D: e.o((function() {
          return r.formSubmit && r.formSubmit.apply(r, arguments)
        }), "59"),
        E: t.theme(),
        F: e.n(t.theme() || "")
      })
    }],
    ["__scopeId", "data-v-37dec2df"]
  ]);
wx.createPage(o);