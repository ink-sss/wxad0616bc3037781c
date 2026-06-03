"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_broadcast_composables_useLiveWebSocket = require("./useLiveWebSocket.js");
const pages_broadcast_composables_useIMChannel = require("./useIMChannel.js");
function useMessageChannel({
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
  onOpen
}) {
  const imChannel = pages_broadcast_composables_useIMChannel.useIMChannel();
  const wsChannel = pages_broadcast_composables_useLiveWebSocket.useLiveWebSocket({
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
  });
  let activeChannel = null;
  let dualMode = false;
  const channelState = common_vendor.computed(() => {
    var _a, _b, _c;
    if (dualMode)
      return ((_a = imChannel.imState) == null ? void 0 : _a.value) || "idle";
    return ((_b = activeChannel == null ? void 0 : activeChannel.imState) == null ? void 0 : _b.value) || ((_c = activeChannel == null ? void 0 : activeChannel.wsState) == null ? void 0 : _c.value) || "idle";
  });
  async function initWebSocket(wsUrl) {
    const groupType = Number(roomGroupType.value || 0);
    if (groupType === 0) {
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
      activeChannel = wsChannel;
      dualMode = false;
      return activeChannel.initWebSocket(wsUrl);
    }
  }
  function getLiveSocket() {
    var _a, _b;
    if (dualMode) {
      return ((_a = wsChannel.getLiveSocket) == null ? void 0 : _a.call(wsChannel)) || null;
    }
    return ((_b = activeChannel == null ? void 0 : activeChannel.getLiveSocket) == null ? void 0 : _b.call(activeChannel)) || null;
  }
  function closeLiveSocket() {
    var _a, _b, _c;
    if (dualMode) {
      (_a = imChannel.closeLiveSocket) == null ? void 0 : _a.call(imChannel);
      (_b = wsChannel.closeLiveSocket) == null ? void 0 : _b.call(wsChannel);
      activeChannel = null;
      dualMode = false;
      return;
    }
    const target = activeChannel;
    activeChannel = null;
    return (_c = target == null ? void 0 : target.closeLiveSocket) == null ? void 0 : _c.call(target);
  }
  function sendFallbackEnter() {
    var _a, _b, _c, _d, _e, _f;
    if (dualMode) {
      (_c = (_b = (_a = imChannel.getLiveSocket) == null ? void 0 : _a.call(imChannel)) == null ? void 0 : _b.sendEnter) == null ? void 0 : _c.call(_b);
    } else {
      (_f = (_e = (_d = activeChannel == null ? void 0 : activeChannel.getLiveSocket) == null ? void 0 : _d.call(activeChannel)) == null ? void 0 : _e.sendEnter) == null ? void 0 : _f.call(_e);
    }
  }
  return {
    channelState,
    initWebSocket,
    getLiveSocket,
    closeLiveSocket,
    sendFallbackEnter
  };
}
exports.useMessageChannel = useMessageChannel;
