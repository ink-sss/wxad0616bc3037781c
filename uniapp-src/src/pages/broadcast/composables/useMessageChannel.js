import { computed } from "vue";
import { useLiveWebSocket } from "./useLiveWebSocket.js";
import { useIMChannel } from "./useIMChannel.js";

/**
 * 统一消息通道入口（对齐 H5 双通道模式）。
 * GroupType=0（直播栏目） → 环信 IM 接收广播 + 业务 WS 上行 chat/enter
 * GroupType=1（录播栏目） → 纯 WebSocket 通道
 * IM 初始化失败时降级到纯 WS。
 */
export function useMessageChannel({
  liveId,
  roomCode,
  liveTenantId,
  shareCode,
  liveBindId,
  isReplay,
  myUserId,
  getEffectiveTermId,
  roomGroupType,
  roomBroadcastMethod,
  loadCommentHistory,
  handleWsMessage,
  onOpen,
}) {
  const imChannel = useIMChannel({ liveId, loadCommentHistory, handleWsMessage, onOpen });
  const wsChannel = useLiveWebSocket({
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
  });
  let activeChannel = null;
  let dualMode = false;

  function isSocketOpen(socket) {
    if (!socket) return false;
    if (typeof socket.getState === "function") return socket.getState() === "open";
    if ("open" in socket) return !!socket.open;
    return true;
  }

  function getDualModeSendChannel() {
    if (!dualMode) return "";
    return isSocketOpen(wsChannel.getLiveSocket?.()) ? "ws" : "im";
  }

  const channelState = computed(() => {
    if (dualMode) return imChannel.imState?.value || "idle";
    return activeChannel?.imState?.value || activeChannel?.wsState?.value || "idle";
  });
  const channelDebugState = computed(() => ({
    mode: dualMode ? "dual" : (activeChannel === imChannel ? "im" : (activeChannel === wsChannel ? "ws" : "idle")),
    active: dualMode ? "im+ws" : (activeChannel === imChannel ? "im" : (activeChannel === wsChannel ? "ws" : "")),
    dualMode,
    sendChannel: dualMode ? getDualModeSendChannel() : (activeChannel === imChannel ? "im" : (activeChannel === wsChannel ? "ws" : "")),
    channelState: channelState.value,
    im: imChannel.imDebugState?.value || null,
    wsState: wsChannel.wsState?.value || "idle",
    ws: wsChannel.wsDebugState?.value || null,
  }));

  async function initWebSocket(wsUrl) {
    const groupType = Number(roomGroupType.value || 0);

    if (groupType === 0) {
      // 直播栏目：H5 正式链路是 IM(接收) + WS(上行)，不是 IM-only。
      const imOk = await imChannel.initWebSocket(wsUrl);
      if (imOk === false) {
        console.warn("[MessageChannel] IM 初始化失败，降级到纯 WS");
        activeChannel = wsChannel;
        dualMode = false;
        return activeChannel.initWebSocket(wsUrl);
      }
      const wsOk = await wsChannel.initWebSocket(wsUrl);
      activeChannel = imChannel;
      dualMode = wsOk !== false;
      return true;
    } else {
      // 录播栏目：纯 WS
      activeChannel = wsChannel;
      dualMode = false;
      return activeChannel.initWebSocket(wsUrl);
    }
  }

  function getLiveSocket() {
    if (dualMode) {
      // 直播栏目：WS open 后走后端业务链路；连接窗口期用已入聊天室的 IM 兜住弹幕发送。
      const wsSocket = wsChannel.getLiveSocket?.();
      if (isSocketOpen(wsSocket)) return wsSocket;
      return imChannel.getLiveSocket?.() || wsSocket || null;
    }
    return activeChannel?.getLiveSocket?.() || null;
  }

  function closeLiveSocket() {
    if (dualMode) {
      imChannel.closeLiveSocket?.();
      wsChannel.closeLiveSocket?.();
      activeChannel = null;
      dualMode = false;
      return;
    }
    const target = activeChannel;
    activeChannel = null;
    dualMode = false;
    return target?.closeLiveSocket?.();
  }

  /**
   * [兑底] 通过前端 IM 通道直发 enter 消息到聊天室。
   * 场景：后端 IMNotifyEnter 被环信服务端限流丢弃时，前端 2s 后主动补发一次。
   */
  function sendFallbackEnter() {
    if (dualMode) {
      imChannel.getLiveSocket?.()?.sendEnter?.();
    } else {
      activeChannel?.getLiveSocket?.()?.sendEnter?.();
    }
  }

  return {
    channelState,
    channelDebugState,
    initWebSocket,
    getLiveSocket,
    closeLiveSocket,
    sendFallbackEnter,
  };
}
