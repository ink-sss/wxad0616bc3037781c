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
      address: { name: "", phone: "", detail: "" },
      delta: 1,
      province: [],
      city: [],
      area: [],
      is_default: false,
      zt_is_show: false,
      rawAddress: ""
    };
  },
  onLoad(query = {}) {
    this.delta = query.delta || 1;
    this.getData();
  },
  methods: {
    getData() {
      this._post("settings/getRegion", {}, (res) => {
        const regionData = res.data.regionData || [];
        this.province = regionData[0] || [];
        this.city = regionData[1] || [];
        this.area = regionData[2] || [];
      });
    },
    onRegionChange(event) {
      const [provinceName, cityName, regionName] = event.detail.value;
      this.regionMatch(provinceName, cityName, regionName);
    },
    chooseAddress() {
      common_vendor.index.chooseAddress({
        success: (res) => {
          this.address.name = res.userName;
          this.address.phone = res.telNumber;
          this.address.detail = res.detailInfo;
          this.regionMatch(res.provinceName, res.cityName, res.countyName);
        }
      });
    },
    regionMatch(provinceName, cityName, regionName) {
      let provinceId = 0;
      let cityId = 0;
      let regionId = 0;
      const provinceIndex = this.province.findIndex((item) => item.label === provinceName || item.name === provinceName);
      if (provinceIndex > -1) {
        const province = this.province[provinceIndex];
        provinceId = province.value || province.id || 0;
        const cityIndex = (this.city[provinceIndex] || []).findIndex((item) => item.label === cityName || item.name === cityName);
        if (cityIndex > -1) {
          const city = this.city[provinceIndex][cityIndex];
          cityId = city.value || city.id || 0;
          const areaItem = ((this.area[provinceIndex] || [])[cityIndex] || []).find((item) => item.label === regionName || item.name === regionName);
          regionId = areaItem ? areaItem.value || areaItem.id || 0 : 0;
        }
      }
      if (provinceId && cityId && regionId) {
        this.province_id = provinceId;
        this.city_id = cityId;
        this.region_id = regionId;
        this.selectCity = [provinceName, cityName, regionName].join(",");
      } else {
        pages_user_pageTools.toast("所在地区匹配错误，请手动选择");
      }
    },
    ztIsShow() {
      this.zt_is_show = !this.zt_is_show;
    },
    parseAddress() {
      const text = this.rawAddress.trim();
      if (!text)
        return;
      const phone = text.match(/1[3-9]\d{9}/);
      if (phone)
        this.address.phone = phone[0];
      const name = text.replace(phone ? phone[0] : "", "").trim().match(/^[\u4e00-\u9fa5]{2,4}/);
      if (name)
        this.address.name = name[0];
      this.address.detail = text.replace(this.address.name || "", "").replace(this.address.phone || "", "").trim();
    },
    formSubmit() {
      const payload = {
        name: this.address.name,
        phone: this.address.phone,
        detail: this.address.detail,
        province_id: this.province_id,
        city_id: this.city_id,
        region_id: this.region_id,
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
      this._post("user.address/add", payload, (res) => {
        this.showSuccess(res.msg, () => common_vendor.index.navigateBack({ delta: parseInt(this.delta, 10) || 1 }));
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.address.name,
    b: common_vendor.o(($event) => $data.address.name = $event.detail.value, "37"),
    c: $data.address.phone,
    d: common_vendor.o(($event) => $data.address.phone = $event.detail.value, "1a"),
    e: common_vendor.t($data.selectCity),
    f: common_vendor.o((...args) => $options.onRegionChange && $options.onRegionChange(...args), "21"),
    g: $data.address.detail,
    h: common_vendor.o(($event) => $data.address.detail = $event.detail.value, "0a"),
    i: $data.is_default,
    j: common_vendor.o(($event) => $data.is_default = $event.detail.value, "78"),
    k: common_vendor.o((...args) => $options.ztIsShow && $options.ztIsShow(...args), "ed"),
    l: $data.zt_is_show
  }, $data.zt_is_show ? {
    m: $data.rawAddress,
    n: common_vendor.o(($event) => $data.rawAddress = $event.detail.value, "83"),
    o: common_vendor.o((...args) => $options.parseAddress && $options.parseAddress(...args), "0e")
  } : {}, {
    p: common_vendor.o((...args) => $options.chooseAddress && $options.chooseAddress(...args), "c4"),
    q: common_vendor.o((...args) => $options.formSubmit && $options.formSubmit(...args), "3b"),
    r: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fb31492f"]]);
wx.createPage(MiniProgramPage);
