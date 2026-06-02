"use strict";
const api_h5 = require("./h5.js");
function withMiniProgramAuthMeta(payload = {}) {
  return {
    ...payload,
    source: payload.source || "mp-weixin",
    sourceClient: payload.sourceClient || "mp-weixin",
    platform: payload.platform || "miniProgram",
    authType: payload.authType || "miniProgramCode"
  };
}
function wechatSilentLogin(payload = {}) {
  return api_h5.h5Post("/h5/auth/wechatSilentLogin", withMiniProgramAuthMeta(payload), {
    authRedirect: false
  });
}
exports.wechatSilentLogin = wechatSilentLogin;
