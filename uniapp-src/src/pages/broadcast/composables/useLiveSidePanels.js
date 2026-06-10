import { computed, ref } from "vue";
import { navigateToPrizeRecord } from "../../../utils/route-navigation.js";
import { appendLiveRoomQuery, mergeLiveRoomContext } from "../../../utils/live-room-context.js";
import { getWeixinApi } from "../../../platform/weixin/runtime.js";

/**
 * 直播侧边弹窗、个人中心、投诉和签到状态。
 * 职责边界：维护非播放类弹窗和签到/个人中心入口；购买弹窗细节交给 useLivePurchase。
 */
export function getUniApi(explicitUni) {
  if (explicitUni) return explicitUni;
  return getWeixinApi("", { preferUni: true });
}

export function isTruthyFlag(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function toNumber(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function firstStatValue(source = {}, keys = []) {
  const stats = source && typeof source === "object" ? source : {};
  for (const key of keys) {
    const value = stats[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

export function buildCenterStats(orderStats = {}, refundStats = {}) {
  const refundValue = firstStatValue(refundStats, ["refund", "refunding", "processing", "unread", "total"]);
  return {
    waitPay: toNumber(firstStatValue(orderStats, ["payment", "unpay", "waitPay", "wait_pay", "pendingPay"])),
    waitShip: toNumber(firstStatValue(orderStats, ["delivery", "unsend", "waitShip", "wait_ship", "waitDelivery"])),
    waitReceive: toNumber(firstStatValue(orderStats, ["received", "unreceive", "waitReceive", "wait_receive"])),
    refunding: toNumber(refundValue !== undefined ? refundValue : firstStatValue(orderStats, ["refund"])),
  };
}

function normalizeSignCheckResult(result = {}) {
  const raw = result && typeof result === "object" ? result : {};
  const data = {
    ...raw,
    ...(raw.payload && typeof raw.payload === "object" ? raw.payload : {}),
    ...(raw.data && typeof raw.data === "object" ? raw.data : {}),
    ...(raw.data?.payload && typeof raw.data.payload === "object" ? raw.data.payload : {}),
  };
  const enabledValue = data.enabled ?? data.signEnabled ?? data.sign_enabled ?? data.enableSign ?? data.enable_sign ?? data.isEnabled ?? data.is_enabled;
  const hasExplicitEnabled = enabledValue !== undefined && enabledValue !== null && enabledValue !== "";
  const signedValue =
    data.signed ??
    data.hasSigned ??
    data.has_signed ??
    data.isSigned ??
    data.is_signed ??
    data.hasSign ??
    data.has_sign ??
    data.isSign ??
    data.is_sign ??
    data.sign ??
    data.signStatus ??
    data.sign_status ??
    data.status;
  const signed = signedValue === true ||
    signedValue === 1 ||
    signedValue === "1" ||
    signedValue === "true" ||
    signedValue === "signed" ||
    signedValue === "done" ||
    signedValue === "success";
  return {
    enabled: hasExplicitEnabled ? isTruthyFlag(enabledValue) : null,
    signed,
  };
}

export function resolveCenterAction(type, context = {}) {
  const {
    anchorName = "",
    anchorAvatar = "",
  } = context || {};
  const liveContext = mergeLiveRoomContext(context || {});
  const liveId = liveContext.liveId || liveContext.roomId || "";
  const withLiveQuery = (url) => appendLiveRoomQuery(url, liveContext);
  if (type === "refund") {
    return {
      kind: "navigate",
      url: withLiveQuery("/pages/order/list?status=refund"),
    };
  }
  const statusMap = {
    orders: "all",
    unpay: "unpay",
    unsend: "unsend",
    unreceive: "unreceive",
    finished: "finished",
  };
  if (statusMap[type]) {
    return {
      kind: "navigate",
      url: withLiveQuery(`/pages/order/list?status=${statusMap[type]}`),
    };
  }
  if (type === "profile") {
    const q =
      "name=" +
      encodeURIComponent(anchorName || "") +
      "&avatar=" +
      encodeURIComponent(anchorAvatar || "") +
      (withLiveQuery("").replace(/^\?/, "&"));
    return { kind: "navigate", url: "/pagesPlus/main/center/index?" + q.replace(/^&/, "") };
  }
  if (type === "complaint") {
    return { kind: "complaint" };
  }
  if (type === "address") {
    return { kind: "address" };
  }
  if (type === "prizeRecord") {
    return { kind: "navigate", url: withLiveQuery("/pagesPlus/main/prize-record/index") };
  }
  if (type === "invitationRecord") {
    if (!liveId) return { kind: "toast", title: "请从直播间进入" };
    return { kind: "navigate", url: withLiveQuery(`/pagesPlus/main/invitation-record/index?roomId=${liveId}`) };
  }
  const q =
    "name=" +
    encodeURIComponent(anchorName || "") +
    "&avatar=" +
    encodeURIComponent(anchorAvatar || "") +
    (withLiveQuery("").replace(/^\?/, "&"));
  return { kind: "navigate", url: `/pagesPlus/main/center/index?${q.replace(/^&/, "")}` };
}

export function useLiveSidePanels({
  liveId,
  roomCode,
  roomCurrentTermId,
  myUserId,
  liveTenantId,
  shareCode,
  liveBindId,
  isReplay,
  replayCurrentVideoId,
  anchorName,
  anchorAvatar,
  userStore,
  getLiveRedirectUrl,
  isDebugLocalLogin,
  ensureBuyAddressLoaded,
  addressPopupSource,
  showAddressPopup,
  getCenter,
  getOrderUnreadStats,
  getRefundUnreadStats,
  checkSigned,
  uniApi,
  logger = console,
}) {
  const uniRuntime = getUniApi(uniApi);
  const showLiveReportPopup = ref(false);
  const showCenterPopup = ref(false);
  const centerPopupOrderStats = ref({
    waitPay: 0,
    waitShip: 0,
    waitReceive: 0,
    refunding: 0,
  });
  const signConfig = ref({
    enabled: 0,
    ruleType: 1,
    welcomeText: "",
    coverImage: "",
    forceEnabled: 0,
    fields: [],
  });
  const signFields = ref([]);
  const hasSigned = ref(false);
  const showSignPopup = ref(false);

  const centerPopupName = computed(() => {
    return (
      userStore.userInfo?.nickname ||
      userStore.userInfo?.nickName ||
      anchorName.value ||
      "用户"
    );
  });

  const centerPopupAvatar = computed(() => {
    return userStore.userInfo?.avatar || anchorAvatar.value || "";
  });

  function toggleCenter() {
    if (!userStore.token && !isDebugLocalLogin()) {
      const redirect = encodeURIComponent(getLiveRedirectUrl());
      const tenantParam = liveTenantId.value
        ? `&tenantId=${liveTenantId.value}`
        : "";
      uniRuntime.navigateTo({
        url: `/pagesPlus/main/login/login?redirect=${redirect}${tenantParam}`,
      });
      return;
    }
    loadCenterPopupData();
    showCenterPopup.value = true;
  }

  async function loadCenterPopupData() {
    try {
      const data = await getCenter();
      if (data?.customer) {
        userStore.setUserInfo({
          ...(userStore.userInfo || {}),
          ...data.customer,
        });
      }
      await refreshCenterOrderStats();
    } catch (err) {
      logger.error("[Live] loadCenterPopupData fail:", err);
    }
  }

  async function refreshCenterOrderStats() {
    try {
      const [orderStats, refundStats] = await Promise.all([
        getOrderUnreadStats(),
        getRefundUnreadStats(),
      ]);
      centerPopupOrderStats.value = buildCenterStats(orderStats, refundStats);
    } catch (err) {
      logger.error("[Live] refreshCenterOrderStats fail:", err);
    }
  }

  function onCenterAction(type) {
    showCenterPopup.value = false;
    const action = resolveCenterAction(type, {
      roomCode: roomCode.value,
      room_code: roomCode.value,
      liveId: liveId.value,
      live_id: liveId.value,
      roomId: liveId.value,
      room_id: liveId.value,
      tenantId: liveTenantId?.value || "",
      tenant_id: liveTenantId?.value || "",
      shareCode: shareCode?.value || "",
      share_code: shareCode?.value || "",
      bindId: liveBindId?.value || "",
      bind_id: liveBindId?.value || "",
      termId: roomCurrentTermId?.value || "",
      term_id: roomCurrentTermId?.value || "",
      customerId: myUserId?.value || "",
      customer_id: myUserId?.value || "",
      replayVideoId: isReplay?.value ? replayCurrentVideoId?.value || "" : "",
      replay_video_id: isReplay?.value ? replayCurrentVideoId?.value || "" : "",
      videoId: isReplay?.value ? replayCurrentVideoId?.value || "" : "",
      video_id: isReplay?.value ? replayCurrentVideoId?.value || "" : "",
      liveType: isReplay?.value ? "replay" : "live",
      live_type: isReplay?.value ? "replay" : "live",
      replay: isReplay?.value ? "1" : "",
      anchorName: anchorName.value,
      anchorAvatar: anchorAvatar.value,
    });
    if (action.kind === "navigate") {
      if (type === "prizeRecord") {
        navigateToPrizeRecord(action.url, { uniApi: uniRuntime });
        return;
      }
      uniRuntime.navigateTo({ url: action.url });
      return;
    }
    if (action.kind === "complaint") {
      goReport();
      return;
    }
    if (action.kind === "address") {
      ensureBuyAddressLoaded(true).then(() => {
        addressPopupSource.value = "center";
        showAddressPopup.value = true;
      });
      return;
    }
    uniRuntime.showToast({ title: action.title, icon: "none" });
  }

  function goReport() {
    showLiveReportPopup.value = true;
  }

  function onSignedDone() {
    hasSigned.value = true;
    showSignPopup.value = false;
  }

  async function loadSignStatus() {
    if (!isTruthyFlag(signConfig.value.enabled) || !liveId.value) return;
    try {
      const res = await checkSigned(liveId.value, {
        roomCode: roomCode.value,
        room_code: roomCode.value,
        tenantId: liveTenantId?.value || 0,
        tenant_id: liveTenantId?.value || 0,
        shareCode: shareCode?.value || "",
        share_code: shareCode?.value || "",
        bindId: liveBindId?.value || "",
        bind_id: liveBindId?.value || "",
        liveType: isReplay?.value ? "replay" : "live",
        live_type: isReplay?.value ? "replay" : "live",
        termId: roomCurrentTermId?.value || 0,
        term_id: roomCurrentTermId?.value || 0,
        liveTermId: roomCurrentTermId?.value || 0,
        live_term_id: roomCurrentTermId?.value || 0,
        customerId: myUserId?.value || 0,
        customer_id: myUserId?.value || 0,
        userId: myUserId?.value || 0,
        user_id: myUserId?.value || 0,
      });
      const signStatus = normalizeSignCheckResult(res);
      if (signStatus.enabled === false) {
        signConfig.value = {
          ...signConfig.value,
          enabled: 0,
          forceEnabled: 0,
        };
        signFields.value = [];
        hasSigned.value = false;
        showSignPopup.value = false;
        return;
      }
      hasSigned.value = signStatus.signed;
    } catch (e) {
      logger.warn("[Live] checkSigned fail:", e);
    }
  }

  return {
    showLiveReportPopup,
    showCenterPopup,
    centerPopupOrderStats,
    centerPopupName,
    centerPopupAvatar,
    signConfig,
    signFields,
    hasSigned,
    showSignPopup,
    toggleCenter,
    loadCenterPopupData,
    refreshCenterOrderStats,
    onCenterAction,
    goReport,
    onSignedDone,
    loadSignStatus,
  };

}
