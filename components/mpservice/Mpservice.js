var o = require("../../common/vendor.js"),
  e = require("../../common/assets.js"),
  t = {
    components: {
      Popup: function() {
        return "../uni-popup.js"
      }
    },
    data: function() {
      return {
        isPopup: !1,
        isloding: !0,
        width: 600,
        dataModel: {
          qq: "",
          wechat: "",
          phone: ""
        }
      }
    },
    props: ["shopSupplierId"],
    created: function() {
      this.isPopup = !0, this.getData()
    },
    methods: {
      getData: function() {
        var o = this;
        o.isloding = !0, o._get("index/mpService", {
          shop_supplier_id: o.shopSupplierId
        }, (function(e) {
          o.dataModel = e.data.mp_service, o.isloding = !1
        }))
      },
      hidePopupFunc: function(o) {
        this.isPopup = !1, this.$emit("close")
      },
      copyQQ: function(e) {
        o.index.setClipboardData({
          data: e,
          success: function(e) {
            o.index.showToast({
              title: "复制成功",
              icon: "success",
              mask: !0,
              duration: 2e3
            })
          }
        })
      },
      callPhone: function(e) {
        o.index.makePhoneCall({
          phoneNumber: e
        })
      }
    }
  };
Array || o.resolveComponent("Popup")();
var a = o._export_sfc(t, [
  ["render", function(t, a, d, n, i, p) {
    return o.e({
      a: o.o((function(o) {
        return p.hidePopupFunc(!0)
      }), "15"),
      b: !i.isloding
    }, i.isloding ? {} : o.e({
      c: null == i.dataModel || "" == i.dataModel.qq && "" == i.dataModel.wechat && "" == i.dataModel.phone
    }, (null == i.dataModel || "" == i.dataModel.qq && "" == i.dataModel.wechat && i.dataModel.phone, {}), {
      d: null != i.dataModel
    }, null != i.dataModel ? o.e({
      e: "" != i.dataModel.qq
    }, "" != i.dataModel.qq ? {
      f: e._imports_0$4,
      g: o.t(i.dataModel.qq),
      h: o.o((function(o) {
        return p.copyQQ(i.dataModel.qq)
      }), "5e")
    } : {}, {
      i: "" != i.dataModel.wechat
    }, "" != i.dataModel.wechat ? {
      j: e._imports_1$3,
      k: o.t(i.dataModel.wechat),
      l: o.o((function(o) {
        return p.copyQQ(i.dataModel.qq)
      }), "e6")
    } : {}, {
      m: "" != i.dataModel.phone
    }, "" != i.dataModel.phone ? {
      n: e._imports_2$1,
      o: o.t(i.dataModel.phone),
      p: o.o((function(o) {
        return p.callPhone(i.dataModel.phone)
      }), "b4")
    } : {}) : {}), {
      q: o.o(p.hidePopupFunc, "46"),
      r: o.p({
        show: i.isPopup,
        width: i.width,
        padding: 0
      })
    })
  }]
]);
wx.createComponent(a);