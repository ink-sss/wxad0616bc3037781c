<template>
  <view v-if="activeModal === 'redRecord'" class="envelope-reward-modal look-luck-box red-record-page">
    <view class="look-luck-close" @click="emit('close')">
      <image :src="image.back" mode="aspectFill" />
      <text>返回</text>
    </view>
    <view class="look-luck-photo red-record-title">
      <text class="red-record-title-text">红包记录</text>
    </view>
    <scroll-view class="look-luck-row red-record-row" scroll-y>
      <view v-for="(record, index) in redRecords" :key="record.phone" class="look-luck-li">
        <image :src="assets.avatar" mode="aspectFill" />
        <view class="red-record-content">
          <text class="collectionName">{{ record.name }}</text>
          <text class="collectionTime">领取时间 15:{{ 10 + index }}</text>
        </view>
        <view class="bestLuck-box">
          <text class="amountPrice">{{ record.amount }}元</text>
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
  back: "./static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-look-luck-title-left-8282db91.png"
};
</script>

<style lang="scss" scoped>
.red-record-title {
  height: 216rpx;
}

.red-record-title-text {
  display: block;
  padding-top: 84rpx;
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
}

.red-record-row {
  height: calc(100vh - 216rpx);
}
</style>
