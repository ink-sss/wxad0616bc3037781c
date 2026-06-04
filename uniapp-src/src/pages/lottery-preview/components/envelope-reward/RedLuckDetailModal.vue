<template>
  <view v-if="activeModal === 'redLuck'" class="envelope-reward-modal look-luck-box">
    <view class="look-luck-close" @click="emit('close')">
      <image class="look-luck-back" :src="image.back" mode="aspectFill" />
      <text class="look-luck-back-text">返回</text>
    </view>
    <view class="look-luck-photo">
      <image class="look-luck-avatar" :src="assets.avatar" mode="aspectFill" />
      <text class="look-luck-name">老铁的红包</text>
      <text class="look-luck-money">8.88元</text>
      <text class="look-luck-earn">钱已存至 <text class="look-luck-earn-link">我的收益</text>，请提现</text>
      <view class="look-luck-oper">
        <text class="view-oper"><text class="view-redpackage-icon"></text>红包记录</text>
      </view>
    </view>
    <view class="look-luck-total">
      <view>已领取 <text>6</text>/<text>20</text></view>
      <view class="look-luck-total-border"></view>
    </view>
    <scroll-view class="look-luck-row" scroll-y>
      <view v-for="(winner, index) in redRecords" :key="winner.phone" class="look-luck-li">
        <image class="look-luck-li-avatar" :src="assets.avatar" mode="aspectFill" />
        <view class="red-record-content">
          <text class="collectionName">{{ winner.name }}</text>
          <text class="collectionTime">2026-05-15 15:{{ 10 + index }}</text>
        </view>
        <view class="bestLuck-box">
          <text class="amountPrice">{{ winner.amount }}元</text>
          <view v-if="index === 0" class="bestLuckText">
            <image class="bestLuck" :src="image.bestLuck" mode="aspectFill" />
            <text>手气最佳</text>
          </view>
        </view>
      </view>
    </scroll-view>
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
  },
  redRecords: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(["close"]);

const image = {
  back: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-look-luck-title-left-8282db91.png",
  bestLuck: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-bestluck-06aab894.png"
};
</script>

<style lang="scss" scoped>
.look-luck-box {
  background: #fff;
  overflow: hidden;
}

.look-luck-close {
  position: absolute;
  top: 36rpx;
  left: 40rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

.look-luck-back {
  width: 32rpx;
  height: 32rpx;
  margin-right: 4rpx;
}

.look-luck-photo {
  width: 100%;
  height: 216rpx;
  text-align: center;
  background: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-look-luck-title-b29f7266.png") no-repeat;
  background-size: 100% 100%;
}

.look-luck-avatar {
  width: 108rpx;
  height: 108rpx;
  margin-top: 158rpx;
  border-radius: 50%;
}

.look-luck-name,
.look-luck-money,
.look-luck-earn {
  display: block;
}

.look-luck-name {
  margin-top: 12rpx;
  color: #353535;
  font-size: 28rpx;
  font-weight: bold;
}

.look-luck-money {
  margin-top: 24rpx;
  color: #ff0e4c;
  font-size: 50rpx;
  font-weight: bold;
}

.look-luck-earn {
  margin-top: 12rpx;
  color: #353535;
  font-size: 28rpx;
}

.look-luck-earn-link {
  color: #ff0e4c;
}

.look-luck-oper {
  margin-top: 22rpx;
  color: #353535;
  font-size: 24rpx;
}

.look-luck-total {
  margin-top: 336rpx;
  padding: 0 32rpx;
  color: #999;
  font-size: 28rpx;
  line-height: 78rpx;
  text-align: left;
  background: #fff;
}

.look-luck-total-border {
  height: 2rpx;
  background: #f2f2f2;
}

.look-luck-row {
  height: calc(100vh - 630rpx);
  padding: 0 32rpx 20rpx;
  box-sizing: border-box;
  background: #fff;
}

.look-luck-li {
  display: flex;
  align-items: center;
  min-height: 134rpx;
  padding: 26rpx 0 24rpx;
  border-bottom: 1rpx solid #e2e4e8;
  box-sizing: border-box;
}

.look-luck-li-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
}

.red-record-content {
  flex: 1;
  width: 0;
  padding: 0 24rpx;
  text-align: left;
}

.collectionName,
.collectionTime {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collectionName {
  color: #333;
  font-size: 28rpx;
  line-height: 40rpx;
}

.collectionTime {
  color: #999;
  font-size: 24rpx;
  line-height: 34rpx;
}

.bestLuck-box {
  flex: 0 0 auto;
  text-align: right;
}

.amountPrice {
  color: #333;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
}

.bestLuckText {
  display: flex;
  align-items: center;
  color: #ffa400;
  font-size: 24rpx;
  line-height: 40rpx;
}

.bestLuck {
  width: 32rpx;
  height: 32rpx;
  margin-right: 4rpx;
}
</style>
