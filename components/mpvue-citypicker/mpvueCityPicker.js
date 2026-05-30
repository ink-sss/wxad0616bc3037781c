var t = require("../../common/vendor.js"),
  i = {
    data: function() {
      return {
        pickerValue: [0, 0, 0],
        provinceDataList: [],
        cityDataList: [],
        areaDataList: [],
        showPicker: !1,
        provinceData: [],
        cityData: [],
        areaData: []
      }
    },
    created: function() {
      this.init()
    },
    props: {
      pickerValueDefault: {
        type: Array,
        default: function() {
          return [0, 0, 0]
        }
      },
      themeColor: String,
      province: {
        type: Array
      },
      city: {
        type: Array
      },
      area: {
        type: Array
      }
    },
    watch: {
      pickerValueDefault: function() {
        this.init()
      }
    },
    methods: {
      init: function() {
        this.provinceData = this.province, this.cityData = this.city, this.areaData = this.area, this.handPickValueDefault(), this.provinceDataList = this.provinceData, this.cityDataList = this.cityData[this.pickerValueDefault[0]], this.areaDataList = this.areaData[this.pickerValueDefault[0]][this.pickerValueDefault[1]], this.pickerValue = this.pickerValueDefault
      },
      show: function() {
        var t = this;
        setTimeout((function() {
          t.showPicker = !0
        }), 0)
      },
      maskClick: function() {},
      pickerCancel: function() {
        this.showPicker = !1, this._$emit("onCancel")
      },
      pickerConfirm: function(t) {
        this.showPicker = !1, this._$emit("onConfirm")
      },
      showPickerView: function() {
        this.showPicker = !0
      },
      handPickValueDefault: function() {
        this.pickerValueDefault !== [0, 0, 0] && (this.pickerValueDefault[0] > this.provinceData.length - 1 && (this.pickerValueDefault[0] = this.provinceData.length - 1), this.pickerValueDefault[1] > this.cityData[this.pickerValueDefault[0]].length - 1 && (this.pickerValueDefault[1] = this.cityData[this.pickerValueDefault[0]].length - 1), this.pickerValueDefault[2] > this.areaData[this.pickerValueDefault[0]][this.pickerValueDefault[1]].length - 1 && (this.pickerValueDefault[2] = this.areaData[this.pickerValueDefault[0]][this.pickerValueDefault[1]].length - 1))
      },
      pickerChange: function(t) {
        var i = t.detail.value;
        this.pickerValue[0] !== i[0] ? (this.cityDataList = this.cityData[i[0]], this.areaDataList = this.areaData[i[0]][0], i[1] = 0, i[2] = 0) : this.pickerValue[1] !== i[1] && (this.areaDataList = this.areaData[i[0]][i[1]], i[2] = 0), this.pickerValue = i, this._$emit("onChange")
      },
      _$emit: function(t) {
        var i = {
          label: this._getLabel(),
          value: this.pickerValue,
          cityCode: this._getCityCode()
        };
        this.$emit(t, i)
      },
      _getLabel: function() {
        return this.provinceDataList[this.pickerValue[0]].label + "," + this.cityDataList[this.pickerValue[1]].label + "," + this.areaDataList[this.pickerValue[2]].label
      },
      _getCityCode: function() {
        var t = [0, 0, 0];
        return t[0] = this.provinceDataList[this.pickerValue[0]].value, t[1] = this.cityDataList[this.pickerValue[1]].value, t[2] = this.areaDataList[this.pickerValue[2]].value, t
      }
    }
  },
  e = t._export_sfc(i, [
    ["render", function(i, e, a, r, c, s) {
      return {
        a: c.showPicker ? 1 : "",
        b: t.o((function() {
          return s.maskClick && s.maskClick.apply(s, arguments)
        }), "b5"),
        c: t.o((function() {
          return s.pickerCancel && s.pickerCancel.apply(s, arguments)
        }), "63"),
        d: a.themeColor,
        e: t.o((function() {
          return s.pickerConfirm && s.pickerConfirm.apply(s, arguments)
        }), "33"),
        f: t.f(c.provinceDataList, (function(i, e, a) {
          return {
            a: t.t(i.label),
            b: e
          }
        })),
        g: t.f(c.cityDataList, (function(i, e, a) {
          return {
            a: t.t(i.label),
            b: e
          }
        })),
        h: t.f(c.areaDataList, (function(i, e, a) {
          return {
            a: t.t(i.label),
            b: e
          }
        })),
        i: c.pickerValue,
        j: t.o((function() {
          return s.pickerChange && s.pickerChange.apply(s, arguments)
        }), "85"),
        k: c.showPicker ? 1 : ""
      }
    }]
  ]);
wx.createComponent(e);