import { h5Get, h5Post } from "./h5";

function withMiniProgramAuthMeta(payload = {}) {
  return {
    ...payload,
    source: payload.source || "mp-weixin",
    sourceClient: payload.sourceClient || "mp-weixin",
    platform: payload.platform || "miniProgram",
    authType: payload.authType || "miniProgramCode",
  };
}

export function wechatSilentLogin(payload = {}) {
  return h5Post("/h5/auth/wechatSilentLogin", withMiniProgramAuthMeta(payload), {
    authRedirect: false,
  });
}

export function loginByWechatCode(code, tenantId, context = {}) {
  return wechatSilentLogin({
    ...context,
    code,
    tenantId: tenantId || context.tenantId || 0,
  });
}

export function smsLogin(payload = {}) {
  return h5Post(
    "/h5/auth/smsLogin",
    {
      phone: payload.phone || "",
      code: payload.code || payload.smsCode || "",
      tenantId: payload.tenantId || 0,
      source: payload.source || "mp-weixin",
    },
    { authRedirect: false },
  );
}

export function loginBySms(phone, smsCode, tenantId, context = {}) {
  return smsLogin({
    ...context,
    phone,
    smsCode,
    tenantId,
  });
}

export function sendSmsCode(phone, tenantId, context = {}) {
  return h5Post(
    "/h5/auth/sendSmsCode",
    {
      ...context,
      phone,
      tenantId: tenantId || context.tenantId || 0,
      source: context.source || "mp-weixin",
    },
    { authRedirect: false },
  );
}

export function getWechatAuthConfig(tenantId) {
  return h5Get(
    "/h5/wechat/authConfig",
    tenantId ? { tenantId } : {},
    { authRedirect: false },
  );
}
