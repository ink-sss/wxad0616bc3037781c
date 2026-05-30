var n = require("../../../../common/vendor.js"),
  o = require("../../../../common/assets.js"),
  e = n._export_sfc({
    components: {
      uniLoadMore: function() {
        return "../../../../components/uni-load-more.js"
      }
    },
    data: function() {
      return {
        input_len: 6,
        Visible: !1,
        value: "",
        is_send: !1
      }
    },
    props: ["isPop", "discount_ratio"],
    watch: {
      isPop: function(n, o) {
        n != o && (this.Visible = n)
      }
    },
    methods: {
      submit: function() {
        var n = this;
        n.is_send || (n.is_send = !0, n.page, n.list_rows, n._get("user.User/transPoints", {
          points: n.value
        }, (function(o) {
          n.is_send = !1, n.showSuccess(o.msg, (function() {
            n.closePop(!0)
          }))
        }), (function(o) {
          n.is_send = !1
        })))
      },
      closePop: function(n) {
        this.$emit("close", n), this.value = ""
      }
    }
  }, [
    ["render", function(e, t, s, i, u, r) {
      return {
        a: n.t(e.points_name()),
        b: "请输入兑换" + e.points_name() + "值",
        c: u.value,
        d: n.o((function(n) {
          return u.value = n.detail.value
        }), "1d"),
        e: o._imports_0$18,
        f: n.o((function(n) {
          return u.value = ""
        }), "27"),
        g: n.t(e.points_name()),
        h: n.t(s.discount_ratio),
        i: n.o((function(n) {
          return r.submit()
        }), "8f"),
        j: n.o((function(n) {
          return r.closePop(null)
        }), "76"),
        k: n.o((function() {}), "0d"),
        l: n.n(u.Visible ? "pop-bg open" : "pop-bg close"),
        m: n.o((function(n) {
          return r.closePop(null)
        }), "94")
      }
    }]
  ]);
wx.createComponent(e);