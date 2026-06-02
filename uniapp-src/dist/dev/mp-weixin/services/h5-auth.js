"use strict";
const platform_weixin_auth = require("../platform/weixin/auth.js");
const api_auth = require("../api/auth.js");
const services_h5AuthContext = require("./h5-auth-context.js");
async function getMiniProgramWechatCode() {
  const res = await platform_weixin_auth.login({ provider: "weixin" });
  const code = (res == null ? void 0 : res.code) || "";
  if (!code)
    throw new Error("微信登录未返回 code");
  return code;
}
function buildLoginPayload(code, context = {}) {
  return {
    code,
    tenantId: context.tenantId || 0,
    roomCode: context.roomCode || "",
    roomId: context.roomId || "",
    liveId: context.liveId || "",
    bindId: context.bindId || "",
    redirect: context.redirect || "",
    liveType: context.liveType || "",
    termId: context.termId || "",
    videoId: context.videoId || ""
  };
}
function normalizeLoginError(error) {
  const message = (error == null ? void 0 : error.msg) || (error == null ? void 0 : error.message) || (error == null ? void 0 : error.errMsg) || "H5小程序微信登录失败";
  const next = new Error(message);
  next.raw = error;
  return next;
}
async function loginWithMiniProgramWechat(input = {}) {
  const context = services_h5AuthContext.saveH5AuthContext(services_h5AuthContext.buildH5AuthContext(input));
  if (!input.forceLogin && services_h5AuthContext.hasH5Token()) {
    return {
      token: services_h5AuthContext.getH5Token(),
      customer: services_h5AuthContext.readCachedH5Customer(),
      context,
      reused: true
    };
  }
  const code = await getMiniProgramWechatCode();
  let result;
  try {
    result = await api_auth.wechatSilentLogin(buildLoginPayload(code, context));
  } catch (error) {
    throw normalizeLoginError(error);
  }
  if (result == null ? void 0 : result.needAuth) {
    throw new Error("后端返回 needAuth，但小程序不能走网页 OAuth/JSSDK；请支持 mp-weixin code 换取 H5 token");
  }
  const session = services_h5AuthContext.syncH5AuthSession(result);
  if (!session.token) {
    const error = new Error("H5小程序微信登录未返回 token，请后端支持 /h5/auth/wechatSilentLogin 使用 mp-weixin code 换取 H5 token");
    error.raw = result;
    throw error;
  }
  return {
    ...session,
    context,
    raw: result,
    reused: false
  };
}
async function loginAndRedirectWithMiniProgramWechat(input = {}) {
  const session = await loginWithMiniProgramWechat(input);
  services_h5AuthContext.redirectAfterH5Login(session.context);
  return session;
}
exports.loginAndRedirectWithMiniProgramWechat = loginAndRedirectWithMiniProgramWechat;
