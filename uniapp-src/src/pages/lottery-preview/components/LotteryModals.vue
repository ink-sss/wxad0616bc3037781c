<template>
  <view v-if="activeModal === 'lotteryFlow'" class="lottery-flow-box">
    <view class="flow-section">
      <text class="flow-title">开奖中</text>
      <image class="flow-gif" :src="assets.lotteryOpen" mode="widthFix" />
    </view>
    <view class="flow-arrow">2.5s 后</view>
    <view class="flow-winner-card">
      <image class="header-bg" :src="assets.winnerHeader" mode="widthFix" />
      <view class="winner-list">
        <text class="txt">获奖名单</text>
        <text class="prize-title">{{ prizeTitle }}</text>
        <view class="user-list">
          <view v-for="winner in winners.slice(0, 3)" :key="winner.key || winner.phone || winner.name" class="item">
            <text class="name">{{ winner.name }}</text>
            <text class="phone">{{ winner.phone }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="flow-chat">
      <text class="notice-icon"></text>
      <text>恭喜 {{ winners[0].name }} 获得 </text>
      <text class="reward-amount">{{ prizeTitle }}</text>
    </view>
  </view>

  <view v-if="activeModal === 'lotteryOpen'" class="luckydraw-box">
    <image class="luckydraw-image" :src="assets.lotteryOpen" mode="widthFix" />
  </view>

  <view v-if="activeModal === 'lotteryWinner'" class="luckydraw-winner-box">
    <view class="close-icon" @click="emit('close')"></view>
    <image class="header-bg" :src="assets.winnerHeader" mode="widthFix" />
    <view class="winner-list">
      <text class="txt">获奖名单</text>
      <text class="prize-title">{{ prizeTitle }}</text>
      <scroll-view class="user-list" scroll-y>
        <view v-for="winner in winners" :key="winner.key || winner.phone || winner.name" class="item">
          <text class="name">{{ winner.name }}</text>
          <text class="phone">{{ winner.phone }}</text>
        </view>
      </scroll-view>
    </view>
  </view>

  <view v-if="activeModal === 'lotteryEmpty'" class="luckydraw-winner-box">
    <view class="close-icon" @click="emit('close')"></view>
    <image class="header-bg" :src="assets.winnerHeader" mode="widthFix" />
    <view class="winner-list">
      <text class="txt">获奖名单</text>
      <text class="prize-title">暂无中奖用户</text>
      <view class="empty-list">本轮开奖未产生中奖记录</view>
    </view>
  </view>

  <view v-if="activeModal === 'lotteryChat'" class="lottery-chat-box">
    <view v-for="winner in winners.slice(0, 3)" :key="winner.key || winner.phone || winner.name" class="flow-chat">
      <text class="notice-icon"></text>
      <text>恭喜 {{ winner.name }} 获得 </text>
      <text class="reward-amount">{{ prizeTitle }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  activeModal: {
    type: String,
    required: true
  },
  assets: {
    type: Object,
    required: true
  },
  winners: {
    type: Array,
    required: true
  },
  prize: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["close"]);

const prizeTitle = computed(() => {
  const name = props.prize.name || props.prize.title || "抽奖奖品";
  return name;
});
</script>

<style lang="scss" scoped>
.luckydraw-box,
.luckydraw-winner-box,
.lottery-flow-box,
.lottery-chat-box {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 99999;
  transform: translate(-50%, -50%);
}

.luckydraw-image {
  width: 800rpx;
  max-width: 92vw;
  display: block;
}

.luckydraw-winner-box {
  width: 628rpx;
  height: 764rpx;
  text-align: center;
  border-radius: 12rpx;
  background: linear-gradient(0deg, rgb(255, 84, 63), rgb(255, 67, 97));
}

.lottery-flow-box {
  width: 680rpx;
  max-width: 92vw;
  padding: 36rpx;
  box-sizing: border-box;
  text-align: center;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.96);
}

.flow-section {
  border-radius: 24rpx;
  background: #fff7f8;
}

.flow-title {
  display: block;
  padding-top: 20rpx;
  color: #ff435f;
  font-size: 32rpx;
  font-weight: 700;
}

.flow-gif {
  width: 440rpx;
  margin: 0 auto;
}

.flow-arrow {
  margin: 20rpx 0;
  color: #8a8f99;
  font-size: 26rpx;
}

.flow-winner-card {
  position: relative;
  width: 628rpx;
  height: 764rpx;
  margin: 0 auto;
  border-radius: 12rpx;
  overflow: hidden;
  background: linear-gradient(0deg, rgb(255, 84, 63), rgb(255, 67, 97));
  transform: scale(0.62);
  transform-origin: top center;
}

.lottery-flow-box .flow-chat {
  margin-top: -264rpx;
}

.lottery-chat-box {
  width: 640rpx;
}

.flow-chat {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
  padding: 14rpx 28rpx;
  color: #fff;
  font-size: 26rpx;
  line-height: 40rpx;
  border-radius: 30rpx;
  background-color: rgba(0, 0, 0, 0.2);
}

.notice-icon {
  width: 30rpx;
  height: 30rpx;
  margin-right: 12rpx;
  background: url("../static/remote-icons/i-nuoyun-watch-notice-blue.png") center / contain no-repeat;
}

.reward-amount {
  color: #d47b59;
}

.luckydraw-winner-box .close-icon {
  position: absolute;
  top: 48rpx;
  right: 50rpx;
  z-index: 1;
  width: 30rpx;
  height: 30rpx;
  background: url("../static/remote-icons/i-nuoyun-watch-common-close.png") center / contain no-repeat;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.winner-list {
  position: absolute;
  inset: 0;
  width: 100%;
}

.winner-list .txt {
  display: block;
  margin-top: 44rpx;
  color: #fff;
  font-size: 46rpx;
  font-weight: 700;
  line-height: 46rpx;
}

.winner-list .prize-title {
  display: block;
  margin-top: 24rpx;
  color: #fff;
  font-size: 30rpx;
  line-height: 40rpx;
}

.winner-list .user-list {
  width: 100%;
  height: 524rpx;
  margin: 56rpx auto;
  border-radius: 10rpx;
}

.winner-list .item {
  width: 80%;
  height: 78rpx;
  margin: 0 auto 20rpx;
  text-align: left;
  line-height: 78rpx;
  background-color: #fff;
  border-radius: 10rpx;
}

.winner-list .item text {
  display: inline-block;
  overflow: hidden;
  color: #333;
  font-size: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: top;
}

.winner-list .name {
  min-width: 226rpx;
  max-width: 292rpx;
  text-align: center;
}

.empty-list {
  width: 80%;
  height: 360rpx;
  margin: 84rpx auto 0;
  color: #fff;
  font-size: 30rpx;
  line-height: 360rpx;
  border-radius: 10rpx;
  background: rgba(255, 255, 255, 0.2);
}
</style>
