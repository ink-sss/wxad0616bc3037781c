var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  a = require("../../@babel/runtime/helpers/asyncToGenerator"),
  l = require("../../common/vendor.js"),
  t = require("../../common/utils.js"),
  u = require("../../store/index.js"),
  n = require("../../store/chat.js");
Array || l.resolveComponent("uni-notice-bar")();
Math || (l.unref(i) + l.unref(m) + l.unref(v) + l.unref(s) + f + function() {
  return "../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js"
} + l.unref(o) + g + l.unref(r) + _ + h + l.unref(d) + c + p)();
var i = function() {
    return "./commponents/live-title.js"
  },
  o = function() {
    return "./commponents/people-number.js"
  },
  r = function() {
    return "./commponents/barrage-list.js"
  },
  v = function() {
    return "./commponents/bottom-option.js"
  },
  s = function() {
    return "./commponents/dz-full-screen.js"
  },
  d = function() {
    return "./commponents/wait-countdown.js"
  },
  c = function() {
    return "../login/login-pop.js"
  },
  _ = function() {
    return "./commponents/full-screen-loading.js"
  },
  f = function() {
    return "./commponents/trtc-live.js"
  },
  m = function() {
    return "./commponents/end-topicon.js"
  },
  p = function() {
    return "./commponents/watch-type-verify.js"
  },
  g = function() {
    return "./commponents/manager-permission.js"
  },
  h = function() {
    return "./commponents/subscribe.js"
  },
  x = {
    __name: "live-vertical",
    setup: function(i) {
      var o = n.useChatStore(),
        r = l.getCurrentInstance(),
        v = l.ref(2),
        s = l.ref(""),
        d = l.ref({}),
        c = getApp(),
        _ = l.ref(0),
        f = l.ref(null),
        m = l.ref({
          live_status: 101
        }),
        p = l.ref(""),
        g = l.ref(""),
        h = l.ref(null),
        x = l.ref(0),
        w = l.ref(0),
        y = l.ref(0),
        b = l.ref(null),
        S = l.ref(!0),
        k = l.ref("1"),
        T = l.ref(0),
        C = l.ref(0),
        P = l.ref(0),
        R = l.ref("请登录才能观看"),
        j = l.ref(0),
        M = l.ref(null),
        O = l.ref(null),
        $ = l.ref(0),
        I = l.ref(null),
        L = l.ref(0);
      l.ref(0), l.ref(0);
      var U = l.ref(1),
        B = l.ref(""),
        D = l.ref(!1),
        q = l.ref(null);
      l.provide("roomId", l.computed((function() {
        return _.value
      }))), l.provide("is_showNotice", l.computed((function() {
        return la.value
      }))), l.provide("self_group", l.computed((function() {
        return U.value
      }))), l.provide("supplier_user_id", l.computed((function() {
        return B.value
      }))), l.provide("anchor_id", l.computed((function() {
        return q.value
      }))), l.provide("shop_supplier_id", l.computed((function() {
        return m.value.shop_supplier_id
      }))), l.onLoad((function(e) {
        l.wx$1.getSystemInfo({
          success: function(e) {
            console.log(e, "res"), "windows" != e.platform && "mac" != e.platform && "ohos_pc" != e.platform || (l.index.showToast({
              title: "不支持电脑观看",
              icon: "none",
              duration: 2e3
            }), setTimeout((function() {
              l.index.reLaunch({
                url: "/pages/index/index"
              })
            }), 2e3))
          }
        }), l.index.hideShareMenu();
        var a = t.utils.getSceneData(e);
        a && a.referee_id && l.index.setStorageSync("referee_id", a.referee_id), a && a.uid && l.index.setStorageSync("referee_id", a.uid), _.value = a.live_id, M.value = a.store_id, ye(_.value), l.index.removeStorageSync("exitImGroup"), l.wx$1.onCopyUrl((function() {
          return {
            query: r.proxy.getShareUrlParams() + "&live_id=" + _.value
          }
        })), l.wx$1.onScreenRecordingStateChanged((function(e) {
          "start" == e.state && (D.value = !0, l.index.showModal({
            title: "提示",
            content: "检测到录屏，将退出小程序以确保内容安全。",
            showCancel: !1,
            confirmText: "确定退出",
            success: function(e) {
              e.confirm && na()
            }
          })), "stop" == e.state && (D.value = !1)
        }))
      })), l.onShow((function(e) {
        if (l.index.setKeepScreenOn({
            keepScreenOn: !0
          }), 0 == S.value) {
          var a = l.index.getStorageSync("exitImGroup");
          a && "no" != a && (qe(), K(!1)), l.index.removeStorageSync("exitImGroup")
        }
        S.value = !1
      })), l.onReady((function() {
        -1 !== [101, 108, 102, 109, 104].indexOf(m.value.live_status) && (d.value = l.index.createLivePlayerContext("live-video", r.proxy.$parent))
      })), l.onHide((function() {})), l.onUnload((function() {
        var e, a, t, u;
        null == (e = Te.value) || e.destroyInterval(), null == (a = Se.value) || a.offReceiveMessage(), null == (t = Se.value) || t.offRevokeMessage(), null == (u = f.value) || u.clearMemberInterval(), c.exitGroup(_.value), l.wx$1.offCopyUrl()
      }));
      var G = l.ref(""),
        A = l.ref("");
      l.onShareAppMessage((function() {
        return {
          title: G.value,
          path: "/pages/live/live-vertical?" + r.proxy.getShareUrlParams() + "&scene=live_id:" + _.value,
          imageUrl: A.value
        }
      }));
      var E = function(e) {
          Pe.value && Pe.value.imSendMsg(e)
        },
        N = function(e) {
          Pe.value && Pe.value.imSendMsg(e)
        };
      l.onShareTimeline((function() {
        return {
          title: G.value,
          query: "/pages/live/live-vertical?" + r.proxy.getShareUrlParams() + "&scene=live_id:" + _.value,
          imageUrl: A.value
        }
      }));
      var V = function(e) {
          2004 == e.detail.code || 2007 == e.detail.code ? 102 == m.value.live_status && (m.value.live_status = 101) : 2103 == e.detail.code ? -1 !== [101, 108].indexOf(m.value.live_status) && l.index.showToast({
            title: "主播网络不佳，正在努力恢复",
            icon: "none"
          }) : -2301 == e.detail.code ? (m.value.live_status = 102, h.value = 300, d.value.play()) : e.detail.code
        },
        W = l.ref(0),
        H = function(e) {
          W.value = e.detail.info.netSpeed
        },
        Z = function(e) {},
        z = function(e) {},
        F = function(e) {
          var a;
          if (-1 != C.value) {
            var t = (new Date).getTime();
            t - C.value < 800 || (C.value = t, 2 == v.value ? e.detail.currentTime <= e.detail.duration - 1 ? 1 == re.value && l.index.setStorageSync("time_hc_" + _.value, e.detail.currentTime) : (l.index.removeStorageSync("time_hc_" + _.value), 1 != (null == (a = m.value) ? void 0 : a.replay_type) && 1 != de.value || je(), 1 != m.value.is_look_end && r.proxy._post("live.index/membersLookEnd", {
              live_id: _.value
            }, (function(e) {}), (function(e) {}))) : e.detail.duration - e.detail.currentTime < 1 && je())
          }
        },
        K = function() {
          var e = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0],
            a = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
          we(_.value), a ? r.proxy._post("live.index/updateLiveMember", {
            live_id: _.value,
            referee_id: l.index.getStorageSync("referee_id"),
            store_id: M.value
          }, (function(a) {
            u.store.commit("changeGradeDetail", a.data), c.addGroup(_.value, (function() {
              var a, l;
              e && (null == (a = Te.value) || a.addZanNum(), null == (l = f.value) || l.memberStart())
            }))
          }), (function(e) {})) : c.addGroup(_.value, (function() {
            var a, l;
            e && (null == (a = Te.value) || a.addZanNum(), null == (l = f.value) || l.memberStart())
          })), se.value && ye(_.value), j.value = 1, J()
        },
        J = function() {
          r.proxy._post("live.market/getRoomSetLuckyBag", {
            room_id: _.value
          }, (function(e) {
            1 == e.code && e.data.id && ze(e.data.end)
          })), r.proxy._post("live.market/getRoomSetCountdownPoints", {
            room_id: _.value
          }, (function(e) {
            1 == e.code && e.data.id && Qe(e.data.end, e.data.countdown_type, e.data.time_type, e.data.time, e.data.id)
          })), r.proxy._post("live.market/getRoomSetCountdownRedpack", {
            room_id: _.value
          }, (function(e) {
            1 == e.code && e.data.id && Ye(e.data.end, e.data.countdown_type, e.data.time_type, e.data.time, e.data.id)
          })), aa(), ta(), ua()
        },
        Q = l.ref(0),
        X = l.ref(0),
        Y = l.ref(0),
        ee = l.ref(1),
        ae = l.ref(1),
        le = l.ref(1),
        te = l.ref(null),
        ue = l.ref(null),
        ne = l.ref(1);
      l.ref(null);
      var ie = l.ref(1),
        oe = l.ref(0),
        re = l.ref(1),
        ve = l.ref(1),
        se = l.ref(!1),
        de = l.ref(0),
        ce = l.ref(""),
        _e = l.ref(null),
        fe = l.ref(!1),
        me = l.ref(0),
        pe = l.ref(null),
        ge = l.ref(""),
        he = l.ref(""),
        xe = l.ref(""),
        we = function(e) {
          r.proxy._post("live.index/indexupdate", {
            live_id: e,
            referee_id: l.index.getStorageSync("referee_id")
          }, (function(e) {
            1 != e.code && -11 != e.code || (ie.value = e.data.room_setting.is_share, U.value = e.data.room_setting.self_group, 1 == ie.value && (1 == U.value ? l.index.hideShareMenu() : l.wx$1.showShareMenu({
              menus: ["shareAppMessage", "shareTimeline"]
            })), be())
          }))
        },
        ye = function(e) {
          var a = l.index.getStorageSync("room_verify_pwd_" + e),
            t = l.index.getStorageSync("room_verify_mobile_" + e);
          r.proxy._post("live.index/index", {
            live_id: e,
            referee_id: l.index.getStorageSync("referee_id"),
            store_id: M.value,
            pwd: a,
            url: "",
            mobile: t
          }, (function(a) {
            var t, n, i, r, d, _, f, S, C, j, M, $, D, E, N, V, W, H, Z, z, F, J, we, ye, ke, Te, Ce, Re, Me, $e, Ie, Le, Ue, Be, De, qe, Ge;
            if (se.value = !1, 1 == a.code || -11 == a.code) {
              if (0 == a.data.room_setting.is_capture_screen && (l.wx$1.setVisualEffectOnCapture({
                  visualEffect: "hidden",
                  success: function(e) {},
                  fail: function(e) {},
                  complete: function(e) {}
                }), l.wx$1.onUserCaptureScreen((function(e) {}))), k.value = a.data.room_setting.live_page, l.nextTick$1(), m.value = a.data.live_detail, p.value = a.data.live_detail.name, g.value = a.data.live_detail.author_avatarUrl, G.value = "" == m.value.share_text ? m.value.name : m.value.share_text, de.value = m.value.look_one, A.value = m.value.share_img, null == (t = Se.value) || t.setExplain(a.data.explain_show_data), null == (n = Se.value) || n.setTopBa(a.data.room_setting.top_ba), 3 == m.value.source && (x.value = m.value.initial_time), w.value = m.value.speak_interval, y.value = m.value.speak_pic, te.value = a.data.room_setting.is_creating_order, ue.value = a.data.room_setting.is_hot_sale, le.value = a.data.room_setting.is_customer_service, Q.value = a.data.room_setting.is_anonymous, X.value = a.data.room_setting.is_avatar_anonymous, Y.value = a.data.room_setting.is_grade, ee.value = a.data.room_setting.is_online_number, ne.value = a.data.room_setting.is_redirect_home, ae.value = a.data.room_setting.is_order, ie.value = a.data.room_setting.is_share, B.value = a.data.room_setting.supplier_user_id, ve.value = a.data.room_setting.is_submit_order_success, re.value = a.data.room_setting.is_continue_watching, U.value = a.data.room_setting.self_group, T.value = m.value.is_trtc, P.value = m.value.sales_one, xe.value = a.data.live_notice, u.store.commit("changeProhibition", a.data.live_detail.is_prohibition), u.store.commit("changeFakeProhibition", a.data.live_detail.is_fake_prohibition), u.store.commit("changeCloseComment", a.data.live_detail.close_comment), q.value = a.data.live_detail.anchor_id, l.index.setNavigationBarTitle({
                  title: p.value
                }), 0 == a.data.room_setting.is_capture_screen && (l.wx$1.setVisualEffectOnCapture({
                  visualEffect: "hidden",
                  success: function(e) {},
                  fail: function(e) {},
                  complete: function(e) {}
                }), l.wx$1.onUserCaptureScreen((function(e) {}))), 1 == de.value && 1 == m.value.is_look_end && je(), null != a.data.live_detail.grade_detail && null != a.data.live_detail.grade_detail.name && u.store.commit("changeGradeDetail", a.data.live_detail.grade_detail), Oe(a.data.room_setting.is_show_shopping_cart), 1 == a.data.room_setting.self_group && (oe.value = 1, c.globalData.is_login ? (be(), R.value = "验证中...") : null == (i = b.value) || i.showUserLoginPop(a.data.room_setting.unconscious_login)), 0 == a.data.room_setting.is_share || 1 == U.value ? l.index.hideShareMenu() : l.wx$1.showShareMenu({
                  menus: ["shareAppMessage", "shareTimeline"]
                }), 1 == m.value.source || 4 == m.value.source ? v.value = 1 : v.value = m.value.source, -1 !== [101, 108, 104].indexOf(m.value.live_status)) s.value = m.value.pull_url;
              else if (-1 !== [102, 109].indexOf(m.value.live_status)) {
                102 == m.value.live_status && (s.value = m.value.pull_url, a.data.room_setting.is_countdown_subscribe && (ce.value = a.data.room_setting.subscribe_template_id, fe.value = !0));
                var Ae = parseInt((new Date).getTime() / 1e3);
                Ae < m.value.start_time ? h.value = m.value.start_time - Ae : h.value = 0
              } else m.value.live_status;
              if ((101 == m.value.live_status || 102 == m.value.live_status) && a.code, 2 == v.value)
                if (1 == re.value) {
                  var Ee = l.index.getStorageSync("time_hc_" + e);
                  "" != Ee && null != Ee & null != Ee && Ee > 0 && (x.value = Ee)
                } else l.index.removeStorageSync("time_hc_" + e), x.value = 0;
              null != a.data.signPackage && null != a.data.signPackage && "" != a.data.signPackage && (null == (r = Pe.value) || r.setWebWechatShare(a.data.signPackage, p.value, G.value, A.value)), a.data.room_setting.is_next_subscribe && "" != a.data.room_setting.subscribe_template_id && a.data.room_setting.next_time && (ce.value = a.data.room_setting.subscribe_template_id, _e.value = a.data.room_setting.next_time, me.value = a.data.room_setting.is_cycle_subscribe, pe.value = a.data.room_setting.cycle_subscribe_type, ge.value = a.data.room_setting.cycle_subscribe_day, he.value = a.data.room_setting.cycle_subscribe_time), c.globalData.is_login ? (K(), (null == (d = m.value) ? void 0 : d.luckyBag) && (null == (f = null == (_ = m.value) ? void 0 : _.luckyBag) ? void 0 : f.id) && ze(null == (C = null == (S = m.value) ? void 0 : S.luckyBag) ? void 0 : C.end), (null == (j = m.value) ? void 0 : j.countdownPoints) && (null == ($ = null == (M = m.value) ? void 0 : M.countdownPoints) ? void 0 : $.id) && Qe(null == (E = null == (D = m.value) ? void 0 : D.countdownPoints) ? void 0 : E.end, null == (V = null == (N = m.value) ? void 0 : N.countdownPoints) ? void 0 : V.countdown_type, null == (H = null == (W = m.value) ? void 0 : W.countdownPoints) ? void 0 : H.time_type, null == (z = null == (Z = m.value) ? void 0 : Z.countdownPoints) ? void 0 : z.time, null == (J = null == (F = m.value) ? void 0 : F.countdownPoints) ? void 0 : J.id), (null == (we = m.value) ? void 0 : we.countdownRedpack) && (null == (ke = null == (ye = m.value) ? void 0 : ye.countdownRedpack) ? void 0 : ke.id) && Ye(null == (Ce = null == (Te = m.value) ? void 0 : Te.countdownRedpack) ? void 0 : Ce.end, null == (Me = null == (Re = m.value) ? void 0 : Re.countdownRedpack) ? void 0 : Me.countdown_type, null == (Ie = null == ($e = m.value) ? void 0 : $e.countdownRedpack) ? void 0 : Ie.time_type, null == (Ue = null == (Le = m.value) ? void 0 : Le.countdownRedpack) ? void 0 : Ue.time, null == (De = null == (Be = m.value) ? void 0 : Be.countdownRedpack) ? void 0 : De.id), m.value.storeCoupon && u.store.commit("roomChangeWelfareOpen", m.value.storeCoupon), aa(), ta()) : null == (qe = b.value) || qe.showUserLoginPop(a.data.room_setting.unconscious_login), o.setLiveInfo(m)
            } else - 2 == a.code ? l.index.redirectTo({
              url: "/pages/live/block"
            }) : -3 == a.code ? (k.value = 2, p.value = a.data.name, g.value = a.data.img, I.value = a.data.auth_img_url, L.value = a.data.watch_price, O.value.open(a.data.watch_type), c.globalData.is_login ? K(!1, !0) : (se.value = !0, null == (Ge = b.value) || Ge.showUserLoginPop(a.data.unconscious_login))) : l.index.showToast({
              title: a.msg
            })
          }), (function(e) {
            console.log("errerrerrerrerr"), console.log(e)
          }))
        },
        be = function() {
          var e = l.wx$1.getEnterOptionsSync(),
            a = null == e ? void 0 : e.shareTicket;
          if (0 != U.value && 1 != ie.value) return a || 0 != ie.value ? void(0 == ie.value && a && l.wx$1.login({
            success: function(e) {
              var t = e.code;
              l.wx$1.authPrivateMessage({
                shareTicket: a,
                success: function(e) {
                  e.valid ? r.proxy._get("live.qrcode/verifyShare", {
                    live_id: _.value,
                    encryptedData: e.encryptedData,
                    iv: e.iv,
                    shareTicket: a,
                    code: t
                  }, (function(e) {
                    1 == e.code || -11 == e.code ? (oe.value = 0, setTimeout((function() {
                      J()
                    }), 500)) : l.index.redirectTo({
                      url: "/pages/live/secret"
                    })
                  })) : l.index.redirectTo({
                    url: "/pages/live/secret"
                  })
                },
                fail: function(e) {
                  l.index.redirectTo({
                    url: "/pages/live/secret"
                  })
                }
              })
            }
          })) : (oe.value = 0, void setTimeout((function() {
            J()
          }), 500));
          oe.value = 0
        },
        Se = l.ref(null),
        ke = function(e, a, l, t, u, n, i) {
          var o;
          null == (o = Se.value) || o.sendBarrage(e, a, l, t, u, n, i)
        },
        Te = l.ref(null),
        Ce = function() {
          var e;
          null == (e = Te.value) || e.userTapZan()
        },
        Pe = l.ref(null),
        Re = function(e, a) {
          var l;
          null == (l = Pe.value) || l.showOrder(e, a)
        },
        je = function() {
          m.value.live_status = 103, l.index.removeStorageSync("time_hc_" + m.value.room_id)
        },
        Me = l.ref(!0),
        Oe = function(e) {
          Me.value = 0 != e
        },
        $e = l.ref(!1),
        Ie = l.ref(!1),
        Le = l.ref(null),
        Ue = function() {
          var t = a(e().mark((function a() {
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return e.next = 2, l.nextTick$1();
                case 2:
                  1 == T.value && ($e.value = !0, Ie.value = !0, setTimeout((function() {
                    $e.value = !1
                  }), 1500));
                case 3:
                case "end":
                  return e.stop()
              }
            }), a)
          })));
          return function() {
            return t.apply(this, arguments)
          }
        }(),
        Be = function() {
          $e.value = !0, Ie.value = !1, l.index.redirectTo({
            url: "/pages/live/live-vertical?scene=live_id:" + _.value
          })
        },
        De = function() {
          var e;
          null == (e = Le.value) || e.closeLm()
        },
        qe = function() {
          var e;
          null == (e = Se.value) || e.clearScreen()
        },
        Ge = l.ref(null),
        Ae = 1,
        Ee = function() {
          2 != m.value.source && 3 != m.value.source || (Ge = setInterval((function() {
            if (Ae > 5) return l.index.showToast({
              title: "未开始，稍后请手动刷新",
              icon: "none",
              duration: 3e3
            }), void clearInterval(Ge);
            l.index.showToast({
              title: "刷新中",
              icon: "none"
            }), r.proxy._post("live.index/getLiveStatus", {
              live_id: m.value.room_id
            }, (function(e) {
              Ae++, 1 == e.code && (108 != e.data && 101 != e.data || (clearInterval(Ge), ye(m.value.room_id)))
            }))
          }), 3e3))
        },
        Ne = function() {
          l.index.setStorageSync("time_hc_" + m.value.room_id, 0)
        },
        Ve = function() {
          C.value = -1
        },
        We = function() {
          C.value = 0
        },
        He = function() {
          ye(m.value.room_id)
        },
        Ze = function() {
          var e;
          null == (e = f.value) || e.hideLuckyBag()
        },
        ze = function(e) {
          var a;
          null == (a = f.value) || a.showLuckyBag(e)
        },
        Fe = function(e, a) {
          var l;
          null == (l = f.value) || l.luckyBagResult(e, a)
        },
        Ke = function() {
          O.value.close()
        },
        Je = function() {
          var e;
          null == (e = f.value) || e.hideCountdownPoints()
        },
        Qe = function(e, a, l, t, u) {
          var n;
          null == (n = f.value) || n.showCountdownPoints(e, a, l, t, u)
        },
        Xe = function() {
          var e;
          null == (e = f.value) || e.hideCountdownRedpack()
        },
        Ye = function(e, a, l, t, u) {
          var n;
          null == (n = f.value) || n.showCountdownRedpack(e, a, l, t, u)
        },
        ea = l.ref(null),
        aa = function() {
          var e;
          _e.value && (null == (e = f.value) || e.showSubscribeBtn(_e.value, ce.value, me.value, pe.value, ge.value, he.value)), fe.value && setTimeout((function() {
            var e;
            null == (e = ea.value) || e.showSubscribeBtn(-1, ce.value, "", "", "", "")
          }), 800)
        },
        la = l.ref(!1),
        ta = function() {
          la.value = !0
        },
        ua = function() {
          m.value.anchor_id && r.proxy._post("live.index/checkRoomAssistant", {
            supplier_id: m.value.shop_supplier_id,
            anchor_id: m.value.anchor_id
          }, (function(e) {
            1 == e.code && (e.data ? B.value = m.value.shop_supplier_id : B.value = null)
          }))
        },
        na = function() {
          l.wx$1.exitMiniProgram({
            success: function() {
              return console.log("退出成功")
            },
            fail: function(e) {
              return console.error("退出失败:", e)
            }
          })
        },
        ia = l.ref(null),
        oa = function(e) {
          B.value = e ? m.value.shop_supplier_id : null, null == ia || ia.value.updateAssistant(e)
        };
      return function(e, a) {
        return l.e({
          a: m.value.room_id
        }, m.value.room_id ? l.e({
          b: -1 !== [101, 108, 102, 109, 104].indexOf(m.value.live_status) && 0 == oe.value
        }, -1 !== [101, 108, 102, 109, 104].indexOf(m.value.live_status) && 0 == oe.value ? l.e({
          c: 1 == v.value && !Ie.value
        }, 1 != v.value || Ie.value ? 2 == v.value || 3 == v.value ? {
          k: s.value,
          l: x.value,
          m: 2 == v.value,
          n: ["push", "pop"],
          o: l.o(Z, "26"),
          p: l.o(z, "00"),
          q: l.o(F, "1d"),
          r: l.o(Ne, "5a"),
          s: l.o(Ve, "df"),
          t: l.o(We, "47")
        } : {} : {
          d: s.value,
          e: ["push", "pop"],
          f: l.o(V, "0b"),
          g: l.o(H, "26"),
          h: l.o(Z, "7b"),
          i: l.o(z, "5e")
        }, {
          j: 2 == v.value || 3 == v.value
        }) : {}, {
          v: 103 == m.value.live_status && 0 == oe.value
        }, 103 == m.value.live_status && 0 == oe.value ? {
          w: l.sr(Te, "6f071e31-0", {
            k: "live_title"
          }),
          x: l.p({
            "live-id": _.value,
            "live-name": p.value,
            "is-redirect-home": ne.value,
            "live-avatar": g.value
          }),
          y: l.sr("end-topicon", "6f071e31-1"),
          z: l.o(Re, "24"),
          A: l.p({
            "live-id": _.value,
            "is-order": ae.value,
            "is-customer-service": le.value
          }),
          B: l.sr(Pe, "6f071e31-2", {
            k: "bottom_option"
          }),
          C: l.o(qe, "b6"),
          D: l.o(ke, "2a"),
          E: l.p({
            "live-name": p.value,
            "is-order": ae.value,
            "is-share": ie.value,
            "live-id": _.value,
            "live-status": m.value.live_status,
            "speak-interval": w.value,
            "speak-pic": y.value,
            showCart: Me.value
          })
        } : {}, {
          F: 1 == oe.value
        }, 1 == oe.value ? {
          G: l.sr(Te, "6f071e31-3", {
            k: "live_title"
          }),
          H: l.p({
            "live-id": _.value,
            "live-name": p.value,
            "is-redirect-home": ne.value,
            "live-avatar": g.value
          }),
          I: l.sr("end-topicon", "6f071e31-4"),
          J: l.o(Re, "e7"),
          K: l.p({
            "live-id": _.value,
            "is-order": ae.value,
            "is-customer-service": le.value
          }),
          L: l.t(R.value)
        } : {}) : {}, {
          M: -1 !== [101, 108, 102, 109, 104].indexOf(m.value.live_status) && 0 == oe.value
        }, -1 !== [101, 108, 102, 109, 104].indexOf(m.value.live_status) && 0 == oe.value ? l.e({
          N: !Ie.value
        }, Ie.value ? {} : {
          O: l.o(Ce, "20")
        }, {
          P: 1 == v.value && Ie.value
        }, 1 == v.value && Ie.value ? {
          Q: l.sr(Le, "6f071e31-6", {
            k: "trtc_live_sc"
          }),
          R: l.o(Be, "92"),
          S: l.p({
            "live-id": _.value
          })
        } : {}, {
          T: l.sr(Te, "6f071e31-7", {
            k: "live_title"
          }),
          U: l.p({
            "live-id": _.value,
            "live-name": p.value,
            "is-redirect-home": ne.value,
            "live-avatar": g.value
          }),
          V: m.value.comment_notice
        }, m.value.comment_notice ? {
          W: l.p({
            color: "#ffffff",
            "background-color": "rgba(1,1,1,0.75)",
            speed: 50,
            scrollable: !0,
            single: !0,
            text: m.value.comment_notice
          })
        } : {}, {
          X: l.sr(f, "6f071e31-9", {
            k: "people_number"
          }),
          Y: l.o(Re, "1e"),
          Z: l.o(E, "db"),
          aa: l.o(N, "e0"),
          ab: l.p({
            "is-login": j.value,
            "is-online-number": ee.value,
            speed: W.value,
            "live-id": _.value,
            "is-order": ae.value,
            "is-customer-service": le.value
          }),
          ac: B.value
        }, B.value ? {
          ad: l.sr(ia, "6f071e31-10", {
            k: "manager_permission"
          }),
          ae: l.p({
            "live-id": _.value
          })
        } : {}, {
          af: _.value
        }, _.value ? {
          ag: l.sr(Se, "6f071e31-11", {
            k: "barrage_list"
          }),
          ah: l.o(Re, "e9"),
          ai: l.o(je, "64"),
          aj: l.o(Oe, "e1"),
          ak: l.o(Ue, "59"),
          al: l.o(He, "e4"),
          am: l.o(Ze, "d0"),
          an: l.o(ze, "73"),
          ao: l.o(Fe, "dc"),
          ap: l.o(Ke, "80"),
          aq: l.o(Qe, "95"),
          ar: l.o(Je, "b1"),
          as: l.o(Ye, "2c"),
          at: l.o(Xe, "28"),
          av: l.o(oa, "06"),
          aw: l.p({
            "is-anonymous": Q.value,
            "is-avatar-anonymous": X.value,
            "is-grade": Y.value,
            "live-notice": xe.value,
            "is-creating-order": te.value,
            "is-hot-sale": ue.value,
            "sales-one": P.value,
            "is-submit-order-success": ve.value
          })
        } : {}, {
          ax: l.sr(Pe, "6f071e31-12", {
            k: "bottom_option"
          }),
          ay: l.o(qe, "63"),
          az: l.o(ke, "16"),
          aA: l.o(De, "73"),
          aB: l.p({
            "live-avatar": g.value,
            "live-name": p.value,
            "is-order": ae.value,
            "is-share": ie.value,
            "live-id": _.value,
            "speak-interval": w.value,
            "speak-pic": y.value,
            showCart: Me.value,
            isTrtc: T.value,
            is_trtc_go: Ie.value
          }),
          aC: $.value + "px",
          aD: $e.value
        }, $e.value ? {
          aE: l.p({
            title: "正在进入连麦，请稍后"
          })
        } : {}) : {}, {
          aF: -1 !== [102, 109].indexOf(m.value.live_status) && 0 == oe.value
        }, -1 !== [102, 109].indexOf(m.value.live_status) && 0 == oe.value ? l.e({
          aG: m.value.cover_img_url
        }, m.value.cover_img_url ? {
          aH: m.value.cover_img_url
        } : {}, {
          aI: l.sr(ea, "6f071e31-14", {
            k: "sbRef"
          }),
          aJ: l.o(Ee, "e5"),
          aK: l.p({
            "live-name": p.value,
            totalSeconds: h.value
          }),
          aL: l.sr(Pe, "6f071e31-16", {
            k: "bottom_option"
          }),
          aM: l.o(qe, "92"),
          aN: l.o(ke, "5f"),
          aO: l.o(De, "6e"),
          aP: l.p({
            "live-name": p.value,
            "is-order": ae.value,
            "is-share": ie.value,
            "live-id": _.value,
            "live-status": m.value.live_status,
            "speak-interval": w.value,
            "speak-pic": y.value,
            showCart: Me.value
          })
        }) : {}, {
          aQ: l.sr(b, "6f071e31-17", {
            k: "user_login"
          }),
          aR: l.o((function(e) {
            return K(!0, !0)
          }), "24"),
          aS: l.sr(O, "6f071e31-18", {
            k: "watchTypeVerifyRef"
          }),
          aT: l.o(ye, "81"),
          aU: l.p({
            "live-id": _.value,
            "live-name": p.value,
            "live-avatar": g.value,
            "auth-img": I.value,
            "watch-price": L.value
          }),
          aV: D.value
        }, (D.value, {}), {
          aW: 2 == k.value
        })
      }
    }
  },
  w = l._export_sfc(x, [
    ["__scopeId", "data-v-6f071e31"]
  ]);
x.__runtimeHooks = 22, wx.createPage(w);