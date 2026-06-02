import { defineStore } from "pinia";

function readStoredUser() {
  try {
    return uni.getStorageSync("userInfo") || uni.getStorageSync("user_info") || null;
  } catch (error) {
    return null;
  }
}

function readStoredToken() {
  try {
    return uni.getStorageSync("h5_token") || uni.getStorageSync("token") || "";
  } catch (error) {
    return "";
  }
}

export const useUserStore = defineStore("user", {
  state: () => ({
    token: readStoredToken(),
    userInfo: readStoredUser(),
  }),
  actions: {
    setToken(token) {
      this.token = token || "";
      uni.setStorageSync("h5_token", this.token);
      uni.setStorageSync("token", this.token);
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo || null;
      uni.setStorageSync("userInfo", this.userInfo);
      uni.setStorageSync("h5_user_info", this.userInfo);
      uni.setStorageSync("h5Customer", this.userInfo);
      uni.setStorageSync("customer", this.userInfo);
    },
    clearAuth() {
      this.token = "";
      this.userInfo = null;
      uni.removeStorageSync("h5_token");
      uni.removeStorageSync("token");
      uni.removeStorageSync("userInfo");
      uni.removeStorageSync("h5_user_info");
      uni.removeStorageSync("h5Customer");
      uni.removeStorageSync("customer");
    },
  },
});
