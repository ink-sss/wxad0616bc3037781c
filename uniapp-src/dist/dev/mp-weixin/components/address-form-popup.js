"use strict";
const common_vendor = require("../common/vendor.js");
const services_addressForm = require("../services/address-form.js");
const area = require("../area.js");
if (!Math) {
  BottomSheetPopup();
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
    const regionIndexes = common_vendor.ref([0, 0, 0]);
    const regionPickerRange = common_vendor.computed(
      () => regionColumns.value.map((column) => column.map((item) => item.label))
    );
    function indexOfCode(options = [], code = "") {
      const index = options.findIndex((item) => item.value === code);
      return index >= 0 ? index : 0;
    }
    function setRegionColumns(codes = []) {
      var _a, _b, _c, _d;
      const provinceList = getProvinceList();
      const provinceCode = codes[0] || ((_a = provinceList[0]) == null ? void 0 : _a.code) || "";
      const cityList = getCityList(provinceCode);
      const cityCode = codes[1] || ((_b = cityList[0]) == null ? void 0 : _b.code) || "";
      const districtList = getDistrictList(provinceCode, cityCode);
      const columns = [
        mapAreaOptions(provinceList),
        mapAreaOptions(cityList),
        mapAreaOptions(districtList)
      ];
      regionColumns.value = columns;
      regionIndexes.value = [
        indexOfCode(columns[0], provinceCode),
        indexOfCode(columns[1], cityCode),
        indexOfCode(columns[2], codes[2] || ((_d = (_c = columns[2]) == null ? void 0 : _c[0]) == null ? void 0 : _d.value) || "")
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
    function onRegionColumnChange(event) {
      var _a, _b, _c, _d;
      const columnIndex = Number(event.detail.column || 0);
      const selectedIndex = Number(event.detail.value || 0);
      const nextIndexes = [...regionIndexes.value];
      nextIndexes[columnIndex] = selectedIndex;
      if (columnIndex === 0) {
        const province = (_a = regionColumns.value[0]) == null ? void 0 : _a[selectedIndex];
        const cityList = mapAreaOptions(getCityList(province == null ? void 0 : province.value));
        const firstCityCode = ((_b = cityList[0]) == null ? void 0 : _b.value) || "";
        const districtList = mapAreaOptions(getDistrictList(province == null ? void 0 : province.value, firstCityCode));
        regionColumns.value = [regionColumns.value[0], cityList, districtList];
        nextIndexes[1] = 0;
        nextIndexes[2] = 0;
      } else if (columnIndex === 1) {
        const province = (_c = regionColumns.value[0]) == null ? void 0 : _c[nextIndexes[0]];
        const city = (_d = regionColumns.value[1]) == null ? void 0 : _d[selectedIndex];
        const districtList = mapAreaOptions(getDistrictList(province == null ? void 0 : province.value, city == null ? void 0 : city.value));
        regionColumns.value = [regionColumns.value[0], regionColumns.value[1], districtList];
        nextIndexes[2] = 0;
      }
      regionIndexes.value = nextIndexes;
    }
    function onRegionConfirm(event) {
      var _a, _b, _c, _d;
      const indexes = ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.value) || regionIndexes.value;
      regionIndexes.value = indexes;
      const province = (_b = regionColumns.value[0]) == null ? void 0 : _b[indexes[0]];
      const city = (_c = regionColumns.value[1]) == null ? void 0 : _c[indexes[1]];
      const district = (_d = regionColumns.value[2]) == null ? void 0 : _d[indexes[2]];
      syncRegionByCodes([province == null ? void 0 : province.value, city == null ? void 0 : city.value, district == null ? void 0 : district.value].filter(Boolean));
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
        h: regionPickerRange.value,
        i: regionIndexes.value,
        j: common_vendor.o(onRegionColumnChange, "e7"),
        k: common_vendor.o(onRegionConfirm, "ca"),
        l: form.detail,
        m: common_vendor.o(($event) => form.detail = $event.detail.value, "e2"),
        n: form.isDefault,
        o: common_vendor.o(($event) => form.isDefault = !!$event.detail.value, "b9"),
        p: common_vendor.o(onSave, "9a"),
        q: common_vendor.o(($event) => emit("close"), "38"),
        r: common_vendor.p({
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
