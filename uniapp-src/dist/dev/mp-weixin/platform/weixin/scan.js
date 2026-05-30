"use strict";
const platform_weixin_runtime = require("./runtime.js");
function scanCode(options = {}) {
  return platform_weixin_runtime.promisifyApi("scanCode", options, { preferUni: true });
}
function scanQrCode(options = {}) {
  return scanCode({
    onlyFromCamera: true,
    scanType: ["qrCode"],
    ...options
  });
}
exports.scanCode = scanCode;
exports.scanQrCode = scanQrCode;
