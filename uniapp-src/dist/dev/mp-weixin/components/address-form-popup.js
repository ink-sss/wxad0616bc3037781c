"use strict";
const common_vendor = require("../common/vendor.js");
const services_addressForm = require("../services/address-form.js");
const area = require("../area.js");
if (!Array) {
  const _easycom_wd_picker2 = common_vendor.resolveComponent("wd-picker");
  _easycom_wd_picker2();
}
const _easycom_wd_picker = () => "../node-modules/wot-design-uni/components/wd-picker/wd-picker.js";
if (!Math) {
  (_easycom_wd_picker + BottomSheetPopup)();
}
const BottomSheetPopup = () => "./bottom-sheet-popup.js";
const _sfc_main = {
  __name: "address-form-popup",
  props: {
    visible: { type: Boolean, default: false },
    editData: { type: Object, default: null },
    popupHeight: { type: String, default: "66vh" },
    zIndex: { type: Number, default: 80 }
  },
  emits: ["close", "saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const editId = common_vendor.computed(() => {
      var _a;
      return ((_a = props.editData) == null ? void 0 : _a.id) || 0;
    });
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
      if (!province || !city || !district)
        return [];
      return [province.code, city.code, district.code];
    }
    const regionValue = common_vendor.ref([]);
    const regionColumns = common_vendor.ref([]);
    function setRegionColumns(codes = []) {
      var _a, _b;
      const provinceList = getProvinceList();
      const provinceCode = codes[0] || ((_a = provinceList[0]) == null ? void 0 : _a.code) || "";
      const cityList = getCityList(provinceCode);
      const cityCode = codes[1] || ((_b = cityList[0]) == null ? void 0 : _b.code) || "";
      const districtList = getDistrictList(provinceCode, cityCode);
      regionColumns.value = [
        mapAreaOptions(provinceList),
        mapAreaOptions(cityList),
        mapAreaOptions(districtList)
      ];
    }
    function syncRegionByCodes(codes = []) {
      if (!codes.length) {
        regionValue.value = [];
        setRegionColumns();
        return;
      }
      setRegionColumns(codes);
      regionValue.value = codes;
      const { province, city, district } = findAreaByCodes(codes);
      form.province = (province == null ? void 0 : province.name) || "";
      form.city = (city == null ? void 0 : city.name) || "";
      form.district = (district == null ? void 0 : district.name) || "";
    }
    const regionText = common_vendor.computed(() => {
      if (!form.province || !form.city || !form.district)
        return "";
      return `${form.province} ${form.city} ${form.district}`;
    });
    const form = common_vendor.reactive({
      name: "",
      mobile: "",
      province: "",
      city: "",
      district: "",
      detail: "",
      isDefault: false
    });
    common_vendor.watch(
      () => props.visible,
      (val) => {
        if (val && props.editData) {
          form.name = props.editData.receiverName || props.editData.name || "";
          form.mobile = props.editData.receiverPhone || props.editData.mobile || "";
          form.province = props.editData.province || "";
          form.city = props.editData.city || "";
          form.district = props.editData.district || "";
          form.detail = props.editData.address || props.editData.detail || "";
          form.isDefault = props.editData.isDefault === 1;
          syncRegionByCodes(
            findCodesByNames(form.province, form.city, form.district)
          );
        } else if (val) {
          form.name = "";
          form.mobile = "";
          form.province = "";
          form.city = "";
          form.district = "";
          form.detail = "";
          form.isDefault = false;
          syncRegionByCodes([]);
        }
      }
    );
    function onRegionColumnChange(pickerView, value, columnIndex, resolve) {
      var _a, _b;
      const item = value[columnIndex];
      if (!item) {
        resolve();
        return;
      }
      if (columnIndex === 0) {
        const cityList = mapAreaOptions(getCityList(item.value));
        const firstCityCode = ((_a = cityList[0]) == null ? void 0 : _a.value) || "";
        const districtList = mapAreaOptions(
          getDistrictList(item.value, firstCityCode)
        );
        pickerView.setColumnData(1, cityList);
        pickerView.setColumnData(2, districtList);
      } else if (columnIndex === 1) {
        const provinceCode = ((_b = value[0]) == null ? void 0 : _b.value) || regionValue.value[0] || "";
        const districtList = mapAreaOptions(
          getDistrictList(provinceCode, item.value)
        );
        pickerView.setColumnData(2, districtList);
      }
      resolve();
    }
    function onRegionConfirm() {
      syncRegionByCodes(regionValue.value);
    }
    async function onSave() {
      if (!form.name.trim()) {
        common_vendor.index.showToast({ title: "请输入收货人", icon: "none" });
        return;
      }
      if (!/^1\d{10}$/.test(form.mobile)) {
        common_vendor.index.showToast({ title: "请输入正确手机号", icon: "none" });
        return;
      }
      if (!form.province || !form.city || !form.district) {
        common_vendor.index.showToast({ title: "请选择所在地区", icon: "none" });
        return;
      }
      if (!form.detail.trim()) {
        common_vendor.index.showToast({ title: "请输入详细地址", icon: "none" });
        return;
      }
      const payload = {
        receiverName: form.name.trim(),
        receiverPhone: form.mobile.trim(),
        province: form.province || "未选择",
        city: form.city || "未选择",
        district: form.district || "未选择",
        address: form.detail.trim(),
        isDefault: form.isDefault ? 1 : 0
      };
      try {
        await services_addressForm.saveAddressForm(payload, editId.value);
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        emit("saved");
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "保存失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(editId.value ? "编辑收货地址" : "新增收货地址"),
        b: form.name,
        c: common_vendor.o(($event) => form.name = $event.detail.value, "a2"),
        d: form.mobile,
        e: common_vendor.o(($event) => form.mobile = $event.detail.value, "63"),
        f: common_vendor.t(regionText.value || "请选择所在地区"),
        g: common_vendor.n(regionText.value ? "row-value-text" : ""),
        h: common_vendor.o(onRegionConfirm, "9f"),
        i: common_vendor.o(($event) => regionValue.value = $event, "1b"),
        j: common_vendor.p({
          columns: regionColumns.value,
          ["column-change"]: onRegionColumnChange,
          ["use-default-slot"]: true,
          modelValue: regionValue.value
        }),
        k: form.detail,
        l: common_vendor.o(($event) => form.detail = $event.detail.value, "4c"),
        m: form.isDefault,
        n: common_vendor.o(($event) => form.isDefault = !!$event.detail.value, "c2"),
        o: common_vendor.o(onSave, "a8"),
        p: common_vendor.o(($event) => emit("close"), "38"),
        q: common_vendor.p({
          visible: __props.visible,
          height: __props.popupHeight,
          radius: "24rpx 24rpx 0 0",
          duration: 500,
          ["z-index"]: __props.zIndex,
          ["with-mask"]: true,
          ["mask-color"]: "rgba(0, 0, 0, 0.35)"
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7a9564f6"]]);
wx.createComponent(Component);
