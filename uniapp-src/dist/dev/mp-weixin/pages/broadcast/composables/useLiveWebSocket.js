"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_live = require("../../../api/live.js");
const stores_user = require("../../../stores/user.js");
const utils_miniLiveSocket = require("../../../utils/mini-live-socket.js");
const utils_wsEnvelope = require("../../../utils/ws-envelope.js");
function readMaybeRef(value) {
  return value && typeof value === "object" && "value" in value ? value.value : value;
}
function buildLiveSocketContext(deps = {}) {
  const liveId = Number(readMaybeRef(deps.liveId) || 0);
  const termId = Number(typeof deps.getEffectiveTermId === "function" ? deps.getEffectiveTermId() : readMaybeRef(deps.termId) || 0);
  const customerId = Number(readMaybeRef(deps.myUserId) || readMaybeRef(deps.customerId) || 0);
  const tenantId = Number(readMaybeRef(deps.liveTenantId) || readMaybeRef(deps.tenantId) || 0);
  const roomCode = String(readMaybeRef(deps.roomCode) || "").trim();
  const shareCode = String(readMaybeRef(deps.shareCode) || "").trim();
  const bindId = readMaybeRef(deps.liveBindId) || readMaybeRef(deps.bindId) || "";
  const liveType = String(readMaybeRef(deps.liveType) || (readMaybeRef(deps.isReplay) ? "replay" : "live")).trim();
  return {
    roomId: liveId,
    room_id: liveId,
    liveId,
    live_id: liveId,
    termId,
    term_id: termId,
    liveTermId: termId,
    live_term_id: termId,
    customerId,
    customer_id: customerId,
    userId: customerId,
    user_id: customerId,
    tenantId,
    tenant_id: tenantId,
    roomCode,
    room_code: roomCode,
    shareCode,
    share_code: shareCode,
    bindId,
    bind_id: bindId,
    liveType,
    live_type: liveType
  };
}
function resolveWsSignKey(response) {
  var _a, _b, _c, _d, _e;
  if (!response)
    return "";
  if (typeof response === "string")
    return response;
  if (typeof response !== "object")
    return "";
  return response.signKey || response.sign_key || response.key || response.secretKey || response.secret_key || ((_a = response.data) == null ? void 0 : _a.signKey) || ((_b = response.data) == null ? void 0 : _b.sign_key) || ((_c = response.data) == null ? void 0 : _c.key) || ((_d = response.data) == null ? void 0 : _d.secretKey) || ((_e = response.data) == null ? void 0 : _e.secret_key) || "";
}
function useLiveWebSocket({
  liveId,
  roomCode,
  liveTenantId,
  shareCode,
  liveBindId,
  isReplay,
  myUserId,
  getEffectiveTermId,
  loadCommentHistory,
  handleWsMessage,
  onOpen
}) {
  let liveSocket = null;
  let wsConnectedOnce = false;
  const wsState = common_vendor.ref("idle");
  async function initWebSocket(wsUrl) {
    if (!wsUrl)
      return false;
    let wsSignKey = "";
    utils_wsEnvelope.setSignKey("");
    try {
      const keyRes = await api_live.getWsSignKey();
      wsSignKey = resolveWsSignKey(keyRes);
      if (wsSignKey) {
        utils_wsEnvelope.setSignKey(wsSignKey);
      }
    } catch (err) {
      console.warn("[Live] 获取WebSocket签名密钥失败,使用无签名模式:", err);
    }
    const userStore = stores_user.useUserStore();
    liveSocket = new utils_miniLiveSocket.MiniLiveSocket({
      url: wsUrl,
      liveId: liveId.value,
      context: buildLiveSocketContext({
        liveId,
        roomCode,
        liveTenantId,
        shareCode,
        liveBindId,
        isReplay,
        myUserId,
        getEffectiveTermId
      }),
      token: userStore.token,
      user: userStore.userInfo || {},
      signKey: wsSignKey,
      onOpen() {
        liveSocket.sendEnter();
        onOpen == null ? void 0 : onOpen();
        if (wsConnectedOnce) {
          loadCommentHistory();
        }
        wsConnectedOnce = true;
      },
      onMessage(data) {
        handleWsMessage(data);
      },
      onClose() {
      },
      onError(err) {
        console.error("[Live] ws error:", err);
      },
      onStateChange(state) {
        wsState.value = state;
      }
    });
    liveSocket.connect();
    return true;
  }
  function getLiveSocket() {
    return liveSocket;
  }
  function closeLiveSocket() {
    if (liveSocket) {
      liveSocket.close();
      liveSocket = null;
    }
  }
  return {
    wsState,
    initWebSocket,
    getLiveSocket,
    closeLiveSocket
  };
}
exports.useLiveWebSocket = useLiveWebSocket;
