"use strict";
const platform_weixin_runtime = require("./runtime.js");
function navigateToMiniProgram(options = {}) {
  return platform_weixin_runtime.promisifyApi("navigateToMiniProgram", options);
}
function openCustomerServiceChat(options = {}) {
  return platform_weixin_runtime.promisifyApi("openCustomerServiceChat", options);
}
function makePhoneCall(phoneNumber, options = {}) {
  return platform_weixin_runtime.promisifyApi("makePhoneCall", {
    ...options,
    phoneNumber
  }, { preferUni: true });
}
function webViewProps(src, options = {}) {
  return {
    src,
    progressbarColor: options.progressbarColor,
    fullscreen: options.fullscreen
  };
}
exports.makePhoneCall = makePhoneCall;
exports.navigateToMiniProgram = navigateToMiniProgram;
exports.openCustomerServiceChat = openCustomerServiceChat;
exports.webViewProps = webViewProps;
