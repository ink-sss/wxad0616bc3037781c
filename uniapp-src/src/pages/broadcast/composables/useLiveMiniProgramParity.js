import { onBeforeUnmount, watch } from "vue";
import {
  hideOnCapture,
  onScreenRecordingStateChanged,
  offScreenRecordingStateChanged,
  resetCaptureEffect,
} from "@/platform/weixin/capture.js";
import { exitMiniProgram, hideShareMenu, showShareMenu } from "@/platform/weixin/share.js";
import { isMpWeixinRuntime } from "@/platform/weixin/runtime.js";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isShareAllowed(setting = {}) {
  return toNumber(setting.enableShare ?? setting.is_share, 1) === 1 &&
    toNumber(setting.self_group ?? setting.selfGroup, 0) !== 1;
}

function shouldHideOnCapture(setting = {}) {
  const value = setting.is_capture_screen ?? setting.captureScreen ?? setting.capture_screen;
  if (value === undefined || value === null || value === "") return false;
  return toNumber(value, 1) === 0;
}

function callAndIgnore(promise) {
  Promise.resolve(promise).catch(() => {});
}

export function useLiveMiniProgramParity(ctx = {}) {
  const { roomSetting, liveInitResolved } = ctx;
  if (!isMpWeixinRuntime() || !roomSetting) {
    return { syncMiniProgramParity: () => {}, stopMiniProgramParity: () => {} };
  }

  const recordingHandler = (result = {}) => {
    if (!result || result.state === "start") {
      callAndIgnore(exitMiniProgram());
    }
  };

  function syncShareMenu(setting = roomSetting.value || {}) {
    if (isShareAllowed(setting)) {
      callAndIgnore(showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"],
      }));
    } else {
      callAndIgnore(hideShareMenu({
        menus: ["shareAppMessage", "shareTimeline"],
      }));
    }
  }

  function syncCapture(setting = roomSetting.value || {}) {
    if (shouldHideOnCapture(setting)) {
      callAndIgnore(hideOnCapture());
    } else {
      callAndIgnore(resetCaptureEffect());
    }
  }

  function syncMiniProgramParity() {
    const setting = roomSetting.value || {};
    if (liveInitResolved && liveInitResolved.value !== true) {
      callAndIgnore(hideShareMenu({
        menus: ["shareAppMessage", "shareTimeline"],
      }));
      callAndIgnore(resetCaptureEffect());
      return;
    }
    syncShareMenu(setting);
    syncCapture(setting);
  }

  function stopMiniProgramParity() {
    offScreenRecordingStateChanged(recordingHandler);
    callAndIgnore(resetCaptureEffect());
  }

  onScreenRecordingStateChanged(recordingHandler);
  watch(
    () => [roomSetting.value, liveInitResolved?.value],
    syncMiniProgramParity,
    { deep: true, immediate: true },
  );
  onBeforeUnmount(stopMiniProgramParity);

  return { syncMiniProgramParity, stopMiniProgramParity };
}
