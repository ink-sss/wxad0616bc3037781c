"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_useTapLikeEffect = require("../../../utils/useTapLikeEffect.js");
const pages_broadcast_utils_entryFormat = require("../utils/entry-format.js");
const HEART_POOL_SIZE = 24;
function createHeartSlots() {
  return Array.from({ length: HEART_POOL_SIZE }, (_, slotId) => ({
    slotId,
    runId: 0,
    active: false,
    img: "",
    x: 0,
    dur: 0
  }));
}
function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source == null ? void 0 : source[key];
    if (value !== void 0 && value !== null && value !== "")
      return value;
  }
  return void 0;
}
function useLiveEntryActions(ctx) {
  const {
    mode,
    showProductList,
    productLoading,
    productList,
    loadProductList,
    activeTabIndex,
    activeTab,
    currentProduct,
    getEffectiveTermId,
    liveId,
    roomCode,
    liveTenantId,
    shareCode,
    liveBindId,
    isReplay,
    myUserId,
    likeCount,
    sendLike,
    getLiveSocket,
    isMuted,
    getVideoPlayer,
    roomSetting,
    isTruthyFlag,
    signConfig
  } = ctx;
  const heartSlots = common_vendor.ref(createHeartSlots());
  const hearts = common_vendor.computed(() => heartSlots.value.filter((heart) => heart.active));
  let heartRunId = 0;
  let heartSlotCursor = 0;
  const { tapEffects, comboInfo, onScreenTap, finishTapEffect } = utils_useTapLikeEffect.useTapLikeEffect();
  const LIKE_FLUSH_DEBOUNCE_MS = 3e3;
  let pendingLikeCount = 0;
  let likeFlushTimer = null;
  async function flushPendingLikes() {
    if (likeFlushTimer) {
      clearTimeout(likeFlushTimer);
      likeFlushTimer = null;
    }
    const count = pendingLikeCount;
    if (count <= 0)
      return;
    pendingLikeCount = 0;
    const liveSocket = getLiveSocket == null ? void 0 : getLiveSocket();
    let sentByChannel = false;
    if (liveSocket == null ? void 0 : liveSocket.sendLike) {
      try {
        sentByChannel = await liveSocket.sendLike(count, {
          roomCode: (roomCode == null ? void 0 : roomCode.value) || "",
          tenantId: (liveTenantId == null ? void 0 : liveTenantId.value) || 0,
          shareCode: (shareCode == null ? void 0 : shareCode.value) || "",
          bindId: (liveBindId == null ? void 0 : liveBindId.value) || "",
          liveType: (isReplay == null ? void 0 : isReplay.value) ? "replay" : "live",
          termId: (getEffectiveTermId == null ? void 0 : getEffectiveTermId()) || 0,
          customerId: (myUserId == null ? void 0 : myUserId.value) || 0
        }) === true;
      } catch (err) {
        console.warn("[Live] socket sendLike error:", err);
      }
    }
    if (sentByChannel)
      return true;
    try {
      await sendLike(liveId.value, count, {
        roomCode: (roomCode == null ? void 0 : roomCode.value) || "",
        tenantId: (liveTenantId == null ? void 0 : liveTenantId.value) || 0,
        shareCode: (shareCode == null ? void 0 : shareCode.value) || "",
        bindId: (liveBindId == null ? void 0 : liveBindId.value) || "",
        liveType: (isReplay == null ? void 0 : isReplay.value) ? "replay" : "live",
        termId: (getEffectiveTermId == null ? void 0 : getEffectiveTermId()) || 0,
        customerId: (myUserId == null ? void 0 : myUserId.value) || 0
      });
    } catch (err) {
      console.error("[Live] sendLike fail:", err);
    }
    return false;
  }
  function scheduleLikeFlush() {
    if (likeFlushTimer) {
      clearTimeout(likeFlushTimer);
    }
    likeFlushTimer = setTimeout(flushPendingLikes, LIKE_FLUSH_DEBOUNCE_MS);
  }
  function sendLikeAction() {
    likeCount.value++;
    pendingLikeCount += 1;
    scheduleLikeFlush();
  }
  function reserveHeartSlot() {
    const inactiveIndex = heartSlots.value.findIndex((heart) => !heart.active);
    if (inactiveIndex >= 0) {
      heartSlotCursor = (inactiveIndex + 1) % HEART_POOL_SIZE;
      return inactiveIndex;
    }
    const slotIndex = heartSlotCursor;
    heartSlotCursor = (heartSlotCursor + 1) % HEART_POOL_SIZE;
    return slotIndex;
  }
  function finishHeartAnimation(slotId, runId) {
    const targetSlotId = Number(slotId);
    const targetRunId = Number(runId);
    const slotIndex = heartSlots.value.findIndex((heart2) => heart2.slotId === targetSlotId);
    const heart = heartSlots.value[slotIndex];
    if (!heart || !heart.active || heart.runId !== targetRunId)
      return;
    heartSlots.value.splice(slotIndex, 1, { ...heart, active: false });
  }
  function toggleProduct() {
    if (mode.value === "portrait") {
      const nextVisible = !showProductList.value;
      showProductList.value = nextVisible;
      if (nextVisible && !productLoading.value && productList.value.length === 0) {
        loadProductList(true);
      }
    } else {
      activeTabIndex.value = "1";
      activeTab.value = "products";
    }
  }
  function onGrab() {
    common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
  }
  function onProductDetail(payload) {
    const item = (payload == null ? void 0 : payload.item) || payload;
    const target = item || currentProduct.value;
    const productId = Number(firstValue(target, "id", "productId", "product_id", "goodsId", "goods_id") || 0);
    if (productId) {
      const termId = getEffectiveTermId();
      const roomId = Number(liveId.value || 0);
      const skuId = Number(firstValue(target, "skuId", "sku_id", "productSkuId", "product_sku_id", "specSkuId", "spec_sku_id") || 0);
      const tenantId = firstValue(target, "tenantId", "tenant_id") || (liveTenantId == null ? void 0 : liveTenantId.value) || "";
      const params = [
        ["productId", productId],
        ["product_id", productId],
        ["goodsId", productId],
        ["goods_id", productId],
        ["roomId", roomId || ""],
        ["room_id", roomId || ""],
        ["liveId", roomId || ""],
        ["live_id", roomId || ""]
      ];
      if (termId > 0) {
        params.push(["termId", termId]);
        params.push(["term_id", termId]);
        params.push(["liveTermId", termId]);
        params.push(["live_term_id", termId]);
      }
      if (skuId > 0) {
        params.push(["skuId", skuId]);
        params.push(["sku_id", skuId]);
        params.push(["productSkuId", skuId]);
        params.push(["product_sku_id", skuId]);
      }
      if (roomCode == null ? void 0 : roomCode.value)
        params.push(["roomCode", roomCode.value]);
      if (roomCode == null ? void 0 : roomCode.value)
        params.push(["room_code", roomCode.value]);
      if (tenantId) {
        params.push(["tenantId", tenantId]);
        params.push(["tenant_id", tenantId]);
      }
      if (shareCode == null ? void 0 : shareCode.value) {
        params.push(["shareCode", shareCode.value]);
        params.push(["share_code", shareCode.value]);
      }
      const query = params.filter(([, value]) => value !== void 0 && value !== null && value !== "").map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join("&");
      common_vendor.index.navigateTo({
        url: `/pages/product/detail/detail?${query}`
      });
    }
  }
  function doLike() {
    sendLikeAction();
    const slotIndex = reserveHeartSlot();
    const heart = heartSlots.value[slotIndex];
    heartSlots.value.splice(slotIndex, 1, {
      ...heart,
      runId: ++heartRunId,
      active: true,
      img: pages_broadcast_utils_entryFormat.ZAN_IMAGES[Math.floor(Math.random() * pages_broadcast_utils_entryFormat.ZAN_IMAGES.length)],
      x: 22 + Math.random() * 12,
      dur: 1.2 + Math.random() * 0.8
    });
  }
  function onVideoTap(e) {
    const videoPlayer = getVideoPlayer();
    const videoEl = videoPlayer && typeof videoPlayer.getVideoElement === "function" ? videoPlayer.getVideoElement() : null;
    if (isMuted.value && videoPlayer) {
      try {
        videoPlayer.unmute();
      } catch (err) {
        console.warn("[Live] onVideoTap unmute failed:", err);
      }
    } else if (videoPlayer && (!videoEl || videoEl.paused)) {
      try {
        if (typeof videoPlayer.playFromUserGesture === "function") {
          videoPlayer.playFromUserGesture();
        } else if (typeof videoPlayer.play === "function") {
          videoPlayer.play();
        }
      } catch (err) {
        console.warn("[Live] onVideoTap play failed:", err);
      }
    }
    if (roomSetting.value.enableLike === 0)
      return;
    sendLikeAction();
    if (mode.value === "portrait") {
      onScreenTap(e);
    }
  }
  function onShareAction(payload = {}) {
    const info = typeof payload === "string" ? {} : payload || {};
    const code = String(info.shareCode || info.share_code || "").trim();
    if (code && (shareCode == null ? void 0 : shareCode.value) !== code) {
      shareCode.value = code;
    }
  }
  function onTabChange({ name }) {
    const tabMap = { 0: "interact", 1: "products", 2: "sign" };
    activeTab.value = tabMap[name] || "interact";
  }
  function switchToFirstAvailableTab() {
    if (roomSetting.value.enableChat !== 0) {
      activeTab.value = "interact";
      activeTabIndex.value = "0";
    } else if (isTruthyFlag(signConfig.value.enabled)) {
      activeTab.value = "sign";
      activeTabIndex.value = "2";
    } else if (roomSetting.value.showProduct !== 0) {
      activeTab.value = "products";
      activeTabIndex.value = "1";
    }
  }
  return {
    hearts,
    tapEffects,
    comboInfo,
    toggleProduct,
    onGrab,
    onProductDetail,
    doLike,
    finishHeartAnimation,
    finishTapEffect,
    onVideoTap,
    onShareAction,
    onTabChange,
    switchToFirstAvailableTab,
    // 页面卸载/离开直播间时外部调用，防止累计点赞数丢失
    flushPendingLikes
  };
}
exports.useLiveEntryActions = useLiveEntryActions;
