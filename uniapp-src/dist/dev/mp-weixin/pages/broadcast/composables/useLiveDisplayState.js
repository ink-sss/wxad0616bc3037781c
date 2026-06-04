"use strict";
const common_vendor = require("../../../common/vendor.js");
const platform_weixin_runtime = require("../../../platform/weixin/runtime.js");
const utils_wechatSubscribe = require("../../../utils/wechat-subscribe.js");
const pages_broadcast_utils_entryFormat = require("../utils/entry-format.js");
function useLiveDisplayState(ctx) {
  const {
    userStore,
    anchorName,
    liveName,
    warmUpVideoUrl,
    warmUpVideoCoverImage,
    liveCover,
    replayCover,
    isReplay,
    replayCurrentIndex,
    replayVideosList,
    videoUrl,
    isIOSH5,
    scheduleTimeStr,
    nowTs,
    scheduleEnabled,
    domainStore,
    pushStatus,
    videoDebugInfo,
    chatBgImage,
    isWeChatIOSH5,
    showEntryOverlay,
    accessDenied,
    mode,
    roomGroupType
  } = ctx;
  const accessDeniedUserAvatar = common_vendor.computed(() => {
    var _a;
    return ((_a = userStore.userInfo) == null ? void 0 : _a.avatar) || pages_broadcast_utils_entryFormat.defaultAvatar;
  });
  const accessDeniedUserName = common_vendor.computed(() => {
    var _a, _b;
    return ((_a = userStore.userInfo) == null ? void 0 : _a.nickname) || ((_b = userStore.userInfo) == null ? void 0 : _b.nickName) || anchorName.value || "用户";
  });
  const accessDeniedUnionId = common_vendor.computed(() => {
    var _a, _b, _c;
    return ((_a = userStore.userInfo) == null ? void 0 : _a.unionId) || ((_b = userStore.userInfo) == null ? void 0 : _b.unionID) || ((_c = userStore.userInfo) == null ? void 0 : _c.wechatUnionid) || "";
  });
  const accessDeniedTitle = common_vendor.computed(() => {
    const baseTitle = liveName.value || "直播间名称";
    return accessDeniedUnionId.value ? `${baseTitle}-${accessDeniedUnionId.value}` : baseTitle;
  });
  const accessDeniedUidText = common_vendor.computed(() => {
    return `UID:${accessDeniedUnionId.value || "--"}`;
  });
  const shouldShowEntryOverlay = common_vendor.computed(() => {
    return !isWeChatIOSH5 && !platform_weixin_runtime.isMpWeixinRuntime() && showEntryOverlay.value && !accessDenied.value && pushStatus.value !== 2;
  });
  const scheduleTargetTs = common_vendor.computed(() => {
    if (!scheduleTimeStr.value)
      return 0;
    const s = String(scheduleTimeStr.value).replace(/-/g, "/");
    const t = new Date(s).getTime();
    return Number.isFinite(t) ? t : 0;
  });
  const isWaitingScheduleState = common_vendor.computed(
    () => scheduleEnabled.value === 1 && scheduleTargetTs.value > 0 && nowTs.value < scheduleTargetTs.value
  );
  const displayVideoUrl = common_vendor.computed(
    () => isWaitingScheduleState.value && warmUpVideoUrl.value ? warmUpVideoUrl.value : videoUrl.value
  );
  const currentVideoPoster = common_vendor.computed(() => {
    if (isWaitingScheduleState.value && warmUpVideoUrl.value) {
      return warmUpVideoCoverImage.value || liveCover.value || "";
    }
    if (isReplay.value && (replayCover == null ? void 0 : replayCover.value)) {
      return replayCover.value;
    }
    if (isReplay.value && replayCurrentIndex.value >= 0) {
      const v = replayVideosList.value[replayCurrentIndex.value];
      if (v == null ? void 0 : v.coverImage)
        return v.coverImage;
    }
    return liveCover.value || "";
  });
  const videoPoster = common_vendor.computed(() => currentVideoPoster.value);
  const countdownParts = common_vendor.computed(() => {
    const diff = Math.max(0, scheduleTargetTs.value - nowTs.value);
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff % 864e5 / 36e5);
    const m = Math.floor(diff % 36e5 / 6e4);
    const s = Math.floor(diff % 6e4 / 1e3);
    return {
      d,
      h,
      m,
      s,
      dd: String(d).padStart(2, "0"),
      hh: String(h).padStart(2, "0"),
      mm: String(m).padStart(2, "0"),
      ss: String(s).padStart(2, "0")
    };
  });
  const hasSubscribeConfig = common_vendor.computed(() => {
    return utils_wechatSubscribe.hasWechatSubscribeConfig({
      appId: domainStore.appId,
      subscribeTemplateId: domainStore.subscribeTemplateId,
      payAuthDomain: domainStore.payAuthDomain
    });
  });
  const showLandscapeSubscribe = common_vendor.computed(
    // isWaitingSchedule.value && hasSubscribeConfig.value,
    () => false
  );
  const videoDebugBadge = common_vendor.computed(() => {
    const info = videoDebugInfo.value;
    const actualText = `▶ ${pages_broadcast_utils_entryFormat.formatPlayTime(info.actual)}`;
    let sourceText = "";
    let mark = "";
    if (info.source === "resume") {
      sourceText = `⟵ 续 ${pages_broadcast_utils_entryFormat.formatPlayTime(info.intent)}`;
      if (info.actual >= 0) {
        mark = Math.abs(info.actual - info.intent) < 2 ? " ✅" : " ❌";
      }
    } else if (info.source === "loop-restart") {
      sourceText = "⟵ 循环";
    } else if (info.source === "fresh") {
      sourceText = "⟵ 从头";
    } else if (info.source === "live") {
      sourceText = "⟵ 直播";
    } else {
      sourceText = `⟵ ${info.source}`;
    }
    return `${actualText} ${sourceText}${mark}`;
  });
  const showNotStartedOverlay = common_vendor.computed(
    () => pushStatus.value === 2 && (roomGroupType == null ? void 0 : roomGroupType.value) === 1 || isWaitingScheduleState.value && !warmUpVideoUrl.value
  );
  const liveOverlayTitle = common_vendor.computed(
    () => pushStatus.value === 2 && (roomGroupType == null ? void 0 : roomGroupType.value) === 1 ? "直播已结束" : "直播未开始"
  );
  const DEFAULT_CHAT_BG = "https://man.lqjy.cc/static/invitation/cover-mobile.jpg";
  const chatBgStyle = common_vendor.computed(() => {
    const isPortrait = !mode || mode.value === "portrait";
    const bg = chatBgImage.value || (isPortrait ? DEFAULT_CHAT_BG : null);
    if (!bg)
      return {};
    return {
      backgroundImage: `url(${bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    };
  });
  const commentListStyle = common_vendor.computed(() => ({
    ...chatBgStyle.value
  }));
  return {
    accessDeniedUserAvatar,
    accessDeniedUserName,
    accessDeniedUnionId,
    accessDeniedTitle,
    accessDeniedUidText,
    shouldShowEntryOverlay,
    currentVideoPoster,
    videoPoster,
    displayVideoUrl,
    scheduleTargetTs,
    isWaitingSchedule: isWaitingScheduleState,
    countdownParts,
    hasSubscribeConfig,
    showLandscapeSubscribe,
    videoDebugBadge,
    showNotStartedOverlay,
    liveOverlayTitle,
    commentListStyle
  };
}
exports.useLiveDisplayState = useLiveDisplayState;
