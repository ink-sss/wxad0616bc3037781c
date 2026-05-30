var e = require("../../../../../common/vendor.js"),
  i = {
    components: {
      mpvueCityPicker: function() {
        return "../../../../../components/mpvue-citypicker/mpvueCityPicker.js"
      },
      uniIcon: function() {
        return "../../../../../components/uni-icon/uni-icon.js"
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
        province: [],
        city: [],
        area: [],
        is_load: !1,
        is_default: !1,
        zt_is_show: !1,
        rawAddress: ""
      }
    },
    mounted: function(e) {
      this.getData()
    },
    methods: {
      maskClick: function() {
        this.closePopup(!0)
      },
      closePopup: function() {
        var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
          i = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
        this.$refs.address_add.close(), e && this.$emit("popupClose", "add", i)
      },
      showPopup: function() {
        this.$refs.address_add.open("bottom")
      },
      editpopup: function(e) {},
      getData: function() {
        var e = this;
        e._post("settings/getRegion", {}, (function(i) {
          e.province = i.data.regionData[0], e.city = i.data.regionData[1], e.area = i.data.regionData[2], e.is_load = !0
        }))
      },
      formSubmit: function(i) {
        var t = this,
          o = i.detail.value;
        return o.province_id = t.province_id, o.city_id = t.city_id, o.region_id = t.region_id, o.is_default = t.is_default ? 1 : 0, "" == o.name ? (e.index.showToast({
          title: "请输入收货人姓名",
          duration: 1e3,
          icon: "none"
        }), !1) : "" == o.phone ? (e.index.showToast({
          title: "请输入手机号码",
          duration: 1e3,
          icon: "none"
        }), !1) : 0 == o.province_id || 0 == o.city_id || 0 == o.region_id ? (e.index.showToast({
          title: "请选择完整省市区",
          duration: 1e3,
          icon: "none"
        }), !1) : "" == o.detail ? (e.index.showToast({
          title: "请输入街道小区楼牌号等",
          duration: 1e3,
          icon: "none"
        }), !1) : (console.log("调取接口"), void t._post("user.address/add", o, (function(e) {
          t.showSuccess(e.msg, (function() {
            t.closePopup(!0, !0)
          }))
        })))
      },
      formReset: function(e) {
        console.log("清空数据")
      },
      showMulLinkageThreePicker: function() {
        this.$refs.mpvueCityPicker.show()
      },
      onConfirm: function(e) {
        this.selectCity = e.label, this.province_id = e.cityCode[0], this.city_id = e.cityCode[1], this.region_id = e.cityCode[2]
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
        var n = this;
        console.log(i), console.log(t), console.log(o);
        var r = null,
          s = null,
          a = null;
        n.province.forEach((function(e, c) {
          e.label == i && (r = e.value, n.city[c].forEach((function(e, i) {
            e.label == t && (s = e.value, console.log(n.area[c][i]), n.area[c][i].forEach((function(e, i) {
              e.label == o && (a = e.value)
            })))
          })))
        })), null != r && null != s && null != a ? (n.selectCity = i + "," + t + "," + o, n.province_id = r, n.city_id = s, n.region_id = a) : (console.log(r), console.log(s), console.log(a), e.index.showToast({
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
          var n = e.match(/(所在地区)：?\s*([^:：\n]+?)(?=\s+(详细地址|$))/),
            r = "";
          if (n) {
            r = n[1];
            var s = n[2].trim();
            e = e.replace(n[0], "").trim(), this.parseArea(s, i)
          }
          var a = e.match(/(详细地址)：?\s*([^，,。.；;、\n]+)/);
          if (a && (i.detail = a[2].trim(), e = e.replace(a[0], "").trim()), e) {
            if (!i.phone) {
              var c = e.match(/1[3-9]\d{9}/);
              c && (i.phone = c[0], e = e.replace(i.phone, "").trim())
            }
            if (!i.name) {
              var d = e.match(/^[\u4e00-\u9fa5]{2,4}/);
              if (d) {
                var u = d[0];
                /[省市县区镇街道]/.test(u) || (i.name = u, e = e.replace(u, "").trim())
              }
            }
            if (e && !r) {
              this.parseArea(e, i);
              var l = [i.province, i.city, i.district].filter(Boolean).join("");
              e = e.replace(l, "").trim()
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
        var n = e.match(/([\u4e00-\u9fa5]{2,8})(区|县|镇|街道)/);
        n && (i.district = n[0], e = e.replace(n[0], "").trim())
      },
      clearRawAddress: function() {
        this.rawAddress = ""
      },
      ztIsShow: function() {
        this.zt_is_show = !this.zt_is_show
      }
    }
  };
Array || (e.resolveComponent("uni-icons") + e.resolveComponent("mpvue-city-picker") + e.resolveComponent("uni-popup"))(), Math || (function() {
  return "../../../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js"
} + function() {
  return "../../../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js"
})();
var t = e._export_sfc(i, [
  ["render", function(i, t, o, n, r, s) {
    return e.e({
      a: e.o((function(e) {
        return s.closePopup(!0)
      }), "e2"),
      b: e.p({
        type: "closeempty",
        size: "30",
        color: "#000"
      }),
      c: r.address.name,
      d: e.o((function(e) {
        return r.address.name = e.detail.value
      }), "94"),
      e: r.address.phone,
      f: e.o((function(e) {
        return r.address.phone = e.detail.value
      }), "d1"),
      g: r.selectCity,
      h: e.o((function(e) {
        return r.selectCity = e.detail.value
      }), "69"),
      i: e.o((function() {
        return s.showMulLinkageThreePicker && s.showMulLinkageThreePicker.apply(s, arguments)
      }), "85"),
      j: r.address.detail,
      k: e.o((function(e) {
        return r.address.detail = e.detail.value
      }), "63"),
      l: i.getThemeColor(),
      m: r.is_default,
      n: e.o((function(e) {
        return r.is_default = !r.is_default
      }), "54"),
      o: r.zt_is_show
    }, r.zt_is_show ? e.e({
      p: r.rawAddress,
      q: e.o((function(e) {
        return r.rawAddress = e.detail.value
      }), "50"),
      r: r.rawAddress.length > 0
    }, r.rawAddress.length > 0 ? {
      s: e.o((function() {
        return s.clearRawAddress && s.clearRawAddress.apply(s, arguments)
      }), "08"),
      t: e.o((function() {
        return s.parseAddress && s.parseAddress.apply(s, arguments)
      }), "b3")
    } : {}) : {}, {
      v: !r.zt_is_show
    }, r.zt_is_show ? {
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
      }), "c3"),
      z: e.o((function() {
        return s.chooseAddress && s.chooseAddress.apply(s, arguments)
      }), "3b"),
      A: e.o((function() {
        return s.formSubmit && s.formSubmit.apply(s, arguments)
      }), "73"),
      B: e.o((function() {
        return s.formReset && s.formReset.apply(s, arguments)
      }), "e1"),
      C: r.is_load
    }, r.is_load ? {
      D: e.sr("mpvueCityPicker", "f6dbf855-4,f6dbf855-0"),
      E: e.o(s.onConfirm, "36"),
      F: e.p({
        province: r.province,
        city: r.city,
        area: r.area,
        pickerValueDefault: r.cityPickerValueDefault
      })
    } : {}, {
      G: i.theme(),
      H: e.n(i.theme() || ""),
      I: e.sr("address_add", "f6dbf855-0"),
      J: e.o(s.maskClick, "f1"),
      K: e.o(s.editpopup, "32"),
      L: e.p({
        "is-mask-click": !1,
        type: "bottom",
        "background-color": "#fff",
        "border-radius": "10px 10px 0 0"
      })
    })
  }],
  ["__scopeId", "data-v-f6dbf855"]
]);
wx.createComponent(t);