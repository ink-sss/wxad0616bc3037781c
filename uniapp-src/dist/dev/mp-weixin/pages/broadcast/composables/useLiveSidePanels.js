"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_routeNavigation = require("../../../utils/route-navigation.js");
function getUniApi(explicitUni) {
  if (explicitUni)
    return explicitUni;
  return common_vendor.index;
}
function isTruthyFlag(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}
function buildCenterStats(orderStats = {}, refundStats = {}) {
  return {
    waitPay: Number((orderStats == null ? void 0 : orderStats.unpay) || 0),
    waitShip: Number((orderStats == null ? void 0 : orderStats.unsend) || 0),
    waitReceive: Number((orderStats == null ? void 0 : orderStats.unreceive) || 0),
    refunding: Number((refundStats == null ? void 0 : refundStats.refund) || 0)
  };
}
function normalizeSignCheckResult(result = {}) {
  var _a;
  const raw = result && typeof result === "object" ? result : {};
  const data = {
    ...raw,
    ...raw.payload && typeof raw.payload === "object" ? raw.payload : {},
    ...raw.data && typeof raw.data === "object" ? raw.data : {},
    ...((_a = raw.data) == null ? void 0 : _a.payload) && typeof raw.data.payload === "object" ? raw.data.payload : {}
  };
  const enabledValue = data.enabled ?? data.signEnabled ?? data.sign_enabled ?? data.enableSign ?? data.enable_sign ?? data.isEnabled ?? data.is_enabled;
  const hasExplicitEnabled = enabledValue !== void 0 && enabledValue !== null && enabledValue !== "";
  const signedValue = data.signed ?? data.hasSigned ?? data.has_signed ?? data.isSigned ?? data.is_signed ?? data.hasSign ?? data.has_sign ?? data.isSign ?? data.is_sign ?? data.sign ?? data.signStatus ?? data.sign_status ?? data.status;
  const signed = signedValue === true || signedValue === 1 || signedValue === "1" || signedValue === "true" || signedValue === "signed" || signedValue === "done" || signedValue === "success";
  return {
    enabled: hasExplicitEnabled ? isTruthyFlag(enabledValue) : null,
    signed
  };
}
function resolveCenterAction(type, { roomCode = "", liveId = "", anchorName = "", anchorAvatar = "" } = {}) {
  const roomCodeQuery = roomCode ? `&roomCode=${encodeURIComponent(roomCode)}` : "";
  if (type === "refund") {
    return {
      kind: "navigate",
      url: `/pages/order/list?status=refund${roomCodeQuery}`
    };
  }
  const statusMap = {
    orders: "all",
    unpay: "unpay",
    unsend: "unsend",
    unreceive: "unreceive",
    finished: "finished"
  };
  if (statusMap[type]) {
    return {
      kind: "navigate",
      url: `/pages/order/list?status=${statusMap[type]}${roomCodeQuery}`
    };
  }
  if (type === "profile") {
    const q2 = "name=" + encodeURIComponent(anchorName || "") + "&avatar=" + encodeURIComponent(anchorAvatar || "") + roomCodeQuery;
    return { kind: "navigate", url: "/pages/center/index?" + q2 };
  }
  if (type === "complaint") {
    return { kind: "complaint" };
  }
  if (type === "address") {
    return { kind: "address" };
  }
  if (type === "prizeRecord") {
    const code = roomCode ? `?roomCode=${encodeURIComponent(roomCode)}` : "";
    return { kind: "navigate", url: `/pages/prize-record/index${code}` };
  }
  if (type === "invitationRecord") {
    if (!liveId)
      return { kind: "toast", title: "请从直播间进入" };
    const code = roomCode ? `&roomCode=${encodeURIComponent(roomCode)}` : "";
    return { kind: "navigate", url: `/pages/invitation-record/index?roomId=${liveId}${code}` };
  }
  const q = "name=" + encodeURIComponent(anchorName || "") + "&avatar=" + encodeURIComponent(anchorAvatar || "") + roomCodeQuery;
  return { kind: "navigate", url: `/pages/center/index?${q}` };
}
function useLiveSidePanels({
  liveId,
  roomCode,
  roomCurrentTermId,
  myUserId,
  liveTenantId,
  shareCode,
  liveBindId,
  isReplay,
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
  logger = console
}) {
  const uniRuntime = getUniApi(uniApi);
  const showLiveReportPopup = common_vendor.ref(false);
  const showCenterPopup = common_vendor.ref(false);
  const centerPopupOrderStats = common_vendor.ref({
    waitPay: 0,
    waitShip: 0,
    waitReceive: 0,
    refunding: 0
  });
  const signConfig = common_vendor.ref({
    enabled: 0,
    ruleType: 1,
    welcomeText: "",
    coverImage: "",
    forceEnabled: 0,
    fields: []
  });
  const signFields = common_vendor.ref([]);
  const hasSigned = common_vendor.ref(false);
  const showSignPopup = common_vendor.ref(false);
  const centerPopupName = common_vendor.computed(() => {
    var _a, _b;
    return ((_a = userStore.userInfo) == null ? void 0 : _a.nickname) || ((_b = userStore.userInfo) == null ? void 0 : _b.nickName) || anchorName.value || "用户";
  });
  const centerPopupAvatar = common_vendor.computed(() => {
    var _a;
    return ((_a = userStore.userInfo) == null ? void 0 : _a.avatar) || anchorAvatar.value || "";
  });
  function toggleCenter() {
    if (!userStore.token && !isDebugLocalLogin()) {
      const redirect = encodeURIComponent(getLiveRedirectUrl());
      const tenantParam = liveTenantId.value ? `&tenantId=${liveTenantId.value}` : "";
      uniRuntime.navigateTo({
        url: `/pages/login/login?redirect=${redirect}${tenantParam}`
      });
      return;
    }
    loadCenterPopupData();
    showCenterPopup.value = true;
  }
  async function loadCenterPopupData() {
    try {
      const [data, orderStats, refundStats] = await Promise.all([
        getCenter(),
        getOrderUnreadStats(),
        getRefundUnreadStats()
      ]);
      if (data == null ? void 0 : data.customer) {
        userStore.setUserInfo({
          ...userStore.userInfo || {},
          ...data.customer
        });
      }
      centerPopupOrderStats.value = buildCenterStats(orderStats, refundStats);
    } catch (err) {
      logger.error("[Live] loadCenterPopupData fail:", err);
    }
  }
  function onCenterAction(type) {
    showCenterPopup.value = false;
    const action = resolveCenterAction(type, {
      roomCode: roomCode.value,
      liveId: liveId.value,
      anchorName: anchorName.value,
      anchorAvatar: anchorAvatar.value
    });
    if (action.kind === "navigate") {
      if (type === "prizeRecord") {
        utils_routeNavigation.navigateToPrizeRecord(action.url);
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
    if (!isTruthyFlag(signConfig.value.enabled) || !liveId.value)
      return;
    try {
      const res = await checkSigned(liveId.value, {
        roomCode: roomCode.value,
        room_code: roomCode.value,
        tenantId: (liveTenantId == null ? void 0 : liveTenantId.value) || 0,
        tenant_id: (liveTenantId == null ? void 0 : liveTenantId.value) || 0,
        shareCode: (shareCode == null ? void 0 : shareCode.value) || "",
        share_code: (shareCode == null ? void 0 : shareCode.value) || "",
        bindId: (liveBindId == null ? void 0 : liveBindId.value) || "",
        bind_id: (liveBindId == null ? void 0 : liveBindId.value) || "",
        liveType: (isReplay == null ? void 0 : isReplay.value) ? "replay" : "live",
        live_type: (isReplay == null ? void 0 : isReplay.value) ? "replay" : "live",
        termId: (roomCurrentTermId == null ? void 0 : roomCurrentTermId.value) || 0,
        term_id: (roomCurrentTermId == null ? void 0 : roomCurrentTermId.value) || 0,
        liveTermId: (roomCurrentTermId == null ? void 0 : roomCurrentTermId.value) || 0,
        live_term_id: (roomCurrentTermId == null ? void 0 : roomCurrentTermId.value) || 0,
        customerId: (myUserId == null ? void 0 : myUserId.value) || 0,
        customer_id: (myUserId == null ? void 0 : myUserId.value) || 0,
        userId: (myUserId == null ? void 0 : myUserId.value) || 0,
        user_id: (myUserId == null ? void 0 : myUserId.value) || 0
      });
      const signStatus = normalizeSignCheckResult(res);
      if (signStatus.enabled === false) {
        signConfig.value = {
          ...signConfig.value,
          enabled: 0,
          forceEnabled: 0
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
    onCenterAction,
    goReport,
    onSignedDone,
    loadSignStatus
  };
}
exports.isTruthyFlag = isTruthyFlag;
exports.useLiveSidePanels = useLiveSidePanels;
