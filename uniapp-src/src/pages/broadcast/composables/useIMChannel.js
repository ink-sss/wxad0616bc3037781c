import EC from "easemob-websdk/uniApp/Easemob-chat";
import { ref } from "vue";
import { getImToken } from "@/api/live.js";
import { useUserStore } from "@/stores/user";

const EASEMOB_WS_URL = "wss://im-api-wechat.easemob.com/websocket";
const EASEMOB_API_URL = "https://a1.easemob.com";

function muteEasemobLogger(loggerInstance) {
  if (!loggerInstance) return;
  try {
    if (typeof loggerInstance.disableAll === "function") {
      loggerInstance.disableAll();
      return;
    }
    if (typeof loggerInstance.setLevel === "function") {
      loggerInstance.setLevel("OFF");
    }
  } catch (_) {}
}
muteEasemobLogger(EC?.logger);
if (typeof uni !== "undefined") {
  uni.WebIM = EC;
}

const IM_MESSAGE_TYPE_MAP = {
  1: "chat",
  2: "like",
  3: "enter",
  4: "leave",
  5: "system",
  6: "product",
  7: "viewer_count",
  8: "gift",
  9: "setting_update",
  10: "comment_audit",
  11: "comment_delete",
  12: "comment_clear",
  13: "comment_top",
  14: "user_muted",
  15: "user_blocked",
  16: "user_unblocked",
  17: "product_status_update",
  18: "product_list",
  19: "product_stock",
  20: "video_loop_restart",
  21: "mute_word_filtered",
  22: "win_notify",
  23: "lottery_result",
  24: "win_record_update",
  27: "watch_reward_lifecycle",
  28: "watch_reward_broadcast",
  29: "comment_lottery_event",
  30: "live_status_update",
};

function stringifyDebugValue(value) {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch (_) {
    return String(value || "");
  }
}

function getDebugMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return error.message || error.errMsg || error.reason || error.type || stringifyDebugValue(error);
}

function toDebugError(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    return {
      type: "close_event",
      code: error[0] || "",
      reason: error[1] || "",
      message: error[1] || "",
      data: error.slice(2),
      raw: stringifyDebugValue(error),
    };
  }
  return {
    type: error.type || "",
    code: error.code || error.status || "",
    reason: error.reason || "",
    message: error.message || error.errMsg || "",
    data: error.data || error.detail || "",
    raw: stringifyDebugValue(error),
  };
}

function readStorageValue(...keys) {
  try {
    for (const key of keys) {
      const value = uni.getStorageSync(key);
      if (value !== undefined && value !== null && value !== "") return value;
    }
  } catch (_) {}
  return "";
}

function readLoginIMSession() {
  let globalData = {};
  try {
    globalData = getApp()?.globalData || {};
  } catch (_) {}
  return {
    imUserId: String(globalData.imUserId || readStorageValue("im_user_id", "imUserId") || ""),
    imUserSig: String(globalData.imUserSig || readStorageValue("im_user_sig", "imUserSig") || ""),
  };
}

function normalizeIMInfo(raw = {}) {
  const source = raw?.data && typeof raw.data === "object" && !Array.isArray(raw.data) ? raw.data : raw;
  const loginIMSession = readLoginIMSession();
  const explicitImUser =
    source.imUserId ||
    source.im_user_id ||
    source.imUserID ||
    source.imUsername ||
    source.im_username ||
    source.imUser ||
    source.im_user;
  const explicitImToken =
    source.imUserSig ||
    source.im_user_sig ||
    source.im_user_token ||
    source.imUserToken ||
    source.imToken ||
    source.im_token;
  const imUser =
    explicitImUser ||
    loginIMSession.imUserId ||
    source.username ||
    source.userName ||
    source.user_name ||
    (typeof source.user === "string" || typeof source.user === "number" ? source.user : "");
  const imToken =
    explicitImToken ||
    (explicitImUser ? "" : loginIMSession.imUserSig) ||
    source.accessToken ||
    source.access_token ||
    source.token;
  return {
    ...source,
    appKey: String(source.appKey || source.app_key || ""),
    imUsername: String(imUser || ""),
    imToken: String(imToken || ""),
    mainChatroomId: String(source.mainChatroomId || source.main_chatroom_id || source.chatroomId || source.chatroom_id || ""),
    subChatroomId: String(source.subChatroomId || source.sub_chatroom_id || ""),
    clientIp: String(source.clientIp || source.client_ip || ""),
    rawFieldKeys: source && typeof source === "object" ? Object.keys(source) : [],
    credentialSource: explicitImUser && explicitImToken ? "im_token_api" : (loginIMSession.imUserId && loginIMSession.imUserSig ? "login_session" : "im_token_api"),
  };
}

function extractCustomMessage(msg = {}) {
  const content = Array.isArray(msg.contents) ? msg.contents[0] || {} : {};
  const customExts = msg.customExts || msg.custom_exts || msg.ext || msg.customExt || content.customExts || content.custom_exts || content.ext || {};
  const customEvent = msg.customEvent || msg.custom_event || content.customEvent || content.custom_event || "";
  const payloadText = customExts?.payload || customExts?.data || content?.payload || "";
  let payload = customExts || {};
  if (payloadText) {
    try {
      payload = JSON.parse(payloadText);
    } catch (_) {
      payload = customExts || {};
    }
  }
  return {
    from: msg.from || content.from || "",
    customEvent,
    payload,
    debug: {
      id: msg.id || msg.mid || "",
      from: msg.from || content.from || "",
      to: msg.to || content.to || "",
      customEvent,
      extKeys: customExts && typeof customExts === "object" ? Object.keys(customExts) : [],
    },
  };
}

function normalizeIMMessage(data, customEvent, from) {
  if (!data || typeof data !== "object") return data;
  const isAdmin = typeof data.isAdmin === "boolean"
    ? data.isAdmin
    : (typeof from === "string" && from.startsWith("admin_"));
  const custom = String(customEvent || "");
  if (custom === "comment_lottery") {
    return {
      ...data,
      type: "comment_lottery",
      action: data.action || data.event,
      nick: data.nickname || data.nick,
      isAdmin,
    };
  }
  const numericType = typeof data.type === "number" ? data.type : Number(data.type);
  if (Number.isInteger(numericType) && IM_MESSAGE_TYPE_MAP[numericType]) {
    if ((numericType === 3 || numericType === 4) && !data.nickname) {
      return null;
    }
    return {
      ...data,
      type: IM_MESSAGE_TYPE_MAP[numericType],
      nick: isAdmin ? "管理员" : (data.nickname || data.nick),
      isAdmin,
    };
  }
  if (!data.type && customEvent) {
    return {
      ...data,
      type: customEvent,
      nick: isAdmin ? "管理员" : (data.nickname || data.nick),
      isAdmin,
      data,
    };
  }
  if (isAdmin) {
    return { ...data, isAdmin, nick: "管理员" };
  }
  return data;
}

/**
 * 环信 IM 消息通道（直播间专用，GroupType=0）。
 * 发送交互与 H5 直播间保持一致：进入环信聊天室，弹幕通过 custom chat 消息直发三方 IM。
 */
export function useIMChannel({ liveId, loadCommentHistory, handleWsMessage, onOpen }) {
  let conn = null;
  let imInfo = null;
  let imLiveId = "";
  let initPromise = null;
  let imConnectedOnce = false;
  let imOpened = false;
  let clientIp = "";
  const imState = ref("idle");
  const imDebugState = ref({
    enabled: true,
    state: "idle",
    liveId: "",
    wsUrl: EASEMOB_WS_URL,
    apiUrl: EASEMOB_API_URL,
    appKey: "",
    imUsername: "",
    mainChatroomId: "",
    subChatroomId: "",
    rawFieldKeys: [],
    credentialSource: "",
    hasToken: false,
    tokenFetched: false,
    tokenError: "",
    openError: "",
    joinError: "",
    lastEvent: "idle",
    lastEventAt: "",
    sendCount: 0,
    lastSendEvent: "",
    lastSendOk: null,
    lastSendSkipReason: "",
    lastClose: "",
    closeRequestedBy: "",
    expectedClose: false,
    lastError: "",
    lastMessage: null,
    isOpened: false,
    mainJoined: false,
    subJoined: false,
    sdkEntry: "easemob-websdk/uniApp/Easemob-chat",
  });

  function getIsOpened() {
    if (!conn) return false;
    try {
      if (typeof conn.isOpened === "function") return !!conn.isOpened();
      if ("isOpened" in conn) return !!conn.isOpened;
      return imOpened;
    } catch (_) {
      return imOpened;
    }
  }

  function updateDebug(patch = {}) {
    imDebugState.value = {
      ...imDebugState.value,
      ...patch,
      state: patch.state || imState.value,
      liveId: String(liveId?.value || ""),
      isOpened: patch.isOpened === undefined ? getIsOpened() : patch.isOpened,
      lastEventAt: new Date().toISOString(),
    };
  }

  function genMsgId() {
    return Math.random().toString(36).slice(2, 10);
  }

  async function directSend(chatroomId, customEvent, payload) {
    const targetChatroomId = String(chatroomId || "");
    const isOpened = getIsOpened();
    if (!conn || !targetChatroomId || !isOpened) {
      updateDebug({
        lastEvent: "send_skipped",
        lastSendEvent: customEvent,
        lastSendOk: false,
        lastSendSkipReason: !conn ? "no_connection" : (!targetChatroomId ? "no_chatroom" : "not_open"),
        isOpened,
      });
      return false;
    }
    const msg = EC.message.create({
      type: "custom",
      to: targetChatroomId,
      chatType: "chatRoom",
      customEvent,
      customExts: { payload: JSON.stringify(payload) },
      chatroom_msg_level: "normal",
      priority: "normal",
    });
    if (msg && typeof msg.setLogLevel === "function") {
      msg.setLogLevel(3);
    }
    try {
      await conn.send(msg);
      updateDebug({
        sendCount: Number(imDebugState.value.sendCount || 0) + 1,
        lastEvent: "send_success",
        lastSendEvent: customEvent,
        lastSendOk: true,
        lastSendSkipReason: "",
      });
      return true;
    } catch (error) {
      console.error("[IMChannel] send fail:", error);
      updateDebug({
        lastEvent: "send_error",
        lastSendEvent: customEvent,
        lastSendOk: false,
        openError: getDebugMessage(error),
        lastError: toDebugError(error),
      });
      return false;
    }
  }

  function buildAdapter() {
    const userStore = useUserStore();
    const uid = userStore.userInfo?.id || userStore.userInfo?.customerId || userStore.userInfo?.customer_id || 0;
    const nick = userStore.userInfo?.nickname || userStore.userInfo?.nick || userStore.userInfo?.nickName || "";
    const avatar = userStore.userInfo?.avatar || userStore.userInfo?.avatarUrl || "";
    return {
      sendChat(content, data, options = {}) {
        return directSend(imInfo?.mainChatroomId, "chat", {
          type: 1,
          userId: uid,
          nickname: nick,
          avatar,
          content,
          clientIp,
          data: data || {},
          msgId: options?.msgId || genMsgId(),
        });
      },
      sendLike(count = 1) {
        return directSend(imInfo?.mainChatroomId, "like", {
          type: 2,
          userId: uid,
          nickname: nick,
          clientIp,
          msgId: genMsgId(),
          count: Number(count) > 0 ? Number(count) : 1,
        });
      },
      sendEnter() {
        return directSend(imInfo?.mainChatroomId, "enter", {
          type: 3,
          userId: uid,
          nickname: nick,
          avatar,
          clientIp,
          msgId: genMsgId(),
        });
      },
      sendLeave() {
        return directSend(imInfo?.mainChatroomId, "leave", {
          type: 4,
          userId: uid,
          nickname: nick,
          avatar,
          clientIp,
          msgId: genMsgId(),
        });
      },
    };
  }

  async function closeStaleConnection(reason = "close_stale") {
    if (!conn) return;
    const staleConn = conn;
    const staleInfo = imInfo;
    conn = null;
    imInfo = null;
    imLiveId = "";
    imConnectedOnce = false;
    imOpened = false;
    imState.value = "closed";
    updateDebug({
      state: "closed",
      lastEvent: reason,
      lastClose: {
        type: "client_close_request",
        reason,
        message: "client requested close before opening a different IM room",
      },
      closeRequestedBy: reason,
      expectedClose: true,
      isOpened: false,
      mainJoined: false,
      subJoined: false,
    });
    try {
      if (staleInfo?.mainChatroomId) {
        await staleConn.leaveChatRoom({ roomId: String(staleInfo.mainChatroomId) });
      }
      if (staleInfo?.subChatroomId) {
        await staleConn.leaveChatRoom({ roomId: String(staleInfo.subChatroomId) });
      }
    } catch (_) {}
    staleConn.close();
  }

  async function initWebSocket() {
    const requestedLiveId = String(liveId?.value || "");
    if (initPromise) {
      updateDebug({ lastEvent: "init_reused_pending" });
      return initPromise;
    }
    if (conn && imLiveId === requestedLiveId && ["token", "connecting", "open"].includes(imState.value)) {
      updateDebug({ lastEvent: "init_reused_same_room" });
      return true;
    }
    initPromise = doInitWebSocket(requestedLiveId).finally(() => {
      initPromise = null;
    });
    return initPromise;
  }

  async function doInitWebSocket(requestedLiveId) {
    await closeStaleConnection();
    imState.value = "token";
    imOpened = false;
    updateDebug({
      state: "token",
      lastEvent: "token_fetch_start",
      tokenFetched: false,
      tokenError: "",
      openError: "",
      joinError: "",
      appKey: "",
      imUsername: "",
      mainChatroomId: "",
      subChatroomId: "",
      rawFieldKeys: [],
      credentialSource: "",
      hasToken: false,
      lastSendSkipReason: "",
      lastClose: "",
      closeRequestedBy: "",
      expectedClose: false,
      lastError: "",
      lastMessage: null,
      isOpened: false,
      mainJoined: false,
      subJoined: false,
    });

    try {
      const res = await getImToken(liveId.value);
      const nextImInfo = normalizeIMInfo(res);
      if (!nextImInfo.appKey) {
        console.error("[IMChannel] 获取 IM 凭证失败: appKey 缺失", res);
        updateDebug({
          state: "error",
          lastEvent: "token_missing_app_key",
          tokenFetched: true,
          tokenError: "appKey missing",
        });
        return false;
      }
      if (!nextImInfo.imUsername || !nextImInfo.imToken) {
        console.error("[IMChannel] 获取 IM 凭证失败: username/token 缺失", res);
        updateDebug({
          state: "error",
          lastEvent: "token_missing_user_or_token",
          tokenFetched: true,
          tokenError: "imUsername or imToken missing",
          appKey: nextImInfo.appKey,
        imUsername: nextImInfo.imUsername,
        rawFieldKeys: nextImInfo.rawFieldKeys || [],
        credentialSource: nextImInfo.credentialSource || "",
        hasToken: !!nextImInfo.imToken,
      });
        return false;
      }
      imInfo = nextImInfo;
      imLiveId = requestedLiveId;
      clientIp = nextImInfo.clientIp || "";
      updateDebug({
        lastEvent: "token_fetch_success",
        tokenFetched: true,
        tokenError: "",
        appKey: nextImInfo.appKey,
        imUsername: nextImInfo.imUsername,
        mainChatroomId: nextImInfo.mainChatroomId,
        subChatroomId: nextImInfo.subChatroomId,
        rawFieldKeys: nextImInfo.rawFieldKeys || [],
        credentialSource: nextImInfo.credentialSource || "",
        hasToken: !!nextImInfo.imToken,
      });
    } catch (error) {
      console.error("[IMChannel] 获取 IM 凭证异常:", error);
      updateDebug({
        state: "error",
        lastEvent: "token_fetch_error",
        tokenError: getDebugMessage(error),
        lastError: toDebugError(error),
      });
      return false;
    }

    const nextConn = new EC.connection({
      appKey: imInfo.appKey,
      url: EASEMOB_WS_URL,
      apiUrl: EASEMOB_API_URL,
      delivery: true,
      useOwnUploadFun: true,
      isHttpDNS: false,
      isAutoLogin: false,
    });
    conn = nextConn;
    muteEasemobLogger(conn?.logger);
    muteEasemobLogger(EC?.logger);

    conn.addEventHandler("live", {
      onConnected: async () => {
        if (conn !== nextConn) return;
        imState.value = "open";
        imOpened = true;
        updateDebug({ state: "open", lastEvent: "connected", isOpened: true });
        try {
          if (imInfo.mainChatroomId) {
            await conn.joinChatRoom({ roomId: String(imInfo.mainChatroomId), leaveOtherRooms: false });
            updateDebug({ lastEvent: "joined_main_chatroom", mainJoined: true });
          }
          if (imInfo.subChatroomId) {
            await conn.joinChatRoom({ roomId: String(imInfo.subChatroomId), leaveOtherRooms: false });
            updateDebug({ lastEvent: "joined_sub_chatroom", subJoined: true });
          }
        } catch (error) {
          console.error("[IMChannel] joinChatRoom fail:", error);
          updateDebug({
            lastEvent: "join_error",
            joinError: getDebugMessage(error),
            lastError: toDebugError(error),
          });
        }
        onOpen?.();
        if (imConnectedOnce) {
          loadCommentHistory();
        }
        imConnectedOnce = true;
      },
      onDisconnected: (event) => {
        if (conn !== nextConn) return;
        const previousDebug = imDebugState.value || {};
        imState.value = "closed";
        imOpened = false;
        updateDebug({
          state: "closed",
          lastEvent: "disconnected",
          lastClose: toDebugError(event),
          closeRequestedBy: previousDebug.closeRequestedBy || "",
          expectedClose: !!previousDebug.expectedClose,
          isOpened: false,
          mainJoined: false,
          subJoined: false,
        });
      },
      onError: (error) => {
        if (conn !== nextConn) return;
        imState.value = "error";
        imOpened = false;
        console.error("[IMChannel] error:", error);
        updateDebug({
          state: "error",
          lastEvent: "runtime_error",
          openError: getDebugMessage(error),
          lastError: toDebugError(error),
        });
      },
      onCustomMessage: (msg) => {
        if (conn !== nextConn) return;
        const parsed = extractCustomMessage(msg);
        updateDebug({ lastEvent: "custom_message", lastMessage: parsed.debug });
        if (parsed.from === imInfo?.imUsername) return;
        const payload = parsed.payload;
        const payloadRoomId = Number(payload?.roomId || 0);
        const currentRoomId = Number(liveId?.value || 0);
        if (payloadRoomId > 0 && currentRoomId > 0 && payloadRoomId !== currentRoomId) {
          console.warn("[IMChannel] 丢弃跨房消息", {
            customEvent: parsed.customEvent,
            payloadRoomId,
            currentRoomId,
          });
          return;
        }
        const data = normalizeIMMessage(payload, parsed.customEvent, parsed.from);
        if (data && data.type) {
          handleWsMessage(data);
        }
      },
    });

    try {
      imState.value = "connecting";
      updateDebug({ state: "connecting", lastEvent: "open_start" });
      await conn.open({
        user: imInfo.imUsername,
        accessToken: imInfo.imToken,
      });
    } catch (error) {
      imState.value = "error";
      imOpened = false;
      console.error("[IMChannel] open fail:", error);
      updateDebug({
        state: "error",
        lastEvent: "open_error",
        openError: getDebugMessage(error),
        lastError: toDebugError(error),
      });
      return false;
    }
    return true;
  }

  function getLiveSocket() {
    return buildAdapter();
  }

  async function closeLiveSocket() {
    if (!conn || !imInfo) return;
    const closingConn = conn;
    const closingInfo = imInfo;
    updateDebug({
      lastEvent: "manual_close_start",
      lastClose: {
        type: "client_close_request",
        reason: "manual_close",
        message: "client requested close from page lifecycle or access state",
      },
      closeRequestedBy: "manual_close",
      expectedClose: true,
    });
    buildAdapter().sendLeave();
    if (closingInfo.mainChatroomId) {
      await closingConn.leaveChatRoom({ roomId: String(closingInfo.mainChatroomId) }).catch(() => {});
    }
    if (closingInfo.subChatroomId) {
      await closingConn.leaveChatRoom({ roomId: String(closingInfo.subChatroomId) }).catch(() => {});
    }
    conn = null;
    imInfo = null;
    imLiveId = "";
    imOpened = false;
    closingConn.close();
    imState.value = "closed";
    updateDebug({ state: "closed", lastEvent: "manual_closed", isOpened: false, mainJoined: false, subJoined: false });
  }

  return {
    imState,
    imDebugState,
    initWebSocket,
    getLiveSocket,
    closeLiveSocket,
  };
}
