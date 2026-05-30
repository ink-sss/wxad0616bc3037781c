var e = require("../../../common/vendor.js"),
  t = {
    __name: "wait-countdown",
    props: {
      liveName: {
        type: String,
        default: ""
      },
      totalSeconds: {
        type: Number,
        default: 300
      }
    },
    emits: ["countdown-end"],
    setup: function(t, n) {
      var o, a = n.emit,
        r = t,
        u = e.ref(r.totalSeconds),
        l = e.computed((function() {
          var e = Math.floor(u.value / 86400);
          return e < 10 ? "0" + e : e
        })),
        c = e.computed((function() {
          var e = Math.floor(u.value % 86400 / 3600);
          return e < 10 ? "0" + e : e
        })),
        v = e.computed((function() {
          var e = Math.floor(u.value % 3600 / 60);
          return e < 10 ? "0" + e : e
        })),
        d = e.computed((function() {
          var e = Math.floor(u.value % 60);
          return e < 10 ? "0" + e : e
        }));
      return e.onMounted((function() {
          clearInterval(o), u.value = r.totalSeconds, o = setInterval((function() {
            if (u.value <= 0) return clearInterval(o), void a("countdown-end");
            u.value--
          }), 1e3)
        })), e.onBeforeMount((function() {
          clearInterval(o)
        })),
        function(n, o) {
          return {
            a: e.t(t.liveName),
            b: e.t(l.value),
            c: e.t(c.value),
            d: e.t(v.value),
            e: e.t(d.value)
          }
        }
    }
  },
  n = e._export_sfc(t, [
    ["__scopeId", "data-v-fda3e475"]
  ]);
wx.createComponent(n);