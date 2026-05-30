var o = require("../../../common/vendor.js"),
  t = {
    components: {
      Popup: function() {
        return "../../../components/uni-popup.js"
      }
    },
    data: function() {
      return {
        isPopup: !1,
        type: 0,
        width: 600,
        height: 800,
        backgroundColor: "none",
        boxShadow: "none",
        form: {},
        coupon: []
      }
    },
    props: ["homepush_data"],
    created: function() {},
    mounted: function() {
      this.setData()
    },
    methods: {
      setData: function() {
        this.isPopup = !0, this.form = this.homepush_data, this.type = this.homepush_data.type, this.coupon = this.homepush_data.coupon
      },
      hidePopupFunc: function(t) {
        o.index.setStorageSync("homepush_name", this.homepush_data.name), this.isPopup = !1
      },
      jumpPage: function(o) {
        this.hidePopupFunc(), this.gotoPage("/" + o)
      },
      getCoupon: function() {
        var t = this,
          e = [];
        t.coupon.forEach((function(o) {
          e.push(o.coupon_id)
        })), t._get("user.coupon/receiveList", {
          coupon_ids: JSON.stringify(e)
        }, (function(e) {
          o.index.showToast({
            title: "领取成功",
            icon: "success",
            mask: !0,
            duration: 2e3
          }), t.hidePopupFunc()
        }))
      }
    }
  };
Array || o.resolveComponent("Popup")();
var e = o._export_sfc(t, [
  ["render", function(t, e, n, u, p, i) {
    return o.e({
      a: 1 == p.type
    }, 1 == p.type ? {
      b: p.form.file_path,
      c: o.t(p.form.title),
      d: o.t(p.form.remark),
      e: o.t(p.form.des),
      f: o.o((function(o) {
        return i.jumpPage(p.form.link.url)
      }), "a4")
    } : {}, {
      g: 2 == p.type
    }, 2 == p.type ? {
      h: p.form.file_path,
      i: o.o((function(o) {
        return i.jumpPage(p.form.link.url)
      }), "08")
    } : {}, {
      j: 3 == p.type
    }, 3 == p.type ? o.e({
      k: null != p.form.file_path && "" != p.form.file_path
    }, null != p.form.file_path && "" != p.form.file_path ? {
      l: p.form.file_path
    } : {}, {
      m: o.f(p.coupon, (function(t, e, n) {
        return {
          a: o.t(t.name),
          b: o.t(t.type),
          c: e
        }
      })),
      n: o.o((function(o) {
        return i.getCoupon()
      }), "64")
    }) : {}, {
      o: o.n(1 == p.type || 3 == p.type ? "home-push-bg" : ""),
      p: o.o((function(o) {
        return i.hidePopupFunc(!0)
      }), "00"),
      q: o.o(i.hidePopupFunc, "df"),
      r: o.p({
        show: p.isPopup,
        width: p.width,
        height: p.height,
        backgroundColor: p.backgroundColor,
        boxShadow: p.boxShadow,
        padding: 0
      })
    })
  }]
]);
wx.createComponent(e);