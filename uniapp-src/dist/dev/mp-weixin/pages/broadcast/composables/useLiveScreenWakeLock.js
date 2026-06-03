"use strict";
const common_vendor = require("../../../common/vendor.js");
function shouldKeepLiveScreenOn(ctx) {
  var _a, _b, _c, _d, _e, _f;
  if (Number(((_a = ctx == null ? void 0 : ctx.roomGroupType) == null ? void 0 : _a.value) || 0) !== 0)
    return false;
  if ((_b = ctx == null ? void 0 : ctx.isReplay) == null ? void 0 : _b.value)
    return false;
  if (Number(((_c = ctx == null ? void 0 : ctx.pushStatus) == null ? void 0 : _c.value) || 0) !== 1)
    return false;
  return !!(((_d = ctx == null ? void 0 : ctx.isPlaying) == null ? void 0 : _d.value) || ((_e = ctx == null ? void 0 : ctx.pullUrl) == null ? void 0 : _e.value) || ((_f = ctx == null ? void 0 : ctx.videoUrl) == null ? void 0 : _f.value));
}
function useLiveScreenWakeLock(ctx) {
  let currentKeep = false;
  let stopWatch = null;
  function setKeepScreenOn(keepScreenOn) {
    if (currentKeep === keepScreenOn)
      return;
    currentKeep = keepScreenOn;
    if (typeof common_vendor.index.setKeepScreenOn !== "function")
      return;
    common_vendor.index.setKeepScreenOn({
      keepScreenOn,
      fail(err) {
        console.warn("[Live] setKeepScreenOn fail:", err);
      }
    });
  }
  function syncScreenWakeLock() {
    setKeepScreenOn(shouldKeepLiveScreenOn(ctx));
  }
  function releaseWakeLock() {
    setKeepScreenOn(false);
  }
  function stopScreenWakeLock() {
    stopWatch == null ? void 0 : stopWatch();
    stopWatch = null;
    releaseWakeLock();
  }
  stopWatch = common_vendor.watch(
    [
      () => {
        var _a;
        return (_a = ctx.roomGroupType) == null ? void 0 : _a.value;
      },
      () => {
        var _a;
        return (_a = ctx.isReplay) == null ? void 0 : _a.value;
      },
      () => {
        var _a;
        return (_a = ctx.pushStatus) == null ? void 0 : _a.value;
      },
      () => {
        var _a;
        return (_a = ctx.isPlaying) == null ? void 0 : _a.value;
      },
      () => {
        var _a;
        return (_a = ctx.pullUrl) == null ? void 0 : _a.value;
      },
      () => {
        var _a;
        return (_a = ctx.videoUrl) == null ? void 0 : _a.value;
      }
    ],
    syncScreenWakeLock,
    { immediate: true }
  );
  return {
    syncScreenWakeLock,
    releaseWakeLock,
    stopScreenWakeLock
  };
}
exports.useLiveScreenWakeLock = useLiveScreenWakeLock;
