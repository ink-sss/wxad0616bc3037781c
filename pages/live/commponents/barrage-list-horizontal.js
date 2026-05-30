var e = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  a = require("../../../@babel/runtime/helpers/asyncToGenerator");
require("../../../@babel/runtime/helpers/Arrayincludes");
var t = require("../../../common/vendor.js"),
  n = require("../../../store/index.js");
Array || t.resolveComponent("uni-notice-bar")(), Math || (function() {
  return "../../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js"
} + t.unref(l) + t.unref(u))();
var u = function() {
    return "./add-teaching.js"
  },
  l = function() {
    return "./question.js"
  },
  r = {
    __name: "barrage-list-horizontal",
    props: {
      isAnonymous: {
        type: [Number, String],
        default: 0
      },
      isAvatarAnonymous: {
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
      isCreatingOrder: {
        type: [Number, String],
        default: null
      },
      isHotSale: {
        type: [Number, String],
        default: null
      },
      salesOne: {
        type: [Number, String],
        default: 0
      },
      isSubmitOrderSuccess: {
        type: [Number, String],
        default: 1
      },
      isGrade: {
        type: [Number, String],
        default: 0
      },
      liveNotice: {
        type: String,
        default: ""
      }
    },
    emits: ["swiperChange", "goShop", "endLive", "refresh", "hideLuckyBag", "showLuckyBag", "luckyBagResult", "authSuccess", "showCountdownPoints", "hideCountdownPoints", "showCountdownRedpack", "hideCountdownRedpack", "setAssistant"],
    setup: function(u, l) {
      var r = l.expose,
        i = l.emit,
        o = t.getCurrentInstance(),
        s = getApp(),
        c = t.ref(null),
        v = t.ref(0);
      t.computed((function() {
        return n.store.state.grade_detail
      }));
      var d = t.inject("is_showNotice", !1),
        p = null,
        f = t.ref(!0),
        g = t.ref(""),
        m = t.inject("video_questions"),
        _ = u,
        h = t.ref(0),
        y = t.ref(0),
        b = t.ref(0),
        x = t.ref(0),
        S = t.ref(!0),
        k = t.ref(null),
        C = t.ref(1),
        w = t.inject("supplier_user_id", 0);
      t.watch((function() {
        return {
          notice_show: S.value,
          top_ba: k.value,
          order_success: _.isSubmitOrderSuccess,
          hot: _.isHotSale,
          order: _.isCreatingOrder,
          sales: _.salesOne,
          questions: m.value
        }
      }), (function(e, a) {
        x.value = 0, h.value = 0, e.notice_show && (h.value = t.index.upx2px(70), e.top_ba && (x.value = t.index.upx2px(70))), C.value = e.order_success, L.value = e.hot, E.value = e.order, v.value = e.sales, e.questions && e.questions.length > 0 && (ce.value = 3)
      }));
      var O = t.inject("roomId"),
        N = t.inject("anchor_id", 0),
        T = t.ref([]);
      t.ref(null), t.onMounted((function() {
        null != s.globalData.imChat ? (P(), R()) : D(), c.value = t.index.getStorageSync("user_id"), p = setTimeout((function() {
          f.value = !1
        }), 8e3), N.value && I(), setTimeout((function() {
          t.index.createSelectorQuery().in(o.proxy).select("#box").boundingClientRect((function(e) {
            y.value = e.height
          })).exec()
        }), 300)
      }));
      var A = t.ref(!1),
        D = function e() {
          A.value = setTimeout((function() {
            null != s.globalData.imChat ? (P(), R()) : e()
          }), 100)
        },
        I = function() {
          o.proxy._post("live.roomNew/getAssistant", {
            room_id: O.value,
            shop_supplier_id: w.value,
            anchor_id: N.value
          }, (function(e) {
            1 == e.code && (T.value = e.data)
          }))
        },
        J = function(e) {
          if (T.value.length > 0)
            for (var a = 0; a < T.value.length; a++)
              if (e == T.value[a].user_id) return T.value[a].type;
          return 0
        },
        P = function() {
          0 != A.value && clearTimeout(A.value), s.globalData.imChat.on(s.globalData.imMessageReceived, z)
        },
        R = function() {
          s.globalData.imChat.on("onMessageRevoked", B)
        },
        B = function(e) {
          e.data.forEach((function(e) {
            H.value = H.value.filter((function(a) {
              return a.sequence !== e.sequence
            }))
          }))
        },
        G = t.ref(0),
        q = t.ref(0),
        M = t.ref(0),
        j = t.ref(1),
        L = t.ref(null),
        E = t.ref(null),
        F = function() {
          var e = v.value > 0 ? v.value : 1;
          return (Number(G.value) + Number(q.value)) * e
        },
        W = t.ref(null),
        U = function() {
          W.value = null
        },
        z = function(e) {
          var a = e.data,
            u = t.ref([]),
            l = t.ref([]);
          a.forEach((function(e) {
            if (e.to != s.globalData.group_id) return !1;
            if (e.type === s.globalData.msgText) {
              var a = t.ref(0),
                r = {};
              if ("" != e.cloudCustomData) {
                var i = t.ref(JSON.parse(e.cloudCustomData));
                null != i.value.msg_module && (a.value = i.value.msg_module), null != i.value.grade_detail && (r = i.value.grade_detail)
              }
              var o = t.ref(!1);
              if (s.globalData.imUserId == e.from && (o.value = !0), 1 == a.value) l.value.push({
                head: e.avatar,
                name: e.nick,
                text: e.payload.text,
                msgType: "text",
                is_my: o.value,
                grade_msg: r
              });
              else {
                var v = !1,
                  d = 0,
                  p = e.from;
                if (p.startsWith("gk_")) {
                  var f = p.split("_");
                  f.length > 1 && f[1].startsWith("r") ? v = !0 : d = J(f[1])
                }
                var g = [];
                if (e.cloudCustomData) {
                  var m = JSON.parse(e.cloudCustomData);
                  null != m.tag && Array.isArray(m.tag) && (g = m.tag)
                }
                u.value.push({
                  head: e.avatar,
                  name: e.nick,
                  text: e.payload.text,
                  msgType: "text",
                  is_my: o.value,
                  sequence: e.sequence,
                  grade_msg: r,
                  isVirtualMember: v,
                  assistantType: d,
                  tag: g
                })
              }
            } else if (e.type === s.globalData.msgImage) {
              var _ = t.ref(0),
                h = {};
              if ("" != e.cloudCustomData) {
                var y = t.ref(JSON.parse(e.cloudCustomData));
                null != y.value.msg_module && (_.value = y.value.msg_module), null != y.value.grade_detail && (h = y.value.grade_detail)
              }
              var b = t.ref(!1);
              if (s.globalData.imUserId == e.from && (b.value = !0), 1 == _.value) l.value.push({
                head: e.avatar,
                name: e.nick,
                text: e.payload.imageInfoArray[0].url,
                msgType: "img",
                is_my: b.value,
                grade_msg: h
              });
              else {
                var x = 0,
                  S = e.from;
                if (S.startsWith("gk_")) {
                  var w = S.split("_");
                  w.length > 1 && !w[1].startsWith("r") && (x = J(w[1]))
                }
                var O = [];
                if (e.cloudCustomData) {
                  var N = JSON.parse(e.cloudCustomData);
                  null != N.tag && Array.isArray(N.tag) && (O = N.tag)
                }
                u.value.push({
                  head: e.avatar,
                  name: e.nick,
                  text: e.payload.imageInfoArray[0].url,
                  msgType: "img",
                  is_my: b.value,
                  grade_msg: h,
                  assistantType: x,
                  tag: O
                })
              }
            } else if (e.type === s.globalData.msgGrpSysNotice) {
              var A = e.payload.userDefinedField;
              if (null != A)
                if (A.includes("@ExplainEdit---")) {
                  var D = A.replace("@ExplainEdit---", "");
                  "" == D ? W.value = null : (W.value = JSON.parse(D), j.value = W.value.tip_type, G.value = Number(W.value.sales_initial))
                } else if (A.includes("@ForbiddenProhibition---")) {
                var I = A.replace("@ForbiddenProhibition---", "");
                if (I) {
                  var P = I.split("-");
                  P[0] == c.value && n.store.commit("changeProhibition", P[1])
                }
              } else if (A.includes("@FakeForbiddenProhibition---")) {
                var R = A.replace("@FakeForbiddenProhibition---", "");
                if (R) {
                  var B = R.split("-");
                  B[0] == c.value && n.store.commit("changeFakeProhibition", B[1])
                }
              } else if (A.includes("@ForbiddenBlock---")) {
                var F = A.replace("@ForbiddenBlock---", "");
                if (F) {
                  var U = F.split("-");
                  U[0] == c.value && 1 == U[1] && t.index.reLaunch({
                    url: "/pages/live/block"
                  })
                }
              } else if (A.includes("@ForbiddenIp---")) {
                var z = A.replace("@ForbiddenIp---", "");
                z && z == t.index.getStorageSync("client_ip") && t.index.reLaunch({
                  url: "/pages/live/block"
                })
              } else if (A.includes("@EndLive---")) we("endLive");
              else if (A.includes("@CheackOpen---")) "1" == A.replace("@CheackOpen---", "") ? n.store.commit("changecheckOpen", 1) : n.store.commit("changecheckOpen", 2);
              else if (A.includes("@CheackInOpen---")) {
                var V = A.replace("@CheackInOpen---", "");
                n.store.commit("changechecinkOpen", JSON.parse(V))
              } else if (A.includes("@ShowCartChange---")) {
                var K = A.replace("@ShowCartChange---", "");
                K && we("cartChange", K)
              } else if (A.includes("@Refresh---")) we("refresh");
              else if (A.includes("@SubmitOrderSuccess---")) {
                var Q = A.replace("@SubmitOrderSuccess---", "");
                if (Q) {
                  var $ = JSON.parse(Q);
                  1 == C.value && H.value.push({
                    head: $.user_avatar,
                    name: $.user_nick_name,
                    text: "下单了" + $.product_info.sort + "号商品 去看看 >",
                    msgType: "text",
                    product_id: $.product_info.product_id,
                    spec_sku_id: $.spec_sku_id,
                    is_my: !1
                  }), q.value = JSON.parse(Q).sales_number, G.value = Number(W.value.sales_initial)
                }
              } else if (A.includes("@SubmitOrderSuccess---")) {
                var X = A.replace("@SubmitOrderSuccess---", "");
                if (X) {
                  var Y = JSON.parse(X);
                  1 == C.value && H.value.push({
                    head: Y.user_avatar,
                    name: Y.user_nick_name,
                    text: "下单了" + Y.product_info.sort + "号商品 去看看 >",
                    msgType: "text",
                    product_id: Y.product_info.product_id,
                    spec_sku_id: Y.spec_sku_id,
                    is_my: !1
                  }), q.value = JSON.parse(X).sales_number, G.value = Number(W.value.sales_initial)
                }
              } else if (A.includes("@EditProductSalesInitial---")) {
                var Z = A.replace("@EditProductSalesInitial---", "");
                if (Z) {
                  var ee = JSON.parse(Z);
                  ee.sales_initial ? (j.value = 1, G.value = Number(ee.sales_initial)) : ee.product_stock && (j.value = 2, M.value = Number(ee.product_stock))
                }
              } else if (A.includes("@CreateOrderEdit---")) {
                var ae = A.replace("@CreateOrderEdit---", "");
                ae && (E.value = JSON.parse(ae).is_creating_order)
              } else if (A.includes("@HotSaleEdit---")) {
                var te = A.replace("@HotSaleEdit---", "");
                te && (L.value = JSON.parse(te).is_hot_sale)
              } else if (A.includes("@TopBa---")) {
                var ne = A.replace("@TopBa---", "");
                k.value = "" == ne ? null : JSON.parse(ne)
              } else if (A.includes("@pushCoupon---")) {
                var ue = A.replace("@pushCoupon---", "");
                n.store.commit("changeCouponOpen", JSON.parse(ue))
              } else if (A.includes("@endPushCoupon---")) n.store.commit("changeCouponOpen", {});
              else if (A.includes("@DeleteLuckyBag---")) we("hideLuckyBag");
              else if (A.includes("@LuckyBag---")) {
                var le = A.replace("@LuckyBag---", ""),
                  re = JSON.parse(le);
                we("showLuckyBag", re.end)
              } else if (A.includes("@LuckyBagWinners---")) {
                for (var ie = A.replace("@LuckyBagWinners---", ""), oe = JSON.parse(ie), se = !1, ce = 0; ce < oe.length; ce++)
                  if (oe[ce].user_id == c.value) {
                    se = !0;
                    break
                  } we("luckyBagResult", se, oe)
              } else if (A.includes("@AuthWatch---")) {
                var ve = A.replace("@AuthWatch---", ""),
                  de = JSON.parse(ve);
                c.value = t.index.getStorageSync("user_id"), de.user_id == c.value && we("authSuccess")
              } else if (A.includes("@DeleteCountdownPoints---")) we("hideCountdownPoints");
              else if (A.includes("@CountdownPoints---")) {
                var pe = A.replace("@CountdownPoints---", ""),
                  fe = JSON.parse(pe);
                we("showCountdownPoints", fe.end, fe.countdown_type, fe.time_type, fe.time, fe.id)
              } else if (A.includes("@DeleteCountdownRedpack---")) we("hideCountdownRedpack");
              else if (A.includes("@CountdownRedpack---")) {
                var ge = A.replace("@CountdownRedpack---", ""),
                  me = JSON.parse(ge);
                we("showCountdownRedpack", me.end, me.countdown_type, me.time_type, me.time, me.id)
              } else if (A.includes("@SendStoreCoupon---")) {
                var _e = A.replace("@SendStoreCoupon---", "");
                n.store.commit("changeWelfareOpen", JSON.parse(_e))
              } else if (A.includes("@UpdateAssistant---")) {
                var he = A.replace("@UpdateAssistant---", "");
                if (he) {
                  T.value = JSON.parse(he);
                  for (var ye = t.index.getStorageSync("user_id"), be = 0, xe = 0; xe < T.value.length; xe++)
                    if (T.value[xe].user_id == ye) {
                      be = T.value[xe].type;
                      break
                    } we("setAssistant", be)
                }
              }
            }
          })), u.value.length > 0 && (H.value = H.value.concat(u.value), Y("tl")), l.value.length > 0 && (V.value = V.value.concat(l.value), Y("wd"))
        },
        H = t.ref([]),
        V = t.ref([]),
        K = t.ref(""),
        Q = t.ref(""),
        $ = t.ref(100),
        X = t.ref(50),
        Y = function() {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "tl";
          "wd" == e ? (!ne.value || V.value.length > $.value) && (Q.value == "list-wd-" + (V.value.length - 1) && (Q.value = ""), t.nextTick$1((function() {
            Q.value = "list-wd-" + (V.value.length - 1), V.value.length > $.value && Z("wd")
          }))) : (!ae.value || H.value.length > $.value) && (K.value == "list-" + (H.value.length - 1) && (K.value = ""), t.nextTick$1((function() {
            K.value = "list-" + (H.value.length - 1), H.value.length > $.value && Z("tl")
          })))
        },
        Z = function(e) {
          "tl" == e ? H.value = H.value.slice(-X.value) : V.value = V.value.slice(-X.value)
        },
        ee = t.ref(0),
        ae = t.ref(!1),
        te = t.ref(0),
        ne = t.ref(!1),
        ue = t.ref([]),
        le = t.ref([]),
        re = function(e, a) {
          if ("tl" == a) {
            var t = e.detail.scrollTop;
            t < ee.value && !ie.value && (ue.value.push(!0), ue.value.length > 5 && (ae.value = !0, ue.value = [])), ee.value = t
          } else {
            var n = e.detail.scrollTop;
            n < te.value && !ie.value && (le.value.push(!0), le.value.length > 5 && (ne.value = !0, le.value = [])), te.value = n
          }
        },
        ie = t.ref(!1),
        oe = function(e, a) {
          "tl" == a ? (ae.value = !1, ue.value = []) : (ne.value = !1, le.value = []), ie.value = !0, setTimeout((function() {
            ie.value = !1
          }), 500)
        },
        se = function() {
          var n = a(e().mark((function a() {
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  W.value.product_id > 0 ? we("goShop", W.value.product_id, W.value.spec_sku_id) : 1 == W.value.type ? t.index.navigateTo({
                    url: "/pages/webview/webview?url=" + encodeURIComponent(W.value.link_url)
                  }) : 2 == W.value.type ? t.index.navigateToMiniProgram({
                    shortLink: W.value.link_url,
                    success: function(e) {},
                    fail: function() {}
                  }) : t.index.navigateToMiniProgram({
                    appId: W.value.wechat_app_id,
                    path: W.value.link_url + W.value.scene,
                    success: function(e) {},
                    fail: function() {}
                  });
                case 1:
                case "end":
                  return e.stop()
              }
            }), a)
          })));
          return function() {
            return n.apply(this, arguments)
          }
        }(),
        ce = t.ref(0),
        ve = function(e) {
          ce.value = e.detail.current, 1 == e.detail.current ? (we("swiperChange", 1), te.value = 0, ne.value = !1, Y("wd")) : (we("swiperChange", 0), ee.value = 0, ae.value = !1, Y("tl"))
        },
        de = function(e) {
          ce.value = e
        },
        pe = function() {
          S.value = !1, b.value = 0
        },
        fe = t.ref(!1),
        ge = t.ref(null),
        me = function(e) {
          t.index.setStorageSync("exitImGroup", "no"), t.index.previewImage({
            urls: [e]
          })
        },
        _e = function(e) {
          return 1 == _.isAnonymous ? e.length <= 1 ? e : e[0] + "*".repeat(e.length - 1) : e
        },
        he = t.ref(null),
        ye = t.ref(0),
        be = t.ref(0),
        xe = t.ref(0),
        Se = function() {
          s.globalData.imChat.getGroupOnlineMemberCount(s.globalData.imPrefix + _.liveId).then((function(e) {
            ye.value = e.data.memberCount
          })).catch((function(e) {
            console.warn("getGroupOnlineMemberCount error:", e)
          }))
        },
        ke = function() {
          s.globalData.imChat.getGroupCounters({
            groupID: s.globalData.imPrefix + _.liveId,
            keyList: ["people_virtual", "virtual_num_one"]
          }).then((function(e) {
            be.value = e.data.counters.people_virtual > 0 ? e.data.counters.people_virtual : 0, xe.value = e.data.counters.virtual_num_one > 0 ? e.data.counters.virtual_num_one : 0
          })).catch((function(e) {
            console.warn("getGroupCounters error:", e)
          }))
        },
        Ce = function() {
          var e = xe.value > 0 ? xe.value : 1,
            a = ye.value * e + be.value;
          if (a > 1e5) return "10万+";
          if (a >= 1e4) {
            var t = (a / 1e4).toFixed(1);
            return t.endsWith(".0") ? "".concat(Math.floor(a / 1e4), "万+") : "".concat(t, "万+")
          }
          return a > 0 ? a.toString() : "-"
        },
        we = i;
      return r({
          sendBarrage: function(e, a, n, u, l, r, i) {
            null == l && (l = "text");
            var o = {};
            if (i) {
              var s = t.ref(JSON.parse(i));
              s.value.grade_detail && (o = s.value.grade_detail)
            }
            1 == u ? (V.value.push({
              head: n,
              name: a,
              text: e,
              msgType: l,
              is_my: !0,
              sequence: r,
              grade_msg: o
            }), oe(0, "wd"), Y("wd")) : (H.value.push({
              head: n,
              name: a,
              text: e,
              msgType: l,
              is_my: !0,
              sequence: r,
              grade_msg: o
            }), oe(0, "tl"), Y("tl"))
          },
          offReceiveMessage: function() {
            s.globalData.imChat.off(s.globalData.imMessageReceived, z)
          },
          goScrollEnd: function() {
            0 == ce.value ? (ee.value = 0, ae.value = !1, Y("tl")) : 1 == ce.value && (te.value = 0, ne.value = !1, Y("wd"))
          },
          clearScreen: function(e) {
            e ? (H.value = [], V.value = []) : t.index.showModal({
              content: "是否确认清屏",
              success: function(e) {
                e.confirm && (H.value = [], V.value = [])
              }
            })
          },
          setExplain: function(e) {
            var a, t;
            W.value = e, G.value = null == (a = W.value) ? void 0 : a.sales_initial, (null == (t = W.value) ? void 0 : t.tip_type) && (j.value = W.value.tip_type, M.value = W.value.product_stock)
          },
          offRevokeMessage: function() {
            s.globalData.imChat.off("onMessageRevoked", B)
          },
          setTopBa: function(e) {
            k.value = "" === e || null == e ? null : JSON.parse(e)
          },
          memberStart: function() {
            Se(), ke(), he.value = setInterval((function() {
              Se(), ke()
            }), 1e4)
          },
          setCommentNotice: function(e) {
            g.value = e, h.value = t.index.upx2px(70), b.value = t.index.upx2px(70), d.value = !0, S.value = !0
          }
        }), t.onBeforeUnmount((function() {
          clearTimeout(p)
        })),
        function(e, a) {
          return t.e({
            a: t.unref(m) && t.unref(m).length > 0
          }, t.unref(m) && t.unref(m).length > 0 ? {
            b: t.o((function(e) {
              return de(3)
            }), "b8"),
            c: t.n(3 == ce.value ? "option-sel" : "option-jc")
          } : {}, {
            d: t.o((function(e) {
              return de(0)
            }), "fb"),
            e: t.n(0 == ce.value ? "option-sel" : "option-jc"),
            f: t.o((function(e) {
              return de(1)
            }), "97"),
            g: t.n(1 == ce.value ? "option-sel" : "option-jc"),
            h: t.o((function(e) {
              return de(2)
            }), "41"),
            i: t.n(2 == ce.value ? "option-sel" : "option-jc"),
            j: 1 == u.isOnlineNumber
          }, 1 == u.isOnlineNumber ? {
            k: e.config.pic_url + "/20251204131342f37859152.png",
            l: t.t(Ce())
          } : {}, {
            m: e.config.pic_url + "/202512151457375080e2447.png",
            n: t.o((function(e) {
              t.index.showModal({
                content: "是否确认刷新页面",
                success: function(e) {
                  e.confirm ? t.index.reLaunch({
                    url: "/pages/live/live-horizontal?live_id=" + _.liveId
                  }) : e.cancel
                }
              })
            }), "dc"),
            o: S.value && "" != g.value
          }, S.value && "" != g.value ? t.e({
            p: g.value
          }, g.value ? {
            q: t.o((function(e) {
              return pe()
            }), "22"),
            r: t.p({
              color: "#d36c32",
              speed: 50,
              scrollable: !0,
              single: !0,
              "show-close": !0,
              showClose: !0,
              text: g.value
            })
          } : {}, {
            s: t.o((function(e) {
              return pe()
            }), "ca")
          }) : {}, {
            t: k.value && "" != k.value
          }, k.value && "" != k.value ? {
            v: k.value.avatarUrl,
            w: t.t(k.value.nickName),
            x: t.p({
              color: "#d36c32",
              speed: 50,
              scrollable: !0,
              single: !0,
              text: k.value.content
            }),
            y: x.value + "px"
          } : {}, {
            z: t.f(H.value, (function(e, a, n) {
              return t.e({
                a: -1 == e.text.indexOf("product_info")
              }, -1 == e.text.indexOf("product_info") ? t.e({
                b: !e.is_my
              }, e.is_my ? t.e({
                y: t.t(_e(e.name)),
                z: 1 == u.isGrade && null != e.grade_msg && null != e.grade_msg.name
              }, 1 == u.isGrade && null != e.grade_msg && null != e.grade_msg.name ? {
                A: t.t(e.grade_msg.name),
                B: t.s("background-image: url(" + e.grade_msg.image + ");color: " + e.grade_msg.font_color)
              } : {}, {
                C: "text" == e.msgType
              }, "text" == e.msgType ? {
                D: t.t(e.text)
              } : {
                E: t.o((function(a) {
                  return me(e.text)
                }), a),
                F: e.text
              }, {
                G: e.head,
                H: t.s(1 == u.isAvatarAnonymous ? "opacity: 0;" : "")
              }) : t.e({
                c: 0 == u.isAvatarAnonymous
              }, 0 == u.isAvatarAnonymous ? {
                d: e.head,
                e: t.s(1 == u.isAvatarAnonymous ? "opacity: 0;" : "")
              } : {}, {
                f: !e.product_id
              }, e.product_id ? t.e({
                t: t.t(_e(e.name)),
                v: "text" == e.msgType
              }, "text" == e.msgType ? {
                w: t.t(e.text)
              } : {}, {
                x: t.o((function(a) {
                  return function(e) {
                    e.product_id > 0 && we("goShop", e.product_id, e.spec_sku_id)
                  }(e)
                }), a)
              }) : t.e({
                g: t.unref(w) > 0 && e.isVirtualMember
              }, (t.unref(w) > 0 && e.isVirtualMember, {}), {
                h: e.assistantType && 1 == e.assistantType
              }, (e.assistantType && e.assistantType, {}), {
                i: e.assistantType && 2 == e.assistantType
              }, (e.assistantType && e.assistantType, {}), {
                j: t.unref(w) > 0 && null != e.tag && e.tag.length
              }, t.unref(w) > 0 && null != e.tag && e.tag.length ? {
                k: t.f(e.tag, (function(e, a, n) {
                  return {
                    a: t.t(e),
                    b: a
                  }
                }))
              } : {}, {
                l: 1 == u.isGrade && null != e.grade_msg && null != e.grade_msg.name
              }, 1 == u.isGrade && null != e.grade_msg && null != e.grade_msg.name ? {
                m: t.t(e.grade_msg.name),
                n: t.s("background-image: url(" + e.grade_msg.image + ");color: " + e.grade_msg.font_color)
              } : {}, {
                o: t.t(_e(e.name)),
                p: "text" == e.msgType
              }, "text" == e.msgType ? {
                q: t.t(e.text)
              } : {
                r: t.o((function(a) {
                  return me(e.text)
                }), a),
                s: e.text
              }))) : {}, {
                I: a,
                J: "list-" + a,
                K: t.n(e.is_my ? "ba-content-box-my" : "ba-content-box")
              })
            })),
            A: y.value - b.value + "px",
            B: h.value + "px",
            C: K.value,
            D: t.o((function(e) {
              return re(e, "tl")
            }), "6e"),
            E: t.o((function(e) {
              return oe(0, "tl")
            }), "29"),
            F: t.f(V.value, (function(e, a, n) {
              return t.e({
                a: !e.is_my
              }, e.is_my ? t.e({
                m: t.t(_e(e.name)),
                n: 1 == u.isGrade && null != e.grade_msg && null != e.grade_msg.name
              }, 1 == u.isGrade && null != e.grade_msg && null != e.grade_msg.name ? {
                o: t.t(e.grade_msg.name),
                p: t.s("background-image: url(" + e.grade_msg.image + ");color: " + e.grade_msg.font_color)
              } : {}, {
                q: "text" == e.msgType
              }, "text" == e.msgType ? {
                r: t.t(e.text)
              } : {
                s: t.o((function(a) {
                  return me(e.text)
                }), a),
                t: e.text
              }, {
                v: 0 == u.isAvatarAnonymous
              }, 0 == u.isAvatarAnonymous ? {
                w: e.head,
                x: t.s(1 == u.isAvatarAnonymous ? "opacity: 0;" : "")
              } : {}) : t.e({
                b: 0 == u.isAvatarAnonymous
              }, 0 == u.isAvatarAnonymous ? {
                c: e.head,
                d: t.s(1 == u.isAvatarAnonymous ? "opacity: 0;" : "")
              } : {}, {
                e: 1 == u.isGrade && null != e.grade_msg && null != e.grade_msg.name
              }, 1 == u.isGrade && null != e.grade_msg && null != e.grade_msg.name ? {
                f: t.t(e.grade_msg.name),
                g: t.s("background-image: url(" + e.grade_msg.image + ");color: " + e.grade_msg.font_color)
              } : {}, {
                h: t.t(_e(e.name)),
                i: "text" == e.msgType
              }, "text" == e.msgType ? {
                j: t.t(e.text)
              } : {
                k: t.o((function(a) {
                  return me(e.text)
                }), a),
                l: e.text
              }), {
                y: a,
                z: "list-wd-" + a,
                A: t.n(e.is_my ? "ba-content-box-my" : "ba-content-box")
              })
            })),
            G: Q.value,
            H: y.value - b.value + "px",
            I: h.value + "px",
            J: t.o((function(e) {
              return re(e, "wd")
            }), "97"),
            K: t.o((function(e) {
              return oe(0, "wd")
            }), "58"),
            L: t.unref(m) && t.unref(m).length > 0
          }, t.unref(m) && t.unref(m).length > 0 ? {
            M: t.p({
              "swiper-height": h.value
            })
          } : {}, {
            N: ce.value,
            O: y.value > 0 ? y.value + "px" : "",
            P: t.o(ve, "8a"),
            Q: u.liveNotice && t.unref(d) && f.value
          }, u.liveNotice && t.unref(d) && f.value ? {
            R: t.t(u.liveNotice)
          } : {}, {
            S: null != W.value
          }, null != W.value ? t.e({
            T: 1 == L.value && (parseInt(G.value) > 0 || parseInt(q.value) > 0 || 2 == j.value)
          }, 1 == L.value && (parseInt(G.value) > 0 || parseInt(q.value) > 0 || 2 == j.value) ? t.e({
            U: e.config.pic_url + (1 == j.value ? "/202512091411443ed5d5806.png" : "/20260127132820956961351.png"),
            V: 1 == j.value
          }, 1 == j.value ? {
            W: t.t(F())
          } : {}, {
            X: 2 == j.value
          }, 2 == j.value ? t.e({
            Y: M.value >= 1e8
          }, M.value >= 1e8 ? {
            Z: t.t(parseInt(M.value / 1e8))
          } : M.value >= 1e4 ? {
            ab: t.t(parseInt(M.value / 1e4))
          } : {
            ac: t.t(M.value)
          }, {
            aa: M.value >= 1e4
          }) : {}, {
            ad: t.n(1 == j.value ? "hotGoods" : "hotGoods1")
          }) : {}, {
            ae: W.value.product_image,
            af: t.t(W.value.product_name),
            ag: t.t(W.value.product_price),
            ah: e.config.pic_url + "/static/live/zheng.gif",
            ai: t.o(U, "d0"),
            aj: t.o(se, "bd")
          }) : {}, {
            ak: fe.value
          }, fe.value ? {
            al: t.sr(ge, "9781d869-3", {
              k: "teachingRef"
            })
          } : {})
        }
    }
  },
  i = t._export_sfc(r, [
    ["__scopeId", "data-v-9781d869"]
  ]);
wx.createComponent(i);