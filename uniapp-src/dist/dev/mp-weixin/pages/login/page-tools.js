"use strict";
const common_vendor = require("../../common/vendor.js");
const platform_weixin_auth = require("../../platform/weixin/auth.js");
function toast(title) {
  common_vendor.index.showToast({ title, icon: "none" });
}
function getCurrentRedirect(defaultUrl = "/pages/user/index/index") {
  const route = common_vendor.index.getStorageSync("currentPage");
  const options = common_vendor.index.getStorageSync("currentPageOptions") || {};
  if (!route)
    return defaultUrl;
  const query = Object.keys(options).map((key) => `${key}=${encodeURIComponent(options[key])}`).join("&");
  return `/${route}${query ? `?${query}` : ""}`;
}
function saveLoginSession(data = {}) {
  if (data.token)
    common_vendor.index.setStorageSync("token", data.token);
  if (data.user_id)
    common_vendor.index.setStorageSync("user_id", data.user_id);
  if (data.shop_supplier_id)
    common_vendor.index.setStorageSync("shop_supplier_id", data.shop_supplier_id);
  const app = getApp();
  if (app && app.globalData) {
    app.globalData.is_login = true;
    app.globalData.imUserId = data.im_user_id || app.globalData.imUserId;
    app.globalData.imUserSig = data.im_user_sig || app.globalData.imUserSig;
  }
  if (app && typeof app.imLogin === "function")
    app.imLogin();
}
function loginCode() {
  return platform_weixin_auth.login({ provider: "weixin" }).then((res) => res.code);
}
function phonePayload(event) {
  const phone = platform_weixin_auth.normalizePhoneNumberEvent(event);
  return {
    encrypted_data: phone.encryptedData,
    iv: phone.iv,
    code: phone.code
  };
}
function mobileValid(mobile) {
  return /^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile || "");
}
exports.getCurrentRedirect = getCurrentRedirect;
exports.loginCode = loginCode;
exports.mobileValid = mobileValid;
exports.phonePayload = phonePayload;
exports.saveLoginSession = saveLoginSession;
exports.toast = toast;
