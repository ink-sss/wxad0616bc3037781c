"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_broadcast_composables_useLivePurchase = require("./useLivePurchase.js");
const utils_liveRoute = require("../../../utils/live-route.js");
const services_bindid = require("../../../services/bindid.js");
const services_h5AuthContext = require("../../../services/h5-auth-context.js");
const utils_liveRoomContext = require("../../../utils/live-room-context.js");
const PRELOAD_DETAIL_TTL_MS = 3e4;
let moduleLevelPreloadedDetail = null;
function consumePreloadedLiveDetail(roomCode) {
  if (!moduleLevelPreloadedDetail)
    return null;
  const cached = moduleLevelPreloadedDetail;
  moduleLevelPreloadedDetail = null;
  if (!cached.detail || cached.roomCode !== roomCode)
    return null;
  if (Date.now() - cached.ts > PRELOAD_DETAIL_TTL_MS)
    return null;
  return cached.detail;
}
function rememberPreloadedLiveDetail(roomCode, detail) {
  if (!roomCode || !detail)
    return;
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
  return ["useTestLive", "testLive", "debugLive", "debug_live"].some((key) => options[key] === "1" || options[key] === 1 || options[key] === true);
}
function getDebugLiveEntryConfig() {
  try {
    return {
      roomCode: String(common_vendor.index.getStorageSync("debug_live_room_code") || "").trim(),
      tenantId: String(common_vendor.index.getStorageSync("debug_live_tenant_id") || "").trim(),
      liveType: String(common_vendor.index.getStorageSync("debug_live_type") || "").trim(),
      _tc: String(common_vendor.index.getStorageSync("debug_live_tc") || "").trim(),
      wx_token: String(common_vendor.index.getStorageSync("debug_live_wx_token") || "").trim()
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
    liveCover: options.liveCover || cover
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
    "wx_expires"
  ]);
  return context;
}
function hasLiveEntryContext(options = {}) {
  const context = buildLiveEntryContext(options);
  return !!(context.roomCode || context.liveId || context.tenantId || context._tc || context.liveType || context.cover);
}
function persistQueryToken(options, ctx) {
  const token = getQueryToken(options);
  if (!token)
    return;
  const result = services_h5AuthContext.syncH5AuthSession({ ...options, wx_token: token, token });
  if (!ctx.userStore.token) {
    ctx.userStore.setToken((result == null ? void 0 : result.token) || token);
  }
}
function persistLiveEntryContext(options) {
  if (!hasLiveEntryContext(options))
    return null;
  const context = buildLiveEntryContext(options);
  const saved = services_h5AuthContext.saveH5AuthContext(context);
  utils_liveRoomContext.saveLiveRoomContext(context);
  return saved;
}
function handleWxAddressReturn(options, ctx) {
  const wxAddrDoneRaw = options.wxAddrDone;
  if (!pages_broadcast_composables_useLivePurchase.isWxAddrDoneHit(wxAddrDoneRaw))
    return;
  const newAddrIdRaw = pages_broadcast_composables_useLivePurchase.firstTruthyQueryValue(options.newAddrId);
  ctx.pendingRecoverBuyCtx.value = { newAddrId: String(newAddrIdRaw || "") };
  ctx.setShowEntryOverlay(false);
  ctx.setShowWxAddrDonePlayBtn(true);
  stripRuntimeOnlyParams(options, ["wxAddrDone", "newAddrId"]);
}
function isSubscribeBackHit(value) {
  return value === "1" || value === 1 || value === true || Array.isArray(value) && value.some((v) => String(v) === "1") || typeof value === "string" && value.startsWith("1");
}
function isLoginSkippedHit(value) {
  return value === "1" || value === 1 || value === true || Array.isArray(value) && value.some((v) => String(v) === "1") || typeof value === "string" && value.startsWith("1");
}
function handleSubscribeBack(options, ctx) {
  if (!isSubscribeBackHit(options.subscribeBack))
    return;
  ctx.setPendingSubscribeBack(true);
  ctx.setShowEntryOverlay(false);
  stripRuntimeOnlyParams(options, ["subscribeBack"]);
}
function persistUrlBindId(urlBindId) {
  if (!urlBindId)
    return;
  try {
    const bindExpire = Date.now() + 2 * 365 * 24 * 60 * 60 * 1e3;
    common_vendor.index.setStorageSync("currentBindId", urlBindId);
    common_vendor.index.setStorageSync("bindExpireTime", String(bindExpire));
  } catch (e) {
  }
}
async function handleUrlBindId(options, ctx) {
  var _a, _b, _c, _d;
  const urlBindId = (options == null ? void 0 : options.bindId) || (options == null ? void 0 : options.bind_id) || "";
  if (!urlBindId)
    return;
  persistUrlBindId(urlBindId);
  const token = getQueryToken(options);
  if (token && !ctx.userStore.token) {
    const result = services_h5AuthContext.syncH5AuthSession({ ...options, wx_token: token, token });
    if (!ctx.userStore.token) {
      ctx.userStore.setToken((result == null ? void 0 : result.token) || token);
    }
  }
  if (!ctx.userStore.token) {
    try {
      (_b = (_a = services_bindid.bindIDManager).setBindId) == null ? void 0 : _b.call(_a, urlBindId);
      await ((_d = (_c = services_bindid.bindIDManager).smartAutoLogin) == null ? void 0 : _d.call(_c));
    } catch (e) {
    }
  }
  stripRuntimeOnlyParams(options, ["bindId", "bind_id"]);
}
async function preloadLiveTenant(options, getLiveDetail) {
  let preloadTenantId = 0;
  let preloadDetail = null;
  const roomCode = (options == null ? void 0 : options.roomCode) || "";
  if (!roomCode)
    return { preloadTenantId, preloadDetail };
  try {
    preloadDetail = await getLiveDetail(roomCode);
    if (preloadDetail == null ? void 0 : preloadDetail.tenantId)
      preloadTenantId = preloadDetail.tenantId;
    rememberPreloadedLiveDetail(roomCode, preloadDetail);
  } catch (e) {
  }
  return { preloadTenantId, preloadDetail };
}
async function resolveLoginTenant(options, ctx) {
  const preload = await preloadLiveTenant(options, ctx.getLiveDetail);
  if (preload.preloadTenantId)
    return preload.preloadTenantId;
  const roomCode = (options == null ? void 0 : options.roomCode) || "";
  if (!roomCode)
    return "";
  try {
    const detail = await ctx.getLiveDetail(roomCode);
    if (detail == null ? void 0 : detail.tenantId) {
      rememberPreloadedLiveDetail(roomCode, detail);
      return detail.tenantId;
    }
  } catch (e) {
  }
  return "";
}
async function redirectToLoginIfNeeded(options, ctx) {
  if (isLoginSkippedHit(options.loginSkipped || options.login_skipped)) {
    stripRuntimeOnlyParams(options, ["loginSkipped", "login_skipped"]);
    return false;
  }
  if (ctx.userStore.token || ctx.isDebugLocalLogin())
    return false;
  const loginTenantId = await resolveLoginTenant(options, ctx);
  if (ctx.userStore.token || ctx.isDebugLocalLogin())
    return false;
  const queryParts = Object.entries(options || {}).filter(([, value]) => value !== void 0 && value !== null && value !== "").map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  const originalPath = "/pages/broadcast/entry" + (queryParts.length ? `?${queryParts.join("&")}` : "");
  const tenantParam = loginTenantId ? `&tenantId=${loginTenantId}` : "";
  common_vendor.index.redirectTo({
    url: `/pages/login/login?redirect=${encodeURIComponent(originalPath)}${tenantParam}`
  });
  return true;
}
function setupViewportState(ctx) {
  try {
    const sys = common_vendor.index.getSystemInfoSync();
    const insetBottom = sys.safeAreaInsets && sys.safeAreaInsets.bottom || (sys.safeArea ? sys.screenHeight - sys.safeArea.bottom : 0) || 0;
    ctx.setSafeBottom(insetBottom);
    const platformText = String(sys.platform || sys.osName || sys.system || "").toLowerCase();
    ctx.setIsIOSKeyboardMode(/ios|iphone|ipad|ipod/.test(platformText));
  } catch (e) {
  }
  ctx.syncKeyboardViewportBaseHeight(true);
}
function hasExplicitLiveTarget(options = {}) {
  return !!(options.roomCode || options.liveId || options.live_id || options.roomId || options.room_id);
}
function applyDebugLiveEntryOptions(options, ctx) {
  if (!isTestLiveEntryRequested(options))
    return options;
  const debugEntry = getDebugLiveEntryConfig();
  const roomCode = options.roomCode || options.roomId || debugEntry.roomCode;
  if (!roomCode && !hasExplicitLiveTarget(options)) {
    try {
      common_vendor.index.showToast({ title: "未配置调试直播间", icon: "none" });
    } catch (e) {
    }
    return options;
  }
  const nextOptions = {
    ...options,
    roomCode,
    tenantId: options.tenantId || debugEntry.tenantId,
    liveType: options.liveType || debugEntry.liveType,
    _tc: options._tc || debugEntry._tc
  };
  const debugToken = options.wx_token || options.wxToken || debugEntry.wx_token;
  if (debugToken)
    nextOptions.wx_token = debugToken;
  if (nextOptions.wx_token) {
    services_h5AuthContext.syncH5AuthSession({ ...nextOptions, wx_token: nextOptions.wx_token, token: nextOptions.wx_token });
  }
  return nextOptions;
}
async function runLiveEntryBootstrap(options, ctx) {
  options = utils_liveRoute.normalizeLiveRouteOptions({ ...options || {} });
  options = applyDebugLiveEntryOptions(options);
  handleWxAddressReturn(options, ctx);
  handleSubscribeBack(options, ctx);
  await handleUrlBindId(options, ctx);
  persistQueryToken(options, ctx);
  persistLiveEntryContext(options);
  stripRuntimeOnlyParams(options, ["wx_token", "wxToken", "h5_token", "h5Token", "wx_expires"]);
  if (await redirectToLoginIfNeeded(options, ctx))
    return;
  setupViewportState(ctx);
  ctx.initLive(options);
  ctx.nextTick(() => ctx.scrollToBottom());
}
exports.consumePreloadedLiveDetail = consumePreloadedLiveDetail;
exports.runLiveEntryBootstrap = runLiveEntryBootstrap;
