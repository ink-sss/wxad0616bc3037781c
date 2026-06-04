"use strict";
const common_vendor = require("../../common/vendor.js");
const platform_weixin_auth = require("../../platform/weixin/auth.js");
const platform_weixin_payment = require("../../platform/weixin/payment.js");
const api_miniprogramLogin = require("../../api/miniprogram-login.js");
function toast(title) {
  common_vendor.index.showToast({ title, icon: "none" });
}
function mobileValid(mobile) {
  return /^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile || "");
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
function bindMiniProgramMobile(userId, event) {
  if (!userId)
    return Promise.reject(new Error("缺少用户 ID，请重新登录"));
  const detail = phonePayload(event);
  return loginCode().then((code) => api_miniprogramLogin.bindMobileMiniProgram({
    code,
    user_id: userId,
    encrypted_data: detail.encrypted_data,
    iv: detail.iv
  }));
}
function requestTransfer(params) {
  return platform_weixin_payment.requestMerchantTransfer(params);
}
function normalizeListPage(payload = {}) {
  const list = payload.list || payload;
  if (Array.isArray(list)) {
    return {
      rows: list,
      currentPage: 1,
      lastPage: 1
    };
  }
  return {
    rows: Array.isArray(list.data) ? list.data : [],
    currentPage: Number(list.current_page || 1),
    lastPage: Number(list.last_page || 1)
  };
}
function dateText(value) {
  const text = String(value || "").trim();
  return text.length >= 10 ? text.slice(0, 10) : text;
}
exports.bindMiniProgramMobile = bindMiniProgramMobile;
exports.dateText = dateText;
exports.mobileValid = mobileValid;
exports.normalizeListPage = normalizeListPage;
exports.requestTransfer = requestTransfer;
exports.toast = toast;
