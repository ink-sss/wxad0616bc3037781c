<template>
  <view v-if="visible" class="live-marquee-ad" :class="positionClass">
    <view
      class="live-marquee-ad__track"
      :style="trackStyle"
      @click.stop
    >
      <text class="live-marquee-ad__text">{{ text }}</text>
      <view class="live-marquee-ad__close" @click.stop="dismiss">
        <view class="live-marquee-ad__close-line live-marquee-ad__close-line--a"></view>
        <view class="live-marquee-ad__close-line live-marquee-ad__close-line--b"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  roomSetting: {
    type: Object,
    default: () => ({}),
  },
  variant: {
    type: String,
    default: "portrait",
  },
});

const defaultTextColor = "rgba(255,255,255,1)";
const defaultBgColor = "rgba(240,74,98,.7)";
const dismissed = ref(false);

const text = computed(() => String(props.roomSetting?.marqueeText || "").trim());
const enabled = computed(() => Number(props.roomSetting?.marqueeEnabled) === 1);
const isLandscape = computed(() => props.variant === "landscape");

const visible = computed(() => enabled.value && text.value && !dismissed.value);

const positionClass = computed(() => {
  if (isLandscape.value) return "live-marquee-ad--landscape";
  const position = Number(props.roomSetting?.marqueePosition || 1);
  if (position === 2) return "live-marquee-ad--middle";
  if (position === 3) return "live-marquee-ad--bottom";
  return "live-marquee-ad--top";
});

const trackStyle = computed(() => ({
  color: props.roomSetting?.marqueeTextColor || defaultTextColor,
  backgroundColor: props.roomSetting?.marqueeBgColor || defaultBgColor,
}));

const dismiss = () => {
  dismissed.value = true;
};

watch(
  () => [props.roomSetting?.marqueeEnabled, props.roomSetting?.marqueeText],
  () => {
    dismissed.value = false;
  }
);
</script>

<style scoped>
.live-marquee-ad {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 10000;
  height: 56rpx;
  overflow: hidden;
  pointer-events: none;
}

.live-marquee-ad--top {
  top: calc(156rpx + var(--broadcast-nav-height, 0px));
}

.live-marquee-ad--middle {
  top: 50%;
  transform: translateY(-50%);
}

.live-marquee-ad--bottom {
  bottom: 38%;
}

.live-marquee-ad--landscape {
  position: relative;
  flex-shrink: 0;
  height: 72rpx;
  margin-top: 10rpx;
}

.live-marquee-ad__track {
  position: absolute;
  left: 0;
  top: 4rpx;
  min-width: max-content;
  height: 48rpx;
  padding: 0 12rpx;
  border-radius: 10rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  white-space: nowrap;
  pointer-events: auto;
  box-shadow: 0 8rpx 22rpx rgba(0, 0, 0, 0.16);
  animation: liveMarqueeAdMove 9s linear infinite;
}

.live-marquee-ad__text {
  font-size: 24rpx;
  line-height: 24rpx;
  font-weight: 700;
  white-space: nowrap;
}

.live-marquee-ad__close {
  position: relative;
  width: 32rpx;
  height: 32rpx;
  margin-left: 10rpx;
  flex-shrink: 0;
}

.live-marquee-ad__close-line {
  position: absolute;
  left: 7rpx;
  top: 15rpx;
  width: 18rpx;
  height: 2rpx;
  border-radius: 2rpx;
  background: currentColor;
}

.live-marquee-ad__close-line--a {
  transform: rotate(45deg);
}

.live-marquee-ad__close-line--b {
  transform: rotate(-45deg);
}

@keyframes liveMarqueeAdMove {
  0% {
    transform: translateX(750rpx);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
