"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const services_wechatAddress = require("../../services/wechat-address.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
if (!Math) {
  AddressListPanel();
}
const AddressListPanel = () => "../../components/address-list-panel.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const addressList = common_vendor.ref([]);
    const selectedAddressId = common_vendor.ref(null);
    const selectMode = common_vendor.ref(false);
    async function loadAddresses() {
      try {
        const list = await api_address.getAddressList();
        const safeList = Array.isArray(list) ? list : [];
        addressList.value = safeList.map((item) => ({
          id: item.id,
          name: item.receiverName,
          mobile: item.receiverPhone,
          tag: item.isDefault === 1 ? "默认" : "",
          fullAddress: item.fullAddress || `${item.province || ""}${item.city || ""}${item.district || ""}${item.address || ""}`,
          receiverName: item.receiverName,
          receiverPhone: item.receiverPhone,
          province: item.province,
          city: item.city,
          district: item.district,
          address: item.address,
          isDefault: item.isDefault,
          _raw: item
        }));
        const defaultAddr = safeList.find((a) => a.isDefault === 1);
        if (defaultAddr && !selectedAddressId.value) {
          selectedAddressId.value = defaultAddr.id;
        }
        if (!safeList.length) {
          selectedAddressId.value = null;
        }
      } catch (err) {
        console.error("[Address] loadAddresses fail:", err);
      }
    }
    common_vendor.onLoad((options) => {
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      if ((options == null ? void 0 : options.select) === "1") {
        selectMode.value = true;
      }
      if (options == null ? void 0 : options.selectedId) {
        selectedAddressId.value = Number(options.selectedId);
      }
      if ((options == null ? void 0 : options.wxAddrDone) === "1") {
        common_vendor.index.showToast({ title: "地址导入成功", icon: "success" });
      }
      loadAddresses();
    });
    common_vendor.onShow(() => {
      if (!services_h5AuthContext.ensureH5PageAuth())
        return;
      loadAddresses();
    });
    function onSelect(id) {
      selectedAddressId.value = id;
      if (selectMode.value) {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage) {
          common_vendor.index.$emit("address-selected", id);
        }
        common_vendor.index.navigateBack();
      }
    }
    function onAdd() {
      common_vendor.index.navigateTo({ url: "/pages/address/edit" });
    }
    function onEdit(item) {
      const id = (item == null ? void 0 : item.id) || item;
      common_vendor.index.navigateTo({ url: "/pages/address/edit?id=" + id });
    }
    async function onImportWx() {
      const ok = await services_wechatAddress.importWxAddress();
      if (ok)
        await loadAddresses();
    }
    async function onDelete(item) {
      try {
        await api_address.deleteAddress(item.id);
        common_vendor.index.showToast({ title: "删除成功", icon: "success" });
        if (selectedAddressId.value === item.id) {
          selectedAddressId.value = null;
        }
        await loadAddresses();
      } catch (err) {
        console.error("[Address] deleteAddress fail:", err);
        common_vendor.index.showToast({ title: "删除失败", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onSelect, "20"),
        b: common_vendor.o(onAdd, "56"),
        c: common_vendor.o(onEdit, "eb"),
        d: common_vendor.o(onAdd, "80"),
        e: common_vendor.o(onDelete, "f3"),
        f: common_vendor.o(onImportWx, "23"),
        g: common_vendor.p({
          list: addressList.value,
          ["selected-id"]: selectedAddressId.value,
          ["button-text"]: "新增地址",
          ["page-mode"]: true
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-15db8353"]]);
wx.createPage(MiniProgramPage);
