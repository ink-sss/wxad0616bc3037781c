"use strict";
const api_live = require("../../../api/live.js");
const stores_user = require("../../../stores/user.js");
function useLivePageLeave(ctx) {
  const {
    syncLiveMiniWindowState,
    persistReplayProgress,
    flushViewProgressBeacon,
    liveId,
    sessionId,
    getEnterTimestamp,
    flushPendingLikes
  } = ctx;
  function handlePageHide() {
    syncLiveMiniWindowState({ force: true });
    persistReplayProgress();
    flushPendingLikes == null ? void 0 : flushPendingLikes();
    flushViewProgressBeacon();
    const enterTimestamp = getEnterTimestamp();
    if (!stores_user.useUserStore().token || !liveId.value || !enterTimestamp)
      return;
    const duration = Math.floor((Date.now() - enterTimestamp) / 1e3);
    api_live.leaveLiveRoom(liveId.value, sessionId.value, duration).catch(() => {
    });
  }
  function handlePageBackground() {
    syncLiveMiniWindowState({ force: true });
    persistReplayProgress();
    flushPendingLikes == null ? void 0 : flushPendingLikes();
  }
  return {
    handlePageBackground,
    handlePageHide
  };
}
exports.useLivePageLeave = useLivePageLeave;
