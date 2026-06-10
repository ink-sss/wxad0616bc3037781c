<template>
  <view class="invitation-page">

    <view class="inv-preview-wrap">
      <view
        v-if="activeTemplate"
        class="inv-preview-card"
        :style="{ aspectRatio: `${activeTemplate.aspectRatio || 750 / 1334}` }"
      >
        <image
          v-if="posterImageSrc"
          class="inv-preview-img"
          :src="posterImageSrc"
          mode="scaleToFill"
          show-menu-by-longpress
        />
        <image
          v-else
          class="inv-preview-img"
          :src="activeTemplate.bgImg"
          mode="scaleToFill"
        />
        <image
          v-if="!posterImageSrc && payload.anchorAvatar"
          class="inv-layer-avatar"
          :src="payload.anchorAvatar"
          mode="aspectFill"
          :style="avatarStyle"
        />
        <text
          v-if="!posterImageSrc && payload.inviterName"
          class="inv-layer-text"
          :class="{ 'inv-layer-text--bold': activeTemplate.slots?.inviterName?.bold }"
          :style="slotTextStyle(activeTemplate.slots?.inviterName)"
        >
          {{ slotText(payload.inviterName, activeTemplate.slots?.inviterName, 8) }}
        </text>
        <text
          v-if="!posterImageSrc"
          class="inv-layer-text"
          :class="{ 'inv-layer-text--bold': activeTemplate.slots?.liveName?.bold }"
          :style="slotTextStyle(activeTemplate.slots?.liveName)"
        >
          {{ slotText(payload.liveName || "精彩直播", activeTemplate.slots?.liveName, 12) }}
        </text>
        <text
          v-if="!posterImageSrc"
          class="inv-layer-text"
          :class="{ 'inv-layer-text--bold': activeTemplate.slots?.time?.bold }"
          :style="slotTextStyle(activeTemplate.slots?.time)"
        >
          {{ displayTime || "敬请期待" }}
        </text>
        <image
          v-if="!posterImageSrc && qrcodeSrc"
          class="inv-layer-qrcode"
          :src="qrcodeSrc"
          mode="aspectFit"
          :style="qrcodeStyle"
          show-menu-by-longpress
        />
      </view>
      <view v-else class="inv-preview-placeholder">
        <text class="inv-preview-placeholder-text">正在生成...</text>
      </view>
    </view>
    <text class="inv-tip">{{ posterRendering ? "邀请函生成中..." : "长按保存邀请函" }}</text>

    <scroll-view class="inv-templates" scroll-x :show-scrollbar="false">
      <view class="inv-templates-inner">
        <view
          v-for="(tpl, idx) in templates"
          :key="tpl.id"
          class="inv-tpl-item"
          :class="{ 'inv-tpl-item--active': idx === activeIdx }"
          @click="selectTemplate(idx)"
        >
          <image class="inv-tpl-img" :src="tpl.bgImg" mode="aspectFill" />
          <view v-if="idx === activeIdx" class="inv-tpl-check">
            <text class="inv-tpl-check-icon">✓</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view
      v-if="debugVisible"
      class="inv-debug-float"
       @click.stop="copyDebugInfo"
    >
      <view class="inv-debug-title">
        <text class="inv-debug-title-text">邀请函调试</text>
        <text class="inv-debug-status">{{ debugBrief }}</text>
      </view>
      <view class="inv-debug-lines">
        <text class="inv-debug-line">头像: {{ payload.anchorAvatar ? "有" : "空" }}</text>
        <text class="inv-debug-line">昵称: {{ payload.inviterName || "空" }}</text>
        <text class="inv-debug-line">二维码: {{ qrcodeStatusText }}</text>
        <text class="inv-debug-line">分享图: {{ shareImageSrc ? "已生成" : "空" }}</text>
      </view>
      <view class="inv-debug-button">
        <text class="inv-debug-button-text">{{ debugCopyText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { onShareAppMessage, onShareTimeline, onUnload } from "@dcloudio/uni-app";
import templates from "./templates";
import { getProfile } from "@/api/user";
import { useUserStore } from "@/stores/user";
import { normalizeImageSource, saveImageToAlbumWithAuth, writeBase64ImageToTempFile } from "@/platform/weixin/file";
import { useInvitationDebug } from "./debug";
import {
  createInvitationPosterTempFile,
  createInvitationShareCardTempFile,
  getUsableInvitationPosterFileCache,
  getUsableInvitationShareFileCache,
  resetInvitationPosterRuntimeCache,
  resolveInvitationPosterFileCache,
  resolveInvitationShareFileCache,
  setInvitationPosterFileCache,
  setInvitationShareFileCache,
} from "./poster";

const payload = ref({
  link: "",
  miniProgramPath: "",
  miniProgramQrCode: "",
  miniProgramQrCodeFilePath: "",
  roomCode: "",
  roomId: "",
  liveId: "",
  tenantId: "",
  shareCode: "",
  bindId: "",
  anchorName: "",
  anchorAvatar: "",
  liveName: "",
  pushTime: 0,
  scheduleTime: "",
  liveDate: "",
  inviterName: "",
  isReplay: false,
  replay: "",
  mode: "",
  liveType: "",
  videoId: "",
  video_id: "",
  replayVideoId: "",
  replay_video_id: "",
});

const activeIdx = ref(0);
const qrcodeSrc = ref("");
const miniProgramQrCodeSrc = ref("");
const qrcodeSource = ref("none");
const qrcodeFallbackReason = ref("");
const qrcodeFieldSource = ref("");
const ordinaryQrCodeCandidateSource = ref("");
const posterImageSrc = ref("");
const shareImageSrc = ref("");
const posterRenderTaskId = ref(0);
const posterRendering = ref(false);
const posterReadyMap = ref({});
const shareReadyMap = ref({});
const navDomain = ref("小程序");
const activeTemplate = computed(() => templates[activeIdx.value] || templates[0]);
const CARD_DESIGN_WIDTH = 750;
const CARD_DISPLAY_WIDTH_RPX = 630;
let posterRenderPromise = null;
let shareRenderPromise = null;
let posterPreloadPromise = null;
let posterPreloadRunId = 0;
let posterPreloadTimer = null;
const posterPageInstanceId = `invitation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const miniProgramQrCodeSrcCache = new Map();
const INVITATION_POSTER_CACHE_VERSION = "qrcode-image-required-v3";
const POSTER_PRELOAD_DELAY_MS = 1200;
const POSTER_PRELOAD_STEP_DELAY_MS = 180;

const displayTime = computed(() => {
  const schedule = payload.value.scheduleTime || payload.value.liveDate || "";
  if (schedule) return schedule.replace(/-/g, ".").replace(" ", "  ");
  return formatTime(payload.value.pushTime);
});

const shareMiniProgramPath = computed(() => {
  return payload.value.miniProgramPath || buildMiniProgramPath(payload.value) || "/pages/broadcast/entry";
});

const qrcodeStatusText = computed(() => {
  if (!qrcodeSrc.value) return "空";
  if (
    qrcodeSource.value === "miniProgramQrCodeFilePath" ||
    qrcodeSource.value === "miniProgramQrCodeTempFile" ||
    qrcodeSource.value === "miniProgramQrCode"
  ) {
    return "小程序码";
  }
  return qrcodeFallbackReason.value ? `普通二维码(${qrcodeFallbackReason.value})` : "普通二维码";
});

const avatarStyle = computed(() => {
  const slot = activeTemplate.value?.slots?.avatar || {};
  const size = posterWidthRpx(Number(slot.r || 0) * 2);
  return {
    left: `${Number(slot.cx || 0) * 100}%`,
    top: `${Number(slot.cy || 0) * 100}%`,
    width: `${size}rpx`,
    height: `${size}rpx`,
    marginLeft: `-${Math.round(size / 2)}rpx`,
    marginTop: `-${Math.round(size / 2)}rpx`,
  };
});

const qrcodeStyle = computed(() => {
  const slot = activeTemplate.value?.slots?.qrcode || {};
  const size = posterWidthRpx(Number(slot.size || 0));
  return {
    left: `${Number(slot.cx || 0) * 100}%`,
    top: `${Number(slot.cy || 0) * 100}%`,
    width: `${size}rpx`,
    height: `${size}rpx`,
    marginLeft: `-${Math.round(size / 2)}rpx`,
    marginTop: `-${Math.round(size / 2)}rpx`,
  };
});

const {
  debugVisible,
  debugCopyText,
  debugBrief,
  initializeDebugFloat,
  recordDebugEvent,
  copyDebugInfo,
  getCurrentRouteOptions,
  maskSensitiveText,
  normalizeError,
} = useInvitationDebug({
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
  getPosterRenderPromise: () => posterRenderPromise,
  getShareRenderPromise: () => shareRenderPromise,
  getPosterPreloadPromise: () => posterPreloadPromise,
});

onMounted(async () => {
  const debugState = initializeDebugFloat();
  recordDebugEvent("page_mounted", {
    debugReason: debugState.reason,
    routeOptions: getCurrentRouteOptions(),
  });
  resetPosterRuntimeCache("page_mounted");
  let data = {};
  try {
    data = uni.getStorageSync("invitation_payload") || {};
  } catch (error) {
    recordDebugEvent("payload_read_fail", normalizeError(error));
  }
  recordDebugEvent("payload_loaded", {
    keys: Object.keys(data || {}),
    hasLink: !!data.link,
    hasAvatar: !!data.anchorAvatar,
    hasMiniProgramPath: !!data.miniProgramPath,
    miniProgramQrCodeField: getMiniProgramQrCodeField(data) || data.miniProgramQrCodeSource || "",
    ordinaryQrCodeCandidateField: getOrdinaryQrCodeCandidateField(data) || data.ordinaryQrCodeCandidateSource || "",
    hasMiniProgramQrCode: !!getMiniProgramQrCodeFromData(data),
    hasMiniProgramQrCodeFilePath: !!data.miniProgramQrCodeFilePath,
    hasRoomCode: !!data.roomCode,
    hasLiveId: !!(data.liveId || data.roomId),
    hasTenantId: !!data.tenantId,
  });
  qrcodeFieldSource.value = getMiniProgramQrCodeField(data) || data.miniProgramQrCodeSource || "";
  ordinaryQrCodeCandidateSource.value = getOrdinaryQrCodeCandidateField(data) || data.ordinaryQrCodeCandidateSource || "";
  const inviter = await resolveInviterProfile();
  payload.value = {
    link: data.link || "/pages/broadcast/entry",
    miniProgramPath: data.miniProgramPath || buildMiniProgramPath(data),
    miniProgramQrCode: normalizeImageSource(getMiniProgramQrCodeFromData(data)),
    miniProgramQrCodeFilePath: data.miniProgramQrCodeFilePath || "",
    roomCode: data.roomCode || "",
    roomId: data.roomId || "",
    liveId: data.liveId || data.roomId || "",
    tenantId: data.tenantId || "",
    shareCode: data.shareCode || data.share_code || "",
    bindId: data.bindId || data.bind_id || "",
    anchorName: data.anchorName || "",
    anchorAvatar: inviter.avatar || data.anchorAvatar || "https://man.lqjy.cc/static/icons/default.png",
    liveName: data.liveName || "",
    pushTime: Number(data.pushTime) || 0,
    scheduleTime: data.scheduleTime || "",
    liveDate: data.liveDate || "",
    inviterName: inviter.nick || data.anchorName || "游客",
    isReplay: isReplayPayload(data),
    replay: data.replay || "",
    mode: data.mode || "",
    liveType: data.liveType || data.live_type || "",
    videoId: data.videoId || data.video_id || data.replayVideoId || data.replay_video_id || "",
    video_id: data.video_id || data.videoId || data.replayVideoId || data.replay_video_id || "",
    replayVideoId: data.replayVideoId || data.videoId || data.video_id || data.replay_video_id || "",
    replay_video_id: data.replay_video_id || data.replayVideoId || data.videoId || data.video_id || "",
  };
  miniProgramQrCodeSrc.value = await resolveMiniProgramQrCodeSrc(
    payload.value.miniProgramQrCode,
    payload.value.miniProgramQrCodeFilePath,
  );
  navDomain.value = normalizeNavDomain(data);
  recordDebugEvent("payload_resolved", {
    hasAvatar: !!payload.value.anchorAvatar,
    inviterName: payload.value.inviterName,
    sharePath: shareMiniProgramPath.value,
    qrcodeText: payload.value.link || shareMiniProgramPath.value,
    hasMiniProgramQrCode: !!payload.value.miniProgramQrCode,
    hasMiniProgramQrCodeFilePath: !!payload.value.miniProgramQrCodeFilePath,
    miniProgramQrCodeType: getImageSourceType(payload.value.miniProgramQrCode),
    miniProgramQrCodeField: qrcodeFieldSource.value,
    ordinaryQrCodeCandidateField: ordinaryQrCodeCandidateSource.value,
  });
  await renderQrcode();
  await renderPoster();
  schedulePosterPreloadQueue("page_mounted");
});

onUnload(() => {
  posterRenderTaskId.value += 1;
  cancelPosterPreload("page_unload");
  posterRenderPromise = null;
  shareRenderPromise = null;
  resetPosterRuntimeCache("page_unload");
});

onShareAppMessage(() => {
  const options = buildShareOptions();
  recordDebugEvent("share_app_message", {
    hasShareImage: !!shareImageSrc.value,
    hasPosterImage: !!posterImageSrc.value,
    imageUrl: options.imageUrl,
    path: options.path,
  });
  if (!shareImageSrc.value) {
    options.promise = ensureShareImageReady().then(() => buildShareOptions());
    recordDebugEvent("share_promise_attached", { reason: "shareImageSrc empty" });
  }
  return options;
});

onShareTimeline(() => {
  const path = shareMiniProgramPath.value;
  return {
    title: payload.value.liveName || "直播邀请",
    query: path.includes("?") ? path.split("?")[1] : "",
    imageUrl: shareImageSrc.value || posterImageSrc.value || activeTemplate.value?.bgImg || "",
  };
});

function buildShareOptions() {
  return {
    title: payload.value.liveName || "直播邀请",
    path: shareMiniProgramPath.value,
    imageUrl: shareImageSrc.value || posterImageSrc.value || activeTemplate.value?.bgImg || "",
  };
}

function buildPosterPayload() {
  const qrcodeImage = miniProgramQrCodeSrc.value || payload.value.miniProgramQrCode || "";
  const qrcodeImageCandidates = [
    miniProgramQrCodeSrc.value,
    payload.value.miniProgramQrCodeFilePath,
    payload.value.miniProgramQrCode,
  ].filter(Boolean);
  return {
    ...payload.value,
    displayTime: displayTime.value || "敬请期待",
    link: payload.value.link || shareMiniProgramPath.value,
    qrcodeText: shareMiniProgramPath.value,
    qrcodeImage,
    qrcodeImageCandidates,
    qrcodeImageSource: qrcodeSource.value,
  };
}

function resetPosterRuntimeCache(reason) {
  const snapshot = resetInvitationPosterRuntimeCache();
  recordDebugEvent("poster_runtime_cache_reset", {
    reason,
    ...snapshot,
  });
}

function createPosterDebugOptions() {
  return {
    promiseScope: posterPageInstanceId,
    onEvent: (type, detail) => recordDebugEvent(type, detail),
  };
}

async function ensureShareImageReady() {
  if (shareImageSrc.value) {
    recordDebugEvent("ensure_share_image_skip", { reason: "exists", imageUrl: shareImageSrc.value });
    return shareImageSrc.value;
  }
  recordDebugEvent("ensure_share_image_start", {
    hasShareRenderPromise: !!shareRenderPromise,
    hasRenderPromise: !!posterRenderPromise,
    hasPosterImage: !!posterImageSrc.value,
  });
  if (shareRenderPromise) {
    await shareRenderPromise;
  } else {
    if (posterRenderPromise) {
      await posterRenderPromise;
    } else if (!posterImageSrc.value) {
      await renderPoster();
    }
    if (!shareImageSrc.value) {
      const template = activeTemplate.value;
      const taskId = posterRenderTaskId.value;
      const posterDebugOptions = createPosterDebugOptions();
      const sharePromise = renderShareCard(taskId, template, buildPosterPayload(), posterDebugOptions);
      shareRenderPromise = sharePromise;
      try {
        await sharePromise;
      } finally {
        if (shareRenderPromise === sharePromise) {
          shareRenderPromise = null;
        }
      }
    }
  }
  recordDebugEvent("ensure_share_image_done", { imageUrl: shareImageSrc.value });
  return shareImageSrc.value;
}

async function resolveInviterProfile() {
  let avatar = "";
  let nick = "";
  try {
    const userStore = useUserStore();
    let userInfo = userStore.userInfo || {};
    const hasName = userInfo.nickname || userInfo.nickName || userInfo.name;
    if (userStore.token && (!userInfo.avatar || !hasName)) {
      try {
        const profile = await getProfile();
        if (profile) {
          userInfo = { ...userInfo, ...profile };
          userStore.setUserInfo(userInfo);
        }
      } catch (_) {}
    }
    avatar = userInfo.avatar || userInfo.headimgurl || userInfo.headImg || "";
    nick = userInfo.nickname || userInfo.nickName || userInfo.name || "";
    recordDebugEvent("profile_resolved", {
      hasToken: !!userStore.token,
      userKeys: Object.keys(userInfo || {}),
      hasAvatar: !!avatar,
      nick,
    });
  } catch (error) {
    recordDebugEvent("profile_resolve_fail", normalizeError(error));
  }
  return { avatar, nick };
}

function renderQrcode() {
  const text = payload.value.link || "/pages/broadcast/entry";
  const miniProgramCode = miniProgramQrCodeSrc.value || payload.value.miniProgramQrCode || "";
  if (miniProgramCode) {
    qrcodeSrc.value = miniProgramCode;
    qrcodeSource.value = payload.value.miniProgramQrCodeFilePath
      ? "miniProgramQrCodeFilePath"
      : miniProgramQrCodeSrc.value
        ? "miniProgramQrCodeTempFile"
        : "miniProgramQrCode";
    qrcodeFallbackReason.value = "";
  } else {
    qrcodeSrc.value = buildQrcodeImageUrl(text);
    qrcodeSource.value = qrcodeSrc.value ? "ordinaryQrCode" : "none";
    qrcodeFallbackReason.value = qrcodeSrc.value
      ? getOrdinaryQrCodeFallbackReason()
      : "二维码内容为空";
  }
  recordDebugEvent("qrcode_rendered", {
    hasImage: !!qrcodeSrc.value,
    text: maskSensitiveText(text),
    source: qrcodeSource.value,
    fallbackReason: qrcodeFallbackReason.value,
    hasMiniProgramQrCode: !!payload.value.miniProgramQrCode,
    hasMiniProgramQrCodeFilePath: !!payload.value.miniProgramQrCodeFilePath,
    miniProgramQrCodeField: qrcodeFieldSource.value,
    ordinaryQrCodeCandidateField: ordinaryQrCodeCandidateSource.value,
    miniProgramQrCodeType: getImageSourceType(payload.value.miniProgramQrCode),
    imageUrl: qrcodeSrc.value,
  });
}

async function resolveMiniProgramQrCodeSrc(value, filePath = "") {
  const existingFilePath = String(filePath || "").trim();
  if (existingFilePath) {
    recordDebugEvent("mini_program_qrcode_src_ready", {
      type: getImageSourceType(existingFilePath),
      source: "payload-file-path",
      tempFile: true,
    });
    return existingFilePath;
  }
  const image = normalizeImageSource(value);
  if (!image) return "";
  if (!/^data:image\//i.test(image)) {
    recordDebugEvent("mini_program_qrcode_src_ready", {
      type: getImageSourceType(image),
      source: "payload-image",
      tempFile: false,
    });
    return image;
  }
  // #ifdef MP-WEIXIN
  if (miniProgramQrCodeSrcCache.has(image)) {
    const cachedFilePath = miniProgramQrCodeSrcCache.get(image) || "";
    if (cachedFilePath) {
      recordDebugEvent("mini_program_qrcode_temp_file_cache_hit", {
        type: "data-url",
        filePath: cachedFilePath,
      });
      return cachedFilePath;
    }
  }
  try {
    const filePath = await writeBase64ImageToTempFile(image, `invitation-qrcode-${hashText(image)}.png`);
    miniProgramQrCodeSrcCache.set(image, filePath);
    recordDebugEvent("mini_program_qrcode_temp_file_success", {
      type: "data-url",
      filePath,
    });
    return filePath;
  } catch (error) {
    recordDebugEvent("mini_program_qrcode_temp_file_fail", normalizeError(error));
  }
  // #endif
  return image;
}

function hashText(value) {
  let hash = 0;
  const text = String(value || "");
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function buildQrcodeImageUrl(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=1&data=${encodeURIComponent(value)}`;
}

async function selectTemplate(idx) {
  if (idx === activeIdx.value) return;
  cancelPosterPreload("template_select");
  activeIdx.value = idx;
  const template = templates[idx];
  const posterDebugOptions = createPosterDebugOptions();
  posterImageSrc.value = await getCachedPosterFile(template, buildRenderCacheKey(template, "poster"), posterDebugOptions);
  shareImageSrc.value = await getCachedShareFile(template, buildRenderCacheKey(template, "share"), posterDebugOptions);
  await renderPoster();
  schedulePosterPreloadQueue("template_select_done");
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(Number(ts) * 1000);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function slotText(text, slot = {}, defaultMax = 10) {
  const value = String(text || "");
  const max = Number(slot.maxLen || defaultMax);
  return value.length > max ? `${value.slice(0, Math.max(max - 1, 1))}...` : value;
}

function slotTextStyle(slot = {}) {
  if (!slot) return {};
  const style = {
    color: slot.color || "#FFFFFF",
    fontSize: `${slotFontRpx(slot)}rpx`,
    textAlign: slot.cx != null ? "center" : "left",
  };
  if (slot.cx != null) {
    style.left = `${Number(slot.cx) * 100}%`;
    style.top = `${Number(slot.cy || 0) * 100}%`;
    style.transform = "translate(-50%, -50%)";
  } else {
    style.left = `${Number(slot.x || 0) * 100}%`;
    style.top = `${Number(slot.y || 0) * 100}%`;
    style.transform = "translateY(-50%)";
  }
  return style;
}

function posterWidthRpx(ratio) {
  return Math.round(Number(ratio || 0) * CARD_DISPLAY_WIDTH_RPX);
}

function slotFontRpx(slot = {}) {
  const aspectRatio = Number(activeTemplate.value?.aspectRatio || CARD_DESIGN_WIDTH / 1334);
  const designHeight = CARD_DESIGN_WIDTH / aspectRatio;
  const displayScale = CARD_DISPLAY_WIDTH_RPX / CARD_DESIGN_WIDTH;
  return Math.round(designHeight * Number(slot.fontPct || 0.02) * displayScale);
}

function copyLink() {
  const link = payload.value.link || "/pages/broadcast/entry";
  uni.setClipboardData({
    data: link,
    success: () => uni.showToast({ title: "链接已复制", icon: "success" }),
    fail: () => uni.showToast({ title: "复制失败", icon: "none" }),
  });
}

async function saveQrcode() {
  if (posterRendering.value) {
    uni.showToast({ title: "邀请函生成中", icon: "none" });
    return;
  }
  if (!posterImageSrc.value) {
    uni.showToast({ title: "邀请函生成失败", icon: "none" });
    return;
  }
  try {
    await saveImageToAlbumWithAuth(posterImageSrc.value);
    uni.showToast({ title: "已保存", icon: "success" });
  } catch (error) {
    console.warn("[Invitation] save invitation fail:", error);
    uni.showToast({ title: "请长按图片保存", icon: "none" });
  }
}

async function renderPoster() {
  const taskId = posterRenderTaskId.value + 1;
  posterRenderTaskId.value = taskId;
  recordDebugEvent("render_poster_start", { taskId, templateId: activeTemplate.value?.id || "" });
  const promise = renderPosterTask(taskId);
  posterRenderPromise = promise;
  try {
    await promise;
  } finally {
    if (posterRenderPromise === promise) {
      posterRenderPromise = null;
    }
  }
}

async function renderPosterTask(taskId) {
  const template = activeTemplate.value;
  const templateId = template?.id || "";
  const posterCacheKey = buildRenderCacheKey(template, "poster");
  const shareCacheKey = buildRenderCacheKey(template, "share");
  const startedAt = Date.now();
  if (!template) {
    posterImageSrc.value = "";
    shareImageSrc.value = "";
    recordDebugEvent("render_poster_skip", { taskId, reason: "template empty" });
    return;
  }
  // #ifdef MP-WEIXIN
  const posterDebugOptions = createPosterDebugOptions();
  const cachedPoster = await getCachedPosterFile(template, posterCacheKey, posterDebugOptions);
  const cachedShare = await getCachedShareFile(template, shareCacheKey, posterDebugOptions);
  posterImageSrc.value = cachedPoster;
  shareImageSrc.value = cachedShare;
  if (cachedPoster) {
    recordDebugEvent("poster_file_cache_hit", {
      taskId,
      templateId,
      hasShareImage: !!cachedShare,
    });
    return;
  }
  posterRendering.value = !cachedPoster;
  try {
    const posterPayload = buildPosterPayload();
    recordDebugEvent("render_payload", {
      taskId,
      hasAvatar: !!posterPayload.anchorAvatar,
      inviterName: posterPayload.inviterName,
      hasQrcodeText: !!posterPayload.qrcodeText,
      hasQrcodeImage: !!posterPayload.qrcodeImage,
      qrcodeImageSource: posterPayload.qrcodeImageSource || "",
      qrcodeFallbackReason: qrcodeFallbackReason.value,
      qrcodeText: maskSensitiveText(posterPayload.qrcodeText),
      hasLink: !!posterPayload.link,
    });
    if (cachedShare) {
      shareImageSrc.value = cachedShare;
      recordDebugEvent("share_card_cache_hit", { taskId, templateId });
    }
    if (!cachedPoster) {
      try {
        const result = await resolveInvitationPosterFileCache(posterCacheKey, () =>
          createInvitationPosterTempFile(template, posterPayload, posterDebugOptions),
          posterDebugOptions,
        );
        const filePath = result.filePath;
        if (posterRenderTaskId.value !== taskId) return;
        posterImageSrc.value = filePath;
        posterReadyMap.value = { ...posterReadyMap.value, [templateId]: filePath };
        setInvitationPosterFileCache(posterCacheKey, filePath);
        recordDebugEvent("poster_ready", {
          taskId,
          filePath,
          cacheShared: result.shared,
          cacheHitAfterWait: result.cached,
          durationMs: Date.now() - startedAt,
        });
      } catch (error) {
        if (posterRenderTaskId.value !== taskId) return;
        posterImageSrc.value = "";
        recordDebugEvent("poster_fail", normalizeError(error));
        console.warn("[Invitation] poster render fail:", error);
      }
    } else {
      recordDebugEvent("poster_cache_hit", { taskId, templateId });
    }
  } finally {
    if (posterRenderTaskId.value === taskId) {
      posterRendering.value = false;
      if (shareRenderPromise && shareReadyMap.value[templateId]) {
        shareRenderPromise = null;
      }
      recordDebugEvent("render_poster_done", {
        taskId,
        hasShareImage: !!shareImageSrc.value,
        hasPosterImage: !!posterImageSrc.value,
        durationMs: Date.now() - startedAt,
      });
    }
  }
  // #endif
}

function schedulePosterPreloadQueue(reason) {
  // #ifdef MP-WEIXIN
  if (posterPreloadTimer) {
    clearTimeout(posterPreloadTimer);
    posterPreloadTimer = null;
  }
  recordDebugEvent("poster_preload_scheduled", {
    reason,
    delayMs: POSTER_PRELOAD_DELAY_MS,
  });
  posterPreloadTimer = setTimeout(() => {
    posterPreloadTimer = null;
    startPosterPreloadQueue(reason);
  }, POSTER_PRELOAD_DELAY_MS);
  // #endif
}

function cancelPosterPreload(reason) {
  if (posterPreloadTimer) {
    clearTimeout(posterPreloadTimer);
    posterPreloadTimer = null;
  }
  posterPreloadRunId += 1;
  recordDebugEvent("poster_preload_cancel_requested", {
    reason,
    runId: posterPreloadRunId,
    hasPromise: !!posterPreloadPromise,
  });
  posterPreloadPromise = null;
}

function startPosterPreloadQueue(reason = "") {
  // #ifdef MP-WEIXIN
  const runId = posterPreloadRunId + 1;
  posterPreloadRunId = runId;
  const posterPayload = buildPosterPayload();
  const promise = preloadPosterTemplates(runId, posterPayload, reason);
  posterPreloadPromise = promise;
  promise.finally(() => {
    if (posterPreloadPromise === promise) {
      posterPreloadPromise = null;
    }
  });
  // #endif
}

async function preloadPosterTemplates(runId, posterPayload, reason = "") {
  recordDebugEvent("poster_preload_start", {
    runId,
    reason,
    total: templates.length,
    hasAvatar: !!posterPayload.anchorAvatar,
    hasQrcodeText: !!posterPayload.qrcodeText,
    hasQrcodeImage: !!posterPayload.qrcodeImage,
    qrcodeImageSource: posterPayload.qrcodeImageSource || "",
  });
  for (const template of templates) {
    if (posterPreloadRunId !== runId) {
      recordDebugEvent("poster_preload_cancel", {
        runId,
        currentRunId: posterPreloadRunId,
      });
      return;
    }
    const templateId = template?.id || "";
    const posterCacheKey = buildRenderCacheKey(template, "poster");
    const posterDebugOptions = createPosterDebugOptions();
    const cachedPoster = await getCachedPosterFile(template, posterCacheKey, posterDebugOptions);
    if (cachedPoster) {
      recordDebugEvent("poster_preload_skip_cache", { runId, templateId });
      continue;
    }
    await waitPosterPreloadStep(runId, templateId);
    if (posterPreloadRunId !== runId) {
      recordDebugEvent("poster_preload_cancel", {
        runId,
        currentRunId: posterPreloadRunId,
        templateId,
      });
      return;
    }
    const startedAt = Date.now();
    try {
      recordDebugEvent("poster_preload_template_start", { runId, templateId });
      const result = await resolveInvitationPosterFileCache(posterCacheKey, () =>
        createInvitationPosterTempFile(template, posterPayload, posterDebugOptions),
        posterDebugOptions,
      );
      if (posterPreloadRunId !== runId) {
        recordDebugEvent("poster_preload_template_stale", {
          runId,
          currentRunId: posterPreloadRunId,
          templateId,
        });
        return;
      }
      const filePath = result.filePath;
      if (!filePath) {
        recordDebugEvent("poster_preload_template_empty", { runId, templateId });
        continue;
      }
      posterReadyMap.value = { ...posterReadyMap.value, [templateId]: filePath };
      setInvitationPosterFileCache(posterCacheKey, filePath);
      if (activeTemplate.value?.id === templateId && !posterImageSrc.value) {
        posterImageSrc.value = filePath;
      }
      recordDebugEvent("poster_preload_template_ready", {
        runId,
        templateId,
        cacheShared: result.shared,
        cacheHitAfterWait: result.cached,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      recordDebugEvent("poster_preload_template_fail", {
        runId,
        templateId,
        ...normalizeError(error),
      });
    }
  }
  recordDebugEvent("poster_preload_done", { runId });
}

function waitPosterPreloadStep(runId, templateId) {
  recordDebugEvent("poster_preload_step_wait", {
    runId,
    templateId,
    delayMs: POSTER_PRELOAD_STEP_DELAY_MS,
  });
  return new Promise((resolve) => {
    setTimeout(resolve, POSTER_PRELOAD_STEP_DELAY_MS);
  });
}

async function renderShareCard(taskId, template, posterPayload, posterDebugOptions) {
  const templateId = template?.id || "";
  if (!template) {
    recordDebugEvent("share_card_skip", { taskId, reason: "template empty" });
    return;
  }
  if (posterRenderTaskId.value !== taskId) {
    recordDebugEvent("share_card_skip_stale", {
      taskId,
      currentTaskId: posterRenderTaskId.value,
      templateId,
    });
    return;
  }
  const shareCacheKey = buildRenderCacheKey(template, "share");
  const cachedShare = await getCachedShareFile(template, shareCacheKey, posterDebugOptions);
  if (cachedShare) {
    shareImageSrc.value = cachedShare;
    recordDebugEvent("share_file_cache_hit", { taskId, templateId });
    return;
  }
  const startedAt = Date.now();
  try {
    const result = await resolveInvitationShareFileCache(
      shareCacheKey,
      () => createInvitationShareCardTempFile(template, posterPayload, posterDebugOptions),
      posterDebugOptions,
    );
    const shareFilePath = result.filePath;
    if (posterRenderTaskId.value !== taskId) return;
    shareImageSrc.value = shareFilePath;
    shareReadyMap.value = { ...shareReadyMap.value, [templateId]: shareFilePath };
    setInvitationShareFileCache(shareCacheKey, shareFilePath);
    recordDebugEvent("share_card_ready", {
      taskId,
      filePath: shareFilePath,
      cacheHitAfterWait: result.cached,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    if (posterRenderTaskId.value !== taskId) return;
    shareImageSrc.value = "";
    recordDebugEvent("share_card_fail", normalizeError(error));
    console.warn("[Invitation] share image render fail:", error);
  }
}

async function getCachedPosterFile(template, cacheKey = buildRenderCacheKey(template, "poster"), options = {}) {
  const templateId = template?.id || "";
  const cachedFile = await getUsableInvitationPosterFileCache(cacheKey, options);
  if (cachedFile) return cachedFile;
  const readyFile = posterReadyMap.value[templateId] || "";
  if (!readyFile) return "";
  setInvitationPosterFileCache(cacheKey, readyFile);
  const checkedReadyFile = await getUsableInvitationPosterFileCache(cacheKey, options);
  if (checkedReadyFile) return checkedReadyFile;
  posterReadyMap.value = { ...posterReadyMap.value, [templateId]: "" };
  return "";
}

async function getCachedShareFile(template, cacheKey = buildRenderCacheKey(template, "share"), options = {}) {
  const templateId = template?.id || "";
  const cachedFile = await getUsableInvitationShareFileCache(cacheKey, options);
  if (cachedFile) return cachedFile;
  const readyFile = shareReadyMap.value[templateId] || "";
  if (!readyFile) return "";
  setInvitationShareFileCache(cacheKey, readyFile);
  const checkedReadyFile = await getUsableInvitationShareFileCache(cacheKey, options);
  if (checkedReadyFile) return checkedReadyFile;
  shareReadyMap.value = { ...shareReadyMap.value, [templateId]: "" };
  return "";
}

function getMiniProgramQrCodeField(data = {}) {
  const candidates = [
    ["miniProgramQrCode", data.miniProgramQrCode],
    ["mini_program_qr_code", data.mini_program_qr_code],
    ["miniProgramCode", data.miniProgramCode],
    ["mini_program_code", data.mini_program_code],
    ["wxaCode", data.wxaCode],
    ["wxacode", data.wxacode],
  ];
  const found = candidates.find(([, value]) => !!value);
  return found?.[0] || "";
}

function getMiniProgramQrCodeFromData(data = {}) {
  const field = getMiniProgramQrCodeField(data);
  return field ? data[field] || "" : "";
}

function getOrdinaryQrCodeCandidateField(data = {}) {
  const candidates = [
    ["qrCode", data.qrCode],
    ["qr_code", data.qr_code],
    ["qrcode", data.qrcode],
  ];
  const found = candidates.find(([, value]) => !!value);
  return found?.[0] || "";
}

function getOrdinaryQrCodeFallbackReason() {
  if (ordinaryQrCodeCandidateSource.value) {
    return `payload缺少小程序码，存在${ordinaryQrCodeCandidateSource.value}普通二维码候选`;
  }
  return "payload缺少小程序码";
}

function getImageSourceType(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^data:image\//i.test(text)) return "data-url";
  if (/^https?:\/\//i.test(text)) return "url";
  if (/^wxfile:\/\//i.test(text)) return "wxfile";
  if (/^\//.test(text)) return "local-path";
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(text.replace(/\s+/g, "")) && text.length > 80) return "base64";
  return "text";
}

function buildRenderCacheKey(template, kind) {
  if (!template?.id) return "";
  const data = payload.value || {};
  return [
    kind,
    INVITATION_POSTER_CACHE_VERSION,
    template.id,
    data.anchorAvatar || "",
    data.inviterName || "",
    data.liveName || "",
    displayTime.value || "",
    shareMiniProgramPath.value || "",
    data.miniProgramQrCode || "",
  ].join("|");
}

function normalizeNavDomain(data = {}) {
  const raw =
    data.navDomain ||
    data.domain ||
    data.host ||
    data.tenantName ||
    data.liveName ||
    "小程序";
  return String(raw || "小程序").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function buildMiniProgramPath(data = {}) {
  const params = [];
  const roomCode = data.roomCode || "";
  const liveId = data.liveId || data.roomId || "";
  const tenantId = data.tenantId || "";
  const shareCode = data.shareCode || data.share_code || "";
  const bindId = data.bindId || data.bind_id || "";
  const replayVideoId = data.replayVideoId || data.replay_video_id || data.videoId || data.video_id || "";
  if (roomCode) params.push(`roomCode=${encodeURIComponent(roomCode)}`);
  if (liveId) params.push(`liveId=${encodeURIComponent(liveId)}`);
  if (tenantId) params.push(`tenantId=${encodeURIComponent(tenantId)}`);
  if (shareCode && shareCode !== roomCode) params.push(`shareCode=${encodeURIComponent(shareCode)}`);
  if (bindId) params.push(`bindId=${encodeURIComponent(bindId)}`);
  appendReplayParams(params, isReplayPayload(data), replayVideoId);
  return `/pages/broadcast/entry${params.length ? `?${params.join("&")}` : ""}`;
}

function isReplayPayload(data = {}) {
  return (
    data.isReplay === true ||
    String(data.replay || "") === "1" ||
    String(data.mode || "").toLowerCase() === "replay" ||
    String(data.liveType || data.live_type || "").toLowerCase() === "replay"
  );
}

function appendReplayParams(params, isReplay, replayVideoId) {
  if (!isReplay) return;
  params.push("mode=replay");
  params.push("replay=1");
  params.push("liveType=replay");
  const videoId = String(replayVideoId || "").trim();
  if (!videoId || videoId === "0") return;
  const encoded = encodeURIComponent(videoId);
  params.push(`videoId=${encoded}`);
  params.push(`video_id=${encoded}`);
  params.push(`replayVideoId=${encoded}`);
  params.push(`replay_video_id=${encoded}`);
}

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: shareMiniProgramPath.value });
    },
  });
}
</script>

<style lang="scss" scoped>
.invitation-page {
  min-height: 100vh;
  background: #ededed;
  display: flex;
  flex-direction: column;
}

.inv-nav {
  height: 88rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ededed;
}

.inv-nav__back,
.inv-nav__more {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inv-nav__close {
  font-size: 40rpx;
  color: #1a1a1a;
}

.inv-nav__more-dot {
  font-size: 36rpx;
  color: #1a1a1a;
  letter-spacing: 2rpx;
}

.inv-nav__center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.inv-nav__title {
  font-size: 30rpx;
  color: #1a1a1a;
  font-weight: 600;
  line-height: 1.2;
}

.inv-nav__sub {
  font-size: 20rpx;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.4;
  margin-top: 4rpx;
}

.inv-preview-wrap {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24rpx 0 0;
  box-sizing: border-box;
}

.inv-preview-card {
  position: relative;
  width: 630rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  background: #fff;
}

.inv-preview-img {
  width: 100%;
  height: 100%;
  display: block;
}

.inv-layer-avatar,
.inv-layer-qrcode,
.inv-layer-text {
  position: absolute;
  z-index: 2;
}

.inv-layer-avatar {
  border-radius: 50%;
  overflow: hidden;
  background: #444;
}

.inv-layer-qrcode {
  background: #fff;
}

.inv-layer-text {
  max-width: 360rpx;
  line-height: 1.2;
  white-space: nowrap;
}

.inv-layer-text--bold {
  font-weight: 700;
}

.inv-preview-placeholder {
  width: 100%;
  height: 600rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inv-preview-placeholder-text {
  color: rgba(0, 0, 0, 0.4);
  font-size: 26rpx;
}

.inv-tip {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.55);
  margin: 24rpx 0 16rpx;
}

.inv-actions {
  display: flex;
  gap: 20rpx;
  padding: 0 40rpx 20rpx;
  box-sizing: border-box;
}

.inv-action-btn {
  flex: 1;
  height: 78rpx;
  border-radius: 78rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inv-action-btn--primary {
  background: linear-gradient(90deg, #ff8a2d 0%, #ff6b2e 100%);
}

.inv-action-btn-text {
  font-size: 28rpx;
  color: #222;
  font-weight: 600;
}

.inv-action-btn-text--primary {
  color: #fff;
}

.inv-templates {
  width: 100%;
  padding: 16rpx 0 32rpx;
  background: #f7f7f7;
}

.inv-templates-inner {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx 24rpx calc(8rpx + env(safe-area-inset-bottom));
}

.inv-tpl-item {
  position: relative;
  width: 160rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
  border: 4rpx solid transparent;
  background: #fff;
  flex-shrink: 0;
  box-sizing: border-box;
}

.inv-tpl-item--active {
  border-color: #ff5e8e;
}

.inv-tpl-img {
  width: 100%;
  height: 100%;
  display: block;
}

.inv-tpl-check {
  position: absolute;
  left: 12rpx;
  top: 12rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #ff5e8e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inv-tpl-check-icon {
  color: #fff;
  font-size: 22rpx;
  line-height: 1;
}

.inv-debug-float {
  position: fixed;
  right: 18rpx;
  bottom: calc(190rpx + env(safe-area-inset-bottom));
  z-index: 99;
  width: 310rpx;
  padding: 14rpx;
  border-radius: 12rpx;
  background: rgba(17, 17, 26, 0.92);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
}

.inv-debug-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.inv-debug-title-text {
  font-size: 22rpx;
  line-height: 1.3;
  color: #fff;
  font-weight: 700;
}

.inv-debug-status {
  flex-shrink: 0;
  font-size: 18rpx;
  line-height: 1.3;
  color: #7cffb7;
}

.inv-debug-lines {
  margin-top: 8rpx;
}

.inv-debug-line {
  display: block;
  width: 100%;
  font-size: 19rpx;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.78);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inv-debug-button {
  height: 44rpx;
  margin-top: 10rpx;
  border-radius: 8rpx;
  background: #ff6b2e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inv-debug-button-text {
  font-size: 20rpx;
  line-height: 1;
  color: #fff;
  font-weight: 600;
}
</style>
