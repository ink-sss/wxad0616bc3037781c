"use strict";
const platform_weixin_runtime = require("./runtime.js");
function getUpdateManager() {
  const api = platform_weixin_runtime.getWeixinApi("getUpdateManager");
  if (!api || typeof api.getUpdateManager !== "function") {
    return null;
  }
  return api.getUpdateManager();
}
function bindUpdateManager(options = {}) {
  const manager = getUpdateManager();
  if (!manager) {
    return null;
  }
  if (typeof options.onCheckForUpdate === "function") {
    manager.onCheckForUpdate(options.onCheckForUpdate);
  }
  if (typeof options.onUpdateReady === "function") {
    manager.onUpdateReady(options.onUpdateReady);
  }
  if (typeof options.onUpdateFailed === "function") {
    manager.onUpdateFailed(options.onUpdateFailed);
  }
  return manager;
}
function applyUpdate(manager = getUpdateManager()) {
  if (manager && typeof manager.applyUpdate === "function") {
    manager.applyUpdate();
    return true;
  }
  return false;
}
exports.applyUpdate = applyUpdate;
exports.bindUpdateManager = bindUpdateManager;
