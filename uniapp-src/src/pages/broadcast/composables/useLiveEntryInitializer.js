import { nextTick, ref } from "vue";
import { enterLiveRoom, getLiveDetail, getReplayFirstVideo, reportViewProgress, checkDistributor } from "@/api/live.js";
import { getProfile } from "@/api/user";
import { pinia } from "@/stores";
import { useDomainStore } from "@/stores/domain";
import { isMpWeixinRuntime } from "@/platform/weixin/runtime";
import { readBindId } from "@/services/h5-auth-context";
import { logoutAndRedirect } from "@/services/logout";
import { saveLiveRoomContext, loadLiveRoomContext } from "@/utils/live-room-context";
import { loadLiveMiniState } from "@/utils/live-mini-state";
import { isLocalDevelopmentHost } from "@/utils/url-helpers";
import { deriveMp4FromM3u8, selectReplayVideoPlaybackSource } from "@/utils/videoPlay.js";
import { isTruthyFlag } from "./useLiveSidePanels.js";
import { getReplayVideoEndTime, normalizeLiveType, normalizeMode, resolveLiveVisualMode, safeParseReplayTime } from "../utils/entry-format.js";
import { resolveLiveEntryOptions } from "../utils/entry-init.js";
import { prepareLandingDomains } from "../utils/domain-ready.js";
import { resolveIOSWechatRefreshSoundIntent } from "../utils/refresh-sound-intent.js";
import { consumePreloadedLiveDetail } from "./useLiveEntryBootstrap.js";
import { buildLivePlayerSource, getLiveStreamInfWithRetry, isIOSRuntime, isLiveNotStartedDetail, isReplayPortraitEntryMode, normalizeLiveSourceUrlKey, normalizeReplayFirstVideoPayload, shouldPreferMiniProgramHlsPlayback, summarizeLiveSourcePayload } from "./live-entry-initializer-helpers.js";

/**
 * 直播间详情初始化与入口恢复。
 * 职责边界：解析 initLive 需要的后端详情、权限、录播/直播入口和首屏启动动作；播放器底层行为由 playback hooks 接管。
 */
export function useLiveEntryInitializer(ctx) {
  // [分销员] 响应式状态：供 stage 组件 v-if 控制分享按钮可见性
  //   - isDistributor: 是否是本直播间的分销员
  //   - distributorStatus: 1=启用 0=禁用
  const isDistributor = ref(false);
  const distributorStatus = ref(0);
  const {
    runtime, stopScheduleTimers, liveInitResolved, liveRedirecting, accessDenied, viewerLimitReached, viewerLimitText,
    showEntryOverlay, shouldShowEntryOverlay, showReplayFirstVideoLoading, pendingRecoverBuyCtx, isWeChatIOSH5, isMuted, replayCover,
    resetReplayContext, liveId, roomCode, shareCode, liveBindId, liveTenantId, liveName, liveCover, mode, userStore, myUserId,
    getLiveRedirectUrl, rtcConfig, roomGroupType, roomBroadcastMethod, roomWatchByDay, roomCurrentTermId,
    _isSameOrigin, anchorName, anchorAvatar, setViewerCountDisplay, likeCount, saveContextOptions, chatBgImage,
    liveDate, pushStatus, pullUrl, videoUrl, videoFrameReady, isReplay, isLiveVisualMode, hasReplay, liveStatusText,
    isWaitingSchedule, isPlaying, scheduleEnabled, scheduleTimeStr, pushTime, warmUpVideoUrl, warmUpVideoCoverImage,
    bizCode, nowTs, replayVideosList, replayCurrentVideoId, replayLoopPlay, replayCurrentIndex, userBlocked,
    roomSetting, getPreferredReplayResume, getSavedReplayProgress, replayLastTime, signConfig, signFields, hasSigned,
    showSignPopup, loadSignStatus, switchToFirstAvailableTab, setScheduleWarmupMode, setLastSavedProgress,
    initVideoPlayer, startScheduleTimers, getReplayVideoSchedule, enterReplayPendingState, setReplayFutureStartTimer,
    playReplayVideoByIndex, initWebSocket, loadCommentHistory, loadProductList, loadCurrentProduct, sessionId,
    setEnterTimestamp, applyH5ViewerEnterBoost, startHeartbeat, stopHeartbeat, startStatusPoll, stopStatusPoll,
    recoverBuyContextFromWxPick, onLiveDetailLoaded, quickReplies, sendFallbackEnter, closeLiveSocket,
    getLiveVideoElement, getVideoPlayer, setVideoPlayer, markStoredSoundIntentRestore, clearStoredSoundIntentRestore,
    setIOSWechatBridgeSoundAutoPlayAllowed,
    recordPlaybackDebugEvent = () => {},
    setPullStreams = () => {},
    getPreferredLiveQuality = () => "",
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
  function isEntryOverlayVisible() {
    if (shouldShowEntryOverlay && typeof shouldShowEntryOverlay.value !== "undefined") {
      return !!shouldShowEntryOverlay.value;
    }
    return !!(showEntryOverlay.value && !isWeChatIOSH5 && !isMpWeixinRuntime());
  }
  function clearLiveVideoForCoverOnly() {
    pullUrl.value = "";
    if (videoUrl) videoUrl.value = "";
    isPlaying.value = false;
    if (videoFrameReady) videoFrameReady.value = false;
    try {
      const player = getVideoPlayer?.();
      if (player && typeof player.destroy === "function") player.destroy();
      setVideoPlayer?.(null);
    } catch (e) {}
    try {
      const el = getLiveVideoElement?.();
      if (el) {
        el.pause?.(); el.removeAttribute?.("src"); el.load?.();
      }
    } catch (e) {}
  }

  function applyViewerLimitReached(data = {}) {
    if (viewerLimitText) viewerLimitText.value = data.viewerLimitText || data.message || "观看人数已达上限";
    if (viewerLimitReached) viewerLimitReached.value = true;
    accessDenied.value = false;
    showEntryOverlay.value = false;
    liveInitResolved.value = true;
    stopHeartbeat?.(); stopStatusPoll?.(); closeLiveSocket?.();
    clearLiveVideoForCoverOnly();
  }

  async function reportLiveEntry() {
    if (!userStore.token || sessionId.value || isEntryOverlayVisible() || accessDenied.value || viewerLimitReached?.value) return false;
    sessionId.value =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    setEnterTimestamp(Date.now());
    try {
      await enterLiveRoom(
        liveId.value,
        sessionId.value,
        shareCode?.value || roomCode.value || "",
        roomCurrentTermId.value || 0,
      );
    } catch (err) {
      const data = err?.response?.data || {};
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
      reportViewProgress({
        roomId: Number(liveId.value),
        termId: Number(roomCurrentTermId.value),
        videoId: Number(replayCurrentVideoId.value),
        watchStatus: 1,
      }).catch((e) => console.warn("[Live] reportViewProgress fail:", e));
    }
    startHeartbeat();
    // #ifdef H5
    try {
      const domainStore = useDomainStore(pinia);
      if (domainStore.isOnLandingDomain() && domainStore.payAuthDomain) {
        import("@/services/bindid").then(({ bindIDManager }) => {
          const authUrl = domainStore.getPayAuthDomainUrl();
          const token = userStore.token;
          const landings = domainStore.landingDomains || [];
          const shares = domainStore.shareDomains && domainStore.shareDomains.length > 0
            ? domainStore.shareDomains
            : (domainStore.h5Domain ? [domainStore.h5Domain] : []);
          const allTargets = [...landings, ...shares];
          bindIDManager.syncLoginToOtherDomains(authUrl, allTargets, token)
            .catch((e) => console.warn("[Live] BindID同步登录异常:", e));
        });
      }
    } catch (e) {
      console.warn("[Live] BindID同步初始化异常:", e);
    }
    // #endif
    return true;
  }
  function resetInitLiveState(options) {
    runtime.lastInitOptions = options;
    stopScheduleTimers();
    liveInitResolved.value = false;
    liveRedirecting.value = false;
    accessDenied.value = false;
    if (viewerLimitReached) viewerLimitReached.value = false;
    if (viewerLimitText) viewerLimitText.value = "观看人数已达上限";
    // [2026-05-21] 微信内 webview 复用场景：从 A 直播间跳到 C 时，sessionId 仍保有上次的值，
    // 导致 reportLiveEntry 的守卫 sessionId.value 为 truthy 而直接 return false，
    // enterLiveRoom 不被调用，C 的 click_log 丢失。每次 initLive 重置，保证新直播间能正常上报。
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
    const resolvedOptions = resolveLiveEntryOptions(options, liveId.value, { loadLiveRoomContext });
    const _roomCode = resolvedOptions.roomCode;
    const entryLiveType = normalizeLiveType(resolvedOptions.liveType);
    const resolvedBindId = resolvedOptions.bindId || readBindId();
    liveId.value = resolvedOptions.liveId;
    roomCode.value = _roomCode;
    if (shareCode) shareCode.value = resolvedOptions.shareCode || "";
    if (liveBindId) liveBindId.value = resolvedBindId || "";
    showEntryOverlay.value = (pendingRecoverBuyCtx.value || runtime.pendingSubscribeBack)
      ? false
      : (!isWeChatIOSH5 && !isMpWeixinRuntime());
    applyRefreshSoundIntent(_roomCode);
    applyResolvedEntryOptions(resolvedOptions, entryLiveType);
    if (!_roomCode) {
      console.error("[Live] 缺少roomCode参数", {
        liveId: liveId.value || "",
        rawRoomId: options.roomId || "",
        rawLiveId: options.liveId || options.live_id || "",
      });
      uni.showToast({
        title: liveId.value ? "缺少直播间口令，请使用新版直播链接" : "缺少直播间参数",
        icon: "none",
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
    const refreshSoundIntent = resolveIOSWechatRefreshSoundIntent({ isWeChatIOSH5, roomCode: _roomCode, loadState: loadLiveMiniState });
    setIOSWechatBridgeSoundAutoPlayAllowed?.(refreshSoundIntent.allowBridgeSoundAutoPlay);
    if (refreshSoundIntent.shouldRestoreSound) {
      markStoredSoundIntentRestore?.();
    } else {
      clearStoredSoundIntentRestore?.();
    }
    // 首次进入直播间保持原有自动播放策略：直接尝试有声播放；平台拦截时再走播放兜底。
    isMuted.value = false;
  }

  function applyResolvedEntryOptions(resolvedOptions, entryLiveType) {
    roomGroupType.value = entryLiveType === "live" ? 0 : 1;
    isReplay.value = entryLiveType === "replay";
    if (isLiveVisualMode) isLiveVisualMode.value = resolveLiveVisualMode(entryLiveType);
    if (resolvedOptions.tenantId) liveTenantId.value = resolvedOptions.tenantId;
    liveName.value = resolvedOptions.liveName;
    uni.setNavigationBarTitle({ title: liveName.value || "直播间" });
    liveCover.value = resolvedOptions.liveCover;
    if (replayCover) replayCover.value = entryLiveType === "replay" ? (resolvedOptions.liveCover || "") : "";
    if (resolvedOptions.mode) {
      mode.value = resolvedOptions.mode;
    } else if (entryLiveType === "live") {
      mode.value = "";
    }
    if (userStore.userInfo?.id) myUserId.value = Number(userStore.userInfo.id) || 0;
  }

  function saveInitialLiveRoomContext(options, _roomCode, entryLiveType) {
    try {
      const _currentTc = options._tc || "";
      saveLiveRoomContext({
        roomCode: _roomCode,
        tenantId: options.tenantId || "",
        liveId: liveId.value || "",
        bindId: options.bindId || options.bind_id || readBindId() || "",
        _ad: "",
        _tc: _currentTc,
        liveType: entryLiveType,
        isReplay: entryLiveType === "replay",
        replay: entryLiveType === "replay" ? "1" : "",
        videoId: options.videoId || options.video_id || options.replayVideoId || options.replay_video_id || "",
        video_id: options.video_id || options.videoId || options.replayVideoId || options.replay_video_id || "",
        replayVideoId: options.replayVideoId || options.videoId || options.video_id || options.replay_video_id || "",
        replay_video_id: options.replay_video_id || options.replayVideoId || options.videoId || options.video_id || "",
      });
    } catch (e) {}
  }

  function denyLiveAccess() {
    accessDenied.value = true;
    showEntryOverlay.value = false;
    liveInitResolved.value = true;
  }

  function refreshMissingProfile() {
    if (!userStore.token || (userStore.userInfo?.avatar && userStore.userInfo?.nickname)) {
      return;
    }
    getProfile().then((profile) => {
      if (profile?.id) {
        userStore.setUserInfo({ ...(userStore.userInfo || {}), ...profile });
      }
    }).catch(() => {});
  }

  async function initLive(rawOptions) {
    const initCtx = resolveInitLiveContext(rawOptions);
    if (!initCtx) return;
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
      const source = buildLivePlayerSource(streamInfo, shouldPreferMiniProgramHlsPlayback(), getPreferredLiveQuality());
      if (!source.key) return false;
      const streamPushStatus = streamInfo?.pushStatus ?? streamInfo?.liveStatus ?? streamInfo?.status;
      if (streamPushStatus !== undefined && streamPushStatus !== null && Number(streamPushStatus || 0) !== 1) {
        return false;
      }
      const streamMode = normalizeMode(streamInfo);
      if (streamMode) mode.value = streamMode;
      roomGroupType.value = 0;
      pushStatus.value = 1;
      isReplay.value = false;
      pullUrl.value = source.mainUrl || pullUrl.value || "";
      if (rtcConfig) rtcConfig.value = source.rtcConfig || null;
      earlyLivePlayerKey = source.key;
      recordPlaybackDebugEvent("stream_info_source", summarizeLiveSourcePayload(streamInfo, source));
      initVideoPlayer(source.mainUrl || "", source.options);
      return true;
    };

    const reuseEarlyReplayFirstVideoIfSame = (targetIndex, targetPosition) => {
      if (!earlyReplayFirstVideoState) return false;
      if (mode.value !== "portrait" || !isReplay.value) return false;
      const targetVideo = replayVideosList.value[targetIndex];
      if (!targetVideo?.videoUrl) return false;
      const targetVideoId = Number(targetVideo.id || targetVideo.videoId || 0);
      const sameVideoId = targetVideoId > 0 && targetVideoId === Number(earlyReplayFirstVideoState.videoId || 0);
      const targetVideoUrlKey = normalizeLiveSourceUrlKey(targetVideo.videoUrl);
      const sameVideoUrl = targetVideoUrlKey === earlyReplayFirstVideoState.videoUrlKey;
      if (!sameVideoId && !sameVideoUrl) return false;
      const currentPlaybackUrlKey = normalizeLiveSourceUrlKey(videoUrl?.value || pullUrl?.value || "");
      if (currentPlaybackUrlKey !== targetVideoUrlKey) return false;
      if (Number(targetPosition || 0) > 0 && !getLiveVideoElement?.()) return false;
      reuseEarlyReplayState(targetIndex, targetPosition, targetVideo);
      earlyReplayFirstVideoState = null;
      return true;
    };

    const setEarlyReplayFirstVideo = (firstVideo) => {
      earlyReplayFirstVideoState = {
        videoId: Number(firstVideo.videoId || 0),
        videoUrlKey: normalizeLiveSourceUrlKey(firstVideo.videoUrl),
        seekTo: Number(firstVideo.elapsedSeconds || 0),
        video: firstVideo,
      };
    };

    function primeReplayFirstVideo() {
      const shouldPrimeReplayPortrait =
        entryLiveType === "replay" &&
        isReplayPortraitEntryMode(resolvedOptions.mode, mode.value);
      if (!shouldPrimeReplayPortrait) return;
      setReplayFirstVideoLoading(true);
      getReplayFirstVideo(_roomCode)
        .then((firstVideoRaw) => {
          handleReplayFirstVideoResult(firstVideoRaw, initToken, () => detailLivePlayerInitReached, setEarlyReplayFirstVideo);
        })
        .catch((err) => {
          setReplayFirstVideoLoading(false);
          console.warn("[Live] replay first video preload failed:", err);
        });
    }

    try {
      primeReplayFirstVideo();
      startEarlyLiveStream(entryLiveType, _roomCode, startEarlyLivePlayer);
      const preloadedDetail = consumePreloadedLiveDetail(_roomCode);
      const d = normalizeLiveDetailPayload(preloadedDetail || await getLiveDetail(_roomCode));
      if (d) {
        await handleLiveDetail(d, {
          options,
          entryLiveType,
          roomCode: _roomCode,
          setDetailLivePlayerInitReached: () => { detailLivePlayerInitReached = true; },
          getEarlyLivePlayerKey: () => earlyLivePlayerKey,
          getEarlyLiveStreamInfo: () => earlyLiveStreamInfo,
          getEarlyReplayFirstVideoState: () => earlyReplayFirstVideoState,
          reuseEarlyReplayFirstVideoIfSame,
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
    const firstVideo = normalizeReplayFirstVideoPayload(firstVideoRaw);
    if (!firstVideo) return;
    if (runtime.liveInitToken !== initToken || isDetailReached()) return;
    if (mode.value !== "portrait" || !isReplay.value) return;
    if (firstVideo.coverImage && replayCover && !replayCover.value) {
      replayCover.value = firstVideo.coverImage;
    }
    if (!firstVideo.videoUrl) return;
    const backupUrl = deriveMp4FromM3u8(firstVideo.videoUrl);
    const firstVideoBackupUrl = backupUrl && backupUrl !== firstVideo.videoUrl ? backupUrl : "";
    roomGroupType.value = 1;
    isReplay.value = true;
    pushStatus.value = 1;
    setEarlyReplayFirstVideo(firstVideo);
    initVideoPlayer(firstVideo.videoUrl, {
      isReplay: true,
      seekTo: firstVideo.elapsedSeconds,
      backupUrl: firstVideoBackupUrl,
      nativeLoadTimeoutMs: isIOSRuntime() ? 700 : undefined,
    });
  }

  function normalizeLiveDetailPayload(payload = {}) {
    if (!payload || typeof payload !== "object") return payload;
    const data = payload.data && typeof payload.data === "object" ? payload.data : payload;
    const liveDetail = data.live_detail && typeof data.live_detail === "object" ? data.live_detail : {};
    const roomSetting = data.room_setting && typeof data.room_setting === "object" ? data.room_setting : null;
    const setting = data.setting && typeof data.setting === "object" ? data.setting : roomSetting;
    return {
      ...payload,
      ...data,
      ...liveDetail,
      code: firstPresent(payload.code, data.code),
      message: firstPresent(payload.msg, payload.message, data.msg, data.message, liveDetail.msg, liveDetail.message),
      setting,
      room_setting: roomSetting || setting,
      live_detail: liveDetail,
    };
  }

  function reuseEarlyReplayState(targetIndex, targetPosition, targetVideo) {
    const targetSeconds = Math.max(0, Number(targetPosition || 0) || 0);
    const currentEl = getLiveVideoElement?.();
    const currentTime = Number(currentEl?.currentTime || 0);
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
        try { currentEl.currentTime = targetSeconds; } catch (e) {}
      }
    }
    replayLastTime.value = effectiveSeconds;
    try { loadCommentHistory(); } catch (e) { console.warn("[Live] reuseEarlyReplay loadCommentHistory fail:", e); }
  }

  function startEarlyLiveStream(entryLiveType, _roomCode, startEarlyLivePlayer) {
    if (entryLiveType !== "live") return;
    getLiveStreamInfWithRetry(_roomCode)
      .then((streamInfo) => {
        startEarlyLivePlayer(streamInfo);
      })
      .catch(() => {});
  }

  async function handleLiveDetail(d, state) {
    if (handleNeedRelogin(d)) return;
    applyDetailIdentity(d, state);
    if (d.viewerLimitReached) {
      liveName.value = d.roomName || liveName.value;
      uni.setNavigationBarTitle({ title: liveName.value || "直播间" });
      applyViewerLimitReached(d);
      return;
    }
    if (await applyTenantDomainAndRedirect(d)) return;
    await applyDetailDisplayState(d, state);
    const playbackState = applyDetailPlaybackState(
      d,
      state.entryLiveType,
      state.getEarlyLivePlayerKey(),
      state.getEarlyLiveStreamInfo?.(),
    );
    playbackState.earlyReplayFirstVideoState = state.getEarlyReplayFirstVideoState?.() || null;
    if (handleAccessRestrictions(d)) return;
    await ensureReplayFirstVideoFallback(state, playbackState);
    const replayResume = restoreReplayResume();
    applyRoomSettingAndSign(d);
    switchToFirstAvailableTab();
    if (handleWaitingScheduleIfNeeded()) return;
    initDetailVideoFlow(d, state, replayResume, playbackState);
    await finishDetailInit();
  }

  function handleNeedRelogin(d) {
    const needRelogin = firstPresent(d.needReLogin, d.need_relogin, d.need_re_login, false);
    if (!needRelogin) return false;
    liveRedirecting.value = true;
    uni.showToast({ title: d.message || "正在跳转登录", icon: "none" });
    logoutAndRedirect(getLiveRedirectUrl(), firstPresent(d.tenantId, d.tenant_id));
    return true;
  }

  function resolveDetailRoomId(detail = {}) {
    return firstPresent(
      detail.roomId,
      detail.room_id,
      liveId.value,
    );
  }

  function applyDetailIdentity(d, state) {
    liveId.value = resolveDetailRoomId(d);
    const customerId = firstPresent(d.customerId, d.customer_id, d.userId, d.user_id);
    if (customerId) {
      myUserId.value = Number(customerId) || 0;
    }
    roomGroupType.value = state.entryLiveType === "live" ? 0 : 1;
    if (roomBroadcastMethod) {
      const broadcastMethod = firstPresent(d.broadcastMethod, d.broadcast_method, null);
      roomBroadcastMethod.value = broadcastMethod === undefined || broadcastMethod === null
        ? null
        : Number(broadcastMethod) || 0;
    }
    roomWatchByDay.value = toNumber(firstPresent(d.watchByDay, d.watch_by_day), 0);
    roomCurrentTermId.value = toNumber(firstPresent(d.currentTermId, d.current_term_id, d.termId, d.term_id), 0);
    try {
      saveLiveRoomContext({
        roomCode: state.roomCode,
        liveId: liveId.value || "",
        roomId: liveId.value || "",
        tenantId: liveTenantId.value || state.options?.tenantId || "",
        liveType: state.entryLiveType,
        isReplay: state.entryLiveType === "replay",
        replay: state.entryLiveType === "replay" ? "1" : "",
        videoId: state.options?.videoId || state.options?.video_id || state.options?.replayVideoId || state.options?.replay_video_id || "",
        video_id: state.options?.video_id || state.options?.videoId || state.options?.replayVideoId || state.options?.replay_video_id || "",
        replayVideoId: state.options?.replayVideoId || state.options?.videoId || state.options?.video_id || state.options?.replay_video_id || "",
        replay_video_id: state.options?.replay_video_id || state.options?.replayVideoId || state.options?.videoId || state.options?.video_id || "",
      });
    } catch (e) {}
    if (quickReplies) {
      quickReplies.value = normalizeQuickReplies(firstPresent(d.quickReplies, d.quick_replies, []));
    }
    onLiveDetailLoaded?.(d);
  }

  async function applyTenantDomainAndRedirect(d) {
    const tenantId = firstPresent(d.tenantId, d.tenant_id);
    if (!tenantId) return false;
    liveTenantId.value = tenantId;
    const domainStore = useDomainStore(pinia);
    await domainStore.load(tenantId);
    prepareLandingDomains(domainStore);
    return false;
  }

  async function applyDetailDisplayState(d, state) {
    const newMode = state.entryLiveType === "live"
      ? (normalizeMode(d) || mode.value || state.options.mode || "portrait")
      : (normalizeMode(d) || state.options.mode || "portrait");
    if (newMode !== mode.value) {
      mode.value = newMode;
      await nextTick();
    }
    anchorName.value = firstPresent(d.anchorName, d.anchor_name, d.nickname, anchorName.value);
    anchorAvatar.value = firstPresent(d.anchorAvatar, d.anchor_avatar, d.avatar, anchorAvatar.value);
    setViewerCountDisplay(String(firstPresent(d.onlineCount, d.online_count, d.viewCount, d.view_count, 0)));
    const __remoteLike = Number(firstPresent(d.likeCount, d.like_count, d.totalLikes, d.total_likes, 0));
    const __localLike = Number(likeCount.value || 0);
    likeCount.value = Math.max(
      Number.isFinite(__localLike) ? __localLike : 0,
      Number.isFinite(__remoteLike) ? __remoteLike : 0,
    );
    liveName.value = firstPresent(d.roomName, d.room_name, d.liveName, d.live_name, d.title, liveName.value);
    uni.setNavigationBarTitle({ title: liveName.value || "直播间" });
    liveCover.value = firstPresent(d.coverImage, d.cover_image, d.cover, d.poster, liveCover.value);
    if (state.entryLiveType === "replay" && replayCover && liveCover.value && !replayCover.value) {
      replayCover.value = liveCover.value;
    }
    saveDetailContextOptions(state);
    chatBgImage.value = firstPresent(d.chatBgImage, d.chat_bg_image, d.chatBackgroundImage, d.chat_background_image, d.chatBackground, d.chat_background, chatBgImage.value);
    liveDate.value = firstPresent(d.startTime, d.start_time, d.beginTime, d.begin_time, liveDate.value);
  }

  function saveDetailContextOptions(state) {
    try {
      saveContextOptions({
        roomCode: roomCode.value || "",
        tenantId: liveTenantId.value || "",
        liveId: liveId.value || "",
        _ad: "",
        _tc: state.options._tc || "",
        liveName: liveName.value || "",
        cover: state.entryLiveType === "replay" ? (replayCover?.value || "") : (liveCover.value || ""),
        liveType: state.entryLiveType,
        isReplay: state.entryLiveType === "replay",
        replay: state.entryLiveType === "replay" ? "1" : "",
        videoId: replayCurrentVideoId.value || state.options?.videoId || state.options?.video_id || "",
        video_id: replayCurrentVideoId.value || state.options?.video_id || state.options?.videoId || "",
        replayVideoId: replayCurrentVideoId.value || state.options?.replayVideoId || state.options?.videoId || state.options?.video_id || "",
        replay_video_id: replayCurrentVideoId.value || state.options?.replay_video_id || state.options?.replayVideoId || state.options?.videoId || state.options?.video_id || "",
      });
    } catch (_) {}
  }

  function applyDetailPlaybackState(d, entryLiveType, earlyLivePlayerKey, earlyLiveStreamInfo) {
    const detailPushStatus = getDetailPushStatus(d);
    pushStatus.value = detailPushStatus;
    hasReplay.value = !!firstPresent(d.hasReplay, d.has_replay, d.replayEnabled, d.replay_enabled, false);
    if (liveStatusText) liveStatusText.value = firstPresent(d.liveStatusText, d.live_status_text, d.statusText, d.status_text, "");
    setPullStreams(d);
    const detailLivePlayerSource = detailPushStatus === 1
      ? buildLivePlayerSource(d, shouldPreferMiniProgramHlsPlayback(), getPreferredLiveQuality(), earlyLiveStreamInfo || {})
      : { key: "", mainUrl: "", options: {}, rtcConfig: null };
    recordPlaybackDebugEvent("detail_source", summarizeLiveSourcePayload(d, detailLivePlayerSource));
    pullUrl.value = detailLivePlayerSource.mainUrl || (detailPushStatus === 1 ? pullUrl.value : "");
    if (rtcConfig) rtcConfig.value = detailLivePlayerSource.rtcConfig || null;
    if (entryLiveType === "replay") {
      if (detailPushStatus !== 2) pushStatus.value = 1;
      isReplay.value = true;
    } else {
      isReplay.value = false;
    }
    applyScheduleAndReplayList(d, entryLiveType);
    return {
      detailLivePlayerSource,
      shouldReuseEarlyLivePlayer: !!earlyLivePlayerKey && detailLivePlayerSource.key === earlyLivePlayerKey,
      shouldShowCoverOnlyBeforeLive: entryLiveType === "live" && isLiveNotStartedDetail(d),
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
      "",
    );
    bizCode.value = firstPresent(d.bizCode, d.biz_code, "");
    nowTs.value = Date.now();
    replayVideosList.value = normalizeReplayVideos(d);
    if (isLiveVisualMode) {
      isLiveVisualMode.value = resolveLiveVisualMode(entryLiveType);
    }
    const replayVideo = normalizeReplayVideoItem(firstPresent(d.replayVideo, d.replay_video, null) || {});
    replayCurrentVideoId.value = replayVideo.id || toNumber(firstPresent(d.resumeVideoId, d.resume_video_id), 0);
    replayLoopPlay.value = replayVideo.loopPlay === 1;
    replayCurrentIndex.value = replayCurrentVideoId.value && replayVideosList.value.length > 0
      ? replayVideosList.value.findIndex((v) => v.id === replayCurrentVideoId.value)
      : -1;
  }

  function promoteEarlyReplayFirstVideo(playbackState = {}) {
    const firstVideo = playbackState?.earlyReplayFirstVideoState?.video;
    if (!firstVideo?.videoUrl) return false;
    replayVideosList.value = [normalizeReplayVideoItem(firstVideo)].filter((item) => item.videoUrl);
    if (!replayVideosList.value.length) return false;
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
    if (liveStatusText) liveStatusText.value = "回放";
    replayLastTime.value = Number(firstVideo.elapsedSeconds || 0);
    recordPlaybackDebugEvent("replay_first_video_fallback", {
      videoId: replayCurrentVideoId.value,
      hasUrl: true,
      source: "/h5/live/replayFirstVideo",
    });
    return true;
  }

  async function ensureReplayFirstVideoFallback(state = {}, playbackState = {}) {
    if (state.entryLiveType !== "replay") return false;
    if (replayVideosList.value.length > 0) return false;
    if (promoteEarlyReplayFirstVideo(playbackState)) return true;
    try {
      const firstVideoRaw = await getReplayFirstVideo(state.roomCode);
      const firstVideo = normalizeReplayFirstVideoPayload(firstVideoRaw);
      if (!firstVideo?.videoUrl) return false;
      playbackState.earlyReplayFirstVideoState = {
        videoId: Number(firstVideo.videoId || 0),
        videoUrlKey: normalizeLiveSourceUrlKey(firstVideo.videoUrl),
        seekTo: Number(firstVideo.elapsedSeconds || 0),
        video: firstVideo,
      };
      return promoteEarlyReplayFirstVideo(playbackState);
    } catch (err) {
      console.warn("[Live] replay first video fallback failed:", err);
      return false;
    }
  }

  function firstPresent(...values) {
    return values.find((item) => item !== undefined && item !== null && item !== "");
  }

  function toNumber(value, fallback = 0) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  function getDetailPushStatus(detail = {}) {
    return toNumber(firstPresent(detail.pushStatus, detail.push_status, detail.liveStatus, detail.live_status, detail.status), 0);
  }

  function normalizeQuickReplies(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== "string" || !value.trim()) return [];
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
    const replaySource = selectReplayVideoPlaybackSource(sourceItem);
    const videoUrl = replaySource.playUrl || firstPresent(
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
      "",
    );
    const coverImage = firstPresent(
      sourceItem.coverImage,
      sourceItem.cover_image,
      sourceItem.cover,
      sourceItem.image,
      sourceItem.imageUrl,
      sourceItem.image_url,
      sourceItem.poster,
      "",
    );
    const duration = toNumber(firstPresent(
      sourceItem.duration,
      sourceItem.durationSec,
      sourceItem.duration_sec,
      sourceItem.videoDuration,
      sourceItem.video_duration,
      sourceItem.length,
      sourceItem.seconds,
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
      "",
    );
    const estimatedEndTime = firstPresent(
      sourceItem.estimatedEndTime,
      sourceItem.estimated_end_time,
      sourceItem.endTime,
      sourceItem.end_time,
      sourceItem.finishTime,
      sourceItem.finish_time,
      "",
    );
    const quickReplies = normalizeQuickReplies(firstPresent(sourceItem.quickReplies, sourceItem.quick_replies, sourceItem.replyList, sourceItem.reply_list, []));

    return {
      ...sourceItem,
      id: videoId,
      videoId,
      video_id: videoId,
      replayVideoId: videoId,
      replay_video_id: videoId,
      videoName,
      video_name: videoName,
      videoUrl,
      video_url: videoUrl,
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
      quickReplies,
      quick_replies: quickReplies,
    };
  }

  function normalizeReplayVideos(detail = {}) {
    const source = Array.isArray(detail.replayVideos) && detail.replayVideos.length
      ? detail.replayVideos
      : Array.isArray(detail.replay_videos) && detail.replay_videos.length
        ? detail.replay_videos
        : Array.isArray(detail.replayList) && detail.replayList.length
          ? detail.replayList
          : Array.isArray(detail.replay_list) && detail.replay_list.length
            ? detail.replay_list
            : Array.isArray(detail.replays) && detail.replays.length
              ? detail.replays
              : firstPresent(detail.replayVideo, detail.replay_video, null)
                ? [firstPresent(detail.replayVideo, detail.replay_video)]
                : [];
    return source
      .map((item) => normalizeReplayVideoItem(item))
      .filter((item) => item.videoUrl);
  }

  function normalizeSignFields(rawFields) {
    if (Array.isArray(rawFields)) return rawFields;
    if (typeof rawFields !== "string" || !rawFields.trim()) return [];
    try {
      const parsed = JSON.parse(rawFields);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function normalizeSignConfig(rawConfig = {}) {
    if (!rawConfig || typeof rawConfig !== "object") return null;
    const fields = normalizeSignFields(firstPresent(rawConfig.fields, rawConfig.signFields, rawConfig.sign_fields, []));
    return {
      enabled: toNumber(firstPresent(rawConfig.enabled, rawConfig.signEnabled, rawConfig.sign_enabled, rawConfig.enableSign, rawConfig.enable_sign), 0),
      ruleType: toNumber(firstPresent(rawConfig.ruleType, rawConfig.rule_type), 1),
      welcomeText: firstPresent(rawConfig.welcomeText, rawConfig.welcome_text, ""),
      coverImage: firstPresent(rawConfig.coverImage, rawConfig.cover_image, ""),
      forceEnabled: toNumber(firstPresent(rawConfig.forceEnabled, rawConfig.force_enabled), 0),
      fields,
    };
  }

  function normalizeReplayResumeState(d = {}) {
    return {
      resumeVideoId: toNumber(firstPresent(d.resumeVideoId, d.resume_video_id, d.videoId, d.video_id), 0),
      resumeVideoIndex: toNumber(firstPresent(d.resumeVideoIndex, d.resume_video_index, d.videoIndex, d.video_index), -1),
      resumePosition: toNumber(firstPresent(d.resumePosition, d.resume_position, d.lastPosition, d.last_position), 0),
    };
  }

  function handleAccessRestrictions(d) {
    const code = Number(firstPresent(d.code, d.statusCode, d.status_code, 0));
    if (code === -2 || d.isBlocked || d.blocked) {
      userBlocked.value = true;
      denyLiveAccess();
      refreshMissingProfile();
      return true;
    }
    if (d.trafficExceeded) {
      denyLiveAccess();
      uni.showModal({
        title: "流量不足提示",
        content: d.trafficExceedMsg || "流量已超额，请联系商务人员充值",
        showCancel: false,
        confirmText: "我知道了",
      });
      return true;
    }
    if (code === -3 || (d.needAuth && !d.hasAccess)) {
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
    const rawSetting = firstPresent(d.setting, d.room_setting, d.roomSetting, {});
    Object.assign(roomSetting.value, normalizeRoomSetting(rawSetting));
    const normalizedSignConfig = normalizeSignConfig(firstPresent(d.signConfig, d.sign_config, d.sign, null));
    if (!normalizedSignConfig) return;
    signConfig.value = normalizedSignConfig;
    signFields.value = signConfig.value.fields;
    if (isTruthyFlag(signConfig.value.enabled)) {
      loadSignStatus().then(() => {
        if (!hasSigned.value && mode.value === "portrait") {
          showSignPopup.value = true;
        }
      });
    }
  }

  function normalizeRoomSetting(rawSetting = {}) {
    const source = rawSetting && typeof rawSetting === "object" ? rawSetting : {};
    const next = { ...source };
    const shareEnabled = firstPresent(source.enableShare, source.enable_share, source.is_share);
    if (shareEnabled !== undefined) next.enableShare = toNumber(shareEnabled, roomSetting.value.enableShare);
    const closeComment = firstPresent(source.close_comment, source.is_close_comment, source.closeComment);
    const chatOpen = firstPresent(source.enableChat, source.enable_chat);
    if (chatOpen !== undefined) next.enableChat = toNumber(chatOpen, roomSetting.value.enableChat);
    if (closeComment !== undefined) next.enableChat = toNumber(closeComment, 0) === 1 ? 0 : 1;
    const noSpeak = firstPresent(source.is_no_speaking, source.no_speaking, source.muteAll, source.mute_all);
    if (noSpeak !== undefined) next.muteAll = toNumber(noSpeak, roomSetting.value.muteAll);
    const shoppingCart = firstPresent(source.showProduct, source.show_product, source.is_show_shopping_cart, source.is_order);
    if (shoppingCart !== undefined) next.showProduct = toNumber(shoppingCart, 1);
    const hotSale = firstPresent(source.showHotSale, source.show_hot_sale, source.is_hot_sale);
    if (hotSale !== undefined) next.showHotSale = toNumber(hotSale, roomSetting.value.showHotSale);
    const buyReminder = firstPresent(source.buyReminder, source.buy_reminder, source.is_creating_order);
    if (buyReminder !== undefined) next.buyReminder = toNumber(buyReminder, roomSetting.value.buyReminder);
    const buySuccessReminder = firstPresent(source.buySuccessReminder, source.buy_success_reminder, source.is_submit_order_success);
    if (buySuccessReminder !== undefined) next.buySuccessReminder = toNumber(buySuccessReminder, roomSetting.value.buySuccessReminder || 0);
    const anonymous = firstPresent(source.encryptNickname, source.encrypt_nickname, source.is_anonymous, source.is_avatar_anonymous);
    if (anonymous !== undefined) next.encryptNickname = toNumber(anonymous, roomSetting.value.encryptNickname);
    const onlineNumber = firstPresent(source.showOnlineNumber, source.show_online_number, source.is_online_number);
    if (onlineNumber !== undefined) next.showOnlineNumber = toNumber(onlineNumber, 1);
    const customerService = firstPresent(source.showCustomerService, source.show_customer_service, source.is_customer_service);
    if (customerService !== undefined) next.showCustomerService = toNumber(customerService, 1);
    const captureScreen = firstPresent(source.is_capture_screen, source.captureScreen, source.capture_screen);
    if (captureScreen !== undefined) next.is_capture_screen = toNumber(captureScreen, 0);
    const selfGroup = firstPresent(source.self_group, source.selfGroup);
    if (selfGroup !== undefined) next.self_group = toNumber(selfGroup, 0);
    const unconsciousLogin = firstPresent(source.unconscious_login, source.unconsciousLogin);
    if (unconsciousLogin !== undefined) next.unconscious_login = unconsciousLogin;
    return next;
  }

  function handleWaitingScheduleIfNeeded() {
    if (!isWaitingSchedule.value || pushStatus.value === 2) return false;
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
    if (pushStatus.value === 2) return;
    if (!reuseEarlyReplayFirstVideoIfSame(resolved.index, resolved.position)) {
      playReplayVideoByIndex(resolved.index, resolved.position);
    }
  }

  function resolveReplayColumnPosition(d, preferredIndex) {
    const resumeState = normalizeReplayResumeState(d);
    let rIdx = -1;
    if (resumeState.resumeVideoId > 0) {
      const foundIdx = replayVideosList.value.findIndex(v => Number(v.id) === Number(resumeState.resumeVideoId));
      if (foundIdx >= 0) rIdx = foundIdx;
    }
    if (rIdx < 0 && resumeState.resumeVideoIndex >= 0 && resumeState.resumeVideoIndex < replayVideosList.value.length) {
      rIdx = resumeState.resumeVideoIndex;
    }
    if (rIdx < 0) rIdx = preferredIndex >= 0 ? preferredIndex : 0;
    let rPos = resumeState.resumePosition || 0;
    if (rPos <= 0) {
      const actualVideoId = Number(replayVideosList.value[rIdx]?.id || 0);
      rPos = actualVideoId > 0 ? getSavedReplayProgress(actualVideoId) : 0;
    }
    return advanceReplayColumnIfCompleted(rIdx, rPos);
  }

  function advanceReplayColumnIfCompleted(rIdx, rPos) {
    const targetVideo = replayVideosList.value[rIdx];
    const targetTermId = targetVideo?.termId || 0;
    const targetDuration = Number(targetVideo?.duration || 0);
    const targetLocalProgress = getSavedReplayProgress(Number(targetVideo?.id || 0));
    if (targetDuration <= 0 || (rPos < targetDuration - 2 && targetLocalProgress < targetDuration - 2)) {
      return { index: rIdx, position: rPos };
    }
    for (let ni = rIdx + 1; ni < replayVideosList.value.length; ni++) {
      const nv = replayVideosList.value[ni];
      if (roomWatchByDay.value === 1 && targetTermId && nv.termId && nv.termId !== targetTermId) break;
      const nvDuration = Number(nv?.duration || 0);
      const nvProgress = getSavedReplayProgress(Number(nv?.id || 0));
      if (nvDuration <= 0 || nvProgress < nvDuration - 2) {
        return { index: ni, position: nvProgress > 0 ? nvProgress : 0 };
      }
    }
    const currentTermVideo = replayVideosList.value[rIdx];
    const currentTermId = currentTermVideo?.termId || 0;
    const isTermLoop = Number(currentTermVideo?.termLoopPlay || 0) === 1;
    if (isTermLoop && currentTermId > 0) {
      replayVideosList.value.forEach((v) => {
        if (Number(v?.termId || 0) === currentTermId) {
          const vid = Number(v?.id || 0);
          if (vid > 0) {
            try { uni.removeStorageSync(`replay_progress_${liveId.value}_${vid}`); } catch (e) {}
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
    const firstStart = safeParseReplayTime(firstVideo?.startTime);
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
      return !safeParseReplayTime(video.startTime) && !safeParseReplayTime(video.estimatedEndTime);
    });
  }

  function playUnscheduledReplayVideo(preferredIndex, savedProgress) {
    const index = preferredIndex >= 0 && preferredIndex < replayVideosList.value.length
      ? preferredIndex
      : 0;
    const replay = replayVideosList.value[index] || {};
    recordPlaybackDebugEvent("unscheduled_replay_fallback", {
      index,
      videoId: replay.id || replay.videoId || 0,
      hasUrl: !!replay.videoUrl,
      source: "detail.replays",
    });
    pushStatus.value = 1;
    playReplayVideoByIndex(index, index === preferredIndex ? savedProgress : 0);
  }

  function readReplayAllDone() {
    try {
      const saved = uni.getStorageSync(`replay_all_done_${liveId.value}`);
      if (!saved) return false;
      const currentIds = replayVideosList.value.map((v) => v.id).join(",");
      if (saved !== currentIds) {
        uni.removeStorageSync(`replay_all_done_${liveId.value}`);
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
      const vStart = safeParseReplayTime(v.startTime);
      const vEnd = safeParseReplayTime(v.estimatedEndTime);
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
    const isLoop = Number(activeVideo?.loopPlay || 0) === 1;
    if (allDone && !isLoop) {
      pushStatus.value = 2;
      isPlaying.value = false;
    } else if (allDone && isLoop) {
      try { uni.removeStorageSync(`replay_all_done_${liveId.value}`); } catch (e) {}
      playReplayVideoByIndex(activeIdx, 0);
    } else if (preferredIndex !== -1 && savedProgress > 0 && preferredIndex === activeIdx) {
      playReplayVideoByIndex(preferredIndex, savedProgress);
    } else {
      try { uni.removeStorageSync(`replay_all_done_${liveId.value}`); } catch (e) {}
      playReplayVideoByIndex(activeIdx, 0);
    }
  }

  function waitFutureReplayVideo(futureIdx) {
    const futureVideo = replayVideosList.value[futureIdx];
    const futureStart = safeParseReplayTime(futureVideo.startTime);
    enterReplayPendingState(futureIdx);
    scheduleReplayStart(futureIdx, futureStart - Date.now());
  }

  function initLiveDetailPlayback(d, playbackState = {}) {
    const shouldReuseEarlyLivePlayer = !!playbackState.shouldReuseEarlyLivePlayer;
    if (roomGroupType.value === 0 && rtcConfig?.value?.appId) {
      isReplay.value = false;
      if (!shouldReuseEarlyLivePlayer) {
        initVideoPlayer(pullUrl.value || "", {
          backupUrl: pullUrl.value || "",
          rtcConfig: rtcConfig.value,
        });
      }
    } else if (roomGroupType.value === 0 && hasReplay.value && getDetailPushStatus(d) !== 1 && replayVideosList.value.length > 0) {
      const replay = replayVideosList.value[0];
      isReplay.value = true;
      pushStatus.value = 1;
      replayCurrentIndex.value = 0;
      replayCurrentVideoId.value = Number(replay.id || replay.videoId || 0);
      if (liveStatusText) liveStatusText.value = "回放";
      playReplayVideoByIndex(0, 0);
    } else if (pullUrl.value) {
      initStandardLivePlayer(d, playbackState);
    }
  }

  function initStandardLivePlayer(d, playbackState = {}) {
    const shouldReuseEarlyLivePlayer = !!playbackState.shouldReuseEarlyLivePlayer;
    isReplay.value = false;
    if (shouldReuseEarlyLivePlayer) {
      recordPlaybackDebugEvent("reuse_early_live_player", {
        currentUrl: videoUrl?.value || "",
        detailUrl: pullUrl.value || "",
      });
      return;
    }
    const source = playbackState.detailLivePlayerSource?.key
      ? playbackState.detailLivePlayerSource
      : buildLivePlayerSource(d, shouldPreferMiniProgramHlsPlayback(), getPreferredLiveQuality());
    initVideoPlayer(source.mainUrl || pullUrl.value, source.options || {});
  }

  async function finishDetailInit() {
    const wsUrl = ctx.buildWsUrl(liveId.value);
    await initWebSocket(wsUrl);
    if (!isReplay.value && roomSetting.value.showHistory === 1) {
      loadCommentHistory();
    }
    await Promise.all([loadProductList(true), loadCurrentProduct()]);
    checkDistributorStatus();
    if (!isEntryOverlayVisible()) {
      await reportLiveEntry();
      setTimeout(() => {
        sendFallbackEnter?.();
      }, 1500);
    }
    startStatusPoll();
    liveInitResolved.value = true;
    if (pendingRecoverBuyCtx.value) {
      recoverBuyContextFromWxPick().catch((e) =>
        console.warn("[Live] recoverBuyContext async fail:", e),
      );
    }
  }

  function checkDistributorStatus() {
    if (!userStore.token) return;
    checkDistributor(liveId.value)
      .then((result) => {
        const _isDistributor = !!result?.isDistributor;
        const _distributorStatus = Number(result?.status || 0);
        isDistributor.value = _isDistributor;
        distributorStatus.value = _distributorStatus;
        try {
          saveLiveRoomContext({
            roomCode: roomCode.value || "",
            liveId: liveId.value || "",
            isDistributor: _isDistributor,
            distributorStatus: _distributorStatus,
          });
        } catch (_) {}
      })
      .catch((e) => {
        console.warn("[Live] checkDistributor fail:", e);
      });
  }

  return {
    initLive,
    getLastInitOptions,
    setPendingSubscribeBack,
    reportLiveEntry,
    isDistributor,
    distributorStatus,
  };
}
