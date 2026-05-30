var t = require("../../../../../common/vendor.js");
require("../../../../../env/config.js");
var e = require("../../../../../common/assets.js"),
  i = {
    components: {
      addressEdit: function() {
        return "./edit.js"
      }
    },
    data: function() {
      return {
        loadding: !0,
        indicatorDots: !0,
        autoplay: !0,
        interval: 2e3,
        duration: 500,
        listData: [],
        default_id: "0",
        edit_address_id: 0,
        edit_pop: !1
      }
    },
    mounted: function() {},
    methods: {
      maskClick: function() {
        this.closePopup(!0)
      },
      popupCloseEdit: function() {
        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
        this.edit_pop = !1, t && (this.showGetData(), this.$emit("refreshData"))
      },
      showPopup: function() {
        this.showGetData(), this.$refs.address_list.open("bottom")
      },
      closePopup: function() {
        var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
          e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
        return this.edit_pop ? (this.$refs.addressEditPop.closePopup(), this.edit_pop = !1, "list") : (this.$refs.address_list.close(), t && this.$emit("popupClose", "list", e), "")
      },
      showGetData: function() {
        t.index.showLoading({
          title: "加载中"
        }), this.getData()
      },
      getData: function() {
        var e = this;
        e.dataType, e._get("user.address/lists", {}, (function(i) {
          e.listData = i.data.list, e.default_id = i.data.default_id + "", e.loadding = !1, t.index.hideLoading()
        }))
      },
      addAddress: function() {
        this.$emit("addNewAddress")
      },
      radioChange: function(t) {
        var e = this;
        return e.default_id = t, e._post("user.address/setDefault", {
          address_id: t
        }, (function(t) {
          e.closePopup(!0, !0)
        })), !1
      },
      editAddress: function(t) {
        this.$refs.addressEditPop.showPopup(t), this.edit_pop = !0
      },
      delAddress: function(e) {
        var i = this;
        t.wx$1.showModal({
          title: "提示",
          content: "您确定要移除当前收货地址吗?",
          success: function(s) {
            s.confirm && i._get("user.address/delete", {
              address_id: e
            }, (function(e) {
              1 == e.code && (t.index.showToast({
                title: "删除成功",
                duration: 2e3
              }), i.getData())
            }))
          }
        })
      }
    }
  };
Array || (t.resolveComponent("uni-icon") + t.resolveComponent("address-edit") + t.resolveComponent("uni-popup"))(), Math || (function() {
  return "../../../../../components/uni-icon/uni-icon.js"
} + function() {
  return "../../../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
})();
var s = t._export_sfc(i, [
  ["render", function(i, s, o, d, n, r) {
    return t.e({
      a: !n.loadding
    }, n.loadding ? {} : t.e({
      b: t.o((function(t) {
        return r.closePopup(!0)
      }), "19"),
      c: t.p({
        type: "closeempty",
        size: "30",
        color: "#000"
      }),
      d: n.listData.length > 0
    }, n.listData.length > 0 ? {
      e: t.f(n.listData, (function(e, i, s) {
        return {
          a: t.t(e.name),
          b: t.t(e.phone),
          c: t.t(e.region.province),
          d: t.t(e.region.city),
          e: t.t(e.region.region),
          f: t.t(e.detail),
          g: t.o((function(t) {
            return r.radioChange(e.address_id)
          }), i),
          h: e.address_id + "",
          i: n.default_id == e.address_id + "",
          j: t.o((function(t) {
            return r.radioChange(e.address_id)
          }), i),
          k: t.o((function(t) {
            return r.editAddress(e.address_id)
          }), i),
          l: t.o((function(t) {
            return r.delAddress(e.address_id)
          }), i),
          m: i
        }
      })),
      f: i.getThemeColor(),
      g: e._imports_0$1,
      h: e._imports_1$1
    } : {
      i: i.config.pic_url + "/static/list-null.png"
    }, {
      j: t.o((function(t) {
        return r.addAddress()
      }), "d0"),
      k: i.theme(),
      l: t.n(i.theme() || "")
    }), {
      m: t.sr("addressEditPop", "2ef240b3-2,2ef240b3-0"),
      n: t.o(r.popupCloseEdit, "22"),
      o: t.p({
        address_id: n.edit_address_id
      }),
      p: t.sr("address_list", "2ef240b3-0"),
      q: t.o(r.maskClick, "f1"),
      r: t.p({
        "is-mask-click": !1,
        type: "bottom",
        "background-color": "#f6f6f6",
        "border-radius": "10px 10px 0 0"
      })
    })
  }],
  ["__scopeId", "data-v-2ef240b3"]
]);
wx.createComponent(s);