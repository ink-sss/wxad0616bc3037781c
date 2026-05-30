var e = require("../../../common/vendor.js"),
  t = {
    __name: "input-modal",
    props: {
      visible: {
        type: Boolean,
        default: !1
      },
      title: {
        type: String,
        default: "提示"
      },
      content: {
        type: String,
        default: ""
      },
      inputType: {
        type: String,
        default: "text"
      },
      placeholder: {
        type: String,
        default: "请输入内容"
      },
      defaultValue: {
        type: [String, Number],
        default: ""
      },
      textarea: {
        type: Boolean,
        default: !1
      },
      autoHeight: {
        type: Boolean,
        default: !1
      },
      autoFocus: {
        type: Boolean,
        default: !0
      },
      showCancel: {
        type: Boolean,
        default: !0
      },
      cancelText: {
        type: String,
        default: "取消"
      },
      confirmText: {
        type: String,
        default: "确定"
      },
      confirmColor: {
        type: String,
        default: "#07C160"
      },
      maskClosable: {
        type: Boolean,
        default: !0
      }
    },
    emits: ["update:visible", "confirm", "cancel", "input"],
    setup: function(t, a) {
      var n = a.emit,
        o = t,
        u = n,
        l = e.ref(o.defaultValue);
      e.watch((function() {
        return o.defaultValue
      }), (function(e) {
        l.value = e
      })), e.watch((function() {
        return o.visible
      }), (function(e) {
        e && o.autoFocus && setTimeout((function() {}), 300)
      }));
      var i = function() {
          o.maskClosable && (u("update:visible", !1), u("cancel"))
        },
        c = function() {
          u("update:visible", !1), u("cancel")
        },
        r = function() {
          u("update:visible", !1), u("confirm", l.value)
        };
      return function(a, n) {
        return e.e({
          a: t.visible
        }, t.visible ? e.e({
          b: e.t(t.title),
          c: t.content
        }, t.content ? {
          d: e.t(t.content)
        } : {}, {
          e: !t.textarea
        }, t.textarea ? {
          k: t.placeholder,
          l: t.autoFocus,
          m: t.autoHeight,
          n: l.value,
          o: e.o((function(e) {
            return l.value = e.detail.value
          }), "a8")
        } : {
          f: t.inputType,
          g: t.placeholder,
          h: t.autoFocus,
          i: l.value,
          j: e.o((function(e) {
            return l.value = e.detail.value
          }), "5e")
        }, {
          p: t.showCancel
        }, t.showCancel ? {
          q: e.t(t.cancelText),
          r: e.o(c, "6b")
        } : {}, {
          s: e.t(t.confirmText),
          t: e.o(r, "48"),
          v: t.confirmColor,
          w: e.o((function() {}), "57"),
          x: e.o(i, "8b")
        }) : {})
      }
    }
  },
  a = e._export_sfc(t, [
    ["__scopeId", "data-v-66aabf2a"]
  ]);
wx.createComponent(a);