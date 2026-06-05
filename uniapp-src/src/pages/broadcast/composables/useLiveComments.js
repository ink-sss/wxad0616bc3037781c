import { computed, nextTick, ref, watch } from "vue";

const COMMENT_CORE_RADIUS = 4;
const COMMENT_OVERSCAN = 4;
const COMMENT_RENDER_RADIUS = COMMENT_CORE_RADIUS + COMMENT_OVERSCAN;
const COMMENT_DOM_LIMIT = COMMENT_RENDER_RADIUS * 2 + 1;
const COMMENT_SCROLL_EDGE_PX = 72;

/**
 * 直播/录播评论状态与发送逻辑。
 * 职责边界：维护消息列表、评论历史、录播评论时间线和发送入口；WebSocket 消息分发在 useLiveWsMessageHandler。
 */
export function useLiveComments({
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
  userStore,
  roomCode,
  liveTenantId,
  shareCode,
  liveBindId,
  getEffectiveTermId,
  myUserId,
}) {
  const scrollToId = ref("");
  const commentScrollWithAnimation = ref(true);
  const messages = ref([]);
  const currentCommentIndex = ref(0);
  const replayCommentTimeline = ref([]);
  const replayCommentCursor = ref(0);
  const replayCommentQueue = ref([]);
  let _commentQueueTimer = null;
  let _sendingMessage = false;
  let _lastCommentScrollTop = 0;
  // 乐观发送去重：记录最近发送的消息内容，用于 isOwnMessage 中 myUserId=0 时的兜底匹配
  const _pendingSentContents = new Set();
  const PENDING_SENT_TTL = 15000; // 15s 后自动清理，防止内存泄漏

  function normalizeChatContent(content) {
    return String(content || "").trim();
  }

  function normalizeMessageId(message = {}) {
    return String(
      message._clientMsgId ||
        message.msgId ||
        message.msg_id ||
        message.clientMsgId ||
        message.client_msg_id ||
        "",
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
      payload.timelineSeconds ||
        payload.timeline_seconds ||
        payload.timeLineSeconds ||
        payload.playSeconds ||
        payload.play_seconds ||
        payload.commentSeconds ||
        payload.comment_seconds ||
        payload.commentTime ||
        payload.comment_time ||
        payload.time ||
        0,
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
      if (!isPendingChatMessage(item)) return false;
      if (tempId && item._tempId === tempId) return true;
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
    const commentId = Number(message?.commentId || 0);
    const content = normalizeChatContent(message?.content);
    return list.some((item) => {
      if (messageSeq > 0 && normalizeMessageSeq(item) === messageSeq) return true;
      if (commentId > 0 && Number(item.commentId || 0) === commentId) return true;
      const itemMessageId = normalizeMessageId(item);
      if (messageId && itemMessageId && itemMessageId === messageId) return true;
      if (options.contentPendingOnly && !isPendingChatMessage(item)) return false;
      return content && normalizeChatContent(item.content) === content;
    });
  }

  const shouldShowComments = computed(() => {
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
    if (total <= 0) return 0;
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

  const visibleMessages = computed(() => {
    const start = getVisibleCommentStart();
    const end = getVisibleCommentEnd(start);
    return messages.value
      .slice(start, end)
      .map((message, index) => ({
        ...message,
        _visibleIndex: start + index,
      }));
  });

  watch(
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
    { flush: "sync" },
  );

  /** 当前置顶消息（同一时刻最多一条） */
  // 主动维护的 ref：新增、删除、置顶状态变化时显式同步，避免 deep watch 扫描整组评论。
  const pinnedMessage = ref(null);
  function isPinnedComment(message) {
    return Number(message?.isTop || 0) === 1;
  }
  function syncPinnedMessageFromAdded(message) {
    if (!isPinnedComment(message)) return;
    messages.value.forEach((item) => {
      if (item !== message) item.isTop = 0;
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
    return true;  //!!videoUrl.value && (isReplay.value ? isPlaying.value : true);
  }

  function formatLiveNickname(nickname) {
    const raw = String(nickname || "匿名").trim();
    if (!raw) {
      return "匿名";
    }
    if (Number(roomSetting.value.encryptNickname || 0) === 1) {
      return raw;
    }
    // 脱敏规则：首字 + *** + 尾字（使用 Array.from 以正确处理 emoji / 4 字节 unicode）
    const chars = Array.from(raw);
    if (chars.length <= 1) return raw; // 单字不脱敏
    if (chars.length === 2) return `${chars[0]}*${chars[1]}`; // 双字中间仅一个 *
    return `${chars[0]}***${chars[chars.length - 1]}`;
  }

  function scrollToBottom() {
    if (messages.value.length === 0) return;
    syncLatestCommentWindow();
    const target = "msg-" + (messages.value.length - 1);
    // scroll-view 的 :scroll-into-view 只在值"变化"时滚动；
    // 用户发送后乐观消息已 push、WS 回执只是原地升级，length 不变会导致目标 id 相同。
    // 先清空再 nextTick 重设，强制触发一次变更。
    scrollToId.value = "";
    nextTick(() => {
      commentScrollWithAnimation.value = true;
      scrollToId.value = target;
    });
  }

  function scrollToCommentIndex(index, withAnimation = true) {
    const normalizedIndex = Math.max(0, Number(index || 0));
    commentScrollWithAnimation.value = withAnimation;
    scrollToId.value = "";
    nextTick(() => {
      scrollToId.value = "msg-" + normalizedIndex;
      if (!withAnimation) {
        nextTick(() => {
          commentScrollWithAnimation.value = true;
        });
      }
    });
  }

  function loadPreviousCommentWindow(anchorIndex = visibleMessages.value[0]?._visibleIndex) {
    const currentIndex = normalizeCommentIndex();
    if (currentIndex <= 0) return false;
    currentCommentIndex.value = currentIndex - 1;
    scrollToCommentIndex(anchorIndex ?? currentCommentIndex.value, false);
    return true;
  }

  function loadNextCommentWindow(anchorIndex = visibleMessages.value[visibleMessages.value.length - 1]?._visibleIndex) {
    const currentIndex = normalizeCommentIndex();
    const latestIndex = getLatestCommentIndex();
    if (currentIndex >= latestIndex) return false;
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
    if (!text || !canAppendLiveMessages()) return;
    const shouldFollow = shouldFollowLatestCommentWindow();
    const nextMessage = { ...message, type: message.type || "system", nick: message.nick || "", content: text };
    messages.value.push(nextMessage);
    syncPinnedMessageFromAdded(nextMessage);
    if (shouldFollow) nextTick(() => scrollToBottom());
  }

  /**
   * 发送聊天消息。
   * @param {string} [overrideText] 可选：直接发送该文本（快捷回复场景），跳过输入框取值与清空。
   */
  async function sendMessage(overrideText) {
    if (chatDisabled.value) {
      uni.showToast({ title: chatDisabled.value, icon: "none" });
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
    const liveSocket = getLiveSocket();
    if (!liveSocket || typeof liveSocket.sendChat !== "function") {
      uni.showToast({ title: "消息发送失败，请稍后重试", icon: "none" });
      return false;
    }
    const myNick = userStore.userInfo?.nickname || "我";
    const myAvatar = userStore.userInfo?.avatar || defaultAvatar;
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const clientMsgId = createLocalMessageId();
    messages.value.push({
      type: "chat",
      nick: myNick,
      content: text,
      avatar: myAvatar,
      _tempId: tempId,
      _clientMsgId: clientMsgId,
      msgId: clientMsgId,
    });
    // 记录最近发送内容，用于 myUserId 尚未加载时的兜底去重；15s 后自动清理
    _pendingSentContents.add(normalizeChatContent(text));
    const cleanupTimer = setTimeout(() => _pendingSentContents.delete(normalizeChatContent(text)), PENDING_SENT_TTL);
    cleanupTimer?.unref?.();
    nextTick(() => scrollToBottom());

    // WS 重连窗口期 _isOpen 短暂为 false → _send 立即返回 false。
    // 这里加一次最长 1.2s 的指数退避重试，避免重连瞬间用户感知到"发送失败"。
    async function trySend() {
      const sock = getLiveSocket();
      if (!sock || typeof sock.sendChat !== "function") return false;
      if (isReplay.value && replayCurrentVideoId.value) {
        const timelineSeconds = Number(replayLastTime.value || 0);
        const replayVideoId = Number(replayCurrentVideoId.value);
        return sock.sendChat(text, {
          timelineSeconds,
          replayVideoId,
        }, { msgId: clientMsgId });
      }
      return sock.sendChat(text, undefined, { msgId: clientMsgId });
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
    } finally {
      _sendingMessage = false;
    }
    if (sent === false) {
      removeOptimisticMessage(tempId, clientMsgId);
      _pendingSentContents.delete(normalizeChatContent(text));
      uni.showToast({ title: "消息发送失败，请稍后重试", icon: "none" });
      return false;
    }
    // 快捷回复不涉及输入框状态，跳过清空/失焦逻辑
    if (!fromQuickReply) {
      inputText.value = "";
      inputFocused.value = false;
      keyboardHeight.value = 0;
      blurInput();
    }
    // 双 nextTick：等输入框 blur 收起、聊天区高度重新测量后再滚动
    nextTick(() => nextTick(() => scrollToBottom()));
    return true;
  }
  /** 检查是否为待替换的乐观消息（供 handleChatMessage 调用） */
  function isPendingSentContent(content) {
    return _pendingSentContents.has(normalizeChatContent(content));
  }
  /** 用 WS 回执的真实数据升级乐观消息条目（_tempId → commentId） */
  function upgradeOptimisticMessage(realMsg, options = {}) {
    if (!realMsg || !realMsg.content) return false;
    const allowSinglePendingFallback = options.allowSinglePendingFallback !== false;
    const realMsgId = normalizeMessageId(realMsg);
    const realContent = normalizeChatContent(realMsg.content);
    let msgIdMatchIndex = -1;
    let pendingCount = 0;
    let onlyPendingIndex = -1;
    let contentMatchIndex = -1;
    for (let i = messages.value.length - 1; i >= 0; i--) {
      const m = messages.value[i];
      if (!isPendingChatMessage(m)) continue;
      pendingCount += 1;
      onlyPendingIndex = i;
      const localMsgId = normalizeMessageId(m);
      if (realMsgId && localMsgId && realMsgId === localMsgId) {
        msgIdMatchIndex = i;
        break;
      }
      if (contentMatchIndex < 0 && realContent && normalizeChatContent(m.content) === realContent) {
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
    if (pendingIndex < 0) return false;
    const m = messages.value[pendingIndex];
    const nextMessage = {
      type: "chat",
      nick: m.nick,
      content: m.content,
      avatar: m.avatar || realMsg.avatar,
      commentId: getCommentId(realMsg),
      msgId: realMsg.msgId || m.msgId,
      isTop: Number(realMsg.isTop || 0),
      isAdmin: !!realMsg.isAdmin,
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
    if (!liveId.value) return;
    const shouldUseReplayTimeline = !!(isReplay.value && replayCurrentVideoId.value);
    // 直播模式下仅推流中(pushStatus===1)或回放状态(liveStatusText=="回放"且hasReplay)才加载历史评论。
    // 直播入口结束后切到回放时 roomGroupType 仍可能是 0，此时以 isReplay 为准走录播时间线。
    if (!shouldUseReplayTimeline && roomGroupType.value === 0 && pushStatus.value !== 1) {
      if (!(liveStatusText.value === '回放' && hasReplay.value)) return;
    }
    // 快照 API 调用前的播放位置（await 期间 replayLastTime 会被 onVideoTimeUpdate 推进）
    const seekTime = Number(replayLastTime.value || 0);
    try {
      const list = await getCommentHistory(
        liveId.value,
        shouldUseReplayTimeline ? 200 : 30,
        replayCurrentVideoId.value,
      );
      if (shouldUseReplayTimeline) {
        replayCommentTimeline.value =
          Array.isArray(list) && list.length > 0
            ? list.map((item) => {
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
                  replayVideoId: getReplayVideoId(payload),
                };
              })
            : [];
        replayCommentTimeline.value.sort(
          (a, b) =>
            Number(a.timelineSeconds || 0) - Number(b.timelineSeconds || 0),
        );
        // 使用快照 seekTime 而非实时 replayLastTime，避免 API 延迟期间积攒的评论被一次性倒出
        // seekTime 之前的评论属于“断点续播上下文”，直接显示；之后的交给 onVideoTimeUpdate 走队列逐条弹出
        replaceReplayMessagesAt(seekTime);
        return;
      }
      // 直播模式：将历史评论映射为 UI 消息格式
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
            isTop: Number(payload.isTop || 0),
          };
        });
        // 使用 splice 原地变异，避免 reactive 解包后子组件丢失引用
        messages.value.splice(0, messages.value.length, ...mapped);
        refreshPinnedMessage();
      } else {
        messages.value.splice(0, messages.value.length);
        refreshPinnedMessage();
      }
      nextTick(() => scrollToBottom());
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
    // 随机 0.4~1.2 秒间隔，模拟真人打字节奏（更贴近真实直播间发言频率）
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
    if (hasVisibleChatMessage(comment)) return;
    const shouldFollow = shouldFollowLatestCommentWindow();
    const nextMessage = {
      type: "chat",
      nick: comment.nick || "匿名",
      content: comment.content || "",
      avatar: comment.avatar || defaultAvatar,
      commentId: comment.commentId,
      msgId: comment.msgId,
      seq: comment.seq,
      isTop: Number(comment.isTop || 0),
    };
    messages.value.push(nextMessage);
    syncPinnedMessageFromAdded(nextMessage);
    if (shouldFollow) nextTick(() => scrollToBottom());
  }

  function hasVisibleChatMessage(comment) {
    const commentId = Number(comment?.commentId || 0);
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
      isTop: Number(item.isTop || 0),
    };
  }

  function replaceReplayMessagesAt(currentSeconds = 0) {
    const targetSeconds = Number(currentSeconds || 0);
    replayCommentCursor.value = 0;
    clearCommentQueue();
    const pastMessages = [];
    const pendingMessages = messages.value.filter(isPendingChatMessage);
    const seenCommentIds = new Set();
    const seenFallbackKeys = new Set();
    while (replayCommentCursor.value < replayCommentTimeline.value.length) {
      const item = replayCommentTimeline.value[replayCommentCursor.value];
      if (Number(item.timelineSeconds || 0) > targetSeconds) break;
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
      (message) => !hasEquivalentMessage(pastMessages, message),
    );
    // 使用 splice 原地变异，避免 reactive 解包后子组件丢失引用
    messages.value.splice(0, messages.value.length, ...pastMessages, ...preservedPendingMessages);
    refreshPinnedMessage();
    nextTick(() => scrollToBottom());
  }

  function syncReplayCommentCursor(currentSeconds) {
    let idx = 0;
    while (
      idx < replayCommentTimeline.value.length &&
      Number(replayCommentTimeline.value[idx].timelineSeconds || 0) <=
        currentSeconds
    ) {
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
    upgradeOptimisticMessage,
  };
}
