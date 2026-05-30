var e = require("../../../common/vendor.js");
Array || e.resolveComponent("uni-icons")(), Math;
var t = {
    __name: "watch-type-verify",
    props: {
      liveId: {
        type: [Number, String],
        default: 0
      },
      liveName: {
        type: [String],
        default: ""
      },
      liveAvatar: {
        type: [String],
        default: ""
      },
      authImg: {
        type: [String],
        default: ""
      },
      watchPrice: {
        type: [Number],
        default: 0
      }
    },
    emits: ["ok"],
    setup: function(t, a) {
      var i = a.expose,
        o = a.emit,
        n = e.getCurrentInstance();
      getApp();
      var r = t,
        l = e.ref(!1),
        v = e.ref(null),
        u = e.ref(!1);
      e.ref(!1);
      var c = function() {
          v.value ? n.proxy._post("live.index/verifyWatchPwd", {
            live_id: r.liveId,
            password: v.value
          }, (function(t) {
            1 == t.code && (e.index.showToast({
              title: t.msg,
              icon: "success"
            }), e.index.setStorageSync("room_verify_pwd_" + r.liveId, v.value), u.value = !1, f("ok", r.liveId))
          })) : e.index.showToast({
            title: "请输入观看密码",
            icon: "error"
          })
        },
        d = e.ref(null),
        s = function() {
          d.value ? n.proxy._post("live.index/verifyWatchMobile", {
            live_id: r.liveId,
            mobile: d.value
          }, (function(t) {
            1 == t.code && (e.index.showToast({
              title: t.msg,
              icon: "success"
            }), e.index.setStorageSync("room_verify_mobile_" + r.liveId, d.value), u.value = !1, f("ok", r.liveId))
          })) : e.index.showToast({
            title: "请输入手机号",
            icon: "error"
          })
        },
        p = function() {
          n.proxy._post("order.roomPayOrder/pay", {
            room_id: r.liveId,
            price: r.watchPrice
          }, (function(t) {
            1 == t.code && e.index.requestPayment({
              provider: "wxpay",
              timeStamp: t.data.payment.timeStamp,
              nonceStr: t.data.payment.nonceStr,
              package: t.data.payment.package,
              signType: t.data.payment.signType,
              paySign: t.data.payment.paySign,
              success: function(e) {
                "requestPayment:ok" == e.errMsg && f("ok", r.liveId)
              },
              fail: function(t) {
                e.index.showToast({
                  title: "未支付",
                  icon: "none"
                })
              }
            })
          }))
        },
        f = o;
      return i({
          open: function(e) {
            l.value = e, u.value = !0
          },
          close: function() {
            u.value = !1, f("ok", r.liveId)
          }
        }),
        function(a, i) {
          return e.e({
            a: u.value
          }, u.value ? e.e({
            b: t.liveAvatar
          }, t.liveAvatar ? {
            c: t.liveAvatar
          } : {}, {
            d: e.t(t.liveName),
            e: 1 == l.value
          }, 1 == l.value ? {
            f: v.value,
            g: e.o((function(e) {
              return v.value = e.detail.value
            }), "4b"),
            h: e.o(c, "6b")
          } : {}, {
            i: 2 == l.value
          }, 2 == l.value ? {
            j: e.t(t.watchPrice),
            k: e.o(p, "7c")
          } : {}, {
            l: 3 == l.value
          }, 3 == l.value ? {
            m: d.value,
            n: e.o((function(e) {
              return d.value = e.detail.value
            }), "2f"),
            o: e.p({
              type: "info-filled",
              color: "#A1814E",
              size: "16"
            }),
            p: e.o(s, "7c")
          } : {}, {
            q: 4 == l.value
          }, 4 == l.value ? {
            r: t.authImg
          } : {}, {
            s: 4 == l.value ? "80vh" : "50vh"
          }) : {})
        }
    }
  },
  a = e._export_sfc(t, [
    ["__scopeId", "data-v-26afc1d5"]
  ]);
wx.createComponent(a);