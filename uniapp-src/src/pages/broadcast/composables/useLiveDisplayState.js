import { computed } from "vue";
import { hasWechatSubscribeConfig } from "@/utils/wechat-subscribe";
import { defaultAvatar, formatPlayTime } from "../utils/entry-format.js";

/**
 * 直播入口展示派生状态。
 * 职责边界：只做 computed 派生，如封面、倒计时、无权限文案、蒙层标题；不发请求、不改业务状态。
 */
export function useLiveDisplayState(ctx) {
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
    roomGroupType,
  } = ctx;

  const accessDeniedUserAvatar = computed(() => {
    return userStore.userInfo?.avatar || defaultAvatar;
  });
  const accessDeniedUserName = computed(() => {
    return (
      userStore.userInfo?.nickname ||
      userStore.userInfo?.nickName ||
      anchorName.value ||
      "用户"
    );
  });
  const accessDeniedUnionId = computed(() => {
    return (
      userStore.userInfo?.unionId ||
      userStore.userInfo?.unionID ||
      userStore.userInfo?.wechatUnionid ||
      ""
    );
  });
  const accessDeniedTitle = computed(() => {
    const baseTitle = liveName.value || "直播间名称";
    return accessDeniedUnionId.value
      ? `${baseTitle}-${accessDeniedUnionId.value}`
      : baseTitle;
  });
  const accessDeniedUidText = computed(() => {
    return `UID:${accessDeniedUnionId.value || "--"}`;
  });

  const shouldShowEntryOverlay = computed(() => {
    return (
      !isWeChatIOSH5 &&
      showEntryOverlay.value &&
      !accessDenied.value &&
      pushStatus.value !== 2
    );
  });

  const scheduleTargetTs = computed(() => {
    if (!scheduleTimeStr.value) return 0;
    // iOS 不识别 "YYYY-MM-DD HH:mm"，统一转斜杠
    const s = String(scheduleTimeStr.value).replace(/-/g, "/");
    const t = new Date(s).getTime();
    return Number.isFinite(t) ? t : 0;
  });

  const isWaitingScheduleState = computed(
    () =>
      scheduleEnabled.value === 1 &&
      scheduleTargetTs.value > 0 &&
      nowTs.value < scheduleTargetTs.value,
  );

  // 显示层视频URL：等待开播期间优先使用暖场视频
  const displayVideoUrl = computed(() =>
    isWaitingScheduleState.value && warmUpVideoUrl.value
      ? warmUpVideoUrl.value
      : videoUrl.value,
  );

  // 播放封面图：录播有真实封面时优先用封面；没有封面时才降级到当前视频 coverImage 首帧。
  const currentVideoPoster = computed(() => {
    if (isWaitingScheduleState.value && warmUpVideoUrl.value) {
      return warmUpVideoCoverImage.value || liveCover.value || "";
    }
    if (isReplay.value && replayCover?.value) {
      return replayCover.value;
    }
    if (isReplay.value && replayCurrentIndex.value >= 0) {
      const v = replayVideosList.value[replayCurrentIndex.value];
      if (v?.coverImage) return v.coverImage;
    }
    return liveCover.value || "";
  });
  // poster 策略：所有平台都挂 poster，避免首帧到达前黑屏。
  // - iOS：muted autoplay 必成，但首帧解码/绘制需 1~2s，期间挂 poster 填黑屏
  // - Android X5：muted autoplay 可能被拒，后续 _seekToShowFrame 会用真实帧覆盖 poster
  // 浏览器原生行为：首帧一到自动用 video 内容覆盖 poster，GPU 切换无闪烁
  const videoPoster = computed(() => currentVideoPoster.value);

  const countdownParts = computed(() => {
    const diff = Math.max(0, scheduleTargetTs.value - nowTs.value);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return {
      d,
      h,
      m,
      s,
      dd: String(d).padStart(2, "0"),
      hh: String(h).padStart(2, "0"),
      mm: String(m).padStart(2, "0"),
      ss: String(s).padStart(2, "0"),
    };
  });

  const hasSubscribeConfig = computed(() => {
    return hasWechatSubscribeConfig({
      appId: domainStore.appId,
      subscribeTemplateId: domainStore.subscribeTemplateId,
      payAuthDomain: domainStore.payAuthDomain,
    });
  });

  const showLandscapeSubscribe = computed(
    // isWaitingSchedule.value && hasSubscribeConfig.value,
    () => false
  );

  // [调试] 起播信息格式化：用于版本号 badge 下方显示
  //   ▶ 0:23 ⟵ 续 1:23 ❌    续播失效（actual≠intent）
  //   ▶ 1:23 ⟵ 续 1:23 ✅    续播成功
  //   ▶ 0:00 ⟵ 从头           fresh / 直播 / 循环
  const videoDebugBadge = computed(() => {
    const info = videoDebugInfo.value;
    const actualText = `▶ ${formatPlayTime(info.actual)}`;
    let sourceText = "";
    let mark = "";
    if (info.source === "resume") {
      sourceText = `⟵ 续 ${formatPlayTime(info.intent)}`;
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

  // 直播状态蒙层：
  //   - 已结束（pushStatus===2）仅录播栏目（roomGroupType===1）显示，直播间不再显示已结束遮罩
  //   - 未开播仅在无暖场视频倒计时阶段显示
  const showNotStartedOverlay = computed(
    () =>
      (pushStatus.value === 2 && roomGroupType?.value === 1) ||
      (isWaitingScheduleState.value && !warmUpVideoUrl.value),
  );

  // 蒙层标题：已结束 vs 未开始（已结束此时仅录播栏目可达）
  const liveOverlayTitle = computed(() =>
    pushStatus.value === 2 && roomGroupType?.value === 1
      ? "直播已结束"
      : "直播未开始",
  );

  const DEFAULT_CHAT_BG = '/static/invitation/cover-mobile.jpg';
  
  const chatBgStyle = computed(() => {
    // 仅竖屏模式在未上传背景时使用默认图；横屏模式不加默认背景
    const isPortrait = !mode || mode.value === 'portrait';
    const bg = chatBgImage.value || (isPortrait ? DEFAULT_CHAT_BG : null);
    if (!bg) return {};
    return {
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  });

  const commentListStyle = computed(() => ({
    ...chatBgStyle.value,
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
    commentListStyle,
  };
}
