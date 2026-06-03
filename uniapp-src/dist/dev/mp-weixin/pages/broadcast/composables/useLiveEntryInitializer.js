"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_live = require("../../../api/live.js");
const api_user = require("../../../api/user.js");
const stores_index = require("../../../stores/index.js");
const stores_domain = require("../../../stores/domain.js");
const services_h5AuthContext = require("../../../services/h5-auth-context.js");
const services_logout = require("../../../services/logout.js");
const utils_liveRoomContext = require("../../../utils/live-room-context.js");
const utils_liveMiniState = require("../../../utils/live-mini-state.js");
const utils_videoPlay = require("../../../utils/videoPlay.js");
const pages_broadcast_composables_useLiveSidePanels = require("./useLiveSidePanels.js");
const pages_broadcast_utils_entryFormat = require("../utils/entry-format.js");
const pages_broadcast_utils_entryInit = require("../utils/entry-init.js");
const pages_broadcast_utils_refreshSoundIntent = require("../utils/refresh-sound-intent.js");
const pages_broadcast_composables_useLiveEntryBootstrap = require("./useLiveEntryBootstrap.js");
const pages_broadcast_composables_liveEntryInitializerHelpers = require("./live-entry-initializer-helpers.js");
const pages_broadcast_utils_liveSource = require("../utils/live-source.js");
function useLiveEntryInitializer(ctx) {
  const isDistributor = common_vendor.ref(false);
  const distributorStatus = common_vendor.ref(0);
  const {
    runtime,
    stopScheduleTimers,
    liveInitResolved,
    liveRedirecting,
    accessDenied,
    viewerLimitReached,
    viewerLimitText,
    showEntryOverlay,
    showReplayFirstVideoLoading,
    pendingRecoverBuyCtx,
    isWeChatIOSH5,
    isMuted,
    replayCover,
    resetReplayContext,
    liveId,
    roomCode,
    shareCode,
    liveBindId,
    liveTenantId,
    liveName,
    liveCover,
    mode,
    userStore,
    myUserId,
    getLiveRedirectUrl,
    rtcConfig,
    roomGroupType,
    roomBroadcastMethod,
    roomWatchByDay,
    roomCurrentTermId,
    _isSameOrigin,
    anchorName,
    anchorAvatar,
    setViewerCountDisplay,
    likeCount,
    saveContextOptions,
    chatBgImage,
    liveDate,
    pushStatus,
    pullUrl,
    videoUrl,
    videoFrameReady,
    isReplay,
    isLiveVisualMode,
    hasReplay,
    liveStatusText,
    isWaitingSchedule,
    isPlaying,
    scheduleEnabled,
    scheduleTimeStr,
    pushTime,
    warmUpVideoUrl,
    warmUpVideoCoverImage,
    bizCode,
    nowTs,
    replayVideosList,
    replayCurrentVideoId,
    replayLoopPlay,
    replayCurrentIndex,
    userBlocked,
    roomSetting,
    getPreferredReplayResume,
    getSavedReplayProgress,
    replayLastTime,
    signConfig,
    signFields,
    hasSigned,
    showSignPopup,
    loadSignStatus,
    switchToFirstAvailableTab,
    setScheduleWarmupMode,
    setLastSavedProgress,
    initVideoPlayer,
    startScheduleTimers,
    getReplayVideoSchedule,
    enterReplayPendingState,
    setReplayFutureStartTimer,
    playReplayVideoByIndex,
    initWebSocket,
    loadCommentHistory,
    loadProductList,
    loadCurrentProduct,
    sessionId,
    setEnterTimestamp,
    applyH5ViewerEnterBoost,
    startHeartbeat,
    stopHeartbeat,
    startStatusPoll,
    stopStatusPoll,
    recoverBuyContextFromWxPick,
    onLiveDetailLoaded,
    quickReplies,
    sendFallbackEnter,
    closeLiveSocket,
    getLiveVideoElement,
    getVideoPlayer,
    setVideoPlayer,
    markStoredSoundIntentRestore,
    clearStoredSoundIntentRestore,
    setIOSWechatBridgeSoundAutoPlayAllowed,
    recordPlaybackDebugEvent = () => {
    },
    setPullStreams = () => {
    },
    getPreferredLiveQuality = () => ""
  } = ctx;
  function getLastInitOptions() {
    return runtime.lastInitOptions || {};
  }
  function setPendingSubscribeBack(value) {
    runtime.pendingSubscribeBack = value;
  }
  function setReplayFirstVideoLoading(value) {
    if (showReplayFirstVideoLoading) {
      showReplayFirstVideoLoading.value = !!value;
    }
  }
  function clearLiveVideoForCoverOnly() {
    var _a, _b, _c;
    pullUrl.value = "";
    if (videoUrl)
      videoUrl.value = "";
    isPlaying.value = false;
    if (videoFrameReady)
      videoFrameReady.value = false;
    try {
      const player = getVideoPlayer == null ? void 0 : getVideoPlayer();
      if (player && typeof player.destroy === "function")
        player.destroy();
      setVideoPlayer == null ? void 0 : setVideoPlayer(null);
    } catch (e) {
    }
    try {
      const el = getLiveVideoElement == null ? void 0 : getLiveVideoElement();
      if (el) {
        (_a = el.pause) == null ? void 0 : _a.call(el);
        (_b = el.removeAttribute) == null ? void 0 : _b.call(el, "src");
        (_c = el.load) == null ? void 0 : _c.call(el);
      }
    } catch (e) {
    }
  }
  function applyViewerLimitReached(data = {}) {
    if (viewerLimitText)
      viewerLimitText.value = data.viewerLimitText || data.message || "观看人数已达上限";
    if (viewerLimitReached)
      viewerLimitReached.value = true;
    accessDenied.value = false;
    showEntryOverlay.value = false;
    liveInitResolved.value = true;
    stopHeartbeat == null ? void 0 : stopHeartbeat();
    stopStatusPoll == null ? void 0 : stopStatusPoll();
    closeLiveSocket == null ? void 0 : closeLiveSocket();
    clearLiveVideoForCoverOnly();
  }
  async function reportLiveEntry() {
    var _a;
    if (!userStore.token || sessionId.value || showEntryOverlay.value || accessDenied.value || (viewerLimitReached == null ? void 0 : viewerLimitReached.value))
      return false;
    sessionId.value = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    setEnterTimestamp(Date.now());
    try {
      await api_live.enterLiveRoom(
        liveId.value,
        sessionId.value,
        (shareCode == null ? void 0 : shareCode.value) || roomCode.value || "",
        roomCurrentTermId.value || 0
      );
    } catch (err) {
      const data = ((_a = err == null ? void 0 : err.response) == null ? void 0 : _a.data) || {};
      if (data.viewerLimitReached) {
        sessionId.value = "";
        applyViewerLimitReached(data);
        return false;
      }
      sessionId.value = "";
      setEnterTimestamp(0);
      throw err;
    }
    applyH5ViewerEnterBoost();
    if (isReplay.value && roomCurrentTermId.value > 0 && replayCurrentVideoId.value > 0) {
      api_live.reportViewProgress({
        roomId: Number(liveId.value),
        termId: Number(roomCurrentTermId.value),
        videoId: Number(replayCurrentVideoId.value),
        watchStatus: 1
      }).catch((e) => console.warn("[Live] reportViewProgress fail:", e));
    }
    startHeartbeat();
    return true;
  }
  function resetInitLiveState(options) {
    runtime.lastInitOptions = options;
    stopScheduleTimers();
    liveInitResolved.value = false;
    liveRedirecting.value = false;
    accessDenied.value = false;
    if (viewerLimitReached)
      viewerLimitReached.value = false;
    if (viewerLimitText)
      viewerLimitText.value = "观看人数已达上限";
    sessionId.value = "";
    const _skipOverlay = runtime.skipEntryOverlayOnce;
    runtime.skipEntryOverlayOnce = false;
    showEntryOverlay.value = !_skipOverlay;
    resetReplayContext();
    setReplayFirstVideoLoading(false);
  }
  function resolveInitLiveContext(rawOptions) {
    const options = rawOptions || {};
    resetInitLiveState(options);
    const resolvedOptions = pages_broadcast_utils_entryInit.resolveLiveEntryOptions(options, liveId.value, { loadLiveRoomContext: utils_liveRoomContext.loadLiveRoomContext });
    const _roomCode = resolvedOptions.roomCode;
    const entryLiveType = pages_broadcast_utils_entryFormat.normalizeLiveType(resolvedOptions.liveType);
    const resolvedBindId = resolvedOptions.bindId || services_h5AuthContext.readBindId();
    liveId.value = resolvedOptions.liveId;
    roomCode.value = _roomCode;
    if (shareCode)
      shareCode.value = resolvedOptions.shareCode || "";
    if (liveBindId)
      liveBindId.value = resolvedBindId || "";
    showEntryOverlay.value = pendingRecoverBuyCtx.value || runtime.pendingSubscribeBack ? false : !isWeChatIOSH5;
    applyRefreshSoundIntent(_roomCode);
    applyResolvedEntryOptions(resolvedOptions, entryLiveType);
    if (!_roomCode) {
      console.error("[Live] 缺少roomCode参数", {
        liveId: liveId.value || "",
        rawRoomId: options.roomId || "",
        rawLiveId: options.liveId || options.live_id || ""
      });
      common_vendor.index.showToast({
        title: liveId.value ? "缺少直播间口令，请使用新版直播链接" : "缺少直播间参数",
        icon: "none"
      });
      liveInitResolved.value = true;
      return null;
    }
    saveInitialLiveRoomContext(options, _roomCode, entryLiveType);
    const initToken = `${_roomCode}::${liveId.value || ""}`;
    if (runtime.liveInitToken === initToken) {
      console.warn("[Live] skip duplicate init:", initToken);
      liveInitResolved.value = true;
      return null;
    }
    runtime.liveInitToken = initToken;
    return { options, resolvedOptions, roomCode: _roomCode, entryLiveType, initToken };
  }
  function applyRefreshSoundIntent(_roomCode) {
    const refreshSoundIntent = pages_broadcast_utils_refreshSoundIntent.resolveIOSWechatRefreshSoundIntent({ isWeChatIOSH5, roomCode: _roomCode, loadState: utils_liveMiniState.loadLiveMiniState });
    setIOSWechatBridgeSoundAutoPlayAllowed == null ? void 0 : setIOSWechatBridgeSoundAutoPlayAllowed(refreshSoundIntent.allowBridgeSoundAutoPlay);
    if (refreshSoundIntent.shouldRestoreSound) {
      markStoredSoundIntentRestore == null ? void 0 : markStoredSoundIntentRestore();
    } else {
      clearStoredSoundIntentRestore == null ? void 0 : clearStoredSoundIntentRestore();
    }
    isMuted.value = true;
  }
  function applyResolvedEntryOptions(resolvedOptions, entryLiveType) {
    var _a;
    roomGroupType.value = entryLiveType === "live" ? 0 : 1;
    isReplay.value = entryLiveType === "replay";
    if (isLiveVisualMode)
      isLiveVisualMode.value = pages_broadcast_utils_entryFormat.resolveLiveVisualMode(entryLiveType);
    if (resolvedOptions.tenantId)
      liveTenantId.value = resolvedOptions.tenantId;
    liveName.value = resolvedOptions.liveName;
    common_vendor.index.setNavigationBarTitle({ title: liveName.value || "直播间" });
    liveCover.value = resolvedOptions.liveCover;
    if (replayCover)
      replayCover.value = entryLiveType === "replay" ? resolvedOptions.liveCover || "" : "";
    if (resolvedOptions.mode) {
      mode.value = resolvedOptions.mode;
    } else if (entryLiveType === "live") {
      mode.value = "";
    }
    if ((_a = userStore.userInfo) == null ? void 0 : _a.id)
      myUserId.value = Number(userStore.userInfo.id) || 0;
  }
  function saveInitialLiveRoomContext(options, _roomCode, entryLiveType) {
    try {
      const _currentTc = options._tc || "";
      utils_liveRoomContext.saveLiveRoomContext({
        roomCode: _roomCode,
        tenantId: options.tenantId || "",
        liveId: liveId.value || "",
        bindId: options.bindId || options.bind_id || services_h5AuthContext.readBindId() || "",
        _ad: "",
        _tc: _currentTc,
        liveType: entryLiveType,
        isReplay: entryLiveType === "replay",
        replay: entryLiveType === "replay" ? "1" : "",
        videoId: options.videoId || options.video_id || options.replayVideoId || options.replay_video_id || "",
        video_id: options.video_id || options.videoId || options.replayVideoId || options.replay_video_id || "",
        replayVideoId: options.replayVideoId || options.videoId || options.video_id || options.replay_video_id || "",
        replay_video_id: options.replay_video_id || options.replayVideoId || options.videoId || options.video_id || ""
      });
    } catch (e) {
    }
  }
  function denyLiveAccess() {
    accessDenied.value = true;
    showEntryOverlay.value = false;
    liveInitResolved.value = true;
  }
  function refreshMissingProfile() {
    var _a, _b;
    if (!userStore.token || ((_a = userStore.userInfo) == null ? void 0 : _a.avatar) && ((_b = userStore.userInfo) == null ? void 0 : _b.nickname)) {
      return;
    }
    api_user.getProfile().then((profile) => {
      if (profile == null ? void 0 : profile.id) {
        userStore.setUserInfo({ ...userStore.userInfo || {}, ...profile });
      }
    }).catch(() => {
    });
  }
  async function initLive(rawOptions) {
    const initCtx = resolveInitLiveContext(rawOptions);
    if (!initCtx)
      return;
    const { options, resolvedOptions, roomCode: _roomCode, entryLiveType, initToken } = initCtx;
    let earlyLivePlayerKey = "";
    let earlyLiveStreamInfo = null;
    let earlyReplayFirstVideoState = null;
    let detailLivePlayerInitReached = false;
    const startEarlyLivePlayer = (streamInfo) => {
      if (detailLivePlayerInitReached || runtime.liveInitToken !== initToken) {
        return false;
      }
      earlyLiveStreamInfo = streamInfo || null;
      setPullStreams(streamInfo);
      const source = pages_broadcast_composables_liveEntryInitializerHelpers.buildLivePlayerSource(streamInfo, pages_broadcast_utils_liveSource.isIOSRuntime(), getPreferredLiveQuality());
      if (!source.key)
        return false;
      const streamPushStatus = (streamInfo == null ? void 0 : streamInfo.pushStatus) ?? (streamInfo == null ? void 0 : streamInfo.liveStatus) ?? (streamInfo == null ? void 0 : streamInfo.status);
      if (streamPushStatus !== void 0 && streamPushStatus !== null && Number(streamPushStatus || 0) !== 1) {
        return false;
      }
      const streamMode = pages_broadcast_utils_entryFormat.normalizeMode(streamInfo);
      if (streamMode)
        mode.value = streamMode;
      roomGroupType.value = 0;
      pushStatus.value = 1;
      isReplay.value = false;
      pullUrl.value = source.mainUrl || pullUrl.value || "";
      if (rtcConfig)
        rtcConfig.value = source.rtcConfig || null;
      earlyLivePlayerKey = source.key;
      recordPlaybackDebugEvent("stream_info_source", pages_broadcast_composables_liveEntryInitializerHelpers.summarizeLiveSourcePayload(streamInfo, source));
      initVideoPlayer(source.mainUrl || "", source.options);
      return true;
    };
    const reuseEarlyReplayFirstVideoIfSame = (targetIndex, targetPosition) => {
      if (!earlyReplayFirstVideoState)
        return false;
      if (mode.value !== "portrait" || !isReplay.value)
        return false;
      const targetVideo = replayVideosList.value[targetIndex];
      if (!(targetVideo == null ? void 0 : targetVideo.videoUrl))
        return false;
      const targetVideoId = Number(targetVideo.id || targetVideo.videoId || 0);
      const sameVideoId = targetVideoId > 0 && targetVideoId === Number(earlyReplayFirstVideoState.videoId || 0);
      const targetVideoUrlKey = pages_broadcast_utils_liveSource.normalizeLiveSourceUrlKey(targetVideo.videoUrl);
      const sameVideoUrl = targetVideoUrlKey === earlyReplayFirstVideoState.videoUrlKey;
      if (!sameVideoId && !sameVideoUrl)
        return false;
      const currentPlaybackUrlKey = pages_broadcast_utils_liveSource.normalizeLiveSourceUrlKey((videoUrl == null ? void 0 : videoUrl.value) || (pullUrl == null ? void 0 : pullUrl.value) || "");
      if (currentPlaybackUrlKey !== targetVideoUrlKey)
        return false;
      if (Number(targetPosition || 0) > 0 && !(getLiveVideoElement == null ? void 0 : getLiveVideoElement()))
        return false;
      reuseEarlyReplayState(targetIndex, targetPosition, targetVideo);
      earlyReplayFirstVideoState = null;
      return true;
    };
    const setEarlyReplayFirstVideo = (firstVideo) => {
      earlyReplayFirstVideoState = {
        videoId: Number(firstVideo.videoId || 0),
        videoUrlKey: pages_broadcast_utils_liveSource.normalizeLiveSourceUrlKey(firstVideo.videoUrl),
        seekTo: Number(firstVideo.elapsedSeconds || 0),
        video: firstVideo
      };
    };
    function primeReplayFirstVideo() {
      const shouldPrimeReplayPortrait = entryLiveType === "replay" && pages_broadcast_composables_liveEntryInitializerHelpers.isReplayPortraitEntryMode(resolvedOptions.mode, mode.value);
      if (!shouldPrimeReplayPortrait)
        return;
      setReplayFirstVideoLoading(true);
      api_live.getReplayFirstVideo(_roomCode).then((firstVideoRaw) => {
        handleReplayFirstVideoResult(firstVideoRaw, initToken, () => detailLivePlayerInitReached, setEarlyReplayFirstVideo);
      }).catch((err) => {
        setReplayFirstVideoLoading(false);
        console.warn("[Live] replay first video preload failed:", err);
      });
    }
    try {
      primeReplayFirstVideo();
      startEarlyLiveStream(entryLiveType, _roomCode, startEarlyLivePlayer);
      const preloadedDetail = pages_broadcast_composables_useLiveEntryBootstrap.consumePreloadedLiveDetail(_roomCode);
      const d = preloadedDetail || await api_live.getLiveDetail(_roomCode);
      if (d) {
        await handleLiveDetail(d, {
          options,
          entryLiveType,
          roomCode: _roomCode,
          setDetailLivePlayerInitReached: () => {
            detailLivePlayerInitReached = true;
          },
          getEarlyLivePlayerKey: () => earlyLivePlayerKey,
          getEarlyLiveStreamInfo: () => earlyLiveStreamInfo,
          getEarlyReplayFirstVideoState: () => earlyReplayFirstVideoState,
          reuseEarlyReplayFirstVideoIfSame
        });
      }
    } catch (err) {
      console.error("[Live] getLiveDetail fail:", err);
    } finally {
      setReplayFirstVideoLoading(false);
      if (!liveRedirecting.value) {
        liveInitResolved.value = true;
      }
      if (runtime.liveInitToken === initToken) {
        runtime.liveInitToken = "";
      }
    }
  }
  function handleReplayFirstVideoResult(firstVideoRaw, initToken, isDetailReached, setEarlyReplayFirstVideo) {
    const firstVideo = pages_broadcast_composables_liveEntryInitializerHelpers.normalizeReplayFirstVideoPayload(firstVideoRaw);
    if (!firstVideo)
      return;
    if (runtime.liveInitToken !== initToken || isDetailReached())
      return;
    if (mode.value !== "portrait" || !isReplay.value)
      return;
    if (firstVideo.coverImage && replayCover && !replayCover.value) {
      replayCover.value = firstVideo.coverImage;
    }
    if (!firstVideo.videoUrl)
      return;
    const backupUrl = utils_videoPlay.deriveMp4FromM3u8(firstVideo.videoUrl);
    const firstVideoBackupUrl = backupUrl && backupUrl !== firstVideo.videoUrl ? backupUrl : "";
    roomGroupType.value = 1;
    isReplay.value = true;
    pushStatus.value = 1;
    setEarlyReplayFirstVideo(firstVideo);
    initVideoPlayer(firstVideo.videoUrl, {
      isReplay: true,
      seekTo: firstVideo.elapsedSeconds,
      backupUrl: firstVideoBackupUrl,
      nativeLoadTimeoutMs: pages_broadcast_utils_liveSource.isIOSRuntime() ? 700 : void 0
    });
  }
  function reuseEarlyReplayState(targetIndex, targetPosition, targetVideo) {
    const targetSeconds = Math.max(0, Number(targetPosition || 0) || 0);
    const currentEl = getLiveVideoElement == null ? void 0 : getLiveVideoElement();
    const currentTime = Number((currentEl == null ? void 0 : currentEl.currentTime) || 0);
    const hasStartedPlayback = currentTime > 0.2;
    let effectiveSeconds = targetSeconds;
    replayCurrentIndex.value = targetIndex;
    replayCurrentVideoId.value = targetVideo.id || targetVideo.videoId || 0;
    replayLoopPlay.value = targetVideo.loopPlay === 1;
    if (targetVideo.termId > 0) {
      roomCurrentTermId.value = targetVideo.termId;
    }
    if (quickReplies) {
      quickReplies.value = Array.isArray(targetVideo.quickReplies) ? targetVideo.quickReplies : [];
    }
    if (currentEl && targetSeconds > 0 && Math.abs(currentTime - targetSeconds) > 2) {
      if (hasStartedPlayback) {
        effectiveSeconds = currentTime;
      } else {
        try {
          currentEl.currentTime = targetSeconds;
        } catch (e) {
        }
      }
    }
    replayLastTime.value = effectiveSeconds;
    try {
      loadCommentHistory();
    } catch (e) {
      console.warn("[Live] reuseEarlyReplay loadCommentHistory fail:", e);
    }
  }
  function startEarlyLiveStream(entryLiveType, _roomCode, startEarlyLivePlayer) {
    if (entryLiveType !== "live")
      return;
    pages_broadcast_composables_liveEntryInitializerHelpers.getLiveStreamInfWithRetry(_roomCode).then((streamInfo) => {
      startEarlyLivePlayer(streamInfo);
    }).catch(() => {
    });
  }
  async function handleLiveDetail(d, state) {
    var _a, _b;
    if (handleNeedRelogin(d))
      return;
    applyDetailIdentity(d, state);
    if (d.viewerLimitReached) {
      liveName.value = d.roomName || liveName.value;
      common_vendor.index.setNavigationBarTitle({ title: liveName.value || "直播间" });
      applyViewerLimitReached(d);
      return;
    }
    if (await applyTenantDomainAndRedirect(d))
      return;
    await applyDetailDisplayState(d, state);
    const playbackState = applyDetailPlaybackState(
      d,
      state.entryLiveType,
      state.getEarlyLivePlayerKey(),
      (_a = state.getEarlyLiveStreamInfo) == null ? void 0 : _a.call(state)
    );
    playbackState.earlyReplayFirstVideoState = ((_b = state.getEarlyReplayFirstVideoState) == null ? void 0 : _b.call(state)) || null;
    if (handleAccessRestrictions(d))
      return;
    await ensureReplayFirstVideoFallback(state, playbackState);
    const replayResume = restoreReplayResume();
    applyRoomSettingAndSign(d);
    switchToFirstAvailableTab();
    if (handleWaitingScheduleIfNeeded())
      return;
    initDetailVideoFlow(d, state, replayResume, playbackState);
    await finishDetailInit();
  }
  function handleNeedRelogin(d) {
    const needRelogin = firstPresent(d.needReLogin, d.need_relogin, d.need_re_login, false);
    if (!needRelogin)
      return false;
    liveRedirecting.value = true;
    common_vendor.index.showToast({ title: d.message || "正在跳转登录", icon: "none" });
    services_logout.logoutAndRedirect(getLiveRedirectUrl(), firstPresent(d.tenantId, d.tenant_id));
    return true;
  }
  function resolveDetailRoomId(detail = {}) {
    var _a, _b;
    return firstPresent(
      detail.roomId,
      detail.room_id,
      detail.liveId,
      detail.live_id,
      detail.id,
      (_a = detail.live) == null ? void 0 : _a.id,
      (_b = detail.room) == null ? void 0 : _b.id,
      liveId.value
    );
  }
  function applyDetailIdentity(d, state) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    liveId.value = resolveDetailRoomId(d);
    const customerId = firstPresent(d.customerId, d.customer_id, d.userId, d.user_id);
    if (customerId) {
      myUserId.value = Number(customerId) || 0;
    }
    roomGroupType.value = state.entryLiveType === "live" ? 0 : 1;
    if (roomBroadcastMethod) {
      const broadcastMethod = firstPresent(d.broadcastMethod, d.broadcast_method, null);
      roomBroadcastMethod.value = broadcastMethod === void 0 || broadcastMethod === null ? null : Number(broadcastMethod) || 0;
    }
    roomWatchByDay.value = toNumber(firstPresent(d.watchByDay, d.watch_by_day), 0);
    roomCurrentTermId.value = toNumber(firstPresent(d.currentTermId, d.current_term_id, d.termId, d.term_id), 0);
    try {
      utils_liveRoomContext.saveLiveRoomContext({
        roomCode: state.roomCode,
        liveId: liveId.value || "",
        roomId: liveId.value || "",
        tenantId: liveTenantId.value || ((_a = state.options) == null ? void 0 : _a.tenantId) || "",
        liveType: state.entryLiveType,
        isReplay: state.entryLiveType === "replay",
        replay: state.entryLiveType === "replay" ? "1" : "",
        videoId: ((_b = state.options) == null ? void 0 : _b.videoId) || ((_c = state.options) == null ? void 0 : _c.video_id) || ((_d = state.options) == null ? void 0 : _d.replayVideoId) || ((_e = state.options) == null ? void 0 : _e.replay_video_id) || "",
        video_id: ((_f = state.options) == null ? void 0 : _f.video_id) || ((_g = state.options) == null ? void 0 : _g.videoId) || ((_h = state.options) == null ? void 0 : _h.replayVideoId) || ((_i = state.options) == null ? void 0 : _i.replay_video_id) || "",
        replayVideoId: ((_j = state.options) == null ? void 0 : _j.replayVideoId) || ((_k = state.options) == null ? void 0 : _k.videoId) || ((_l = state.options) == null ? void 0 : _l.video_id) || ((_m = state.options) == null ? void 0 : _m.replay_video_id) || "",
        replay_video_id: ((_n = state.options) == null ? void 0 : _n.replay_video_id) || ((_o = state.options) == null ? void 0 : _o.replayVideoId) || ((_p = state.options) == null ? void 0 : _p.videoId) || ((_q = state.options) == null ? void 0 : _q.video_id) || ""
      });
    } catch (e) {
    }
    if (quickReplies) {
      quickReplies.value = normalizeQuickReplies(firstPresent(d.quickReplies, d.quick_replies, []));
    }
    onLiveDetailLoaded == null ? void 0 : onLiveDetailLoaded(d);
  }
  async function applyTenantDomainAndRedirect(d) {
    const tenantId = firstPresent(d.tenantId, d.tenant_id);
    if (!tenantId)
      return false;
    liveTenantId.value = tenantId;
    const domainStore = stores_domain.useDomainStore(stores_index.pinia);
    await domainStore.load(tenantId);
    return false;
  }
  async function applyDetailDisplayState(d, state) {
    const newMode = state.entryLiveType === "live" ? pages_broadcast_utils_entryFormat.normalizeMode(d) || mode.value || state.options.mode || "portrait" : pages_broadcast_utils_entryFormat.normalizeMode(d) || state.options.mode || "portrait";
    if (newMode !== mode.value) {
      mode.value = newMode;
      await common_vendor.nextTick$1();
    }
    anchorName.value = firstPresent(d.anchorName, d.anchor_name, d.nickname, anchorName.value);
    anchorAvatar.value = firstPresent(d.anchorAvatar, d.anchor_avatar, d.avatar, anchorAvatar.value);
    setViewerCountDisplay(String(firstPresent(d.onlineCount, d.online_count, d.viewCount, d.view_count, 0)));
    const __remoteLike = Number(firstPresent(d.likeCount, d.like_count, d.totalLikes, d.total_likes, 0));
    const __localLike = Number(likeCount.value || 0);
    likeCount.value = Math.max(
      Number.isFinite(__localLike) ? __localLike : 0,
      Number.isFinite(__remoteLike) ? __remoteLike : 0
    );
    liveName.value = firstPresent(d.roomName, d.room_name, d.liveName, d.live_name, d.title, liveName.value);
    common_vendor.index.setNavigationBarTitle({ title: liveName.value || "直播间" });
    liveCover.value = firstPresent(d.coverImage, d.cover_image, d.cover, d.poster, liveCover.value);
    if (state.entryLiveType === "replay" && replayCover && liveCover.value && !replayCover.value) {
      replayCover.value = liveCover.value;
    }
    saveDetailContextOptions(state);
    chatBgImage.value = firstPresent(d.chatBgImage, d.chat_bg_image, d.chatBackgroundImage, d.chat_background_image, d.chatBackground, d.chat_background, chatBgImage.value);
    liveDate.value = firstPresent(d.startTime, d.start_time, d.beginTime, d.begin_time, liveDate.value);
  }
  function saveDetailContextOptions(state) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    try {
      saveContextOptions({
        roomCode: roomCode.value || "",
        tenantId: liveTenantId.value || "",
        liveId: liveId.value || "",
        _ad: "",
        _tc: state.options._tc || "",
        liveName: liveName.value || "",
        cover: state.entryLiveType === "replay" ? (replayCover == null ? void 0 : replayCover.value) || "" : liveCover.value || "",
        liveType: state.entryLiveType,
        isReplay: state.entryLiveType === "replay",
        replay: state.entryLiveType === "replay" ? "1" : "",
        videoId: replayCurrentVideoId.value || ((_a = state.options) == null ? void 0 : _a.videoId) || ((_b = state.options) == null ? void 0 : _b.video_id) || "",
        video_id: replayCurrentVideoId.value || ((_c = state.options) == null ? void 0 : _c.video_id) || ((_d = state.options) == null ? void 0 : _d.videoId) || "",
        replayVideoId: replayCurrentVideoId.value || ((_e = state.options) == null ? void 0 : _e.replayVideoId) || ((_f = state.options) == null ? void 0 : _f.videoId) || ((_g = state.options) == null ? void 0 : _g.video_id) || "",
        replay_video_id: replayCurrentVideoId.value || ((_h = state.options) == null ? void 0 : _h.replay_video_id) || ((_i = state.options) == null ? void 0 : _i.replayVideoId) || ((_j = state.options) == null ? void 0 : _j.videoId) || ((_k = state.options) == null ? void 0 : _k.video_id) || ""
      });
    } catch (_) {
    }
  }
  function applyDetailPlaybackState(d, entryLiveType, earlyLivePlayerKey, earlyLiveStreamInfo) {
    const detailPushStatus = getDetailPushStatus(d);
    pushStatus.value = detailPushStatus;
    hasReplay.value = !!firstPresent(d.hasReplay, d.has_replay, d.replayEnabled, d.replay_enabled, false);
    if (liveStatusText)
      liveStatusText.value = firstPresent(d.liveStatusText, d.live_status_text, d.statusText, d.status_text, "");
    setPullStreams(d);
    const detailLivePlayerSource = detailPushStatus === 1 ? pages_broadcast_composables_liveEntryInitializerHelpers.buildLivePlayerSource(d, pages_broadcast_utils_liveSource.isIOSRuntime(), getPreferredLiveQuality(), earlyLiveStreamInfo || {}) : { key: "", mainUrl: "", options: {}, rtcConfig: null };
    recordPlaybackDebugEvent("detail_source", pages_broadcast_composables_liveEntryInitializerHelpers.summarizeLiveSourcePayload(d, detailLivePlayerSource));
    pullUrl.value = detailLivePlayerSource.mainUrl || (detailPushStatus === 1 ? pullUrl.value : "");
    if (rtcConfig)
      rtcConfig.value = detailLivePlayerSource.rtcConfig || null;
    if (entryLiveType === "replay") {
      if (detailPushStatus !== 2)
        pushStatus.value = 1;
      isReplay.value = true;
    } else {
      isReplay.value = false;
    }
    applyScheduleAndReplayList(d, entryLiveType);
    return {
      detailLivePlayerSource,
      shouldReuseEarlyLivePlayer: !!earlyLivePlayerKey && detailLivePlayerSource.key === earlyLivePlayerKey,
      shouldShowCoverOnlyBeforeLive: entryLiveType === "live" && pages_broadcast_composables_liveEntryInitializerHelpers.isLiveNotStartedDetail(d)
    };
  }
  function applyScheduleAndReplayList(d, entryLiveType) {
    scheduleEnabled.value = toNumber(firstPresent(d.scheduleEnabled, d.schedule_enabled), 0);
    scheduleTimeStr.value = firstPresent(d.scheduleTime, d.schedule_time, "");
    pushTime.value = toNumber(firstPresent(d.pushTime, d.push_time), 0);
    warmUpVideoUrl.value = firstPresent(d.warmUpVideoUrl, d.warm_up_video_url, d.warmupVideoUrl, d.warmup_video_url, "");
    warmUpVideoCoverImage.value = firstPresent(
      d.warmUpVideoCoverImage,
      d.warm_up_video_cover_image,
      d.warmupVideoCoverImage,
      d.warmup_video_cover_image,
      ""
    );
    bizCode.value = firstPresent(d.bizCode, d.biz_code, "");
    nowTs.value = Date.now();
    replayVideosList.value = normalizeReplayVideos(d);
    if (isLiveVisualMode) {
      isLiveVisualMode.value = pages_broadcast_utils_entryFormat.resolveLiveVisualMode(entryLiveType);
    }
    const replayVideo = normalizeReplayVideoItem(firstPresent(d.replayVideo, d.replay_video, null) || {});
    replayCurrentVideoId.value = replayVideo.id || toNumber(firstPresent(d.resumeVideoId, d.resume_video_id), 0);
    replayLoopPlay.value = replayVideo.loopPlay === 1;
    replayCurrentIndex.value = replayCurrentVideoId.value && replayVideosList.value.length > 0 ? replayVideosList.value.findIndex((v) => v.id === replayCurrentVideoId.value) : -1;
  }
  function promoteEarlyReplayFirstVideo(playbackState = {}) {
    var _a;
    const firstVideo = (_a = playbackState == null ? void 0 : playbackState.earlyReplayFirstVideoState) == null ? void 0 : _a.video;
    if (!(firstVideo == null ? void 0 : firstVideo.videoUrl))
      return false;
    replayVideosList.value = [normalizeReplayVideoItem(firstVideo)].filter((item) => item.videoUrl);
    if (!replayVideosList.value.length)
      return false;
    const video = replayVideosList.value[0];
    roomGroupType.value = 1;
    isReplay.value = true;
    pushStatus.value = 1;
    replayCurrentIndex.value = 0;
    replayCurrentVideoId.value = Number(video.id || video.videoId || 0);
    replayLoopPlay.value = video.loopPlay === 1;
    if (video.termId > 0) {
      roomCurrentTermId.value = video.termId;
    }
    if (quickReplies) {
      quickReplies.value = Array.isArray(video.quickReplies) ? video.quickReplies : [];
    }
    if (liveStatusText)
      liveStatusText.value = "回放";
    replayLastTime.value = Number(firstVideo.elapsedSeconds || 0);
    recordPlaybackDebugEvent("replay_first_video_fallback", {
      videoId: replayCurrentVideoId.value,
      hasUrl: true,
      source: "/h5/live/replayFirstVideo"
    });
    return true;
  }
  async function ensureReplayFirstVideoFallback(state = {}, playbackState = {}) {
    if (state.entryLiveType !== "replay")
      return false;
    if (replayVideosList.value.length > 0)
      return false;
    if (promoteEarlyReplayFirstVideo(playbackState))
      return true;
    try {
      const firstVideoRaw = await api_live.getReplayFirstVideo(state.roomCode);
      const firstVideo = pages_broadcast_composables_liveEntryInitializerHelpers.normalizeReplayFirstVideoPayload(firstVideoRaw);
      if (!(firstVideo == null ? void 0 : firstVideo.videoUrl))
        return false;
      playbackState.earlyReplayFirstVideoState = {
        videoId: Number(firstVideo.videoId || 0),
        videoUrlKey: pages_broadcast_utils_liveSource.normalizeLiveSourceUrlKey(firstVideo.videoUrl),
        seekTo: Number(firstVideo.elapsedSeconds || 0),
        video: firstVideo
      };
      return promoteEarlyReplayFirstVideo(playbackState);
    } catch (err) {
      console.warn("[Live] replay first video fallback failed:", err);
      return false;
    }
  }
  function firstPresent(...values) {
    return values.find((item) => item !== void 0 && item !== null && item !== "");
  }
  function toNumber(value, fallback = 0) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }
  function getDetailPushStatus(detail = {}) {
    return toNumber(firstPresent(detail.pushStatus, detail.push_status, detail.liveStatus, detail.live_status, detail.status), 0);
  }
  function normalizeQuickReplies(value) {
    if (Array.isArray(value))
      return value;
    if (typeof value !== "string" || !value.trim())
      return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
    }
  }
  function normalizeReplayVideoItem(item = {}) {
    const sourceItem = item && typeof item === "object" ? item : {};
    const rawVideoId = firstPresent(sourceItem.id, sourceItem.videoId, sourceItem.video_id, sourceItem.replayVideoId, sourceItem.replay_video_id);
    const videoId = toNumber(rawVideoId, 0);
    const videoName = firstPresent(sourceItem.videoName, sourceItem.video_name, sourceItem.name, sourceItem.title, "");
    const replaySource = utils_videoPlay.selectReplayVideoPlaybackSource(sourceItem);
    const videoUrl2 = replaySource.playUrl || firstPresent(
      sourceItem.videoUrl,
      sourceItem.video_url,
      sourceItem.url,
      sourceItem.playUrl,
      sourceItem.play_url,
      sourceItem.m3u8Url,
      sourceItem.m3u8_url,
      sourceItem.hlsUrl,
      sourceItem.hls_url,
      sourceItem.fileUrl,
      sourceItem.file_url,
      ""
    );
    const coverImage = firstPresent(
      sourceItem.coverImage,
      sourceItem.cover_image,
      sourceItem.cover,
      sourceItem.image,
      sourceItem.imageUrl,
      sourceItem.image_url,
      sourceItem.poster,
      ""
    );
    const duration = toNumber(firstPresent(
      sourceItem.duration,
      sourceItem.durationSec,
      sourceItem.duration_sec,
      sourceItem.videoDuration,
      sourceItem.video_duration,
      sourceItem.length,
      sourceItem.seconds
    ), 0);
    const termId = toNumber(firstPresent(sourceItem.termId, sourceItem.term_id, sourceItem.liveTermId, sourceItem.live_term_id, sourceItem.term), 0);
    const loopPlay = toNumber(firstPresent(sourceItem.loopPlay, sourceItem.loop_play, sourceItem.isLoop, sourceItem.is_loop), 0);
    const termLoopPlay = toNumber(firstPresent(sourceItem.termLoopPlay, sourceItem.term_loop_play, sourceItem.loopByTerm, sourceItem.loop_by_term), 0);
    const startTime = firstPresent(
      sourceItem.startTime,
      sourceItem.start_time,
      sourceItem.beginTime,
      sourceItem.begin_time,
      sourceItem.playStartTime,
      sourceItem.play_start_time,
      ""
    );
    const estimatedEndTime = firstPresent(
      sourceItem.estimatedEndTime,
      sourceItem.estimated_end_time,
      sourceItem.endTime,
      sourceItem.end_time,
      sourceItem.finishTime,
      sourceItem.finish_time,
      ""
    );
    const quickReplies2 = normalizeQuickReplies(firstPresent(sourceItem.quickReplies, sourceItem.quick_replies, sourceItem.replyList, sourceItem.reply_list, []));
    return {
      ...sourceItem,
      id: videoId,
      videoId,
      video_id: videoId,
      replayVideoId: videoId,
      replay_video_id: videoId,
      videoName,
      video_name: videoName,
      videoUrl: videoUrl2,
      video_url: videoUrl2,
      backupUrl: replaySource.backupUrl || firstPresent(sourceItem.backupUrl, sourceItem.backup_url, ""),
      backup_url: replaySource.backupUrl || firstPresent(sourceItem.backup_url, sourceItem.backupUrl, ""),
      sourceType: replaySource.sourceType || firstPresent(sourceItem.sourceType, sourceItem.source_type, ""),
      source_type: replaySource.sourceType || firstPresent(sourceItem.source_type, sourceItem.sourceType, ""),
      coverImage,
      cover_image: coverImage,
      duration,
      termId,
      term_id: termId,
      loopPlay,
      loop_play: loopPlay,
      termLoopPlay,
      term_loop_play: termLoopPlay,
      startTime,
      start_time: startTime,
      estimatedEndTime,
      estimated_end_time: estimatedEndTime,
      endTime: firstPresent(sourceItem.endTime, sourceItem.end_time, estimatedEndTime, ""),
      end_time: firstPresent(sourceItem.end_time, sourceItem.endTime, estimatedEndTime, ""),
      quickReplies: quickReplies2,
      quick_replies: quickReplies2
    };
  }
  function normalizeReplayVideos(detail = {}) {
    const source = Array.isArray(detail.replayVideos) && detail.replayVideos.length ? detail.replayVideos : Array.isArray(detail.replay_videos) && detail.replay_videos.length ? detail.replay_videos : Array.isArray(detail.replayList) && detail.replayList.length ? detail.replayList : Array.isArray(detail.replay_list) && detail.replay_list.length ? detail.replay_list : Array.isArray(detail.replays) && detail.replays.length ? detail.replays : firstPresent(detail.replayVideo, detail.replay_video, null) ? [firstPresent(detail.replayVideo, detail.replay_video)] : [];
    return source.map((item) => normalizeReplayVideoItem(item)).filter((item) => item.videoUrl);
  }
  function normalizeSignFields(rawFields) {
    if (Array.isArray(rawFields))
      return rawFields;
    if (typeof rawFields !== "string" || !rawFields.trim())
      return [];
    try {
      const parsed = JSON.parse(rawFields);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  function normalizeSignConfig(rawConfig = {}) {
    if (!rawConfig || typeof rawConfig !== "object")
      return null;
    const fields = normalizeSignFields(firstPresent(rawConfig.fields, rawConfig.signFields, rawConfig.sign_fields, []));
    return {
      enabled: toNumber(firstPresent(rawConfig.enabled, rawConfig.signEnabled, rawConfig.sign_enabled, rawConfig.enableSign, rawConfig.enable_sign), 0),
      ruleType: toNumber(firstPresent(rawConfig.ruleType, rawConfig.rule_type), 1),
      welcomeText: firstPresent(rawConfig.welcomeText, rawConfig.welcome_text, ""),
      coverImage: firstPresent(rawConfig.coverImage, rawConfig.cover_image, ""),
      forceEnabled: toNumber(firstPresent(rawConfig.forceEnabled, rawConfig.force_enabled), 0),
      fields
    };
  }
  function normalizeReplayResumeState(d = {}) {
    return {
      resumeVideoId: toNumber(firstPresent(d.resumeVideoId, d.resume_video_id, d.videoId, d.video_id), 0),
      resumeVideoIndex: toNumber(firstPresent(d.resumeVideoIndex, d.resume_video_index, d.videoIndex, d.video_index), -1),
      resumePosition: toNumber(firstPresent(d.resumePosition, d.resume_position, d.lastPosition, d.last_position), 0)
    };
  }
  function handleAccessRestrictions(d) {
    if (d.isBlocked) {
      userBlocked.value = true;
      denyLiveAccess();
      refreshMissingProfile();
      return true;
    }
    if (d.trafficExceeded) {
      denyLiveAccess();
      common_vendor.index.showModal({
        title: "流量不足提示",
        content: d.trafficExceedMsg || "流量已超额，请联系商务人员充值",
        showCancel: false,
        confirmText: "我知道了"
      });
      return true;
    }
    if (d.needAuth && !d.hasAccess) {
      denyLiveAccess();
      refreshMissingProfile();
      return true;
    }
    return false;
  }
  function restoreReplayResume() {
    const { preferredIndex, preferredVideoId, preferredProgress } = getPreferredReplayResume();
    if (preferredVideoId > 0) {
      replayCurrentVideoId.value = preferredVideoId;
      replayCurrentIndex.value = preferredIndex;
    }
    const savedProgress = preferredProgress || getSavedReplayProgress(replayCurrentVideoId.value);
    replayLastTime.value = savedProgress;
    return { preferredIndex, preferredVideoId, preferredProgress, savedProgress };
  }
  function applyRoomSettingAndSign(d) {
    if (d.setting) {
      Object.assign(roomSetting.value, d.setting);
    }
    const normalizedSignConfig = normalizeSignConfig(firstPresent(d.signConfig, d.sign_config, d.sign, null));
    if (!normalizedSignConfig)
      return;
    signConfig.value = normalizedSignConfig;
    signFields.value = signConfig.value.fields;
    if (pages_broadcast_composables_useLiveSidePanels.isTruthyFlag(signConfig.value.enabled)) {
      loadSignStatus().then(() => {
        if (!hasSigned.value && mode.value === "portrait") {
          showSignPopup.value = true;
        }
      });
    }
  }
  function handleWaitingScheduleIfNeeded() {
    if (!isWaitingSchedule.value || pushStatus.value === 2)
      return false;
    if (warmUpVideoUrl.value) {
      pushStatus.value = 1;
      isReplay.value = true;
      replayCurrentVideoId.value = "warmup";
      const warmupSeek = getSavedReplayProgress("warmup");
      replayLastTime.value = warmupSeek || 0;
      setLastSavedProgress(warmupSeek || 0);
      setScheduleWarmupMode(true);
      initVideoPlayer(warmUpVideoUrl.value, { isReplay: true, seekTo: 0 });
    } else {
      pushStatus.value = 1;
      clearLiveVideoForCoverOnly();
    }
    startScheduleTimers();
    liveInitResolved.value = true;
    return true;
  }
  function initDetailVideoFlow(d, state, replayResume, playbackState) {
    const detailPushStatus = getDetailPushStatus(d);
    state.setDetailLivePlayerInitReached();
    const canFallbackToReplay = hasReplay.value && detailPushStatus !== 1 && replayVideosList.value.length > 0;
    if (state.entryLiveType === "replay" && replayVideosList.value.length > 0) {
      initReplayDetailPlayback(d, replayResume, state.reuseEarlyReplayFirstVideoIfSame);
    } else if (state.entryLiveType === "replay" && promoteEarlyReplayFirstVideo(playbackState)) {
      initReplayDetailPlayback(d, replayResume, state.reuseEarlyReplayFirstVideoIfSame);
    } else if (playbackState.shouldShowCoverOnlyBeforeLive && !canFallbackToReplay) {
      clearLiveVideoForCoverOnly();
    } else {
      initLiveDetailPlayback(d, playbackState);
    }
  }
  function initReplayDetailPlayback(d, replayResume, reuseEarlyReplayFirstVideoIfSame) {
    const detailPushStatus = getDetailPushStatus(d);
    isReplay.value = true;
    if (roomGroupType.value === 1 && detailPushStatus !== 2) {
      playReplayColumnFromProgress(d, replayResume.preferredIndex, reuseEarlyReplayFirstVideoIfSame);
    } else if (detailPushStatus === 0) {
      playPendingReplayFirstVideo();
    } else {
      pushStatus.value = 1;
      playScheduledReplayVideo(replayResume.preferredIndex, replayResume.savedProgress);
    }
  }
  function playReplayColumnFromProgress(d, preferredIndex, reuseEarlyReplayFirstVideoIfSame) {
    pushStatus.value = 1;
    const resolved = resolveReplayColumnPosition(d, preferredIndex);
    if (pushStatus.value === 2)
      return;
    if (!reuseEarlyReplayFirstVideoIfSame(resolved.index, resolved.position)) {
      playReplayVideoByIndex(resolved.index, resolved.position);
    }
  }
  function resolveReplayColumnPosition(d, preferredIndex) {
    var _a;
    const resumeState = normalizeReplayResumeState(d);
    let rIdx = -1;
    if (resumeState.resumeVideoId > 0) {
      const foundIdx = replayVideosList.value.findIndex((v) => Number(v.id) === Number(resumeState.resumeVideoId));
      if (foundIdx >= 0)
        rIdx = foundIdx;
    }
    if (rIdx < 0 && resumeState.resumeVideoIndex >= 0 && resumeState.resumeVideoIndex < replayVideosList.value.length) {
      rIdx = resumeState.resumeVideoIndex;
    }
    if (rIdx < 0)
      rIdx = preferredIndex >= 0 ? preferredIndex : 0;
    let rPos = resumeState.resumePosition || 0;
    if (rPos <= 0) {
      const actualVideoId = Number(((_a = replayVideosList.value[rIdx]) == null ? void 0 : _a.id) || 0);
      rPos = actualVideoId > 0 ? getSavedReplayProgress(actualVideoId) : 0;
    }
    return advanceReplayColumnIfCompleted(rIdx, rPos);
  }
  function advanceReplayColumnIfCompleted(rIdx, rPos) {
    const targetVideo = replayVideosList.value[rIdx];
    const targetTermId = (targetVideo == null ? void 0 : targetVideo.termId) || 0;
    const targetDuration = Number((targetVideo == null ? void 0 : targetVideo.duration) || 0);
    const targetLocalProgress = getSavedReplayProgress(Number((targetVideo == null ? void 0 : targetVideo.id) || 0));
    if (targetDuration <= 0 || rPos < targetDuration - 2 && targetLocalProgress < targetDuration - 2) {
      return { index: rIdx, position: rPos };
    }
    for (let ni = rIdx + 1; ni < replayVideosList.value.length; ni++) {
      const nv = replayVideosList.value[ni];
      if (roomWatchByDay.value === 1 && targetTermId && nv.termId && nv.termId !== targetTermId)
        break;
      const nvDuration = Number((nv == null ? void 0 : nv.duration) || 0);
      const nvProgress = getSavedReplayProgress(Number((nv == null ? void 0 : nv.id) || 0));
      if (nvDuration <= 0 || nvProgress < nvDuration - 2) {
        return { index: ni, position: nvProgress > 0 ? nvProgress : 0 };
      }
    }
    const currentTermVideo = replayVideosList.value[rIdx];
    const currentTermId = (currentTermVideo == null ? void 0 : currentTermVideo.termId) || 0;
    const isTermLoop = Number((currentTermVideo == null ? void 0 : currentTermVideo.termLoopPlay) || 0) === 1;
    if (isTermLoop && currentTermId > 0) {
      replayVideosList.value.forEach((v) => {
        if (Number((v == null ? void 0 : v.termId) || 0) === currentTermId) {
          const vid = Number((v == null ? void 0 : v.id) || 0);
          if (vid > 0) {
            try {
              common_vendor.index.removeStorageSync(`replay_progress_${liveId.value}_${vid}`);
            } catch (e) {
            }
          }
        }
      });
      const firstTermIdx = replayVideosList.value.findIndex((v) => v.termId === currentTermId);
      return { index: firstTermIdx >= 0 ? firstTermIdx : 0, position: 0 };
    }
    pushStatus.value = 2;
    isPlaying.value = false;
    return { index: rIdx, position: rPos };
  }
  function playPendingReplayFirstVideo() {
    pushStatus.value = 0;
    const firstVideo = replayVideosList.value[0];
    const firstStart = pages_broadcast_utils_entryFormat.safeParseReplayTime(firstVideo == null ? void 0 : firstVideo.startTime);
    if (firstStart && firstStart > Date.now()) {
      enterReplayPendingState(0);
      scheduleReplayStart(0, firstStart - Date.now());
    } else {
      pushStatus.value = 1;
      playReplayVideoByIndex(0, 0);
    }
  }
  function scheduleReplayStart(index, delay) {
    setReplayFutureStartTimer(setTimeout(() => {
      setReplayFutureStartTimer(null);
      pushStatus.value = 1;
      playReplayVideoByIndex(index, 0);
    }, delay));
  }
  function playScheduledReplayVideo(preferredIndex, savedProgress) {
    const allDone = readReplayAllDone();
    const { activeIdx, futureIdx } = findReplayScheduleWindow();
    if (activeIdx >= 0) {
      playActiveReplayVideo(activeIdx, allDone, preferredIndex, savedProgress);
    } else if (futureIdx >= 0) {
      waitFutureReplayVideo(futureIdx);
    } else if (shouldPlayUnscheduledReplayList()) {
      playUnscheduledReplayVideo(preferredIndex, savedProgress);
    } else {
      pushStatus.value = 2;
      isPlaying.value = false;
    }
  }
  function shouldPlayUnscheduledReplayList() {
    return replayVideosList.value.length > 0 && replayVideosList.value.every((video) => {
      return !pages_broadcast_utils_entryFormat.safeParseReplayTime(video.startTime) && !pages_broadcast_utils_entryFormat.safeParseReplayTime(video.estimatedEndTime);
    });
  }
  function playUnscheduledReplayVideo(preferredIndex, savedProgress) {
    const index = preferredIndex >= 0 && preferredIndex < replayVideosList.value.length ? preferredIndex : 0;
    const replay = replayVideosList.value[index] || {};
    recordPlaybackDebugEvent("unscheduled_replay_fallback", {
      index,
      videoId: replay.id || replay.videoId || 0,
      hasUrl: !!replay.videoUrl,
      source: "detail.replays"
    });
    pushStatus.value = 1;
    playReplayVideoByIndex(index, index === preferredIndex ? savedProgress : 0);
  }
  function readReplayAllDone() {
    try {
      const saved = common_vendor.index.getStorageSync(`replay_all_done_${liveId.value}`);
      if (!saved)
        return false;
      const currentIds = replayVideosList.value.map((v) => v.id).join(",");
      if (saved !== currentIds) {
        common_vendor.index.removeStorageSync(`replay_all_done_${liveId.value}`);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  function findReplayScheduleWindow() {
    const now = Date.now();
    let activeIdx = -1;
    let futureIdx = -1;
    for (let i = 0; i < replayVideosList.value.length; i++) {
      const v = replayVideosList.value[i];
      const vStart = pages_broadcast_utils_entryFormat.safeParseReplayTime(v.startTime);
      const vEnd = pages_broadcast_utils_entryFormat.safeParseReplayTime(v.estimatedEndTime);
      if (vStart && now >= vStart && (!vEnd || now < vEnd)) {
        activeIdx = i;
        break;
      }
      if (vStart && now < vStart && futureIdx === -1) {
        futureIdx = i;
      }
    }
    return { activeIdx, futureIdx };
  }
  function playActiveReplayVideo(activeIdx, allDone, preferredIndex, savedProgress) {
    const activeVideo = replayVideosList.value[activeIdx];
    const isLoop = Number((activeVideo == null ? void 0 : activeVideo.loopPlay) || 0) === 1;
    if (allDone && !isLoop) {
      pushStatus.value = 2;
      isPlaying.value = false;
    } else if (allDone && isLoop) {
      try {
        common_vendor.index.removeStorageSync(`replay_all_done_${liveId.value}`);
      } catch (e) {
      }
      playReplayVideoByIndex(activeIdx, 0);
    } else if (preferredIndex !== -1 && savedProgress > 0 && preferredIndex === activeIdx) {
      playReplayVideoByIndex(preferredIndex, savedProgress);
    } else {
      try {
        common_vendor.index.removeStorageSync(`replay_all_done_${liveId.value}`);
      } catch (e) {
      }
      playReplayVideoByIndex(activeIdx, 0);
    }
  }
  function waitFutureReplayVideo(futureIdx) {
    const futureVideo = replayVideosList.value[futureIdx];
    const futureStart = pages_broadcast_utils_entryFormat.safeParseReplayTime(futureVideo.startTime);
    enterReplayPendingState(futureIdx);
    scheduleReplayStart(futureIdx, futureStart - Date.now());
  }
  function initLiveDetailPlayback(d, playbackState = {}) {
    var _a;
    const shouldReuseEarlyLivePlayer = !!playbackState.shouldReuseEarlyLivePlayer;
    if (roomGroupType.value === 0 && ((_a = rtcConfig == null ? void 0 : rtcConfig.value) == null ? void 0 : _a.appId)) {
      isReplay.value = false;
      if (!shouldReuseEarlyLivePlayer) {
        initVideoPlayer(pullUrl.value || "", {
          backupUrl: pullUrl.value || "",
          rtcConfig: rtcConfig.value
        });
      }
    } else if (roomGroupType.value === 0 && hasReplay.value && getDetailPushStatus(d) !== 1 && replayVideosList.value.length > 0) {
      const replay = replayVideosList.value[0];
      isReplay.value = true;
      pushStatus.value = 1;
      replayCurrentIndex.value = 0;
      replayCurrentVideoId.value = Number(replay.id || replay.videoId || 0);
      if (liveStatusText)
        liveStatusText.value = "回放";
      playReplayVideoByIndex(0, 0);
    } else if (pullUrl.value) {
      initStandardLivePlayer(d, playbackState);
    }
  }
  function initStandardLivePlayer(d, playbackState = {}) {
    var _a;
    const shouldReuseEarlyLivePlayer = !!playbackState.shouldReuseEarlyLivePlayer;
    isReplay.value = false;
    if (shouldReuseEarlyLivePlayer) {
      recordPlaybackDebugEvent("reuse_early_live_player", {
        currentUrl: (videoUrl == null ? void 0 : videoUrl.value) || "",
        detailUrl: pullUrl.value || ""
      });
      return;
    }
    const source = ((_a = playbackState.detailLivePlayerSource) == null ? void 0 : _a.key) ? playbackState.detailLivePlayerSource : pages_broadcast_composables_liveEntryInitializerHelpers.buildLivePlayerSource(d, pages_broadcast_utils_liveSource.isIOSRuntime(), getPreferredLiveQuality());
    initVideoPlayer(source.mainUrl || pullUrl.value, source.options || {});
  }
  async function finishDetailInit() {
    const wsUrl = ctx.buildWsUrl(liveId.value);
    if (wsUrl) {
      await initWebSocket(wsUrl);
    }
    if (!isReplay.value && roomSetting.value.showHistory === 1) {
      loadCommentHistory();
    }
    await Promise.all([loadProductList(true), loadCurrentProduct()]);
    checkDistributorStatus();
    if (!showEntryOverlay.value) {
      await reportLiveEntry();
      setTimeout(() => {
        sendFallbackEnter == null ? void 0 : sendFallbackEnter();
      }, 1500);
    }
    startStatusPoll();
    liveInitResolved.value = true;
    if (pendingRecoverBuyCtx.value) {
      recoverBuyContextFromWxPick().catch(
        (e) => console.warn("[Live] recoverBuyContext async fail:", e)
      );
    }
  }
  function checkDistributorStatus() {
    if (!userStore.token)
      return;
    api_live.checkDistributor(liveId.value).then((result) => {
      const _isDistributor = !!(result == null ? void 0 : result.isDistributor);
      const _distributorStatus = Number((result == null ? void 0 : result.status) || 0);
      isDistributor.value = _isDistributor;
      distributorStatus.value = _distributorStatus;
      try {
        utils_liveRoomContext.saveLiveRoomContext({
          roomCode: roomCode.value || "",
          liveId: liveId.value || "",
          isDistributor: _isDistributor,
          distributorStatus: _distributorStatus
        });
      } catch (_) {
      }
    }).catch((e) => {
      console.warn("[Live] checkDistributor fail:", e);
    });
  }
  return {
    initLive,
    getLastInitOptions,
    setPendingSubscribeBack,
    reportLiveEntry,
    isDistributor,
    distributorStatus
  };
}
exports.useLiveEntryInitializer = useLiveEntryInitializer;
