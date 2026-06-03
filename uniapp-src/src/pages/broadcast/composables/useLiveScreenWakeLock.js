import { watch } from "vue";

export function shouldKeepLiveScreenOn(ctx) {
  if (Number(ctx?.roomGroupType?.value || 0) !== 0) return false;
  if (ctx?.isReplay?.value) return false;
  if (Number(ctx?.pushStatus?.value || 0) !== 1) return false;
  return !!(
    ctx?.isPlaying?.value ||
    ctx?.pullUrl?.value ||
    ctx?.videoUrl?.value
  );
}

export function useLiveScreenWakeLock(ctx) {
  let currentKeep = false;
  let stopWatch = null;

  function setKeepScreenOn(keepScreenOn) {
    if (currentKeep === keepScreenOn) return;
    currentKeep = keepScreenOn;
    if (typeof uni.setKeepScreenOn !== "function") return;
    uni.setKeepScreenOn({
      keepScreenOn,
      fail(err) {
        console.warn("[Live] setKeepScreenOn fail:", err);
      },
    });
  }

  function syncScreenWakeLock() {
    setKeepScreenOn(shouldKeepLiveScreenOn(ctx));
  }

  function releaseWakeLock() {
    setKeepScreenOn(false);
  }

  function stopScreenWakeLock() {
    stopWatch?.();
    stopWatch = null;
    releaseWakeLock();
  }

  stopWatch = watch(
    [
      () => ctx.roomGroupType?.value,
      () => ctx.isReplay?.value,
      () => ctx.pushStatus?.value,
      () => ctx.isPlaying?.value,
      () => ctx.pullUrl?.value,
      () => ctx.videoUrl?.value,
    ],
    syncScreenWakeLock,
    { immediate: true },
  );

  return {
    syncScreenWakeLock,
    releaseWakeLock,
    stopScreenWakeLock,
  };
}
