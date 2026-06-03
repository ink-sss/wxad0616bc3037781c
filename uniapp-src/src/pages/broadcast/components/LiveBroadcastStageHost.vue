<template>
  <live-portrait-stage
    v-if="mode === 'portrait' && !accessDenied && !viewerLimitReached"
    ref="portraitInputRef"
    :s="stageState"
    :a="stageActions"
  />
  <live-landscape-stage
    v-else-if="mode === 'landscape' && !accessDenied && !viewerLimitReached"
    ref="landscapeInputRef"
    :s="stageState"
    :a="stageActions"
  />
  <live-viewer-limit-reached
    v-else-if="viewerLimitReached"
    :text="viewerLimitText"
  />
  <live-access-denied
    v-else-if="accessDenied"
    :title="accessDeniedTitle"
    :avatar="accessDeniedUserAvatar"
    :user-name="accessDeniedUserName"
    :uid-text="accessDeniedUidText"
    @copy-uid="$emit('copy-uid')"
  />
  <LiveBroadcastMarketingLayer
    v-if="!viewerLimitReached"
    :normal-lottery-active-modal="marketingLayerState.normalLotteryActiveModal"
    :normal-lottery-prize="marketingLayerState.normalLotteryPrize"
    :normal-lottery-winners="marketingLayerState.normalLotteryWinners"
    :normal-lottery-participants="marketingLayerState.normalLotteryParticipants"
    :watch-reward-rewards="marketingLayerState.visibleWatchRewardTasks"
    :watch-reward-panel-visible="marketingLayerState.showWatchRewardPanel"
    :watch-reward-panel-open-key="marketingLayerState.watchRewardPanelOpenKey"
    :watch-reward-result="marketingLayerState.watchRewardResult"
    :watch-reward-broadcast="marketingLayerState.watchRewardBroadcast"
    :watch-reward-broadcast-key="marketingLayerState.watchRewardBroadcastRenderKey"
    :comment-lottery-active-modal="marketingLayerState.commentLotteryActiveModal"
    :comment-lottery-panel-activity="marketingLayerState.commentLotteryPanelActivity"
    :comment-lottery-panel-prizes="marketingLayerState.commentLotteryPanelPrizes"
    :comment-lottery-tip-text="marketingLayerState.commentLotteryTipText"
    :comment-lottery-password-changed-text="marketingLayerState.commentLotteryPasswordChangedText"
    :comment-lottery-prize="marketingLayerState.commentLotteryPrize"
    :comment-lottery-winners="marketingLayerState.commentLotteryWinners"
    :comment-lottery-participants="marketingLayerState.commentLotteryParticipants"
    :comment-lottery-win-record="marketingLayerState.commentLotteryWinRecord"
    :prize-record-url="marketingLayerState.prizeRecordUrl"
    @close-normal-lottery="marketingRuntime.closeLotteryModal"
    @close-watch-reward-panel="marketingRuntime.closeWatchRewardPanel"
    @claim-watch-reward="marketingRuntime.claimWatchRewardTask"
    @close-watch-reward-result="marketingRuntime.closeWatchRewardResult"
    @open-comment-lottery-panel="marketingRuntime.openCommentLotteryPanel"
    @close-comment-lottery="marketingRuntime.closeCommentLotteryModal"
    @send-comment-lottery="marketingRuntime.sendCommentLotteryText"
  />
</template>

<script setup>
import { computed, ref, unref, watch } from "vue";
import LiveAccessDenied from "./LiveAccessDenied.vue";
import LiveBroadcastMarketingLayer from "./LiveBroadcastMarketingLayer.vue";
import LiveLandscapeStage from "./LiveLandscapeStage.vue";
import LivePortraitStage from "./LivePortraitStage.vue";
import LiveViewerLimitReached from "./LiveViewerLimitReached.vue";

const props = defineProps({
  mode: { type: String, required: true },
  accessDenied: { type: Boolean, required: true },
  stageState: { type: Object, required: true },
  stageActions: { type: Object, required: true },
  accessDeniedTitle: { type: String, default: "" },
  accessDeniedUserAvatar: { type: String, default: "" },
  accessDeniedUserName: { type: String, default: "" },
  accessDeniedUidText: { type: String, default: "" },
  viewerLimitReached: { type: Boolean, default: false },
  viewerLimitText: { type: String, default: "观看人数已达上限" },
  marketingRuntime: { type: Object, required: true },
});

defineEmits(["copy-uid"]);

const portraitInputRef = ref(null);
const landscapeInputRef = ref(null);

function currentStageRef() {
  return props.mode === "landscape" ? landscapeInputRef.value : portraitInputRef.value;
}

function createMediaContext(id = "liveVideo", type = "video") {
  return currentStageRef()?.createMediaContext?.(id, type) || null;
}

defineExpose({
  focus: () => currentStageRef()?.focus?.(),
  blur: () => currentStageRef()?.blur?.(),
  createMediaContext,
  createVideoContext: (id = "liveVideo") => createMediaContext(id, "video"),
  createLivePlayerContext: (id = "liveVideo") => createMediaContext(id, "live-player"),
});

const marketingLayerState = computed(() => {
  const runtime = props.marketingRuntime || {};
  const modal = unref(runtime.normalLotteryActiveModal) || "";
  return {
    normalLotteryActiveModal: modal,
    normalLotteryPrize: unref(runtime.normalLotteryPrize) || {},
    normalLotteryWinners: unref(runtime.normalLotteryWinners) || [],
    normalLotteryParticipants: unref(runtime.normalLotteryParticipants) || [],
    visibleWatchRewardTasks: unref(runtime.visibleWatchRewardTasks) || [],
    showWatchRewardPanel: Boolean(unref(runtime.showWatchRewardPanel)),
    watchRewardPanelOpenKey: Number(unref(runtime.watchRewardPanelOpenKey) || 0),
    watchRewardResult: unref(runtime.watchRewardResult) || null,
    watchRewardBroadcast: unref(runtime.watchRewardBroadcast) || null,
    watchRewardBroadcastRenderKey: Number(unref(runtime.watchRewardBroadcastRenderKey) || 0),
    commentLotteryActiveModal: unref(runtime.commentLotteryActiveModal) || "",
    commentLotteryPanelActivity: unref(runtime.commentLotteryPanelActivity) || {},
    commentLotteryPanelPrizes: unref(runtime.commentLotteryPanelPrizes) || [],
    commentLotteryTipText: unref(runtime.commentLotteryTipText) || "",
    commentLotteryPasswordChangedText: unref(runtime.commentLotteryPasswordChangedText) || "",
    commentLotteryPrize: unref(runtime.commentLotteryPrize) || {},
    commentLotteryWinners: unref(runtime.commentLotteryWinners) || [],
    commentLotteryParticipants: unref(runtime.commentLotteryParticipants) || [],
    commentLotteryWinRecord: unref(runtime.commentLotteryWinRecord) || null,
    prizeRecordUrl: unref(runtime.prizeRecordUrl) || "/pages/prize-record/index",
  };
});
</script>
