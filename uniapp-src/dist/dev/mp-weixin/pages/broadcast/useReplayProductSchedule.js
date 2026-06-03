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
function getReplayProductId(product = {}) {
  return Number(product.id || product.productId || product.product_id || product.goodsId || product.goods_id || 0);
}
function getReplayProductVideoId(product = {}) {
  return Number(product.videoId || product.video_id || product.replayVideoId || product.replay_video_id || 0);
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
    var _a, _b, _c;
    const second = Math.floor(Number(currentTime || 0));
    if (second < 0)
      return { shouldActivate: false, shouldDeactivate: false };
    let newTrigger = null;
    let currentWindowHit = null;
    for (const product of productList || []) {
      const productId = getReplayProductId(product);
      const productVideoId = getReplayProductVideoId(product);
      const nodes = normalizeScheduleNodes(product);
      if (!nodes.length)
        continue;
      if (currentVideoId && productVideoId && productVideoId !== Number(currentVideoId))
        continue;
      if (currentVideoId && !productVideoId)
        continue;
      if (product.scheduleVideoUrl && currentVideoUrl && product.scheduleVideoUrl !== currentVideoUrl)
        continue;
      for (const node of nodes) {
        const triggerSecond = Math.floor(Number(node.videoTime || 0));
        const endSecond = triggerSecond + Math.max(Number(node.duration || 0), 0);
        const key = buildNodeKey(
          productId,
          product.scheduleVideoUrl,
          triggerSecond,
          node.duration
        );
        if (second < triggerSecond)
          continue;
        if (second >= endSecond) {
          triggeredNodeKeys.add(key);
          continue;
        }
        if (triggeredNodeKeys.has(key)) {
          if (!currentWindowHit || triggerSecond >= Number(((_a = currentWindowHit.node) == null ? void 0 : _a.videoTime) || 0)) {
            currentWindowHit = { product, node, key };
          }
        } else {
          triggeredNodeKeys.add(key);
          if (!newTrigger || triggerSecond >= Number(((_b = newTrigger.node) == null ? void 0 : _b.videoTime) || 0)) {
            newTrigger = { product, node, key };
          }
          if (!currentWindowHit || triggerSecond >= Number(((_c = currentWindowHit.node) == null ? void 0 : _c.videoTime) || 0)) {
            currentWindowHit = { product, node, key };
          }
        }
      }
    }
    if (newTrigger) {
      activeProductId = getReplayProductId(newTrigger.product);
      return { ...newTrigger, shouldActivate: true, shouldDeactivate: false };
    }
    if (currentWindowHit) {
      activeProductId = getReplayProductId(currentWindowHit.product);
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
