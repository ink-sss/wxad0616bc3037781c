var e = require("./@babel/runtime/helpers/regeneratorRuntime"),
  n = require("./@babel/runtime/helpers/asyncToGenerator"),
  a = require("./@babel/runtime/helpers/slicedToArray");
require("./@babel/runtime/helpers/Arrayincludes");
var u = require("./common/vendor.js"),
  l = require("./store/chat.js"),
  t = require("./store/index.js");
Array || u.resolveComponent("uni-popup")(), Math;
var r = {
    __name: "sign-in",
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
      type: {
        type: [Number, String],
        default: 1
      },
      config: {
        type: Object,
        required: !0
      },
      chatInfo: {
        type: Object,
        required: !0
      },
      isLogin: {
        type: Number,
        default: 0,
        validator: function(e) {
          return [0, 1].includes(e)
        }
      }
    },
    emits: ["taskEnd", "signinSuccess", "signinFail", "manualEnd"],
    setup: function(r, i) {
      var o = i.expose,
        v = i.emit;
      l.useChatStore();
      var c = v,
        s = r,
        d = u.ref(!1),
        p = u.ref([]),
        f = u.ref(0),
        m = u.ref(0),
        g = u.ref(null),
        h = u.ref(0),
        _ = u.ref(!1),
        y = u.ref(null),
        x = u.ref(null),
        k = u.ref(null);
      u.ref(!0);
      var S = u.ref(!1),
        I = u.getCurrentInstance();
      getApp();
      var w = u.ref(!1),
        T = u.ref(0),
        b = u.ref(""),
        E = u.ref(!1),
        N = u.ref(!1),
        q = u.ref(!1),
        O = null,
        A = function() {
          var e, n;
          return {
            app_id: (null == (e = s.chatInfo) ? void 0 : e.app_id) || s.appId,
            supplier_id: (null == (n = s.chatInfo) ? void 0 : n.shop_supplier_id) || s.supplierId,
            live_id: s.liveId
          }
        },
        M = u.computed((function() {
          var e = A();
          return Boolean(e.live_id && e.app_id && e.supplier_id)
        }));
      u.watch((function() {
        var e, n;
        return [s.isLogin, s.liveId, null == (e = s.chatInfo) ? void 0 : e.app_id, null == (n = s.chatInfo) ? void 0 : n.shop_supplier_id]
      }), (function(e) {
        var n = a(e, 4),
          u = n[0],
          l = n[1],
          t = n[2],
          r = n[3],
          i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [],
          o = a(i, 4),
          v = o[0],
          c = o[1],
          d = o[2],
          p = o[3];
        l && (t || s.appId) && (r || s.supplierId) && (0 !== i.length && u === v && l === c && t === d && r === p || C())
      }), {
        immediate: !0
      });
      var P = u.computed((function() {
        return t.store.state.is_check_open
      }));
      u.watch(P, (function(e, n) {
        console.log("signin watch"), 0 == T.value && 0 === e || (1 === e ? (d.value = !1, z(), p.value = [], g.value = null, h.value = 0, S.value = !1, w.value = !0, V(), F(), console.log("打卡已开启，已拉取最新打卡任务")) : (d.value = !0, w.value = !1, z(), y.value && y.value.close()))
      }), {
        immediate: !0
      }), u.onMounted((function() {
        j(), f.value = u.index.getStorageSync("user_id"), T.value = 1
      })), u.onUnmounted((function() {
        K(), y.value && y.value.close(), E.value = !1, N.value = !1, q.value = !1, O && (clearTimeout(O), O = null)
      }));
      var j = function() {
          try {
            var e = u.index.getStorageInfoSync();
            if (!e || !e.keys || 0 === e.keys.length) return;
            e.keys.forEach((function(e) {
              if (e.startsWith("sign_task_")) try {
                var n = u.index.getStorageSync(e);
                if (!n) return u.index.removeStorageSync(e), void 0;
                var a = JSON.parse(n);
                a.expireTime && Date.now() > a.expireTime ? (u.index.removeStorageSync(e)) : 0
              } catch (n) {
                u.index.removeStorageSync(e), console.error("清理缓存时解析失败，已删除键：".concat(e, "，错误："), n)
              }
            }))
          } catch (e) {
            console.error("清除sign_task_缓存失败：", e)
          }
        },
        C = function() {
          var a = n(e().mark((function n() {
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = M.value, !e.t0) {
                    e.next = 4;
                    break
                  }
                  return e.next = 4, new Promise((function(e) {
                    I.proxy._post("live.roomNew/getCheckid", A(), (function(n) {
                      if (1 !== n.code || !n.data) return z(), p.value = [], g.value = null, h.value = 0, S.value = !1, w.value = !1, V(), void e();
                      b.value = n.data, D(), e()
                    }))
                  }));
                case 4:
                case "end":
                  return e.stop()
              }
            }), n)
          })));
          return function() {
            return a.apply(this, arguments)
          }
        }(),
        D = function() {
          var e = Q();
          e && b.value == e.tasksId ? (p.value = e.signTasks || [], g.value = e.currentTask, h.value = e.countdown, m.value = e.tasksId, S.value = e.isSigninPopOpen || !1, w.value = !d.value && (p.value.length > 0 || !!g.value), !d.value && h.value > 0 && g.value ? L() : !d.value && h.value <= 0 && g.value ? S.value ? (u.nextTick$1(), setTimeout((function() {
            var e;
            null == (e = y.value) || e.open()
          }), 50)) : B() : d.value || J()) : d.value || (d.value = !1, F())
        },
        F = function() {
          var a = n(e().mark((function n() {
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  !d.value && M.value ? I.proxy._post("live.roomNew/getCheckList", A(), (function(e) {
                    1 === e.code ? (p.value = e.data.checkin_config, m.value = e.data.taskId, w.value = !0, K(), J()) : (p.value = [], w.value = !1, V())
                  })) : w.value = !1;
                case 1:
                case "end":
                  return e.stop()
              }
            }), n)
          })));
          return function() {
            return a.apply(this, arguments)
          }
        }(),
        J = function() {
          return d.value ? (w.value = !1, void c("taskEnd", "打卡临时关闭，任务暂停")) : (z(), 0 === p.value.length ? (g.value = null, h.value = 0, w.value = !1, V(), void c("taskEnd", "所有签到任务已完成")) : (g.value = p.value.shift(), h.value = g.value.watchTime || 0, w.value = !0, K(), void L()))
        },
        L = function() {
          if (d.value) return clearInterval(x.value), void(x.value = null);
          if (h.value <= 0) B();
          else {
            x.value && clearInterval(x.value);
            var e = 0;
            x.value = setInterval((function() {
              if (d.value) return clearInterval(x.value), void(x.value = null);
              h.value > 0 ? (h.value--, ++e >= 5 && (K(), e = 0), h.value <= 0 && (clearInterval(x.value), x.value = null, B())) : (clearInterval(x.value), x.value = null, B())
            }), 1e3)
          }
        },
        B = function() {
          var a = n(e().mark((function n() {
            var a;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = d.value || S.value && (null == (a = y.value) ? void 0 : a.isOpen), e.t0) {
                    e.next = 7;
                    break
                  }
                  return S.value = !0, K(), e.next = 6, u.nextTick$1();
                case 6:
                  setTimeout((function() {
                    var e;
                    null == (e = y.value) || e.open()
                  }), 50);
                case 7:
                case "end":
                  return e.stop()
              }
            }), n)
          })));
          return function() {
            return a.apply(this, arguments)
          }
        }(),
        $ = function() {
          var e;
          S.value = !1, K(), null == (e = y.value) || e.close(), _.value || N.value || g.value && !d.value && (_.value = !0, N.value = !0, G())
        },
        G = function() {
          var a = n(e().mark((function n() {
            var a, l;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return a = !1, e.prev = 1, e.next = 4, new Promise((function(e, n) {
                    var a, u, l = setTimeout((function() {
                      n(new Error("请求超时"))
                    }), 1e4);
                    I.proxy._post("live.roomNew/doSignin", {
                      app_id: (null == (a = s.chatInfo) ? void 0 : a.app_id) || s.appId,
                      room_id: s.liveId,
                      red_id: m.value,
                      shop_supplier_id: (null == (u = s.chatInfo) ? void 0 : u.shop_supplier_id) || s.supplierId,
                      watch_time: g.value.watchTime,
                      set_content: g.value,
                      user_id: f.value
                    }, (function(n) {
                      _.value = !1, clearTimeout(l), e(n)
                    }), (function(e) {
                      _.value = !1, clearTimeout(l), n(e || new Error("签到失败"))
                    }))
                  }));
                case 4:
                  l = e.sent, _.value = !1, 1 === l.code ? (a = !0, u.index.showToast({
                    title: l.msg,
                    icon: "success",
                    duration: 4e3
                  }), c("signinSuccess", {
                    taskId: g.value.id,
                    reward: g.value.reward
                  })) : (u.index.showToast({
                    title: l.msg || "签到失败",
                    icon: "none",
                    duration: 1500
                  }), c("signinFail", l.msg || "签到失败")), e.next = 11;
                  break;
                case 8:
                  e.prev = 8, e.t0 = e.catch(1), console.error("签到接口调用失败:", e.t0), u.index.showToast({
                    title: "网络异常，签到失败",
                    icon: "none",
                    duration: 1500
                  }), c("signinFail", "网络异常，签到失败");
                case 11:
                  return e.prev = 11, setTimeout((function() {
                    _.value = !1, N.value = !1, R(a)
                  }), 1500), e.finish(11);
                case 14:
                case "end":
                  return e.stop()
              }
            }), n, null, [
              [1, 8, 11, 14]
            ])
          })));
          return function() {
            return a.apply(this, arguments)
          }
        }(),
        R = function() {
          var e, n = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
          k.value && (clearInterval(k.value), k.value = null), S.value = !1, K(), null == (e = y.value) || e.close(), n && !d.value && setTimeout((function() {
            J()
          }), 300)
        },
        U = function() {
          E.value ? console.log("点击被阻止，防止重复触发") : (E.value = !0, setTimeout((function() {
            E.value = !1
          }), 500), d.value ? u.index.showToast({
            title: "当前打卡已关闭，暂无法签到",
            icon: "none",
            duration: 1500
          }) : h.value > 0 ? u.index.showToast({
            title: "请观看".concat(W(h.value), "后签到"),
            icon: "none",
            duration: 1500
          }) : g.value ? (O && clearTimeout(O), O = setTimeout((function() {
            B(), O = null
          }), 300)) : u.index.showToast({
            title: "暂无签到任务",
            icon: "none",
            duration: 1500
          }))
        },
        W = function(e) {
          if (e <= 0) return "00:00";
          var n = e % 60;
          return "".concat(Math.floor(e / 60).toString().padStart(2, "0"), ":").concat(n.toString().padStart(2, "0"))
        },
        z = function() {
          x.value && (clearInterval(x.value), x.value = null), k.value && (clearInterval(k.value), k.value = null)
        },
        H = function() {
          var e;
          return "sign_task_".concat(s.liveId, "_").concat((null == (e = s.chatInfo) ? void 0 : e.app_id) || s.appId, "_").concat(b.value)
        },
        K = function() {
          try {
            var e;
            Q(), e = Date.now() + 864e5;
            var n = {
              signTasks: p.value,
              currentTask: g.value,
              countdown: h.value,
              tasksId: m.value,
              isSigninPopOpen: S.value,
              expireTime: e
            };
            u.index.setStorageSync(H(), JSON.stringify(n))
          } catch (e) {
            console.error("保存签到缓存失败:", e)
          }
        },
        Q = function() {
          try {
            var e = u.index.getStorageSync(H());
            if (!e) return null;
            var n = JSON.parse(e),
              a = !n.currentTask;
            return n.expireTime && Date.now() > n.expireTime || a ? (u.index.removeStorageSync(H()), null) : n
          } catch (e) {
            return console.error("读取签到缓存失败:", e), u.index.removeStorageSync(H()), null
          }
        },
        V = function() {
          u.index.removeStorageSync(H()), 0 !== m.value && m.value && u.index.setStorageSync("last_check_id", m.value), w.value = p.value.length > 0 || !!g.value
        };
      return o({
          refreshTasks: F,
          closeModal: R,
          manualEndAllTasks: function() {
            var e;
            s.allowManualEnd ? (z(), p.value = [], g.value = null, h.value = 0, S.value = !1, w.value = !1, null == (e = y.value) || e.close(), V(), c("manualEnd", {
              taskId: null,
              remainingTasks: 0,
              isAllEnd: !0
            })) : u.index.showToast({
              title: "当前不允许结束任务",
              icon: "none"
            })
          },
          clearAllTimers: z
        }),
        function(e, n) {
          var a, l, t, i, o, v;
          return u.e({
            a: w.value && 1 == r.type
          }, w.value && 1 == r.type ? u.e({
            b: r.config.pic_url + "/202512081258135e2e81819.png",
            c: h.value > 0
          }, h.value > 0 ? {
            d: u.t(W(h.value))
          } : {}, {
            e: u.o(U, "03")
          }) : {}, {
            f: w.value && 2 == r.type
          }, w.value && 2 == r.type ? u.e({
            g: r.config.pic_url + "/202512081258135e2e81819.png",
            h: h.value > 0
          }, h.value > 0 ? {
            i: u.t(W(h.value))
          } : {}, {
            j: u.o(U, "58")
          }) : {}, {
            k: u.t((null == (a = g.value) ? void 0 : a.name) || "签到"),
            l: u.t((null == (l = g.value) ? void 0 : l.title) || "00:00"),
            m: u.t((null == (t = g.value) ? void 0 : t.title) || "00:00"),
            n: u.t((null == (i = g.value) ? void 0 : i.id) || 0),
            o: u.t((null == (o = g.value) ? void 0 : o.num) || 0),
            p: u.t(_.value ? "签到中..." : "签到"),
            q: u.o($, "dd"),
            r: _.value || N.value,
            s: u.t((null == (v = g.value) ? void 0 : v.reward) || ""),
            t: u.sr(y, "db405dd6-0", {
              k: "signinPop"
            }),
            v: u.p({
              type: "center",
              "background-color": "#fff",
              "border-radius": "20rpx",
              "mask-click": !1,
              "safe-area": !0
            })
          })
        }
    }
  },
  i = u._export_sfc(r, [
    ["__scopeId", "data-v-db405dd6"]
  ]);
exports.MiniProgramPage = i;