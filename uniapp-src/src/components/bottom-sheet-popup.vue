<template>
  <wd-overlay
    :show="overlayVisible"
    :custom-style="'z-index:' + zIndex + ';background:' + maskColor + ';'"
    @click="emit('close')"
  />

  <wd-transition
    :show="visible"
    :duration="duration"
    enter-class="sheet-popup-enter"
    enter-active-class="sheet-popup-enter-active"
    enter-to-class="sheet-popup-enter-to"
    leave-class="sheet-popup-leave"
    leave-active-class="sheet-popup-leave-active"
    leave-to-class="sheet-popup-leave-to"
    :custom-style="
      'position:fixed;left:0;top:0;right:0;bottom:0;z-index:' +
      (zIndex + 1) +
      ';'
    "
  >
    <view class="sheet-mask">
      <view class="sheet-mask-close" @tap="emit('close')"></view>
      <view class="sheet-panel" :style="panelStyle" @tap.stop>
        <view v-if="showClose" class="sheet-close" @tap.stop="emit('close')">
          <image
            class="sheet-close-icon"
            src="https://man.lqjy.cc/static/icons/close.svg"
            mode="aspectFit"
          />
        </view>
        <slot />
      </view>
    </view>
  </wd-transition>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  height: { type: String, default: "75vh" },
  background: { type: String, default: "#fff" },
  radius: { type: String, default: "24rpx 24rpx 0 0" },
  zIndex: { type: Number, default: 80 },
  duration: { type: Number, default: 500 },
  withMask: { type: Boolean, default: false },
  maskColor: { type: String, default: "rgba(0, 0, 0, 0.35)" },
  allowOverflow: { type: Boolean, default: false },
  showClose: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

const overlayVisible = ref(false);
let overlayTimer = null;

const panelStyle = computed(() => {
  return {
    height: props.height,
    background: props.background,
    borderRadius: props.radius,
    overflow: props.allowOverflow ? "visible" : undefined,
  };
});

watch(
  () => [props.visible, props.withMask, props.duration],
  ([visible, withMask, duration]) => {
    if (overlayTimer) {
      clearTimeout(overlayTimer);
      overlayTimer = null;
    }

    if (visible && withMask) {
      overlayVisible.value = false;
      overlayTimer = setTimeout(() => {
        overlayVisible.value = true;
        overlayTimer = null;
      }, duration);
      return;
    }

    overlayVisible.value = false;
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (overlayTimer) {
    clearTimeout(overlayTimer);
    overlayTimer = null;
  }
});
</script>

<style lang="scss" scoped>
.sheet-mask {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: stretch;
}

.sheet-mask-close {
  width: 100%;
  flex: 1;
}

.sheet-panel {
  width: 750rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  background: linear-gradient(178.56deg, #ffffff 3.09%, #fff0e9 56.44%);
  position: relative;
  padding-bottom: env(safe-area-inset-bottom);
}

.sheet-close {
  position: absolute;
  right: 24rpx;
  top: 24rpx;
  z-index: 10;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet-close-icon {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.4;
}
</style>

<style lang="scss" scoped>
.sheet-popup-enter {
  transform: translateY(100%) !important;
}

.sheet-popup-enter-active {
  transition: transform 500ms ease-out !important;
}

.sheet-popup-enter-to {
  transform: translateY(0) !important;
}

.sheet-popup-leave {
  transform: translateY(0) !important;
}

.sheet-popup-leave-active {
  transition: transform 400ms ease-in !important;
}

.sheet-popup-leave-to {
  transform: translateY(100%) !important;
}
</style>
