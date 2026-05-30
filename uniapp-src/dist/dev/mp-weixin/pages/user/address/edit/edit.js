"use strict";
const common_vendor = require("../../../../common/vendor.js");
const pages_user_pageTools = require("../../page-tools.js");
const _sfc_main = {
  data() {
    return {
      selectCity: "选择省,市,区",
      province_id: 0,
      city_id: 0,
      region_id: 0,
      address_id: 0,
      address: { name: "", phone: "", detail: "" },
      region: [],
      province: [],
      city: [],
      area: [],
      is_default: false,
      delta: 1
    };
  },
  onLoad(query = {}) {
    this.delta = query.delta || 1;
    this.address_id = query.address_id;
    this.getData();
  },
  methods: {
    getData() {
      this._get("user.address/detail", { address_id: this.address_id }, (res) => {
        const data = res.data || {};
        this.address = data.detail || {};
        this.address_id = this.address.address_id;
        this.province_id = this.address.province_id;
        this.city_id = this.address.city_id;
        this.region_id = this.address.region_id;
        this.region = data.region || [];
        this.selectCity = this.region.join("") || "选择省,市,区";
        this.province = data.regionData && data.regionData[0] || [];
        this.city = data.regionData && data.regionData[1] || [];
        this.area = data.regionData && data.regionData[2] || [];
        this.is_default = data.is_default === 1 || this.address.is_default === 1;
      });
    },
    onRegionChange(event) {
      const [provinceName, cityName, regionName] = event.detail.value;
      const provinceIndex = this.province.findIndex((item) => item.label === provinceName || item.name === provinceName);
      if (provinceIndex < 0)
        return pages_user_pageTools.toast("所在地区匹配错误，请手动选择");
      const cityIndex = (this.city[provinceIndex] || []).findIndex((item) => item.label === cityName || item.name === cityName);
      if (cityIndex < 0)
        return pages_user_pageTools.toast("所在地区匹配错误，请手动选择");
      const areaItem = ((this.area[provinceIndex] || [])[cityIndex] || []).find((item) => item.label === regionName || item.name === regionName);
      if (!areaItem)
        return pages_user_pageTools.toast("所在地区匹配错误，请手动选择");
      this.province_id = this.province[provinceIndex].value || this.province[provinceIndex].id;
      this.city_id = this.city[provinceIndex][cityIndex].value || this.city[provinceIndex][cityIndex].id;
      this.region_id = areaItem.value || areaItem.id;
      this.region = [provinceName, cityName, regionName];
      this.selectCity = this.region.join(",");
    },
    formSubmit() {
      const payload = {
        address_id: this.address_id,
        name: this.address.name,
        phone: this.address.phone,
        detail: this.address.detail,
        province_id: this.province_id,
        city_id: this.city_id,
        region_id: this.region_id,
        region: this.region,
        is_default: this.is_default ? 1 : 0
      };
      if (!payload.name)
        return pages_user_pageTools.toast("请输入收货人姓名");
      if (!pages_user_pageTools.mobileValid(payload.phone))
        return pages_user_pageTools.toast("请输入正确手机号");
      if (!payload.province_id || !payload.city_id || !payload.region_id)
        return pages_user_pageTools.toast("请选择完整省市区");
      if (!payload.detail)
        return pages_user_pageTools.toast("请输入街道小区楼牌号等");
      this._post("user.address/edit", payload, (res) => {
        this.showSuccess(res.msg, () => common_vendor.index.navigateBack({ delta: 1 }));
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.address.name,
    b: common_vendor.o(($event) => $data.address.name = $event.detail.value, "37"),
    c: $data.address.phone,
    d: common_vendor.o(($event) => $data.address.phone = $event.detail.value, "ec"),
    e: common_vendor.t($data.selectCity),
    f: common_vendor.o((...args) => $options.onRegionChange && $options.onRegionChange(...args), "ab"),
    g: $data.address.detail,
    h: common_vendor.o(($event) => $data.address.detail = $event.detail.value, "de"),
    i: $data.is_default,
    j: common_vendor.o(($event) => $data.is_default = $event.detail.value, "f1"),
    k: common_vendor.o((...args) => $options.formSubmit && $options.formSubmit(...args), "af"),
    l: _ctx.theme && _ctx.theme()
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cfe99c51"]]);
wx.createPage(MiniProgramPage);
