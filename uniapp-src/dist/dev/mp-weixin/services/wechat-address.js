"use strict";
const common_vendor = require("../common/vendor.js");
const api_address = require("../api/address.js");
const platform_weixin_file = require("../platform/weixin/file.js");
function normalizeWxAddress(wxAddr = {}) {
  return {
    receiverName: wxAddr.userName || "",
    receiverPhone: wxAddr.telNumber || "",
    province: wxAddr.provinceName || "",
    city: wxAddr.cityName || "",
    district: wxAddr.countyName || wxAddr.countryName || "",
    address: wxAddr.detailInfo || "",
    isDefault: 0
  };
}
async function importWxAddress() {
  try {
    const wxAddr = await platform_weixin_file.chooseAddress();
    const payload = normalizeWxAddress(wxAddr);
    const existList = await api_address.getAddressList().catch(() => []);
    const safeList = Array.isArray(existList) ? existList : [];
    const duplicated = safeList.some(
      (item) => item.receiverName === payload.receiverName && item.receiverPhone === payload.receiverPhone && item.address === payload.address
    );
    if (duplicated) {
      common_vendor.index.showToast({ title: "该地址已存在", icon: "none" });
      return true;
    }
    await api_address.createAddress(payload);
    common_vendor.index.showToast({ title: "导入成功", icon: "success" });
    return true;
  } catch (error) {
    const msg = String((error == null ? void 0 : error.errMsg) || (error == null ? void 0 : error.message) || "");
    if (msg.includes("cancel"))
      return false;
    common_vendor.index.showToast({ title: "导入微信地址失败", icon: "none" });
    return false;
  }
}
exports.importWxAddress = importWxAddress;
