"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const services_liveSign = require("../services/live-sign.js");
const area = require("../area.js");
if (!Array) {
  const _easycom_wd_radio2 = common_vendor.resolveComponent("wd-radio");
  const _easycom_wd_radio_group2 = common_vendor.resolveComponent("wd-radio-group");
  const _easycom_wd_picker2 = common_vendor.resolveComponent("wd-picker");
  (_easycom_wd_radio2 + _easycom_wd_radio_group2 + _easycom_wd_picker2)();
}
const _easycom_wd_radio = () => "../node-modules/wot-design-uni/components/wd-radio/wd-radio.js";
const _easycom_wd_radio_group = () => "../node-modules/wot-design-uni/components/wd-radio-group/wd-radio-group.js";
const _easycom_wd_picker = () => "../node-modules/wot-design-uni/components/wd-picker/wd-picker.js";
if (!Math) {
  (_easycom_wd_radio + _easycom_wd_radio_group + _easycom_wd_picker)();
}
const _sfc_main = {
  __name: "live-sign-in",
  props: {
    roomId: { type: [Number, String], default: 0 },
    roomCode: { type: String, default: "" },
    tenantId: { type: [Number, String], default: 0 },
    shareCode: { type: String, default: "" },
    bindId: { type: [Number, String], default: "" },
    liveType: { type: String, default: "" },
    termId: { type: [Number, String], default: 0 },
    customerId: { type: [Number, String], default: 0 },
    userId: { type: [Number, String], default: 0 },
    config: {
      type: Object,
      default: () => ({
        enabled: 0,
        ruleType: 1,
        welcomeText: "",
        coverImage: "",
        forceEnabled: 0,
        fields: []
      })
    },
    fields: { type: Array, default: () => [] },
    signed: { type: Boolean, default: false },
    showWelcomeText: { type: Boolean, default: true },
    showSkip: { type: Boolean, default: true },
    submitText: { type: String, default: "确定" },
    successMode: { type: String, default: "state" }
  },
  emits: ["signed", "skip"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const hasSigned = common_vendor.ref(props.signed);
    const submitting = common_vendor.ref(false);
    const formData = common_vendor.reactive({});
    const activeRegionField = common_vendor.ref(null);
    const regionPickerValue = common_vendor.ref([]);
    const regionColumns = common_vendor.ref([]);
    common_vendor.watch(
      () => props.fields,
      (newFields) => {
        if (!Array.isArray(newFields))
          return;
        newFields.forEach((f) => {
          if (!(f.key in formData)) {
            if (isGenderField(f)) {
              formData[f.key] = 1;
              return;
            }
            formData[f.key] = f.type === "checkbox" ? [] : "";
          }
        });
      },
      { immediate: true }
    );
    common_vendor.watch(
      () => props.signed,
      (val) => {
        if (props.successMode === "toast")
          return;
        hasSigned.value = val;
      }
    );
    function onFieldInput(key, e) {
      var _a, _b;
      formData[key] = ((_a = e.detail) == null ? void 0 : _a.value) ?? ((_b = e.target) == null ? void 0 : _b.value) ?? "";
    }
    function onDateChange(key, e) {
      var _a;
      formData[key] = ((_a = e.detail) == null ? void 0 : _a.value) || "";
    }
    function mapAreaOptions(list = []) {
      return list.map((item) => ({
        label: item.name,
        value: item.code
      }));
    }
    function getProvinceList() {
      return area.areaData || [];
    }
    function getCityList(provinceCode) {
      var _a;
      return ((_a = getProvinceList().find((item) => item.code === provinceCode)) == null ? void 0 : _a.children) || [];
    }
    function getDistrictList(provinceCode, cityCode) {
      var _a;
      return ((_a = getCityList(provinceCode).find((item) => item.code === cityCode)) == null ? void 0 : _a.children) || [];
    }
    function findAreaByCodes(codes = []) {
      const [provinceCode, cityCode, districtCode] = codes;
      const province = getProvinceList().find((item) => item.code === provinceCode);
      const city = ((province == null ? void 0 : province.children) || []).find(
        (item) => item.code === cityCode
      );
      const district = ((city == null ? void 0 : city.children) || []).find(
        (item) => item.code === districtCode
      );
      return { province, city, district };
    }
    function findCodesByNames(provinceName, cityName, districtName) {
      const province = getProvinceList().find((item) => item.name === provinceName);
      const city = ((province == null ? void 0 : province.children) || []).find(
        (item) => item.name === cityName
      );
      const district = ((city == null ? void 0 : city.children) || []).find(
        (item) => item.name === districtName
      );
      if (!province || !city)
        return [];
      if (districtName && !district)
        return [];
      return district ? [province.code, city.code, district.code] : [province.code, city.code];
    }
    function setRegionColumns(codes = []) {
      var _a, _b, _c;
      const provinceList = getProvinceList();
      const provinceCode = codes[0] || ((_a = provinceList[0]) == null ? void 0 : _a.code) || "";
      const cityList = getCityList(provinceCode);
      const cityCode = codes[1] || ((_b = cityList[0]) == null ? void 0 : _b.code) || "";
      const districtList = getDistrictList(provinceCode, cityCode);
      if (((_c = activeRegionField.value) == null ? void 0 : _c.subType) === "province-city") {
        regionColumns.value = [
          mapAreaOptions(provinceList),
          mapAreaOptions(cityList)
        ];
        return;
      }
      regionColumns.value = [
        mapAreaOptions(provinceList),
        mapAreaOptions(cityList),
        mapAreaOptions(districtList)
      ];
    }
    function openRegionPicker(field) {
      activeRegionField.value = field;
      const value = formData[field.key];
      const parts = typeof value === "string" ? value.split("/").filter(Boolean) : [];
      const codes = findCodesByNames(parts[0], parts[1], parts[2]);
      setRegionColumns(codes);
      regionPickerValue.value = codes;
    }
    function onRegionColumnChange(pickerView, value, columnIndex, resolve) {
      var _a, _b, _c, _d;
      const item = value[columnIndex];
      if (!item) {
        resolve();
        return;
      }
      if (columnIndex === 0) {
        const cityList = mapAreaOptions(getCityList(item.value));
        pickerView.setColumnData(1, cityList);
        if (((_a = activeRegionField.value) == null ? void 0 : _a.subType) !== "province-city") {
          const firstCityCode = ((_b = cityList[0]) == null ? void 0 : _b.value) || "";
          const districtList = mapAreaOptions(
            getDistrictList(item.value, firstCityCode)
          );
          pickerView.setColumnData(2, districtList);
        }
      } else if (columnIndex === 1) {
        if (((_c = activeRegionField.value) == null ? void 0 : _c.subType) === "province-city") {
          resolve();
          return;
        }
        const provinceCode = ((_d = value[0]) == null ? void 0 : _d.value) || regionPickerValue.value[0] || "";
        const districtList = mapAreaOptions(
          getDistrictList(provinceCode, item.value)
        );
        pickerView.setColumnData(2, districtList);
      }
      resolve();
    }
    function onRegionConfirm(field) {
      const targetField = field || activeRegionField.value;
      if (!targetField)
        return;
      const codes = Array.isArray(regionPickerValue.value) ? regionPickerValue.value : [];
      const { province, city, district } = findAreaByCodes(codes);
      const names = [(province == null ? void 0 : province.name) || "", (city == null ? void 0 : city.name) || ""];
      if (targetField.subType === "province-city-district") {
        names.push((district == null ? void 0 : district.name) || "");
      }
      formData[targetField.key] = names.filter(Boolean).join("/");
    }
    function toggleCheckbox(key, opt) {
      if (!Array.isArray(formData[key])) {
        formData[key] = [];
      }
      const idx = formData[key].indexOf(opt);
      if (idx >= 0) {
        formData[key].splice(idx, 1);
      } else {
        formData[key].push(opt);
      }
    }
    function isGenderField(field) {
      const key = String((field == null ? void 0 : field.key) || "").toLowerCase();
      const label = String((field == null ? void 0 : field.label) || "");
      return key === "gender" || label === "性别";
    }
    function onPickerChange(key, e, options) {
      var _a;
      const idx = Number(((_a = e.detail) == null ? void 0 : _a.value) ?? 0);
      const opt = (options || [])[idx];
      formData[key] = (opt == null ? void 0 : opt.label) || opt || "";
    }
    function validate() {
      if (!props.fields || props.fields.length === 0) {
        return "";
      }
      for (const field of props.fields) {
        const isRequired = field.required === true || field.required === 1 || field.required === "true" || field.required === "1";
        if (!isRequired)
          continue;
        const val = formData[field.key];
        if (field.type === "checkbox") {
          if (!Array.isArray(val) || val.length === 0) {
            return `请填写${field.label}`;
          }
        } else {
          if (!val || typeof val === "string" && !val.trim()) {
            return `请填写${field.label}`;
          }
        }
        if ((field.type === "phone" || field.type === "mobile") && !/^1\d{10}$/.test(val)) {
          return "请输入正确的手机号";
        }
      }
      return "";
    }
    async function onSubmit() {
      if (submitting.value)
        return;
      const validateMessage = validate();
      if (validateMessage) {
        common_vendor.index.showToast({ title: validateMessage, icon: "none" });
        return;
      }
      submitting.value = true;
      try {
        await services_liveSign.submitLiveSign(props.roomId, { ...formData }, {
          roomCode: props.roomCode,
          room_code: props.roomCode,
          tenantId: props.tenantId,
          tenant_id: props.tenantId,
          shareCode: props.shareCode,
          share_code: props.shareCode,
          bindId: props.bindId,
          bind_id: props.bindId,
          liveType: props.liveType,
          live_type: props.liveType,
          termId: props.termId,
          term_id: props.termId,
          liveTermId: props.termId,
          live_term_id: props.termId,
          customerId: props.customerId || props.userId,
          customer_id: props.customerId || props.userId,
          userId: props.userId || props.customerId,
          user_id: props.userId || props.customerId
        });
        common_vendor.index.showToast({ title: "签到成功", icon: "success" });
        if (props.successMode !== "toast") {
          hasSigned.value = true;
          emit("signed");
        } else {
          setTimeout(() => {
            emit("signed");
          }, 600);
        }
      } catch (err) {
        const msg = (err == null ? void 0 : err.message) || (err == null ? void 0 : err.msg) || "签到失败";
        common_vendor.index.showToast({ title: msg, icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    function onSkip() {
      emit("skip");
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: hasSigned.value
      }, hasSigned.value ? {
        b: common_assets._imports_0$19,
        c: common_assets._imports_1$7
      } : common_vendor.e({
        d: __props.config.coverImage
      }, __props.config.coverImage ? {
        e: __props.config.coverImage
      } : {}, {
        f: __props.showWelcomeText && __props.config.welcomeText
      }, __props.showWelcomeText && __props.config.welcomeText ? {
        g: common_vendor.t(__props.config.welcomeText)
      } : {}, {
        h: common_vendor.f(__props.fields, (field, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(field.label),
            b: field.required
          }, field.required ? {} : {}, {
            c: isGenderField(field)
          }, isGenderField(field) ? {
            d: "1bc89f76-1-" + i0 + "," + ("1bc89f76-0-" + i0),
            e: common_vendor.p({
              value: 1
            }),
            f: "1bc89f76-2-" + i0 + "," + ("1bc89f76-0-" + i0),
            g: common_vendor.p({
              value: 2
            }),
            h: "1bc89f76-0-" + i0,
            i: common_vendor.o(($event) => formData[field.key] = $event, field.key),
            j: common_vendor.p({
              shape: "dot",
              modelValue: formData[field.key]
            })
          } : field.type === "name" || field.type === "mobile" || field.type === "text" || field.type === "number" || field.type === "phone" || field.type === "email" ? {
            l: field.type === "phone" || field.type === "mobile" || field.type === "number" ? "number" : "text",
            m: field.placeholder || `请输入${field.label}`,
            n: formData[field.key],
            o: common_vendor.o(($event) => onFieldInput(field.key, $event), field.key)
          } : field.type === "date" ? {
            q: common_vendor.t(formData[field.key] || field.placeholder || "请选择日期"),
            r: !formData[field.key] ? 1 : "",
            s: formData[field.key] || "",
            t: common_vendor.o(($event) => onDateChange(field.key, $event), field.key)
          } : field.type === "city" ? {
            w: common_vendor.t(formData[field.key] || field.placeholder || (field.subType === "province-city-district" ? "请选择省/市/区" : "请选择省/市")),
            x: !formData[field.key] ? 1 : "",
            y: common_vendor.o(($event) => openRegionPicker(field), field.key),
            z: common_vendor.o(($event) => onRegionConfirm(field), field.key),
            A: "1bc89f76-3-" + i0,
            B: common_vendor.o(($event) => regionPickerValue.value = $event, field.key),
            C: common_vendor.p({
              columns: regionColumns.value,
              ["column-change"]: onRegionColumnChange,
              ["use-default-slot"]: true,
              modelValue: regionPickerValue.value
            })
          } : field.type === "textarea" ? {
            E: field.placeholder || `请输入${field.label}`,
            F: formData[field.key],
            G: common_vendor.o(($event) => onFieldInput(field.key, $event), field.key)
          } : field.type === "radio" ? {
            I: common_vendor.f(field.options || [], (opt, k1, i1) => {
              return {
                a: formData[field.key] === opt.label ? 1 : "",
                b: common_vendor.t(opt.label),
                c: opt.key || opt.label,
                d: common_vendor.o(($event) => formData[field.key] = opt.label, opt.key || opt.label)
              };
            })
          } : field.type === "checkbox" ? {
            K: common_vendor.f(field.options || [], (opt, k1, i1) => {
              return common_vendor.e({
                a: (formData[field.key] || []).includes(opt.label)
              }, (formData[field.key] || []).includes(opt.label) ? {} : {}, {
                b: (formData[field.key] || []).includes(opt.label) ? 1 : "",
                c: common_vendor.t(opt.label),
                d: opt.key || opt.label,
                e: common_vendor.o(($event) => toggleCheckbox(field.key, opt.label), opt.key || opt.label)
              });
            })
          } : field.type === "select" ? {
            M: common_vendor.t(formData[field.key] || field.placeholder || `请选择${field.label}`),
            N: !formData[field.key] ? 1 : "",
            O: (field.options || []).map((o) => o.label || o),
            P: common_vendor.o(($event) => onPickerChange(field.key, $event, field.options), field.key)
          } : {
            Q: field.placeholder || `请输入${field.label}`,
            R: formData[field.key],
            S: common_vendor.o(($event) => onFieldInput(field.key, $event), field.key)
          }, {
            k: field.type === "name" || field.type === "mobile" || field.type === "text" || field.type === "number" || field.type === "phone" || field.type === "email",
            p: field.type === "date",
            v: field.type === "city",
            D: field.type === "textarea",
            H: field.type === "radio",
            J: field.type === "checkbox",
            L: field.type === "select",
            T: field.key
          });
        }),
        i: __props.showSkip
      }, __props.showSkip ? {
        j: common_vendor.o(onSkip, "cd")
      } : {}, {
        k: common_vendor.t(submitting.value ? "提交中..." : __props.submitText),
        l: !__props.showSkip ? 1 : "",
        m: common_vendor.o(onSubmit, "20")
      }));
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1bc89f76"]]);
wx.createComponent(Component);
