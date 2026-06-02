<template>
  <view
    v-if="overlayVisible"
    class="sheet-overlay"
    :style="overlayStyle"
    @click="emit('close')"
  />

  <view
    v-if="visible"
    class="sheet-root"
    :style="rootStyle"
  >
    <view class="sheet-mask" @click="emit('close')">
      <view class="sheet-panel" :style="panelStyle" @click.stop>
        <view v-if="showClose" class="sheet-close" @click="emit('close')">
          <image
            class="sheet-close-icon"
            src="/static/icons/close.svg"
            mode="aspectFit"
          />
        </view>
        <slot />
      </view>
    </view>
  </view>
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
  showClose: { type: Boolean, default: true },
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

const overlayStyle = computed(() => ({
  zIndex: props.zIndex,
  background: props.maskColor,
}));

const rootStyle = computed(() => ({
  zIndex: props.zIndex + 1,
}));

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
.sheet-overlay,
.sheet-root {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.sheet-mask {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: stretch;
}

.sheet-panel {
  width: 750rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  background: linear-gradient(178.56deg, #ffffff 3.09%, #fff0e9 56.44%);
  position: relative;
  padding-bottom: env(safe-area-inset-bottom);
  animation: sheet-slide-up 260ms ease-out;
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
@keyframes sheet-slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
