<template>
  <view
    v-if="visible"
    class="live-mini"
    :style="miniStyle"
    @touchstart.stop="onDragStart"
    @touchmove.stop.prevent="onDragMove"
    @touchend.stop="onDragEnd"
  >
    <view class="live-mini__video-wrap" @click.stop="restoreLive">
      <video
        v-if="playUrl"
        class="live-mini__video"
        :src="playUrl"
        :poster="poster"
        :controls="false"
        :show-play-btn="false"
        :show-center-play-btn="false"
        :show-fullscreen-btn="false"
        :enable-progress-gesture="false"
        object-fit="cover"
        :muted="true"
        :autoplay="true"
      />
      <image
        v-else-if="poster"
        class="live-mini__poster"
        :src="poster"
        mode="aspectFill"
      />
      <view v-else class="live-mini__empty">
        <text class="live-mini__empty-text">直播间</text>
      </view>

      <view class="live-mini__badge" @click.stop="restoreLive">
        <text class="live-mini__badge-text">返回直播</text>
      </view>
      <view class="live-mini__close" @click.stop="closeMini">×</view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getLiveDetail } from "@/api/live";
import { loadLiveRoomContext } from "@/utils/live-room-context";
import { getBestLiveUrl, getBestReplayUrl, normalizeRoomDetail } from "@/utils/live-route";
import { returnToLiveRoom } from "@/utils/live-room-navigation";

const props = defineProps({
  roomCode: {
    type: [String, Number],
    default: "",
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  bottomOffset: {
    type: Number,
    default: 190,
  },
  returnOrigin: {
    type: String,
    default: "",
  },
});

const closed = ref(false);
const poster = ref("");
const playUrl = ref("");
const roomCodeValue = ref("");
const position = ref({ left: 0, top: 0 });
let dragStart = null;
let hasMoved = false;

const visible = computed(() => props.enabled && !closed.value && !!roomCodeValue.value);
const miniStyle = computed(() => ({
  left: `${position.value.left}px`,
  top: `${position.value.top}px`,
}));

function rpxToPx(value) {
  try {
    const sys = uni.getSystemInfoSync();
    return (Number(value) / 750) * Number(sys.windowWidth || 375);
  } catch (error) {
    return Number(value) / 2;
  }
}

function getWindowSize() {
  try {
    const sys = uni.getSystemInfoSync();
    return {
      width: Number(sys.windowWidth || 375),
      height: Number(sys.windowHeight || 667),
    };
  } catch (error) {
    return { width: 375, height: 667 };
  }
}

function clampPosition(left, top) {
  const win = getWindowSize();
  const width = rpxToPx(224);
  const height = rpxToPx(316);
  const margin = rpxToPx(16);
  return {
    left: Math.min(Math.max(left, margin), Math.max(margin, win.width - width - margin)),
    top: Math.min(Math.max(top, margin), Math.max(margin, win.height - height - margin)),
  };
}

function initPosition() {
  const win = getWindowSize();
  const width = rpxToPx(224);
  const height = rpxToPx(316);
  position.value = clampPosition(
    win.width - width - rpxToPx(24),
    win.height - height - rpxToPx(props.bottomOffset),
  );
}

function resolveRoomCode() {
  const propCode = String(props.roomCode || "").trim();
  if (propCode) return propCode;
  return String(loadLiveRoomContext()?.roomCode || "").trim();
}

function getCurrentRoute() {
  try {
    const pages = getCurrentPages() || [];
    return String(pages[pages.length - 1]?.route || "").replace(/^\/+/, "");
  } catch (error) {
    return "";
  }
}

async function loadMini() {
  const code = resolveRoomCode();
  roomCodeValue.value = code;
  if (!code || getCurrentRoute().startsWith("pages/broadcast/")) return;

  const cached = loadLiveRoomContext() || {};
  poster.value = cached.cover || cached.coverImage || cached.poster || "";
  playUrl.value = cached.playUrl || "";

  try {
    const raw = await getLiveDetail({ roomCode: code });
    const detail = normalizeRoomDetail(raw, { roomCode: code });
    poster.value = detail.coverImage || poster.value;
    playUrl.value = getBestLiveUrl(detail) || getBestReplayUrl(detail) || playUrl.value;
  } catch (error) {
  }
}

function closeMini() {
  closed.value = true;
}

function restoreLive() {
  if (hasMoved) return;
  const code = roomCodeValue.value || resolveRoomCode();
  if (code) returnToLiveRoom(code);
}

function onDragStart(event) {
  const touch = event.touches?.[0];
  if (!touch) return;
  hasMoved = false;
  dragStart = {
    x: touch.clientX,
    y: touch.clientY,
    left: position.value.left,
    top: position.value.top,
  };
}

function onDragMove(event) {
  if (!dragStart) return;
  const touch = event.touches?.[0];
  if (!touch) return;
  const dx = touch.clientX - dragStart.x;
  const dy = touch.clientY - dragStart.y;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true;
  position.value = clampPosition(dragStart.left + dx, dragStart.top + dy);
}

function onDragEnd() {
  dragStart = null;
  setTimeout(() => {
    hasMoved = false;
  }, 50);
}

watch(
  () => [props.roomCode, props.enabled],
  () => {
    closed.value = false;
    loadMini();
  },
);

initPosition();
onShow(loadMini);
</script>

<style lang="scss" scoped>
.live-mini {
  position: fixed;
  width: 224rpx;
  z-index: 998;
  border-radius: 12rpx;
  overflow: hidden;
  background: #111;
  box-shadow: 0 12rpx 34rpx rgba(0, 0, 0, 0.28);
}

.live-mini__video-wrap {
  position: relative;
  width: 224rpx;
  height: 316rpx;
  background: #111;
}

.live-mini__video,
.live-mini__poster,
.live-mini__empty {
  width: 224rpx;
  height: 316rpx;
  display: block;
  background: #111;
  position: relative;
  z-index: 0;
}

.live-mini__empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.live-mini__empty-text {
  color: rgba(255, 255, 255, 0.72);
  font-size: 24rpx;
}

.live-mini__badge {
  position: absolute;
  left: 10rpx;
  top: 10rpx;
  z-index: 2;
  height: 34rpx;
  padding: 0 12rpx;
  border-radius: 17rpx;
  background: rgba(0, 0, 0, 0.48);
  display: flex;
  align-items: center;
}

.live-mini__badge-text {
  color: #fff;
  font-size: 18rpx;
  line-height: 34rpx;
}

.live-mini__close {
  position: absolute;
  right: 8rpx;
  top: 8rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 28rpx;
}
</style>
