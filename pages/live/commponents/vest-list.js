var e = require("../../../@babel/runtime/helpers/objectSpread2"),
  n = require("../../../common/vendor.js");
Array || (n.resolveComponent("uni-icons") + n.resolveComponent("uni-popup"))(), Math || (function() {
  return "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js"
} + function() {
  return "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
} + a)();
var a = function() {
    return "../../../components/upload/upload2.js"
  },
  o = {
    __name: "vest-list",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      }
    },
    setup: function(a, o) {
      var t = o.expose,
        i = n.getCurrentInstance();
      getApp();
      var u = a,
        l = n.ref(0),
        v = n.ref([]),
        d = n.ref(1),
        c = n.ref(!1),
        s = n.ref([]),
        r = n.ref(1),
        f = n.ref(!1),
        p = n.ref(null),
        m = n.ref({
          id: "",
          comment: ""
        }),
        h = n.ref(null),
        g = n.ref(null),
        x = n.ref(null),
        _ = n.ref(!1),
        w = n.ref([]),
        L = n.ref(1),
        b = n.ref(!1),
        k = n.ref([]),
        y = n.ref(1),
        R = n.ref(!1),
        T = n.ref({
          id: "",
          nick_name: "",
          avatar: ""
        }),
        A = n.ref({}),
        C = n.ref(!1),
        j = n.ref(null),
        M = n.ref(!1),
        I = n.ref(null),
        q = n.ref(null),
        z = n.ref(!1),
        P = n.ref(!1),
        S = n.ref(!1),
        V = n.ref(""),
        D = n.inject("supplier_user_id", 0),
        B = n.inject("shop_supplier_id", 0),
        E = n.inject("roomId");
      n.onMounted((function() {
        G(), X(), ve()
      }));
      var F = n.ref(null),
        G = function() {
          var e;
          null == (e = F.value) || e.open("bottom"), L.value = 1, w.value = [], b.value = !1, H()
        },
        H = function() {
          b.value ? n.index.showToast({
            title: "已经到底了！",
            icon: "none"
          }) : i.proxy._get("live.chatVestRobot/lists", {
            page: L.value,
            list_rows: 15,
            shop_supplier_id: B.value
          }, (function(e) {
            L.value++, e.data.list.data.length > 0 ? w.value = w.value.concat(e.data.list.data) : (b.value = !0, n.index.showToast({
              title: "已经到底了！",
              icon: "none"
            }))
          }))
        },
        J = n.ref([]),
        K = function(e) {
          J.value = e.detail.value
        },
        N = n.ref(!1),
        Q = n.ref(""),
        O = function() {
          Q.value ? J.value.length < 1 ? n.index.showToast({
            title: "请选择马甲",
            icon: "none"
          }) : (N.value = !0, n.index.showLoading({
            title: "加载中"
          }), i.proxy._post("live.chatVestRobot/sendRobotMessage", {
            room_id: u.liveId,
            vest_robot_ids: J.value,
            content: Q.value,
            supplier_user_id: D.value
          }, (function(e) {
            var a;
            n.index.hideLoading(), N.value = !1, 1 == e.code && (null == (a = F.value) || a.close())
          }), (function(e) {
            n.index.hideLoading(), N.value = !1
          }))) : n.index.showToast({
            title: "请输入您要发送的内容",
            icon: "none"
          })
        },
        U = function(e) {
          e.show || (J.value = [], Q.value = "", N.value = !1)
        },
        W = function(e) {
          l.value = e
        },
        X = function() {
          c.value || (n.index.showLoading({
            title: "加载中"
          }), i.proxy._post("live.RoomAssistant/getCommentList", {
            supplier_user_id: D.value,
            page: d.value,
            list_rows: 15
          }, (function(e) {
            z.value && (z.value = !1), n.index.hideLoading(), d.value++, e.data.data.length > 0 && (v.value = v.value.concat(e.data.data)), e.data.total == v.value.length && (c.value = !0)
          }), (function(e) {
            n.index.hideLoading(), z.value && (z.value = !1)
          })))
        },
        Y = n.ref(null),
        Z = function() {
          p.value <= 0 ? n.index.showToast({
            title: "请输入发送数量",
            icon: "none"
          }) : p.value > 30 ? n.index.showToast({
            title: "单次最多发送30条",
            icon: "none"
          }) : (n.index.showLoading({
            title: "发送中..."
          }), i.proxy._post("live.RoomAssistant/sendMultipleComment", {
            room_id: E.value,
            comment: m.value.comment,
            count: p.value,
            supplier_user_id: D.value
          }, (function(e) {
            n.index.hideLoading(), 1 == e.code && (p.value = null, Y.value.close(), n.index.showToast({
              title: e.msg
            }))
          }), (function(e) {
            n.index.hideLoading()
          })))
        },
        $ = function() {
          _.value = !0, m.value = {
            id: "",
            comment: ""
          }, h.value.open()
        },
        ee = function() {
          _.value = !0, g.value.close(), h.value.open()
        },
        ne = function() {
          n.index.showModal({
            content: "确定要删除吗？",
            success: function(e) {
              e.confirm && (g.value.close(), n.index.showLoading({
                title: "删除中..."
              }), i.proxy._post("live.RoomAssistant/delComment", {
                id: m.value.id
              }, (function(e) {
                1 == e.code && (n.index.showToast({
                  title: e.msg
                }), te()), n.index.hideLoading()
              }), (function(e) {
                n.index.hideLoading()
              })))
            }
          })
        },
        ae = function() {
          n.index.setClipboardData({
            data: m.value.comment,
            success: function() {
              n.index.showToast({
                title: "复制成功"
              }), g.value.close()
            }
          })
        },
        oe = function() {
          "" != m.value.comment ? (n.index.showLoading({
            title: "保存中..."
          }), i.proxy._post("live.RoomAssistant/saveComment", e({
            supplier_user_id: D.value
          }, m.value), (function(e) {
            n.index.hideLoading(), 1 == e.code && (n.index.showToast({
              title: e.msg
            }), h.value.close(), te())
          }), (function(e) {
            n.index.hideLoading()
          }))) : n.index.showToast({
            title: "请输入评论内容",
            icon: "none"
          })
        },
        te = function() {
          v.value = [], d.value = 1, c.value = !1, X()
        },
        ie = function() {
          z.value = !0, te()
        },
        ue = function() {
          k.value = [], y.value = 1, R.value = !1, ve()
        },
        le = function() {
          P.value = !0, ue()
        },
        ve = function() {
          R.value || (n.index.showLoading({
            title: "加载中"
          }), i.proxy._post("live.RoomAssistant/getRobotList", {
            supplier_user_id: D.value,
            page: y.value,
            list_rows: 15
          }, (function(e) {
            P.value && (P.value = !1), n.index.hideLoading(), 1 == y.value && e.data.default && (A.value = e.data.default), y.value++, e.data.list.data.length > 0 && (k.value = k.value.concat(e.data.list.data)), k.value.length == e.data.list.total && (R.value = !0)
          }), (function(e) {
            P.value && (P.value = !1), n.index.hideLoading()
          })))
        },
        de = function() {
          k.value.length >= 30 ? n.index.showToast({
            title: "最多添加30个固定马甲",
            icon: "none"
          }) : (T.value = {}, C.value = !0, j.value.open())
        },
        ce = function() {
          T.value.nick_name ? T.value.avatar ? (n.index.showLoading({
            title: "保存中..."
          }), i.proxy._get("live.RoomAssistant/saveRobot", e({
            supplier_user_id: D.value
          }, T.value), (function(e) {
            n.index.hideLoading(), 1 == e.code && (n.index.showToast({
              title: e.msg
            }), j.value.close(), ue())
          }), (function(e) {
            n.index.hideLoading()
          }))) : n.index.showToast({
            title: "请上传马甲头像",
            icon: "none"
          }) : n.index.showToast({
            title: "请输入马甲昵称",
            icon: "none"
          })
        },
        se = function() {
          M.value = !0
        },
        re = function(e) {
          e && void 0 !== e && (T.value.avatar = e[0].file_path, M.value = !1)
        },
        fe = function() {
          x.value.close(), C.value = !0, j.value.open()
        },
        pe = function() {
          n.index.showModal({
            content: "确定要删除吗？",
            success: function(e) {
              e.confirm && (x.value.close(), n.index.showLoading({
                title: "删除中..."
              }), i.proxy._post("live.RoomAssistant/delRobot", {
                id: T.value.id,
                supplier_user_id: D.value
              }, (function(e) {
                1 == e.code && (n.index.showToast({
                  title: e.msg
                }), ue()), n.index.hideLoading()
              }), (function(e) {
                n.index.hideLoading()
              })))
            }
          })
        },
        me = function() {
          n.index.showLoading({
            title: "更换中..."
          }), i.proxy._post("live.RoomAssistant/changeRobot", {
            id: A.value.id,
            supplier_user_id: D.value
          }, (function(e) {
            1 == e.code && (n.index.showToast({
              title: e.msg
            }), A.value = e.data), n.index.hideLoading()
          }), (function(e) {
            n.index.hideLoading()
          }))
        },
        he = function(e) {
          e || (e = A.value), ge(), q.value = e, I.value.open()
        },
        ge = function() {
          s.value = [], f.value = !1, r.value = 1, _e()
        },
        xe = function() {
          S.value = !0, ge()
        },
        _e = function() {
          f.value || (n.index.showLoading({
            title: "加载中"
          }), i.proxy._post("live.RoomAssistant/getCommentList", {
            supplier_user_id: D.value,
            page: r.value,
            list_rows: 15
          }, (function(e) {
            S.value && (S.value = !1), n.index.hideLoading(), r.value++, e.data.data.length > 0 && (s.value = s.value.concat(e.data.data)), s.value.length == e.data.total && (f.value = !0)
          }), (function(e) {
            S.value && (S.value = !1), n.index.hideLoading()
          })))
        },
        we = function(e) {
          n.index.showLoading({
            title: "发送中..."
          }), i.proxy._post("live.RoomAssistant/sendQuickComment", {
            room_id: E.value,
            comment: e,
            supplier_user_id: D.value,
            nick_name: q.value.nick_name,
            avatar: q.value.avatar
          }, (function(e) {
            n.index.hideLoading(), 1 == e.code && (n.index.showToast({
              title: e.msg
            }), A.value = e.data, I.value.close(), V.value = "")
          }), (function(e) {
            n.index.hideLoading()
          }))
        },
        Le = function() {
          i.proxy._post("live.RoomAssistant/getRandomAvatar", {}, (function(e) {
            1 == e.code && (T.value.avatar = e.data)
          }))
        },
        be = function() {
          V.value ? we(V.value) : n.index.showToast({
            title: "请输入评论内容",
            icon: "none"
          })
        };
      return t({
          showVestList: G
        }),
        function(e, a) {
          return n.e({
            a: n.n(0 == l.value ? "head-more" : ""),
            b: n.n(0 == l.value ? "hla" : ""),
            c: n.o((function(e) {
              return W(0)
            }), "54"),
            d: n.n(1 == l.value ? "head-more" : ""),
            e: n.n(1 == l.value ? "hla" : ""),
            f: n.o((function(e) {
              return W(1)
            }), "19"),
            g: n.n(2 == l.value ? "head-more" : ""),
            h: n.n(2 == l.value ? "hla" : ""),
            i: n.o((function(e) {
              return W(2)
            }), "c8"),
            j: 1 == l.value
          }, 1 == l.value ? {
            k: n.o($, "a6")
          } : {}, {
            l: 0 == l.value
          }, 0 == l.value ? n.e({
            m: w.value.length > 0
          }, w.value.length > 0 ? {
            n: n.f(w.value, (function(a, o, t) {
              return {
                a: a.avatar || e.config.pic_url + "/static/live/default_logo.jpeg",
                b: n.t(a.nick_name),
                c: a.id,
                d: J.value.includes(a.id),
                e: a.id
              }
            })),
            o: n.o(K, "72")
          } : {}, {
            p: n.o(H, "d4"),
            q: Q.value,
            r: n.o((function(e) {
              return Q.value = e.detail.value
            }), "ed"),
            s: N.value,
            t: n.o(O, "c1")
          }) : {}, {
            v: 1 == l.value
          }, 1 == l.value ? n.e({
            w: n.f(v.value, (function(e, a, o) {
              return {
                a: n.t(e.comment),
                b: n.o((function(n) {
                  return function(e) {
                    m.value = e, Y.value.open()
                  }(e)
                }), e.id),
                c: n.o((function(a) {
                  return function(e) {
                    n.index.showLoading({
                      title: "发送中..."
                    }), i.proxy._post("live.RoomAssistant/sendComment", {
                      room_id: E.value,
                      comment: e.comment,
                      supplier_user_id: D.value
                    }, (function(e) {
                      n.index.hideLoading(), 1 == e.code && n.index.showToast({
                        title: e.msg
                      })
                    }), (function(e) {
                      n.index.hideLoading()
                    }))
                  }(e)
                }), e.id),
                d: "5c5fc14e-1-" + o + ",5c5fc14e-0",
                e: n.o((function(n) {
                  return function(e) {
                    m.value = e, g.value.open()
                  }(e)
                }), e.id),
                f: e.id,
                g: n.n(a < v.value.length - 1 ? "c-item-line" : "")
              }
            })),
            x: n.p({
              type: "more-filled",
              size: "20"
            }),
            y: 0 == v.value.length || c.value
          }, 0 == v.value.length || c.value ? {
            z: n.t(0 == v.value.length ? "暂无评论数据" : "没有更多数据了")
          } : {}, {
            A: z.value,
            B: n.o(ie, "fc"),
            C: n.o(X, "a2")
          }) : {}, {
            D: 2 == l.value
          }, 2 == l.value ? n.e({
            E: A.value.avatar,
            F: n.t(A.value.nick_name),
            G: n.o(me, "74"),
            H: n.o((function(e) {
              return he()
            }), "d6"),
            I: n.t(k.value.length),
            J: n.o(de, "54"),
            K: n.f(k.value, (function(e, a, o) {
              return {
                a: e.avatar,
                b: n.t(e.nick_name),
                c: n.o((function(n) {
                  return he(e)
                }), e.id),
                d: "5c5fc14e-2-" + o + ",5c5fc14e-0",
                e: n.o((function(n) {
                  return function(e) {
                    T.value = e, x.value.open()
                  }(e)
                }), e.id),
                f: e.id,
                g: n.n(a < k.value.length - 1 ? "c-item-line" : "")
              }
            })),
            L: n.p({
              type: "more-filled",
              size: "20"
            }),
            M: 0 == k.value.length || R.value
          }, 0 == k.value.length || R.value ? {
            N: n.t(0 == k.value.length ? "暂无马甲数据" : "没有更多数据了")
          } : {}, {
            O: P.value,
            P: n.o(le, "51"),
            Q: n.o(ve, "c3")
          }) : {}, {
            R: n.sr(F, "5c5fc14e-0", {
              k: "vestSc"
            }),
            S: n.o(U, "1a"),
            T: n.p({
              type: "bottom",
              "mask-click": !0,
              "background-color": "#fcfcfe",
              "border-radius": "20px 20px 0 0"
            }),
            U: p.value,
            V: n.o((function(e) {
              return p.value = e.detail.value
            }), "36"),
            W: n.o(Z, "eb"),
            X: n.sr(Y, "5c5fc14e-3", {
              k: "sendCountPop"
            }),
            Y: _.value
          }, _.value ? {
            Z: m.value.comment,
            aa: n.o((function(e) {
              return m.value.comment = e.detail.value
            }), "36")
          } : {}, {
            ab: n.o(oe, "f4"),
            ac: n.sr(h, "5c5fc14e-4", {
              k: "addCommentPop"
            }),
            ad: n.o((function(e) {
              return _.value = !1
            }), "02"),
            ae: n.o(ee, "22"),
            af: n.o(ne, "44"),
            ag: n.o(ae, "59"),
            ah: n.sr(g, "5c5fc14e-5", {
              k: "moreAction"
            }),
            ai: C.value
          }, C.value ? n.e({
            aj: T.value.nick_name,
            ak: n.o((function(e) {
              return T.value.nick_name = e.detail.value
            }), "88"),
            al: T.value.avatar
          }, T.value.avatar ? {
            am: T.value.avatar,
            an: n.o(se, "45")
          } : {
            ao: n.o(se, "d1"),
            ap: n.p({
              type: "contact",
              size: "40"
            })
          }, {
            aq: n.o(Le, "f7"),
            ar: n.o(ce, "44"),
            as: M.value
          }, M.value ? {
            at: n.o(re, "85"),
            av: n.p({
              num: 1
            })
          } : {}) : {}, {
            aw: n.sr(j, "5c5fc14e-6", {
              k: "addRobotPop"
            }),
            ax: n.o((function(e) {
              return C.value = !1
            }), "65"),
            ay: n.o(fe, "ec"),
            az: n.o(pe, "f2"),
            aA: n.sr(x, "5c5fc14e-9", {
              k: "moreAction1"
            }),
            aB: n.f(s.value, (function(e, a, o) {
              return {
                a: n.t(e.comment),
                b: n.o((function(n) {
                  return we(e.comment)
                }), a),
                c: n.n(a < s.value.length - 1 ? "c-item-line" : ""),
                d: a
              }
            })),
            aC: 0 == s.value.length || f.value
          }, 0 == s.value.length || f.value ? {
            aD: n.t(0 == s.value.length ? "暂无评论数据" : "没有更多数据了")
          } : {}, {
            aE: S.value,
            aF: n.o(xe, "c0"),
            aG: n.o((function(e) {
              return _e()
            }), "ff"),
            aH: n.o(be, "7a"),
            aI: V.value,
            aJ: n.o((function(e) {
              return V.value = e.detail.value
            }), "aa"),
            aK: n.o(be, "70"),
            aL: n.sr(I, "5c5fc14e-10", {
              k: "quickComment"
            }),
            aM: n.p({
              type: "bottom",
              "background-color": "#fcfcfe",
              "border-radius": "20px 20px 0 0"
            })
          })
        }
    }
  },
  t = n._export_sfc(o, [
    ["__scopeId", "data-v-5c5fc14e"]
  ]);
wx.createComponent(t);