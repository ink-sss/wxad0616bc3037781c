var e = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../../../@babel/runtime/helpers/asyncToGenerator"),
  n = require("../../../common/vendor.js");
Math || (t + u)();
var t = function() {
    return "./vest-list.js"
  },
  u = function() {
    return "./viewer-list.js"
  },
  i = {
    __name: "manager-permission",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      }
    },
    setup: function(t, u) {
      var i = u.expose,
        o = n.getCurrentInstance();
      getApp();
      var a = t,
        s = n.ref(0);
      n.provide("assistant", n.computed((function() {
        return s.value
      }))), n.onMounted((function() {
        o.proxy._post("live.roomNew/getUserAssistant", {
          room_id: a.liveId
        }, (function(e) {
          1 == e.code && (s.value = e.data)
        }))
      }));
      var c = n.ref(!1),
        v = n.ref(null),
        l = n.ref(null),
        p = function(t) {
          "member" == t ? r(e().mark((function r() {
            var n;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  null == (n = l.value) || n.showPop();
                case 1:
                case "end":
                  return e.stop()
              }
            }), r)
          })))() : "vest" == t && r(e().mark((function r() {
            var t;
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  if (e.t0 = c.value, e.t0) {
                    e.next = 5;
                    break
                  }
                  return c.value = !0, e.next = 5, n.nextTick$1();
                case 5:
                  null == (t = v.value) || t.showVestList();
                case 6:
                case "end":
                  return e.stop()
              }
            }), r)
          })))()
        };
      return i({
          updateAssistant: function(e) {
            s.value = e
          }
        }),
        function(e, r) {
          return n.e({
            a: e.config.pic_url + "/20260311134222afcce7591.png",
            b: n.o((function(e) {
              return p("member")
            }), "2c"),
            c: e.config.pic_url + "/20260311134353617479787.png",
            d: n.o((function(e) {
              return p("vest")
            }), "d7"),
            e: c.value
          }, c.value ? {
            f: n.sr(v, "34d1d611-0", {
              k: "vestSc"
            }),
            g: n.p({
              "live-id": t.liveId
            })
          } : {}, {
            h: n.sr(l, "34d1d611-1", {
              k: "viewerListSc"
            }),
            i: n.p({
              roomId: t.liveId
            })
          })
        }
    }
  },
  o = n._export_sfc(i, [
    ["__scopeId", "data-v-34d1d611"]
  ]);
wx.createComponent(o);