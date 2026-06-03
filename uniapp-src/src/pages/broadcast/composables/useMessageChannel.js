import { computed } from "vue";
import { useLiveWebSocket } from "./useLiveWebSocket.js";
import { useIMChannel } from "./useIMChannel.js";

/**
 * 统一消息通道入口（双通道模式）。
 * GroupType=0（直播栏目） → IM 接收广播 + WS 上行（发chat/enter给后端做业务）
 * GroupType=1（录播栏目） → 纯 WebSocket 通道
 * IM 初始化失败时自动降级到纯 WS。
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

  const channelState = computed(() => {
    if (dualMode) return imChannel.imState?.value || "idle";
    return activeChannel?.imState?.value || activeChannel?.wsState?.value || "idle";
  });

  async function initWebSocket(wsUrl) {
    const groupType = Number(roomGroupType.value || 0);

    if (groupType === 0) {
      // 直播栏目：双通道 IM(接收) + WS(上行)
      const imOk = await imChannel.initWebSocket(wsUrl);
      if (imOk === false) {
        console.warn("[MessageChannel] IM 初始化失败，降级到纯 WS");
        activeChannel = wsChannel;
        dualMode = false;
        return activeChannel.initWebSocket(wsUrl);
      }
      await wsChannel.initWebSocket(wsUrl);
      activeChannel = imChannel;
      dualMode = true;
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
      // 直播栏目：sendChat/sendEnter 走 WS（后端业务处理）
      return wsChannel.getLiveSocket?.() || null;
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
    initWebSocket,
    getLiveSocket,
    closeLiveSocket,
    sendFallbackEnter,
  };
}
