<template>
  <view
    v-if="visible"
    :class="['share-mask', activePanel === 'qrcode' ? 'mask-center' : '']"
    @click="close"
  >
    <view v-if="activePanel === 'main'" class="share-panel" @click.stop>
      <view class="share-header">
        <text class="share-title">分享至</text>
        <view class="share-close" @click="close">
          <text class="close-x">✕</text>
        </view>
      </view>
      <view :class="['share-options', loadedMiniProgramShortLink ? 'share-options--three' : '']">
        <view class="share-item" @click="onShare('invitation')">
          <view class="share-icon invitation-bg">
            <image
              class="icon-svg"
              src="https://man.lqjy.cc/static/icons/invitation.svg"
              mode="aspectFit"
            />
          </view>
          <text class="share-label">生成邀请函</text>
        </view>
        <view v-if="loadedMiniProgramShortLink" class="share-item" @click="onShare('link')">
          <view class="share-icon link-bg">
            <image
              class="icon-svg"
              src="https://man.lqjy.cc/static/icons/Frame_115.svg"
              mode="aspectFit"
            />
          </view>
          <text class="share-label">复制链接</text>
        </view>
        <view class="share-item" @click="onShare('qrcode')">
          <view class="share-icon qrcode-bg">
            <image
              class="icon-svg"
              src="https://man.lqjy.cc/static/icons/Frame_116.svg"
              mode="aspectFit"
            />
          </view>
          <text class="share-label">保存二维码</text>
        </view>
      </view>
    </view>

    <view v-else-if="activePanel === 'link'" class="link-panel" @click.stop>
      <view class="panel-header">
        <view class="panel-status">
          <view class="status-dot">
            <text class="status-check">✓</text>
          </view>
          <text class="panel-status-text">{{ linkStatusText }}</text>
        </view>
        <view class="panel-close" @click="close">
          <text class="close-x">✕</text>
        </view>
      </view>

      <view class="link-box">
        <text class="link-text">{{ currentLink }}</text>
      </view>

      <view class="primary-btn" @click="copyCurrentLink">
        <text class="primary-btn-text">复制链接</text>
      </view>
    </view>

    <view v-else-if="activePanel === 'qrcode'" class="qrcode-panel" @click.stop>
      <view class="panel-header center">
        <text class="panel-title">直播间二维码</text>
        <view class="panel-close" @click="close">
          <text class="close-x">✕</text>
        </view>
      </view>

      <view class="qrcode-wrap">
        <image
          class="qrcode-img"
          :src="qrcodeSrc"
          mode="aspectFit"
          show-menu-by-longpress
        />
      </view>
      <text class="qrcode-tip">长按或点击保存二维码 分享朋友圈</text>
      <view class="primary-btn qrcode-save-btn" @click="saveQrcode">
        <text class="primary-btn-text">保存二维码</text>
      </view>
    </view>

    <!-- [2026-05-21] 微信右上角分享引导面板：H5 不能主动唤起分享，只能预设分享卡片后引导用户点右上角 ··· -->
    <view v-else-if="activePanel === 'wechat-guide'" class="wechat-guide" @click.stop="close">
      <view class="wechat-guide-arrow"></view>
      <text class="wechat-guide-tip-1">点击右上角 <text class="wechat-guide-dots">···</text></text>
      <text class="wechat-guide-tip-2">选择「发送给朋友」或「分享到朋友圈」</text>
      <view class="wechat-guide-btn">
        <text class="wechat-guide-btn-text">我知道了</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { getLiveDistributorShareUrl } from "@/services/live-share";
import { readBindId } from "@/services/h5-auth-context";
import { normalizeImageSource, saveImageToAlbumWithAuth, saveImageUrlToAlbum, writeBase64ImageToTempFile } from "@/platform/weixin/file";
import { createQrCodeTempFile } from "@/platform/weixin/qrcode";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  // [2026-05-21] 直播间 ID，用于拉取分销员专属分享链接
  roomId: {
    type: [Number, String],
    default: 0,
  },
  roomCode: {
    type: String,
    default: "",
  },
  shareCode: {
    type: String,
    default: "",
  },
  bindId: {
    type: String,
    default: "",
  },
  tenantId: {
    type: [Number, String],
    default: 0,
  },
  isDistributor: {
    type: Boolean,
    default: false,
  },
  distributorStatus: {
    type: Number,
    default: 0,
  },
  linkUrl: {
    type: String,
    default: "",
  },
  // [2026-05-21] 邀请函所需业务字段：主播昵称、头像、直播间名、开播时间(秒级时间戳)
  anchorName: {
    type: String,
    default: "",
  },
  anchorAvatar: {
    type: String,
    default: "",
  },
  liveName: {
    type: String,
    default: "",
  },
  // [2026-05-21] 微信分享卡片缩略图：优先 liveCover、降级 anchorAvatar
  liveCover: {
    type: String,
    default: "",
  },
  pushTime: {
    type: [Number, String],
    default: 0,
  },
  scheduleTime: {
    type: String,
    default: "",
  },
  liveDate: {
    type: String,
    default: "",
  },
  isReplay: {
    type: Boolean,
    default: false,
  },
  replayVideoId: {
    type: [Number, String],
    default: "",
  },
});

const emit = defineEmits(["close", "share"]);

const activePanel = ref("main");
const linkType = ref("long");
const currentLink = ref("");
// [2026-05-21] 分销员专属分享链接，每次打开弹窗都重新拉取（后端追踪需要，不做本地缓存）
const loadedShareUrl = ref("");
const loadedShareCode = ref("");
const loadedMiniProgramQrCode = ref("");
const loadedMiniProgramQrCodeSource = ref("");
const loadedOrdinaryQrCodeCandidateSource = ref("");
const loadedMiniProgramQrCodeFilePath = ref("");
const loadedMiniProgramShortLink = ref("");
const shareUrlLoading = ref(false);
const shareUrlRequestKey = ref("");

const miniProgramRoomLink = computed(() => {
  const params = [];
  if (props.roomCode) params.push(`roomCode=${encodeURIComponent(props.roomCode)}`);
  if (props.roomId) params.push(`liveId=${encodeURIComponent(props.roomId)}`);
  if (props.tenantId) params.push(`tenantId=${encodeURIComponent(props.tenantId)}`);
  const code = loadedShareCode.value || props.shareCode || "";
  if (code && code !== props.roomCode) params.push(`shareCode=${encodeURIComponent(code)}`);
  const bindId = props.bindId || readBindId();
  if (bindId) params.push(`bindId=${encodeURIComponent(bindId)}`);
  appendReplayParams(params, props.isReplay, props.replayVideoId);
  return `/pages/broadcast/entry${params.length ? `?${params.join("&")}` : ""}`;
});

const canUseDistributorShare = computed(() => {
  return props.isDistributor && Number(props.distributorStatus) === 1;
});

const resolvedLongLink = computed(() => {
  if (loadedShareUrl.value) return withReplayParams(loadedShareUrl.value);
  if (props.linkUrl) return withReplayParams(props.linkUrl);
  return miniProgramRoomLink.value;
});

const linkStatusText = computed(() => {
  return linkType.value === "short" ? "短链接已复制" : "生成链接";
});

const qrcodeSrc = ref("");
const qrcodeTempFilePath = ref("");
const qrcodeRenderTaskId = ref(0);
const preferredMiniProgramQrCode = computed(() => loadedMiniProgramQrCode.value);

function buildQrcodeImageUrl(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=1&data=${encodeURIComponent(value)}`;
}

async function renderQrcode(text) {
  const taskId = qrcodeRenderTaskId.value + 1;
  qrcodeRenderTaskId.value = taskId;
  qrcodeTempFilePath.value = "";
  if (preferredMiniProgramQrCode.value && props.visible && activePanel.value === "qrcode") {
    qrcodeSrc.value = loadedMiniProgramQrCodeFilePath.value || preferredMiniProgramQrCode.value;
    return;
  }
  if (!text || !props.visible || activePanel.value !== "qrcode") {
    qrcodeSrc.value = "";
    return;
  }
  const fallbackUrl = buildQrcodeImageUrl(text);
  qrcodeSrc.value = fallbackUrl;
  // #ifdef MP-WEIXIN
  try {
    const filePath = await createQrCodeTempFile(text);
    if (qrcodeRenderTaskId.value !== taskId) return;
    qrcodeTempFilePath.value = filePath;
    qrcodeSrc.value = filePath;
  } catch (error) {
    console.warn("[share-popup] local qrcode render fail:", error);
  }
  // #endif
}

// [2026-06-06] 主包不再打包 qrcode 库；打开二维码面板时用图片 URL 渲染。
watch(
  [
    () => currentLink.value,
    () => resolvedLongLink.value,
    () => props.visible,
    () => activePanel.value,
    () => preferredMiniProgramQrCode.value,
    () => loadedMiniProgramQrCodeFilePath.value,
  ],
  ([cur, long]) => {
    renderQrcode(cur || long);
  },
  { immediate: true },
);

watch(
  [
    () => props.visible,
    () => props.roomId,
    () => props.isDistributor,
    () => props.distributorStatus,
  ],
  ([visible]) => {
    if (visible) {
      // [2026-05-21] 每次打开弹窗都重新拉 distributorShareUrl（不缓存）
      //   该接口走进来的前提是付父组件已用 isDistributor && status===1 筛过按钮可见性，
      //   这里不再重复权限判断；如后端返错，降级使用当前小程序直播间路径
      loadShareUrl();
    } else {
      activePanel.value = "main";
      linkType.value = "long";
      currentLink.value = "";
      qrcodeSrc.value = "";
      qrcodeTempFilePath.value = "";
      loadedShareUrl.value = "";
      loadedShareCode.value = "";
      loadedMiniProgramQrCode.value = "";
      loadedMiniProgramQrCodeSource.value = "";
      loadedOrdinaryQrCodeCandidateSource.value = "";
      loadedMiniProgramQrCodeFilePath.value = "";
      loadedMiniProgramShortLink.value = "";
    }
  },
  { immediate: true },
);

async function loadShareUrl() {
  const rid = Number(props.roomId);
  if (!canUseDistributorShare.value || !rid) {
    loadedShareUrl.value = "";
    loadedShareCode.value = "";
    loadedMiniProgramQrCode.value = "";
    loadedMiniProgramQrCodeSource.value = "";
    loadedOrdinaryQrCodeCandidateSource.value = "";
    loadedMiniProgramQrCodeFilePath.value = "";
    loadedMiniProgramShortLink.value = "";
    shareUrlRequestKey.value = "";
    return;
  }
  const requestKey = `${rid}:${props.isDistributor ? 1 : 0}:${Number(props.distributorStatus)}`;
  if (shareUrlLoading.value && shareUrlRequestKey.value === requestKey) return;
  loadedShareUrl.value = "";
  loadedShareCode.value = "";
  loadedMiniProgramQrCode.value = "";
  loadedMiniProgramQrCodeSource.value = "";
  loadedOrdinaryQrCodeCandidateSource.value = "";
  loadedMiniProgramQrCodeFilePath.value = "";
  loadedMiniProgramShortLink.value = "";
  shareUrlRequestKey.value = requestKey;
  shareUrlLoading.value = true;
  try {
    const res = await getLiveDistributorShareUrl(rid);
    const data = res?.data || res || {};
    const url = data.shareUrl || data.share_url || "";
    const code = data.shareCode || data.share_code || "";
    const miniProgramQrCodeSource = getMiniProgramQrCodeField(data);
    const ordinaryQrCodeCandidateSource = getOrdinaryQrCodeCandidateField(data);
    const qrCode = normalizeImageSource(getMiniProgramQrCodeFromData(data));
    const shortLink = String(data.miniProgramShortLink || data.mini_program_short_link || "").trim();
    if (url) loadedShareUrl.value = url;
    if (code) loadedShareCode.value = code;
    if (shortLink) loadedMiniProgramShortLink.value = shortLink;
    loadedMiniProgramQrCodeSource.value = miniProgramQrCodeSource;
    loadedOrdinaryQrCodeCandidateSource.value = ordinaryQrCodeCandidateSource;
    if (qrCode) {
      loadedMiniProgramQrCode.value = qrCode;
      // #ifdef MP-WEIXIN
      try {
        loadedMiniProgramQrCodeFilePath.value = await writeBase64ImageToTempFile(qrCode, `live-room-${rid}-qrcode.png`);
      } catch (error) {
        console.warn("[share-popup] miniProgramQrCode temp file fail:", error);
      }
      // #endif
    }
  } catch (e) {
    console.warn("[share-popup] getDistributorShareUrl fail:", e);
    // 不 toast，静默降级到当前小程序直播间路径，避免打扰用户
  } finally {
    shareUrlLoading.value = false;
  }
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

// [2026-05-21] 等待 distributorShareUrl 接口 resolve，避免在 loading 期间点击导致归因链接缺失
async function ensureShareUrlReady() {
  if (!shareUrlLoading.value) return;
  uni.showLoading({ title: "正在生成分享链接..." });
  try {
    while (shareUrlLoading.value) {
      await new Promise((r) => setTimeout(r, 50));
    }
  } finally {
    uni.hideLoading();
  }
}

function close() {
  emit("close");
}

function buildInvitationPayload() {
  const replayVideoId = normalizeReplayVideoId(props.replayVideoId);
  return {
    link: resolvedLongLink.value,
    miniProgramPath: miniProgramRoomLink.value,
    miniProgramQrCode: preferredMiniProgramQrCode.value,
    miniProgramQrCodeSource: loadedMiniProgramQrCodeSource.value,
    ordinaryQrCodeCandidateSource: loadedOrdinaryQrCodeCandidateSource.value,
    miniProgramQrCodeFilePath: loadedMiniProgramQrCodeFilePath.value,
    shareCode: loadedShareCode.value || props.shareCode || "",
    bindId: props.bindId || readBindId() || "",
    roomCode: props.roomCode || "",
    roomId: props.roomId || "",
    liveId: props.roomId || "",
    tenantId: props.tenantId || "",
    anchorName: props.anchorName,
    anchorAvatar: props.anchorAvatar,
    liveName: props.liveName,
    pushTime: Number(props.pushTime) || 0,
    scheduleTime: props.scheduleTime || "",
    liveDate: props.liveDate || "",
    isReplay: !!props.isReplay,
    replay: props.isReplay ? "1" : "",
    mode: props.isReplay ? "replay" : "",
    liveType: props.isReplay ? "replay" : "",
    videoId: replayVideoId,
    video_id: replayVideoId,
    replayVideoId,
    replay_video_id: replayVideoId,
  };
}

function normalizeReplayVideoId(value) {
  const text = String(value || "").trim();
  return text && text !== "0" ? text : "";
}

function appendReplayParams(params, isReplay, replayVideoId) {
  if (!isReplay) return;
  params.push("mode=replay");
  params.push("replay=1");
  params.push("liveType=replay");
  const videoId = normalizeReplayVideoId(replayVideoId);
  if (!videoId) return;
  const encoded = encodeURIComponent(videoId);
  params.push(`videoId=${encoded}`);
  params.push(`video_id=${encoded}`);
  params.push(`replayVideoId=${encoded}`);
  params.push(`replay_video_id=${encoded}`);
}

function withReplayParams(url) {
  if (!props.isReplay || !url) return url;
  const [base, hash = ""] = String(url).split("#");
  const target = hash && hash.startsWith("/") ? hash : base;
  const [path, query = ""] = target.split("?");
  const params = query ? query.split("&").filter(Boolean) : [];
  const existingKeys = new Set(
    params
      .map((item) => item.split("=")[0])
      .filter(Boolean),
  );
  const pushIfMissing = (key, value) => {
    if (existingKeys.has(key)) return;
    params.push(`${key}=${encodeURIComponent(value)}`);
    existingKeys.add(key);
  };
  pushIfMissing("mode", "replay");
  pushIfMissing("replay", "1");
  pushIfMissing("liveType", "replay");
  const videoId = normalizeReplayVideoId(props.replayVideoId);
  if (videoId) {
    pushIfMissing("videoId", videoId);
    pushIfMissing("video_id", videoId);
    pushIfMissing("replayVideoId", videoId);
    pushIfMissing("replay_video_id", videoId);
  }
  const next = `${path}${params.length ? `?${params.join("&")}` : ""}`;
  if (hash && hash.startsWith("/")) return `${base}#${next}`;
  return hash ? `${next}#${hash}` : next;
}

function navigateToInvitation() {
  uni.navigateTo({
    url: "/pagesPlus/main/invitation/index",
    fail: () => {
      uni.redirectTo({
        url: "/pagesPlus/main/invitation/index",
        fail: () => {
          uni.showToast({ title: "邀请函打开失败", icon: "none" });
        },
      });
    },
  });
}

async function onShare(type) {
  // 先等分销专属链接拉取完成，避免手速过快使用兑底链接丢归因
  await ensureShareUrlReady();
  emit("share", {
    type,
    shareCode: loadedShareCode.value || props.shareCode || "",
    shareUrl: resolvedLongLink.value || "",
    miniProgramPath: miniProgramRoomLink.value,
    miniProgramQrCode: preferredMiniProgramQrCode.value,
    miniProgramShortLink: loadedMiniProgramShortLink.value,
  });
  if (type === "link") {
    if (!loadedMiniProgramShortLink.value) {
      uni.showToast({ title: "链接获取失败", icon: "none" });
      return;
    }
    copyLinkValue(loadedMiniProgramShortLink.value);
    return;
  }
  if (type === "qrcode") {
    activePanel.value = "qrcode";
    linkType.value = "long";
    currentLink.value = resolvedLongLink.value;
    return;
  }
  if (type === "wechat") {
    onWechatShare();
    return;
  }
  if (type === "invitation") {
    // [2026-05-21] 邀请函：业务字段经 storage 暂存，避免 query 过长
    try {
      uni.setStorageSync("invitation_payload", buildInvitationPayload());
    } catch (_) {}
    close();
    navigateToInvitation();
    return;
  }
}

async function onMiniProgramWechatShare() {
  await ensureShareUrlReady();
  emit("share", {
    type: "wechat",
    shareCode: loadedShareCode.value || props.shareCode || "",
    shareUrl: resolvedLongLink.value || "",
    miniProgramPath: miniProgramRoomLink.value,
    miniProgramQrCode: preferredMiniProgramQrCode.value,
    miniProgramShortLink: loadedMiniProgramShortLink.value,
  });
  try {
    uni.showShareMenu?.({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    });
  } catch (e) {}
  close();
}

async function waitMiniProgramShareReady() {
  await ensureShareUrlReady();
  uni.showToast({ title: "请再次点击分享", icon: "none" });
}

// [2026-05-21] 微信分享：预设分享卡片 + 引导用户点右上角 ···
async function onWechatShare() {
  await ensureShareUrlReady();
  if (!resolvedLongLink.value) {
    uni.showToast({ title: "分享链接获取失败", icon: "none" });
    return;
  }
  try {
    uni.showShareMenu?.({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    });
  } catch (e) {}
  activePanel.value = "wechat-guide";
}

function copyCurrentLink() {
  const link = currentLink.value || resolvedLongLink.value;
  if (!link) {
    uni.showToast({ title: "链接获取失败", icon: "none" });
    return;
  }
  copyLinkValue(link);
}

function copyLinkValue(link) {
  uni.setClipboardData({
    data: link,
    success: () => {
      uni.showToast({ title: "链接已复制", icon: "success" });
    },
    fail: () => {
      uni.showToast({ title: "复制失败", icon: "none" });
    },
  });
}

async function saveQrcode() {
  const image = loadedMiniProgramQrCodeFilePath.value || qrcodeTempFilePath.value || qrcodeSrc.value;
  if (!image) {
    uni.showToast({ title: "二维码生成失败", icon: "none" });
    return;
  }
  try {
    if (loadedMiniProgramQrCodeFilePath.value || qrcodeTempFilePath.value) {
      await saveImageToAlbumWithAuth(image);
    } else {
      await saveImageUrlToAlbum(image, `live-room-${props.roomId || Date.now()}.png`);
    }
    uni.showToast({ title: "已保存", icon: "success" });
  } catch (error) {
    console.warn("[share-popup] save qrcode fail:", error);
    uni.showToast({ title: "请长按图片保存", icon: "none" });
  }
}
</script>

<style lang="scss" scoped>
.share-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
}

.mask-center {
  align-items: center;
}

.share-panel {
  width: 750rpx;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 38rpx 32rpx 90rpx 33rpx;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.panel-header.center {
  justify-content: center;
  position: relative;
}

.panel-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #000;
}

.panel-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-header.center .panel-close {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.panel-status {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.status-dot {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: #27c76f;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-check {
  font-size: 22rpx;
  line-height: 1;
  color: #fff;
  transform: translateY(-1rpx);
}

.panel-status-text {
  font-size: 30rpx;
  color: #000;
  font-weight: 500;
}

.link-panel {
  width: 750rpx;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 36rpx 32rpx 50rpx;
  box-sizing: border-box;
}

.link-box {
  background: #f0f0f4;
  border-radius: 12rpx;
  padding: 24rpx;
  min-height: 150rpx;
}

.link-text {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.6;
  word-break: break-all;
}

.primary-btn {
  margin-top: 30rpx;
  height: 96rpx;
  border-radius: 60rpx;
  background: linear-gradient(90deg, #ff8a2d 0%, #ff6b2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-btn-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}

.qrcode-panel {
  width: 640rpx;
  background: #fff;
  border-radius: 30rpx;
  padding: 40rpx 44rpx;
  margin: 0 auto;
  box-sizing: border-box;
}

.qrcode-wrap {
  width: 420rpx;
  height: 420rpx;
  border-radius: 24rpx;
  background: rgba(255, 107, 46, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20rpx auto 24rpx;
}

.qrcode-img {
  width: 360rpx;
  height: 360rpx;
  background: #fff;
}

.qrcode-tip {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.45);
}

.qrcode-save-btn {
  height: 76rpx;
  margin-top: 28rpx;
}

.share-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 50rpx;
}

.share-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #000;
}

.share-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-x {
  font-size: 36rpx;
  color: #999;
}

.share-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  row-gap: 34rpx;
  padding: 0 20rpx;
}

.share-item {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26rpx;
}

.share-options--three .share-item {
  width: 33.33%;
}

.share-item-button {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
  text-align: center;
}

.share-item-button::after {
  border: 0;
}

.share-icon {
  width: 110rpx;
  height: 110rpx;
  border-radius: 110rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wechat-bg {
  background: linear-gradient(148deg, #2cc547 21%, #4be177 85%);
}

.link-bg {
  background: linear-gradient(148deg, #4da6ff 21%, #6dc0ff 85%);
}

.qrcode-bg {
  background: linear-gradient(148deg, #ff8a2d 21%, #ffaa5c 85%);
}

.invitation-bg {
  background: linear-gradient(148deg, #ff5e8e 21%, #ff8ab4 85%);
}

.icon-text {
  font-size: 48rpx;
}

.icon-svg {
  width: 110rpx;
  height: 110rpx;
}

.share-label {
  font-size: 26rpx;
  color: #000;
}

/* [2026-05-21] 微信右上角分享引导面板 */
.wechat-guide {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 顶部留出空间，使提示在屏幕上部，贴近右上角菜单位置 */
  padding-top: 96rpx;
  z-index: 9999;
}

.wechat-guide-arrow {
  position: absolute;
  top: 24rpx;
  right: 96rpx;
  width: 110rpx;
  height: 200rpx;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 110 200'><path d='M70 30 Q30 80 30 160 L18 142 M30 160 L52 158' stroke='%23FFD600' stroke-width='6' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>")
    no-repeat center / contain;
}

.wechat-guide-tip-1 {
  margin-top: 240rpx;
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
}

.wechat-guide-dots {
  display: inline-block;
  padding: 0 16rpx;
  border: 2rpx solid #fff;
  border-radius: 8rpx;
  font-size: 32rpx;
  letter-spacing: 4rpx;
  margin-left: 8rpx;
}

.wechat-guide-tip-2 {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  text-align: center;
  padding: 0 60rpx;
}

.wechat-guide-btn {
  margin-top: 64rpx;
  padding: 18rpx 64rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.6);
  border-radius: 64rpx;
}

.wechat-guide-btn-text {
  font-size: 28rpx;
  color: #fff;
}
</style>
