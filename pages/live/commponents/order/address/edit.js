var e = require("../../../../../common/vendor.js"),
  i = {
    components: {
      mpvueCityPicker: function() {
        return "../../../../../components/mpvue-citypicker/mpvueCityPicker.js"
      }
    },
    data: function() {
      return {
        cityPickerValueDefault: [0, 0, 0],
        selectCity: "选择省,市,区",
        province_id: 0,
        city_id: 0,
        region_id: 0,
        address: {},
        region: {},
        is_load: !1,
        province: [],
        city: [],
        area: [],
        is_default: !1,
        address_id: 0,
        zt_is_show: !1,
        rawAddress: ""
      }
    },
    mounted: function() {},
    methods: {
      showPopup: function(e) {
        this.address_id = e, this.getData(), this.$refs.address_edit.open("bottom")
      },
      closePopup: function() {
        var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
          i = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
        this.$refs.address_edit.close(), e && this.$emit("popupClose", i)
      },
      getData: function() {
        var e = this;
        if (console.log(e.address_id), 0 != e.address_id) {
          var i = e.address_id;
          e._get("user.address/detail", {
            address_id: i
          }, (function(i) {
            e.address = i.data.detail, e.address_id = i.data.detail.address_id, e.province_id = i.data.detail.province_id, e.city_id = i.data.detail.city_id, e.region_id = i.data.detail.region_id, e.region = i.data.region;
            var t = "";
            e.region.forEach((function(e) {
              t += e
            })), e.selectCity = t, e.province = i.data.regionData[0], e.city = i.data.regionData[1], e.area = i.data.regionData[2], e.is_default = 1 == i.data.is_default, e.is_load = !0
          }))
        }
      },
      formSubmit: function(i) {
        var t = this,
          o = i.detail.value;
        return o.province_id = t.province_id, o.city_id = t.city_id, o.region_id = t.region_id, o.address_id = t.address_id, o.region = t.region, o.is_default = t.is_default ? 1 : 0, "" == o.name ? (e.index.showToast({
          title: "请输入收货人姓名",
          duration: 1e3,
          icon: "none"
        }), !1) : "" == o.phone ? (e.index.showToast({
          title: "请输入手机号码",
          duration: 1e3,
          icon: "none"
        }), !1) : 0 != o.province_id && 0 != o.city_id && !o.region_id || "" != o.detail ? void t._post("user.address/edit", o, (function(e) {
          t.showSuccess(e.msg, (function() {
            t.closePopup(!0, !0)
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
      },
      chooseAddress: function() {
        var i = this;
        e.index.chooseAddress({
          success: function(e) {
            i.address.name = e.userName, i.address.phone = e.telNumber, i.address.detail = e.detailInfo, i.regionMatch(e.provinceName, e.cityName, e.countyName)
          }
        })
      },
      regionMatch: function(i, t, o) {
        var r = this;
        console.log(i), console.log(t), console.log(o);
        var n = null,
          s = null,
          a = null;
        r.province.forEach((function(e, d) {
          e.label == i && (n = e.value, r.city[d].forEach((function(e, i) {
            e.label == t && (s = e.value, console.log(r.area[d][i]), r.area[d][i].forEach((function(e, i) {
              e.label == o && (a = e.value)
            })))
          })))
        })), null != n && null != s && null != a ? (r.selectCity = i + "," + t + "," + o, r.province_id = n, r.city_id = s, r.region_id = a) : (console.log(n), console.log(s), console.log(a), e.index.showToast({
          title: "所在地区匹配错误，请手动选择"
        }))
      },
      parseAddress: function() {
        if (this.rawAddress.trim()) {
          var e = this.rawAddress.trim().replace(/[:：]/g, "：").replace(/\n+/g, " ").replace(/\s+/g, " ").replace(/[，,。.；;、]/g, " "),
            i = {
              name: "",
              phone: "",
              province: "",
              city: "",
              district: "",
              detail: ""
            },
            t = e.match(/(收货人|收件人)：?\s*([\u4e00-\u9fa5]{2,4})/);
          t && (i.name = t[2], e = e.replace(t[0], "").trim());
          var o = e.match(/(手机号|手机号码)：?\s*(1[3-9]\d{9})/);
          o && (i.phone = o[2], e = e.replace(o[0], "").trim()), console.log(e);
          var r = e.match(/(所在地区)：?\s*([^:：\n]+?)(?=\s+(详细地址|$))/),
            n = "";
          if (r) {
            n = r[1];
            var s = r[2].trim();
            e = e.replace(r[0], "").trim(), this.parseArea(s, i)
          }
          var a = e.match(/(详细地址)：?\s*([^，,。.；;、\n]+)/);
          if (a && (i.detail = a[2].trim(), e = e.replace(a[0], "").trim()), e) {
            if (!i.phone) {
              var d = e.match(/1[3-9]\d{9}/);
              d && (i.phone = d[0], e = e.replace(i.phone, "").trim())
            }
            if (!i.name) {
              var c = e.match(/^[\u4e00-\u9fa5]{2,4}/);
              if (c) {
                var l = c[0];
                /[省市县区镇街道]/.test(l) || (i.name = l, e = e.replace(l, "").trim())
              }
            }
            if (e && !n) {
              this.parseArea(e, i);
              var u = [i.province, i.city, i.district].filter(Boolean).join("");
              e = e.replace(u, "").trim()
            }
            i.detail = i.detail ? "".concat(i.detail, " ").concat(e).trim() : e
          }
          this.address.name = i.name, this.address.phone = i.phone, this.address.detail = i.detail, this.regionMatch(i.province, i.city, i.district)
        }
      },
      parseArea: function(e, i) {
        var t = e.match(/(北京|上海|天津|重庆|河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|台湾|内蒙古|广西|宁夏|新疆|西藏)(省|自治区)?/);
        t && (i.province = t[0], e = e.replace(t[0], "").trim());
        var o = e.match(/([\u4e00-\u9fa5]{2,5})(市|自治州|地区)/);
        o && (i.city = o[0], e = e.replace(o[0], "").trim());
        var r = e.match(/([\u4e00-\u9fa5]{2,8})(区|县|镇|街道)/);
        r && (i.district = r[0], e = e.replace(r[0], "").trim())
      },
      clearRawAddress: function() {
        this.rawAddress = ""
      },
      ztIsShow: function() {
        this.zt_is_show = !this.zt_is_show
      }
    }
  };
Array || (e.resolveComponent("uni-icon") + e.resolveComponent("uni-icons") + e.resolveComponent("mpvue-city-picker") + e.resolveComponent("uni-popup"))(), Math || (function() {
  return "../../../../../components/uni-icon/uni-icon.js"
} + function() {
  return "../../../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js"
} + function() {
  return "../../../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
})();
var t = e._export_sfc(i, [
  ["render", function(i, t, o, r, n, s) {
    return e.e({
      a: e.o((function(e) {
        return s.closePopup(!0)
      }), "4c"),
      b: e.p({
        type: "closeempty",
        size: "30",
        color: "#000"
      }),
      c: n.address.name,
      d: e.o((function(e) {
        return n.address.name = e.detail.value
      }), "55"),
      e: n.address.phone,
      f: e.o((function(e) {
        return n.address.phone = e.detail.value
      }), "cc"),
      g: n.selectCity,
      h: e.o((function(e) {
        return n.selectCity = e.detail.value
      }), "41"),
      i: e.o((function() {
        return s.showMulLinkageThreePicker && s.showMulLinkageThreePicker.apply(s, arguments)
      }), "3b"),
      j: n.address.detail,
      k: e.o((function(e) {
        return n.address.detail = e.detail.value
      }), "79"),
      l: i.getThemeColor(),
      m: n.is_default,
      n: e.o((function(e) {
        return n.is_default = !n.is_default
      }), "8a"),
      o: n.zt_is_show
    }, n.zt_is_show ? e.e({
      p: n.rawAddress,
      q: e.o((function(e) {
        return n.rawAddress = e.detail.value
      }), "b7"),
      r: n.rawAddress.length > 0
    }, n.rawAddress.length > 0 ? {
      s: e.o((function() {
        return s.clearRawAddress && s.clearRawAddress.apply(s, arguments)
      }), "ec"),
      t: e.o((function() {
        return s.parseAddress && s.parseAddress.apply(s, arguments)
      }), "38")
    } : {}) : {}, {
      v: !n.zt_is_show
    }, n.zt_is_show ? {
      x: e.p({
        type: "up",
        size: "15"
      })
    } : {
      w: e.p({
        type: "down",
        size: "15"
      })
    }, {
      y: e.o((function() {
        return s.ztIsShow && s.ztIsShow.apply(s, arguments)
      }), "f2"),
      z: e.o((function() {
        return s.chooseAddress && s.chooseAddress.apply(s, arguments)
      }), "62"),
      A: e.o((function() {
        return s.formSubmit && s.formSubmit.apply(s, arguments)
      }), "51"),
      B: e.o((function() {
        return s.formReset && s.formReset.apply(s, arguments)
      }), "d0"),
      C: n.is_load
    }, n.is_load ? {
      D: e.sr("mpvueCityPicker", "ee44d72b-4,ee44d72b-0"),
      E: e.o(s.onConfirm, "17"),
      F: e.p({
        province: n.province,
        city: n.city,
        area: n.area,
        pickerValueDefault: n.cityPickerValueDefault
      })
    } : {}, {
      G: i.theme(),
      H: e.n(i.theme() || ""),
      I: e.sr("address_edit", "ee44d72b-0"),
      J: e.p({
        "is-mask-click": !1,
        type: "bottom",
        "background-color": "#f6f6f6",
        "border-radius": "10px 10px 0 0"
      })
    })
  }],
  ["__scopeId", "data-v-ee44d72b"]
]);
wx.createComponent(t);