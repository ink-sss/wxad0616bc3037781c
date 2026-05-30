require("../../../@babel/runtime/helpers/Arrayincludes");
var e = require("../../../common/vendor.js"),
  a = require("../../../store/index.js"),
  t = {
    __name: "barrage-list",
    props: {
      isAnonymous: {
        type: [Number, String],
        default: 0
      },
      isAvatarAnonymous: {
        type: [Number, String],
        default: 0
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
    emits: ["goShop", "endLive", "cartChange", "goTrtc", "refresh", "hideLuckyBag", "showLuckyBag", "luckyBagResult", "authSuccess", "showCountdownPoints", "hideCountdownPoints", "showCountdownRedpack", "hideCountdownRedpack", "setAssistant"],
    setup: function(t, l) {
      var u = l.expose,
        n = l.emit,
        r = e.getCurrentInstance(),
        i = getApp(),
        s = e.ref(null),
        o = e.ref(0),
        c = e.ref(1);
      e.computed((function() {
        return a.store.state.grade_detail
      }));
      var d = e.inject("is_showNotice", 0),
        v = null,
        p = e.ref(!0),
        f = e.inject("supplier_user_id", 0),
        g = e.inject("roomId", 0),
        m = e.inject("anchor_id", 0),
        h = e.ref([]);
      e.onMounted((function() {
        null != i.globalData.imChat ? (J(), B()) : C(), s.value = e.index.getStorageSync("user_id"), v = setTimeout((function() {
          p.value = !1
        }), 8e3), m.value && _()
      }));
      var _ = function() {
          r.proxy._post("live.roomNew/getAssistant", {
            room_id: g.value,
            shop_supplier_id: f.value,
            anchor_id: m.value
          }, (function(e) {
            1 == e.code && (h.value = e.data)
          }))
        },
        y = function(e) {
          if (h.value.length > 0)
            for (var a = 0; a < h.value.length; a++)
              if (e == h.value[a].user_id) return h.value[a].type;
          return 0
        },
        S = t;
      e.watch((function() {
        return {
          hot: S.isHotSale,
          order: S.isCreatingOrder,
          sales: S.salesOne,
          order_success: S.isSubmitOrderSuccess
        }
      }), (function(e, a) {
        w.value = e.hot, T.value = e.order, o.value = e.sales, c.value = e.order_success
      }));
      var C = function e() {
          setTimeout((function() {
            null != i.globalData.imChat ? (J(), B()) : e()
          }), 100)
        },
        k = e.ref(null),
        b = e.ref(0),
        O = e.ref(0),
        N = e.ref(0),
        x = e.ref(1),
        w = e.ref(null),
        T = e.ref(null),
        A = function() {
          var e = o.value > 0 ? o.value : 1;
          return (Number(b.value) + Number(O.value)) * e
        },
        I = function() {
          k.value = null
        },
        D = e.ref(null),
        J = function() {
          i.globalData.imChat.on(i.globalData.imMessageReceived, L)
        },
        B = function() {
          i.globalData.imChat.on("onMessageRevoked", P)
        },
        P = function(e) {
          e.data.forEach((function(e) {
            F.value = F.value.filter((function(a) {
              return a.sequence !== e.sequence
            }))
          }))
        },
        E = e.ref(null),
        R = e.ref([]),
        L = function(t) {
          var l = t.data,
            u = e.ref([]);
          l.forEach((function(t) {
            if (t.type === i.globalData.msgText)
              if ("administrator" == t.from && "C2C" == t.conversationType) "go-trtc---------------" == t.payload.text && K("goTrtc");
              else {
                var l = {};
                if ("" != t.cloudCustomData) {
                  var n = e.ref(JSON.parse(t.cloudCustomData));
                  null != n.value.grade_detail && (l = n.value.grade_detail)
                }
                var r = !1,
                  d = 0,
                  v = t.from;
                if (v.startsWith("gk_")) {
                  var p = v.split("_");
                  p.length > 1 && p[1].startsWith("r") ? r = !0 : d = y(p[1])
                }
                var f = [];
                if (t.cloudCustomData) {
                  var g = JSON.parse(t.cloudCustomData);
                  null != g.tag && Array.isArray(g.tag) && (f = g.tag)
                }
                u.value.push({
                  head: t.avatar,
                  name: t.nick,
                  text: t.payload.text,
                  msgType: "text",
                  sequence: t.sequence,
                  grade_msg: l,
                  isVirtualMember: r,
                  assistantType: d,
                  tag: f
                }), u.value.length > 30 && u.value.splice(0, u.value.length - 30)
              }
            else if (t.type === i.globalData.msgImage) {
              var m = {};
              if ("" != t.cloudCustomData) {
                var _ = e.ref(JSON.parse(t.cloudCustomData));
                null != _.value.grade_detail && (m = _.value.grade_detail)
              }
              var S = 0,
                C = t.from;
              if (C.startsWith("gk_")) {
                var A = C.split("_");
                A.length > 1 && !A[1].startsWith("r") && (S = y(A[1]))
              }
              var I = [];
              if (t.cloudCustomData) {
                var J = JSON.parse(t.cloudCustomData);
                null != J.tag && Array.isArray(J.tag) && (I = J.tag)
              }
              u.value.push({
                head: t.avatar,
                name: t.nick,
                text: t.payload.imageInfoArray[0].url,
                msgType: "img",
                sequence: t.sequence,
                grade_msg: m,
                assistantType: S,
                tag: I
              })
            } else if (t.type === i.globalData.msgGrpSysNotice) {
              var B = t.payload.userDefinedField;
              if (null != B)
                if (B.includes("@ExplainEdit---")) {
                  var P = B.replace("@ExplainEdit---", "");
                  "" == P ? k.value = null : (k.value = JSON.parse(P), x.value = k.value.tip_type, b.value = Number(k.value.sales_initial))
                } else if (B.includes("@ForbiddenProhibition---")) {
                var E = B.replace("@ForbiddenProhibition---", "");
                if (E) {
                  var R = E.split("-");
                  R[0] == s.value && a.store.commit("changeProhibition", R[1])
                }
              } else if (B.includes("@FakeForbiddenProhibition---")) {
                var L = B.replace("@FakeForbiddenProhibition---", "");
                if (L) {
                  var q = L.split("-");
                  q[0] == s.value && a.store.commit("changeFakeProhibition", q[1])
                }
              } else if (B.includes("@ForbiddenBlock---")) {
                var M = B.replace("@ForbiddenBlock---", "");
                if (M) {
                  var W = M.split("-");
                  s.value = e.index.getStorageSync("user_id"), W[0] == s.value && 1 == W[1] && e.index.reLaunch({
                    url: "/pages/live/block"
                  })
                }
              } else if (B.includes("@ForbiddenIp---")) {
                var j = B.replace("@ForbiddenIp---", "");
                j && j == e.index.getStorageSync("client_ip") && e.index.reLaunch({
                  url: "/pages/live/block"
                })
              } else if (B.includes("@EndLive---")) K("endLive");
              else if (B.includes("@AllNoSpeak---")) "1" == B.replace("@AllNoSpeak---", "") ? a.store.commit("changeCloseComment", 1) : a.store.commit("changeCloseComment", 0);
              else if (B.includes("@CreatingOrder---")) {
                var G = B.replace("@CreatingOrder---", "");
                G && (Q.value = JSON.parse(G), setTimeout((function() {
                  Q.value = {}
                }), 3e3))
              } else if (B.includes("@CheackOpen---")) "1" == B.replace("@CheackOpen---", "") ? a.store.commit("changecheckOpen", 1) : a.store.commit("changecheckOpen", 2);
              else if (B.includes("@CheackInOpen---")) {
                var U = B.replace("@CheackInOpen---", "");
                a.store.commit("changechecinkOpen", JSON.parse(U))
              } else if (B.includes("@SubmitOrderSuccess---")) {
                var H = B.replace("@SubmitOrderSuccess---", "");
                if (H) {
                  var V = JSON.parse(H);
                  1 == c.value && F.value.push({
                    head: V.user_avatar,
                    name: V.user_nick_name,
                    text: "下单了" + V.product_info.sort + "号商品 去看看 >",
                    msgType: "text",
                    product_id: V.product_info.product_id,
                    spec_sku_id: V.spec_sku_id
                  }), O.value = JSON.parse(H).sales_number, b.value = Number(k.value.sales_initial)
                }
              } else if (B.includes("@EditProductSalesInitial---")) {
                var z = B.replace("@EditProductSalesInitial---", "");
                if (z) {
                  var X = JSON.parse(z);
                  X.sales_initial ? (x.value = 1, b.value = Number(X.sales_initial)) : X.product_stock && (x.value = 2, N.value = Number(X.product_stock))
                }
              } else if (B.includes("@CreateOrderEdit---")) {
                var Y = B.replace("@CreateOrderEdit---", "");
                Y && (T.value = JSON.parse(Y).is_creating_order)
              } else if (B.includes("@HotSaleEdit---")) {
                var Z = B.replace("@HotSaleEdit---", "");
                Z && (w.value = JSON.parse(Z).is_hot_sale)
              } else if (B.includes("@ShowCartChange---")) {
                var $ = B.replace("@ShowCartChange---", "");
                $ && K("cartChange", $)
              } else if (B.includes("@TopBa---")) {
                var ee = B.replace("@TopBa---", "");
                D.value = "" == ee ? null : JSON.parse(ee)
              } else if (B.includes("@EditSalesOne---")) {
                var ae = B.replace("@EditSalesOne---", "");
                o.value = ae
              } else if (B.includes("@pushCoupon---")) {
                var te = B.replace("@pushCoupon---", "");
                a.store.commit("changeCouponOpen", JSON.parse(te))
              } else if (B.includes("@endPushCoupon---")) a.store.commit("changeCouponOpen", {});
              else if (B.includes("@Refresh---")) K("refresh");
              else if (B.includes("@DeleteLuckyBag---")) K("hideLuckyBag");
              else if (B.includes("@LuckyBag---")) {
                var le = B.replace("@LuckyBag---", ""),
                  ue = JSON.parse(le);
                K("showLuckyBag", ue.end)
              } else if (B.includes("@LuckyBagWinners---")) {
                for (var ne = B.replace("@LuckyBagWinners---", ""), re = JSON.parse(ne), ie = !1, se = 0; se < re.length; se++)
                  if (re[se].user_id == s.value) {
                    ie = !0;
                    break
                  } K("luckyBagResult", ie, re)
              } else if (B.includes("@AuthWatch---")) {
                var oe = B.replace("@AuthWatch---", ""),
                  ce = JSON.parse(oe);
                s.value = e.index.getStorageSync("user_id"), ce.user_id == s.value && K("authSuccess")
              } else if (B.includes("@DeleteCountdownPoints---")) K("hideCountdownPoints");
              else if (B.includes("@CountdownPoints---")) {
                var de = B.replace("@CountdownPoints---", ""),
                  ve = JSON.parse(de);
                K("showCountdownPoints", ve.end, ve.countdown_type, ve.time_type, ve.time, ve.id)
              } else if (B.includes("@DeleteCountdownRedpack---")) K("hideCountdownRedpack");
              else if (B.includes("@CountdownRedpack---")) {
                var pe = B.replace("@CountdownRedpack---", ""),
                  fe = JSON.parse(pe);
                K("showCountdownRedpack", fe.end, fe.countdown_type, fe.time_type, fe.time, fe.id)
              } else if (B.includes("@SendStoreCoupon---")) {
                var ge = B.replace("@SendStoreCoupon---", "");
                a.store.commit("changeWelfareOpen", JSON.parse(ge))
              } else if (B.includes("@UpdateAssistant---")) {
                var me = B.replace("@UpdateAssistant---", "");
                if (me) {
                  h.value = JSON.parse(me);
                  for (var he = e.index.getStorageSync("user_id"), _e = 0, ye = 0; ye < h.value.length; ye++)
                    if (h.value[ye].user_id == he) {
                      _e = h.value[ye].type;
                      break
                    } K("setAssistant", _e)
                }
              }
            }
          })), u.value.length > 0 && setTimeout((function() {
            var e;
            e = u.value, (null == E ? void 0 : E.value) && R.value.length > 40 && (clearInterval(E.value), R.value = []), R.value = e, E.value = setInterval((function() {
              R.value.length > 0 ? (F.value.length > 100 && (F.value = F.value.splice(0, F.value.length - 100)), F.value.push(R.value[0]), R.value.splice(0, 1), q.value = "list-" + (F.value.length - 1)) : clearInterval(E)
            }), 400)
          }), 800)
        },
        F = e.ref([]),
        q = e.ref("");
      e.ref(50);
      var M = e.ref(0),
        W = e.ref(!1),
        j = e.ref([]),
        G = function(e) {
          var a = e.detail.scrollTop;
          a < M.value && !U.value && (j.value.push(!0), j.value.length > 5 && (j.value = [], W.value = !0)), M.value = a
        },
        U = e.ref(!1),
        H = function() {
          j.value = [], W.value = !1, U.value = !0, setTimeout((function() {
            U.value = !1
          }), 500)
        },
        V = function() {
          k.value.product_id > 0 ? K("goShop", k.value.product_id, k.value.spec_sku_id) : 1 == k.value.type ? e.index.navigateTo({
            url: "/pages/webview/webview?url=" + encodeURIComponent(k.value.link_url)
          }) : 2 == k.value.type ? e.index.navigateToMiniProgram({
            shortLink: k.value.link_url,
            success: function(e) {},
            fail: function() {}
          }) : e.index.navigateToMiniProgram({
            appId: k.value.wechat_app_id,
            path: k.value.link_url + k.value.scene,
            success: function(e) {},
            fail: function() {}
          })
        },
        z = function(e) {
          return 1 == S.isAnonymous ? e.length <= 1 ? e : e[0] + "*".repeat(e.length - 1) : e
        },
        K = n,
        Q = e.ref({});
      return u({
          sendBarrage: function(a, t, l, u, n, r, i) {
            null == n && (n = "text");
            var s = {};
            if (i) {
              var o = e.ref(JSON.parse(i));
              o.value.grade_detail && (s = o.value.grade_detail)
            }
            F.value.push({
              head: l,
              name: t,
              text: a,
              msgType: n,
              sequence: r,
              grade_msg: s
            }), q.value = "list-" + (F.value.length - 1)
          },
          offReceiveMessage: function() {
            i.globalData.imChat.off(i.globalData.imMessageReceived, L)
          },
          setExplain: function(e) {
            var a, t;
            k.value = e, b.value = null == (a = k.value) ? void 0 : a.sales_initial, (null == (t = k.value) ? void 0 : t.tip_type) && (x.value = k.value.tip_type, N.value = k.value.product_stock)
          },
          setTopBa: function(e) {
            D.value = "" === e || null == e ? null : JSON.parse(e)
          },
          clearScreen: function() {
            F.value = []
          },
          offRevokeMessage: function() {
            i.globalData.imChat.off("onMessageRevoked", P)
          }
        }), e.onBeforeUnmount((function() {
          clearTimeout(v)
        })),
        function(a, l) {
          return e.e({
            a: Q.value.userInfo
          }, Q.value.userInfo ? e.e({
            b: 1 == T.value
          }, 1 == T.value ? e.e({
            c: 0 == t.isAvatarAnonymous
          }, 0 == t.isAvatarAnonymous ? {
            d: Q.value.userInfo.avatarUrl
          } : {}, {
            e: e.t(z(Q.value.userInfo.nickName))
          }) : {}) : {}, {
            f: null != D.value
          }, null != D.value ? {
            g: D.value.avatarUrl,
            h: e.t(D.value.nickName),
            i: e.t(D.value.content)
          } : {}, {
            j: t.liveNotice && e.unref(d) && p.value
          }, t.liveNotice && e.unref(d) && p.value ? {
            k: e.t(t.liveNotice)
          } : {}, {
            l: e.f(F.value, (function(a, l, u) {
              return e.e({
                a: -1 == a.text.indexOf("product_info")
              }, -1 == a.text.indexOf("product_info") ? e.e({
                b: 1 == t.isGrade && null != a.grade_msg && null != a.grade_msg.name
              }, 1 == t.isGrade && null != a.grade_msg && null != a.grade_msg.name ? {
                c: e.t(a.grade_msg.name),
                d: e.s("background-image: url(" + a.grade_msg.image + ");color: " + a.grade_msg.font_color)
              } : {}, {
                e: 0 == t.isAvatarAnonymous
              }, 0 == t.isAvatarAnonymous ? {
                f: a.head
              } : {}, {
                g: "text" == a.msgType
              }, "text" == a.msgType ? e.e({
                h: e.unref(f) > 0 && a.isVirtualMember
              }, (e.unref(f) > 0 && a.isVirtualMember, {}), {
                i: a.assistantType && 1 == a.assistantType
              }, (a.assistantType && a.assistantType, {}), {
                j: a.assistantType && 2 == a.assistantType
              }, (a.assistantType && a.assistantType, {}), {
                k: !a.product_id
              }, a.product_id ? {
                p: e.t(z(a.name)),
                q: e.t(a.text),
                r: e.o((function(e) {
                  return function(e) {
                    e.product_id > 0 && K("goShop", e.product_id, e.spec_sku_id)
                  }(a)
                }), l)
              } : e.e({
                l: e.unref(f) > 0 && null != a.tag && a.tag.length
              }, e.unref(f) > 0 && null != a.tag && a.tag.length ? {
                m: e.f(a.tag, (function(a, t, l) {
                  return {
                    a: e.t(a),
                    b: t
                  }
                }))
              } : {}, {
                n: e.t(z(a.name)),
                o: e.t(a.text)
              })) : {
                s: e.t(z(a.name)),
                t: e.o((function(t) {
                  return l = a.text, e.index.setStorageSync("exitImGroup", "no"), void e.index.previewImage({
                    urls: [l]
                  });
                  var l
                }), l),
                v: a.text
              }) : {}, {
                w: l,
                x: "list-" + l
              })
            })),
            m: q.value,
            n: e.o(G, "c5"),
            o: e.o(H, "1d"),
            p: null != k.value
          }, null != k.value ? e.e({
            q: 1 == w.value && (parseInt(b.value) > 0 || parseInt(O.value) > 0 || 2 == x.value)
          }, 1 == w.value && (parseInt(b.value) > 0 || parseInt(O.value) > 0 || 2 == x.value) ? e.e({
            r: a.config.pic_url + (1 == x.value ? "/202512091411443ed5d5806.png" : "/20260127132820956961351.png"),
            s: 1 == x.value
          }, 1 == x.value ? {
            t: e.t(A())
          } : {}, {
            v: 2 == x.value
          }, 2 == x.value ? e.e({
            w: N.value >= 1e8
          }, N.value >= 1e8 ? {
            x: e.t(parseInt(N.value / 1e8))
          } : N.value >= 1e4 ? {
            z: e.t(parseInt(N.value / 1e4))
          } : {
            A: e.t(N.value)
          }, {
            y: N.value >= 1e4
          }) : {}, {
            B: e.n(1 == x.value ? "hotGoods" : "hotGoods1")
          }) : {}, {
            C: k.value.product_image,
            D: e.t(k.value.product_name),
            E: e.t(k.value.product_price),
            F: a.config.pic_url + "/static/live/zheng.gif",
            G: e.o(I, "06"),
            H: e.o(V, "26")
          }) : {})
        }
    }
  },
  l = e._export_sfc(t, [
    ["__scopeId", "data-v-e2d115a4"]
  ]);
wx.createComponent(l);