"use strict";
const common_vendor = require("../common/vendor.js");
const KEY = "mp_live_room_context_v1";
function saveLiveRoomContext(ctx = {}) {
  const prev = loadLiveRoomContext() || {};
  const next = { ...prev, ...ctx, updatedAt: Date.now() };
  common_vendor.index.setStorageSync(KEY, next);
  return next;
}
function loadLiveRoomContext() {
  try {
    return common_vendor.index.getStorageSync(KEY) || null;
  } catch (error) {
    return null;
  }
}
function resolveLiveRoomCode(value = "") {
  if (value)
    return value;
  const ctx = loadLiveRoomContext();
  return (ctx == null ? void 0 : ctx.roomCode) || "";
}
exports.loadLiveRoomContext = loadLiveRoomContext;
exports.resolveLiveRoomCode = resolveLiveRoomCode;
exports.saveLiveRoomContext = saveLiveRoomContext;
