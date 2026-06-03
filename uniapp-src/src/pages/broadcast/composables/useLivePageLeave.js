import { leaveLiveRoom } from "@/api/live.js";
import { useUserStore } from "@/stores/user";

export function useLivePageLeave(ctx) {
  const {
    syncLiveMiniWindowState,
    persistReplayProgress,
    flushViewProgressBeacon,
    applyH5ViewerLeaveDecrease,
    liveId,
    sessionId,
    getEnterTimestamp,
    flushPendingLikes,
  } = ctx;

  function handlePageHide() {
    syncLiveMiniWindowState({ force: true });
    persistReplayProgress();
    flushPendingLikes?.();
    flushViewProgressBeacon();
    applyH5ViewerLeaveDecrease();
    const enterTimestamp = getEnterTimestamp();
    if (!useUserStore().token || !liveId.value || !enterTimestamp) return;
    const duration = Math.floor((Date.now() - enterTimestamp) / 1000);
    leaveLiveRoom(liveId.value, sessionId.value, duration).catch(() => {});
  }

  function handlePageBackground() {
    syncLiveMiniWindowState({ force: true });
    persistReplayProgress();
    flushPendingLikes?.();
  }

  return {
    handlePageBackground,
    handlePageHide,
  };
}
