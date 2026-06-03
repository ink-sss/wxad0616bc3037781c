import { ref } from "vue";
import { getWsSignKey } from "@/api/live.js";
import { useUserStore } from "@/stores/user";
import { MiniLiveSocket as LiveSocket } from "@/utils/mini-live-socket.js";
import { setSignKey } from "@/utils/ws-envelope.js";

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
    live_type: liveType,
  };
}

function resolveWsSignKey(response) {
  if (!response) return "";
  if (typeof response === "string") return response;
  if (typeof response !== "object") return "";
  return (
    response.signKey ||
    response.sign_key ||
    response.key ||
    response.secretKey ||
    response.secret_key ||
    response.data?.signKey ||
    response.data?.sign_key ||
    response.data?.key ||
    response.data?.secretKey ||
    response.data?.secret_key ||
    ""
  );
}

/**
 * 直播 WebSocket 连接生命周期。
 * 职责边界：获取签名、创建/关闭 LiveSocket、重连后补拉评论；消息业务分发由 createLiveWsMessageHandler 处理。
 */
export function useLiveWebSocket({
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
  onOpen,
}) {
  let liveSocket = null;
  let wsConnectedOnce = false;
  const wsState = ref("idle");

  async function initWebSocket(wsUrl) {
    if (!wsUrl) return false;
    let wsSignKey = "";
    setSignKey("");
    // [2026-03-30] 获取WebSocket签名密钥(向前兼容:失败时使用无签名模式)
    try {
      const keyRes = await getWsSignKey();
      wsSignKey = resolveWsSignKey(keyRes);
      if (wsSignKey) {
        setSignKey(wsSignKey);
      }
    } catch (err) {
      console.warn("[Live] 获取WebSocket签名密钥失败,使用无签名模式:", err);
    }

    const userStore = useUserStore();
    liveSocket = new LiveSocket({
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
        getEffectiveTermId,
      }),
      token: userStore.token,
      user: userStore.userInfo || {},
      signKey: wsSignKey,
      onOpen() {
        liveSocket.sendEnter();
        onOpen?.();
        if (wsConnectedOnce) {
          // 重连成功后补加载最近的历史消息
          loadCommentHistory();
        }
        wsConnectedOnce = true;
      },
      onMessage(data) {
        handleWsMessage(data);
      },
      onClose() {},
      onError(err) {
        console.error("[Live] ws error:", err);
      },
      onStateChange(state) {
        wsState.value = state;
      },
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
    closeLiveSocket,
  };
}
