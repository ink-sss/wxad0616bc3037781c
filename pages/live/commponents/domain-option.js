var e = require("../../../common/vendor.js"),
  n = require("../../../store/chat.js");
Array || e.resolveComponent("uni-popup")(), Math;
var o = {
    __name: "domain-option",
    props: {
      liveAvatar: {
        type: String,
        default: ""
      },
      lookType: {
        type: String,
        default: "vertical"
      },
      liveId: {
        type: [Number, String],
        default: ""
      },
      isOrder: {
        type: [Number, String],
        default: 1
      }
    },
    emits: ["optionShow", "refreshCache", "clearScreen", "openMyOrder", "openinviteRecord", "openWithdraw", "openWelfarePackage"],
    setup: function(o, r) {
      var i = r.expose,
        u = r.emit,
        t = n.useChatStore();
      getApp();
      var l = e.getCurrentInstance();
      e.onMounted((function() {
        p(), g()
      }));
      var a = o,
        c = e.ref(null),
        p = function() {
          var e;
          null == (e = c.value) || e.open("bottom")
        },
        f = function() {
          var e;
          null == (e = c.value) || e.close()
        },
        s = e.ref(!1),
        v = function(n) {
          if (f(), "order" == n) m("openMyOrder");
          else if ("share" == n) m("optionShow", n);
          else if ("refresh" == n) m("refreshCache");
          else if ("clear" == n) s.value = !s.value, m("clearScreen", "clear", s.value);
          else if ("usercenter" == n) {
            var o = {
              liveId: a.liveId,
              liveAvatar: a.liveAvatar,
              liveType: a.lookType
            };
            e.index.setStorageSync("is_liveGo", o), e.index.switchTab({
              url: "/pages/user/index/index"
            }), e.wx$1.setVisualEffectOnCapture({
              visualEffect: "none",
              success: function(e) {
                console.log(e, "成功")
              },
              fail: function(e) {
                console.log(e, "失败")
              },
              complete: function(e) {
                console.log(e, "complete")
              }
            })
          } else "welfarePackage" == n ? m("openWelfarePackage") : "points" == n ? e.index.navigateTo({
            url: "/pagesPlus/points/list/list"
          }) : "coupons" == n ? e.index.navigateTo({
            url: "/pages/coupon/coupon"
          }) : "signin" == n ? e.index.navigateTo({
            url: "/pagesPlus/signin/signin"
          }) : "inviteRecord" == n ? m("openinviteRecord") : "withdraw" == n && m("openWithdraw")
        },
        d = e.ref(Object),
        g = function() {
          l.proxy._post("live.roomNew/getChatSetting", {
            app_id: t.liveInfo.app_id,
            supplier_id: t.liveInfo.shop_supplier_id
          }, (function(e) {
            1 == e.code && (d.value = e.data, t.setChatSetting(e.data))
          }))
        },
        _ = function() {
          f()
        },
        y = function() {
          f(), e.index.navigateTo({
            url: "/pages/webview/webview?url=" + encodeURIComponent(d.value.link)
          })
        },
        x = function() {
          e.wx$1.openCustomerServiceChat({
            extInfo: {
              url: d.value.url
            },
            corpId: d.value.corpId,
            success: function(e) {
              f()
            },
            fail: function(e) {
              console.log(e)
            }
          })
        },
        b = e.ref(null),
        h = function() {
          f(), null == b || b.value.open()
        },
        m = u;
      i({
        showDomain: p,
        closeDomain: f
      });
      var w = e.ref(null),
        k = function() {
          null == w || w.value.open()
        };
      return function(n, r) {
        return e.e({
          a: n.config.pic_url + "/20260104134919981787552.png",
          b: e.o((function(e) {
            return v("points")
          }), "fb"),
          c: n.config.pic_url + "/20260104132711c5ae54026.png",
          d: e.o((function(e) {
            return v("coupons")
          }), "c1"),
          e: n.config.pic_url + "/20260104132711288918080.png",
          f: e.o((function(e) {
            return v("signin")
          }), "b2"),
          g: e.n(s.value ? "option-pic-sel" : ""),
          h: n.config.pic_url + "/202601041327112add65252.png",
          i: e.n(s.value ? "option-pic-sel" : "tt"),
          j: e.o((function(e) {
            return v("clear")
          }), "b7"),
          k: 1 == o.isOrder
        }, 1 == o.isOrder ? {
          l: n.config.pic_url + "/20260104132711ecab73997.png",
          m: e.o((function(e) {
            return v("order")
          }), "10")
        } : {}, {
          n: n.config.pic_url + "/20260126103809bc3b89006.png",
          o: e.o((function(e) {
            return v("inviteRecord")
          }), "87"),
          p: n.config.pic_url + "/txgky.png",
          q: e.o((function(e) {
            return v("withdraw")
          }), "b1"),
          r: null !== d.value
        }, null !== d.value ? e.e({
          s: 10 == d.value.type
        }, 10 == d.value.type ? {
          t: n.config.pic_url + "/20260104132711d18085709.png",
          v: e.o(_, "f2")
        } : {}, {
          w: 20 == d.value.type && d.value.link
        }, 20 == d.value.type && d.value.link ? {
          x: n.config.pic_url + "/20260104132711d18085709.png",
          y: e.o(y, "f9")
        } : {}, {
          z: 30 == d.value.type && d.value.url && d.value.corpId
        }, 30 == d.value.type && d.value.url && d.value.corpId ? {
          A: n.config.pic_url + "/20260104132711d18085709.png",
          B: e.o(x, "a7")
        } : {}, {
          C: 40 == d.value.type && d.value.pic
        }, 40 == d.value.type && d.value.pic ? {
          D: n.config.pic_url + "/20260104132711d18085709.png",
          E: e.o(h, "0e")
        } : {}) : {}, {
          F: n.config.pic_url + "/20260104132711396202686.png",
          G: e.o((function(e) {
            return v("usercenter")
          }), "a8"),
          H: n.config.pic_url + "/flqbgky.png",
          I: e.o((function(e) {
            return v("welfarePackage")
          }), "dc"),
          J: e.o(k, "3d"),
          K: e.sr(c, "73e3e6f4-0", {
            k: "domainOption"
          }),
          L: e.p({
            type: "bottom",
            "background-color": "#fff",
            "border-radius": "30px 30px 0 0"
          }),
          M: n.config.pic_url + "/20260317110108258859424.png",
          N: e.sr(w, "73e3e6f4-1", {
            k: "ITSupport"
          }),
          O: e.p({
            type: "center",
            "background-color": "#fff",
            "border-radius": "30rpx"
          }),
          P: null !== d.value
        }, null !== d.value ? {
          Q: d.value.pic,
          R: e.sr(b, "73e3e6f4-2", {
            k: "kefuPop"
          }),
          S: e.p({
            type: "center",
            "background-color": "#fff",
            "border-radius": "30px 30px 30px 30px"
          })
        } : {})
      }
    }
  },
  r = e._export_sfc(o, [
    ["__scopeId", "data-v-73e3e6f4"]
  ]);
wx.createComponent(r);