<template>
  <view v-if="activeModal === 'commentPrizeConfirm'" class="beginCommentPrizeDialog">
    <view class="beginCommentPrizeDialogBc"></view>
    <view class="beginCommentPrizeCenter">
      <text class="beginCommentPrizeTitle">提示</text>
      <text class="beginCommentPrizeName">
        确认发起
        <text class="beginCommentPrizeNameHighlight">私域直播增长礼包</text>
        的评论抽奖吗？
      </text>
      <view class="beginCommentPrizeBtn">
        <text class="beginCommentPrizeAction cancelBeginPrize" @click="emit('close')">取消</text>
        <view class="beginCommentPrizeDivider"></view>
        <text class="beginCommentPrizeAction confirmBeginPrize">确定</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  activeModal: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close"]);
</script>

<style lang="scss" scoped>
.beginCommentPrizeDialog {
  position: fixed;
  inset: 0;
  z-index: 99999;
}

.beginCommentPrizeDialogBc {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
}

.beginCommentPrizeCenter {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 630rpx;
  border-radius: 10rpx;
  text-align: center;
  background: #fff;
  transform: translate(-50%, -50%);
}

.beginCommentPrizeTitle {
  display: block;
  padding-top: 20rpx;
  color: #333;
  font-size: 36rpx;
  font-weight: 500;
  text-align: center;
}

.beginCommentPrizeName {
  display: block;
  padding: 40rpx 80rpx;
  color: #333;
  font-size: 28rpx;
  line-height: 40rpx;
}

.beginCommentPrizeNameHighlight {
  color: #0180ff;
}

.beginCommentPrizeBtn {
  display: flex;
  align-items: center;
  height: 88rpx;
  border-top: 2rpx solid #ededed;
}

.beginCommentPrizeAction {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  font-size: 28rpx;
}

.beginCommentPrizeDivider {
  width: 2rpx;
  height: 100%;
  background: #ededed;
}

.cancelBeginPrize {
  color: #999;
}

.confirmBeginPrize {
  color: #1890ff;
}
</style>
