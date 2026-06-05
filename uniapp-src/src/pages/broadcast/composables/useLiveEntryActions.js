import { computed, ref } from "vue";
import { useTapLikeEffect } from "../../../utils/useTapLikeEffect.js";
import { ZAN_IMAGES } from "../utils/entry-format.js";

const HEART_POOL_SIZE = 24;

function createHeartSlots() {
  return Array.from({ length: HEART_POOL_SIZE }, (_, slotId) => ({
    slotId,
    runId: 0,
    active: false,
    img: "",
    x: 0,
    dur: 0,
  }));
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

/**
 * 页面级轻量事件动作。
 * 职责边界：承接 UI 事件转发、点赞动效、商品面板切换和页签选择；播放主流程仍在 playback/sound hooks。
 */
export function useLiveEntryActions(ctx) {
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
    signConfig,
  } = ctx;

  const heartSlots = ref(createHeartSlots());
  const hearts = computed(() => heartSlots.value.filter((heart) => heart.active));
  let heartRunId = 0;
  let heartSlotCursor = 0;
  const { tapEffects, comboInfo, onScreenTap, finishTapEffect } = useTapLikeEffect();

  // ========== 点赞 3s 防抖批量上报 ==========
  // 背景：防止用户疯狂点击造成高频后端调用（打穿 DB）。
  // 策略：UI 点赞心动画/likeCount.value++ 仍然实时反馈；仅对“提交后端”防抖 3s。
  const LIKE_FLUSH_DEBOUNCE_MS = 3000;
  let pendingLikeCount = 0;
  let likeFlushTimer = null;

  async function flushPendingLikes() {
    if (likeFlushTimer) {
      clearTimeout(likeFlushTimer);
      likeFlushTimer = null;
    }
    const count = pendingLikeCount;
    if (count <= 0) return;
    pendingLikeCount = 0;
    // 优先走现有 socket（WS/IM），失败降级走 HTTP；count 为本轮累计点赞次数
    const liveSocket = getLiveSocket?.();
    let sentByChannel = false;
    if (liveSocket?.sendLike) {
      try {
        sentByChannel = await liveSocket.sendLike(count) === true;
      } catch (err) {
        console.warn("[Live] socket sendLike error:", err);
      }
    }
    if (sentByChannel) return true;
    try {
      await sendLike(liveId.value, count);
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
    // 1) 本地计数立即反馈（按钮旁点赞数 + 顶部本场点赞文本依赖同一个 likeCount）
    likeCount.value++;
    // 2) 提交后端防抖：累计 + 3s 后一次性提交
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
    const slotIndex = heartSlots.value.findIndex((heart) => heart.slotId === targetSlotId);
    const heart = heartSlots.value[slotIndex];
    if (!heart || !heart.active || heart.runId !== targetRunId) return;
    heartSlots.value.splice(slotIndex, 1, { ...heart, active: false });
  }

  function toggleProduct() {
    if (mode.value === "portrait") {
      const nextVisible = !showProductList.value;
      showProductList.value = nextVisible;
      if (
        nextVisible &&
        !productLoading.value &&
        productList.value.length === 0
      ) {
        loadProductList(true);
      }
    } else {
      activeTabIndex.value = "1";
      activeTab.value = "products";
    }
  }

  function onGrab() {
    uni.showToast({ title: "已加入购物车", icon: "success" });
  }

  function onProductDetail(payload) {
    const item = payload?.item || payload;
    const target = item || currentProduct.value;
    const productId = Number(firstValue(target, "id", "productId", "product_id", "goodsId", "goods_id") || 0);
    if (productId) {
      // [2026-05-12] 跳商品详情页带上当前课期ID，避免下单时 live_term_id 落 0
      const termId = getEffectiveTermId();
      const roomId = Number(liveId.value || 0);
      const skuId = Number(firstValue(target, "skuId", "sku_id", "productSkuId", "product_sku_id", "specSkuId", "spec_sku_id") || 0);
      const tenantId = firstValue(target, "tenantId", "tenant_id") || liveTenantId?.value || "";
      const params = [
        ["productId", productId],
        ["product_id", productId],
        ["goodsId", productId],
        ["goods_id", productId],
        ["roomId", roomId || ""],
        ["room_id", roomId || ""],
        ["liveId", roomId || ""],
        ["live_id", roomId || ""],
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
      if (roomCode?.value) params.push(["roomCode", roomCode.value]);
      if (roomCode?.value) params.push(["room_code", roomCode.value]);
      if (tenantId) {
        params.push(["tenantId", tenantId]);
        params.push(["tenant_id", tenantId]);
      }
      if (shareCode?.value) {
        params.push(["shareCode", shareCode.value]);
        params.push(["share_code", shareCode.value]);
      }
      const query = params
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&");
      uni.navigateTo({
        url: `/pages/product/detail/detail?${query}`,
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
      img: ZAN_IMAGES[Math.floor(Math.random() * ZAN_IMAGES.length)],
      x: 22 + Math.random() * 12,
      dur: 1.2 + Math.random() * 0.8,
    });
  }

  function onVideoTap(e) {
    // [优化] 用户点视频区域 = 明确观看意图，若当前静音则自动解除（视为手势授权）
    const videoPlayer = getVideoPlayer();
    const videoEl =
      videoPlayer && typeof videoPlayer.getVideoElement === "function"
        ? videoPlayer.getVideoElement()
        : null;
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
    if (roomSetting.value.enableLike === 0) return;
    sendLikeAction();
    if (mode.value === "portrait") {
      onScreenTap(e);
    }
  }

  function onShareAction(payload = {}) {
    const info = typeof payload === "string" ? { type: payload } : (payload || {});
    const code = String(info.shareCode || info.share_code || "").trim();
    if (code && shareCode?.value !== code) {
      shareCode.value = code;
    }
    // visual handling stays in share-popup
  }

  function onTabChange({ name }) {
    const tabMap = { 0: "interact", 1: "products", 2: "sign" };
    activeTab.value = tabMap[name] || "interact";
  }

  // enableChat 变化时自动切换到可用 tab
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
    flushPendingLikes,
  };
}
