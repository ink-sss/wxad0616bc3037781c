"use strict";
const common_vendor = require("../../../common/vendor.js");
const platform_weixin_navigation = require("../../../platform/weixin/navigation.js");
const platform_weixin_location = require("../../../platform/weixin/location.js");
const _sfc_main = {
  data() {
    return {
      loading: true,
      store_id: null,
      storeDetail: {},
      covers: []
    };
  },
  computed: {
    addressText() {
      const region = this.storeDetail.region || {};
      return `${region.province || ""}${region.city || ""}${region.region || ""}${this.storeDetail.address || ""}`;
    }
  },
  onLoad(query = {}) {
    this.store_id = query.store_id;
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      if (typeof this._get !== "function") {
        this.loading = false;
        return;
      }
      common_vendor.index.showLoading({ title: "加载中" });
      this._get("store.store/detail", { store_id: this.store_id }, (res) => {
        this.storeDetail = res.data && res.data.detail || {};
        this.covers = [{
          id: 1,
          latitude: Number(this.storeDetail.latitude),
          longitude: Number(this.storeDetail.longitude),
          title: this.storeDetail.store_name || ""
        }];
        this.loading = false;
        common_vendor.index.hideLoading();
      });
    },
    async callPhone(phone) {
      if (!phone)
        return;
      try {
        await platform_weixin_navigation.makePhoneCall(phone);
      } catch (error) {
        common_vendor.index.showToast({ title: "拨号失败", icon: "none" });
      }
    },
    async openMap() {
      if (!this.storeDetail.latitude || !this.storeDetail.longitude)
        return;
      try {
        await platform_weixin_location.openLocation({
          latitude: Number(this.storeDetail.latitude),
          longitude: Number(this.storeDetail.longitude),
          name: this.storeDetail.store_name || "",
          address: this.addressText
        });
      } catch (error) {
        common_vendor.index.showToast({ title: "打开地图失败", icon: "none" });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.loading
  }, !$data.loading ? common_vendor.e({
    b: $data.storeDetail.logo && $data.storeDetail.logo.file_path,
    c: common_vendor.t($data.storeDetail.store_name),
    d: common_vendor.t($data.storeDetail.shop_hours),
    e: common_vendor.t($data.storeDetail.phone),
    f: common_vendor.o(($event) => $options.callPhone($data.storeDetail.phone), "4e"),
    g: common_vendor.t($data.storeDetail.linkman),
    h: common_vendor.t($data.storeDetail.status && $data.storeDetail.status.text),
    i: common_vendor.t($data.storeDetail.is_check && $data.storeDetail.is_check.text),
    j: common_vendor.t($options.addressText),
    k: common_vendor.t($data.storeDetail.summary),
    l: $data.storeDetail.latitude && $data.storeDetail.longitude
  }, $data.storeDetail.latitude && $data.storeDetail.longitude ? {
    m: $data.storeDetail.latitude,
    n: $data.storeDetail.longitude,
    o: $data.covers,
    p: common_vendor.o((...args) => $options.openMap && $options.openMap(...args), "c7")
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9c12344e"]]);
wx.createPage(MiniProgramPage);
