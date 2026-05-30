var e = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  n = require("../../../@babel/runtime/helpers/asyncToGenerator"),
  r = require("../../../common/vendor.js");
Array || r.resolveComponent("uni-popup")(), Math;
var u = {
    __name: "welfare-package-popup",
    setup: function(u, t) {
      var a, o = t.expose,
        l = r.getCurrentInstance(),
        i = r.ref(null),
        c = r.ref(!1),
        v = r.ref(!1),
        p = r.ref(!0),
        d = r.ref(1),
        s = r.ref([]),
        f = function(e) {
          var n = Number(e);
          return Number.isFinite(n) ? n : 0
        },
        m = function(e) {
          return (null == e ? void 0 : e.name) || (null == e ? void 0 : e.coupon_name) || (null == e ? void 0 : e.title) || "福利券"
        },
        _ = function(e) {
          return (null == e ? void 0 : e.coupon_type_name) || (null == e ? void 0 : e.type_name) || "福利券"
        },
        g = function(e) {
          var n = String(e || "").trim();
          return n ? n.length >= 10 ? n.slice(0, 10) : n : ""
        },
        h = function(e) {
          var n = g((null == e ? void 0 : e.start_time) || (null == e ? void 0 : e.startTime) || (null == e ? void 0 : e.begin_time)),
            r = g((null == e ? void 0 : e.expire_time) || (null == e ? void 0 : e.end_time) || (null == e ? void 0 : e.invalid_time) || (null == e ? void 0 : e.endTime));
          return n && r ? "".concat(n, " - ").concat(r) : !n && r ? "到期：".concat(r) : n && !r ? "".concat(n, " - 长期有效") : "长期有效"
        },
        b = function(e) {
          var n = (null == e ? void 0 : e.remark) || (null == e ? void 0 : e.coupon_remark) || (null == e ? void 0 : e.description) || "";
          return String(n).trim()
        },
        x = function() {
          var r = n(e().mark((function n() {
            var r, u = arguments;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  (r = u.length > 0 && void 0 !== u[0] && u[0]) && (d.value = 1, p.value = !0, s.value = []), (p.value || r) && (c.value || v.value || (1 === d.value ? c.value = !0 : v.value = !0, l.proxy._post("live.roomStoreCoupon/userList", {
                    page: d.value,
                    list_rows: 20
                  }, (function(e) {
                    var n, r, u;
                    if (c.value = !1, v.value = !1, 1 == e.code) {
                      var t = Array.isArray(null == (n = null == e ? void 0 : e.data) ? void 0 : n.data) ? e.data.data : [];
                      s.value = 1 === d.value ? t : s.value.concat(t);
                      var a = Number((null == (r = null == e ? void 0 : e.data) ? void 0 : r.current_page) || d.value),
                        o = Number((null == (u = null == e ? void 0 : e.data) ? void 0 : u.last_page) || 0);
                      return p.value = o > 0 ? a < o : t.length >= 20, void(d.value = d.value + 1)
                    }
                    p.value = !1
                  }), (function() {
                    c.value = !1, v.value = !1
                  }))));
                case 2:
                case "end":
                  return e.stop()
              }
            }), n)
          })));
          return function() {
            return r.apply(this, arguments)
          }
        }(),
        w = r.computed((function() {
          return s.value.reduce((function(e, n) {
            return e + f(n.num)
          }), 0)
        })),
        y = function() {
          var r = n(e().mark((function n() {
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, x();
                case 2:
                case "end":
                  return e.stop()
              }
            }), n)
          })));
          return function() {
            return r.apply(this, arguments)
          }
        }(),
        k = function() {
          var e;
          null == (e = i.value) || e.close()
        };
      return o({
          showPopup: (a = n(e().mark((function n() {
            var r;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, x(!0);
                case 2:
                  null == (r = i.value) || r.open();
                case 3:
                case "end":
                  return e.stop()
              }
            }), n)
          }))), function() {
            return a.apply(this, arguments)
          }),
          closePopup: k
        }),
        function(e, n) {
          return r.e({
            a: r.t(w.value),
            b: c.value
          }, c.value ? {} : s.value.length > 0 ? r.e({
            d: r.f(s.value, (function(e, n, u) {
              return r.e({
                a: r.t(_(e)),
                b: r.t(m(e)),
                c: b(e)
              }, b(e) ? {
                d: r.t(b(e))
              } : {}, {
                e: r.t(f(e.num)),
                f: r.t(h(e)),
                g: "".concat(e.coupon_id || e.id || "coupon", "-").concat(n)
              })
            })),
            e: v.value
          }, (v.value || p.value, {}), {
            f: !p.value,
            g: r.o(y, "79")
          }) : {}, {
            c: s.value.length > 0,
            h: r.o(k, "74"),
            i: r.sr(i, "99e1cad7-0", {
              k: "welfarePopup"
            }),
            j: r.p({
              type: "bottom",
              "is-mask-click": !0,
              "background-color": "#fff",
              "border-radius": "30px 30px 0 0"
            })
          })
        }
    }
  },
  t = r._export_sfc(u, [
    ["__scopeId", "data-v-99e1cad7"]
  ]);
wx.createComponent(t);