"use strict";
const common_vendor = require("../../common/vendor.js");
function toast(title, icon = "none") {
  if (!title)
    return;
  common_vendor.index.showToast({ title, icon });
}
function parseScene(scene = "") {
  const result = {};
  if (!scene)
    return result;
  decodeURIComponent(scene).split("&").forEach((part) => {
    const [key, value] = part.includes(":") ? part.split(":") : part.split("=");
    if (key)
      result[key] = value;
  });
  return result;
}
function normalizeLiveOptions(query = {}) {
  const sceneData = parseScene(query.scene);
  return {
    ...query,
    ...sceneData,
    live_id: query.live_id || sceneData.live_id || query.room_id || sceneData.room_id || "",
    referee_id: query.referee_id || query.uid || sceneData.referee_id || sceneData.uid || "",
    store_id: query.store_id || sceneData.store_id || ""
  };
}
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
function getLiveStream(detail = {}) {
  return detail.live_url || detail.push_url || detail.pull_url || detail.play_url || detail.url || detail.rtmp_url || detail.m3u8_url || "";
}
function isEndedStatus(status) {
  return [102, 103, 104, 109].includes(Number(status));
}
function isWaitingStatus(status) {
  return [100, 105, 106, 107].includes(Number(status));
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
exports.getLiveStream = getLiveStream;
exports.goBackOrHome = goBackOrHome;
exports.isEndedStatus = isEndedStatus;
exports.isWaitingStatus = isWaitingStatus;
exports.normalizeLiveOptions = normalizeLiveOptions;
exports.requestWithVm = requestWithVm;
exports.toast = toast;
