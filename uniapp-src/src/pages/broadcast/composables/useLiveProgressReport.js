import { reportViewProgress } from "@/api/live.js";

/**
 * 录播观看进度持久化与离页上报。
 * 职责边界：只处理本地断点和 reportViewProgress/sendBeacon，不参与播放器 seek 决策。
 */
export function useLiveProgressReport(ctx) {
  const {
    isReplay,
    liveId,
    replayCurrentVideoId,
    replayLastTime,
    getLiveVideoElement,
    getSeekTarget,
    setLastSavedProgress,
    roomGroupType,
    replayVideosList,
    replayCurrentIndex,
    roomCode,
    liveTenantId,
    shareCode,
    liveBindId,
    myUserId,
  } = ctx;

  function persistReplayProgress(forceSeconds) {
    if (!isReplay.value || !liveId.value || !replayCurrentVideoId.value) {
      console.warn("[Live][断点] persistReplayProgress SKIPPED - 条件不满足");
      return;
    }
    let currentSeconds = Number(forceSeconds);
    const isForce = Number.isFinite(currentSeconds) && currentSeconds >= 0;
    if (!isForce) {
      const videoEl = getLiveVideoElement();
      currentSeconds = Number(videoEl?.currentTime || replayLastTime.value || 0);
    }
    currentSeconds = Math.floor(currentSeconds);
    if (currentSeconds <= 0) return;

    // [2026-04-27 续播倒退修复] seek 保护期内的非 force 保存：拒绝（防止 iOS seek 失败时 currentTime 是虚假的 0~几秒值，覆盖历史进度）
    // 仅对自动场景生效（onBeforeUnmount/handlePageHide 等不传 forceSeconds），forceSeconds 由业务主动传入时（如 onEnded 传 duration）允许写入
    const seekTarget = getSeekTarget();
    if (!isForce && seekTarget > 0 && currentSeconds < seekTarget - 2) {
      console.warn("[Live][断点] persistReplayProgress SKIPPED (seek 保护期, 拒绝倒退保存):", {
        currentSeconds,
        _seekTarget: seekTarget,
      });
      return;
    }

    // [防倒退] 如果当前要保存的进度远小于已保存的历史进度（差值 > 30s），拒绝保存
    // 防止 iOS seek 失败 + 用户在 0 位置短暂停留 + 退出 → 虚假 currentTime 覆盖真实进度
    // 例外：用户确实倒回从头看（小幅倒退或用户主动 seek）允许；30s 阈值是保守判断
    if (!isForce) {
      try {
        const lastSaved = Number(uni.getStorageSync(
          `replay_progress_${liveId.value}_${replayCurrentVideoId.value}`,
        ) || 0);
        if (lastSaved > 0 && currentSeconds < lastSaved - 30) {
          console.warn("[Live][断点] persistReplayProgress 拒绝大幅倒退保存:", {
            currentSeconds,
            lastSaved,
            diff: lastSaved - currentSeconds,
          });
          return;
        }
      } catch (e) {}
    }

    // [2026-04-28] max 兜底：写入值不小于已存储的历史进度，防止 iOS seek 失败时虚假值覆盖真实进度
    const storageKey = `replay_progress_${liveId.value}_${replayCurrentVideoId.value}`;
    try {
      const lastSaved = Number(uni.getStorageSync(storageKey) || 0);
      currentSeconds = Math.max(currentSeconds, lastSaved);
    } catch (e) {}
    replayLastTime.value = currentSeconds;
    setLastSavedProgress(currentSeconds);
    try {
      uni.setStorageSync(storageKey, currentSeconds);
    } catch (e) {}
  }

  function flushViewProgressBeacon() {
    if (!isReplay.value) return;
    if (!replayCurrentVideoId.value || !liveId.value) return;
    const currentVideo = replayVideosList.value[replayCurrentIndex.value];
    if (!currentVideo?.termId) return;
    reportViewProgress({
      roomId: Number(liveId.value),
      roomCode: roomCode?.value || "",
      room_code: roomCode?.value || "",
      tenantId: liveTenantId?.value || "",
      tenant_id: liveTenantId?.value || "",
      shareCode: shareCode?.value || "",
      share_code: shareCode?.value || "",
      bindId: liveBindId?.value || "",
      bind_id: liveBindId?.value || "",
      liveType: "replay",
      live_type: "replay",
      customerId: myUserId?.value || "",
      customer_id: myUserId?.value || "",
      userId: myUserId?.value || "",
      user_id: myUserId?.value || "",
      termId: Number(currentVideo.termId),
      videoId: Number(replayCurrentVideoId.value),
      lastPosition: replayLastTime.value || 0,
      watchDuration: replayLastTime.value || 0,
      watchStatus: 1,
    }).catch(() => {});
  }

  return {
    persistReplayProgress,
    flushViewProgressBeacon,
  };
}
