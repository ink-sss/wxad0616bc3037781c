import { useUserStore } from "@/stores/user";
import { getUrlOrigin, parseAbsoluteUrl } from "@/utils/url-helpers.js";

/**
 * 入口页通用小助手集合。
 * 职责边界：保留 URL 构造、调试登录判断、同源判断和少量 UI 回调；不得继续塞播放/初始化业务。
 */
export function useLiveEntryHelpers(ctx) {
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
    syncLiveMiniWindowState,
  } = ctx;

  function buildWsUrl(roomId) {
    const userStore = useUserStore();
    if (!userStore.token) return "";
    const wsBaseUrl = buildWsBaseUrl(API_BASE);
    if (!wsBaseUrl) return "";
    return `${wsBaseUrl}/h5/live/ws?roomId=${encodeURIComponent(roomId)}`;
  }

  function buildWsBaseUrl(apiBase) {
    const devApiDomain = import.meta.env?.DEV ? (import.meta.env?.VITE_API_DOMAIN || "") : "";
    const source = devApiDomain || apiBase || "";
    let normalized = source;
    if (!normalized || normalized.startsWith("/")) {
      normalized = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_DOMAIN || "https://debug.local/api";
    }
    if (normalized.startsWith("//")) normalized = `https:${normalized}`;
    const parsed = parseAbsoluteUrl(normalized);
    if (!parsed) return "";
    let pathname = parsed.pathname || "/";
    if (devApiDomain && (!pathname || pathname === "/")) {
      pathname = "/api";
    }
    const wsProtocol = parsed.protocol === "https" || parsed.protocol === "wss" ? "wss" : "ws";
    return `${wsProtocol}://${parsed.host}${pathname}`.replace(/\/$/, "");
  }

  function isDebugLocalLogin() {
    const userStore = useUserStore();
    return (
      !userStore.token &&
      userStore.userInfo?.id === 999999 &&
      userStore.userInfo?.nickname === "本地调试用户"
    );
  }

  function _isSameOrigin(domain1, domain2) {
    if (!domain1 || !domain2) return false;
    return getUrlOrigin(domain1) === getUrlOrigin(domain2);
  }

  function getLiveRedirectUrl() {
    const params = [];
    if (roomCode.value)
      params.push(`roomCode=${encodeURIComponent(roomCode.value)}`);
    if (liveId.value) params.push(`roomId=${encodeURIComponent(liveId.value)}`);
    if (liveName.value)
      params.push(`liveName=${encodeURIComponent(liveName.value)}`);
    if (liveCover.value)
      params.push(`cover=${encodeURIComponent(liveCover.value)}`);
    if (mode.value) params.push(`mode=${encodeURIComponent(mode.value)}`);
    if (liveTenantId.value) params.push(`tenantId=${liveTenantId.value}`);
    return `/pages/broadcast/entry${params.length ? `?${params.join("&")}` : ""}`;
  }

  function getOrderListUrl(status) {
    const roomCodeQuery = roomCode.value
      ? `&roomCode=${encodeURIComponent(roomCode.value)}`
      : "";
    return `/pages/order/list?status=${status}${roomCodeQuery}`;
  }

  function copyAccessDeniedUid() {
    const uid = String(getAccessDeniedUnionId() || "").trim();
    if (!uid) return;
    uni.setClipboardData({
      data: uid,
      success() {
        uni.showToast({ title: "UID已复制", icon: "none" });
      },
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
    onVideoPlay,
  };
}
