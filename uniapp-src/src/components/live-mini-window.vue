<template>
  <view class="live-mini-host">
    <view
      v-if="visible"
      class="live-mini"
      :style="miniStyle"
      @touchstart.stop="onDragStart"
      @touchmove.stop.prevent="onDragMove"
      @touchend.stop="onDragEnd"
    >
      <view class="live-mini__video-wrap" @tap.stop="restoreLive">
        <video
          v-if="hasPlayableSource"
          :key="videoKey"
          id="liveMiniVideo"
          class="live-mini__video"
          :src="playUrl"
          :poster="poster"
          :controls="false"
          :show-play-btn="false"
          :show-center-play-btn="false"
          :show-fullscreen-btn="false"
          :enable-progress-gesture="false"
          object-fit="cover"
          :muted="muted"
          :autoplay="true"
          :enable-play-gesture="true"
          preload="auto"
          playsinline
          webkit-playsinline
          x5-playsinline
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
          @play="onMiniPlay"
          @playing="onMiniPlaying"
          @loadedmetadata="onMiniLoadedMetadata"
          @loadeddata="onMiniLoadedData"
          @canplay="onMiniCanPlay"
          @waiting="onMiniWaiting"
          @pause="onMiniPause"
          @timeupdate="onMiniTimeUpdate"
          @error="onMiniError"
        />
        <image
          v-if="hasPlayableSource && poster && !videoFrameReady"
          class="live-mini__poster live-mini__poster--cover"
          :src="poster"
          mode="aspectFill"
        />
        <image
          v-else-if="!hasPlayableSource && poster"
          class="live-mini__poster"
          :src="poster"
          mode="aspectFill"
        />
        <view v-else-if="!hasPlayableSource" class="live-mini__empty">
          <text class="live-mini__empty-text">直播间</text>
        </view>

        <!-- #ifndef MP-WEIXIN -->
        <view class="live-mini__touch-layer"></view>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <cover-view class="live-mini__touch-layer" @tap.stop="restoreLive"></cover-view>
        <cover-view
          class="live-mini__badge"
          @touchstart.stop="noopMiniTouch"
          @touchend.stop="restoreLive"
          @tap.stop="restoreLive"
        >
          <cover-view class="live-mini__badge-text">返回直播</cover-view>
        </cover-view>
        <cover-view
          class="live-mini__close"
          @touchstart.stop="noopMiniTouch"
          @touchend.stop="closeMini"
          @tap.stop="closeMini"
        >
          ×
        </cover-view>
        <cover-view
          class="live-mini__play-state"
          v-if="hasPlayableSource && !isPlaying"
          @touchstart.stop="noopMiniTouch"
          @touchend.stop="playMini"
          @tap.stop="playMini"
        >
          <cover-view class="live-mini__play-text">▶</cover-view>
        </cover-view>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view
          class="live-mini__badge"
          @touchstart.stop="noopMiniTouch"
          @touchend.stop="restoreLive"
          @tap.stop="restoreLive"
        >
          <text class="live-mini__badge-text">返回直播</text>
        </view>
        <view
          class="live-mini__close"
          @touchstart.stop="noopMiniTouch"
          @touchend.stop="closeMini"
          @tap.stop="closeMini"
        >
          ×
        </view>
        <view
          class="live-mini__play-state"
          v-if="hasPlayableSource && !isPlaying"
          @touchstart.stop="noopMiniTouch"
          @touchend.stop="playMini"
          @tap.stop="playMini"
        >
          <text class="live-mini__play-text">▶</text>
        </view>
        <!-- #endif -->
      </view>
      <!-- <view class="live-mini__footer" @click.stop="restoreLive">
        <text class="live-mini__title">{{ displayTitle }}</text>
        <text class="live-mini__restore">返回直播</text>
      </view> -->
    </view>
    <live-mini-debug-float
      :show="debugVisible"
      :summary="debugSummary"
      :copy-status="debugCopyStatus"
      @copy="copyDebugInfo"
    />
  </view>
</template>

<script setup>
import { useLiveMiniWindow } from "@/composables/useLiveMiniWindow";
import LiveMiniDebugFloat from "@/components/live-mini-debug-float.vue";

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

const {
  visible,
  poster,
  playUrl,
  hasPlayableSource,
  muted,
  isPlaying,
  videoFrameReady,
  videoKey,
  displayTitle,
  statusText,
  miniStyle,
  closeMini,
  restoreLive,
  playMini,
  onMiniPlay,
  onMiniPlaying,
  onMiniLoadedMetadata,
  onMiniLoadedData,
  onMiniCanPlay,
  onMiniWaiting,
  onMiniPause,
  onMiniTimeUpdate,
  onMiniError,
  onDragStart,
  onDragMove,
  onDragEnd,
  debugVisible,
  debugSummary,
  debugCopyStatus,
  copyDebugInfo,
} = useLiveMiniWindow(props);

function noopMiniTouch() {}
</script>

<style lang="scss" scoped>
.live-mini-host {
  width: 0;
  height: 0;
}

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

.live-mini__video {
  pointer-events: none;
}

.live-mini__poster,
.live-mini__poster--cover,
.live-mini__empty {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}

.live-mini__touch-layer {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  width: 224rpx;
  height: 316rpx;
  background: transparent;
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
  z-index: 5;
  height: 34rpx;
  padding: 0 12rpx;
  border-radius: 17rpx;
  background: rgba(0, 0, 0, 0.48);
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.live-mini__dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #ff2f4f;
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
  z-index: 5;
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

.live-mini__play-state {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 5;
  width: 54rpx;
  height: 54rpx;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.live-mini__play-text {
  color: #fff;
  font-size: 28rpx;
  margin-left: 4rpx;
}

.live-mini__footer {
  min-height: 60rpx;
  padding: 8rpx 10rpx;
  box-sizing: border-box;
  background: rgba(20, 20, 20, 0.96);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.live-mini__title {
  flex: 1;
  min-width: 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 20rpx;
  line-height: 28rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.live-mini__restore {
  flex-shrink: 0;
  color: #fff;
  font-size: 20rpx;
  line-height: 32rpx;
  padding: 0 10rpx;
  border-radius: 16rpx;
  background: #ff5a2e;
}
</style>
