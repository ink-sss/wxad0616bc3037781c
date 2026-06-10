function recoverFromLiveRoomContext(state, options, helpers) {
  if (state.roomCode || !helpers.loadLiveRoomContext) return;
  try {
    const cached = helpers.loadLiveRoomContext();
    if (!cached?.roomCode) return;
    state.roomCode = cached.roomCode;
    if (!state.liveId && cached.liveId) state.liveId = cached.liveId;
    if (!options.tenantId && cached.tenantId) options.tenantId = cached.tenantId;
    if (!options._tc && cached._tc) options._tc = cached._tc;
    if (!state.liveType && cached.liveType) state.liveType = cached.liveType;
    if (!options.cover) {
      options.cover = cached.cover || cached.liveCover || cached.live_cover || cached.coverImage || cached.cover_image || "";
    }
  } catch (e) {
    console.warn("[Live] loadLiveRoomContext fail:", e);
  }
}

function syncTenantCodeCache(options) {
  try {
    if (options._tc) {
      uni.setStorageSync("live_tc_cache", options._tc);
      return;
    }
    const cachedTc = uni.getStorageSync("live_tc_cache") || "";
    if (cachedTc) options._tc = cachedTc;
  } catch (e) {}
}

function recoverCoverFromContext(state, options, helpers) {
  if (options.cover || options.liveCover || !state.roomCode || !helpers.loadLiveRoomContext) return;
  try {
    const cached = helpers.loadLiveRoomContext();
    if (cached && cached.roomCode === state.roomCode) {
      options.cover = cached.cover || cached.liveCover || cached.live_cover || cached.coverImage || cached.cover_image || "";
    }
  } catch (_) {}
}

export function resolveLiveEntryOptions(options = {}, currentLiveId = "", helpers = {}) {
  const state = {
    roomCode: options.code || options.roomCode || "",
    liveId: options.roomId || options.liveId || options.live_id || options.id || currentLiveId || "",
    liveType: options.liveType || "",
  };
  recoverFromLiveRoomContext(state, options, helpers);
  syncTenantCodeCache(options);
  recoverCoverFromContext(state, options, helpers);

  return {
    roomCode: state.roomCode,
    liveId: state.liveId,
    tenantId: options.tenantId ? Number(options.tenantId) || 0 : 0,
    liveName: options.liveName || "量多多播量通",
    liveCover: options.cover || options.liveCover || "",
    mode: options.mode === "landscape" || options.mode === "portrait" ? options.mode : "",
    liveType: state.liveType,
  };
}
