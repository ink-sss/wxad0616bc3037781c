var e = require("../../../common/vendor.js"),
  u = require("../../../utils/format.js");
Array || (e.resolveComponent("uni-notice-bar") + e.resolveComponent("uni-icons"))(), Math || (function() {
  return "../../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js"
} + function() {
  return "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js"
})();
var n = {
    __name: "subscribe",
    setup: function(n, t) {
      var a = t.expose,
        l = e.getCurrentInstance();
      getApp();
      var o = e.ref(!1),
        r = e.ref(!1),
        s = e.ref(0),
        i = e.ref(null),
        v = e.ref(0),
        c = e.ref(null),
        f = e.ref(""),
        b = e.ref(""),
        g = e.ref(""),
        m = e.inject("roomId"),
        p = e.ref(!1),
        _ = e.ref(""),
        d = e.ref([]);
      e.onMounted((function() {
        p.value = !0
      }));
      var x = function() {
          r.value ? e.index.showModal({
            title: "提示",
            content: "确定要取消订阅吗？",
            success: function(e) {
              e.confirm && h()
            }
          }) : e.wx$1.requestSubscribeMessage({
            tmplIds: [g.value],
            success: function(e) {
              "requestSubscribeMessage:ok" == e.errMsg && "accept" == e[g.value] && y("wx")
            }
          })
        },
        S = function() {
          if (v.value) {
            var e = "";
            if (3 == c.value) {
              e = "每月";
              for (var n = f.value.split(","), t = 0; t < n.length; t++) e += n[t] + "日" + (t < n.length - 1 ? "、" : "")
            } else if (2 == c.value) {
              var a = f.value.split(",");
              e = "每";
              for (var l = 0; l < a.length; l++) e += u.numToWeek(a[l]) + (l < a.length - 1 ? "、" : "")
            } else 1 == c.value && (e = "每天");
            d.value = b.value.split(","), _.value = e
          } else {
            var o = new Date(1e3 * s.value),
              r = o.getFullYear(),
              i = o.getMonth() + 1,
              g = o.getDate(),
              m = o.getHours(),
              p = o.getMinutes();
            _.value = r + "-" + (i < 10 ? "0" : "") + i + "-" + (g < 10 ? "0" : "") + g, d.value = [3600 * m + 60 * p]
          }
        },
        h = function() {
          var u = "next_subscribe_time_" + m.value;
          1 == i.value && (u = "countdown_subscribe_" + m.value), l.proxy._post("live.market/subscribe", {
            room_id: m.value,
            type: i.value,
            status: 0,
            next_time: s.value
          }, (function(n) {
            1 == n.code && (r.value = !1, e.index.showToast({
              title: n.msg,
              icon: "success"
            }), e.index.removeStorageSync(u))
          }))
        },
        y = function(u) {
          var n = "next_subscribe_time_" + m.value;
          1 == i.value && (n = "countdown_subscribe_" + m.value), l.proxy._post("live.market/subscribe", {
            room_id: m.value,
            type: i.value,
            status: 1,
            source: u,
            next_time: s.value
          }, (function(u) {
            1 == u.code && (r.value = !0, e.index.showToast({
              title: u.msg,
              icon: "success"
            }), e.index.setStorageSync(n, s.value))
          }))
        };
      return a({
          showSubscribeBtn: function(u, n, t, a, l, p) {
            if (n)
              if (v.value = t, c.value = a, f.value = l, b.value = p, g.value = n, o.value = !0, -1 == u) {
                i.value = 1;
                var _ = "countdown_subscribe_" + m.value,
                  d = e.index.getStorageSync(_);
                r.value = !!d
              } else {
                i.value = 2, s.value = u;
                var x = "next_subscribe_time_" + m.value,
                  h = e.index.getStorageSync(x);
                h && (h == u ? r.value = !0 : (r.value = !1, e.index.removeStorageSync(x))), S()
              }
          }
        }),
        function(n, t) {
          return e.e({
            a: 1 == i.value && o.value && p.value
          }, 1 == i.value && o.value && p.value ? {
            b: n.config.pic_url + "/20260127132820956961351.png",
            c: e.t(r.value ? "已订阅" : "订阅"),
            d: e.o((function(e) {
              return x()
            }), "c8")
          } : {}, {
            e: p.value && o.value && 2 == i.value
          }, p.value && o.value && 2 == i.value ? e.e({
            f: "" != _.value
          }, "" != _.value ? {
            g: e.p({
              single: !0,
              scrollable: _.value.length > 7 && v.value,
              "background-color": "#ffffff",
              color: "#333",
              text: _.value,
              speed: 30
            })
          } : {}, {
            h: e.o((function(e) {
              return o.value = !1
            }), "f7"),
            i: e.p({
              type: "closeempty",
              size: "14",
              color: "#808080"
            }),
            j: e.f(d.value, (function(n, t, a) {
              return {
                a: e.t(e.unref(u.sToTime)(n)),
                b: t
              }
            })),
            k: n.config.pic_url + "/20260314194303760328120.png",
            l: e.t(r.value ? "已订阅" : "订阅"),
            m: e.o(x, "c2")
          }) : {})
        }
    }
  },
  t = e._export_sfc(n, [
    ["__scopeId", "data-v-31068d93"]
  ]);
wx.createComponent(t);