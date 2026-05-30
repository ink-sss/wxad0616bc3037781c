var e = require("../../../@babel/runtime/helpers/slicedToArray"),
  t = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  n = require("../../../@babel/runtime/helpers/asyncToGenerator"),
  a = require("../../../common/vendor.js"),
  r = require("../../../store/index.js");
Math || (c + a.unref(i) + a.unref(o) + a.unref(u) + l + v + s + f + d + p)();
var i = function() {
    return "./domain-option.js"
  },
  o = function() {
    return "./shop-list.js"
  },
  u = function() {
    return "./share-live.js"
  },
  l = function() {
    return "./order/confirm-order.js"
  },
  s = function() {
    return "./trtc-apply.js"
  },
  c = function() {
    return "../../../components/uni-icon/uni-icon.js"
  },
  v = function() {
    return "./myorder.js"
  },
  f = function() {
    return "./invite-record.js"
  },
  d = function() {
    return "./withdraw-popup.js"
  },
  p = function() {
    return "./welfare-package-popup.js"
  },
  h = {
    __name: "bottom-option",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      },
      msgModule: {
        type: Number,
        default: 0
      },
      lookType: {
        type: String,
        default: "vertical"
      },
      speakInterval: {
        type: Number,
        default: 1
      },
      speakPic: {
        type: Number,
        default: 0
      },
      liveStatus: {
        type: [String, Number],
        default: ""
      },
      liveAvatar: {
        type: String,
        default: ""
      },
      showCart: {
        type: Boolean,
        default: !0
      },
      isOrder: {
        type: [Number, String],
        default: 1
      },
      isShare: {
        type: [Number, String],
        default: 1
      },
      isTrtc: {
        type: [String, Number],
        default: 0
      },
      is_trtc_go: {
        type: Boolean,
        default: !1
      }
    },
    emits: ["sendBarrage", "clearScreen", "closeTrtc"],
    setup: function(i, o) {
      var u = o.expose,
        l = o.emit,
        s = getApp(),
        c = a.getCurrentInstance(),
        v = a.computed((function() {
          return r.store.state.is_prohibition
        })),
        f = a.computed((function() {
          return r.store.state.is_fake_prohibition
        })),
        d = a.computed((function() {
          return r.store.state.is_close_comment
        })),
        p = a.computed((function() {
          return r.store.state.grade_detail
        })),
        h = a.ref([]),
        m = a.ref([]);
      a.ref(!1);
      var g = i,
        x = function() {
          y("closeTrtc")
        },
        w = a.ref(!0);
      a.watch((function() {
        return g.showCart
      }), (function(e, t) {
        w.value = e
      }));
      var k = a.ref("");
      a.watch((function() {
        return g.liveStatus
      }), (function(e, t) {
        k.value = e
      }));
      var y = l,
        T = a.ref(!1),
        b = a.ref(null),
        _ = function() {
          var e = n(t().mark((function e() {
            var n;
            return t().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = T.value, e.t0) {
                    e.next = 5;
                    break
                  }
                  return T.value = !0, e.next = 5, a.nextTick$1();
                case 5:
                  null == (n = b.value) || n.showDomain();
                case 6:
                case "end":
                  return e.stop()
              }
            }), e)
          })));
          return function() {
            return e.apply(this, arguments)
          }
        }(),
        S = a.ref(!1),
        C = a.ref(!1);
      a.watch((function() {
        return g.is_trtc_go
      }), (function(e, t) {
        C.value = e
      })), a.ref(0), a.onMounted((function() {
        a.index.getSystemInfoSync(), j(), Te(), setTimeout((function() {
          D(), B(), k.value = g.liveStatus
        }), 1e3)
      }));
      var D = function() {
          c.proxy._post("live.index/getCommentSensitiveWord", {}, (function(e) {
            1 == e.code && (m.value = e.data)
          }))
        },
        j = function() {
          c.proxy._post("live.index/getBannedWords", {
            live_id: g.liveId
          }, (function(e) {
            1 == e.code && (h.value = e.data)
          }))
        },
        I = a.ref(""),
        M = a.ref(""),
        O = a.ref(0),
        N = function(e) {
          e.detail.height > 0 ? (O.value = e.detail.height, setTimeout((function() {
            S.value = !0
          }), 100)) : (S.value = !1, I.value = "", M.value = "")
        },
        P = function(e) {
          e.detail.height <= 0 && (S.value = !1, I.value = "", M.value = "")
        };
      a.ref(!1);
      var L = function(e) {},
        A = a.ref(0),
        $ = function(e) {
          var t = a.ref("");
          if (103 == k.value) return a.index.showToast({
            title: "已结束，禁止发送弹幕",
            icon: "none"
          }), void(I.value = "");
          if (-1 !== [102, 109].indexOf(k.value)) return a.index.showToast({
            title: "未开始，禁止发送弹幕",
            icon: "none"
          }), void(I.value = "");
          if ("confirm" == e.type ? t.value = e.detail.value : t.value = M.value, Math.floor((new Date).getTime() / 1e3) - A.value < g.speakInterval) return a.index.showToast({
            title: "发言过快，请稍后再试！",
            icon: "none"
          }), I.value = "", void(M.value = "");
          if ("" != t.value) {
            if ("❤" != t.value && "🌷" != t.value) {
              if (h.value)
                for (var n = 0; n < h.value.length; n++)
                  if (t.value.indexOf(h.value[n]) > -1) return a.index.showToast({
                    title: "发言内容包含违禁词，请重新输入",
                    icon: "none"
                  }), I.value = "", void(M.value = "");
              if (m.value)
                for (var r = 0; r < m.value.length; r++)
                  if (t.value.indexOf(m.value[r]) > -1) return a.index.showToast({
                    title: "发言内容包含敏感词，请重新输入",
                    icon: "none"
                  }), I.value = "", void(M.value = "")
            }
            z(t.value), I.value = "", M.value = ""
          } else a.index.showToast({
            title: "请输入发言内容",
            icon: "none"
          })
        },
        q = a.ref([]),
        B = function() {
          var e, t = null == (e = s.globalData.imChat) ? void 0 : e.getMyProfile();
          null == t || t.then((function(e) {
            e.data.profileCustomField.length > 0 && "Tag_Profile_Custom_label" == e.data.profileCustomField[0].key && ("" == e.data.profileCustomField[0].value || null == e.data.profileCustomField[0].value || null == e.data.profileCustomField[0].value ? q.value = [] : q.value = e.data.profileCustomField[0].value.split(","))
          })).catch((function(e) {
            console.warn("getMyProfile error:", e)
          }))
        },
        z = function(e) {
          var t, n = {
            msg_module: g.msgModule,
            grade_detail: p.value,
            tag: q.value
          };
          if (1 == f.value)(null == (t = s.globalData.imChat) ? void 0 : t.getMyProfile()).then((function(t) {
            y("sendBarrage", e, t.data.nick, t.data.avatar, "", "text", "", "")
          }));
          else {
            var r = s.globalData.imChat.createTextMessage({
              to: s.globalData.group_id,
              conversationType: s.globalData.conversationType,
              payload: {
                text: e
              },
              cloudCustomData: JSON.stringify(n)
            });
            s.globalData.imChat.sendMessage(r).then((function(t) {
              A.value = Math.floor((new Date).getTime() / 1e3);
              var r = a.ref(0);
              if ("" != t.data.message.cloudCustomData) {
                var i = a.ref(JSON.parse(t.data.message.cloudCustomData));
                null != i.value.msg_module && (r.value = i.value.msg_module)
              }
              y("sendBarrage", e, t.data.message.nick, t.data.message.avatar, r.value, "text", t.data.message.sequence, JSON.stringify(n))
            })).catch((function(e) {
              a.index.showToast({
                title: "发送失败，请重新尝试发送",
                icon: "none"
              }), console.warn("sendMessage error:", e)
            })), B()
          }
        },
        F = function() {
          if (103 != k.value)
            if (-1 === [102, 109].indexOf(k.value)) {
              var e = {
                msg_module: g.msgModule
              };
              a.index.setStorageSync("exitImGroup", "no"), a.index.chooseImage({
                count: 1,
                mediaType: ["image"],
                sizeType: ["compressed"],
                extension: ["jpg", "jpeg", "gif", "png", "bmp", "image", "webp"],
                success: function(t) {
                  a.index.showLoading({
                    title: "正在发送"
                  }), setTimeout((function() {
                    a.index.hideLoading();
                    var n = s.globalData.imChat.createImageMessage({
                      to: s.globalData.group_id,
                      conversationType: s.globalData.conversationType,
                      payload: {
                        file: t
                      },
                      cloudCustomData: JSON.stringify(e),
                      onProgress: function(e) {}
                    });
                    s.globalData.imChat.sendMessage(n).then((function(e) {
                      var t = a.ref(0);
                      if ("" != e.data.message.cloudCustomData) {
                        var n = a.ref(JSON.parse(e.data.message.cloudCustomData));
                        null != n.value.msg_module && (t.value = n.value.msg_module)
                      }
                      y("sendBarrage", e.data.message.payload.imageInfoArray[0].url, e.data.message.nick, e.data.message.avatar, t.value, "img")
                    })).catch((function(e) {
                      console.warn("sendMessage error:", e), a.index.showToast({
                        title: "发送图片失败",
                        icon: "none"
                      })
                    }))
                  }), 300)
                }
              })
            } else a.index.showToast({
              title: "未开始，禁止发送弹幕",
              icon: "none"
            });
          else a.index.showToast({
            title: "已结束，禁止发送弹幕",
            icon: "none"
          })
        },
        J = a.ref(null),
        W = a.ref(!1),
        G = function() {
          var e = n(t().mark((function e() {
            var n;
            return t().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (a.index.setStorageSync("exitImGroup", "no"), !W.value) {
                    e.next = 5;
                    break
                  }
                  null == (n = J.value) || n.showShowList(), e.next = 8;
                  break;
                case 5:
                  return W.value = !0, e.next = 8, a.nextTick$1();
                case 8:
                case "end":
                  return e.stop()
              }
            }), e)
          })));
          return function() {
            return e.apply(this, arguments)
          }
        }(),
        R = a.ref(!1),
        U = a.ref(null),
        E = function() {
          var e = n(t().mark((function e() {
            var n;
            return t().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (0 == g.isShare) {
                    e.next = 9;
                    break
                  }
                  if (e.t0 = R.value, e.t0) {
                    e.next = 6;
                    break
                  }
                  return R.value = !0, e.next = 6, a.nextTick$1();
                case 6:
                  null == (n = U.value) || n.showShare(), e.next = 10;
                  break;
                case 9:
                  a.index.showToast({
                    title: "禁止分享",
                    icon: "none"
                  });
                case 10:
                case "end":
                  return e.stop()
              }
            }), e)
          })));
          return function() {
            return e.apply(this, arguments)
          }
        }(),
        Q = a.ref(!1),
        H = a.ref(0),
        K = a.ref(0),
        V = a.ref(""),
        X = a.ref(null),
        Y = function() {
          var e = n(t().mark((function e(n, r) {
            return t().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  return V.value = r, K.value = 1, H.value = n, Q.value || (Q.value = !0), e.next = 6, a.nextTick$1((function() {
                    var e;
                    null == (e = X.value) || e.showShowList()
                  }));
                case 6:
                case "end":
                  return e.stop()
              }
            }), e)
          })));
          return function(t, n) {
            return e.apply(this, arguments)
          }
        }(),
        Z = a.ref(!1),
        ee = a.ref(null),
        te = function(e) {
          var r, i;
          "share" == e ? (null == (r = b.value) || r.closeDomain(), E()) : "order" == e && (null == (i = b.value) || i.closeDomain(), n(t().mark((function e() {
            var n;
            return t().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = Z.value, e.t0) {
                    e.next = 5;
                    break
                  }
                  return Z.value = !0, e.next = 5, a.nextTick$1();
                case 5:
                  null == (n = ee.value) || n.showPopup();
                case 6:
                case "end":
                  return e.stop()
              }
            }), e)
          })))())
        },
        ne = a.ref(!1),
        ae = function() {
          if (1 != d.value) {
            if (1 != v.value) return 103 == k.value ? (a.index.showToast({
              title: "已结束，禁止发送弹幕",
              icon: "none"
            }), void(ne.value = !1)) : -1 !== [102, 109].indexOf(k.value) ? (a.index.showToast({
              title: "未开始，禁止发送弹幕",
              icon: "none"
            }), void(ne.value = !1)) : void(ne.value || (ne.value = !0, "vertical" == g.lookType ? z("❤️") : z("🌷"), setTimeout((function() {
              ne.value = !1
            }), 5e3)));
            a.index.showToast({
              title: "您已被禁言",
              icon: "none"
            })
          } else a.index.showToast({
            title: "开启了全员禁言",
            icon: "none"
          })
        },
        re = function() {
          "vertical" == g.lookType ? a.index.reLaunch({
            url: "/pages/live/live-vertical?live_id=" + g.liveId
          }) : "horizontal" == g.lookType && a.index.reLaunch({
            url: "/pages/live/live-horizontal?live_id=" + g.liveId
          })
        },
        ie = function() {
          y("clearScreen")
        },
        oe = a.ref(null),
        ue = a.ref(!1),
        le = function() {
          var e = n(t().mark((function e() {
            var n;
            return t().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (1 != g.isTrtc) {
                    e.next = 9;
                    break
                  }
                  if (e.t0 = ue.value, e.t0) {
                    e.next = 6;
                    break
                  }
                  return ue.value = !0, e.next = 6, a.nextTick$1();
                case 6:
                  null == (n = oe.value) || n.showApply(), e.next = 10;
                  break;
                case 9:
                  a.index.showToast({
                    title: "主播还未开启连麦",
                    icon: "none"
                  });
                case 10:
                case "end":
                  return e.stop()
              }
            }), e)
          })));
          return function() {
            return e.apply(this, arguments)
          }
        }(),
        se = a.ref(!1),
        ce = a.ref(null),
        ve = function() {
          var e = n(t().mark((function e() {
            var n;
            return t().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = se.value, e.t0) {
                    e.next = 5;
                    break
                  }
                  return se.value = !0, e.next = 5, a.nextTick$1();
                case 5:
                  null == (n = ce.value) || n.showMyList();
                case 6:
                case "end":
                  return e.stop()
              }
            }), e)
          })));
          return function() {
            return e.apply(this, arguments)
          }
        }(),
        fe = a.ref(!1),
        de = a.ref(null),
        pe = function() {
          var e = n(t().mark((function e() {
            var n;
            return t().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = fe.value, e.t0) {
                    e.next = 5;
                    break
                  }
                  return fe.value = !0, e.next = 5, a.nextTick$1();
                case 5:
                  null == (n = de.value) || n.showRecordList();
                case 6:
                case "end":
                  return e.stop()
              }
            }), e)
          })));
          return function() {
            return e.apply(this, arguments)
          }
        }(),
        he = a.ref(null),
        me = function() {
          var e = n(t().mark((function e() {
            var n;
            return t().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = he.value, e.t0) {
                    e.next = 4;
                    break
                  }
                  return e.next = 4, a.nextTick$1();
                case 4:
                  null == (n = he.value) || n.showPopup();
                case 5:
                case "end":
                  return e.stop()
              }
            }), e)
          })));
          return function() {
            return e.apply(this, arguments)
          }
        }(),
        ge = a.ref(null),
        xe = function() {
          var e = n(t().mark((function e() {
            var n;
            return t().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = ge.value, e.t0) {
                    e.next = 4;
                    break
                  }
                  return e.next = 4, a.nextTick$1();
                case 4:
                  null == (n = ge.value) || n.showPopup();
                case 5:
                case "end":
                  return e.stop()
              }
            }), e)
          })));
          return function() {
            return e.apply(this, arguments)
          }
        }();
      a.ref(null);
      var we = function() {
          1 == d.value ? a.index.showToast({
            title: "开启了全员禁言",
            icon: "none"
          }) : 1 == v.value && a.index.showToast({
            title: "您已被禁言",
            icon: "none"
          })
        },
        ke = a.ref(!1),
        ye = a.ref([]),
        Te = function() {
          c.proxy._post("live.index/getQuickPhrase", {
            live_id: g.liveId
          }, (function(e) {
            1 == e.code && (ye.value = e.data)
          }), (function(e) {}))
        };
      return u({
          showOrder: Y,
          imSendMsg: z,
          setWebWechatShare: function(t, n, a, r) {
            var i = window.location.href + "&" + c.proxy.getShareUrlParams();
            i = function(t) {
              var n = t.split("?"),
                a = e(n, 2),
                r = a[0],
                i = a[1];
              if (!i) return t;
              var o = new Map;
              return i.split("&").forEach((function(t) {
                var n = t.split("="),
                  a = e(n, 2),
                  r = a[0],
                  i = a[1],
                  u = void 0 === i ? "" : i;
                r && !o.has(r) && o.set(r, u)
              })), "".concat(r, "?").concat(Array.from(o.entries()).map((function(t) {
                var n = e(t, 2),
                  a = n[0],
                  r = n[1];
                return "".concat(a, "=").concat(r)
              })).join("&"))
            }(i), jweixin.config(JSON.parse(t)), jweixin.ready((function(e) {
              jweixin.updateAppMessageShareData({
                title: n,
                desc: a,
                link: i,
                imgUrl: r,
                success: function() {}
              }), jweixin.updateTimelineShareData({
                title: n,
                link: i,
                imgUrl: r,
                success: function() {}
              })
            }))
          }
        }),
        function(e, t) {
          return a.e({
            a: ye.value.length > 0
          }, ye.value.length > 0 ? {
            b: a.f(ye.value, (function(e, t, n) {
              return {
                a: a.t(e),
                b: t,
                c: a.o((function(t) {
                  return function(e) {
                    if (1 != d.value) {
                      if (1 != v.value) return 103 == k.value ? (a.index.showToast({
                        title: "已结束，禁止发送弹幕",
                        icon: "none"
                      }), void(ke.value = !1)) : -1 !== [102, 109].indexOf(k.value) ? (a.index.showToast({
                        title: "未开始，禁止发送弹幕",
                        icon: "none"
                      }), void(ke.value = !1)) : void(ke.value ? a.index.showToast({
                        title: "发言太快了，请稍等一下",
                        icon: "none"
                      }) : (ke.value = !0, z(e), setTimeout((function() {
                        ke.value = !1
                      }), 5e3)));
                      a.index.showToast({
                        title: "您已被禁言",
                        icon: "none"
                      })
                    } else a.index.showToast({
                      title: "开启了全员禁言",
                      icon: "none"
                    })
                  }(e)
                }), t)
              }
            })),
            c: a.n("vertical" == i.lookType ? "kj-item" : "kj-item-h")
          } : {}, {
            d: a.p({
              type: "more-filled",
              size: "30",
              color: "#ffffff"
            }),
            e: a.o(_, "58"),
            f: a.o(N, "44"),
            g: a.o($, "95"),
            h: 1 == v.value || 1 == d.value,
            i: a.o(we, "eb"),
            j: I.value,
            k: a.o((function(e) {
              return I.value = e.detail.value
            }), "38"),
            l: "horizontal" == i.lookType
          }, "horizontal" == i.lookType ? {
            m: e.config.pic_url + "/static/live/flower.png",
            n: a.o(ae, "db")
          } : {}, {
            o: "vertical" == i.lookType
          }, "vertical" == i.lookType ? {
            p: e.config.pic_url + "/20251219102351b50b64767.png",
            q: a.o(ae, "2f")
          } : {}, {
            r: e.config.pic_url + "/static/live/audio_video.png",
            s: a.o(le, "7b"),
            t: w.value
          }, w.value ? {
            v: e.config.pic_url + "/static/live/buybag.png",
            w: a.o(G, "95")
          } : {}, {
            x: e.config.pic_url + "/static/live/share_poster.png",
            y: a.o(E, "70"),
            z: !S.value,
            A: S.value
          }, S.value ? a.e({
            B: a.o($, "47"),
            C: a.o(L, "0f"),
            D: a.o(P, "f7"),
            E: M.value,
            F: a.o((function(e) {
              return M.value = e.detail.value
            }), "02"),
            G: 1 == i.speakPic
          }, 1 == i.speakPic ? {
            H: a.o(F, "7c"),
            I: e.config.pic_url + "/static/live/send_pic.png"
          } : {}, {
            J: a.o($, "8c"),
            K: a.s("bottom: " + O.value + "px;")
          }) : {}, {
            L: T.value
          }, T.value ? {
            M: a.sr(b, "a05f874e-1", {
              k: "domainList"
            }),
            N: a.o(te, "f2"),
            O: a.o(re, "97"),
            P: a.o(ie, "26"),
            Q: a.o(ve, "65"),
            R: a.o(pe, "20"),
            S: a.o(me, "ae"),
            T: a.o(xe, "6f"),
            U: a.p({
              "look-type": i.lookType,
              "live-id": i.liveId,
              "is-order": i.isOrder,
              "live-avatar": i.liveAvatar
            })
          } : {}, {
            V: W.value && w.value
          }, W.value && w.value ? {
            W: a.sr(J, "a05f874e-2", {
              k: "shopListSc"
            }),
            X: a.o(ve, "6a"),
            Y: a.o(Y, "02"),
            Z: a.p({
              "live-id": i.liveId,
              "is-order": i.isOrder
            })
          } : {}, {
            aa: R.value
          }, R.value ? {
            ab: a.sr(U, "a05f874e-3", {
              k: "shareLiveSc"
            }),
            ac: a.p({
              "live-id": i.liveId
            })
          } : {}, {
            ad: Q.value
          }, Q.value ? {
            ae: a.sr(X, "a05f874e-4", {
              k: "orderSc"
            }),
            af: a.p({
              product_id_n: H.value,
              product_num_n: K.value,
              product_sku_id_n: V.value,
              "live-id": i.liveId
            })
          } : {}, {
            ag: se.value
          }, se.value ? {
            ah: a.sr(ce, "a05f874e-5", {
              k: "myOrderSc"
            })
          } : {}, {
            ai: ue.value
          }, ue.value ? {
            aj: a.sr(oe, "a05f874e-6", {
              k: "trtcSc"
            }),
            ak: a.o(x, "90"),
            al: a.p({
              is_trtc_go: C.value,
              "live-id": i.liveId,
              "live-avatar": i.liveAvatar
            })
          } : {}, {
            am: fe.value
          }, fe.value ? {
            an: a.sr(de, "a05f874e-7", {
              k: "inviteRecordSc"
            }),
            ao: a.p({
              "live-id": i.liveId
            })
          } : {}, {
            ap: a.sr(he, "a05f874e-8", {
              k: "withdrawSc"
            }),
            aq: a.sr(ge, "a05f874e-9", {
              k: "welfarePackageSc"
            })
          })
        }
    }
  },
  m = a._export_sfc(h, [
    ["__scopeId", "data-v-a05f874e"]
  ]);
wx.createComponent(m);