var e = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../../../@babel/runtime/helpers/asyncToGenerator"),
  u = require("../../../common/vendor.js"),
  n = require("../../../store/chat.js");
Array || u.resolveComponent("uni-popup")(), Math || (t + function() {
  return "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
})();
var t = function() {
    return "./myorder.js"
  },
  o = {
    __name: "end-topicon",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      },
      isOrder: {
        type: [Number, String],
        default: 1
      },
      isCustomerService: {
        type: [Number, String],
        default: 1
      }
    },
    setup: function(t) {
      var o = n.useChatStore(),
        a = u.ref(0),
        i = u.ref(0),
        l = u.ref(0),
        p = u.getCurrentInstance();
      getApp(), u.onMounted((function() {
        var e = p.proxy.getNavHeight();
        a.value = e.navHeight, i.value = e.statusBarHeight, l.value = e.navWidth, d()
      }));
      var c = u.ref(!1),
        v = u.ref(null),
        s = function() {
          var n = r(e().mark((function r() {
            var n;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = c.value, e.t0) {
                    e.next = 5;
                    break
                  }
                  return c.value = !0, e.next = 5, u.nextTick$1();
                case 5:
                  null == (n = v.value) || n.showMyList();
                case 6:
                case "end":
                  return e.stop()
              }
            }), r)
          })));
          return function() {
            return n.apply(this, arguments)
          }
        }(),
        f = u.ref(Object),
        d = function() {
          p.proxy._post("live.roomNew/getChatSetting", {
            app_id: o.liveInfo.app_id,
            supplier_id: o.liveInfo.shop_supplier_id
          }, (function(e) {
            1 == e.code && (f.value = e.data, o.setChatSetting(e.data))
          }))
        },
        g = function() {
          u.index.navigateTo({
            url: "/pages/webview/webview?url=" + encodeURIComponent(f.value.link)
          })
        },
        b = function() {
          u.wx$1.openCustomerServiceChat({
            extInfo: {
              url: f.value.url
            },
            corpId: f.value.corpId,
            success: function(e) {
              console.log(e)
            },
            fail: function(e) {
              console.log(e)
            }
          })
        },
        m = u.ref(null),
        y = function() {
          null == m || m.value.open()
        };
      return function(e, r) {
        return u.e({
          a: null !== f.value && 1 == t.isCustomerService
        }, null !== f.value && 1 == t.isCustomerService ? u.e({
          b: 10 == f.value.type
        }, 10 == f.value.type ? {
          c: e.config.pic_url + "/2025120412560621cbb7235.png"
        } : {}, {
          d: 20 == f.value.type && f.value.link
        }, 20 == f.value.type && f.value.link ? {
          e: e.config.pic_url + "/2025120412560621cbb7235.png",
          f: u.o(g, "06")
        } : {}, {
          g: 30 == f.value.type && f.value.url && f.value.corpId
        }, 30 == f.value.type && f.value.url && f.value.corpId ? {
          h: e.config.pic_url + "/2025120412560621cbb7235.png",
          i: u.o(b, "dd")
        } : {}, {
          j: 40 == f.value.type && f.value.pic
        }, 40 == f.value.type && f.value.pic ? {
          k: e.config.pic_url + "/2025120412560621cbb7235.png",
          l: u.o(y, "6a")
        } : {}) : {}, {
          m: 1 == t.isOrder
        }, 1 == t.isOrder ? {
          n: e.config.pic_url + "/2025120412561005b292544.png",
          o: u.o(s, "b2")
        } : {}, {
          p: c.value
        }, c.value ? {
          q: u.sr(v, "644740ee-0", {
            k: "myOrderSc"
          })
        } : {}, {
          r: null !== f.value
        }, null !== f.value ? {
          s: f.value.pic,
          t: u.sr(m, "644740ee-1", {
            k: "kefuPop"
          }),
          v: u.p({
            type: "center",
            "background-color": "#fff",
            "border-radius": "30px 30px 30px 30px"
          })
        } : {})
      }
    }
  },
  a = u._export_sfc(o, [
    ["__scopeId", "data-v-644740ee"]
  ]);
wx.createComponent(a);