import { computed, nextTick, ref } from "vue";
import { formatViewCount } from "../utils/entry-format.js";

/**
 * 观看人数展示与本地 H5 增减动画。
 * 职责边界：只维护展示数和动画状态，真实在线人数来源仍以后端心跳/状态接口为准。
 */
export function useLiveViewerMetrics() {
  const viewerCount = ref("0");
  const h5ViewerDelta = ref(0);
  const viewerCountAnimating = ref(false);
  let viewerCountAnimTimer = null;
  let h5ViewerBoostApplied = false;

  const displayViewerCount = computed(() => {
    const base = Number(viewerCount.value);
    const safeBase = Number.isFinite(base) ? base : 0;
    const total = Math.max(0, safeBase + h5ViewerDelta.value);
    return formatViewCount(total);
  });

  function animateViewerCount() {
    viewerCountAnimating.value = false;
    if (viewerCountAnimTimer) {
      clearTimeout(viewerCountAnimTimer);
    }
    nextTick(() => {
      viewerCountAnimating.value = true;
      viewerCountAnimTimer = setTimeout(() => {
        viewerCountAnimating.value = false;
      }, 360);
    });
  }

  function setViewerCountDisplay(value) {
    const nextValue = String(value ?? viewerCount.value ?? 0);
    if (viewerCount.value === nextValue) return;
    viewerCount.value = nextValue;
    animateViewerCount();
  }

  function applyH5ViewerEnterBoost() {
    // #ifdef H5
    if (h5ViewerBoostApplied) return;
    h5ViewerBoostApplied = true;
    h5ViewerDelta.value += Math.floor(Math.random() * 16);
    animateViewerCount();
    // #endif
  }

  function applyH5ViewerLeaveDecrease() {
    // #ifdef H5
    if (h5ViewerDelta.value > 0) {
      h5ViewerDelta.value = Math.max(0, h5ViewerDelta.value - 1);
      animateViewerCount();
    }
    // #endif
  }

  function stopViewerCountAnimation() {
    if (viewerCountAnimTimer) {
      clearTimeout(viewerCountAnimTimer);
      viewerCountAnimTimer = null;
    }
  }

  return {
    viewerCount,
    viewerCountAnimating,
    displayViewerCount,
    setViewerCountDisplay,
    applyH5ViewerEnterBoost,
    applyH5ViewerLeaveDecrease,
    stopViewerCountAnimation,
  };
}
