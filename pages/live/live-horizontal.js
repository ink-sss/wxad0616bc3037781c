var e = require("../../common/vendor.js"),
  a = require("../../store/index.js"),
  o = require("../../common/utils.js"),
  l = require("../../store/chat.js");
Array || e.resolveComponent("uni-notice-bar")();
Math || (e.unref(n) + function() {
  return "../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js"
} + r + f + p + e.unref(v) + e.unref(t) + e.unref(u) + m + e.unref(i) + s + c + d + _)();
var n = function() {
    return "./commponents/live-title.js"
  },
  u = function() {
    return "./commponents/people-number.js"
  },
  t = function() {
    return "./commponents/bottom-option.js"
  },
  i = function() {
    return "./commponents/barrage-list-horizontal.js"
  },
  r = function() {
    return "../../components/uni-icon/uni-icon.js"
  },
  v = function() {
    return "./commponents/wait-countdown.js"
  },
  s = function() {
    return "../login/login-pop.js"
  },
  c = function() {
    return "./commponents/sign-in2.js"
  },
  d = function() {
    return "./commponents/check-in.js"
  },
  f = function() {
    return "./commponents/coupon-claim.js"
  },
  _ = function() {
    return "./commponents/watch-type-verify.js"
  },
  m = function() {
    return "./commponents/manager-permission.js"
  },
  p = function() {
    return "./commponents/subscribe.js"
  },
  g = {
    __name: "live-horizontal",
    setup: function(n) {
      var u = l.useChatStore(),
        t = e.getCurrentInstance(),
        i = e.ref(2),
        r = e.ref(""),
        v = e.ref(""),
        s = e.ref({}),
        c = getApp(),
        d = e.ref(0),
        f = e.ref({
          live_status: 101,
          questions: []
        }),
        _ = e.ref(""),
        m = e.ref(0),
        p = e.ref(null),
        g = e.ref(!1),
        h = e.ref(!1),
        x = e.ref(!1),
        y = e.ref(0),
        w = e.ref(0),
        b = e.ref(0),
        S = e.ref(null),
        k = e.ref(!0),
        T = e.ref("1"),
        P = e.ref(null),
        C = e.ref("horizontal"),
        R = e.ref(0),
        O = e.ref("请登录才能观看"),
        j = e.ref(0),
        q = e.ref(null),
        M = e.ref(null),
        I = e.ref(0),
        L = e.ref(null),
        U = e.ref(null),
        $ = e.ref(null),
        B = e.ref(0);
      e.ref(0), e.ref(0);
      var D = e.ref(1),
        z = e.ref(0),
        E = e.ref(!1),
        A = e.ref(null),
        G = e.ref({});
      e.provide("roomId", e.computed((function() {
        return d.value
      }))), e.provide("is_showNotice", e.computed((function() {
        return ua.value
      }))), e.provide("self_group", e.computed((function() {
        return D.value
      }))), e.provide("supplier_user_id", e.computed((function() {
        return z.value
      }))), e.provide("anchor_id", e.computed((function() {
        return A.value
      }))), e.provide("video_questions", e.computed((function() {
        var e;
        return null == (e = f.value) ? void 0 : e.questions
      }))), e.provide("video_question_log", G), e.provide("look_finish_submit_question", e.computed((function() {
        var e;
        return (null == (e = f.value) ? void 0 : e.look_finish_submit_question) && (2 == f.value.source || 3 == f.value.source)
      }))), e.onLoad((function(a) {
        e.wx$1.getSystemInfo({
          success: function(a) {
            console.log(a, "res"), "windows" != a.platform && "mac" != a.platform && "ohos_pc" != a.platform || (e.index.showToast({
              title: "不支持电脑观看",
              icon: "none",
              duration: 2e3
            }), setTimeout((function() {
              e.index.reLaunch({
                url: "/pages/index/index"
              })
            }), 2e3))
          }
        });
        var l = t.proxy.getNavHeight();
        m.value = l.navHeight > 0 ? l.navHeight : 0;
        var n = o.utils.getSceneData(a);
        n && n.referee_id && e.index.setStorageSync("referee_id", n.referee_id), n && n.uid && e.index.setStorageSync("referee_id", n.uid), d.value = n.live_id, L.value = n.store_id, be(d.value), e.wx$1.onCopyUrl((function() {
          return {
            query: t.proxy.getShareUrlParams() + "&live_id=" + d.value
          }
        })), e.wx$1.onScreenRecordingStateChanged((function(a) {
          "start" == a.state && (E.value = !0, e.index.showModal({
            title: "提示",
            content: "检测到录屏，将退出小程序以确保内容安全。",
            showCancel: !1,
            confirmText: "确定退出",
            success: function(e) {
              e.confirm && fa()
            }
          })), "stop" == a.state && (E.value = !1)
        }))
      })), e.onShow((function(a) {
        var o;
        if (0 == k.value) {
          var l = e.index.getStorageSync("exitImGroup");
          l && "no" != l && (null == (o = je.value) || o.clearScreen(1), Z(!1)), e.index.removeStorageSync("exitImGroup")
        }
        k.value = !1
      })), e.onReady((function() {
        -1 !== [101, 108, 102, 109, 104].indexOf(f.value.live_status) && (s.value = e.index.createLivePlayerContext("live-video", t.proxy.$parent))
      })), e.onUnload((function() {
        var a, o, l;
        console.log("销毁页面了，开始销毁逻辑"), null == (a = je.value) || a.offReceiveMessage(), null == (o = je.value) || o.offRevokeMessage(), null == (l = P.value) || l.clearMemberInterval(), c.exitGroup(d.value), e.wx$1.offCopyUrl()
      }));
      var H = e.ref(""),
        F = e.ref("");
      e.onShareAppMessage((function() {
        return {
          title: H.value,
          path: "/pages/live/live-horizontal?" + t.proxy.getShareUrlParams() + "&scene=live_id:" + d.value,
          imageUrl: F.value
        }
      })), e.onShareTimeline((function() {
        return {
          title: H.value,
          query: "/pages/live/live-horizontal?" + t.proxy.getShareUrlParams() + "&scene=live_id:" + d.value,
          imageUrl: F.value
        }
      }));
      var N = function(e) {
          ze.value && ze.value.imSendMsg(e)
        },
        V = function(e) {
          ze.value && ze.value.imSendMsg(e)
        },
        W = function(a) {
          2004 == a.detail.code || 2007 == a.detail.code ? 102 == f.value.live_status && (f.value.live_status = 101) : 2103 == a.detail.code ? -1 !== [101, 108].indexOf(f.value.live_status) && e.index.showToast({
            title: "主播网络不佳，正在努力恢复",
            icon: "none"
          }) : -2301 == a.detail.code ? (f.value.live_status = 102, p.value <= 0 && (p.value = 300), s.value.play()) : a.detail.code
        },
        J = e.ref(0),
        K = function(e) {
          J.value = e.detail.info.netSpeed
        },
        Q = function(e) {},
        X = function(e) {},
        Y = function(a) {
          var o;
          if (-1 != R.value) {
            var l = (new Date).getTime();
            l - R.value < 800 || (R.value = l, 2 == i.value ? a.detail.currentTime <= a.detail.duration - 1 ? 1 == se.value && e.index.setStorageSync("time_hc_" + d.value, a.detail.currentTime) : (e.index.removeStorageSync("time_hc_" + d.value), 1 != (null == (o = f.value) ? void 0 : o.replay_type) && 1 != fe.value || Ae(), 1 != f.value.is_look_end && t.proxy._post("live.index/membersLookEnd", {
              live_id: d.value
            }, (function(e) {}), (function(e) {}))) : a.detail.duration - a.detail.currentTime < 1 && Ae())
          }
        },
        Z = function() {
          var o = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0],
            l = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
          ae(d.value), l ? t.proxy._post("live.index/updateLiveMember", {
            live_id: d.value,
            referee_id: e.index.getStorageSync("referee_id"),
            store_id: L.value
          }, (function(e) {
            a.store.commit("changeGradeDetail", e.data), c.addGroup(d.value, (function() {
              var e;
              console.log("加入群组成功回调"), o && (null == (e = je.value) || e.memberStart())
            }))
          }), (function(e) {})) : c.addGroup(d.value, (function() {
            var e;
            console.log("加入群组成功回调"), o && (null == (e = je.value) || e.memberStart())
          })), de.value && be(d.value), ee(), j.value = 1
        },
        ee = function() {
          t.proxy._post("live.market/getRoomSetLuckyBag", {
            room_id: d.value
          }, (function(e) {
            1 == e.code && e.data.id && Qe(e.data.end)
          })), t.proxy._post("live.market/getRoomSetCountdownPoints", {
            room_id: d.value
          }, (function(e) {
            1 == e.code && e.data.id && ea(e.data.end, e.data.countdown_type, e.data.time_type, e.data.time, e.data.id)
          })), t.proxy._post("live.market/getRoomSetCountdownRedpack", {
            room_id: d.value
          }, (function(e) {
            1 == e.code && e.data.id && oa(e.data.end, e.data.countdown_type, e.data.time_type, e.data.time, e.data.id)
          })), na(), ta(), pa()
        },
        ae = function(a) {
          t.proxy._post("live.index/indexupdate", {
            live_id: a,
            referee_id: e.index.getStorageSync("referee_id")
          }, (function(a) {
            1 != a.code && -11 != a.code || (ie.value = a.data.room_setting.is_share, D.value = a.data.room_setting.self_group, 1 == ie.value && (1 == D.value ? e.index.hideShareMenu() : e.wx$1.showShareMenu({
              menus: ["shareAppMessage", "shareTimeline"]
            })), Se(), G.value = a.data.question_log)
          }))
        },
        oe = e.ref(0),
        le = e.ref(0),
        ne = e.ref(0),
        ue = e.ref(1),
        te = e.ref(1),
        ie = e.ref(1),
        re = e.ref(0),
        ve = e.ref(1),
        se = e.ref(1),
        ce = e.ref(1),
        de = e.ref(!1),
        fe = e.ref(0);
      e.ref(0);
      var _e = e.ref(""),
        me = e.ref(null),
        pe = e.ref(!1),
        ge = e.ref(0),
        he = e.ref(null),
        xe = e.ref(""),
        ye = e.ref(""),
        we = e.ref(""),
        be = function(o) {
          var l = e.index.getStorageSync("room_verify_pwd_" + o),
            n = e.index.getStorageSync("room_verify_mobile_" + o);
          t.proxy._post("live.index/index", {
            live_id: o,
            url: "",
            store_id: L.value,
            referee_id: e.index.getStorageSync("referee_id"),
            pwd: l,
            mobile: n
          }, (function(l) {
            var n, t, s, d, m, k, P, C, R, j, L, E, N, V, W, J, K, Q, X, Y, ee, ae, be, ke, Te, Pe, Ce, Re, Oe, qe, Me, Ie, Le, Ue, $e, De, Ee, Ge;
            if (de.value = !1, 1 == l.code || -11 == l.code) {
              if (0 == l.data.room_setting.is_capture_screen && (e.wx$1.setVisualEffectOnCapture({
                  visualEffect: "hidden",
                  success: function(e) {
                    console.log(e, "成功")
                  },
                  fail: function(e) {
                    console.log(e, "失败")
                  },
                  complete: function(e) {
                    console.log(e, "complete")
                  }
                }), e.wx$1.onUserCaptureScreen((function(e) {
                  console.log("用户截屏了")
                }))), T.value = l.data.room_setting.live_page, f.value = l.data.live_detail, _.value = l.data.live_detail.name, H.value = "" == f.value.share_text ? f.value.name : f.value.share_text, F.value = f.value.share_img, 3 == f.value.source && (y.value = f.value.initial_time), fe.value = f.value.look_one, w.value = f.value.speak_interval, b.value = f.value.speak_pic, oe.value = l.data.room_setting.is_anonymous, le.value = l.data.room_setting.is_avatar_anonymous, ne.value = l.data.room_setting.is_grade, ue.value = l.data.room_setting.is_online_number, te.value = l.data.room_setting.is_order, q.value = l.data.room_setting.is_creating_order, M.value = l.data.room_setting.is_hot_sale, I.value = f.value.sales_one, ve.value = l.data.room_setting.is_customer_service, ie.value = l.data.room_setting.is_share, z.value = l.data.room_setting.supplier_user_id, ce.value = l.data.room_setting.is_submit_order_success, se.value = l.data.room_setting.is_continue_watching, D.value = l.data.room_setting.self_group, we.value = l.data.live_notice, a.store.commit("changeProhibition", l.data.live_detail.is_prohibition), a.store.commit("changeFakeProhibition", l.data.live_detail.is_fake_prohibition), a.store.commit("changeCloseComment", l.data.live_detail.close_comment), A.value = l.data.live_detail.anchor_id, 0 == l.data.room_setting.is_capture_screen && (e.wx$1.setVisualEffectOnCapture({
                  visualEffect: "hidden",
                  success: function(e) {},
                  fail: function(e) {},
                  complete: function(e) {}
                }), e.wx$1.onUserCaptureScreen((function(e) {}))), 1 == fe.value && 1 == f.value.is_look_end && Ae(), null != l.data.live_detail.grade_detail && null != l.data.live_detail.grade_detail.name && a.store.commit("changeGradeDetail", l.data.live_detail.grade_detail), Be(l.data.room_setting.is_show_shopping_cart), 0 == l.data.room_setting.is_share || 1 == D.value ? e.index.hideShareMenu() : e.wx$1.showShareMenu({
                  menus: ["shareAppMessage", "shareTimeline"]
                }), null == (n = je.value) || n.setExplain(l.data.explain_show_data), null == (t = je.value) || t.setTopBa(l.data.room_setting.top_ba), f.value.comment_notice && (null == (s = je.value) || s.setCommentNotice(f.value.comment_notice)), 1 == l.data.room_setting.self_group && (re.value = 1, c.globalData.is_login ? (O.value = "验证中...", Se()) : null == (d = S.value) || d.showUserLoginPop(l.data.room_setting.unconscious_login)), 1 == f.value.source || 4 == f.value.source ? i.value = 1 : i.value = f.value.source, -1 !== [101, 108, 104].indexOf(f.value.live_status)) r.value = f.value.pull_url, 108 != f.value.live_status && 101 != f.value.live_status || 2 != f.value.source || (g.value = !0, h.value = 1 == l.data.room_setting.is_record_progress, x.value = 1 == l.data.room_setting.is_record_progress);
              else if (-1 !== [102, 109].indexOf(f.value.live_status)) {
                102 == f.value.live_status && (r.value = f.value.pull_url, l.data.room_setting.is_countdown_subscribe && (_e.value = l.data.room_setting.subscribe_template_id, pe.value = !0));
                var He = parseInt((new Date).getTime() / 1e3);
                He < f.value.start_time ? p.value = f.value.start_time - He : p.value = 0
              } else f.value.live_status;
              if (2 == i.value)
                if (1 == se.value) {
                  var Fe = e.index.getStorageSync("time_hc_" + o);
                  "" != Fe && null != Fe & null != Fe && Fe > 0 && (y.value = Fe)
                } else e.index.removeStorageSync("time_hc_" + o), y.value = 0;
              null != l.data.signPackage && null != l.data.signPackage && "" != l.data.signPackage && (null == (m = ze.value) || m.setWebWechatShare(l.data.signPackage, _.value, H.value, F.value)), l.data.room_setting.is_next_subscribe && "" != l.data.room_setting.subscribe_template_id && l.data.room_setting.next_time && (_e.value = l.data.room_setting.subscribe_template_id, me.value = l.data.room_setting.next_time, ge.value = l.data.room_setting.is_cycle_subscribe, he.value = l.data.room_setting.cycle_subscribe_type, xe.value = l.data.room_setting.cycle_subscribe_day, ye.value = l.data.room_setting.cycle_subscribe_time), c.globalData.is_login ? (Z(), (null == (k = f.value) ? void 0 : k.luckyBag) && (null == (C = null == (P = f.value) ? void 0 : P.luckyBag) ? void 0 : C.id) && Qe(null == (j = null == (R = f.value) ? void 0 : R.luckyBag) ? void 0 : j.end), (null == (L = f.value) ? void 0 : L.countdownPoints) && (null == (N = null == (E = f.value) ? void 0 : E.countdownPoints) ? void 0 : N.id) && ea(null == (W = null == (V = f.value) ? void 0 : V.countdownPoints) ? void 0 : W.end, null == (K = null == (J = f.value) ? void 0 : J.countdownPoints) ? void 0 : K.countdown_type, null == (X = null == (Q = f.value) ? void 0 : Q.countdownPoints) ? void 0 : X.time_type, null == (ee = null == (Y = f.value) ? void 0 : Y.countdownPoints) ? void 0 : ee.time, null == (be = null == (ae = f.value) ? void 0 : ae.countdownPoints) ? void 0 : be.id), (null == (ke = f.value) ? void 0 : ke.countdownRedpack) && (null == (Pe = null == (Te = f.value) ? void 0 : Te.countdownRedpack) ? void 0 : Pe.id) && oa(null == (Re = null == (Ce = f.value) ? void 0 : Ce.countdownRedpack) ? void 0 : Re.end, null == (qe = null == (Oe = f.value) ? void 0 : Oe.countdownRedpack) ? void 0 : qe.countdown_type, null == (Ie = null == (Me = f.value) ? void 0 : Me.countdownRedpack) ? void 0 : Ie.time_type, null == (Ue = null == (Le = f.value) ? void 0 : Le.countdownRedpack) ? void 0 : Ue.time, null == (De = null == ($e = f.value) ? void 0 : $e.countdownRedpack) ? void 0 : De.id), f.value.storeCoupon && a.store.commit("roomChangeWelfareOpen", f.value.storeCoupon), na(), ta(), G.value = f.value.question_log) : null == (Ee = S.value) || Ee.showUserLoginPop(l.data.room_setting.unconscious_login), u.setLiveInfo(f)
            } else - 2 == l.code ? e.index.redirectTo({
              url: "/pages/live/block"
            }) : -3 == l.code ? (_.value = l.data.name, v.value = l.data.img, $.value = l.data.auth_img_url, B.value = l.data.watch_price, U.value.open(l.data.watch_type), c.globalData.is_login ? Z(!1, !0) : (de.value = !0, null == (Ge = S.value) || Ge.showUserLoginPop(l.data.unconscious_login))) : e.index.showToast({
              title: l.msg
            })
          }), (function(e) {
            console.log("errerrerrerrerr"), console.log(e)
          }))
        },
        Se = function() {
          var a = e.wx$1.getEnterOptionsSync(),
            o = null == a ? void 0 : a.shareTicket;
          if (0 != D.value && 1 != ie.value) return o || 0 != ie.value ? void(0 == ie.value && o && e.wx$1.login({
            success: function(a) {
              var l = a.code;
              e.wx$1.authPrivateMessage({
                shareTicket: o,
                success: function(a) {
                  if (console.log("前端验证结果:", a), !a.valid) return console.log("前端验证不通过，用户非合法接收者"), void e.index.redirectTo({
                    url: "/pages/live/secret"
                  });
                  console.log("前端验证通过，发起后台解密校验"), t.proxy._get("live.qrcode/verifyShare", {
                    live_id: d.value,
                    encryptedData: a.encryptedData,
                    iv: a.iv,
                    shareTicket: o,
                    code: l
                  }, (function(a) {
                    1 == a.code || -11 == a.code ? (console.log("后台解密校验通过"), re.value = 0, setTimeout((function() {
                      ee()
                    }), 500)) : (console.log("后台解密校验失败"), e.index.redirectTo({
                      url: "/pages/live/secret"
                    }))
                  }))
                },
                fail: function(a) {
                  console.log("微信验证接口调用失败", a), e.index.redirectTo({
                    url: "/pages/live/secret"
                  })
                }
              })
            }
          })) : (re.value = 0, void setTimeout((function() {
            ee()
          }), 500));
          re.value = 0
        },
        ke = function() {
          s.value.requestFullScreen({
            direction: 90,
            success: function() {},
            fail: function(e) {}
          })
        },
        Te = function() {
          s.value.exitFullScreen({
            success: function() {},
            fail: function(e) {}
          })
        },
        Pe = e.ref(!1),
        Ce = function(e) {
          var a;
          e.detail.fullScreen ? (Re.value = !1, Pe.value = !0) : (Re.value = !1, Pe.value = !1, null == (a = je.value) || a.goScrollEnd())
        },
        Re = e.ref(!1),
        Oe = function() {
          Re.value || (Re.value = !0, setTimeout((function() {
            Re.value = !1
          }), 5e3))
        },
        je = e.ref(null),
        qe = function(e, a, o, l, n, u, t) {
          var i;
          null == (i = je.value) || i.sendBarrage(e, a, o, l, n, u, t)
        },
        Me = e.ref(!0),
        Ie = function() {
          Me.value = !1
        },
        Le = e.ref(0),
        Ue = function(e) {
          Le.value = e
        },
        $e = e.ref(!0),
        Be = function(e) {
          $e.value = 0 != e
        },
        De = function() {
          var e;
          null == (e = je.value) || e.clearScreen()
        },
        ze = e.ref(null),
        Ee = function(e, a) {
          var o;
          null == (o = ze.value) || o.showOrder(e, a)
        },
        Ae = function() {
          f.value.live_status = 103, e.index.removeStorageSync("time_hc_" + f.value.room_id)
        },
        Ge = e.ref(null),
        He = 1,
        Fe = function() {
          2 != f.value.source && 3 != f.value.source || (Ge = setInterval((function() {
            if (He > 5) return e.index.showToast({
              title: "未开始，稍后请手动刷新",
              icon: "none",
              duration: 3e3
            }), void clearInterval(Ge);
            e.index.showToast({
              title: "刷新中",
              icon: "none"
            }), t.proxy._post("live.index/getLiveStatus", {
              live_id: f.value.room_id
            }, (function(e) {
              He++, 1 == e.code && (108 != e.data && 101 != e.data || (clearInterval(Ge), be(f.value.room_id)))
            }))
          }), 3e3))
        },
        Ne = function() {
          e.index.setStorageSync("time_hc_" + f.value.room_id, 0), e.index.setStorageSync("look_finish_" + f.value.room_id, 1)
        },
        Ve = function() {
          R.value = -1
        },
        We = function() {
          R.value = 0
        },
        Je = function() {
          be(f.value.room_id)
        },
        Ke = function() {
          var e;
          null == (e = P.value) || e.hideLuckyBag()
        },
        Qe = function(e) {
          var a;
          null == (a = P.value) || a.showLuckyBag(e)
        },
        Xe = function(e, a) {
          var o;
          null == (o = P.value) || o.luckyBagResult(e, a)
        },
        Ye = function() {
          U.value.close()
        },
        Ze = function() {
          var e;
          null == (e = P.value) || e.hideCountdownPoints()
        },
        ea = function(e, a, o, l, n) {
          var u;
          null == (u = P.value) || u.showCountdownPoints(e, a, o, l, n)
        },
        aa = function() {
          var e;
          null == (e = P.value) || e.hideCountdownRedpack()
        },
        oa = function(e, a, o, l, n) {
          var u;
          null == (u = P.value) || u.showCountdownRedpack(e, a, o, l, n)
        },
        la = e.ref(null),
        na = function() {
          var e;
          me.value && (null == (e = P.value) || e.showSubscribeBtn(me.value, _e.value, ge.value, he.value, xe.value, ye.value)), pe.value && setTimeout((function() {
            var e;
            null == (e = la.value) || e.showSubscribeBtn(-1, _e.value, "", "", "", "")
          }), 800)
        },
        ua = e.ref(!1),
        ta = function() {
          ua.value = !0
        },
        ia = e.ref(null),
        ra = e.ref(null),
        va = function(e) {},
        sa = function(e) {},
        ca = function(e) {},
        da = function(e) {},
        fa = function() {
          e.wx$1.exitMiniProgram({
            success: function() {
              return console.log("退出成功")
            },
            fail: function(e) {
              return console.error("退出失败:", e)
            }
          })
        },
        _a = e.ref(null),
        ma = function(e) {
          z.value = e ? f.value.shop_supplier_id : null, null == _a || _a.value.updateAssistant(e)
        },
        pa = function() {
          f.value.anchor_id && t.proxy._post("live.index/checkRoomAssistant", {
            supplier_id: f.value.shop_supplier_id,
            anchor_id: f.value.anchor_id
          }, (function(e) {
            1 == e.code && (e.data ? z.value = f.value.shop_supplier_id : z.value = null)
          }))
        };
      return function(a, o) {
        return e.e({
          a: e.p({
            "live-type": "horizontal",
            "live-name": _.value
          }),
          b: Me.value && "" != f.value.live_notice && 1 != re.value
        }, Me.value && "" != f.value.live_notice && 1 != re.value ? {
          c: e.p({
            color: "#fff",
            "background-color": "rgba(152, 152, 152, 0)",
            speed: 50,
            scrollable: !0,
            single: !0,
            text: f.value.live_notice
          }),
          d: e.p({
            type: "closeempty",
            color: "#d3d7da"
          }),
          e: e.o(Ie, "76")
        } : {}, {
          f: -1 !== [101, 108, 102, 109, 104].indexOf(f.value.live_status) && 0 == re.value
        }, (-1 !== [101, 108, 102, 109, 104].indexOf(f.value.live_status) && re.value, {}), {
          g: -1 !== [101, 108, 102, 109, 104].indexOf(f.value.live_status) && 1 != re.value
        }, -1 !== [101, 108, 102, 109, 104].indexOf(f.value.live_status) && 1 != re.value ? e.e({
          h: 1 == i.value
        }, 1 == i.value ? e.e({
          i: Re.value
        }, Re.value ? e.e({
          j: !Pe.value
        }, Pe.value ? {
          m: e.o(Te, "07"),
          n: a.config.pic_url + "/static/live/close_full_screen.png"
        } : {
          k: e.o(ke, "6e"),
          l: a.config.pic_url + "/static/live/full_screen.png"
        }, {
          o: e.n(Pe.value ? "bottom-h-qp" : "bottom-h-bz")
        }) : {}, {
          p: r.value,
          q: ["push", "pop"],
          r: e.o(W, "6c"),
          s: e.o(K, "06"),
          t: e.o(Q, "53"),
          v: e.o(X, "62"),
          w: e.o(Ce, "ef"),
          x: e.o(Oe, "ea")
        }) : 2 == i.value || 3 == i.value ? {
          z: y.value,
          A: r.value,
          B: x.value,
          C: x.value,
          D: ["push", "pop"],
          E: e.o(Q, "b8"),
          F: e.o(X, "42"),
          G: g.value,
          H: h.value,
          I: e.o(Y, "d1"),
          J: e.o(Ne, "ad"),
          K: e.o(Ve, "b7"),
          L: e.o(We, "d2")
        } : {}, {
          y: 2 == i.value || 3 == i.value
        }) : {}, {
          M: f.value.cover_img_url && -1 !== [102, 109].indexOf(f.value.live_status)
        }, f.value.cover_img_url && -1 !== [102, 109].indexOf(f.value.live_status) ? {
          N: f.value.cover_img_url
        } : {}, {
          O: e.sr(la, "777498e0-4", {
            k: "sbRef"
          }),
          P: -1 !== [102, 109].indexOf(f.value.live_status)
        }, -1 !== [102, 109].indexOf(f.value.live_status) ? {
          Q: e.n(f.value.cover_img_url ? "wait-countdown1" : "wait-countdown"),
          R: e.o(Fe, "b1"),
          S: e.p({
            totalSeconds: p.value,
            "live-name": _.value
          })
        } : {}, {
          T: 103 == f.value.live_status && 1 != re.value
        }, 103 == f.value.live_status && 1 != re.value ? {
          U: e.sr(ze, "777498e0-6", {
            k: "bottom_option"
          }),
          V: e.o(qe, "d1"),
          W: e.o(De, "27"),
          X: e.p({
            "is-order": te.value,
            lookType: "horizontal",
            "speak-interval": w.value,
            "is-share": ie.value,
            "speak-pic": b.value,
            "msg-module": Le.value,
            "live-status": f.value.live_status,
            "live-id": d.value,
            "self-group": D.value,
            showCart: $e.value
          })
        } : {}, {
          Y: 1 == re.value
        }, 1 == re.value ? {
          Z: e.sr(P, "777498e0-7", {
            k: "people_number"
          }),
          aa: e.o(Ee, "0f"),
          ab: e.p({
            "is-online-number": ue.value,
            speed: J.value,
            "live-id": d.value,
            "is-order": te.value,
            "look-type": C.value,
            "is-customer-service": ve.value
          }),
          ac: e.t(O.value)
        } : {}, {
          ad: -1 !== [101, 108, 102, 109, 104].indexOf(f.value.live_status) && 0 == re.value
        }, -1 !== [101, 108, 102, 109, 104].indexOf(f.value.live_status) && 0 == re.value ? e.e({
          ae: e.sr(P, "777498e0-8", {
            k: "people_number"
          }),
          af: e.o(Ee, "83"),
          ag: e.o(V, "e9"),
          ah: e.p({
            "is-online-number": ue.value,
            speed: J.value,
            "live-id": d.value,
            "is-order": te.value,
            "look-type": C.value,
            "is-customer-service": ve.value,
            showPeople: !1
          }),
          ai: z.value
        }, z.value ? {
          aj: e.sr(_a, "777498e0-9", {
            k: "manager_permission"
          }),
          ak: e.p({
            "live-id": d.value
          })
        } : {}, {
          al: e.sr(je, "777498e0-10", {
            k: "barrage_list"
          }),
          am: e.o(Ue, "36"),
          an: e.o(Ee, "53"),
          ao: e.o(Ae, "c7"),
          ap: e.o(Be, "ba"),
          aq: e.o(Je, "80"),
          ar: e.o(Ke, "11"),
          as: e.o(Qe, "2c"),
          at: e.o(Xe, "ef"),
          av: e.o(Ye, "2d"),
          aw: e.o(ea, "72"),
          ax: e.o(Ze, "66"),
          ay: e.o(oa, "14"),
          az: e.o(aa, "af"),
          aA: e.o(ma, "84"),
          aB: e.p({
            "is-online-number": ue.value,
            "is-creating-order": q.value,
            "is-hot-sale": M.value,
            "sales-one": I.value,
            "is-grade": ne.value,
            "is-anonymous": oe.value,
            "live-notice": we.value,
            "is-avatar-anonymous": le.value,
            "live-id": d.value,
            "is-submit-order-success": ce.value
          }),
          aC: e.sr(ze, "777498e0-11", {
            k: "bottom_option"
          }),
          aD: e.o(qe, "32"),
          aE: e.o(De, "67"),
          aF: e.p({
            "is-order": te.value,
            lookType: "horizontal",
            "speak-interval": w.value,
            "is-share": ie.value,
            "speak-pic": b.value,
            "msg-module": Le.value,
            "live-id": d.value,
            "self-group": D.value,
            showCart: $e.value
          }),
          aG: e.s("height:calc(100vh - " + m.value + "px - 482rpx);")
        }) : {}, {
          aH: 2 == T.value,
          aI: e.sr(S, "777498e0-12", {
            k: "user_login"
          }),
          aJ: e.o((function(e) {
            return Z(!0, !0)
          }), "c7"),
          aK: 103 != f.value.live_status
        }, 103 != f.value.live_status ? {
          aL: e.sr(ia, "777498e0-13", {
            k: "signInRef"
          }),
          aM: e.o(va, "90"),
          aN: e.o(sa, "5a"),
          aO: e.o(ca, "a3"),
          aP: e.o(da, "8a"),
          aQ: e.p({
            "is-login": j.value,
            "live-id": d.value,
            config: a.config,
            type: 2,
            "chat-info": e.unref(u).liveInfo || {}
          })
        } : {}, {
          aR: e.sr(ra, "777498e0-14", {
            k: "checkInRef"
          }),
          aS: e.o(N, "0a"),
          aT: e.p({
            "live-id": d.value,
            config: a.config,
            "chat-info": e.unref(u).liveInfo || {}
          }),
          aU: e.sr(U, "777498e0-15", {
            k: "watchTypeVerifyRef"
          }),
          aV: e.o(be, "30"),
          aW: e.p({
            "live-id": d.value,
            "live-name": _.value,
            "live-avatar": v.value,
            "auth-img": $.value,
            "watch-price": B.value
          }),
          aX: E.value
        }, (E.value, {}))
      }
    }
  },
  h = e._export_sfc(g, [
    ["__scopeId", "data-v-777498e0"]
  ]);
g.__runtimeHooks = 22, wx.createPage(h);