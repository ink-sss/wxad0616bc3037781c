import { computed } from "vue";
import { useLiveWebSocket } from "./useLiveWebSocket.js";
import { useIMChannel } from "./useIMChannel.js";

/**
 * 统一消息通道入口。
 * GroupType=0（直播栏目） → 环信 IM 聊天室
 * GroupType=1（录播栏目） → 纯 WebSocket 通道
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

  const channelState = computed(() => {
    return activeChannel?.imState?.value || activeChannel?.wsState?.value || "idle";
  });
  const channelDebugState = computed(() => ({
    mode: activeChannel === imChannel ? "im" : (activeChannel === wsChannel ? "ws" : "idle"),
    active: activeChannel === imChannel ? "im" : (activeChannel === wsChannel ? "ws" : ""),
    dualMode: false,
    channelState: channelState.value,
    im: imChannel.imDebugState?.value || null,
    wsState: wsChannel.wsState?.value || "idle",
  }));

  async function initWebSocket(wsUrl) {
    const groupType = Number(roomGroupType.value || 0);

    if (groupType === 0) {
      activeChannel = imChannel;
      const imOk = await imChannel.initWebSocket(wsUrl);
      activeChannel = imChannel;
      return imOk !== false;
    } else {
      // 录播栏目：纯 WS
      activeChannel = wsChannel;
      return activeChannel.initWebSocket(wsUrl);
    }
  }

  function getLiveSocket() {
    return activeChannel?.getLiveSocket?.() || null;
  }

  function closeLiveSocket() {
    const target = activeChannel;
    activeChannel = null;
    return target?.closeLiveSocket?.();
  }

  /**
   * [兑底] 通过前端 IM 通道直发 enter 消息到聊天室。
   * 场景：后端 IMNotifyEnter 被环信服务端限流丢弃时，前端 2s 后主动补发一次。
   */
  function sendFallbackEnter() {
    if (activeChannel !== wsChannel) return;
    activeChannel?.getLiveSocket?.()?.sendEnter?.();
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
