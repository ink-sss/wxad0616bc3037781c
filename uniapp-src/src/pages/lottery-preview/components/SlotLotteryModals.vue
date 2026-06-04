<template>
  <view v-if="activeModal === 'wechatSlotRolling' || activeModal === 'wechatSlotResult'" class="luck-draw-box">
    <view v-if="activeModal === 'wechatSlotRolling'" class="luck-scroll-box">
      <view class="slot-header">
        <text class="slot-title">开奖中</text>
        <text class="luck-prize-name">{{ prizeName }}</text>
      </view>

      <view class="slot-machine-window">
        <view
          v-for="column in slotColumns"
          :key="column.key"
          class="slot-reel"
        >
          <view class="slot-reel-track" :class="`slot-reel-track-${column.index}`">
            <view
              v-for="user in column.users"
              :key="user.key"
              class="slot-reel-item"
            >
              <image class="slot-reel-photo" :src="user.photo" mode="aspectFill" />
              <text class="slot-reel-name">{{ user.name }}</text>
            </view>
          </view>
        </view>
        <view class="slot-reel-shadow top"></view>
        <view class="slot-reel-shadow bottom"></view>
        <view class="slot-reel-focus"></view>
      </view>

      <view class="slot-prize-card">
        <image class="slot-prize-img" :src="prizeImage" mode="aspectFill" />
        <view class="slot-prize-info">
          <view class="slot-prize-name-row">
            <text class="slot-prize-level">{{ prizeLevelNumber }}</text>
            <text class="slot-prize-name">{{ prizeName }}</text>
          </view>
          <text class="slot-prize-count">数量：{{ prizeQuantity }}</text>
        </view>
      </view>
      <text class="slot-tip">名单飞转中...</text>
      <image class="slot-close" :src="image.close" mode="aspectFill" @click="emit('close')" />
    </view>

    <view v-if="activeModal === 'wechatSlotResult'" class="luck-box">
      <view class="slot-header result-header">
        <text class="slot-title">获奖名单</text>
        <text class="luck-prize-name">{{ prizeName }}</text>
      </view>
      <scroll-view class="luck-ul" scroll-y>
        <view v-for="winner in displayResultWinners" :key="winner.key || winner.phone || winner.name" class="luck-scroll-li">
          <view class="luck-scroll-user">
            <image class="luck-scroll-photo" :src="winner.photo || image.avatar" mode="aspectFill" />
            <text class="luck-scroll-name">{{ winner.name }}</text>
          </view>
          <text class="luck-scroll-phone">{{ winner.phone }}</text>
        </view>
      </scroll-view>
      <view class="winning-box">
        <text class="winning-title">恭喜中奖</text>
        <text class="winning-name">{{ prizeName }}</text>
        <text class="winning-code">中奖名单以系统记录为准</text>
      </view>
      <image class="slot-close" :src="image.close" mode="aspectFill" @click="emit('close')" />
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
  winners: {
    type: Array,
    required: true
  },
  resultWinners: {
    type: Array,
    default: () => []
  },
  prize: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["close"]);

const image = {
  avatar: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg",
  close: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-floorclose-c8b795b1.png",
  gift: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-sign-gift-5def5533.png"
};

const prizeName = computed(() => props.prize.name || props.prize.title || "抽奖奖品");
const prizeQuantity = computed(() => Number(props.prize.quantity || 1) || 1);
const prizeImage = computed(() => props.prize.image || image.gift);
const prizeLevelNumber = computed(() => {
  const text = String(props.prize.level || "一等奖");
  const match = text.match(/\d+/);
  return match ? match[0] : "1";
});
const displayResultWinners = computed(() => props.resultWinners.length > 0 ? props.resultWinners : props.winners);
const slotSourceUsers = computed(() => props.winners.length > 0
  ? props.winners
  : [{ name: "山奈", phone: "781****1", photo: image.avatar }]);

const slotColumns = computed(() => Array.from({ length: 4 }).map((_, columnIndex) => ({
  key: `slot-column-${columnIndex}`,
  index: columnIndex,
  users: Array.from({ length: 8 }).flatMap((_, groupIndex) => slotSourceUsers.value.map((item, index) => ({
    ...item,
    name: slotSourceUsers.value[(index + columnIndex) % slotSourceUsers.value.length].name,
    key: `slot-${columnIndex}-${groupIndex}-${index}-${item.phone || item.name}`,
    photo: item.photo || image.avatar
  })))
})));
</script>

<style lang="scss" scoped>
.luck-draw-box {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.58);
}

.luck-scroll-box,
.luck-box {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 640rpx;
  max-width: 90vw;
  padding: 44rpx 36rpx 56rpx;
  box-sizing: border-box;
  border-radius: 44rpx;
  background: linear-gradient(180deg, #ff4f37 0%, #d91531 100%);
  box-shadow: 0 36rpx 120rpx rgba(0, 0, 0, 0.35);
  transform: translate(-50%, -50%);
}

.luck-scroll-box {
  padding-bottom: 60rpx;
}

.slot-header {
  position: relative;
  z-index: 2;
  text-align: center;
}

.slot-title,
.luck-prize-name {
  display: block;
}

.slot-title {
  color: #fff;
  font-size: 48rpx;
  font-weight: 700;
  line-height: 60rpx;
}

.luck-prize-name {
  margin-top: 16rpx;
  color: #fff4bc;
  font-size: 32rpx;
  font-weight: 700;
}

.luck-ul {
  position: relative;
  z-index: 2;
  height: 504rpx;
  margin-top: 40rpx;
  padding: 24rpx;
  box-sizing: border-box;
  overflow: hidden;
  border: 6rpx solid #ffcf6b;
  border-radius: 36rpx;
  background: #fff8e8;
}

.luck-ul {
  height: 460rpx;
}

.slot-machine-window {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  height: 232rpx;
  margin-top: 44rpx;
  padding: 24rpx 26rpx;
  overflow: hidden;
  border: 6rpx solid #ffcf6b;
  border-radius: 36rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 241, 216, 0.94)),
    #fff8e8;
  box-shadow:
    inset 0 0 40rpx rgba(255, 90, 78, 0.18),
    0 0 40rpx rgba(255, 248, 201, 0.48);
}

.slot-reel {
  position: relative;
  height: 184rpx;
  overflow: hidden;
  border-radius: 28rpx;
  background: linear-gradient(180deg, #fff 0%, #fff7ee 100%);
  box-shadow: inset 0 0 16rpx rgba(255, 67, 97, 0.18);
}

.slot-reel-track {
  will-change: transform;
  animation: slotReelRoll 1.45s linear infinite;
}

.slot-reel-track-1 {
  animation-duration: 1.68s;
}

.slot-reel-track-2 {
  animation-duration: 1.92s;
}

.slot-reel-track-3 {
  animation-duration: 2.16s;
}

.slot-reel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 140rpx;
  color: #ff325f;
}

.slot-reel-photo {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
}

.slot-reel-name {
  display: block;
  width: 96rpx;
  margin-top: 12rpx;
  overflow: hidden;
  color: #ff325f;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 28rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slot-reel-shadow {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  z-index: 3;
  height: 60rpx;
  pointer-events: none;
}

.slot-reel-shadow.top {
  top: 24rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0));
}

.slot-reel-shadow.bottom {
  bottom: 24rpx;
  background: linear-gradient(0deg, rgba(255, 246, 228, 0.98), rgba(255, 246, 228, 0));
}

.slot-reel-focus {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  top: 50%;
  z-index: 2;
  height: 88rpx;
  border: 4rpx solid rgba(255, 67, 97, 0.28);
  border-radius: 28rpx;
  box-shadow: 0 0 32rpx rgba(255, 67, 97, 0.22);
  transform: translateY(-50%);
  pointer-events: none;
}

.slot-prize-card {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 152rpx;
  margin: 36rpx 16rpx 0;
  padding: 16rpx;
  box-sizing: border-box;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.13);
  box-shadow: inset 0 0 4rpx rgba(255, 255, 255, 0.58);
}

.slot-prize-img {
  width: 120rpx;
  height: 120rpx;
  margin-right: 20rpx;
  border-radius: 20rpx;
}

.slot-prize-info {
  flex: 1;
  min-width: 0;
}

.slot-prize-name-row {
  display: flex;
  align-items: center;
}

.slot-prize-level {
  flex: 0 0 auto;
  min-width: 40rpx;
  height: 36rpx;
  margin-right: 12rpx;
  padding: 0 10rpx;
  box-sizing: border-box;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 36rpx;
  text-align: center;
  border-radius: 10rpx;
  background: linear-gradient(90deg, #34b8ff, #a337ff);
}

.slot-prize-name,
.slot-prize-count {
  display: block;
  overflow: hidden;
  color: #fff;
  font-size: 28rpx;
  line-height: 40rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slot-prize-count {
  margin-top: 16rpx;
  color: #fff4bc;
  font-weight: 700;
}

.luck-scroll-li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84rpx;
  margin-bottom: 16rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  border-radius: 42rpx;
  background: #fff;
  box-shadow: 0 8rpx 24rpx rgba(255, 67, 97, 0.12);
}

.luck-scroll-user {
  display: flex;
  align-items: center;
  min-width: 0;
}

.luck-scroll-photo {
  width: 56rpx;
  height: 56rpx;
  margin-right: 16rpx;
  border-radius: 50%;
}

.luck-scroll-name {
  max-width: 256rpx;
  overflow: hidden;
  color: #3b2418;
  font-size: 28rpx;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.luck-scroll-phone {
  flex-shrink: 0;
  color: #b15d33;
  font-size: 24rpx;
}

.slot-tip {
  display: block;
  margin-top: 32rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 26rpx;
  text-align: center;
}

.winning-box {
  margin: 32rpx auto 0;
  padding: 28rpx;
  text-align: center;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.14);
}

.winning-title,
.winning-name,
.winning-code {
  display: block;
}

.winning-title {
  color: #fff4bc;
  font-size: 32rpx;
  font-weight: 700;
}

.winning-name {
  margin-top: 16rpx;
  color: #fff;
  font-size: 30rpx;
}

.winning-code {
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 24rpx;
}

.slot-close {
  position: absolute;
  left: 50%;
  bottom: -116rpx;
  width: 72rpx;
  height: 72rpx;
  transform: translateX(-50%);
}

@keyframes slotReelRoll {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-1680rpx);
  }
}
</style>
