<template>
  <view class="invitation-page">

    <view class="inv-preview-wrap">
      <view
        v-if="activeTemplate"
        class="inv-preview-card"
        :style="{ aspectRatio: `${activeTemplate.aspectRatio || 750 / 1334}` }"
      >
        <image
          class="inv-preview-img"
          :src="activeTemplate.bgImg"
          mode="scaleToFill"
          show-menu-by-longpress
        />
        <image
          v-if="payload.anchorAvatar"
          class="inv-layer-avatar"
          :src="payload.anchorAvatar"
          mode="aspectFill"
          :style="avatarStyle"
        />
        <text
          v-if="payload.inviterName"
          class="inv-layer-text"
          :class="{ 'inv-layer-text--bold': activeTemplate.slots?.inviterName?.bold }"
          :style="slotTextStyle(activeTemplate.slots?.inviterName)"
        >
          {{ slotText(payload.inviterName, activeTemplate.slots?.inviterName, 8) }}
        </text>
        <text
          class="inv-layer-text"
          :class="{ 'inv-layer-text--bold': activeTemplate.slots?.liveName?.bold }"
          :style="slotTextStyle(activeTemplate.slots?.liveName)"
        >
          {{ slotText(payload.liveName || "精彩直播", activeTemplate.slots?.liveName, 12) }}
        </text>
        <text
          class="inv-layer-text"
          :class="{ 'inv-layer-text--bold': activeTemplate.slots?.time?.bold }"
          :style="slotTextStyle(activeTemplate.slots?.time)"
        >
          {{ displayTime || "敬请期待" }}
        </text>
        <image
          v-if="qrcodeSrc"
          class="inv-layer-qrcode"
          :src="qrcodeSrc"
          mode="aspectFit"
          show-menu-by-longpress
          :style="qrcodeStyle"
          @longpress="saveQrcode"
        />
      </view>
      <view v-else class="inv-preview-placeholder">
        <text class="inv-preview-placeholder-text">正在生成...</text>
      </view>
    </view>
    <text class="inv-tip">长按二维码保存，或复制链接发送给好友</text>
    <view class="inv-actions">
      <view class="inv-action-btn" @click="copyLink">
        <text class="inv-action-btn-text">复制链接</text>
      </view>
      <view class="inv-action-btn inv-action-btn--primary" @click="saveQrcode">
        <text class="inv-action-btn-text inv-action-btn-text--primary">保存二维码</text>
      </view>
    </view>

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
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import templates from "./templates";
import { getProfile } from "@/api/user";
import { useUserStore } from "@/stores/user";
import { saveImageUrlToAlbum } from "@/platform/weixin/file";

const payload = ref({
  link: "",
  miniProgramPath: "",
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
const navDomain = ref("小程序");
const activeTemplate = computed(() => templates[activeIdx.value] || templates[0]);
const CARD_DESIGN_WIDTH = 750;
const CARD_DISPLAY_WIDTH_RPX = 630;

const displayTime = computed(() => {
  const schedule = payload.value.scheduleTime || payload.value.liveDate || "";
  if (schedule) return schedule.replace(/-/g, ".").replace(" ", "  ");
  return formatTime(payload.value.pushTime);
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

onMounted(async () => {
  let data = {};
  try {
    data = uni.getStorageSync("invitation_payload") || {};
  } catch (_) {}
  const inviter = await resolveInviterProfile();
  payload.value = {
    link: data.link || "/pages/broadcast/entry",
    miniProgramPath: data.miniProgramPath || buildMiniProgramPath(data),
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
  navDomain.value = normalizeNavDomain(data);
  await renderQrcode();
});

onShareAppMessage(() => ({
  title: payload.value.liveName || "直播邀请",
  path: shareMiniProgramPath.value,
  imageUrl: activeTemplate.value?.bgImg || "",
}));

onShareTimeline(() => {
  const path = shareMiniProgramPath.value;
  return {
    title: payload.value.liveName || "直播邀请",
    query: path.includes("?") ? path.split("?")[1] : "",
    imageUrl: activeTemplate.value?.bgImg || "",
  };
});

const shareMiniProgramPath = computed(() => {
  return payload.value.miniProgramPath || buildMiniProgramPath(payload.value) || "/pages/broadcast/entry";
});

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
  } catch (_) {}
  return { avatar, nick };
}

function renderQrcode() {
  const text = payload.value.link || "/pages/broadcast/entry";
  qrcodeSrc.value = buildQrcodeImageUrl(text);
}

function buildQrcodeImageUrl(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=1&data=${encodeURIComponent(value)}`;
}

function selectTemplate(idx) {
  activeIdx.value = idx;
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
  if (!qrcodeSrc.value) {
    uni.showToast({ title: "二维码生成失败", icon: "none" });
    return;
  }
  try {
    await saveImageUrlToAlbum(qrcodeSrc.value, `live-invitation-${Date.now()}.png`);
    uni.showToast({ title: "已保存", icon: "success" });
  } catch (error) {
    console.warn("[Invitation] save qrcode fail:", error);
    uni.showToast({ title: "请长按二维码保存", icon: "none" });
  }
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
</style>
