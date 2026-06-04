<template>
  <view v-if="activeModal === 'reward'" class="envelope-reward-modal reward-mask">
    <view class="reward-style">
      <view class="modal-content">
        <view class="reward-close" @click="emit('close')"></view>
        <view class="modal-body">
          <view class="reward-user">
            <view class="whiteImg"></view>
            <image class="whiteImg-avatar" :src="assets.avatar" mode="aspectFill" />
            <text class="reward-name">标准版测试账号</text>
          </view>
          <text class="reward-tip">爱赞赏的人运气不会太差~</text>
          <view class="form-group">
            <view class="money-list">
              <text v-for="amount in firstRewardAmounts" :key="amount" class="reward-amount-select">
                <text class="rewards-amount">{{ amount }}</text>
                元
              </text>
            </view>
            <view class="money-list">
              <text v-for="amount in secondRewardAmounts" :key="amount" class="reward-amount-select">
                <text class="rewards-amount">{{ amount }}</text>
                元
              </text>
            </view>
            <view class="money-list reward-input">
              <text class="reward-placeholder">自定义</text>
              <text class="reward-unit">元</text>
            </view>
            <text class="do-reward">确认赞赏</text>
          </view>
        </view>
        <view class="modal-footer" @click="emit('close')">取消</view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  activeModal: {
    type: String,
    required: true
  },
  assets: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["close"]);

const firstRewardAmounts = ["2", "5", "10"];
const secondRewardAmounts = ["20", "50", "100"];
</script>

<style lang="scss" scoped>
.reward-mask {
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.46);
}

.reward-style {
  width: 100%;
  height: 726rpx;
  background: #fff;
}

.reward-style .modal-content {
  position: relative;
  height: 100%;
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-reward-header-f783e06d.png") no-repeat;
  background-size: 100% 100%;
}

.reward-close {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 24rpx;
  height: 24rpx;
  background: url("https://man.lqjy.cc/static/remote-icons/i-nuoyun-reward-close.png") center / contain no-repeat;
}

.reward-style .modal-body {
  height: 642rpx;
  padding: 40rpx 20rpx 0;
  box-sizing: border-box;
}

.reward-user {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
  font-size: 28rpx;
}

.whiteImg-avatar {
  width: 112rpx;
  height: 112rpx;
  margin-top: -8rpx;
  border-radius: 50%;
}

.whiteImg {
  position: absolute;
  left: 50%;
  top: -16rpx;
  z-index: -1;
  width: 128rpx;
  height: 128rpx;
  margin-left: -64rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffe3d4 0%, #ffe0d4 49%, #fee2d1 100%);
}

.reward-name {
  margin-top: 14rpx;
}

.reward-tip {
  display: block;
  margin-top: 14rpx;
  color: #999;
  font-size: 24rpx;
  line-height: 1;
  text-align: center;
}

.form-group {
  margin-top: 44rpx;
}

.money-list {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-bottom: 20rpx;
}

.reward-amount-select {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 192rpx;
  height: 80rpx;
  color: #ff0e4c;
  font-size: 28rpx;
  border: 2rpx solid rgba(255, 14, 76, 0.22);
  border-radius: 12rpx;
  background: #fff;
}

.rewards-amount {
  font-size: 36rpx;
  font-weight: bold;
}

.reward-input {
  position: relative;
  width: 624rpx;
  height: 80rpx;
  margin: 0 auto 24rpx;
  color: #999;
  font-size: 28rpx;
  line-height: 80rpx;
  border: 2rpx solid #efefef;
  border-radius: 12rpx;
  background: #fff;
}

.reward-placeholder {
  padding-left: 24rpx;
}

.reward-unit {
  position: absolute;
  right: 40rpx;
  top: 50%;
  color: #ff0e4c;
  font-size: 28rpx;
  font-weight: bold;
  transform: translateY(-50%);
}

.do-reward {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 624rpx;
  height: 84rpx;
  margin: 0 auto;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 42rpx;
  background: #ff0e4c;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 84rpx;
  color: #666;
  font-size: 28rpx;
  border-top: 10rpx solid #f4f4f4;
  background: #fff;
}
</style>
