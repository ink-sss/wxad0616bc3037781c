"use strict";
const platform_weixin_runtime = require("./runtime.js");
function login(options = {}) {
  return platform_weixin_runtime.promisifyApi("login", options, { preferUni: true });
}
function getSetting(options = {}) {
  return platform_weixin_runtime.promisifyApi("getSetting", options, { preferUni: true });
}
function authorize(scope, options = {}) {
  return platform_weixin_runtime.promisifyApi("authorize", { ...options, scope }, { preferUni: true });
}
function openSetting(options = {}) {
  return platform_weixin_runtime.promisifyApi("openSetting", options, { preferUni: true });
}
function normalizePhoneNumberEvent(event) {
  const detail = event && event.detail ? event.detail : event;
  if (!detail || detail.errMsg !== "getPhoneNumber:ok") {
    const error = new Error(detail && detail.errMsg || "getPhoneNumber failed");
    error.detail = detail;
    throw error;
  }
  return {
    code: detail.code || "",
    encryptedData: detail.encryptedData || "",
    iv: detail.iv || "",
    cloudID: detail.cloudID || "",
    detail
  };
}
function normalizeAvatarEvent(event) {
  const detail = event && event.detail ? event.detail : event;
  return {
    avatarUrl: detail && detail.avatarUrl ? detail.avatarUrl : "",
    detail
  };
}
exports.authorize = authorize;
exports.getSetting = getSetting;
exports.login = login;
exports.normalizeAvatarEvent = normalizeAvatarEvent;
exports.normalizePhoneNumberEvent = normalizePhoneNumberEvent;
exports.openSetting = openSetting;
