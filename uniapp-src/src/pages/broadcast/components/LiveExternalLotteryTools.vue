<template>
  <view class="external-lottery-tools" @click.stop>
    <view v-if="commentLotteryVisible && showCommentLotteryEntry" class="external-lottery-tools__comment">
      <view
        v-if="showCommentLotteryBubble"
        class="external-lottery-tools__bubble"
        @click.stop="openCommentLottery"
      >
        <text class="external-lottery-tools__bubble-text">
          发送评论“
          <text class="external-lottery-tools__keyword">{{ keyword }}</text>
          ”可参与抽大奖
        </text>
        <image
          class="external-lottery-tools__bubble-close"
          :src="assets.tooltipClose"
          mode="aspectFit"
          @click.stop="hideCommentLotteryBubble"
        />
        <image
          class="external-lottery-tools__bubble-arrow"
          :src="assets.tooltipArrow"
          mode="aspectFit"
        />
      </view>
      <view class="external-lottery-tools__comment-entry" @click.stop="openCommentLottery">
        <image
          class="external-lottery-tools__comment-close"
          :src="assets.close"
          mode="aspectFit"
          @click.stop="hideCommentLotteryEntry"
        />
        <image
          class="external-lottery-tools__comment-icon"
          :src="assets.commentLottery"
          mode="aspectFit"
        />
      </view>
    </view>
    <view v-if="watchRewardVisible" class="external-lottery-tools__lucky-bag" @click.stop="openWatchReward">
      <image
        class="external-lottery-tools__lucky-icon"
        :src="assets.luckyBag"
        mode="aspectFit"
      />
      <text class="external-lottery-tools__entry-label external-lottery-tools__entry-label--bag">
        {{ displayLuckyBagLabel }}
      </text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  keyword: {
    type: String,
    default: "发送指定评论",
  },
  commentLotteryVisible: {
    type: Boolean,
    default: false,
  },
  bubbleVisible: {
    type: Boolean,
    default: true,
  },
  luckyBagLabel: {
    type: String,
    default: "领取",
  },
  watchRewardVisible: {
    type: Boolean,
    default: false,
  },
  watchRewardLabel: {
    type: String,
    default: "领取",
  },
});
const emit = defineEmits(["open-comment-lottery", "open-watch-reward"]);

const showCommentLotteryBubble = ref(true);
const showCommentLotteryEntry = ref(true);

const displayLuckyBagLabel = computed(() => (
  props.watchRewardLabel.trim() || props.luckyBagLabel.trim() || "领取"
));

watch(
  () => [props.commentLotteryVisible, props.keyword, props.bubbleVisible],
  ([visible, , bubbleVisible]) => {
    if (visible) {
      showCommentLotteryEntry.value = true;
      showCommentLotteryBubble.value = bubbleVisible !== false;
      return;
    }
    showCommentLotteryBubble.value = false;
    showCommentLotteryEntry.value = false;
  },
);

const assets = {
  commentLottery: "/static/remote-icons/comment-lotterys-new.png",
  close: "/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-close4-7fa83bca.png",
  tooltipClose: "/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-tooltipboxclose-e39b3a0d.png",
  tooltipArrow: "/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-arrowtooltips-0dd003f2.png",
  luckyBag: "/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-watch-rewardnone-new-ecf31362.png",
};

function hideCommentLotteryBubble() {
  showCommentLotteryBubble.value = false;
}

function hideCommentLotteryEntry() {
  showCommentLotteryBubble.value = false;
  showCommentLotteryEntry.value = false;
}

function openCommentLottery() {
  emit("open-comment-lottery");
}

function openWatchReward() {
  emit("open-watch-reward");
}
</script>

<style lang="scss" scoped>
.external-lottery-tools {
  position: absolute;
  top: 96rpx;
  right: 16rpx;
  z-index: 4;
  width: 96rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  pointer-events: auto;
}

.external-lottery-tools__comment {
  position: relative;
  width: 96rpx;
  min-height: 112rpx;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.external-lottery-tools__bubble {
  position: absolute;
  top: 12rpx;
  right: 104rpx;
  width: 214rpx;
  min-height: 116rpx;
  padding: 14rpx 18rpx;
  box-sizing: border-box;
  color: #333;
  border-radius: 12rpx;
  background: #fff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.external-lottery-tools__bubble-text {
  display: block;
  font-size: 24rpx;
  line-height: 36rpx;
  letter-spacing: 0;
  white-space: normal;
  word-break: break-all;
}

.external-lottery-tools__keyword {
  display: inline-block;  /* 从 inline 改为 inline-block,支持换行 */
  max-width: 100%;  /* 限制最大宽度,确保换行 */
  overflow: visible;
  color: #b942ff;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 36rpx;
  text-overflow: clip;
  vertical-align: baseline;
  white-space: normal;
  word-break: break-all;
}

.external-lottery-tools__bubble-close {
  position: absolute;
  top: 0rpx;
  right: 0rpx;
  width: 32rpx;
  height: 32rpx;
  z-index: 2;
}

.external-lottery-tools__bubble-arrow {
  position: absolute;
  top: 48rpx;
  right: -10rpx;
  width: 12rpx;
  height: 33rpx;
}

.external-lottery-tools__comment-entry,
.external-lottery-tools__lucky-bag {
  position: relative;
  width: 96rpx;
  min-height: 112rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.external-lottery-tools__comment-close {
  position: absolute;
  top: -16rpx;
  right: -12rpx;
  z-index: 2;
  width: 24rpx;
  height: 24rpx;
}

.external-lottery-tools__comment-icon {
  display: block;
  width: 88rpx;
  height: 88rpx;
}

.external-lottery-tools__lucky-bag {
  margin-top: 0;
  min-height: 88rpx;
  justify-content: center;
}

.external-lottery-tools__lucky-icon {
  display: block;
  width: 88rpx;
  height: 88rpx;
}

.external-lottery-tools__entry-label {
  position: absolute;
  bottom: 9rpx;
  left: 50%;
  z-index: 1;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48rpx;
  max-width: 78rpx;
  height: 24rpx;
  margin-top: 0;
  padding: 2rpx 8rpx;
  box-sizing: border-box;
  color: #fff;
  font-size: 16rpx;
  line-height: 24rpx;
  text-align: center;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.25);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

.external-lottery-tools__entry-label--bag {
  margin-top: 0;
}

</style>
