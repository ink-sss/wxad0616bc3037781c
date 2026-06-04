"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_videoPlay = require("../../../utils/videoPlay.js");
const pages_broadcast_utils_entryFormat = require("../utils/entry-format.js");
const pages_broadcast_composables_useReplaySimOrders = require("./useReplaySimOrders.js");
function useLiveReplayPlayback(ctx) {
  const {
    replayFutureStartTimerRef,
    replayVideosList,
    replayCurrentIndex,
    replayCurrentVideoId,
    replayLoopPlay,
    replayLastTime,
    isReplay,
    isPlaying,
    pullUrl,
    videoUrl,
    replayProductSchedule,
    scheduleExplainActiveId,
    messages,
    clearCommentQueue,
    refreshPinnedMessage = () => {
    },
    productList,
    showProduct,
    explainingProductId,
    currentProduct,
    getVideoPlayer,
    setVideoPlayer,
    getLiveVideoElement,
    initVideoPlayer,
    loadCommentHistory,
    loadCurrentProduct,
    currentVideoPoster,
    liveCover,
    isMuted,
    liveId,
    roomCode,
    liveTenantId,
    shareCode,
    liveBindId,
    myUserId,
    roomGroupType,
    roomWatchByDay,
    pushStatus,
    stopHeartbeat,
    persistReplayProgress,
    roomCurrentTermId,
    syncLiveMiniWindowState,
    syncReplayCommentCursor,
    enqueueReplayComments,
    replayCommentCursor,
    replayCommentTimeline,
    replaceReplayMessagesAt,
    getSavedStorage,
    setSavedStorage,
    mapProductItem,
    syncProductCardIndex,
    pullUrlRef,
    reportViewProgressApi,
    incrementProductHotOrder,
    showBuyingNotice,
    formatLiveNickname,
    scheduleExplainTimerRef,
    getScheduleExplainTimer,
    setScheduleExplainTimer,
    setVideoDebugInfo,
    setVideoDebugActualCaptured,
    getVideoDebugActualCaptured,
    videoDebugInfo,
    videoFrameReady,
    quickReplies
  } = ctx;
  const { loadSimMessages, resetSimMessages, consumeSimOrders, syncSimCursor } = pages_broadcast_composables_useReplaySimOrders.useReplaySimOrders();
  let _lastSavedProgress = 0;
  let _seekTarget = 0;
  let _endedFallbackTimer = null;
  let _srcSwitchGuard = false;
  let _seekVerifyTimer = null;
  let replayLoopStartTime = 0;
  function buildReplaySimContext(video = {}) {
    const roomId = Number((liveId == null ? void 0 : liveId.value) || 0);
    const tenantId = Number((liveTenantId == null ? void 0 : liveTenantId.value) || 0);
    const termId = Number(video.termId || (roomCurrentTermId == null ? void 0 : roomCurrentTermId.value) || 0);
    const customerId = Number((myUserId == null ? void 0 : myUserId.value) || 0);
    return {
      roomId,
      room_id: roomId,
      liveId: roomId,
      live_id: roomId,
      roomCode: (roomCode == null ? void 0 : roomCode.value) || "",
      room_code: (roomCode == null ? void 0 : roomCode.value) || "",
      tenantId,
      tenant_id: tenantId,
      shareCode: (shareCode == null ? void 0 : shareCode.value) || "",
      share_code: (shareCode == null ? void 0 : shareCode.value) || "",
      bindId: (liveBindId == null ? void 0 : liveBindId.value) || "",
      bind_id: (liveBindId == null ? void 0 : liveBindId.value) || "",
      termId,
      term_id: termId,
      liveTermId: termId,
      live_term_id: termId,
      customerId,
      customer_id: customerId,
      userId: customerId,
      user_id: customerId,
      liveType: "replay",
      live_type: "replay"
    };
  }
  function clearMessages() {
    messages.value = [];
    refreshPinnedMessage();
  }
  function _verifySeekResult(el, targetSeconds, maxRetries = 5) {
    if (_seekVerifyTimer) {
      clearTimeout(_seekVerifyTimer);
      _seekVerifyTimer = null;
    }
    let retries = 0;
    const check = () => {
      if (!el || !el.parentNode) {
        _seekVerifyTimer = null;
        return;
      }
      const actual = Number(el.currentTime || 0);
      const tolerance = 3;
      if (actual >= targetSeconds - tolerance && actual <= targetSeconds + tolerance) {
        _seekTarget = 0;
        _seekVerifyTimer = null;
        return;
      }
      if (retries >= maxRetries) {
        console.warn(`[Live][断点] seek 验证最终放弃 ❌ 期望:${targetSeconds} 实际:${actual.toFixed(1)}`);
        _seekTarget = 0;
        _seekVerifyTimer = null;
        return;
      }
      retries++;
      console.warn(`[Live][断点] seek 未生效，第${retries}次重试 期望:${targetSeconds} 实际:${actual.toFixed(1)} readyState:${el.readyState}`);
      try {
        el.currentTime = targetSeconds;
      } catch (e) {
      }
      _seekVerifyTimer = setTimeout(check, 300 + retries * 100);
    };
    _seekVerifyTimer = setTimeout(check, 300);
  }
  function stopReplayFutureStartTimer() {
    if (replayFutureStartTimerRef.value) {
      clearTimeout(replayFutureStartTimerRef.value);
      replayFutureStartTimerRef.value = null;
    }
  }
  function getReplayVideoSchedule(now = Date.now(), startIdx = 0) {
    let activeIdx = -1;
    let activeSeekSeconds = 0;
    let futureIdx = -1;
    let futureStart = Infinity;
    for (let i = Math.max(startIdx, 0); i < replayVideosList.value.length; i++) {
      const video = replayVideosList.value[i];
      const videoStart = pages_broadcast_utils_entryFormat.safeParseReplayTime(video.startTime);
      const videoEnd = pages_broadcast_utils_entryFormat.getReplayVideoEndTime(video, videoStart);
      if (videoStart && videoEnd && now >= videoStart && now < videoEnd) {
        activeIdx = i;
        activeSeekSeconds = Math.floor((now - videoStart) / 1e3);
        break;
      }
      if (video.loopPlay === 1 && videoStart && now >= videoStart && (!videoEnd || now < videoEnd)) {
        activeIdx = i;
        activeSeekSeconds = video.duration ? Math.floor((now - videoStart) / 1e3 % video.duration) : 0;
        break;
      }
      if (videoStart > now && videoStart < futureStart) {
        futureStart = videoStart;
        futureIdx = i;
      }
    }
    return {
      activeIdx,
      activeSeekSeconds,
      futureIdx,
      futureStart
    };
  }
  function resetReplayContext() {
    stopReplayFutureStartTimer();
    clearCommentQueue();
    replayCommentTimeline.value = [];
    replayCommentCursor.value = 0;
    replayCurrentVideoId.value = 0;
    replayLoopPlay.value = false;
    replayLastTime.value = 0;
    clearMessages();
    isReplay.value = false;
    _lastSavedProgress = 0;
    replayProductSchedule.resetScheduleState();
    scheduleExplainActiveId.value = 0;
  }
  function enterReplayPendingState(idx) {
    replayCurrentIndex.value = idx;
    replayCurrentVideoId.value = 0;
    replayLoopPlay.value = false;
    replayLastTime.value = 0;
    pullUrl.value = "";
    videoUrl.value = "";
    isPlaying.value = false;
    replayProductSchedule.resetScheduleState();
    scheduleExplainActiveId.value = 0;
  }
  function createReplaySeekAndPlay(existingEl, seekSeconds, needSeekFirstSwitch, origAutoplay) {
    return () => {
      if (seekSeconds > 0) {
        try {
          const currentPos = Number(existingEl.currentTime || 0);
          if (currentPos > 0 && seekSeconds <= currentPos) {
          } else {
            existingEl.currentTime = seekSeconds;
            _verifySeekResult(existingEl, seekSeconds, 5);
          }
        } catch (e) {
          console.warn("[Live] 切集 seek 失败:", e);
        }
      }
      const wantMuted = !!(getVideoPlayer() && getVideoPlayer().muted);
      existingEl.muted = wantMuted;
      const playPromise = existingEl.play && existingEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((err) => {
          console.warn("[Live] 切集播放失败，降级静音:", err);
          existingEl.muted = true;
          isMuted.value = true;
          if (getVideoPlayer())
            getVideoPlayer().muted = true;
          syncLiveMiniWindowState({ force: true });
          existingEl.play().catch(() => {
          });
        });
      }
    };
  }
  function waitReplayMediaReady(existingEl, isIOSEnvSwitch, trySeekAndPlay) {
    let triggered = false;
    let timeoutId = null;
    const onMediaReady = () => {
      if (triggered)
        return;
      triggered = true;
      _srcSwitchGuard = false;
      if (timeoutId)
        clearTimeout(timeoutId);
      existingEl.removeEventListener("loadeddata", onMediaReady);
      existingEl.removeEventListener("loadedmetadata", onMediaReady);
      trySeekAndPlay();
    };
    timeoutId = setTimeout(() => {
      if (triggered)
        return;
      triggered = true;
      _srcSwitchGuard = false;
      existingEl.removeEventListener("loadeddata", onMediaReady);
      existingEl.removeEventListener("loadedmetadata", onMediaReady);
      console.warn("[Live] 媒体就绪超时(3s)，直接尝试播放");
      trySeekAndPlay();
    }, 3e3);
    existingEl.addEventListener("loadedmetadata", onMediaReady);
    {
      existingEl.addEventListener("loadeddata", onMediaReady);
    }
  }
  function switchReplayPlayerSource(existingEl, playUrl, backupUrl, newProtocol) {
    _srcSwitchGuard = true;
    if (newProtocol === "native" && !backupUrl) {
      if (getVideoPlayer()._hlsInstance || getVideoPlayer()._flvPlayer) {
        getVideoPlayer()._destroyCurrentPlayer();
      }
      getVideoPlayer()._activeType = "native";
      existingEl.src = playUrl;
      return;
    }
    try {
      getVideoPlayer().switchUrl(playUrl, backupUrl);
    } catch (e) {
      console.error("[Live] switchUrl 失败，降级 native:", e);
      getVideoPlayer()._activeType = "native";
      existingEl.src = playUrl;
    }
  }
  function reuseReplayPlayerElement(existingEl, playUrl, backupUrl, seekSeconds, idx) {
    const newProtocol = typeof getVideoPlayer()._selectBestProtocol === "function" ? getVideoPlayer()._selectBestProtocol(playUrl) : "native";
    getVideoPlayer().url = playUrl;
    getVideoPlayer().backupUrl = backupUrl && backupUrl !== playUrl ? backupUrl : "";
    getVideoPlayer().live = false;
    getVideoPlayer()._retryCount = 0;
    getVideoPlayer()._triedBackupFlv = false;
    getVideoPlayer()._triedBackupHls = false;
    const isIOSEnvSwitch = false;
    getVideoPlayer().autoplay;
    const trySeekAndPlay = createReplaySeekAndPlay(existingEl, seekSeconds);
    waitReplayMediaReady(existingEl, isIOSEnvSwitch, trySeekAndPlay);
    switchReplayPlayerSource(existingEl, playUrl, backupUrl, newProtocol);
  }
  function prepareReplaySwitchState(video, idx, seekSeconds, playUrl, backupUrl) {
    videoDebugInfo.value = {
      intent: seekSeconds,
      actual: -1,
      source: seekSeconds > 0 ? "resume" : "fresh"
    };
    setVideoDebugActualCaptured(false);
    replayProductSchedule.resetScheduleState();
    scheduleExplainActiveId.value = 0;
    showProduct.value = false;
    explainingProductId.value = 0;
    currentProduct.value = {};
    productList.value = productList.value.map((p) => ({ ...p, isCurrent: false }));
    if (scheduleExplainTimerRef.value) {
      clearTimeout(scheduleExplainTimerRef.value);
      scheduleExplainTimerRef.value = null;
    }
    const isSameVideo = replayCurrentIndex.value === idx;
    replayCurrentIndex.value = idx;
    replayCurrentVideoId.value = video.id || 0;
    replayLoopPlay.value = video.loopPlay === 1;
    if (quickReplies)
      quickReplies.value = Array.isArray(video.quickReplies) ? video.quickReplies : [];
    loadCurrentProduct();
    if (isReplay.value && video.termId > 0) {
      roomCurrentTermId.value = video.termId;
      reportViewProgressApi({
        roomId: Number(liveId.value),
        termId: Number(video.termId),
        videoId: Number(video.id || 0),
        lastPosition: seekSeconds || 0,
        watchDuration: seekSeconds || 1,
        watchStatus: 1
      }).catch((e) => console.warn("[Live] reportViewProgressApi on switch fail:", e));
    }
    if (!isSameVideo || replayLoopStartTime === 0)
      replayLoopStartTime = replayLoopPlay.value ? Date.now() : 0;
    replayLastTime.value = seekSeconds;
    clearCommentQueue();
    replayCommentTimeline.value = [];
    replayCommentCursor.value = 0;
    if (video.id)
      loadSimMessages(video.id, seekSeconds, buildReplaySimContext(video));
    else
      resetSimMessages();
    _lastSavedProgress = seekSeconds;
    _seekTarget = seekSeconds;
    onVideoTimeUpdate._endedTriggered = false;
    if (_endedFallbackTimer) {
      clearTimeout(_endedFallbackTimer);
      _endedFallbackTimer = null;
    }
    clearMessages();
    pullUrl.value = playUrl;
    videoUrl.value = playUrl;
    syncLiveMiniWindowState({
      force: true,
      playUrl,
      backupUrl,
      isLive: false,
      isReplay: true,
      videoId: video.id || "",
      replayIndex: idx,
      currentTime: seekSeconds,
      poster: currentVideoPoster.value || video.coverImage || liveCover.value || ""
    });
  }
  function playReplayVideoByIndex(idx, seekSeconds = 0) {
    stopReplayFutureStartTimer();
    const video = replayVideosList.value[idx];
    const replaySource = utils_videoPlay.selectReplayVideoPlaybackSource(video);
    if (!video || !replaySource.playUrl) {
      console.warn("[Live] playReplayVideoByIndex: invalid video at index", idx);
      return;
    }
    if (videoFrameReady) {
      videoFrameReady.value = false;
    }
    const playUrl = replaySource.playUrl;
    const backupUrl = replaySource.backupUrl;
    if (video.videoUrl !== playUrl) {
      video.videoUrl = playUrl;
      video.video_url = playUrl;
    }
    prepareReplaySwitchState(video, idx, seekSeconds, playUrl, backupUrl);
    const existingEl = getLiveVideoElement();
    if (getVideoPlayer() && existingEl) {
      reuseReplayPlayerElement(existingEl, playUrl, backupUrl, seekSeconds);
    } else {
      initVideoPlayer(playUrl, {
        isReplay: true,
        seekTo: seekSeconds,
        backupUrl
      });
    }
    loadCommentHistory();
  }
  function getSavedReplayProgress(videoId) {
    if (!liveId.value || !videoId)
      return 0;
    try {
      const key = `replay_progress_${liveId.value}_${videoId}`;
      const val = common_vendor.index.getStorageSync(key);
      const result = Number(val) > 0 ? Number(val) : 0;
      return result;
    } catch (e) {
      return 0;
    }
  }
  function getPreferredReplayResume() {
    if (!Array.isArray(replayVideosList.value) || replayVideosList.value.length === 0) {
      console.warn(
        "[Live][断点] getPreferredReplayResume: replayVideosList 为空，无法查找本地断点"
      );
      return {
        preferredIndex: -1,
        preferredVideoId: 0,
        preferredProgress: 0
      };
    }
    let preferredIndex = -1;
    let preferredVideoId = 0;
    let preferredProgress = 0;
    replayVideosList.value.forEach((video, idx) => {
      const videoId = Number((video == null ? void 0 : video.id) || 0);
      const progress = getSavedReplayProgress(videoId);
      if (progress > preferredProgress) {
        preferredIndex = idx;
        preferredVideoId = videoId;
        preferredProgress = progress;
      }
    });
    return {
      preferredIndex,
      preferredVideoId,
      preferredProgress
    };
  }
  function handleScheduledReplayEnd(currentVideo) {
    var _a, _b, _c, _d;
    if (roomGroupType.value === 1 || !(currentVideo == null ? void 0 : currentVideo.estimatedEndTime))
      return false;
    const endMs = pages_broadcast_utils_entryFormat.safeParseReplayTime(currentVideo.estimatedEndTime);
    if (!endMs || Date.now() < endMs)
      return false;
    try {
      (_b = (_a = getVideoPlayer()) == null ? void 0 : _a.pause) == null ? void 0 : _b.call(_a);
    } catch (e) {
    }
    try {
      (_d = (_c = getLiveVideoElement()) == null ? void 0 : _c.pause) == null ? void 0 : _d.call(_c);
    } catch (e) {
    }
    const nowMs = Date.now();
    let foundNext = false;
    for (let i = replayCurrentIndex.value + 1; i < replayVideosList.value.length; i++) {
      const v = replayVideosList.value[i];
      const vStart = pages_broadcast_utils_entryFormat.safeParseReplayTime(v.startTime);
      const vEnd = pages_broadcast_utils_entryFormat.safeParseReplayTime(v.estimatedEndTime);
      if (vStart && nowMs >= vStart && (!vEnd || nowMs < vEnd)) {
        playReplayVideoByIndex(i, 0);
        foundNext = true;
        break;
      }
      if (vStart && nowMs < vStart) {
        enterReplayPendingState(i);
        replayFutureStartTimerRef.value = setTimeout(() => {
          replayFutureStartTimerRef.value = null;
          pushStatus.value = 1;
          playReplayVideoByIndex(i, 0);
        }, vStart - Date.now());
        foundNext = true;
        break;
      }
    }
    if (!foundNext) {
      isPlaying.value = false;
      pushStatus.value = 2;
      stopHeartbeat();
      try {
        common_vendor.index.setStorageSync(`replay_all_done_${liveId.value}`, replayVideosList.value.map((v) => v.id).join(","));
      } catch (e) {
      }
    }
    return true;
  }
  function handleReplayEndedFallback(currentVideo, currentSeconds) {
    if (!currentVideo || onVideoTimeUpdate._endedTriggered)
      return false;
    const videoEl = getLiveVideoElement();
    let videoDuration = Number(currentVideo.duration || 0);
    if (videoDuration <= 0) {
      const nativeDuration = Number((videoEl == null ? void 0 : videoEl.duration) || 0);
      if (Number.isFinite(nativeDuration) && nativeDuration > 0) {
        videoDuration = Math.floor(nativeDuration);
      }
    }
    const isEnded = !!(videoEl && videoEl.ended);
    const isNearEnd = videoDuration > 0 && currentSeconds >= videoDuration - 1;
    if (isEnded || isNearEnd) {
      onVideoTimeUpdate._endedTriggered = true;
      if (_endedFallbackTimer)
        clearTimeout(_endedFallbackTimer);
      _endedFallbackTimer = setTimeout(() => {
        _endedFallbackTimer = null;
        if (getVideoPlayer() && getVideoPlayer().onEnded)
          getVideoPlayer().onEnded();
      }, 500);
      return true;
    }
    if (videoDuration > 0 && currentSeconds < videoDuration - 2) {
      onVideoTimeUpdate._endedTriggered = false;
    }
    return false;
  }
  function persistReplayProgressTick(currentVideo, currentSeconds) {
    if (Math.abs(currentSeconds - _lastSavedProgress) < 3)
      return;
    const storageKey = `replay_progress_${liveId.value}_${replayCurrentVideoId.value}`;
    let saveSeconds = currentSeconds;
    try {
      const lastSaved = Number(common_vendor.index.getStorageSync(storageKey) || 0);
      saveSeconds = Math.max(saveSeconds, lastSaved);
    } catch (e) {
    }
    _lastSavedProgress = saveSeconds;
    try {
      common_vendor.index.setStorageSync(storageKey, saveSeconds);
    } catch (e) {
      console.error("[Live][断点] 保存失败:", e);
    }
    if (isReplay.value && (currentVideo == null ? void 0 : currentVideo.termId) > 0) {
      const reportInterval = onVideoTimeUpdate._nextReportInterval || 3e3;
      if (!onVideoTimeUpdate._lastReportTime || Date.now() - onVideoTimeUpdate._lastReportTime >= reportInterval) {
        onVideoTimeUpdate._lastReportTime = Date.now();
        onVideoTimeUpdate._nextReportInterval = 3e3 + Math.floor(Math.random() * 2e3);
        reportViewProgressApi({
          roomId: Number(liveId.value),
          termId: Number(currentVideo.termId),
          videoId: Number(replayCurrentVideoId.value),
          lastPosition: currentSeconds,
          watchDuration: currentSeconds,
          watchStatus: 1
        }).catch(() => {
        });
      }
    }
  }
  function enqueueDueReplayComments(currentSeconds) {
    const pendingComments = [];
    while (replayCommentCursor.value < replayCommentTimeline.value.length) {
      const item = replayCommentTimeline.value[replayCommentCursor.value];
      if (Number(item.timelineSeconds || 0) > currentSeconds)
        break;
      pendingComments.push(item);
      replayCommentCursor.value += 1;
    }
    if (pendingComments.length > 0)
      enqueueReplayComments(pendingComments);
  }
  function consumeReplaySimOrdersAt(currentSeconds) {
    const pendingSimOrders = consumeSimOrders(currentSeconds);
    if (!onVideoTimeUpdate._lastSimDiagLog || Date.now() - onVideoTimeUpdate._lastSimDiagLog > 5e3) {
      onVideoTimeUpdate._lastSimDiagLog = Date.now();
    }
    if (pendingSimOrders.length <= 0)
      return;
    for (const order of pendingSimOrders) {
      incrementProductHotOrder == null ? void 0 : incrementProductHotOrder(order.productId, order.quantity || 1, { virtual: true });
      const nick = order.customerName || "观众";
      const displayNick = (formatLiveNickname == null ? void 0 : formatLiveNickname(nick)) || nick;
      const productMeta = {
        productId: order.productId,
        productName: order.productName,
        productImage: order.productImage,
        count: order.quantity || 0,
        sort: ""
      };
      showBuyingNotice == null ? void 0 : showBuyingNotice(displayNick, order.noticeText || "", productMeta);
    }
  }
  function syncReplayScheduleExplain(currentVideo, currentSeconds) {
    var _a, _b;
    const scheduleResult = replayProductSchedule.syncReplaySchedule({
      productList: productList.value,
      currentTime: currentSeconds,
      currentVideoUrl: currentVideo.videoUrl || pullUrl.value || "",
      currentVideoId: Number(currentVideo.id || replayCurrentVideoId.value || 0)
    });
    if ((scheduleResult == null ? void 0 : scheduleResult.shouldActivate) && scheduleResult.product) {
      const matched = mapProductItem(scheduleResult.product);
      scheduleExplainActiveId.value = matched.id;
      currentProduct.value = matched;
      showProduct.value = true;
      explainingProductId.value = matched.id;
      productList.value = productList.value.map((p) => ({ ...p, isCurrent: mapProductItem(p).id === matched.id }));
      syncProductCardIndex(matched.id);
      if (scheduleExplainTimerRef.value)
        clearTimeout(scheduleExplainTimerRef.value);
      const remainMs = (Number(((_a = scheduleResult.node) == null ? void 0 : _a.videoTime) || 0) + Number(((_b = scheduleResult.node) == null ? void 0 : _b.duration) || 0) - currentSeconds) * 1e3;
      scheduleExplainTimerRef.value = setTimeout(() => {
        if (scheduleExplainActiveId.value === matched.id) {
          showProduct.value = false;
          scheduleExplainActiveId.value = 0;
          productList.value = productList.value.map((p) => ({ ...p, isCurrent: mapProductItem(p).id === explainingProductId.value }));
        }
        scheduleExplainTimerRef.value = null;
      }, Math.max(remainMs, 500));
    } else if ((scheduleResult == null ? void 0 : scheduleResult.shouldDeactivate) && scheduleExplainActiveId.value > 0) {
      const activeId = scheduleExplainActiveId.value;
      showProduct.value = false;
      scheduleExplainActiveId.value = 0;
      productList.value = productList.value.map((p) => {
        const productId = mapProductItem(p).id;
        return { ...p, isCurrent: productId === explainingProductId.value && productId !== activeId };
      });
      if (scheduleExplainTimerRef.value) {
        clearTimeout(scheduleExplainTimerRef.value);
        scheduleExplainTimerRef.value = null;
      }
    }
  }
  function onVideoTimeUpdate(event) {
    var _a, _b;
    if (!isReplay.value || !replayCurrentVideoId.value) {
      if (!onVideoTimeUpdate._lastSkipLog || Date.now() - onVideoTimeUpdate._lastSkipLog > 3e4) {
        onVideoTimeUpdate._lastSkipLog = Date.now();
        console.warn("[Live][断点] onVideoTimeUpdate SKIPPED:", {
          isReplay: isReplay.value,
          replayCurrentVideoId: replayCurrentVideoId.value
        });
      }
      return;
    }
    const currentSeconds = Math.floor(
      Number(((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.currentTime) || ((_b = event == null ? void 0 : event.detail) == null ? void 0 : _b.position) || 0)
    );
    syncLiveMiniWindowState({ currentTime: currentSeconds });
    if (_seekTarget > 0 && currentSeconds < _seekTarget - 2) {
      return;
    }
    if (_seekTarget > 0 && currentSeconds >= _seekTarget - 2) {
      _seekTarget = 0;
    }
    if (currentSeconds < replayLastTime.value) {
      if (typeof replaceReplayMessagesAt === "function") {
        replaceReplayMessagesAt(currentSeconds);
      } else {
        clearCommentQueue();
        clearMessages();
        syncReplayCommentCursor(currentSeconds);
      }
      syncSimCursor(currentSeconds);
    }
    replayLastTime.value = currentSeconds;
    const currentVideo = replayVideosList.value[replayCurrentIndex.value];
    if (handleScheduledReplayEnd(currentVideo))
      return;
    if (handleReplayEndedFallback(currentVideo, currentSeconds))
      return;
    persistReplayProgressTick(currentVideo, currentSeconds);
    enqueueDueReplayComments(currentSeconds);
    consumeReplaySimOrdersAt(currentSeconds);
    syncReplayScheduleExplain(currentVideo, currentSeconds);
  }
  return {
    getLastSavedProgress: () => _lastSavedProgress,
    setLastSavedProgress: (value) => {
      _lastSavedProgress = value;
    },
    getSeekTarget: () => _seekTarget,
    setSeekTarget: (value) => {
      _seekTarget = value;
    },
    getSrcSwitchGuard: () => _srcSwitchGuard,
    stopReplayFutureStartTimer,
    getReplayVideoSchedule,
    resetReplayContext,
    enterReplayPendingState,
    playReplayVideoByIndex,
    getSavedReplayProgress,
    getPreferredReplayResume,
    onVideoTimeUpdate,
    verifySeekResult: _verifySeekResult
  };
}
exports.useLiveReplayPlayback = useLiveReplayPlayback;
