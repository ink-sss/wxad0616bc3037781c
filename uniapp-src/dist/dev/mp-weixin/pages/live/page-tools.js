"use strict";
const common_vendor = require("../../common/vendor.js");
function requestWithVm(vm, method, endpoint, data = {}) {
  return new Promise((resolve, reject) => {
    const fn = vm && vm[method];
    if (typeof fn !== "function") {
      reject(new Error(`${method} is not installed on this page instance`));
      return;
    }
    fn.call(vm, endpoint, data, resolve, reject);
  });
}
function goBackOrHome() {
  const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
  if (pages.length > 1) {
    common_vendor.index.navigateBack({});
    return;
  }
  common_vendor.index.switchTab({
    url: "/pages/index/index",
    fail() {
      common_vendor.index.reLaunch({ url: "/pages/index/index" });
    }
  });
}
exports.goBackOrHome = goBackOrHome;
exports.requestWithVm = requestWithVm;
