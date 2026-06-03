"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_broadcast_utils_entryFormat = require("../utils/entry-format.js");
function useLiveViewerMetrics() {
  const viewerCount = common_vendor.ref("0");
  const h5ViewerDelta = common_vendor.ref(0);
  const viewerCountAnimating = common_vendor.ref(false);
  let viewerCountAnimTimer = null;
  const displayViewerCount = common_vendor.computed(() => {
    const base = Number(viewerCount.value);
    const safeBase = Number.isFinite(base) ? base : 0;
    const total = Math.max(0, safeBase + h5ViewerDelta.value);
    return pages_broadcast_utils_entryFormat.formatViewCount(total);
  });
  function animateViewerCount() {
    viewerCountAnimating.value = false;
    if (viewerCountAnimTimer) {
      clearTimeout(viewerCountAnimTimer);
    }
    common_vendor.nextTick$1(() => {
      viewerCountAnimating.value = true;
      viewerCountAnimTimer = setTimeout(() => {
        viewerCountAnimating.value = false;
      }, 360);
    });
  }
  function setViewerCountDisplay(value) {
    const nextValue = String(value ?? viewerCount.value ?? 0);
    if (viewerCount.value === nextValue)
      return;
    viewerCount.value = nextValue;
    animateViewerCount();
  }
  function applyH5ViewerEnterBoost() {
  }
  function applyH5ViewerLeaveDecrease() {
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
    stopViewerCountAnimation
  };
}
exports.useLiveViewerMetrics = useLiveViewerMetrics;
