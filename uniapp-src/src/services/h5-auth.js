import { login as miniProgramLogin } from "@/platform/weixin/auth";
import { wechatSilentLogin } from "@/api/auth";
import {
  buildH5AuthContext,
  getH5Token,
  hasH5Token,
  readCachedH5Customer,
  redirectAfterH5Login,
  saveH5AuthContext,
  syncH5AuthSession,
} from "./h5-auth-context";

export async function getMiniProgramWechatCode() {
  const res = await miniProgramLogin({ provider: "weixin" });
  const code = res?.code || "";
  if (!code) throw new Error("微信登录未返回 code");
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
    videoId: context.videoId || "",
  };
}

function normalizeLoginError(error) {
  const message = error?.msg || error?.message || error?.errMsg || "H5小程序微信登录失败";
  const next = new Error(message);
  next.raw = error;
  return next;
}

export async function loginWithMiniProgramWechat(input = {}) {
  const context = saveH5AuthContext(buildH5AuthContext(input));
  if (!input.forceLogin && hasH5Token()) {
    return {
      token: getH5Token(),
      customer: readCachedH5Customer(),
      context,
      reused: true,
    };
  }

  const code = await getMiniProgramWechatCode();
  let result;
  try {
    result = await wechatSilentLogin(buildLoginPayload(code, context));
  } catch (error) {
    throw normalizeLoginError(error);
  }

  if (result?.needAuth) {
    throw new Error("后端返回 needAuth，但小程序不能走网页 OAuth/JSSDK；请支持 mp-weixin code 换取 H5 token");
  }

  const session = syncH5AuthSession(result);
  if (!session.token) {
    const error = new Error("H5小程序微信登录未返回 token，请后端支持 /h5/auth/wechatSilentLogin 使用 mp-weixin code 换取 H5 token");
    error.raw = result;
    throw error;
  }

  return {
    ...session,
    context,
    raw: result,
    reused: false,
  };
}

export async function loginAndRedirectWithMiniProgramWechat(input = {}) {
  const session = await loginWithMiniProgramWechat(input);
  redirectAfterH5Login(session.context);
  return session;
}
