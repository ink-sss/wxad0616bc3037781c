"use strict";
const platform_weixin_runtime = require("./runtime.js");
function requestSubscribeMessage(tmplIds = [], options = {}) {
  return platform_weixin_runtime.promisifyApi("requestSubscribeMessage", {
    ...options,
    tmplIds
  });
}
exports.requestSubscribeMessage = requestSubscribeMessage;
