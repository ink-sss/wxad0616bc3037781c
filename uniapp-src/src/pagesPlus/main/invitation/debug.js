import { computed, ref } from "vue";
import { hasWeixinApi } from "@/platform/weixin/runtime";

export function useInvitationDebug({
  payload,
  activeTemplate,
  shareMiniProgramPath,
  displayTime,
  qrcodeSrc,
  qrcodeSource,
  qrcodeFallbackReason,
  qrcodeFieldSource,
  ordinaryQrCodeCandidateSource,
  miniProgramQrCodeSrc,
  posterImageSrc,
  shareImageSrc,
  posterRendering,
  posterRenderTaskId,
  getPosterRenderPromise,
  getShareRenderPromise,
  getPosterPreloadPromise,
}) {
  const debugEvents = ref([]);

  const debugBrief = computed(() => {
    if (posterRendering.value) return "生成中";
    if (shareImageSrc.value && posterImageSrc.value) return "合成完成";
    if (posterImageSrc.value) return "海报完成";
    if (shareImageSrc.value) return "分享完成";
    return "待生成";
  });

  function recordDebugEvent(type, detail = {}) {
    const entry = {
      at: new Date().toISOString(),
      type,
      detail: sanitizeDebugValue(detail),
    };
    debugEvents.value = [...debugEvents.value.slice(-39), entry];
  }

  function buildDebugReport() {
    const report = {
      timestamp: new Date().toISOString(),
      page: "pagesPlus/main/invitation/index",
      debug: {
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
        qrcodeSource: qrcodeSource?.value || "",
        qrcodeFallbackReason: qrcodeFallbackReason?.value || "",
        qrcodeFieldSource: qrcodeFieldSource?.value || "",
        ordinaryQrCodeCandidateSource: ordinaryQrCodeCandidateSource?.value || "",
        miniProgramQrCodeSrc: miniProgramQrCodeSrc?.value || "",
        posterImageSrc: posterImageSrc.value,
        shareImageSrc: shareImageSrc.value,
        hasAvatar: !!payload.value.anchorAvatar,
        hasNick: !!payload.value.inviterName,
        hasQrcode: !!qrcodeSrc.value,
        hasMiniProgramQrCode: !!payload.value.miniProgramQrCode,
        hasMiniProgramQrCodeSrc: !!miniProgramQrCodeSrc?.value,
        hasPosterImage: !!posterImageSrc.value,
        hasShareImage: !!shareImageSrc.value,
        posterRendering: posterRendering.value,
        renderTaskId: posterRenderTaskId.value,
        hasRenderPromise: !!getPosterRenderPromise(),
        hasShareRenderPromise: typeof getShareRenderPromise === "function" && !!getShareRenderPromise(),
        hasPreloadPromise: typeof getPosterPreloadPromise === "function" && !!getPosterPreloadPromise(),
      }),
      recentEvents: debugEvents.value,
    };
    return JSON.stringify(report, null, 2);
  }

  return {
    debugEvents,
    debugBrief,
    recordDebugEvent,
    buildDebugReport,
    getCurrentRouteOptions,
    maskSensitiveText,
    normalizeError,
  };
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

function sanitizeDebugValue(value, depth = 0, keyName = "") {
  if (depth > 4) return "[MaxDepth]";
  if (value == null) return value;
  if (typeof value === "string") return sanitizeDebugString(value, keyName);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 30).map((item, index) => sanitizeDebugValue(item, depth + 1, `${keyName}[${index}]`));
  if (typeof value === "object") {
    return Object.keys(value).reduce((result, key) => {
      result[key] = isSensitiveKey(key) ? "[Masked]" : sanitizeDebugValue(value[key], depth + 1, key);
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

function sanitizeDebugString(text, keyName = "") {
  const value = String(text || "");
  const variableName = String(keyName || "value");
  if (/^data:image\//i.test(value)) {
    const mime = value.match(/^data:([^;]+);/i)?.[1] || "image";
    return `[${variableName}:data-url:${mime}:len=${value.length}]`;
  }
  const compact = value.replace(/\s+/g, "");
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(compact) && compact.length > 160) {
    return `[${variableName}:base64:len=${compact.length}]`;
  }
  return maskSensitiveText(value);
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
