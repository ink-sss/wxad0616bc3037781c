import { appendLiveRoomQuery, loadLiveRoomContext, mergeLiveRoomContext } from "@/utils/live-room-context";

const LIVE_PAGE_ROUTES = ["pages/broadcast/entry", "pages/broadcast/replay"];

function normalizeRoute(route) {
  return String(route || "").replace(/^\/+/, "");
}

function getCurrentPageStack() {
  try {
    if (typeof getCurrentPages !== "function") return [];
    return getCurrentPages() || [];
  } catch (error) {
    return [];
  }
}

function findLivePageIndex(pages) {
  for (let i = pages.length - 1; i >= 0; i -= 1) {
    const route = normalizeRoute(pages[i]?.route);
    if (LIVE_PAGE_ROUTES.includes(route)) return i;
  }
  return -1;
}

export function buildLiveRoomUrl(roomCode = "", extraParams = {}) {
  const cached = loadLiveRoomContext() || {};
  const merged = mergeLiveRoomContext(cached, { roomCode }, extraParams || {});
  return appendLiveRoomQuery("/pages/broadcast/entry", merged);
}

export function returnToLiveRoom(roomCode = "", extraParams = {}) {
  const targetUrl = buildLiveRoomUrl(roomCode, extraParams);
  const pages = getCurrentPageStack();
  const livePageIndex = findLivePageIndex(pages);

  if (livePageIndex >= 0) {
    const delta = pages.length - 1 - livePageIndex;
    if (delta > 0) {
      uni.navigateBack({
        delta,
        fail: () => uni.redirectTo({ url: targetUrl }),
      });
      return true;
    }
    return false;
  }

  uni.redirectTo({
    url: targetUrl,
    fail: () => uni.reLaunch({ url: targetUrl }),
  });
  return true;
}
