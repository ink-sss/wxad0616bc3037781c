var e = require("../common/vendor.js"),
  o = e._export_sfc({
    data: function() {
      return {
        Visible: !1,
        poster_img: ""
      }
    },
    props: ["isguarantee", "server"],
    watch: {
      isguarantee: function(e, o) {
        e != o && (this.Visible = e)
      }
    },
    methods: {
      closePopup: function(e) {
        this.$emit("close", {
          type: e,
          poster_img: this.poster_img
        })
      }
    }
  }, [
    ["render", function(o, t, n, r, s, i) {
      return {
        a: e.o((function() {
          return i.closePopup && i.closePopup.apply(i, arguments)
        }), "77"),
        b: e.f(n.server, (function(o, t, n) {
          return {
            a: e.t(o.name),
            b: e.t(o.describe),
            c: t
          }
        })),
        c: e.o((function() {}), "fd"),
        d: e.n(s.Visible ? "bottom-panel open" : "bottom-panel close"),
        e: e.o((function() {
          return i.closePopup && i.closePopup.apply(i, arguments)
        }), "64")
      }
    }]
  ]);
wx.createComponent(o);