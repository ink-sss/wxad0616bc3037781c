var e = require("../../../common/vendor.js"),
  u = require("../../../store/index.js");
Array || e.resolveComponent("uni-popup")(), Math || (n + function() {
  return "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
})();
var n = function() {
    return "../../../components/uni-icon/uni-icon.js"
  },
  o = {
    __name: "coupon-claim",
    setup: function(n) {
      var o = e.getCurrentInstance(),
        t = e.ref({}),
        a = e.ref(0),
        l = e.ref(null),
        i = e.ref(null),
        v = e.ref(!1),
        c = e.computed((function() {
          return u.store.state.coupon_data
        }));
      e.watch(c, (function(e) {
        void 0 !== e && e && (t.value = e, a.value = e.wait_time, v.value = !1, console.log(t.value))
      }), {
        immediate: !0
      });
      var p = function(e) {
        var u = Math.floor(e / 60),
          n = e % 60;
        return "".concat(String(u).padStart(2, "0"), ":").concat(String(n).padStart(2, "0"))
      };
      e.watch(a, (function(e) {
        e > 0 && (l.value && clearInterval(l.value), !a.value || a.value <= 0 || (l.value = setInterval((function() {
          if (a.value <= 0) return clearInterval(l.value), void(l.value = null);
          a.value -= 1
        }), 1e3)))
      }), {
        immediate: !0
      }), e.onUnmounted((function() {
        l.value && clearInterval(l.value)
      }));
      var r = function() {
          i.value && i.value.open()
        },
        d = function() {
          i.value && i.value.close()
        },
        _ = function() {
          a.value > 0 || t.value && t.value.coupon_id && (e.index.showLoading({
            title: "领取中"
          }), o.proxy._post("user.coupon/receive", {
            coupon_id: t.value.coupon_id
          }, (function() {
            e.index.hideLoading(), e.index.showToast({
              title: "领取成功",
              duration: 2e3,
              icon: "success"
            }), v.value = !0, d()
          }), (function() {
            e.index.hideLoading(), v.value = !0, d()
          })))
        };
      return function(u, n) {
        return e.e({
          a: null != t.value.coupon_id && t.value.coupon_id > 0 && !v.value
        }, null != t.value.coupon_id && t.value.coupon_id > 0 && !v.value ? {
          b: u.config.pic_url + "/static/live/yhq.png",
          c: e.t(a.value > 0 ? p(a.value) : "领取"),
          d: e.o(r, "b5")
        } : {}, {
          e: e.t(t.value.name || "大额优惠券"),
          f: e.t(t.value.reduce_price || t.value.discount || 0),
          g: t.value.coupon_type && 10 == t.value.coupon_type.value
        }, (t.value.coupon_type && t.value.coupon_type.value, {}), {
          h: t.value.coupon_type && 20 == t.value.coupon_type.value
        }, (t.value.coupon_type && t.value.coupon_type.value, {}), {
          i: e.t(t.value.min_price > 0 ? "满" + t.value.min_price + "元使用" : "无门槛"),
          j: t.value.coupon_type
        }, t.value.coupon_type ? {
          k: e.t(t.value.coupon_type.text)
        } : {}, {
          l: t.value.end_time && t.value.end_time.text
        }, t.value.end_time && t.value.end_time.text ? {
          m: e.t(t.value.end_time.text)
        } : {}, {
          n: e.t(a.value > 0 ? p(a.value) : "立即领取"),
          o: a.value > 0 ? 1 : "",
          p: e.o(_, "0e"),
          q: e.p({
            type: "more-filled",
            size: "30",
            color: "#e6e6e6"
          }),
          r: e.o(d, "e6"),
          s: e.sr(i, "63116488-0", {
            k: "couponPopup"
          }),
          t: e.p({
            type: "center",
            "is-mask-click": !0
          })
        })
      }
    }
  },
  t = e._export_sfc(o, [
    ["__scopeId", "data-v-63116488"]
  ]);
wx.createComponent(t);