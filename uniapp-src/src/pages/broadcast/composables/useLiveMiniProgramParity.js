import { onBeforeUnmount, ref, watch } from "vue";
import {
  onUserCaptureScreen,
  offUserCaptureScreen,
  setVisualEffectOnCapture,
  onScreenRecordingStateChanged,
  offScreenRecordingStateChanged,
  resetCaptureEffect,
} from "@/platform/weixin/capture.js";
import { exitMiniProgram, hideShareMenu, showShareMenu } from "@/platform/weixin/share.js";
import { getWeixinApi, isMpWeixinRuntime } from "@/platform/weixin/runtime.js";

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
  const screenRecording = ref(false);
  if (!isMpWeixinRuntime() || !roomSetting) {
    return { screenRecording, syncMiniProgramParity: () => {}, stopMiniProgramParity: () => {} };
  }

  const captureScreenHandler = () => {};

  function exitCurrentMiniProgram() {
    callAndIgnore(exitMiniProgram({
      success() {
        console.log("退出成功");
      },
      fail(error) {
        console.error("退出失败:", error);
      },
    }));
  }

  function showScreenRecordingModal() {
    const api = getWeixinApi("showModal", { preferUni: true });
    if (!api || typeof api.showModal !== "function") return;
    api.showModal({
      title: "提示",
      content: "检测到录屏，将退出小程序以确保内容安全。",
      showCancel: false,
      confirmText: "确定退出",
      success(result = {}) {
        if (result.confirm) {
          exitCurrentMiniProgram();
        }
      },
    });
  }

  const recordingHandler = (result = {}) => {
    if (result && result.state === "start") {
      screenRecording.value = true;
      showScreenRecordingModal();
    }
    if (result && result.state === "stop") {
      screenRecording.value = false;
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
      callAndIgnore(setVisualEffectOnCapture({
        visualEffect: "hidden",
        success() {},
        fail() {},
        complete() {},
      }));
      onUserCaptureScreen(captureScreenHandler);
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
    offUserCaptureScreen(captureScreenHandler);
    screenRecording.value = false;
    callAndIgnore(resetCaptureEffect());
  }

  onScreenRecordingStateChanged(recordingHandler);
  watch(
    () => [roomSetting.value, liveInitResolved?.value],
    syncMiniProgramParity,
    { deep: true, immediate: true },
  );
  onBeforeUnmount(stopMiniProgramParity);

  return { screenRecording, syncMiniProgramParity, stopMiniProgramParity };
}
