var e = require("../../../common/vendor.js");
Array || e.resolveComponent("uni-popup")(), Math;
var t = {
  __name: "trtc-apply",
  props: {
    liveId: {
      type: [Number, String],
      default: ""
    },
    liveAvatar: {
      type: String,
      default: ""
    },
    is_trtc_go: {
      type: Boolean,
      default: !1
    }
  },
  emits: ["closeTrtc"],
  setup: function(t, o) {
    var n = o.expose,
      a = o.emit,
      l = e.getCurrentInstance();
    e.onMounted((function() {
      f()
    }));
    var u = a,
      r = t,
      v = e.ref(!1);
    e.watch((function() {
      return r.is_trtc_go
    }), (function(e, t) {
      v.value = e
    }));
    var i = e.ref(null),
      c = e.ref(1),
      p = e.ref(""),
      f = function() {
        var e;
        null == (e = i.value) || e.open("bottom"), l.proxy._post("live.trtc/applyTrtc", {
          live_id: r.liveId
        }, (function(e) {
          c.value = e.data.type, p.value = e.data.my_avatar
        }), (function(e) {}))
      },
      s = function() {
        u("closeTrtc")
      },
      d = e.ref(!1),
      y = function() {
        d.value || (d.value = !0, l.proxy._post("live.trtc/applyGo", {
          live_id: r.liveId
        }, (function(t) {
          var o;
          e.index.showToast({
            title: t.msg,
            icon: "none"
          }), d.value = !1, 1 == t.code && (null == (o = i.value) || o.close())
        }), (function(e) {})))
      },
      m = function() {
        l.proxy._post("live.trtc/applyCancel", {
          live_id: r.liveId
        }, (function(t) {
          var o;
          e.index.showToast({
            title: t.msg,
            icon: "none"
          }), 1 == t.code && (null == (o = i.value) || o.close())
        }), (function(e) {}))
      };
    return n({
        showApply: f
      }),
      function(o, n) {
        return e.e({
          a: 0 == c.value
        }, (0 == c.value || 1 == c.value || c.value, {}), {
          b: 1 == c.value,
          c: 3 == c.value,
          d: p.value,
          e: t.liveAvatar,
          f: !v.value
        }, v.value ? {
          l: e.o(s, "66")
        } : e.e({
          g: 1 == c.value
        }, 1 == c.value ? {
          h: e.o(y, "2b")
        } : 0 == c.value ? {
          j: e.o(m, "73")
        } : (c.value, {}), {
          i: 0 == c.value,
          k: 3 == c.value
        }), {
          m: e.sr(i, "a2db9550-0", {
            k: "trtcApply"
          }),
          n: e.p({
            type: "bottom",
            "background-color": "#fff",
            "border-radius": "30px 30px 0 0"
          })
        })
      }
  }
};
wx.createComponent(t);