"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const area = require("../../area.js");
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const isEdit = common_vendor.ref(false);
    const addressId = common_vendor.ref(0);
    const form = common_vendor.reactive({
      name: "",
      mobile: "",
      province: "",
      city: "",
      district: "",
      detail: "",
      isDefault: false
    });
    function onSwitchChange(event) {
      form.isDefault = !!event.detail.value;
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
    function fillForm(d) {
      form.name = d.receiverName || "";
      form.mobile = d.receiverPhone || "";
      form.province = d.province || "";
      form.city = d.city || "";
      form.district = d.district || "";
      form.detail = d.address || "";
      form.isDefault = d.isDefault === 1;
      syncRegionByCodes(findCodesByNames(form.province, form.city, form.district));
    }
    async function loadAddressDetail(id) {
      try {
        const list = await api_address.getAddressList();
        if (Array.isArray(list)) {
          const found = list.find((a) => a.id === id);
          if (found) {
            fillForm(found);
          }
        }
      } catch (err) {
        console.error("[AddressEdit] loadAddressDetail fail:", err);
      }
    }
    common_vendor.onLoad((options) => {
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      setRegionColumns();
      if (options == null ? void 0 : options.id) {
        isEdit.value = true;
        addressId.value = Number(options.id);
      }
      if (options == null ? void 0 : options.data) {
        try {
          const d = JSON.parse(decodeURIComponent(options.data));
          fillForm(d);
        } catch (e) {
        }
      } else if (addressId.value) {
        loadAddressDetail(addressId.value);
      }
    });
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
        province: form.province,
        city: form.city,
        district: form.district,
        address: form.detail.trim(),
        isDefault: form.isDefault ? 1 : 0
      };
      try {
        if (isEdit.value) {
          await api_address.updateAddress({ id: addressId.value, ...payload });
        } else {
          await api_address.createAddress(payload);
        }
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack({
            fail: () => common_vendor.index.reLaunch({ url: "/pages/center/index" })
          });
        }, 300);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "保存失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: form.name,
        b: common_vendor.o(($event) => form.name = $event.detail.value, "f2"),
        c: form.mobile,
        d: common_vendor.o(($event) => form.mobile = $event.detail.value, "8f"),
        e: common_vendor.t(regionText.value || "请选择所在地区"),
        f: common_vendor.n(regionText.value ? "row-value-text" : ""),
        g: regionPickerRange.value,
        h: regionIndexes.value,
        i: common_vendor.o(onRegionColumnChange, "28"),
        j: common_vendor.o(onRegionConfirm, "34"),
        k: form.detail,
        l: common_vendor.o(($event) => form.detail = $event.detail.value, "3a"),
        m: form.isDefault,
        n: common_vendor.o(onSwitchChange, "63"),
        o: common_vendor.o(onSave, "e8")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-24ed4d92"]]);
wx.createPage(MiniProgramPage);
