"use strict";
const common_vendor = require("../../common/vendor.js");
const api_h5 = require("../../api/h5.js");
const api_live = require("../../api/live.js");
const api_marketing = require("../../api/marketing.js");
const utils_miniLiveSocket = require("../../utils/mini-live-socket.js");
const utils_liveRoute = require("../../utils/live-route.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const pages_broadcast_useReplayProductSchedule = require("./useReplayProductSchedule.js");
const common_assets = require("../../common/assets.js");
function uniqueId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
const REPLAY_SIM_WINDOW_SIZE = 20;
const REPLAY_SIM_PRELOAD_LEAD_SECONDS = 5;
const LIVE_PLAYER_FAILURE_CODES = [-2301, -2302, -2303, -2304, -2305];
const LIVE_PLAYER_READY_CODES = [2004];
function replaySimSecond(item = {}) {
  const value = Number(
    item.triggerAtSec ?? item.trigger_at_sec ?? item.timelineSeconds ?? item.timeline_seconds ?? item.second ?? item.time ?? 0
  );
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
function replaySimWindowStart(second = 0) {
  const value = Math.max(0, Math.floor(Number(second) || 0));
  return Math.floor(value / REPLAY_SIM_WINDOW_SIZE) * REPLAY_SIM_WINDOW_SIZE;
}
function replaySimMessageKey(item = {}, videoId = 0, fallback = 0) {
  return String(
    item.id || item.msgId || item.messageId || `${videoId}-${replaySimSecond(item)}-${item.content || item.message || item.text || fallback}`
  );
}
function truncateQuickReply(text = "") {
  const chars = [...String(text || "")];
  return chars.length > 6 ? `${chars.slice(0, 6).join("")}...` : chars.join("");
}
function normalizeQuickReplies(source = []) {
  const list = Array.isArray(source) ? source : typeof source === "string" ? source.split(/[,\n]/) : Array.isArray(source == null ? void 0 : source.list) ? source.list : [];
  return list.map((item, index) => {
    const content = String((item == null ? void 0 : item.content) || (item == null ? void 0 : item.text) || (item == null ? void 0 : item.value) || item || "").trim();
    if (!content)
      return null;
    return {
      id: (item == null ? void 0 : item.id) || (item == null ? void 0 : item.replyId) || `quick-${index}-${content}`,
      content,
      label: truncateQuickReply(content)
    };
  }).filter(Boolean);
}
function extractErrorPayload(error = {}) {
  if (!error || typeof error !== "object")
    return {};
  return error.data && typeof error.data === "object" ? error.data : error;
}
const _sfc_main = {
  data() {
    return {
      options: {},
      loading: true,
      errorText: "",
      detail: {},
      playerUrl: "",
      liveCandidates: [],
      liveCandidateIndex: 0,
      liveStreamInfo: {},
      replayVideos: [],
      replayIndex: 0,
      replayInitialTime: 0,
      replayLastTime: 0,
      showReplayFirstVideoLoading: false,
      playbackFrameReady: false,
      replayPosterFadeReady: false,
      isReplay: false,
      isLandscape: false,
      stageCollapsed: false,
      miniHidden: false,
      muted: true,
      fullscreen: false,
      messages: [],
      scrollToId: "",
      inputText: "",
      inputFocused: false,
      activeTab: "interact",
      chatDisabled: false,
      likeCount: 0,
      viewerCount: 0,
      products: [],
      productsLoading: false,
      showProducts: false,
      currentProduct: null,
      showMarketingPanel: false,
      marketingPanelType: "",
      marketingLoading: false,
      signState: {
        enabled: false,
        signed: false,
        fields: [],
        welcomeText: ""
      },
      watchRewardTasks: [],
      normalLotteryActivities: [],
      commentLotteryActivities: [],
      socket: null,
      socketState: "idle",
      sessionId: "",
      enteredAt: 0,
      heartbeatTimer: null,
      lastProgressReportAt: 0,
      lastProgressReportedSecond: 0,
      replaySimLoadedUntil: 0,
      replaySimVideoId: 0,
      replaySimTimeline: [],
      replaySimCursor: 0,
      replaySimLoading: false,
      replaySimSeen: {},
      replayProductSchedule: pages_broadcast_useReplayProductSchedule.createReplayProductScheduleController(),
      scheduleExplainActiveId: 0,
      watchSeconds: 0,
      showEntryOverlay: true,
      accessDenied: false,
      accessDeniedReason: "",
      viewerLimitReached: false,
      viewerLimitText: "观看人数已达上限",
      liveEnded: false,
      liveEndedReason: "",
      marqueeDismissed: false,
      commentLotteryBubbleVisible: true,
      buyingNoticeText: "",
      buyingNoticeTimer: null,
      marketingNoticeText: "",
      marketingNoticeTimer: null,
      defaultAvatar: "/static/login-default.png"
    };
  },
  computed: {
    roomId() {
      return this.detail.id || this.options.liveId || this.options.roomId || "";
    },
    roomCode() {
      return this.detail.roomCode || this.options.roomCode || "";
    },
    roomName() {
      return this.detail.roomName || "直播间";
    },
    coverImage() {
      return this.detail.coverImage || "";
    },
    anchorName() {
      return this.detail.anchorName || "官方直播间";
    },
    anchorAvatar() {
      return this.detail.anchorAvatar || "";
    },
    noticeText() {
      return this.detail.notice || "";
    },
    currentProductName() {
      const item = this.currentProduct || {};
      return item.name || item.productName || item.product_name || "";
    },
    currentProductImage() {
      const item = this.currentProduct || {};
      return item.image || item.productImage || item.product_image || "";
    },
    isLiveMode() {
      return !this.isReplay;
    },
    isLiveLandscapeStyle() {
      return this.isLandscape && this.isLiveMode;
    },
    currentReplayVideo() {
      return this.replayVideos[this.replayIndex] || {};
    },
    replayCoverPoster() {
      const video = this.currentReplayVideo || {};
      return video.cover || video.coverImage || video.cover_image || video.image || video.poster || video.videoCover || video.video_cover || this.detail.replayCover || this.detail.replay_cover || this.coverImage || "";
    },
    landscapePoster() {
      return this.isReplay ? this.replayCoverPoster : this.coverImage || this.detail.liveCover || "";
    },
    shouldRenderPortraitReplayPoster() {
      return !this.isLandscape && this.isReplay && !!this.playerUrl && !!this.replayCoverPoster;
    },
    shouldRenderLandscapePoster() {
      return this.isLandscape && !!this.playerUrl && !!this.landscapePoster && (this.isReplay || !this.playbackFrameReady);
    },
    showLiveLandscapePreview() {
      return this.isLiveLandscapeStyle && !!this.landscapePoster && !this.playbackFrameReady;
    },
    replayPosterHidden() {
      return !!this.replayPosterFadeReady;
    },
    landscapeInteractTitle() {
      return this.isLiveLandscapeStyle ? "互动" : "直播互动";
    },
    landscapeProductTitle() {
      return this.isLiveLandscapeStyle ? "商品" : "商品列表";
    },
    roomSetting() {
      return this.detail.setting || {};
    },
    quickReplies() {
      return normalizeQuickReplies(
        this.detail.quickReplies || this.detail.quickReplyList || this.detail.quick_reply_list || this.roomSetting.quickReplies || this.roomSetting.quickReplyList || this.roomSetting.quickReply || []
      );
    },
    accessDeniedTitle() {
      return this.accessDeniedReason || this.detail.accessDeniedTitle || this.roomName || "暂无观看权限";
    },
    accessDeniedAvatar() {
      return this.detail.customerAvatar || this.detail.userAvatar || this.anchorAvatar || this.defaultAvatar;
    },
    accessDeniedUserName() {
      return this.detail.customerName || this.detail.userName || this.anchorName || "用户";
    },
    accessDeniedUidText() {
      const uid = this.detail.unionId || this.detail.unionID || this.detail.uid || this.detail.userId || "--";
      return `UID:${uid}`;
    },
    showEndedOverlay() {
      if (this.isReplay || this.accessDenied || this.viewerLimitReached)
        return false;
      return this.liveEnded || Number(this.detail.pushStatus ?? this.detail.live_status ?? 0) === 2;
    },
    endedOverlayTitle() {
      return this.liveEndedReason || "直播已结束";
    },
    marqueeText() {
      return String(this.roomSetting.marqueeText || this.detail.marqueeText || "").trim();
    },
    shouldShowMarquee() {
      return Number(this.roomSetting.marqueeEnabled ?? this.detail.marqueeEnabled ?? 0) === 1 && !!this.marqueeText && !this.marqueeDismissed;
    },
    marqueePositionClass() {
      const position = Number(this.roomSetting.marqueePosition ?? this.detail.marqueePosition ?? 1);
      if (position === 2)
        return "live-marquee-ad--middle";
      if (position === 3)
        return "live-marquee-ad--bottom";
      return "live-marquee-ad--top";
    },
    marqueeTrackStyle() {
      return {
        color: this.roomSetting.marqueeTextColor || this.detail.marqueeTextColor || "rgba(255,255,255,1)",
        backgroundColor: this.roomSetting.marqueeBgColor || this.detail.marqueeBgColor || "rgba(240,74,98,.7)"
      };
    },
    commentLotteryKeyword() {
      const activity = this.commentLotteryActivities[0] || {};
      return activity.keyword || activity.password || activity.passwordText || activity.displayPasswordText || "发送指定评论";
    },
    showCommentLotteryEntry() {
      return this.commentLotteryActivities.length > 0;
    },
    showWatchRewardEntry() {
      return this.watchRewardTasks.length > 0;
    },
    showExternalLotteryTools() {
      return !this.isLandscape && (this.showCommentLotteryEntry || this.showWatchRewardEntry);
    },
    watchRewardEntryLabel() {
      const task = this.watchRewardTasks[0] || {};
      return task.entryLabel || task.watchRewardLabel || task.label || "领取";
    },
    showBuyingNotice() {
      return !!this.buyingNoticeText;
    },
    showPlaybackDebug() {
      return String(this.options.debug || this.options.liveDebug || this.detail.debug || "") === "1";
    },
    activeLiveCandidate() {
      return this.liveCandidates[this.liveCandidateIndex] || {};
    },
    activePlaybackComponent() {
      if (this.isReplay)
        return "video";
      if (this.activeLiveCandidate.component)
        return this.activeLiveCandidate.component;
      return utils_liveRoute.isLivePlayerSource(this.playerUrl) ? "live-player" : "video";
    },
    useLivePlayer() {
      return this.isLiveMode && this.activePlaybackComponent === "live-player";
    },
    isLivePushing() {
      return Number(this.detail.pushStatus ?? this.detail.live_status ?? 0) === 1;
    },
    liveStatusLabel() {
      if (this.isReplay)
        return "回放";
      if (this.isLivePushing)
        return "直播";
      const statusText = this.detail.liveStatusText || this.detail.statusText || this.detail.live_status_text || "";
      return statusText || "未开播";
    },
    liveStatusClass() {
      return this.isLivePushing ? "live-status-badge--live" : "live-status-badge--waiting";
    },
    anchorSubText() {
      return `${this.displayViewerCount}观看`;
    },
    displayViewerCount() {
      return Number(this.viewerCount || 0);
    },
    likeCountText() {
      const count = Number(this.likeCount || 0);
      if (count >= 1e4)
        return `${(count / 1e4).toFixed(1)}w`;
      return String(count);
    },
    productTotal() {
      return this.products.length;
    },
    productTotalText() {
      return this.productTotal > 99 ? "99+" : String(this.productTotal || 0);
    },
    shouldShowComments() {
      return this.roomSetting.enableChat !== 0;
    },
    pinnedMessage() {
      return this.messages.find((item) => Number(item.isTop || 0) === 1) || null;
    },
    visibleMessages() {
      return this.messages.filter((item) => Number(item.isTop || 0) !== 1).slice(-60).map((item, index) => ({
        ...item,
        id: item.id || item.msgId || `${index}`,
        type: item.type || "chat",
        nick: item.nick || item.nickname || item.userName || "用户",
        content: item.content || item.text || item.message || this.formatSystemMessage(item)
      }));
    },
    showReplayList() {
      return this.isReplay && this.replayVideos.length > 1;
    },
    marketingActions() {
      const actions = [];
      if (this.signState.enabled)
        actions.push({ type: "sign", label: this.signState.signed ? "已签" : "签到" });
      if (this.watchRewardTasks.length)
        actions.push({ type: "reward", label: "福利" });
      if (this.normalLotteryActivities.length)
        actions.push({ type: "normalLottery", label: "抽奖" });
      if (this.commentLotteryActivities.length)
        actions.push({ type: "lottery", label: "抽奖" });
      return actions;
    },
    signWelcomeText() {
      return this.signState.welcomeText || "完成签到后可参与直播间互动权益";
    },
    marketingPanelTitle() {
      if (this.marketingPanelType === "sign")
        return "直播签到";
      if (this.marketingPanelType === "reward")
        return "观看福利";
      if (this.marketingPanelType === "normalLottery")
        return "普通抽奖";
      if (this.marketingPanelType === "lottery")
        return "评论抽奖";
      return "直播活动";
    },
    activeMarketingItems() {
      if (this.marketingPanelType === "reward") {
        return this.watchRewardTasks.map((item, index) => ({
          key: `reward-${item.activityId || item.id || index}`,
          type: "reward",
          raw: item,
          name: item.activityName || item.name || item.title || "观看福利",
          desc: item.rewardName || item.prizeName || item.description || "达到观看条件后可领取"
        }));
      }
      if (this.marketingPanelType === "lottery") {
        return this.commentLotteryActivities.map((item, index) => ({
          key: `lottery-${item.activityId || item.id || index}`,
          type: "lottery",
          raw: item,
          name: item.activityName || item.name || item.title || "评论抽奖",
          desc: item.displayPasswordText || item.tipText || item.description || "发送指定评论参与抽奖"
        }));
      }
      if (this.marketingPanelType === "normalLottery") {
        return this.normalLotteryActivities.map((item, index) => ({
          key: `normal-lottery-${item.activityId || item.id || index}`,
          type: "normalLottery",
          raw: item,
          name: item.activityName || item.name || item.title || "直播抽奖",
          desc: item.rewardName || item.prizeName || item.description || "等待主播开奖"
        }));
      }
      return [];
    }
  },
  onLoad(query = {}) {
    var _a, _b;
    this.options = utils_liveRoute.normalizeLiveRouteOptions(query);
    this.isLandscape = this.options.mode === "landscape" || this.options.orientation === "horizontal";
    this.sessionId = uniqueId();
    this.showEntryOverlay = true;
    this.muted = common_vendor.index.getStorageSync("broadcast_sound_intent") === "sound" ? false : true;
    (_b = (_a = common_vendor.index).setKeepScreenOn) == null ? void 0 : _b.call(_a, { keepScreenOn: true });
    if (!services_h5AuthContext.ensureH5Authenticated({ ...query, ...this.options, redirect: utils_liveRoute.buildBroadcastEntryUrl(this.options) })) {
      this.loading = false;
      return;
    }
    this.loadRoom();
  },
  onShow() {
    var _a, _b;
    (_b = (_a = common_vendor.index).setKeepScreenOn) == null ? void 0 : _b.call(_a, { keepScreenOn: true });
    if (!this.loading && !this.errorText && this.roomId) {
      this.refreshLiveStatusNow();
    }
  },
  onHide() {
    var _a, _b;
    (_b = (_a = common_vendor.index).setKeepScreenOn) == null ? void 0 : _b.call(_a, { keepScreenOn: false });
    if (this.isReplay)
      this.reportReplayProgress(this.replayLastTime, 1, true);
  },
  onUnload() {
    var _a, _b;
    (_b = (_a = common_vendor.index).setKeepScreenOn) == null ? void 0 : _b.call(_a, { keepScreenOn: false });
    this.teardownRoom();
    this.clearPlaybackPosterTimer();
    this.clearNoticeTimers();
  },
  onShareAppMessage() {
    return {
      title: this.roomName,
      path: `/pages/broadcast/entry?${this.roomCode ? `roomCode=${encodeURIComponent(this.roomCode)}` : `liveId=${encodeURIComponent(this.roomId)}`}`,
      imageUrl: this.coverImage
    };
  },
  onShareTimeline() {
    return {
      title: this.roomName,
      query: this.roomCode ? `roomCode=${encodeURIComponent(this.roomCode)}` : `liveId=${encodeURIComponent(this.roomId)}`,
      imageUrl: this.coverImage
    };
  },
  methods: {
    resetPlaybackPosterState() {
      this.clearPlaybackPosterTimer();
      this.playbackFrameReady = false;
      this.replayPosterFadeReady = false;
    },
    clearPlaybackPosterTimer() {
      if (this.replayPosterHideTimer) {
        clearTimeout(this.replayPosterHideTimer);
        this.replayPosterHideTimer = null;
      }
    },
    markPlaybackReady() {
      if (!this.playerUrl)
        return;
      this.playbackFrameReady = true;
      this.clearPlaybackPosterTimer();
      this.replayPosterHideTimer = setTimeout(() => {
        if (this.playerUrl && this.playbackFrameReady)
          this.replayPosterFadeReady = true;
        this.replayPosterHideTimer = null;
      }, 240);
    },
    clearNoticeTimers() {
      if (this.buyingNoticeTimer)
        clearTimeout(this.buyingNoticeTimer);
      if (this.marketingNoticeTimer)
        clearTimeout(this.marketingNoticeTimer);
      this.buyingNoticeTimer = null;
      this.marketingNoticeTimer = null;
    },
    showTransientBuyingNotice(text = "") {
      const value = String(text || "").trim();
      if (!value)
        return;
      if (this.buyingNoticeTimer)
        clearTimeout(this.buyingNoticeTimer);
      this.buyingNoticeText = value;
      this.buyingNoticeTimer = setTimeout(() => {
        this.buyingNoticeText = "";
        this.buyingNoticeTimer = null;
      }, 3600);
    },
    showTransientMarketingNotice(text = "") {
      const value = String(text || "").trim();
      if (!value)
        return;
      if (this.marketingNoticeTimer)
        clearTimeout(this.marketingNoticeTimer);
      this.marketingNoticeText = value;
      this.marketingNoticeTimer = setTimeout(() => {
        this.marketingNoticeText = "";
        this.marketingNoticeTimer = null;
      }, 3600);
    },
    enterLiveByGesture() {
      this.showEntryOverlay = false;
      this.muted = false;
      common_vendor.index.setStorageSync("broadcast_sound_intent", "sound");
      this.manualPlayVideo();
    },
    manualPlayVideo() {
      var _a;
      const contextId = this.useLivePlayer ? "broadcastLivePlayer" : "broadcastVideoPlayer";
      try {
        const context = this.useLivePlayer ? common_vendor.index.createLivePlayerContext(contextId, this) : common_vendor.index.createVideoContext(contextId, this);
        (_a = context == null ? void 0 : context.play) == null ? void 0 : _a.call(context);
      } catch (error) {
      }
    },
    dismissMarquee() {
      this.marqueeDismissed = true;
    },
    hideCommentLotteryBubble() {
      this.commentLotteryBubbleVisible = false;
    },
    copyAccessUid() {
      var _a, _b;
      (_b = (_a = common_vendor.index).setClipboardData) == null ? void 0 : _b.call(_a, {
        data: this.accessDeniedUidText,
        success: () => common_vendor.index.showToast({ title: "已复制", icon: "none" })
      });
    },
    applyViewerLimitReached(data = {}) {
      var _a;
      this.viewerLimitText = data.viewerLimitText || data.message || data.msg || "观看人数已达上限";
      this.viewerLimitReached = true;
      this.accessDenied = false;
      this.showEntryOverlay = false;
      this.playerUrl = "";
      (_a = this.socket) == null ? void 0 : _a.close();
      if (this.heartbeatTimer)
        clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    },
    applyAccessRestrictions(detail = {}) {
      if (!detail || typeof detail !== "object")
        return false;
      if (detail.viewerLimitReached) {
        this.applyViewerLimitReached(detail);
        return true;
      }
      if (detail.isBlocked || detail.userBlocked || detail.trafficExceeded || detail.needAuth && detail.hasAccess === false) {
        this.accessDenied = true;
        this.viewerLimitReached = false;
        this.accessDeniedReason = detail.trafficExceedMsg || detail.accessDeniedText || detail.message || detail.msg || "暂无观看权限";
        this.showEntryOverlay = false;
        this.playerUrl = "";
        return true;
      }
      return false;
    },
    useQuickReply(content = "") {
      const text = String(content || "").trim();
      if (!text || this.chatDisabled)
        return;
      this.inputText = text;
      this.sendComment();
    },
    productHasReplaySchedule(item = {}) {
      return pages_broadcast_useReplayProductSchedule.normalizeScheduleNodes(item).length > 0;
    },
    toggleCollapse() {
      this.stageCollapsed = !this.stageCollapsed;
      if (!this.stageCollapsed)
        this.miniHidden = false;
    },
    closeMiniWindow() {
      this.miniHidden = true;
    },
    async loadRoom() {
      this.loading = true;
      this.errorText = "";
      this.accessDenied = false;
      this.viewerLimitReached = false;
      this.liveEnded = false;
      this.liveEndedReason = "";
      this.marqueeDismissed = false;
      this.commentLotteryBubbleVisible = true;
      this.showReplayFirstVideoLoading = false;
      this.resetPlaybackPosterState();
      try {
        let raw;
        try {
          raw = await api_live.getLiveDetail({
            roomCode: this.options.roomCode,
            roomId: this.options.roomId || this.options.liveId,
            liveId: this.options.liveId
          });
        } catch (error) {
          raw = await this.loadLegacyRoom();
        }
        this.detail = utils_liveRoute.normalizeRoomDetail(raw || {}, this.options);
        this.isReplay = utils_liveRoute.isReplayEntry(this.options, this.detail);
        if (this.applyAccessRestrictions(this.detail))
          return;
        this.viewerCount = this.detail.onlineCount || 0;
        this.likeCount = Number(this.detail.likeCount || 0);
        this.replayVideos = this.detail.replayVideos || [];
        await this.hydrateFastPlaybackInfo();
        this.restoreReplayIndex();
        this.applyInitialPlaybackSource();
        if (this.roomId) {
          utils_liveRoomContext.saveLiveRoomContext({
            roomId: this.roomId,
            liveId: this.roomId,
            roomCode: this.roomCode,
            liveName: this.roomName,
            cover: this.coverImage,
            liveType: this.isReplay ? "replay" : "live"
          });
        }
        common_vendor.index.setNavigationBarTitle({ title: this.roomName });
        await Promise.all([this.loadComments(), this.loadProducts(), this.loadCurrentProduct(), this.loadMarketing()]);
        this.connectRoom();
        this.enterRoom();
      } catch (error) {
        const payload = extractErrorPayload(error);
        if (payload.viewerLimitReached) {
          this.applyViewerLimitReached(payload);
        } else if (payload.isBlocked || payload.userBlocked || payload.trafficExceeded || payload.needAuth && payload.hasAccess === false) {
          this.applyAccessRestrictions(payload);
        } else {
          this.errorText = (payload == null ? void 0 : payload.msg) || (payload == null ? void 0 : payload.message) || (error == null ? void 0 : error.msg) || (error == null ? void 0 : error.message) || "直播间加载失败";
        }
      } finally {
        this.loading = false;
      }
    },
    applyInitialPlaybackSource() {
      this.liveCandidateIndex = 0;
      this.liveCandidates = [];
      this.playerUrl = "";
      this.replayProductSchedule.resetScheduleState();
      this.scheduleExplainActiveId = 0;
      this.resetPlaybackPosterState();
      if (this.isReplay) {
        this.playerUrl = utils_liveRoute.getBestReplayUrl(this.detail, this.replayVideos[this.replayIndex] || {});
        return;
      }
      this.liveCandidates = utils_liveRoute.getMiniProgramLiveCandidates(this.detail, this.liveStreamInfo);
      const preferredUrl = utils_liveRoute.getBestLiveUrl(this.detail, { streamInfo: this.liveStreamInfo });
      const preferredIndex = preferredUrl ? this.liveCandidates.findIndex((candidate) => candidate.url === preferredUrl) : -1;
      this.liveCandidateIndex = preferredIndex >= 0 ? preferredIndex : 0;
      this.playerUrl = this.activeLiveCandidate.url || "";
      if (!this.playerUrl)
        this.errorText = "暂无可播放直播线路";
    },
    switchToLiveCandidate(index, reason = "") {
      const candidate = this.liveCandidates[index];
      if (!(candidate == null ? void 0 : candidate.url))
        return false;
      this.liveCandidateIndex = index;
      this.errorText = "";
      this.playerUrl = "";
      this.resetPlaybackPosterState();
      const applyUrl = () => {
        this.playerUrl = candidate.url;
      };
      if (typeof this.$nextTick === "function") {
        this.$nextTick(applyUrl);
      } else {
        setTimeout(applyUrl, 0);
      }
      if (reason) {
        common_vendor.index.showToast({
          title: `正在切换直播线路${index + 1}`,
          icon: "none"
        });
      }
      return true;
    },
    tryNextLiveCandidate(reason = "") {
      if (!this.isLiveMode)
        return false;
      const nextIndex = this.liveCandidateIndex + 1;
      if (nextIndex < this.liveCandidates.length) {
        return this.switchToLiveCandidate(nextIndex, reason);
      }
      this.playerUrl = "";
      this.errorText = "直播播放失败，请稍后重试";
      return false;
    },
    loadLegacyRoom() {
      return new Promise((resolve, reject) => {
        if (!this.options.liveId || typeof this._post !== "function") {
          reject(new Error("缺少直播间参数"));
          return;
        }
        this._post("live.index/index", { live_id: this.options.liveId }, (res) => resolve(res.data || res), reject);
      });
    },
    async hydrateFastPlaybackInfo() {
      const roomCode = this.options.roomCode || this.detail.roomCode || "";
      if (!roomCode)
        return;
      if (this.isReplay && !utils_liveRoute.getBestReplayUrl(this.detail, this.replayVideos[0] || {})) {
        this.showReplayFirstVideoLoading = !this.isLandscape;
        try {
          const data = await api_live.getReplayFirstVideo(roomCode).catch(() => null);
          const firstVideo = (data == null ? void 0 : data.video) || (data == null ? void 0 : data.replayVideo) || (data == null ? void 0 : data.firstVideo) || (Array.isArray(data == null ? void 0 : data.list) ? data.list[0] : data);
          if (firstVideo && typeof firstVideo === "object") {
            this.replayVideos = [firstVideo];
            this.detail = { ...this.detail, replayVideos: this.replayVideos };
          }
        } finally {
          this.showReplayFirstVideoLoading = false;
        }
        return;
      }
      if (!this.isReplay) {
        const streamInfo = await api_live.getLiveStreamInf(roomCode).catch(() => null);
        if (streamInfo && typeof streamInfo === "object") {
          this.liveStreamInfo = streamInfo;
          this.detail = { ...this.detail, streamInf: streamInfo, ...streamInfo };
        }
      }
    },
    restoreReplayIndex() {
      if (!this.replayVideos.length) {
        this.replayIndex = 0;
        this.replayInitialTime = 0;
        this.replayLastTime = 0;
        return;
      }
      const targetId = Number(this.options.videoId || this.options.replayVideoId || 0);
      const found = targetId ? this.replayVideos.findIndex((item) => Number(item.id || item.videoId) === targetId) : -1;
      this.replayIndex = found >= 0 ? found : 0;
      const current = this.replayVideos[this.replayIndex];
      const key = `replay_progress_${this.roomId}_${(current == null ? void 0 : current.id) || (current == null ? void 0 : current.videoId) || this.replayIndex}`;
      this.replayInitialTime = Number(common_vendor.index.getStorageSync(key) || 0);
      this.replayLastTime = this.replayInitialTime;
    },
    async loadComments() {
      if (!this.roomId)
        return;
      try {
        const data = await api_live.getCommentHistory(this.roomId, 30, this.currentReplayVideoId());
        const list = Array.isArray(data) ? data : (data == null ? void 0 : data.list) || (data == null ? void 0 : data.data) || [];
        this.messages = list.map((item, index) => {
          const extra = item.data && typeof item.data === "object" ? item.data : {};
          const type = Number(item.type) === 1 ? "chat" : item.type || "chat";
          return {
            id: item.id || item.commentId || extra.commentId || index,
            commentId: item.commentId || item.id || extra.commentId || 0,
            msgId: item.msgId || item.messageId || "",
            type,
            nick: item.nick || item.nickname || item.userName,
            content: item.content || item.comment || item.text,
            isTop: Number(item.isTop || extra.isTop || 0)
          };
        });
        this.scrollToBottom();
      } catch (error) {
        this.messages = [];
      }
    },
    async loadProducts() {
      if (!this.roomId)
        return;
      this.productsLoading = true;
      try {
        const data = await api_live.getLiveProducts(this.roomId, 1, 50);
        this.products = Array.isArray(data) ? data : (data == null ? void 0 : data.list) || (data == null ? void 0 : data.data) || [];
      } catch (error) {
        this.products = [];
      } finally {
        this.productsLoading = false;
      }
    },
    async loadCurrentProduct() {
      if (!this.roomId)
        return;
      const data = await api_live.getCurrentProduct(this.roomId).catch(() => null);
      const item = (data == null ? void 0 : data.product) || (data == null ? void 0 : data.currentProduct) || (data == null ? void 0 : data.data) || data;
      this.currentProduct = item && typeof item === "object" && Object.keys(item).length ? item : null;
    },
    async loadMarketing() {
      this.syncMarketingFromDetail();
      if (!this.roomId)
        return;
      if (this.signState.enabled) {
        const sign = await api_live.checkSigned(this.roomId).catch(() => null);
        if (sign) {
          this.signState.signed = !!(sign.signed || sign.hasSigned);
          this.signState.enabled = sign.enabled !== void 0 ? !!sign.enabled : this.signState.enabled;
        }
      }
      const lottery = await api_marketing.getCommentLotteryList({ roomId: this.roomId, termId: this.options.termId }).catch(() => null);
      const list = (lottery == null ? void 0 : lottery.list) || (lottery == null ? void 0 : lottery.activities) || (lottery == null ? void 0 : lottery.data) || [];
      if (Array.isArray(list) && list.length)
        this.commentLotteryActivities = list;
    },
    syncMarketingFromDetail() {
      const signConfig = this.detail.signConfig || this.detail.sign_config || this.detail.sign || {};
      this.signState = {
        enabled: signConfig.enabled === true || Number(signConfig.enabled || 0) === 1,
        signed: !!(signConfig.signed || signConfig.hasSigned),
        fields: Array.isArray(signConfig.fields) ? signConfig.fields : [],
        welcomeText: signConfig.welcomeText || signConfig.title || ""
      };
      const watchSource = this.detail.watchRewardTasks || this.detail.watchRewards || this.detail.watchRewardList || [];
      this.watchRewardTasks = Array.isArray(watchSource) ? watchSource : Array.isArray(watchSource.tasks) ? watchSource.tasks : [];
      const normalLotterySource = this.detail.normalLotteryActivities || this.detail.lotteryActivities || this.detail.lotteryList || this.detail.lotteries || [];
      this.normalLotteryActivities = Array.isArray(normalLotterySource) ? normalLotterySource : Array.isArray(normalLotterySource.list) ? normalLotterySource.list : [];
      const lotterySource = this.detail.commentLotteryActivities || this.detail.commentLotteryList || this.detail.commentLottery || [];
      this.commentLotteryActivities = Array.isArray(lotterySource) ? lotterySource : Array.isArray(lotterySource.list) ? lotterySource.list : [];
    },
    async connectRoom() {
      var _a;
      if (!this.roomId)
        return;
      (_a = this.socket) == null ? void 0 : _a.close();
      const apiBase = api_h5.getH5ApiBaseUrl();
      const wsBase = apiBase.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");
      const sign = await api_live.getWsSignKey().catch(() => null);
      const signKey = (sign == null ? void 0 : sign.signKey) || "";
      this.socket = new utils_miniLiveSocket.MiniLiveSocket({
        url: `${wsBase}/h5/live/ws?roomId=${encodeURIComponent(this.roomId)}`,
        token: common_vendor.index.getStorageSync("h5_token") || common_vendor.index.getStorageSync("token") || "",
        liveId: this.roomId,
        signKey,
        onMessage: this.handleSocketMessage,
        onStateChange: (state) => {
          this.socketState = state;
        },
        onOpen: (event) => {
          if (event == null ? void 0 : event.isReconnect)
            this.loadComments();
        }
      });
      this.socket.connect();
    },
    async refreshLiveStatusNow() {
      if (!this.roomId || this.isReplay)
        return;
      const status = await api_live.getLiveStatus(this.roomId).catch(() => null);
      if (status && typeof status === "object")
        this.applyLiveStatusSnapshot(status.data || status);
    },
    async enterRoom() {
      if (!this.roomId)
        return;
      this.enteredAt = Date.now();
      await api_live.enterLiveRoom(this.roomId, this.sessionId, this.roomCode, this.options.termId).catch((error) => {
        const payload = extractErrorPayload(error);
        if (payload.viewerLimitReached || /观看人数.*上限|人数已达上限/.test(String(payload.msg || payload.message || ""))) {
          this.applyViewerLimitReached(payload);
        } else if (payload.isBlocked || payload.userBlocked || payload.trafficExceeded || payload.needAuth && payload.hasAccess === false) {
          this.applyAccessRestrictions(payload);
        }
      });
      if (this.viewerLimitReached || this.accessDenied)
        return;
      this.heartbeatTimer = setInterval(() => {
        this.watchSeconds = Math.floor((Date.now() - this.enteredAt) / 1e3);
        api_live.liveHeartbeat(this.roomId, this.sessionId, this.watchSeconds).catch(() => {
        });
      }, 15e3);
    },
    teardownRoom() {
      var _a;
      if (this.isReplay)
        this.reportReplayProgress(this.replayLastTime, 1, true);
      if (this.heartbeatTimer)
        clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      (_a = this.socket) == null ? void 0 : _a.close();
      this.socket = null;
      if (this.roomId && this.enteredAt) {
        const duration = Math.floor((Date.now() - this.enteredAt) / 1e3);
        api_live.leaveLiveRoom(this.roomId, this.sessionId, duration).catch(() => {
        });
      }
    },
    handleSocketMessage(message = {}) {
      if (!message)
        return;
      const payload = message.data && typeof message.data === "object" ? message.data : message;
      if (message.type === "viewer_count") {
        this.viewerCount = message.count || message.onlineCount || this.viewerCount;
        return;
      }
      if (message.type === "like") {
        this.likeCount = Number(message.totalLikes || message.likeCount || this.likeCount);
        return;
      }
      if (message.type === "product") {
        const item = message.product || message.data || message;
        this.currentProduct = item && typeof item === "object" ? item : this.currentProduct;
        return;
      }
      if (["product_status_update", "product_list", "product_stock"].includes(message.type)) {
        this.loadProducts();
        this.loadCurrentProduct();
        return;
      }
      if (message.type === "live_status_update") {
        this.applyLiveStatusSnapshot(message.data || message.snapshot || message);
        return;
      }
      if (message.type === "r_to_buy" || message.type === "system" && (payload.buyReminder || payload.simOrder || payload.paidOrder)) {
        this.handleBuyingNoticeMessage(message, payload);
        return;
      }
      if (message.type === "chat" || message.type === "comment_audit" || message.type === "enter" || message.type === "system") {
        this.messages.push({
          id: message.id || message.msgId || uniqueId(),
          commentId: payload.commentId || message.commentId || 0,
          msgId: message.msgId || payload.msgId || "",
          type: message.type === "comment_audit" ? "chat" : message.type,
          nick: message.nick || message.nickname,
          content: message.content || message.text || message.message,
          isTop: Number(payload.isTop || message.isTop || 0)
        });
        this.scrollToBottom();
        return;
      }
      if (["win_notify", "lottery_result", "win_record_update", "comment_lottery", "comment_lottery_event", "watch_reward_lifecycle", "watch_reward_broadcast"].includes(message.type)) {
        this.handleMarketingSocketMessage(message, payload);
        return;
      }
      if (["comment_delete", "comment_top", "comment_clear", "mute_word_filtered"].includes(message.type)) {
        this.handleCommentControlMessage(message, payload);
        return;
      }
      if (message.type === "setting_update") {
        const setting = payload.setting || payload;
        this.applyLiveStatusSnapshot({ setting });
        const muteAll = setting.muteAll ?? payload.muteAll;
        if (muteAll !== void 0)
          this.chatDisabled = Number(muteAll || 0) === 1;
        return;
      }
      if (message.type === "user_muted") {
        this.chatDisabled = true;
        common_vendor.index.showToast({ title: "您已被禁言", icon: "none" });
        return;
      }
      if (message.type === "user_unblocked") {
        this.chatDisabled = false;
        common_vendor.index.showToast({ title: "禁言已解除", icon: "none" });
        return;
      }
      if (message.type === "user_blocked") {
        this.chatDisabled = true;
        this.errorText = "您已被限制观看";
        return;
      }
      if (message.type === "live_ended") {
        this.playerUrl = "";
        this.liveEnded = true;
        this.liveEndedReason = payload.reason || message.reason || "直播已结束";
        this.messages = [];
        this.appendSystemMessage(this.liveEndedReason, "系统");
        return;
      }
      if (message.type === "video_loop_restart") {
        this.resetReplaySimState();
        this.replayLastTime = 0;
        try {
          const video = common_vendor.index.createVideoContext("broadcastVideoPlayer", this);
          video.seek(0);
          video.play();
        } catch (error) {
        }
      }
    },
    appendSystemMessage(content = "", nick = "系统", extra = {}) {
      const text = String(content || "").trim();
      if (!text)
        return;
      this.messages.push({
        id: extra.id || extra.msgId || uniqueId(),
        type: "system",
        nick,
        content: text,
        ...extra
      });
      this.scrollToBottom();
    },
    handleBuyingNoticeMessage(message = {}, payload = {}) {
      const nick = message.nick || message.nickname || payload.nickname || payload.customerName || "观众";
      const productName = payload.productName || payload.goods_name || payload.goodsName || message.productName || "";
      const noticeText = message.noticeText || payload.noticeText || (payload.paidOrder ? "刚刚下单成功" : "正在去购买");
      const content = productName ? `${nick}${noticeText}${productName}` : `${nick}${noticeText}`;
      this.showTransientBuyingNotice(content);
      this.appendSystemMessage(content, "购买");
      if (payload.productId || payload.goods_id || payload.goodsId)
        this.loadProducts();
    },
    handleMarketingSocketMessage(message = {}, payload = {}) {
      const text = message.content || message.message || payload.content || payload.message || payload.title || payload.activityName || "直播活动状态已更新";
      this.showTransientMarketingNotice(text);
      this.appendSystemMessage(text, "活动", { msgId: message.msgId || payload.msgId || "" });
      this.loadMarketing();
    },
    applyLiveStatusSnapshot(payload = {}) {
      var _a;
      if (!payload || typeof payload !== "object")
        return;
      if (payload.onlineCount !== void 0 || payload.count !== void 0) {
        this.viewerCount = payload.onlineCount ?? payload.count ?? this.viewerCount;
      }
      if (payload.likeCount !== void 0 || payload.totalLikes !== void 0) {
        const nextLike = Number(payload.likeCount ?? payload.totalLikes);
        if (Number.isFinite(nextLike))
          this.likeCount = Math.max(Number(this.likeCount || 0), nextLike);
      }
      const nextSetting = payload.setting || payload.roomSetting;
      if (nextSetting && typeof nextSetting === "object") {
        this.detail = {
          ...this.detail,
          setting: {
            ...this.detail.setting || {},
            ...nextSetting,
            ...nextSetting.marqueePosition === void 0 && nextSetting.marqueeEnabled !== void 0 ? { marqueePosition: 1 } : {}
          }
        };
        this.marqueeDismissed = false;
        if (nextSetting.enableChat !== void 0 && Number(nextSetting.enableChat) === 0)
          this.activeTab = "products";
      }
      const nextDetail = { ...this.detail, ...payload };
      if (nextSetting && typeof nextSetting === "object") {
        nextDetail.setting = { ...this.detail.setting || {} };
      }
      this.detail = nextDetail;
      if (Number(payload.pushStatus ?? payload.live_status ?? this.detail.pushStatus ?? 0) === 2) {
        this.liveEnded = true;
        this.liveEndedReason = payload.reason || payload.message || "直播已结束";
        this.playerUrl = "";
        this.messages = [];
        return;
      }
      if (this.isLiveMode) {
        const candidates = utils_liveRoute.getMiniProgramLiveCandidates(nextDetail, payload.streamInf || payload.streamInfo || payload);
        if (candidates.length) {
          const currentUrl = this.playerUrl;
          this.liveCandidates = candidates;
          const currentIndex = candidates.findIndex((candidate) => candidate.url === currentUrl);
          this.liveCandidateIndex = currentIndex >= 0 ? currentIndex : 0;
          const nextUrl = ((_a = candidates[this.liveCandidateIndex]) == null ? void 0 : _a.url) || "";
          if (nextUrl && nextUrl !== currentUrl) {
            this.switchToLiveCandidate(this.liveCandidateIndex, "status");
          }
        }
      }
    },
    handleCommentControlMessage(message = {}, payload = {}) {
      if (message.type === "comment_clear") {
        this.messages = [];
        return;
      }
      if (message.type === "comment_delete") {
        const ids = payload.commentIds || payload.ids || message.commentIds || [];
        const idSet = new Set((Array.isArray(ids) ? ids : [ids]).map((id) => Number(id || 0)).filter(Boolean));
        if (!idSet.size)
          return;
        this.messages = this.messages.filter((item) => !idSet.has(Number(item.commentId || item.id || 0)));
        return;
      }
      if (message.type === "comment_top") {
        const commentId = Number(payload.commentId || message.commentId || 0);
        const isTop = Number(payload.isTop ?? message.isTop ?? 0);
        if (!commentId)
          return;
        this.messages = this.messages.map((item) => ({
          ...item,
          isTop: Number(item.commentId || item.id || 0) === commentId ? isTop : isTop === 1 ? 0 : Number(item.isTop || 0)
        }));
        return;
      }
      if (message.type === "mute_word_filtered") {
        const content = String(message.content || payload.content || "").trim();
        if (!content)
          return;
        this.messages = this.messages.map((item) => item.type === "chat" && item.content === content ? { ...item, private: true, content: "该评论已被过滤" } : item);
      }
    },
    scrollToBottom() {
      const updateScrollId = () => {
        const last = this.visibleMessages[this.visibleMessages.length - 1];
        if (last)
          this.scrollToId = `msg-${last.id}`;
      };
      if (typeof this.$nextTick === "function") {
        this.$nextTick(updateScrollId);
        return;
      }
      setTimeout(updateScrollId, 0);
    },
    async sendComment() {
      var _a;
      const text = String(this.inputText || "").trim();
      if (!text || this.chatDisabled)
        return;
      this.inputText = "";
      const optimistic = { id: uniqueId(), type: "chat", nick: "我", content: text };
      this.messages.push(optimistic);
      this.scrollToBottom();
      (_a = this.socket) == null ? void 0 : _a.sendChat(text, { replayVideoId: this.currentReplayVideoId() });
      await api_live.sendLiveComment(this.roomId, text, { replayVideoId: this.currentReplayVideoId() }).catch(() => {
      });
      await this.tryClaimCommentReward(text);
    },
    async tryClaimCommentReward(text) {
      const activity = this.commentLotteryActivities.find((item) => Number(item.status || item.drawStatus || 0) === 1) || this.commentLotteryActivities[0];
      if (!(activity == null ? void 0 : activity.activityId) && !(activity == null ? void 0 : activity.id))
        return;
      await api_marketing.claimCommentReward({
        activityId: activity.activityId || activity.id,
        prizeId: activity.activePrizeId || activity.prizeId,
        comment: text
      }).catch(() => {
      });
    },
    async sendLikeTap() {
      var _a;
      this.likeCount += 1;
      (_a = this.socket) == null ? void 0 : _a.sendLike(1);
      await api_live.sendLike(this.roomId, 1).catch(() => {
      });
    },
    focusCommentInput() {
      if (!this.chatDisabled)
        this.inputFocused = true;
    },
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    toggleMute() {
      this.muted = !this.muted;
      common_vendor.index.setStorageSync("broadcast_sound_intent", this.muted ? "muted" : "sound");
    },
    toggleProducts() {
      this.showProducts = !this.showProducts;
    },
    productName(item = {}) {
      return item.name || item.productName || item.product_name || item.title || "直播商品";
    },
    productImage(item = {}) {
      return item.image || item.productImage || item.product_image || item.cover || "";
    },
    formatProductPrice(item = {}) {
      const value = item.price ?? item.productPrice ?? item.minPrice ?? item.salePrice ?? item.product_price ?? "0.00";
      const number = Number(value);
      if (!Number.isFinite(number))
        return String(value || "0.00");
      return number.toFixed(number % 1 === 0 ? 0 : 2);
    },
    handleMarketingAction(type) {
      this.marketingPanelType = type;
      this.showMarketingPanel = true;
    },
    closeMarketingPanel() {
      this.showMarketingPanel = false;
      this.marketingPanelType = "";
    },
    async submitLiveSign() {
      if (this.signState.signed || this.marketingLoading)
        return;
      this.marketingLoading = true;
      try {
        await api_live.submitSign(this.roomId, { source: "mp-weixin", roomCode: this.roomCode });
        this.signState.signed = true;
        common_vendor.index.showToast({ title: "签到成功", icon: "success" });
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.msg) || (error == null ? void 0 : error.message) || "签到失败", icon: "none" });
      } finally {
        this.marketingLoading = false;
      }
    },
    async handleMarketingItem(item = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      if (item.type === "reward") {
        const activityId = ((_a = item.raw) == null ? void 0 : _a.activityId) || ((_b = item.raw) == null ? void 0 : _b.id);
        if (!activityId) {
          common_vendor.index.showToast({ title: "活动信息缺失", icon: "none" });
          return;
        }
        try {
          await api_marketing.claimWatchReward({ activityId, roomId: this.roomId, watchDuration: this.watchSeconds });
          common_vendor.index.showToast({ title: "领取成功", icon: "success" });
          this.loadMarketing();
        } catch (error) {
          common_vendor.index.showToast({ title: (error == null ? void 0 : error.msg) || (error == null ? void 0 : error.message) || "暂未满足领取条件", icon: "none" });
        }
        return;
      }
      if (item.type === "lottery") {
        const hint = ((_c = item.raw) == null ? void 0 : _c.displayPasswordText) || ((_d = item.raw) == null ? void 0 : _d.tipText) || "请在评论区发送指定口令参与";
        common_vendor.index.showToast({ title: hint, icon: "none" });
        this.closeMarketingPanel();
      }
      if (item.type === "normalLottery") {
        const activityId = ((_e = item.raw) == null ? void 0 : _e.activityId) || ((_f = item.raw) == null ? void 0 : _f.id);
        const data = await api_marketing.getLotteryParticipants({
          activityId,
          drawId: (_g = item.raw) == null ? void 0 : _g.drawId,
          participantsUrl: (_h = item.raw) == null ? void 0 : _h.participantsUrl
        }).catch(() => null);
        const count = (data == null ? void 0 : data.total) || ((_i = data == null ? void 0 : data.list) == null ? void 0 : _i.length) || ((_j = item.raw) == null ? void 0 : _j.participantCount) || 0;
        common_vendor.index.showToast({ title: count ? `${count}人已参与` : "等待主播开奖", icon: "none" });
      }
    },
    openShare() {
      common_vendor.index.showShareMenu && common_vendor.index.showShareMenu({ withShareTicket: true, menus: ["shareAppMessage", "shareTimeline"] });
      common_vendor.index.showToast({ title: "请点击右上角分享", icon: "none" });
    },
    goCenter() {
      const query = this.roomCode ? `roomCode=${encodeURIComponent(this.roomCode)}` : `roomId=${encodeURIComponent(this.roomId)}`;
      common_vendor.index.switchTab({
        url: "/pages/user/index/index",
        fail: () => common_vendor.index.navigateTo({ url: `/pages/user/index/index?${query}` })
      });
      utils_liveRoomContext.saveLiveRoomContext({ roomId: this.roomId, roomCode: this.roomCode, liveName: this.roomName, cover: this.coverImage });
    },
    goReport() {
      const fromPath = encodeURIComponent("/pages/broadcast/entry");
      const room = this.roomCode ? `&roomCode=${encodeURIComponent(this.roomCode)}` : `&roomId=${encodeURIComponent(this.roomId)}`;
      common_vendor.index.navigateTo({ url: `/pages/report/report-type?fromPath=${fromPath}${room}` });
    },
    openProduct(item = {}) {
      const productId = item.productId || item.product_id || item.id || "";
      const skuId = item.productSkuId || item.product_sku_id || item.skuId || "";
      if (!productId)
        return;
      utils_liveRoomContext.saveLiveRoomContext({ roomId: this.roomId, roomCode: this.roomCode, liveName: this.roomName, cover: this.coverImage });
      api_live.sendBuyReminder({ roomId: this.roomId, productId }).catch(() => {
      });
      common_vendor.index.navigateTo({
        url: `/pages/product/detail/detail?product_id=${productId}&product_sku_id=${skuId}&room_id=${this.roomId}&roomCode=${encodeURIComponent(this.roomCode)}`
      });
    },
    returnToLive() {
      const options = {
        roomCode: this.roomCode,
        liveId: this.roomId,
        roomId: this.roomId
      };
      common_vendor.index.redirectTo({ url: `/pages/broadcast/entry?${this.roomCode ? `roomCode=${encodeURIComponent(this.roomCode)}` : `liveId=${encodeURIComponent(this.roomId)}`}` });
      utils_liveRoomContext.saveLiveRoomContext(options);
    },
    playReplay(index) {
      this.replayIndex = index;
      this.replayInitialTime = 0;
      this.replayLastTime = 0;
      this.lastProgressReportAt = 0;
      this.lastProgressReportedSecond = 0;
      this.resetPlaybackPosterState();
      this.resetReplaySimState();
      this.replayProductSchedule.resetScheduleState();
      this.scheduleExplainActiveId = 0;
      this.playerUrl = utils_liveRoute.getBestReplayUrl(this.detail, this.replayVideos[index] || {});
      this.loadComments();
    },
    currentReplayVideoId() {
      const current = this.replayVideos[this.replayIndex] || {};
      return current.id || current.videoId || current.video_id || 0;
    },
    syncReplayProductSchedule(currentTime = 0) {
      if (!this.isReplay || !this.products.length)
        return;
      const result = this.replayProductSchedule.syncReplaySchedule({
        productList: this.products,
        currentTime,
        currentVideoUrl: this.playerUrl,
        currentVideoId: this.currentReplayVideoId()
      });
      if (result.shouldActivate && result.product) {
        this.currentProduct = result.product;
        this.scheduleExplainActiveId = result.product.id || result.product.productId || 0;
        return;
      }
      if (result.shouldDeactivate && this.scheduleExplainActiveId) {
        this.scheduleExplainActiveId = 0;
        const fallback = this.products.find((item) => Number(item.isCurrent || item.is_current || 0) === 1);
        this.currentProduct = fallback || null;
      }
    },
    async onVideoTimeUpdate(event) {
      var _a;
      this.markPlaybackReady();
      const currentTime = Math.floor(((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.currentTime) || 0);
      const previousTime = this.replayLastTime;
      this.replayLastTime = currentTime;
      if (this.isReplay && currentTime + 2 < previousTime)
        this.resetReplaySimState();
      await this.loadReplaySimMessages(currentTime);
      this.syncReplayProductSchedule(currentTime);
      const current = this.replayVideos[this.replayIndex] || {};
      const id = current.id || current.videoId || current.video_id || this.replayIndex;
      if (!this.roomId || !id)
        return;
      common_vendor.index.setStorageSync(`replay_progress_${this.roomId}_${id}`, currentTime);
      this.reportReplayProgress(currentTime, 1, false);
    },
    onVideoEnded() {
      if (this.isReplay)
        this.reportReplayProgress(this.replayLastTime, 2, true);
      if (this.isReplay && this.replayIndex < this.replayVideos.length - 1)
        this.playReplay(this.replayIndex + 1);
    },
    reportReplayProgress(lastPosition = 0, watchStatus = 1, force = false) {
      if (!this.isReplay || !this.roomId)
        return;
      const current = this.replayVideos[this.replayIndex] || {};
      const videoId = current.id || current.videoId || current.video_id || 0;
      const termId = current.termId || current.term_id || this.options.termId || this.detail.termId || this.detail.term_id || 0;
      const position = Math.floor(Number(lastPosition || 0));
      if (!videoId || !termId || position <= 0)
        return;
      const now = Date.now();
      if (!force && now - this.lastProgressReportAt < 15e3 && Math.abs(position - this.lastProgressReportedSecond) < 10)
        return;
      this.lastProgressReportAt = now;
      this.lastProgressReportedSecond = position;
      api_live.reportViewProgress({
        roomId: this.roomId,
        termId,
        videoId,
        lastPosition: position,
        watchDuration: position,
        watchStatus
      }).catch(() => {
      });
    },
    resetReplaySimState() {
      this.replaySimLoadedUntil = 0;
      this.replaySimVideoId = 0;
      this.replaySimTimeline = [];
      this.replaySimCursor = 0;
      this.replaySimLoading = false;
      this.replaySimSeen = {};
    },
    async loadReplaySimMessages(currentTime = 0) {
      if (!this.isReplay)
        return;
      const videoId = this.currentReplayVideoId();
      if (!videoId)
        return;
      if (this.replaySimVideoId !== Number(videoId)) {
        this.resetReplaySimState();
        this.replaySimVideoId = Number(videoId);
      }
      if (!this.replaySimLoadedUntil || currentTime >= this.replaySimLoadedUntil - REPLAY_SIM_PRELOAD_LEAD_SECONDS) {
        await this.loadReplaySimWindow(videoId, this.replaySimLoadedUntil || replaySimWindowStart(currentTime));
      }
      this.consumeReplaySimMessages(currentTime);
    },
    async loadReplaySimWindow(videoId, startSec = 0) {
      if (this.replaySimLoading)
        return;
      this.replaySimLoading = true;
      const alignedStart = replaySimWindowStart(startSec);
      const endSec = alignedStart + REPLAY_SIM_WINDOW_SIZE;
      try {
        const data = await api_live.getReplaySimMessages(videoId, alignedStart, endSec).catch(() => null);
        const list = Array.isArray(data) ? data : (data == null ? void 0 : data.list) || (data == null ? void 0 : data.data) || [];
        const existing = new Set(this.replaySimTimeline.map((item, index) => replaySimMessageKey(item, videoId, index)));
        list.forEach((item, index) => {
          const next = { ...item, triggerAtSec: replaySimSecond(item) };
          const id = replaySimMessageKey(next, videoId, index);
          if (existing.has(id))
            return;
          existing.add(id);
          this.replaySimTimeline.push(next);
        });
        this.replaySimTimeline.sort((a, b) => replaySimSecond(a) - replaySimSecond(b));
        this.replaySimLoadedUntil = endSec;
      } finally {
        this.replaySimLoading = false;
      }
    },
    consumeReplaySimMessages(currentTime = 0) {
      const second = Math.floor(Number(currentTime || 0));
      let appended = false;
      while (this.replaySimCursor < this.replaySimTimeline.length) {
        const item = this.replaySimTimeline[this.replaySimCursor];
        if (replaySimSecond(item) > second)
          break;
        this.replaySimCursor += 1;
        const id = replaySimMessageKey(item, this.currentReplayVideoId(), this.replaySimCursor);
        if (this.replaySimSeen[id])
          continue;
        this.replaySimSeen[id] = true;
        const payload = item.data && typeof item.data === "object" ? item.data : item;
        const type = String(item.type || item.msgType || item.event || "").toLowerCase();
        if (type === "r_to_buy" || type === "buying_notice" || payload.paidOrder || payload.simOrder || payload.orderNo || payload.productName || payload.goodsName || payload.goods_name) {
          this.handleBuyingNoticeMessage(item, payload);
          appended = true;
          continue;
        }
        this.messages.push({
          id,
          type: item.type || "system",
          nick: item.nick || item.nickname || item.userName || "观众",
          content: item.content || item.message || item.text || item.productName || "正在观看直播回放"
        });
        appended = true;
      }
      if (appended)
        this.scrollToBottom();
    },
    onLiveStateChange(event) {
      var _a;
      const code = Number((_a = event.detail) == null ? void 0 : _a.code);
      if (LIVE_PLAYER_READY_CODES.includes(code))
        this.markPlaybackReady();
      if (LIVE_PLAYER_FAILURE_CODES.includes(code)) {
        this.tryNextLiveCandidate(`state:${code}`);
      }
    },
    onLivePlayerError(event) {
      var _a;
      this.tryNextLiveCandidate(`error:${((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.errCode) || ""}`);
    },
    onVideoError(event) {
      var _a;
      if (this.isLiveMode && this.tryNextLiveCandidate(`video:${((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.errCode) || ""}`))
        return;
      if (this.isReplay)
        this.errorText = "回放播放失败，请稍后重试";
    },
    onNetStatus(event) {
      var _a;
      const info = ((_a = event.detail) == null ? void 0 : _a.info) || {};
      if (info.netQualityLevel >= 5)
        common_vendor.index.showToast({ title: "当前网络不稳定", icon: "none" });
    },
    onFullscreenChange(event) {
      var _a;
      this.fullscreen = !!((_a = event.detail) == null ? void 0 : _a.fullScreen);
    },
    formatSystemMessage(item = {}) {
      if (item.type === "enter")
        return "进入直播间";
      if (item.type === "system")
        return item.content || "系统消息";
      return "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : $data.errorText ? common_vendor.e({
    c: $options.coverImage
  }, $options.coverImage ? {
    d: $options.coverImage
  } : {}, {
    e: common_vendor.t($data.errorText),
    f: $data.liveCandidates.length
  }, $data.liveCandidates.length ? {
    g: common_vendor.t($data.liveCandidateIndex + 1),
    h: common_vendor.t($data.liveCandidates.length)
  } : {}, {
    i: common_vendor.o((...args) => $options.loadRoom && $options.loadRoom(...args), "42")
  }) : common_vendor.e({
    j: $data.viewerLimitReached
  }, $data.viewerLimitReached ? {
    k: common_vendor.t($data.viewerLimitText || "观看人数已达上限")
  } : $data.accessDenied ? {
    m: common_vendor.t($options.accessDeniedTitle),
    n: $options.accessDeniedAvatar || $data.defaultAvatar,
    o: common_vendor.t($options.accessDeniedUserName),
    p: common_vendor.t($options.accessDeniedUidText),
    q: common_vendor.o((...args) => $options.copyAccessUid && $options.copyAccessUid(...args), "55")
  } : !$data.isLandscape ? common_vendor.e({
    s: $data.showReplayFirstVideoLoading
  }, $data.showReplayFirstVideoLoading ? {} : {}, {
    t: $options.useLivePlayer && $data.playerUrl
  }, $options.useLivePlayer && $data.playerUrl ? {
    v: $data.playerUrl,
    w: $data.muted,
    x: common_vendor.o((...args) => $options.onLiveStateChange && $options.onLiveStateChange(...args), "b4"),
    y: common_vendor.o((...args) => $options.onNetStatus && $options.onNetStatus(...args), "5d"),
    z: common_vendor.o((...args) => $options.onLivePlayerError && $options.onLivePlayerError(...args), "ba"),
    A: common_vendor.o((...args) => $options.onFullscreenChange && $options.onFullscreenChange(...args), "f4")
  } : $data.playerUrl ? {
    C: $data.isReplay ? 1 : "",
    D: $data.playerUrl,
    E: $data.muted,
    F: $data.isReplay,
    G: $data.replayInitialTime,
    H: $data.isReplay,
    I: common_vendor.o((...args) => $options.markPlaybackReady && $options.markPlaybackReady(...args), "09"),
    J: common_vendor.o((...args) => $options.markPlaybackReady && $options.markPlaybackReady(...args), "65"),
    K: common_vendor.o((...args) => $options.onVideoTimeUpdate && $options.onVideoTimeUpdate(...args), "c5"),
    L: common_vendor.o((...args) => $options.onVideoEnded && $options.onVideoEnded(...args), "04"),
    M: common_vendor.o((...args) => $options.onVideoError && $options.onVideoError(...args), "e3")
  } : $options.coverImage ? {
    O: $options.coverImage
  } : {}, {
    B: $data.playerUrl,
    N: $options.coverImage,
    P: $options.shouldRenderPortraitReplayPoster
  }, $options.shouldRenderPortraitReplayPoster ? {
    Q: $options.replayCoverPoster,
    R: $options.replayPosterHidden ? 1 : ""
  } : {}, {
    S: $options.shouldShowMarquee
  }, $options.shouldShowMarquee ? {
    T: common_vendor.t($options.marqueeText),
    U: common_vendor.o((...args) => $options.dismissMarquee && $options.dismissMarquee(...args), "fd"),
    V: common_vendor.s($options.marqueeTrackStyle),
    W: common_vendor.o(() => {
    }, "46"),
    X: common_vendor.n($options.marqueePositionClass)
  } : {}, {
    Y: $options.showExternalLotteryTools
  }, $options.showExternalLotteryTools ? common_vendor.e({
    Z: $options.showCommentLotteryEntry
  }, $options.showCommentLotteryEntry ? common_vendor.e({
    aa: $data.commentLotteryBubbleVisible
  }, $data.commentLotteryBubbleVisible ? {
    ab: common_vendor.t($options.commentLotteryKeyword),
    ac: common_vendor.o((...args) => $options.hideCommentLotteryBubble && $options.hideCommentLotteryBubble(...args), "62"),
    ad: common_vendor.o(($event) => $options.handleMarketingAction("lottery"), "fa")
  } : {}, {
    ae: common_vendor.o(($event) => $options.handleMarketingAction("lottery"), "31")
  }) : {}, {
    af: $options.showWatchRewardEntry
  }, $options.showWatchRewardEntry ? {
    ag: common_vendor.t($options.watchRewardEntryLabel),
    ah: common_vendor.o(($event) => $options.handleMarketingAction("reward"), "e1")
  } : {}, {
    ai: common_vendor.o(() => {
    }, "e9")
  }) : {}, {
    aj: $options.showBuyingNotice
  }, $options.showBuyingNotice ? {
    ak: common_vendor.t($data.buyingNoticeText)
  } : {}, {
    al: $data.marketingNoticeText
  }, $data.marketingNoticeText ? {
    am: common_vendor.t($data.marketingNoticeText)
  } : {}, {
    an: $options.showPlaybackDebug
  }, $options.showPlaybackDebug ? {
    ao: common_vendor.t($data.playerUrl ? "ready" : "empty"),
    ap: common_vendor.t($options.activeLiveCandidate.type || $options.activePlaybackComponent),
    aq: common_vendor.t($data.socketState),
    ar: common_vendor.t($data.replayLastTime)
  } : {}, {
    as: $options.anchorAvatar || $data.defaultAvatar,
    at: common_vendor.t($options.anchorName),
    av: common_vendor.t($options.anchorSubText),
    aw: !$options.anchorName ? 1 : "",
    ax: !$data.isReplay
  }, !$data.isReplay ? common_vendor.e({
    ay: $options.isLivePushing
  }, $options.isLivePushing ? {} : {}, {
    az: common_vendor.t($options.liveStatusLabel),
    aA: common_vendor.n($options.liveStatusClass)
  }) : {}, {
    aB: common_assets._imports_0$1,
    aC: common_vendor.t($options.displayViewerCount),
    aD: common_assets._imports_1$1,
    aE: common_vendor.o((...args) => $options.goReport && $options.goReport(...args), "f2"),
    aF: $options.noticeText
  }, $options.noticeText ? {
    aG: common_vendor.t($options.noticeText)
  } : {}, {
    aH: $options.pinnedMessage
  }, $options.pinnedMessage ? {
    aI: common_vendor.t($options.pinnedMessage.nick),
    aJ: common_vendor.t($options.pinnedMessage.content)
  } : {}, {
    aK: $options.shouldShowComments
  }, $options.shouldShowComments ? {
    aL: common_vendor.f($options.visibleMessages, (msg, k0, i0) => {
      return common_vendor.e({
        a: msg.type === "system"
      }, msg.type === "system" ? {
        b: common_vendor.t(msg.content)
      } : msg.type === "enter" || msg.type === "leave" ? {
        d: common_vendor.t(msg.content)
      } : common_vendor.e({
        e: msg.isAdmin
      }, msg.isAdmin ? {} : {}, {
        f: common_vendor.t(msg.nick),
        g: common_vendor.t(msg.content)
      }), {
        c: msg.type === "enter" || msg.type === "leave",
        h: `msg-${msg.id}`,
        i: msg.id,
        j: msg.type === "system" ? 1 : "",
        k: msg.type === "enter" || msg.type === "leave" ? 1 : ""
      });
    }),
    aM: $data.scrollToId
  } : {}, {
    aN: $options.currentProductName
  }, $options.currentProductName ? common_vendor.e({
    aO: $options.currentProductImage
  }, $options.currentProductImage ? {
    aP: $options.currentProductImage
  } : {}, {
    aQ: common_vendor.t($options.currentProductName),
    aR: common_vendor.t($options.formatProductPrice($data.currentProduct)),
    aS: common_vendor.o(($event) => $options.openProduct($data.currentProduct), "3e")
  }) : {}, {
    aT: $data.chatDisabled
  }, $data.chatDisabled ? {} : {}, {
    aU: $options.quickReplies.length && !$data.inputFocused && !$data.chatDisabled
  }, $options.quickReplies.length && !$data.inputFocused && !$data.chatDisabled ? {
    aV: common_vendor.f($options.quickReplies, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.id,
        c: common_vendor.o(($event) => $options.useQuickReply(item.content), item.id)
      };
    })
  } : {}, {
    aW: $options.roomSetting.showProduct !== 0
  }, $options.roomSetting.showProduct !== 0 ? {
    aX: common_vendor.t($options.productTotalText),
    aY: common_vendor.o((...args) => $options.toggleProducts && $options.toggleProducts(...args), "74")
  } : {}, {
    aZ: $data.chatDisabled,
    ba: $data.chatDisabled ? "当前不可评论" : "说点什么吧~",
    bb: common_vendor.o(($event) => $data.inputFocused = true, "a6"),
    bc: common_vendor.o(($event) => $data.inputFocused = false, "34"),
    bd: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args), "77"),
    be: $data.inputText,
    bf: common_vendor.o(($event) => $data.inputText = $event.detail.value, "5b"),
    bg: $data.chatDisabled ? 1 : "",
    bh: common_vendor.o((...args) => $options.focusCommentInput && $options.focusCommentInput(...args), "44"),
    bi: $data.inputFocused
  }, $data.inputFocused ? {
    bj: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args), "8d")
  } : {
    bk: common_assets._imports_2$1,
    bl: common_vendor.o((...args) => $options.goCenter && $options.goCenter(...args), "9c"),
    bm: common_assets._imports_3,
    bn: common_vendor.o((...args) => $options.toggleProducts && $options.toggleProducts(...args), "3b"),
    bo: common_vendor.o((...args) => $options.openShare && $options.openShare(...args), "0a"),
    bp: common_assets._imports_4,
    bq: common_vendor.t($options.likeCountText),
    br: common_vendor.o((...args) => $options.sendLikeTap && $options.sendLikeTap(...args), "bb")
  }, {
    bs: $data.inputFocused ? 1 : "",
    bt: $data.showEntryOverlay
  }, $data.showEntryOverlay ? {
    bv: common_vendor.o((...args) => $options.enterLiveByGesture && $options.enterLiveByGesture(...args), "06")
  } : {}, {
    bw: $options.showEndedOverlay
  }, $options.showEndedOverlay ? {
    bx: common_vendor.t($options.endedOverlayTitle),
    by: common_vendor.t($options.displayViewerCount),
    bz: $options.anchorAvatar || $data.defaultAvatar,
    bA: common_vendor.t($options.anchorName || "主播")
  } : {}, {
    bB: $options.isLiveMode ? 1 : "",
    bC: $data.isReplay ? 1 : "",
    bD: $options.isLiveMode ? 1 : "",
    bE: $data.isReplay ? 1 : ""
  }) : common_vendor.e({
    bF: $options.useLivePlayer && $data.playerUrl
  }, $options.useLivePlayer && $data.playerUrl ? {
    bG: $data.playerUrl,
    bH: $data.muted,
    bI: common_vendor.o((...args) => $options.onLiveStateChange && $options.onLiveStateChange(...args), "e3"),
    bJ: common_vendor.o((...args) => $options.onNetStatus && $options.onNetStatus(...args), "3c"),
    bK: common_vendor.o((...args) => $options.onLivePlayerError && $options.onLivePlayerError(...args), "26"),
    bL: common_vendor.o((...args) => $options.onFullscreenChange && $options.onFullscreenChange(...args), "e7")
  } : $data.playerUrl ? {
    bN: $data.playerUrl,
    bO: $data.muted,
    bP: $data.isReplay,
    bQ: $data.replayInitialTime,
    bR: common_vendor.o((...args) => $options.markPlaybackReady && $options.markPlaybackReady(...args), "7d"),
    bS: common_vendor.o((...args) => $options.markPlaybackReady && $options.markPlaybackReady(...args), "f5"),
    bT: common_vendor.o((...args) => $options.onVideoTimeUpdate && $options.onVideoTimeUpdate(...args), "3b"),
    bU: common_vendor.o((...args) => $options.onVideoEnded && $options.onVideoEnded(...args), "de"),
    bV: common_vendor.o((...args) => $options.onVideoError && $options.onVideoError(...args), "20")
  } : $options.coverImage ? {
    bX: $options.coverImage
  } : {}, {
    bM: $data.playerUrl,
    bW: $options.coverImage,
    bY: $options.shouldRenderLandscapePoster
  }, $options.shouldRenderLandscapePoster ? {
    bZ: $options.landscapePoster,
    ca: $options.replayPosterHidden ? 1 : ""
  } : {}, {
    cb: $options.showLiveLandscapePreview
  }, $options.showLiveLandscapePreview ? {
    cc: $options.landscapePoster
  } : {}, {
    cd: $options.isLiveLandscapeStyle && $data.watchRewardTasks.length
  }, $options.isLiveLandscapeStyle && $data.watchRewardTasks.length ? {
    ce: common_vendor.o(($event) => $options.handleMarketingAction("reward"), "ed")
  } : {}, {
    cf: $options.isLivePushing
  }, $options.isLivePushing ? {} : {}, {
    cg: common_vendor.t($data.muted ? "开声" : "静音"),
    ch: common_vendor.o((...args) => $options.toggleMute && $options.toggleMute(...args), "fe"),
    ci: $options.isLiveLandscapeStyle
  }, $options.isLiveLandscapeStyle ? {
    cj: $data.stageCollapsed ? 1 : "",
    ck: common_vendor.o((...args) => $options.toggleCollapse && $options.toggleCollapse(...args), "10")
  } : {}, {
    cl: $data.stageCollapsed
  }, $data.stageCollapsed ? {
    cm: common_vendor.o((...args) => $options.closeMiniWindow && $options.closeMiniWindow(...args), "e4"),
    cn: common_vendor.t($data.muted ? "M" : "S"),
    co: common_vendor.o((...args) => $options.toggleMute && $options.toggleMute(...args), "90"),
    cp: common_vendor.o(() => {
    }, "25")
  } : {}, {
    cq: $data.showEntryOverlay
  }, $data.showEntryOverlay ? {
    cr: common_vendor.o((...args) => $options.enterLiveByGesture && $options.enterLiveByGesture(...args), "2f")
  } : {}, {
    cs: $options.showEndedOverlay
  }, $options.showEndedOverlay ? {
    ct: common_vendor.t($options.endedOverlayTitle),
    cv: common_vendor.t($options.displayViewerCount),
    cw: $options.anchorAvatar || $data.defaultAvatar,
    cx: common_vendor.t($options.anchorName || "主播")
  } : {}, {
    cy: !!$data.playerUrl ? 1 : "",
    cz: $data.miniHidden && $data.stageCollapsed ? 1 : "",
    cA: $options.anchorAvatar || $data.defaultAvatar,
    cB: common_vendor.t($options.anchorName),
    cC: common_vendor.t($options.displayViewerCount),
    cD: !$options.anchorName ? 1 : "",
    cE: !$data.isReplay
  }, !$data.isReplay ? common_vendor.e({
    cF: $options.isLivePushing
  }, $options.isLivePushing ? {} : {}, {
    cG: common_vendor.t($options.liveStatusLabel),
    cH: common_vendor.n($options.liveStatusClass)
  }) : {}, {
    cI: common_vendor.o((...args) => $options.goReport && $options.goReport(...args), "9b"),
    cJ: common_vendor.o((...args) => $options.goCenter && $options.goCenter(...args), "cc"),
    cK: common_assets._imports_0$1,
    cL: common_vendor.t($options.displayViewerCount),
    cM: !$data.stageCollapsed,
    cN: $data.stageCollapsed
  }, $data.stageCollapsed ? {
    cO: common_assets._imports_0$1,
    cP: common_vendor.t($options.displayViewerCount),
    cQ: common_vendor.o((...args) => $options.toggleCollapse && $options.toggleCollapse(...args), "ab"),
    cR: common_vendor.o(() => {
    }, "85")
  } : {}, {
    cS: $options.shouldShowMarquee
  }, $options.shouldShowMarquee ? {
    cT: common_vendor.t($options.marqueeText),
    cU: common_vendor.o((...args) => $options.dismissMarquee && $options.dismissMarquee(...args), "a8"),
    cV: common_vendor.s($options.marqueeTrackStyle),
    cW: common_vendor.o(() => {
    }, "e1")
  } : {}, {
    cX: common_vendor.t($options.landscapeInteractTitle),
    cY: $data.activeTab === "interact" ? 1 : "",
    cZ: common_vendor.o(($event) => $options.setActiveTab("interact"), "8d"),
    da: $data.signState.enabled
  }, $data.signState.enabled ? {
    db: $data.activeTab === "sign" ? 1 : "",
    dc: common_vendor.o(($event) => $options.setActiveTab("sign"), "2d")
  } : {}, {
    dd: common_vendor.t($options.landscapeProductTitle),
    de: common_vendor.t($options.productTotal ? `(${$options.productTotal})` : ""),
    df: $data.activeTab === "products" ? 1 : "",
    dg: common_vendor.o(($event) => $options.setActiveTab("products"), "3a"),
    dh: $options.noticeText
  }, $options.noticeText ? {
    di: common_vendor.t($options.noticeText)
  } : {}, {
    dj: $options.pinnedMessage
  }, $options.pinnedMessage ? {
    dk: $options.pinnedMessage.avatar || $data.defaultAvatar,
    dl: common_vendor.t($options.pinnedMessage.nick),
    dm: common_vendor.t($options.pinnedMessage.content)
  } : {}, {
    dn: $options.shouldShowComments
  }, $options.shouldShowComments ? {
    dp: common_vendor.f($options.visibleMessages, (msg, k0, i0) => {
      return common_vendor.e({
        a: msg.avatar || $data.defaultAvatar,
        b: msg.isAdmin
      }, msg.isAdmin ? {} : {}, {
        c: common_vendor.t(msg.nick),
        d: common_vendor.t(msg.content),
        e: msg.type === "system" ? 1 : "",
        f: `msg-${msg.id}`,
        g: msg.id
      });
    }),
    dq: $data.scrollToId
  } : {}, {
    dr: $data.activeTab === "interact",
    ds: $data.productsLoading
  }, $data.productsLoading ? {} : !$data.products.length ? {} : {}, {
    dt: !$data.products.length,
    dv: common_vendor.f($data.products, (item, k0, i0) => {
      return {
        a: $options.productImage(item),
        b: common_vendor.t($options.productName(item)),
        c: common_vendor.t($options.formatProductPrice(item)),
        d: item.id || item.productId,
        e: common_vendor.o(($event) => $options.openProduct(item), item.id || item.productId)
      };
    }),
    dw: $data.activeTab === "products",
    dx: common_vendor.t($data.signState.signed ? "今日已签到" : "直播签到"),
    dy: common_vendor.t($options.signWelcomeText),
    dz: common_vendor.t($data.signState.signed ? "已完成" : "立即签到"),
    dA: $data.signState.signed || $data.marketingLoading,
    dB: common_vendor.o((...args) => $options.submitLiveSign && $options.submitLiveSign(...args), "37"),
    dC: $data.activeTab === "sign",
    dD: $data.chatDisabled && $data.activeTab === "interact"
  }, $data.chatDisabled && $data.activeTab === "interact" ? {} : {}, {
    dE: $options.currentProductName && $data.activeTab === "interact"
  }, $options.currentProductName && $data.activeTab === "interact" ? common_vendor.e({
    dF: $options.currentProductImage
  }, $options.currentProductImage ? {
    dG: $options.currentProductImage
  } : {}, {
    dH: common_vendor.t($options.currentProductName),
    dI: common_vendor.t($options.formatProductPrice($data.currentProduct)),
    dJ: common_vendor.o(($event) => $options.openProduct($data.currentProduct), "6d")
  }) : {}, {
    dK: $data.activeTab === "interact"
  }, $data.activeTab === "interact" ? common_vendor.e({
    dL: $options.quickReplies.length && !$data.inputFocused && !$data.chatDisabled
  }, $options.quickReplies.length && !$data.inputFocused && !$data.chatDisabled ? {
    dM: common_vendor.f($options.quickReplies, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.id,
        c: common_vendor.o(($event) => $options.useQuickReply(item.content), item.id)
      };
    })
  } : {}, {
    dN: $data.chatDisabled,
    dO: $data.chatDisabled ? "当前不可评论" : "说点什么吧~",
    dP: common_vendor.o(($event) => $data.inputFocused = true, "16"),
    dQ: common_vendor.o(($event) => $data.inputFocused = false, "79"),
    dR: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args), "b7"),
    dS: $data.inputText,
    dT: common_vendor.o(($event) => $data.inputText = $event.detail.value, "ce"),
    dU: $data.chatDisabled ? 1 : "",
    dV: common_vendor.o((...args) => $options.focusCommentInput && $options.focusCommentInput(...args), "e7"),
    dW: $data.inputFocused
  }, $data.inputFocused ? {
    dX: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args), "18")
  } : {
    dY: common_vendor.o((...args) => $options.openShare && $options.openShare(...args), "b6"),
    dZ: common_assets._imports_4,
    ea: common_vendor.t($options.likeCountText),
    eb: common_vendor.o((...args) => $options.sendLikeTap && $options.sendLikeTap(...args), "95")
  }, {
    ec: $data.inputFocused ? 1 : ""
  }) : {}, {
    ed: $data.activeTab === "products" ? 1 : "",
    ee: $options.isLiveMode ? 1 : "",
    ef: $data.isReplay ? 1 : "",
    eg: $options.isLiveLandscapeStyle ? 1 : "",
    eh: !$options.isLiveLandscapeStyle ? 1 : "",
    ei: $data.stageCollapsed ? 1 : ""
  }), {
    l: $data.accessDenied,
    r: !$data.isLandscape,
    ej: $options.showReplayList && !$data.viewerLimitReached && !$data.accessDenied
  }, $options.showReplayList && !$data.viewerLimitReached && !$data.accessDenied ? {
    ek: common_vendor.f($data.replayVideos, (item, index, i0) => {
      return {
        a: common_vendor.t(item.videoName || item.name || `第${index + 1}节`),
        b: item.id || item.videoId || index,
        c: index === $data.replayIndex ? 1 : "",
        d: common_vendor.o(($event) => $options.playReplay(index), item.id || item.videoId || index)
      };
    })
  } : {}, {
    el: $data.showProducts && !$data.viewerLimitReached && !$data.accessDenied
  }, $data.showProducts && !$data.viewerLimitReached && !$data.accessDenied ? common_vendor.e({
    em: common_vendor.t($options.productTotal),
    en: $data.productsLoading
  }, $data.productsLoading ? {} : !$data.products.length ? {} : {}, {
    eo: !$data.products.length,
    ep: common_vendor.f($data.products, (item, k0, i0) => {
      return {
        a: $options.productImage(item),
        b: common_vendor.t($options.productName(item)),
        c: common_vendor.t($options.formatProductPrice(item)),
        d: item.id || item.productId,
        e: common_vendor.o(($event) => $options.openProduct(item), item.id || item.productId)
      };
    }),
    eq: common_vendor.o(() => {
    }, "16"),
    er: common_vendor.o((...args) => $options.toggleProducts && $options.toggleProducts(...args), "08"),
    es: common_vendor.o((...args) => $options.toggleProducts && $options.toggleProducts(...args), "af")
  }) : {}, {
    et: !$data.viewerLimitReached && !$data.accessDenied && ($options.marketingActions.length || $data.isReplay)
  }, !$data.viewerLimitReached && !$data.accessDenied && ($options.marketingActions.length || $data.isReplay) ? common_vendor.e({
    ev: common_vendor.f($options.marketingActions, (action, k0, i0) => {
      return {
        a: common_vendor.t(action.label),
        b: action.type,
        c: common_vendor.o(($event) => $options.handleMarketingAction(action.type), action.type)
      };
    }),
    ew: $data.isReplay
  }, $data.isReplay ? {
    ex: common_vendor.o((...args) => $options.returnToLive && $options.returnToLive(...args), "39")
  } : {}, {
    ey: $data.isLandscape ? 1 : ""
  }) : {}, {
    ez: $data.showMarketingPanel && !$data.viewerLimitReached && !$data.accessDenied
  }, $data.showMarketingPanel && !$data.viewerLimitReached && !$data.accessDenied ? common_vendor.e({
    eA: common_vendor.t($options.marketingPanelTitle),
    eB: common_vendor.o((...args) => $options.closeMarketingPanel && $options.closeMarketingPanel(...args), "a3"),
    eC: $data.marketingPanelType === "sign"
  }, $data.marketingPanelType === "sign" ? {
    eD: common_vendor.t($data.signState.signed ? "今日已签到" : "直播签到"),
    eE: common_vendor.t($options.signWelcomeText),
    eF: common_vendor.t($data.signState.signed ? "已完成" : "立即签到"),
    eG: $data.signState.signed || $data.marketingLoading,
    eH: common_vendor.o((...args) => $options.submitLiveSign && $options.submitLiveSign(...args), "46")
  } : common_vendor.e({
    eI: !$options.activeMarketingItems.length
  }, !$options.activeMarketingItems.length ? {} : {}, {
    eJ: common_vendor.f($options.activeMarketingItems, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.desc),
        c: common_vendor.o(($event) => $options.handleMarketingItem(item), item.key),
        d: item.key
      };
    })
  }), {
    eK: common_vendor.o(() => {
    }, "5e"),
    eL: common_vendor.o((...args) => $options.closeMarketingPanel && $options.closeMarketingPanel(...args), "ad")
  }) : {}), {
    b: $data.errorText
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4bc7a2f9"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
