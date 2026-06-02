import { createAddress, getAddressList } from "@/api/address";
import { chooseAddress } from "@/platform/weixin/file";

function normalizeWxAddress(wxAddr = {}) {
  return {
    receiverName: wxAddr.userName || "",
    receiverPhone: wxAddr.telNumber || "",
    province: wxAddr.provinceName || "",
    city: wxAddr.cityName || "",
    district: wxAddr.countyName || wxAddr.countryName || "",
    address: wxAddr.detailInfo || "",
    isDefault: 0,
  };
}

export async function importWxAddress() {
  try {
    const wxAddr = await chooseAddress();
    const payload = normalizeWxAddress(wxAddr);
    const existList = await getAddressList().catch(() => []);
    const safeList = Array.isArray(existList) ? existList : [];
    const duplicated = safeList.some(
      (item) =>
        item.receiverName === payload.receiverName &&
        item.receiverPhone === payload.receiverPhone &&
        item.address === payload.address,
    );

    if (duplicated) {
      uni.showToast({ title: "该地址已存在", icon: "none" });
      return true;
    }

    await createAddress(payload);
    uni.showToast({ title: "导入成功", icon: "success" });
    return true;
  } catch (error) {
    const msg = String(error?.errMsg || error?.message || "");
    if (msg.includes("cancel")) return false;
    uni.showToast({ title: "导入微信地址失败", icon: "none" });
    return false;
  }
}
