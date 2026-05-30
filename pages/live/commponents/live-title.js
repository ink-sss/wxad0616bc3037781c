var e = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  a = require("../../../@babel/runtime/helpers/asyncToGenerator"),
  t = require("../../../common/vendor.js");
Math || t.unref(n)();
var n = function() {
    return "./complaint-face.js"
  },
  r = {
    __name: "live-title",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      },
      liveType: {
        type: String,
        default: "vertical"
      },
      liveName: {
        type: String,
        default: ""
      },
      liveAvatar: {
        type: String,
        default: ""
      },
      isRedirectHome: {
        type: [Number, String],
        default: null
      }
    },
    setup: function(n, r) {
      var l = r.expose,
        u = t.ref(50),
        i = t.ref(12),
        v = t.ref(0),
        o = t.ref(0),
        c = t.getCurrentInstance(),
        s = getApp();
      t.onMounted((function() {
        var e = c.proxy.getNavHeight();
        u.value = e.navHeight > 0 ? e.navHeight : u.value, i.value = e.statusBarHeight > 0 ? e.statusBarHeight : i.value, v.value = e.navWidth, o.value = e.jnWidth
      }));
      var f = n,
        p = t.ref(1);
      t.watch((function() {
        return f.isRedirectHome
      }), (function(e, a) {
        p.value = e
      }));
      var g = t.ref(0),
        d = t.ref(0),
        h = t.ref(0),
        m = t.ref(0),
        x = t.ref(null),
        y = function() {
          var e = d.value + g.value;
          if (!e || isNaN(e)) return "-";
          for (var a = ["", "万", "亿", "万亿"], t = 0, n = Math.abs(Number(e)); n >= 1e4 && t < a.length - 1;) n /= 1e4, t++;
          var r = n % 1 == 0 ? n : n.toFixed(1).replace(/\.0$/, "");
          return e < 0 ? "-".concat(r).concat(a[t]) : "".concat(r).concat(a[t])
        },
        _ = t.ref(!1),
        b = t.ref(null),
        k = function() {
          var n = a(e().mark((function a() {
            var n;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = _.value, e.t0) {
                    e.next = 5;
                    break
                  }
                  return _.value = !0, e.next = 5, t.nextTick$1();
                case 5:
                  null == (n = b.value) || n.showComplaint();
                case 6:
                case "end":
                  return e.stop()
              }
            }), a)
          })));
          return function() {
            return n.apply(this, arguments)
          }
        }();
      return l({
          userTapZan: function() {
            var e = m.value > 0 ? m.value : 1;
            h.value += e, g.value += e
          },
          addZanNum: function() {
            x.value = setInterval((function() {
              if (h.value > 0) {
                var e = s.globalData.imChat.increaseGroupCounter({
                  groupID: s.globalData.imPrefix + f.liveId,
                  key: "like",
                  value: h.value
                });
                h.value = 0, e.then((function(e) {
                  g.value = e.data.counters.like
                })).catch((function(e) {
                  console.warn("increaseGroupCounter error:", e)
                }))
              } else s.globalData.imChat.getGroupCounters({
                groupID: s.globalData.imPrefix + f.liveId,
                keyList: ["like", "like_virtual", "virtual_digg_num_one"]
              }).then((function(e) {
                g.value = e.data.counters.like > 0 ? e.data.counters.like : 0, d.value = e.data.counters.like_virtual > 0 ? e.data.counters.like_virtual : 0, m.value = e.data.counters.virtual_digg_num_one > 0 ? e.data.counters.virtual_digg_num_one : 0
              })).catch((function(e) {
                console.warn("getGroupCounters error:", e)
              }))
            }), 1e3)
          },
          destroyInterval: function() {
            null != x.value && clearInterval(x.value)
          }
        }),
        function(e, a) {
          return t.e({
            a: "vertical" == n.liveType
          }, "vertical" == n.liveType ? {
            b: t.s("height:" + (u.value - i.value - 12) + "px;width:" + (u.value - i.value - 12) + "px;"),
            c: n.liveAvatar,
            d: t.t(n.liveName),
            e: t.t(y()),
            f: t.o((function(e) {
              return function() {
                if (0 != p.value) {
                  var e = {
                    liveId: f.liveId,
                    liveAvatar: f.liveAvatar,
                    liveType: f.liveType
                  };
                  t.index.setStorageSync("is_liveGo", e), t.index.switchTab({
                    url: "/pages/index/index"
                  }), t.wx$1.setVisualEffectOnCapture({
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
                }
              }()
            }), "c8"),
            g: e.config.pic_url + "/20260316132945a702d8862.png",
            h: t.o(k, "36"),
            i: t.s("margin-top:" + i.value + "px;height:" + (u.value - i.value) + "px;width:" + v.value + "px;")
          } : {
            j: t.t(n.liveName),
            k: t.s("margin-top:" + i.value + "px;height:" + (u.value - i.value) + "px;width:calc(100% - " + 2 * o.value + "px);line-height: " + (u.value - i.value) + "px;margin-left:" + o.value + "px;")
          }, {
            l: t.s("height:" + u.value + "px"),
            m: _.value
          }, _.value ? {
            n: t.sr(b, "3d2a2986-0", {
              k: "complaintRef"
            }),
            o: t.p({
              "live-id": n.liveId
            })
          } : {})
        }
    }
  };
wx.createComponent(r);