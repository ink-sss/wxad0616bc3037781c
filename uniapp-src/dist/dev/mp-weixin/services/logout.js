"use strict";
const common_vendor = require("../common/vendor.js");
const stores_user = require("../stores/user.js");
function clearWechatAuthCache() {
  try {
    common_vendor.index.removeStorageSync("wx_auth_pending");
    common_vendor.index.removeStorageSync("wx_oauth_redirect");
    common_vendor.index.removeStorageSync("wx_upgraded_userinfo");
  } catch (error) {
  }
}
async function logoutAndRedirect(redirectUrl = "", targetTenantId = 0) {
  const userStore = stores_user.useUserStore();
  userStore.clearAuth();
  clearWechatAuthCache();
  const queryParts = [];
  if (redirectUrl)
    queryParts.push(`redirect=${encodeURIComponent(redirectUrl)}`);
  if (targetTenantId)
    queryParts.push(`tenantId=${encodeURIComponent(targetTenantId)}`);
  const url = `/pages/login/login${queryParts.length ? `?${queryParts.join("&")}` : ""}`;
  common_vendor.index.reLaunch({ url });
}
exports.logoutAndRedirect = logoutAndRedirect;
