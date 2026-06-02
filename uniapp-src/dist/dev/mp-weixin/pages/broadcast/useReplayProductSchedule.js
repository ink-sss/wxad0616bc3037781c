"use strict";
function normalizeScheduleNodes(product) {
  const rawNodes = Array.isArray(product == null ? void 0 : product.scheduleNodes) ? product.scheduleNodes : (product == null ? void 0 : product.scheduleVideoUrl) ? [
    {
      videoTime: Number((product == null ? void 0 : product.scheduleVideoTime) || 0),
      duration: Number((product == null ? void 0 : product.scheduleDuration) || 0)
    }
  ] : [];
  return rawNodes.map((node) => ({
    videoTime: Number((node == null ? void 0 : node.videoTime) || 0),
    duration: Number((node == null ? void 0 : node.duration) || 0)
  })).filter((node) => node.duration > 0).sort((a, b) => a.videoTime - b.videoTime);
}
function createReplayProductScheduleController() {
  const triggeredNodeKeys = /* @__PURE__ */ new Set();
  let activeProductId = 0;
  const buildNodeKey = (productId, videoUrl, videoTime, duration) => {
    return [productId || 0, videoUrl || "", videoTime || 0, duration || 0].join("_");
  };
  const resetScheduleState = () => {
    triggeredNodeKeys.clear();
    activeProductId = 0;
  };
  const syncReplaySchedule = ({
    productList = [],
    currentTime = 0,
    currentVideoUrl = "",
    currentVideoId = 0
  }) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const second = Math.floor(Number(currentTime || 0));
    if (second < 0)
      return { shouldActivate: false, shouldDeactivate: false };
    let newTrigger = null;
    let currentWindowHit = null;
    for (const product of productList || []) {
      const nodes = normalizeScheduleNodes(product);
      if (!nodes.length)
        continue;
      if (currentVideoId && product.videoId && Number(product.videoId) !== Number(currentVideoId))
        continue;
      if (currentVideoId && !product.videoId && product.video_id && Number(product.video_id) !== Number(currentVideoId))
        continue;
      if (product.scheduleVideoUrl && currentVideoUrl && product.scheduleVideoUrl !== currentVideoUrl)
        continue;
      for (const node of nodes) {
        const triggerSecond = Math.floor(Number(node.videoTime || 0));
        const duration = Math.max(Number(node.duration || 0), 0);
        const endSecond = triggerSecond + duration;
        const key = buildNodeKey(
          product.id || product.productId,
          product.scheduleVideoUrl,
          triggerSecond,
          duration
        );
        if (second < triggerSecond)
          continue;
        if (second >= endSecond) {
          triggeredNodeKeys.add(key);
          continue;
        }
        const hit = { product, node, key };
        if (triggeredNodeKeys.has(key)) {
          if (!currentWindowHit || triggerSecond >= Number(((_a = currentWindowHit.node) == null ? void 0 : _a.videoTime) || 0)) {
            currentWindowHit = hit;
          }
          continue;
        }
        triggeredNodeKeys.add(key);
        if (!newTrigger || triggerSecond >= Number(((_b = newTrigger.node) == null ? void 0 : _b.videoTime) || 0)) {
          newTrigger = hit;
        }
        if (!currentWindowHit || triggerSecond >= Number(((_c = currentWindowHit.node) == null ? void 0 : _c.videoTime) || 0)) {
          currentWindowHit = hit;
        }
      }
    }
    if (newTrigger) {
      activeProductId = ((_d = newTrigger.product) == null ? void 0 : _d.id) || ((_e = newTrigger.product) == null ? void 0 : _e.productId) || 0;
      return { ...newTrigger, shouldActivate: true, shouldDeactivate: false };
    }
    if (currentWindowHit) {
      activeProductId = ((_f = currentWindowHit.product) == null ? void 0 : _f.id) || ((_g = currentWindowHit.product) == null ? void 0 : _g.productId) || 0;
      return { shouldActivate: false, shouldDeactivate: false };
    }
    if (activeProductId) {
      activeProductId = 0;
      return { shouldActivate: false, shouldDeactivate: true };
    }
    return { shouldActivate: false, shouldDeactivate: false };
  };
  return {
    resetScheduleState,
    syncReplaySchedule
  };
}
exports.createReplayProductScheduleController = createReplayProductScheduleController;
exports.normalizeScheduleNodes = normalizeScheduleNodes;
