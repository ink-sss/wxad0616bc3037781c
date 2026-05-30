require("../../../@babel/runtime/helpers/Arrayincludes");
var e = require("../../../common/vendor.js"),
  n = require("../../../store/index.js");
Array || e.resolveComponent("uni-popup")(), Math || (u + function() {
  return "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
})();
var u = function() {
    return "../../../components/uni-icon/uni-icon.js"
  },
  t = {
    __name: "welfare-voucher",
    setup: function(u) {
      var t = e.getCurrentInstance(),
        a = e.ref({}),
        o = e.ref(!1),
        r = e.ref(0),
        i = e.ref(null),
        l = e.ref(null),
        c = e.inject("roomId"),
        v = function(n) {
          try {
            return (e.index.getStorageSync("received_welfare_ids") || []).includes(n)
          } catch (e) {
            return !1
          }
        },
        d = function() {
          if (1 != a.value.countdown_type && r.value > 0) return !1;
          l.value && l.value.open()
        },
        p = function() {
          l.value && l.value.close()
        },
        s = e.computed((function() {
          return n.store.state.welfare_data
        }));
      e.watch(s, (function(n) {
        n && n.id && (a.value = n, r.value = 0, 1 != n.countdown_type && (r.value = n.time), o.value = !1, c.value > 0 && e.index.setStorageSync("welfare_data_" + c.value, n))
      }), {
        immediate: !0
      });
      var f = function(e) {
        var n = Math.floor(e / 60),
          u = e % 60;
        return "".concat(String(n).padStart(2, "0"), ":").concat(String(u).padStart(2, "0"))
      };
      e.watch(r, (function(n) {
        n > 0 && (i.value && clearInterval(i.value), !r.value || r.value <= 0 || (i.value = setInterval((function() {
          if (r.value <= 0) return clearInterval(i.value), i.value = null, console.log(r.value), void d();
          r.value -= 1, e.index.setStorageSync("welfare_time_" + c.value, r.value)
        }), 1e3)))
      }), {
        immediate: !0
      }), e.onMounted((function() {
        var u = e.index.getStorageSync("welfare_data_" + c.value);
        u && (2 != u.time_type && (u.time = e.index.getStorageSync("welfare_time_" + c.value)), 2 == u.countdown_type && (u.time = u.raw_time - (parseInt(new Date / 1e3) - u.push_time)), n.store.commit("changeWelfareOpen", u))
      })), e.onUnmounted((function() {
        i.value && clearInterval(i.value)
      }));
      var _ = function() {
        r.value, a.value && a.value.id && (e.index.showLoading({
          title: "领取中"
        }), t.proxy._post("live.roomStoreCoupon/receive", {
          id: a.value.id,
          push_id: a.value.push_id
        }, (function() {
          e.index.hideLoading(), e.index.showToast({
              title: "领取成功",
              duration: 2e3,
              icon: "success"
            }),
            function(n) {
              try {
                var u = e.index.getStorageSync("received_welfare_ids") || [];
                u.includes(n) || (u.push(n), e.index.setStorageSync("received_welfare_ids", u))
              } catch (e) {
                console.error("存储领取状态失败", e)
              }
            }(a.value.push_id), o.value = !0, p()
        }), (function() {
          e.index.hideLoading(), o.value = !0, p()
        })))
      };
      return function(n, u) {
        return e.e({
          a: null != a.value.id && a.value.id > 0 && !o.value && !v(a.value.push_id)
        }, null != a.value.id && a.value.id > 0 && !o.value && !v(a.value.push_id) ? {
          b: n.config.pic_url + "/static/live/yhq.png",
          c: e.t(r.value > 0 ? f(r.value) : "领取"),
          d: e.o(d, "4b")
        } : {}, {
          e: e.t(a.value.name),
          f: e.t(a.value.push_num),
          g: e.t(a.value.remark),
          h: e.o(_, "60"),
          i: e.p({
            type: "more-filled",
            size: "30",
            color: "#e6e6e6"
          }),
          j: e.o((function() {
            return n.closeCouponPopup && n.closeCouponPopup.apply(n, arguments)
          }), "e6"),
          k: e.sr(l, "23ac4143-0", {
            k: "couponPopup"
          }),
          l: e.p({
            type: "center",
            "is-mask-click": !0
          })
        })
      }
    }
  },
  a = e._export_sfc(t, [
    ["__scopeId", "data-v-23ac4143"]
  ]);
wx.createComponent(a);