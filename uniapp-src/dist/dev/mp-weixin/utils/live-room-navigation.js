"use strict";
const common_vendor = require("../common/vendor.js");
const utils_liveRoomContext = require("./live-room-context.js");
const LIVE_PAGE_ROUTES = ["pages/broadcast/entry", "pages/broadcast/replay"];
function normalizeRoute(route) {
  return String(route || "").replace(/^\/+/, "");
}
function getCurrentPageStack() {
  try {
    if (typeof getCurrentPages !== "function")
      return [];
    return getCurrentPages() || [];
  } catch (error) {
    return [];
  }
}
function findLivePageIndex(pages) {
  var _a;
  for (let i = pages.length - 1; i >= 0; i -= 1) {
    const route = normalizeRoute((_a = pages[i]) == null ? void 0 : _a.route);
    if (LIVE_PAGE_ROUTES.includes(route))
      return i;
  }
  return -1;
}
function buildLiveRoomUrl(roomCode = "", extraParams = {}) {
  const cached = utils_liveRoomContext.loadLiveRoomContext() || {};
  const merged = utils_liveRoomContext.mergeLiveRoomContext(cached, { roomCode }, extraParams || {});
  return utils_liveRoomContext.appendLiveRoomQuery("/pages/broadcast/entry", merged);
}
function returnToLiveRoom(roomCode = "", extraParams = {}) {
  const targetUrl = buildLiveRoomUrl(roomCode, extraParams);
  const pages = getCurrentPageStack();
  const livePageIndex = findLivePageIndex(pages);
  if (livePageIndex >= 0) {
    const delta = pages.length - 1 - livePageIndex;
    if (delta > 0) {
      common_vendor.index.navigateBack({
        delta,
        fail: () => common_vendor.index.redirectTo({ url: targetUrl })
      });
      return true;
    }
    return false;
  }
  common_vendor.index.redirectTo({
    url: targetUrl,
    fail: () => common_vendor.index.reLaunch({ url: targetUrl })
  });
  return true;
}
exports.returnToLiveRoom = returnToLiveRoom;
