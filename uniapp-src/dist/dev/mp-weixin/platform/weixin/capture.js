"use strict";
const platform_weixin_runtime = require("./runtime.js");
function onScreenRecordingStateChanged(handler) {
  const api = platform_weixin_runtime.getWeixinApi("onScreenRecordingStateChanged");
  if (api && typeof api.onScreenRecordingStateChanged === "function") {
    api.onScreenRecordingStateChanged(handler);
  }
}
function offScreenRecordingStateChanged(handler) {
  const api = platform_weixin_runtime.getWeixinApi("offScreenRecordingStateChanged");
  if (api && typeof api.offScreenRecordingStateChanged === "function") {
    api.offScreenRecordingStateChanged(handler);
  }
}
exports.offScreenRecordingStateChanged = offScreenRecordingStateChanged;
exports.onScreenRecordingStateChanged = onScreenRecordingStateChanged;
