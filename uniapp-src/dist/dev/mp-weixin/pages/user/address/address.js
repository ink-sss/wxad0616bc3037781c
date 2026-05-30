"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      loadding: true,
      listData: [],
      default_id: "0",
      options: {}
    };
  },
  onLoad(query = {}) {
    this.options = query;
  },
  onShow() {
    common_vendor.index.showLoading({ title: "加载中" });
    this.getData();
  },
  methods: {
    regionText(item) {
      const region = item.region || {};
      return [region.province, region.city, region.region].filter(Boolean).join(" ");
    },
    getData() {
      this._get(
        "user.address/lists",
        {},
        (res) => {
          this.listData = res.data.list || [];
          this.default_id = String(res.data.default_id || 0);
          this.loadding = false;
          common_vendor.index.hideLoading();
        },
        false,
        () => common_vendor.index.hideLoading()
      );
    },
    addAddress() {
      const delta = this.options.source === "order" ? 2 : 1;
      this.gotoPage("/pages/user/address/add/add?delta=" + delta);
    },
    radioChange(addressId) {
      this.default_id = String(addressId);
      this._post("user.address/setDefault", { address_id: addressId }, () => {
        if (this.options.source === "order")
          common_vendor.index.navigateBack();
      });
      return false;
    },
    editAddress(addressId) {
      this.gotoPage("/pages/user/address/edit/edit?address_id=" + addressId);
    },
    delAddress(addressId) {
      common_vendor.index.showModal({
        title: "提示",
        content: "您确定要移除当前收货地址吗?",
        success: (modal) => {
          if (modal.confirm) {
            this._get("user.address/delete", { address_id: addressId }, (res) => {
              if (res.code === 1) {
                common_vendor.index.showToast({ title: "删除成功" });
                this.getData();
              }
            });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.loadding && $data.listData.length
  }, !$data.loadding && $data.listData.length ? {
    b: common_vendor.f($data.listData, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.phone),
        c: common_vendor.t($options.regionText(item)),
        d: common_vendor.t(item.detail),
        e: $data.default_id === String(item.address_id),
        f: common_vendor.o(($event) => $options.radioChange(item.address_id), item.address_id),
        g: common_vendor.o(($event) => $options.radioChange(item.address_id), item.address_id),
        h: common_vendor.o(($event) => $options.editAddress(item.address_id), item.address_id),
        i: common_vendor.o(($event) => $options.delAddress(item.address_id), item.address_id),
        j: item.address_id
      };
    })
  } : !$data.loadding ? {} : {}, {
    c: !$data.loadding,
    d: common_vendor.o((...args) => $options.addAddress && $options.addAddress(...args), "60"),
    e: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-be4731d9"]]);
wx.createPage(MiniProgramPage);
