var e = require("../../../common/vendor.js"),
  t = {
    data: function() {
      return {
        formData: {
          mobile: "",
          code: ""
        },
        is_send: !1,
        send_btn_txt: "获取验证码",
        second: 60,
        ip: ""
      }
    },
    onLoad: function() {},
    methods: {
      formSubmit: function() {
        var t = this;
        /^1(3|4|5|6|7|8|9)\d{9}$/.test(t.formData.mobile) ? "" != t.formData.code ? (e.index.showLoading({
          title: "正在提交"
        }), t._post("user.userweb/bindMobile", t.formData, (function(n) {
          e.index.showModal({
            title: "提示",
            content: n.msg,
            showCancel: !1,
            success: function() {
              t.gotoPage("/pages/user/index/index", "reLaunch")
            }
          })
        }), !1, (function() {
          e.index.hideLoading()
        }))) : e.index.showToast({
          title: "验证码不能为空！",
          duration: 2e3,
          icon: "none"
        }) : e.index.showToast({
          title: "手机有误,请重填！",
          duration: 2e3,
          icon: "none"
        })
      },
      sendCode: function() {
        var t = this;
        /^1(3|4|5|6|7|8|9)\d{9}$/.test(t.formData.mobile) ? t._post("user.userweb/sendCode", {
          mobile: t.formData.mobile
        }, (function(n) {
          1 == n.code && (e.index.showToast({
            title: "发送成功"
          }), t.is_send = !0, t.changeMsg())
        })) : e.index.showToast({
          title: "手机有误,请重填！",
          duration: 2e3,
          icon: "none"
        })
      },
      changeMsg: function() {
        this.second > 0 ? (this.send_btn_txt = this.second + "秒", this.second--, setTimeout(this.changeMsg, 1e3)) : (this.send_btn_txt = "获取验证码", this.second = 60, this.is_send = !1)
      }
    }
  },
  n = e._export_sfc(t, [
    ["render", function(t, n, o, i, s, d) {
      return {
        a: s.is_send,
        b: s.formData.mobile,
        c: e.o((function(e) {
          return s.formData.mobile = e.detail.value
        }), "73"),
        d: s.formData.code,
        e: e.o((function(e) {
          return s.formData.code = e.detail.value
        }), "9b"),
        f: e.t(s.send_btn_txt),
        g: e.o((function() {
          return d.sendCode && d.sendCode.apply(d, arguments)
        }), "5c"),
        h: s.is_send,
        i: e.o((function() {
          return d.formSubmit && d.formSubmit.apply(d, arguments)
        }), "23"),
        j: t.theme(),
        k: e.n(t.theme() || "")
      }
    }],
    ["__scopeId", "data-v-4902a772"]
  ]);
wx.createPage(n);