var e = require("../../../@babel/runtime/helpers/objectSpread2"),
  a = require("../../../common/vendor.js");
Array || a.resolveComponent("uni-popup")(), Math;
var u = {
    __name: "withdraw-popup",
    props: {
      showDelayTip: {
        type: Boolean,
        default: !1
      }
    },
    setup: function(u, n) {
      var t = n.expose;
      getApp();
      var o = a.getCurrentInstance();
      a.onMounted((function() {}));
      var l = a.ref(null),
        r = a.ref(10),
        v = a.ref([]),
        c = a.ref(""),
        i = a.ref(0),
        f = a.ref(""),
        d = a.ref("");
      a.ref("");
      var s = a.ref(!1),
        p = a.ref({}),
        _ = a.ref(!1),
        b = a.ref(!1);
      a.ref("");
      var m = a.computed((function() {
          return (Number(c.value || 0) * Number(i.value || 0) / 100).toFixed(2)
        })),
        h = function() {
          c.value = d.value
        },
        k = function() {
          var e;
          null == (e = l.value) || e.close()
        },
        x = function(e) {
          o.proxy._get("user.cash/index", {
            platform: o.proxy.getPlatform()
          }, (function(a) {
            var u = a.data.bankInfo || {};
            p.value = {
              bank_account: u.bank_account || "",
              bank_card: u.bank_card || "",
              bank_name: u.bank_name || ""
            }, f.value = a.data.min_money, d.value = a.data.balance, d.value > 0 && (d.value > c.value || null == c.value) && (c.value = d.value), i.value = a.data.cash_ratio, s.value = !!a.data.real_name, v.value = a.data.pay_type || [], v.value.length > 0 && (r.value = v.value[0]), e && e()
          }), (function() {
            e && e()
          }))
        },
        y = function() {
          b.value || (b.value = !0, x((function() {
            b.value = !1, a.index.showToast({
              title: "余额已刷新",
              icon: "none"
            })
          })))
        },
        g = function(e, a) {
          o.proxy._post("user.cash/submitResult", {
            out_bill_no: e.data.out_bill_no,
            apply_status: a
          }, (function() {
            x()
          }))
        },
        w = function() {
          if (!_.value) {
            _.value = !0;
            var u = JSON.stringify(e(e({}, p.value), {}, {
              pay_type: r.value,
              money: c.value,
              source: o.proxy.getPlatform()
            }));
            a.index.showLoading({
              title: "正在提交",
              mask: !0
            }), o.proxy._post("user.cash/submit", {
              data: u
            }, (function(e) {
              var u;
              _.value = !1, a.index.hideLoading(), 1 == e.code ? a.wx$1.requestMerchantTransfer({
                mchId: e.data.mchid,
                appId: e.data.wx_app_id,
                package: e.data.package_info,
                success: function() {
                  ! function(e) {
                    g(e, 40), a.index.showToast({
                      title: "提交成功",
                      icon: "success"
                    }), k()
                  }(e)
                },
                fail: function() {
                  g(e, 60)
                }
              }) : (u = e.msg, a.index.showModal({
                title: "提示",
                content: u,
                showCancel: !1
              }))
            }), (function() {
              _.value = !1, a.index.hideLoading()
            }))
          }
        };
      return t({
          showPopup: function(e) {
            d.value = "", f.value = "", i.value = 0, console.log(e), c.value = e, x((function() {
              var e;
              null == (e = l.value) || e.open("bottom"), setTimeout((function() {
                x()
              }), 600)
            }))
          },
          closePopup: k
        }),
        function(e, n) {
          return a.e({
            a: a.o(k, "1a"),
            b: a.t(d.value || "0.00"),
            c: u.showDelayTip
          }, u.showDelayTip ? {
            d: a.t(b.value ? "刷新中..." : "刷新余额"),
            e: a.o(y, "fe")
          } : {}, {
            f: v.value.length > 1
          }, v.value.length > 1 ? {
            g: a.f(v.value, (function(e, u, n) {
              return a.e({
                a: 10 == e
              }, {}, {
                b: 20 == e
              }, {}, {
                c: 30 == e
              }, {}, {
                d: 40 == e
              }, {}, {
                e: r.value == e ? 1 : "",
                f: u,
                g: a.o((function(a) {
                  return u = e, void(r.value = u);
                  var u
                }), u)
              })
            }))
          } : {}, {
            h: "最低提现￥".concat(f.value || "0.00"),
            i: c.value,
            j: a.o((function(e) {
              return c.value = e.detail.value
            }), "17"),
            k: a.o(h, "73"),
            l: 20 == r.value
          }, 20 == r.value ? {
            m: p.value.bank_account,
            n: a.o((function(e) {
              return p.value.bank_account = e.detail.value
            }), "cd")
          } : {}, {
            o: 20 == r.value
          }, 20 == r.value ? {
            p: p.value.bank_name,
            q: a.o((function(e) {
              return p.value.bank_name = e.detail.value
            }), "5d")
          } : {}, {
            r: 30 == r.value
          }, 30 == r.value ? {
            s: p.value.bank_name,
            t: a.o((function(e) {
              return p.value.bank_name = e.detail.value
            }), "2a")
          } : {}, {
            v: 30 == r.value
          }, 30 == r.value ? {
            w: p.value.bank_account,
            x: a.o((function(e) {
              return p.value.bank_account = e.detail.value
            }), "33")
          } : {}, {
            y: 30 == r.value
          }, 30 == r.value ? {
            z: p.value.bank_card,
            A: a.o((function(e) {
              return p.value.bank_card = e.detail.value
            }), "f1")
          } : {}, {
            B: a.t(d.value || "0.00"),
            C: a.t(i.value),
            D: a.t(m.value),
            E: a.o(w, "c2"),
            F: a.sr(l, "16592cb4-0", {
              k: "withdrawPop"
            }),
            G: a.p({
              type: "bottom",
              "background-color": "#fff",
              "border-radius": "30px 30px 0 0"
            })
          })
        }
    }
  },
  n = a._export_sfc(u, [
    ["__scopeId", "data-v-16592cb4"]
  ]);
wx.createComponent(n);