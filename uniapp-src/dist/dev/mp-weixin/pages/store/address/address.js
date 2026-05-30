"use strict";
const common_vendor = require("../../../common/vendor.js");
const platform_weixin_location = require("../../../platform/weixin/location.js");
const _sfc_main = {
  data() {
    return {
      isLoading: true,
      storeList: [],
      longitude: "",
      latitude: "",
      selectedId: -1
    };
  },
  onLoad(query = {}) {
    this.selectedId = query.store_id || -1;
    this.loadLocation();
  },
  methods: {
    regionText(item) {
      const region = item.region || {};
      return `${region.province || ""}${region.city || ""}${region.region || ""}`;
    },
    async loadLocation() {
      try {
        await platform_weixin_location.ensureLocationAuthorized();
        const location = await platform_weixin_location.getLocation({ type: "wgs84" });
        this.longitude = location.longitude;
        this.latitude = location.latitude;
      } catch (error) {
        common_vendor.index.showToast({ title: "获取定位失败，请打开定位权限", icon: "none", duration: 2e3 });
      }
      this.getData();
    },
    getData() {
      if (typeof this._get !== "function") {
        this.isLoading = false;
        return;
      }
      this.isLoading = true;
      this._get("store.store/lists", {
        longitude: this.longitude,
        latitude: this.latitude
      }, (res) => {
        this.isLoading = false;
        this.storeList = res.data && res.data.list || [];
      });
    },
    onSelectedStore(item) {
      const storeId = item.store_id || item;
      this.selectedId = storeId;
      const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
      if (pages.length < 2)
        return;
      common_vendor.index.$emit("selectStoreId", storeId);
      if (this.$fire && this.$fire.fire)
        this.$fire.fire("selectStoreId", storeId);
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.latitude && $data.longitude ? $data.longitude + ", " + $data.latitude : "未获取"),
    b: common_vendor.o((...args) => $options.loadLocation && $options.loadLocation(...args), "85"),
    c: common_vendor.f($data.storeList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.store_name),
        b: common_vendor.t(item.phone),
        c: common_vendor.t($options.regionText(item)),
        d: common_vendor.t(item.address),
        e: common_vendor.t(item.distance_unit),
        f: item.store_id == $data.selectedId
      }, item.store_id == $data.selectedId ? {} : {}, {
        g: item.store_id,
        h: common_vendor.o(($event) => $options.onSelectedStore(item), item.store_id)
      });
    }),
    d: !$data.isLoading && !$data.storeList.length
  }, !$data.isLoading && !$data.storeList.length ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2eed7d14"]]);
wx.createPage(MiniProgramPage);
