import { firstTruthyQueryValue, isWxAddrDoneHit } from "./useLivePurchase.js";
import { normalizeLiveRouteOptions } from "@/utils/live-route.js";
import { bindIDManager } from "@/services/bindid";
import { saveH5AuthContext, syncH5AuthSession } from "@/services/h5-auth-context";
import { saveLiveRoomContext } from "@/utils/live-room-context";

const PRELOAD_DETAIL_TTL_MS = 30000;
let moduleLevelPreloadedDetail = null;

export function consumePreloadedLiveDetail(roomCode) {
  if (!moduleLevelPreloadedDetail) return null;
  const cached = moduleLevelPreloadedDetail;
  moduleLevelPreloadedDetail = null;
  if (!cached.detail || cached.roomCode !== roomCode) return null;
  if (Date.now() - cached.ts > PRELOAD_DETAIL_TTL_MS) return null;
  return cached.detail;
}

function rememberPreloadedLiveDetail(roomCode, detail) {
  if (!roomCode || !detail) return;
  moduleLevelPreloadedDetail = { roomCode, detail, ts: Date.now() };
}

function stripRuntimeOnlyParams(options, params) {
  params.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      delete options[key];
    }
  });
}

function isTestLiveEntryRequested(options = {}) {
  return ["useTestLive", "testLive", "debugLive", "debug_live"].some((key) => (
    options[key] === "1" || options[key] === 1 || options[key] === true
  ));
}

function getDebugLiveEntryConfig() {
  try {
    return {
      roomCode: String(uni.getStorageSync("debug_live_room_code") || "").trim(),
      tenantId: String(uni.getStorageSync("debug_live_tenant_id") || "").trim(),
      liveType: String(uni.getStorageSync("debug_live_type") || "").trim(),
      _tc: String(uni.getStorageSync("debug_live_tc") || "").trim(),
      wx_token: String(uni.getStorageSync("debug_live_wx_token") || "").trim(),
    };
  } catch (e) {
    return { roomCode: "", tenantId: "", liveType: "", _tc: "", wx_token: "" };
  }
}

function getQueryToken(options = {}) {
  return options.wx_token || options.wxToken || options.h5_token || options.h5Token || options.token || "";
}

function buildLiveEntryContext(options = {}) {
  const roomCode = options.roomCode || options.code || options.room_code || "";
  const liveId = options.liveId || options.live_id || options.roomId || options.room_id || options.id || "";
  const roomId = options.roomId || options.room_id || liveId || "";
  const cover = options.cover || options.liveCover || "";
  const context = {
    ...options,
    roomCode,
    room_code: roomCode,
    liveId,
    live_id: liveId,
    roomId,
    room_id: roomId,
    tenantId: options.tenantId || options.tenant_id || "",
    tenant_id: options.tenantId || options.tenant_id || "",
    liveType: options.liveType || options.live_type || "",
    live_type: options.liveType || options.live_type || "",
    _tc: options._tc || options.tc || "",
    cover,
    liveCover: options.liveCover || cover,
  };
  stripRuntimeOnlyParams(context, [
    "scene",
    "wx_token",
    "wxToken",
    "h5_token",
    "h5Token",
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
    "jwtToken",
    "authorization",
    "Authorization",
    "X-Token",
    "x-token",
    "xToken",
    "wx_expires",
  ]);
  return context;
}

function hasLiveEntryContext(options = {}) {
  const context = buildLiveEntryContext(options);
  return !!(context.roomCode || context.liveId || context.tenantId || context._tc || context.liveType || context.cover);
}

function persistQueryToken(options, ctx) {
  const token = getQueryToken(options);
  if (!token) return;
  const result = syncH5AuthSession({ ...options, wx_token: token, token });
  if (!ctx.userStore.token) {
    ctx.userStore.setToken(result?.token || token);
  }
}

function persistLiveEntryContext(options) {
  if (!hasLiveEntryContext(options)) return null;
  const context = buildLiveEntryContext(options);
  const saved = saveH5AuthContext(context);
  saveLiveRoomContext(context);
  return saved;
}

function handleWxAddressReturn(options, ctx) {
  const wxAddrDoneRaw = options.wxAddrDone;
  if (!isWxAddrDoneHit(wxAddrDoneRaw)) return;
  const newAddrIdRaw = firstTruthyQueryValue(options.newAddrId);
  ctx.pendingRecoverBuyCtx.value = { newAddrId: String(newAddrIdRaw || "") };
  ctx.setShowEntryOverlay(false);
  ctx.setShowWxAddrDonePlayBtn(true);
  stripRuntimeOnlyParams(options, ["wxAddrDone", "newAddrId"]);
}

function isSubscribeBackHit(value) {
  return value === "1" ||
    value === 1 ||
    value === true ||
    (Array.isArray(value) && value.some((v) => String(v) === "1")) ||
    (typeof value === "string" && value.startsWith("1"));
}

function isLoginSkippedHit(value) {
  return value === "1" ||
    value === 1 ||
    value === true ||
    (Array.isArray(value) && value.some((v) => String(v) === "1")) ||
    (typeof value === "string" && value.startsWith("1"));
}

function handleSubscribeBack(options, ctx) {
  if (!isSubscribeBackHit(options.subscribeBack)) return;
  ctx.setPendingSubscribeBack(true);
  ctx.setShowEntryOverlay(false);
  stripRuntimeOnlyParams(options, ["subscribeBack"]);
}

function persistUrlBindId(urlBindId) {
  if (!urlBindId) return;
  try {
    const bindExpire = Date.now() + 2 * 365 * 24 * 60 * 60 * 1000;
    uni.setStorageSync("currentBindId", urlBindId);
    uni.setStorageSync("bindExpireTime", String(bindExpire));
  } catch (e) {}
}

async function handleUrlBindId(options, ctx) {
  const urlBindId = options?.bindId || options?.bind_id || "";
  if (!urlBindId) return;
  persistUrlBindId(urlBindId);
  const token = getQueryToken(options);
  if (token && !ctx.userStore.token) {
    const result = syncH5AuthSession({ ...options, wx_token: token, token });
    if (!ctx.userStore.token) {
      ctx.userStore.setToken(result?.token || token);
    }
  }
  if (!ctx.userStore.token) {
    try {
      bindIDManager.setBindId?.(urlBindId);
      await bindIDManager.smartAutoLogin?.();
    } catch (e) {}
  }
  stripRuntimeOnlyParams(options, ["bindId", "bind_id"]);
}

async function preloadLiveTenant(options, getLiveDetail) {
  let preloadTenantId = 0;
  let preloadDetail = null;
  const roomCode = options?.roomCode || "";
  if (!roomCode) return { preloadTenantId, preloadDetail };
  try {
    preloadDetail = await getLiveDetail(roomCode);
    if (preloadDetail?.tenantId) preloadTenantId = preloadDetail.tenantId;
    rememberPreloadedLiveDetail(roomCode, preloadDetail);
  } catch (e) {}
  return { preloadTenantId, preloadDetail };
}

async function resolveLoginTenant(options, ctx) {
  const preload = await preloadLiveTenant(options, ctx.getLiveDetail);
  if (preload.preloadTenantId) return preload.preloadTenantId;
  const roomCode = options?.roomCode || "";
  if (!roomCode) return "";
  try {
    const detail = await ctx.getLiveDetail(roomCode);
    if (detail?.tenantId) {
      rememberPreloadedLiveDetail(roomCode, detail);
      return detail.tenantId;
    }
  } catch (e) {}
  return "";
}

async function redirectToLoginIfNeeded(options, ctx) {
  if (isLoginSkippedHit(options.loginSkipped || options.login_skipped)) {
    stripRuntimeOnlyParams(options, ["loginSkipped", "login_skipped"]);
    return false;
  }
  if (ctx.userStore.token || ctx.isDebugLocalLogin()) return false;
  const loginTenantId = await resolveLoginTenant(options, ctx);
  if (ctx.userStore.token || ctx.isDebugLocalLogin()) return false;
  const queryParts = Object.entries(options || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  const originalPath = "/pages/broadcast/entry" + (queryParts.length ? `?${queryParts.join("&")}` : "");
  const tenantParam = loginTenantId ? `&tenantId=${loginTenantId}` : "";
  uni.redirectTo({
    url: `/pagesPlus/main/login/login?redirect=${encodeURIComponent(originalPath)}${tenantParam}`,
  });
  return true;
}

function setupViewportState(ctx) {
  try {
    const sys = uni.getSystemInfoSync();
    const insetBottom =
      (sys.safeAreaInsets && sys.safeAreaInsets.bottom) ||
      (sys.safeArea ? sys.screenHeight - sys.safeArea.bottom : 0) ||
      0;
    ctx.setSafeBottom(insetBottom);
    const platformText = String(sys.platform || sys.osName || sys.system || "").toLowerCase();
    ctx.setIsIOSKeyboardMode(/ios|iphone|ipad|ipod/.test(platformText));
  } catch (e) {}
  ctx.syncKeyboardViewportBaseHeight(true);
}

function hasExplicitLiveTarget(options = {}) {
  return !!(options.roomCode || options.liveId || options.live_id || options.roomId || options.room_id);
}

function applyDebugLiveEntryOptions(options, ctx) {
  if (!isTestLiveEntryRequested(options)) return options;
  const debugEntry = getDebugLiveEntryConfig();
  const roomCode = options.roomCode || options.roomId || debugEntry.roomCode;
  if (!roomCode && !hasExplicitLiveTarget(options)) {
    try {
      uni.showToast({ title: "未配置调试直播间", icon: "none" });
    } catch (e) {}
    return options;
  }
  const nextOptions = {
    ...options,
    roomCode,
    tenantId: options.tenantId || debugEntry.tenantId,
    liveType: options.liveType || debugEntry.liveType,
    _tc: options._tc || debugEntry._tc,
  };
  const debugToken = options.wx_token || options.wxToken || debugEntry.wx_token;
  if (debugToken) nextOptions.wx_token = debugToken;
  if (nextOptions.wx_token) {
    syncH5AuthSession({ ...nextOptions, wx_token: nextOptions.wx_token, token: nextOptions.wx_token });
  }
  return nextOptions;
}

export async function runLiveEntryBootstrap(options, ctx) {
  options = normalizeLiveRouteOptions({ ...(options || {}) });
  options = applyDebugLiveEntryOptions(options, ctx);
  handleWxAddressReturn(options, ctx);
  handleSubscribeBack(options, ctx);
  await handleUrlBindId(options, ctx);
  persistQueryToken(options, ctx);
  persistLiveEntryContext(options);
  stripRuntimeOnlyParams(options, ["wx_token", "wxToken", "h5_token", "h5Token", "wx_expires"]);
  if (await redirectToLoginIfNeeded(options, ctx)) return;
  setupViewportState(ctx);
  ctx.initLive(options);
  ctx.nextTick(() => ctx.scrollToBottom());
}
