import { computed, ref } from "vue";
import { hasWeixinApi } from "@/platform/weixin/runtime";

export function useInvitationDebug({
  payload,
  activeTemplate,
  shareMiniProgramPath,
  displayTime,
  qrcodeSrc,
  posterImageSrc,
  shareImageSrc,
  posterRendering,
  posterRenderTaskId,
  getPosterRenderPromise,
  getShareRenderPromise,
}) {
  const debugVisible = ref(false);
  const debugCopyText = ref("复制信息");
  const debugEvents = ref([]);
  const debugEnableReason = ref("hidden");

  const debugBrief = computed(() => {
    if (posterRendering.value) return "生成中";
    if (shareImageSrc.value && posterImageSrc.value) return "合成完成";
    if (posterImageSrc.value) return "海报完成";
    if (shareImageSrc.value) return "分享完成";
    return "待生成";
  });

  function initializeDebugFloat() {
    const debugState = getDebugFloatState();
    debugVisible.value = debugState.enabled;
    debugEnableReason.value = debugState.reason;
    return debugState;
  }

  function recordDebugEvent(type, detail = {}) {
    if (!debugVisible.value && type !== "page_mounted") return;
    const entry = {
      at: new Date().toISOString(),
      type,
      detail: sanitizeDebugValue(detail),
    };
    debugEvents.value = [...debugEvents.value.slice(-39), entry];
  }

  function copyDebugInfo() {
    const report = buildDebugReport();
    debugCopyText.value = "复制中...";
    recordDebugEvent("debug_copy_requested", { length: report.length });
    uni.setClipboardData({
      data: report,
      success: () => {
        debugCopyText.value = "已复制";
        recordDebugEvent("debug_copy_success", { length: report.length });
        uni.showToast({ title: "调试信息已复制", icon: "success" });
        setTimeout(() => {
          debugCopyText.value = "复制信息";
        }, 1200);
      },
      fail: (error) => {
        debugCopyText.value = "复制失败";
        recordDebugEvent("debug_copy_fail", normalizeError(error));
        uni.showToast({ title: "复制失败", icon: "none" });
        setTimeout(() => {
          debugCopyText.value = "复制信息";
        }, 1200);
      },
    });
  }

  function buildDebugReport() {
    const report = {
      timestamp: new Date().toISOString(),
      page: "pagesPlus/main/invitation/index",
      debug: {
        visible: debugVisible.value,
        reason: debugEnableReason.value,
        summary: debugBrief.value,
      },
      routeOptions: sanitizeDebugValue(getCurrentRouteOptions()),
      runtime: {
        createOffscreenCanvas: hasWeixinApi("createOffscreenCanvas"),
        canvasToTempFilePath: hasWeixinApi("canvasToTempFilePath"),
        getImageInfo: hasWeixinApi("getImageInfo", { preferUni: true }),
        downloadFile: hasWeixinApi("downloadFile", { preferUni: true }),
        setClipboardData: hasWeixinApi("setClipboardData", { preferUni: true }),
      },
      template: {
        id: activeTemplate.value?.id || "",
        name: activeTemplate.value?.name || "",
        bgImg: activeTemplate.value?.bgImg || "",
        hasAvatarSlot: !!activeTemplate.value?.slots?.avatar,
        hasQrcodeSlot: !!activeTemplate.value?.slots?.qrcode,
        hasInviterNameSlot: !!activeTemplate.value?.slots?.inviterName,
      },
      payload: sanitizeDebugValue({
        ...payload.value,
        shareMiniProgramPath: shareMiniProgramPath.value,
        displayTime: displayTime.value,
      }),
      assets: sanitizeDebugValue({
        qrcodeSrc: qrcodeSrc.value,
        posterImageSrc: posterImageSrc.value,
        shareImageSrc: shareImageSrc.value,
        hasAvatar: !!payload.value.anchorAvatar,
        hasNick: !!payload.value.inviterName,
        hasQrcode: !!qrcodeSrc.value,
        hasPosterImage: !!posterImageSrc.value,
        hasShareImage: !!shareImageSrc.value,
        posterRendering: posterRendering.value,
        renderTaskId: posterRenderTaskId.value,
        hasRenderPromise: !!getPosterRenderPromise(),
        hasShareRenderPromise: typeof getShareRenderPromise === "function" && !!getShareRenderPromise(),
      }),
      recentEvents: debugEvents.value,
    };
    return JSON.stringify(report, null, 2);
  }

  return {
    debugVisible,
    debugCopyText,
    debugEvents,
    debugEnableReason,
    debugBrief,
    initializeDebugFloat,
    recordDebugEvent,
    copyDebugInfo,
    getCurrentRouteOptions,
    maskSensitiveText,
    normalizeError,
  };
}

function getDebugFloatState() {
  return { enabled: false, reason: "hidden" };
}

function getCurrentRouteOptions() {
  try {
    if (typeof getCurrentPages !== "function") return {};
    const pages = getCurrentPages();
    const page = pages[pages.length - 1] || {};
    return { ...(page.options || {}) };
  } catch (_) {
    return {};
  }
}

function sanitizeDebugValue(value, depth = 0) {
  if (depth > 4) return "[MaxDepth]";
  if (value == null) return value;
  if (typeof value === "string") return maskSensitiveText(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 30).map((item) => sanitizeDebugValue(item, depth + 1));
  if (typeof value === "object") {
    return Object.keys(value).reduce((result, key) => {
      result[key] = isSensitiveKey(key) ? "[Masked]" : sanitizeDebugValue(value[key], depth + 1);
      return result;
    }, {});
  }
  return String(value);
}

function isSensitiveKey(key) {
  return /token|secret|password|passwd|cookie|authorization|access[_-]?key|session/i.test(String(key || ""));
}

function maskSensitiveText(text) {
  const value = String(text || "");
  return value
    .replace(/([?&](?:token|access_token|auth|signature|sign|code)=)[^&]+/gi, "$1[Masked]")
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1[Masked]");
}

function normalizeError(error) {
  if (!error) return { message: "" };
  if (typeof error === "string") return { message: error };
  return sanitizeDebugValue({
    message: error.message || error.errMsg || String(error),
    code: error.code || error.errCode || "",
    apiName: error.apiName || "",
  });
}
