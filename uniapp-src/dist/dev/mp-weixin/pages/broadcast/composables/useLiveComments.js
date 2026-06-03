"use strict";
const common_vendor = require("../../../common/vendor.js");
const COMMENT_CORE_RADIUS = 4;
const COMMENT_OVERSCAN = 4;
const COMMENT_RENDER_RADIUS = COMMENT_CORE_RADIUS + COMMENT_OVERSCAN;
const COMMENT_DOM_LIMIT = COMMENT_RENDER_RADIUS * 2 + 1;
const COMMENT_SCROLL_EDGE_PX = 72;
function useLiveComments({
  videoUrl,
  isPlaying,
  isReplay,
  roomGroupType,
  roomSetting,
  pushStatus,
  liveStatusText,
  hasReplay,
  liveId,
  replayCurrentVideoId,
  replayLastTime,
  chatDisabled,
  inputText,
  inputFocused,
  keyboardHeight,
  blurInput,
  defaultAvatar,
  getCommentHistory,
  getLiveSocket,
  sendLiveComment,
  userStore,
  roomCode,
  liveTenantId,
  shareCode,
  liveBindId,
  getEffectiveTermId,
  myUserId
}) {
  const scrollToId = common_vendor.ref("");
  const commentScrollWithAnimation = common_vendor.ref(true);
  const messages = common_vendor.ref([]);
  const currentCommentIndex = common_vendor.ref(0);
  const replayCommentTimeline = common_vendor.ref([]);
  const replayCommentCursor = common_vendor.ref(0);
  const replayCommentQueue = common_vendor.ref([]);
  let _commentQueueTimer = null;
  let _sendingMessage = false;
  let _lastCommentScrollTop = 0;
  const _pendingSentContents = /* @__PURE__ */ new Set();
  const PENDING_SENT_TTL = 15e3;
  function normalizeChatContent(content) {
    return String(content || "").trim();
  }
  function normalizeMessageId(message = {}) {
    return String(
      message._clientMsgId || message.msgId || message.msg_id || message.clientMsgId || message.client_msg_id || ""
    ).trim();
  }
  function normalizeMessageSeq(message = {}) {
    const seq = Number(message.seq || 0);
    return Number.isFinite(seq) ? seq : 0;
  }
  function getCommentData(item = {}) {
    if (item.data && typeof item.data === "object" && !Array.isArray(item.data)) {
      return { ...item.data, ...item };
    }
    return item || {};
  }
  function getCommentId(payload = {}) {
    return payload.commentId || payload.comment_id || payload.id;
  }
  function getReplayVideoId(payload = {}) {
    return Number(payload.replayVideoId || payload.replay_video_id || payload.videoId || payload.video_id || 0);
  }
  function getTimelineSeconds(payload = {}) {
    return Number(
      payload.timelineSeconds || payload.timeline_seconds || payload.timeLineSeconds || payload.playSeconds || payload.play_seconds || payload.commentSeconds || payload.comment_seconds || payload.commentTime || payload.comment_time || payload.time || 0
    );
  }
  function getCommentContent(payload = {}, fallback = "") {
    return payload.content || payload.comment || payload.message || payload.text || fallback;
  }
  function isPendingChatMessage(message = {}) {
    return message.type === "chat" && !!message._tempId && !message.commentId;
  }
  function createLocalMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  function removeOptimisticMessage(tempId, clientMsgId) {
    const index = messages.value.findIndex((item) => {
      if (!isPendingChatMessage(item))
        return false;
      if (tempId && item._tempId === tempId)
        return true;
      return clientMsgId && normalizeMessageId(item) === clientMsgId;
    });
    if (index >= 0) {
      const [removed] = messages.value.splice(index, 1);
      if (pinnedMessage.value === removed) {
        refreshPinnedMessage();
      }
    }
  }
  function hasEquivalentMessage(list, message, options = {}) {
    const messageId = normalizeMessageId(message);
    const messageSeq = normalizeMessageSeq(message);
    const commentId = Number((message == null ? void 0 : message.commentId) || 0);
    const content = normalizeChatContent(message == null ? void 0 : message.content);
    return list.some((item) => {
      if (messageSeq > 0 && normalizeMessageSeq(item) === messageSeq)
        return true;
      if (commentId > 0 && Number(item.commentId || 0) === commentId)
        return true;
      const itemMessageId = normalizeMessageId(item);
      if (messageId && itemMessageId && itemMessageId === messageId)
        return true;
      if (options.contentPendingOnly && !isPendingChatMessage(item))
        return false;
      return content && normalizeChatContent(item.content) === content;
    });
  }
  const shouldShowComments = common_vendor.computed(() => {
    return true;
  });
  function clampCommentIndex(index = currentCommentIndex.value, length = messages.value.length) {
    const maxIndex = Math.max(0, Number(length || 0) - 1);
    return Math.min(Math.max(0, Number(index || 0)), maxIndex);
  }
  function normalizeCommentIndex(index = currentCommentIndex.value, length = messages.value.length) {
    const nextIndex = clampCommentIndex(index, length);
    if (nextIndex !== currentCommentIndex.value) {
      currentCommentIndex.value = nextIndex;
    }
    return nextIndex;
  }
  function getLatestCommentIndex(length = messages.value.length) {
    const total = Number(length || 0);
    if (total <= 0)
      return 0;
    return Math.max(0, total - 1 - COMMENT_CORE_RADIUS);
  }
  function isLatestCommentIndex(index = currentCommentIndex.value, length = messages.value.length) {
    return Number(length || 0) <= 0 || index >= getLatestCommentIndex(length);
  }
  function shouldFollowLatestCommentWindow() {
    return isLatestCommentIndex();
  }
  function syncLatestCommentWindow() {
    currentCommentIndex.value = getLatestCommentIndex();
  }
  function getVisibleCommentStart(index = currentCommentIndex.value) {
    return Math.max(0, clampCommentIndex(index) - COMMENT_RENDER_RADIUS);
  }
  function getVisibleCommentEnd(start, length = messages.value.length) {
    return Math.min(Number(length || 0), start + COMMENT_DOM_LIMIT);
  }
  const visibleMessages = common_vendor.computed(() => {
    const start = getVisibleCommentStart();
    const end = getVisibleCommentEnd(start);
    return messages.value.slice(start, end).map((message, index) => ({
      ...message,
      _visibleIndex: start + index
    }));
  });
  common_vendor.watch(
    () => messages.value.length,
    (length, previousLength) => {
      if (length === 0) {
        currentCommentIndex.value = 0;
        return;
      }
      const wasAtLatest = isLatestCommentIndex(currentCommentIndex.value, previousLength);
      if (length > previousLength && wasAtLatest) {
        syncLatestCommentWindow();
        return;
      }
      normalizeCommentIndex(currentCommentIndex.value, length);
    },
    { flush: "sync" }
  );
  const pinnedMessage = common_vendor.ref(null);
  function isPinnedComment(message) {
    return Number((message == null ? void 0 : message.isTop) || 0) === 1;
  }
  function syncPinnedMessageFromAdded(message) {
    if (!isPinnedComment(message))
      return;
    messages.value.forEach((item) => {
      if (item !== message)
        item.isTop = 0;
    });
    pinnedMessage.value = message;
  }
  function syncPinnedMessageAfterReplace(nextMessage, previousMessage) {
    if (isPinnedComment(nextMessage)) {
      pinnedMessage.value = nextMessage;
      return;
    }
    if (pinnedMessage.value === previousMessage) {
      refreshPinnedMessage();
    }
  }
  function refreshPinnedMessage() {
    const found = messages.value.find((m) => Number(m.isTop) === 1) || null;
    pinnedMessage.value = found;
  }
  function canAppendLiveMessages() {
    return true;
    //!!videoUrl.value && (isReplay.value ? isPlaying.value : true);
  }
  function formatLiveNickname(nickname) {
    const raw = String(nickname || "匿名").trim();
    if (!raw) {
      return "匿名";
    }
    if (Number(roomSetting.value.encryptNickname || 0) === 1) {
      return raw;
    }
    const chars = Array.from(raw);
    if (chars.length <= 1)
      return raw;
    if (chars.length === 2)
      return `${chars[0]}*${chars[1]}`;
    return `${chars[0]}***${chars[chars.length - 1]}`;
  }
  function scrollToBottom() {
    if (messages.value.length === 0)
      return;
    syncLatestCommentWindow();
    const target = "msg-" + (messages.value.length - 1);
    scrollToId.value = "";
    common_vendor.nextTick$1(() => {
      commentScrollWithAnimation.value = true;
      scrollToId.value = target;
    });
  }
  function scrollToCommentIndex(index, withAnimation = true) {
    const normalizedIndex = Math.max(0, Number(index || 0));
    commentScrollWithAnimation.value = withAnimation;
    scrollToId.value = "";
    common_vendor.nextTick$1(() => {
      scrollToId.value = "msg-" + normalizedIndex;
      if (!withAnimation) {
        common_vendor.nextTick$1(() => {
          commentScrollWithAnimation.value = true;
        });
      }
    });
  }
  function loadPreviousCommentWindow(anchorIndex = ((_a) => (_a = visibleMessages.value[0]) == null ? void 0 : _a._visibleIndex)()) {
    const currentIndex = normalizeCommentIndex();
    if (currentIndex <= 0)
      return false;
    currentCommentIndex.value = currentIndex - 1;
    scrollToCommentIndex(anchorIndex ?? currentCommentIndex.value, false);
    return true;
  }
  function loadNextCommentWindow(anchorIndex = ((_b) => (_b = visibleMessages.value[visibleMessages.value.length - 1]) == null ? void 0 : _b._visibleIndex)()) {
    const currentIndex = normalizeCommentIndex();
    const latestIndex = getLatestCommentIndex();
    if (currentIndex >= latestIndex)
      return false;
    currentCommentIndex.value = currentIndex + 1;
    scrollToCommentIndex(anchorIndex ?? currentCommentIndex.value, false);
    return true;
  }
  function handleCommentWindowScroll(event = {}) {
    const detail = event.detail || {};
    const target = event.target || event.currentTarget || {};
    const scrollTop = Number(detail.scrollTop || 0);
    const scrollHeight = Number(detail.scrollHeight || target.scrollHeight || 0);
    const clientHeight = Number(detail.clientHeight || detail.height || target.clientHeight || 0);
    const direction = scrollTop < _lastCommentScrollTop ? "up" : "down";
    _lastCommentScrollTop = scrollTop;
    if (scrollTop <= COMMENT_SCROLL_EDGE_PX && (direction === "up" || scrollTop === 0)) {
      return loadPreviousCommentWindow();
    }
    if (direction === "down" && scrollHeight > 0 && clientHeight > 0) {
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceToBottom <= COMMENT_SCROLL_EDGE_PX) {
        return loadNextCommentWindow();
      }
    }
    return false;
  }
  function appendSystemMessage(content) {
    const message = typeof content === "object" && content ? content : { type: "system", content };
    const text = String(message.content || "").trim();
    if (!text || false)
      return;
    const shouldFollow = shouldFollowLatestCommentWindow();
    const nextMessage = { ...message, type: message.type || "system", nick: message.nick || "", content: text };
    messages.value.push(nextMessage);
    syncPinnedMessageFromAdded(nextMessage);
    if (shouldFollow)
      common_vendor.nextTick$1(() => scrollToBottom());
  }
  async function sendMessage(overrideText) {
    var _a, _b, _c;
    if (chatDisabled.value) {
      common_vendor.index.showToast({ title: chatDisabled.value, icon: "none" });
      return false;
    }
    const fromQuickReply = typeof overrideText === "string";
    const text = (fromQuickReply ? overrideText : inputText.value || "").trim();
    if (!text) {
      return false;
    }
    if (_sendingMessage) {
      return false;
    }
    const myNick = ((_a = userStore.userInfo) == null ? void 0 : _a.nickname) || "我";
    const myAvatar = ((_b = userStore.userInfo) == null ? void 0 : _b.avatar) || defaultAvatar;
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const clientMsgId = createLocalMessageId();
    messages.value.push({
      type: "chat",
      nick: myNick,
      content: text,
      avatar: myAvatar,
      _tempId: tempId,
      _clientMsgId: clientMsgId,
      msgId: clientMsgId
    });
    _pendingSentContents.add(normalizeChatContent(text));
    const cleanupTimer = setTimeout(() => _pendingSentContents.delete(normalizeChatContent(text)), PENDING_SENT_TTL);
    (_c = cleanupTimer == null ? void 0 : cleanupTimer.unref) == null ? void 0 : _c.call(cleanupTimer);
    common_vendor.nextTick$1(() => scrollToBottom());
    function buildCommentContext() {
      var _a2, _b2, _c2, _d, _e;
      const customerId = Number((myUserId == null ? void 0 : myUserId.value) || ((_a2 = userStore.userInfo) == null ? void 0 : _a2.customerId) || ((_b2 = userStore.userInfo) == null ? void 0 : _b2.customer_id) || ((_c2 = userStore.userInfo) == null ? void 0 : _c2.id) || ((_d = userStore.userInfo) == null ? void 0 : _d.userId) || ((_e = userStore.userInfo) == null ? void 0 : _e.user_id) || 0);
      const termId = typeof getEffectiveTermId === "function" ? Number(getEffectiveTermId() || 0) : 0;
      return {
        roomCode: (roomCode == null ? void 0 : roomCode.value) || "",
        room_code: (roomCode == null ? void 0 : roomCode.value) || "",
        tenantId: (liveTenantId == null ? void 0 : liveTenantId.value) || "",
        tenant_id: (liveTenantId == null ? void 0 : liveTenantId.value) || "",
        shareCode: (shareCode == null ? void 0 : shareCode.value) || "",
        share_code: (shareCode == null ? void 0 : shareCode.value) || "",
        bindId: (liveBindId == null ? void 0 : liveBindId.value) || "",
        bind_id: (liveBindId == null ? void 0 : liveBindId.value) || "",
        liveType: isReplay.value ? "replay" : "live",
        live_type: isReplay.value ? "replay" : "live",
        termId,
        term_id: termId,
        customerId,
        customer_id: customerId,
        userId: customerId,
        user_id: customerId,
        nickname: myNick,
        nick: myNick,
        userName: myNick,
        user_name: myNick,
        customerName: myNick,
        customer_name: myNick,
        avatar: myAvatar,
        headImg: myAvatar,
        head_img: myAvatar,
        avatarUrl: myAvatar,
        avatar_url: myAvatar
      };
    }
    async function trySend() {
      const sock = getLiveSocket();
      if (!sock || typeof sock.sendChat !== "function")
        return false;
      const context = buildCommentContext();
      if (isReplay.value && replayCurrentVideoId.value) {
        const timelineSeconds = Number(replayLastTime.value || 0);
        const replayVideoId = Number(replayCurrentVideoId.value);
        return sock.sendChat(text, {
          ...context,
          timelineSeconds,
          timeline_seconds: timelineSeconds,
          replayVideoId,
          replay_video_id: replayVideoId,
          videoId: replayVideoId,
          video_id: replayVideoId
        }, { msgId: clientMsgId });
      }
      return sock.sendChat(text, context, { msgId: clientMsgId });
    }
    async function trySendByHttp() {
      if (typeof sendLiveComment !== "function")
        return false;
      const data = {
        ...buildCommentContext(),
        msgId: clientMsgId,
        msg_id: clientMsgId,
        clientMsgId,
        client_msg_id: clientMsgId
      };
      if (isReplay.value && replayCurrentVideoId.value) {
        const timelineSeconds = Number(replayLastTime.value || 0);
        const replayVideoId = Number(replayCurrentVideoId.value);
        data.timelineSeconds = timelineSeconds;
        data.timeline_seconds = timelineSeconds;
        data.replayVideoId = replayVideoId;
        data.replay_video_id = replayVideoId;
        data.videoId = replayVideoId;
        data.video_id = replayVideoId;
      }
      const response = await sendLiveComment(liveId.value, text, data);
      const payload = getCommentData(response || {});
      upgradeOptimisticMessage({
        nick: payload.nickname || payload.nick || myNick,
        content: payload.content || payload.comment || text,
        avatar: payload.avatar || myAvatar,
        commentId: getCommentId(payload),
        msgId: normalizeMessageId(payload) || clientMsgId,
        seq: payload.seq,
        isTop: Number(payload.isTop || 0)
      }, { allowSinglePendingFallback: true });
      return true;
    }
    let sent = false;
    _sendingMessage = true;
    try {
      const delays = [0, 200, 400, 600];
      for (let i = 0; i < delays.length; i++) {
        if (delays[i] > 0) {
          await new Promise((r) => setTimeout(r, delays[i]));
        }
        try {
          const result = await trySend();
          if (result !== false) {
            sent = true;
            break;
          }
        } catch (err) {
          console.error("[Live] send chat fail:", err);
        }
      }
      if (!sent) {
        try {
          sent = await trySendByHttp();
        } catch (err) {
          console.error("[Live] send chat HTTP fallback fail:", err);
        }
      }
    } finally {
      _sendingMessage = false;
    }
    if (sent === false) {
      removeOptimisticMessage(tempId, clientMsgId);
      _pendingSentContents.delete(normalizeChatContent(text));
      common_vendor.index.showToast({ title: "消息发送失败，请稍后重试", icon: "none" });
      return false;
    }
    if (!fromQuickReply) {
      inputText.value = "";
      inputFocused.value = false;
      keyboardHeight.value = 0;
      blurInput();
    }
    common_vendor.nextTick$1(() => common_vendor.nextTick$1(() => scrollToBottom()));
    return true;
  }
  function isPendingSentContent(content) {
    return _pendingSentContents.has(normalizeChatContent(content));
  }
  function upgradeOptimisticMessage(realMsg, options = {}) {
    if (!realMsg || !realMsg.content)
      return false;
    const allowSinglePendingFallback = options.allowSinglePendingFallback !== false;
    const realMsgId = normalizeMessageId(realMsg);
    const realContent = normalizeChatContent(realMsg.content);
    let msgIdMatchIndex = -1;
    let pendingCount = 0;
    let onlyPendingIndex = -1;
    let contentMatchIndex = -1;
    for (let i = messages.value.length - 1; i >= 0; i--) {
      const m2 = messages.value[i];
      if (!isPendingChatMessage(m2))
        continue;
      pendingCount += 1;
      onlyPendingIndex = i;
      const localMsgId = normalizeMessageId(m2);
      if (realMsgId && localMsgId && realMsgId === localMsgId) {
        msgIdMatchIndex = i;
        break;
      }
      if (contentMatchIndex < 0 && realContent && normalizeChatContent(m2.content) === realContent) {
        contentMatchIndex = i;
      }
    }
    let pendingIndex = -1;
    if (msgIdMatchIndex >= 0) {
      pendingIndex = msgIdMatchIndex;
    } else if (contentMatchIndex >= 0) {
      pendingIndex = contentMatchIndex;
    } else if (allowSinglePendingFallback && pendingCount === 1) {
      pendingIndex = onlyPendingIndex;
    }
    if (pendingIndex < 0)
      return false;
    const m = messages.value[pendingIndex];
    const nextMessage = {
      type: "chat",
      nick: m.nick,
      content: m.content,
      avatar: m.avatar || realMsg.avatar,
      commentId: getCommentId(realMsg),
      msgId: realMsg.msgId || m.msgId,
      isTop: Number(realMsg.isTop || 0),
      isAdmin: !!realMsg.isAdmin
    };
    messages.value[pendingIndex] = nextMessage;
    syncPinnedMessageAfterReplace(nextMessage, m);
    _pendingSentContents.delete(normalizeChatContent(m.content));
    return true;
  }
  function handleSendClick(overrideText) {
    return sendMessage(overrideText);
  }
  async function loadCommentHistory() {
    var _a, _b, _c, _d, _e;
    if (!liveId.value)
      return;
    const shouldUseReplayTimeline = !!(isReplay.value && replayCurrentVideoId.value);
    if (!shouldUseReplayTimeline && roomGroupType.value === 0 && pushStatus.value !== 1) {
      if (!(liveStatusText.value === "回放" && hasReplay.value))
        return;
    }
    const seekTime = Number(replayLastTime.value || 0);
    const customerId = Number((myUserId == null ? void 0 : myUserId.value) || ((_a = userStore.userInfo) == null ? void 0 : _a.customerId) || ((_b = userStore.userInfo) == null ? void 0 : _b.customer_id) || ((_c = userStore.userInfo) == null ? void 0 : _c.id) || ((_d = userStore.userInfo) == null ? void 0 : _d.userId) || ((_e = userStore.userInfo) == null ? void 0 : _e.user_id) || 0);
    const termId = typeof getEffectiveTermId === "function" ? Number(getEffectiveTermId() || 0) : 0;
    try {
      const list = await getCommentHistory(
        liveId.value,
        shouldUseReplayTimeline ? 200 : 30,
        replayCurrentVideoId.value,
        {
          roomCode: (roomCode == null ? void 0 : roomCode.value) || "",
          room_code: (roomCode == null ? void 0 : roomCode.value) || "",
          termId,
          term_id: termId,
          customerId,
          customer_id: customerId,
          userId: customerId,
          user_id: customerId,
          replayVideoId: Number(replayCurrentVideoId.value || 0),
          replay_video_id: Number(replayCurrentVideoId.value || 0),
          videoId: Number(replayCurrentVideoId.value || 0),
          video_id: Number(replayCurrentVideoId.value || 0)
        }
      );
      if (shouldUseReplayTimeline) {
        replayCommentTimeline.value = Array.isArray(list) && list.length > 0 ? list.map((item) => {
          const payload = getCommentData(item);
          return {
            type: "chat",
            nick: formatLiveNickname(payload.nickname || payload.nick),
            content: getCommentContent(payload),
            avatar: payload.avatar || defaultAvatar,
            commentId: getCommentId(payload),
            msgId: normalizeMessageId(payload),
            seq: payload.seq,
            isTop: Number(payload.isTop || 0),
            timelineSeconds: getTimelineSeconds(payload),
            replayVideoId: getReplayVideoId(payload)
          };
        }) : [];
        replayCommentTimeline.value.sort(
          (a, b) => Number(a.timelineSeconds || 0) - Number(b.timelineSeconds || 0)
        );
        replaceReplayMessagesAt(seekTime);
        return;
      }
      if (roomGroupType.value === 0 && Array.isArray(list) && list.length > 0) {
        const mapped = list.map((item) => {
          const payload = getCommentData(item);
          return {
            type: "chat",
            nick: formatLiveNickname(payload.nickname || payload.nick),
            content: getCommentContent(payload),
            avatar: payload.avatar || defaultAvatar,
            commentId: getCommentId(payload),
            msgId: normalizeMessageId(payload),
            seq: payload.seq,
            isTop: Number(payload.isTop || 0)
          };
        });
        messages.value.splice(0, messages.value.length, ...mapped);
        refreshPinnedMessage();
      } else {
        messages.value.splice(0, messages.value.length);
        refreshPinnedMessage();
      }
      common_vendor.nextTick$1(() => scrollToBottom());
    } catch (err) {
      console.error("[Live] loadCommentHistory fail:", err);
    }
  }
  function enqueueReplayComments(comments) {
    replayCommentQueue.value.push(...comments);
    if (!_commentQueueTimer) {
      processCommentQueue();
    }
  }
  function processCommentQueue() {
    if (replayCommentQueue.value.length === 0) {
      _commentQueueTimer = null;
      return;
    }
    const comment = replayCommentQueue.value.shift();
    appendReplayComment(comment);
    const delay = 400 + Math.floor(Math.random() * 800);
    _commentQueueTimer = setTimeout(processCommentQueue, delay);
  }
  function clearCommentQueue() {
    replayCommentQueue.value = [];
    if (_commentQueueTimer) {
      clearTimeout(_commentQueueTimer);
      _commentQueueTimer = null;
    }
  }
  function appendReplayComment(comment) {
    if (hasVisibleChatMessage(comment))
      return;
    const shouldFollow = shouldFollowLatestCommentWindow();
    const nextMessage = {
      type: "chat",
      nick: comment.nick || "匿名",
      content: comment.content || "",
      avatar: comment.avatar || defaultAvatar,
      commentId: comment.commentId,
      msgId: comment.msgId,
      seq: comment.seq,
      isTop: Number(comment.isTop || 0)
    };
    messages.value.push(nextMessage);
    syncPinnedMessageFromAdded(nextMessage);
    if (shouldFollow)
      common_vendor.nextTick$1(() => scrollToBottom());
  }
  function hasVisibleChatMessage(comment) {
    const commentId = Number((comment == null ? void 0 : comment.commentId) || 0);
    return hasEquivalentMessage(messages.value, { ...comment, commentId }, { contentPendingOnly: true });
  }
  function toReplayVisibleMessage(item) {
    return {
      type: "chat",
      nick: item.nick || "匿名",
      content: item.content || "",
      avatar: item.avatar || defaultAvatar,
      commentId: item.commentId,
      msgId: item.msgId,
      seq: item.seq,
      isTop: Number(item.isTop || 0)
    };
  }
  function replaceReplayMessagesAt(currentSeconds = 0) {
    const targetSeconds = Number(currentSeconds || 0);
    replayCommentCursor.value = 0;
    clearCommentQueue();
    const pastMessages = [];
    const pendingMessages = messages.value.filter(isPendingChatMessage);
    const seenCommentIds = /* @__PURE__ */ new Set();
    const seenFallbackKeys = /* @__PURE__ */ new Set();
    while (replayCommentCursor.value < replayCommentTimeline.value.length) {
      const item = replayCommentTimeline.value[replayCommentCursor.value];
      if (Number(item.timelineSeconds || 0) > targetSeconds)
        break;
      const commentId = Number(item.commentId || 0);
      const seq = normalizeMessageSeq(item);
      const msgId = normalizeMessageId(item);
      const fallbackKey = `${Number(item.replayVideoId || 0)}:${Number(item.timelineSeconds || 0)}:${normalizeChatContent(item.content)}`;
      if (seq > 0) {
        const seqKey = `seq:${seq}`;
        if (!seenFallbackKeys.has(seqKey)) {
          seenFallbackKeys.add(seqKey);
          pastMessages.push(toReplayVisibleMessage(item));
        }
      } else if (commentId > 0) {
        if (!seenCommentIds.has(commentId)) {
          seenCommentIds.add(commentId);
          pastMessages.push(toReplayVisibleMessage(item));
        }
      } else if (msgId) {
        const msgKey = `msg:${msgId}`;
        if (!seenFallbackKeys.has(msgKey)) {
          seenFallbackKeys.add(msgKey);
          pastMessages.push(toReplayVisibleMessage(item));
        }
      } else if (!seenFallbackKeys.has(fallbackKey)) {
        seenFallbackKeys.add(fallbackKey);
        pastMessages.push(toReplayVisibleMessage(item));
      }
      replayCommentCursor.value += 1;
    }
    const preservedPendingMessages = pendingMessages.filter(
      (message) => !hasEquivalentMessage(pastMessages, message)
    );
    messages.value.splice(0, messages.value.length, ...pastMessages, ...preservedPendingMessages);
    refreshPinnedMessage();
    common_vendor.nextTick$1(() => scrollToBottom());
  }
  function syncReplayCommentCursor(currentSeconds) {
    let idx = 0;
    while (idx < replayCommentTimeline.value.length && Number(replayCommentTimeline.value[idx].timelineSeconds || 0) <= currentSeconds) {
      idx += 1;
    }
    replayCommentCursor.value = idx;
  }
  return {
    scrollToId,
    commentScrollWithAnimation,
    messages,
    visibleMessages,
    currentCommentIndex,
    pinnedMessage,
    refreshPinnedMessage,
    replayCommentTimeline,
    replayCommentCursor,
    shouldShowComments,
    canAppendLiveMessages,
    formatLiveNickname,
    scrollToBottom,
    shouldFollowLatestCommentWindow,
    handleCommentWindowScroll,
    loadPreviousCommentWindow,
    loadNextCommentWindow,
    appendSystemMessage,
    sendMessage,
    handleSendClick,
    loadCommentHistory,
    enqueueReplayComments,
    clearCommentQueue,
    appendReplayComment,
    replaceReplayMessagesAt,
    syncReplayCommentCursor,
    hasVisibleChatMessage,
    isPendingSentContent,
    upgradeOptimisticMessage
  };
}
exports.useLiveComments = useLiveComments;
