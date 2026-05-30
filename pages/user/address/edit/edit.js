var e = require("../../../../common/vendor.js"),
  i = {
    components: {
      mpvueCityPicker: function() {
        return "../../../../components/mpvue-citypicker/mpvueCityPicker.js"
      }
    },
    data: function() {
      return {
        cityPickerValueDefault: [0, 0, 0],
        selectCity: "选择省,市,区",
        province_id: 0,
        city_id: 0,
        region_id: 0,
        address_id: 0,
        address: {},
        region: {},
        is_load: !1,
        province: [],
        city: [],
        area: [],
        delta: 1,
        is_default: !1
      }
    },
    onLoad: function(e) {
      this.delta = e.delta, this.address_id = e.address_id
    },
    mounted: function() {
      this.getData()
    },
    methods: {
      getData: function() {
        var e = this,
          i = e.address_id;
        e._get("user.address/detail", {
          address_id: i
        }, (function(i) {
          e.address = i.data.detail, e.address_id = i.data.detail.address_id, e.province_id = i.data.detail.province_id, e.city_id = i.data.detail.city_id, e.region_id = i.data.detail.region_id, e.region = i.data.region;
          var t = "";
          e.region.forEach((function(e) {
            t += e
          })), e.selectCity = t, e.province = i.data.regionData[0], e.city = i.data.regionData[1], e.area = i.data.regionData[2], e.is_default = 1 == i.data.is_default, e.is_load = !0
        }))
      },
      formSubmit: function(i) {
        var t = this,
          a = i.detail.value;
        return a.province_id = t.province_id, a.city_id = t.city_id, a.region_id = t.region_id, a.address_id = t.address_id, a.region = t.region, a.is_default = t.is_default ? 1 : 0, "" == a.name ? (e.index.showToast({
          title: "请输入收货人姓名",
          duration: 1e3,
          icon: "none"
        }), !1) : "" == a.phone ? (e.index.showToast({
          title: "请输入手机号码",
          duration: 1e3,
          icon: "none"
        }), !1) : 0 != a.province_id && 0 != a.city_id && !a.region_id || "" != a.detail ? void t._post("user.address/edit", a, (function(i) {
          t.showSuccess(i.msg, (function() {
            console.log(t.delta), e.index.navigateBack({
              delta: 1
            })
          }))
        })) : (e.index.showToast({
          title: "请选择完整省市区",
          duration: 1e3,
          icon: "none"
        }), !1)
      },
      formReset: function(e) {
        console.log("清空数据")
      },
      showMulLinkageThreePicker: function() {
        this.$refs.mpvueCityPicker.show()
      },
      onConfirm: function(e) {
        this.region = e.label.split(","), this.selectCity = e.label, this.province_id = e.cityCode[0], this.city_id = e.cityCode[1], this.region_id = e.cityCode[2]
      }
    }
  };
Array || e.resolveComponent("mpvue-city-picker")();
var t = e._export_sfc(i, [
  ["render", function(i, t, a, d, n, o) {
    return e.e({
      a: n.address.name,
      b: e.o((function(e) {
        return n.address.name = e.detail.value
      }), "7f"),
      c: n.address.phone,
      d: e.o((function(e) {
        return n.address.phone = e.detail.value
      }), "81"),
      e: n.selectCity,
      f: e.o((function(e) {
        return n.selectCity = e.detail.value
      }), "99"),
      g: e.o((function() {
        return o.showMulLinkageThreePicker && o.showMulLinkageThreePicker.apply(o, arguments)
      }), "3d"),
      h: n.address.detail,
      i: e.o((function(e) {
        return n.address.detail = e.detail.value
      }), "e8"),
      j: i.getThemeColor(),
      k: n.is_default,
      l: e.o((function(e) {
        return n.is_default = !n.is_default
      }), "f1"),
      m: e.o((function() {
        return o.formSubmit && o.formSubmit.apply(o, arguments)
      }), "49"),
      n: e.o((function() {
        return o.formReset && o.formReset.apply(o, arguments)
      }), "25"),
      o: n.is_load
    }, n.is_load ? {
      p: e.sr("mpvueCityPicker", "dc771c92-0"),
      q: e.o(o.onConfirm, "e3"),
      r: e.p({
        province: n.province,
        city: n.city,
        area: n.area,
        pickerValueDefault: n.cityPickerValueDefault
      })
    } : {}, {
      s: i.theme(),
      t: e.n(i.theme() || "")
    })
  }],
  ["__scopeId", "data-v-dc771c92"]
]);
wx.createPage(t);