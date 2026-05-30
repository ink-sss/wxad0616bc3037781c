var e = require("../../../../common/vendor.js"),
  t = {
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
        address: {},
        delta: 1,
        province: [],
        city: [],
        area: [],
        is_load: !1,
        is_default: !1,
        zt_is_show: !1,
        rawAddress: ""
      }
    },
    onLoad: function(e) {
      this.delta = e.delta, this.getData()
    },
    methods: {
      clearRawAddress: function() {
        this.rawAddress = ""
      },
      ztIsShow: function() {
        this.zt_is_show = !this.zt_is_show
      },
      chooseAddress: function() {
        var t = this;
        e.index.chooseAddress({
          success: function(e) {
            t.address.name = e.userName, t.address.phone = e.telNumber, t.address.detail = e.detailInfo, t.regionMatch(e.provinceName, e.cityName, e.countyName)
          }
        })
      },
      regionMatch: function(t, i, a) {
        var r = this;
        console.log(t), console.log(i), console.log(a);
        var o = null,
          n = null,
          s = null;
        r.province.forEach((function(e, c) {
          e.label == t && (o = e.value, r.city[c].forEach((function(e, t) {
            e.label == i && (n = e.value, console.log(r.area[c][t]), r.area[c][t].forEach((function(e, t) {
              e.label == a && (s = e.value)
            })))
          })))
        })), null != o && null != n && null != s ? (r.selectCity = t + "," + i + "," + a, r.province_id = o, r.city_id = n, r.region_id = s) : (console.log(o), console.log(n), console.log(s), e.index.showToast({
          title: "所在地区匹配错误，请手动选择"
        }))
      },
      parseAddress: function() {
        if (this.rawAddress.trim()) {
          var e = this.rawAddress.trim().replace(/[:：]/g, "：").replace(/\n+/g, " ").replace(/\s+/g, " ").replace(/[，,。.；;、]/g, " "),
            t = {
              name: "",
              phone: "",
              province: "",
              city: "",
              district: "",
              detail: ""
            },
            i = e.match(/(收货人|收件人)：?\s*([\u4e00-\u9fa5]{2,4})/);
          i && (t.name = i[2], e = e.replace(i[0], "").trim());
          var a = e.match(/(手机号|手机号码)：?\s*(1[3-9]\d{9})/);
          a && (t.phone = a[2], e = e.replace(a[0], "").trim()), console.log(e);
          var r = e.match(/(所在地区)：?\s*([^:：\n]+?)(?=\s+(详细地址|$))/),
            o = "";
          if (r) {
            o = r[1];
            var n = r[2].trim();
            e = e.replace(r[0], "").trim(), this.parseArea(n, t)
          }
          var s = e.match(/(详细地址)：?\s*([^，,。.；;、\n]+)/);
          if (s && (t.detail = s[2].trim(), e = e.replace(s[0], "").trim()), e) {
            if (!t.phone) {
              var c = e.match(/1[3-9]\d{9}/);
              c && (t.phone = c[0], e = e.replace(t.phone, "").trim())
            }
            if (!t.name) {
              var d = e.match(/^[\u4e00-\u9fa5]{2,4}/);
              if (d) {
                var l = d[0];
                /[省市县区镇街道]/.test(l) || (t.name = l, e = e.replace(l, "").trim())
              }
            }
            if (e && !o) {
              this.parseArea(e, t);
              var u = [t.province, t.city, t.district].filter(Boolean).join("");
              e = e.replace(u, "").trim()
            }
            t.detail = t.detail ? "".concat(t.detail, " ").concat(e).trim() : e
          }
          this.address.name = t.name, this.address.phone = t.phone, this.address.detail = t.detail, this.regionMatch(t.province, t.city, t.district)
        }
      },
      parseArea: function(e, t) {
        var i = e.match(/(北京|上海|天津|重庆|河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|台湾|内蒙古|广西|宁夏|新疆|西藏)(省|自治区)?/);
        i && (t.province = i[0], e = e.replace(i[0], "").trim());
        var a = e.match(/([\u4e00-\u9fa5]{2,5})(市|自治州|地区)/);
        a && (t.city = a[0], e = e.replace(a[0], "").trim());
        var r = e.match(/([\u4e00-\u9fa5]{2,8})(区|县|镇|街道)/);
        r && (t.district = r[0], e = e.replace(r[0], "").trim())
      },
      getData: function() {
        var e = this;
        e._post("settings/getRegion", {}, (function(t) {
          e.province = t.data.regionData[0], e.city = t.data.regionData[1], e.area = t.data.regionData[2], e.is_load = !0
        }))
      },
      formSubmit: function(t) {
        var i = this,
          a = t.detail.value;
        return a.province_id = i.province_id, a.city_id = i.city_id, a.region_id = i.region_id, a.is_default = i.is_default ? 1 : 0, "" == a.name ? (e.index.showToast({
          title: "请输入收货人姓名",
          duration: 1e3,
          icon: "none"
        }), !1) : "" == a.phone ? (e.index.showToast({
          title: "请输入手机号码",
          duration: 1e3,
          icon: "none"
        }), !1) : 0 == a.province_id || 0 == a.city_id || 0 == a.region_id ? (e.index.showToast({
          title: "请选择完整省市区",
          duration: 1e3,
          icon: "none"
        }), !1) : "" == a.detail ? (e.index.showToast({
          title: "请输入街道小区楼牌号等",
          duration: 1e3,
          icon: "none"
        }), !1) : (console.log("调取接口"), void i._post("user.address/add", a, (function(t) {
          i.showSuccess(t.msg, (function() {
            e.index.navigateBack({
              delta: parseInt(i.delta)
            })
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
        console.log(e), this.selectCity = e.label, this.province_id = e.cityCode[0], this.city_id = e.cityCode[1], this.region_id = e.cityCode[2]
      }
    }
  };
Array || (e.resolveComponent("uni-icons") + e.resolveComponent("mpvue-city-picker"))(), Math;
var i = e._export_sfc(t, [
  ["render", function(t, i, a, r, o, n) {
    return e.e({
      a: o.address.name,
      b: e.o((function(e) {
        return o.address.name = e.detail.value
      }), "7a"),
      c: o.address.phone,
      d: e.o((function(e) {
        return o.address.phone = e.detail.value
      }), "aa"),
      e: o.selectCity,
      f: e.o((function(e) {
        return o.selectCity = e.detail.value
      }), "99"),
      g: e.o((function() {
        return n.showMulLinkageThreePicker && n.showMulLinkageThreePicker.apply(n, arguments)
      }), "3d"),
      h: o.address.detail,
      i: e.o((function(e) {
        return o.address.detail = e.detail.value
      }), "2e"),
      j: t.getThemeColor(),
      k: o.is_default,
      l: e.o((function(e) {
        return o.is_default = !o.is_default
      }), "94"),
      m: o.zt_is_show
    }, o.zt_is_show ? e.e({
      n: o.rawAddress,
      o: e.o((function(e) {
        return o.rawAddress = e.detail.value
      }), "21"),
      p: o.rawAddress.length > 0
    }, o.rawAddress.length > 0 ? {
      q: e.o((function() {
        return n.clearRawAddress && n.clearRawAddress.apply(n, arguments)
      }), "9e"),
      r: e.o((function() {
        return n.parseAddress && n.parseAddress.apply(n, arguments)
      }), "b0")
    } : {}) : {}, {
      s: !o.zt_is_show
    }, o.zt_is_show ? {
      v: e.p({
        type: "up",
        size: "15"
      })
    } : {
      t: e.p({
        type: "down",
        size: "15"
      })
    }, {
      w: e.o((function() {
        return n.ztIsShow && n.ztIsShow.apply(n, arguments)
      }), "84"),
      x: e.o((function() {
        return n.chooseAddress && n.chooseAddress.apply(n, arguments)
      }), "2a"),
      y: e.o((function() {
        return n.formSubmit && n.formSubmit.apply(n, arguments)
      }), "49"),
      z: e.o((function() {
        return n.formReset && n.formReset.apply(n, arguments)
      }), "25"),
      A: o.is_load
    }, o.is_load ? {
      B: e.sr("mpvueCityPicker", "d10b3654-2"),
      C: e.o(n.onConfirm, "a5"),
      D: e.p({
        province: o.province,
        city: o.city,
        area: o.area,
        pickerValueDefault: o.cityPickerValueDefault
      })
    } : {}, {
      E: t.theme(),
      F: e.n(t.theme() || "")
    })
  }],
  ["__scopeId", "data-v-d10b3654"]
]);
wx.createPage(i);