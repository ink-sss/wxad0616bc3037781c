"use strict";
const common_vendor = require("../common/vendor.js");
const utils_wsEnvelope = require("./ws-envelope.js");
const TYPE = {
  PING: 0,
  CHAT: 1,
  LIKE: 2,
  ENTER: 3,
  LEAVE: 4,
  SYSTEM: 5,
  PRODUCT: 6,
  ONLINE_COUNT: 7,
  GIFT: 8,
  SETTING_UPDATE: 9,
  COMMENT_AUDIT: 10,
  COMMENT_DELETE: 11,
  COMMENT_CLEAR: 12,
  COMMENT_TOP: 13,
  USER_MUTED: 14,
  USER_BLOCKED: 15,
  USER_UNBLOCKED: 16,
  PRODUCT_STATUS_UPDATE: 17,
  PRODUCT_LIST: 18,
  PRODUCT_STOCK: 19,
  VIDEO_LOOP_RESTART: 20,
  MUTE_WORD_FILTERED: 21,
  WIN_NOTIFY: 22,
  LOTTERY_RESULT: 23,
  WIN_RECORD_UPDATE: 24,
  REPLAY_REQUEST: 26,
  WATCH_REWARD_LIFECYCLE: 27,
  WATCH_REWARD_BROADCAST: 28,
  COMMENT_LOTTERY: 29,
  LIVE_STATUS_UPDATE: 30
};
function getEnvelopePayload(data) {
  var _a, _b;
  let value = utils_wsEnvelope.unwrapMessage(data);
  if (!value || typeof value !== "object")
    return value;
  if (value.payload !== void 0 && (value.event || value.name || value.cmd || value.action)) {
    value = {
      ...value.payload,
      event: value.event || ((_a = value.payload) == null ? void 0 : _a.event),
      type: ((_b = value.payload) == null ? void 0 : _b.type) ?? value.type
    };
  }
  if (value.data && typeof value.data === "object" && (value.event || value.msgType || value.eventType)) {
    value = {
      ...value.data,
      event: value.event || value.data.event,
      type: value.data.type ?? value.type
    };
  }
  return value;
}
function normalizeByName(data = {}) {
  var _a, _b;
  const name = String(data.event || data.eventType || data.msgType || data.cmd || data.action || data.type || "").toLowerCase();
  if (!name)
    return data;
  if (["pong", "heartbeat_pong"].includes(name) || data.content === "pong")
    return { ...data, type: "pong" };
  if (["chat", "comment", "message"].includes(name))
    return { ...data, type: "chat", nick: data.nickname || data.nick || data.userName };
  if (["like", "liked"].includes(name))
    return { ...data, type: "like", totalLikes: data.totalLikes || data.likeCount || ((_a = data.data) == null ? void 0 : _a.likeCount) || data.count };
  if (["enter", "join"].includes(name))
    return { ...data, type: "enter", nick: data.nickname || data.nick };
  if (["leave", "quit"].includes(name))
    return { ...data, type: "leave", nick: data.nickname || data.nick };
  if (["online_count", "viewer_count", "onlinecount", "viewercount"].includes(name))
    return { ...data, type: "viewer_count", count: data.onlineCount || data.count || ((_b = data.data) == null ? void 0 : _b.onlineCount) };
  if (["r_to_buy", "buy_reminder", "buying_notice", "paid_order_notice"].includes(name))
    return { ...data, type: "r_to_buy" };
  if (["product", "current_product"].includes(name))
    return { ...data, type: "product" };
  if (["product_status_update", "productstatusupdate", "product_status"].includes(name))
    return { ...data, type: "product_status_update" };
  if (["product_list", "productlist"].includes(name))
    return { ...data, type: "product_list" };
  if (["product_stock", "productstock"].includes(name))
    return { ...data, type: "product_stock" };
  if (["setting_update", "room_setting_update"].includes(name))
    return { ...data, type: "setting_update" };
  if (["comment_audit"].includes(name))
    return { ...data, type: "comment_audit" };
  if (["comment_delete", "delete_comment"].includes(name))
    return { ...data, type: "comment_delete" };
  if (["comment_clear", "clear_comment"].includes(name))
    return { ...data, type: "comment_clear" };
  if (["comment_top", "top_comment"].includes(name))
    return { ...data, type: "comment_top" };
  if (["user_muted", "mute_user"].includes(name))
    return { ...data, type: "user_muted" };
  if (["user_blocked", "block_user"].includes(name))
    return { ...data, type: "user_blocked" };
  if (["user_unblocked", "unblock_user"].includes(name))
    return { ...data, type: "user_unblocked" };
  if (["mute_word_filtered"].includes(name))
    return { ...data, type: "mute_word_filtered" };
  if (["live_ended", "live_end"].includes(name))
    return { ...data, type: "live_ended" };
  if (["video_loop_restart"].includes(name))
    return { ...data, type: "video_loop_restart" };
  if (["win_notify", "lottery_win_notify", "watch_reward_win_notify"].includes(name))
    return { ...data, type: "win_notify" };
  if (["lottery_result", "normal_lottery_result"].includes(name))
    return { ...data, type: "lottery_result" };
  if (["win_record_update", "winrecordupdate"].includes(name))
    return { ...data, type: "win_record_update" };
  if (["watch_reward_lifecycle"].includes(name))
    return { ...data, type: "watch_reward_lifecycle" };
  if (["watch_reward_broadcast"].includes(name))
    return { ...data, type: "watch_reward_broadcast" };
  if (["comment_lottery_event", "begincommentlotteryprize", "openprize", "updatecommentlotteryconfig"].includes(name))
    return { ...data, type: "comment_lottery_event" };
  if (["comment_lottery"].includes(name))
    return { ...data, type: "comment_lottery" };
  if (["live_status_update", "live_status"].includes(name))
    return { ...data, type: "live_status_update" };
  return data;
}
function normalizeMessage(data) {
  var _a, _b;
  if (!data || typeof data !== "object")
    return data;
  const payload = getEnvelopePayload(data);
  if (!payload || typeof payload !== "object")
    return payload;
  const byName = normalizeByName(payload);
  if (byName.type && typeof byName.type === "string" && Number.isNaN(Number(byName.type)))
    return byName;
  const type = Number(byName.type);
  if (type === TYPE.PING || byName.content === "pong")
    return { ...byName, type: byName.content === "pong" ? "pong" : "ping" };
  if (type === TYPE.CHAT)
    return { ...byName, type: "chat", nick: byName.nickname || byName.nick || byName.userName };
  if (type === TYPE.LIKE)
    return { ...byName, type: "like", totalLikes: ((_a = byName.data) == null ? void 0 : _a.likeCount) || byName.likeCount || byName.count };
  if (type === TYPE.ENTER)
    return { ...byName, type: "enter", nick: byName.nickname || byName.nick };
  if (type === TYPE.LEAVE)
    return { ...byName, type: "leave", nick: byName.nickname || byName.nick };
  if (type === TYPE.SYSTEM)
    return { ...byName, type: "system" };
  if (type === TYPE.PRODUCT)
    return { ...byName, type: "product" };
  if (type === TYPE.ONLINE_COUNT)
    return { ...byName, type: "viewer_count", count: ((_b = byName.data) == null ? void 0 : _b.onlineCount) || byName.onlineCount || byName.count };
  if (type === TYPE.GIFT)
    return { ...byName, type: "gift" };
  if (type === TYPE.SETTING_UPDATE)
    return { ...byName, type: "setting_update" };
  if (type === TYPE.COMMENT_AUDIT)
    return { ...byName, type: "comment_audit" };
  if (type === TYPE.COMMENT_DELETE)
    return { ...byName, type: "comment_delete" };
  if (type === TYPE.COMMENT_CLEAR)
    return { ...byName, type: "comment_clear" };
  if (type === TYPE.COMMENT_TOP)
    return { ...byName, type: "comment_top" };
  if (type === TYPE.USER_MUTED)
    return { ...byName, type: "user_muted" };
  if (type === TYPE.USER_BLOCKED)
    return { ...byName, type: "user_blocked" };
  if (type === TYPE.USER_UNBLOCKED)
    return { ...byName, type: "user_unblocked" };
  if (type === TYPE.PRODUCT_STATUS_UPDATE)
    return { ...byName, type: "product_status_update" };
  if (type === TYPE.PRODUCT_LIST)
    return { ...byName, type: "product_list" };
  if (type === TYPE.PRODUCT_STOCK)
    return { ...byName, type: "product_stock" };
  if (type === TYPE.VIDEO_LOOP_RESTART)
    return { ...byName, type: "video_loop_restart" };
  if (type === TYPE.MUTE_WORD_FILTERED)
    return { ...byName, type: "mute_word_filtered" };
  if (type === TYPE.WIN_NOTIFY)
    return { ...byName, type: "win_notify" };
  if (type === TYPE.LOTTERY_RESULT)
    return { ...byName, type: "lottery_result" };
  if (type === TYPE.WIN_RECORD_UPDATE)
    return { ...byName, type: "win_record_update" };
  if (type === TYPE.WATCH_REWARD_LIFECYCLE)
    return { ...byName, type: "watch_reward_lifecycle" };
  if (type === TYPE.WATCH_REWARD_BROADCAST)
    return { ...byName, type: "watch_reward_broadcast" };
  if (type === TYPE.COMMENT_LOTTERY)
    return { ...byName, type: "comment_lottery" };
  if (type === TYPE.LIVE_STATUS_UPDATE)
    return { ...byName, type: "live_status_update" };
  return byName;
}
function bindSocketTaskEvent(socket, taskMethodName, globalMethodName, globalOffMethodName, callback) {
  if (socket && typeof socket[taskMethodName] === "function") {
    socket[taskMethodName](callback);
    return () => {
    };
  }
  if (typeof common_vendor.index[globalMethodName] === "function") {
    common_vendor.index[globalMethodName](callback);
    return () => {
      if (typeof common_vendor.index[globalOffMethodName] === "function")
        common_vendor.index[globalOffMethodName](callback);
    };
  }
  return () => {
  };
}
class MiniLiveSocket {
  constructor(options = {}) {
    this.url = options.url || "";
    this.token = options.token || "";
    this.liveId = options.liveId || "";
    this.signKey = options.signKey || "";
    this.onOpen = options.onOpen || null;
    this.onMessage = options.onMessage || null;
    this.onClose = options.onClose || null;
    this.onError = options.onError || null;
    this.onStateChange = options.onStateChange || null;
    this.heartbeatInterval = options.heartbeatInterval || 25e3;
    this.heartbeatTimeout = options.heartbeatTimeout || this.heartbeatInterval * 2 + 5e3;
    this.reconnectBaseInterval = options.reconnectBaseInterval || 1e3;
    this.reconnectMaxInterval = options.reconnectMaxInterval || 3e4;
    this.maxReconnect = options.maxReconnect || 20;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.socket = null;
    this.closed = false;
    this.open = false;
    this.connectedOnce = false;
    this.reconnectCount = 0;
    this.lastPongAt = 0;
    this.lastSeq = 0;
    this.unbindSocketEvents = [];
  }
  setState(state) {
    var _a;
    (_a = this.onStateChange) == null ? void 0 : _a.call(this, state);
  }
  connect() {
    if (!this.url)
      return;
    this.closed = false;
    this.open = false;
    this.setState(this.connectedOnce ? "reconnecting" : "connecting");
    if (this.signKey)
      utils_wsEnvelope.setSignKey(this.signKey);
    this.clearSocketEvents();
    const joiner = this.url.includes("?") ? "&" : "?";
    const url = this.token ? `${this.url}${joiner}token=${encodeURIComponent(this.token)}` : this.url;
    this.socket = common_vendor.index.connectSocket({ url });
    this.unbindSocketEvents = [
      bindSocketTaskEvent(this.socket, "onOpen", "onSocketOpen", "offSocketOpen", () => {
        var _a;
        this.open = true;
        this.lastPongAt = Date.now();
        this.reconnectCount = 0;
        this.setState("open");
        this.startHeartbeat();
        (_a = this.onOpen) == null ? void 0 : _a.call(this, { isReconnect: this.connectedOnce });
        this.sendEnter();
        if (this.connectedOnce && this.lastSeq > 0)
          this.requestReplay(this.lastSeq);
        this.connectedOnce = true;
      }),
      bindSocketTaskEvent(this.socket, "onMessage", "onSocketMessage", "offSocketMessage", (res) => {
        var _a;
        let data = res.data;
        try {
          data = JSON.parse(data);
        } catch (error) {
        }
        const message = normalizeMessage(data);
        if (!message)
          return;
        if (message.type === "pong") {
          this.lastPongAt = Date.now();
          return;
        }
        if (message.type === "ping") {
          this.send({ type: TYPE.PING, content: "pong" });
          return;
        }
        if (message.seq && Number(message.seq) > this.lastSeq)
          this.lastSeq = Number(message.seq);
        (_a = this.onMessage) == null ? void 0 : _a.call(this, message);
      }),
      bindSocketTaskEvent(this.socket, "onClose", "onSocketClose", "offSocketClose", (event) => {
        var _a;
        this.open = false;
        this.stopHeartbeat();
        (_a = this.onClose) == null ? void 0 : _a.call(this, event);
        if (this.closed)
          this.setState("closed");
        else
          this.scheduleReconnect();
      }),
      bindSocketTaskEvent(this.socket, "onError", "onSocketError", "offSocketError", (event) => {
        var _a;
        this.open = false;
        this.stopHeartbeat();
        (_a = this.onError) == null ? void 0 : _a.call(this, event);
        this.scheduleReconnect();
      })
    ];
  }
  send(payload = {}) {
    if (!this.socket || !this.open)
      return Promise.resolve(false);
    const msgId = payload.type && !payload.msgId && payload.type !== TYPE.PING ? Math.random().toString(36).slice(2, 10) : payload.msgId;
    const body = {
      roomId: Number(this.liveId || 0),
      ...payload,
      ...msgId ? { msgId } : {}
    };
    const data = utils_wsEnvelope.wrapMessage(body, this.signKey);
    return new Promise((resolve) => {
      const send = this.socket && typeof this.socket.send === "function" ? this.socket.send.bind(this.socket) : typeof common_vendor.index.sendSocketMessage === "function" ? common_vendor.index.sendSocketMessage.bind(common_vendor.index) : null;
      if (!send) {
        resolve(false);
        return;
      }
      send({
        data,
        success: () => resolve(true),
        fail: () => resolve(false)
      });
    });
  }
  sendChat(content, data = {}) {
    return this.send({ type: TYPE.CHAT, content, data });
  }
  sendLike(count = 1) {
    return this.send({ type: TYPE.LIKE, data: { count: Number(count || 1) } });
  }
  sendEnter() {
    return this.send({ type: TYPE.ENTER });
  }
  requestReplay(lastSeq = this.lastSeq) {
    if (!lastSeq)
      return Promise.resolve(false);
    return this.send({ type: TYPE.REPLAY_REQUEST, data: { sinceSeq: Number(lastSeq), lastSeq: Number(lastSeq) } });
  }
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      var _a, _b;
      const now = Date.now();
      if (this.open && this.lastPongAt && now - this.lastPongAt > this.heartbeatTimeout) {
        this.open = false;
        this.stopHeartbeat();
        (_b = (_a = this.socket) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a, {});
        this.scheduleReconnect();
        return;
      }
      this.send({ type: TYPE.PING, content: "ping", ts: now });
    }, this.heartbeatInterval);
  }
  stopHeartbeat() {
    if (this.heartbeatTimer)
      clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }
  clearSocketEvents() {
    this.unbindSocketEvents.forEach((unbind) => {
      try {
        unbind == null ? void 0 : unbind();
      } catch (error) {
      }
    });
    this.unbindSocketEvents = [];
  }
  scheduleReconnect() {
    if (this.closed || this.reconnectTimer)
      return;
    if (this.reconnectCount >= this.maxReconnect) {
      this.setState("max_reconnect");
      return;
    }
    this.setState("reconnecting");
    const exp = Math.min(this.reconnectBaseInterval * Math.pow(2, this.reconnectCount), this.reconnectMaxInterval);
    const jitter = exp * 0.2 * (Math.random() * 2 - 1);
    const delay = Math.round(exp + jitter);
    this.reconnectCount += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.closed)
        this.connect();
    }, delay);
  }
  close() {
    this.closed = true;
    this.open = false;
    this.stopHeartbeat();
    if (this.reconnectTimer)
      clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    if (this.socket) {
      if (typeof this.socket.close === "function") {
        this.socket.close({});
      } else if (typeof common_vendor.index.closeSocket === "function") {
        common_vendor.index.closeSocket({});
      }
    }
    this.clearSocketEvents();
    this.socket = null;
    this.setState("closed");
  }
}
exports.MiniLiveSocket = MiniLiveSocket;
