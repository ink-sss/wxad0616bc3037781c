var e = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  a = require("../../../@babel/runtime/helpers/asyncToGenerator"),
  n = require("../../../common/vendor.js"),
  u = require("../../../store/chat.js");
Array || (n.resolveComponent("uni-popup") + n.resolveComponent("uni-icon"))(), Math || (o + r + l + t + i + s + function() {
  return "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
} + function() {
  return "../../../components/uni-icon/uni-icon.js"
} + c + n.unref(v))();
var l = function() {
    return "./sign-in2.js"
  },
  t = function() {
    return "./check-in.js"
  },
  o = function() {
    return "./coupon-claim.js"
  },
  r = function() {
    return "./welfare-voucher.js"
  },
  i = function() {
    return "./subscribe.js"
  },
  v = function() {
    return "./complaint-face.js"
  },
  c = function() {
    return "./withdraw-popup.js"
  },
  s = function() {
    return "./myorder.js"
  },
  p = {
    __name: "people-number",
    props: {
      speed: {
        type: [Number, String],
        default: 0
      },
      isLogin: {
        type: [Number, String],
        default: 0
      },
      liveId: {
        type: [Number, String],
        default: ""
      },
      isOnlineNumber: {
        type: [Number, String],
        default: 1
      },
      isOrder: {
        type: [Number, String],
        default: 1
      },
      isCustomerService: {
        type: [Number, String],
        default: 1
      },
      lookType: {
        type: String,
        default: "vertical"
      },
      showPeople: {
        type: Boolean,
        default: !0
      }
    },
    emits: ["call-b-method", "sendLbMsg"],
    setup: function(l, t) {
      var o = t.expose,
        r = t.emit,
        i = u.useChatStore(),
        v = n.ref(0),
        c = n.ref(0),
        s = n.ref(0),
        p = n.getCurrentInstance(),
        f = getApp(),
        d = l;
      n.ref(0);
      var g = n.ref(!1),
        m = n.ref(0),
        b = n.ref(null),
        _ = n.ref(null),
        k = n.ref({}),
        x = n.ref(0),
        h = n.ref(null),
        y = n.ref(null),
        I = n.ref(!1),
        w = n.ref(0),
        S = n.ref(null),
        C = n.ref(0),
        T = n.ref(1),
        j = n.ref(""),
        R = n.ref(null),
        M = n.ref(!1),
        P = n.ref(0),
        L = n.ref(null),
        N = n.ref(0),
        B = n.ref(null),
        O = n.ref(1),
        D = n.ref(""),
        G = n.ref(null),
        U = function() {
          var u = a(e().mark((function a() {
            var u;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = G.value, e.t0) {
                    e.next = 4;
                    break
                  }
                  return e.next = 4, n.nextTick$1();
                case 4:
                  null == (u = G.value) || u.showPopup(N.value);
                case 5:
                case "end":
                  return e.stop()
              }
            }), a)
          })));
          return function() {
            return u.apply(this, arguments)
          }
        }();
      n.onMounted((function() {
        var e = n.index.getSystemInfoSync(),
          a = p.proxy.getNavHeight();
        v.value = a.navHeight, c.value = a.statusBarHeight, s.value = a.navWidth, de(), x.value = e.safeAreaInsets.bottom + n.index.upx2px(30)
      })), n.onUnmounted((function() {
        b.value && clearInterval(b.value), R.value && clearInterval(R.value), B.value && clearInterval(B.value)
      }));
      var q = function(e) {
          var a = "",
            n = Math.floor(e / 60 / 60),
            u = Math.floor(e / 60 % 60),
            l = Math.floor(e % 60);
          return n > 0 && (a = n + ":"), a += n > 0 ? u > 0 ? (u <= 9 ? "0" + u : u) + ":" : "00:" : (u < 9 ? "0" + u : u) + ":", a += l <= 9 ? "0" + l : l
        },
        A = function() {
          p.proxy._post("live.market/getLuckyBag", {
            room_id: d.liveId
          }, (function(e) {
            1 == e.code ? (k.value = e.data, _.value.open()) : n.index.showToast({
              title: e.msg,
              icon: "none"
            })
          }))
        },
        z = function() {
          k.value.is_join || p.proxy._post("live.market/joinLb", {
            room_id: d.liveId,
            lb_id: k.value.id
          }, (function(e) {
            1 == e.code ? (ae("sendLbMsg", k.value.comment), n.index.showToast({
              title: e.msg,
              icon: "success"
            }), setTimeout((function() {
              _.value.close()
            }), 800)) : n.index.showToast({
              title: e.msg,
              icon: "none"
            })
          }))
        },
        H = n.ref(!1),
        W = n.ref([]),
        E = function() {
          1 == k.value.is_online ? p.proxy._post("live.market/confirmLb", {
            lb_id: k.value.id
          }, (function(e) {
            0 == e.code && n.index.showToast({
              title: e.msg,
              icon: "none",
              duration: 3e3
            }), h.value.close()
          })) : h.value.close()
        },
        $ = function(e) {
          1 == e ? h.value.close() : 2 == e && y.value.close()
        },
        F = function() {
          y.value.open()
        },
        J = function() {
          w.value > 0 || (I.value = !1, p.proxy._post("live.market/receiveCountdownPoints", {
            room_id: d.liveId
          }, (function(e) {
            1 == e.code && (C.value = e.data, S.value.open())
          })))
        },
        K = function() {
          w.value > 0 || (I.value = !1, p.proxy._post("live.market/receiveCountdownPoints1", {
            room_id: d.liveId
          }, (function(e) {
            1 == e.code ? (C.value = e.data, S.value.open()) : I.value = !1
          })))
        },
        Q = function() {
          I.value = !1, p.proxy._post("live.market/saveUserCountdownPoints", {
            room_id: d.liveId
          }, (function(e) {
            S.value.close(), 1 == e.code && n.index.showToast({
              title: e.msg,
              icon: "success"
            })
          }))
        },
        V = function() {
          var e = "countdown_points_" + d.liveId + "_" + j.value;
          n.index.removeStorageSync(e), S.value.close()
        },
        X = function() {
          P.value > 0 || (M.value = !1, p.proxy._post("live.market/receiveCountdownRedpack", {
            room_id: d.liveId
          }, (function(e) {
            1 == e.code ? (N.value = e.data, L.value.open()) : M.value = !1
          })))
        },
        Y = function() {
          P.value > 0 || (M.value = !1, p.proxy._post("live.market/receiveCountdownRedpack1", {
            room_id: d.liveId
          }, (function(e) {
            1 == e.code ? (N.value = e.data, L.value.open()) : M.value = !1
          })))
        },
        Z = function() {
          M.value = !1, p.proxy._post("live.market/saveUserCountdownRedpack", {
            room_id: d.liveId
          }, (function(e) {
            L.value.close(), U(), 1 == e.code && n.index.showToast({
              title: e.msg,
              icon: "success"
            })
          }))
        },
        ee = function() {
          var e = "countdown_redpack_" + d.liveId + "_" + D.value;
          n.index.removeStorageSync(e), L.value.close(), U()
        },
        ae = r,
        ne = n.ref(null),
        ue = n.ref(0),
        le = n.ref(0),
        te = n.ref(0),
        oe = n.ref(0),
        re = function() {
          var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
          f.globalData.imChat.getGroupOnlineMemberCount(f.globalData.imPrefix + d.liveId).then((function(a) {
            ue.value = a.data.memberCount, 0 == a.data.memberCount && e ? (oe.value += 1, oe.value >= 2 && (oe.value = 0, f.exitGroup(d.liveId, (function() {
              f.addGroup(d.liveId)
            })))) : a.data.memberCount > 0 && (oe.value = 0)
          })).catch((function(e) {
            console.warn("getGroupOnlineMemberCount error:", e)
          }))
        },
        ie = function() {
          f.globalData.imChat.getGroupCounters({
            groupID: f.globalData.imPrefix + d.liveId,
            keyList: ["people_virtual", "virtual_num_one"]
          }).then((function(e) {
            le.value = e.data.counters.people_virtual > 0 ? e.data.counters.people_virtual : 0, te.value = e.data.counters.virtual_num_one > 0 ? e.data.counters.virtual_num_one : 0
          })).catch((function(e) {
            console.warn("getGroupCounters error:", e)
          }))
        },
        ve = function() {
          var e = te.value > 0 ? te.value : 1,
            a = ue.value * e + le.value;
          if (a > 1e5) return "10万+";
          if (a >= 1e4) {
            var n = (a / 1e4).toFixed(1);
            return n.endsWith(".0") ? "".concat(Math.floor(a / 1e4), "万+") : "".concat(n, "万+")
          }
          return a > 0 ? a.toString() : "-"
        },
        ce = n.ref(!1),
        se = n.ref(null),
        pe = function() {
          var u = a(e().mark((function a() {
            var u;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = ce.value, e.t0) {
                    e.next = 5;
                    break
                  }
                  return ce.value = !0, e.next = 5, n.nextTick$1();
                case 5:
                  null == (u = se.value) || u.showMyList();
                case 6:
                case "end":
                  return e.stop()
              }
            }), a)
          })));
          return function() {
            return u.apply(this, arguments)
          }
        }(),
        fe = n.ref(Object),
        de = function() {
          p.proxy._post("live.roomNew/getChatSetting", {
            app_id: i.liveInfo.app_id,
            supplier_id: i.liveInfo.shop_supplier_id
          }, (function(e) {
            1 == e.code && (fe.value = e.data, i.setChatSetting(e.data))
          }))
        },
        ge = function() {
          n.index.navigateTo({
            url: "/pages/webview/webview?url=" + encodeURIComponent(fe.value.link)
          })
        },
        me = function() {
          n.wx$1.openCustomerServiceChat({
            extInfo: {
              url: fe.value.url
            },
            corpId: fe.value.corpId,
            success: function(e) {
              console.log(e)
            },
            fail: function(e) {
              console.log(e)
            }
          })
        },
        be = n.ref(null),
        _e = function() {
          null == be || be.value.open()
        },
        ke = n.ref(null),
        xe = n.ref(null),
        he = function(e) {},
        ye = function(e) {},
        Ie = function(e) {},
        we = function(e) {},
        Se = n.ref(null),
        Ce = n.ref(!1),
        Te = n.ref(null),
        je = function() {
          var u = a(e().mark((function a() {
            var u;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = Ce.value, e.t0) {
                    e.next = 5;
                    break
                  }
                  return Ce.value = !0, e.next = 5, n.nextTick$1();
                case 5:
                  null == (u = Te.value) || u.showComplaint();
                case 6:
                case "end":
                  return e.stop()
              }
            }), a)
          })));
          return function() {
            return u.apply(this, arguments)
          }
        }();
      return o({
          memberStart: function() {
            re(), ie(), ne.value = setInterval((function() {
              re(!0), ie()
            }), 8e3)
          },
          showLuckyBag: function(e) {
            b.value && clearInterval(b.value);
            var a = Math.floor(new Date / 1e3);
            m.value = e - a, m.value > 0 && (g.value = !0, b.value = setInterval((function() {
              m.value--, m.value <= 0 && (clearInterval(b.value), g.value = !1)
            }), 1e3))
          },
          hideLuckyBag: function() {
            _.value.close(), g.value = !1, b.value && clearInterval(b.value)
          },
          luckyBagResult: function(e, a) {
            var n;
            H.value = e, W.value = a, h.value.open(), e && !(null == (n = k.value) ? void 0 : n.id) && p.proxy._post("live.market/getLuckyBag", {
              room_id: d.liveId
            }, (function(e) {
              1 == e.code && (k.value = e.data)
            }))
          },
          clearMemberInterval: function() {
            null != ne.value && clearInterval(ne.value), oe.value = 0
          },
          showCountdownPoints: function(e, a, u, l, t) {
            if (R.value && clearInterval(R.value), 1 == a) {
              T.value = a;
              var o = Math.floor(new Date / 1e3);
              w.value = e - o, w.value > 0 && (I.value = !0, R.value = setInterval((function() {
                w.value--, w.value <= 0 && clearInterval(R.value)
              }), 1e3))
            } else {
              j.value = t, T.value = a;
              var r = "countdown_points_" + d.liveId + "_" + t,
                i = 0;
              1 == u ? (i = n.index.getStorageSync(r), w.value = i ? l - i : l) : (w.value = l, n.index.removeStorageSync(r)), w.value > 0 ? (I.value = !0, R.value = setInterval((function() {
                i++, n.index.setStorage({
                  key: r,
                  data: i
                }), w.value--, w.value <= 0 && clearInterval(R.value)
              }), 1e3)) : 0 == w.value && (I.value = !0)
            }
          },
          hideCountdownPoints: function() {
            I.value = !1, R.value && clearInterval(R.value)
          },
          showCountdownRedpack: function(e, a, u, l, t) {
            if (B.value && clearInterval(B.value), 1 == a) {
              var o = Math.floor(new Date / 1e3);
              P.value = e - o, P.value > 0 && (M.value = !0, B.value = setInterval((function() {
                P.value--, P.value <= 0 && clearInterval(B.value)
              }), 1e3))
            } else {
              D.value = t, O.value = a;
              var r = "countdown_redpack_" + d.liveId + "_" + t,
                i = 0;
              1 == u ? (i = n.index.getStorageSync(r), P.value = i ? l - i : l) : (P.value = l, n.index.removeStorageSync(r)), P.value > 0 ? (M.value = !0, B.value = setInterval((function() {
                i++, n.index.setStorage({
                  key: r,
                  data: i
                }), P.value--, P.value <= 0 && clearInterval(B.value)
              }), 1e3)) : 0 == P.value && (M.value = !0)
            }
          },
          hideCountdownRedpack: function() {
            M.value = !1, B.value && clearInterval(B.value)
          },
          showSubscribeBtn: function(e, a, n, u, l, t) {
            Se.value.showSubscribeBtn(e, a, n, u, l, t)
          },
          refreshSignTasks: function() {
            var e;
            return null == (e = ke.value) ? void 0 : e.refreshTasks()
          },
          manualEndSignTasks: function() {
            var e;
            return null == (e = ke.value) ? void 0 : e.manualEndAllTasks()
          }
        }),
        function(e, a) {
          return n.e({
            a: "vertical" == l.lookType
          }, "vertical" == l.lookType ? n.e({
            b: null !== fe.value && 1 == l.isCustomerService
          }, null !== fe.value && 1 == l.isCustomerService ? n.e({
            c: 10 == fe.value.type
          }, 10 == fe.value.type ? {
            d: e.config.pic_url + "/2025120412560621cbb7235.png"
          } : {}, {
            e: 20 == fe.value.type && fe.value.link
          }, 20 == fe.value.type && fe.value.link ? {
            f: e.config.pic_url + "/2025120412560621cbb7235.png",
            g: n.o(ge, "72")
          } : {}, {
            h: 30 == fe.value.type && fe.value.url && fe.value.corpId
          }, 30 == fe.value.type && fe.value.url && fe.value.corpId ? {
            i: e.config.pic_url + "/2025120412560621cbb7235.png",
            j: n.o(me, "e8")
          } : {}, {
            k: 40 == fe.value.type && fe.value.pic
          }, 40 == fe.value.type && fe.value.pic ? {
            l: e.config.pic_url + "/2025120412560621cbb7235.png",
            m: n.o(_e, "3a")
          } : {}) : {}, {
            n: 1 == l.isOrder
          }, 1 == l.isOrder ? {
            o: e.config.pic_url + "/2025120412561005b292544.png",
            p: n.o(pe, "11")
          } : {}, {
            q: g.value
          }, g.value ? {
            r: e.config.pic_url + "/20260228161536cabb52339.png",
            s: n.t(q(m.value)),
            t: n.o(A, "44")
          } : {}, {
            v: 1 == T.value && I.value
          }, 1 == T.value && I.value ? {
            w: e.config.pic_url + "/202603051249495c2ca0588.png",
            x: n.t(w.value > 0 ? q(w.value) : "待领取"),
            y: n.o(J, "74")
          } : {}, {
            z: 2 == T.value && I.value
          }, 2 == T.value && I.value ? {
            A: e.config.pic_url + "/202603051249495c2ca0588.png",
            B: n.t(w.value > 0 ? q(w.value) : "待领取"),
            C: n.o(K, "95")
          } : {}, {
            D: 1 == O.value && M.value
          }, 1 == O.value && M.value ? {
            E: e.config.pic_url + "/2026030517153286d739482.png",
            F: n.t(P.value > 0 ? q(P.value) : "待领取"),
            G: n.o(X, "c3")
          } : {}, {
            H: 2 == O.value && M.value
          }, 2 == O.value && M.value ? {
            I: e.config.pic_url + "/2026030517153286d739482.png",
            J: n.t(P.value > 0 ? q(P.value) : "待领取"),
            K: n.o(Y, "ef")
          } : {}, {
            L: e.config.pic_url + "/202512151457375080e2447.png",
            M: n.o((function(e) {
              n.index.reLaunch({
                url: "/pages/live/live-vertical?live_id=" + d.liveId
              })
            }), "71"),
            N: n.sr(ke, "c787519a-2", {
              k: "signInRef"
            }),
            O: n.o(he, "4d"),
            P: n.o(ye, "d9"),
            Q: n.o(Ie, "61"),
            R: n.o(we, "3a"),
            S: n.p({
              "is-login": l.isLogin,
              "live-id": l.liveId,
              config: e.config,
              "chat-info": n.unref(i).liveInfo || {},
              type: 1
            }),
            T: n.sr(xe, "c787519a-3", {
              k: "checkInRef"
            }),
            U: n.o((function(e) {
              return ae("call-b-method", e)
            }), "a3"),
            V: n.p({
              "live-id": l.liveId,
              config: e.config,
              "chat-info": n.unref(i).liveInfo || {}
            })
          }) : {
            W: e.config.pic_url + "/20260316132945a702d8862.png",
            X: n.o(je, "9a"),
            Y: n.s("position:fixed;top:" + (v.value + 6) + "px;left:4px")
          }, {
            Z: 1 == l.isOnlineNumber && l.showPeople
          }, 1 == l.isOnlineNumber && l.showPeople ? {
            aa: e.config.pic_url + "/20251204131342f37859152.png",
            ab: n.t(ve())
          } : {}, {
            ac: "vertical" == l.lookType
          }, "vertical" == l.lookType ? {
            ad: n.sr(Se, "c787519a-4", {
              k: "sbRef"
            })
          } : n.e({
            ae: n.sr(Se, "c787519a-5", {
              k: "sbRef"
            }),
            af: g.value
          }, g.value ? {
            ag: e.config.pic_url + "/20260228161536cabb52339.png",
            ah: n.t(q(m.value)),
            ai: n.o(A, "f4")
          } : {}, {
            aj: 1 == T.value && I.value
          }, 1 == T.value && I.value ? {
            ak: e.config.pic_url + "/202603051249495c2ca0588.png",
            al: n.t(w.value > 0 ? q(w.value) : "待领取"),
            am: n.o(J, "6a")
          } : {}, {
            an: 2 == T.value && I.value
          }, 2 == T.value && I.value ? {
            ao: e.config.pic_url + "/202603051249495c2ca0588.png",
            ap: n.t(w.value > 0 ? q(w.value) : "待领取"),
            aq: n.o(K, "ba")
          } : {}, {
            ar: 1 == O.value && M.value
          }, 1 == O.value && M.value ? {
            as: e.config.pic_url + "/2026030517153286d739482.png",
            at: n.t(P.value > 0 ? q(P.value) : "待领取"),
            av: n.o(X, "26")
          } : {}, {
            aw: 2 == O.value && M.value
          }, 2 == O.value && M.value ? {
            ax: e.config.pic_url + "/2026030517153286d739482.png",
            ay: n.t(P.value > 0 ? q(P.value) : "待领取"),
            az: n.o(Y, "7b")
          } : {}), {
            aA: ce.value
          }, ce.value ? {
            aB: n.sr(se, "c787519a-7", {
              k: "myOrderSc"
            })
          } : {}, {
            aC: null !== fe.value
          }, null !== fe.value ? {
            aD: fe.value.pic,
            aE: n.sr(be, "c787519a-8", {
              k: "kefuPop"
            }),
            aF: n.p({
              type: "center",
              "background-color": "#fff",
              "border-radius": "30px 30px 30px 30px"
            })
          } : {}, {
            aG: n.t(k.value.name ? k.value.name : "福袋"),
            aH: k.value.product_image,
            aI: n.t(k.value.product_name),
            aJ: k.value.product_sku_text
          }, k.value.product_sku_text ? {
            aK: n.t(k.value.product_sku_text)
          } : {}, {
            aL: n.t(k.value.product_price),
            aM: n.t(k.value.comment),
            aN: n.t(k.value.is_join ? "参与成功，等待开奖" : "发送评论"),
            aO: n.n(k.value.is_join ? "pop-lb-btn-text-join" : "pop-lb-btn-text"),
            aP: n.o(z, "f1"),
            aQ: 1 == k.value.is_online
          }, (k.value.is_online, {}), {
            aR: x.value + "px",
            aS: n.sr(_, "c787519a-9", {
              k: "lbInfo"
            }),
            aT: n.p({
              type: "bottom",
              "safe-area": !1,
              back: !0,
              "background-color": "rgba(49,35,48,0.85)",
              "mask-background-color": "rgba(255,255,255, 0)",
              "border-radius": "10px 10px 0px 0px"
            }),
            aU: H.value
          }, H.value ? {
            aV: k.value.product_image,
            aW: n.t(k.value.product_name),
            aX: n.o(E, "c3")
          } : {
            aY: e.config.pic_url + "/20260228102858b7e599674.png",
            aZ: n.o((function(e) {
              return $(1)
            }), "5c"),
            ba: n.o(F, "0e")
          }, {
            bb: !H.value
          }, H.value ? {} : {
            bc: n.o((function(e) {
              return $(1)
            }), "8b"),
            bd: n.p({
              type: "close",
              color: "#ffffff",
              size: "24"
            })
          }, {
            be: n.sr(h, "c787519a-10", {
              k: "lbResult"
            }),
            bf: n.p({
              type: "center",
              "is-mask-click": !1
            }),
            bg: n.t(W.value.length),
            bh: n.f(W.value, (function(e, a, u) {
              return {
                a: e.avatarUrl ? e.avatarUrl : "/static/login-default.png",
                b: n.t(e.nickName),
                c: e.user_id
              }
            })),
            bi: n.o((function(e) {
              return $(2)
            }), "a9"),
            bj: n.p({
              type: "close",
              color: "#ffffff",
              size: "24"
            }),
            bk: n.sr(y, "c787519a-12", {
              k: "lbResultWinner"
            }),
            bl: n.p({
              type: "center",
              "is-mask-click": !1
            }),
            bm: n.t(C.value),
            bn: 1 == T.value
          }, 1 == T.value ? {
            bo: n.o(Q, "51")
          } : {
            bp: n.o(V, "7c")
          }, {
            bq: n.sr(S, "c787519a-14", {
              k: "countdownPointsPop"
            }),
            br: n.p({
              type: "center",
              "is-mask-click": !1
            }),
            bs: n.t(N.value),
            bt: 1 == O.value
          }, 1 == O.value ? {
            bv: n.o(Z, "c0")
          } : {
            bw: n.o(ee, "94")
          }, {
            bx: n.sr(L, "c787519a-15", {
              k: "countdownRedpackPop"
            }),
            by: n.p({
              type: "center",
              "is-mask-click": !1
            }),
            bz: n.sr(G, "c787519a-16", {
              k: "withdrawSc"
            }),
            bA: n.p({
              "show-delay-tip": !0
            }),
            bB: Ce.value
          }, Ce.value ? {
            bC: n.sr(Te, "c787519a-17", {
              k: "complaintRef"
            }),
            bD: n.p({
              "live-id": l.liveId
            })
          } : {})
        }
    }
  },
  f = n._export_sfc(p, [
    ["__scopeId", "data-v-c787519a"]
  ]);
wx.createComponent(f);