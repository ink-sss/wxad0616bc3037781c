"use strict";
const common_vendor = require("../../../common/vendor.js");
const stores_user = require("../../../stores/user.js");
const utils_urlHelpers = require("../../../utils/url-helpers.js");
var define_import_meta_env_default = {};
function useLiveEntryHelpers(ctx) {
  const {
    API_BASE,
    roomCode,
    liveId,
    liveName,
    liveCover,
    mode,
    liveTenantId,
    getAccessDeniedUnionId,
    isPlaying,
    syncLiveMiniWindowState
  } = ctx;
  function buildWsUrl(roomId) {
    const userStore = stores_user.useUserStore();
    if (!userStore.token)
      return "";
    const wsBaseUrl = buildWsBaseUrl(API_BASE);
    if (!wsBaseUrl)
      return "";
    return `${wsBaseUrl}/h5/live/ws?roomId=${encodeURIComponent(roomId)}`;
  }
  function buildWsBaseUrl(apiBase) {
    const devApiDomain = (define_import_meta_env_default == null ? void 0 : define_import_meta_env_default.VITE_API_DOMAIN) || "";
    const source = devApiDomain || apiBase || "";
    let normalized = source;
    if (!normalized || normalized.startsWith("/")) {
      normalized = (define_import_meta_env_default == null ? void 0 : define_import_meta_env_default.VITE_API_BASE_URL) || (define_import_meta_env_default == null ? void 0 : define_import_meta_env_default.VITE_API_DOMAIN) || "https://debug.local/api";
    }
    if (normalized.startsWith("//"))
      normalized = `https:${normalized}`;
    const parsed = utils_urlHelpers.parseAbsoluteUrl(normalized);
    if (!parsed)
      return "";
    let pathname = parsed.pathname || "/";
    if (devApiDomain && (!pathname || pathname === "/")) {
      pathname = "/api";
    }
    const wsProtocol = parsed.protocol === "https" || parsed.protocol === "wss" ? "wss" : "ws";
    return `${wsProtocol}://${parsed.host}${pathname}`.replace(/\/$/, "");
  }
  function isDebugLocalLogin() {
    var _a, _b;
    const userStore = stores_user.useUserStore();
    return !userStore.token && ((_a = userStore.userInfo) == null ? void 0 : _a.id) === 999999 && ((_b = userStore.userInfo) == null ? void 0 : _b.nickname) === "本地调试用户";
  }
  function _isSameOrigin(domain1, domain2) {
    if (!domain1 || !domain2)
      return false;
    return utils_urlHelpers.getUrlOrigin(domain1) === utils_urlHelpers.getUrlOrigin(domain2);
  }
  function getLiveRedirectUrl() {
    const params = [];
    if (roomCode.value)
      params.push(`roomCode=${encodeURIComponent(roomCode.value)}`);
    if (liveId.value)
      params.push(`roomId=${encodeURIComponent(liveId.value)}`);
    if (liveName.value)
      params.push(`liveName=${encodeURIComponent(liveName.value)}`);
    if (liveCover.value)
      params.push(`cover=${encodeURIComponent(liveCover.value)}`);
    if (mode.value)
      params.push(`mode=${encodeURIComponent(mode.value)}`);
    if (liveTenantId.value)
      params.push(`tenantId=${liveTenantId.value}`);
    return `/pages/broadcast/entry${params.length ? `?${params.join("&")}` : ""}`;
  }
  function getOrderListUrl(status) {
    const roomCodeQuery = roomCode.value ? `&roomCode=${encodeURIComponent(roomCode.value)}` : "";
    return `/pages/order/list?status=${status}${roomCodeQuery}`;
  }
  function copyAccessDeniedUid() {
    const uid = String(getAccessDeniedUnionId() || "").trim();
    if (!uid)
      return;
    common_vendor.index.setClipboardData({
      data: uid,
      success() {
        common_vendor.index.showToast({ title: "UID已复制", icon: "none" });
      }
    });
  }
  function onVideoPlay() {
    isPlaying.value = true;
    syncLiveMiniWindowState({ force: true });
  }
  return {
    buildWsUrl,
    isDebugLocalLogin,
    _isSameOrigin,
    getLiveRedirectUrl,
    getOrderListUrl,
    copyAccessDeniedUid,
    onVideoPlay
  };
}
exports.useLiveEntryHelpers = useLiveEntryHelpers;
