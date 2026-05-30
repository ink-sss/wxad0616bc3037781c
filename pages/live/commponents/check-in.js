var e = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  n = require("../../../@babel/runtime/helpers/asyncToGenerator"),
  t = require("../../../common/vendor.js"),
  r = require("../../../store/chat.js"),
  a = require("../../../store/index.js");
Array || t.resolveComponent("uni-popup")(), Math;
var i = {
    __name: "check-in",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      },
      appId: {
        type: [Number, String],
        default: ""
      },
      supplierId: {
        type: [Number, String],
        default: ""
      },
      allowManualEnd: {
        type: Boolean,
        default: !0
      },
      config: {
        type: Object,
        required: !0
      },
      chatInfo: {
        type: Object,
        required: !0
      }
    },
    emits: ["taskEnd", "signinSuccess", "signinFail", "manualEnd", "call-b-method"],
    setup: function(i, u) {
      var o = u.emit;
      r.useChatStore();
      var l = o,
        c = i,
        s = t.ref(null),
        d = t.ref(t.index.getStorageSync("user_id") || ""),
        p = t.ref("0小时30分0秒"),
        v = 0,
        f = null,
        h = !1,
        m = t.ref([]),
        _ = t.ref({}),
        b = t.ref(0),
        I = t.ref(0),
        g = t.getCurrentInstance(),
        k = t.computed((function() {
          return a.store.state.is_checkin_open
        }));
      t.watch(k, (function(e) {
        void 0 !== e && e && (h = !1, I.value = e, x())
      }), {
        immediate: !0
      }), t.onMounted((function() {})), t.onUnmounted((function() {
        f && clearInterval(f), s.value && s.value.close()
      }));
      var w = function(e) {
          if (e <= 0) return "0分0秒";
          var n = Math.floor(e / 3600),
            t = "";
          return n > 0 && (t += "".concat(n, "小时")), t += "".concat(Math.floor(e % 3600 / 60), "分").concat(e % 60, "秒")
        },
        x = function() {
          var e, n;
          if (c.liveId) {
            var t = {
              app_id: (null == (e = c.chatInfo) ? void 0 : e.app_id) || c.appId,
              supplier_id: (null == (n = c.chatInfo) ? void 0 : n.shop_supplier_id) || c.supplierId,
              live_id: c.liveId,
              batch_no: I.value
            };
            g.proxy._post("live.roomNew/getCheckInListnew", t, (function(e) {
              var n;
              if (1 === e.code) {
                _.value = e.data, b.value = e.data.id || 0;
                var t = function(e) {
                  if (!e) return 0;
                  var n = e.split(":").map(Number),
                    t = 0;
                  switch (n.length) {
                    case 3:
                      t = 3600 * n[0] + 60 * n[1] + n[2];
                      break;
                    case 2:
                      t = 60 * n[0] + n[1];
                      break;
                    case 1:
                      t = n[0];
                      break;
                    default:
                      t = 0
                  }
                  return t
                }(e.data.time || "00:30:00");
                t > 0 && (null == (n = s.value) || n.open(), function(e) {
                  f && clearInterval(f), v = e, p.value = w(v), f = setInterval((function() {
                    var e;
                    v > 0 ? (v--, p.value = w(v)) : (clearInterval(f), null == (e = s.value) || e.close(), l("taskEnd"))
                  }), 1e3)
                }(t))
              } else m.value = []
            }))
          }
        },
        y = function() {
          s.value && (s.value.close(), setTimeout((function() {
            var e;
            (null == (e = s.value) ? void 0 : e.isOpen) && s.value.close()
          }), 50)), f && (clearInterval(f), f = null), S()
        },
        S = function(e) {
          var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 800,
            t = !1;
          return function() {
            t || (t = !0, e.apply(void 0, arguments), setTimeout((function() {
              return t = !1
            }), n))
          }
        }(n(e().mark((function n() {
          var r;
          return e().wrap((function(e) {
            for (;;) switch (e.prev = e.next) {
              case 0:
                if (h) {
                  e.next = 15;
                  break
                }
                return h = !0, e.prev = 2, e.next = 5, new Promise((function(e) {
                  var n, t;
                  g.proxy._post("live.roomNew/doSignincheckNew", {
                    app_id: (null == (n = c.chatInfo) ? void 0 : n.app_id) || c.appId,
                    room_id: c.liveId,
                    red_id: b.value,
                    shop_supplier_id: (null == (t = c.chatInfo) ? void 0 : t.shop_supplier_id) || c.supplierId,
                    user_id: d.value,
                    batch_no: I.value
                  }, (function(n) {
                    return e(n)
                  }))
                }));
              case 5:
                r = e.sent, h = !1, 1 === r.code ? (h = !1, l("signinSuccess", {
                  taskId: _.value.id,
                  reward: _.value.reward || ""
                }), l("call-b-method", "已打卡"), t.index.showToast({
                  title: "打卡成功",
                  icon: "success",
                  duration: 1500
                })) : (l("signinFail", r.msg || "打卡失败"), t.index.showToast({
                  title: r.msg || "打卡失败",
                  icon: "none",
                  duration: 1500
                })), e.next = 12;
                break;
              case 9:
                e.prev = 9, e.t0 = e.catch(2), console.error("打卡异常:", e.t0), l("signinFail", "网络异常，打卡失败"), t.index.showToast({
                  title: "网络异常",
                  icon: "none",
                  duration: 1500
                });
              case 12:
                return e.prev = 12, h = !1, e.finish(12);
              case 15:
              case "end":
                return e.stop()
            }
          }), n, null, [
            [2, 9, 12, 15]
          ])
        }))), 1e3);
      return function(e, n) {
        return t.e({
          a: t.t(_.value.title),
          b: p.value
        }, p.value ? {
          c: t.t(p.value)
        } : {}, {
          d: t.t(t.unref(h) ? "打卡中..." : "打卡"),
          e: t.o(y, "30"),
          f: t.unref(h),
          g: _.value.tips
        }, _.value.tips ? {
          h: t.t(_.value.tips || "")
        } : {}, {
          i: t.sr(s, "76b20e36-0", {
            k: "popupRef"
          }),
          j: t.p({
            type: "center",
            "background-color": "#fff",
            "border-radius": "10rpx",
            "mask-click": !1,
            "safe-area": !0
          })
        })
      }
    }
  },
  u = t._export_sfc(i, [
    ["__scopeId", "data-v-76b20e36"]
  ]);
wx.createComponent(u);