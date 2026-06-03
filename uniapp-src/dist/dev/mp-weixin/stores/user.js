"use strict";
const common_vendor = require("../common/vendor.js");
function readStoredUser() {
  try {
    return common_vendor.index.getStorageSync("userInfo") || common_vendor.index.getStorageSync("user_info") || null;
  } catch (error) {
    return null;
  }
}
function readStoredToken() {
  try {
    return common_vendor.index.getStorageSync("h5_token") || common_vendor.index.getStorageSync("token") || "";
  } catch (error) {
    return "";
  }
}
const useUserStore = common_vendor.defineStore("user", {
  state: () => ({
    token: readStoredToken(),
    userInfo: readStoredUser()
  }),
  actions: {
    setToken(token) {
      this.token = token || "";
      common_vendor.index.setStorageSync("h5_token", this.token);
      common_vendor.index.setStorageSync("token", this.token);
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo || null;
      common_vendor.index.setStorageSync("userInfo", this.userInfo);
      common_vendor.index.setStorageSync("h5_user_info", this.userInfo);
      common_vendor.index.setStorageSync("h5Customer", this.userInfo);
      common_vendor.index.setStorageSync("customer", this.userInfo);
    },
    clearAuth() {
      this.token = "";
      this.userInfo = null;
      common_vendor.index.removeStorageSync("h5_token");
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.removeStorageSync("h5_user_info");
      common_vendor.index.removeStorageSync("h5Customer");
      common_vendor.index.removeStorageSync("customer");
    }
  }
});
exports.useUserStore = useUserStore;
